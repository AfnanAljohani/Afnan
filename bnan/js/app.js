// Bnan AI · interface layer.
// Runs after js/main.js has rendered the content, so every [data-en] node exists before i18n starts.
window.startBnanApp = function(){
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- i18n ----------
  var steps = {
    ar:["نسمع تحدّيك ونفهم المشكلة وبياناتك قبل ما نقترح أي حل.","نقترح حلولًا جرّبناها في مشاريع وتحديات سابقة، ونختار الأنسب لبياناتك.","نحوّل الفكرة إلى نموذج أولي يُجرَّب في مشروعك خلال أسابيع.","نقيس الأثر بمؤشرات واضحة: وقت أقل، دقة أعلى، قرار أسرع."],
    en:["We listen to your challenge and understand the problem and your data before proposing any solution.","We propose solutions we've tested in previous projects and challenges, and pick what fits your data.","We turn the idea into a prototype you can try in your project within weeks.","We measure impact with clear indicators: less time, higher accuracy, faster decisions."]
  };
  var answers = {
    what:{ar:"بنان شركة ناشئة سعودية في الذكاء الاصطناعي 🤖\nأسّستها أفنان الجهني، وتقدّم استشارات وحلول، تحليل بيانات، نماذج أولية، وورشًا تطبيقية.\nشعارنا: حلّل · ابنِ · اصنع الأثر.",en:"Bnan is a Saudi AI startup 🤖\nFounded by Afnan Aljohani, offering AI consulting and solutions, data analysis, prototypes and hands-on workshops.\nAnalyze · Build · Impact."},
    join:{ar:"تبدأ مشروعك بثلاث خطوات 🚀\n1) اختر «طلب خدمة» أو «استشارة» في نموذج التواصل أسفل الصفحة\n2) أو راسلنا على واتساب\n3) نحدد معك النطاق والسعر، ونبدأ 😉",en:"Start your project in three steps 🚀\n1) Pick “Service request” or “Consultation” in the contact form below\n2) Or message us on WhatsApp\n3) We agree on scope and price, and we start 😉"},
    service:{ar:"نقدّم 🛠️\n• استشارات وحلول ذكاء اصطناعي\n• تحليل بيانات ولوحات Power BI/Tableau\n• نماذج أولية ورؤية حاسوبية\n• ورش ومسارات تدريبية\n• تجهيز للهاكاثونات\n• تدريب على العرض والإلقاء",en:"We offer 🛠️\n• AI consulting & solutions\n• Data analysis & Power BI/Tableau dashboards\n• Prototypes & computer vision\n• Workshops & learning paths\n• Hackathon preparation\n• Presentation coaching"},
    events:{ar:"ورش بنان 🛠️\n🎓 ورش تطبيقية للفرق والجهات، من الأساسيات إلى المشاريع\n🏆 تجهيز للهاكاثونات\n🎙️ تدريب على العرض والإلقاء\nنصمّم الورشة حسب احتياج فريقك.",en:"Bnan workshops 🛠️\n🎓 Hands-on workshops for teams and organizations, from basics to projects\n🏆 Hackathon preparation\n🎙️ Presentation coaching\nEach workshop is tailored to your team."},
    ideas:{ar:"فكرتك محفوظة 🔒\nكل فكرة تُنشر باسم صاحبها وتاريخها، والمشاريع برخصة تشترط ذكر المصدر.\nوإذا فكرتك مشروع تجاري، ننشر المفهوم فقط ونحفظ التفاصيل.",en:"Your idea is protected 🔒\nEvery idea is published with its author's name and date, and projects carry a license that requires attribution.\nIf it's a startup idea, we publish only the concept."},
    support:{ar:"للشراكات والاستثمار 🤝\nاختر «شراكة واستثمار» في نموذج التواصل، أو راسل أفنان على واتساب أو لينكدإن.",en:"For partnerships and investment 🤝\nPick “Partnership / Investment” in the contact form, or message Afnan on WhatsApp or LinkedIn."},
    cost:{ar:"السعر يعتمد على نطاق المشروع 💡\nنحدد معك النطاق والسعر بوضوح قبل ما نبدأ. أرسل لنا تفاصيل فكرتك ونرد عليك بعرض.",en:"Pricing depends on the project scope 💡\nWe agree on a clear scope and price before we start. Send us your idea and we'll reply with a proposal."},
    projects:{ar:"مشاريع أشتغل عليها الحين 🚀\n• الشاشة التدريبية الذكية (فكرة أصلية جاهزة للتجربة)\n• منصة بنان (75%)\n• «اسأل بنان» بالذكاء التوليدي (30%)\n• مدرّب الإلقاء الذكي (فكرة قيد الدراسة)\nومن المشاريع المكتملة: مصنّف الصور الطبية، وتوقّع سلوك مستخدمي الاتصالات. تفاصيلها في قسم «مشاريعي» 👇",en:"Projects I'm working on now 🚀\n• Smart Training Screen (original idea, ready to pilot)\n• Bnan Platform (75%)\n• Ask Banan with generative AI (30%)\n• AI presentation coach (exploring)\nCompleted: a medical image classifier and telecom user behavior prediction. Details in “My Projects” 👇"},
    founder:{ar:"مؤسِّسة ورئيسة بنان: أفنان الجهني 👩‍💻\nمهندسة ذكاء اصطناعي وعلم بيانات، خرّيجة علوم الحاسب من جامعة جدة بمرتبة الشرف.",en:"Bnan's founder & president: Afnan Aljohani 👩‍💻\nAI & Data Science Engineer, Computer Science honors graduate from the University of Jeddah."},
    learn:{ar:"ابدأ من هنا 📚\n• دورة «الذكاء الاصطناعي لخدمة المجتمع» من وزارة الاتصالات على FutureX\n• جمعية الذكاء الاصطناعي (AIA)\n• أكاديمية سدايا\nكلها في قسم «مركز المعرفة» 👇",en:"Start here 📚\n• “AI for Community Service” course by MCIT on FutureX\n• Artificial Intelligence Association (AIA)\n• SDAIA Academy\nAll in the Knowledge Center section 👇"},
    contact:{ar:"تواصل معنا 📬\nالبريد: a.almass3dii@gmail.com\nواتساب: ‎+966 54 537 9819",en:"Contact us 📬\nEmail: a.almass3dii@gmail.com\nWhatsApp: +966 54 537 9819"},
    wa:{ar:"حيّاك 💚 بفتح لك واتساب الحين…",en:"Welcome 💚 Opening WhatsApp now…"},
    hi:{ar:"هلا والله 👋 أنا بنان، مساعدتك الذكية. اسألني عن الخدمات، الأسعار، المشاريع، أو كيف ترفع تحدّيك.",en:"Hi there 👋 I'm Banan, your AI assistant. Ask me about services, pricing, projects, or submitting a challenge."},
    none:{ar:"ما فهمت عليك تمامًا 🤖 جرّب تسأل عن: الخدمات، الأسعار، الورش، المشاريع، أو الشراكات.\nأو راسل أفنان مباشرة على واتساب 💚",en:"I didn't quite get that 🤖 Try asking about services, pricing, workshops, projects or partnerships.\nOr message Afnan directly on WhatsApp 💚"}
  };
  var keys = [
    ['wa',/واتس|whats|قروب|group/i],['join',/أبدأ مشروع|ابدأ مشروع|مشروع جديد|انضم|أنضم|اطلب|طلب خدمة|start a project|join|request|hire/i],
    ['ideas',/سرق|تنسرق|حقوق|فكرت|steal|stol|idea|copy/i],['projects',/مشروع|مشاريع|تشتغلين|تشتغل|project|working on/i],['service',/خدم|تقدم|تقدّم|استشار|حل|service|offer|consult/i],
    ['events',/فعالي|ورش|ورشة|هاكاثون|لقاء|event|workshop|hackathon/i],
    ['support',/شراك|استثمار|دعم|رعاي|partner|invest|support|sponsor/i],['cost',/مجان|سعر|أسعار|اسعار|تكلف|بكم|free|cost|price|pricing/i],
    ['founder',/مؤسس|رئيس|أفنان|افنان|مين|founder|president|who/i],['learn',/أبدأ|ابدأ|دورة|كورس|أتعلم|اتعلم|مصادر|start|course|learn/i],
    ['contact',/تواصل|رقم|ايميل|إيميل|بريد|contact|email|phone/i],['hi',/هلا|السلام|مرحب|hello|hi\b|hey/i],['what',/بنان|وش هو|ما هو|what|bnan/i]
  ];
  var els = [].slice.call(document.querySelectorAll('[data-en]'));
  els.forEach(function(el){ el.dataset.ar = el.innerHTML; });
  var lang = 'ar';
  try{ lang = localStorage.getItem('bnan-lang') || 'ar'; }catch(e){}
  var stepIdx = 0, cycIdx = 0;
  var cycle = {ar:['① الفكرة: نستقبل التحدي','② التحليل: خبراء يفهمون المشكلة','③ الحل: نقترح حلولًا مجرّبة','④ النموذج: نبني نموذجًا أوليًا','⑤ التجربة: نختبره في الواقع','⑥ الأثر: نقيس النتيجة وننشرها'],en:['① Idea: we receive the challenge','② Analysis: experts understand the problem','③ Solution: we propose proven options','④ Prototype: we build a first version','⑤ Pilot: we test it in the real world','⑥ Impact: we measure and publish']};
  function showCycle(i){ cycIdx = i; document.querySelectorAll('#cycle .rail span').forEach(function(r,j){ r.classList.toggle('on', j <= i); }); document.getElementById('cycleNow').textContent = cycle[lang][i]; }

  function setLang(l){
    lang = l;
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    els.forEach(function(el){ el.innerHTML = l === 'ar' ? el.dataset.ar : el.dataset.en; });
    document.getElementById('langBtn').textContent = l === 'ar' ? 'ENGLISH 🌐' : 'العربية 🌐';
    document.getElementById('stepText').textContent = steps[l][stepIdx];
    var ci = document.getElementById('chatI'); ci.placeholder = ci.dataset['ph' + (l === 'ar' ? 'Ar' : 'En')];
    showCycle(cycIdx);
    try{ localStorage.setItem('bnan-lang', l); }catch(e){}
    var w = document.getElementById('welcome'); if(w && !w.hidden && typeof typeWelcome === 'function') typeWelcome();
  }
  document.getElementById('langBtn').addEventListener('click', function(){ setLang(lang === 'ar' ? 'en' : 'ar'); });
  showCycle(0);
  if(lang === 'en') setLang('en');
  setInterval(function(){ showCycle((cycIdx + 1) % 6); }, 2200);

  // ---------- menu ----------
  var links = document.getElementById('navLinks'), mb = document.getElementById('menuBtn');
  mb.addEventListener('click', function(){ var o = links.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  links.addEventListener('click', function(e){ if(e.target.tagName === 'A'){ links.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });

  // ---------- more menu (touch) ----------
  var more = document.getElementById('more');
  more.querySelector('button').addEventListener('click', function(){ more.classList.toggle('open'); });
  document.addEventListener('click', function(e){ if(!more.contains(e.target)) more.classList.remove('open'); });

  // ---------- chat ----------
  var chat = document.getElementById('chat'), fab = document.getElementById('fab'), body = document.getElementById('chatB');
  var greeted = false;
  function say(text, who){
    var m = document.createElement('div'); m.className = 'msg ' + who; m.textContent = text;
    body.appendChild(m); body.scrollTop = body.scrollHeight;
  }
  function reply(key){
    var t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(function(){
      t.remove(); say(answers[key][lang], 'bot');
      if(key === 'wa') window.open('https://wa.me/966545379819', '_blank', 'noopener');
    }, 650);
  }
  function openChat(){
    chat.classList.add('open'); fab.setAttribute('aria-expanded', true);
    var dot = fab.querySelector('.dot'); if(dot) dot.remove();
    if(!greeted){ greeted = true; reply('hi'); }
    setTimeout(function(){ document.getElementById('chatI').focus({preventScroll:true}); }, 250);
  }
  function closeChat(){ chat.classList.remove('open'); fab.setAttribute('aria-expanded', false); }
  fab.addEventListener('click', function(){ chat.classList.contains('open') ? closeChat() : openChat(); });
  document.getElementById('openChat').addEventListener('click', openChat);
  document.getElementById('chatX').addEventListener('click', closeChat);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeChat(); });
  document.getElementById('chatQ').addEventListener('click', function(e){
    var b = e.target.closest('.chip'); if(!b) return;
    say(b.textContent, 'me'); reply(b.dataset.q);
  });
  document.getElementById('chatF').addEventListener('submit', function(e){
    e.preventDefault();
    var i = document.getElementById('chatI'), q = i.value.trim(); if(!q) return;
    say(q, 'me'); i.value = '';
    var hit = keys.filter(function(k){ return k[1].test(q); })[0];
    reply(hit ? hit[0] : 'none');
  });


  // ---------- welcome robot ----------
  var wEl = document.getElementById('welcome');
  var wMsg = {
    ar:'حيّاك الله في بنان للذكاء الاصطناعي 💜 أنا بنان، مساعدتك الذكية. بنان شركة ناشئة تحوّل الأفكار والتحديات إلى حلول ذكاء اصطناعي تصنع أثرًا يُشار إليه بالبنان. خلّني أوريك المكان!',
    en:"Welcome to Bnan AI 💜 I'm Banan, your AI assistant. Bnan is a startup that turns ideas and challenges into AI solutions with an impact worth pointing to. Let me show you around!"
  };
  var seen = false;
  try{ seen = sessionStorage.getItem('bnan-welcome') === '1'; }catch(e){}
  var typeTimer;
  function typeWelcome(){
    var t = document.getElementById('wText'), msg = wMsg[lang], i = 0;
    clearInterval(typeTimer); t.textContent = '';
    if(reduceMotion){ t.textContent = msg; return; }
    wEl.classList.add('talking');
    typeTimer = setInterval(function(){
      t.textContent = msg.slice(0, ++i);
      if(i >= msg.length){ clearInterval(typeTimer); wEl.classList.remove('talking'); }
    }, 28);
  }
  function closeWelcome(then){
    clearInterval(typeTimer);
    try{ sessionStorage.setItem('bnan-welcome', '1'); }catch(e){}
    wEl.classList.add('out');
    setTimeout(function(){ wEl.hidden = true; wEl.classList.remove('out'); document.body.style.overflow = ''; if(then) then(); }, 350);
  }
  if(!seen){
    wEl.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(typeWelcome, 450);
    setTimeout(function(){ document.getElementById('wGo').focus({preventScroll:true}); }, 100);
  }
  document.getElementById('wGo').addEventListener('click', function(){ closeWelcome(); });
  document.getElementById('wX').addEventListener('click', function(){ closeWelcome(); });
  document.getElementById('wAsk').addEventListener('click', function(){ closeWelcome(openChat); });
  wEl.addEventListener('click', function(e){ if(e.target === wEl) closeWelcome(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !wEl.hidden) closeWelcome(); });


  // ---------- smart training screen demo ----------
  (function(){
    var day = [
      {t:'lec',m:90,ar:'المحاضرة الأولى',en:'Lecture 1'},{t:'brk',m:15,ar:'استراحة',en:'Break'},
      {t:'lec',m:90,ar:'المحاضرة الثانية',en:'Lecture 2'},{t:'brk',m:15,ar:'استراحة',en:'Break'},
      {t:'lec',m:60,ar:'المحاضرة الثالثة',en:'Lecture 3'},{t:'lunch',m:45,ar:'الغداء',en:'Lunch'},
      {t:'lec',m:75,ar:'المحاضرة الرابعة',en:'Lecture 4'},{t:'brk',m:30,ar:'الختام',en:'Wrap-up'}
    ];
    var total = day.reduce(function(a,p){ return a + p.m; }, 0), start = 8 * 60;
    var days = {ar:['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']};
    var path = document.getElementById('tsPath'), arc = document.getElementById('tsArc');
    if(!path) return;
    path.innerHTML = day.map(function(p){ return '<span class="' + (p.t === 'lec' ? '' : p.t) + '" style="flex:' + p.m + '"><i></i><em></em></span>'; }).join('');
    var segs = path.children, C = 2 * Math.PI * 52;
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function tick(){
      var now = new Date();
      // map the real clock onto a simulated 08:00–15:00 training day so the demo is always mid-day
      var secs = ((now.getHours() * 60 + now.getMinutes()) % total) * 60 + now.getSeconds();
      var acc = 0, i = 0;
      while(i < day.length - 1 && secs >= (acc + day[i].m) * 60){ acc += day[i].m; i++; }
      var cur = day[i], nxt = day[i + 1], left = (acc + cur.m) * 60 - secs, done = 1 - left / (cur.m * 60);
      var clock = start + Math.floor(secs / 60);
      var ar = lang === 'ar';
      document.getElementById('tsClock').textContent = pad(Math.floor(clock / 60) % 24) + ':' + pad(clock % 60);
      document.getElementById('tsDay').textContent = days[lang][now.getDay()] + (ar ? ' · اليوم التدريبي' : ' · Training day');
      document.getElementById('tsTitle').textContent = ar ? 'الشاشة التدريبية الذكية' : 'Smart Training Screen';
      document.getElementById('tsNowLbl').textContent = ar ? '● الفترة الحالية' : '● Current period';
      document.getElementById('tsLeftLbl').textContent = ar ? 'متبقي' : 'left';
      document.getElementById('tsNow').textContent = cur[lang];
      document.getElementById('tsNext').textContent = nxt ? (ar ? 'بعدها: ' : 'Next: ') + nxt[lang] : (ar ? 'نهاية اليوم' : 'End of day');
      document.getElementById('tsLeft').textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
      arc.style.strokeDashoffset = C * done;
      [].forEach.call(segs, function(sg, j){
        sg.classList.toggle('cur', j === i);
        sg.querySelector('i').style.width = (j < i ? 100 : j === i ? done * 100 : 0) + '%';
        sg.querySelector('em').textContent = day[j].m >= 45 ? day[j][lang] : '';
      });
      var al = document.getElementById('tsAlert'), msg = '', cls = '';
      if(cur.t === 'brk' && i < day.length - 1 && left <= 5 * 60){ msg = ar ? '⏰ الاستعداد للعودة: توجّهوا إلى القاعات' : '⏰ Get ready: head back to class'; cls = 'back'; }
      else if(nxt && (nxt.t === 'lunch' || i === day.length - 2) && left <= 10 * 60){ msg = ar ? '🎒 لا تنسى أغراضك: البطاقة، الشاحن، السماعات' : "🎒 Don't forget your things: badge, charger, earbuds"; cls = 'items'; }
      al.hidden = !msg; al.textContent = msg; al.className = 'ts-alert ' + cls;
    }
    tick(); setInterval(tick, 1000);
  })();

  // ---------- lightbox (decks + graphics) ----------
  var lbEl = document.getElementById('lb'), lbImg = document.getElementById('lbImg'), lbList = [], lbI = 0, lbOpener = null;
  function lbShow(i){
    lbI = i; var it = lbList[i];
    lbImg.src = it.src; lbImg.alt = it.cap;
    document.getElementById('lbCap').textContent = it.cap;
    document.getElementById('lbN').textContent = (i + 1) + ' / ' + lbList.length;
    document.getElementById('lbPrev').disabled = i === 0;
    document.getElementById('lbNext').disabled = i === lbList.length - 1;
    document.getElementById('lbStage').scrollTop = 0;
  }
  function lbOpen(list, i, opener){ lbList = list; lbOpener = opener; lbEl.hidden = false; document.body.style.overflow = 'hidden'; lbShow(i || 0); document.getElementById('lbX').focus(); }
  function lbClose(){ lbEl.hidden = true; document.body.style.overflow = ''; lbImg.src = ''; if(lbOpener) lbOpener.focus(); }
  document.getElementById('lbX').addEventListener('click', lbClose);
  document.getElementById('lbPrev').addEventListener('click', function(){ if(lbI > 0) lbShow(lbI - 1); });
  document.getElementById('lbNext').addEventListener('click', function(){ if(lbI < lbList.length - 1) lbShow(lbI + 1); });
  lbEl.addEventListener('click', function(e){ if(e.target === lbEl || e.target.id === 'lbStage') lbClose(); });
  document.addEventListener('keydown', function(e){
    if(lbEl.hidden) return;
    if(e.key === 'Escape') lbClose();
    var fwd = root.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', back = root.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if(e.key === fwd && lbI < lbList.length - 1) lbShow(lbI + 1);
    if(e.key === back && lbI > 0) lbShow(lbI - 1);
  });
  function openDeck(key, opener){
    var card = document.querySelector('.deck[data-deck="' + key + '"]');
    var title = lang === 'ar' ? card.dataset.title : card.dataset.titleEn;
    var pages = card.dataset.pages.split(',');
    lbOpen(pages.map(function(src, n){ return {src:src, cap:title + ' · ' + (n + 1)}; }), 0, opener);
  }
  document.querySelectorAll('[data-deck]').forEach(function(b){ b.addEventListener('click', function(){ openDeck(b.dataset.deck, b); }); });
  document.getElementById('gGrid').addEventListener('click', function(e){
    var t = e.target.closest('.gx'); if(!t) return;
    var vis = [].filter.call(this.querySelectorAll('.gx'), function(x){ return !x.classList.contains('hide'); });
    lbOpen(vis.map(function(x){ return {src:x.dataset.full, cap:lang === 'ar' ? x.dataset.cap : x.dataset.capEn}; }), vis.indexOf(t), t);
  });
  document.getElementById('gFilters').addEventListener('click', function(e){
    var b = e.target.closest('.chip'); if(!b) return;
    [].forEach.call(this.children, function(c){ c.classList.toggle('on', c === b); });
    document.querySelectorAll('#gGrid .gx').forEach(function(x){ x.classList.toggle('hide', b.dataset.f !== 'all' && x.dataset.cat !== b.dataset.f); });
  });


  // ---------- polish: scroll progress + card spotlight ----------
  var bar = document.getElementById('progress');
  function onScroll(){ var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  document.addEventListener('pointermove', function(e){
    var c = e.target.closest && e.target.closest('.card'); if(!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, {passive:true});

  // ---------- likes ----------
  document.querySelectorAll('.like').forEach(function(b, i){
    var k = 'bnan-like-' + i, on = false;
    try{ on = localStorage.getItem(k) === '1'; }catch(e){}
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    b.addEventListener('click', function(){
      on = !on; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      try{ localStorage.setItem(k, on ? '1' : '0'); }catch(e){}
    });
  });

  // ---------- active nav ----------
  var navAs = [].slice.call(document.querySelectorAll('#navLinks > a'));
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ var id = '#' + en.target.id; navAs.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === id); }); }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  navAs.forEach(function(a){ var t = document.querySelector(a.getAttribute('href')); if(t) spy.observe(t); });

  // ---------- journey steps ----------
  var stepEls = document.querySelectorAll('#steps .step');
  function showStep(i){ stepIdx = i; stepEls.forEach(function(s,j){ s.classList.toggle('on', j === i); }); document.getElementById('stepText').textContent = steps[lang][i]; }
  var stepTimer = setInterval(function(){ showStep((stepIdx + 1) % 4); }, 3200);
  stepEls.forEach(function(s,i){ s.style.cursor = 'pointer'; s.addEventListener('click', function(){ clearInterval(stepTimer); showStep(i); }); });

  // ---------- logo story ----------
  var stage = document.getElementById('stage');
  var legs = document.querySelectorAll('.leg');
  // inline a copy of the logo so its parts can be styled independently of the <use> instances
  stage.querySelector('svg').innerHTML = document.getElementById('bnan').innerHTML;
  var parts = stage.querySelectorAll('.part');
  function focusPart(p){
    stage.classList.toggle('focus', !!p);
    parts.forEach(function(g){ g.classList.toggle('hi', g.dataset.p === p); });
    legs.forEach(function(l){ l.classList.toggle('on', l.dataset.p === p); });
  }
  legs.forEach(function(l){
    l.addEventListener('mouseenter', function(){ focusPart(l.dataset.p); });
    l.addEventListener('focus', function(){ focusPart(l.dataset.p); });
    l.addEventListener('click', function(){ focusPart(l.classList.contains('on') ? null : l.dataset.p); });
  });
  document.querySelector('.legend').addEventListener('mouseleave', function(){ focusPart(null); });

  // ---------- CTA → preselect form type ----------
  document.querySelectorAll('a[data-type]').forEach(function(a){
    a.addEventListener('click', function(){ var r = document.getElementById('t-' + a.dataset.type); if(r) r.checked = true; });
  });

  // ---------- contact form → backend (mailto fallback) ----------
  var form = document.getElementById('form'), formNote = document.getElementById('formNote');
  function formSay(ar, en, ok){ formNote.textContent = lang === 'ar' ? ar : en; formNote.className = 'note form-note ' + (ok ? 'ok' : 'err'); }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = form.querySelector('#f-name'), mail = form.querySelector('#f-mail'), msg = form.querySelector('#f-msg');
    if(form.querySelector('#f-website').value){ return; } // honeypot: bots fill hidden fields
    var bad = [name, mail, msg].filter(function(x){ return !x.checkValidity(); });
    if(bad.length){ bad[0].focus(); bad[0].style.borderColor = 'var(--orange)'; return; }
    var type = form.querySelector('input[name=type]:checked');
    var request = {request_type:type.value, name:name.value.trim(), email:mail.value.trim(), message:msg.value.trim(), lang:lang};
    var btn = form.querySelector('button[type=submit]');
    if(!BnanAPI.isOnline()){
      var label = form.querySelector('label[for=' + type.id + ']').textContent;
      location.href = BnanAPI.mailtoLink(request, label);
      return;
    }
    btn.disabled = true;
    BnanAPI.sendContact(request).then(function(){
      form.reset();
      formSay('وصلتنا رسالتك 💜 بنرد عليك قريب.', "Got your message 💜 We'll get back to you soon.", true);
    }).catch(function(){
      formSay('ما قدرنا نرسلها الحين. جرّب مرة ثانية، أو راسلنا على الإيميل.', "We couldn't send it right now. Try again, or email us.", false);
    }).then(function(){ btn.disabled = false; });
  });

  // ---------- reveal + counter ----------
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
  var c = document.querySelector('[data-count]');
  if(c){
    var target = +c.dataset.count, t0 = null;
    (function tick(t){ if(!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1); c.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? '+' : ''); if(p < 1) requestAnimationFrame(tick); })(performance.now());
  }

  // ---------- neural background ----------
  var cv = document.getElementById('net'), ctx = cv.getContext('2d'), pts = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var n = Math.min(70, Math.round(W * H / 16000)); pts = [];
    for(var i = 0; i < n; i++) pts.push({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, c:Math.random() < .12 ? '240,86,122' : '108,123,255'});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i = 0; i < pts.length; i++){
      var p = pts[i];
      if(!reduce){ p.x += p.vx; p.y += p.vy; if(p.x < 0 || p.x > W) p.vx *= -1; if(p.y < 0 || p.y > H) p.vy *= -1; }
      for(var j = i + 1; j < pts.length; j++){
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx*dx + dy*dy;
        if(d < 16000){ ctx.strokeStyle = 'rgba(108,123,255,' + (.16 * (1 - d / 16000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(' + p.c + ',.7)'; ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,7); ctx.fill();
    }
    if(!reduce) requestAnimationFrame(draw);
  }
  size(); draw(); addEventListener('resize', size);
};
