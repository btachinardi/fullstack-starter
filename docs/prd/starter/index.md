# fullstack-starter PRD Portfolio

This portfolio captures the product requirements the fullstack-starter repository must satisfy so that new feature teams can begin shipping value immediately. Each PRD articulates a problem statement, success metrics, and scope for a specific capability in the starter kit.

## PRD Summary

| PRD | Scope | Core outcomes |
| --- | ----- | ------------- |
| [PRD-01: Workspace Bootstrapping & Toolchain](prd-01-workspace-bootstrapping-toolchain.md) | Deterministic developer environments and bootstrap automation for the monorepo. | One-command setup, pinned toolchain, Turborepo graph, and security-aware onboarding experience. |
| [PRD-02: Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md) | Reusable packages abstracting third-party dependencies; provides configs, UI components, platform wrappers, and client generators. | Drop-in config presets, Shadcn component library with DataTable, platform abstractions (@starter/*), OpenAPI-driven client generation. |
| [PRD-03: Web Application Shell (apps/web)](prd-03-web-application-shell.md) | Production-ready web app demonstrating integration patterns; consumes only @starter/* packages. | Complete list/detail/settings implementations, Storybook Scenes, application examples, testing harness, and CI-ready builds. |
| [PRD-04: API Application Shell (apps/api)](prd-04-api-application-shell.md) | Production-ready API defining contracts and generating OpenAPI specs; uses only @starter/* packages. | List Endpoint contract definition, OpenAPI spec generation, reference CRUD implementation, background workers, and deployment assets. |
| [PRD-05: Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md) | Automated enforcement of the Feature Delivery Playbook across CI, previews, and release pipelines. | Unified pipelines, preview environments, Changesets releases, and documented quality guardrails. |

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

---

## PRD-02: Shared Configuration & Platform Packages

**Detailed PRD:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md)

### Problem
Without opinionated packages, every app redefines configs, UI primitives, and data clients, slowing teams and creating drift from the playbook.

### Goals & Outcomes
- Drop-in `@starter/config-*` presets (including Vite) for ESLint, Prettier, TypeScript, Jest, Playwright, and Storybook.
- Unified `@starter/ui` with all Shadcn components, tokens, layout shells, and DataTable component (reusable primitive).
- Platform packages encapsulating TanStack Router/Query/Store/DevTools, Simple Auth, NestJS, Prisma, BullMQ, and Redis behind `@starter/*` facades.
- `@starter/data-access` consumes OpenAPI specs from PRD-04 to generate typed clients, Zod validators, and MSW mocks.
- Component-level Storybook stories demonstrating all variants, props, and accessibility features.
- Changesets-based releases; enforced package-only imports in apps via ESLint boundaries.

### Dependencies & Risks
- Depends on PRD-01 for workspace setup; PRD-04 generates OpenAPI specs consumed for client generation.
- Requires design tokens from Design Systems Guild.
- Vendoring Shadcn and maintaining platform abstractions demand ADR-backed processes.

---

## PRD-03: Web Application Shell (apps/web)

**Detailed PRD:** [PRD-03 Web Application Shell](prd-03-web-application-shell.md)

### Problem
Frontend teams spend time wiring routing, layouts, data fetching, and analytics before building domain UI, leading to inconsistent patterns.

### Goals & Outcomes
- Vite + React/TanStack baseline configured via `@starter/vite-config` and `@starter/platform-router`; all third-party deps abstracted.
- Complete reference implementations: list page with DataTable + API integration, detail pages, settings forms demonstrating full CRUD workflows.
- **Storybook Scenes** (application-level): Complete page compositions showing DataTable wiring, form handling, dashboard layouts—serving as copy-paste recipes.
- **Application examples**: `examples/with-vite-web` and additional feature demonstrations using only `@starter/*` packages.
- Testing harness (Vitest, Playwright, Lighthouse budgets) configured and ready for CI; enforced package-only imports via ESLint boundaries.

### Dependencies & Risks
- Depends on PRD-01 for bootstrap, PRD-02 for all packages, PRD-04 for API contracts, PRD-05 for CI/CD.
- Managing TanStack/Vite upgrades requires coordination with PRD-02 platform package updates.

---

## PRD-04: API Application Shell (apps/api)

**Detailed PRD:** [PRD-04 API Application Shell](prd-04-api-application-shell.md)

### Problem
Backend teams rebuild scaffolding for NestJS services, background jobs, and observability, delaying domain delivery and causing divergence.

### Goals & Outcomes
- Opinionated NestJS + worker shell configured via `@starter/platform-*` packages with Fastify, validation, and lifecycle hooks.
- **Defines List Endpoint contract** (offset/limit pagination, sorting, filtering) as authoritative REST API standard.
- **Generates OpenAPI specification** (`dist/openapi.json`) consumed by PRD-02 for typed client generation, ensuring frontend/backend alignment.
- Reference implementation: sample Resource module with complete CRUD, background worker examples, observability hooks, and Simple Auth integration.
- **Application examples**: `examples/nest-resource`, `examples/background-worker` demonstrating patterns using only `@starter/*` packages.
- Docker/Helm deployment assets, contract tests, and enforced package-only imports via ESLint boundaries.

### Dependencies & Risks
- Depends on PRD-01 for bootstrap, PRD-02 for platform packages, PRD-05 for CI/CD.
- **Provides to**: PRD-02 (OpenAPI spec), PRD-03 (API endpoints).
- Prisma migration drift, queue setup complexity, and preview costs require documentation and automation.

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

