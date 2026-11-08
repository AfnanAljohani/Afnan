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
        <div class="meta"><span>▶ 1:22</span><span>${t('عربي · English', 'Arabic · English')}</span><span>PANDA · Fresh Food AI</span></div></div>
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

  /* ---------------- 5. Phase 4 ---------------- */
  const E = D.phase4.experiments, M = E[D.phase4.primary], G = E[D.phase4.diagnostic];
  const R = E.stratified__inventory_inputs;
  const s = M.summary, g = G.summary;
  const lift = s.average_precision / s.prevalence;
  const alertRate = s.alerts / s.rows;
  const months = (a, b) => { const f = d => new Date(d + 'T00:00:00Z').toLocaleDateString(AR ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); return `${f(a)} – ${f(b)}`; };
  const rec1 = D.phase1.objectives.find(o => o.metric === 'Recall');

  const banner = el(`<div class="phase-banner" id="phase4"><div class="container"><div>
    <span class="eyebrow">PHASE 4 · MODELING &amp; EVALUATION <span class="tag gold" style="margin-inline-start:8px">NEW</span></span>
    <h2>${t('المرحلة الرابعة: النمذجة والتقييم', 'Phase 4: Modeling &amp; evaluation')}</h2>
    <p>${t(`درّبنا نماذج LightGBM للتنبؤ بنفاد المخزون على ${nf(P.model_rows)} سجلًا من بيانات النمذجة المعدّلة، واختبرناها على أسابيع لم يرها النموذج أبدًا.`,
      `We trained LightGBM models to predict stockouts on ${nf(P.model_rows)} records of the modified model-ready data, and tested them on weeks the model had never seen.`)}</p>
  </div><div class="big">04</div></div></div>`);

  const met = (lab, v) => `<div><span>${lab}</span><b class="num">${v}</b></div>`;
  const p4 = el(`<section id="phase4-results"><div class="container">
    <div class="section-head reveal"><span class="eyebrow">${t('النتائج', 'RESULTS')}</span>
      <h2>${t('هل نقدر نعرف الرف اللي بينفد قبل ما ينفد؟', 'Can we spot the shelf that will run out, before it does?')}</h2>
      <p>${t('نعرض نسختين من النموذج بصراحة: نسخة تتوقع قبل بداية اليوم وهي اللي تهم بندة، ونسخة تشخيصية تكشف النفاد بعد ما يصير.', 'We show two versions of the model honestly: one that predicts before the day starts, which is what matters to Panda, and a diagnostic one that detects stockouts after they happen.')}</p></div>

    <div class="p4-intro reveal">
      <div class="k"><span>${t('بيانات النمذجة', 'Model-ready data')}</span><b class="num">${nf(P.model_rows)}</b><small>${t('سجل', 'records')} · ${nf(P.model_columns)} ${t('عمودًا', 'columns')}</small></div>
      <div class="k"><span>${t('سجلات الاختبار', 'Test records')}</span><b class="num">${nf(s.rows)}</b><small class="num">${months(M.test_start, M.test_end)}</small></div>
      <div class="k"><span>${t('حالات النفاد الفعلية في الاختبار', 'Actual stockouts in test')}</span><b class="num">${nf(s.tp + s.fn)}</b><small>${pct(s.prevalence, 2)} ${t('من السجلات', 'of records')}</small></div>
      <div class="k"><span>${t('النموذج', 'Model')}</span><b class="num" style="font-size:22px">LightGBM</b><small>${t('اختبار زمني، وليس عشوائيًا', 'time-based test, not random')}</small></div>
    </div>

    <div class="p4-cards reveal">
      <article class="p4-card main"><span class="badge-top">${t('التوقع الحقيقي · قبل بداية اليوم', 'Real forecast · before the day starts')}</span>
        <h3>${t('مدخلات المخزون فقط', 'Inventory inputs only')}</h3>
        <p class="sub">${t('يستخدم فقط ما هو معروف قبل اليوم: المخزون والطلبات والمورد والتقويم والسياق.', 'Uses only what is known before the day: stock, orders, supplier, calendar and context.')}</p>
        <div class="mets">${met('PR-AUC', nf(s.average_precision, 3))}${met('ROC-AUC', nf(s.roc_auc, 3))}${met(t('الاستدعاء', 'Recall'), pct(s.recall))}${met(t('الإحكام', 'Precision'), pct(s.precision))}</div>
        <p class="vs">${t(`<b>أفضل من التخمين العشوائي بـ ×${nf(lift, 1)}</b>: PR-AUC ${nf(s.average_precision, 3)} مقابل ${nf(s.prevalence, 3)}. اكتشف <b class="num">${nf(s.tp)}</b> من <b class="num">${nf(s.tp + s.fn)}</b> حالة نفاد بـ <span class="num">${nf(s.alerts)}</span> تنبيه.`,
          `<b>×${nf(lift, 1)} better than random guessing</b>: PR-AUC ${nf(s.average_precision, 3)} vs ${nf(s.prevalence, 3)}. Caught <b class="num">${nf(s.tp)}</b> of <b class="num">${nf(s.tp + s.fn)}</b> stockouts with <span class="num">${nf(s.alerts)}</span> alerts.`)}</p>
      </article>
      <article class="p4-card diag"><span class="badge-top">${t('تشخيص بعد الحدث · ليس توقعًا', 'After-the-fact diagnosis · not a forecast')}</span>
        <h3>${t('السجل المرصود كاملًا', 'Full observed record')}</h3>
        <p class="sub">${t('يشمل المبيعات والهدر الفعليين لنفس اليوم.', "Includes the same day's actual units sold and waste.")}</p>
        <div class="mets">${met('F1', pct(g.f1, 2))}${met(t('الاستدعاء', 'Recall'), pct(g.recall, 2))}${met(t('الإحكام', 'Precision'), pct(g.precision, 2))}${met(t('الأخطاء', 'Errors'), nf(g.fp + g.fn))}</div>
        <p class="vs">${t('هذي هي <b>مشكلة التسرّب</b> اللي حذّرنا منها في المرحلتين الثانية والثالثة: النتيجة شبه كاملة لأن بيانات نفس اليوم تكشف الجواب. ينفع لكشف النفاد بعد حدوثه، ولا يُستخدم للتوقع.',
          'This is the <b>leakage problem</b> we flagged in Phases 2 and 3: the score is near-perfect because same-day data reveals the answer. Useful to detect stockouts after they happen, not to forecast them.')}</p>
      </article>
    </div>

    <div class="p4-charts reveal">
      <div class="card"><h3>${t('النموذج مقابل التخمين العشوائي', 'Model vs. random guessing')}</h3><p class="sub" style="margin:2px 0 12px;color:var(--ink-3);font-size:13px">${t('التخمين العشوائي بنفس عدد التنبيهات', 'Random guessing with the same number of alerts')}</p>
        <div class="legend" style="display:flex;gap:14px;font-size:12.5px;color:var(--ink-2);margin-bottom:6px"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#1F7A4D;margin-inline-end:6px"></i>${t('النموذج', 'Model')}</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#B7C2BC;margin-inline-end:6px"></i>${t('عشوائي', 'Random')}</span></div>
        <div id="p4Bars"></div></div>
      <div class="card"><h3>${t('نتائج التصنيف', 'Classification outcomes')}</h3><p class="sub" style="margin:2px 0 4px;color:var(--ink-3);font-size:13px">${t('النموذج الأساسي على سجلات الاختبار', 'Main model on the test records')}</p>
        <div class="cm"><span></span><span class="h">${t('توقع: لا نفاد', 'Predicted: no')}</span><span class="h">${t('توقع: نفاد', 'Predicted: stockout')}</span>
          <span class="r">${t('فعلي: لا نفاد', 'Actual: no')}</span><div class="cell tn"><b class="num">${nf(s.tn)}</b><span>${t('صحيح', 'Correct')}</span></div><div class="cell fp"><b class="num">${nf(s.fp)}</b><span>${t('تنبيه خاطئ', 'False alert')}</span></div>
          <span class="r">${t('فعلي: نفاد', 'Actual: stockout')}</span><div class="cell fn"><b class="num">${nf(s.fn)}</b><span>${t('نفاد فائت', 'Missed')}</span></div><div class="cell tp"><b class="num">${nf(s.tp)}</b><span>${t('نفاد مكتشف', 'Caught')}</span></div></div>
        <p style="font-size:13px;color:var(--ink-2);margin:12px 0 0">${t(`الدقة العامة ${pct(s.accuracy)} مضلّلة هنا: نموذج يقول "ما فيه نفاد" دائمًا يحصل على ${pct(1 - s.prevalence)}.`, `Overall accuracy of ${pct(s.accuracy)} is misleading here: a model that always says "no stockout" scores ${pct(1 - s.prevalence)}.`)}</p></div>
    </div>

    <div class="p4-charts two reveal">
      <div class="card"><h3>${t('الأداء حسب الفئة', 'Performance by category')}</h3><p class="sub" style="margin:2px 0 12px;color:var(--ink-3);font-size:13px">${t('الاستدعاء لكل فئة · النموذج الأساسي', 'Recall per category · main model')}</p><div id="p4Cats"></div></div>
      <div class="card"><h3>${t('هل النتيجة ثابتة؟', 'Is the result stable?')}</h3>
        <p style="font-size:14px;color:var(--ink-2)">${t('أعدنا الاختبار بتقسيم عشوائي طبقي على كامل الفترة، وطلعت النتيجة قريبة جدًا من الاختبار الزمني. يعني الأداء مو صدفة أسابيع معيّنة.', 'We repeated the test with a stratified random split over the whole period, and the result came out very close to the time-based test, so the performance is not a fluke of particular weeks.')}</p>
        <table style="font-size:13.5px"><thead><tr><th>${t('الاختبار', 'Test')}</th><th>F1</th><th>PR-AUC</th><th>ROC-AUC</th></tr></thead><tbody>
          <tr><td>${t('زمني (أغسطس–سبتمبر 2026)', 'Time-based (Aug–Sep 2026)')}</td><td class="num">${nf(s.f1, 3)}</td><td class="num">${nf(s.average_precision, 3)}</td><td class="num">${nf(s.roc_auc, 3)}</td></tr>
          <tr><td>${t('عشوائي طبقي', 'Stratified random')}</td><td class="num">${nf(R.summary.f1, 3)}</td><td class="num">${nf(R.summary.average_precision, 3)}</td><td class="num">${nf(R.summary.roc_auc, 3)}</td></tr>
        </tbody></table></div>
    </div>

    <div class="p4-steps reveal">
      <div class="card"><h3>${t('الهدف مقابل النتيجة', 'Target vs. result')}</h3>
        <p style="font-size:14.5px;color:var(--ink-2)">${t(`هدف المرحلة الأولى للاستدعاء <b class="num">${rec1.target}</b>، والنموذج الحالي يحقق <b class="num">${pct(s.recall)}</b> عند عتبة متوازنة. الفجوة واضحة، وهذي خطواتنا لسدّها:`, `Phase 1 set a recall target of <b class="num">${rec1.target}</b>; the current model reaches <b class="num">${pct(s.recall)}</b> at a balanced threshold. The gap is clear, and these are our next steps to close it:`)}</p>
        <ul>
          <li>${t('إضافة خصائص تاريخية (lags ومتوسطات متحركة) من الطلب الأسبوعي في ABT-A.', 'Add history features (lags, rolling means) from weekly demand in ABT-A.')}</li>
          <li>${t('ضبط عتبة القرار لرفع الاستدعاء مقابل تنبيهات أكثر.', 'Tune the decision threshold to raise recall in exchange for more alerts.')}</li>
          <li>${t('بناء توقع الطلب الأسبوعي لتحقيق هدف MAPE أقل من 15%.', 'Build the weekly demand forecast towards the MAPE < 15% target.')}</li>
          <li>${t('تأكيد تعريف المخزون (بداية اليوم أو نهايته) مع فريق بندة.', 'Confirm the stock definition (opening vs. closing) with the Panda team.')}</li>
        </ul></div>
      <div class="card"><h3>${t('حدود يجب معرفتها', 'Limits to keep in mind')}</h3>
        <ul>
          <li>${t('البيانات اصطناعية لأغراض أكاديمية، والأرقام ليست مؤشرات رسمية لبندة.', 'The data is synthetic for academic use; the numbers are not official Panda KPIs.')}</li>
          <li>${t(`نسبة النفاد ${pct(s.prevalence, 2)} فقط، لذلك PR-AUC هو المقياس الصحيح وليس الدقة العامة.`, `Stockouts are only ${pct(s.prevalence, 2)} of records, so PR-AUC is the right measure, not accuracy.`)}</li>
          <li>${t('فترة الاختبار الزمني 8 أسابيع فقط (أغسطس–سبتمبر 2026).', 'The time-based test covers only 8 weeks (Aug–Sep 2026).')}</li>
          <li>${t(`بيانات النمذجة المعدّلة ${nf(P.model_rows)} سجل، وتختلف قليلًا عن ${'871,314'} في المرحلة الثالثة بسبب قواعد تنظيف محدّثة.`, `The modified model-ready data has ${nf(P.model_rows)} records, slightly different from Phase 3's 871,314 because of updated cleaning rules.`)}</li>
        </ul></div>
    </div>

    <div class="kh-links reveal">${X.khalid.map(k => { const K = L(k); return `<a href="${k.href}" target="_blank" rel="noopener"><span class="ic">${ICON.link}</span><span><b>${esc(K.title)}</b><span>${esc(K.text)}</span><small>${esc(L(X.khalidBy))}</small></span><span class="go">${t('↖', '↗')}</span></a>`; }).join('')}</div>
    <div class="p4-cta reveal"><a class="btn btn-green" href="${DASH}#p4">${t('افتح داشبورد المرحلة الرابعة ←', 'Open the Phase 4 dashboard →')}</a></div>
  </div></section>`);

  const footer = $('footer');
  if (footer) { footer.before(awards); footer.before(banner); footer.before(p4); }

  /* bars (no chart library needed on the website) */
  const bars = (box, rows, max = 1) => {
    box.innerHTML = rows.map(r => `<div style="margin:10px 0">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${r.label}</span><b class="num">${r.text}</b></div>
      ${r.vals.map(v => `<div style="height:12px;background:var(--green-50);border-radius:6px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${Math.max(0.6, v.v / max * 100)}%;background:${v.c};border-radius:6px;transition:width 1s"></div></div>`).join('')}</div>`).join('');
  };
  const MODEL = '#1F7A4D', RAND = '#B7C2BC';
  bars($('#p4Bars'), [
    { label: 'PR-AUC', text: `${nf(s.average_precision, 3)} · ${nf(s.prevalence, 3)}`, vals: [{ v: s.average_precision, c: MODEL }, { v: s.prevalence, c: RAND }] },
    { label: 'ROC-AUC', text: `${nf(s.roc_auc, 3)} · 0.500`, vals: [{ v: s.roc_auc, c: MODEL }, { v: 0.5, c: RAND }] },
    { label: t('الاستدعاء', 'Recall'), text: `${pct(s.recall)} · ${pct(alertRate)}`, vals: [{ v: s.recall, c: MODEL }, { v: alertRate, c: RAND }] },
    { label: t('الإحكام', 'Precision'), text: `${pct(s.precision)} · ${pct(s.prevalence)}`, vals: [{ v: s.precision, c: MODEL }, { v: s.prevalence, c: RAND }] }
  ]);
  const CAT = { Bakery: t('مخبوزات', 'Bakery'), Dairy: t('ألبان', 'Dairy'), Frozen: t('مجمدات', 'Frozen'), Grocery: t('بقالة', 'Grocery'), Meat: t('لحوم', 'Meat'), Produce: t('خضار وفواكه', 'Produce') };
  const cats = M.by_category.slice().sort((a, b) => b.recall - a.recall);
  const cmax = Math.max(...cats.map(c => c.recall));
  bars($('#p4Cats'), cats.map(c => ({ label: `${CAT[c.category] || c.category} <span style="color:var(--ink-3)" class="num">(${nf(c.tp)}/${nf(c.stockouts)})</span>`, text: pct(c.recall), vals: [{ v: c.recall, c: MODEL }] })), cmax * 1.1);

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
