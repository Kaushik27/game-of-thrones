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

### Backend package conventions

```text
com.kaushik27.gameofthrones
├── controller   HTTP routing and boundary validation
├── service      use cases and transaction boundaries
├── repository   Spring Data persistence ports
├── entity       JPA entities and database enums
├── dto          immutable REST response contracts
├── exception    domain exceptions and RFC 9457 mapping
├── config       framework and HTTP configuration
└── util         shared infrastructure utilities
```

Controllers depend on services, never repositories or `EntityManager`. Services own orchestration and read-only transactions, repositories isolate persistence, and REST endpoints return DTOs rather than JPA entities. Automated architecture tests protect these boundaries.

- Java 21 and Spring Boot 4.1 provide the deployable backend baseline.
- H2 runs in file mode at `backend/data/game-of-thrones` by default, so records survive restarts.
- Flyway creates and seeds the schema. Generated migrations preserve 196 characters, 12 houses, 437 relationships, 73 episodes, 44 quotes, 9 battles, and 34 events.
- React 19, TypeScript, and Vite provide the frontend build.
- Actuator exposes `/actuator/health` and `/actuator/info`; only those endpoints are exposed.
- API validation and RFC 9457 Problem Details protect the HTTP boundary.
- springdoc publishes the OpenAPI contract and Swagger UI at `/swagger-ui.html`.
- the read-only Database Explorer exposes allowlisted table metadata and paginated rows through `/api/v1/database/tables`, keeping SQL and credentials behind the repository/service boundary.
- collection endpoints use bounded page sizes, response `Link` headers, explicit SQL columns, and stable Problem Details errors.
- frontend routes are lazy-loaded, request state is abortable and retryable, and filters/table selections are URL-addressable.
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

## Operational baseline

- `local` enables the H2 console and detailed health information; both are disabled by default and in `prod`.
- Every request receives a `Request-Id`, security headers, and safe RFC 9457 failures with stable error codes.
- Public API reads are limited per client and return `429` with `Retry-After` when the limit is exceeded.
- Actuator publishes health, readiness, liveness, application information, and Micrometer metrics without paid infrastructure.
- CI starts the production container and verifies readiness, statistics, and OpenAPI rather than stopping at image compilation.
- CodeQL provides free static security analysis for this public repository.

## Zero-cost deployment

GitHub Pages remains the static cinematic edition. [`render.yaml`](../render.yaml) defines a separate Docker deployment using Render's free web-service plan. It contains no paid disk or database. The production H2 file is intentionally ephemeral; Flyway recreates the read-only dataset whenever the instance filesystem is replaced.

This is an enterprise-style demonstration, not high-availability production infrastructure. Free instances can sleep, cold starts are expected, and no SLA or durable runtime writes are promised.

Architecture decisions are recorded under [`docs/adr`](adr/).
