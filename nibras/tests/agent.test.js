// Runs Nibras headlessly and checks that every documented command reaches the right tool.
// Usage: npm i -D jsdom@24 && node tests/agent.test.js
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const CASES = [
  ["ضيف مادة Python اختبارها 20 ديسمبر صعبة", "add_subject"],
  ["Build my schedule", "build_schedule"],
  ["وش أسوي اليوم؟", "next_task"],
  ["When is my next exam?", "next_exam"],
  ["شغّل مؤقت 45", "start_timer"],
  ["Quiz me", "daily_challenge"],
  ["وش يعني RAG؟", "explain_term"],
  ["What is RAG?", "explain_term"],
  ["I'm done", "mark_done"],
  ["وين وصلت؟", "get_progress"],
  ["Add subject Statistics, exam Jan 3 easy", "add_subject"],
  ["رتّب لي جدول", "build_schedule"],
  ["متى اختباري الجاي؟", "next_exam"],
  ["Start a 45 min timer", "start_timer"],
  ["اختبرني", "daily_challenge"],
  ["خلصت", "mark_done"],
  ["Show my progress", "get_progress"],
  ["What should I do today?", "next_task"],
];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://afnanaljohani.github.io/Afnan/nibras/",
  beforeParse(w) { w.matchMedia = () => ({ matches: true, addEventListener() {} }); w.HTMLMediaElement.prototype.play = () => Promise.resolve(); w.HTMLMediaElement.prototype.pause = () => {}; } });
const w = dom.window, d = w.document;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await sleep(300);
  for (const [text] of CASES) { d.getElementById("q").value = text; d.getElementById("ask").dispatchEvent(new w.Event("submit", { cancelable: true })); await sleep(30); }
  await sleep(800);
  const chips = [...d.querySelectorAll(".act")];
  let fail = 0;
  CASES.forEach(([text, want], i) => { const got = chips[i] && chips[i].dataset.tool, ok = got === want && chips[i].classList.contains("good"); if (!ok) fail++; console.log(ok ? "✓" : "✗", want.padEnd(16), got || "none", "·", text); });
  const leaked = /→ |← \{|"ok":/.test(d.getElementById("log").textContent);
  console.log(leaked ? "✗ raw tool output is visible in the chat" : "✓ no raw tool output in the chat");
  console.log(`${CASES.length - fail}/${CASES.length} commands routed correctly`);
  process.exit(fail || leaked ? 1 : 0);
})();
