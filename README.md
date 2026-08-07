# Game of Thrones — The Living Encyclopedia

A cinematic, interactive reference site for HBO's *Game of Thrones* (TV canon). Explore an eight-season 3D journey, investigate 196 people and 437 documented ties, browse all 73 episodes, follow character journeys across a layered world atlas, and open 24 connected lore dossiers. Built as a static single-page app with vanilla JavaScript, an incremental React shell, Three.js, and D3.js.

**[Live demo →](https://kaushik27.github.io/game-of-thrones/)**

![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3.js&logoColor=white)

## Routes

Everything lives under one shell ([`index.html`](index.html)) with a hash-based client-side router ([`js/app.js`](js/app.js)) — deep links work directly (no server config needed on GitHub Pages) and browser back/forward navigate between routes natively.

| Route | Description |
|---|---|
| [`#/`](https://kaushik27.github.io/game-of-thrones/#/) | Scroll-driven **Cinematic Explore** prologue (ice → fire → realm → arrival) with original in-world visual studies, canon quotes, story-moment links, and a canvas portal handoff into the eight-season **Realm Journey** with 24 story chapters, 3D terrain and routes, character/place/battle markers, keyboard controls, and an image fallback for devices without WebGL |
| [`#/characters`](https://kaushik27.github.io/game-of-thrones/#/characters) | Cinematic **People Intelligence** with curated spotlights, season-aware records, a searchable archive, relationship constellation, dossiers, and two-person connection comparisons |
| [`#/character/:id`](https://kaushik27.github.io/game-of-thrones/#/character/jon-snow) | Per-character profile — a four-chapter cinematic entrance (identity, voice, turning point, dossier), actor portrait, shareable `?chapter=` deep links, full relations list, a scoped relations graph, and a personal timeline of major events |
| [`#/houses`](https://kaushik27.github.io/game-of-thrones/#/houses) | Directory of the Great Houses (and the Night's Watch / Free Folk) with an original SVG sigil mark, words, and seat |
| [`#/house/:name`](https://kaushik27.github.io/game-of-thrones/#/house/Stark) | Per-house page — sigil, words, seat, a full family tree (D3 hierarchy with fit-to-view zoom/pan, marriages/allegiances/conflicts overlaid as cross-links, unlinked members listed separately), a house timeline, and a member roster |
| [`#/map`](https://kaushik27.github.io/game-of-thrones/#/map) | Layered **Worlds in Motion** atlas with Season 1–8 controls, a playable Winterfell → Wall → King's Landing → Meereen → Beyond the Wall road film, and four connected views: interactive geography, character journeys, power records, and regional lore |
| [`#/timeline`](https://kaushik27.github.io/game-of-thrones/#/timeline) | Complete **Episode Atlas** spanning all 73 episodes, with season filmstrips, search, themes, consequences, people, houses, battles, quotes, and provenance |
| [`#/episode/:id`](https://kaushik27.github.io/game-of-thrones/#/episode/s06e09) | Direct link to a selected episode inside the Episode Atlas |
| [`#/lore`](https://kaushik27.github.io/game-of-thrones/#/lore) | Searchable **Living Lore Library** with 24 TV-canon dossiers across politics, factions, faiths, magic, artifacts, and prophecy |
| [`#/battles`](https://kaushik27.github.io/game-of-thrones/#/battles) | Cards for major battles and events (Red Wedding, Battle of the Bastards, Battle of Winterfell, etc.) with combatants, outcome, casualties, and linked characters |
| [`#/quiz`](https://kaushik27.github.io/game-of-thrones/#/quiz) | Three replayable quiz modes — "Who Said It?", "Match the Sigil", and "Family Tree" — 10 questions per round with live scoring and correct/incorrect answer feedback |
| [`#/quotes`](https://kaushik27.github.io/game-of-thrones/#/quotes) | **Voices of the Realm** — a daily-rotating cinematic interlude for powerful lines, episode context when explicitly indexed, mood collections, speaker portraits, house/season filters, deep links, copy, and remembered lines |

## Dataset

Everything is driven by a shared, hand-curated dataset with no external API:

- **`js/data.js`** — 196 characters and 437 relations (family / marriage / allegiance / conflict / bond), plus house metadata
- **`js/episodes.js`** — all 73 TV episodes with credits, dates, runtimes, original summaries, themes, character links, canonical event links, and source notes
- **`js/events.js`** — season-level timeline events, tagged by house and character, feeding the character pages, house pages, and the timeline explorer
- **`js/battles.js`** — major battles/events with combatants, outcome, and casualties
- **`js/quotes.js`** — 44 famous character quotes, feeding the Voices archive and the quiz
- **`js/quote-curation.js`** — immutable featured voices and editorial collections for power, identity, duty, survival, and freedom
- **`js/map-data.js`** — the Seven Kingdoms' regions as SVG landmass paths, seats, and controlling houses
- **`js/sigils.js`** — original line-art SVG sigil marks per house (direwolf, lion, dragon, stag, kraken, rose, sun-spear, trout, falcon-moon, crossed-swords)
- **`js/common.js`** — shared helpers: nav rendering, avatar generation, relation lookups, BFS shortest-path, scroll-reveal, escaping utilities
- **`js/app.js`** — the hash router and every route's render function
- **`js/realm-chapters.js`** — eight curated season journeys with 24 chapters, source URLs, camera direction, routes, and marker placement
- **`js/realm-journey.js`** — progressive Three.js scene, season/chapter controls, actor markers, keyboard behavior, reduced-motion support, and fallback lifecycle
- **`js/cinematic-realm.js`** / **`js/cinematic-portal.js`** / **`css/cinematic-realm.css`** — scroll-driven Explore opening, original in-world visual studies, real story moments and quotes, chapter jump controls, canvas portal handoff, responsive atmosphere, and reduced-motion styling
- **`js/people-intelligence.js`** — spotlight, constellation, archive, dossier, and comparison experience for the People route
- **`js/story-atlas.js`** — complete episode explorer with season, theme, consequence, search, and direct-link state
- **`js/world-atlas.js`** — atlas, journey, power, and regional-lore views built on the existing grounded map records
- **`js/lore-data.js`** / **`js/lore-library.js`** — 24 cross-linked TV-canon lore dossiers and the accessible searchable library
- **`js/war-table.js`** — season-driven relationship constellation and battle dispatches
- **`js/living-realm-map.js`** — accessible seasonal map controller and source-grounded hotspots
- **`js/raven-search.js`** — keyboard-first search across characters, episodes, lore, houses, events, battles, and quotes
- **`js/actor-photos.js`** — 134 verified, locally hosted actor portraits with source and license records in [`CREDITS.md`](CREDITS.md)

## Running locally

The current static route modules still run without a build. The React navigation island is bundled locally for the no-server deployment:

```bash
python3 -m http.server 8000
```

To rebuild the React island after editing `src/`:

```bash
npm install
npm run build:react-nav
```

Hash routing needs an HTTP server (not `file://`) for the initial-load JS to behave consistently across browsers — open `http://localhost:8000/`.

Run the release smoke check with:

```bash
node tests/living-encyclopedia-smoke.js
```

## Tech stack

- Vanilla JS + incremental React components + vendored [Three.js](https://threejs.org/) for the progressive 3D journey
- [D3.js v7](https://d3js.org/) for force simulation, tree layout, and zoom/drag behaviors
- A hand-rolled hash router (`js/app.js`) with React progressively taking ownership of shared UI
- Plain CSS — a responsive cinematic interface, Cinzel display type, accessible focus states, reduced-motion support, and React-owned navigation motion

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (static upload, no build step — the SPA needs none).

## Design docs

Implementation plan and design spec for the original relations-explorer core live under [`docs/superpowers/`](docs/superpowers/).
# React migration

The archive is being migrated incrementally to React so the existing static
GitHub Pages experience remains available while stateful interactions move to
component-owned code. The first React island owns the route-aware navigation:

```bash
npm install
npm run build:react-nav
```

The generated `js/react-nav.bundle.js` is intentionally checked in for the
current no-build deployment. Legacy route modules remain available during the
migration; each high-interaction surface can move behind the same React shell
without requiring a backend or changing the content datasets.

## Cinematic interaction layer

- A route transition, shared atmosphere layer, and reduced-motion path keep the
  archive feeling like one continuous experience instead of disconnected pages.
- Memory Wall cards can open a scene, surprise the visitor, copy a shareable
  fragment, and save a private 280-character fan note in the browser.
- People and World surface a meaningful fan-memory quote in their hero instead
  of presenting only counts and filters. Quotes link directly to their source
  moment and remain usable without audio or network services.
- The optional atmosphere control is muted by default and synthesizes a quiet
  local ambience only after an explicit user gesture; no audio is fetched or
  persisted.
