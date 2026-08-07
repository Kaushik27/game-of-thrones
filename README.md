# Game of Thrones — Westeros Reference

A cinematic, interactive reference site for HBO's *Game of Thrones* (TV canon) — a living War Table, season-aware Westeros map, 196-character archive, Great Houses, timeline, battles, quizzes, and quote wall. Built as a single-page app with vanilla JavaScript and D3.js. No build step, framework, or npm runtime.

**[Live demo →](https://kaushik27.github.io/game-of-thrones/)**

![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3.js&logoColor=white)

## Routes

Everything lives under one shell ([`index.html`](index.html)) with a hash-based client-side router ([`js/app.js`](js/app.js)) — deep links work directly (no server config needed on GitHub Pages) and browser back/forward navigate between routes natively.

| Route | Description |
|---|---|
| [`#/`](https://kaushik27.github.io/game-of-thrones/#/) | Interactive **War Table** with real actor portraits, a relationship constellation, battle dispatches, and a Season 1–8 power rail |
| [`#/characters`](https://kaushik27.github.io/game-of-thrones/#/characters) | Searchable/filterable character directory, plus the full force-directed **Relations Graph** (pan/zoom/drag, house + relation-type filters, click-to-highlight) |
| [`#/character/:id`](https://kaushik27.github.io/game-of-thrones/#/character/jon-snow) | Per-character profile — gradient house-color avatar, bio, house, status, actor, full relations list, a scoped relations graph, and a personal timeline of major events |
| [`#/houses`](https://kaushik27.github.io/game-of-thrones/#/houses) | Directory of the Great Houses (and the Night's Watch / Free Folk) with an original SVG sigil mark, words, and seat |
| [`#/house/:name`](https://kaushik27.github.io/game-of-thrones/#/house/Stark) | Per-house page — sigil, words, seat, a full family tree (D3 hierarchy with fit-to-view zoom/pan, marriages/allegiances/conflicts overlaid as cross-links, unlinked members listed separately), a house timeline, and a member roster |
| [`#/map`](https://kaushik27.github.io/game-of-thrones/#/map) | **Living Realm** map with Season 1–8 controls, source-grounded event/battle hotspots, region details, keyboard exploration, and pan/zoom controls |
| [`#/timeline`](https://kaushik27.github.io/game-of-thrones/#/timeline) | Season-by-season event timeline, scrubbable by season and filterable by house/event type |
| [`#/battles`](https://kaushik27.github.io/game-of-thrones/#/battles) | Cards for major battles and events (Red Wedding, Battle of the Bastards, Battle of Winterfell, etc.) with combatants, outcome, casualties, and linked characters |
| [`#/quiz`](https://kaushik27.github.io/game-of-thrones/#/quiz) | Three replayable quiz modes — "Who Said It?", "Match the Sigil", and "Family Tree" — 10 questions per round with live scoring and correct/incorrect answer feedback |
| [`#/quotes`](https://kaushik27.github.io/game-of-thrones/#/quotes) | Searchable, styled quote wall filterable by house |

## Dataset

Everything is driven by a shared, hand-curated dataset with no external API:

- **`js/data.js`** — 196 characters and 437 relations (family / marriage / allegiance / conflict / bond), plus house metadata
- **`js/events.js`** — season-level timeline events, tagged by house and character, feeding the character pages, house pages, and the timeline explorer
- **`js/battles.js`** — major battles/events with combatants, outcome, and casualties
- **`js/quotes.js`** — famous character quotes, feeding both the quote wall and the quiz
- **`js/map-data.js`** — the Seven Kingdoms' regions as SVG landmass paths, seats, and controlling houses
- **`js/sigils.js`** — original line-art SVG sigil marks per house (direwolf, lion, dragon, stag, kraken, rose, sun-spear, trout, falcon-moon, crossed-swords)
- **`js/common.js`** — shared helpers: nav rendering, avatar generation, relation lookups, BFS shortest-path, scroll-reveal, escaping utilities
- **`js/app.js`** — the hash router and every route's render function
- **`js/war-table.js`** — season-driven relationship constellation and battle dispatches
- **`js/living-realm-map.js`** — accessible seasonal map controller and source-grounded hotspots
- **`js/raven-search.js`** — keyboard-first search across characters, houses, events, battles, and quotes
- **`js/actor-photos.js`** — 133 verified, locally hosted actor portraits with source and license records in [`CREDITS.md`](CREDITS.md)

## Running locally

No build step, no dependencies to install.

```bash
python3 -m http.server 8000
```

Hash routing needs an HTTP server (not `file://`) for the initial-load JS to behave consistently across browsers — open `http://localhost:8000/`.

## Tech stack

- Vanilla JS + [D3.js v7](https://d3js.org/) (force simulation, tree layout, zoom/drag behaviors) loaded once in the shell
- A hand-rolled hash router (`js/app.js`) — no framework, no npm, no bundler
- Plain CSS — a responsive blackened-stone War Table system, Cinzel display type, accessible focus states, reduced-motion support, and no framework

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (static upload, no build step — the SPA needs none).

## Design docs

Implementation plan and design spec for the original relations-explorer core live under [`docs/superpowers/`](docs/superpowers/).
