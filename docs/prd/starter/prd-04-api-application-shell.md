# PRD-04: API Application Shell (apps/api)

## Document control

- **Status:** Draft (for sign-off)
- **Last updated:** 2025-10-19
- **Owners:** Platform Engineering Guild
- **Stakeholders:** Backend Guild, Developer Experience, QA Automation, Security Engineering, SRE
- **Related artifacts:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md), [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md), [Feature Delivery Playbook](../../playbook/README.md)

---

## 1. Background & problem statement

Domain teams need a production-ready API foundation that exposes REST endpoints, background workers, and observability hooks without rebuilding scaffolding. Current ad hoc service boots slow onboarding and risk divergence from platform standards defined in PRD-02 (packages) and PRD-05 (CI/CD).

We will provide a NestJS-based shell encapsulated by `@starter/platform-api`, `@starter/platform-db`, `@starter/platform-queue`, `@starter/platform-cache`, and `@starter/auth/server`. `apps/api` imports **only** from these internal packages—NestJS, Prisma, BullMQ, Redis, and Simple Auth bindings are hidden behind unified abstractions so feature teams operate against a consistent vocabulary and we can swap substrates in the future.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Encapsulated NestJS monolith** — Deliver an opinionated HTTP/worker shell via `@starter/platform-api` that wires Fastify, validation, logging, and lifecycle hooks automatically.
2. **Prisma + database integration** — Provide migrations, seeding, and transactional helpers through `@starter/platform-db`, aligned to the shared env schema.
3. **REST API contract definition** — Define authoritative List Endpoint contract (offset/limit pagination) and other REST patterns; document request/response schemas, validation rules, and error taxonomy.
4. **OpenAPI specification generation** — Generate OpenAPI spec from 'estJS controllers via `@starter/platform-api` utilities'; emit to `dist/openapi.json` for consumption by PRD-02's `@starter/data-access`.
5. **Reference implementation** — Ship sample `Resource` module implementing the List Endpoint contract using only `@starter/*` abstractions; serves as template for domain resources.
6. **Auth & security baseline** — Integrate `@starter/auth/server` (Simple Auth wrapper) for request guards, session decoding, and role enforcement with minimum configuration.
7. **Observability & operations** — Structured logging, metrics, tracing, health checks, and SBOM hooks delivered through shared packages and ready for CI automation.
8. **Background jobs** — BullMQ worker examples demonstrating queue processing, retries, DLQ handling, and integration with database transactions.
9. **Application examples** — Reference implementations in `examples/nest-resource` showing complete CRUD resource patterns.
10. **Deployment-ready assets** — Dockerfile, docker-compose, queue workers, and Turborepo pipelines that align with PRD-05 release workflows.
11. **Package-only imports enforced** — ESLint boundaries and TypeScript aliases prevent direct usage of `@nestjs/*`, `prisma`, `bullmq`, `ioredis`, or `simple-auth` inside `apps/api`.

### 2.2 Non-goals

- Implementing domain-specific business logic beyond sample templates (Resource module, worker examples only).
- Providing multi-tenant or microservice orchestration (future ADR if needed).
- Managing production database provisioning, vault integration, or infra rollout (covered by platform initiatives).
- Creating platform abstraction packages (PRD-02 responsibility).
- Building frontend applications or UI components (PRD-03 responsibility).

---

## 3. Personas & user stories

| Role               | Scenario                         | Success criteria                                                                                                                                                 |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend engineer   | Adds a new resource module.      | Follows example in `examples/nest-resource`; generates module via CLI; implements List contract; OpenAPI auto-updates; passes tests without third-party imports. |
| Fullstack engineer | Integrates frontend with API.    | Backend generates OpenAPI spec; PRD-02 consumes it to generate clients; frontend (PRD-03) uses clients seamlessly.                                               |
| Fullstack engineer | Needs background job processing. | Follows worker example; configures queue using `@starter/platform-queue`; retries, logging, metrics work out of the box.                                         |
| QA automation      | Validates API contract.          | Contract tests use generated OpenAPI spec; endpoints conform to List contract and shared error taxonomy.                                                         |
| Security engineer  | Reviews service compliance.      | Env validation enforced, SBOM generated, request logging includes trace IDs and PII redaction.                                                                   |
| SRE                | Monitors service health.         | `/health` and `/ready` endpoints plus Prometheus metrics and tracing exporters available by default.                                                             |

---

## 4. Functional requirements

### 4.1 Project structure

- Entry point `apps/api/src/main.ts` calls `bootstrapApi` from `@starter/platform-api`, which configures Fastify adapter, validation pipes, logging, OpenTelemetry, and graceful shutdown hooks.
- Modules assembled through factories: `createHttpModule`, `createQueueModule`, `createHealthModule`, `createResourceModule`. The default shell registers HTTP, database, queue, health, and auth modules.
- Environment typing from '@starter/config-env`'; `.env.example` includes Postgres, Redis, Simple Auth, telemetry, and cache credentials.
- CLI scripts exposed via package binaries: `pnpm api:migrate`, `api:seed`, `api:db:studio`, `api:queue`, `api:lint`, `api:test`, `api:build`, `api:openapi` — all wrappers around shared packages to ensure consistent flags.
- ESLint boundaries (configured in PRD-02) block non-`@starter/*` imports; TypeScript path aliases resolve `@starter/platform-*` subpaths for controllers, services, DTOs, and workers.

### 4.2 Database & Prisma (`@starter/platform-db`)

- Prisma schema and migrations live inside `packages/platform-db`; apps extend models via `extendSchema` helpers rather than editing Prisma files directly in `apps/api`.
- `@starter/platform-db` exports typed client factories, transaction helpers, seed utilities, and migrator commands instrumented with structured logging.
- Sample `Resource` model demonstrates pagination-ready fields (`id`, `createdAt`, `updatedAt`), search indexes, and audit columns. Seed script populates sample data for smoke tests.
- Database connections respect pool sizing defaults; preview environments use ephemeral Postgres via docker-compose defined in the package.

### 4.3 REST API contract definition (owned by PRD-04)

#### 4.3.1 List Endpoint Contract (offset/limit, MVP)

- **Purpose:** Standard pagination pattern for list endpoints; simpler MVP across Nest + Prisma + UI; clear mental model; works for admin/data-heavy screens.
- **Request (GET):**
  ```
  GET /:resource?search=&page=&perPage=&sort=&order=&filters[foo]=bar&filters[baz]=qux
  ```
  - `search`: Optional full-text search string
  - `page`: Page number (default: 1, minimum: 1)
  - `perPage`: Items per page (default: 20, minimum: 1, maximum: 200)
  - `sort`: Comma-separated fields with optional `-` prefix for descending (e.g., `name,-createdAt`)
  - `order`: Deprecated (use `sort` instead); enum: `asc`, `desc`
  - `filters[key]`: Deep object query params for field-specific filters
- **Response (200):**
  ```json
  {
    "items": [],
    "page": 1,
    "perPage": 20,
    "total": 0,
    "summary": {},
    "meta": {
      "queryId": "uuid",
      "generatedAt": "2025-10-19T00:00:00Z"
    }
  }
  ```
  - `items`: Array of resource objects
  - `page`: Current page number
  - `perPage`: Items per page
  - `total`: Total count of items matching filters
  - `summary`: Optional aggregates (e.g., sum, avg, min, max)
  - `meta`: Request metadata (query ID for tracing, generation timestamp)
- **Sorting rules:**
  - Multi-field sorting via comma-separated `sort` param
  - Descending sort via `-` prefix
  - Stability: API must add secondary sort key (e.g., `id ASC`) to prevent pagination drift
- **Filter semantics:**
  - Exact match: `filters[status]=active`
  - Future: Range operators, IN clauses, etc. (post-MVP via ADR)
- **Error responses:**
  - 400: Invalid parameters (validation errors)
  - 401: Unauthorized (missing/invalid auth)
  - 403: Forbidden (insufficient permissions)
  - 429: Rate limit exceeded
  - 500: Internal server error
  - Error body follows shared taxonomy from `@starter/node-utils/errors`
- **Upgrade path (post-GA):** Optional cursor-based pagination behind feature flag (not default).

#### 4.3.2 REST controllers & validation

- `createResourceModule` scaffold exposes CRUD endpoints; List handler implements the offset/limit contract above using query builders from `@starter/platform-db`.
- Request/response DTOs defined using NestJS class-validator decorators; validation happens automatically via Nest pipes.
- Error handling maps to shared taxonomy defined in `@starter/node-utils/errors`; HTTP exceptions wrapped before leaving controller.
- All endpoints documented with `@ApiOperation`, `@ApiResponse` decorators for OpenAPI generation.

### 4.4 OpenAPI specification generation (owned by PRD-04)

- **Generation:** OpenAPI spec generated automatically during build via `@starter/platform-api/openapi` (backed by `@nestjs/swagger`).
- **Output:** Spec emitted to `dist/openapi.json` and versioned alongside application code.
- **Consumption:** PRD-02's `@starter/data-access` package reads this spec to generate typed clients, Zod validators, and MSW mocks.
- **Governance:**
  - CODEOWNERS protection on spec changes requires review
  - Breaking changes require major version bump per Changesets
  - CI validates spec against contract tests
- **Documentation:** Spec includes descriptions, examples, schemas for all endpoints; serves as source of truth for API contracts.
- **Tooling:** Optional Swagger UI available at `/api-docs` in development for manual exploration.

### 4.5 Authentication & authorization (`@starter/auth/server`)

- Simple Auth integration handles session validation, token exchange, and role claims; `AuthGuard`, `RoleGuard`, and decorator helpers (`@CurrentUser`) come from the package.
- Default implementation supports mock provider for local dev and JWT bearer for previews; additional adapters follow ADR process.
- Queue workers and HTTP handlers access identity context via `AuthContext` service exported by `@starter/auth/server`.

### 4.6 Background jobs (`@starter/platform-queue` & `@starter/platform-cache`)

- BullMQ configuration, connection pools, and worker lifecycle managed by `@starter/platform-queue`; queue names, retry/backoff defaults, and telemetry derived from configuration package.
- Sample worker `ResourceDigestWorker` demonstrates job processing, retries, DLQ handling, and instrumentation; integration tests run against embedded Redis provided by the package or docker-compose fallback.
- Shared cache helpers (Redis) expose typed get/set/invalidation APIs; queue processors consume them for idempotency and scheduling.

### 4.7 Observability, security, and operations

- Logging uses `@starter/node-utils/logging` (pino wrapper) with correlation IDs, redaction list, and request lifecycle hooks set up automatically during bootstrap.
- Metrics and health endpoints provided by `@starter/platform-api/metrics` and `/health` & `/ready` modules; Prometheus exporter on `/metrics` and optional `/livez` for k8s probes.
- Tracing instrumentation via `@starter/platform-api/tracing` enabling OTLP exporters (Honeycomb-compatible) based on env flags.
- Security middleware (helmet, CORS, rate limiting) configured by `@starter/platform-api/security`; default CSP and request size limits documented.
- SBOM generation triggered during build via `pnpm api:build --sbom`, producing CycloneDX documents stored as CI artifacts (PRD-05 requirement).

### 4.8 Testing & documentation

- Vitest (node preset) configured through `@starter/jest-config/node`; integration harness from `@starter/platform-api/testing` spins up Postgres/Redis using Testcontainers or docker-compose.
- Contract tests run `pnpm api:contract` which boots the app against the generated OpenAPI client from `@starter/data-access` and fails on mismatches.
- Coverage target ≥ 85% statements/branches for HTTP modules and queue workers; thresholds enforced in CI.
- `/docs/api-shell.md` explains architecture, module factories, auth integration, and extension patterns referencing playbook workflows.

### 4.9 Application examples

- **Primary example:** `examples/nest-resource` — Complete resource module implementation showing:
  - List Endpoint contract implementation with offset/limit pagination
  - CRUD operations (Create, Read, Update, Delete)
  - Prisma query builders from `@starter/platform-db`
  - Request validation with DTOs
  - Error handling with shared taxonomy
  - OpenAPI decorators for documentation
  - Unit and integration tests
  - Contract tests validating OpenAPI compliance
- **Additional examples:**
  - `examples/background-worker` — BullMQ worker processing with retries, DLQ, idempotency
  - `examples/batch-operations` — Bulk create/update/delete with transaction handling
  - `examples/file-upload` — Multipart upload, validation, storage integration
- **Example structure:** Each example is a standalone module demonstrating specific patterns; fully working, tested, and documented.

### 4.10 Deployment assets

- Dockerfile authored once under `apps/api` but consumes `@starter/platform-api/docker` stage definitions to ensure consistent node/pnpm versions and healthcheck commands.
- `docker-compose.yml` (for local) and optional Terraform/Helm snippets live under `infrastructure/` and reference environment variables defined by `@starter/config-env`.
- Preview deployment script `pnpm api:preview` aligns with PRD-05 provider choices (Fly.io or Railway) and reuses shared release automation.

---

## 5. Technical approach

1. **Single import surface** — All NestJS, Prisma, BullMQ, Redis, and Simple Auth dependencies reside in `packages/platform-*`; `apps/api` consumes typed facades, enabling future substrate swaps.
2. **Contract-first design** — API defines contracts via OpenAPI decorators; PRD-04 generates OpenAPI spec; PRD-02 consumes spec to generate clients; ensures backend/frontend alignment.
3. **Reference implementation strategy** — `apps/api` is the canonical example; `examples/*` provide focused demonstrations of specific patterns.
4. **Configuration as code** — Env parsing, queue settings, and database URLs flow through `@starter/config-env`, ensuring consistent validation and defaults across environments.
5. **Operational parity** — Local docker-compose mirrors CI preview; bootstrap scripts seed databases, run migrations, and start workers automatically.
6. **Security baked-in** — Simple Auth integration, rate limiting, redaction, SBOM, and secret scanning enforced by packages and PRD-05 workflows.
7. **Documentation as code** — OpenAPI spec serves as API documentation; examples are runnable, tested modules; `/docs/api-shell.md` ties everything together.

---

## 6. Metrics & success criteria

- **Time to first endpoint:** ≤ 45 minutes to scaffold new resource module following `examples/nest-resource`, run migrations, expose REST endpoints, and pass CI.
- **Contract fidelity:** 0 contract test failures on `main`; OpenAPI spec changes require CODEOWNERS review; generated clients from PRD-02 match backend exactly.
- **Coverage:** ≥ 85% statements/branches for HTTP modules and queue workers.
- **OpenAPI compliance:** 100% of endpoints documented in OpenAPI spec; spec validates against contract schemas; no manual client adjustments needed in PRD-03.
- **Operational readiness:** Health endpoints, metrics, and tracing verified in preview deployment; logs include correlation IDs.
- **Adoption:** 100% backend features rely on `@starter/*` packages without direct third-party imports; new resources follow List Endpoint contract.
- **Documentation quality:** Developers can implement new resources without asking questions; examples + docs + OpenAPI cover 90% of use cases.

---

## 7. Risks & mitigations

| Risk                                 | Impact                           | Mitigation                                                                                    |
| ------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Prisma schema divergence             | Conflicting migrations or drift  | Centralize schema in `@starter/platform-db`; enforce CODEOWNERS + automated migration checks. |
| Queue dependencies complicate setup  | Developers lack Redis locally    | Provide docker-compose + in-memory fallback; document hardware requirements.                  |
| Vendor changes (Simple Auth, BullMQ) | Breaking changes ripple to teams | Wrap APIs in `@starter/*`; maintain contract tests and ADR-governed upgrade plan.             |
| Performance regressions              | Slow endpoints, fail budgets     | Include smoke/load tests, tracing sampling, and budgets enforced via CI telemetry.            |
| Preview cost overruns                | Budget concerns                  | Preview TTL automation, manual approval gates for protected environments, telemetry tracking. |

---

## 8. Rollout plan

1. **Phase 1 — Skeleton & infrastructure**

   - Implement `bootstrapApi`, module factories, env validation, health checks, and logging.
   - Finalize Prisma schema in `@starter/platform-db`; set up migrations, seeds, docker-compose services.

2. **Phase 2 — Contract definition & OpenAPI**

   - Define List Endpoint contract with request/response schemas, validation rules, error taxonomy.
   - Configure OpenAPI generation via `@starter/platform-api/openapi`; emit spec to `dist/openapi.json`.
   - Validate spec can be consumed by PRD-02's client generator.

3. **Phase 3 — Reference implementation**

   - Build sample `Resource` module in `apps/api` implementing List Endpoint contract.
   - Create `examples/nest-resource` demonstrating complete CRUD pattern.
   - Integrate `@starter/auth/server` with mock provider and preview JWT adapter.

4. **Phase 4 — Background jobs & examples**

   - Build sample worker in `apps/api`; create `examples/background-worker`.
   - Add contract tests validating OpenAPI compliance; integration tests with Testcontainers.

5. **Phase 5 — Quality, docs, & deployment**
   - Author `/docs/api-shell.md` with quick-start guide, contract reference, examples index.
   - Add SBOM generation and security scanning steps referenced in PRD-05.
   - Produce Dockerfile, preview workflow integration, and infrastructure snippets.
   - Run smoke tests in CI/previews; capture metrics and iterate on performance budgets.

---

## 9. Acceptance tests (definition of done)

1. `pnpm dev:api` starts HTTP server + worker using docker-compose; `/health`, `/ready`, and `/metrics` respond 200.
2. OpenAPI spec generated to `dist/openapi.json` with List Endpoint contract documented; spec validates against JSON Schema.
3. `examples/nest-resource` runs independently via `pnpm example:api`; demonstrates complete CRUD pattern; all tests pass.
4. Contract test hitting `/resources` validates response matches OpenAPI schema; mismatches fail CI.
5. PRD-02's `@starter/data-access` successfully consumes `dist/openapi.json` and generates typed clients without errors.
6. Running `pnpm test --filter apps/api...` passes unit + integration suites with coverage ≥ 85%.
7. ESLint boundary test fails when importing `@nestjs/common` or `prisma` directly from `apps/api`.
8. Preview deployment publishes Docker image, runs migrations via `@starter/platform-db`, exposes authenticated endpoints, and serves OpenAPI spec.
9. SBOM artifact generated during `pnpm api:build` and attached to CI run alongside logs/metrics.
10. Documentation in `/docs/api-shell.md` references List Endpoint contract, examples, and OpenAPI spec; "Build Your First Resource" guide completable in ≤45 minutes.

---

## 10. Dependencies & out of scope

- Depends on PRD-01 for workspace bootstrap, environment validation, and Dev Container setup.
- Depends on PRD-02 for all `@starter/platform-*` packages (API, DB, Queue, Cache, Auth abstractions).
- Depends on PRD-05 for CI/CD pipelines, preview deployments, and release automation.
- **Provides to PRD-02:** OpenAPI specification in `dist/openapi.json` for client generation.
- **Provides to PRD-03:** API endpoints implementing contracts that web application consumes.
- Out of scope:
  - GraphQL endpoints, event-driven architecture, multi-region deployments (future PRDs).
  - Creating platform abstraction packages (PRD-02 responsibility).
  - Building frontend applications (PRD-03 responsibility).

---

## 11. Appendix

### 11.1 List Endpoint contract reference

See Section 4.3.1 for complete specification including:

- Request parameters (search, page, perPage, sort, filters)
- Response schema (items, page, perPage, total, summary, meta)
- Sorting rules and stability requirements
- Error response formats
- Future cursor pagination upgrade path

### 11.2 Example resources

- `examples/nest-resource` — Complete CRUD implementation with List contract
- `examples/background-worker` — BullMQ worker with retries and DLQ
- `examples/batch-operations` — Bulk operations with transactions
- `examples/file-upload` — Multipart upload handling

### 11.3 OpenAPI generation workflow

```
apps/api (NestJS controllers)
  ↓ @ApiOperation, @ApiResponse decorators
@starter/platform-api/openapi
  ↓ Build-time generation via @nestjs/swagger
dist/openapi.json
  ↓ Consumed by PRD-02
@starter/data-access (generated clients)
  ↓ Used by PRD-03
apps/web (frontend application)
```

### 11.4 Playbook alignment

- **Definition of Ready:** Env templates, queue requirements, migration plan documented, auth adapters selected, API contract defined, OpenAPI decorators added.
- **Definition of Done:** Endpoints implemented following List contract, tests + coverage meet thresholds, OpenAPI spec updated and validated, contract tests pass, preview deployed with telemetry.

### 11.5 Future enhancements

- Cursor-based pagination mode (behind feature flag)
- gRPC adapters for high-performance internal services
- Automated admin scaffolds leveraging `@starter/ui`
- Multi-tenant connection management and row-level security
- Event-driven architecture with message bus integration
