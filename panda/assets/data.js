/* Phase 2 chart data — extracted from PANDA_Phase2_Data_Understanding_v2.pptx */
(function () {
  "use strict";
  var S1 = "#14a39a", S2 = "#e0623a";
  var pct = function (v) { return v.toFixed(2) + "%"; };
  var CHARTS = {
    "stockout-split": {
      title: "Stockout_Flag distribution", horizontal: true, labelWidth: 120,
      categories: ["In stock (0)", "Stockout (1)"],
      series: [{ name: "Records", color: S1, values: [974587, 25413] }],
      shortFmt: function (v) { return (v / 1000).toFixed(0) + "k"; }
    },
    "missing": {
      title: "Missing values (% of 1,000,000 records)", horizontal: true, labelWidth: 200, max: 10,
      categories: ["Supplier_Fill_Rate", "Remaining_Shelf_Life", "Store_Footfall"],
      series: [{ name: "Missing %", color: S1, values: [8.03, 5.02, 4.02] }], fmt: pct
    },
    "waste-shelf": {
      title: "Mean waste per record by remaining shelf life",
      categories: ["2 days left", "3 days left", "4–29 days"],
      series: [{ name: "Mean waste (units)", color: S1, values: [7.29, 0.66, 0.66] }],
      fmt: function (v) { return v.toFixed(2) + " units"; }, shortFmt: function (v) { return v.toFixed(2); }
    },
    "waste-cover": {
      title: "Mean waste by inventory ÷ (units sold + 1), quintile",
      categories: ["Q1 (≤ 0.80)", "Q3 (1.17–1.55)", "Q5 (1.93–2.50)"],
      series: [
        { name: "2 days left", color: S2, values: [2.99, 6.65, 13.36] },
        { name: "3–29 days", color: S1, values: [0.2, 0.59, 1.31] }
      ],
      fmt: function (v) { return v.toFixed(2) + " units"; }, shortFmt: function (v) { return v.toFixed(2); }
    },
    "promo-units": {
      title: "Median units sold per record",
      categories: ["No promotion", "Promotion"],
      series: [{ name: "Median units", color: S1, values: [16, 25] }],
      fmt: function (v) { return v + " units"; }, shortFmt: String
    },
    "footfall-units": {
      title: "Mean units sold by footfall quintile",
      categories: ["Lowest footfall (Q1)", "Highest footfall (Q5)"],
      series: [{ name: "Mean units", color: S1, values: [12.9, 40.9] }],
      fmt: function (v) { return v.toFixed(1) + " units"; }, shortFmt: function (v) { return v.toFixed(1); }
    },
    "promo-onhand": {
      title: "Mean units on hand during promotions",
      categories: ["Stockout records", "In-stock records"],
      series: [{ name: "Mean on hand", color: S1, values: [18.33, 53.85] }],
      fmt: function (v) { return v.toFixed(2) + " units"; }, shortFmt: function (v) { return v.toFixed(1); }
    },
    "category-stockout": {
      title: "Stockout rate range by segment (%)", horizontal: true, labelWidth: 150, max: 5,
      categories: ["Lead time 1–14 d", "Categories (6)", "Weekdays", "Months", "Stores (1,000)"],
      series: [
        { name: "Lowest", color: S1, values: [2.46, 2.37, 2.42, 2.47, 1.1] },
        { name: "Highest", color: S2, values: [2.62, 2.65, 2.65, 2.65, 4.4] }
      ], fmt: pct
    },
    "spearman": {
      title: "Strongest Spearman associations (ρ)", horizontal: true, labelWidth: 200, max: 1,
      categories: ["On_Hand ↔ Units_Sold", "Sales_Value ↔ Units_Sold", "On_Hand ↔ Sales_Value", "On_Hand ↔ Waste", "Units_Sold ↔ Waste", "Units_Sold ↔ Footfall"],
      series: [{ name: "ρ", color: S1, values: [0.876, 0.801, 0.728, 0.670, 0.588, 0.440] }],
      fmt: function (v) { return v.toFixed(3); }
    },
    "category-records": {
      title: "Records per category (raw labels)", horizontal: true, labelWidth: 150,
      categories: ["Grocery", "Produce", "Meat", "Dairy", "Frozen", "Bakery", "' produce ' variant"],
      series: [{ name: "Records", color: S1, values: [166459, 166451, 166441, 166416, 165706, 165500, 3027] }],
      shortFmt: function (v) { return v.toLocaleString("en-US"); }
    }
  };
  window.PANDA.CHARTS = CHARTS;
  document.querySelectorAll("[data-chart]").forEach(function (el) {
    var def = CHARTS[el.getAttribute("data-chart")];
    if (def) window.PANDA.barChart(el, def);
  });
})();
