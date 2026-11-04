// Small helpers on top of Node's req/res so handlers run the same on Vercel
// and on the local dev server (no framework-specific body parsing).
import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from './env.js';

export function send(res, status, body, headers = {}) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export const fail = (res, status, code, message) => send(res, status, { error: { code, message } });

/** Reads a JSON body with a hard size cap. Rejects anything else. */
export async function readJson(req, maxBytes = 16 * 1024) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body; // already parsed by host
  const type = String(req.headers['content-type'] || '');
  if (!type.includes('application/json')) throw Object.assign(new Error('Expected application/json'), { status: 415 });
  let size = 0; const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > maxBytes) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

/**
 * CORS: the site calls its own /api on the same origin, which needs no CORS.
 * Cross-origin browser calls are only allowed from ALLOWED_ORIGINS.
 * Returns false (and answers) when the request must stop here.
 */
export function cors(req, res, methods = 'GET, POST, OPTIONS') {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const sameOrigin = origin && host && new URL(origin).host === host;
  const allowed = origin && (sameOrigin || env().allowedOrigins.includes(origin));
  if (origin && allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }
  if (req.method === 'OPTIONS') { res.statusCode = allowed ? 204 : 403; res.end(); return false; }
  if (origin && !allowed) { fail(res, 403, 'origin_not_allowed', 'Origin not allowed'); return false; }
  return true;
}

export function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export const sha256 = s => createHash('sha256').update(String(s)).digest('hex');

export function bearer(req) {
  const h = String(req.headers.authorization || '');
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
}

/** Constant-time comparison for shared secrets. */
export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export function methodGuard(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  fail(res, 405, 'method_not_allowed', 'Method not allowed');
  return false;
}
