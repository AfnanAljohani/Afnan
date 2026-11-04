import { matchesAny } from '../text.js';

// Terms that place an item in «الذكاء الاصطناعي في السعودية».
export const SAUDI_TERMS = [
  'saudi', 'saudi arabia', 'ksa', 'riyadh', 'jeddah', 'dammam', 'neom', 'sdaia', 'humain', 'kaust', 'aramco',
  'vision 2030', 'kacst', 'tuwaiq', 'stc group', 'mcit',
  'السعودية', 'السعودي', 'المملكة العربية', 'الرياض', 'جدة', 'نيوم', 'سدايا', 'هيوماين', 'كاوست', 'أرامكو', 'رؤية 2030', 'رؤية المملكة',
];

/** Picks the category whose keywords match best; falls back to the source default, then 'general'. */
export function classify(text, categories, sourceDefault) {
  if (sourceDefault) return sourceDefault;
  let best = null, bestScore = 0;
  for (const c of categories) {
    if (c.slug === 'general' || !c.keywords?.length) continue;
    const score = c.keywords.reduce((n, k) => n + (matchesAny(text, [k]) ? 1 : 0), 0);
    if (score > bestScore) { best = c.slug; bestScore = score; }
  }
  return best || (categories.some(c => c.slug === 'general') ? 'general' : null);
}

export const isSaudi = (text, source) => Boolean(source?.is_saudi) || matchesAny(text, SAUDI_TERMS);
