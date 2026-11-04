// Turning untrusted feed HTML into short, safe plain text.
// Nothing from a feed is ever rendered as HTML on the site; this just makes
// the stored text readable and bounded.

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»' };

export function decodeEntities(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : '';
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

export function toPlainText(html, max = 600) {
  let s = String(html ?? '');
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
       .replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1>/gi, ' ')
       .replace(/<br\s*\/?>/gi, ' ').replace(/<\/(p|div|li|h\d)>/gi, ' ')
       .replace(/<[^>]*>/g, ' ');
  s = decodeEntities(s)
       .replace(/<[^>]*>/g, ' ')                       // entities that decoded into tags
       .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '') // controls & bidi overrides
       .replace(/\s+/g, ' ').trim();
  return truncate(s, max);
}

export function truncate(s, max) {
  s = String(s ?? '');
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
}

/** Only absolute https URLs survive; tracking parameters and fragments go. */
export function safeHttpsUrl(u) {
  try {
    const url = new URL(String(u).trim());
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

export function normalizeUrl(u) {
  const s = safeHttpsUrl(u);
  if (!s) return null;
  const url = new URL(s);
  url.hash = '';
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  for (const k of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$|ref_src$|cmpid$)/i.test(k)) url.searchParams.delete(k);
  }
  url.searchParams.sort();
  let out = url.toString();
  if (out.endsWith('/') && url.pathname !== '/') out = out.slice(0, -1);
  return out;
}

export const hasArabic = s => /[؀-ۿ]/.test(String(s || ''));

/** Keyword match: whole-word for Latin terms (so "ai" ≠ "said"), substring for Arabic. */
export function matchesAny(text, keywords) {
  const t = String(text || '').toLowerCase();
  return keywords.some(k => {
    const w = String(k || '').toLowerCase().trim();
    if (!w) return false;
    if (hasArabic(w)) return t.includes(w);
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${esc}(s|es)?([^a-z0-9]|$)`, 'i').test(t); // plural forms count too
  });
}
