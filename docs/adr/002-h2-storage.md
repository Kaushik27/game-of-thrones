# ADR 002: Use H2 for the zero-cost demonstration

- Status: Accepted
- Context: The application is read-only and Flyway can recreate all curated records. Free container hosts do not provide durable disks.
- Decision: Use file-backed H2 locally and ephemeral H2 under the free production profile. Flyway remains the system of record for the demo dataset.
- Consequences: No hosting bill or external database is required. Runtime mutations are not durable. PostgreSQL becomes the production option if writes, multiple instances, or durable user data are introduced.
