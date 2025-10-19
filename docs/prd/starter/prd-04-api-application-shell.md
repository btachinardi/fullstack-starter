# PRD-04: API Application Shell (apps/api)

## Document control

* **Status:** Draft (for sign-off)
* **Last updated:** 2025-10-19
* **Owners:** Platform Engineering Guild
* **Stakeholders:** Backend Guild, Developer Experience, QA Automation, Security Engineering, SRE
* **Related artifacts:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md), [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md), [Feature Delivery Playbook](../../playbook/README.md)

---

## 1. Background & problem statement

Domain teams need a production-ready API foundation that exposes REST endpoints, background workers, and observability hooks without rebuilding scaffolding. Current ad hoc service boots slow onboarding and risk divergence from platform standards defined in PRD-02 (packages) and PRD-05 (CI/CD).

We will provide a NestJS-based shell encapsulated by `@starter/platform-api`, `@starter/platform-db`, `@starter/platform-queue`, `@starter/platform-cache`, and `@starter/auth/server`. `apps/api` imports **only** from these internal packages—NestJS, Prisma, BullMQ, Redis, and Simple Auth bindings are hidden behind unified abstractions so feature teams operate against a consistent vocabulary and we can swap substrates in the future.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Encapsulated NestJS monolith** — Deliver an opinionated HTTP/worker shell via `@starter/platform-api` that wires Fastify, validation, logging, and lifecycle hooks automatically.
2. **Prisma + database integration** — Provide migrations, seeding, and transactional helpers through `@starter/platform-db`, aligned to the shared env schema and List Endpoint contract.
3. **List Endpoint reference implementation** — Ship a sample `Resource` module that satisfies the offset/limit List contract using only `@starter` abstractions and feeds `@starter/data-access` clients.
4. **Auth & security baseline** — Integrate `@starter/auth/server` (Simple Auth wrapper) for request guards, session decoding, and role enforcement with minimum configuration.
5. **Observability & operations** — Structured logging, metrics, tracing, health checks, and SBOM hooks delivered through shared packages and ready for CI automation.
6. **Deployment-ready assets** — Dockerfile, docker-compose, queue workers, and Turborepo pipelines that align with PRD-05 release workflows.
7. **Package-only imports enforced** — ESLint boundaries and TypeScript aliases prevent direct usage of `@nestjs/*`, `prisma`, `bullmq`, `ioredis`, or `simple-auth` inside `apps/api`.

### 2.2 Non-goals

* Implementing domain-specific business logic beyond the sample `Resource` module and worker.
* Providing multi-tenant or microservice orchestration (future ADR if needed).
* Managing production database provisioning, vault integration, or infra rollout (covered by platform initiatives).

---

## 3. Personas & user stories

| Role              | Scenario                                       | Success criteria                                                                                       |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Backend engineer  | Adds a new resource module.                    | Generates module via CLI; extends `@starter/platform-api` scaffold; passes tests and CI without third-party imports. |
| Fullstack engineer| Needs background job processing.               | Configures queue worker using `@starter/platform-queue`; retries, logging, and metrics work out of the box. |
| QA automation     | Validates API contract.                        | Contract tests use generated OpenAPI spec; endpoints conform to List contract and shared error taxonomy. |
| Security engineer | Reviews service compliance.                    | Env validation enforced, SBOM generated, request logging includes trace IDs and PII redaction.          |
| SRE               | Monitors service health.                       | `/health` and `/ready` endpoints plus Prometheus metrics and tracing exporters available by default.     |

---

## 4. Functional requirements

### 4.1 Project structure

* Entry point `apps/api/src/main.ts` calls `bootstrapApi` from `@starter/platform-api`, which configures Fastify adapter, validation pipes, logging, OpenTelemetry, and graceful shutdown hooks.
* Modules assembled through factories: `createHttpModule`, `createQueueModule`, `createHealthModule`, `createResourceModule`. The default shell registers HTTP, database, queue, health, and auth modules.
* Environment typing from `@starter/config-env`; `.env.example` includes Postgres, Redis, Simple Auth, telemetry, and cache credentials.
* CLI scripts exposed via package binaries: `pnpm api:migrate`, `api:seed`, `api:db:studio`, `api:queue`, `api:lint`, `api:test`, `api:build`, `api:openapi` — all wrappers around shared packages to ensure consistent flags.
* ESLint boundaries (configured in PRD-02) block non-`@starter/*` imports; TypeScript path aliases resolve `@starter/platform-*` subpaths for controllers, services, DTOs, and workers.

### 4.2 Database & Prisma (`@starter/platform-db`)

* Prisma schema and migrations live inside `packages/platform-db`; apps extend models via `extendSchema` helpers rather than editing Prisma files directly in `apps/api`.
* `@starter/platform-db` exports typed client factories, transaction helpers, seed utilities, and migrator commands instrumented with structured logging.
* Sample `Resource` model demonstrates pagination-ready fields (`id`, `createdAt`, `updatedAt`), search indexes, and audit columns. Seed script populates sample data for smoke tests.
* Database connections respect pool sizing defaults; preview environments use ephemeral Postgres via docker-compose defined in the package.

### 4.3 REST controllers & validation (`@starter/platform-api`)

* `createResourceModule` scaffold exposes CRUD endpoints; List handler implements the offset/limit contract using query builders from `@starter/platform-db`.
* Request/response schemas derive from shared Zod definitions in `@starter/data-access` and are converted to Nest DTOs automatically; teams extend via additive Zod refinements.
* Error handling maps to shared taxonomy defined in `@starter/node-utils/errors`; HTTP exceptions are wrapped before leaving the controller.
* OpenAPI spec generated with `@starter/platform-api/openapi` (backed by `@nestjs/swagger`) during build; emitted to `dist/openapi.json` for consumption by PRD-02 generators.

### 4.4 Authentication & authorization (`@starter/auth/server`)

* Simple Auth integration handles session validation, token exchange, and role claims; `AuthGuard`, `RoleGuard`, and decorator helpers (`@CurrentUser`) come from the package.
* Default implementation supports mock provider for local dev and JWT bearer for previews; additional adapters follow ADR process.
* Queue workers and HTTP handlers access identity context via `AuthContext` service exported by `@starter/auth/server`.

### 4.5 Background jobs (`@starter/platform-queue` & `@starter/platform-cache`)

* BullMQ configuration, connection pools, and worker lifecycle managed by `@starter/platform-queue`; queue names, retry/backoff defaults, and telemetry derived from configuration package.
* Sample worker `ResourceDigestWorker` demonstrates job processing, retries, DLQ handling, and instrumentation; integration tests run against embedded Redis provided by the package or docker-compose fallback.
* Shared cache helpers (Redis) expose typed get/set/invalidation APIs; queue processors consume them for idempotency and scheduling.

### 4.6 Observability, security, and operations

* Logging uses `@starter/node-utils/logging` (pino wrapper) with correlation IDs, redaction list, and request lifecycle hooks set up automatically during bootstrap.
* Metrics and health endpoints provided by `@starter/platform-api/metrics` and `/health` & `/ready` modules; Prometheus exporter on `/metrics` and optional `/livez` for k8s probes.
* Tracing instrumentation via `@starter/platform-api/tracing` enabling OTLP exporters (Honeycomb-compatible) based on env flags.
* Security middleware (helmet, CORS, rate limiting) configured by `@starter/platform-api/security`; default CSP and request size limits documented.
* SBOM generation triggered during build via `pnpm api:build --sbom`, producing CycloneDX documents stored as CI artifacts (PRD-05 requirement).

### 4.7 Testing & documentation

* Vitest (node preset) configured through `@starter/jest-config/node`; integration harness from `@starter/platform-api/testing` spins up Postgres/Redis using Testcontainers or docker-compose.
* Contract tests run `pnpm api:contract` which boots the app against the generated OpenAPI client from `@starter/data-access` and fails on mismatches.
* Coverage target ≥ 85% statements/branches for HTTP modules and queue workers; thresholds enforced in CI.
* `/docs/api-shell.md` explains architecture, module factories, auth integration, and extension patterns referencing playbook workflows.

### 4.8 Deployment assets

* Dockerfile authored once under `apps/api` but consumes `@starter/platform-api/docker` stage definitions to ensure consistent node/pnpm versions and healthcheck commands.
* `docker-compose.yml` (for local) and optional Terraform/Helm snippets live under `infrastructure/` and reference environment variables defined by `@starter/config-env`.
* Preview deployment script `pnpm api:preview` aligns with PRD-05 provider choices (Fly.io or Railway) and reuses shared release automation.

---

## 5. Technical approach

1. **Single import surface** — All NestJS, Prisma, BullMQ, Redis, and Simple Auth dependencies reside in `packages/platform-*`; `apps/api` consumes typed facades, enabling future substrate swaps.
2. **Contract-first design** — Shared schemas originate in `@starter/data-access`; backend and frontend generate code from the same source to avoid drift.
3. **Configuration as code** — Env parsing, queue settings, and database URLs flow through `@starter/config-env`, ensuring consistent validation and defaults across environments.
4. **Operational parity** — Local docker-compose mirrors CI preview; bootstrap scripts seed databases, run migrations, and start workers automatically.
5. **Security baked-in** — Simple Auth integration, rate limiting, redaction, SBOM, and secret scanning enforced by packages and PRD-05 workflows.

---

## 6. Metrics & success criteria

* **Time to first endpoint:** ≤ 45 minutes to scaffold new resource module, run migrations, expose REST endpoints, and pass CI using provided commands.
* **Contract fidelity:** 0 contract test failures on `main`; OpenAPI regeneration requires CODEOWNERS review.
* **Coverage:** ≥ 85% statements/branches for HTTP modules and queue workers.
* **Operational readiness:** Health endpoints, metrics, and tracing verified in preview deployment; logs include correlation IDs.
* **Adoption:** 100% backend features rely on `@starter/*` packages without direct third-party imports.

---

## 7. Risks & mitigations

| Risk                                  | Impact                                | Mitigation                                                                 |
| ------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| Prisma schema divergence              | Conflicting migrations or drift       | Centralize schema in `@starter/platform-db`; enforce CODEOWNERS + automated migration checks. |
| Queue dependencies complicate setup   | Developers lack Redis locally         | Provide docker-compose + in-memory fallback; document hardware requirements. |
| Vendor changes (Simple Auth, BullMQ)  | Breaking changes ripple to teams      | Wrap APIs in `@starter/*`; maintain contract tests and ADR-governed upgrade plan. |
| Performance regressions               | Slow endpoints, fail budgets          | Include smoke/load tests, tracing sampling, and budgets enforced via CI telemetry. |
| Preview cost overruns                 | Budget concerns                       | Preview TTL automation, manual approval gates for protected environments, telemetry tracking. |

---

## 8. Rollout plan

1. **Phase 1 — Skeleton & infrastructure**
   * Implement `bootstrapApi`, module factories, env validation, health checks, and logging.
   * Finalize Prisma schema in `@starter/platform-db`; set up migrations, seeds, docker-compose services.

2. **Phase 2 — Feature reference**
   * Build `Resource` module + queue worker using shared packages; generate OpenAPI spec and client to validate contract.
   * Integrate `@starter/auth/server` with mock provider and preview JWT adapter.

3. **Phase 3 — Quality & docs**
   * Author Vitest + integration harness, contract tests, coverage instrumentation, and `/docs/api-shell.md`.
   * Add SBOM generation and security scanning steps referenced in PRD-05.

4. **Phase 4 — Preview & deployment assets**
   * Produce Dockerfile, preview workflow integration, and infrastructure snippets.
   * Run smoke tests in CI/previews; capture metrics and iterate on performance budgets.

---

## 9. Acceptance tests (definition of done)

1. `pnpm dev:api` starts HTTP server + worker using docker-compose; `/health`, `/ready`, and `/metrics` respond 200.
2. Running `pnpm test --filter apps/api...` passes unit + integration suites with coverage ≥ 85%.
3. Contract test hitting `/resources` matches schema from generated OpenAPI; mismatches fail CI.
4. ESLint boundary test fails when importing `@nestjs/common` or `prisma` directly from `apps/api`.
5. Preview deployment publishes Docker image, runs migrations via `@starter/platform-db`, and exposes authenticated endpoints with Simple Auth mock credentials.
6. SBOM artifact generated during `pnpm api:build` and attached to CI run alongside logs/metrics.

---

## 10. Dependencies & out of scope

* Depends on PRD-01 for workspace bootstrap and env management; PRD-02 for shared packages; PRD-05 for CI/CD pipelines and release automation.
* Out of scope: GraphQL endpoints, event-driven architecture, multi-region deployments, or managed secrets lifecycle (future PRDs).

---

## 11. Appendix

* **Reference templates:** NestJS Fastify starter, Prisma enterprise patterns, BullMQ best practices, Simple Auth server blueprints.
* **Playbook alignment:**
  * Definition of Ready — env templates, queue requirements, migration plan documented, auth adapters selected.
  * Definition of Done — endpoints implemented, tests + coverage meet thresholds, OpenAPI updated, preview deployed with telemetry.
* **Future enhancements:** cursor pagination mode, gRPC adapters, automated admin scaffolds leveraging `@starter/ui`, multi-tenant connection management.

