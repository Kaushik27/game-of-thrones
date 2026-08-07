# Game of Thrones — Westeros Reference

A full interactive reference site for HBO's Game of Thrones (TV canon) — every character, every house, an interactive map, a season-by-season timeline, a battles database, quizzes, and a quote wall. All built as static, buildless multi-page HTML with vanilla JS and D3.js.

**[Live demo →](https://kaushik27.github.io/game-of-thrones/)**

![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3.js&logoColor=white)

## Pages

| Page | Description |
|---|---|
| [`index.html`](index.html) | Landing hub with site stats and links into every section |
| [`characters.html`](characters.html) | Searchable/filterable character directory, plus the full force-directed **Relations Graph** (pan/zoom/drag, house + relation-type filters, click-to-highlight) |
| [`character.html?id=`](character.html?id=jon-snow) | Per-character profile — avatar, bio, house, status, actor, full relations list, a scoped relations graph, and a personal timeline of major events |
| [`houses.html`](houses.html) | Directory of the Great Houses (and the Night's Watch / Free Folk) with sigil, words, and seat |
| [`house.html?id=`](house.html?id=Stark) | Per-house page — sigil, words, seat, a full family tree (D3 hierarchy, with marriages/allegiances/conflicts overlaid as cross-links), a house timeline, and a member roster |
| [`map.html`](map.html) | Stylized interactive SVG map of the Seven Kingdoms — hover a region for its ruling house, click to see its seat, characters, and history |
| [`timeline.html`](timeline.html) | Season-by-season event timeline, scrubbable by season and filterable by house/event type |
| [`battles.html`](battles.html) | Cards for major battles and events (Red Wedding, Battle of the Bastards, Battle of Winterfell, etc.) with combatants, outcome, casualties, and linked characters |
| [`quiz.html`](quiz.html) | Three replayable quiz modes — "Who Said It?", "Match the Sigil", and "Family Tree" — 10 questions per round with live scoring |
| [`quotes.html`](quotes.html) | Searchable, styled quote wall filterable by house |

## Dataset

Everything is driven by a shared, hand-curated dataset with no external API:

- **`js/data.js`** — 200+ characters (id, name, house, status, actor, bio, sigil color) and 440+ relations (family / marriage / allegiance / conflict / bond, with subtype and human-readable label), plus house metadata (words, seat, region)
- **`js/events.js`** — season-level timeline events, tagged by house and character, feeding the character pages, house pages, and the timeline explorer
- **`js/battles.js`** — major battles/events with combatants, outcome, and casualties
- **`js/quotes.js`** — famous character quotes, feeding both the quote wall and the quiz
- **`js/map-data.js`** — the Seven Kingdoms' regions, seats, and controlling houses
- **`js/common.js`** — shared helpers used by every page: nav rendering, avatar generation, relation lookups, BFS shortest-path, escaping utilities

## Running locally

No build step, no dependencies to install — every page is a static HTML file.

```bash
open index.html
```

or serve the directory (recommended, since some browsers restrict `fetch`/module behavior on `file://`):

```bash
python3 -m http.server 8000
```

All pages run fully offline after first load, aside from two CDN includes per page (D3.js and a Google Fonts stylesheet).

## Tech stack

- Vanilla JS + [D3.js v7](https://d3js.org/) (force simulation, tree layout, zoom/drag behaviors)
- Plain CSS (`css/theme.css`) — dark GoT theme, house color variables, responsive grid/card system, no framework
- Multiple static HTML pages sharing datasets via `<script src="js/*.js">` — no bundler, no npm

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (static upload, no build step).

## Design docs

Implementation plan and design spec for the original relations-explorer core live under [`docs/superpowers/`](docs/superpowers/).
