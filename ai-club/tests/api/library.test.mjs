import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFeed } from '../../api/_lib/library/rss.js';
import { classify, isSaudi } from '../../api/_lib/library/classify.js';
import { normalizeUrl, matchesAny, toPlainText, safeHttpsUrl } from '../../api/_lib/text.js';

const fx = name => readFileSync(new URL(`../fixtures/feeds/${name}`, import.meta.url), 'utf8');

test('RSS with media:content: images, html stripped, unsafe links dropped', () => {
  const { items } = parseFeed(fx('google.xml'));
  assert.equal(items.length, 3, 'javascript: link item must be dropped');
  const [a, b] = items;
  assert.equal(a.imageUrl, 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/oct-recap.width-540.format-webp.webp');
  assert.ok(!/script|<|alert/.test(a.excerpt), 'no markup or script text survives');
  assert.equal(a.publishedAt, '2026-11-02T17:45:00.000Z');
  assert.equal(b.title, 'Our newest AI Quest: Mapping the human brain & vision');
  assert.equal(b.imageUrl, null, 'http images are rejected');
});

test('RSS without descriptions (Hugging Face shape)', () => {
  const { items } = parseFeed(fx('hf.xml'));
  assert.equal(items.length, 2);
  assert.equal(items[0].excerpt, null);
  assert.equal(items[0].url, 'https://huggingface.co/blog/allenai/statebench');
});

test('arXiv: abstract prefix removed, announce type kept', () => {
  const { items } = parseFeed(fx('arxiv-cl.xml'));
  assert.deepEqual(items.map(i => i.announceType), ['new', 'replace', 'cross']);
  assert.match(items[0].excerpt, /^We survey omnimodal/);
});

test('Asharq Al-Awsat shape: enclosure image, empty description, trailing-space dates, "+03" offsets', () => {
  const { items } = parseFeed(fx('aawsat.xml'));
  assert.equal(items[0].imageUrl.startsWith('https://static.srpcdigital.com/'), true);
  assert.equal(items[0].excerpt, null);
  assert.equal(items[0].publishedAt, '2026-11-01T08:10:43.000Z');
  assert.equal(items[2].publishedAt, '2026-11-04T04:00:00.000Z');
});

test('Atom feeds (html summaries, thumbnails, Arabic)', () => {
  const { items } = parseFeed(fx('research-atom.xml'));
  assert.equal(items.length, 2);
  assert.equal(items[0].url, 'https://research.google/blog/the-sleep-framework/');
  assert.equal(items[0].excerpt, 'A method that lets language models consolidate knowledge between training phases.');
  assert.ok(items[0].imageUrl.endsWith('sleep.width-800.png'));
  assert.equal(items[1].publishedAt, '2026-10-21T10:00:00.000Z');
});

test('not a feed → error (no partial garbage)', () => {
  assert.throws(() => parseFeed('<html><body>Not found</body></html>'), /Not an RSS or Atom/);
});

test('URL normalization dedupes tracking variants', () => {
  const a = normalizeUrl('https://blog.google/technology/ai/google-ai-updates-october-2026/?utm_source=rss&utm_medium=feed');
  const b = normalizeUrl('https://www.blog.google/technology/ai/google-ai-updates-october-2026/?utm_campaign=x#top');
  assert.equal(a, b);
  assert.equal(normalizeUrl('http://example.com/x'), null);
  assert.equal(safeHttpsUrl('javascript:alert(1)'), null);
});

test('keyword matching: whole words for Latin, substring for Arabic', () => {
  assert.equal(matchesAny('Officials said the plan', ['ai']), false);
  assert.equal(matchesAny('South Korea to Double Spending on AI and Chips', ['ai']), true);
  assert.equal(matchesAny('Aramco Acquires 49% Stake in HUMAIN', ['humain']), true);
  assert.equal(matchesAny('خطة الذكاء الاصطناعي الوطنية', ['الذكاء الاصطناعي']), true);
});

test('classification and the Saudi section', () => {
  const cats = [
    { slug: 'llm', keywords: ['llm', 'language model'] },
    { slug: 'cv', keywords: ['vision', 'image'] },
    { slug: 'general', keywords: [] },
  ];
  assert.equal(classify('How language models track state', cats, null), 'llm');
  assert.equal(classify('A computer vision and image dataset', cats, null), 'cv');
  assert.equal(classify('Quarterly results', cats, null), 'general');
  assert.equal(classify('anything', cats, 'cv'), 'cv');
  assert.equal(isSaudi('Aramco Acquires 49% Stake in HUMAIN', {}), true);
  assert.equal(isSaudi('نموذج عربي لمعالجة اللغة في الرياض', {}), true);
  assert.equal(isSaudi('South Korea to Double Spending on AI', {}), false);
  assert.equal(isSaudi('anything', { is_saudi: true }), true);
});

test('plain-text conversion strips bidi overrides and decoded tags', () => {
  assert.equal(toPlainText('a‮b &lt;img src=x onerror=alert(1)&gt; c'), 'ab c');
});

test('encoded &amp; in feed links is decoded before dedupe', () => {
  const { items } = parseFeed(fx('google.xml'));
  assert.equal(items[0].url, 'https://blog.google/technology/ai/google-ai-updates-october-2026/?utm_source=rss&utm_medium=feed');
  const dup = parseFeed(fx('openai.xml')).items[1].url;
  assert.equal(normalizeUrl(items[0].url), normalizeUrl(dup));
});
