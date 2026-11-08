# Nibras · نبراس

**A bilingual AI study agent that turns a list of subjects and exam dates into a day-by-day plan, then helps you keep it.**

You talk to it in Arabic or English. It works out what you want, picks one of nine tools, runs it, and updates your schedule and calendar. Each step it takes appears in the chat as a short plain-language note ("Added subject: Python ✓"), so you see what it did without reading code.

**[Open Nibras](https://afnanaljohani.github.io/Afnan/nibras/)** · no install, no sign-in, works on phone and desktop.

[![Nibras teaser](assets/teaser-poster.jpg)](assets/nibras-teaser.mp4)

**[▶ Watch the 15-second teaser](assets/nibras-teaser.mp4)**

> **نبراس** وكيل ذكاء اصطناعي للمذاكرة، بالعربي والإنجليزي. تضيفين موادك وتواريخ اختباراتها، فيرتّب لك جدولاً يومياً، ويشغّل مؤقت التركيز، ويختبرك بأسئلة سيناريو، ويوريك كل خطوة يسويها بكلام واضح. ووضع الذكاء الاصطناعي اختياري بمفتاحك المجاني.

Nibras has two modes. **Instant mode** (the default) understands commands with fixed rules in the browser: no model, no key, no network. **AI mode** is opt-in: paste a free key and a real LLM reads your messages in any wording and calls the same nine tools through OpenAI-style function calling. If the model fails, Nibras falls back to instant mode.

---

## What it looks like

**The landing.** The site opens with the 15-second teaser (skippable, sound off until you turn it on), then the hero animates in: the name, one sentence on what it does, and a live demo of the agent at work. The light cone follows your pointer, sections rise into view as you scroll, and the footer signs off with a QR code to LinkedIn.

![Landing](assets/hero.png)

**The schedule.** Subjects on top, each with its exam date, days left, and difficulty. Below them, the plan the agent built, one row per day.

![Schedule](assets/desktop-ar.png)

**The agent at work.** Each request becomes a tool call. The chat shows it as a plain-language note with a ✓ when it succeeded; the reply underneath is written from the tool's result, not guessed.

![Agent trace](assets/agent-trace.png)

**The calendar.** January 2026 to April 2027 with Hijri months. Holidays are hatched, exam periods are shaded, your own exams are solid, and the dots on each day are the study sessions planned for it. Shown here in dark mode.

![Calendar](assets/calendar-dark.png)

**The focus timer.** 25, 45, or 90 minutes. When a session ends, its minutes are added to today and count toward your points.

![Focus timer](assets/focus.png)

**The daily quiz.** A scenario question on applied AI with a 30-second clock. After you answer, it marks the right option and explains why.

![Daily quiz](assets/quiz.png)

**Progress, in English.** One button switches the whole interface, direction included. The agent answers in the language of each message.

![Progress](assets/progress-en.png)

**The assistant.** A friendly robot in the corner. The first tap opens a welcome card that types its own introduction; after that it opens a chat with ready questions about how Nibras works, privacy, and who built it. Anything outside its scope is handed to the main agent with one tap.

![Assistant welcome](assets/assistant-welcome.png)

![Assistant chat](assets/assistant-chat.png)

**On a phone.** The same app, stacked into one column.

<img src="assets/mobile-en.png" width="320" alt="Mobile">

---

## How the agent works

```
message ──► understand ──► pick a tool ──► run it ──► reply
            (AR or EN)     (+ arguments)   (shown)    (from the result)
```

| You write | Tool | What happens |
|---|---|---|
| ضيف مادة Python اختبارها 20 ديسمبر صعبة | `add_subject` | Adds the subject and rebuilds the plan |
| Build my schedule | `build_schedule` | Spreads sessions over the days before each exam |
| وش أسوي اليوم؟ | `next_task` | Lists today's sessions |
| When is my next exam? | `next_exam` | Nearest exam and days left |
| شغّل مؤقت 45 | `start_timer` | Starts a focus session |
| Quiz me | `daily_challenge` | Serves a timed question |
| وش يعني RAG؟ | `explain_term` | Defines the term in your message's language |
| I'm done | `mark_done` | Marks today complete, updates the streak |
| وين وصلت؟ | `get_progress` | Days done, focus minutes, streak, accuracy |

Every command in this table was run in a headless browser, in both languages, before release.

### How the plan is built

For each day until the last exam, every subject that still has an exam ahead gets a score:

```
score = difficulty × (1 + 4 / days_until_exam) ÷ (sessions_so_far + 1)
```

The highest scores fill the day's slots (1, 2, or 3 per day, your choice). The day before an exam is always a review of that subject. Hard subjects and near exams get more time; no subject is starved, because each session already given lowers its next score.

Sessions are named after real topics when the subject is recognised (NLP, Generative AI, AI agents, deep learning, the AI engineer badge), and fall back to a general study cycle otherwise.

---

## AI mode

Open **⚡ Instant mode** in the chat header to switch it on.

| Provider | Base URL | Default model | Free key |
|---|---|---|---|
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.5-flash` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com/keys) |
| OpenRouter | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct:free` | [openrouter.ai](https://openrouter.ai/keys) |
| [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) (local) | `http://localhost:3001/v1` | `auto` | your unified key |
| Custom | any OpenAI-compatible `/v1` | any | — |

Model names change; edit the model field if a preset stops working.

**Using FreeLLMAPI.** FreeLLMAPI pools the free tiers of many providers behind one OpenAI-compatible endpoint on your own machine. Its CORS only allows listed origins, so start it with:

```bash
DASHBOARD_ORIGINS=https://afnanaljohani.github.io
```

then pick *FreeLLMAPI (local)* and paste your unified `freellmapi-…` key. FreeLLMAPI describes itself as for personal experimentation, so treat it as your own setup, not a public backend.

**How the loop works.** The nine tools are published as OpenAI tool schemas in [`tools.json`](tools.json). Each turn sends the conversation and the schemas to `/chat/completions`; when the model returns `tool_calls`, Nibras validates the arguments, runs the tool, sends the result back, and repeats, at most four rounds. The final text is rendered as escaped text.

### Why this design

The choice between a self-hosted router, bring-your-own-key, an in-browser model, and a public proxy holding one shared key was run through an [LLM council](https://github.com/aiwithremy/claude-skills-llm-council): five independent advisors, anonymous peer review, and a chairman's verdict. All five ruled out a public proxy (abuse and burned keys) and an in-browser model as the default (multi-GB download, weak Arabic tool calling). The verdict: bring-your-own-key as an opt-in mode on top of instant mode, presets so a visitor only pastes a key, FreeLLMAPI for the owner's own setup, the model owning routing in AI mode with rules as the fallback, and argument validation before any tool runs.

---

## Security

The review followed what [Strix](https://github.com/usestrix/strix) tests for: injection into the page, untrusted model output, and where secrets go.

- **No HTML from untrusted text.** Subject names, model replies and tool results are escaped before they reach the page. Model text gets only `**bold**`.
- **Tool arguments are validated.** Names are trimmed to 60 characters with control characters and `<>` removed, dates must be `YYYY-MM-DD` and not in the past, and minutes, levels and sessions must be from fixed lists. This runs for both modes. Unknown tools and malformed JSON are rejected. None of the nine tools deletes data.
- **Prompt injection.** The system prompt treats tool results and subject names as data. The end-to-end test feeds the loop a tool call with an `<img onerror>` name and a past date; it is rejected and nothing renders.
- **The key.** Kept in `sessionStorage` under `nibras:aiKey` and cleared when the tab closes, unless you tick *remember*. It is sent only in the `Authorization` header to the base URL you chose, with no referrer and no cookies. Use a free key you can revoke.
- **Content Security Policy.** Scripts must come from this page, and plugins, `<base>` and form posts are blocked. Network calls are limited to HTTPS and `localhost`.
- **Privacy.** Instant mode sends nothing anywhere. AI mode sends your messages and subject names to the provider you picked, and the panel says so.

To run Strix yourself (Docker and your own LLM key):

```bash
export STRIX_LLM="provider/model-name" LLM_API_KEY="your-key"
strix --target https://afnanaljohani.github.io/Afnan/nibras/
```

---

## About the data

- **Holidays and exam periods** come from a training-program timetable for 2026–2027. Exam entries are intentionally generic: the calendar says *exam* or *exam period*, never the subject or the institution.
- **Your data** (subjects, sessions, minutes, answers) is stored only in your own browser with `localStorage`. Nothing is sent anywhere.

---

## Run it locally

There is no build step. `index.html` is the whole app.

```bash
git clone --branch gh-pages --depth 1 https://github.com/AfnanAljohani/Afnan.git
cd Afnan/nibras
python3 -m http.server 8000
# open http://localhost:8000
```

### Tests

```bash
npm install
npm test
```

This loads the page headlessly, sends 18 commands in Arabic and English, checks that each one reaches the right tool, and fails if any raw tool output appears in the chat.

```
nibras/
├── index.html        # HTML + CSS + JavaScript, one file
├── tools.json        # the nine tools as OpenAI function schemas
├── tests/            # headless agent test
├── assets/           # screenshots, teaser, link preview
├── CLAUDE.md         # notes for AI coding assistants working on this folder
├── README.md
└── LICENSE           # MIT
```

---

## Next

- An Arabic tool-calling eval: 20 prompts, tool-selection accuracy per model
- Move Nibras to its own repository so its storage is not shared with other pages
- Export the plan to Google Calendar (`.ics`)
- More quiz questions, grouped by topic
- Optional sync between devices

---

Design by **Afnan Aljohani** — AI & Data Science Engineer · [LinkedIn](https://www.linkedin.com/in/afnan-aljohani-0b5a70315/)
