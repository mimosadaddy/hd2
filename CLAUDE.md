# Helldivers 2 — Major Orders Tracker

## Project overview

A standalone, zero-dependency HTML page that displays the full record of Helldivers 2 Major Orders from launch (Feb 2024) to present. The goal is a dark, military-record aesthetic — think declassified war archive, not a generic web app. It should feel like something Super Earth High Command would actually use.

The page lives at `helldivers2-major-orders.html` and is intended for GitHub Pages deployment (no build step, no framework, no bundler).

---

## Tech stack

- **Pure HTML/CSS/JS** — single file, no dependencies, no CDN imports
- **Google Fonts** via `@import` — currently: Share Tech Mono, Barlow Condensed, Barlow
- **No frameworks** — vanilla JS only
- **GitHub Pages** compatible — just drop the file in the repo root

---

## Design language

The aesthetic is "declassified military archive meets sci-fi terminal". Key principles:

- **Dark theme only** — background `#0a0b0c`, surfaces `#111214`
- **Scanline texture** — subtle repeating-linear-gradient overlay on `body::before`
- **Accent color** — muted gold `#c8a84b` (used for Super Earth insignia, active states, year dividers)
- **Monospace labels** — Share Tech Mono for all metadata, dates, badges, column headers
- **Condensed display** — Barlow Condensed for objective names and h1
- **Color-coded factions:**
  - Terminids — amber/orange (`#e8a056`)
  - Automatons — blue (`#56a8e8`)
  - Illuminate — purple (`#9a7ae0`)
  - Multi-front — green (`#7aaa7a`)
- **Color-coded results:**
  - Victory — green (`#8ecf94`)
  - Defeat — red (`#d98080`)
  - Partial — amber (`#d4a84b`)

---

## Data structure

All order data lives in the `orders` array in the `<script>` block. Each entry:

```js
{
  n: 1,                  // sequential order number
  year: 2024,            // real-world year (used for year-divider rows)
  date: "Feb 2024",      // human-readable approximate date
  name: "Objective text",// the MO name/description
  enemy: "Terminid",     // one of: "Terminid", "Automaton", "Illuminate", "Multi"
  result: "win",         // one of: "win", "loss", "partial"
  note: "Context..."     // short lore/outcome note shown in the last column
}
```

**Adding new orders**: append to the `orders` array. The table re-renders automatically. Year dividers are inserted automatically when `o.year` changes.

---

## Current features

- Filter buttons: All / Victories / Defeats / Terminids / Automatons / Illuminate
- Live stat counters in header: total orders, wins, losses, win rate
- Year dividers between 2024 / 2025 / 2026 rows (with in-universe year labels: 2184 / 2185 / 2186)
- Notes column hidden on mobile (max-width: 640px)
- Hover state on table rows

---

## Possible next features (ideas for Claude Code)

- **Search / text filter** — filter by objective name keyword
- **Sort** — click column headers to sort by date, result, faction
- **Expand row** — click a row to expand full lore notes in a detail panel
- **Win/loss chart** — small bar or timeline chart above the table (Chart.js or D3)
- **Export** — download filtered data as CSV
- **Faction win rate cards** — breakdown stats per faction
- **Last updated timestamp** — auto-injected from git or a static date field
- **Keyboard navigation** — arrow keys to move between rows

---

## File structure (if expanded into multi-file)

```
/
├── index.html              # rename helldivers2-major-orders.html to this for GH Pages root
├── data/
│   └── orders.js           # export the orders array if splitting data from UI
├── style.css               # extract CSS if file gets large
└── README.md
```

For now everything stays in one file.

---

## Sources

Data compiled from:
- helldivers.wiki.gg/wiki/Major_Orders (and /Major_Orders_of_2024, /Major_Orders_of_2025)
- helldivers.fandom.com/wiki/Major_Orders
- Community Galactic War Timeline (Google Doc, maintained by Herald/Cobfish)
- Various news coverage (Screen Rant, Game Rant, FandomWire, GamesRadar)

Note: Early Feb–Mar 2024 orders have limited documentation due to missing community records from that period. Dates are approximate real-world dates, not in-universe dates.

---

## GitHub Pages deployment

1. Create a new repo (e.g. `hd2-major-orders`)
2. Add `helldivers2-major-orders.html` — rename to `index.html` if you want it at the root URL
3. Go to Settings → Pages → Source: Deploy from branch → `main` / `root`
4. Live at `https://yourusername.github.io/hd2-major-orders/`

No build step needed.
