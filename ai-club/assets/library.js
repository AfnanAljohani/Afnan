/* «المكتبة الرقمية» page: search, filters and "load more" over library_items.
 * Reads published rows only (RLS). All feed text is rendered with textContent
 * semantics (escaped); only https links are used. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var https = function (u) { try { var x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } };
  var PAGE = 12;
  var TYPE = { news: 'خبر', article: 'مقال', research: 'بحث', learning: 'مصدر تعليمي' };
  var LANG = { ar: 'العربية', en: 'الإنجليزية' };
  var EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  var fmt = function (iso, withTime) {
    if (!iso) return '';
    var o = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' };
    if (withTime) { o.hour = 'numeric'; o.minute = '2-digit'; }
    try { return new Date(iso).toLocaleString('ar-SA-u-ca-gregory-nu-latn', o); } catch (e) { return iso.slice(0, 10); }
  };

  /* theme + mobile menu (same storage key as the home page) */
  var root = document.documentElement;
  var moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  var sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var setTheme = function (t) { root.dataset.theme = t; $('#themeIco').innerHTML = t === 'dark' ? moon : sun; try { localStorage.setItem('aiclub-theme', t); } catch (e) {} };
  setTheme(root.dataset.theme || 'dark');
  $('#themeBtn').onclick = function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); };
  $('#menuBtn').onclick = function () { var o = $('#navLinks').classList.toggle('open'); this.setAttribute('aria-expanded', o); };

  var state = { cat: 'all', q: '', type: '', days: '', lang: '', offset: 0, total: null };
  var sb = null, cats = {}, reqId = 0;
  var grid = $('#libGrid'), more = $('#libMore'), count = $('#libCount');

  function status(kind, text) { var s = $('#libStatus'); s.className = 'lib-status ' + (kind || ''); $('span', s).textContent = text; }

  function card(it) {
    var url = https(it.url), img = it.image_url && https(it.image_url);
    var cat = cats[it.category];
    var tags = '<span>' + esc(TYPE[it.content_type] || it.content_type) + '</span>' +
      (cat ? '<span>' + esc(cat) + '</span>' : '') +
      (it.is_saudi ? '<span class="sa">السعودية</span>' : '') +
      '<span>' + esc(LANG[it.language] || it.language) + '</span>';
    var summary = it.summary_ar
      ? '<p class="sum">' + (it.summary_is_ai ? '<span class="ai-tag" title="ملخص أنشأه نموذج ذكاء اصطناعي من عنوان المادة ومقتطفها">ملخص آلي</span>' : '') + esc(it.summary_ar) + '</p>'
      : (it.excerpt ? '<p class="orig"' + (it.language === 'en' ? ' dir="ltr" lang="en"' : '') + '>' + esc(it.excerpt) + '</p>' : '');
    var media = img
      ? '<img src="' + esc(img) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">'
      : '';
    return '<article class="lcard">' +
      '<div class="lcard-img"><div class="lcard-ph" aria-hidden="true"><b>' + esc(it.source_name) + '</b></div>' + media + '</div>' +
      '<div class="lcard-body">' +
        '<div class="lcard-tags">' + tags + '</div>' +
        '<h3' + (it.language === 'en' ? ' dir="ltr" lang="en" style="text-align:right"' : '') + '><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(it.title) + '</a></h3>' +
        summary +
        '<div class="lcard-meta">' +
          '<span>المصدر: ' + esc(it.source_name) + ' · تاريخ النشر: ' + (it.published_at ? esc(fmt(it.published_at)) : 'غير مذكور في المصدر') + '</span>' +
          '<span>أُضيف للمكتبة: ' + esc(fmt(it.fetched_at)) + '</span>' +
          '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">اقرأ المادة الأصلية ' + EXT + '<span class="sr-only"> (يفتح في تبويب جديد)</span></a>' +
        '</div>' +
      '</div></article>';
  }

  function query() {
    var q = sb.from('library_items')
      .select('id,title,url,source_name,excerpt,summary_ar,summary_is_ai,language,category,content_type,is_saudi,image_url,published_at,fetched_at', { count: 'exact' })
      .eq('status', 'published');
    if (state.cat === 'saudi') q = q.eq('is_saudi', true);
    else if (state.cat !== 'all') q = q.eq('category', state.cat);
    if (state.type) q = q.eq('content_type', state.type);
    if (state.lang) q = q.eq('language', state.lang);
    if (state.days) q = q.gte('published_at', new Date(Date.now() - (+state.days) * 864e5).toISOString());
    var words = state.q.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(function (w) { return w.length > 1; }).slice(0, 6);
    if (words.length) q = q.textSearch('search', words.map(function (w) { return w + ':*'; }).join(' & '), { config: 'simple' });
    return q.order('published_at', { ascending: false, nullsFirst: false }).order('fetched_at', { ascending: false })
      .range(state.offset, state.offset + PAGE - 1);
  }

  function load(append) {
    var id = ++reqId;
    if (!append) { state.offset = 0; grid.setAttribute('aria-busy', 'true'); }
    more.disabled = true;
    query().then(function (r) {
      if (id !== reqId) return;
      grid.setAttribute('aria-busy', 'false'); more.disabled = false;
      if (r.error) {
        if (!append) grid.innerHTML = '<div class="lib-empty"><b>تعذّر تحميل المكتبة الآن</b>أعد تحميل الصفحة بعد قليل.</div>';
        return;
      }
      state.total = r.count || 0;
      var html = r.data.map(card).join('');
      if (append) grid.insertAdjacentHTML('beforeend', html);
      else grid.innerHTML = html || '<div class="lib-empty"><b>لا توجد مواد مطابقة</b>جرّب كلمة بحث أخرى أو أزل بعض عوامل التصفية.</div>';
      state.offset += r.data.length;
      more.hidden = state.offset >= state.total;
      count.textContent = state.total ? state.total + ' مادة' : '';
    });
  }

  function bindFilters() {
    var t;
    $('#libQ').addEventListener('input', function () { clearTimeout(t); var v = this.value.trim(); t = setTimeout(function () { state.q = v; load(false); }, 280); });
    $('#libType').onchange = function () { state.type = this.value; load(false); };
    $('#libDate').onchange = function () { state.days = this.value; load(false); };
    $('#libLang').onchange = function () { state.lang = this.value; load(false); };
    more.onclick = function () { load(true); };
    $('#libTabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('#libTabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      state.cat = b.dataset.cat; load(false);
      try { history.replaceState(null, '', b.dataset.cat === 'all' ? 'library' : 'library#' + b.dataset.cat); } catch (er) {}
    });
  }

  function showSources() {
    sb.from('library_sources').select('name,site_url').eq('enabled', true).order('name').then(function (r) {
      if (r.error || !r.data.length) return;
      $('#libSources').innerHTML = 'المصادر الحالية: <ul>' + r.data.map(function (s) {
        var u = https(s.site_url); return '<li>' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + '</a>' : esc(s.name)) + '</li>';
      }).join('') + '</ul>';
    });
  }

  EWA.client().then(function (client) {
    sb = client;
    if (!sb) {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '<div class="lib-empty"><b>المكتبة غير متصلة بقاعدة البيانات بعد</b>تظهر المواد هنا بعد ربط الموقع بقاعدة البيانات وتشغيل أول تحديث.</div>';
      status('warn', 'لم يتم ربط قاعدة البيانات بعد');
      return;
    }
    Promise.all([
      sb.from('library_categories').select('slug,name_ar').eq('status', 'published').order('sort_order'),
      sb.from('library_runs').select('finished_at').eq('ok', true).order('finished_at', { ascending: false }).limit(1),
    ]).then(function (rs) {
      var c = rs[0].data || [];
      c.forEach(function (x) { cats[x.slug] = x.name_ar; });
      $('#libTabs').insertAdjacentHTML('beforeend', c.filter(function (x) { return x.slug !== 'general'; }).map(function (x) {
        return '<button type="button" aria-pressed="false" data-cat="' + esc(x.slug) + '">' + esc(x.name_ar) + '</button>';
      }).join(''));
      var last = rs[1].data && rs[1].data[0];
      if (last) status('ok', 'آخر تحديث ناجح: ' + fmt(last.finished_at, true) + ' (بتوقيت الرياض)');
      else status('warn', 'لم يكتمل أي تحديث للمكتبة بعد');
      var want = decodeURIComponent(location.hash.slice(1));
      var start = want && $('#libTabs button[data-cat="' + CSS.escape(want) + '"]');
      bindFilters();
      if (start) start.click(); else load(false);
      showSources();
      // in-page links such as library#saudi
      addEventListener('hashchange', function () {
        var b = $('#libTabs button[data-cat="' + CSS.escape(decodeURIComponent(location.hash.slice(1)) || 'all') + '"]');
        if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
      });
    });
  });
})();
