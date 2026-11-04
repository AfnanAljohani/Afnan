/* EWA AI Club — data layer shared by the home page, /library and /admin.
 *
 * 1. EWA.config()  → /api/public-config (Supabase URL + publishable key, feature flags)
 * 2. EWA.client()  → a Supabase client, loaded lazily from assets/vendor (no CDN)
 * 3. window.claude shim: outside Claude, the page's existing editors call
 *    window.claude.use('db' | 'user'). We answer those calls with Supabase so
 *    the original features (heroes, survey, leaders, announcements) keep
 *    working with a real database. Inside Claude the real object is used.
 *
 * Security lives in the database (RLS): this file only decides what to show.
 */
(function () {
  'use strict';
  var VENDOR = 'assets/vendor/supabase-2.118.0.js';
  var cfgP = null, clientP = null;

  function loadScript(src) {
    return new Promise(function (ok, bad) {
      if (window.supabase && window.supabase.createClient) return ok();
      var s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = function () { ok(); }; s.onerror = function () { bad(new Error('load failed: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function config() {
    if (!cfgP) {
      cfgP = fetch('api/public-config', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return cfgP;
  }

  function client() {
    if (!clientP) {
      clientP = config().then(function (c) {
        if (!c || !c.supabaseUrl || !c.supabaseKey) return null;
        return loadScript(VENDOR).then(function () {
          return window.supabase.createClient(c.supabaseUrl, c.supabaseKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'ewa-ai-club-auth' },
          });
        });
      }).catch(function () { return null; });
    }
    return clientP;
  }

  function isAdmin() {
    return client().then(function (sb) {
      if (!sb) return false;
      return sb.auth.getSession().then(function (r) {
        if (!r.data || !r.data.session) return false;
        return sb.rpc('am_i_admin').then(function (x) { return x.data === true; });
      });
    }).catch(function () { return false; });
  }

  // Map database permission errors to the code the original page expects.
  function wrapErr(e) {
    var err = new Error((e && e.message) || 'request failed');
    var perm = e && (e.code === '42501' || e.code === 'PGRST301' || /row-level security|permission denied/i.test(e.message || ''));
    err.code = perm ? 'invalid_argument' : (e && e.code) || 'unknown';
    return err;
  }

  function docAdapter(sb, path) {
    var snap = function (row) {
      return { id: path.split('/')[1], exists: !!row, data: function () { return row ? row.data : undefined; } };
    };
    var get = function () {
      return sb.from('site_docs').select('data').eq('path', path).maybeSingle().then(function (r) {
        if (r.error) throw wrapErr(r.error); return snap(r.data);
      });
    };
    return {
      get: get,
      set: function (data) {
        return sb.from('site_docs').upsert({ path: path, data: data }, { onConflict: 'path' }).select('path').then(function (r) {
          if (r.error) throw wrapErr(r.error);
          if (!r.data || !r.data.length) throw wrapErr({ code: '42501', message: 'not allowed' });
        });
      },
      delete: function () {
        return sb.from('site_docs').delete().eq('path', path).select('path').then(function (r) { if (r.error) throw wrapErr(r.error); });
      },
      onSnapshot: function (cb, onErr) {
        var live = true, run = function () { get().then(function (s) { if (live) cb(s); }, function (e) { if (onErr) onErr(e); }); };
        run(); var f = function () { if (document.visibilityState === 'visible') run(); };
        document.addEventListener('visibilitychange', f);
        return function () { live = false; document.removeEventListener('visibilitychange', f); };
      },
    };
  }

  function collectionAdapter(sb, name) {
    var list = function () {
      return sb.from('site_docs').select('path, data').like('path', name + '/%').then(function (r) {
        if (r.error) throw wrapErr(r.error);
        return { docs: r.data.map(function (row) { return { id: row.path.split('/')[1], data: function () { return row.data; } }; }) };
      });
    };
    return {
      onSnapshot: function (cb, onErr) {
        var live = true, run = function () { list().then(function (s) { if (live) cb(s); }, function (e) { if (onErr) onErr(e); }); };
        run(); var f = function () { if (document.visibilityState === 'visible') run(); };
        document.addEventListener('visibilitychange', f);
        // refresh after the in-page editor saves
        window.addEventListener('ewa:docs-changed', run);
        return function () { live = false; document.removeEventListener('visibilitychange', f); window.removeEventListener('ewa:docs-changed', run); };
      },
    };
  }

  function dbAdapter(sb) {
    return {
      doc: function (path) {
        var d = docAdapter(sb, path), set = d.set, del = d.delete;
        d.set = function (x) { return set(x).then(function () { window.dispatchEvent(new Event('ewa:docs-changed')); }); };
        d.delete = function () { return del().then(function () { window.dispatchEvent(new Event('ewa:docs-changed')); }); };
        return d;
      },
      collection: function (name) { return collectionAdapter(sb, name); },
    };
  }

  window.EWA = {
    config: config,
    client: client,
    isAdmin: isAdmin,
    session: function () {
      return client().then(function (sb) { return sb ? sb.auth.getSession().then(function (r) { return r.data && r.data.session; }) : null; });
    },
  };

  if (!window.claude || !window.claude.use) {
    window.claude = {
      __shim: true,
      use: function (name) {
        if (name === 'db') return client().then(function (sb) { return sb ? dbAdapter(sb) : null; });
        if (name === 'user') return client().then(function (sb) {
          if (!sb) return null;
          return { canEdit: isAdmin };
        });
        return Promise.resolve(null);
      },
    };
  }
})();
