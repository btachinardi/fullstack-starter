# Full-Stack Starter

A batteries-included **monorepo starter** for shipping full-stack features with high quality and repeatability. It implements the **Feature Delivery Playbook** (workflows, checklists, templates) and a stack-specific baseline:

* **Frontend**: React + Vite + Tailwind v4 + TanStack (Query/Router/Store/DevTools) + shadcn/ui
* **Backend**: NestJS + Prisma + PostgreSQL + Redis + BullMQ (queues, webhooks)
* **Tooling**: PNPM Workspaces + Turborepo + Biome + Playwright + Vitest
* **Ops**: GitHub Actions CI, Docker Compose (local), Render.com manifests, Dependabot
* **DX**: Shared packages, domain types, test helpers, and a Playbook with PRD/API/UI/Test templates
* **(Planned)**: Interactive Manual API Playground (scenario stories + SSE logs + queue visualization) and Develop dashboards for AI-assisted workflows

---

## Repository layout

```
apps/
  api/          # NestJS HTTP API (OpenAPI, auth, queues, webhooks)
  web/          # Vite + React app (TanStack Query/Router/Store, shadcn/ui)
  docs/         # Placeholder for documentation site (Docusaurus/Next/MDX)

shared/
  domain/       # Framework-agnostic domain types & logic (imported by api/web)

develop/
  api/          # (Roadmap) Automation/agents dashboard for API workflows
  web/          # (Roadmap) Web dashboard to orchestrate PRDs/features/agents

packages/
  api/          # Shared API utilities (client setup, typing, OpenAPI hooks)
  web/          # Shared UI primitives/utilities (wrapped shadcn components)
  docs/         # Docs components/utilities (MDX helpers, code blocks)
  tests/        # Shared test configs & helpers (Vitest/Playwright/MSW)

playbook/
  README.md                 # Master playbook overview
  definitions/              # DoR/DoD, quality gates, branching, coding standards
  templates/                # PRD, API spec, UI spec, Test Plan, QA, ADR, RFC, etc.
  workflows/                # API/UI/DB/infra/security/a11y/perf/analytics tracks
```

---

## Why this starter

* **Feature-centric**: encourages vertical slices (UI + API + data + tests) with clear DoR/DoD gates.
* **Contracts first**: OpenAPI at the center; reuse examples across Storybook/MSW/Playground.
* **Quality built-in**: linters, types, unit/integration/E2E tests, accessibility & performance budgets.
* **Ops ready**: reproducible local dev via Compose; CI gates; ready-to-adapt Render.yaml.
* **Extensible**: shared packages and domain layer make reuse and refactors safe and fast.

---

## Quick start (high level)

1. **Install toolchain**

   * Node LTS, PNPM, Docker (for local DB/Redis), and a modern Git client.
2. **Bootstrap workspace**

   * Set up PNPM workspaces and Turborepo caching. Ensure each app/package has a build target.
3. **Environment**

   * Create a `.env` with `DATABASE_URL`, `REDIS_URL`, etc. Add `.env.example` for teammates.
4. **Local services**

   * Bring up Postgres + Redis via Docker Compose. Run initial Prisma migrate/seed when ready.
5. **Run apps**

   * Start `apps/api` and `apps/web` concurrently. Confirm the web app reaches the API base URL.
6. **First vertical slice**

   * Add a tiny read-only resource (schema → API endpoint → query hook + page → unit/E2E tests).

> The playbook’s **Getting Started Checklist** lives in `playbook/README.md` → Section “7.14”.

---

## Scripts & conventions (suggested)

* **dev**: start API + Web in watch mode (via Turborepo).
* **build**: compile all packages/apps topologically.
* **test**: run unit/integration tests; **e2e**: Playwright smoke.
* **lint**: Biome format + lint with strict rules.
* **db:migrate**: deploy migrations to the current environment (Prisma).
* **commit style**: Conventional Commits for clean history & automated changelogs.
* **branching**: Trunk-based development with short-lived branches and feature flags.

(Exact commands are intentionally omitted here; wire them per your preferences.)

---

## Quality gates (CI guidance)

On every PR and on `main`, run at minimum:

* **Static**: Typecheck + Biome (format/lint) + dependency audit/SAST
* **Tests**: Unit + Integration; verify API contracts if using Pact/contract tests
* **E2E smoke**: Playwright against a preview build/environment
* **A11y/Perf**: quick checks (axe on critical pages, bundle size & basic perf budgets)

Fail the PR if any gate fails. Keep PRs small and focused.

---

## Playbook highlights

* **Templates**: PRD / API Spec (OpenAPI) / UI Spec / Test Plan / QA / ADR / RFC / Risk / Analytics / A11Y / Security (ASVS) / Performance
* **Workflows**: API, UI, DB/Migrations, Background Jobs & Eventing, Infra & Observability, Security/Privacy, Performance, Accessibility/i18n, Analytics/Experiments
* **Definitions**: DoR, DoD, quality gates, branching & release, coding standards
* **Metrics**: DORA, defect escape, test flakiness, accessibility/performance scores, product KPIs

Start with the PRD + UI Spec + API Spec + Test Plan for each feature. Link them in your PR template.

---

## Interactive Manual API Playground (roadmap)

A built-in **Playground** to manually exercise endpoints **in context**:

* **Scenario stories** prepare state (e.g., *register → login → create → DELETE item*).
* **Real-time debugging** via **SSE** streams keyed by `x-request-id` (DB queries, service calls, webhooks, job lifecycle).
* **Queues & webhooks** visualization with retry/backoff/DLQ insights.

Scenarios live in repo YAML files and link from API docs. This is scaffolded for future iterations.

---

## Developing features (recommended flow)

1. **Kickoff**: create PRD with goals, constraints, success metrics, risks, and acceptance criteria.
2. **Design & spec**:

   * UI Spec (components, states, a11y),
   * API Spec (OpenAPI contracts, examples),
   * Data changes (migrations plan).
3. **Plan**: slice vertically, define test strategy and analytics, identify dependencies.
4. **Build**: implement small slices; maintain contracts; produce Storybook states; keep logs/metrics.
5. **Verify**: unit + integration + E2E; manual QA checklist; a11y/perf checks.
6. **Release**: staged rollout/canary; runbook + rollback plan.
7. **Measure & learn**: DORA + product metrics; retro; update ADRs/templates.

---

## Packages overview

* **shared/domain**: business types & pure logic—framework-agnostic and reusable.
* **packages/api**: HTTP client setup, error handling, serialization, generated clients (optional).
* **packages/web**: UI primitives (wrapped shadcn/ui) with Tailwind tokens and a11y defaults.
* **packages/docs**: MDX components/utilities for docs, code blocks, and API example embedding.
* **packages/tests**: central test presets & helpers (fixtures, MSW, data generators, Playwright config).

---

## Local development (guidelines)

* Keep **.env** values scoped per app; never commit secrets.
* Prefer **repository-local** scripts for repeatability (DB tasks, codegen, contract export).
* Use **MSW** for UI isolation and reuse OpenAPI examples across stories, tests, and playground scenarios.
* Favor **optimistic UI** with TanStack Query; adopt clear cache key factories and standard error patterns.
* Apply **Expand → Migrate → Contract** for DB changes and test rollbacks.

---

## Docs site (apps/docs)

Choose your docs engine (Docusaurus or Next.js + MDX). Link playbook pages, API reference (OpenAPI), and **Scenario** files. Aim for docs that can be previewed per PR and that cross-link to the Playground runs.

---

## Security & privacy (starter posture)

* Map features to an **OWASP ASVS** level and record controls in the Security checklist.
* Centralize secrets, rotate credentials, minimize PII, and document retention & RTBF procedures.
* Generate SBOMs and scan dependencies in CI.
* Keep webhook handlers and queues **idempotent**; verify signatures and guard against replay.

---

## Accessibility & performance

* WCAG 2.2 AA targets on critical flows.
* Keyboard-only navigation, visible focus, robust labeling, and screen reader verifications.
* Baseline performance budgets (LCP/INP/bundle size) per route; monitor regressions in CI where possible.

---

## Contributing

* Use **Conventional Commits** and small, focused PRs.
* Link PRD/API/UI/Test Plan in the PR description.
* Keep **contracts and examples** up-to-date; update Storybook and MSW as part of the slice.
* Add/Update ADRs when architecture changes or trade-offs are made.

---

## License

MIT (or your preferred license). Add your organization name and year.

---

## Roadmap (short)

* Implement the **Scenario Runner + SSE** pipeline and queue/webhook instrumentation.
* Add Storybook with MSW generated from OpenAPI examples.
* Introduce typed OpenAPI client generation in `packages/api`.
* Provision Render.com auto-deploy on `main` with health checks and canary toggles.
* Add lightweight dashboards in `develop/api` and `develop/web` to orchestrate playbook workflows and AI agents.

---

**Start small. Ship vertical. Measure. Learn.**
