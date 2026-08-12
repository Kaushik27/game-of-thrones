# Enterprise application architecture

## Architecture

The enterprise edition is a modular monolith: React owns presentation, Spring Boot owns HTTP and application behavior, and H2 owns durable data. The legacy edition remains available as an independent static experience.

```text
Browser
  -> React + TypeScript (frontend/)
      -> /api/v1/characters
      -> /api/v1/houses
      -> /api/v1/characters/{id}/relationships
      -> /api/v1/episodes
      -> /api/v1/events
      -> /api/v1/battles
      -> /api/v1/quotes
      -> /api/v1/statistics
          -> Spring MVC controllers
              -> application services
                  -> Spring Data JPA
                      -> file-backed H2
                          -> Flyway schema and seed migrations
```

## Runtime choices

- Java 21 and Spring Boot 4.1 provide the deployable backend baseline.
- H2 runs in file mode at `backend/data/game-of-thrones` by default, so records survive restarts.
- Flyway creates and seeds the schema. Generated migrations preserve 196 characters, 12 houses, 437 relationships, 73 episodes, 44 quotes, 9 battles, and 34 events.
- React 19, TypeScript, and Vite provide the frontend build.
- Actuator exposes `/actuator/health` and `/actuator/info`; only those endpoints are exposed.
- API validation and RFC 9457 Problem Details protect the HTTP boundary.
- springdoc publishes the OpenAPI contract and Swagger UI at `/swagger-ui.html`.
- Every API response includes `Archive-Data-Source` and `Server-Timing` headers used by the teaching UI.

## Local development

Run the API:

```bash
npm run enterprise:api
```

Run the React client in another terminal:

```bash
npm run enterprise:web
```

Open `http://localhost:5173`. Vite proxies `/api` and `/actuator` to port 8080.

For the production-shaped version, run `docker compose up --build` and open `http://localhost:8080`. The container packages the React build inside the Spring Boot executable and persists H2 data in a named volume.

## Data lifecycle

Do not edit an applied Flyway migration. For new or corrected records, add a new migration. When the legacy source changes during the transition, regenerate the seed before the migration is released:

```bash
node tools/generate-h2-character-seed.mjs
```

PostgreSQL can later replace H2 through a production Spring profile without changing controller contracts. H2 is intentionally retained here because the project is designed to demonstrate all three application tiers without requiring external infrastructure.
