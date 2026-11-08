/* PANDA · Phase 1, Phase 4 and Business-case views for dashboard.html / dashboard-en.html.
   Adds side-menu items and views; existing views are untouched.
   Numbers come from window.PANDA_PHASE_DATA (data/phases.js). */
(function () {
  'use strict';
  const D = window.PANDA_PHASE_DATA, X = window.PANDA_EXTRAS;
  if (!D || !D.phase4_final || typeof show !== 'function') return;
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const nf = (v, d = 0) => v == null ? '–' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 0) => v == null ? '–' : nf(v * 100, d) + '%';
  const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const F = D.phase4_final, T = F.tracks, B = F.business;
  const GOLD = '#C9A24A', GREEN = '#1F7A4D', BLUE = '#2F6FB0', GRAY = '#B7C2BC', RED = '#B42318', INK = '#44524A';
  const OWN = { Member: t('نموذج الفريق', 'Team model'), Extra: t('نموذج مرجعي', 'Benchmark'), Team: t('خط أساس', 'Baseline') };
  const own = o => OWN[o] || o;
  const short = m => m.replace(/^ETS\(.*\)$/, 'ETS').replace(/^ARIMAX\(.*\)$/, 'ARIMAX').replace(/^SARIMA\(.*\)$/, 'SARIMA').replace(/^Theta\(.*\)$/, 'Theta')
    .replace('SVM (linear / RBF-Nyström)', 'SVM').replace('Baseline · ', t('أساس · ', 'Baseline · '));
  const isChamp = (tr, m) => m === T[tr].champion;
  const css = `
  .p4tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
  .p4tabs button{font-family:inherit;font-size:14px;font-weight:600;border:1px solid var(--line);background:#fff;color:var(--ink-2);border-radius:999px;padding:9px 18px;cursor:pointer}
  .p4tabs button.on{background:var(--green-600);border-color:var(--green-600);color:#fff}
  .champ{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px}
  .champ .c{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow);position:relative}
  .champ .c.win{border:2px solid ${GOLD};background:linear-gradient(180deg,#FFFBF1,#fff)}
  .champ .c small{display:block;font-size:12px;color:var(--ink-3)}
  .champ .c b{display:block;font-size:20px;margin-top:4px}
  .champ .c span{font-size:12.5px;color:var(--ink-2)}
  .crown{position:absolute;top:-11px;inset-inline-end:14px;background:${GOLD};color:#0F2A1E;font-size:11px;font-weight:700;border-radius:999px;padding:3px 10px}
  tr.win td{background:#FFF8E6;font-weight:600}
  tr.base td{color:var(--ink-3)}
  .tagx{font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;margin-inline-start:6px;white-space:nowrap}
  .tagx.w{background:${GOLD};color:#0F2A1E}.tagx.tm{background:var(--green-100);color:var(--green-700)}
  .biz-hero{background:linear-gradient(135deg,#0F2A1E,#1F4D37 60%,#295F45);color:#fff;border-radius:22px;padding:28px 30px;display:grid;grid-template-columns:1.3fr 1fr;gap:24px;align-items:center;margin-bottom:16px;box-shadow:var(--shadow)}
  .biz-hero h2{margin:6px 0 8px;font-size:26px}
  .biz-hero p{margin:0;color:#CFE0D6;font-size:14.5px}
  .biz-hero .big{font-size:42px;font-weight:700;color:${GOLD};line-height:1.1}
  .biz-hero .rec{display:inline-block;background:${GOLD};color:#0F2A1E;font-weight:700;font-size:12.5px;border-radius:999px;padding:5px 12px}
  .tv{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
  .tv .c{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow)}
  .tv .c h4{margin:0 0 10px;font-size:14px}
  .tv .row{display:grid;grid-template-columns:70px 1fr 54px;align-items:center;gap:8px;font-size:12.5px;margin:6px 0}
  .tv .track{height:12px;background:var(--green-50);border-radius:6px;overflow:hidden}
  .tv .track i{display:block;height:100%;border-radius:6px}
  .tv .x{font-size:22px;font-weight:700;color:${GREEN};margin-top:8px}
  .tv .x small{font-size:12px;color:var(--ink-3);font-weight:400}
  .roles{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .roles .r{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--green-50)}
  .roles .r b{display:block;font-size:14.5px;margin-bottom:4px}
  .roles .r p{margin:0;font-size:13px;color:var(--ink-2)}
  .roles .r small{display:block;margin-top:6px;font-size:12px;color:var(--ink-3)}
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px}
  .steps div{border-radius:14px;padding:14px;background:var(--green-50);border:1px solid var(--line);font-size:13px;color:var(--ink-2)}
  .steps div b{display:block;color:var(--green-700);font-size:14px;margin-bottom:4px}
  .p4head{background:radial-gradient(700px 300px at 85% 0%,rgba(201,162,74,.22),transparent 60%),linear-gradient(135deg,#0F2A1E,#1F4D37 65%,#295F45);color:#fff;border-radius:22px;padding:26px 28px;display:flex;justify-content:space-between;gap:24px;align-items:flex-end;flex-wrap:wrap;margin-bottom:16px;box-shadow:var(--shadow)}
  .p4head h1{margin:6px 0 6px;font-size:26px;color:#fff}
  .p4head p{margin:0;color:#CFE0D6;font-size:14px;max-width:720px}
  .eyebrow-d{font-size:12px;letter-spacing:.08em;color:${GOLD};font-weight:600}
  .p4meta{display:flex;gap:10px}
  .p4meta div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px 16px;text-align:center;min-width:92px}
  .p4meta b{display:block;font-size:24px;color:${GOLD}}
  .p4meta span{font-size:12px;color:#CFE0D6}
  .apgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}
  .ap{font-family:inherit;text-align:start;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto auto;column-gap:12px;row-gap:2px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;cursor:pointer;box-shadow:var(--shadow);transition:transform .2s,border-color .2s,box-shadow .2s;color:var(--ink)}
  .ap:hover{transform:translateY(-2px);border-color:#CFE0D6}
  .ap .ic{grid-row:1/5;width:42px;height:42px;border-radius:12px;background:var(--green-100);color:var(--green-600);display:grid;place-items:center}
  .ap .ic svg{width:20px;height:20px}
  .ap .nm{font-weight:700;font-size:15px}
  .ap .q{font-size:12.5px;color:var(--ink-3)}
  .ap .w{font-size:12.5px;color:var(--ink-2);margin-top:6px}
  .ap .w b{color:var(--green-700)}
  .ap .kp{font-size:13px;font-weight:700;color:#7A5B12}
  .ap.on{border:2px solid ${GOLD};background:linear-gradient(180deg,#FFFBF1,#fff);box-shadow:0 12px 30px rgba(201,162,74,.22)}
  .ap.on .ic{background:${GOLD};color:#0F2A1E}
  .p4sub{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:4px 0 14px;flex-wrap:wrap}
  .p4sub h2{margin:0;font-size:20px}
  .p4sub .chk{font-family:inherit;font-size:13px;font-weight:600;border:1px solid var(--line);background:#fff;color:var(--ink-2);border-radius:999px;padding:8px 16px;cursor:pointer}
  .rulebox{border:1px solid var(--line);border-radius:14px;margin:10px 0;overflow:hidden}
  .rulebox div{display:flex;gap:12px;padding:10px 14px;font-size:14px}
  .rulebox div+div{background:var(--green-50)}
  .rulebox span{font-weight:700;color:${RED};min-width:44px;font-size:12.5px;letter-spacing:.04em}
  .rulebox div+div span{color:var(--green-700)}
  .figgrid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-flow:dense;gap:14px;margin-top:6px}
  .fig{font-family:inherit;text-align:start;border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px;cursor:zoom-in;display:flex;flex-direction:column;gap:4px;transition:transform .2s,box-shadow .2s;color:var(--ink)}
  .fig:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
  .fig.wide{grid-column:span 2}
  .fig .im{display:grid;place-items:center;background:#fff;border-radius:10px;height:190px;overflow:hidden;border:1px solid var(--green-50)}
  .fig.wide .im{height:210px}
  .fig img{max-width:100%;max-height:100%;object-fit:contain}
  .fig b{font-size:13.5px;margin-top:4px}
  .fig small{font-size:12px;color:var(--ink-3)}
  .figlb{position:fixed;inset:0;z-index:130;background:rgba(6,18,12,.88);display:none;align-items:center;justify-content:center;padding:20px}
  .figlb.open{display:flex}
  .figlb .in{background:#fff;border-radius:16px;max-width:min(1400px,96vw);max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
  .figlb .bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid var(--line)}
  .figlb .bar button{border:0;background:var(--green-50);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px}
  .figlb img{max-width:100%;max-height:calc(92vh - 60px);object-fit:contain;padding:10px;background:#fff}
  .flow6{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
  .flow6 div{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:var(--shadow);position:relative}
  .flow6 i{font-style:normal;display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--green-600);color:#fff;font-weight:700;font-size:13px;margin-bottom:6px}
  .flow6 b{display:block;font-size:14.5px}
  .flow6 span{font-size:12.5px;color:var(--ink-2)}
  .vsgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .vs{border-radius:14px;padding:14px 16px;border:1px solid var(--line);background:var(--green-50)}
  .vs.ok{border-color:#BFDCCB}.vs.tie{background:#FFF8E6;border-color:#F0DDAE}
  .vs small{font-size:12.5px;color:var(--ink-3)}
  .vs .pair{display:flex;align-items:center;gap:12px;margin:8px 0}
  .vs .pair div{flex:1;background:#fff;border-radius:10px;padding:8px 10px}
  .vs .pair span{display:block;font-size:12px;color:var(--ink-3)}
  .vs .pair b{font-size:20px}
  .vs em{font-style:normal;font-size:12px;color:var(--ink-3)}
  .vs p{margin:0;font-size:13px;color:var(--ink-2)}
  .team{display:flex;flex-direction:column;gap:8px}
  .mem{border:1px solid var(--line);border-radius:12px;padding:10px 12px}
  .mem>b{display:block;font-size:14.5px;color:var(--green-700);margin-bottom:4px}
  .mem span{display:block;font-size:12.5px;color:var(--ink-2);margin:2px 0}
  .mem em{font-style:normal;color:var(--ink-3)}
  .mem i{font-style:normal}
  @media (max-width:1100px){.flow6{grid-template-columns:repeat(3,1fr)}.apgrid{grid-template-columns:repeat(2,1fr)}.figgrid{grid-template-columns:1fr 1fr}.tv{grid-template-columns:repeat(2,1fr)}.biz-hero{grid-template-columns:1fr}.champ{grid-template-columns:1fr}}
  @media (max-width:900px){.flow6,.vsgrid,.figgrid{grid-template-columns:1fr}.fig.wide{grid-column:auto}.tv,.roles,.steps{grid-template-columns:1fr}.apgrid{grid-template-columns:1fr 1fr}.p4meta{width:100%}.p4meta div{flex:1}}`;
  document.head.appendChild(el(`<style>${css}</style>`));

  /* ---------- side menu ---------- */
  const ic = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p}</svg>`;
  const mkBtn = (v, icon, label, badge) => { const b = el(`<button data-v="${v}">${ic(icon)}${label}${badge ? ` <span style="font-size:10px;font-weight:700;background:${GOLD};color:#0F2A1E;border-radius:999px;padding:1px 7px">${badge}</span>` : ''}</button>`); b.onclick = () => show(v); return b; };
  const bBiz = mkBtn('biz', '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>', t('قرار الاستثمار', 'Investment case'), t('للإدارة', 'EXEC'));
  const b1 = mkBtn('p1', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>', t('المرحلة 1 · فهم الأعمال', 'Phase 1 · Business Understanding'));
  const b4 = mkBtn('p4', '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>', t('المرحلة 4 · مقارنة النماذج', 'Phase 4 · Model comparison'), 'NEW');
  const ov = document.querySelector('#tabs button[data-v="overview"]');
  ov.after(bBiz); bBiz.after(b1);
  document.querySelector('#tabs button[data-v="p3"]').after(b4);

  /* =================== Phase 1 =================== */
  const rec1 = D.phase1.objectives.find(o => o.metric === 'Recall');
  const cls = T.classification, champC = cls.rows.find(r => r.model === cls.champion);
  const rnd = (cls.rows.find(r => r.baseline && /stratified random/i.test(r.model)) || {}).test;
  const v1 = el(`<section class="view" id="p1" style="padding:0">
    <div class="top"><div><h1>${t('المرحلة الأولى · فهم الأعمال', 'Phase 1 · Business Understanding')}</h1><p>${t('المشكلة والأهداف ومعايير النجاح كما حددناها في بداية المشروع', 'The problem, objectives and success criteria we set at the start of the project')}</p></div><span class="pill">${t('أهداف وافتراضات', 'Targets and assumptions')}</span></div>
    <div class="kpis">
      <div class="kpi hero"><span>${t('أهداف الأعمال', 'Business objectives')}</span><b class="num">${D.phase1.objectives.length}</b><small>${t('قابلة للقياس', 'measurable')}</small></div>
      ${D.phase1.objectives.map(o => `<div class="kpi"><span>${o.metric}</span><b class="num">${o.target}</b><small>${t('خط الأساس', 'Baseline')}: <span class="num">${o.baseline}</span></small></div>`).join('')}
      <div class="kpi"><span>${t('نفاد العروض (افتراض)', 'Promo stockouts (assumed)')}</span><b class="num">${D.phase1.assumptions.promo_stockout_baseline}</b><small>${t('خط أساس أكاديمي', 'academic baseline')}</small></div>
    </div>
    <div class="panels">
      <div class="panel s5"><h3>${t('بيان المشكلة', 'Problem statement')}</h3><p class="sub">${t('بندة للتجزئة · الأغذية الطازجة', 'Panda Retail · fresh food')}</p>
        <p style="font-size:14.5px;color:var(--ink-2);margin:0">${t('تركّز سلسلة الإمداد في بندة على التموين بين مراكز التوزيع والفروع، وتوفر المنتج، والمخزون الزائد، والمخزون القريب من الانتهاء. المشروع يتوقع الطلب ويحسّن التموين للمنتجات الطازجة قصيرة الصلاحية: المخزون الزائد يسبب تخفيضات وهدرًا، والناقص يضيّع المبيعات.', "Panda's supply chain focuses on DC/store replenishment, product availability, overstock and near-expiry stock. The project forecasts demand and optimises replenishment for short-shelf-life fresh products: excess stock causes markdowns and waste, too little loses sales.")}</p>
        <div class="insight">${t('افتراضات أكاديمية: MAPE', 'Academic assumptions: MAPE')} <b class="num">${D.phase1.assumptions.mape_baseline}</b> · ${t('نفاد العروض', 'promo stockouts')} <b class="num">${D.phase1.assumptions.promo_stockout_baseline}</b> · ${t('تخفيض/انتهاء', 'markdown/expiry')} <b class="num">${D.phase1.assumptions.markdown_baseline}</b></div></div>
      <div class="panel s7"><h3>${t('الأهداف الأربعة ونتيجتها في المرحلة الرابعة', 'The four objectives and their Phase 4 result')}</h3><p class="sub">${t('خط الأساس ← الهدف ← النتيجة على أسابيع الاختبار', 'Baseline, target and result on the test weeks')}</p>
        <div class="table-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th>#</th><th>${t('الهدف', 'Objective')}</th><th>${t('المقياس', 'Metric')}</th><th>${t('الهدف', 'Target')}</th><th>${t('النتيجة', 'Result')}</th></tr></thead><tbody>
          <tr><td class="num">1</td><td>${AR ? D.phase1.objectives[0].ar : D.phase1.objectives[0].en}</td><td>MAPE</td><td class="num"><b>&lt; 15%</b></td><td class="num ok">${pct(B.forecast.mape, 1)} ✓</td></tr>
          <tr><td class="num">2</td><td>${AR ? D.phase1.objectives[1].ar : D.phase1.objectives[1].en}</td><td>${t('نسبة النفاد المكتشف', 'Stockouts caught')}</td><td class="num"><b>${rec1.target}</b></td><td class="num ok">${pct(champC.top20)} ✓ <small style="color:var(--ink-3);font-weight:400">${t('بفحص 1 من 5 سجلات', 'checking 1 in 5 records')}</small></td></tr>
          <tr><td class="num">3</td><td>${AR ? D.phase1.objectives[2].ar : D.phase1.objectives[2].en}</td><td>OSA</td><td class="num"><b>+3–5 pts</b></td><td style="color:var(--ink-3)">${t('يُقاس في التجربة الميدانية', 'Measured in the pilot')}</td></tr>
          <tr><td class="num">4</td><td>${AR ? D.phase1.objectives[3].ar : D.phase1.objectives[3].en}</td><td>${t('الهدر', 'Waste')}</td><td class="num"><b>−20–25%</b></td><td style="color:var(--ink-3)">${t('سيناريو:', 'Scenario:')} <span class="num">SAR ${B.case.saving_low}–${B.case.saving_high}M</span></td></tr>
        </tbody></table></div></div>
    </div></section>`);
  document.getElementById('overview').after(v1);

  /* =================== Phase 4: model comparison =================== */
  const TR = {
    classification: { name: t('التصنيف · خطر نفاد المخزون', 'Classification · stockout risk'), metricLabel: 'PR-AUC', better: t('الأعلى أفضل', 'higher is better') },
    regression: { name: t('الانحدار · كمية الهدر', 'Regression · waste quantity'), metricLabel: 'MAE', better: t('الأقل أفضل', 'lower is better') },
    forecasting: { name: t('السلاسل الزمنية · الطلب اليومي', 'Time series · daily demand'), metricLabel: 'MAE', better: t('الأقل أفضل', 'lower is better') }
  };
  const O = F.other || {};
  const AP = [
    { k: 'overview', ic: '<path d="M4 19h16M4 15l4-4 4 3 7-8"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="19" cy="6" r="1"/>', name: t('نظرة شاملة', 'Overview'), q: t('شرح المرحلة الرابعة وكل النماذج', 'Phase 4 explained, every model'), win: () => t('3 فائزين + 5', '3 winners + 5'), kpi: () => `${cls.rows.length + T.regression.rows.length + T.forecasting.rows.length + 1} ${t('نموذج وخط أساس', 'models & baselines')}` },
    { k: 'classification', ic: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>', name: t('التصنيف', 'Classification'), q: t('خطر نفاد المخزون', 'Stockout risk'), win: () => cls.champion, kpi: () => `${pct(champC.top20)} ${t('من النفاد', 'of stockouts')}` },
    { k: 'regression', ic: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>', name: t('الانحدار', 'Regression'), q: t('كمية الهدر', 'Waste quantity'), win: () => T.regression.champion, kpi: () => `${pct(B.waste.covered_top20)} ${t('من الهدر', 'of waste')}` },
    { k: 'forecasting', ic: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-6"/>', name: t('السلاسل الزمنية', 'Time series'), q: t('الطلب اليومي', 'Daily demand'), win: () => 'ETS', kpi: () => `MAPE ${pct(B.forecast.mape, 1)}` },
    { k: 'anomaly', ic: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v3M11 14h.01"/>', name: t('كشف الشذوذ', 'Anomaly detection'), q: t('السجلات غير الطبيعية', 'Unusual records'), win: () => O.anomaly.winner, kpi: () => `×${O.anomaly.methods[0].waste} ${t('هدر', 'waste')}` },
    { k: 'clustering', ic: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>', name: t('التجميع', 'Clustering'), q: t('المجموعات الطبيعية', 'Natural groups'), win: () => O.clustering.winner, kpi: () => `${O.clustering.k} ${t('مجموعات', 'groups')}` },
    { k: 'rules', ic: '<path d="M4 6h16M4 12h10M4 18h6"/><path d="M17 15l3 3-3 3"/>', name: t('قواعد الارتباط', 'Association rules'), q: t('قواعد إذا–فإن', 'IF–THEN rules'), win: () => O.rules.winner, kpi: () => `${pct(O.rules.waste[0].conf)} ${t('ثقة', 'confidence')}` },
    { k: 'recommendation', ic: '<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>', name: t('التوصية', 'Recommendation'), q: t('أفضل إجراء تالٍ', 'Next best action'), win: () => t('قائم على التنبؤ', 'Model-based'), kpi: () => `${O.recommendation.picks.markdown.model}/50 ${t('صحيحة', 'right')}` },
    { k: 'abtest', ic: '<path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/>', name: t('اختبار A/B', 'A/B testing'), q: t('أثر العروض', 'Promotion effect'), win: () => 'Welch t-test', kpi: () => `+${pct(O.abtest.units_uplift)} ${t('مبيعات', 'sales')}` }
  ];
  const v4 = el(`<section class="view" id="p4" style="padding:0">
    <div class="p4head"><div><span class="eyebrow-d">PHASE 4 · MODELING</span><h1>${t('المرحلة الرابعة · المنهجيات الثماني ونماذجها', 'Phase 4 · The eight approaches and their models')}</h1>
      <p>${t('اختاري منهجية لعرض كل النماذج اللي جرّبناها فيها، والنموذج الفائز، وأفضل نموذج من الفريق. كل النتائج على 8 أسابيع اختبار لم يرها أي نموذج.', 'Pick an approach to see every model we tried, the winner and the best team model. All results are on 8 test weeks no model had seen.')}</p></div>
      <div class="p4meta"><div><b class="num">${AP.length - 1}</b><span>${t('منهجيات', 'approaches')}</span></div><div><b class="num">${cls.rows.length + T.regression.rows.length + T.forecasting.rows.length + 1}</b><span>${t('نموذج وخط أساس', 'models & baselines')}</span></div><div><b class="num">${F.test_period.days}</b><span>${t('يوم اختبار', 'test days')}</span></div></div></div>
    <div class="apgrid" id="apGrid">${AP.map((a, i) => `<button class="ap${i ? '' : ' on'}" data-k="${a.k}"><span class="ic">${ic(a.ic)}</span><span class="nm">${a.name}</span><span class="q">${a.q}</span><span class="w">${a.k === 'overview' ? '' : t('الفائز', 'Winner') + ': '}<b>${short(a.win())}</b></span><span class="kp num">${a.kpi()}</span></button>`).join('')}</div>
    <div class="p4sub"><h2 id="apTitle"></h2><button class="chk" data-k="checks">${t('فحوص التسرّب والميزات', 'Leakage & feature checks')}</button></div>
    <div id="p4Body"></div>
  </section>`);
  document.getElementById('p3').after(v4);

  let chartN = 0;
  const lbChart = (box, rows, key, tr, digits, higher) => {
    const id = 'p4c' + (++chartN); box.insertAdjacentHTML('beforeend', `<div class="cv" style="height:${Math.max(240, rows.length * 30)}px"><canvas id="${id}"></canvas></div>`);
    const sorted = rows.filter(r => r[key] != null).sort((a, b) => higher ? b[key] - a[key] : a[key] - b[key]);
    const col = r => isChamp(tr, r.model) ? GOLD : r.baseline ? GRAY : r.assigned ? GREEN : BLUE;
    mk(id, { type: 'bar', data: { labels: sorted.map(r => short(r.model) + (r.baseline ? '' : ' · ' + own(r.owner))), datasets: [{ data: sorted.map(r => r[key]), backgroundColor: sorted.map(col), maxBarThickness: 22 }] },
      options: { indexAxis: 'y', layout: { padding: { right: 60 } }, scales: { x: { beginAtZero: true, ticks: { callback: v => nf(v, digits > 0 ? 2 : 0) } }, y: { grid: { display: false }, ticks: { color: INK, font: { size: 11.5 } } } },
        plugins: { valueLabels: { enabled: true, format: v => nf(v, digits) }, tooltip: { callbacks: { label: c => ' ' + nf(c.raw, digits) } } } } });
  };
  const legend = `<div class="legend"><span><i style="background:${GOLD}"></i>${t('الفائز', 'Winner')}</span><span><i style="background:${GREEN}"></i>${t('نماذج الفريق', 'Team models')}</span><span><i style="background:${BLUE}"></i>${t('نماذج مرجعية', 'Benchmarks')}</span><span><i style="background:${GRAY}"></i>${t('خطوط الأساس', 'Baselines')}</span></div>`;
  const rowCls = (tr, r) => isChamp(tr, r.model) ? 'win' : r.baseline ? 'base' : '';
  const nameCell = (tr, r) => `${short(r.model)}${isChamp(tr, r.model) ? `<span class="tagx w">${t('الفائز', 'Winner')}</span>` : ''}${r.model === T[tr].best_team ? `<span class="tagx tm">${t('أفضل نموذج من الفريق', 'Best team')}</span>` : ''}`;

  function renderTrack(tr) {
    const body = document.getElementById('p4Body'); body.innerHTML = '';
    const R = T[tr];
    let rows = R.rows.slice();
    if (tr === 'classification' && F.team_classifier) rows.push(F.team_classifier);
    const panels = el('<div class="panels"></div>'); body.appendChild(panels);
    const left = el(`<div class="panel s5"><h3>${TR[tr].metricLabel} ${t('على أسابيع الاختبار', 'on the test weeks')}</h3><p class="sub">${TR[tr].better}</p>${legend}</div>`);
    panels.appendChild(left);
    const digits = tr === 'forecasting' ? 0 : 3;
    lbChart(left, rows, 'test', tr, digits, R.higher);
    let head, line;
    if (tr === 'classification') {
      head = `<th>${t('النموذج', 'Model')}</th><th>${t('المالك', 'Owner')}</th><th>PR-AUC ${t('تحقق', 'val')}</th><th>PR-AUC ${t('اختبار', 'test')}</th><th>ROC-AUC</th><th>F1</th><th>${t('الاستدعاء', 'Recall')}</th><th>${t('اكتشاف أعلى 20%', 'Top-20% capture')}</th><th>${t('فجوة الإفراط', 'Overfit gap')}</th>`;
      line = r => `<td>${nameCell(tr, r)}</td><td>${own(r.owner)}</td><td class="num">${nf(r.val, 3)}</td><td class="num"><b>${nf(r.test, 3)}</b></td><td class="num">${nf(r.roc, 3)}</td><td class="num">${nf(r.f1, 3)}</td><td class="num">${pct(r.recall)}</td><td class="num">${pct(r.top20)}</td><td class="num">${nf(r.gap, 3)}</td>`;
    } else if (tr === 'regression') {
      head = `<th>${t('النموذج', 'Model')}</th><th>${t('المالك', 'Owner')}</th><th>MAE ${t('تحقق', 'val')}</th><th>MAE ${t('اختبار', 'test')}</th><th>RMSE</th><th>R²</th><th>${t('تحسن عن المتوسط', 'Gain vs mean')}</th><th>WAPE ${t('فئة×أسبوع', 'cat×week')}</th><th>${t('زمن التدريب (ث)', 'Fit (s)')}</th>`;
      line = r => `<td>${nameCell(tr, r)}</td><td>${own(r.owner)}</td><td class="num">${nf(r.val, 3)}</td><td class="num"><b>${nf(r.test, 3)}</b></td><td class="num">${nf(r.rmse, 3)}</td><td class="num">${nf(r.r2, 2)}</td><td class="num">${pct(r.gain)}</td><td class="num">${pct(r.wape, 1)}</td><td class="num">${nf(r.fit_s, 0)}</td>`;
    } else {
      const dm = Object.fromEntries((R.dm || []).map(d => [d.model, d]));
      head = `<th>${t('النموذج', 'Model')}</th><th>${t('المالك', 'Owner')}</th><th>MAE ${t('تحقق', 'val')}</th><th>MAE ${t('اختبار', 'test')}</th><th>MAPE</th><th>MASE</th><th>${t('مقابل أفضل خط أساس', 'vs best baseline')}</th>`;
      line = r => { const d = dm[r.model]; const v = d ? (d.verdict.startsWith('no') ? t('لا فرق جوهري', 'no real difference') : d.verdict.includes('better') ? t('أفضل فعلًا', 'really better') : t('أسوأ فعلًا', 'really worse')) : t('المرجع', 'reference'); return `<td>${nameCell(tr, r)}</td><td>${own(r.owner)}</td><td class="num">${nf(r.val)}</td><td class="num"><b>${nf(r.test)}</b></td><td class="num">${nf(r.mape, 2)}%</td><td class="num">${nf(r.mase, 2)}</td><td>${v}${d ? ` <span class="num" style="color:var(--ink-3)">(p=${nf(d.p, 2)})</span>` : ''}</td>`; };
    }
    const sortKey = (a, b) => R.higher ? (b.test ?? -1) - (a.test ?? -1) : (a.test ?? 1e9) - (b.test ?? 1e9);
    const right = el(`<div class="panel s7"><h3>${t('جدول المقارنة الكامل', 'Full leaderboard')}</h3><p class="sub">${t('الترتيب حسب نتيجة الاختبار · الاختيار تم على فترة التحقق', 'Sorted by test score · the winner was chosen on the validation period')}</p>
      <div class="table-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr>${head}</tr></thead><tbody>${rows.sort(sortKey).map(r => `<tr class="${rowCls(tr, r)}">${line(r)}</tr>`).join('')}</tbody></table></div></div>`);
    panels.appendChild(right);
    /* why the winner */
    const tied = R.tied.map(short).join(t('، ', ', '));
    let why;
    if (tr === 'classification') {
      const base = rows.filter(r => r.baseline && r.test != null).sort((a, b) => b.test - a.test)[0];
      const worse = (R.bootstrap || []).filter(b => b.worse).map(b => short(b.model));
      why = t(`قاعدة الاختيار: أعلى PR-AUC على فترة التحقق، والنماذج اللي الفرق بينها أقل من 1% تعتبر متعادلة ويفوز الأقل إفراطًا في التعلم. تعادل: <b>${tied}</b>، وفاز <b>${R.champion}</b>. يتفوق على أفضل قاعدة بسيطة (${short(base.model)}: <span class="num">${nf(base.test, 3)}</span>). اختبار Bootstrap يثبت أنه أفضل فعلًا من: ${worse.join('، ')}.`,
        `Selection rule: highest validation PR-AUC; models within 1% are tied and the least over-fitted wins. Tied: <b>${tied}</b>; <b>${R.champion}</b> won. It beats the best simple rule (${short(base.model)}: <span class="num">${nf(base.test, 3)}</span>). A bootstrap test shows it is truly better than: ${worse.join(', ')}.`);
    } else if (tr === 'regression') {
      why = t(`أقل MAE على فترة التحقق. تعادل ضمن 1%: <b>${tied}</b>، وفاز <b>${R.champion}</b> لأنه بدون إفراط في التعلم وأسرع تدريبًا. النماذج الخطية أضعف بوضوح، وكل النماذج تتفوق على المتوسط.`,
        `Lowest validation MAE. Tied within 1%: <b>${tied}</b>; <b>${R.champion}</b> won as it does not over-fit and trains fastest. Linear models are clearly weaker; every model beats the average.`);
    } else {
      why = t(`أقل MAE على فترة التحقق بين النماذج: <b>${short(R.champion)}</b>. لكن اختبار Diebold–Mariano يبيّن إن ولا نموذج أفضل إحصائيًا من المتوسط المتحرك 28 يوم، لذلك هدف MAPE أقل من 15% متحقق، وخط الأساس يحققه بعد. امتداد التحديث الصباحي على مستوى السجل ينزّل الخطأ إلى <b class="num">${nf(R.nowcast.test)}</b> وحدة/يوم.`,
        `Lowest validation MAE among models: <b>${short(R.champion)}</b>. But the Diebold–Mariano test shows no model is statistically better than the 28-day moving average, so the MAPE < 15% target is met, and the baseline meets it too. A same-morning nowcast cuts the error to <b class="num">${nf(R.nowcast.test)}</b> units/day.`);
    }
    panels.appendChild(el(`<div class="panel s12"><h3>${t('لماذا فاز هذا النموذج؟', 'Why this model won')}</h3><p style="font-size:14px;color:var(--ink-2);margin:6px 0 0">${why}</p>${R.shap ? `<div class="insight">${t('أهم المؤثرات (SHAP)', 'Top drivers (SHAP)')}: <b>${R.shap}</b></div>` : ''}</div>`));
  }

  function renderChecks(body) {
    const A = F.ablation || []; if (!A.length) return;
    const lab = s => s.startsWith('A') ? t('ميزات الفريق (المرجع)', 'Team features (reference)') : s.startsWith('B') ? t('+ زوار نفس اليوم (تسرّب)', '+ same-day footfall (leakage)') : s.startsWith('C') ? t('− بدون المخزون', '− without stock position') : t('− بدون التقويم', '− without calendar');
    const panels = el(`<div class="panels"><div class="panel s7"><h3>${t('ماذا يحدث لو غيّرنا الميزات؟', 'What if we change the features?')}</h3><p class="sub">PR-AUC ${t('لنفاد المخزون على فترة التحقق', 'for stockouts on the validation period')}</p><div class="cv"><canvas id="p4Abl"></canvas></div></div>
      <div class="panel s5"><h3>${t('القراءة', 'Reading')}</h3><ul style="font-size:14px;color:var(--ink-2);padding-inline-start:18px;margin:6px 0 0">
        <li>${t('زوار نفس اليوم لا يُعرفون وقت القرار، فاستبعدناهم رغم أنهم يرفعون النتيجة قليلًا.', 'Same-day footfall is unknown when the decision is made, so we excluded it even though it lifts the score slightly.')}</li>
        <li>${t(`بدون المخزون الافتتاحي ينهار النموذج (PR-AUC من <b class="num">${nf(A[0].pr_auc, 3)}</b> إلى <b class="num">${nf(A[2].pr_auc, 3)}</b>)، لذلك لازم تأكيد أن المخزون يُعدّ قبل بداية اليوم.`, `Without opening stock the model collapses (PR-AUC <b class="num">${nf(A[0].pr_auc, 3)}</b> to <b class="num">${nf(A[2].pr_auc, 3)}</b>), so Panda must confirm stock is counted before the day.`)}</li>
        <li>${t('حذف التقويم لا يغيّر النتيجة: النموذج لا يحفظ التواريخ.', 'Removing calendar features changes nothing: the model is not memorising dates.')}</li></ul></div></div>`);
    body.appendChild(panels);
    mk('p4Abl', { type: 'bar', data: { labels: A.map(a => lab(a.scenario)), datasets: [{ data: A.map(a => a.pr_auc), backgroundColor: A.map(a => a.scenario.startsWith('B') ? RED : a.scenario.startsWith('C') ? GRAY : GREEN), maxBarThickness: 46 }] },
      options: { layout: { padding: { top: 18 } }, scales: { x: { grid: { display: false }, ticks: { color: INK } }, y: { beginAtZero: true } }, plugins: { valueLabels: { enabled: true, format: v => nf(v, 3) } } } });
  }

  const approx = x => x === false ? '≈' : '';
  const note = pages => `<p style="font-size:12px;color:var(--ink-3);margin:10px 0 0">${t('المصدر: العرض التقديمي للمرحلة الرابعة، صفحات', 'Source: Phase 4 deck, pages')} ${pages.join('، ')}. ${t('القيم المسبوقة بـ ≈ مقروءة من رسوم العرض.', 'Values marked ≈ are read from the deck charts.')}</p>`;
  const hbar = (id, labels, sets, opt = {}) => mk(id, { type: 'bar', data: { labels, datasets: sets.map(([label, data, c]) => ({ label, data, backgroundColor: c, maxBarThickness: opt.th || 22 })) },
    options: { indexAxis: opt.vertical ? 'x' : 'y', layout: { padding: { right: 50, top: 14 } }, scales: (() => { const val = { beginAtZero: true, max: opt.max, grid: { display: true }, ticks: Object.assign({ color: INK }, opt.xfmt ? { callback: opt.xfmt } : {}) }, cat = { grid: { display: false }, ticks: { color: INK, font: { size: 11.5 } } }; return opt.vertical ? { x: cat, y: val } : { x: val, y: cat }; })(),
      plugins: { valueLabels: { enabled: true, format: opt.fmt || (v => nf(v, 1)) }, tooltip: { callbacks: { label: c => ` ${c.dataset.label || ''} ${opt.fmt ? opt.fmt(c.raw) : nf(c.raw, 2)}` } } } } });
  const kpis = arr => `<div class="kpis">${arr.map(([l, v, sm, hero]) => `<div class="kpi${hero ? ' hero' : ''}"><span>${l}</span><b class="num">${v}</b><small>${sm || ''}</small></div>`).join('')}</div>`;

  function renderAnomaly(body) {
    const A = O.anomaly, W = A.methods[0];
    body.innerHTML = kpis([[t('الطريقة الفائزة', 'Winning method'), A.winner, t('من 4 طرق', 'of 4 methods'), 1], [t('سجلات مؤشَّرة', 'Flagged records'), nf(A.flagged), pct(A.budget) + t(' من الاختبار', ' of the test period')], [t('الهدر مقارنة بالطبيعي', 'Waste vs normal'), '×' + nf(W.waste, 1)], [t('النفاد مقارنة بالطبيعي', 'Stockouts vs normal'), '×' + nf(W.stockout, 1)], [t('المخزون على الرف', 'Stock on the shelf'), '×' + A.profile.stock_x, t('من المعتاد', 'the usual')], [t('الصلاحية المتبقية', 'Shelf life left'), A.profile.shelf_days + t(' أيام', ' days'), t('الطبيعي ', 'normal ') + A.profile.shelf_days_normal]]) +
      `<div class="panels"><div class="panel s7"><h3>${t('مقارنة الطرق الأربع بنفس الميزانية (1%)', 'The four methods on the same 1% budget')}</h3><p class="sub">${t('كم مرة السجلات المؤشَّرة أسوأ من المتوسط', 'How many times worse flagged records are than average')}</p>
        <div class="legend"><span><i style="background:${GOLD}"></i>${t('الهدر', 'Waste')}</span><span><i style="background:${GREEN}"></i>${t('النفاد', 'Stockouts')}</span></div><div class="cv"><canvas id="anC"></canvas></div></div>
      <div class="panel s5"><h3>${t('مدى اتفاق الطرق (Jaccard)', 'How much the methods agree (Jaccard)')}</h3><p class="sub">${t('1 = نفس السجلات تمامًا', '1 = exactly the same records')}</p><div id="anJ"></div>
        <div class="insight">${t('الطرق تلتقط أنواعًا مختلفة من الشذوذ؛ Robust z-score يلتقط المخزون المفرط تحديدًا، وهو الأهم للهدر.', 'The methods catch different kinds of unusual records; Robust z-score specifically catches over-stock, which matters most for waste.')}</div></div>
      <div class="panel s12"><h3>${t('شكل السجل الشاذ النموذجي', 'What a typical unusual record looks like')}</h3>
        <div class="roles" style="grid-template-columns:repeat(3,1fr)"><div class="r"><b class="num">×${A.profile.stock_x}</b><p>${t('المخزون المعتاد على الرف', 'the usual stock on the shelf')}</p></div><div class="r"><b class="num">${A.profile.order_ratio}</b><p>${t(`نسبة الطلبات للمخزون (الطبيعي ${A.profile.order_ratio_normal}): القليل قادم`, `on order vs on shelf (normal ${A.profile.order_ratio_normal}): little coming in`)}</p></div><div class="r"><b class="num">${A.profile.shelf_days} ${t('أيام', 'days')}</b><p>${t(`صلاحية متبقية (الطبيعي ${A.profile.shelf_days_normal})`, `shelf life left (normal ${A.profile.shelf_days_normal})`)}</p></div></div>
        <div class="insight">${t('الاستخدام: قائمة مراجعة يومية قصيرة للمخزون المفرط لمدير الفئة. بدون أي تسميات: الطريقة تتعلم شكل "الطبيعي" وتؤشر على أبعد 1%.', 'Use: a short daily review list of over-stocked records for the category manager. No labels used: the method learns what "normal" looks like and flags the 1% furthest from it.')}</div>${note(A.pages)}</div></div>`;
    hbar('anC', A.methods.map(m => approx(m.exact) + m.m), [[t('الهدر', 'Waste'), A.methods.map(m => m.waste), GOLD], [t('النفاد', 'Stockouts'), A.methods.map(m => m.stockout), GREEN]], { fmt: v => '×' + nf(v, 1) });
    const J = A.jaccard, cell = v => `<td class="num" style="background:rgba(31,122,77,${v});color:${v > .5 ? '#fff' : 'var(--ink)'};text-align:center">${nf(v, 2)}</td>`;
    document.getElementById('anJ').innerHTML = `<table class="mini-table" style="table-layout:fixed"><thead><tr><th></th>${J.labels.map(l => `<th style="text-align:center">${l}</th>`).join('')}</tr></thead><tbody>${J.m.map((r, i) => `<tr><td><b>${J.labels[i]}</b></td>${r.map(cell).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function renderClustering(body) {
    const C = O.clustering, GN = { high_stock_short_life: t('مخزون عالٍ وصلاحية قصيرة', 'High stock, short shelf life'), discounted: t('مخفّض', 'Discounted'), high_price: t('سعر مرتفع', 'High price'), supplier_risk: t('خطر المورد', 'Supplier risk'), everyday: t('المتوسط اليومي', 'Everyday average'), thin_shelf_much_on_order: t('رف خفيف وطلبات كثيرة', 'Thin shelf, much on order') };
    body.innerHTML = kpis([[t('الخوارزمية الفائزة', 'Winning algorithm'), C.winner, t(`من ${C.algorithms} خوارزميات`, `of ${C.algorithms} algorithms`), 1], [t('عدد المجموعات', 'Groups'), C.k], ['Silhouette', nf(C.silhouette, 2), t('الأعلى أفضل', 'higher is better')], ['Davies–Bouldin', nf(C.davies_bouldin, 2), t('الأقل أفضل', 'lower is better')], [t('الثبات (ARI)', 'Stability (ARI)'), nf(C.ari, 2), t('عبر بذور مختلفة', 'across seeds')], [t('أخطر مجموعة', 'Riskiest group'), '×' + C.groups[0].waste_x, t('هدر · ', 'waste · ') + pct(C.groups[0].share) + t(' من السجلات', ' of records')]]) +
      `<div class="panels"><div class="panel s6"><h3>${t('المجموعات الست: الهدر مقارنة بالمتوسط', 'The six groups: waste vs the network average')}</h3><p class="sub">${t('اسم المجموعة · ونسبتها: ' + C.groups.map(g => GN[g.g] + ' ' + pct(g.share)).join('، '), 'Group name · share of records')}</p><div class="cv"><canvas id="clG"></canvas></div></div>
      <div class="panel s6"><h3>${t('اختيار عدد المجموعات', 'Choosing the number of groups')}</h3><p class="sub">≈ Silhouette ${t('لكل k · الأعلى أفضل', 'by k · higher is better')}</p><div class="legend"><span><i style="background:${GREEN}"></i>K-Means</span><span><i style="background:${GOLD}"></i>Gaussian Mixture</span><span><i style="background:${BLUE}"></i>Agglomerative (Ward)</span></div><div class="cv"><canvas id="clK"></canvas></div></div>
      <div class="panel s12"><div class="insight" style="margin:0">${t('الاستخدام: قاعدة واحدة لكل مجموعة، وقاعدة تخفيض للمجموعة عالية الهدر (6% من السجلات تهدر 5.6× المتوسط).', 'Use: one rule per group, and a mark-down rule for the high-waste group (6% of records waste 5.6× the average).')}</div>${note(C.pages)}</div></div>`;
    hbar('clG', C.groups.map(g => AR ? GN[g.g] : `${GN[g.g]} · ${pct(g.share)}`), [['', C.groups.map(g => g.waste_x), C.groups.map((g, i) => i ? GRAY : RED)]], { fmt: v => '×' + nf(v, 1) });
    const S = C.silhouette_by_k;
    mk('clK', { type: 'line', data: { labels: S.k, datasets: [['K-Means', GREEN], ['Gaussian Mixture', GOLD], ['Agglomerative (Ward)', BLUE]].map(([n, c]) => ({ label: n, data: S[n], borderColor: c, backgroundColor: c, pointRadius: 4, tension: .2 })) },
      options: { interaction: { mode: 'index', intersect: false }, scales: { x: { grid: { display: false }, title: { display: true, text: 'k' } }, y: { ticks: { callback: v => nf(v, 2) } } } } });
  }
  function renderRules(body) {
    const R = O.rules, top = R.waste[0];
    body.innerHTML = kpis([[t('الخوارزمية الفائزة', 'Winning algorithm'), R.winner, t('مقابل Apriori', 'vs Apriori'), 1], [t('قواعد مستخرجة', 'Rules mined'), nf(R.mined)], [t('أقوى قاعدة هدر', 'Top waste rule'), pct(top.conf), t('ثقة · lift ', 'confidence · lift ') + top.train], [t('أقوى قاعدة نفاد', 'Top stockout rule'), '×' + R.stockout[0].train, 'lift'], [t('ثبات على الاختبار', 'Holds on test'), '✓', t('نفس الـ lift تقريبًا', 'almost the same lift')], [t('مكان الاستخراج', 'Mined on'), t('التدريب', 'train'), t('تُحقق على الاختبار', 'checked on test')]]) +
      `<div class="panels"><div class="panel s5"><h3>${t('القواعد الثلاث الأهم', 'The three key rules')}</h3>
        <div class="rulebox"><div><span>${t('إذا', 'IF')}</span>${t('الصلاحية ≤ 5 أيام + مخزون عالٍ', 'shelf life ≤ 5 days + high stock')}</div><div><span>${t('فإن', 'THEN')}</span>${t(`هدر وحدتين أو أكثر في ${pct(top.conf)} من الحالات (${top.train}× الطبيعي)`, `2+ units wasted in ${pct(top.conf)} of cases (${top.train}× normal)`)}</div></div>
        <div class="rulebox"><div><span>${t('إذا', 'IF')}</span>${t('طلبات كثيرة + مخزون منخفض', 'a lot on order + low stock')}</div><div><span>${t('فإن', 'THEN')}</span>${t(`النفاد ${R.stockout[0].train}× أكثر من الطبيعي`, `stockouts ${R.stockout[0].train}× more often than normal`)}</div></div>
        <div class="rulebox"><div><span>${t('إذا', 'IF')}</span>${t('عرض ترويجي', 'promotion')}</div><div><span>${t('فإن', 'THEN')}</span>${t('دائمًا معه خصم: أداة واحدة وليست اثنتين', 'always comes with a discount: one lever, not two')}</div></div></div>
      <div class="panel s7"><h3>${t('قواعد الهدر: التدريب مقابل الاختبار', 'Waste rules: train vs test')}</h3><p class="sub">lift · ${t('القاعدة صادقة إذا بقي الـ lift نفسه على بيانات جديدة', 'a rule is real if its lift holds on new data')}</p><div class="legend"><span><i style="background:${GOLD}"></i>${t('تدريب', 'Train')}</span><span><i style="background:${GREEN}"></i>${t('اختبار', 'Test')}</span></div><div class="cv" style="height:300px"><canvas id="ruW"></canvas></div></div>
      <div class="panel s12"><h3>${t('قواعد النفاد', 'Stockout rules')}</h3><div class="cv sm"><canvas id="ruS"></canvas></div>${note(R.pages)}</div></div>`;
    hbar('ruW', R.waste.map(r => approx(r.exact) + r.r), [[t('تدريب', 'Train'), R.waste.map(r => r.train), GOLD], [t('اختبار', 'Test'), R.waste.map(r => r.test), GREEN]], { fmt: v => nf(v, 1), th: 14 });
    hbar('ruS', R.stockout.map(r => approx(r.exact) + r.r), [[t('تدريب', 'Train'), R.stockout.map(r => r.train), GOLD], [t('اختبار', 'Test'), R.stockout.map(r => r.test), GREEN]], { fmt: v => nf(v, 1), th: 16 });
  }
  function renderRec(body) {
    const R = O.recommendation, P = R.picks, K = R.p_at_k;
    body.innerHTML = kpis([[t('الطريقة الفائزة', 'Winning method'), t('قائمة على التنبؤ', 'Model-based'), t('من 3 طرق', 'of 3 methods'), 1], [t('قائمة التخفيض', 'Mark-down list'), `${P.markdown.model}/50`, t('عشوائي ', 'random ') + P.markdown.random], [t('قائمة إعادة الطلب', 'Re-order list'), `${P.reorder.model}/50`, t('عشوائي ', 'random ') + P.reorder.random], ['Precision@50', pct(K.markdown['Model-based champion'][1]), t('قائمة التخفيض', 'mark-down')], ['Precision@50', pct(K.reorder['Model-based champion'][1]), t('إعادة الطلب', 're-order')], [t('القاعدة البسيطة', 'Simple rule'), `${P.markdown.rule}/50`, t('تخفيض', 'mark-down')]]) +
      `<div class="panels"><div class="panel s6"><h3>${t('اختيارات صحيحة في قائمة يومية من 50', 'Right picks in a daily list of 50')}</h3><div class="legend"><span><i style="background:${GRAY}"></i>${t('عشوائي', 'Random')}</span><span><i style="background:${BLUE}"></i>${t('قاعدة بسيطة', 'Simple rule')}</span><span><i style="background:${GREEN}"></i>${t('قائمتنا', 'Our list')}</span></div><div class="cv"><canvas id="reP"></canvas></div></div>
      <div class="panel s6"><h3>Precision@K</h3><p class="sub">${t('≈ عدا K=50 · قائمة التخفيض', '≈ except K=50 · mark-down list')}</p><div class="legend"><span><i style="background:${GRAY}"></i>Popularity / rule</span><span><i style="background:${GOLD}"></i>Content-based kNN</span><span><i style="background:${GREEN}"></i>Model-based</span></div><div class="cv"><canvas id="reK"></canvas></div></div>
      <div class="panel s12"><div class="insight" style="margin:0">${t('الاستخدام: كل صباح يحصل كل فريق على أهم 50 سجلًا: قائمة تخفيض للهدر، وقائمة إعادة طلب للنفاد.', 'Use: every morning each team gets its top 50 records: a mark-down list for waste and a re-order list for stockouts.')}</div>${note(R.pages)}</div></div>`;
    mk('reP', { type: 'bar', data: { labels: [t('قائمة التخفيض', 'Mark-down list'), t('قائمة إعادة الطلب', 'Re-order list')], datasets: [[t('عشوائي', 'Random'), 'random', GRAY], [t('قاعدة بسيطة', 'Simple rule'), 'rule', BLUE], [t('قائمتنا', 'Our list'), 'model', GREEN]].map(([l, k, c]) => ({ label: l, data: [P.markdown[k], P.reorder[k]], backgroundColor: c, maxBarThickness: 46 })) },
      options: { layout: { padding: { top: 18 } }, scales: { x: { grid: { display: false }, ticks: { color: INK } }, y: { beginAtZero: true, max: 50 } }, plugins: { valueLabels: { enabled: true, format: v => v + '/50' } } } });
    mk('reK', { type: 'line', data: { labels: K.k.map(k => 'K=' + k), datasets: [['Popularity / rule', GRAY], ['Content-based kNN', GOLD], ['Model-based champion', GREEN]].map(([n, c]) => ({ label: n, data: K.markdown[n], borderColor: c, backgroundColor: c, pointRadius: 5, tension: .2 })) },
      options: { interaction: { mode: 'index', intersect: false }, scales: { x: { grid: { display: false } }, y: { min: 0.5, max: 1, ticks: { callback: v => Math.round(v * 100) + '%' } } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${pct(c.raw)}` } } } } });
  }
  function renderAB(body) {
    const A = O.abtest;
    body.innerHTML = kpis([[t('الاختبار الإحصائي', 'Statistical test'), A.test, '', 1], [t('مبيعات مع العروض', 'Sales on promotion'), '+' + pct(A.units_uplift), t('مرصود', 'observed')], [t('هدر مع العروض', 'Waste on promotion'), '+' + pct(A.waste_uplift), t('مرصود، لم يُختبر بعد', 'observed, not yet tested')], [t('حجم كل مجموعة', 'Records per group'), nf(A.records_per_group)], [t('مدة التجربة', 'Pilot length'), A.days + t(' أيام', ' days')], [t('قوة الاختبار', 'Power'), pct(A.power), t('لإثبات خفض ', 'to prove a ') + pct(A.target_cut) + t(' للهدر', ' waste cut')]]) +
      `<div class="panels"><div class="panel s6"><h3>${t('أثر العروض المرصود', 'Observed promotion effect')}</h3><p class="sub">${t('العروض ترفع المبيعات والهدر معًا', 'Promotions raise sales and waste together')}</p><div class="cv sm"><canvas id="abC"></canvas></div></div>
      <div class="panel s6"><h3>${t('تصميم التجربة', 'Pilot design')}</h3><div class="steps" style="grid-template-columns:1fr 1fr"><div><b>${t('مجموعة A', 'Group A')}</b>${t('الطريقة الحالية', 'Today’s way')} · <span class="num">${nf(A.records_per_group)}</span> ${t('سجل', 'records')}</div><div><b>${t('مجموعة B', 'Group B')}</b>${t('قوائمنا الصباحية', 'Our morning lists')} · <span class="num">${nf(A.records_per_group)}</span> ${t('سجل', 'records')}</div></div>
        <div class="insight">${t(`${A.days} أيام تكفي لإثبات خفض هدر ${pct(A.target_cut)} بثقة (قوة ${pct(A.power)}).`, `${A.days} days are enough to prove a ${pct(A.target_cut)} waste cut with confidence (${pct(A.power)} power).`)}</div>${note(A.pages)}</div></div>`;
    hbar('abC', [t('المبيعات', 'Units sold'), t('الهدر', 'Waste')], [['', [A.units_uplift, A.waste_uplift], [GREEN, GOLD]]], { fmt: v => '+' + pct(v), vertical: true, xfmt: v => Math.round(v * 100) + '%', th: 70 });
  }

  /* ---------- notebook figures (Jupyter) ---------- */
  const FIG = (f, ar, en, car, cen, wide) => ({ f: 'assets/figures/' + f + '.png', title: t(ar, en), cap: t(car, cen), wide });
  const FIGS = {
    overview: [FIG('00_classification_leaderboard', 'التصنيف: PR-AUC لكل النماذج', 'Classification: PR-AUC by model', 'التحقق (رمادي) والاختبار (أخضر)', 'Validation (grey) and test (green)'),
      FIG('00_regression_leaderboard', 'الانحدار: MAE لكل النماذج', 'Regression: MAE by model', 'الأقل أفضل', 'Lower is better'),
      FIG('00_forecasting_leaderboard', 'السلاسل الزمنية: MAE لكل النماذج', 'Forecasting: MAE by model', 'وحدة/يوم · الأقل أفضل', 'Units/day · lower is better')],
    classification: [FIG('00_classification_leaderboard', 'PR-AUC لكل النماذج', 'PR-AUC by model', 'التحقق مقابل الاختبار لكل نموذج وخط أساس', 'Validation vs test for every model and baseline'),
      FIG('00_classification_curves', 'منحنى الدقة-الاستدعاء ومنحنى المكاسب', 'Precision–recall and gains curves', 'فحص 20% من السجلات الأعلى خطرًا يكتشف 93% من النفاد', 'Reviewing the riskiest 20% of records catches 93% of stockouts', 1),
      FIG('C_xgb_diagnostics', 'تشخيص XGBoost على الاختبار', 'XGBoost test diagnostics', 'مصفوفة التصنيف، ROC، الدقة-الاستدعاء، المكاسب', 'Confusion matrix, ROC, precision–recall, gains', 1),
      FIG('C_xgb_shap_beeswarm', 'SHAP: تأثير كل ميزة', 'SHAP: effect of each feature', 'الأحمر قيمة عالية، واليمين يرفع خطر النفاد', 'Red = high value; right pushes the risk up'),
      FIG('C_xgb_shap_bar', 'SHAP: أهمية الميزات', 'SHAP: feature importance', 'المخزون المتاح هو الإشارة الأقوى', 'Stock on hand is the strongest signal'),
      FIG('C_xgb_shap_dependence', 'SHAP: علاقة المخزون ونسبة التغطية بالخطر', 'SHAP dependence: stock and cover ratio', 'كلما قل المخزون ارتفع الخطر بحدة', 'Risk climbs sharply as stock falls', 1),
      FIG('C_waterfall_caught', 'حالة نفاد اكتشفها النموذج', 'A stockout the model caught', 'شرح محلي لسجل واحد', 'Local explanation for one record'),
      FIG('C_waterfall_missed', 'حالة نفاد فاتت النموذج', 'A stockout the model missed', 'كان على الرف مخزون كافٍ ظاهريًا', 'The shelf still looked stocked'),
      FIG('C_waterfall_false_alarm', 'تنبيه خاطئ', 'A false alarm', 'مخزون صفر لكن لم يحدث نفاد', 'Zero stock but no stockout happened'),
      FIG('C02_decision_tree_rules', 'شجرة القرار: قواعد للمخططين', 'Decision tree: planner rules', 'أعلى مستويات الشجرة كقواعد مقروءة', 'The top levels of the tree as readable rules', 1)],
    regression: [FIG('00_regression_leaderboard', 'MAE لكل النماذج', 'MAE by model', 'التحقق مقابل الاختبار', 'Validation vs test'),
      FIG('R_xgb_diagnostics', 'تشخيص XGBoost على الاختبار', 'XGBoost test diagnostics', 'الفعلي مقابل المتوقع، البواقي، المعايرة، فئة×أسبوع', 'Actual vs predicted, residuals, calibration, category × week', 1),
      FIG('R_xgb_shap_beeswarm', 'SHAP: تأثير كل ميزة', 'SHAP: effect of each feature', 'المخزون والصلاحية المتبقية يقودان الهدر', 'Stock and shelf life left drive waste'),
      FIG('R_xgb_shap_bar', 'SHAP: أهمية الميزات', 'SHAP: feature importance', 'مؤشر نقص بيانات الصلاحية مهم أيضًا', 'The missing-shelf-life flag matters too'),
      FIG('R_xgb_shap_dependence', 'SHAP: علاقة المخزون بالهدر', 'SHAP dependence: stock and waste', 'مخزون عالٍ وصلاحية قصيرة = هدر', 'High stock with short shelf life = waste', 1),
      FIG('R_xgb_local_high', 'أعلى هدر متوقع في العينة', 'Highest predicted waste in the sample', 'شرح محلي', 'Local explanation'),
      FIG('R_xgb_local_low', 'أقل هدر متوقع في العينة', 'Lowest predicted waste in the sample', 'شرح محلي', 'Local explanation')],
    forecasting: [FIG('00_forecasting_leaderboard', 'MAE لكل النماذج', 'MAE by model', 'وحدة/يوم · الأقل أفضل', 'Units/day · lower is better'),
      FIG('F_ets_backtest', 'ETS: التوقع مقابل الفعلي مع الأخطاء اليومية', 'ETS: forecast vs actual with daily errors', 'فترتا التحقق والاختبار', 'Validation and test periods', 1),
      FIG('F_test_period', 'فترة الاختبار: الفائز مقابل "نفس اليوم الأسبوع الماضي"', 'Test period: champion vs same day last week', 'توقعات اليوم التالي', 'Day-ahead forecasts', 1),
      FIG('F04_xgb_shap', 'SHAP لنموذج XGBoost الزمني', 'SHAP for the XGBoost forecaster', 'خطة العروض بجانب التأخيرات الزمنية', 'The promotion plan ranks with the lags'),
      FIG('F04_xgb_dependence', 'SHAP: التأخير 28 يوم والخصم', 'SHAP dependence: lag 28 and discount', '', '', 1),
      FIG('F04b_nowcast', 'التحديث الصباحي (Nowcast)', 'The same-morning nowcast', 'يخفض الخطأ إلى 371 وحدة/يوم مقابل 710', 'Cuts the error to 371 units/day vs 710', 1)],
    anomaly: [FIG('U01_anomaly', 'كشف الشذوذ: الطرق الأربع', 'Anomaly detection: the four methods', 'الرفع، رسم Isolation Forest، ومصفوفة الاتفاق', 'Lift, Isolation Forest flags and agreement matrix', 1)],
    clustering: [FIG('U02_clustering', 'التجميع: اختيار k والمجموعات وخطرها', 'Clustering: choosing k, the groups and their risk', 'Silhouette، K-Means على محورين، رفع كل مجموعة', 'Silhouette, K-Means on 2 axes, lift per group', 1)],
    rules: [FIG('U03_rules', 'قواعد الارتباط: تدريب مقابل اختبار', 'Association rules: train vs test', 'قواعد النفاد والهدر', 'Stockout and waste rules', 1)],
    recommendation: [FIG('U04_recommendation', 'Precision@K للقائمتين', 'Precision@K for both lists', 'إعادة الطلب والتخفيض', 'Re-order and mark-down', 1)],
    checks: [FIG('A01_ablation', 'فحص الميزات (A01)', 'Feature ablation (A01)', 'PR-AUC للنفاد وR² للهدر في كل سيناريو', 'Stockout PR-AUC and waste R² per scenario', 1)]
  };
  function figPanel(k) {
    const L = FIGS[k]; if (!L) return null;
    return el(`<div class="panel s12 figpanel"><h3>${t('رسومات النماذج من دفاتر Jupyter', 'Model figures from the Jupyter notebooks')}</h3><p class="sub">${t('الرسومات الأصلية من دفاتر الفريق · اضغطي على أي رسم لتكبيره', 'The team’s original notebook figures · click any figure to enlarge')}</p>
      <div class="figgrid">${L.map(g => `<button class="fig${g.wide ? ' wide' : ''}" data-src="${g.f}" data-title="${g.title}"><span class="im"><img src="${g.f}" alt="${g.title}"></span><b>${g.title}</b>${g.cap ? `<small>${g.cap}</small>` : ''}</button>`).join('')}</div></div>`);
  }
  const lbx = el(`<div class="figlb" role="dialog" aria-modal="true"><div class="in"><div class="bar"><b></b><button aria-label="${t('إغلاق', 'Close')}">✕</button></div><img alt=""></div></div>`);
  document.body.appendChild(lbx);
  const closeLb = () => lbx.classList.remove('open');
  lbx.querySelector('button').onclick = closeLb; lbx.addEventListener('click', e => { if (e.target === lbx) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  document.addEventListener('click', e => { const b = e.target.closest('.fig'); if (!b) return; lbx.querySelector('img').src = b.dataset.src; lbx.querySelector('b').textContent = b.dataset.title; lbx.classList.add('open'); });

  /* ---------- Phase 4 overview ---------- */
  function renderOverview(body) {
    const tracks = ['classification', 'regression', 'forecasting'];
    const rowsOf = tr => { const r = T[tr].rows.slice(); if (tr === 'classification' && F.team_classifier) r.push(F.team_classifier); return r; };
    const rank = (tr, r) => { const rows = rowsOf(tr).filter(x => !x.baseline && x.test != null).sort((a, b) => T[tr].higher ? b.test - a.test : a.test - b.test); return rows.indexOf(r) + 1; };
    const bestBase = tr => rowsOf(tr).filter(r => r.baseline && r.test != null).sort((a, b) => T[tr].higher ? b.test - a.test : a.test - b.test)[0];
    const nModels = tracks.reduce((n, tr) => n + rowsOf(tr).filter(r => !r.baseline).length, 0), nBase = tracks.reduce((n, tr) => n + rowsOf(tr).filter(r => r.baseline).length, 0);
    const steps = [
      [t('البيانات', 'Data'), t(`${nf(D.data.model_rows)} سجلًا جاهزًا من المرحلة الثالثة، و23 ميزة معروفة قبل بداية اليوم`, `${nf(D.data.model_rows)} model-ready records from Phase 3, and 23 features known before the day starts`)],
      [t('التقسيم الزمني', 'Time split'), t('73 أسبوع تدريب، 9 تحقق، 8 اختبار. لا تقسيم عشوائي', '73 training, 9 validation, 8 test weeks. Never random')],
      [t('الضبط', 'Tuning'), t('بحث عشوائي/Optuna مع تحقق زمني متقاطع على التدريب فقط', 'Random search / Optuna with time-ordered CV on training data only')],
      [t('الاختيار', 'Selection'), t('الترتيب على التحقق؛ الفرق أقل من 1% تعادل ويفوز الأقل إفراطًا', 'Rank on validation; within 1% is a tie and the least over-fitted wins')],
      [t('الاختبار', 'Test'), t('مرة واحدة على 8 أسابيع لم يرها أي نموذج، مع Bootstrap وDiebold–Mariano', 'Once on 8 unseen weeks, with bootstrap and Diebold–Mariano tests')],
      [t('الأعمال', 'Business'), t('تحويل النتيجة لقوائم صباحية وقرار استثمار', 'Turn the result into morning lists and an investment case')]];
    const winVsBase = tracks.map(tr => { const c = T[tr].rows.find(r => r.model === T[tr].champion), b = bestBase(tr); return { tr, c, b, better: T[tr].higher ? c.test > b.test : c.test < b.test }; });
    const status = (tr, r) => r.baseline ? `<span style="color:var(--ink-3)">${t('خط أساس', 'Baseline')}</span>` : r.model === T[tr].champion ? `<span class="tagx w">${t('الفائز', 'Winner')}</span>` : r.model === T[tr].best_team ? `<span class="tagx tm">${t('أفضل نموذج من الفريق', 'Best team')}</span>` : `#${rank(tr, r)}`;
    const val = (tr, r) => tr === 'forecasting' ? nf(r.test) : nf(r.test, 3);
    body.innerHTML = `
      <div class="flow6">${steps.map((s, i) => `<div><i class="num">${i + 1}</i><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
      ${kpis([[t('منهجيات', 'Approaches'), AP.length - 1, t('تحليلية وتنبؤية ووصفية', 'predictive and descriptive'), 1], [t('نماذج مدرّبة', 'Models trained'), nModels, t('في التصنيف والانحدار والسلاسل', 'classification, regression, time series')], [t('خطوط أساس', 'Baselines'), nBase, t('للمقارنة العادلة', 'for a fair comparison')], [t('نماذج الفريق', 'Team models'), tracks.reduce((n, tr) => n + rowsOf(tr).filter(r => !r.baseline && r.owner === 'Member').length, 0), t('بناها أعضاء الفريق', 'built by the team')], [t('أيام الاختبار', 'Test days'), F.test_period.days, F.test_period.start + ' → ' + F.test_period.end], [t('النفاد المكتشف', 'Stockouts caught'), pct(champC.top20), t('بفحص 20% من السجلات', 'checking 20% of records')]])}
      <div class="panels">
        <div class="panel s12"><h3>${t('هل الفائز أفضل من الطريقة البسيطة؟', 'Does the winner beat the simple way?')}</h3><p class="sub">${t('الفائز مقابل أفضل خط أساس في كل منهجية · على أسابيع الاختبار', 'Winner vs the best baseline in each approach · on the test weeks')}</p>
          <div class="vsgrid">${winVsBase.map(x => `<div class="vs ${x.better ? 'ok' : 'tie'}"><small>${TR[x.tr].name}</small>
            <div class="pair"><div><span>${short(x.c.model)}</span><b class="num">${val(x.tr, x.c)}</b></div><em>${t('مقابل', 'vs')}</em><div><span>${short(x.b.model)}</span><b class="num">${val(x.tr, x.b)}</b></div></div>
            <p>${x.tr === 'forecasting' ? t('متقاربان جدًا: لا فرق إحصائي، والهدف (MAPE أقل من 15%) متحقق للاثنين.', 'Very close: no statistical difference, and both meet the MAPE < 15% target.') : x.tr === 'classification' ? t(`أفضل بـ ${nf((x.c.test / x.b.test - 1) * 100)}% في PR-AUC، و×${nf(x.c.test / rnd, 0)} من العشوائي.`, `${nf((x.c.test / x.b.test - 1) * 100)}% better PR-AUC, and ×${nf(x.c.test / rnd, 0)} vs random.`) : t(`خطأ أقل بـ ${nf((1 - x.c.test / x.b.test) * 100)}% من أفضل خط أساس.`, `${nf((1 - x.c.test / x.b.test) * 100)}% lower error than the best baseline.`)}</p></div>`).join('')}</div></div>
        <div class="panel s7"><h3>${t('كل النماذج في جدول واحد', 'Every model in one table')}</h3><p class="sub">${t('النتيجة الأساسية على الاختبار · PR-AUC للتصنيف و MAE للانحدار والسلاسل', 'Primary test score · PR-AUC for classification, MAE for regression and time series')}</p>
          <div class="table-wrap" style="box-shadow:none;max-height:520px;overflow:auto"><table class="mini-table"><thead><tr><th>${t('المنهجية', 'Approach')}</th><th>${t('النموذج', 'Model')}</th><th>${t('المالك', 'Owner')}</th><th>${t('النتيجة', 'Score')}</th><th>${t('الحالة', 'Status')}</th></tr></thead><tbody>
          ${tracks.map(tr => rowsOf(tr).sort((a, b) => T[tr].higher ? (b.test ?? -1) - (a.test ?? -1) : (a.test ?? 1e9) - (b.test ?? 1e9)).map((r, i) => `<tr class="${rowCls(tr, r)}">${i === 0 ? `<td rowspan="${rowsOf(tr).length}" style="vertical-align:top;font-weight:700">${TR[tr].name}<br><small style="font-weight:400;color:var(--ink-3)">${TR[tr].metricLabel} · ${TR[tr].better}</small></td>` : ''}<td>${short(r.model)}</td><td>${own(r.owner)}</td><td class="num"><b>${val(tr, r)}</b></td><td>${status(tr, r)}</td></tr>`).join('')).join('')}
          </tbody></table></div></div>
        <div class="panel s5"><h3>${t('نماذج الفريق مقابل النماذج المرجعية', 'Team models vs benchmarks')}</h3><p class="sub">${t('أفضل نتيجة لكل فئة في كل منهجية', 'Best score of each group per approach')}</p>
          <div class="team">${tracks.map(tr => { const g = role => rowsOf(tr).filter(r => role === 'base' ? r.baseline : role === 'team' ? (!r.baseline && r.owner === 'Member') : (!r.baseline && r.owner !== 'Member')).filter(r => r.test != null).sort((a, b) => T[tr].higher ? b.test - a.test : a.test - b.test)[0]; const tm = g('team'), bm = g('bench'), bs = g('base'); return `<div class="mem"><b>${TR[tr].name}</b><span>${t('أفضل نموذج من الفريق', 'Best team model')}: ${short(tm.model)} · <b class="num">${val(tr, tm)}</b></span><span>${t('أفضل نموذج مرجعي', 'Best benchmark')}: ${short(bm.model)} · <b class="num">${val(tr, bm)}</b></span><span>${t('أفضل خط أساس', 'Best baseline')}: ${short(bs.model)} · <b class="num">${val(tr, bs)}</b></span></div>`; }).join('')}</div>
          <div class="insight">${t('النماذج المرجعية (CatBoost وXGBoost وLightGBM والانحدار اللوجستي وETS وTheta) أُضيفت لرفع مستوى المقارنة.', 'The benchmark models (CatBoost, XGBoost, LightGBM, Logistic Regression, ETS, Theta) were added to raise the bar of the comparison.')}</div></div>
        <div class="panel s12"><h3>${t('المنهجيات الثماني في سطر', 'The eight approaches in one line each')}</h3>
          <div class="table-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th>${t('المنهجية', 'Approach')}</th><th>${t('سؤال الأعمال', 'Business question')}</th><th>${t('الفائز', 'Winner')}</th><th>${t('اليوم', 'Today')}</th><th>${t('مع نماذجنا', 'With our models')}</th></tr></thead><tbody>
          ${AP.filter(a => a.k !== 'overview').map((a, i) => { const ap = B.approaches[i] || {}; return `<tr><td><b>${a.name}</b></td><td>${a.q}</td><td>${short(a.win())}</td><td class="num">${ap.today || '—'}</td><td class="num ok">${ap.with || a.kpi()}</td></tr>`; }).join('')}
          </tbody></table></div></div>
      </div>`;
  }

  const RENDER = { overview: renderOverview, anomaly: renderAnomaly, clustering: renderClustering, rules: renderRules, recommendation: renderRec, abtest: renderAB, checks: renderChecks };
  function select(k) {
    document.querySelectorAll('#apGrid .ap').forEach(x => x.classList.toggle('on', x.dataset.k === k));
    const a = AP.find(z => z.k === k);
    document.getElementById('apTitle').textContent = a ? `${a.name} · ${a.q}` : t('فحوص التسرّب والميزات', 'Leakage & feature checks');
    const body = document.getElementById('p4Body'); body.innerHTML = '';
    if (RENDER[k]) RENDER[k](body); else renderTrack(k);
    const fp = figPanel(k); if (fp) { let pn = body.querySelector('.panels'); if (!pn) { pn = el('<div class="panels"></div>'); body.appendChild(pn); } pn.appendChild(fp); }
  }
  document.querySelectorAll('#apGrid .ap, .p4sub .chk').forEach(b => b.onclick = () => select(b.dataset.k));

  /* =================== Investment case =================== */
  const tvRow = (lab, v, max, c, txt) => `<div class="row"><span>${lab}</span><div class="track"><i style="width:${Math.max(2, v / max * 100)}%;background:${c}"></i></div><b class="num">${txt}</b></div>`;
  const tv = B.today_vs_models;
  const tvCard = (k, title, fmt, max, x, lower) => { const d = tv.find(z => z.k === k); return `<div class="c"><h4>${title}</h4>${tvRow(t('اليوم', 'Today'), d.today, max, GRAY, fmt(d.today))}${tvRow(t('مع نماذجنا', 'With us'), d.with, max, GREEN, fmt(d.with))}<div class="x">${x}</div></div>`; };
  const roles = [
    [t('مدير الفرع', 'Store manager'), t('يبدأ يومه بقائمة خطر النفاد', 'Starts the day with the stockout risk list'), t(`المتوقع: ${B.stockout.found_model} حالة نفاد مكتشفة يوميًا (اليوم ${B.stockout.found_random})`, `Expected: ${B.stockout.found_model} stockouts found a day (today ${B.stockout.found_random})`), t('المؤشر: أقل من 9 وحدات على الرف', 'Driver: under 9 units on the shelf')],
    [t('مدير الفئة', 'Category manager'), t('يخفّض أو ينقل المنتجات المؤشَّرة', 'Marks down or transfers the flagged items'), t(`المتوقع: ${pct(B.waste.covered_top20)} من الهدر في قائمة واحدة`, `Expected: ${pct(B.waste.covered_top20)} of waste on one list`), t('المؤشر: أكثر من 25 وحدة وصلاحية ≤ 3 أيام', 'Driver: over 25 units with ≤ 3 days of shelf life')],
    [t('مخطط الإمداد', 'Supply planner'), t('يحدد كمية الغد من اليوم السابق', 'Sets tomorrow’s volume the day before'), t(`المتوقع: ضمن ±3% في ${pct(B.forecast.within3)} من الأيام`, `Expected: within ±3% on ${pct(B.forecast.within3)} of days`), t('المؤشر: المبيعات الأخيرة والعروض', 'Driver: recent sales and promotions')],
    [t('مالك البيانات', 'Data owner'), t('يراجع السجلات الشاذة ويسجّل الصلاحية عند الاستلام', 'Reviews unusual records; records expiry at receiving'), t(`المتوقع: السجلات المؤشَّرة تهدر ${B.unusual.waste_x}× أكثر`, `Expected: flagged records waste ${B.unusual.waste_x}× more`), t('المؤشر: مخزون عالٍ جدًا وطلبات قليلة', 'Driver: very high stock, little on order')]
  ];
  const vb = el(`<section class="view" id="biz" style="padding:0">
    <div class="top"><div><h1>${t('قرار الاستثمار', 'Investment case')}</h1><p>${t('كل اللي يحتاجه صاحب القرار في صفحة واحدة: القيمة، والدليل، والخطة، والمخاطر', 'Everything a decision-maker needs on one page: value, evidence, plan and risks')}</p></div><span class="pill">${t('مختبر على', 'Tested on')} <b class="num">${F.test_period.days}</b> ${t('يومًا لم يرها أي نموذج', 'unseen days')}</span></div>
    <div class="biz-hero">
      <div><span class="rec">${t('التوصية: الموافقة على تجربة ميدانية لمدة 3 أسابيع', 'Recommendation: approve a 3-week pilot')}</span>
        <h2>${t('روتين صباحي واحد يقلل النفاد والهدر', 'One morning routine that cuts stockouts and waste')}</h2>
        <p>${t('بدون أجهزة جديدة، وبنفس بيانات بندة الحالية، وبنفس الفرق. النماذج تحسب يوم كامل في أقل من ثانية.', 'No new devices, Panda’s existing data, the same teams. The models score a full day in under a second.')}</p></div>
      <div><div class="big num">SAR ${B.case.saving_low}–${B.case.saving_high}M</div><p>${t('توفير سنوي متوقع إذا أكدت التجربة هدف خفض الهدر 20–25% (سيناريو، وليس نتيجة مقاسة)', 'expected annual saving if the pilot confirms the 20–25% waste target (a scenario, not a measured result)')}</p></div>
    </div>
    <div class="tv">
      ${tvCard('stockout', t('نفاد مكتشف بفحص 1 من 5 سجلات', 'Stockouts found checking 1 in 5 records'), v => pct(v), 1, `×${B.stockout.lift} <small>${t('أكثر من اليوم', 'more than today')}</small>`)}
      ${tvCard('waste', t('الهدر المغطى في قائمة واحدة', 'Waste covered by one list'), v => pct(v), 1, `${pct(B.waste.covered_top20)} <small>${t('بخُمس الجهد', 'with a fifth of the work')}</small>`)}
      ${tvCard('forecast', t('خطأ توقع الطلب اليومي', 'Daily demand forecast error'), v => pct(v, 1), 0.3, `${pct(B.forecast.mape, 1)} <small>${t('الهدف أقل من 15%', 'target below 15%')}</small>`)}
      ${tvCard('nba', t('اختيارات صحيحة من 50', 'Right picks out of 50'), v => nf(v), 50, `${tv.find(z => z.k === 'nba').with}/50 <small>${t('كل صباح', 'every morning')}</small>`)}
    </div>
    <div class="kpis">
      <div class="kpi"><span>${t('سجلات يوميًا', 'Records a day')}</span><b class="num">${nf(B.stockout.records_day)}</b><small>${t('عبر الشبكة', 'across the network')}</small></div>
      <div class="kpi"><span>${t('نفاد يوميًا', 'Stockouts a day')}</span><b class="num">~${nf(B.stockout.stockouts_day)}</b><small>${t('العشوائي يكتشف', 'random checks find')} ${B.stockout.found_random}</small></div>
      <div class="kpi"><span>${t('وحدات مهدرة يوميًا', 'Units wasted a day')}</span><b class="num">${nf(B.waste.units_day)}</b><small>SAR ${nf(B.waste.sar_day / 1000)}K ${t('يوميًا', 'a day')}</small></div>
      <div class="kpi"><span>${t('دقة تنبيه النفاد', 'Alert hit rate')}</span><b class="num">${B.stockout.hit_model}</b><small>${t('مقابل', 'vs')} ${B.stockout.hit_random} ${t('بالصدفة', 'by chance')}</small></div>
      <div class="kpi"><span>${t('مبيعات يوميًا', 'Units sold a day')}</span><b class="num">${nf(B.forecast.units_day)}</b><small>${t('ضمن ±5% في', 'within ±5% on')} ${pct(B.forecast.within5)} ${t('من الأيام', 'of days')}</small></div>
      <div class="kpi hero"><span>${t('المنهجيات المطبقة', 'Approaches applied')}</span><b class="num">${B.approaches.length}</b><small>${t('كلها تتفوق على طريقة اليوم', 'each beats today')}</small></div>
    </div>
    <div class="panels">
      <div class="panel s5"><h3>${t('الهدر السنوي (مليون ريال)', 'Annual fresh-food waste (SAR M)')}</h3><p class="sub">${t('في هذه البيانات · اليوم مقابل هدف المشروع', 'In this dataset · today vs the project target')}</p><div class="cv"><canvas id="bizWaste"></canvas></div></div>
      <div class="panel s7"><h3>${t('ما الذي يحرّك القرار؟', 'What drives each decision?')}</h3><p class="sub">${t('وزن كل إشارة (SHAP) · ارتباط وليس سببية', 'Weight of each signal (SHAP) · association, not cause')}</p>
        <div class="legend"><span><i style="background:${GREEN}"></i>${t('نفاد المخزون', 'Stockout')}</span><span><i style="background:${GOLD}"></i>${t('الهدر', 'Waste')}</span></div><div class="cv"><canvas id="bizDrivers"></canvas></div></div>
      <div class="panel s7"><h3>${t('الروتين الصباحي: من يفعل ماذا', 'The morning routine: who does what')}</h3><p class="sub">${t('المتوقع والمؤشر لكل دور', 'Expected impact and driver per role')}</p>
        <div class="roles">${roles.map(r => `<div class="r"><b>${r[0]}</b><p>${r[1]}</p><small>${r[2]}<br>${r[3]}</small></div>`).join('')}</div></div>
      <div class="panel s5"><h3>${t('الخطة والمطلوب', 'The plan and the ask')}</h3><p class="sub">${t('نتوسع فقط إذا نجحت التجربة', 'We only scale if the pilot passes')}</p>
        <div class="steps"><div><b>1 · ${t('الأسابيع', 'Weeks')} ${B.pilot.weeks}</b>${t('تجربة في عدد محدود من الفروع', 'Pilot in a few stores')}</div><div><b>2 · ${t('إذا نجحت', 'If it passes')}</b>${t('فروع أكثر بنفس الروتين', 'More stores, same routine')}</div><div><b>3 · ${t('بعدها', 'Then')}</b>${t('كامل الشبكة', 'The whole network')}</div></div>
        <div class="insight">${t('معيار النجاح', 'Pass criteria')}: ${t('خفض الهدر', 'waste down')} <b class="num">${pct(B.pilot.pass_waste)}</b> ${t('واكتشاف', 'and')} <b class="num">${pct(B.pilot.pass_stockout)}</b> ${t('من النفاد', 'of stockouts caught')} · A/B: <b class="num">${nf(B.pilot.ab_records_per_group)}</b> ${t('سجل لكل مجموعة لمدة', 'records per group for')} ${B.pilot.ab_days} ${t('أيام', 'days')}</div></div>
      <div class="panel s6"><h3>${t('الدليل', 'The evidence')}</h3><ul style="font-size:14px;color:var(--ink-2);padding-inline-start:18px;margin:6px 0 0">
        <li>${t(`قارنّا <b>${cls.rows.filter(r => !r.baseline).length + 1}</b> نماذج تصنيف و<b>${T.regression.rows.filter(r => !r.baseline).length}</b> انحدار و<b>${T.forecasting.rows.filter(r => !r.baseline).length}</b> سلاسل زمنية، كلها على نفس التقسيم الزمني.`, `We compared <b>${cls.rows.filter(r => !r.baseline).length + 1}</b> classifiers, <b>${T.regression.rows.filter(r => !r.baseline).length}</b> regressors and <b>${T.forecasting.rows.filter(r => !r.baseline).length}</b> forecasters on the same time-based split.`)}</li>
        <li>${t(`الفائز اختير على فترة التحقق، واختُبر مرة واحدة فقط على 8 أسابيع لاحقة.`, `Winners were chosen on validation and tested once on 8 later weeks.`)}</li>
        <li>${t(`نموذج النفاد (${cls.champion}) PR-AUC <b class="num">${nf(champC.test, 3)}</b> مقابل <b class="num">${nf(rnd, 3)}</b> للتخمين العشوائي.`, `Stockout model (${cls.champion}) PR-AUC <b class="num">${nf(champC.test, 3)}</b> vs <b class="num">${nf(rnd, 3)}</b> for random guessing.`)}</li>
        <li><a href="#p4" style="color:var(--green-600);font-weight:600">${t('شوف مقارنة كل النماذج ←', 'See every model compared →')}</a></li></ul></div>
      <div class="panel s6"><h3>${t('المخاطر والحدود', 'Risks and limits')}</h3><ul style="font-size:14px;color:var(--ink-2);padding-inline-start:18px;margin:6px 0 0">
        <li>${t('البيانات أكاديمية، والتوفير سيناريو تثبته التجربة.', 'Academic dataset; the saving is a scenario for the pilot to prove.')}</li>
        <li>${t('يلزم تأكيد أن المخزون يُعدّ قبل بداية اليوم، فبدونه تنهار دقة النموذج.', 'Panda must confirm stock is counted before the day starts; without it the model collapses.')}</li>
        <li>${t('النماذج تُظهر ما يحدث معًا، وليس السبب.', 'The models show what goes together, not what causes it.')}</li>
        <li>${t('الزحمة المفاجئة غير موجودة في البيانات، لذلك التجربة هي الاختبار الحقيقي.', 'A sudden rush of customers is not in the data, so the pilot is the real test.')}</li></ul></div>
    </div></section>`);
  document.getElementById('overview').after(vb);

  let bizDrawn = false;
  function drawBiz() {
    if (bizDrawn) return; bizDrawn = true;
    mk('bizWaste', { type: 'bar', data: { labels: [t('اليوم', 'Today'), t('بعد −20%', 'After −20%'), t('بعد −25%', 'After −25%')], datasets: [{ data: [B.case.waste_today, B.case.after20, B.case.after25], backgroundColor: [GRAY, GREEN, GREEN], maxBarThickness: 60 }] },
      options: { layout: { padding: { top: 18 } }, scales: { x: { grid: { display: false }, ticks: { color: INK } }, y: { beginAtZero: true, ticks: { callback: v => v + 'M' } } }, plugins: { valueLabels: { enabled: true, format: v => 'SAR ' + nf(v, 1) + 'M' } } } });
    const lab = { stock: t('المخزون المتاح', 'Stock on hand'), supplier: t('المورد', 'Supplier'), price: t('السعر والعروض', 'Price & promotion'), shelf: t('الصلاحية المتبقية', 'Shelf life left'), calendar: t('اليوم والموسم', 'Day & season'), product: t('نوع المنتج', 'Product type') };
    const keys = ['stock', 'shelf', 'supplier', 'price', 'calendar', 'product'];
    const val = (arr, k) => (arr.find(x => x[0] === k) || [0, 0])[1];
    mk('bizDrivers', { type: 'bar', data: { labels: keys.map(k => lab[k]), datasets: [
      { label: t('نفاد المخزون', 'Stockout'), data: keys.map(k => val(B.drivers.stockout, k)), backgroundColor: GREEN, maxBarThickness: 18 },
      { label: t('الهدر', 'Waste'), data: keys.map(k => val(B.drivers.waste, k)), backgroundColor: '#D4A017', maxBarThickness: 18 }] },
      options: { indexAxis: 'y', layout: { padding: { right: 50 } }, scales: { x: { beginAtZero: true, max: 1, ticks: { callback: v => Math.round(v * 100) + '%' } }, y: { grid: { display: false }, ticks: { color: INK } } },
        plugins: { valueLabels: { enabled: true, format: v => v ? Math.round(v * 100) + '%' : '' }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${Math.round(c.raw * 100)}%` } } } } });
  }

  /* ---------- routing ---------- */
  let p4Drawn = false;
  const _show = show;
  window.show = function (v) {
    _show(v);
    if (v === 'p4' && !p4Drawn) { p4Drawn = true; select('overview'); }
    if (v === 'biz') drawBiz();
  };
  const route = () => { const h = location.hash.slice(1); if (['p1', 'p4', 'biz'].includes(h)) window.show(h); };
  addEventListener('hashchange', route); route();
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#p4"]'); if (a && document.getElementById('biz').classList.contains('active')) { e.preventDefault(); window.show('p4'); } });
})();
