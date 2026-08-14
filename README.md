<div align="center">

# The Raven Wall

### A living, fan-made collection of the people, places, lines, and losses that made Westeros unforgettable.

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

> Not an official guide. A fan project for the moments we still carry after the credits.

## Enterprise edition

The project now has a complete portfolio-ready modular-monolith edition while keeping the cinematic experience as the public home page:

- a React 19 and TypeScript client in [`frontend/`](frontend/);
- a Java 21 and Spring Boot 4.1 REST API in [`backend/`](backend/);
- file-backed H2 persistence with versioned Flyway migrations;
- 805 persisted domain records seeded from the curated legacy datasets: characters, houses, relationships, episodes, quotes, battles, and events;
- paginated and filterable `/api/v1` resources with character-to-relationship and quote-to-speaker joins;
- an interactive request laboratory, live request trace, and read-only Database Explorer at `/database` for teaching how the frontend, backend, and database communicate;
- the Option 2 Observatory at `/app/`, a responsive map workspace with API-backed house markers, filters, timeline controls, command palette, and deep-linkable selected realms;
- RFC 9457 error responses, OpenAPI/Swagger documentation, boundary validation, CORS, health endpoints, integration tests, Docker, and CI.

See the [enterprise architecture and local run guide](docs/enterprise-architecture.md) for the migration design. The visual acceptance record for the Observatory is in [`design-qa.md`](design-qa.md).

> Deployment truth: GitHub Pages and the Render service root both host the same cinematic edition. The Render container also exposes the API-driven React teaching application at `/app`, alongside the Spring Boot + H2 APIs.

### Deploy the enterprise edition for $0

The checked-in [`render.yaml`](render.yaml) is constrained to Render's free web-service plan and intentionally adds no paid disk or database. Flyway reconstructs the read-only H2 dataset whenever ephemeral storage is replaced.

[Deploy to Render](https://render.com/deploy?repo=https://github.com/Kaushik27/game-of-thrones)

After creating the free service, use its `onrender.com` URL for the cinematic site, or append `/app` for the React → Spring Boot → H2 demonstration. Free instances sleep when idle, so the first request can take longer. Do not upgrade the instance or attach a persistent disk if the goal is a strict $0 deployment.

## Start here

Open the [live site](https://kaushik27.github.io/game-of-thrones/) and let the opening sequence carry you from the border to the realm. From there, the site becomes a set of connected ways to remember the story:

- **Explore** — a scroll-driven prologue, quote interludes, and the eight-season Realm Journey.
- **People** — portrait-led spotlights, relationship constellations, dossiers, comparisons, and a searchable cast directory.
- **World** — a seasonal map and a camera journey from Winterfell to the Wall, King's Landing, Meereen, and beyond.
- **Citadel Records** — a map-first fan record connecting places, houses, bloodlines, turning points, voices, throne claims, mysteries, and clearly marked book/show divergences.
- **Voices** — powerful lines with speaker, episode context, house, mood, and a path back to the scene.
- **Chronicle** — fifteen fan-curated turning points from the Long Night to the fall of the Iron Throne.
- **Lore** — connected dossiers for factions, faiths, magic, artifacts, politics, and prophecy.

## The project at a glance

| 196 | 437 | 73 | 44 | 24 |
|---:|---:|---:|---:|---:|
| people | documented ties | episodes | remembered lines | lore dossiers |

The numbers are only the index. The point is the feeling behind them: the choice, betrayal, promise, or line that makes a record worth opening.

## Find a way in

| Route | What waits there |
|---|---|
| [`#/`](https://kaushik27.github.io/game-of-thrones/#/) | Cinematic Explore prologue and the Realm Journey |
| [`#/characters`](https://kaushik27.github.io/game-of-thrones/#/characters) | People Intelligence: spotlight, constellation, directory, dossiers, comparisons |
| [`#/character/jon-snow`](https://kaushik27.github.io/game-of-thrones/#/character/jon-snow) | A four-chapter character entrance, relations, voice, and personal timeline |
| [`#/map`](https://kaushik27.github.io/game-of-thrones/#/map) | Living map, journeys, power records, and regional lore |
| [`#/citadel`](https://kaushik27.github.io/game-of-thrones/#/citadel) | Map-first Citadel Records: places, bloodlines, canon/divergence, claims, voices, and mysteries |
| [`#/timeline`](https://kaushik27.github.io/game-of-thrones/#/timeline) | Episode Atlas for all 73 episodes, themes, consequences, people, houses, battles, and quotes |
| [`#/quotes`](https://kaushik27.github.io/game-of-thrones/#/quotes) | Voices of the Realm and its remembered lines |
| [`#/chronicle`](https://kaushik27.github.io/game-of-thrones/#/chronicle) | Illustrated fan chronology of the long story |
| [`#/lore`](https://kaushik27.github.io/game-of-thrones/#/lore) | Searchable, cross-linked TV-canon dossiers |
| [`#/battles`](https://kaushik27.github.io/game-of-thrones/#/battles) | Major battles, outcomes, combatants, casualties, and linked people |
| [`#/quiz`](https://kaushik27.github.io/game-of-thrones/#/quiz) | Who Said It?, Match the Sigil, and Family Tree rounds |

Deep links work directly on GitHub Pages, so a character, episode, battle, quote, or lore entry can be shared as a specific moment rather than a generic homepage.

## What makes it feel alive

- Scroll is part of the narrative: chapters reveal, timelines progress, and journeys move like a camera.
- Images are local and intentionally atmospheric; the site does not depend on a remote API at runtime.
- Portraits identify the actors who played the characters, with provenance and license details in [`CREDITS.md`](CREDITS.md).
- Search is keyboard-first and reaches across people, episodes, houses, events, battles, quotes, and lore.
- Sound is optional, muted by default, and never required to understand a route.
- Reduced-motion and no-WebGL fallbacks keep the experience usable on quieter or older devices.

## Two complete editions

The root-level application remains the cinematic edition deployed to GitHub Pages and the Render service root. The enterprise edition lives in `frontend/` and `backend/`; the same container serves it from `/app` and exposes the REST API under `/api/v1`.

The migration boundary and data ownership are documented in [`docs/realm-architecture-contract.md`](docs/realm-architecture-contract.md). Run `npm run check:contract` after changing curated records or database seeds to detect drift between the two editions.

```text
index.html                 shared shell and entrypoint
js/app.js                  hash router and route composition
js/data.js                 characters, houses, and relationships
js/episodes.js             all 73 episode records
js/events.js               season-level turning points
js/quotes.js               remembered lines
js/realm-journey.js        progressive Three.js journey
js/people-intelligence.js  spotlight, constellation, realm, dossiers
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

Open <http://localhost:5173>, or run the integrated production container with `npm run enterprise:container` and open <http://localhost:8080> for the cinematic edition. Open <http://localhost:8080/app> for the React teaching application. Swagger UI is available from the backend at <http://localhost:8080/swagger-ui.html>. The Database Explorer uses allowlisted table metadata and paginated rows through `/api/v1/database/tables` without exposing SQL or credentials.

When the React client is hosted separately, copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` and set `VITE_API_BASE_URL` to the Spring Boot API origin. The client keeps filters, seasons, selected database tables, and pagination in the URL so views can be bookmarked and shared.

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

The enterprise pipeline additionally runs frontend tests, backend integration and architecture tests, builds the production container, starts it, waits for readiness, and calls live API/OpenAPI endpoints. CodeQL scans Java and TypeScript. The Render Blueprint deploys only after GitHub checks pass once the free service has been activated in Render.

## Fan project notes

This project is a non-commercial fan work and is not affiliated with HBO, Warner Bros., or the creators of *Game of Thrones*. Character and episode facts are curated against TV canon; dates and “before the story” chronology are labelled approximate where the series leaves room for interpretation.

If you add a portrait, scene image, quote, or source, keep the asset local, document its provenance, and update [`CREDITS.md`](CREDITS.md) in the same change.

<div align="center">

**The realm remembers.**

[Open the living site →](https://kaushik27.github.io/game-of-thrones/)

</div>
