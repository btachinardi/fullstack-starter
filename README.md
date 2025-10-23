# Full-Stack Starter

A batteries-included **modular monorepo** for shipping full-stack TypeScript applications with high quality standards and streamlined developer experience:

* **Frontend**: Next.js 16 + React 19 + Tailwind v4 + shadcn/ui components
* **Backend**: NestJS 11 + Prisma 6 + Better Auth + Health checks
* **Tooling**: PNPM Workspaces + Turborepo + Biome + TypeScript 5.9 (strict mode)
* **Architecture**: Consolidated core packages (4 total) + modular feature modules
* **DX**: Zero-config bootstrap, shared error classes, type-safe workspace dependencies
* **(Planned)**: Feature modules (auth, notifications, payments), TanStack wrappers, API playground

---

## Repository layout

```
fullstack-starter/
├── apps/                   (@apps/*) - Deployable applications
│   ├── api/               → @apps/api (NestJS 11 + Prisma + Better Auth)
│   └── web/               → @apps/web (Next.js 16 + React 19)
├── dev/                    (@dev/*) - Development tools
│   └── cli/               → @dev/cli (future - CLI tools migration)
├── configs/                (@configs/*) - Shared configurations
│   ├── typescript/        → @configs/typescript
│   └── jest/              → @configs/jest
├── libs/
│   └── core/              (@libs/core/*) - 4 consolidated core packages
│       ├── api/           → @libs/core/api (All backend utilities)
│       ├── web/           → @libs/core/web (All frontend utilities)
│       ├── ui/            → @libs/core/ui (Components + cn utility)
│       └── utils/         → @libs/core/utils (Pure TS + shared errors)
└── cli/                    (Legacy - to be migrated to dev/)
    └── tools/             → @cli/tools (Session management, log analysis)
```

**Future feature modules** (follow `libs/<feature>/{api,web}` pattern):
```
libs/
├── auth/                   (@libs/auth/*)
│   ├── api/               → @libs/auth/api (JWT, guards, strategies)
│   └── web/               → @libs/auth/web (Login, register, protected routes)
├── notifications/          (@libs/notifications/*)
│   ├── api/               → @libs/notifications/api
│   └── web/               → @libs/notifications/web
└── payments/               (@libs/payments/*)
    ├── api/               → @libs/payments/api
    └── web/               → @libs/payments/web
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

## Core Packages Overview

The monorepo uses **4 consolidated core packages** organized by concern:

* **@libs/core/api**: All backend utilities (NestJS, Prisma, auth, health checks, bootstrap)
* **@libs/core/web**: All frontend utilities (Next.js/React hooks, browser utilities)
* **@libs/core/ui**: Component library (shadcn/ui) + UI utilities (`cn()` for Tailwind)
* **@libs/core/utils**: Pure TypeScript utilities + shared error classes (NetworkError, etc.)

**Key architectural decisions:**
* Shared errors in `@libs/core/utils` - used by BOTH frontend and backend
* `cn()` utility in `@libs/core/ui` - UI-specific, not in generic utils
* Zero dependencies in `@libs/core/utils` - pure TypeScript only
* Context API for frontend DI - no Angular-style DI containers

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
