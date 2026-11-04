// RSS 2.0 / Atom / RSS 1.0 (RDF) → normalized items.
import { XMLParser } from 'fast-xml-parser';
import { toPlainText, safeHttpsUrl, decodeEntities } from '../text.js';

// URLs inside XML arrive with entities still encoded (&amp;) because entity
// expansion is off in the parser; decode them before validating.
const url = v => safeHttpsUrl(decodeEntities(String(v || '').trim()));

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '#text',
  processEntities: false,      // entities are decoded by toPlainText, never expanded by the parser (no XXE / billion laughs)
  htmlEntities: false,
  trimValues: true,
  parseTagValue: false,
  isArray: name => ['item', 'entry', 'link', 'category', 'media:content', 'media:thumbnail', 'enclosure'].includes(name),
});

const arr = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
const txt = v => (v == null ? '' : typeof v === 'object' ? (v['#text'] ?? '') : String(v));

function parseDate(s) {
  if (!s) return null;
  let v = String(s).trim();
  v = v.replace(/([+-]\d{2})$/, '$100');           // "+03" → "+0300" (seen in some Saudi feeds)
  const d = new Date(v);
  if (Number.isNaN(+d)) return null;
  if (+d > Date.now() + 2 * 864e5) return null;      // future dates are not trusted
  return d.toISOString();
}

function pickImage(node) {
  const cands = [];
  for (const e of arr(node.enclosure)) {
    const type = String(e['@type'] || ''), u = e['@url'];
    if (type.startsWith('image/') || /\.(jpe?g|png|webp|avif)(\?|$)/i.test(u || '')) cands.push(u);
  }
  for (const m of arr(node['media:content'])) {
    if (!m['@medium'] || m['@medium'] === 'image' || String(m['@type'] || '').startsWith('image/')) cands.push(m['@url']);
  }
  for (const m of arr(node['media:thumbnail'])) cands.push(m['@url']);
  if (node['media:group']) return pickImage(node['media:group']);
  return cands.map(url).find(Boolean) || null;
}

function atomLink(links) {
  const ls = arr(links);
  const alt = ls.find(l => typeof l === 'object' && (!l['@rel'] || l['@rel'] === 'alternate')) || ls[0];
  return typeof alt === 'object' ? alt['@href'] : txt(alt);
}

/** Returns { title, items: [{title, url, excerpt, publishedAt, imageUrl, announceType}] }. */
export function parseFeed(xml) {
  const doc = parser.parse(String(xml));
  const channel = doc?.rss?.channel || doc?.['rdf:RDF']?.channel;
  const feed = doc?.feed;
  let raw = [];
  let title = '';

  if (doc?.rss || doc?.['rdf:RDF']) {
    title = txt(channel?.title);
    raw = arr(channel?.item).concat(arr(doc?.['rdf:RDF']?.item));
    raw = raw.map(it => ({
      title: txt(it.title),
      link: txt(arr(it.link)[0]) || (it.guid && String(it.guid['@isPermaLink'] ?? 'true') !== 'false' ? txt(it.guid) : ''),
      summary: txt(it.description) || txt(it['content:encoded']),
      date: txt(it.pubDate) || txt(it['dc:date']) || txt(it.updated),
      image: pickImage(it),
    }));
  } else if (feed) {
    title = txt(feed.title);
    raw = arr(feed.entry).map(en => ({
      title: txt(en.title),
      link: atomLink(en.link),
      summary: txt(en.summary) || txt(en.content),
      date: txt(en.published) || txt(en.updated),
      image: pickImage(en),
    }));
  } else {
    throw new Error('Not an RSS or Atom document');
  }

  const items = [];
  for (const r of raw) {
    const link = url(r.link);
    const t = toPlainText(r.title, 400);
    if (!link || !t) continue;
    let summary = toPlainText(r.summary, 2000);
    // arXiv: "arXiv:2611.01234v1 Announce Type: new Abstract: …"
    let announceType = null;
    const m = summary.match(/^arXiv:\S+\s+Announce Type:\s*([a-z-]+)\s+Abstract:\s*/i);
    if (m) { announceType = m[1].toLowerCase(); summary = summary.slice(m[0].length); }
    items.push({
      title: t,
      url: link,
      excerpt: toPlainText(summary, 500) || null,
      publishedAt: parseDate(r.date),
      imageUrl: r.image || null,
      announceType,
    });
  }
  return { title: toPlainText(title, 200), items };
}
