# PRD-02: Shared Configuration & Platform Packages

**Single-Stack:** Shadcn/UI + Vite/React/Tailwind + TanStack (Query/Store/DB/Router/DevTools)
**Backend:** NestJS + Prisma + PostgreSQL + BullMQ + Redis + **REST + OpenAPI**

## Document control

* **Status:** Draft (for sign-off)
* **Last updated:** 2025-10-19
* **Owners:** Platform Engineering Guild
* **Stakeholders:** Feature Enablement, Developer Experience, QA Automation, Security Engineering, Design Systems Guild
* **Related artifacts:** [PRD-01 Workspace Bootstrapping & Toolchain](prd-01-workspace-bootstrapping-toolchain.md), [Feature Delivery Playbook](../../playbook/README.md), [ADR Template](../../playbook/templates/ADR.md)

---

## 1. Background & problem statement

Teams waste cycles duplicating configs, rebuilding primitives, and wiring clients that should be standardized. Divergence slows delivery and increases defects. We are enforcing **one stack** and centralizing platform-grade packages so apps ship domain features, not plumbing, while insulating app code from third-party APIs.

* **Frontend substrate (encapsulated):** Shadcn/UI, Vite, React, Tailwind, TanStack Query/Store/DB/Router/DevTools, react-i18next, all wrapped by internal packages.
* **Backend substrate (encapsulated):** NestJS, Prisma, PostgreSQL, BullMQ, Redis, Simple Auth, **REST + OpenAPI**, all surfaced through internal packages.

This PRD defines the packages, contracts, and the **end-to-end pattern** pairing a UI **DataTable composite** with a **standard List Endpoint** on the API. ALL code in `apps/*` imports exclusively from `@starter/*` packages so that feature teams and AI agents operate against a single vocabulary and we can replace substrates without touching app code.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Drop-in config packages** — `@starter/eslint-config`, `@starter/prettier-config`, `@starter/tsconfig`, `@starter/jest-config`, `@starter/playwright-config`, `@starter/storybook-config`, `@starter/vite-config` used as-is by apps.
2. **Single UI package** — `@starter/ui` includes **all Shadcn/UI components**, tokens, typography, layout shells, hooks, and **reusable composites** (including **DataTable** component).
3. **Encapsulated runtime primitives** — Apps consume TanStack Query/Router/Store/DevTools, Simple Auth, Vite plugins, Prisma, BullMQ, and Redis strictly through `@starter/*` packages (no direct third-party imports allowed in `apps/*`).
4. **Typed utilities** — `@starter/utils` (web) and `@starter/node-utils` (server) for logging, flags, errors, date/time, and resilience helpers.
5. **REST + OpenAPI data-access** — `@starter/data-access` consumes OpenAPI specs from PRD-04 to generate typed React Query clients, Zod validation, MSW mocks, and a typed error taxonomy.
6. **Versioned, tested, published** — ESM builds with `.d.ts`, tests & coverage, Changesets releases, `/docs/packages/*` documentation.
7. **Component documentation** — Storybook stories for all UI components demonstrating props, states, variants, and accessibility.

### 2.2 Non-goals

* Alternative UI kits, transports, or DBs.
* Component library beyond Shadcn/UI plus minimal house-style wrappers (only where necessary).
* GraphQL/gRPC/RPC variants — **REST + OpenAPI only**.
* Application-level demonstrations, Storybook Scenes, or complete page examples (owned by PRD-03).
* Defining API endpoint contracts or response schemas (owned by PRD-04).

---

## 3. Personas & user stories

| Role                | Scenario                         | Success criteria                                                                                                                  |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frontend engineer   | Uses UI components.              | Imports from `@starter/ui`; components work with tokens/theme; Storybook shows all variants.                   |
| Backend engineer    | Uses platform packages.          | Imports from `@starter/platform-*`; no direct NestJS/Prisma imports needed; types flow correctly. |
| QA automation       | Uses testing packages.           | MSW mocks generated from OpenAPI; test configs work via `@starter/config-*`; coverage thresholds enforced.                                |
| Design systems lead | Reviews UI tokens & a11y.        | Tokens/preset applied across components; a11y checks pass in CI; component variants documented in Storybook.                                              |
| DevEx lead          | Maintains packages.              | Changesets publishes; adoption high; no local overrides required; updates isolated to packages.                                                                 |

---

## 4. Functional requirements

### 4.1 Package map & architecture

* **Packages (minimum set):**
  * **Configuration:** `packages/config-eslint`, `packages/config-prettier`, `packages/config-ts`, `packages/config-jest`, `packages/config-playwright`, `packages/config-storybook`, `packages/config-vite`, `packages/config-env`.
  * **Frontend runtime:** `packages/ui`, `packages/platform-router`, `packages/platform-query`, `packages/platform-store`, `packages/platform-devtools`, `packages/auth` (Simple Auth web bindings), `packages/utils`.
  * **Backend runtime:** `packages/platform-api` (NestJS bootstrap + module factory), `packages/platform-db` (Prisma client + migrations API), `packages/platform-queue` (BullMQ helpers), `packages/platform-cache` (Redis accessors), `packages/auth` (Simple Auth shared contracts), `packages/node-utils`.
  * **Integration:** `packages/data-access`, `packages/storybook-config`, `packages/config-env`, `packages/testing-msw`.
* **Build & module policy (all packages):**

  * ESM-first (`"type": "module"`), `"sideEffects": false` by default; conditional `"exports"` with `types`/`import`/`require` subpaths.
  * TS project references; `tsconfig.base.json` with aliases `@starter/<name>`.
  * Subpath exports only (no deep imports): e.g., `@starter/ui`, `@starter/platform-router`, `@starter/platform-query`, `@starter/platform-api`, `@starter/platform-db`, `@starter/auth/web`, `@starter/auth/server`.
  * `apps/*` are blocked (via ESLint boundaries) from importing `react`, `@tanstack/*`, `@nestjs/*`, `prisma`, etc. directly; they must rely on `@starter/*` abstractions.

### 4.2 Configuration packages (`config-*`)

* **ESLint:** strict TS, a11y, testing-library, import order, **boundaries** (forbid deep imports/cross-layer violations), security rules.
* **Prettier:** canonical formatting; no project-level overrides.
* **TypeScript:** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, project refs.
* **Jest/Vitest:** Node + jsdom presets, coverage reporters; Playwright for E2E/component where needed.
* **Storybook:** Vite builder; CSF3 + autodocs; a11y addon enabled.
* Each config package includes smoke tests (`eslint --print-config`, `tsc --project`, etc.).

### 4.3 UI package — `@starter/ui` (single, authoritative)

* **All Shadcn/UI components** vendored & normalized to our **Tailwind preset** and **tokens**.
* **Tokens & preset:** `@starter/ui/tokens` (CSS variables, TS typings), `@starter/ui/tailwind-preset` (colors, radius, shadows, spacing, typography scale).
* **Typography components** and **layout shells** (dashboard, settings, auth).
* **Hooks:** a11y helpers (focus rings, ARIA), react-i18next helpers, form utilities.
* **Composites:**

  * **`DataTable`** component (TanStack Table + Shadcn table + toolbar) with configurable props for pagination, multi-column sort, column filters, global search, column visibility, selection, server-mode support, virtualization (optional).
  * Loading/empty/error state components standardized; skeleton components align with tokens.
* **Storybook:**

  * Per-component stories demonstrating all props, states, and variants.
  * Accessibility checks via axe addon.
  * Interactive controls for exploring component APIs.
  * Application-level Scenes and page compositions are provided by PRD-03.

### 4.4 Runtime utilities & auth

* `@starter/utils` (web): typed errors, formatting, feature-flag facade, date/time helpers (Temporal polyfill or dayjs in UTC), URL/search param helpers layered on TanStack Router primitives.
* `@starter/node-utils`: pino logging with redaction, request/trace IDs, retry/backoff helpers, circuit breaker, BullMQ helpers.
* `@starter/auth`: wraps Simple Auth for both web and server:
  * `@starter/auth/web` exposes provider, hooks (`useCurrentUser`, `useHasRole`), guards, and mock adapters backed by Simple Auth SDK.
  * `@starter/auth/server` exposes Nest guards, request context helpers, and token utilities; also re-exports shared contracts consumed by web.
* Coverage: **≥ 90%** for utils and auth packages.

### 4.5 Routing, state, and data packages

* `@starter/platform-router`: wraps TanStack Router with starter-defined route definitions, loaders, and layout composition helpers. Provides CLI for generating nested routes, and exports typed navigation helpers for apps.
* `@starter/platform-query`: configures TanStack Query client, cache settings, dehydrated state serialization, and React bindings; integrates with `@starter/data-access`.
* `@starter/platform-store`: wraps TanStack Store for lightweight client state aligned with playbook patterns (feature flags, UI preferences).
* `@starter/platform-devtools`: lazily loads TanStack Devtools (query/store/router) conditioned on environment.

### 4.6 Data-access — `@starter/data-access` (REST + OpenAPI only)

* **Source of truth:** OpenAPI spec generated by PRD-04 (`apps/api` via `@starter/platform-api` utilities built on `@nestjs/swagger`).
* **Consumption:** Build step reads OpenAPI spec from PRD-04's `dist/openapi.json` output.
* **Generation:** Types + Zod validators from OpenAPI; typed TanStack Query hooks (queries/mutations); **MSW handlers** generated from the same schemas.
* **Error taxonomy:** `{ code, httpStatus, isRetryable, isAuthError, message, cause? }`, thrown consistently and aligned with backend responses.
* **Resilience:** timeouts; AbortController cancellation; retries (exponential backoff + jitter); idempotency keys for mutations; tracing headers (X-Request-Id).
* **Query keys:** `queryKeyFactory.resource.list(params)` for caching and invalidation consistency.
* **Contract compliance:** Generated clients match API contracts defined in PRD-04; contract tests validate parity.

### 4.7 Client generation contract expectations

* **Contract definition:** List Endpoint and other API contracts are defined by PRD-04 (API Application Shell).
* **Schema consumption:** `@starter/data-access` reads OpenAPI schemas and generates clients that match backend contracts exactly.
* **Type safety:** TypeScript types flow from OpenAPI definitions; request/response validation via generated Zod schemas.
* **Testing support:** MSW handlers generated from same OpenAPI schemas ensure frontend tests align with real API contracts.
* **Upgrade path:** When PRD-04 evolves contracts (e.g., adding cursor pagination), regenerating clients automatically provides new capabilities.

### 4.8 Environment & secrets

* `@starter/config-env`: shared Zod schemas for build/runtime; codemods for `--migrate-env` (PRD-01).
* `.env.example` per app/pkg; secrets never generated or committed.

### 4.9 Testing & quality gates

* Pipelines run `lint`, `typecheck`, `test`, `build` per package (Turborepo).
* UI: a11y (axe) gate in CI; bundle size budgets; visual tests via Storybook test runner/Playwright component.
* Data-access: contract tests (OpenAPI), chaos tests (429/5xx/timeouts).
* Coverage targets: UI **≥ 85%**, utils **≥ 90%**, data-access **≥ 90%** statements/branches.
* **Bundle budgets:** common UI components ≤ **10 KB** gzip; DataTable composite ≤ **20 KB** gzip (excluding TanStack peers). Exceptions require ADR.

### 4.10 Distribution & versioning

* ESM-first builds; minimal CJS where strictly necessary.
* Subpath exports (`@starter/ui/tokens`, `@starter/ui/composites`, etc.); no deep `dist/*` imports.
* `"sideEffects": false` defaults for treeshaking (opt-out per file if needed).
* Changesets drives semver; canaries allowed; **Deprecation Policy:** 2 minor releases notice + codemods.

### 4.11 Documentation & adoption

* `/docs/packages/*` with package-specific documentation:
  * Configuration packages: setup, extension patterns, available rules
  * UI package: component APIs, token system, theming, composition patterns
  * Platform packages: abstraction APIs, migration guides, extension points
  * Data-access: client generation workflow, query key patterns, MSW usage
* Storybook component stories with interactive examples and API documentation.
* Application-level examples and integration demonstrations are provided by PRD-03 and PRD-04.

### 4.12 Governance & enforcement

* **No alternatives**: deviations require RFC + guild approval.
* CODEOWNERS on `ui`, `data-access`, `config-*`.
* ESLint boundaries rules enforced; CI checks peer deps declared; SBOM + license policy scan; gitleaks in hooks/CI.

---

## 5. Integration with application shells

* **PRD-03 (Web Application Shell):** Imports `@starter/ui`, `@starter/platform-*`, and `@starter/data-access` to build features; demonstrates integration patterns.
* **PRD-04 (API Application Shell):** Imports `@starter/platform-api`, `@starter/platform-db`, `@starter/platform-queue`, and `@starter/auth/server`; generates OpenAPI specs consumed by data-access package.
* **Dependency flow:** PRD-04 generates OpenAPI → PRD-02 generates clients → PRD-03 uses clients.
* **Enforcement:** ESLint boundaries prevent apps from importing third-party libs directly; all access flows through `@starter/*` packages.

---

## 6. Technical approach

1. **Shadcn/UI integration** — Vendor **all** Shadcn components in `@starter/ui`, standardized to our tokens/preset; keep generators and patches tracked for reproducible upgrades.
2. **Tokens** — Single tokens JSON → CSS variables, Tailwind preset, TS typings via a simple build step; forbid ad-hoc colors/utilities that bypass tokens.
3. **DataTable component** — TanStack Table for state management; Shadcn table primitives for UI; configurable props for pagination, sorting, filtering; consumers (PRD-03) handle URL state and API integration.
4. **OpenAPI → client generation** — Build step consumes OpenAPI from PRD-04; generates Zod schemas, TypeScript types, MSW handlers, and React Query hooks; no global singletons; clients are tree-shakable.
5. **Error & resilience** — Shared helpers (timeouts, retry/backoff, idempotency, tracing headers) live in `@starter/utils`/`@starter/node-utils`; enforced at client boundary.
6. **Storybook** — Vite builder with `@starter/storybook-config`; component stories with a11y checks, interactive controls, and prop documentation.

---

## 7. Metrics & success criteria

* **Adoption:** ≥ **95%** of applications use `@starter/*` packages exclusively; zero direct third-party imports in `apps/*`.
* **Package usage:** All config packages extended without local overrides; UI components imported from `@starter/ui` only.
* **Defect reduction:** ≥ **70%** drop in config/UI boilerplate issues vs. baseline quarter.
* **Coverage:** UI components ≥ 85%, utils ≥ 90%, data-access ≥ 90%.
* **Bundle budgets:** ≥ **95%** of components under budget (≤ 10KB gzip for primitives, ≤ 20KB for composites); exceptions documented in ADR.
* **Documentation:** 100% of public package APIs documented in Storybook or `/docs/packages/*`.

---

## 8. Risks & mitigations

| Risk                                       | Impact             | Mitigation                                                                                      |
| ------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| Vendoring all Shadcn increases maintenance | Drift/upgrade toil | Track generator inputs; periodic sync; snapshot tests on key comps; documented upgrade playbook |
| Over-opinionated filters/sorts             | Workarounds/forks  | Extensible filter DSL + API adapters; RFC path for new operators; examples in OpenAPI           |
| Contract breaking changes                  | Consumer breakage  | Changesets + deprecation policy; contract tests in CI; codemods for migrations                  |
| Bundle weight creep                        | Slower pages       | Budgets + Storybook perf checks; CI flags large imports; split heavy comps                      |

---

## 9. Rollout plan

**Phase A (Weeks 1–2, MVP)**

* `config-*`: ESLint/Prettier/TS/Jest/Playwright/Storybook packages ready; enforce boundaries.
* `@starter/ui`: import **all Shadcn** components; tokens + Tailwind preset; typography; layout shells.
* `@starter/platform-*`: Runtime wrappers for TanStack, NestJS, Prisma, BullMQ, Redis.

**Phase B (Weeks 3–4)**

* `@starter/ui`: DataTable component with configurable props; loading/empty/error states.
* `@starter/data-access`: OpenAPI consumption pipeline; types/Zod/MSW/hooks generation; error taxonomy.
* `@starter/utils` and `@starter/node-utils`: Logging, flags, resilience helpers.

**Phase C (Week 5+)**

* Storybook stories for all components with a11y checks and interactive controls.
* Advanced DataTable features: virtualization, column resizing, advanced filtering props.
* Changesets workflow; documentation in `/docs/packages/*`; published to internal registry.

---

## 10. Acceptance tests (definition of done)

1. **Config adoption:** Applications extend config packages with minimal lines and pass `lint`/`typecheck`/`test` without overrides.
2. **UI completeness:** `@starter/ui` exports all Shadcn components; tokens/preset present; Storybook shows each with docs and a11y checks green.
3. **Platform encapsulation:** ESLint boundaries successfully block direct imports of TanStack, NestJS, Prisma, etc. from `apps/*`.
4. **Client generation:** Consuming OpenAPI from PRD-04 regenerates types/schemas/hooks; mismatches caught during build.
5. **Error taxonomy:** Generated clients throw typed errors matching taxonomy; retries follow policy and are test-verified.
6. **Budgets & coverage:** Bundle budgets and coverage thresholds met for all packages; exceptions require ADR.
7. **Package publishing:** Changesets workflow creates versioned releases; packages consumable via internal registry.

---

## 11. Dependencies & out of scope

* Depends on **PRD-01** (workspace bootstrap, pipelines, env validation, Dev Container, remote cache).
* Depends on **PRD-04** to generate OpenAPI specifications consumed by `@starter/data-access`.
* Design Systems Guild supplies initial token values/brand guidance.
* Not in scope:
  * Alternative UI frameworks, transports, or database clients.
  * Application-level demonstrations or complete page examples (PRD-03 responsibility).
  * API endpoint contract definitions or backend implementations (PRD-04 responsibility).

---

## 12. Final decisions

* **All UI in one package:** Yes — `@starter/ui` (components, tokens, composites, layouts, hooks).
* **Package scope:** Provide reusable, tested primitives; applications (PRD-03/04) demonstrate integration.
* **Browser support (evergreen):** Desktop Chrome/Edge **115+**, Firefox **115 ESR+**, Safari **16.4+**; Mobile iOS Safari **16.4+**, Chrome for Android **115+**. Minimal polyfills (Intl/AbortController) only if needed.
* **Transport strategy:** **REST + OpenAPI only** (no alternatives); contracts defined by PRD-04.
* **Storybook scope:** Component stories only; application Scenes provided by PRD-03.

---

## 13. Appendix

### 13.1 Package architecture diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Applications (PRD-03: apps/web, PRD-04: apps/api)           │
│ Import ONLY from @starter/* packages                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ uses
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PRD-02: Shared Packages (@starter/*)                        │
│                                                              │
│ ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│ │ config-*    │  │ ui           │  │ platform-*     │      │
│ │ (ESLint,    │  │ (Shadcn,     │  │ (TanStack,     │      │
│ │  TS, etc.)  │  │  tokens,     │  │  NestJS,       │      │
│ │             │  │  DataTable)  │  │  Prisma)       │      │
│ └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                              │
│ ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│ │ data-access │  │ utils        │  │ auth           │      │
│ │ (Generated  │  │ (Helpers,    │  │ (Simple Auth   │      │
│ │  clients)   │  │  flags)      │  │  wrappers)     │      │
│ └─────────────┘  └──────────────┘  └────────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │ wraps
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Third-party Dependencies                                     │
│ TanStack, Shadcn, NestJS, Prisma, BullMQ, Simple Auth       │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 DataTable component API

* **Component:** Reusable table primitive with TanStack Table integration
* **Props:** `data`, `columns`, `onPaginationChange`, `onSortingChange`, `onFilterChange`, etc.
* **Integration:** Consumers (PRD-03) wire to URL state and API queries
* **States:** Loading, empty, error states via component props
* **Customization:** Column definitions, filter components, toolbar actions configurable

---

**End of PRD-02.**
