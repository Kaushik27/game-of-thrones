# Realm architecture contract

This project intentionally has two delivery surfaces while the migration is in progress:

| Surface | Role | Runtime | Data boundary |
| --- | --- | --- | --- |
| `/` | cinematic public experience | static JavaScript and local assets | generated/curated realm datasets in `js/` |
| `/app/` | structured records and API demonstration | React/Vite served by Spring Boot | `/api/v1` resources and Flyway seed data |

The two surfaces are not separate products. They are two views of the same fan-made
realm. The public surface owns atmosphere, narrative entry, and visual storytelling;
the React surface owns API-backed browsing, pagination, and database demonstrations.

## Source-of-truth rule

The curated JavaScript datasets remain the editorial source while the migration is
underway. Backend migrations are a deployable projection of that source. Any change to
characters, houses, episodes, quotes, battles, or events must update both projections
and pass `npm run check:contract`.

The contract check compares stable IDs and aggregate counts. It deliberately does not
compare prose or image metadata because those are presentation-layer editorial fields.

## Convergence plan

1. Keep the public cinematic route stable while the React surface reaches feature parity.
2. Generate or export backend seed data from the curated datasets once the schema is
   stable; until then, fail CI when IDs or counts drift.
3. Share route names, metadata, and design tokens before moving any route between
   runtimes.
4. Introduce path-based prerendering only after GitHub Pages fallback and deep-link
   behavior are covered by browser tests.
5. Add durable storage only when the product accepts user-owned data such as favorites,
   rankings, or fan submissions.

This contract favors reversible migration steps over a risky replacement of the public
experience.
