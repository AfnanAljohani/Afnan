// Bnan AI · content rendering.
// Turns content data into the cards for Projects, Presentations and Graphic design.
// Arabic text is the element's content and English sits in data-en, like the rest of the page.
window.BnanRender = (function(){
  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c];
    });
  }
  function asset(path){ return /^https?:\/\//.test(path) ? path : 'assets/' + path; }
  function svg(d){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }

  var ICONS = {
    web:svg('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/>'),
    bot:svg('<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V3"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>'),
    mic:svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/>'),
    eye:svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    chart:svg('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>')
  };
  var STATUS = {
    in_progress:{cls:'p-build', ar:'قيد التطوير', en:'In progress'},
    completed:{cls:'p-done', ar:'مكتمل', en:'Completed'},
    exploring:{cls:'p-soon', ar:'فكرة قيد الدراسة', en:'Exploring'}
  };

  function project(p){
    var st = STATUS[p.status] || STATUS.in_progress;
    return '<article class="card proj rv">' +
      '<div class="ph"><span class="pi">' + (ICONS[p.icon] || ICONS.web) + '</span><span class="pstat ' + st.cls + '" data-en="' + esc(st.en) + '">' + esc(st.ar) + '</span></div>' +
      '<h3 data-en="' + esc(p.title.en) + '">' + esc(p.title.ar) + '</h3>' +
      '<p data-en="' + esc(p.summary.en) + '">' + esc(p.summary.ar) + '</p>' +
      '<div class="tags">' + p.tags.map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="pbar" role="img" aria-label="' + p.progress + '%"><span style="--p:' + p.progress + '%"></span></div>' +
      '<div class="pmeta"><span class="mono" dir="ltr">' + esc(p.year) + '</span><b class="mono">' + p.progress + '%</b></div>' +
      '</article>';
  }

  function deck(d){
    var pages = d.pages.map(asset);
    return '<button class="card deck rv" type="button" data-deck="' + esc(d.slug) + '" data-pages="' + esc(pages.join(',')) + '" data-title="' + esc(d.title.ar) + '" data-title-en="' + esc(d.title.en) + '">' +
      '<span class="d-cover"><img src="' + esc(pages[d.cover] || pages[0]) + '" alt="" loading="lazy" style="object-position:' + esc(d.cover_position || 'top') + '"><span class="d-count mono">' + pages.length + ' <span data-en="pages">صفحات</span></span></span>' +
      '<span class="d-body"><span class="tag" data-en="' + esc(d.tag.en) + '">' + esc(d.tag.ar) + '</span><b data-en="' + esc(d.title.en) + '">' + esc(d.title.ar) + '</b>' +
      '<span class="d-desc" data-en="' + esc(d.summary.en) + '">' + esc(d.summary.ar) + '</span><span class="d-open" data-en="View deck →">شاهد العرض ←</span></span>' +
      '</button>';
  }

  function graphic(g){
    var src = asset(g.image);
    return '<button class="gx rv" type="button" data-cat="' + esc(g.category) + '" data-full="' + esc(src) + '" data-cap="' + esc(g.caption.ar) + '" data-cap-en="' + esc(g.caption.en) + '">' +
      '<img src="' + esc(src) + '" alt="' + esc(g.caption.en) + '" loading="lazy"><span class="gx-cap" data-en="' + esc(g.caption.en) + '">' + esc(g.caption.ar) + '</span></button>';
  }

  function all(content){
    var grid = document.getElementById('projectGrid');
    grid.insertAdjacentHTML('afterbegin', content.projects.map(project).join(''));
    document.getElementById('deckGrid').innerHTML = content.decks.map(deck).join('');
    document.getElementById('gGrid').innerHTML = content.graphics.map(graphic).join('');
  }

  return {all:all};
})();
