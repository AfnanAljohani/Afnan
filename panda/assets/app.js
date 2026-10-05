/* PANDA Team site — shared layout, phase registry and lightweight SVG charts */
(function () {
  "use strict";

  // Single source of truth for the six CRISP-DM phases.
  // Update status / progress here when a new phase is delivered.
  var PHASES = [
    { n: 1, slug: "phase-1.html", title: "Business Understanding", short: "Problem, objectives, KPIs and analytical questions", status: "done", progress: 100 },
    { n: 2, slug: "phase-2.html", title: "Data Understanding", short: "1M-record audit, statistics and key insights", status: "done", progress: 100 },
    { n: 3, slug: "phase-3.html", title: "Data Preparation", short: "Cleaning, encoding, imbalance and ABT grain", status: "planned", progress: 0 },
    { n: 4, slug: "phase-4.html", title: "Modelling", short: "Classification, forecasting, anomaly, simulation", status: "planned", progress: 0 },
    { n: 5, slug: "phase-5.html", title: "Evaluation", short: "Metrics against business targets", status: "planned", progress: 0 },
    { n: 6, slug: "phase-6.html", title: "Deployment", short: "Dashboard, hand-over and monitoring", status: "planned", progress: 0 }
  ];
  var STATUS_LABEL = { done: "Completed", active: "In progress", planned: "Planned" };
  window.PANDA = { PHASES: PHASES, STATUS_LABEL: STATUS_LABEL };

  var page = document.body.getAttribute("data-page") || "";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Nav ----------
  function navLink(href, label, key) {
    return '<a href="' + href + '"' + (page === key ? ' class="active" aria-current="page"' : "") + ">" + label + "</a>";
  }
  var phaseItems = PHASES.map(function (p) {
    return '<a href="' + p.slug + '"' + (page === "phase-" + p.n ? ' class="active"' : "") +
      '><span class="num">0' + p.n + "</span>" + esc(p.title) + "</a>";
  }).join("");
  var nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML =
    '<div class="wrap">' +
    '<a class="logo" href="index.html"><span class="logo-mark">P10</span><span>PANDA TEAM<small>Fresh Food AI · Group 10</small></span></a>' +
    '<button class="menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>' +
    '<nav class="nav-links" aria-label="Main">' +
    navLink("index.html", "Overview", "home") +
    '<div class="dropdown">' + navLink("index.html#phases", "Phases ▾", "phases") + '<div class="dropdown-menu">' + phaseItems + "</div></div>" +
    navLink("files.html", "Files", "files") +
    '<a class="cta" href="dashboard.html">Dashboard</a>' +
    "</nav></div>";
  document.body.insertBefore(nav, document.body.firstChild);
  var btn = nav.querySelector(".menu-btn");
  var links = nav.querySelector(".nav-links");
  btn.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- Footer ----------
  var foot = document.createElement("footer");
  foot.innerHTML =
    '<div class="wrap"><p><b style="color:var(--text-secondary)">PANDA Team</b> · AI-Powered Fresh Food Demand &amp; Inventory Optimization<br>EWA · InnovatiCS · Group 10</p>' +
    "<p>Academic project. Baselines and targets are project-brief assumptions,<br>not verified Panda performance.</p></div>";
  document.body.appendChild(foot);

  // ---------- Phase timeline / pager ----------
  document.querySelectorAll("[data-phase-timeline]").forEach(function (el) {
    el.innerHTML = PHASES.map(function (p) {
      return '<a class="phase-card reveal ' + (p.status === "done" ? "is-done" : "") + '" href="' + p.slug + '">' +
        '<span class="n">0' + p.n + "</span>" +
        '<span class="tag ' + p.status + '">' + STATUS_LABEL[p.status] + "</span>" +
        "<h3>" + esc(p.title) + "</h3><p>" + esc(p.short) + "</p>" +
        '<div class="progress" role="img" aria-label="' + p.progress + '% complete"><span style="width:' + p.progress + '%"></span></div>' +
        "</a>";
    }).join("");
  });
  document.querySelectorAll("[data-phase-pager]").forEach(function (el) {
    var n = +el.getAttribute("data-phase-pager");
    var prev = PHASES[n - 2], next = PHASES[n];
    el.className = "pager";
    el.innerHTML =
      (prev ? '<a class="card hover" href="' + prev.slug + '"><small>← Phase ' + prev.n + "</small>" + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="card hover next" href="' + next.slug + '"><small>Phase ' + next.n + " →</small>" + esc(next.title) + "</a>" : "");
  });

  // ---------- Tooltip ----------
  var tip = document.createElement("div");
  tip.className = "tooltip";
  tip.setAttribute("role", "status");
  document.body.appendChild(tip);
  function showTip(html, e) {
    tip.innerHTML = html;
    tip.style.opacity = "1";
    var x = e.clientX + 14, y = e.clientY + 14;
    var r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - 14;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = "0"; }

  // ---------- Bar chart ----------
  // opts: { categories:[], series:[{name, color, values:[]}], unit:"", fmt:fn, horizontal:bool, height:n, max:n }
  function niceMax(v) {
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var steps = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < steps.length; i++) if (steps[i] * p >= v) return steps[i] * p;
    return 10 * p;
  }
  function roundedBar(x, y, w, h, r, horizontal) {
    r = Math.min(r, horizontal ? h / 2 : w / 2, horizontal ? w : h);
    if (r <= 0) return "M" + x + "," + y + "h" + w + "v" + h + "h" + -w + "Z";
    if (horizontal) {
      // rounded at the data end (right)
      return "M" + x + "," + y + "h" + (w - r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r +
        "v" + (h - 2 * r) + "a" + r + "," + r + " 0 0 1 " + -r + "," + r + "h" + -(w - r) + "Z";
    }
    // rounded at the data end (top)
    return "M" + x + "," + (y + h) + "v" + -(h - r) + "a" + r + "," + r + " 0 0 1 " + r + "," + -r +
      "h" + (w - 2 * r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r + "v" + (h - r) + "Z";
  }

  function barChart(el, o) {
    var fmt = o.fmt || function (v) { return v.toLocaleString("en-US") + (o.unit || ""); };
    var S = o.series, C = o.categories;
    var maxV = o.max || niceMax(Math.max.apply(null, S.map(function (s) { return Math.max.apply(null, s.values); })) * 1.08);
    var svg = '<svg viewBox="0 0 W H" role="img" aria-label="' + esc(o.title || "") + '">';
    var W = Math.max(300, Math.round(el.clientWidth || 560)), H, parts = [];
    if (o.horizontal) {
      var labelW = Math.min(o.labelWidth || 190, Math.round(W * 0.42)), rowH = 22 * S.length + 18, padR = 64;
      H = C.length * rowH + 8;
      var plotW = W - labelW - padR;
      C.forEach(function (c, ci) {
        var y0 = ci * rowH + 4;
        parts.push('<text class="lbl" x="' + (labelW - 10) + '" y="' + (y0 + (rowH - 18) / 2 + 9) + '" text-anchor="end" dominant-baseline="middle">' + esc(c) + "</text>");
        S.forEach(function (s, si) {
          var v = s.values[ci], w = Math.max(2, (v / maxV) * plotW), y = y0 + si * 22;
          var tipHtml = '<div class="t-k">' + esc(c) + (S.length > 1 ? " · " + esc(s.name) : "") + '</div><div class="t-v">' + esc(fmt(v)) + "</div>";
          parts.push('<g data-tip="' + esc(tipHtml) + '"><rect class="hit" x="' + labelW + '" y="' + (y - 2) + '" width="' + plotW + '" height="22"></rect>' +
            '<path class="bar" fill="' + s.color + '" d="' + roundedBar(labelW, y, w, 18, 4, true) + '"></path>' +
            '<text class="val" x="' + (labelW + w + 8) + '" y="' + (y + 9) + '" dominant-baseline="middle">' + esc(fmt(v)) + "</text></g>");
        });
      });
      parts.push('<line class="baseline" x1="' + labelW + '" x2="' + labelW + '" y1="0" y2="' + H + '"></line>');
    } else {
      H = o.height || 260;
      var padL = 44, padB = 34, padT = 22, plotH = H - padB - padT, plotW2 = W - padL - 8;
      var ticks = 4;
      for (var t = 0; t <= ticks; t++) {
        var tv = (maxV / ticks) * t, ty = padT + plotH - (tv / maxV) * plotH;
        parts.push('<line class="grid-line" x1="' + padL + '" x2="' + W + '" y1="' + ty + '" y2="' + ty + '"></line>');
        parts.push('<text class="lbl" x="' + (padL - 8) + '" y="' + ty + '" text-anchor="end" dominant-baseline="middle">' + (o.tickFmt ? o.tickFmt(tv) : +tv.toFixed(2)) + "</text>");
      }
      var groupW = plotW2 / C.length, barW = Math.min(64, (groupW * 0.62) / S.length), gap = 2;
      C.forEach(function (c, ci) {
        var gx = padL + ci * groupW + (groupW - (barW * S.length + gap * (S.length - 1))) / 2;
        S.forEach(function (s, si) {
          var v = s.values[ci], h = Math.max(1, (v / maxV) * plotH), x = gx + si * (barW + gap), y = padT + plotH - h;
          var tipHtml = '<div class="t-k">' + esc(c) + (S.length > 1 ? " · " + esc(s.name) : "") + '</div><div class="t-v">' + esc(fmt(v)) + "</div>";
          parts.push('<g data-tip="' + esc(tipHtml) + '"><rect class="hit" x="' + (x - 4) + '" y="' + padT + '" width="' + (barW + 8) + '" height="' + plotH + '"></rect>' +
            '<path class="bar" fill="' + s.color + '" d="' + roundedBar(x, y, barW, h, 4, false) + '"></path>' +
            (o.labels === false ? "" : '<text class="val" x="' + (x + barW / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + esc(o.shortFmt ? o.shortFmt(v) : fmt(v)) + "</text>") + "</g>");
        });
        parts.push('<text class="lbl" x="' + (padL + ci * groupW + groupW / 2) + '" y="' + (H - 12) + '" text-anchor="middle">' + esc(c) + "</text>");
      });
      parts.push('<line class="baseline" x1="' + padL + '" x2="' + W + '" y1="' + (padT + plotH) + '" y2="' + (padT + plotH) + '"></line>');
    }
    svg = svg.replace("W H", W + " " + H) + parts.join("") + "</svg>";

    var legend = S.length > 1
      ? '<div class="legend">' + S.map(function (s) { return '<span><i style="background:' + s.color + '"></i>' + esc(s.name) + "</span>"; }).join("") + "</div>"
      : "";
    var table = '<details class="chart-table"><summary>View as table</summary><div class="table-wrap"><table><thead><tr><th></th>' +
      S.map(function (s) { return '<th class="num">' + esc(s.name) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      C.map(function (c, ci) {
        return "<tr><td>" + esc(c) + "</td>" + S.map(function (s) { return '<td class="num">' + esc(fmt(s.values[ci])) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div></details>";
    el.innerHTML = legend + '<div class="chart">' + svg + "</div>" + table;

    el.querySelectorAll("g[data-tip]").forEach(function (g) {
      g.addEventListener("mousemove", function (e) { showTip(g.getAttribute("data-tip"), e); });
      g.addEventListener("mouseleave", hideTip);
    });
  }
  window.PANDA.barChart = barChart;

  // Re-render charts at their new width so text stays legible on phones.
  var resizeTimer, lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var defs = window.PANDA.CHARTS || {};
      document.querySelectorAll("[data-chart]").forEach(function (el) {
        var d = defs[el.getAttribute("data-chart")];
        if (d) barChart(el, d);
      });
    }, 150);
  });

  // ---------- Toggle chips (dashboard tabs) ----------
  document.querySelectorAll("[data-tabs]").forEach(function (bar) {
    var scope = document.querySelector(bar.getAttribute("data-tabs"));
    var chips = bar.querySelectorAll(".chip");
    function select(key) {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-key") === key ? "true" : "false"); });
      scope.querySelectorAll("[data-panel]").forEach(function (p) {
        var keys = p.getAttribute("data-panel").split(" ");
        p.hidden = !(key === "all" || keys.indexOf(key) !== -1);
      });
      var defs = window.PANDA.CHARTS || {};
      scope.querySelectorAll("[data-chart]").forEach(function (el) {
        var d = defs[el.getAttribute("data-chart")];
        if (d && el.clientWidth) barChart(el, d);
      });
      try { localStorage.setItem("panda-tab", key); } catch (e) { /* storage unavailable */ }
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { select(c.getAttribute("data-key")); }); });
    var saved = null;
    try { saved = localStorage.getItem("panda-tab"); } catch (e) { /* storage unavailable */ }
    select(saved && bar.querySelector('[data-key="' + saved + '"]') ? saved : "all");
  });

  // ---------- Reveal on scroll ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.08 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });
})();
