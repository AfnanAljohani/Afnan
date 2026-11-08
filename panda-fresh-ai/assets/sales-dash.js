/* PANDA · Sales & Operations dashboard (interactive, in the style of the team's Tableau dashboard).
   Data: window.PANDA_SAMPLE (data/sample.js, 10,000-record sample). 2026 is compared with the previous year (2025). */
(function () {
  'use strict';
  const S = window.PANDA_SAMPLE;
  if (!S || typeof show !== 'function' || typeof mk !== 'function') return;
  const AR = (document.documentElement.lang || 'ar').startsWith('ar');
  const t = (ar, en) => AR ? ar : en;
  const M = S.meta, N = S.meta.rows;
  const nf = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sar = v => v >= 1e6 ? 'SAR ' + nf(v / 1e6, 2) + 'M' : v >= 1e3 ? 'SAR ' + nf(v / 1e3, 1) + 'K' : 'SAR ' + nf(v);
  const GREEN = '#2E9E4F', RED = '#D9534F', GREY = '#D5DBD7', INK = '#44524A';
  const CAT = { Produce: t('خضار وفواكه', 'Produce'), Dairy: t('ألبان', 'Dairy'), Bakery: t('مخبوزات', 'Bakery'), Meat: t('لحوم', 'Meat'), Frozen: t('مجمدات', 'Frozen'), Grocery: t('بقالة', 'Grocery') };
  const REG = { Central: [t('الوسطى', 'Central'), 24.7, 46.7], Eastern: [t('الشرقية', 'Eastern'), 26.4, 49.9], Western: [t('الغربية', 'Western'), 21.5, 39.6], Northern: [t('الشمالية', 'Northern'), 28.6, 38.0], Southern: [t('الجنوبية', 'Southern'), 18.4, 43.2] };
  const MON = AR ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---------- styles ---------- */
  const st = document.createElement('style');
  st.textContent = `
  .sd{display:grid;grid-template-columns:220px 1fr;gap:16px}
  .sd-rail{background:#F1F6F2;border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:16px;align-self:start;position:sticky;top:16px}
  .sd-logo{display:flex;flex-direction:column;align-items:center;gap:6px;padding-bottom:12px;border-bottom:1px solid var(--line)}
  .sd-logo .lg{display:flex;align-items:center;gap:8px}
  .sd-logo img{height:34px;width:auto}
  .sd-logo small{font-size:11.5px;color:var(--ink-3);letter-spacing:.06em}
  .sd-rail label{display:flex;flex-direction:column;gap:6px;font-size:12.5px;font-weight:600;color:var(--ink-2)}
  .sd-rail select{font-family:inherit;font-size:14px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:#fff}
  .sd-seg{display:flex;flex-wrap:wrap;gap:6px}
  .sd-seg button{font-family:inherit;font-size:12.5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 11px;cursor:pointer;color:var(--ink-2)}
  .sd-seg button.on{background:var(--green-600);border-color:var(--green-600);color:#fff}
  .sd-rail .lg2{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--ink-2)}
  .sd-rail .lg2 i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-inline-end:6px;vertical-align:-1px}
  .sd-reset{font-family:inherit;font-size:13px;font-weight:600;border:0;border-radius:10px;padding:9px;background:var(--green-600);color:#fff;cursor:pointer}
  .sd-title{display:flex;align-items:center;justify-content:center;gap:10px;font-size:20px;margin:0 0 14px;color:#1F4D37}
  .sd-title b{color:#0F5132}.sd-title span{color:${RED}}
  .sd-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:14px}
  .sd-k{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:var(--shadow);text-align:end}
  .sd-k h4{margin:0;font-size:14px;color:${GREEN};font-weight:600}
  .sd-k b{display:block;font-size:26px;line-height:1.25;color:#1B1F1D;direction:ltr}
  .sd-k small{font-size:12.5px;color:var(--ink-3);direction:ltr;display:block}
  .sd-k small em{font-style:normal;font-weight:700}
  .sd-k small em.up{color:${GREEN}}.sd-k small em.dn{color:${RED}}
  .sd-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:14px}
  .sd-p{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow);min-width:0}
  .sd-p h3{margin:0 0 2px;font-size:18px;color:${GREEN};font-weight:600}
  .sd-p h3 span{color:${RED}}.sd-p h3 em{font-style:normal;color:#1B1F1D}
  .sd-p .big{font-size:24px;font-weight:700;direction:ltr;text-align:end;margin:2px 0 6px}
  .sd-p .big small{font-size:14px;font-weight:600;color:var(--ink-2)}
  .sd-p .cv{position:relative;height:250px}
  .sd-map{height:290px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#EEF2EF}
  .sd-note{font-size:12px;color:var(--ink-3);margin:12px 0 0}
  .leaflet-container{font-family:inherit}
  .sd-map .leaflet-tile-pane{filter:grayscale(1) brightness(1.06) contrast(.88)}
  .sd-tip{font-size:12.5px;line-height:1.5}
  @media (max-width:1200px){.sd-kpis{grid-template-columns:repeat(3,1fr)}}
  @media (max-width:1000px){.sd{grid-template-columns:1fr}.sd-rail{position:static}.sd-grid{grid-template-columns:1fr}}
  @media (max-width:600px){.sd-kpis{grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(st);

  /* ---------- view ---------- */
  const el = h => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; };
  const btn = el(`<button data-v="sales"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="12" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/></svg>${t('المبيعات والعمليات', 'Sales & Operations')} <span style="font-size:10px;font-weight:700;background:#C9A24A;color:#0F2A1E;border-radius:999px;padding:1px 7px">NEW</span></button>`);
  btn.onclick = () => show('sales');
  document.querySelector('#tabs button[data-v="overview"]').after(btn);
  const v = el(`<section class="view" id="sales" style="padding:0">
    <div class="sd">
      <aside class="sd-rail">
        <div class="sd-logo"><span class="lg"><img src="assets/panda-icon.png" alt="" style="height:30px"><img src="assets/panda.png" alt="Panda"></span><small>SALES &amp; OPERATIONS</small></div>
        <label>${t('الفئة', 'Category')}<select id="sdCat"><option value="">${t('الكل', 'All')}</option>${M.categories.map((c, i) => `<option value="${i}">${CAT[c]}</option>`).join('')}</select></label>
        <label>${t('المنطقة', 'Region')}<select id="sdReg"><option value="">${t('الكل', 'All')}</option>${M.regions.map((r, i) => `<option value="${i}">${REG[r][0]}</option>`).join('')}</select></label>
        <label>${t('الشهر', 'Select month')}<select id="sdMon"><option value="">${t('كل السنة', 'Full year')}</option>${MON.map((m, i) => `<option value="${i}">${m}</option>`).join('')}</select></label>
        <div><label style="margin-bottom:6px">${t('العروض', 'Promotion')}</label><div class="sd-seg" id="sdPro"><button class="on" data-p="">${t('الكل', 'All')}</button><button data-p="1">${t('مع عرض', 'With')}</button><button data-p="0">${t('بدون', 'Without')}</button></div></div>
        <div class="lg2"><b style="font-size:12.5px">${t('مقابل السنة السابقة', 'vs previous year')}</b><span><i style="background:${GREEN}"></i>${t('أفضل', 'Better')}</span><span><i style="background:${RED}"></i>${t('أسوأ', 'Worse')}</span></div>
        <button class="sd-reset" id="sdReset">${t('إعادة ضبط الفلاتر', 'Reset filters')}</button>
      </aside>
      <div>
        <h2 class="sd-title"><b>PANDA</b><span>|</span>${t('لوحة المبيعات والعمليات', 'Sales &amp; Operations Dashboard')}</h2>
        <div class="sd-kpis" id="sdK"></div>
        <div class="sd-grid">
          <div class="sd-p"><h3>${t('قيمة المبيعات', 'Total Sales Value')} <em>|</em> <span id="sdMonLbl"></span></h3><div class="big" id="sdBig"></div><div class="cv"><canvas id="sdMonth"></canvas></div></div>
          <div class="sd-p"><h3>${t('العروض', 'Promotion')} <em>${t('مقابل', 'vs')}</em> <span>${t('المبيعات العادية', 'Regular Sales')}</span></h3><div class="cv" style="height:290px"><canvas id="sdDonut"></canvas></div></div>
          <div class="sd-p"><h3><span>${t('المبيعات', 'Sales')}</span> <em>${t('حسب', 'by')}</em> ${t('المنطقة', 'Region')}</h3><div class="sd-map" id="sdMap"></div></div>
          <div class="sd-p"><h3><span>${t('معدل النفاد', 'Stockout Rate')}</span> <em>${t('حسب', 'by')}</em> ${t('الفئة', 'Category')}</h3><div class="cv" style="height:290px"><canvas id="sdCatC"></canvas></div></div>
        </div>
        <p class="sd-note">${t('المصدر: عينة من 10,000 سجل (1%) من بيانات بندة الأكاديمية · 2026 مقارنة بـ 2025 · القيم بالريال للعينة فقط.', 'Source: a 10,000-record (1%) sample of the academic Panda data · 2026 vs 2025 · SAR values are for the sample only.')}</p>
      </div>
    </div></section>`);
  document.getElementById('overview').after(v);

  /* ---------- state + aggregation ---------- */
  const F = { c: '', r: '', m: '', p: '' };
  const pass = (i, yr) => Math.floor(S.m[i] / 12) === yr && (F.c === '' || S.c[i] == F.c) && (F.r === '' || S.r[i] == F.r) && (F.p === '' || S.p[i] == F.p);
  const inMonth = i => F.m === '' || S.m[i] % 12 == F.m;
  function agg(yr, monthOnly = true) {
    const a = { v: 0, u: 0, w: 0, s: 0, n: 0, pv: 0, byM: new Array(12).fill(0), byR: new Array(M.regions.length).fill(0), sC: new Array(M.categories.length).fill(0), nC: new Array(M.categories.length).fill(0) };
    for (let i = 0; i < N; i++) {
      if (!pass(i, yr)) continue;
      a.byM[S.m[i] % 12] += S.v[i];
      if (monthOnly && !inMonth(i)) continue;
      a.v += S.v[i]; a.u += S.u[i]; a.w += S.w[i]; a.s += S.s[i]; a.n++; if (S.p[i]) a.pv += S.v[i];
      a.byR[S.r[i]] += S.v[i]; a.sC[S.c[i]] += S.s[i]; a.nC[S.c[i]]++;
    }
    return a;
  }
  const chg = (cy, py) => py ? (cy / py - 1) * 100 : 0;
  const kpi = (title, val, delta, unit, goodUp) => {
    const good = goodUp ? delta >= 0 : delta <= 0;
    return `<div class="sd-k"><h4>${title}</h4><b>${val}</b><small><em class="${good ? 'up' : 'dn'}">${delta >= 0 ? '+' : ''}${nf(delta, unit === 'pp' ? 2 : 1)}${unit === 'pp' ? ' pp' : '%'}</em> vs. PY</small></div>`;
  };

  let map = null, layer = null;
  function draw() {
    const cy = agg(1), py = agg(0);
    const sr = a => a.n ? a.s / a.n * 100 : 0, ps = a => a.v ? a.pv / a.v * 100 : 0;
    document.getElementById('sdK').innerHTML =
      kpi(t('إجمالي المبيعات', 'Total Sales'), sar(cy.v), chg(cy.v, py.v), '%', true) +
      kpi(t('كمية الهدر', 'Waste Qty'), nf(cy.w), chg(cy.w, py.w), '%', false) +
      kpi(t('معدل النفاد', 'Stockout Rate'), nf(sr(cy), 1) + '%', sr(cy) - sr(py), 'pp', false) +
      kpi(t('حصة مبيعات العروض', 'Promotion Sales Share'), nf(ps(cy), 1) + '%', ps(cy) - ps(py), 'pp', true) +
      kpi(t('الوحدات المباعة', 'Unit Sales'), nf(cy.u), chg(cy.u, py.u), '%', true);
    const mLbl = F.m === '' ? t('2026 كاملة', 'Full 2026') : MON[F.m];
    document.getElementById('sdMonLbl').textContent = mLbl;
    const d = chg(cy.v, py.v);
    document.getElementById('sdBig').innerHTML = `${sar(cy.v)} <small style="color:${d >= 0 ? GREEN : RED}">${d >= 0 ? '+' : ''}${nf(d, 1)}%</small> <small>vs. PY</small>`;
    /* monthly bars: selected month green/red vs PY, others grey */
    const pyM = agg(0, false).byM;
    const colors = cy.byM.map((x, i) => (F.m === '' || i == F.m) ? (x >= pyM[i] ? GREEN : RED) : GREY);
    const ch = mk('sdMonth', { type: 'bar', data: { labels: MON, datasets: [{ label: '2026', data: cy.byM, backgroundColor: colors, maxBarThickness: 34 }, { label: '2025', data: pyM, type: 'line', borderColor: '#8A9590', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, tension: .3 }] },
      options: { onClick: (e, els) => { if (els.length) { const i = els[0].index; F.m = F.m == i ? '' : String(i); document.getElementById('sdMon').value = F.m; draw(); } },
        scales: { x: { grid: { display: false }, ticks: { color: INK } }, y: { beginAtZero: true, ticks: { callback: v => nf(v / 1000) + 'K' } } },
        plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 11 } } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${sar(c.raw)}` } } } } });
    mk('sdDonut', { type: 'doughnut', data: { labels: [t('مع عرض', 'Promotion'), t('بدون عرض', 'Regular')], datasets: [{ data: [cy.pv, cy.v - cy.pv], backgroundColor: [GREEN, RED], borderColor: '#fff', borderWidth: 3 }] },
      options: { cutout: '72%', plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${sar(c.raw)} (${nf(c.raw / cy.v * 100, 1)}%)` } } } },
      plugins: [{ id: 'center', afterDraw(c) { const { ctx, chartArea: a } = c; ctx.save(); ctx.font = '700 20px "IBM Plex Sans Arabic",sans-serif'; ctx.fillStyle = '#1B1F1D'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sar(cy.v), (a.left + a.right) / 2, (a.top + a.bottom) / 2); ctx.restore(); } }] });
    const rates = M.categories.map((c, i) => cy.nC[i] ? cy.sC[i] / cy.nC[i] * 100 : 0);
    const mx = Math.max(...rates);
    mk('sdCatC', { type: 'bar', data: { labels: M.categories.map(c => CAT[c]), datasets: [{ data: rates, backgroundColor: rates.map(r => r === mx ? RED : '#C9D2CD'), maxBarThickness: 20 }] },
      options: { indexAxis: 'y', layout: { padding: { right: 46 } }, onClick: (e, els) => { if (els.length) { const i = els[0].index; F.c = F.c == i ? '' : String(i); document.getElementById('sdCat').value = F.c; draw(); } },
        scales: { x: { beginAtZero: true, ticks: { callback: v => v + '%' } }, y: { grid: { display: false }, ticks: { color: INK } } }, plugins: { valueLabels: { enabled: true, format: v => nf(v, 1) + '%' } } } });
    drawMap(cy, agg(0));
  }

  function drawMap(cy, py) {
    const box = document.getElementById('sdMap');
    if (!window.L) { box.innerHTML = `<p style="padding:14px;font-size:13px;color:var(--ink-3)">${t('جاري تحميل الخريطة…', 'Loading map…')}</p>`; return; }
    if (!map) {
      map = L.map(box, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([24.2, 44.5], 4.6);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 10 }).addTo(map);
    }
    if (layer) layer.remove();
    layer = L.layerGroup().addTo(map);
    const max = Math.max(...cy.byR, 1);
    const g = M.regions.map((r, i) => chg(cy.byR[i], py.byR[i]));
    const hi = Math.max(...g), lo = Math.min(...g);
    M.regions.forEach((r, i) => {
      const [name, lat, lon] = REG[r];
      const col = g[i] === hi ? '#1E7B3A' : g[i] === lo ? '#B2182B' : g[i] >= 0 ? '#7BC47F' : '#F4A3A0';
      L.circleMarker([lat, lon], { radius: 10 + 22 * Math.sqrt(cy.byR[i] / max), color: '#fff', weight: 2, fillColor: col, fillOpacity: .85 })
        .bindTooltip(`<div class="sd-tip"><b>${name}</b><br>${sar(cy.byR[i])}<br>${g[i] >= 0 ? '+' : ''}${nf(g[i], 1)}% vs. PY</div>`, { direction: 'top' })
        .on('click', () => { F.r = F.r == i ? '' : String(i); document.getElementById('sdReg').value = F.r; draw(); })
        .addTo(layer);
    });
    setTimeout(() => map.invalidateSize(), 50);
  }

  function loadLeaflet(cb) {
    if (window.L) return cb();
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; js.onload = cb; js.onerror = cb; document.head.appendChild(js);
  }

  /* ---------- controls ---------- */
  const bind = (id, key) => document.getElementById(id).onchange = e => { F[key] = e.target.value; draw(); };
  bind('sdCat', 'c'); bind('sdReg', 'r'); bind('sdMon', 'm');
  document.querySelectorAll('#sdPro button').forEach(b => b.onclick = () => { document.querySelectorAll('#sdPro button').forEach(x => x.classList.toggle('on', x === b)); F.p = b.dataset.p; draw(); });
  document.getElementById('sdReset').onclick = () => { Object.keys(F).forEach(k => F[k] = ''); ['sdCat', 'sdReg', 'sdMon'].forEach(id => document.getElementById(id).value = ''); document.querySelectorAll('#sdPro button').forEach((x, i) => x.classList.toggle('on', i === 0)); draw(); };

  let started = false;
  const _show = window.show;
  window.show = function (vw) { _show(vw); if (vw === 'sales') { if (!started) { started = true; draw(); loadLeaflet(() => draw()); } else if (map) setTimeout(() => map.invalidateSize(), 50); } };
  const route = () => { if (location.hash.slice(1) === 'sales') window.show('sales'); };
  addEventListener('hashchange', route); route();
})();
