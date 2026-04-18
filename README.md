# Helldivers 2 — Major Orders Dashboard

A complete, standalone record of every **Major Order** issued in Helldivers 2 since launch (February 2024 to present). 153 operations logged with outcomes, factions, and in-game briefing text.

**Live site →** [mimosadaddy.github.io/hd2](https://mimosadaddy.github.io/hd2)

---

## What is this?

A single-page reference for the full arc of the Second Galactic War — wins, losses, close calls, and story milestones — rendered as a declassified military archive.

No frameworks. No build step. One HTML file.

---

## Data Sources

### Primary — Community Spreadsheet
The canonical order list comes from a [human-verified Google Sheet](https://docs.google.com/spreadsheets/d/12ji8TsaKG1u3zoicuQ7qSSm10XNrBZf9V4gR84GZNuU/edit?gid=0#gid=0) maintained by Reddit user **u/Sad-Needleworker-590**, who tracks every operation manually as the game progresses. This provides operation names, faction assignments, and outcomes (153 Major Orders, 18 Minor Orders, and 1 Strategic Opportunity as of April 2026).

> The spreadsheet is human-verified — someone is tracking each order in real time and logging the result, which makes it more robust than any automated scraper.

### Secondary — Dispatch API
Briefing text and exact dates are cross-referenced against the [helldivers2.dev dispatch API](https://api.helldivers2.dev), which archives the in-game dispatch messages sent to players during each order. Coverage starts March 13, 2024 (dispatch ID 2797). Orders before that date have null briefings.

### Additional References
- [helldivers.wiki.gg — Major Orders](https://helldivers.wiki.gg/wiki/Major_Orders)
- [helldivers.fandom.com — Major Orders](https://helldivers.fandom.com/wiki/Major_Orders)
- Galactic War Timeline (Google Doc, maintained by Herald/Cobfish)

---

## Methodology

### What counts as a Major Order?
Only Major Orders — the primary war objectives issued by High Command — are listed. Multi-phase operations (e.g. *Operation Swift Disassembly*, *Operation Valid Pretext*) count each phase separately, matching community convention. Strategic Opportunities and Minor Orders are excluded.

### Dates
All dates are **real-world dates**, not in-universe dates. The in-game calendar runs ~160 years ahead:

| In-game year | Real year |
|---|---|
| 2184 | 2024 |
| 2185 | 2025 |
| 2186 | 2026 |

Exact dates come from dispatch API timestamps where available. Early Feb–Mar 2024 orders predate the API archive and use approximate month-level dates.

### Win Rate Formula
Win rate matches the community spreadsheet formula:

```
Win Rate = (Victories + 0.5 × Aborted) ÷ Concluded
```

- **Aborted** orders (cancelled before a clear outcome) count as half a win
- The currently **active** order is excluded from the denominator until it resolves
- As of April 2026: `(112 + 0.5 × 2) / 152 = 74.34%`

---

## Features

- Filter by result (Victories / Defeats) and faction (Terminids / Automatons / Illuminate / Multi-front)
- Live stat counters: total orders, wins, losses, win rate
- Year dividers with in-universe year labels (2184 / 2185 / 2186)
- In-game briefing text per order (where available from dispatch API)
- About & Methodology panel
- Sources panel with attribution links
- Faction breakdown cards
- Galaxy map (sector overview)
- Mobile responsive

---

## Tech Stack

- **Pure HTML/CSS/JS** — single file, zero dependencies
- **Google Fonts** via `@import` — Share Tech Mono, Barlow Condensed, Barlow
- **GitHub Pages** compatible — no build step needed

---

## Deployment (GitHub Pages)

1. Fork or clone this repo
2. Go to **Settings → Pages → Source**: Deploy from branch → `main` / root
3. Live at `https://yourusername.github.io/hd2/`

No build step, no bundler, no Node.js required.

---

## Local Development

```bash
npx serve -l 4444 .
# → http://localhost:4444
```

Or just open `index.html` directly in a browser.

---

## License

Data sourced from community-maintained records. Dashboard code is MIT.
