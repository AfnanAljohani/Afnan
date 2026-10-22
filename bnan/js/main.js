// Bnan AI · bootstrap: load content (backend or local), render it, then start the interface.
(function(){
  function start(content){
    try{ BnanRender.all(content); }catch(e){ console.error('Render failed', e); }
    window.startBnanApp();
  }
  BnanAPI.loadContent().then(start, function(){ start(window.BNAN_CONTENT); });
})();
