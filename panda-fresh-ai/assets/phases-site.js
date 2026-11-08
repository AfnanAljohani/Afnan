/* PANDA · Phases 1–4 additions for index.html / en.html.
   Adds: phase bar, problem video, awards, Phase 4 section, "Phase 4" menu item.
   Existing markup is never changed or removed; new blocks are inserted next to it.
   Numbers: window.PANDA_PHASE_DATA (data/phases.js). Texts/links: window.PANDA_EXTRAS (data/site-extras.js). */
(function () {
  'use strict';
  const D = window.PANDA_PHASE_DATA, X = window.PANDA_EXTRAS;
  if (!D || !X) return;
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const L = o => o[AR ? 'ar' : 'en'];
  const nf = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 1) => nf(v * 100, d) + '%';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => document.querySelector(s);
  const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const DASH = t('dashboard.html', 'dashboard-en.html');
  const ICON = {
    p1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    p2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-6"/></svg>',
    p3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    aw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
    p4: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="10" y="10" width="4" height="4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>'
  };

  /* ---------------- 1. phase bar ---------------- */
  const phases = [
    { k: 'p1', href: '#problem', n: t('المرحلة 1', 'Phase 1'), name: t('فهم الأعمال', 'Business understanding') },
    { k: 'p2', href: '#phase2', n: t('المرحلة 2', 'Phase 2'), name: t('فهم البيانات', 'Data understanding') },
    { k: 'p3', href: '#phase3', n: t('المرحلة 3', 'Phase 3'), name: t('تجهيز البيانات', 'Data preparation') },
    { k: 'aw', href: '#awards', n: t('المراحل 1–2–3', 'Phases 1–2–3'), name: t('جائزتان', 'Two awards'), cls: 'award' },
    { k: 'p4', href: '#phase4', n: t('المرحلة 4', 'Phase 4'), name: t('النمذجة والنتائج', 'Modeling & results'), isNew: true }
  ];
  const nav = $('nav.nav');
  if (nav) {
    const bar = el(`<div class="phasebar" role="navigation" aria-label="${t('مراحل المشروع', 'Project phases')}"><div class="container">${phases.map(p =>
      `<a href="${p.href}" data-k="${p.k}" class="${p.cls || ''}"><span class="ic">${ICON[p.k]}</span><span><small>${p.n}</small><b>${p.name}${p.isNew ? '<span class="new">NEW</span>' : ''}</b></span></a>`).join('')}</div></div>`);
    nav.after(bar);
  }

  /* ---------------- 2. menu item ---------------- */
  const dashLi = [...document.querySelectorAll('#menu a')].find(a => a.getAttribute('href') === DASH);
  if (dashLi) dashLi.parentElement.before(el(`<li><a href="#phase4">${t('المرحلة الرابعة', 'Phase 4')}</a></li>`));

  /* ---------------- 3. problem video (after business understanding) ---------------- */
  const V = X.video, VL = L(V), problem = $('#problem');
  if (problem) {
    const sec = el(`<section class="section-tint" id="problem-video"><div class="container"><div class="pvideo reveal">
      <div><div class="section-head" style="margin-bottom:0"><span class="eyebrow">${esc(VL.eyebrow)}</span><h2>${esc(VL.title)}</h2><p>${esc(VL.text)}</p></div>
</div>
      <div class="vframe"><video id="pvVideo" src="${V.src}" poster="${V.poster}" preload="metadata" playsinline controls></video>
        <button class="play" id="pvPlay" aria-label="${t('تشغيل الفيديو', 'Play video')}"><span>▶</span></button></div>
    </div></div></section>`);
    problem.after(sec);
    const v = $('#pvVideo'), b = $('#pvPlay');
    b.onclick = () => { b.classList.add('hide'); v.play(); };
    v.addEventListener('play', () => b.classList.add('hide'));
  }

  /* ---------------- 4. awards ---------------- */
  const A = X.awards, AL = L(A), P = D.data;
  const trophy = ICON.aw;
  const awards = el(`<section class="awards" id="awards"><div class="container">
    <div class="section-head reveal"><span class="eyebrow">${esc(AL.eyebrow)}</span><h2>${esc(AL.title)}</h2><p style="color:#B9CEC2">${esc(AL.text)}</p></div>
    <div class="aw-grid">${A.items.map(it => { const I = L(it); return `<article class="aw-card reveal">
      <div class="img"><img src="${it.img}" alt="${esc(I.title)}" loading="lazy"><button data-zoom="${it.img}" aria-label="${t('تكبير', 'Enlarge')}"></button></div>
      <div class="body"><span class="num">${it.num}</span><div class="trophy">${trophy}</div><h3>${esc(I.title)}</h3><p>${esc(I.org)}</p><p class="aw-note">${esc(I.note)}</p>
      <div class="tags"><span>${A.year}</span><span>Phases 1–3</span></div></div></article>`; }).join('')}</div>
    <div class="aw-photos" id="awPhotos" hidden><h3>${esc(AL.photosTitle)}</h3><div class="strip"></div></div>
    <div class="aw-phases reveal">
      <div class="c"><small>${t('المرحلة 1', 'Phase 1')}</small><b class="num">${nf(D.phase1.objectives.length)}</b><span>${t('أهداف قابلة للقياس مع خط أساس واضح', 'measurable objectives with a clear baseline')}</span></div>
      <div class="c"><small>${t('المرحلة 2', 'Phase 2')}</small><b class="num">${nf(P.raw_rows)}</b><span>${t('سجل حلّلناه على مدى 730 يومًا و1,000 فرع', 'records analysed across 730 days and 1,000 stores')}</span></div>
      <div class="c"><small>${t('المرحلة 3', 'Phase 3')}</small><b class="num">871,314</b><span>${t('سجلًا نظيفًا جاهزًا للنمذجة', 'clean records ready for modeling')}</span></div>
    </div></div></section>`);

  /* award-day photos: photo-1.jpg … photo-N.jpg, shown only if they load */
  const ph = A.photos || { max: 0 };
  if (ph.max > 0) {
    const strip = awards.querySelector('.strip'), box = awards.querySelector('#awPhotos');
    for (let i = 1; i <= ph.max; i++) {
      const src = `${ph.dir}photo-${i}.jpg`, im = new Image();
      im.onload = () => { box.hidden = false; const btn = el(`<button data-zoom="${src}" aria-label="${t('صورة', 'Photo')} ${i}"></button>`); btn.appendChild(im); btn.style.order = i; strip.appendChild(btn); };
      im.src = src; im.alt = `${AL.photosTitle} ${i}`; im.loading = 'lazy';
    }
  }

  /* ---------------- 5. Phase 4 (final results) ---------------- */
  const F = D.phase4_final, T = F.tracks, B = F.business;
  const OWN = { Afnan: t('أفنان', 'Afnan'), Sara: t('سارة', 'Sara'), Shahad: t('شهد', 'Shahad'), Khalid: t('خالد', 'Khalid'), Rahaf: t('رهف', 'Rahaf'), Extra: t('نموذج مرجعي', 'Benchmark') };
  const short = m => m.replace(/^(ETS|ARIMAX|SARIMA|Theta)\(.*\)$/, '$1');
  const row = (tr, m) => T[tr].rows.find(r => r.model === m);
  const cC = row('classification', T.classification.champion), cR = row('regression', T.regression.champion), cF = row('forecasting', T.forecasting.champion);
  const nApproaches = B.approaches.length;
  const banner = el(`<div class="phase-banner" id="phase4"><div class="container"><div>
    <span class="eyebrow">PHASE 4 · MODELING &amp; RESULTS <span class="tag gold" style="margin-inline-start:8px">NEW</span></span>
    <h2>${t('المرحلة الرابعة: النمذجة ونتائج الأعمال', 'Phase 4: Modeling &amp; business results')}</h2>
    <p>${t(`طبّقنا ${nApproaches} منهجيات، وقارنّا عدة نماذج في كل منهجية، واختبرنا الفائز مرة واحدة على 8 أسابيع لم يرها أي نموذج.`, `We applied ${nApproaches} approaches, compared several models in each, and tested the winner once on 8 weeks no model had seen.`)}</p>
  </div><div class="big">04</div></div></div>`);
  const card = (title, model, owner, team, teamOwner, lines) => `<article class="p4-card main"><span class="badge-top">${t('الفائز', 'Winner')}</span>
    <h3>${title}</h3><p class="sub"><b style="color:var(--green-700);font-size:18px">${model}</b></p>
    <div class="mets">${lines.map(([l, v]) => `<div><span>${l}</span><b class="num">${v}</b></div>`).join('')}</div>
    <p class="vs">${t('أفضل نموذج من الفريق', 'Best team model')}: <b>${short(team)}</b> · ${OWN[teamOwner] || teamOwner}</p></article>`;
  const tvd = k => B.today_vs_models.find(z => z.k === k);
  const p4 = el(`<section id="phase4-results"><div class="container">
    <div class="section-head reveal"><span class="eyebrow">${t('النتائج', 'RESULTS')}</span>
      <h2>${t('من بيانات بندة إلى روتين صباحي واحد', 'From Panda’s data to one morning routine')}</h2>
      <p>${t('كل رقم هنا مقاس على أسابيع الاختبار، ومقارن بطريقة العمل الحالية.', 'Every number here is measured on the test weeks and compared with how the work is done today.')}</p></div>

    <div class="p4-intro reveal">
      <div class="k"><span>${t('نفاد مكتشف بفحص 1 من 5 سجلات', 'Stockouts found checking 1 in 5 records')}</span><b class="num">${pct(tvd('stockout').with, 0)}</b><small>${t('اليوم', 'today')} ${pct(tvd('stockout').today, 0)} · ×${B.stockout.lift}</small></div>
      <div class="k"><span>${t('الهدر في قائمة واحدة', 'Waste on one list')}</span><b class="num">${pct(tvd('waste').with, 0)}</b><small>${t('اليوم', 'today')} ${pct(tvd('waste').today, 0)}</small></div>
      <div class="k"><span>${t('خطأ توقع الطلب اليومي', 'Daily demand forecast error')}</span><b class="num">${pct(B.forecast.mape, 1)}</b><small>${t('الهدف أقل من 15%', 'target below 15%')}</small></div>
      <div class="k"><span>${t('توفير سنوي متوقع (سيناريو)', 'Expected annual saving (scenario)')}</span><b class="num">SAR ${B.case.saving_low}–${B.case.saving_high}M</b><small>${t('إذا أكدت التجربة الهدف', 'if the pilot confirms the target')}</small></div>
    </div>

    <div class="p4-cards three reveal">
      ${card(t('خطر نفاد المخزون · تصنيف', 'Stockout risk · classification'), T.classification.champion, '', T.classification.best_team, T.classification.best_team_owner, [['PR-AUC', nf(cC.test, 3)], ['ROC-AUC', nf(cC.roc, 3)], [t('أعلى 20%', 'Top 20%'), pct(cC.top20, 0)], ['F1', nf(cC.f1, 2)]])}
      ${card(t('كمية الهدر · انحدار', 'Waste quantity · regression'), T.regression.champion, '', T.regression.best_team, T.regression.best_team_owner, [['MAE', nf(cR.test, 3)], ['R²', nf(cR.r2, 2)], [t('أفضل من المتوسط', 'vs average'), '−' + pct(cR.gain, 0)], ['WAPE', pct(cR.wape, 1)]])}
      ${card(t('الطلب اليومي · سلاسل زمنية', 'Daily demand · time series'), short(T.forecasting.champion), '', T.forecasting.best_team, T.forecasting.best_team_owner, [['MAE', nf(cF.test)], ['MAPE', nf(cF.mape, 2) + '%'], ['MASE', nf(cF.mase, 2)], [t('±3% من الأيام', 'Days ±3%'), pct(B.forecast.within3, 0)]])}
    </div>

    <div class="p4-steps reveal">
      <div class="card"><h3>${t('كيف اخترنا الفائز؟', 'How we chose the winner')}</h3>
        <ul>
          <li>${t('كل نموذج اتضبط على بيانات التدريب فقط، بتقسيم زمني.', 'Every model was tuned on training data only, with a time-based split.')}</li>
          <li>${t('الترتيب على فترة التحقق، والنماذج اللي الفرق بينها أقل من 1% تعتبر متعادلة ويفوز الأقل إفراطًا في التعلم.', 'Ranking on the validation period; models within 1% are tied and the least over-fitted wins.')}</li>
          <li>${t('الفائز اختُبر مرة واحدة على 8 أسابيع لاحقة، مع اختبارات إحصائية تبيّن أي فرق حقيقي.', 'The winner was tested once on 8 later weeks, with statistical tests showing which differences are real.')}</li>
          <li>${t('أي نموذج لا يتفوق على خط الأساس يُذكر بوضوح: في الطلب اليومي النماذج متقاربة جدًا مع المتوسط المتحرك 28 يوم.', 'Where a model does not beat the baseline we say so: for daily demand the models are very close to the 28-day moving average.')}</li>
        </ul></div>
      <div class="card"><h3>${t('الخطوة التالية', 'Next step')}</h3>
        <ul>
          <li>${t('تجربة ميدانية 3 أسابيع في عدد محدود من الفروع.', 'A 3-week pilot in a few stores.')}</li>
          <li>${t(`معيار النجاح: خفض الهدر ${pct(B.pilot.pass_waste, 0)} واكتشاف ${pct(B.pilot.pass_stockout, 0)} من النفاد.`, `Pass criteria: waste down ${pct(B.pilot.pass_waste, 0)} and ${pct(B.pilot.pass_stockout, 0)} of stockouts caught.`)}</li>
          <li>${t('تأكيد أن المخزون يُعدّ قبل بداية اليوم، لأن دقة النماذج تعتمد عليه.', 'Confirm stock is counted before the day starts; the models depend on it.')}</li>
          <li>${t('البيانات أكاديمية، والتوفير سيناريو تثبته التجربة.', 'The data is academic; the saving is a scenario for the pilot to prove.')}</li>
        </ul></div>
    </div>

    <div class="kh-links reveal">${X.khalid.map(k => { const K = L(k); return `<a href="${k.href}" target="_blank" rel="noopener"><span class="ic">${ICON.link}</span><span><b>${esc(K.title)}</b><span>${esc(K.text)}</span><small>${esc(L(X.khalidBy))}</small></span><span class="go">${t('↖', '↗')}</span></a>`; }).join('')}</div>
    <div class="p4-cta reveal" style="gap:12px;flex-wrap:wrap"><a class="btn btn-gold" href="${DASH}#biz">${t('قرار الاستثمار: الداشبورد التنفيذي', 'Investment case: executive dashboard')}</a><a class="btn btn-green" href="${DASH}#p4">${t('مقارنة كل النماذج', 'Compare every model')}</a></div>
  </div></section>`);

  const footer = $('footer');
  if (footer) { footer.before(awards); footer.before(banner); footer.before(p4); }

  /* zoom: reuse the page's existing lightbox */
  document.addEventListener('click', e => {
    const z = e.target.closest('[data-zoom]'); if (!z) return;
    const lb = $('#lb'), img = $('#lbImg'); if (!lb || !img) return;
    img.src = z.dataset.zoom; lb.classList.remove('deck'); lb.classList.add('open'); document.body.style.overflow = 'hidden';
  });

  /* reveal for the new blocks (same behaviour as the rest of the page) */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('#problem-video .reveal,#awards .reveal,#phase4-results .reveal').forEach(n => io.observe(n));

  /* ---------------- 6. scroll spy for the phase bar ---------------- */
  const marks = [['#top', null], ['#problem', 'p1'], ['#deck', null], ['#phase2', 'p2'], ['#phase3', 'p3'], ['#awards', 'aw'], ['#phase4', 'p4']]
    .map(([sel, k]) => ({ node: $(sel), k })).filter(m => m.node);
  const links = [...document.querySelectorAll('.phasebar a')];
  let ticking = false;
  const spy = () => {
    ticking = false;
    const y = innerHeight * 0.35; let cur = null;
    for (const m of marks) if (m.node.getBoundingClientRect().top <= y) cur = m.k;
    links.forEach(a => {
      const on = a.dataset.k === cur;
      if (on && !a.classList.contains('on')) { const c = a.parentElement; c.scrollTo({ left: a.offsetLeft - c.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' }); }
      a.classList.toggle('on', on);
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();
  if (location.hash && document.querySelector(location.hash)) setTimeout(() => document.querySelector(location.hash).scrollIntoView(), 50);
})();
