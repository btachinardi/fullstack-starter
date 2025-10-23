# PRD-03: Web Application Shell (apps/web)

## Document control

- **Status:** Draft (for sign-off)
- **Last updated:** 2025-10-19
- **Owners:** Platform Engineering Guild
- **Stakeholders:** Feature Enablement, Developer Experience, Design Systems Guild, Analytics, QA Automation
- **Related artifacts:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md), [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md), [Feature Delivery Playbook](../../playbook/README.md)

---

## 1. Background & problem statement

Frontend teams currently spend days wiring routing, layouts, data fetching, and analytics plumbing before writing domain UI. The starter must provide a production-grade **Vite + React** shell powered by TanStack libraries and the shared `@starter/*` packages so new features start with opinionated foundations aligned to PRD-02 and ready for CI/CD automation from PRD-05.

We will ship a SPA-first shell that consumes **only** internal packages (`@starter/ui`, `@starter/platform-router`, `@starter/platform-query`, `@starter/auth`, `@starter/utils`, `@starter/data-access`, etc.). Third-party libraries such as TanStack Query/Router and Simple Auth are fully encapsulated in those packages—no direct imports from `apps/web` are allowed. Apps should feel "empty but ready": teams add domain-specific code while inheriting routing, state, auth, analytics, and testing conventions out of the box.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Vite + TanStack baseline** — `apps/web` bootstraps with Vite, React 18, and TanStack Router using `@starter/vite-config` and `@starter/platform-router`; build tooling and aliases are preconfigured.
2. **UI integration** — Consume `@starter/ui` tokens, themes, layout shells, and DataTable component; demonstrate wiring in sample pages with complete state management and API integration.
3. **Data-access wiring** — Demonstrate `@starter/platform-query` + `@starter/data-access` for fetching, caching, error handling; include MSW mocks for deterministic testing.
4. **Authentication & authorization scaffold** — Wire `@starter/auth/web` (Simple Auth wrapper) into route tree with sample login/logout flows, guards, and role-based access demonstrations.
5. **Telemetry, analytics, and feature flags** — Integrate shared wrappers from `@starter/utils` with analytics events, feature flag checks, and logging patterns demonstrated in sample features.
6. **Testing & quality** — Unit (Vitest + Testing Library), integration (Playwright), and Lighthouse budgets configured via shared packages and automated in PRD-05.
7. **Storybook Scenes** — Application-level page compositions (list pages, forms, dashboards) demonstrating real-world integration patterns as copy-paste recipes.
8. **Application examples** — Reference implementations in `examples/with-vite-web` showing complete feature workflows using only `@starter/*` packages.
9. **DX guardrails** — Code generators, lint boundaries, and documentation ensure all feature code references internal packages only and matches the playbook terminology.

### 2.2 Non-goals

- Implementing SSR/SSG frameworks (e.g., Next.js, Remix); SPA-first with progressive enhancement is sufficient for v1.
- Delivering domain-specific business logic beyond sample templates (list/detail/settings reference implementations only).
- Shipping alternative router/state/data libraries beyond the TanStack suite selected in PRD-02.
- Creating UI components or platform packages (PRD-02 responsibility).
- Defining API contracts or backend implementations (PRD-04 responsibility).

---

## 3. Personas & user stories

| Role               | Scenario                        | Success criteria                                                                                                                                  |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend engineer  | Builds first list page.         | Follows Storybook Scene example + docs to ship list page in ≤ 30 minutes using only `@starter/*` imports.                                         |
| Fullstack engineer | Integrates API data.            | Consumes generated client from '@starter/data-access`; wires to DataTable following reference implementation'; passes CI without custom plumbing. |
| Designer           | Reviews UI integration.         | Storybook Scenes show real page compositions; tokens applied consistently; a11y checks pass.                                                      |
| QA automation      | Writes e2e test.                | Playwright suite references shared config; runs against preview; uses MSW mocks from `@starter/data-access` for deterministic runs.               |
| Analytics lead     | Verifies event instrumentation. | Sample features show analytics integration; events captured in preview with documented naming pattern.                                            |

---

## 4. Functional requirements

### 4.1 Project setup

- Tooling: Vite 5+, React 18, TypeScript strict mode, pnpm, ESLint config from `@starter/config-eslint`, TS config from `@starter/config-ts`, Vite setup from `@starter/vite-config`.
- Directory structure: `src/routes/` (TanStack route modules), `src/features/` (domain bundles), `src/components/` (local wrappers), `src/providers/`, `src/test/`.
- Entry point imports `createApp` helper from `@starter/platform-router` which wires router, query client, Simple Auth provider, analytics, and feature flags.
- Tailwind preset, fonts, and metadata originate from '@starter/ui/tailwind-preset`and`@starter/ui/tokens`'; no local Tailwind config overrides.
- Environment typing via `@starter/config-env`; `.env.example` includes API URL, analytics keys, feature flag tokens, and telemetry opt-in flag.

### 4.2 Routing & layouts

- Route definitions live in `src/routes` and are registered through `@starter/platform-router`'s file-system aware loader; CLI `pnpm web:route <segment>` scaffolds new routes with tests and Storybook stories.
- Provide base routes: `/` (dashboard placeholder), `/resources` (list reference), `/resources/:id` (detail stub), `/settings` (form template), `/health` (status JSON for monitoring).
- Layout shells (`DashboardLayout`, `SettingsLayout`, etc.) come from '@starter/ui/layouts`'; route modules compose them declaratively.
- Guards from '@starter/auth/web` enforce session/role checks'; feature flag guard ensures flagged routes automatically redirect when disabled.
- 404/500/loading boundaries implemented via shared components exported from `@starter/ui` (`<ErrorBoundary>`, `<LoadingState>`), not custom React error boundaries per route.

### 4.3 Data fetching & state

- `AppProviders` from `@starter/platform-query` wraps the route tree with TanStack Query client, suspense boundaries, and cache hydration.
- Example `resources` route uses `@starter/data-access` list query + DataTable composite with filters/sorting tied to URL state via `@starter/platform-router` helpers.
- Local UI state leverages `@starter/platform-store` for persisted preferences (e.g., theme, table density).
- Expose ready-made hooks: `useResourceFilters`, `useCurrentUser`, `useFeatureFlags`, `useAnalytics` (all delivered by internal packages).

### 4.4 UI & UX standards

- Global theming via tokens; dark/light mode toggle stored via `@starter/platform-store` hook; respects OS preference on first load.
- Accessibility: include skip links, focus management, aria landmarks using `@starter/ui` primitives; run Storybook axe checks automatically.
- Include example forms using `@starter/ui` form controls + Zod schema helpers from '@starter/utils`'; validation errors follow design tokens.
- Responsiveness: default breakpoints defined in `@starter/ui/tokens`; grid/layout examples demonstrate desktop/tablet/mobile patterns.

### 4.5 Authentication & authorization

- `@starter/auth/web` wraps Simple Auth SDK providing `<AuthProvider>`, `useSession`, and route guards; sample login/logout flows included with mock credentials.
- Session persistence uses Secure LS or IndexedDB via the auth package; tokens refreshed through shared background jobs when connected to API preview.
- Authorization helper `withPermission` available for component-level gating; sample admin banner demonstrates usage.

### 4.6 Analytics, feature flags, and logging

- Analytics provider from '@starter/utils/analytics` initialises Segment-compatible events with local console sink fallback'; instrumentation helpers (`trackPageView`, `trackInteraction`) included.
- Feature flag provider from `@starter/utils/flags` (wrapping LaunchDarkly-compatible interface) loads defaults from `.env.example` and exposes typed hooks.
- Client-side logging routes events to shared logger (`@starter/utils/logging`) aligned with backend taxonomy; logs include correlation IDs from `@starter/platform-router`.

### 4.7 Testing & quality

- Vitest + Testing Library configured via `@starter/jest-config` (web preset) with path aliases; sample tests illustrate provider-aware rendering helper.
- Playwright e2e tests for login, list page interactions, settings form submission using MSW mocks from `@starter/data-access/testing`.
- Lighthouse CI budgets for performance/accessibility/best practices (≥ 90 scores) executed in PRD-05 pipeline against preview builds.

### 4.8 Storybook Scenes (application-level demonstrations)

- **Purpose:** Demonstrate complete page compositions using `@starter/*` packages; serve as copy-paste recipes and integration documentation.
- **Scenes catalog:**
  - **List page with filters:** DataTable wired to `@starter/data-access` query, URL-synced filters via `@starter/platform-router`, loading/empty/error states.
  - **Detail page:** Layout from `@starter/ui`, data fetching with suspense, optimistic updates, error boundaries.
  - **Settings form:** Form components from `@starter/ui`, validation with Zod, submission with mutation hooks, success/error feedback.
  - **Dashboard composition:** Multiple widgets, chart integration (if applicable), responsive grid layout.
  - **Bulk actions workflow:** Selection state, batch operations, progress indication, rollback on errors.
- **Scene structure:** Each Scene includes working code, data mocking via MSW, accessibility validation, responsive behavior demonstration.
- **Documentation:** Inline annotations explaining integration points, common patterns, extension recipes.

### 4.9 Application examples

- **Primary example:** `examples/with-vite-web` — Complete list page implementation showing:
  - DataTable component from `@starter/ui`
  - API integration via `@starter/data-access`
  - URL state management via `@starter/platform-router`
  - Authentication guards from `@starter/auth/web`
  - Analytics tracking with `@starter/utils`
  - MSW mocks for testing
  - Playwright e2e tests
  - Lighthouse budget compliance
- **Additional examples:**
  - `examples/settings-page` — Form handling, validation, optimistic updates
  - `examples/dashboard` — Multi-widget composition, real-time updates
  - `examples/wizard-flow` — Multi-step form with state persistence
- **Example structure:** Each example is a standalone mini-app demonstrating specific patterns; fully working, tested, and documented.

### 4.10 Developer experience

- CLI script `pnpm web:scaffold` generates feature skeletons (route, component, Storybook story, test) and ensures imports rely solely on `@starter/*`.
- ESLint boundaries rule (configured via `@starter/config-eslint`) blocks direct imports from `react`, `@tanstack/*`, or `simple-auth` within `apps/web`.
- `/docs/web-shell.md` documents architecture, available hooks/components, analytics/flag conventions, extension recipes, and references to Storybook Scenes and examples.
- Quick-start guide: "Build Your First List Page" walks through using Storybook Scene as template, customizing for domain needs, running tests, deploying to preview.

---

## 5. Technical approach

1. **Package-only imports** — All application code imports exclusively from '@starter/\*` packages; ESLint boundaries enforce this rule'; enables substrate swaps without touching app code.
2. **Router-driven architecture** — TanStack Router orchestrates layout/data/loader lifecycles via `@starter/platform-router`; route modules remain declarative and generator-friendly.
3. **Reference implementation strategy** — `apps/web` is the canonical example; Storybook Scenes extract reusable patterns; `examples/*` provide focused demonstrations.
4. **Mock-friendly design** — API clients, analytics, and auth providers accept dependency injection for tests; MSW handlers sourced from `@starter/data-access` ensure parity with backend contracts.
5. **Performance awareness** — Bundle analysis via Vite plugin from '@starter/vite-config`; Lighthouse budgets enforced in CI'; Storybook Scenes demonstrate optimization patterns.
6. **Documentation as code** — Storybook Scenes serve as living documentation; examples are runnable, tested applications; `/docs/web-shell.md` ties everything together.

---

## 6. Metrics & success criteria

- **Time to first feature:** ≤ 30 minutes to build list page hitting API preview by following Storybook Scene example.
- **Bundle budgets:** Main JS bundle ≤ 160 KB gzip; DataTable page additional ≤ 45 KB (excluding shared libs). Exceptions require ADR.
- **Coverage:** ≥ 85% statements/branches for application code and route handlers.
- **Accessibility:** Axe and Lighthouse accessibility scores ≥ 90 for all baseline pages and Storybook Scenes.
- **Adoption:** 100% new web features built using patterns from 'torybook Scenes and examples'; zero direct third-party imports.
- **Documentation quality:** Developers can build features without asking questions; Storybook Scenes + examples + docs cover 90% of use cases.

---

## 7. Risks & mitigations

| Risk                            | Impact                              | Mitigation                                                                      |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| TanStack API changes            | Breaks wrappers and route scaffolds | Pin versions in `@starter` packages; contract tests; document upgrade playbook. |
| Auth provider divergence        | Teams re-implement auth scaffolding | Maintain Simple Auth adapters centrally; provide extension guide via ADR.       |
| Bundle creep due to composites  | Slower pages, budget violations     | Track via Vite analyzer; enforce budgets; document lazy-loading patterns.       |
| Analytics/flags vendor changes  | Drift between environments          | Wrappers vendor-agnostic; configuration via env + documentation.                |
| Testing flakiness in Playwright | Slows PR velocity                   | Stabilize selectors, use MSW mocks, run retries with trace artifacts.           |

---

## 8. Rollout plan

1. **Phase 1 — Foundation**

   - Initialize Vite project with shared configs from 'RD-02; router bootstrap via `@starter/platform-router`'; providers, theming, authentication stub.
   - Integrate `@starter/ui` tokens and components; ensure ESLint boundaries enforce package-only imports.

2. **Phase 2 — Reference implementation**

   - Build sample list page wiring DataTable to API List Endpoint via `@starter/data-access`.
   - Implement detail page, settings form demonstrating full CRUD workflows.
   - Add analytics + feature flag integration; logging patterns.

3. **Phase 3 — Storybook Scenes & examples**

   - Create Storybook Scenes for list, detail, settings, dashboard compositions.
   - Build `examples/with-vite-web` standalone example with full implementation.
   - Document patterns in `/docs/web-shell.md` with references to Scenes/examples.

4. **Phase 4 — Quality & testing**

   - Configure Vitest, Playwright, Lighthouse budgets.
   - Ensure CI integration via PRD-05 workflows; add MSW mocks and deterministic tests.

5. **Phase 5 — DX polish**
   - Add scaffolding CLI generating features from templates.
   - Create quick-start guide linking Scenes → examples → docs.
   - Collect telemetry/feedback during beta; iterate on patterns and documentation.

---

## 9. Acceptance tests (definition of done)

1. `pnpm dev:web` starts application with mocked auth; navigating to `/resources` shows DataTable with sample data from MSW and URL-synced filters.
2. Storybook Scenes render successfully with all states (loading, data, empty, error); a11y checks pass; interactive controls work.
3. `examples/with-vite-web` runs independently via `pnpm example:web`; demonstrates complete list page pattern; all tests pass.
4. Replacing OpenAPI spec and running `pnpm web:generate` regenerates clients; routes using new endpoints compile without manual edits.
5. ESLint boundaries fail when a developer imports `@tanstack/react-query` or `simple-auth` directly from `apps/web`.
6. Playwright smoke tests (login + list interactions + form submission) pass locally and in CI using MSW handlers from `@starter/data-access`.
7. Lighthouse CI report for preview build meets ≥90 scores for all pages; failing budgets block merge with actionable docs link.
8. Feature scaffolding CLI generates route + test with zero TODOs and only `@starter/*` imports; generated code matches Storybook Scene patterns.
9. Documentation in `/docs/web-shell.md` references Scenes, examples, and patterns; "Build Your First List Page" guide completable in ≤30 minutes.

---

## 10. Dependencies & out of scope

- Depends on PRD-01 for workspace bootstrap, Dev Container, environment validation, and remote cache configuration.
- Depends on PRD-02 for all `@starter/*` packages (UI, platform wrappers, config, data-access).
- Depends on PRD-04 for API endpoints implementing contracts; consumes OpenAPI specs via PRD-02's `@starter/data-access`.
- Depends on PRD-05 for CI/CD pipelines, preview deployments, and quality automation.
- Out of scope:
  - Native mobile shells, alternative build pipelines, or server-driven UI experiments.
  - Creating UI components or platform packages (PRD-02 responsibility).
  - Defining API contracts or backend logic (PRD-04 responsibility).

---

## 11. Appendix

### 11.1 Storybook Scene index

- **List page:** `/stories/pages/ListPage` — DataTable + filters + API integration + URL state
- **Detail page:** `/stories/pages/DetailPage` — Data fetching + suspense + error boundaries
- **Settings form:** `/stories/pages/SettingsForm` — Form validation + submission + feedback
- **Dashboard:** `/stories/pages/Dashboard` — Multi-widget layout + responsive design
- **Bulk actions:** `/stories/patterns/BulkActions` — Selection + batch operations + progress

### 11.2 Example applications

- `examples/with-vite-web` — Complete list page with full CRUD
- `examples/settings-page` — Form handling patterns
- `examples/dashboard` — Widget composition
- `examples/wizard-flow` — Multi-step workflows

### 11.3 Playbook alignment

- **Definition of Ready:** Route scaffolds available, auth & analytics configured, Storybook Scenes and examples documented, API contracts defined by PRD-04.
- **Definition of Done:** Feature implemented following Scene patterns, tests passing, Lighthouse budgets met, analytics events validated, only `@starter/*` imports used.

### 11.4 Future enhancements

- Optional SSR bridge (TanStack Start integration)
- Micro-frontend compatibility evaluation
- Advanced caching strategies with service workers
- Progressive web app (PWA) capabilities
