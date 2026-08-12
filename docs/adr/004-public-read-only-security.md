# ADR 004: Keep the archive public and read-only

- Status: Accepted
- Context: Authentication would add complexity without protecting user data or write operations.
- Decision: Keep versioned GET resources public. Apply validation, rate limiting, secure response headers, safe RFC 9457 errors, request IDs, and disabled production H2 console. Future write endpoints must be deny-by-default and authenticated.
- Consequences: The public educational experience remains simple while common abuse and leakage risks are reduced.
