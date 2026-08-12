<div align="center">

# The Raven Wall

### A living, fan-made archive of the people, places, lines, and losses that made Westeros unforgettable.

<p>
  <a href="https://kaushik27.github.io/game-of-thrones/">Enter the realm →</a>
  &nbsp;·&nbsp;
  <a href="https://kaushik27.github.io/game-of-thrones/#/characters">Meet the people</a>
  &nbsp;·&nbsp;
  <a href="https://kaushik27.github.io/game-of-thrones/#/map">Travel the world</a>
</p>

<p>
  <img src="https://img.shields.io/badge/fan--made-not%20official-d4b36a?style=flat-square" alt="Fan made, not official">
  <img src="https://img.shields.io/badge/TV%20canon-8%20seasons-8b9eac?style=flat-square" alt="Eight seasons of TV canon">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=11171a" alt="React 19">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1-6db33f?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot 4.1">
  <img src="https://img.shields.io/badge/database-H2-1b75bb?style=flat-square" alt="H2 embedded database">
</p>

</div>

<p align="center">
  <img src="assets/ui/border-journey-bg.png" alt="A moonlit border beyond the Wall" width="49%">
  <img src="assets/ui/capital-journey-bg.jpg" alt="A storm over King's Landing" width="49%">
</p>

> Not an official guide. A fan archive for the moments we still carry after the credits.

## Enterprise edition

The archive now has a complete portfolio-ready modular-monolith edition while the original cinematic GitHub Pages experience remains available:

- a React 19 and TypeScript client in [`frontend/`](frontend/);
- a Java 21 and Spring Boot 4.1 REST API in [`backend/`](backend/);
- file-backed H2 persistence with versioned Flyway migrations;
- 805 persisted domain records seeded from the curated legacy datasets: characters, houses, relationships, episodes, quotes, battles, and events;
- paginated and filterable `/api/v1` resources with character-to-relationship and quote-to-speaker joins;
- an interactive request laboratory and live request trace for teaching how the frontend, backend, and database communicate;
- RFC 9457 error responses, OpenAPI/Swagger documentation, boundary validation, CORS, health endpoints, integration tests, Docker, and CI.

See the [enterprise architecture and local run guide](docs/enterprise-architecture.md) for the migration design.

## Start here

Open the [live archive](https://kaushik27.github.io/game-of-thrones/) and let the opening sequence carry you from the border to the realm. From there, the site becomes a set of connected ways to remember the story:

- **Explore** — a scroll-driven prologue, quote interludes, and the eight-season Realm Journey.
- **People** — portrait-led spotlights, relationship constellations, dossiers, comparisons, and a searchable cast archive.
- **World** — a seasonal map and a camera journey from Winterfell to the Wall, King's Landing, Meereen, and beyond.
- **Voices** — powerful lines with speaker, episode context, house, mood, and a path back to the scene.
- **Chronicle** — fifteen fan-curated turning points from the Long Night to the fall of the Iron Throne.
- **Lore** — connected dossiers for factions, faiths, magic, artifacts, politics, and prophecy.

## The archive at a glance

| 196 | 437 | 73 | 44 | 24 |
|---:|---:|---:|---:|---:|
| people | documented ties | episodes | remembered lines | lore dossiers |

The numbers are only the index. The point is the feeling behind them: the choice, betrayal, promise, or line that makes a record worth opening.

## Find a way in

| Route | What waits there |
|---|---|
| [`#/`](https://kaushik27.github.io/game-of-thrones/#/) | Cinematic Explore prologue and the Realm Journey |
| [`#/characters`](https://kaushik27.github.io/game-of-thrones/#/characters) | People Intelligence: spotlight, constellation, archive, dossiers, comparisons |
| [`#/character/jon-snow`](https://kaushik27.github.io/game-of-thrones/#/character/jon-snow) | A four-chapter character entrance, relations, voice, and personal timeline |
| [`#/map`](https://kaushik27.github.io/game-of-thrones/#/map) | Living map, journeys, power records, and regional lore |
| [`#/timeline`](https://kaushik27.github.io/game-of-thrones/#/timeline) | Episode Atlas for all 73 episodes, themes, consequences, people, houses, battles, and quotes |
| [`#/quotes`](https://kaushik27.github.io/game-of-thrones/#/quotes) | Voices of the Realm and its remembered lines |
| [`#/chronicle`](https://kaushik27.github.io/game-of-thrones/#/chronicle) | Illustrated fan chronology of the long story |
| [`#/lore`](https://kaushik27.github.io/game-of-thrones/#/lore) | Searchable, cross-linked TV-canon dossiers |
| [`#/battles`](https://kaushik27.github.io/game-of-thrones/#/battles) | Major battles, outcomes, combatants, casualties, and linked people |
| [`#/quiz`](https://kaushik27.github.io/game-of-thrones/#/quiz) | Who Said It?, Match the Sigil, and Family Tree rounds |

Deep links work directly on GitHub Pages, so a character, episode, battle, quote, or lore entry can be shared as a specific moment rather than a generic homepage.

## What makes it feel alive

- Scroll is part of the narrative: chapters reveal, timelines progress, and journeys move like a camera.
- Images are local and intentionally atmospheric; the archive does not depend on a remote API at runtime.
- Portraits identify the actors who played the characters, with provenance and license details in [`CREDITS.md`](CREDITS.md).
- Search is keyboard-first and reaches across people, episodes, houses, events, battles, quotes, and lore.
- Sound is optional, muted by default, and never required to understand a route.
- Reduced-motion and no-WebGL fallbacks keep the experience usable on quieter or older devices.

## Two complete editions

The root-level vanilla application remains the cinematic static edition deployed to GitHub Pages. The enterprise edition lives in `frontend/` and `backend/` and runs as one deployable container.

```text
index.html                 shared shell and entrypoint
js/app.js                  hash router and route composition
js/data.js                 characters, houses, and relationships
js/episodes.js             all 73 episode records
js/events.js               season-level turning points
js/quotes.js               remembered lines
js/realm-journey.js        progressive Three.js journey
js/people-intelligence.js  spotlight, constellation, archive, dossiers
js/world-atlas.js          map, journeys, power, and lore modes
js/story-atlas.js          episode explorer
js/lore-library.js         searchable lore dossiers
css/                      route-specific visual systems
assets/                   local atmosphere, icons, and portraits
```

### Local development

Enterprise edition:

```bash
npm install
npm --prefix frontend install
npm run enterprise:api
```

In a second terminal:

```bash
npm run enterprise:web
```

Open <http://localhost:5173>, or run the integrated production container with `npm run enterprise:container` and open <http://localhost:8080>. Swagger UI is available from the backend at <http://localhost:8080/swagger-ui.html>.

Legacy static edition:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/>.

To rebuild the checked-in React navigation island:

```bash
npm install
npm run build:react-nav
```

Run the release smoke check:

```bash
node tests/living-encyclopedia-smoke.js
```

## Deployment

Every push to `master` deploys the static site through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The current build has no bundling step for route modules; the generated React navigation bundle is checked in for the same reason.

## Fan archive notes

This project is a non-commercial fan work and is not affiliated with HBO, Warner Bros., or the creators of *Game of Thrones*. Character and episode facts are curated against TV canon; dates and “before the story” chronology are labelled approximate where the series leaves room for interpretation.

If you add a portrait, scene image, quote, or source, keep the asset local, document its provenance, and update [`CREDITS.md`](CREDITS.md) in the same change.

<div align="center">

**The realm remembers.**

[Open the living archive →](https://kaushik27.github.io/game-of-thrones/)

</div>
