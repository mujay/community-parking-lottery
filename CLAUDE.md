# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Pure-frontend parking-spot lottery tool (community use). No build system, no bundler, no framework, no tests. Open `index.html` in a browser and it runs.

## Common commands

Serve locally (any one):

```bash
python3 -m http.server 8080      # http://localhost:8080
npx http-server -c-1             # cache disabled, http://127.0.0.1:8080
```

There is no build, lint, or test runner configured. AGENTS.md describes a manual smoke test: open the app, switch theme + language, add ranges/singles to all three lists, run lottery, verify history and clipboard copy.

## Architecture

`index.html` loads scripts in a **fixed order** that matters — later files depend on globals defined earlier:

```
config.js        → ParkingConfig (defaults, settings)
translations.js  → Translations  ({ zh, en } message bundles)
templates.js     → Templates     (HTML string builders)
number-manager.js→ NumberManager (list/state primitive)
script.js        → ParkingLotterySystem (entry, instantiates window.lottery)
```

`script.js` registers `window.lottery` (alias `window.lotterySystem`) on `DOMContentLoaded`. **Inline `onclick="lottery.…"` handlers are emitted by both `index.html` (the seed exclude tags) and `templates.js` / `number-manager.js` (every dynamically rendered tag, copy button, paginator, history row).** Renaming the global, removing methods like `removeLotteryNumber` / `removeParkingNumber` / `removeExcludeNumber` / `showResultPage` / `showHistoryDetails` / `copyCSV` / `copyParkingNumbers`, or changing their signatures will silently break the UI — there is no static checker to catch it.

### The three NumberManager instances

`script.js` constructs three `NumberManager`s for the three lists (lottery numbers, parking spots, excluded spots). They are decoupled but wired together at init:

- `parkingManager.setExcludeChecker((n) => excludeManager.includes(n))` makes excluded spots render with the 🚫 indicator inside the parking list.
- After any change to `excludeManager`, `script.js` must call `parkingManager.updateDisplay()` to refresh those indicators (see `addExcludeRange` / `addExcludeSingle` / `addExcludeBatch` / `removeExcludeNumber` / `resetExcludeNumbers`).
- `NumberManager.numberType` is the Chinese label (`'抽籤號碼' | '車位號碼' | '排除車位'`) and is used both as a string key for translation lookups (`<numberType>-count`) AND to pick the inline `onclick` remove-handler name. Don't translate it or rename it — it's effectively an enum.

### Lottery algorithm

`ParkingLotterySystem.conductLottery` (script.js) uses Fisher–Yates (`shuffleArray`). When `lotteryNumbers.length > availableSpots.length`, it randomly trims the lottery list down to the available count and records a `note` string. Available spots = `parkingManager` minus `excludeManager`.

### Persistence and migration

- `localStorage['parkingLotteryHistory']` — last 20 lottery records (newest first).
- `localStorage['theme']` — `'japanese' | 'github'`.
- `localStorage['language']` — `'zh' | 'en'`.

`migrateHistoryData()` rewrites legacy records that used `zoneResults: { aZone, bZone }` into the current flat `results: [{ lotteryNumber, parkingSpot }]` shape. Keep this migration in place; users in the wild still have old localStorage payloads.

### i18n

`Translations` has two top-level keys: `zh` (which means zh-TW) and `en`. `script.js#getText` falls back to the key itself when missing. AGENTS.md requires: any UI string change MUST add a `zh` entry; if `en` already exists for that key, update it too. Use `getText('locale-code')` (returns `zh-TW` or `en-US`) when calling `toLocaleString`.

### Stale / unused files

`script-old.js` and `script-optimized.js` are NOT loaded by `index.html`. They are historical copies of `script.js`. Edit only `script.js` unless explicitly asked to touch the others.

## Conventions (from AGENTS.md)

- JS: 4-space indent, semicolons required, single quotes, < 120 cols.
- Filenames: kebab-case for JS modules; lowercase for HTML/CSS.
- Identifiers: `PascalCase` for classes and config singletons (`ParkingLotterySystem`, `NumberManager`, `ParkingConfig`); `camelCase` for variables and functions.
- DOM: prefer existing `id` selectors and `data-*` attributes already present in `index.html`.
- Default to `data-i18n` attributes on any new user-facing element.
- Avoid adding dependencies — keep the static, no-framework architecture.

## Commit and PR conventions

- Conventional Commits: `feat:`, `fix:`, `ref:`, `docs:`. Messages may be in Traditional Chinese.
- PRs should describe manual test steps (Chrome + Safari × `zh`/`en` × `japanese`/`github`), and call out any `translations.js` keys or `ParkingConfig.defaultExcludedSpots` changes. Screenshots expected for UI changes (both themes, both languages).

## Default excluded spots

`ParkingConfig.defaultExcludedSpots` in `config.js` lists the building's accessibility spots (191–195) and EV-scooter spots (313–322). Per AGENTS.md, changes here need a justification in the PR.
