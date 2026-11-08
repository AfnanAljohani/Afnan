/* PANDA site: one page per phase.
   Groups the existing sections into pages and shows one at a time (hash routing: #phase1 … #phase4, #awards, #tableau, #deck, #visit).
   Content is not changed; sections are only shown or hidden. */
(function () {
  'use strict';
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const PAGES = [
    { k: 'home', start: 'top', title: t('الرئيسية', 'Home') },
    { k: 'phase1', start: 'phase1', title: t('المرحلة الأولى · فهم الأعمال', 'Phase 1 · Business Understanding'), phase: 1 },
    { k: 'phase2', start: 'phase2', title: t('المرحلة الثانية · فهم البيانات', 'Phase 2 · Data Understanding'), phase: 2 },
    { k: 'phase3', start: 'phase3', title: t('المرحلة الثالثة · تجهيز البيانات', 'Phase 3 · Data Preparation'), phase: 3 },
    { k: 'phase4', start: 'phase4', title: t('المرحلة الرابعة · النمذجة والنتائج', 'Phase 4 · Modeling & Results'), phase: 4 },
    { k: 'awards', start: 'awards', title: t('الجوائز', 'Awards') },
    { k: 'tableau', start: 'tableau', title: 'Tableau' },
    { k: 'deck', start: 'deck', title: t('العرض التقديمي', 'Presentation') },
    { k: 'visit', start: 'visit', title: t('الزيارة', 'Visit') }
  ];
  const HOME_EXTRA = ['explore'];               /* sections that belong to the home page wherever they sit */
  const footer = document.querySelector('footer');
  const top = document.getElementById('top');
  if (!footer || !top) return;

  /* ---------- group sections into pages ---------- */
  const pageOf = new Map(), byKey = {};
  PAGES.forEach(p => byKey[p.k] = []);
  let cur = null;
  for (let n = top; n && n !== footer; n = n.nextElementSibling) {
    if (n.tagName === 'SCRIPT') continue;
    const st = PAGES.find(p => p.start === n.id);
    if (st) cur = st.k;
    if (!cur) continue;
    const k = HOME_EXTRA.includes(n.id) ? 'home' : cur;
    byKey[k].push(n); pageOf.set(n, k);
  }
  /* home: the "explore" call-to-action goes right after the roadmap */
  const journey = document.getElementById('journey'), explore = document.getElementById('explore');
  if (journey && explore) journey.after(explore);

  /* ---------- prev / next bar at the end of each phase page ---------- */
  const phases = PAGES.filter(p => p.phase);
  phases.forEach((p, i) => {
    const prev = phases[i - 1], next = phases[i + 1];
    const bar = document.createElement('div');
    bar.className = 'pg-nav';
    bar.innerHTML = `<div class="container">
      ${prev ? `<a class="pg-prev" href="#${prev.k}"><small>${t('المرحلة السابقة', 'Previous phase')}</small><b>${prev.title}</b></a>` : `<a class="pg-prev" href="#home"><small>${t('العودة', 'Back')}</small><b>${t('الصفحة الرئيسية', 'Home page')}</b></a>`}
      <span class="pg-dots">${phases.map((q, j) => `<a href="#${q.k}" class="${j === i ? 'on' : ''}" aria-label="${q.title}">${j + 1}</a>`).join('')}</span>
      ${next ? `<a class="pg-next" href="#${next.k}"><small>${t('المرحلة التالية', 'Next phase')}</small><b>${next.title}</b></a>` : `<a class="pg-next" href="#awards"><small>${t('بعدها', 'Next')}</small><b>${t('جوائزنا', 'Our awards')}</b></a>`}
    </div>`;
    const last = byKey[p.k][byKey[p.k].length - 1];
    if (last) { last.after(bar); byKey[p.k].push(bar); pageOf.set(bar, p.k); }
  });

  /* ---------- roadmap steps open their phase page ---------- */
  document.querySelectorAll('#journey .tl').forEach((tl, i) => {
    if (!phases[i]) return;
    tl.classList.add('pg-link'); tl.setAttribute('role', 'link'); tl.tabIndex = 0;
    tl.insertAdjacentHTML('beforeend', `<span class="pg-open">${t('افتح المرحلة ←', 'Open phase →')}</span>`);
    const go = () => { location.hash = phases[i].k; };
    tl.addEventListener('click', go); tl.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });

  /* ---------- routing ---------- */
  window.PANDA_PAGED = true;
  const baseTitle = document.title;
  const bar = [...document.querySelectorAll('.phasebar a')];
  const barKey = { phase1: 'p1', phase2: 'p2', phase3: 'p3', phase4: 'p4', awards: 'aw' };
  let shown = null;
  function show(k, target) {
    if (!byKey[k]) k = 'home';
    if (k !== shown) {
      Object.entries(byKey).forEach(([pk, els]) => els.forEach(e => e.classList.toggle('pg-hidden', pk !== k)));
      shown = k;
      document.title = k === 'home' ? baseTitle : `${PAGES.find(p => p.k === k).title} · PANDA`;
      bar.forEach(a => a.classList.toggle('on', a.dataset.k === barKey[k]));
      document.querySelectorAll('#menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + k || (k.startsWith('phase') && a.getAttribute('href') === '#phase1')));
      document.getElementById('menu')?.classList.remove('open');
    }
    const first = byKey[k][0];
    requestAnimationFrame(() => {
      if (target && target !== first && !target.classList.contains('pg-hidden')) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      else window.scrollTo(0, 0);
    });
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h || h === 'home' || h === 'top') return show('home');
    if (byKey[h]) return show(h);
    const el = document.getElementById(h);
    if (el) { let n = el; while (n && !pageOf.has(n)) n = n.parentElement; if (n) return show(pageOf.get(n), el); }
    show('home');
  }
  addEventListener('hashchange', route);
  route();
})();
