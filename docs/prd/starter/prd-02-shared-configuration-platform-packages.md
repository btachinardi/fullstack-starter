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
2. **Single UI package** — `@starter/ui` includes **all Shadcn/UI components**, tokens, typography, layout shells, hooks, and **opinionated composites** (including **DataTable**).
3. **Encapsulated runtime primitives** — Apps consume TanStack Query/Router/Store/DevTools, Simple Auth, Vite plugins, Prisma, BullMQ, and Redis strictly through `@starter/*` packages (no direct third-party imports allowed in `apps/*`).
4. **Complete list/table pattern** — Out-of-the-box DataTable (pagination, filters, sorting, search, URL state) that targets a **standard REST List Endpoint**.
5. **Typed utilities** — `@starter/utils` (web) and `@starter/node-utils` (server) for logging, flags, errors, date/time, and resilience helpers.
6. **REST + OpenAPI data-access** — `@starter/data-access` generates typed React Query clients from **OpenAPI**, with Zod validation, MSW mocks, and a typed error taxonomy.
7. **Versioned, tested, published** — ESM builds with `.d.ts`, tests & coverage, Changesets releases, `/docs/packages/*` documentation.
8. **Storybook as the showroom** — Stories for components **and** page compositions (scenes) to demonstrate real usage and copy-paste recipes.

### 2.2 Non-goals

* Alternative UI kits, transports, or DBs.
* Component library beyond Shadcn/UI plus minimal house-style wrappers (only where necessary).
* GraphQL/gRPC/RPC variants — **REST + OpenAPI only**.

---

## 3. Personas & user stories

| Role                | Scenario                         | Success criteria                                                                                                                  |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frontend engineer   | Builds a list page with filters. | Uses `@starter/ui` DataTable + `@starter/data-access` against `/resources`; page shippable in ≤ **30 minutes**.                   |
| Backend engineer    | Adds a new resource.             | Implements Nest controller/service with our **List Endpoint Contract**; OpenAPI generates clients; contract tests pass first try. |
| QA automation       | Runs contract/UI tests.          | MSW fixtures from OpenAPI; Playwright + Storybook test runner align; uniform reporters/thresholds.                                |
| Design systems lead | Reviews UI tokens & a11y.        | Tokens/preset applied, a11y checks pass in CI, compositions documented in Storybook.                                              |
| DevEx lead          | Maintains packages.              | Changesets publishes; adoption high; no local overrides required.                                                                 |

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

  * **`DataTable`** (TanStack Table + Shadcn table + toolbar) with pagination, multi-column sort, column filters, global search, column visibility, selection, server-mode wiring, virtualization (optional).
  * Loading/empty/error states standardized; skeletons align with tokens.
* **Storybook:**

  * Per-component stories **and** **Scenes**: complete pages (list with filters, bulk actions, settings forms), showing composition patterns and code recipes.

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

* **Source of truth:** OpenAPI emitted by Nest (via `@starter/platform-api` utilities built on `@nestjs/swagger`).
* **Generation:** Types + Zod validators from OpenAPI; typed TanStack Query hooks (queries/mutations); **MSW handlers** generated from the same schemas.
* **Error taxonomy:** `{ code, httpStatus, isRetryable, isAuthError, message, cause? }`, thrown consistently.
* **Resilience:** timeouts; AbortController cancellation; retries (exponential backoff + jitter); idempotency keys for mutations; tracing headers (X-Request-Id).
* **Query keys:** `queryKeyFactory.resource.list(params)` for caching and invalidation consistency.

### 4.7 Standard List Endpoint Contract (offset/limit, MVP)

* **Why:** simpler MVP across Nest + Prisma + UI; clear mental model; works for admin/data-heavy screens.
* **Request (GET):**
  `/:resource?search=&page=&perPage=&sort=&order=&filters[foo]=bar&filters[baz]=qux`
* **Response (200):**

  ```json
  {
    "items": [],
    "page": 1,
    "perPage": 20,
    "total": 0,
    "summary": {},
    "meta": { "queryId": "uuid", "generatedAt": "2025-10-19T00:00:00Z" }
  }
  ```
* **Sorting:** single or multi via `sort=field1,-field2` (descending via `-`).
* **Stability:** API must add a secondary sort key (e.g., `id ASC`) to avoid duplicates/omissions.
* **Upgrade path (post-GA):** optional **cursor mode** behind a feature flag (not part of MVP).

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

* `/docs/packages/*` with quick-start recipes, especially **“Build a List Page”** (DataTable ↔ List Endpoint end-to-end).
* `examples/with-vite-web` (list page) and `examples/nest-resource` (resource implementing the contract).
* Storybook **Scenes** catalog (dashboards, settings, wizard, list pages with filters/bulk actions).

### 4.12 Governance & enforcement

* **No alternatives**: deviations require RFC + guild approval.
* CODEOWNERS on `ui`, `data-access`, `config-*`.
* ESLint boundaries rules enforced; CI checks peer deps declared; SBOM + license policy scan; gitleaks in hooks/CI.

---

## 5. Backend alignment (authoritative)

* **NestJS** exposes the **List Endpoint Contract** for each resource; DTOs/validators enforce filter/sort safety.
* **Prisma** models define canonical fields for filters/sorts; pagination via offset/limit for MVP, stabilized by secondary sort.
* **OpenAPI** generated at build, versioned; CI requires CODEOWNERS approval for spec changes.
* **BullMQ + Redis** for background jobs; status endpoints documented in OpenAPI where needed.

---

## 6. Technical approach

1. **Shadcn/UI integration** — Vendor **all** Shadcn components in `@starter/ui`, standardized to our tokens/preset; keep generators and patches tracked for reproducible upgrades.
2. **Tokens** — Single tokens JSON → CSS variables, Tailwind preset, TS typings via a simple build step; forbid ad-hoc colors/utilities that bypass tokens.
3. **DataTable composite** — TanStack Table for state; Shadcn table for UI; TanStack Router for URL state; TanStack Query binding; typed column/filter definitions.
4. **OpenAPI → client** — Build step generates Zod schemas, types, MSW handlers, and React Query hooks; no global singletons; clients are tree-shakable.
5. **Error & resilience** — Shared helpers (timeouts, retry/backoff, idempotency, tracing headers) live in `@starter/utils`/`@starter/node-utils`; enforced at client boundary.
6. **Storybook** — Vite builder with `@starter/storybook-config`; stories include comps + scenes, a11y checks, interactive controls, and copy-paste recipes.

---

## 7. Metrics & success criteria

* **Adoption:** ≥ **90%** of new list pages use `@starter/ui` DataTable + the List Endpoint by the first sprint post-GA.
* **Time to first list page:** ≤ **30 minutes** from scaffold to page hitting the real API.
* **Defect reduction:** ≥ **70%** drop in config/UI boilerplate issues vs. baseline quarter.
* **Coverage:** UI ≥ 85%, utils ≥ 90%, data-access ≥ 90%.
* **Bundle budgets:** ≥ **95%** of components under budget; exceptions documented in ADR.

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

* `@starter/ui`: import **all Shadcn** comps; tokens + Tailwind preset; typography; **DataTable** (local data, full UI states).
* `@starter/data-access`: OpenAPI → types/Zod/MSW/hooks; error taxonomy; resilience.
* `config-*`: ESLint/Prettier/TS/Jest/Playwright/Storybook ready; Storybook per-component stories.

**Phase B (Weeks 3–4)**

* Wire DataTable to **offset/limit** List Endpoint (Nest + Prisma template).
* URL state with TanStack Router; query key factory; server-driven sort/filter parity.
* Storybook **Scenes** (list page with filters, bulk actions) + docs & examples.

**Phase C (Week 5+)**

* Table virtualization; optional aggregates (`summary`); advanced filter DSL.
* Optional **cursor mode** behind a flag (not default).
* Expand a11y automation; design token theming presets.

---

## 10. Acceptance tests (definition of done)

1. **Config adoption:** `apps/web` extends config packages with < 5 lines and passes `lint`/`typecheck`/`test` without overrides.
2. **UI completeness:** `@starter/ui` exports all Shadcn comps; tokens/preset present; Storybook shows each with docs and a11y checks green.
3. **DataTable E2E:** With a Nest resource implementing the List Contract, a page using **only** `@starter/ui` (DataTable composite) + `@starter/data-access` lists, paginates, sorts, filters, searches, and URL-syncs state.
4. **Client generation:** Changing OpenAPI regenerates types/schemas/hooks; mismatches fail CI in consuming apps.
5. **Error taxonomy:** A 429/5xx yields a typed error; retries follow policy and are test-verified.
6. **Budgets & coverage:** Bundle budgets and coverage thresholds met; exceptions require ADR.

---

## 11. Dependencies & out of scope

* Depends on **PRD-01** (bootstrap, pipelines, env validation, Dev Container).
* Design Systems Guild supplies initial token values/brand guidance.
* Domain teams provide Prisma models & Nest DTOs aligned with the contract.
* Not in scope: alternative transports/clients; non-Shadcn component sets.

---

## 12. Final decisions (answering former “open questions”)

* **All UI in one package:** Yes — `@starter/ui` (components, tokens, composites, layouts, hooks).
* **Pagination mode for v1:** **Offset/limit only**; stable secondary sort (e.g., `id ASC`). Cursor mode can come later behind a flag.
* **Browser support (evergreen):** Desktop Chrome/Edge **115+**, Firefox **115 ESR+**, Safari **16.4+**; Mobile iOS Safari **16.4+**, Chrome for Android **115+**. Minimal polyfills (Intl/AbortController) only if needed.
* **Transport strategy:** **REST + OpenAPI only** (no alternatives).

---

## 13. Appendix

### 13.1 OpenAPI snippet — List Endpoint Contract (MVP)

```yaml
openapi: 3.0.3
info:
  title: Starter API
  version: 1.0.0
paths:
  /{resource}:
    get:
      summary: List resources (offset/limit)
      parameters:
        - in: path
          name: resource
          required: true
          schema: { type: string }
        - in: query
          name: search
          schema: { type: string }
        - in: query
          name: page
          schema: { type: integer, minimum: 1, default: 1 }
        - in: query
          name: perPage
          schema: { type: integer, minimum: 1, maximum: 200, default: 20 }
        - in: query
          name: sort
          description: Comma-separated fields, prefix with '-' for desc (e.g., name,-createdAt)
          schema: { type: string }
        - in: query
          name: order
          description: Deprecated (prefer "sort")
          schema: { type: string, enum: [asc, desc] }
        - in: query
          name: filters
          style: deepObject
          explode: true
          schema:
            type: object
            additionalProperties: { type: string }
      responses:
        '200':
          description: Paged result
          content:
            application/json:
              schema:
                type: object
                required: [items, page, perPage, total]
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Resource' } # replaced per resource
                  page: { type: integer }
                  perPage: { type: integer }
                  total: { type: integer }
                  summary:
                    type: object
                    additionalProperties: {}
                  meta:
                    type: object
                    properties:
                      queryId: { type: string, format: uuid }
                      generatedAt: { type: string, format: date-time }
components:
  schemas:
    Resource:
      type: object
      additionalProperties: true
```

### 13.2 UI DataTable bindings (contracted props)

* `queryKey = queryKeyFactory.resource.list(params)`
* `queryFn = api.resource.list(params)` (generated client)
* `columns: ColumnDef<Resource>[]` with `meta.filter`, `meta.sortable` hints
* `state ↔ URL` via TanStack Router (search params: `page`, `perPage`, `sort`, `filters.*`)

---

**End of PRD-02.**
