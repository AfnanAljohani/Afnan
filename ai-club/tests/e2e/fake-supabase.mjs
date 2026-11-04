// TEST-ONLY stand-in for the Supabase HTTP APIs used by this site
// (PostgREST subset, Auth password sign-in, Storage upload/download).
// Every database request runs on a real PostgreSQL inside a transaction with
// `SET LOCAL ROLE anon|authenticated|service_role` and the JWT claims set,
// exactly like PostgREST — so the migrations' GRANTs and RLS policies decide.
// Never deployed (tests/ is in .vercelignore). Not a security boundary itself.
import http from 'node:http';
import https from 'node:https';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const PORT = +process.env.FAKE_SB_PORT || 54400;
const JWT_SECRET = process.env.FAKE_SB_JWT_SECRET || 'test-only-jwt-secret-' + randomUUID();
export const PUBLISHABLE = process.env.FAKE_SB_PUBLISHABLE || 'sb_publishable_TEST_ONLY';
export const SECRET = process.env.FAKE_SB_SECRET || 'sb_secret_TEST_ONLY';
const STORE = process.env.FAKE_SB_STORAGE || path.resolve('tests/e2e/.storage');
const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL || 'postgres://postgres@127.0.0.1:54329/ewa_ai_test' });

// test accounts: "email:password:uuid" separated by commas
const USERS = (process.env.FAKE_SB_USERS || '').split(',').filter(Boolean).map(s => { const [email, password, id] = s.split(':'); return { email, password, id }; });

/* ---------- JWT (HS256) ---------- */
const b64u = b => Buffer.from(b).toString('base64url');
function sign(payload) {
  const h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' })), p = b64u(JSON.stringify(payload));
  return `${h}.${p}.${createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url')}`;
}
function verify(tok) {
  const [h, p, s] = String(tok).split('.'); if (!s) return null;
  const want = createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
  if (want.length !== s.length || !timingSafeEqual(Buffer.from(want), Buffer.from(s))) return null;
  const claims = JSON.parse(Buffer.from(p, 'base64url').toString());
  return claims.exp * 1000 > Date.now() ? claims : null;
}

/* ---------- helpers ---------- */
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Content-Range', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const readBody = req => new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c))); });
const q = id => '"' + String(id).replace(/"/g, '""') + '"';

function who(req) {
  const tok = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const apikey = req.headers.apikey || '';
  if (tok === SECRET || apikey === SECRET) return { role: 'service_role', claims: { role: 'service_role' } };
  const c = tok && verify(tok);
  if (c) return { role: 'authenticated', claims: c };
  return { role: 'anon', claims: { role: 'anon' } };
}

const colCache = new Map();
async function columns(client, table) {
  if (colCache.has(table)) return colCache.get(table);
  const { rows } = await client.query(`select a.attname as name, a.atttypid::regtype::text as type
    from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname=$1 and a.attnum>0 and not a.attisdropped`, [table]);
  if (!rows.length) throw Object.assign(new Error(`relation "${table}" does not exist`), { code: '42P01' });
  const m = Object.fromEntries(rows.map(r => [r.name, r.type])); colCache.set(table, m); return m;
}

function parseList(v) { // in.(a,"b c",d)
  const inner = v.replace(/^\(/, '').replace(/\)$/, ''); const out = []; let cur = '', quoted = false;
  for (const ch of inner) { if (ch === '"') { quoted = !quoted; continue; } if (ch === ',' && !quoted) { out.push(cur); cur = ''; continue; } cur += ch; }
  out.push(cur); return out;
}

function buildWhere(params, cols, values) {
  const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
  const parts = [];
  for (const [k, raw] of params) {
    if (RESERVED.has(k)) continue;
    if (!(k in cols)) throw Object.assign(new Error(`column ${k} does not exist`), { code: '42703' });
    const type = cols[k], col = q(k);
    const m = raw.match(/^(not\.)?([a-z]+)(\(([a-z]+)\))?\.([\s\S]*)$/);
    if (!m) throw Object.assign(new Error('bad filter ' + raw), { code: 'PGRST100' });
    const [, neg, op, , cfg, val] = m;
    let sql;
    const p = v => { values.push(v); return `$${values.length}::${type}`; };
    if (op === 'eq') sql = `${col} = ${p(val)}`;
    else if (op === 'neq') sql = `${col} <> ${p(val)}`;
    else if (['gt', 'gte', 'lt', 'lte'].includes(op)) sql = `${col} ${{ gt: '>', gte: '>=', lt: '<', lte: '<=' }[op]} ${p(val)}`;
    else if (op === 'like' || op === 'ilike') { values.push(val.replace(/\*/g, '%')); sql = `${col} ${op} $${values.length}`; }
    else if (op === 'is') sql = `${col} is ${({ null: 'null', true: 'true', false: 'false' })[val] || 'null'}`;
    else if (op === 'in') { values.push(parseList(val)); sql = `${col} = any($${values.length}::${type}[])`; }
    else if (/^(pl|ph|w)?fts$/.test(op)) {
      const fn = { fts: 'to_tsquery', plfts: 'plainto_tsquery', phfts: 'phraseto_tsquery', wfts: 'websearch_to_tsquery' }[op];
      values.push(val); sql = `${col} @@ ${fn}('${(cfg || 'simple').replace(/[^a-z_]/g, '')}', $${values.length})`;
    } else throw Object.assign(new Error('unsupported operator ' + op), { code: 'PGRST100' });
    parts.push(neg ? `not (${sql})` : sql);
  }
  return parts.length ? ' where ' + parts.join(' and ') : '';
}

function selectList(sel, cols) {
  if (!sel || sel === '*') return '*';
  return sel.split(',').map(s => s.trim()).filter(Boolean).map(c => {
    if (!(c in cols)) throw Object.assign(new Error(`column ${c} does not exist`), { code: '42703' });
    return q(c);
  }).join(', ');
}

function orderBy(o, cols) {
  if (!o) return '';
  return ' order by ' + o.split(',').map(part => {
    const [c, ...mods] = part.split('.');
    if (!(c in cols)) throw Object.assign(new Error(`column ${c} does not exist`), { code: '42703' });
    return q(c) + (mods.includes('desc') ? ' desc' : ' asc') + (mods.includes('nullslast') ? ' nulls last' : mods.includes('nullsfirst') ? ' nulls first' : '');
  }).join(', ');
}

function pgErrStatus(e, role) {
  if (e.code === '42501') return role === 'anon' ? 401 : 403;
  if (e.code === '23505') return 409;
  if (['23514', '22P02', '23502', '22007', '22023', '42703', 'PGRST100'].includes(e.code)) return 400;
  if (e.code === '42P01' || e.code === '42883') return 404;
  return 500;
}

async function withRole(req, fn) {
  const { role, claims } = who(req);
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    await client.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    const out = await fn(client, role);
    await client.query('commit');
    return out;
  } catch (e) { await client.query('rollback').catch(() => {}); e.role = role; throw e; }
  finally { client.release(); }
}

/* ---------- REST ---------- */
async function rest(req, res, url) {
  const table = decodeURIComponent(url.pathname.replace(/^\/rest\/v1\//, ''));
  const prefer = String(req.headers.prefer || '');
  const single = String(req.headers.accept || '').includes('vnd.pgrst.object+json');
  const params = [...url.searchParams.entries()];
  const get = k => url.searchParams.get(k);

  if (table.startsWith('rpc/')) {
    const fn = table.slice(4).replace(/[^a-z0-9_]/g, '');
    const args = JSON.parse((await readBody(req)).toString() || '{}');
    const names = Object.keys(args);
    const out = await withRole(req, c => c.query(`select public.${q(fn)}(${names.map((n, i) => `${q(n)} => $${i + 1}`).join(', ')}) as r`, names.map(n => args[n])));
    return send(res, 200, out.rows[0].r);
  }

  const result = await withRole(req, async (c, role) => {
    const cols = await columns(c, table);
    const values = [];
    const ret = selectList(get('select'), cols);
    if (req.method === 'GET' || req.method === 'HEAD') {
      const where = buildWhere(params, cols, values);
      let sql = `select ${ret} from public.${q(table)}${where}${orderBy(get('order'), cols)}`;
      const lim = get('limit'), off = get('offset');
      if (lim) sql += ` limit ${+lim}`; if (off) sql += ` offset ${+off}`;
      const rows = (await c.query(sql, values)).rows;
      let count = null;
      if (/count=exact/.test(prefer)) count = +(await c.query(`select count(*) from public.${q(table)}${buildWhere(params, cols, [])}`, values.slice(0, values.length))).rows[0].count;
      return { rows, count, off: +(off || 0), status: 200 };
    }
    if (req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '[]');
      const list = Array.isArray(body) ? body : [body];
      const conflict = get('on_conflict'), merge = /resolution=merge-duplicates/.test(prefer), ignore = /resolution=ignore-duplicates/.test(prefer);
      const out = [];
      for (const row of list) {
        const keys = Object.keys(row).filter(k => k in cols);
        const vals = keys.map(k => (cols[k] === 'jsonb' || cols[k] === 'json') ? JSON.stringify(row[k]) : row[k]);
        let sql = `insert into public.${q(table)} (${keys.map(q).join(', ')}) values (${keys.map((k, i) => `$${i + 1}::${cols[k]}`).join(', ')})`;
        if (conflict && (merge || ignore)) {
          const upd = keys.filter(k => k !== conflict);
          sql += ignore || !upd.length ? ` on conflict (${q(conflict)}) do nothing` : ` on conflict (${q(conflict)}) do update set ${upd.map(k => `${q(k)} = excluded.${q(k)}`).join(', ')}`;
        }
        sql += ` returning ${ret}`;
        out.push(...(await c.query(sql, vals)).rows);
      }
      return { rows: out, status: 201 };
    }
    if (req.method === 'PATCH') {
      const row = JSON.parse((await readBody(req)).toString() || '{}');
      const keys = Object.keys(row).filter(k => k in cols);
      const vals = keys.map(k => (cols[k] === 'jsonb' || cols[k] === 'json') ? JSON.stringify(row[k]) : row[k]);
      const where = buildWhere(params, cols, vals);
      const rows = (await c.query(`update public.${q(table)} set ${keys.map((k, i) => `${q(k)} = $${i + 1}::${cols[k]}`).join(', ')}${where} returning ${ret}`, vals)).rows;
      return { rows, status: 200 };
    }
    if (req.method === 'DELETE') {
      const where = buildWhere(params, cols, values);
      const rows = (await c.query(`delete from public.${q(table)}${where} returning ${ret}`, values)).rows;
      return { rows, status: 200 };
    }
    throw Object.assign(new Error('method'), { code: 'PGRST105' });
  });

  const headers = {};
  if (result.count != null) headers['Content-Range'] = `${result.off}-${result.off + Math.max(0, result.rows.length - 1)}/${result.count}`;
  if (req.method === 'HEAD') return send(res, 200, undefined, headers);
  if (single) {
    if (result.rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `${result.rows.length} rows`, hint: null });
    return send(res, result.status, result.rows[0], headers);
  }
  const representation = req.method === 'GET' || /return=representation/.test(prefer);
  return send(res, result.status, representation ? result.rows : undefined, headers);
}

/* ---------- Auth ---------- */
async function auth(req, res, url) {
  const p = url.pathname.replace(/^\/auth\/v1/, '');
  if (p === '/token') {
    const b = JSON.parse((await readBody(req)).toString() || '{}');
    if (url.searchParams.get('grant_type') === 'password') {
      const u = USERS.find(x => x.email === String(b.email).toLowerCase() && x.password === b.password);
      if (!u) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' });
      return send(res, 200, session(u));
    }
    if (url.searchParams.get('grant_type') === 'refresh_token') {
      const [id] = String(b.refresh_token || '').split('.'); const u = USERS.find(x => x.id === id);
      return u ? send(res, 200, session(u)) : send(res, 400, { error: 'invalid_grant', msg: 'Invalid Refresh Token' });
    }
  }
  if (p === '/user') {
    const c = verify(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    const u = c && USERS.find(x => x.id === c.sub);
    return u ? send(res, 200, userObj(u)) : send(res, 401, { code: 'bad_jwt', msg: 'invalid JWT' });
  }
  if (p === '/logout') return send(res, 204);
  if (p === '/recover') return send(res, 200, {});
  return send(res, 404, { msg: 'not implemented in test stub: ' + p });
}
const userObj = u => ({ id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-11-01T00:00:00Z' });
function session(u) {
  const now = Math.floor(Date.now() / 1000);
  return { access_token: sign({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', iat: now, exp: now + 3600 }), token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: u.id + '.' + randomUUID(), user: userObj(u) };
}

/* ---------- Storage ---------- */
async function storage(req, res, url) {
  let m = url.pathname.match(/^\/storage\/v1\/object\/public\/media\/(.+)$/);
  if (m && req.method === 'GET') {
    const f = path.join(STORE, path.normalize(decodeURIComponent(m[1])).replace(/^(\.\.[/\\])+/, ''));
    if (!f.startsWith(STORE) || !existsSync(f)) return send(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': readFileSync(f + '.type', 'utf8'), 'Access-Control-Allow-Origin': '*' }); return res.end(readFileSync(f));
  }
  m = url.pathname.match(/^\/storage\/v1\/object\/media\/(.+)$/);
  if (m && req.method === 'POST') {
    const name = decodeURIComponent(m[1]);
    let type = String(req.headers['content-type'] || '');
    const allowed = ['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'video/mp4', 'video/webm', 'text/vtt'];
    let body = await readBody(req);
    if (type.startsWith('multipart/form-data')) { // browsers upload Blobs as multipart; use the file part
      const boundary = Buffer.from('--' + type.split('boundary=')[1]);
      let i = body.indexOf(boundary), file = null;
      while (i >= 0) {
        const next = body.indexOf(boundary, i + boundary.length); if (next < 0) break;
        const part = body.subarray(i + boundary.length + 2, next - 2);
        const sep = part.indexOf('\r\n\r\n'); const head = part.subarray(0, sep).toString();
        if (/filename=/i.test(head)) file = { type: (head.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || '', data: part.subarray(sep + 4) };
        i = next;
      }
      if (!file) return send(res, 400, { statusCode: '400', error: 'no file' });
      type = file.type.trim(); body = file.data;
    }
    if (!allowed.some(t => type.startsWith(t))) return send(res, 415, { statusCode: '415', error: 'invalid_mime_type', message: 'mime type not supported' });
    if (body.length > 52428800) return send(res, 413, { statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' });
    // permission: the same RLS policy Storage evaluates on storage.objects
    await withRole(req, c => c.query(`insert into storage.objects (bucket_id, name) values ('media', $1)`, [name]));
    const f = path.join(STORE, name); mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, body); writeFileSync(f + '.type', type);
    return send(res, 200, { Key: 'media/' + name, Id: randomUUID() });
  }
  return send(res, 404, { error: 'not implemented in test stub' });
}

const TLS = process.env.FAKE_SB_TLS_DIR; // https so media URLs pass the site's https-only checks
const server = TLS ? https.createServer({ key: readFileSync(`${TLS}/key.pem`), cert: readFileSync(`${TLS}/cert.pem`) }) : http.createServer();
server.on('request', async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,HEAD,OPTIONS' }); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/rest/v1/')) return await rest(req, res, url);
    if (url.pathname.startsWith('/auth/v1/')) return await auth(req, res, url);
    if (url.pathname.startsWith('/storage/v1/')) return await storage(req, res, url);
    send(res, 404, { message: 'not found' });
  } catch (e) {
    const status = pgErrStatus(e, e.role);
    if (url.pathname.startsWith('/storage/')) return send(res, status === 401 || status === 403 ? 403 : status, { statusCode: String(status), error: 'Unauthorized', message: 'new row violates row-level security policy' });
    send(res, status, { code: e.code || 'PGRST000', message: e.message, details: e.detail || null, hint: e.hint || null });
  }
});
server.listen(PORT, '127.0.0.1', () => console.log(`fake supabase on ${TLS ? 'https' : 'http'}://127.0.0.1:${PORT} (test only)`));
