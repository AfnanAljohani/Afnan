# Nibras

A bilingual (Arabic/English) AI study agent. One static page served by GitHub Pages from the `gh-pages` branch of `AfnanAljohani/Afnan`, folder `nibras/`. Live: https://afnanaljohani.github.io/Afnan/nibras/

## Layout
- `index.html` holds everything: CSS tokens at the top, markup, then one script.
- Script sections, in order: i18n (`TX.ar`, `TX.en`), calendar data, knowledge (tracks, glossary, quiz), state (`nibras.v2` in localStorage), scheduler, `TOOLS` (the nine tools), `route()` rule-based intents, `reply()`, action chips, AI mode (`TOOL_SCHEMAS`, `checkArgs`, `llmTurn`), intro film, hero, assistant widget, boot.
- `tools.json` mirrors `TOOL_SCHEMAS`. Change both together.

## Rules
- Never show code or raw JSON to visitors. Tool activity is shown as plain-language chips (`actionChip`), never as `→ call(...)`.
- Every string the visitor sees exists in both `TX.ar` and `TX.en`. Arabic is the default and the page is RTL.
- Escape anything not written by us before it reaches `innerHTML` (`esc`, `mdLite`).
- Validate tool arguments in `checkArgs` before any tool runs, including ones from the rule router.
- Fonts: Reem Kufi for display, IBM Plex Sans Arabic for text, IBM Plex Mono for numbers. Do not add other fonts.
- No build step and no external scripts; the CSP only allows inline and same-origin scripts.
- The API key lives in `sessionStorage` (`nibras:aiKey`) unless the visitor ticks remember. Never log it or send it anywhere but the chosen base URL.

## Checks before pushing
- `npm test` (18 commands must route correctly and no raw tool output may appear).
- Open the page at phone width (390px) and check there is no sideways scroll.
