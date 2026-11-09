/* PANDA data assistant.
   Answers questions from the project's own data (data/phases.js + the facts below), entirely in the browser.
   No external service is called and nothing typed here leaves the page. */
(function () {
  'use strict';
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const D = window.PANDA_PHASE_DATA || {};
  const F = D.phase4_final || null;
  const nf = (v, d = 0) => v == null ? '–' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 0) => v == null ? '–' : nf(v * 100, d) + '%';
  const onDash = !!document.getElementById('tabs');
  const SITE = t('index.html', 'en.html'), DASH = t('dashboard.html', 'dashboard-en.html');
  const link = (href, label) => ({ href, label });

  /* ---------- text normalisation (Arabic + English) ---------- */
  const norm = s => String(s).toLowerCase()
    .replace(/[ً-ْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\p{L}\p{N}%.\s-]/gu, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- helpers over the Phase 4 data ---------- */
  const OWN = { Member: t('نموذج الفريق', 'team model'), Extra: t('نموذج مرجعي', 'benchmark'), Team: t('خط أساس', 'baseline') };
  const short = m => m.replace(/^(ETS|ARIMAX|SARIMA|Theta)\(.*\)$/, '$1');
  const TRN = { classification: t('التصنيف (خطر النفاد)', 'classification (stockout risk)'), regression: t('الانحدار (كمية الهدر)', 'regression (waste quantity)'), forecasting: t('السلاسل الزمنية (الطلب اليومي)', 'time series (daily demand)') };
  const champ = tr => F.tracks[tr].rows.find(r => r.model === F.tracks[tr].champion);
  const metricLine = (tr, r) => tr === 'classification'
    ? `PR-AUC ${nf(r.test, 3)}${r.roc != null ? ` · ROC-AUC ${nf(r.roc, 3)}` : ''}${r.f1 != null ? ` · F1 ${nf(r.f1, 3)}` : ''}${r.top20 != null ? ` · ${t('اكتشاف أعلى 20%', 'top-20% capture')} ${pct(r.top20)}` : ''}`
    : tr === 'regression' ? `MAE ${nf(r.test, 3)} · R² ${nf(r.r2, 2)}${r.gain != null ? ` · ${t('أفضل من المتوسط بـ', 'better than the average by')} ${pct(r.gain)}` : ''}`
      : `MAE ${nf(r.test)} ${t('وحدة/يوم', 'units/day')} · MAPE ${nf(r.mape, 2)}%`;

  const MODEL_KEYS = [
    ['xgboost', ['xgboost', 'xgb', 'اكس جي بوست', 'اكسجي']], ['catboost', ['catboost', 'كات بوست']], ['lightgbm', ['lightgbm', 'light gbm', 'لايت']],
    ['random forest', ['random forest', 'الغابه العشواييه', 'غابه عشواييه', 'راندوم فورست', 'فورست']], ['knn', ['knn', 'كي ان ان', 'الجيران']],
    ['svm', ['svm', 'اس في ام', 'الة المتجهات']], ['decision tree', ['decision tree', 'شجره القرار', 'شجره']], ['logistic', ['logistic', 'لوجستي', 'لوجستك']],
    ['ets', [' ets', 'ets ', 'تمهيد اسي']], ['arimax', ['arimax', 'اريماكس']], ['sarima', ['sarima', 'ساريما']], ['theta', ['theta', 'ثيتا']],
    ['lasso', ['lasso', 'لاسو']], ['ridge', ['ridge', 'ريدج']], ['linear', ['linear regression', 'الانحدار الخطي', 'خطي']], ['elasticnet', ['elasticnet', 'elastic']]
  ];

  function modelAnswer(key) {
    if (!F) return null;
    const out = [];
    for (const tr of ['classification', 'regression', 'forecasting']) {
      let rows = F.tracks[tr].rows.slice();
      if (tr === 'classification' && F.team_classifier) rows.push(F.team_classifier);
      rows.filter(r => norm(r.model).includes(key)).forEach(r => {
        const win = r.model === F.tracks[tr].champion ? t(' — الفائز', ' — the winner') : r.model === F.tracks[tr].best_team ? t(' — أفضل نموذج من الفريق', ' — best team model') : '';
        out.push(`• <b>${short(r.model)}</b> (${OWN[r.owner] || r.owner}) ${t('في', 'in')} ${TRN[tr]}${win}: ${metricLine(tr, r)}`);
      });
    }
    return out.length ? out.join('<br>') : null;
  }
  /* ---------- knowledge base ---------- */
  const KB = [];
  const add = (keys, a, links) => KB.push({ keys: keys.map(norm), a, links: links || [] });

  add(['المشروع', 'وش المشروع', 'عن المشروع', 'فكره', 'project', 'about', 'what is this'],
    t('مشروع أكاديمي لفريق Group 10 (EWA · InnovatiCS) لبندة: تحسين الطلب والمخزون للأغذية الطازجة. يتنبأ بنفاد المخزون وكمية الهدر والطلب اليومي، ويحوّلها لروتين صباحي واحد لفرق الفروع.',
      'An academic project by Group 10 (EWA · InnovatiCS) for Panda: fresh-food demand and inventory optimisation. It predicts stockouts, waste and daily demand, and turns them into one morning routine for store teams.'), [link(SITE + '#phase1', t('المرحلة الأولى', 'Phase 1'))]);
  add(['المشكله', 'problem', 'ليش', 'why', 'التحدي'],
    t('الأغذية الطازجة عمرها قصير: نقص المخزون يعني رفوف فاضية ومبيعات ضائعة، والزيادة تعني تخفيضات وهدر. المشروع يوازن بين الطلب والمخزون وإعادة التموين.',
      'Fresh food has a short shelf life: too little stock means empty shelves and lost sales, too much means markdowns and waste. The project balances demand, stock and replenishment.'), [link(SITE + '#problem', t('المشكلة', 'The problem'))]);
  add(['الاهداف', 'هدف', 'معايير النجاح', 'objectives', 'targets', 'goals', 'kpi'],
    t('أربعة أهداف من المرحلة الأولى: خطأ توقع (MAPE) أقل من 15%، اكتشاف 85% أو أكثر من حالات الخطر، خفض الهدر 20–25%، ورفع التوفر على الرف 3–5 نقاط.',
      'Four Phase 1 objectives: forecast error (MAPE) below 15%, catching 85% or more of risk cases, cutting waste by 20–25%, and raising on-shelf availability by 3–5 points.'), [link(DASH + '#p1', t('داشبورد المرحلة 1', 'Phase 1 dashboard'))]);
  add(['البيانات', 'حجم', 'كم سجل', 'مليون', 'سجل', 'dataset', 'data size', 'records', 'rows', 'columns'],
    t('مليون سجل و26 متغيرًا على 730 يومًا (يناير 2025 – ديسمبر 2026)، تغطي 1,000 فرع و149,827 منتجًا و532,564 دفعة و12,000 مورد و30 مركز توزيع. بيانات أكاديمية بدون أي بيانات شخصية.',
      '1,000,000 records and 26 variables over 730 days (Jan 2025 – Dec 2026), covering 1,000 stores, 149,827 SKUs, 532,564 batches, 12,000 suppliers and 30 DCs. Academic data with no personal fields.'), [link(SITE + '#phase2', t('المرحلة الثانية', 'Phase 2'))]);
  add(['معدل النفاد', 'نسبه النفاد', 'stockout rate', 'كم النفاد'],
    t('معدل نفاد المخزون 2.54% من السجلات، لذلك التصنيف غير متوازن ونقيس بـ PR-AUC بدل الدقة العامة.', 'The stockout rate is 2.54% of records, so the classes are imbalanced and we measure with PR-AUC instead of accuracy.'));
  add(['التوفر', 'osa', 'availability', 'على الرف'],
    t('متوسط التوفر على الرف 96.80%، والفئات متقاربة جدًا (96.78%–96.82%)، والمجمدات الأقل.', 'Average on-shelf availability is 96.80%; categories are very close (96.78%–96.82%), with Frozen the lowest.'));
  add(['قرب الانتهاء', 'الصلاحيه', 'near expiry', 'shelf life', 'expiry'],
    t('7.15% من السجلات قريبة من انتهاء الصلاحية (3 أيام أو أقل)، أي 67,950 من 949,813 سجلًا صالحًا.', '7.15% of records are near expiry (3 days or less), i.e. 67,950 of 949,813 valid records.'));
  add(['العروض', 'العرض الترويجي', 'promotion', 'promo', 'خصم'],
    t('العروض ترفع متوسط المبيعات من 24.55 إلى 38.98 وحدة (+59%) بدون زيادة في النفاد (2.55% مقابل 2.49%). وفي اختبار A/B: مبيعات +60% وهدر +64%.', 'Promotions lift mean sales from 24.55 to 38.98 units (+59%) with no rise in stockouts (2.55% vs 2.49%). In the A/B analysis: sales +60% and waste +64%.'));
  add(['جوده البيانات', 'مشاكل البيانات', 'data quality', 'issues', 'القيم المفقوده', 'missing'],
    t('8 مشاكل رئيسية في المرحلة الثانية، أهمها القيم المفقودة (نسبة التلبية 8.03%، الصلاحية 5.02%، الزوار 4.02%)، وتسميات " produce " (3,027 سجل)، والتاريخ المتفرق (99.67% من أزواج الفرع-المنتج في يوم واحد)، وتسرّب المعلومات. كلها عولجت في المرحلة الثالثة.',
      '8 main issues in Phase 2, notably missing values (fill rate 8.03%, shelf life 5.02%, footfall 4.02%), " produce " labels (3,027 rows), sparse history (99.67% of store-SKU pairs on one day) and leakage. All were treated in Phase 3.'), [link(SITE + '#phase2', t('تقرير الجودة', 'Quality report'))]);
  add(['المرحله الثالثه', 'تجهيز البيانات', 'التنظيف', 'phase 3', 'preparation', 'cleaning', 'abt'],
    t('من مليون سجل إلى 871,314 سجلًا نظيفًا في أسابيع كاملة. جدولان: ABT-A للتنبؤ (435,406 صف = فئة × فرع × أسبوع) وABT-B للتصنيف (871,314 صف = دفعة × منتج × فرع × يوم). 0% قيم مفقودة وبدون تسرّب.',
      'From 1,000,000 records to 871,314 clean records in complete weeks. Two tables: ABT-A for forecasting (435,406 rows = category × store × week) and ABT-B for classification (871,314 rows = batch × SKU × store × day). 0% missing and no leakage.'), [link(SITE + '#phase3', t('المرحلة الثالثة', 'Phase 3'))]);
  add(['مشاكل جديده', 'تواريخ مستقبليه', 'مبيعات مضخمه', 'new issues', 'future dated', 'inflated'],
    t('ثلاث مشاكل جديدة في المرحلة الثالثة: 128,686 سجلًا بتاريخ بعد تاريخ الاستخراج (استُبعدت)، 9,825 سجل مبيعات مضخّمة (صُححت)، و964 سجل مخزونها صفر بدون نفاد (أُعيدت تسميتها).',
      'Three new Phase 3 issues: 128,686 future-dated records (excluded), 9,825 inflated sales records (corrected) and 964 zero-stock records without a stockout (relabelled).'));
  add(['التقسيم', 'تدريب', 'اختبار', 'split', 'train', 'test', 'validation', 'تحقق'],
    t('تقسيم زمني وليس عشوائيًا: 73 أسبوع تدريب (يناير 2025 – مايو 2026)، 9 أسابيع تحقق، و8 أسابيع اختبار (2 أغسطس – 26 سبتمبر 2026).', 'A time-based split, not random: 73 training weeks (Jan 2025 – May 2026), 9 validation weeks and 8 test weeks (2 Aug – 26 Sep 2026).'));
  add(['التسرب', 'leakage', 'تسريب'],
    t('حقول تكشف النتيجة استُبعدت أو استُخدمت من الفترة السابقة فقط، مثل نسبة التوفر في نفس اليوم وزوار نفس اليوم. وفحص الميزات أثبت أن النموذج يعتمد على المخزون الافتتاحي: بدونه ينخفض PR-AUC من 0.394 إلى 0.042.',
      'Fields that reveal the outcome were excluded or only used from the previous period, such as same-day availability and same-day footfall. The feature check showed the model depends on opening stock: without it PR-AUC drops from 0.394 to 0.042.'), [link(DASH + '#p4', t('فحوص التسرّب', 'Leakage checks'))]);
  add(['الفريق', 'الاعضاء', 'مين سوى', 'team', 'members', 'who'],
    t('فريق Group 10 من متدربي الذكاء الاصطناعي وعلوم البيانات في برنامج EWA · InnovatiCS، بالتعاون مع خبراء أعمال وبيانات من بندة.',
      'Group 10, a team of AI & data science trainees in the EWA · InnovatiCS programme, working with business and data experts from Panda.'));
  add(['الجوائز', 'جايزه', 'جوايز', 'فزتو', 'awards', 'award', 'prize'],
    t('فاز الفريق بجائزتين من نادي الذكاء الاصطناعي في أكاديمية الطاقة والمياه (EWA): أكثر موقع ابتكارًا، والمركز الثالث في مشاريع الذكاء الاصطناعي.', 'The team won two EWA AI Club awards: Most Innovative Website, and 3rd place in AI Projects.'), [link(SITE + '#awards', t('الجوائز', 'Awards'))]);
  add(['الزياره', 'زرتو', 'visit', 'صافولا', 'savola'],
    t('زار الفريق مقر مجموعة صافولا في جدة والتقى بفريق بندة وعرض عليهم المشروع.', 'The team visited Savola Group HQ in Jeddah, met the Panda team and presented the project.'), [link(SITE + '#visit', t('الزيارة', 'The visit'))]);
  add(['tableau', 'تابلو'],
    t('داشبورد Tableau للمبيعات والعمليات: إجمالي المبيعات SAR 19.41M، الهدر 37,247 وحدة، معدل النفاد 2.5%، حصة العروض 19.1%، والمبيعات 1.14M وحدة.', 'The Tableau sales & operations dashboard: total sales SAR 19.41M, waste 37,247 units, stockout rate 2.5%, promotion share 19.1%, unit sales 1.14M.'), [link(SITE + '#tableau', 'Tableau')]);

  if (F) {
    const B = F.business, c = champ('classification'), r = champ('regression'), f = champ('forecasting'), O = F.other || {};
    add(['الفايز', 'فاز', 'افضل نموذج', 'الابطال', 'winner', 'winning', 'which model', 'best model', 'champion', 'model won', 'المرحله الرابعه', 'phase 4', 'النماذج'],
      `${t('الفائزون في المرحلة الرابعة:', 'Phase 4 winners:')}<br>• ${TRN.classification}: <b>${F.tracks.classification.champion}</b> (${metricLine('classification', c)})<br>• ${TRN.regression}: <b>${F.tracks.regression.champion}</b> (${metricLine('regression', r)})<br>• ${TRN.forecasting}: <b>${short(F.tracks.forecasting.champion)}</b> (${metricLine('forecasting', f)})${O.anomaly ? `<br>• ${t('كشف الشذوذ', 'Anomaly detection')}: <b>${O.anomaly.winner}</b> · ${t('التجميع', 'Clustering')}: <b>${O.clustering.winner}</b> · ${t('قواعد الارتباط', 'Association rules')}: <b>${O.rules.winner}</b>` : ''}`,
      [link(DASH + '#p4', t('مقارنة كل النماذج', 'Compare every model'))]);
    add(['افضل نموذج من الفريق', 'نماذج الفريق', 'best team', 'team model'],
      `${t('أفضل نموذج من الفريق في كل منهجية:', 'Best team model per approach:')}<br>• ${TRN.classification}: <b>${short(F.tracks.classification.best_team)}</b> <br>• ${TRN.regression}: <b>${short(F.tracks.regression.best_team)}</b> <br>• ${TRN.forecasting}: <b>${short(F.tracks.forecasting.best_team)}</b> `);
    add(['نفاد المخزون', 'التصنيف', 'classification', 'stockout model', 'نموذج النفاد'],
      t(`النموذج الفائز في التصنيف <b>${F.tracks.classification.champion}</b>: ${metricLine('classification', c)}. بفحص 1 من 5 سجلات يكتشف ${pct(B.today_vs_models[0].with)} من حالات النفاد مقابل 20% بالفحص العشوائي، أي ${B.stockout.found_model} حالة يوميًا بدل ${B.stockout.found_random}.`,
        `The classification winner is <b>${F.tracks.classification.champion}</b>: ${metricLine('classification', c)}. Checking 1 in 5 records catches ${pct(B.today_vs_models[0].with)} of stockouts vs 20% with random checks: ${B.stockout.found_model} a day instead of ${B.stockout.found_random}.`), [link(DASH + '#p4', t('التصنيف', 'Classification'))]);
    add(['الهدر', 'كميه الهدر', 'الانحدار', 'waste', 'regression'],
      t(`النموذج الفائز في الانحدار <b>${F.tracks.regression.champion}</b>: ${metricLine('regression', r)}. قائمة واحدة لخُمس السجلات تغطي ${pct(B.waste.covered_top20)} من الهدر. يُهدر يوميًا ${nf(B.waste.units_day)} وحدة (حوالي SAR ${nf(B.waste.sar_day / 1000)}K).`,
        `The regression winner is <b>${F.tracks.regression.champion}</b>: ${metricLine('regression', r)}. One list of a fifth of the records covers ${pct(B.waste.covered_top20)} of waste. ${nf(B.waste.units_day)} units are wasted a day (about SAR ${nf(B.waste.sar_day / 1000)}K).`));
    add(['الطلب', 'التنبؤ', 'السلاسل الزمنيه', 'forecast', 'demand', 'time series', 'mape'],
      t(`النموذج الفائز في السلاسل الزمنية <b>${short(F.tracks.forecasting.champion)}</b>: ${metricLine('forecasting', f)}. الخطأ ${pct(B.forecast.mape, 1)} أقل بكثير من هدف 15%، لكن ولا نموذج أفضل إحصائيًا من المتوسط المتحرك 28 يوم. الشبكة تبيع حوالي ${nf(B.forecast.units_day)} وحدة يوميًا.`,
        `The time-series winner is <b>${short(F.tracks.forecasting.champion)}</b>: ${metricLine('forecasting', f)}. The ${pct(B.forecast.mape, 1)} error is far below the 15% target, but no model is statistically better than the 28-day moving average. The network sells about ${nf(B.forecast.units_day)} units a day.`));
    add(['الاستثمار', 'التوفير', 'كم نوفر', 'العائد', 'invest', 'saving', 'save', 'money', 'worth', 'sar', 'roi', 'business case', 'قيمه', 'value', 'مدير', 'ليش نستثمر', 'نوفر', 'فلوس'],
      t(`توفير سنوي متوقع <b>SAR ${B.case.saving_low}–${B.case.saving_high}M</b> إذا أكدت التجربة هدف خفض الهدر 20–25% (سيناريو وليس نتيجة مقاسة). النفاد المكتشف ×${B.stockout.lift} أكثر، و${pct(B.waste.covered_top20)} من الهدر في قائمة واحدة، بدون أجهزة جديدة وبنفس البيانات والفرق. التوصية: تجربة ميدانية 3 أسابيع.`,
        `Expected annual saving <b>SAR ${B.case.saving_low}–${B.case.saving_high}M</b> if the pilot confirms the 20–25% waste target (a scenario, not a measured result). ${B.stockout.lift}× more stockouts caught and ${pct(B.waste.covered_top20)} of waste on one list, with no new devices and the same data and teams. Recommendation: a 3-week pilot.`), [link(DASH + '#biz', t('قرار الاستثمار', 'Investment case'))]);
    add(['التجربه', 'الخطه', 'pilot', 'plan', 'next step', 'الخطوه الجايه'],
      t(`الخطة: (1) الأسابيع ${B.pilot.weeks}: تجربة في عدد محدود من الفروع، (2) إذا نجحت فروع أكثر، (3) ثم كامل الشبكة. معيار النجاح: خفض الهدر ${pct(B.pilot.pass_waste)} واكتشاف ${pct(B.pilot.pass_stockout)} من النفاد. اختبار A/B يحتاج ${nf(B.pilot.ab_records_per_group)} سجل لكل مجموعة لمدة ${B.pilot.ab_days} أيام.`,
        `The plan: (1) weeks ${B.pilot.weeks}: a pilot in a few stores, (2) if it passes, more stores, (3) then the whole network. Pass criteria: waste down ${pct(B.pilot.pass_waste)} and ${pct(B.pilot.pass_stockout)} of stockouts caught. The A/B test needs ${nf(B.pilot.ab_records_per_group)} records per group for ${B.pilot.ab_days} days.`), [link(DASH + '#biz', t('الخطة', 'The plan'))]);
    add(['المؤثرات', 'وش يسبب', 'السبب', 'shap', 'drivers', 'why stockout', 'ايش يأثر'],
      t(`المخزون المتاح يحمل ${pct(B.drivers.stockout[0][1])} من قرار النفاد، يليه المورد (${pct(B.drivers.stockout[1][1])}). وفي الهدر: المخزون ${pct(B.drivers.waste[0][1])} والصلاحية المتبقية ${pct(B.drivers.waste[1][1])}. أقل من 9 وحدات على الرف يرفع خطر النفاد بحدة. (ارتباط وليس سببية)`,
        `Stock on hand carries ${pct(B.drivers.stockout[0][1])} of the stockout decision, then the supplier (${pct(B.drivers.stockout[1][1])}). For waste: stock ${pct(B.drivers.waste[0][1])} and shelf life left ${pct(B.drivers.waste[1][1])}. Under 9 units on the shelf sharply raises stockout risk. (association, not cause)`));
    add(['المخاطر', 'الحدود', 'risks', 'limits', 'limitations'],
      t('البيانات أكاديمية والتوفير سيناريو تثبته التجربة. يلزم تأكيد أن المخزون يُعدّ قبل بداية اليوم. النماذج تُظهر ما يحدث معًا وليس السبب. والزحمة المفاجئة غير موجودة في البيانات.', 'The data is academic and the saving is a scenario for the pilot to prove. Panda must confirm stock is counted before the day starts. The models show what goes together, not causes. A sudden rush is not in the data.'));
    add(['كيف اخترتو', 'قاعده الاختيار', 'how chosen', 'selection rule', 'كيف اخترنا'],
      t('كل نموذج اتضبط على التدريب فقط، وترتيبه على فترة التحقق. النماذج اللي الفرق بينها أقل من 1% متعادلة ويفوز الأقل إفراطًا في التعلم، ثم الأسرع. الفائز اختُبر مرة واحدة على 8 أسابيع لاحقة مع اختبارات إحصائية (Bootstrap وDiebold–Mariano).', 'Each model was tuned on training data only and ranked on validation. Models within 1% are tied and the least over-fitted wins, then the fastest. The winner was tested once on 8 later weeks with statistical tests (bootstrap and Diebold–Mariano).'));
    if (O.anomaly) {
      add(['الشذوذ', 'شاذ', 'غير طبيعي', 'anomaly', 'unusual', 'outlier'],
        t(`كشف الشذوذ: الفائز ${O.anomaly.winner} من 4 طرق. أؤشر على 1% من السجلات (${nf(O.anomaly.flagged)} سجل)، وهذه تهدر ×${O.anomaly.methods[0].waste} أكثر ونفادها ×${O.anomaly.methods[0].stockout} أكثر.`, `Anomaly detection: ${O.anomaly.winner} won out of 4 methods. It flags 1% of records (${nf(O.anomaly.flagged)}), which waste ×${O.anomaly.methods[0].waste} more and run out ×${O.anomaly.methods[0].stockout} more.`), [link(DASH + '#p4', t('كشف الشذوذ', 'Anomaly detection'))]);
      add(['التجميع', 'مجموعات', 'clustering', 'clusters', 'kmeans', 'k-means'],
        t(`التجميع: ${O.clustering.winner} من ${O.clustering.algorithms} خوارزميات، ${O.clustering.k} مجموعات (Silhouette ${O.clustering.silhouette}). مجموعة "مخزون عالٍ وصلاحية قصيرة" (6%) تهدر ×5.6 المتوسط.`, `Clustering: ${O.clustering.winner} out of ${O.clustering.algorithms} algorithms, ${O.clustering.k} groups (silhouette ${O.clustering.silhouette}). The "high stock, short shelf life" group (6%) wastes 5.6× the average.`));
      add(['قواعد', 'الارتباط', 'rules', 'association', 'apriori', 'fp-growth', 'fpgrowth'],
        t(`قواعد الارتباط: ${O.rules.winner} (مقابل Apriori)، ${nf(O.rules.mined)} قاعدة. أقوى قاعدة: إذا الصلاحية ≤ 5 أيام والمخزون عالٍ، فالهدر وحدتين أو أكثر في 66% من الحالات.`, `Association rules: ${O.rules.winner} (vs Apriori), ${nf(O.rules.mined)} rules. Top rule: IF shelf life ≤ 5 days AND high stock, THEN 2+ units wasted in 66% of cases.`));
      add(['التوصيه', 'افضل اجراء', 'recommendation', 'next best action', 'قائمه الصباح'],
        t(`التوصية: الطريقة القائمة على التنبؤ تعطي ${O.recommendation.picks.markdown.model} اختيارًا صحيحًا من 50 في قائمة التخفيض (القاعدة البسيطة ${O.recommendation.picks.markdown.rule}، العشوائي ${O.recommendation.picks.markdown.random}).`, `Recommendation: the model-based method gives ${O.recommendation.picks.markdown.model} right picks out of 50 on the mark-down list (simple rule ${O.recommendation.picks.markdown.rule}, random ${O.recommendation.picks.markdown.random}).`));
      add(['a/b', 'ab test', 'اختبار ab', 'تجربه ab', 'welch'],
        t(`اختبار A/B: العروض ترفع المبيعات +60% والهدر +64%. تجربة ${O.abtest.days} أيام بـ ${nf(O.abtest.records_per_group)} سجل لكل مجموعة تكفي لإثبات خفض هدر 20% (قوة 80%).`, `A/B testing: promotions lift sales +60% and waste +64%. A ${O.abtest.days}-day pilot with ${nf(O.abtest.records_per_group)} records per group is enough to prove a 20% waste cut (80% power).`));
    }
  }
  add(['العرض التقديمي', 'السلايدات', 'presentation', 'slides', 'deck'],
    t('العرض الكامل للمراحل 1–4 (63 شريحة) موجود في الموقع ويمكن تحميله PDF، ومعه عرض المرحلتين 2 و3.', 'The full Phases 1–4 deck (63 slides) is on the site and can be downloaded as a PDF, along with the Phase 2–3 deck.'), [link(SITE + '#deck', t('العرض التقديمي', 'Presentation'))]);
  add(['مرحبا', 'السلام', 'هلا', 'hello', 'hi', 'hey'],
    t('أهلًا! اسألني عن البيانات، أو أي مرحلة، أو النماذج ونتائجها، أو قرار الاستثمار.', 'Hello! Ask me about the data, any phase, the models and their results, or the investment case.'));

  /* ---------- answering ---------- */
  function answer(q) {
    const n = ' ' + norm(q) + ' ';
    for (const [key, keys] of MODEL_KEYS) if (keys.some(k => n.includes(norm(k)))) { const a = modelAnswer(key); if (a) return { a, links: [link(DASH + '#p4', t('مقارنة النماذج', 'Model comparison'))] }; }
    let best = null, bestScore = 0;
    for (const e of KB) {
      let sc = 0;
      for (const k of e.keys) if (k && n.includes(k)) sc += 1 + k.length / 6;
      if (sc > bestScore) { bestScore = sc; best = e; }
    }
    if (best) return best;
    return { a: t('ما لقيت جوابًا دقيقًا في بيانات المشروع لهذا السؤال. جرّبي تسألين عن: النماذج الفائزة، أو قرار الاستثمار، أو حجم البيانات، أو أي مرحلة، أو اسم نموذج أو عضو في الفريق.', 'I could not find a precise answer in the project data. Try asking about the winning models, the investment case, the dataset, any phase, or a model or team member by name.'), links: [] };
  }

  /* ---------- UI ---------- */
  const css = `
  .pc-fab{position:fixed;bottom:22px;inset-inline-end:22px;z-index:120;display:flex;align-items:center;gap:10px;border:0;cursor:pointer;font-family:inherit;font-weight:600;font-size:14px;color:#0F2A1E;background:#C9A24A;border-radius:999px;padding:12px 18px 12px 14px;box-shadow:0 12px 30px rgba(15,42,30,.3);transition:transform .2s}
  .pc-fab:hover{transform:translateY(-2px)}
  .pc-fab .pc-bot{display:grid;place-items:center;width:46px;height:46px;margin:-8px 0;border-radius:50%;background:#E6F0EA;box-shadow:inset 0 0 0 2px #fff;animation:pcBob 3s ease-in-out infinite}
  .pc-fab .pc-bot svg{width:40px;height:40px}
  @keyframes pcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
  @media (prefers-reduced-motion:reduce){.pc-fab .pc-bot{animation:none}}
  .pc-panel{position:fixed;bottom:86px;inset-inline-end:22px;z-index:121;width:min(400px,calc(100vw - 32px));height:min(580px,calc(100vh - 120px));background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(15,42,30,.3);display:none;flex-direction:column;overflow:hidden;border:1px solid #E2E8E4;font-family:inherit}
  .pc-panel.open{display:flex;animation:pcIn .25s ease}
  @keyframes pcIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  .pc-head{background:linear-gradient(135deg,#0F2A1E,#295F45);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px}
  .pc-head .av{width:46px;height:46px;border-radius:14px;background:#E6F0EA;display:grid;place-items:center;flex-shrink:0}
  .pc-head .av svg{width:40px;height:40px}
  .pc-head b{display:block;font-size:15px}
  .pc-head small{font-size:12px;color:#CFE0D6}
  .pc-head button{margin-inline-start:auto;background:rgba(255,255,255,.1);border:0;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px}
  .pc-body{flex:1;overflow-y:auto;padding:14px;background:#F7F9F8;display:flex;flex-direction:column;gap:10px}
  .pc-msg{max-width:88%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.7;color:#0E1A14;background:#fff;border:1px solid #E2E8E4;align-self:flex-start}
  .pc-msg.me{align-self:flex-end;background:#295F45;color:#fff;border-color:#295F45}
  .pc-msg a{display:inline-block;margin-top:6px;margin-inline-end:6px;font-size:12.5px;font-weight:600;color:#1F4D37;background:#E6F0EA;border-radius:999px;padding:3px 10px;text-decoration:none}
  .pc-sugg{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px;border-top:1px solid #E2E8E4;background:#fff}
  .pc-sugg button{font-family:inherit;font-size:12.5px;border:1px solid #E2E8E4;background:#F3F8F5;color:#1F4D37;border-radius:999px;padding:5px 11px;cursor:pointer}
  .pc-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #E2E8E4;background:#fff}
  .pc-form input{flex:1;font-family:inherit;font-size:14px;border:1px solid #E2E8E4;border-radius:12px;padding:10px 12px;outline:none}
  .pc-form input:focus{border-color:#295F45}
  .pc-form button{font-family:inherit;font-weight:600;border:0;background:#295F45;color:#fff;border-radius:12px;padding:0 16px;cursor:pointer}
  .pc-note{font-size:11px;color:#6B7A72;text-align:center;padding:0 12px 8px;background:#fff}
  @media (max-width:560px){.pc-fab span{display:none}.pc-fab{padding:14px}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
const robot = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><pattern id="pcShm" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><rect width="3" height="3" fill="#C8102E"/><rect x="3" y="3" width="3" height="3" fill="#C8102E"/></pattern></defs><path d="M10 28 Q32 2 54 28 L58 50 Q54 54 50 50 L46 32 L18 32 L14 50 Q10 54 6 50 Z" fill="url(#pcShm)" stroke="#9B0D22" stroke-width="1"/><ellipse cx="32" cy="15" rx="17" ry="4.2" fill="#1A1A1A"/><ellipse cx="32" cy="15" rx="17" ry="4.2" fill="none" stroke="#3A3A3A" stroke-width="1"/><rect x="17" y="20" width="30" height="24" rx="9" fill="#123A63"/><rect x="20" y="23" width="24" height="18" rx="7" fill="#0B2742"/><circle cx="26.5" cy="30" r="3.2" fill="#5EF2E6"/><circle cx="37.5" cy="30" r="3.2" fill="#5EF2E6"/><rect x="28" y="35.5" width="1.8" height="3.2" rx=".9" fill="#5EF2E6"/><rect x="31.1" y="34.5" width="1.8" height="4.6" rx=".9" fill="#5EF2E6"/><rect x="34.2" y="35.5" width="1.8" height="3.2" rx=".9" fill="#5EF2E6"/><rect x="29" y="45" width="6" height="3" fill="#123A63"/><rect x="22" y="48" width="20" height="12" rx="6" fill="#123A63"/><circle cx="32" cy="54" r="3" fill="#5EF2E6"/><circle cx="32" cy="54" r="1.4" fill="#0B2742"/></svg>';
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  const fab = document.createElement('button'); fab.className = 'pc-fab'; fab.setAttribute('aria-label', t('مساعد بيانات بندة', 'Panda data assistant'));
  fab.innerHTML = `<i class="pc-bot">${robot}</i><span>${t('اسأل عن المشروع', 'Ask about the project')}</span>`;
  const panel = document.createElement('div'); panel.className = 'pc-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', t('مساعد بيانات بندة', 'Panda data assistant'));
  const SUG = [t('مين النموذج الفائز؟', 'Which model won?'), t('كم نوفر لو استثمرنا؟', 'How much would we save?'), t('كم حجم البيانات؟', 'How big is the data?'), t('وش أفضل نموذج من الفريق؟', 'Best team model?'), t('وش الخطة الجاية؟', 'What is the plan?'), t('وش يسبب النفاد؟', 'What drives stockouts?')];
  panel.innerHTML = `<div class="pc-head"><span class="av">${robot}</span><div><b>${t('بندوي · مساعد بيانات بندة', 'Bandawi · Panda data assistant')}</b><small>${t('يجاوب من بيانات المشروع ونتائجه', 'Answers from the project’s data and results')}</small></div><button aria-label="${t('إغلاق', 'Close')}">✕</button></div>
    <div class="pc-body" aria-live="polite"></div>
    <div class="pc-sugg">${SUG.map(s => `<button>${s}</button>`).join('')}</div>
    <form class="pc-form"><input type="text" placeholder="${t('اكتب سؤالك…', 'Type your question…')}" aria-label="${t('سؤالك', 'Your question')}" autocomplete="off"><button type="submit">${t('إرسال', 'Send')}</button></form>
    <div class="pc-note">${t('الإجابات من بيانات المشروع فقط، ولا يُرسل أي شيء خارج الصفحة.', 'Answers come from the project data only; nothing leaves this page.')}</div>`;
  document.body.append(fab, panel);
  const body = panel.querySelector('.pc-body'), input = panel.querySelector('input');
  const say = (html, me, links) => {
    const m = document.createElement('div'); m.className = 'pc-msg' + (me ? ' me' : '');
    if (me) m.textContent = html; else m.innerHTML = html + (links && links.length ? '<br>' + links.map(l => `<a href="${l.href}">${l.label}</a>`).join('') : '');
    body.appendChild(m); body.scrollTop = body.scrollHeight;
  };
  const ask = q => { q = q.trim(); if (!q) return; say(q, true); const r = answer(q); setTimeout(() => say(r.a, false, r.links), 180); };
  let greeted = false;
  const toggle = open => {
    panel.classList.toggle('open', open);
    if (open && !greeted) { greeted = true; say(t('أهلًا! أنا مساعد بيانات مشروع بندة. اسألني عن البيانات، أو المراحل، أو النماذج ونتائجها، أو قرار الاستثمار.', 'Hi! I am the Panda project data assistant. Ask me about the data, the phases, the models and their results, or the investment case.')); }
    if (open) input.focus();
  };
  fab.onclick = () => toggle(!panel.classList.contains('open'));
  panel.querySelector('.pc-head button').onclick = () => toggle(false);
  panel.querySelectorAll('.pc-sugg button').forEach(b => b.onclick = () => ask(b.textContent));
  panel.querySelector('form').onsubmit = e => { e.preventDefault(); ask(input.value); input.value = ''; };
  body.addEventListener('click', e => { const a = e.target.closest('a'); if (a && onDash && a.getAttribute('href').startsWith(DASH + '#')) { e.preventDefault(); location.hash = a.getAttribute('href').split('#')[1]; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) toggle(false); });
  window.PANDA_ASK = answer; /* for testing */
})();
