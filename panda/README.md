# PANDA · Fresh Food Demand & Inventory Optimization

Website and dashboard for the academic project (EWA · InnovatiCS · Group 10) covering Phase 2 (Data Understanding) and Phase 3 (Data Preparation).

- `index.html` / `en.html` — presentation website in Arabic (RTL) and English: the business problem, the project journey, Phase 2 and Phase 3.
- `dashboard.html` / `dashboard-en.html` — dashboard in Arabic and English with four views: executive overview, Phase 2, Phase 3, and an interactive explorer.

Every page has a language switch (العربية / English) that opens the same page in the other language.
- `data/sample.js` — compact version of `PANDA_sample_10000.csv` (10,000 records, a 1% sample of the 1,000,000-record file) that drives the explorer.

The headline figures (overview, Phase 2 and Phase 3) come from the full 1,000,000-record file, as reported in the phase decks. The explorer computes everything live from the 10k sample, and it includes a table comparing the sample with the full file.

To run locally: `python3 -m http.server` inside `panda/`, then open `http://localhost:8000`.

The data are synthetic and for academic use only. They are not official Panda KPIs.
