/* EWA AI Club — floating assistant.
 * Talks only to /api/chat (our server), which talks to Ollama. Answers are
 * rendered as plain text; links come only from the sources the server sends.
 * If the model isn't configured the widget says so — it never fakes a reply. */
(function () {
  'use strict';
  if (document.getElementById('ewaChat')) return;

  var MAX = 800;
  var T = {
    ar: {
      fab: 'اسأل مساعد النادي', title: 'مساعد النادي', sub: 'إجابات من محتوى النادي المعتمد',
      hello: 'أهلًا! أنا مساعد نادي الذكاء الاصطناعي. اسألني عن النادي وأقسامه وفعالياته ومشاريعه، أو عن أحدث مواد المكتبة الرقمية.',
      chips: ['ما هو نادي الذكاء الاصطناعي؟', 'متى الورشة القادمة؟', 'كيف أنضم للنادي؟', 'ما أحدث أخبار الذكاء الاصطناعي؟'],
      ph: 'اكتب سؤالك…', send: 'إرسال', close: 'إغلاق المساعد', lang: 'English', langLabel: 'التبديل إلى الإنجليزية',
      thinking: 'يكتب المساعد…', sources: 'المصادر', retry: 'إعادة المحاولة',
      offline: 'المساعد غير متصل بنموذج بعد. سيعمل بعد أن تضبط إدارة النادي خدمة Ollama، وحتى ذلك الحين تجد كل المعلومات في أقسام الموقع.',
      neterr: 'تعذّر الاتصال بالخادم. تحقق من اتصالك ثم أعد المحاولة.',
      note: 'قد يخطئ المساعد؛ تحقّق من التفاصيل المهمة في أقسام الموقع.',
      count: function (n) { return n + ' / ' + MAX; },
    },
    en: {
      fab: 'Ask the club assistant', title: 'Club assistant', sub: 'Answers from approved club content',
      hello: "Hi! I'm the EWA AI Club assistant. Ask me about the club, its departments, events and projects, or the latest items in the digital library.",
      chips: ['What is EWA AI Club?', 'When is the next workshop?', 'How do I join?', "What's new in AI?"],
      ph: 'Type your question…', send: 'Send', close: 'Close assistant', lang: 'عربي', langLabel: 'Switch to Arabic',
      thinking: 'The assistant is typing…', sources: 'Sources', retry: 'Try again',
      offline: "The assistant isn't connected to a model yet. It will work once the club sets up the Ollama service; meanwhile everything is on the site.",
      neterr: "Couldn't reach the server. Check your connection and try again.",
      note: 'The assistant can make mistakes; check important details on the site.',
      count: function (n) { return n + ' / ' + MAX; },
    },
  };

  var lang = (document.documentElement.lang || 'ar').slice(0, 2) === 'en' ? 'en' : 'ar';
  var history = [], busy = false, ctl = null, available = null;

  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var safeUrl = function (u) { try { var x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } };

  var root = document.createElement('div');
  root.id = 'ewaChat';
  root.innerHTML =
    '<button type="button" class="ec-fab" aria-expanded="false" aria-controls="ecPanel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>' +
      '<span class="ec-fab-t"></span></button>' +
    '<section class="ec-panel" id="ecPanel" role="dialog" aria-modal="false" aria-labelledby="ecTitle" hidden>' +
      '<header class="ec-head"><span class="ec-dot" aria-hidden="true"></span><div><h2 id="ecTitle"></h2><small class="ec-sub"></small></div>' +
        '<button type="button" class="ec-lang"></button>' +
        '<button type="button" class="ec-x"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>' +
      '<div class="ec-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="ec-chips"></div>' +
      '<form class="ec-form"><label class="sr-only" for="ecIn"></label>' +
        '<textarea id="ecIn" rows="1" maxlength="' + MAX + '"></textarea>' +
        '<button type="submit" class="ec-send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span class="sr-only"></span></button>' +
      '</form>' +
      '<p class="ec-note"><span class="ec-note-t"></span> <span class="ec-count ltr"></span></p>' +
    '</section>';
  document.body.appendChild(root);

  var fab = root.querySelector('.ec-fab'), panel = root.querySelector('.ec-panel'), log = root.querySelector('.ec-log');
  var chips = root.querySelector('.ec-chips'), form = root.querySelector('.ec-form'), input = root.querySelector('#ecIn');
  var sendBtn = root.querySelector('.ec-send'), count = root.querySelector('.ec-count');

  function applyLang() {
    var t = T[lang];
    panel.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl'); panel.lang = lang;
    root.querySelector('.ec-fab-t').textContent = t.fab; fab.setAttribute('aria-label', t.fab);
    root.querySelector('#ecTitle').textContent = t.title; root.querySelector('.ec-sub').textContent = t.sub;
    var lb = root.querySelector('.ec-lang'); lb.textContent = t.lang; lb.setAttribute('aria-label', t.langLabel); lb.lang = lang === 'ar' ? 'en' : 'ar';
    root.querySelector('.ec-x').setAttribute('aria-label', t.close);
    root.querySelector('label[for="ecIn"]').textContent = t.ph; input.placeholder = t.ph;
    sendBtn.querySelector('.sr-only').textContent = t.send;
    root.querySelector('.ec-note-t').textContent = t.note;
    updateCount();
    if (!history.length) { log.innerHTML = ''; bubble('bot', t.hello); renderChips(); }
  }

  function renderChips() {
    chips.innerHTML = history.length || available === false ? '' : T[lang].chips.map(function (c) { return '<button type="button">' + esc(c) + '</button>'; }).join('');
    chips.querySelectorAll('button').forEach(function (b) { b.onclick = function () { ask(b.textContent); }; });
  }

  function bubble(who, text, extra) {
    var el = document.createElement('div');
    el.className = 'ec-msg ec-' + who + (extra ? ' ' + extra : '');
    var p = document.createElement('p'); p.textContent = text || ''; el.appendChild(p);
    log.appendChild(el); log.scrollTop = log.scrollHeight;
    return el;
  }

  function typing() {
    var el = document.createElement('div');
    el.className = 'ec-msg ec-bot ec-typing';
    el.innerHTML = '<span class="sr-only">' + esc(T[lang].thinking) + '</span><i></i><i></i><i></i>';
    log.appendChild(el); log.scrollTop = log.scrollHeight; return el;
  }

  // [L1] markers → numbered links to the sources the server sent (never model-provided URLs)
  function renderAnswer(el, text, sources) {
    var p = el.querySelector('p'); p.textContent = '';
    var parts = String(text).split(/(\[L\d+\])/g);
    parts.forEach(function (part) {
      var m = part.match(/^\[L(\d+)\]$/), src = m && sources[+m[1] - 1], url = src && safeUrl(src.url);
      if (url) { var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'ec-cite'; a.textContent = m[1]; a.title = src.title; p.appendChild(a); }
      else if (!m) p.appendChild(document.createTextNode(part));
    });
    var used = sources.filter(function (s, i) { return text.indexOf('[L' + (i + 1) + ']') >= 0 && safeUrl(s.url); });
    var old = el.querySelector('.ec-sources'); if (old) old.remove();
    if (used.length) {
      var box = document.createElement('div'); box.className = 'ec-sources';
      box.innerHTML = '<b>' + esc(T[lang].sources) + '</b><ol>' + sources.map(function (s, i) {
        if (text.indexOf('[L' + (i + 1) + ']') < 0 || !safeUrl(s.url)) return '';
        return '<li value="' + (i + 1) + '"><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + '</a><small> — ' + esc(s.source || '') + '</small></li>';
      }).join('') + '</ol>';
      el.appendChild(box);
    }
  }

  function setBusy(b) { busy = b; sendBtn.disabled = b || available === false; input.setAttribute('aria-busy', b ? 'true' : 'false'); }
  function updateCount() { count.textContent = T[lang].count(input.value.length); }

  function checkAvailability() {
    if (available !== null || !window.EWA) return Promise.resolve(available);
    return EWA.config().then(function (c) {
      available = !!(c && c.features && c.features.chat);
      if (!available) { bubble('bot', T[lang].offline, 'ec-warn'); input.disabled = true; sendBtn.disabled = true; renderChips(); }
      return available;
    });
  }

  function ask(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    if (q.length > MAX) q = q.slice(0, MAX);
    chips.innerHTML = '';
    bubble('me', q);
    history.push({ role: 'user', content: q });
    input.value = ''; updateCount(); autosize();
    send();
  }

  function send() {
    setBusy(true);
    var dots = typing(), out = null, text = '', sources = [];
    ctl = new AbortController();
    fetch('api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
      body: JSON.stringify({ lang: lang, messages: history.slice(-16) }),
    }).then(function (res) {
      var ct = res.headers.get('content-type') || '';
      if (!res.ok || ct.indexOf('ndjson') < 0) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          throw { message: (j && j.error && j.error.message) || T[lang].neterr, code: j && j.error && j.error.code };
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';
      var pump = function () {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += dec.decode(r.value, { stream: true });
          var nl;
          while ((nl = buf.indexOf('\n')) >= 0) {
            var line = buf.slice(0, nl); buf = buf.slice(nl + 1);
            if (!line.trim()) continue;
            var m; try { m = JSON.parse(line); } catch (e) { continue; }
            if (m.type === 'meta') sources = Array.isArray(m.sources) ? m.sources : [];
            else if (m.type === 'token') {
              if (!out) { dots.remove(); out = bubble('bot', ''); }
              text += m.text; out.querySelector('p').textContent = text; log.scrollTop = log.scrollHeight;
            } else if (m.type === 'error') throw { message: m.message, code: m.code };
          }
          return pump();
        });
      };
      return pump();
    }).then(function () {
      if (dots.parentNode) dots.remove();
      if (!out) out = bubble('bot', '');
      renderAnswer(out, text.trim(), sources);
      history.push({ role: 'assistant', content: text.trim() });
    }).catch(function (e) {
      if (dots.parentNode) dots.remove();
      if (e && e.name === 'AbortError') return;
      if (out && text) history.push({ role: 'assistant', content: text });
      var err = bubble('bot', (e && e.message) || T[lang].neterr, 'ec-err');
      if (e && e.code === 'not_configured') { available = false; input.disabled = true; return; }
      if (!e || e.code !== 'too_long') {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ec-retry'; b.textContent = T[lang].retry;
        b.onclick = function () { err.remove(); if (history.length && history[history.length - 1].role === 'user') send(); };
        err.appendChild(b);
      }
    }).finally(function () { setBusy(false); ctl = null; if (!panel.hidden) input.focus(); });
  }

  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; }

  function open() {
    panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); root.classList.add('open');
    checkAvailability().then(function () { if (!input.disabled) input.focus(); });
  }
  function close() {
    panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); root.classList.remove('open');
    if (ctl) ctl.abort();
    fab.focus();
  }

  fab.addEventListener('click', function () { panel.hidden ? open() : close(); });
  root.querySelector('.ec-x').addEventListener('click', close);
  root.querySelector('.ec-lang').addEventListener('click', function () { lang = lang === 'ar' ? 'en' : 'ar'; applyLang(); renderChips(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener('input', function () { updateCount(); autosize(); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); } });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } });

  applyLang();
})();
