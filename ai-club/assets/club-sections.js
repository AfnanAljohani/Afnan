/* EWA AI Club — v2 home-page sections: club projects, the Saudi AI video and
 * the daily-library teaser. Content comes from Supabase (published rows only);
 * the projects list falls back to the built-in card when the database is
 * unavailable so the section is never empty. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  var httpsOnly = function (u) { try { var x = new URL(u, location.href); return x.protocol === 'https:' || (x.origin === location.origin && !/^javascript:/i.test(u)) ? x.href : ''; } catch (e) { return ''; } };
  var host = function (u) { try { return new URL(u).host; } catch (e) { return ''; } };
  var fmtDate = function (iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' }); } catch (e) { return iso.slice(0, 10); }
  };
  var ICON_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  /* ---------------- projects ---------------- */
  var FALLBACK_PROJECTS = [{
    slug: 'ai-club-screen',
    title: 'الشاشة الرقمية لبرنامج الذكاء الاصطناعي',
    author: 'أفنان الجهني',
    description: 'شاشة عرض حيّة لقاعة التدريب تعرض المحاضرة الجارية مع عدّاد تنازلي لنهايتها، وجدول المحاضرات والبريكات، وتذكير «لا تنسى»، وتحديات البونس الأسبوعية، وأبطال النادي، وجلسات الأسبوع، وتقويمًا بالتاريخين الميلادي والهجري. تدعم العربية والإنجليزية، وتعمل بدون إنترنت من فلاشة USB.',
    url: 'https://afnanaljohani.github.io/Afnan/ai-club-screen/',
    cover_url: 'img/projects/ai-club-screen.webp',
    cover_is_screenshot: true,
    tags: ['HTML', 'JavaScript', 'عربي / English', 'بدون إنترنت'],
  }];

  function projectCard(p) {
    var url = httpsOnly(p.url), cover = p.cover_url ? httpsOnly(p.cover_url) : '';
    var coverHtml = cover
      ? '<img src="' + esc(cover) + '" alt="' + esc(p.cover_is_screenshot ? 'لقطة شاشة من مشروع ' + p.title : 'غلاف توضيحي لمشروع ' + p.title) + '" loading="lazy" width="1200" height="675">'
      : '<div class="proj-gen" aria-hidden="true"><span>' + esc(p.title) + '</span></div>';
    var label = cover ? (p.cover_is_screenshot ? 'لقطة من المشروع' : 'غلاف توضيحي') : 'غلاف توضيحي';
    return '<article class="proj-card">' +
      '<div class="proj-cover">' + coverHtml + '<span class="proj-badge">' + label + '</span></div>' +
      '<div class="proj-body">' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="proj-by">إعداد وتطوير: <b>' + esc(p.author) + '</b></p>' +
        '<p class="proj-desc">' + esc(p.description) + '</p>' +
        ((p.tags || []).length ? '<ul class="proj-tags">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="proj-foot">' +
          (url ? '<a class="btn btn-primary btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">عرض المشروع ' + ICON_EXT + '<span class="sr-only"> (يفتح في تبويب جديد)</span></a>' : '') +
          (url ? '<span class="proj-host ltr">' + esc(host(url)) + '</span>' : '') +
        '</div>' +
      '</div></article>';
  }

  function renderProjects(list) {
    var box = $('#projects-list'); if (!box) return;
    box.innerHTML = list.length ? list.map(projectCard).join('') : '<p class="empty-note">تُضاف مشاريع النادي هنا قريبًا.</p>';
  }

  /* ---------------- video ---------------- */
  function youTubeId(src) {
    var m = String(src || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(src || '') ? src : '');
  }

  function renderVideo(v) {
    var sec = $('#saudi-ai'); if (!sec || !v || v.status !== 'published' || !v.src) return;
    var frame = $('#vidFrame');
    if (v.title) $('#vidTitle').textContent = v.title;
    $('#vidDesc').textContent = v.description || '';
    var poster = v.poster ? httpsOnly(v.poster) : '';
    var yt = v.kind === 'youtube' ? youTubeId(v.src) : '';
    if (yt) {
      // click-to-load: nothing from YouTube loads (and nothing plays) until the visitor presses play
      var thumb = poster || ('https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg');
      frame.innerHTML = '<button type="button" class="vid-facade" aria-label="تشغيل الفيديو: ' + esc(v.title || '') + '">' +
        '<img src="' + esc(thumb) + '" alt="" loading="lazy"><span class="vid-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></span></button>';
      $('.vid-facade', frame).addEventListener('click', function () {
        frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '?autoplay=1&rel=0&cc_load_policy=1&hl=ar" title="' + esc(v.title || 'فيديو') + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
      });
    } else {
      var src = httpsOnly(v.src); if (!src) return;
      var track = v.captions ? '<track kind="captions" src="' + esc(httpsOnly(v.captions)) + '" srclang="' + esc(v.captions_lang || 'ar') + '" label="' + (v.captions_lang === 'en' ? 'English' : 'العربية') + '">' : '';
      frame.innerHTML = '<video controls preload="none" playsinline crossorigin="anonymous"' + (poster ? ' poster="' + esc(poster) + '"' : '') + ' aria-label="' + esc(v.title || 'فيديو') + '"><source src="' + esc(src) + '">' + track + '</video>';
    }
    var srcLink = v.source_url ? httpsOnly(v.source_url) : '';
    $('#vidSrc').innerHTML = v.source_name ? ('المصدر: ' + (srcLink ? '<a href="' + esc(srcLink) + '" target="_blank" rel="noopener noreferrer">' + esc(v.source_name) + '</a>' : esc(v.source_name))) : '';
    sec.hidden = false;
    sec.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
  }

  /* ---------------- daily library teaser ---------------- */
  function renderLibTeaser(items, lastRun) {
    var list = $('#libDailyList'), meta = $('#libDailyMeta'); if (!list) return;
    if (!items || !items.length) { list.innerHTML = ''; meta.textContent = 'تظهر هنا أحدث المواد بعد أول تحديث للمكتبة.'; return; }
    list.innerHTML = items.map(function (it) {
      var u = httpsOnly(it.url);
      return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><b' + (it.language === 'en' ? ' class="ltr-text" dir="ltr"' : '') + '>' + esc(it.title) + '</b>' +
        '<small>' + esc(it.source_name) + (it.published_at ? ' · ' + esc(fmtDate(it.published_at)) : '') + '</small></a></li>';
    }).join('');
    meta.textContent = lastRun ? 'آخر تحديث ناجح: ' + fmtDate(lastRun) : '';
  }

  /* ---------------- load ---------------- */
  renderProjects(FALLBACK_PROJECTS);
  if (!window.EWA) return;
  EWA.client().then(function (sb) {
    if (!sb) { renderLibTeaser([], null); return; }
    sb.from('projects').select('slug,title,author,description,url,cover_url,cover_is_screenshot,tags')
      .eq('status', 'published').order('sort_order').limit(24)
      .then(function (r) { if (!r.error && r.data) renderProjects(r.data.length ? r.data : []); });
    sb.from('site_docs').select('data').eq('path', 'site/video').maybeSingle()
      .then(function (r) { if (!r.error && r.data) renderVideo(r.data.data); });
    Promise.all([
      sb.from('library_items').select('title,url,source_name,published_at,language').eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false }).limit(3),
      sb.from('library_runs').select('finished_at').eq('ok', true).order('finished_at', { ascending: false }).limit(1),
    ]).then(function (rs) {
      renderLibTeaser(rs[0].error ? [] : rs[0].data, !rs[1].error && rs[1].data[0] ? rs[1].data[0].finished_at : null);
    });
  });
})();
