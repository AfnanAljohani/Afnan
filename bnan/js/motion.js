// Bnan AI · motion layer: Lenis smooth scrolling + GSAP/ScrollTrigger reveals,
// plus two React Bits-style effects (blur-in headings, animated gradient text) in plain JS/CSS.
// Everything here is optional: without the libraries, or with reduced motion, the site works as before.
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  var root = document.documentElement;

  function start(){
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('gsap-on');

    // ---------- Lenis smooth scroll, driven by GSAP's ticker ----------
    var navH = (document.querySelector('.nav') || {offsetHeight:64}).offsetHeight;
    var lenis = new Lenis({lerp:.1, anchors:{offset:-(navH + 16)}, autoRaf:false});
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.bnanLenis = lenis;
    // Pause page scrolling while a dialog is open.
    var dialogs = ['chat', 'lb', 'welcome'].map(function(id){ return document.getElementById(id); }).filter(Boolean);
    new MutationObserver(function(){
      var open = dialogs.some(function(d){ return d.classList.contains('open') || (d.id !== 'chat' && !d.hidden); });
      open ? lenis.stop() : lenis.start();
    }).observe(document.body, {subtree:true, attributes:true, attributeFilter:['class', 'hidden']});

    // ---------- Hero entrance ----------
    gsap.timeline({defaults:{ease:'power3.out'}, delay:.15})
      .from('.hero .badge', {y:16, opacity:0, duration:.6})
      .from('.hero h1', {y:28, opacity:0, filter:'blur(10px)', duration:.9}, '-=.3')
      .from('.hero .lead', {y:18, opacity:0, duration:.7}, '-=.5')
      .from('.hero-cta .btn, .hero-links a', {y:14, opacity:0, duration:.5, stagger:.07}, '-=.4')
      .from('.hv-bot', {y:40, opacity:0, scale:.96, duration:1.1}, .2)
      .from('.hv-chip, .hv-card', {y:20, opacity:0, duration:.6, stagger:.1}, '-=.6')
      .from('.stats .stat', {y:24, opacity:0, duration:.6, stagger:.08}, '-=.5');

    // Gentle parallax on Banan.
    gsap.to('.hv-bot', {yPercent:8, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});

    // ---------- Blur-in headings (React Bits "BlurText" idea, split by word to keep Arabic joined) ----------
    document.querySelectorAll('section .sec-title').forEach(function(h){
      gsap.from(h, {opacity:0, y:24, filter:'blur(12px)', duration:.9, ease:'power3.out',
        scrollTrigger:{trigger:h, start:'top 88%', once:true}});
    });

    // ---------- Section content: staggered rise ----------
    document.querySelectorAll('section').forEach(function(sec){
      var items = sec.querySelectorAll('.card, .gx, .tier, .tl, .pol, .ch, .qi, .ptab, .yt, .voice');
      if(!items.length) return;
      gsap.from(items, {y:32, opacity:0, duration:.7, ease:'power2.out', stagger:.06,
        scrollTrigger:{trigger:sec, start:'top 80%', once:true}});
    });
    ScrollTrigger.refresh();
  }

  if(window.bnanReady) start();
  else window.addEventListener('bnan:ready', start, {once:true});
})();
