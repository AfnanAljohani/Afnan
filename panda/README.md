# PANDA Team — Fresh Food Demand & Inventory Optimization

Project website and dashboard for **AI-Powered Fresh Food Demand & Inventory Optimization**
(EWA · InnovatiCS · Group 10), following the six CRISP-DM phases.

| Page | Content |
|------|---------|
| `index.html` | Overview, problem, phase roadmap, team |
| `phase-1.html` … `phase-6.html` | One page per phase |
| `dashboard.html` | Project progress + Phase 2 indicators (interactive charts) |
| `files.html` | Deliverables grouped by phase (stored in `files/`) |

Static HTML/CSS/JS with no build step. Open `index.html` directly or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Updating

- **Phase status / progress** — edit the `PHASES` list in `assets/app.js`
  (feeds the home roadmap, the pager and the dashboard progress table).
- **Charts** — edit the data in `assets/data.js`; place a chart with `<div data-chart="key"></div>`.
- **Files** — add to `files/`, then link it from `files.html` and the phase page.
