# ADR 001: Use a modular monolith

- Status: Accepted
- Context: This portfolio application needs clear frontend, backend, and database boundaries without the operating cost and failure modes of distributed services.
- Decision: Package React and Spring Boot as one deployable container while preserving explicit controller, service, repository, entity, DTO, exception, configuration, and utility boundaries.
- Consequences: Local setup and zero-cost hosting remain practical. Domain packages can be introduced when independent ownership or release cadence justifies them; microservices are intentionally out of scope.
