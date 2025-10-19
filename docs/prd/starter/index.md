# fullstack-starter PRD Portfolio

This portfolio captures the product requirements the fullstack-starter repository must satisfy so that new feature teams can begin shipping value immediately. Each PRD articulates a problem statement, success metrics, and scope for a specific capability in the starter kit.

## PRD Summary

| PRD | Scope | Core outcomes |
| --- | ----- | ------------- |
| [PRD-05: Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md) | Automated enforcement of the Feature Delivery Playbook across CI, previews, and release pipelines. | Unified pipelines, preview environments, Changesets releases, and documented quality guardrails. |
| [PRD-04: API Application Shell (apps/api)](prd-04-api-application-shell.md) | Encapsulated NestJS/Prisma/BullMQ service shell exported by `@starter` packages. | List contract implementation, background jobs, observability, and deployment assets with package-only imports. |
| [PRD-03: Web Application Shell (apps/web)](prd-03-web-application-shell.md) | Vite + React/TanStack SPA shell that consumes only internal packages for routing, data, auth, and analytics. | DataTable list reference, feature scaffolds, analytics/flag providers, and CI-ready tests with package-only imports. |
| [PRD-02: Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md) | Platform-wide packages that deliver configs, UI components, utilities, and generated data clients. | Drop-in config presets, Shadcn-based UI composites, OpenAPI-driven clients, and Storybook documentation. |
| [PRD-01: Workspace Bootstrapping & Toolchain](prd-01-workspace-bootstrapping-toolchain.md) | Deterministic developer environments and bootstrap automation for the monorepo. | One-command setup, pinned toolchain, Turborepo graph, and security-aware onboarding experience. |

---

## PRD-05: Developer Workflow, Quality, and CI/CD

**Detailed PRD:** [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md)

### Problem
Even with application shells, teams struggle when CI drifts from local scripts, release steps are manual, or quality gates rely on tribal knowledge.

### Goals & Outcomes
- Single CI workflow that runs lint, typecheck, test, build, accessibility, security, and smoke stages via Turborepo filters.
- Automatic previews for `apps/web` and `apps/api` on every PR with teardown automation and documented fallbacks.
- Release orchestration using Changesets and Docker publishing, complete with changelog, SBOM, and notifications.
- Documentation in `/docs/dev-workflow.md` mapping local ↔ CI parity, troubleshooting, and ownership.

### Dependencies & Risks
- Depends on PRD-01 for bootstrap scripts and remote cache, PRD-02 for config packages, and PRD-03/04 for app outputs.
- Preview provider limits, runner differences, and secret management policies require mitigation plans.

---

## PRD-04: API Application Shell (apps/api)

**Detailed PRD:** [PRD-04 API Application Shell](prd-04-api-application-shell.md)

### Problem
Backend teams rebuild scaffolding for NestJS services, background jobs, and observability, delaying domain delivery and causing divergence.

### Goals & Outcomes
- Opinionated NestJS + worker shell delivered via `@starter/platform-*` packages with Fastify, validation, and lifecycle hooks configured automatically.
- Implements the List Endpoint contract from PRD-02 using encapsulated Prisma queries and shared error taxonomy.
- Provides BullMQ worker example, Docker/Helm assets, observability hooks (logging, metrics, tracing), and Simple Auth guards.
- Ensures tests, contract validation, preview deploy readiness, and enforces package-only imports within `apps/api`.

### Dependencies & Risks
- Depends on PRD-01 for bootstrap, PRD-02 for shared utilities and clients, PRD-05 for CI/previews.
- Prisma migration drift, queue setup complexity, and preview costs require documentation and automation.

---

## PRD-03: Web Application Shell (apps/web)

**Detailed PRD:** [PRD-03 Web Application Shell](prd-03-web-application-shell.md)

### Problem
Frontend teams spend time wiring routing, layouts, data fetching, and analytics before building domain UI, leading to inconsistent patterns.

### Goals & Outcomes
- Vite + React/TanStack baseline composed through `@starter/vite-config`, `@starter/platform-router`, and related packages.
- Integration with `@starter/ui`, `@starter/platform-query`, `@starter/auth`, analytics, and feature flag providers out of the box.
- Sample list, detail, and settings flows using DataTable and shared utilities, plus Storybook Scenes.
- Testing harness (Vitest, Playwright, Lighthouse budgets) ready for CI integration and enforced package-only imports.

### Dependencies & Risks
- Requires packages from PRD-02, bootstrap from PRD-01, and CI integration from PRD-05.
- Managing TanStack/Vite upgrades, auth provider alignment, and DataTable performance needs defined mitigation.

---

## PRD-02: Shared Configuration & Platform Packages

**Detailed PRD:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md)

### Problem
Without opinionated packages, every app redefines configs, UI primitives, and data clients, slowing teams and creating drift from the playbook.

### Goals & Outcomes
- Drop-in `@starter/config-*` presets (including Vite) for ESLint, Prettier, TypeScript, Jest, Playwright, and Storybook.
- Unified `@starter/ui` with Shadcn components, tokens, layout shells, and DataTable composite wired for List Endpoint contract.
- Platform packages encapsulating TanStack Router/Query/Store/DevTools, Simple Auth, NestJS, Prisma, BullMQ, and Redis behind `@starter/*` facades, plus generated data clients and MSW mocks.
- Storybook scenes, documentation, and examples demonstrating the end-to-end List Endpoint ↔ DataTable pattern with Changesets releases and enforced package-only imports in apps.

### Dependencies & Risks
- Requires design tokens from Design Systems Guild and OpenAPI specs from backend teams.
- Vendoring Shadcn, enforcing opinionated filters, and maintaining contracts demand ADR-backed processes.

---

## PRD-01: Workspace Bootstrapping & Toolchain

**Detailed PRD:** [PRD-01 Workspace Bootstrapping & Toolchain](prd-01-workspace-bootstrapping-toolchain.md)

### Problem
Onboarding takes days due to inconsistent Node/pnpm versions, manual environment setup, and mismatched local vs CI scripts.

### Goals & Outcomes
- One-command bootstrap via `pnpm setup` with Dev Container defaults and WSL2 policy for Windows.
- Pinned toolchain, Turborepo dependency graph, and Corepack-managed pnpm adoption.
- Environment templates, Zod validation, and Husky hooks enforcing formatting, linting, and security scans.
- Documentation (`/docs/getting-started.md`, `/docs/env.md`) and telemetry for self-service troubleshooting.

### Dependencies & Risks
- Provides foundation for PRD-02 through PRD-05; remote cache credentials, hook performance, and telemetry policies monitored continuously.

