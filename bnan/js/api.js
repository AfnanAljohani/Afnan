// Bnan AI · data layer.
// The only file that knows where data lives. The interface asks for content and sends
// contact requests through BnanAPI, so the backend can change (Supabase, another API,
// or a local file) without touching the rest of the site.
window.BnanAPI = (function(){
  var cfg = window.BNAN_CONFIG || {};
  var base = (cfg.supabaseUrl || '').replace(/\/+$/, '') + '/rest/v1/';
  var online = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  function request(path, options){
    options = options || {};
    var ctrl = new AbortController(), timer = setTimeout(function(){ ctrl.abort(); }, cfg.requestTimeoutMs || 5000);
    var headers = Object.assign({apikey:cfg.supabaseAnonKey, Authorization:'Bearer ' + cfg.supabaseAnonKey}, options.headers || {});
    return fetch(base + path, {method:options.method || 'GET', headers:headers, body:options.body, signal:ctrl.signal})
      .then(function(res){
        if(!res.ok) throw new Error('Request failed: ' + res.status);
        return res.status === 204 || options.method === 'POST' ? null : res.json();
      })
      .finally(function(){ clearTimeout(timer); });
  }

  // Ask only for published rows, in display order, with just the columns the site shows.
  // The is_published filter matches the partial indexes in the migration.
  function list(table, columns){
    return request(table + '?select=' + columns + '&is_published=eq.true&order=sort_order.asc');
  }

  function fromRows(projects, decks, graphics){
    return {
      projects: projects.map(function(r){
        return {slug:r.slug, status:r.status, progress:r.progress, icon:r.icon, year:r.year_label, tags:r.tags,
                title:{ar:r.title_ar, en:r.title_en}, summary:{ar:r.summary_ar, en:r.summary_en}};
      }),
      decks: decks.map(function(r){
        return {slug:r.slug, title:{ar:r.title_ar, en:r.title_en}, summary:{ar:r.summary_ar, en:r.summary_en},
                tag:{ar:r.tag_ar, en:r.tag_en}, pages:r.pages, cover:r.cover_index, cover_position:r.cover_position};
      }),
      graphics: graphics.map(function(r){
        return {slug:r.slug, category:r.category, image:r.image_path, caption:{ar:r.caption_ar, en:r.caption_en}};
      })
    };
  }

  function loadContent(){
    var local = window.BNAN_CONTENT;
    if(!online) return Promise.resolve(local);
    return Promise.all([
      list('projects', 'slug,status,progress,icon,year_label,tags,title_ar,title_en,summary_ar,summary_en'),
      list('decks', 'slug,title_ar,title_en,summary_ar,summary_en,tag_ar,tag_en,pages,cover_index,cover_position'),
      list('graphics', 'slug,category,image_path,caption_ar,caption_en')
    ]).then(function(r){
      // An empty database (not seeded yet) should not blank the site.
      return r[0].length || r[1].length || r[2].length ? fromRows(r[0], r[1], r[2]) : local;
    }).catch(function(){ return local; });
  }

  function sendContact(req){
    return request('contact_requests', {
      method:'POST',
      headers:{'Content-Type':'application/json', Prefer:'return=minimal'},
      body:JSON.stringify(req)
    });
  }

  function mailtoLink(req, label){
    var subject = 'Bnan AI · ' + label + ' · ' + req.name;
    var body = req.name + '\n' + req.email + '\n\n' + req.message;
    return 'mailto:' + (cfg.contactEmail || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  return {isOnline:function(){ return online; }, loadContent:loadContent, sendContact:sendContact, mailtoLink:mailtoLink};
})();
