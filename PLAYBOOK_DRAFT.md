# Feature Delivery Playbook

A practical, end‑to‑end workflow for planning, designing, implementing, testing, reviewing, and releasing features in full‑stack products. It includes:

* A canonical **feature workflow** from idea → prod → learn.
* **Specialized tracks** (API, UI, DB, background jobs, infra, analytics, security, performance, accessibility, i18n).
* **Checklists, definitions, and templates** (PRD, API, UI spec, test plans, QA, code review, DoR/DoD, ADR, RFC, risk log).
* **Quality gates** for CI/CD, including metrics.

---

## 0) Repo structure (suggested)

```
/playbook
  README.md
  /definitions
    definition-of-ready.md
    definition-of-done.md
    quality-gates.md
    branching-and-release.md
    coding-standards.md
  /templates
    PRD.md
    UI-spec.md
    API-spec-openapi.yaml
    DB-migration-checklist.md
    Test-plan.md
    E2E-scenarios.md
    QA-checklist.md
    Code-review-checklist.md
    ADR.md
    RFC.md
    Risk-register.md
    Analytics-plan.md
    Accessibility-checklist.md
    Security-ASVS-checklist.md
    Performance-checklist.md
  /workflows
    feature-overview.md
    api-workflow.md
    ui-workflow.md
    db-workflow.md
    background-jobs.md
    infra-observability.md
    security-privacy.md
    performance.md
    accessibility-i18n.md
    analytics-experiments.md
```

---

## 1) Overview: Feature Workflow (idea → prod → learn)

**Stages & gates**

1. **Intake & triage**

   * Capture idea → turn into a lightweight **PRD** with problem, outcomes, constraints, scope boundaries, and **acceptance criteria** (Gherkin preferred).
   * Link to **RFC** if cross‑team or architectural.
   * **DoR gate**: story/spec meets readiness checklist.
2. **Discovery & design** (parallel tracks)

   * **Research** (users, market, technical spikes), **Design** (UX flows, UI components), **Systems** (API contracts, DB schema, events).
   * Produce specs: **UI Spec**, **API Spec (OpenAPI)**, **DB changes (migration plan)**.
3. **Plan & slice**

   * Break into **vertical slices** that deliver user‑visible value; avoid backend‑only sprints.
   * Define **test strategy** (unit/integration/contract/E2E), **analytics**, **risk mitigations**.
4. **Build**

   * Trunk‑based, short‑lived branches, feature flags.
   * Follow **quality gates** (types, linters, unit/integration/contract tests, static analysis, security checks).
5. **Verify**

   * **E2E** in ephemeral/pre‑prod env; **Manual QA** using checklists; **accessibility/perf** baselines; **data validation**.
6. **Release**

   * Progressive delivery (canary, staged rollout), observability SLOs; runbooks and **rollback** plan.
7. **Measure & learn**

   * Track **DORA** + product metrics; analyze logs/analytics; retro & ADR updates.

**RACI (suggested)**

* **Owner**: Feature lead/PM (PRD, acceptance).
* **Design**: UX lead.
* **Tech**: Tech lead (API, DB, system constraints, RFC/ADR).
* **QA**: QA lead (plan, E2E, regression).
* **Data/Analytics**: Analytics owner (events, KPIs, dashboards).

---

## 2) Definitions

### 2.1 Definition of Ready (DoR) — excerpt

* Clear **problem** and **desired outcome**.
* User stories have **acceptance criteria** (Gherkin), edge cases, non‑functional requirements (NFRs).
* **Designs** (flows/wireframes) approved for scope.
* **API contracts** drafted (OpenAPI) and mockable.
* **Data model impact** known; migrations risked & estimated.
* **Test strategy** drafted; environments available.
* **Dependencies** identified; risks logged; owners assigned.

### 2.2 Definition of Done (DoD) — excerpt

* All code merged to **trunk** behind flags.
* **Automated tests** meet coverage & pyramid balance; **contract tests** pass; **E2E critical paths** green.
* **Security** checks (ASVS level) and **accessibility** checks pass; **performance** budgets respected.
* **Docs** updated (PRD status, ADRs, API docs, runbook, changelog).
* **Telemetry** (metrics, logs, traces, analytics) implemented.
* **Release**: deployed via CI/CD with rollback; monitoring alerts in place.

### 2.3 Branching & releases (suggested)

* **Trunk‑based development** with short‑lived branches; feature flags; CI on every commit.
* **Environment strategy**: PR previews → staging → production; automatic promotions; canary/staged rollouts.

### 2.4 Quality gates (typical CI)

* Type‑check, lint/format, unit tests, integration/contract tests, SAST/Dep scan, build, E2E smoke, accessibility/perf audits, artifact signing.

---

## 3) Specialized Workflows

### 3.1 API Track (REST/GraphQL)

**Artifacts**: OpenAPI/GraphQL schema, mocks, contract tests, runbooks.

**Steps**

1. **Design**:

* Resource model, versioning, pagination, filtering.
* Authn/z, rate limits, idempotency keys, error model.
* Backward compatibility & deprecation policy.

2. **Spec**:

* Author **OpenAPI**; publish mock server; add examples.

3. **Tests**:

* Unit (handlers), integration (DB, services), **contract tests** (Pact), fuzz (schemas), negative cases.

4. **Implementation**:

* Logging/trace IDs, structured errors, idempotency, retries.

5. **Docs**:

* Auto‑generate reference, include **changelog**, **SLOs**, and **runbook** (alerts, dashboards, playbooks).

**Checklist (excerpt)**

* [ ] OpenAPI validated; examples provided.
* [ ] Non‑breaking changes; versioning plan.
* [ ] Security (ASVS) controls mapped.
* [ ] Rate limiting & quotas defined.
* [ ] Observability (metrics, logs, traces) in place.

---

### 3.2 UI Track (Web/Mobile)

**Artifacts**: UI spec, component inventory, Storybook stories, visual regression baselines.

**Steps**

1. **Design**: Use tokens (color, spacing, typography), states & edge cases; responsiveness; a11y.
2. **Spec**: Component API (props, events), state management, data contracts; routing.
3. **Tests**: Unit (components), integration (store+component), visual regression; E2E flows.
4. **Implementation**:

* Components first (Storybook), container pages later; loading/error/empty states.
* Accessibility first: roles, labels, focus order, keyboard, contrast.

5. **Docs**: Autodocs via Storybook; usage guidelines; playground links.

**Checklist (excerpt)**

* [ ] Storybook stories for happy/sad/edge states.
* [ ] Keyboard‑only path and screen‑reader checks.
* [ ] Performance budget (LCP/INP/TTFB) baselined.
* [ ] i18n keys and pluralization ready.

---

### 3.3 Database & Migrations

**Artifacts**: ERD, migration scripts, rollback plan, data backfill plan.

**Steps**

1. **Design**: schema changes, constraints, indexes; data retention; PII classification.
2. **Plan**: backward‑compatible migrations (expand → migrate → contract); blue/green data changes.
3. **Tests**: migration dry‑runs; performance checks; data quality assertions.
4. **Implementation**: execute with feature flags/dual‑write where needed; backfill jobs.
5. **Ops**: backup/restore tested; runbooks updated.

**Checklist (excerpt)**

* [ ] Zero‑downtime migration plan.
* [ ] Rollback script and restore tested.
* [ ] Index/constraint effects measured.
* [ ] PII masked; retention policy respected.

---

### 3.4 Background Jobs & Eventing

* Define queues/topics, retry/backoff, idempotency, DLQ policy, observability.
* Contract tests for event payloads; versioning.
* Runbooks: lag alerts, throughput SLOs.

---

### 3.5 Infra & Observability

* IaC (e.g., Terraform) reviewed; secrets management; environment parity.
* Golden signals: latency, traffic, errors, saturation.
* Tracing propagation; log correlation; SLO/SLA, alerts.

---

### 3.6 Security & Privacy

* Map requirements to **OWASP ASVS** level; threat model; authn/z patterns; secrets rotation.
* Privacy: data minimization, DPA, retention, RTBF, audit trails.
* Validate dependencies; SBOM; supply‑chain controls.

---

### 3.7 Performance

* Budgets (client & server); load profiles; caching strategy; DB query plans.
* Synthetic + real‑user monitoring; regression alerts.

---

### 3.8 Accessibility & i18n

* Conform to **WCAG 2.2** (AA target); focus management; color/contrast; motion & cognitive load.
* i18n: ICU pluralization, RTL, locale‑aware formats.

---

### 3.9 Analytics & Experiments

* Define KPIs, events (schema, naming, IDs), consent & privacy.
* Experiment design (hypothesis, guardrails), attribution, rollout.

---

## 4) Templates (editable)

### 4.1 PRD (excerpt)

* **Problem** | **Why now** | **Goals/Non‑Goals** | **Users/Jobs**
* **Success metrics** (leading/lagging) | **Constraints**
* **User stories** (Gherkin):

  * `Given … When … Then …`
* **Risks & mitigations** | **Open questions**

### 4.2 UI Spec (excerpt)

* Flows & screens (links)
* Component list with props/events/state
* Accessibility acceptance (WCAG items)
* Visual states matrix: loading/empty/error/disabled

### 4.3 API Spec (OpenAPI) — scaffold

```yaml
openapi: 3.1.0
info:
  title: Feature API
  version: 0.1.0
servers:
  - url: https://api.example.com
paths:
  /widgets:
    get:
      summary: List widgets
      parameters:
        - in: query
          name: page
          schema: { type: integer, minimum: 1 }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Widget' }
components:
  schemas:
    Widget:
      type: object
      required: [id, name]
      properties:
        id: { type: string, format: uuid }
        name: { type: string }
```

### 4.4 Test Plan (excerpt)

* **Pyramid**: target ratios unit:integration:E2E (e.g., 70:20:10)
* **Contract tests** endpoints/events
* **Non‑functional**: perf, a11y, security, resilience
* **Data**: fixtures, anonymization, backfills

### 4.5 QA Checklist (excerpt)

* Install, login, navigation, feature slices, error handling
* A11y keyboard/screen reader, color contrast
* Perf smoke (TTFB/LCP), offline/slow network
* Security smoke (authz boundaries), PII redaction

### 4.6 Code Review Checklist (excerpt)

* Scope clear; small PR; meaningful description & screenshots
* Tests updated; contracts unchanged or versioned
* Readability, naming, cohesion; dead code removed
* Failure modes; logging & metrics; feature flagging

### 4.7 ADR (Architecture Decision Record) — scaffold

* Context | Decision | Status | Consequences | Alternatives | Links

### 4.8 RFC — scaffold

* Summary | Motivation | Detailed design | Drawbacks | Alternatives | Adoption plan | Unresolved questions

### 4.9 Risk Register — table columns

* ID | Description | Likelihood | Impact | Owner | Mitigation | Status

### 4.10 Analytics Plan — excerpt

* KPIs | Events (name, payload schema, trigger, owner) | Dashboards | Guardrails

### 4.11 Accessibility Checklist — excerpt

* Keyboard navigation; focus visible/order; semantics & ARIA; labels; color contrast; alt text; error messages; motion/timers; forms; localization.

### 4.12 Security (ASVS) Checklist — excerpt

* Authentication, session mgmt, access control, input validation, cryptography, error handling, data protection, logging & monitoring, API security, configuration.

### 4.13 Performance Checklist — excerpt

* Client: bundle size, images/fonts, caching, hydration, INP/LCP
* Server: N+1 checks, indexes, caching, concurrency, autoscaling

---

## 5) Metrics & Continuous Improvement

* **Delivery**: DORA (deployment frequency, lead time, MTTR, change failure rate)
* **Quality**: defect escape rate, test flakiness, a11y/perf scores
* **Product**: activation, retention, conversion, NPS
* **Cadence**: retrospectives, incident postmortems, ADR updates, KPI reviews.

---

## 6) Usage

* Copy this playbook into your repo.
* Start each feature by creating the **PRD**, **UI spec**, **API spec**, and **Test plan** using the templates.
* Enforce **DoR/DoD** and **quality gates** in CI; iterate via RFC/ADRs when architecture evolves.
* Keep everything small, vertical, observable, and reversible.

---

# 7) Stack‑Specific Edition

> Target stack: **TanStack Query/DB/Store/Router/DevTools + shadcn/ui + Playwright + Vite + Tailwind v4** • **Prisma + PostgreSQL + NestJS + Redis + BullMQ** • **GitHub Actions + Docker Compose (dev) + Render.com YAML + Dependabot** • **PNPM workspaces + Turborepo + Biome** • **Claude Code Commands/Agents/Hooks + node scripts**

## 7.1 Monorepo layout (PNPM + Turborepo)

```
/ (repo root)
  package.json
  pnpm-workspace.yaml
  turbo.json
  biome.jsonc
  /apps
    /web        # React + Vite + TanStack + shadcn/ui
    /api        # NestJS (HTTP + queues + webhooks)
    /worker     # BullMQ processors, scheduled jobs
    /e2e        # Playwright tests & fixtures
  /packages
    /ui         # Shared components (shadcn primitives wrapped)
    /config     # tsconfig, eslint/biome presets, tailwind preset
    /schemas    # zod DTOs, OpenAPI schemas, event payloads
    /scripts    # node CLIs (codegen, db tasks, agents hooks)
```

**pnpm-workspace.yaml** (excerpt)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**turbo.json** (excerpt)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", "build/**"] },
    "lint": {},
    "test": {},
    "e2e": { "dependsOn": ["build"], "cache": false }
  }
}
```

**biome.jsonc** (excerpt)

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "linter": { "rules": { "style": { "useConst": "error" } } },
  "javascript": { "parser": { "unsafeParameterDecorators": true } }
}
```

## 7.2 Frontend (React + Vite + TanStack + Tailwind v4 + shadcn/ui)

### 7.2.1 Standards

* **Data** via **TanStack Query**; mutations return optimistic updates; cache keys use `['entity', id, params]`.
* **Routing** via **TanStack Router** with loader/actions; co‑locate queries with routes.
* **State**: prefer **TanStack Store** for local/ephemeral UI state; avoid global singletons unless cross‑route.
* **Tables/forms**: shadcn/ui components; keep design tokens in Tailwind preset in `packages/config/tailwind`.
* **A11y** first (WCAG 2.2 AA); keyboard flows in Storybook and Playwright.

### 7.2.2 Tailwind v4 preset (configless style)

`packages/config/tailwind/preset.css`

```css
@import "tailwindcss";
@theme {
  --color-primary: var(--brand-600);
  --radius-md: 0.5rem;
}
```

Import in app entry: `import '@repo/config/tailwind/preset.css'`

### 7.2.3 Query & component conventions

```ts
// apps/web/src/features/widgets/api/useWidgets.ts
export const widgetsKeys = {
  all: ['widgets'] as const,
  list: (q: { page?: number }) => [...widgetsKeys.all, 'list', q] as const,
  detail: (id: string) => [...widgetsKeys.all, 'detail', id] as const
};
```

**Error handling**: central `QueryClient` with `onError` → toast + log; auth 401 → router redirect.

### 7.2.4 Storybook & isolated testing

* Stories for **happy/sad/edge** states with MSW handlers that reuse OpenAPI examples.
* Visual regression opt‑in per critical components.

## 7.3 Backend (NestJS + Prisma + PostgreSQL)

### 7.3.1 Architecture

* Modules per **bounded context** (`UsersModule`, `BillingModule`, `WidgetsModule`).
* DTOs defined in **packages/schemas** (zod), transformed to Nest DTOs via adapters.
* Validation: `class-validator` or zod pipes; **global validation pipe** with strict whitelist.
* **OpenAPI** auto‑docs + examples from schemas; emit JSON for mock server & contract tests.

### 7.3.2 Prisma

* Source of truth for relational schema & migrations.
* **Expand → Migrate → Contract** pattern for 0‑downtime; tag risky migrations.
* Generate **type‑safe** client; enable query tracing.

**db tasks (packages/scripts/db.ts)**

```ts
// npx tsx packages/scripts/db.ts migrate:dev | generate | seed | diff | studio
```

### 7.3.3 Caching & queues

* **Redis** as cache + rate limit + locks (SET NX + TTL); namespaced keys per env.
* **BullMQ** queues: one queue per aggregate; define retry/backoff, idempotency keys, DLQ.
* Use **outbox** pattern for reliability (DB → outbox → worker publishes events).

### 7.3.4 Webhooks

* Verify signatures, replay protection (nonce + TTL), idempotent handlers.
* Store raw payloads for audit; respond 2xx only after durable write.

### 7.3.5 Observability

* Structured logs (requestId, userId); traces (http.server, db, queue); RED/USE metrics; SLOs per endpoint.

## 7.4 Background workers (Worker app)

* **BullMQ** processors colocated with domain logic; share `packages/schemas` types.
* Circuit‑breaker for flaky deps; exponential backoff; DLQ dashboard.
* Scheduled jobs via queue + cron; store **lastRun** + result for audit.

## 7.5 Contracts & testing

### 7.5.1 Contract tests

* Generate **OpenAPI** from Nest; publish to `/contracts/openapi.json`.
* Consumer (web) **Pact** tests pin to a version; provider verifies on CI.

### 7.5.2 Unit/Integration/E2E

* **Unit**: pure funcs, services.
* **Integration**: Nest TestingModule + **Testcontainers** (Postgres, Redis) or Docker Compose.
* **E2E**: Playwright against ephemeral preview; seed with fixtures; tag `@smoke` for PR gates.

**playwright.config.ts** (snippet)

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { baseURL: process.env.E2E_BASE_URL, trace: 'retain-on-failure' },
  reporter: [['list'], ['html', { open: 'never' }]]
});
```

## 7.6 Local dev (Docker Compose)

`docker-compose.yml` (excerpt)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [db:/var/lib/postgresql/data]
  redis:
    image: redis:7
    ports: ["6379:6379"]
  api:
    build: ./apps/api
    env_file: .env
    depends_on: [db, redis]
  worker:
    build: ./apps/worker
    env_file: .env
    depends_on: [redis, api]
volumes:
  db: {}
```

## 7.7 CI/CD (GitHub Actions)

`.github/workflows/ci.yml` (core)

```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: pnpm turbo run lint test --parallel
      - run: pnpm turbo run build --filter=...[origin/main]
  e2e:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: pnpm -C apps/api start:preview & pnpm -C apps/web preview &
      - run: pnpm -C apps/e2e test
```

**Quality gates** (fail the PR if any fail):

* Typecheck, Biome lint/format, unit & integration tests, contract verification, Playwright smoke, SAST/dependency audit, accessibility audit (axe on critical pages), bundle size budget.

## 7.8 Render.com deployment

`render.yaml` (simplified)

```yaml
services:
  - type: web
    name: web
    env: static
    buildCommand: pnpm -C apps/web build
    staticPublishPath: apps/web/dist
  - type: web
    name: api
    env: node
    buildCommand: pnpm -C apps/api build
    startCommand: node dist/main.js
    envVars:
      - key: DATABASE_URL
        fromDatabase: { name: pg, property: connectionString }
      - key: REDIS_URL
        fromService: redis:url
  - type: worker
    name: worker
    env: node
    buildCommand: pnpm -C apps/worker build
    startCommand: node dist/main.js
  - type: redis
    name: redis
  - type: postgres
    name: pg
```

## 7.9 Dependency & security automation

`.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        patterns: ["*"]
        update-types: ["minor", "patch"]
```

Add **CodeQL** or SAST job; generate **SBOM** (e.g., `pnpm dlx syft packages .`), sign artifacts.

## 7.10 Coding standards & scripts

**Root package.json** (excerpt)

```json
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "e2e": "turbo run e2e",
    "db:migrate": "pnpm -C apps/api prisma migrate deploy",
    "prepush": "pnpm lint && pnpm test"
  }
}
```

**Conventional commits** recommended; auto‑generate changelog.

## 7.11 Feature workflow (stack‑bound checklists)

### UI slice (web)

* [ ] Route added with loader/action; query keys defined; error boundaries.
* [ ] Component stories (states) + MSW handlers reuse OpenAPI examples.
* [ ] a11y checks (labels, focus, keyboard), perf budget (LCP/INP), i18n keys.

### API slice (api)

* [ ] DTOs + validation; OpenAPI examples; idempotent mutation semantics.
* [ ] AuthZ enforced; rate limit; telemetry; SLO defined.
* [ ] DB migration reviewed (expand/migrate/contract) + rollback.

### Worker slice (worker)

* [ ] Queue contract + retries/backoff; idempotency key; DLQ route.
* [ ] Observability (lag, processed/sec, failures); runbook updated.

### E2E slice (e2e)

* [ ] Critical path scenario; data seeding; accessibility smoke.
* [ ] Screenshots/videos on failure; traces retained.

## 7.12 Claude Code agents & hooks

Create **project‑specific commands** that call node scripts in `packages/scripts`.

**agents.json** (conceptual)

```json
{
  "commands": [
    { "name": "plan:feature", "run": "tsx packages/scripts/feature-plan.ts" },
    { "name": "spec:api", "run": "tsx packages/scripts/openapi-scaffold.ts" },
    { "name": "impl:ui", "run": "tsx packages/scripts/generate-component.ts" },
    { "name": "test:e2e", "run": "pnpm -C apps/e2e test --grep=@smoke" },
    { "name": "deploy:render", "run": "pnpm exec renderctl deploy --from=render.yaml" },
    { "name": "debug:prod", "run": "tsx packages/scripts/fetch-logs.ts --service=api" }
  ],
  "hooks": {
    "onPullRequest": ["plan:feature", "test:e2e"],
    "onContractChange": ["spec:api", "test:e2e"]
  }
}
```

Scripts emit markdown to PR comments (plan, risks, checklists) and fail if gates unmet.

## 7.13 Open questions / decisions to capture (ADRs)

* **TanStack DB vs Prisma**: Use **Prisma** for schema & migrations; TanStack DB as a **query‑builder/read‑model** where it improves ergonomics/performance. Document boundaries.
* **Feature flags**: choose provider; codify rollout playbook (canary → 25% → 100%) and kill‑switch.
* **Contract testing scope**: which consumers publish contracts (web, external partners) & verification cadence.

## 7.14 Getting started checklist

* [ ] Initialize monorepo (pnpm, turbo, biome).
* [ ] Set up Compose (db, redis) and `.env`.
* [ ] Scaffold Nest module + Prisma migration + OpenAPI.
* [ ] Scaffold web route + query + storybook.
* [ ] Wire Playwright smoke against preview.
* [ ] Enable Actions (CI) + Render deploy.
* [ ] Add Dependabot + CodeQL + SBOM.

---

## 7.15 Interactive Manual API Test & Docs System

> Goal: provide **story‑driven, one‑click environments** to exercise any API/webhook/queued endpoint, with **real‑time debug logs** (SSE) and **queue visualization**.

### 7.15.1 Concepts

* **Scenario (story)**: a declarative list of API calls + data seeds that prepares state so a target endpoint can be exercised immediately (e.g., *register → login → create item → DELETE item*).
* **Run**: executing a scenario creates a **correlated request context** (`x-request-id`) so all logs/metrics/traces can be streamed to the UI.
* **Streams**: server‑sent events (SSE) provide real‑time telemetry for request lifecycle, webhooks, and queue jobs.
* **Playground**: a web UI that loads scenarios from the repo and lets users **prepare → invoke → observe**.

### 7.15.2 Scenario DSL (repo‑native)

`/packages/schemas/scenarios/delete-item.yaml`

```yaml
name: Delete Item happy path
id: delete-item-happy
vars:
  email: user+{{timestamp}}@example.com
  password: Test123!@#
  itemName: Sample Widget
steps:
  - name: Register
    request:
      method: POST
      url: /auth/register
      body: { email: "{{email}}", password: "{{password}}" }
      save:
        token: $.token
  - name: Create item
    request:
      method: POST
      url: /items
      headers: { Authorization: "Bearer {{token}}" }
      body: { name: "{{itemName}}" }
      save:
        itemId: $.id
  - name: Delete item (target)
    target: true
    request:
      method: DELETE
      url: /items/{{itemId}}
      headers: { Authorization: "Bearer {{token}}" }
expects:
  status: 204
  sideEffects:
    - queue: audit-log
      job: item.deleted
```

Notes:

* Variables support templating (`{{ }}`) with helpers (e.g., `{{timestamp}}`).
* `save` paths use JSONPath to stash values for later steps.
* `target: true` marks the endpoint under manual test; UI highlights this step and shows request/response details.

### 7.15.3 API to execute scenarios (NestJS)

**Request correlation middleware**

```ts
// apps/api/src/common/middleware/request-id.ts
import { randomUUID } from 'node:crypto';
export function requestId() {
  return (req, res, next) => {
    req.requestId = req.headers['x-request-id'] ?? randomUUID();
    res.setHeader('x-request-id', req.requestId);
    next();
  };
}
```

Register in main: `app.use(requestId());`

**SSE Debug stream**

```ts
// apps/api/src/debug/debug.controller.ts
import { Controller, Sse, MessageEvent, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DebugStreamService } from './debug.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly stream: DebugStreamService) {}

  @Sse('stream/:requestId')
  stream(@Param('requestId') requestId: string): Observable<MessageEvent> {
    return this.stream.subscribe(requestId);
  }
}
```

**Emitting logs to the stream**

```ts
// apps/api/src/debug/debug.service.ts
import { Injectable } from '@nestjs/common';
import { Subject, map } from 'rxjs';

@Injectable()
export class DebugStreamService {
  private subjects = new Map<string, Subject<any>>();
  subscribe(id: string) {
    if (!this.subjects.has(id)) this.subjects.set(id, new Subject());
    return this.subjects.get(id)!.pipe(map(data => ({ data })));
  }
  emit(id: string, event: string, payload: any) {
    this.subjects.get(id)?.next({ event, payload, at: new Date().toISOString() });
  }
}
```

**Logging helper (per request)**

```ts
// apps/api/src/common/log.ts
export const logStep = (req, stream: DebugStreamService, event: string, payload: any = {}) => {
  stream.emit(req.requestId, event, payload);
};
```

Use inside controllers/services: `logStep(req, stream, 'db.query', { model: 'Item', where });`

**Scenario runner endpoint**

```ts
// apps/api/src/scenario/scenario.controller.ts
@Post('scenarios/run')
async run(@Body() { id, vars }: { id: string; vars?: Record<string,string> }, @Req() req) {
  const runId = req.requestId; // expose to client
  logStep(req, this.stream, 'scenario.start', { id, vars });
  const result = await this.runner.execute(id, vars, runId); // performs steps
  logStep(req, this.stream, 'scenario.end', { status: result.status });
  return { runId, result };
}
```

### 7.15.4 Frontend Playground (web)

* **Route**: `/playground/:scenarioId` (TanStack Router).
* **Loader** fetches scenario YAML → renders step list and a **“Prepare & Run”** button.
* On run: POST `/scenarios/run` → get `runId` → open SSE `GET /debug/stream/:runId`.
* **Panels**: Request/Response, **Real‑time Logs** (line‑by‑line), **DB/Cache** effects (summaries), **Events** (webhooks, queue jobs).

**SSE hook**

```ts
// apps/web/src/lib/useSSE.ts
export function useSSE(url: string, onEvent: (e: MessageEvent) => void){
  useEffect(() => { const es = new EventSource(url); es.onmessage = onEvent; return () => es.close(); }, [url]);
}
```

### 7.15.5 Webhooks: test harness + log stream

* Generate a **unique public URL** per run (dev uses `ngrok`/`cloudflared`) → store mapping `{ runId → webhookUrl }`.
* Provide `X-Webhook-Signature` validation; expose **Replay** and **Inspect**.

**Webhook receiver**

```ts
@Post('hooks/test/:runId')
async receive(@Param('runId') runId: string, @Req() req, @Body() body: any) {
  // verify signature if configured
  this.stream.emit(runId, 'webhook.received', { headers: req.headers, body });
  await this.queue.add('processWebhook', body, { jobId: `${runId}:${Date.now()}` });
  return { ok: true };
}
```

UI shows incoming payload, validation status, and links to created jobs.

### 7.15.6 Queues: live visualization (BullMQ)

* **Worker** emits lifecycle events (`waiting → active → completed/failed`) to the same `runId` stream.
* **Queue dashboard panel** shows job id, attempts, progress, timestamps, result/error excerpt.

**Worker instrumentation**

```ts
worker.on('active', (job) => stream.emit(job.data.runId, 'queue.active', pick(job, ['id','name','attemptsMade'])));
worker.on('completed', (job, result) => stream.emit(job.data.runId, 'queue.completed', { id: job.id, result }));
worker.on('failed', (job, err) => stream.emit(job.data.runId, 'queue.failed', { id: job.id, error: err.message }));
```

### 7.15.7 Docs integration

* Each **endpoint page** in API docs links to one or more **Scenarios** that exercise it.
* The Playground auto‑loads **OpenAPI examples** as default request bodies and headers.
* **Copy as cURL/HTTPie** for every step; **“Open in Postman”** link optional.

### 7.15.8 CI hooks

* PR label `manual-playground` triggers a workflow that builds the **Playground preview** and comments a link.
* Smoke runs execute key scenarios headless and assert expected SSE events order.

**GitHub Actions job (excerpt)**

```yaml
jobs:
  playground-preview:
    if: contains(github.event.pull_request.labels.*.name, 'manual-playground')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm i && pnpm -C apps/web build && pnpm -C apps/api build
      - run: pnpm -C apps/e2e test --grep=@playground
```

### 7.15.9 Security, resiliency & ops

* **Stream isolation**: only the creator of a run can attach to its SSE; expire after N minutes.
* **Backpressure**: buffer with drop policy; cap events/sec; redact PII fields by schema.
* **Persistence**: store the last N events per run for replay in case of UI reload.
* **Rate limiting**: scenario runner and webhook receiver are rate‑limited per user/IP.

### 7.15.10 Checklists

**API target endpoint manual test**

* [ ] Scenario exists with *prepare → target* steps and example payloads.
* [ ] SSE logs display controller → service → repo trace with timings.
* [ ] Webhook/queue side‑effects visible; retries and DLQ paths shown.
* [ ] `x-request-id` echoed; logs downloadable as NDJSON.

**Webhook/Queue**

* [ ] Signature verified; replay tool; payload archived.
* [ ] Jobs emit progress; failures include cause & retry policy.
* [ ] Dashboard shows lag, processed/sec, failure rate.

---
