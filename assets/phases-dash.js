/* PANDA · Phase 1 and Phase 4 views for dashboard.html / dashboard-en.html.
   Adds two side-menu items and two views; existing views are untouched.
   Phase 4 numbers come from window.PANDA_PHASE_DATA (data/phases.js). */
(function () {
  'use strict';
  const D = window.PANDA_PHASE_DATA, X = window.PANDA_EXTRAS;
  if (!D || typeof show !== 'function') return;
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const nf = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 1) => nf(v * 100, d) + '%';
  const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const E = D.phase4.experiments, M = E[D.phase4.primary], G = E[D.phase4.diagnostic], s = M.summary, g = G.summary, P = D.data;
  const rec1 = D.phase1.objectives.find(o => o.metric === 'Recall');

  /* ---------- side menu ---------- */
  const ic1 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>';
  const ic4 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>';
  const b1 = el(`<button data-v="p1">${ic1}${t('المرحلة 1 · فهم الأعمال', 'Phase 1 · Business Understanding')}</button>`);
  const b4 = el(`<button data-v="p4">${ic4}${t('المرحلة 4 · النمذجة والنتائج', 'Phase 4 · Modeling &amp; Results')} <span style="font-size:10px;font-weight:700;background:#C9A24A;color:#0F2A1E;border-radius:999px;padding:1px 7px">NEW</span></button>`);
  document.querySelector('#tabs button[data-v="overview"]').after(b1);
  document.querySelector('#tabs button[data-v="p3"]').after(b4);
  [b1, b4].forEach(b => b.onclick = () => show(b.dataset.v));

  /* ---------- Phase 1 view ---------- */
  const v1 = el(`<section class="view" id="p1" style="padding:0">
    <div class="top"><div><h1>${t('المرحلة الأولى · فهم الأعمال', 'Phase 1 · Business Understanding')}</h1><p>${t('المشكلة والأهداف ومعايير النجاح كما حددناها في بداية المشروع', 'The problem, objectives and success criteria we set at the start of the project')}</p></div><span class="pill">${t('أهداف وافتراضات، وليست نتائج', 'Targets and assumptions, not results')}</span></div>
    <div class="kpis">
      <div class="kpi hero"><span>${t('أهداف الأعمال', 'Business objectives')}</span><b class="num">${D.phase1.objectives.length}</b><small>${t('قابلة للقياس', 'measurable')}</small></div>
      ${D.phase1.objectives.map(o => `<div class="kpi"><span>${o.metric}</span><b class="num">${o.target}</b><small>${t('خط الأساس', 'Baseline')}: <span class="num">${o.baseline}</span></small></div>`).join('')}
      <div class="kpi"><span>${t('نفاد العروض (افتراض)', 'Promo stockouts (assumed)')}</span><b class="num">${D.phase1.assumptions.promo_stockout_baseline}</b><small>${t('خط أساس أكاديمي', 'academic baseline')}</small></div>
    </div>
    <div class="panels">
      <div class="panel s5"><h3>${t('بيان المشكلة', 'Problem statement')}</h3><p class="sub">${t('بندة للتجزئة · الأغذية الطازجة', 'Panda Retail · fresh food')}</p>
        <p style="font-size:14.5px;color:var(--ink-2);margin:0">${t('تركّز سلسلة الإمداد في بندة على التموين بين مراكز التوزيع والفروع، وتوفر المنتج، والمخزون الزائد، والمخزون القريب من الانتهاء. المشروع يتوقع الطلب على مستوى المنتج والفرع ويحسّن التموين للمنتجات الطازجة قصيرة الصلاحية: المخزون الزائد يسبب تخفيضات وهدرًا، والناقص يضيّع المبيعات.', "Panda's supply chain focuses on DC/store replenishment, product availability, overstock and near-expiry stock. The project forecasts SKU-store demand and optimises replenishment for short-shelf-life fresh products: excess stock causes markdowns and waste, too little loses sales.")}</p>
        <div class="insight">${t('افتراضات أكاديمية: MAPE', 'Academic assumptions: MAPE')} <b class="num">${D.phase1.assumptions.mape_baseline}</b> · ${t('نفاد العروض', 'promo stockouts')} <b class="num">${D.phase1.assumptions.promo_stockout_baseline}</b> · ${t('تخفيض/انتهاء', 'markdown/expiry')} <b class="num">${D.phase1.assumptions.markdown_baseline}</b></div></div>
      <div class="panel s7"><h3>${t('الأهداف الأربعة', 'The four objectives')}</h3><p class="sub">${t('خط الأساس ← الهدف، وحالة كل هدف بعد المرحلة الرابعة', 'Baseline → target, and where each stands after Phase 4')}</p>
        <div class="table-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th>#</th><th>${t('الهدف', 'Objective')}</th><th>${t('المقياس', 'Metric')}</th><th>${t('خط الأساس', 'Baseline')}</th><th>${t('الهدف', 'Target')}</th><th>${t('الحالة', 'Status')}</th></tr></thead><tbody>
        ${D.phase1.objectives.map(o => `<tr><td class="num">${o.id}</td><td>${AR ? o.ar : o.en}</td><td>${o.metric}</td><td class="num">${o.baseline}</td><td class="num"><b>${o.target}</b></td><td>${o.metric === 'Recall' ? `<span style="color:var(--warn);font-weight:600">${t('قيد التحسين', 'In progress')} · <span class="num">${pct(s.recall)}</span></span>` : `<span style="color:var(--ink-3)">${t('في المرحلة القادمة', 'Next phase')}</span>`}</td></tr>`).join('')}
        </tbody></table></div></div>
    </div></section>`);
  document.getElementById('overview').after(v1);

  /* ---------- Phase 4 view ---------- */
  const lift = s.average_precision / s.prevalence;
  const links = (X && X.khalid || []).map(k => { const K = k[AR ? 'ar' : 'en']; return `<a href="${k.href}" target="_blank" rel="noopener" class="btn btn-green" style="margin:6px 0 0;margin-inline-end:8px">${K.title} ${t('↖', '↗')}</a>`; }).join('');
  const v4 = el(`<section class="view" id="p4" style="padding:0">
    <div class="top"><div><h1>${t('المرحلة الرابعة · النمذجة والنتائج', 'Phase 4 · Modeling &amp; Results')}</h1><p>${t('تصنيف نفاد المخزون بنموذج LightGBM · اختبار زمني على أسابيع لم يرها النموذج', 'Stockout classification with LightGBM · time-based test on unseen weeks')}</p></div><span class="pill">${t('بيانات النمذجة', 'Model data')}: <b class="num">${nf(P.model_rows)}</b> ${t('سجل', 'records')}</span></div>
    <div class="kpis">
      <div class="kpi hero"><span>PR-AUC</span><b class="num">${nf(s.average_precision, 3)}</b><small>×${nf(lift, 1)} ${t('أفضل من العشوائي', 'vs. random')}</small></div>
      <div class="kpi"><span>ROC-AUC</span><b class="num">${nf(s.roc_auc, 3)}</b><small>${t('العشوائي = 0.5', 'random = 0.5')}</small></div>
      <div class="kpi"><span>${t('الاستدعاء', 'Recall')}</span><b class="num">${pct(s.recall)}</b><small class="num">${nf(s.tp)} / ${nf(s.tp + s.fn)}</small></div>
      <div class="kpi"><span>${t('الإحكام', 'Precision')}</span><b class="num">${pct(s.precision)}</b><small class="num">${nf(s.tp)} / ${nf(s.alerts)} ${t('تنبيه', 'alerts')}</small></div>
      <div class="kpi"><span>${t('سجلات الاختبار', 'Test records')}</span><b class="num">${nf(s.rows)}</b><small class="num">${M.test_start} → ${M.test_end}</small></div>
      <div class="kpi"><span>${t('هدف الاستدعاء (المرحلة 1)', 'Recall target (Phase 1)')}</span><b class="num">${rec1.target}</b><small>${t('الفجوة', 'Gap')}: <span class="num">${nf(parseFloat(rec1.target.replace(/[^0-9.]/g, '')) - s.recall * 100, 1)} pts</span></small></div>
    </div>
    <div class="panels">
      <div class="panel s7"><h3>${t('مقارنة التجارب الأربع', 'The four experiments')}</h3><p class="sub">${t('نوع المدخلات × نوع الاختبار', 'Input profile × test type')}</p>
        <div class="legend"><span><i style="background:#1F7A4D"></i>F1</span><span><i style="background:#2F6FB0"></i>PR-AUC</span></div><div class="cv"><canvas id="p4Exp"></canvas></div>
        <div class="insight">${t('المدخلات المرصودة كاملة تشمل مبيعات وهدر نفس اليوم، لذلك نتيجتها شبه كاملة لكنها <b>تسرّب</b>، وليست توقعًا. المعتمد هو <b>مدخلات المخزون فقط</b>.', 'The full observed inputs include same-day sales and waste, so their near-perfect score is <b>leakage</b>, not a forecast. The model we rely on uses <b>inventory inputs only</b>.')}</div></div>
      <div class="panel s5"><h3>${t('نتائج التصنيف', 'Classification outcomes')}</h3><p class="sub">${t('النموذج المعتمد · الاختبار الزمني', 'Main model · time-based test')}</p>
        <div class="table-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th></th><th>${t('توقع: لا نفاد', 'Pred: no')}</th><th>${t('توقع: نفاد', 'Pred: stockout')}</th></tr></thead><tbody>
          <tr><td>${t('فعلي: لا نفاد', 'Actual: no')}</td><td class="num ok">${nf(s.tn)}</td><td class="num" style="color:var(--warn);font-weight:600">${nf(s.fp)}</td></tr>
          <tr><td>${t('فعلي: نفاد', 'Actual: stockout')}</td><td class="num" style="color:var(--danger);font-weight:600">${nf(s.fn)}</td><td class="num ok">${nf(s.tp)}</td></tr></tbody></table></div>
        <div class="insight">${t(`الدقة العامة ${pct(s.accuracy)} مضلّلة: نموذج يقول "لا نفاد" دائمًا يحصل على ${pct(1 - s.prevalence)}.`, `Accuracy of ${pct(s.accuracy)} is misleading: always saying "no stockout" scores ${pct(1 - s.prevalence)}.`)}</div></div>
      <div class="panel s7"><h3>${t('الأداء حسب الفئة', 'Performance by category')}</h3><p class="sub">${t('النموذج المعتمد', 'Main model')}</p>
        <div class="legend"><span><i style="background:#1F7A4D"></i>${t('الاستدعاء', 'Recall')}</span><span><i style="background:#D4A017"></i>${t('الإحكام', 'Precision')}</span></div><div class="cv sm"><canvas id="p4Cat"></canvas></div></div>
      <div class="panel s5"><h3>${t('لوحات خالد', "Khalid's dashboards")}</h3><p class="sub">${X ? X.khalidBy[AR ? 'ar' : 'en'] : ''}</p>
        <p style="font-size:14px;color:var(--ink-2);margin:0 0 8px">${t('تفاصيل أكثر: مراجعة السجلات، والفلاتر، وتصدير CSV.', 'More detail: record review, filters and CSV export.')}</p>${links}</div>
    </div></section>`);
  document.getElementById('p3').after(v4);

  const CAT = { Bakery: t('مخبوزات', 'Bakery'), Dairy: t('ألبان', 'Dairy'), Frozen: t('مجمدات', 'Frozen'), Grocery: t('بقالة', 'Grocery'), Meat: t('لحوم', 'Meat'), Produce: t('خضار وفواكه', 'Produce') };
  let drawn = false;
  function draw4() {
    if (drawn || typeof mk !== 'function') return; drawn = true;
    const order = ['supplied__inventory_inputs', 'stratified__inventory_inputs', 'supplied__observed_record', 'stratified__observed_record'];
    const lab = { supplied__inventory_inputs: t('زمني · مخزون فقط', 'Time · inventory only'), stratified__inventory_inputs: t('عشوائي · مخزون فقط', 'Random · inventory only'), supplied__observed_record: t('زمني · سجل كامل', 'Time · full record'), stratified__observed_record: t('عشوائي · سجل كامل', 'Random · full record') };
    const ex = order.filter(k => E[k]);
    const grouped = (id, labels, sets) => mk(id, { type: 'bar', data: { labels, datasets: sets.map(([label, data, c]) => ({ label, data, backgroundColor: c, maxBarThickness: 34 })) },
      options: { layout: { padding: { top: 18 } }, scales: { x: { grid: { display: false }, ticks: { color: '#44524A' } }, y: { beginAtZero: true, max: 1, ticks: { callback: v => Math.round(v * 100) + '%' } } },
        plugins: { valueLabels: { enabled: true, format: v => Math.round(v * 100) + '%' }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${pct(c.raw)}` } } } } });
    grouped('p4Exp', ex.map(k => lab[k]), [['F1', ex.map(k => E[k].summary.f1), '#1F7A4D'], ['PR-AUC', ex.map(k => E[k].summary.average_precision), '#2F6FB0']]);
    const cats = M.by_category;
    grouped('p4Cat', cats.map(c => CAT[c.category] || c.category), [[t('الاستدعاء', 'Recall'), cats.map(c => c.recall), '#1F7A4D'], [t('الإحكام', 'Precision'), cats.map(c => c.precision), '#D4A017']]);
    charts.p4Cat.options.scales.y.max = 0.5; charts.p4Cat.update();
  }

  /* ---------- routing: wrap show(), add #p1 / #p4 ---------- */
  const _show = show;
  window.show = function (v) { _show(v); if (v === 'p4') draw4(); };
  const route = () => { const h = location.hash.slice(1); if (h === 'p1' || h === 'p4') window.show(h); };
  addEventListener('hashchange', route); route();
})();
