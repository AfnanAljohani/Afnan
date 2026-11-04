/* EWA AI Club — admin panel (/admin).
 * Sign-in: Supabase Auth (email + password). Authorization: every read of
 * drafts and every write is checked by Row Level Security against
 * private.admins — hiding this page or its buttons is not the protection.
 * No secret keys reach this page; server work goes through /api/admin/*. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var sb = null, session = null, cats = [];

  /* ---------------- helpers ---------------- */
  function toast(text, kind) {
    var t = $('#apToast'); t.textContent = text; t.className = 'ap-toast show ' + (kind || '');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = 'ap-toast'; }, 4200);
  }
  function errText(e) {
    if (!e) return 'حدث خطأ غير متوقع.';
    if (e.code === '42501' || /row-level security|permission denied/i.test(e.message || '')) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
    if (e.code === '23505') return 'هذا العنصر موجود مسبقًا (قيمة مكررة).';
    if (e.code === '23514') return 'بعض القيم غير مقبولة. راجع الروابط والحقول المطلوبة.';
    if (/JWT|session/i.test(e.message || '')) return 'انتهت الجلسة. سجّل الدخول مرة أخرى.';
    return 'تعذّر الحفظ: ' + String(e.message || e).slice(0, 140);
  }
  var fmt = function (iso, time) {
    if (!iso) return '—';
    var o = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Riyadh' };
    if (time) { o.hour = 'numeric'; o.minute = '2-digit'; }
    try { return new Date(iso).toLocaleString('ar-SA-u-ca-gregory-nu-latn', o); } catch (e) { return iso; }
  };
  var STATUS = { draft: 'مسودة', published: 'منشور', hidden: 'مخفي' };
  var pill = function (s) { return '<span class="ap-pill st-' + esc(s) + '">' + esc(STATUS[s] || s) + '</span>'; };
  var isHttps = function (u) { try { return new URL(u).protocol === 'https:'; } catch (e) { return false; } };
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ Authorization: 'Bearer ' + (session && session.access_token) }, opts.headers || {});
    return fetch(path, opts).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw Object.assign(new Error((j.error && j.error.code) || ('HTTP ' + r.status)), { status: r.status }); return j; }); });
  }

  /* same URL normalization as the server (api/_lib/text.js) so manual items dedupe correctly */
  function normalizeUrl(u) {
    var url; try { url = new URL(String(u).trim()); } catch (e) { return null; }
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    url.hash = ''; url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    Array.from(url.searchParams.keys()).forEach(function (k) { if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$|ref_src$|cmpid$)/i.test(k)) url.searchParams.delete(k); });
    url.searchParams.sort();
    var out = url.toString(); if (out.endsWith('/') && url.pathname !== '/') out = out.slice(0, -1);
    return out;
  }
  function sha256(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    });
  }

  /* ---------------- uploads ---------------- */
  var UPLOAD = {
    image: { types: ['image/webp', 'image/png', 'image/jpeg', 'image/avif'], max: 8 * 1024 * 1024, label: 'صورة (WebP / PNG / JPG حتى 8MB)' },
    video: { types: ['video/mp4', 'video/webm'], max: 50 * 1024 * 1024, label: 'فيديو (MP4 / WebM حتى 50MB)' },
    vtt: { types: ['text/vtt'], max: 512 * 1024, label: 'ملف ترجمة WebVTT (.vtt)' },
  };
  function compressImage(file) {
    // re-encode to WebP, max 1600px wide; keeps the original if that is smaller
    return new Promise(function (ok) {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return ok(file);
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, 1600 / img.naturalWidth), c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) { ok(b && b.size < file.size ? new File([b], 'image.webp', { type: 'image/webp' }) : file); }, 'image/webp', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ok(file); };
      img.src = url;
    });
  }
  function upload(kind, folder, file) {
    var rule = UPLOAD[kind];
    var type = file.type || (/\.vtt$/i.test(file.name) ? 'text/vtt' : '');
    if (rule.types.indexOf(type) < 0) return Promise.reject(new Error('نوع الملف غير مسموح. المسموح: ' + rule.label));
    if (file.size > rule.max) return Promise.reject(new Error('حجم الملف أكبر من المسموح (' + Math.round(rule.max / 1048576) + 'MB).'));
    return (kind === 'image' ? compressImage(file) : Promise.resolve(file)).then(function (f) {
      var ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'text/vtt': 'vtt' }[f.type || type];
      var path = folder + '/' + new Date().toISOString().slice(0, 7) + '/' + crypto.randomUUID() + '.' + ext;
      return sb.storage.from('media').upload(path, f, { contentType: f.type || type, cacheControl: '604800', upsert: false }).then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
      });
    });
  }

  /* ---------------- field definitions ---------------- */
  var statusField = { k: 'status', label: 'الحالة', type: 'select', options: [['draft', 'مسودة'], ['published', 'منشور'], ['hidden', 'مخفي']], def: 'draft' };
  var sortField = { k: 'sort_order', label: 'الترتيب (الأصغر أولًا)', type: 'number', def: 100 };
  var TYPES = [['news', 'خبر'], ['article', 'مقال'], ['research', 'بحث'], ['learning', 'مصدر تعليمي']];

  var TABLES = {
    content: {
      table: 'content_items', title: 'title',
      fields: function (row) {
        var kind = (row && row.kind) || currentKind;
        var f = [{ k: 'title', label: 'العنوان', type: 'text', req: true, max: 200 }];
        if (kind === 'news') f.push(
          { k: 'body', label: 'النص', type: 'textarea', max: 2000 },
          { k: 'date_label', label: 'شارة البطاقة', type: 'select', options: [['', 'تاريخ الخبر (أو «قريبًا» إن لم يُحدَّد)'], ['open', 'التسجيل مفتوح']], def: '' },
          { k: 'event_date', label: 'تاريخ الخبر', type: 'date' },
          { k: 'link_url', label: 'رابط «التفاصيل» (https:// أو #قسم)', type: 'link' });
        else f.push(
          { k: 'event_type', label: 'النوع', type: 'select', options: [['ورشة', 'ورشة'], ['لقاء', 'لقاء'], ['معسكر', 'معسكر']], def: 'ورشة' },
          { k: 'event_date', label: 'الموعد', type: 'date', req: true },
          { k: 'place', label: 'المكان', type: 'text', max: 120, def: 'الأكاديمية' },
          { k: 'duration', label: 'المدة (اختياري)', type: 'text', max: 60 },
          { k: 'tags', label: 'الوسوم (افصل بفاصلة)', type: 'tags' });
        f.push({ k: 'image_url', label: 'الصورة', type: 'image', folder: kind === 'news' ? 'news' : 'events' }, statusField, sortField);
        return f;
      },
      filter: function (q) { return q.eq('kind', currentKind); },
      order: [['sort_order', true], ['event_date', true]],
      extra: function (r) { return r.kind === 'event' ? (r.event_type || '') + ' · ' + (r.event_date || 'بدون تاريخ') : (r.event_date || (r.date_label === 'open' ? 'التسجيل مفتوح' : 'قريبًا')); },
      defaults: function () { return { kind: currentKind }; },
    },
    projects: {
      table: 'projects', title: 'title',
      fields: function () {
        return [
          { k: 'title', label: 'اسم المشروع', type: 'text', req: true, max: 160 },
          { k: 'author', label: 'إعداد وتطوير', type: 'text', req: true, max: 120 },
          { k: 'description', label: 'وصف مختصر (اكتب ما يفعله المشروع فعلًا)', type: 'textarea', req: true, max: 1200 },
          { k: 'url', label: 'رابط المشروع (https://)', type: 'url', req: true },
          { k: 'cover_url', label: 'صورة الغلاف', type: 'image', folder: 'projects' },
          { k: 'cover_is_screenshot', label: 'الصورة لقطة شاشة حقيقية من المشروع', type: 'check' },
          { k: 'tags', label: 'التقنيات / الوسوم (افصل بفاصلة)', type: 'tags' },
          { k: 'slug', label: 'المعرّف في الرابط (حروف إنجليزية صغيرة وأرقام و-)', type: 'text', max: 60, pattern: '^[a-z0-9-]{2,60}$' },
          statusField, sortField,
        ];
      },
      order: [['sort_order', true]],
      extra: function (r) { return r.author + ' · ' + (function () { try { return new URL(r.url).host; } catch (e) { return ''; } })(); },
      beforeSave: function (v) { if (!v.slug) v.slug = 'p-' + crypto.randomUUID().slice(0, 8); return v; },
    },
    chatbot_knowledge: {
      table: 'chatbot_knowledge', title: 'title',
      fields: function () {
        return [
          { k: 'title', label: 'العنوان', type: 'text', req: true, max: 160 },
          { k: 'body', label: 'المعلومة المعتمدة (يجيب منها المساعد كما هي)', type: 'textarea', req: true, max: 4000 },
          { k: 'lang', label: 'اللغة', type: 'select', options: [['ar', 'العربية'], ['en', 'English']], def: 'ar' },
          { k: 'tags', label: 'كلمات مفتاحية (افصل بفاصلة)', type: 'tags' },
          statusField, sortField,
        ];
      },
      order: [['sort_order', true]],
      extra: function (r) { return (r.lang === 'en' ? 'English' : 'العربية') + ' · ' + String(r.body || '').slice(0, 90) + '…'; },
    },
    library_items: {
      table: 'library_items', title: 'title', pageSize: 25,
      fields: function () {
        return [
          { k: 'title', label: 'العنوان', type: 'text', req: true, max: 400 },
          { k: 'url', label: 'رابط المادة الأصلية (https://)', type: 'url', req: true },
          { k: 'source_name', label: 'اسم المصدر', type: 'text', req: true, max: 120 },
          { k: 'summary_ar', label: 'الملخص العربي', type: 'textarea', max: 700 },
          { k: 'summary_is_ai', label: 'الملخص مولّد آليًا', type: 'check' },
          { k: 'excerpt', label: 'مقتطف من المصدر (اختياري)', type: 'textarea', max: 600 },
          { k: 'content_type', label: 'نوع المحتوى', type: 'select', options: TYPES, def: 'news' },
          { k: 'language', label: 'لغة المادة الأصلية', type: 'select', options: [['ar', 'العربية'], ['en', 'الإنجليزية']], def: 'ar' },
          { k: 'category', label: 'التصنيف', type: 'select', options: function () { return [['', '— بدون —']].concat(cats.map(function (c) { return [c.slug, c.name_ar]; })); } },
          { k: 'is_saudi', label: 'ضمن «الذكاء الاصطناعي في السعودية»', type: 'check' },
          { k: 'published_at', label: 'تاريخ النشر الأصلي', type: 'date' },
          { k: 'image_url', label: 'رابط صورة يسمح المصدر باستخدامها (https://، اختياري)', type: 'url' },
          statusField,
        ];
      },
      order: [['published_at', false], ['fetched_at', false]],
      search: function (q, term) { return term ? q.ilike('title', '%' + term.replace(/[%_]/g, '') + '%') : q; },
      extra: function (r) { return r.source_name + ' · ' + fmt(r.published_at) + (r.summary_is_ai ? ' · ملخص آلي' : '') + (r.is_saudi ? ' · السعودية' : ''); },
      beforeSave: function (v, isNew) {
        if (v.published_at) v.published_at = new Date(v.published_at + 'T00:00:00Z').toISOString();
        if (!isNew || !v.url) return v;
        var n = normalizeUrl(v.url); if (!n) throw new Error('رابط المادة يجب أن يبدأ بـ https://');
        return sha256(n).then(function (h) { v.url_hash = h; return v; });
      },
      toForm: function (r) { var x = Object.assign({}, r); if (x.published_at) x.published_at = x.published_at.slice(0, 10); return x; },
    },
    library_sources: {
      table: 'library_sources', title: 'name',
      fields: function () {
        return [
          { k: 'name', label: 'اسم المصدر', type: 'text', req: true, max: 120 },
          { k: 'feed_url', label: 'رابط RSS / Atom (https://)', type: 'url', req: true },
          { k: 'site_url', label: 'رابط موقع المصدر (https://)', type: 'url', req: true },
          { k: 'content_type', label: 'نوع المحتوى', type: 'select', options: TYPES, def: 'news' },
          { k: 'language', label: 'لغة المصدر', type: 'select', options: [['en', 'الإنجليزية'], ['ar', 'العربية']], def: 'en' },
          { k: 'default_category', label: 'تصنيف ثابت (اتركه فارغًا للتصنيف التلقائي)', type: 'select', options: function () { return [['', 'تلقائي']].concat(cats.map(function (c) { return [c.slug, c.name_ar]; })); } },
          { k: 'filter_keywords', label: 'احتفظ فقط بالمواد التي تذكر إحدى هذه الكلمات (للمصادر الإخبارية العامة)', type: 'tags' },
          { k: 'is_saudi', label: 'كل مواد هذا المصدر ضمن «السعودية»', type: 'check' },
          { k: 'use_images', label: 'عرض الصور التي يرفقها المصدر في الخلاصة', type: 'check', def: true },
          { k: 'max_items', label: 'أقصى عدد مواد في كل تحديث', type: 'number', def: 12 },
          { k: 'enabled', label: 'مفعّل', type: 'check', def: true },
        ];
      },
      order: [['name', true]],
      extra: function (r) { return (r.enabled ? 'مفعّل' : 'معطّل') + ' · آخر نجاح: ' + fmt(r.last_ok_at, true) + (r.last_error ? ' · آخر خطأ: ' + r.last_error : ''); },
      statusOf: function (r) { return r.enabled ? 'published' : 'hidden'; },
    },
    library_categories: {
      table: 'library_categories', title: 'name_ar', key: 'slug',
      fields: function (row) {
        return [
          { k: 'slug', label: 'المعرّف (حروف إنجليزية صغيرة و-)', type: 'text', req: true, max: 40, pattern: '^[a-z0-9-]{2,40}$', readonlyOnEdit: true },
          { k: 'name_ar', label: 'الاسم بالعربية', type: 'text', req: true, max: 60 },
          { k: 'name_en', label: 'الاسم بالإنجليزية', type: 'text', req: true, max: 60 },
          { k: 'keywords', label: 'كلمات مفتاحية للتصنيف التلقائي (افصل بفاصلة)', type: 'tags' },
          { k: 'status', label: 'الحالة', type: 'select', options: [['published', 'ظاهر'], ['hidden', 'مخفي']], def: 'published' },
          sortField,
        ];
      },
      order: [['sort_order', true]],
      extra: function (r) { return r.name_en + ' · ' + (r.keywords || []).slice(0, 6).join('، '); },
    },
  };

  /* ---------------- generic list ---------------- */
  var currentKind = 'news', itemsOffset = 0, itemTerm = '';
  function loadList(name, append) {
    var d = TABLES[name], box = $('#list-' + name);
    if (!append) { box.innerHTML = '<p class="ap-empty">جارٍ التحميل…</p>'; if (name === 'library_items') itemsOffset = 0; }
    var q = sb.from(d.table).select('*');
    if (d.filter) q = d.filter(q);
    if (d.search) q = d.search(q, itemTerm);
    (d.order || []).forEach(function (o) { q = q.order(o[0], { ascending: o[1], nullsFirst: false }); });
    if (d.pageSize) q = q.range(itemsOffset, itemsOffset + d.pageSize - 1);
    return q.then(function (r) {
      if (r.error) { box.innerHTML = '<p class="ap-empty err">' + esc(errText(r.error)) + '</p>'; return; }
      var rows = r.data;
      var html = rows.map(function (row) {
        var key = row[d.key || 'id'], st = d.statusOf ? d.statusOf(row) : row.status;
        return '<div class="ap-row" data-key="' + esc(key) + '"><div class="ap-row-main"><b>' + esc(row[d.title]) + '</b><small>' + esc(d.extra ? d.extra(row) : '') + '</small></div>' +
          (st ? pill(st) : '') +
          '<div class="ap-row-act"><button type="button" class="btn btn-ghost btn-sm" data-edit>تعديل</button><button type="button" class="btn btn-ghost btn-sm ap-del" data-del>حذف</button></div></div>';
      }).join('');
      if (append) box.insertAdjacentHTML('beforeend', html);
      else box.innerHTML = html || '<p class="ap-empty">لا توجد عناصر بعد. اضغط «إضافة» لإنشاء أول عنصر.</p>';
      var map = box._rows = Object.assign(append ? box._rows || {} : {}, Object.fromEntries(rows.map(function (x) { return [x[d.key || 'id'], x]; })));
      $$('[data-edit]', box).forEach(function (b) { b.onclick = function () { openEditor(name, map[b.closest('.ap-row').dataset.key]); }; });
      $$('[data-del]', box).forEach(function (b) { b.onclick = function () { removeRow(name, map[b.closest('.ap-row').dataset.key]); }; });
      if (d.pageSize) { itemsOffset += rows.length; $('#apItemsMore').hidden = rows.length < d.pageSize; }
    });
  }

  /* ---------------- editor dialog ---------------- */
  var dlg = $('#apDialog'), editing = null;
  function fieldHtml(f, v, pre) {
    var id = (pre || 'fld-') + f.k, val = v == null ? (f.def != null ? f.def : '') : v;
    var req = f.req ? ' required aria-required="true"' : '';
    var lab = '<label class="adm-f" for="' + id + '">' + esc(f.label) + (f.req ? ' <span aria-hidden="true">*</span>' : '') + '</label>';
    switch (f.type) {
      case 'textarea': return '<div class="ap-field">' + lab + '<textarea class="adm-in" id="' + id + '" rows="4" maxlength="' + (f.max || 4000) + '"' + req + '>' + esc(val) + '</textarea></div>';
      case 'select': {
        var opts = typeof f.options === 'function' ? f.options() : f.options;
        return '<div class="ap-field">' + lab + '<select class="adm-in" id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
      }
      case 'check': return '<div class="ap-field ap-check"><input type="checkbox" id="' + id + '"' + (val === true || (v == null && f.def === true) ? ' checked' : '') + '><label for="' + id + '">' + esc(f.label) + '</label></div>';
      case 'tags': return '<div class="ap-field">' + lab + '<input class="adm-in" id="' + id + '" value="' + esc(Array.isArray(val) ? val.join('، ') : (val || '')) + '"></div>';
      case 'number': return '<div class="ap-field">' + lab + '<input class="adm-in ltr" type="number" id="' + id + '" value="' + esc(val) + '"></div>';
      case 'date': return '<div class="ap-field">' + lab + '<input class="adm-in ltr" type="date" id="' + id + '" value="' + esc(String(val || '').slice(0, 10)) + '"' + req + '></div>';
      case 'image':
        return '<div class="ap-field">' + lab + '<div class="ap-upload"><input class="adm-in ltr" id="' + id + '" value="' + esc(val) + '" placeholder="img/… أو https://…">' +
          '<label class="btn btn-ghost btn-sm ap-file">رفع صورة<input type="file" accept="image/webp,image/png,image/jpeg,image/avif" data-upload="image" data-target="' + id + '" data-folder="' + esc(f.folder) + '" hidden></label></div>' +
          '<small class="ap-hint">تُضغط الصورة تلقائيًا إلى WebP بعرض أقصى 1600px.</small></div>';
      default: {
        var ro = f.readonlyOnEdit && editing && editing.row ? ' readonly' : '';
        var ltr = f.type === 'url' || f.type === 'link' || f.pattern ? ' ltr' : '';
        return '<div class="ap-field">' + lab + '<input class="adm-in' + ltr + '" id="' + id + '" value="' + esc(val) + '" maxlength="' + (f.max || 400) + '"' + (f.pattern ? ' pattern="' + esc(f.pattern) + '"' : '') + req + ro + (f.type === 'url' ? ' inputmode="url" placeholder="https://"' : '') + '></div>';
      }
    }
  }

  function bindUploads(scope) {
    $$('input[type=file][data-upload]', scope).forEach(function (inp) {
      inp.onchange = function () {
        var file = inp.files[0]; if (!file) return;
        var msg = $('#apDlgMsg') || {}; var lbl = inp.parentElement; lbl.classList.add('busy');
        setMsg('جارٍ رفع الملف…');
        upload(inp.dataset.upload, inp.dataset.folder || 'misc', file).then(function (url) {
          $('#' + inp.dataset.target, scope).value = url; setMsg('تم رفع الملف. لا تنس الحفظ.', 'ok');
          scope.dispatchEvent(new Event('input'));
        }).catch(function (e) { setMsg(e.message || errText(e), 'err'); })
          .finally(function () { lbl.classList.remove('busy'); inp.value = ''; });
      };
    });
  }
  function setMsg(text, kind) { var m = dlg.open ? $('#apDlgMsg') : $('#apVideoMsg'); if (m) { m.textContent = text; m.className = 'adm-msg ' + (kind || ''); } }

  function readForm(fields, scope, pre) {
    var v = {}, errors = [];
    fields.forEach(function (f) {
      var el = $('#' + (pre || 'fld-') + f.k, scope); if (!el) return;
      var x;
      if (f.type === 'check') x = el.checked;
      else if (f.type === 'tags') x = el.value.split(/[,،\n]+/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 12);
      else if (f.type === 'number') x = el.value === '' ? null : Math.round(+el.value);
      else x = el.value.trim();
      if (f.type !== 'check' && f.type !== 'tags' && f.type !== 'number' && x === '') x = null;
      if (f.req && (x == null || x === '')) errors.push('«' + f.label.replace(/\s*\(.*\)$/, '') + '» مطلوب.');
      if (x && f.type === 'url' && !isHttps(x)) errors.push('«' + f.label.replace(/\s*\(.*\)$/, '') + '» يجب أن يبدأ بـ https://');
      if (x && f.type === 'link' && !(isHttps(x) || /^#[\w-]+$/.test(x))) errors.push('الرابط يبدأ بـ https:// أو # لقسم في الصفحة.');
      if (x && f.type === 'image' && !(isHttps(x) || /^img\/[\w\/.-]+$/.test(x))) errors.push('رابط الصورة يبدأ بـ https:// أو img/');
      if (x && f.pattern && !new RegExp(f.pattern).test(x)) errors.push('«' + f.label.replace(/\s*\(.*\)$/, '') + '» بصيغة غير صحيحة.');
      if (typeof x === 'string' && f.max && x.length > f.max) errors.push('«' + f.label + '» أطول من المسموح.');
      if (f.k === 'category' && x === null) x = null;
      v[f.k] = x;
    });
    return { v: v, errors: errors };
  }

  function preview(name, v) {
    var box = $('#apPreview');
    if (name === 'projects') {
      box.innerHTML = '<p class="ap-hint">معاينة البطاقة كما تظهر في الموقع:</p><div class="proj-grid"><article class="proj-card"><div class="proj-cover">' +
        (v.cover_url ? '<img src="' + esc(v.cover_url) + '" alt="">' : '<div class="proj-gen"><span>' + esc(v.title) + '</span></div>') +
        '<span class="proj-badge">' + (v.cover_url && v.cover_is_screenshot ? 'لقطة من المشروع' : 'غلاف توضيحي') + '</span></div><div class="proj-body"><h3>' + esc(v.title) + '</h3><p class="proj-by">إعداد وتطوير: <b>' + esc(v.author) + '</b></p><p class="proj-desc">' + esc(v.description) + '</p>' +
        ((v.tags || []).length ? '<ul class="proj-tags">' + v.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="proj-foot"><span class="btn btn-primary btn-sm">عرض المشروع</span></div></div></article></div>';
    } else if (name === 'library_items') {
      box.innerHTML = '<p class="ap-hint">معاينة البطاقة في المكتبة:</p><div class="lib-grid" style="margin:0"><article class="lcard"><div class="lcard-img"><div class="lcard-ph"><b>' + esc(v.source_name) + '</b></div>' + (v.image_url ? '<img src="' + esc(v.image_url) + '" alt="">' : '') + '</div><div class="lcard-body"><h3>' + esc(v.title) + '</h3><p class="sum">' + (v.summary_is_ai ? '<span class="ai-tag">ملخص آلي</span>' : '') + esc(v.summary_ar || v.excerpt || '') + '</p><div class="lcard-meta"><span>المصدر: ' + esc(v.source_name) + '</span></div></div></article></div>';
    } else if (name === 'content') {
      box.innerHTML = '<p class="ap-hint">معاينة:</p><article class="ccard" style="max-width:380px"><div class="ccover">' + (v.image_url ? '<img src="' + esc(v.image_url) + '" alt="">' : '<div class="ct">' + esc(v.title) + '</div>') + '</div><div class="cbody"><h3>' + esc(v.title) + '</h3><p>' + esc(v.body || (v.event_date ? 'الموعد: ' + v.event_date : '')) + '</p></div></article>';
    } else {
      box.innerHTML = '<p class="ap-hint">معاينة النص:</p><div class="card"><h3>' + esc(v.title || v.name_ar || v.name || '') + '</h3><p style="white-space:pre-wrap">' + esc(v.body || v.keywords && v.keywords.join('، ') || '') + '</p></div>';
    }
  }

  function openEditor(name, row) {
    var d = TABLES[name]; editing = { name: name, row: row || null };
    var data = row ? (d.toForm ? d.toForm(row) : row) : (d.defaults ? d.defaults() : {});
    var fields = d.fields(row);
    $('#apDlgTitle').textContent = row ? 'تعديل: ' + (row[d.title] || '') : 'إضافة جديدة';
    $('#apDlgFields').innerHTML = fields.map(function (f) { return fieldHtml(f, data[f.k]); }).join('');
    $('#apPreview').innerHTML = ''; setMsg('');
    bindUploads($('#apDlgFields'));
    dlg.showModal();
    var first = $('#apDlgFields input, #apDlgFields textarea'); if (first) first.focus();
  }
  $('#apDlgClose').onclick = function () { dlg.close(); };
  $('#apDlgPreview').onclick = function () {
    var d = TABLES[editing.name]; var r = readForm(d.fields(editing.row), $('#apDlgFields'));
    preview(editing.name, Object.assign({}, editing.row || {}, r.v));
  };
  $('#apDlgForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = TABLES[editing.name], fields = d.fields(editing.row), r = readForm(fields, $('#apDlgFields'));
    if (r.errors.length) { setMsg(r.errors[0], 'err'); return; }
    var isNew = !editing.row, v = Object.assign(isNew && d.defaults ? d.defaults() : {}, r.v);
    var btn = $('#apDlgSave'); btn.disabled = true; setMsg('جارٍ الحفظ…');
    Promise.resolve().then(function () { return d.beforeSave ? d.beforeSave(v, isNew) : v; }).then(function (vv) {
      var key = d.key || 'id';
      if (!isNew && d.key) delete vv[d.key];
      var q = isNew ? sb.from(d.table).insert(vv).select() : sb.from(d.table).update(vv).eq(key, editing.row[key]).select();
      return q.then(function (res) {
        if (res.error) throw res.error;
        if (!res.data || !res.data.length) throw { code: '42501', message: 'not allowed' };
        dlg.close(); toast(isNew ? 'تمت الإضافة.' : 'تم حفظ التعديلات.', 'ok');
        loadList(editing.name);
        if (editing.name === 'library_categories') loadCats();
      });
    }).catch(function (er) { setMsg(er instanceof Error && !er.code ? er.message : errText(er), 'err'); })
      .finally(function () { btn.disabled = false; });
  });

  function removeRow(name, row) {
    var d = TABLES[name], c = $('#apConfirm');
    $('#apConfirmText').textContent = 'سيُحذف «' + (row[d.title] || '') + '» نهائيًا ولا يمكن التراجع. إذا أردت إخفاءه فقط فاختر الحالة «مخفي» بدل الحذف.';
    c.returnValue = ''; c.showModal();
    c.addEventListener('close', function once() {
      c.removeEventListener('close', once);
      if (c.returnValue !== 'yes') return;
      var key = d.key || 'id';
      sb.from(d.table).delete().eq(key, row[key]).select().then(function (r) {
        if (r.error) return toast(errText(r.error), 'err');
        if (!r.data.length) return toast('لم يُحذف شيء: لا تملك صلاحية الحذف.', 'err');
        toast('تم الحذف.', 'ok'); loadList(name);
      });
    });
  }

  $$('[data-new]').forEach(function (b) { b.onclick = function () { openEditor(b.dataset.new, null); }; });

  /* ---------------- tabs ---------------- */
  var loaded = {};
  function showTab(tab) {
    $$('#apTabs [role=tab]').forEach(function (b) { var on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    $$('.ap-panel').forEach(function (p) { p.hidden = p.id !== 'p-' + tab; });
    if (loaded[tab]) return; loaded[tab] = true;
    if (tab === 'content') loadList('content');
    if (tab === 'projects') loadList('projects');
    if (tab === 'library') loadList('library_items');
    if (tab === 'assistant') loadList('chatbot_knowledge');
    if (tab === 'video') loadVideo();
    try { history.replaceState(null, '', '#' + tab); } catch (e) {}
  }
  $('#apTabs').addEventListener('click', function (e) { var b = e.target.closest('[role=tab]'); if (b) showTab(b.dataset.tab); });
  $('#apTabs').addEventListener('keydown', function (e) {
    var tabs = $$('#apTabs [role=tab]'), i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var n = e.key === 'ArrowLeft' ? i + 1 : e.key === 'ArrowRight' ? i - 1 : -9;
    if (n === -9) return; n = (n + tabs.length) % tabs.length; tabs[n].focus(); showTab(tabs[n].dataset.tab); e.preventDefault();
  });
  $('#apKind').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#apKind button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    currentKind = b.dataset.f; loadList('content');
  });
  $('#apLibSub').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#apLibSub button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var f = b.dataset.f;
    $('#apLibItems').hidden = f !== 'items'; $('#apLibSources').hidden = f !== 'sources'; $('#apLibCats').hidden = f !== 'categories'; $('#apLibRuns').hidden = f !== 'runs';
    if (f === 'sources') loadList('library_sources');
    if (f === 'categories') loadList('library_categories');
    if (f === 'runs') loadRuns();
  });
  var qt; $('#apItemQ').addEventListener('input', function () { clearTimeout(qt); var v = this.value.trim(); qt = setTimeout(function () { itemTerm = v; loadList('library_items'); }, 300); });
  $('#apItemsMore').onclick = function () { loadList('library_items', true); };

  /* ---------------- library: runs, refresh ---------------- */
  function loadRuns() {
    var box = $('#list-library_runs');
    sb.from('library_runs').select('*').order('started_at', { ascending: false }).limit(30).then(function (r) {
      if (r.error) { box.innerHTML = '<p class="ap-empty err">' + esc(errText(r.error)) + '</p>'; return; }
      if (!r.data.length) { box.innerHTML = '<p class="ap-empty">لم يُشغَّل التحديث بعد.</p>'; return; }
      box.innerHTML = '<div class="tbl-wrap"><table class="tbl ap-tbl"><thead><tr><th>الوقت (الرياض)</th><th>المصدر</th><th>النتيجة</th><th>مصادر ناجحة</th><th>جديد</th><th>محدَّث</th><th>الأخطاء</th></tr></thead><tbody>' +
        r.data.map(function (x) {
          var res = x.ok === null ? (x.finished_at ? '—' : 'قيد التشغيل') : x.ok ? 'نجح' : 'فشل';
          return '<tr><td>' + esc(fmt(x.started_at, true)) + '</td><td>' + (x.trigger === 'manual' ? 'يدوي' : 'مجدول') + '</td><td>' + pill(x.ok ? 'published' : x.ok === false ? 'hidden' : 'draft').replace(/>[^<]*</, '>' + res + '<') +
            '</td><td>' + x.sources_ok + ' / ' + x.sources_total + '</td><td>' + x.items_new + '</td><td>' + x.items_updated + '</td><td>' +
            (x.errors && x.errors.length ? '<details><summary>' + x.errors.length + '</summary><ul>' + x.errors.map(function (e) { return '<li>' + esc((e.source || 'عام') + ': ' + e.error) + '</li>'; }).join('') + '</ul></details>' : '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    });
  }
  function loadLibSummary() {
    Promise.all([
      sb.from('library_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      sb.from('library_runs').select('finished_at,ok,items_new,trigger').order('started_at', { ascending: false }).limit(1),
      sb.from('library_runs').select('finished_at').eq('ok', true).order('finished_at', { ascending: false }).limit(1),
    ]).then(function (rs) {
      var last = rs[1].data && rs[1].data[0], good = rs[2].data && rs[2].data[0];
      $('#apLibSummary').innerHTML = '<ul class="ap-status">' +
        '<li><span>المواد المنشورة</span><b>' + (rs[0].count || 0) + '</b></li>' +
        '<li><span>آخر تحديث ناجح</span><b>' + esc(good ? fmt(good.finished_at, true) : 'لا يوجد بعد') + '</b></li>' +
        '<li><span>آخر محاولة</span><b>' + esc(last ? fmt(last.finished_at || last.started_at, true) + ' · ' + (last.ok ? 'نجحت' : last.ok === false ? 'فشلت' : 'قيد التشغيل') : 'لا يوجد') + '</b></li></ul>';
    });
  }
  $('#apRefreshNow').onclick = function () {
    var b = this, m = $('#apRefreshMsg'); b.disabled = true; m.className = 'adm-msg'; m.textContent = 'جارٍ جلب المصادر… قد يستغرق ذلك دقيقة أو أكثر.';
    api('api/admin/library-refresh', { method: 'POST' }).then(function (r) {
      if (r.skipped) { m.textContent = 'يوجد تحديث آخر قيد التشغيل الآن. أعد المحاولة بعد دقائق.'; m.className = 'adm-msg warn'; return; }
      m.textContent = (r.ok ? 'اكتمل التحديث: ' : 'انتهى التحديث مع أخطاء: ') + r.itemsNew + ' جديدة، ' + r.itemsUpdated + ' محدّثة، ' + r.summaries + ' ملخصًا، ' + r.sourcesOk + '/' + r.sourcesTotal + ' مصادر ناجحة.';
      m.className = 'adm-msg ' + (r.ok ? 'ok' : 'err');
      loadLibSummary(); if (loaded.library) loadList('library_items');
    }).catch(function (e) {
      m.className = 'adm-msg err';
      m.textContent = e.status === 403 ? 'لا تملك صلاحية التحديث.' : e.status === 503 ? 'الخادم غير مهيأ بعد (متغيرات البيئة ناقصة).' : 'تعذّر تشغيل التحديث (' + e.message + ').';
    }).finally(function () { b.disabled = false; });
  };

  function loadStatus() {
    var ul = $('#apStatus');
    api('api/admin/status').then(function (s) {
      var row = function (label, ok, note) { return '<li><span>' + esc(label) + '</span><b class="' + (ok ? 'ok' : 'warn') + '">' + esc(note) + '</b></li>'; };
      ul.innerHTML =
        row('قاعدة البيانات (Supabase)', true, 'متصلة') +
        row('مفتاح الخادم السري', s.supabaseServerKey, s.supabaseServerKey ? 'مضبوط' : 'غير مضبوط — التحديث والمساعد متوقفان') +
        row('سر التحديث المجدول', s.cronSecret, s.cronSecret ? 'مضبوط' : 'غير مضبوط — التحديث اليومي لن يعمل') +
        row('خدمة Ollama', s.ollama.configured && s.ollama.reachable && s.ollama.modelAvailable,
          !s.ollama.configured ? 'غير مضبوطة — المساعد يعرض رسالة «غير متصل»' : !s.ollama.reachable ? 'مضبوطة لكن لا تستجيب' : !s.ollama.modelAvailable ? 'تستجيب لكن النموذج ' + (s.ollama.model || '') + ' غير موجود' : 'تعمل · ' + s.ollama.model);
    }).catch(function (e) {
      ul.innerHTML = '<li><span>واجهة الخادم</span><b class="warn">' + (e.status === 404 ? 'غير متاحة في هذه الاستضافة' : 'تعذّر الفحص (' + esc(e.message) + ')') + '</b></li>';
    });
  }

  /* ---------------- video (site_docs: site/video) ---------------- */
  var VIDEO_FIELDS = [
    { k: 'status', label: 'الحالة', type: 'select', options: [['hidden', 'مخفي'], ['draft', 'مسودة'], ['published', 'منشور']], def: 'hidden' },
    { k: 'title', label: 'العنوان', type: 'text', max: 120, def: 'الذكاء الاصطناعي في المملكة' },
    { k: 'description', label: 'وصف قصير', type: 'textarea', max: 400 },
    { k: 'kind', label: 'نوع الفيديو', type: 'select', options: [['file', 'ملف فيديو مرفوع (MP4 / WebM)'], ['youtube', 'رابط YouTube']], def: 'file' },
    { k: 'src', label: 'رابط الفيديو (https://) أو ارفع ملفًا', type: 'text', max: 500 },
    { k: 'poster', label: 'صورة الغلاف', type: 'image', folder: 'video' },
    { k: 'captions', label: 'ملف الترجمة النصية .vtt (اختياري)', type: 'text', max: 500 },
    { k: 'captions_lang', label: 'لغة الترجمة', type: 'select', options: [['ar', 'العربية'], ['en', 'English']], def: 'ar' },
    { k: 'source_name', label: 'اسم المصدر (الجهة المالكة للفيديو)', type: 'text', max: 120 },
    { k: 'source_url', label: 'رابط المصدر (https://)', type: 'url' },
  ];
  function loadVideo() {
    var form = $('#apVideoForm');
    sb.from('site_docs').select('data').eq('path', 'site/video').maybeSingle().then(function (r) {
      var v = (r.data && r.data.data) || {};
      form.innerHTML = VIDEO_FIELDS.map(function (f) { return fieldHtml(f, v[f.k], 'vid-'); }).join('') +
        '<div class="ap-field"><span class="adm-f">رفع ملفات</span><div class="adm-actions">' +
          '<label class="btn btn-ghost btn-sm ap-file">رفع فيديو<input type="file" accept="video/mp4,video/webm" data-upload="video" data-target="vid-src" data-folder="video" hidden></label>' +
          '<label class="btn btn-ghost btn-sm ap-file">رفع ترجمة .vtt<input type="file" accept=".vtt,text/vtt" data-upload="vtt" data-target="vid-captions" data-folder="video" hidden></label></div></div>' +
        '<div class="ap-preview" id="apVideoPreview"></div>' +
        '<div class="adm-actions"><button class="btn btn-ghost btn-sm" type="button" id="apVideoPrev">معاينة</button><button class="btn btn-primary btn-sm" type="submit">حفظ</button><span class="adm-msg" id="apVideoMsg" role="status"></span></div>';
      bindUploads(form);
      $('#apVideoPrev').onclick = function () {
        var x = readForm(VIDEO_FIELDS, form, 'vid-').v, box = $('#apVideoPreview');
        if (!x.src) { box.innerHTML = '<p class="ap-hint">أضف رابط الفيديو أولًا.</p>'; return; }
        var yt = x.kind === 'youtube' && (String(x.src).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [])[1];
        box.innerHTML = '<div class="vid-frame">' + (yt ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '" title="معاينة" allowfullscreen></iframe>' :
          '<video controls preload="metadata" playsinline crossorigin="anonymous"' + (x.poster ? ' poster="' + esc(x.poster) + '"' : '') + '><source src="' + esc(x.src) + '">' + (x.captions ? '<track kind="captions" default src="' + esc(x.captions) + '" srclang="' + esc(x.captions_lang || 'ar') + '">' : '') + '</video>') + '</div>';
      };
    });
    form.onsubmit = function (e) {
      e.preventDefault();
      var r = readForm(VIDEO_FIELDS, form, 'vid-'), v = r.v, m = $('#apVideoMsg');
      if (v.src && !isHttps(v.src) && !(v.kind === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(v.src))) r.errors.push('رابط الفيديو يجب أن يبدأ بـ https://');
      if (v.captions && !isHttps(v.captions)) r.errors.push('رابط الترجمة يجب أن يبدأ بـ https://');
      if (v.status === 'published' && (!v.src || !v.source_name)) r.errors.push('لنشر القسم أضف رابط الفيديو واسم المصدر.');
      if (r.errors.length) { m.textContent = r.errors[0]; m.className = 'adm-msg err'; return; }
      Object.keys(v).forEach(function (k) { if (v[k] == null) delete v[k]; });
      m.textContent = 'جارٍ الحفظ…'; m.className = 'adm-msg';
      sb.from('site_docs').upsert({ path: 'site/video', data: v }, { onConflict: 'path' }).select().then(function (res) {
        if (res.error || !res.data.length) { m.textContent = errText(res.error || { code: '42501' }); m.className = 'adm-msg err'; return; }
        m.textContent = v.status === 'published' ? 'تم الحفظ، والقسم ظاهر الآن في الموقع.' : 'تم الحفظ. القسم مخفي في الموقع.'; m.className = 'adm-msg ok';
      });
    };
  }

  /* ---------------- auth ---------------- */
  function show(id) { ['apBoot', 'apLogin', 'apRecover', 'apDenied', 'apApp'].forEach(function (x) { $('#' + x).hidden = x !== id; }); }
  function loadCats() { return sb.from('library_categories').select('slug,name_ar').order('sort_order').then(function (r) { cats = r.data || []; }); }

  function afterSignIn() {
    $('#apWho').hidden = false; $('#apWho').textContent = session.user.email; $('#apLogout').hidden = false;
    return sb.rpc('am_i_admin').then(function (r) {
      if (r.data !== true) { show('apDenied'); return; }
      show('apApp');
      loadCats(); loadStatus(); loadLibSummary();
      var want = location.hash.slice(1);
      showTab($('#apTabs [data-tab="' + want + '"]') ? want : 'overview');
    });
  }

  $('#apLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#apLoginMsg'), email = $('#apEmail').value.trim(), pass = $('#apPass').value;
    if (!email || !pass) { m.textContent = 'أدخل البريد وكلمة المرور.'; m.className = 'adm-msg err'; return; }
    m.textContent = 'جارٍ تسجيل الدخول…'; m.className = 'adm-msg';
    sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
      if (r.error) { m.textContent = /rate|too many/i.test(r.error.message) ? 'محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.' : 'البريد أو كلمة المرور غير صحيحة.'; m.className = 'adm-msg err'; return; }
      session = r.data.session; $('#apPass').value = ''; m.textContent = ''; afterSignIn();
    });
  });
  $('#apForgot').onclick = function () {
    var m = $('#apLoginMsg'), email = $('#apEmail').value.trim();
    if (!email) { m.textContent = 'اكتب بريدك أولًا ثم اضغط «نسيت كلمة المرور؟».'; m.className = 'adm-msg err'; return; }
    sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(function () {
      m.textContent = 'إذا كان البريد مسجّلًا فستصلك رسالة لإعادة تعيين كلمة المرور.'; m.className = 'adm-msg ok';
    });
  };
  $('#apRecForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#apRecMsg'), p = $('#apNewPass').value;
    if (p.length < 12) { m.textContent = 'كلمة المرور قصيرة: 12 حرفًا على الأقل.'; m.className = 'adm-msg err'; return; }
    sb.auth.updateUser({ password: p }).then(function (r) {
      if (r.error) { m.textContent = 'تعذّر الحفظ: ' + r.error.message; m.className = 'adm-msg err'; return; }
      m.textContent = 'تم تغيير كلمة المرور.'; m.className = 'adm-msg ok'; setTimeout(afterSignIn, 600);
    });
  });
  $('#apLogout').onclick = function () {
    sb.auth.signOut().finally(function () { session = null; $('#apWho').hidden = true; $('#apLogout').hidden = true; loaded = {}; show('apLogin'); });
  };

  EWA.client().then(function (client) {
    sb = client;
    if (!sb) {
      $('#apBoot').innerHTML = '<h1>لوحة الإدارة غير مهيأة بعد</h1><p>لم يتم ربط الموقع بقاعدة البيانات. اضبط متغيرات البيئة SUPABASE_URL و SUPABASE_PUBLISHABLE_KEY في الاستضافة كما في ملف README، ثم أعد تحميل الصفحة.</p>';
      return;
    }
    sb.auth.onAuthStateChange(function (ev, s) {
      session = s;
      if (ev === 'PASSWORD_RECOVERY') show('apRecover');
      if (ev === 'SIGNED_OUT') show('apLogin');
    });
    sb.auth.getSession().then(function (r) {
      session = r.data && r.data.session;
      if (/type=recovery/.test(location.hash)) return show('apRecover');
      if (session) afterSignIn(); else show('apLogin');
    });
  });
})();
