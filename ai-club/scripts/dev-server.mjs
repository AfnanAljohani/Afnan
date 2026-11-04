// Local development server: serves the static site with Vercel-style clean
// URLs and runs the /api/* handlers. Reads .env.local if present.
//   npm run dev            → http://localhost:3000
// (`vercel dev` works too; this exists so no Vercel account is needed locally.)
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 3000;

const envFile = process.env.ENV_FILE || path.join(ROOT, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.vtt': 'text/vtt', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const BLOCKED = /^\/(api\/_lib|supabase|tests|scripts|node_modules|\.env|package)/;
const vercel = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

function headersFor(p) {
  const out = {};
  for (const h of vercel.headers || []) {
    const re = new RegExp('^' + h.source.replace(/\(\.\*\)/g, '(.*)').replace(/\//g, '\\/') + '$');
    if (re.test(p)) for (const { key, value } of h.headers) out[key] = value;
  }
  // allow the local Supabase/Ollama stand-ins through the admin CSP
  if (out['Content-Security-Policy'] && process.env.SUPABASE_URL) {
    const o = new URL(process.env.SUPABASE_URL).origin;
    out['Content-Security-Policy'] = out['Content-Security-Policy'].replace('connect-src ', `connect-src ${o} `).replace('media-src ', `media-src ${o} `).replace("img-src 'self'", `img-src 'self' ${o}`);
  }
  return out;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let p = decodeURIComponent(url.pathname);
  try {
    if (p.startsWith('/api/')) {
      if (BLOCKED.test(p)) { res.statusCode = 404; return res.end(); }
      const file = path.join(ROOT, p.replace(/\/$/, '') + '.js');
      if (!file.startsWith(path.join(ROOT, 'api')) || !existsSync(file)) { res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); return res.end('{"error":{"code":"not_found"}}'); }
      const mod = await import(pathToFileURL(file).href);
      return await mod.default(req, res);
    }
    if (BLOCKED.test(p) || p.includes('..')) { res.statusCode = 404; return res.end('Not found'); }
    let file = path.join(ROOT, p);
    if (p === '/' ) file = path.join(ROOT, 'index.html');
    else if (!path.extname(p) && existsSync(file + '.html')) file = file + '.html';
    else if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    const route = p === '/' ? '/' : p.replace(/\.html$/, '');
    for (const [k, v] of Object.entries(headersFor(route))) res.setHeader(k, v);
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(readFileSync(file));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) { res.statusCode = 500; res.end('Server error'); }
  }
}).listen(PORT, () => console.log(`EWA AI Club dev server → http://localhost:${PORT}`));
