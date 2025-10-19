# PRD-03: Web Application Shell (apps/web)

## Document control

* **Status:** Draft (for sign-off)
* **Last updated:** 2025-10-19
* **Owners:** Platform Engineering Guild
* **Stakeholders:** Feature Enablement, Developer Experience, Design Systems Guild, Analytics, QA Automation
* **Related artifacts:** [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md), [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md), [Feature Delivery Playbook](../../playbook/README.md)

---

## 1. Background & problem statement

Frontend teams currently spend days wiring routing, layouts, data fetching, and analytics plumbing before writing domain UI. The starter must provide a production-grade **Vite + React** shell powered by TanStack libraries and the shared `@starter/*` packages so new features start with opinionated foundations aligned to PRD-02 and ready for CI/CD automation from PRD-05.

We will ship a SPA-first shell that consumes **only** internal packages (`@starter/ui`, `@starter/platform-router`, `@starter/platform-query`, `@starter/auth`, `@starter/utils`, `@starter/data-access`, etc.). Third-party libraries such as TanStack Query/Router and Simple Auth are fully encapsulated in those packages—no direct imports from `apps/web` are allowed. Apps should feel "empty but ready": teams add domain-specific code while inheriting routing, state, auth, analytics, and testing conventions out of the box.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Vite + TanStack baseline** — `apps/web` bootstraps with Vite, React 18, and TanStack Router using `@starter/vite-config` and `@starter/platform-router`; build tooling and aliases are preconfigured.
2. **UI integration** — `@starter/ui` tokens, themes, layout shells, and DataTable composite wired in sample pages, including Tailwind preset integration and CSS variable theming.
3. **Data-access wiring** — `@starter/platform-query` + `@starter/data-access` provide fetching, caching, and MSW mocks with SSR-friendly hydration primitives for future expansion.
4. **Authentication & authorization scaffold** — `@starter/auth/web` (Simple Auth wrapper) exposes providers, guards, and sample flows wired into the route tree and navigation.
5. **Telemetry, analytics, and feature flags** — Shared wrappers from `@starter/utils` initialize analytics sinks, feature flag adapters, and logging for web interactions with sensible defaults.
6. **Testing & quality** — Unit (Vitest + Testing Library), integration (Playwright), Storybook Scenes, and Lighthouse budgets configured via shared packages and automated in PRD-05.
7. **DX guardrails** — Code generators, lint boundaries, and documentation ensure all feature code references internal packages only and matches the playbook terminology.

### 2.2 Non-goals

* Implementing SSR/SSG frameworks (e.g., Next.js, Remix); SPA-first with progressive enhancement is sufficient for v1.
* Delivering domain-specific pages beyond samples (list/detail/settings templates only).
* Shipping alternative router/state/data libraries beyond the TanStack suite selected in PRD-02.

---

## 3. Personas & user stories

| Role               | Scenario                                              | Success criteria                                                                                   |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Frontend engineer  | Builds first list page.                               | Uses starter layout + DataTable + data-access query to ship list page in ≤ 30 minutes.             |
| Fullstack engineer | Integrates API data.                                  | Consumes generated client hitting API preview via `@starter/data-access`; passes CI without custom plumbing. |
| Designer           | Reviews UI tokens and components.                     | Storybook Scenes show real data states; tokens align to design system; a11y checks pass.           |
| QA automation      | Writes e2e test.                                      | Playwright suite references shared config; runs against preview; uses MSW mocks for deterministic runs. |
| Analytics lead     | Verifies event instrumentation.                       | Analytics wrapper initialized with mock sink; events captured in preview with documented naming.   |

---

## 4. Functional requirements

### 4.1 Project setup

* Tooling: Vite 5+, React 18, TypeScript strict mode, pnpm, ESLint config from `@starter/config-eslint`, TS config from `@starter/config-ts`, Vite setup from `@starter/vite-config`.
* Directory structure: `src/routes/` (TanStack route modules), `src/features/` (domain bundles), `src/components/` (local wrappers), `src/providers/`, `src/test/`.
* Entry point imports `createApp` helper from `@starter/platform-router` which wires router, query client, Simple Auth provider, analytics, and feature flags.
* Tailwind preset, fonts, and metadata originate from `@starter/ui/tailwind-preset` and `@starter/ui/tokens`; no local Tailwind config overrides.
* Environment typing via `@starter/config-env`; `.env.example` includes API URL, analytics keys, feature flag tokens, and telemetry opt-in flag.

### 4.2 Routing & layouts

* Route definitions live in `src/routes` and are registered through `@starter/platform-router`'s file-system aware loader; CLI `pnpm web:route <segment>` scaffolds new routes with tests and Storybook stories.
* Provide base routes: `/` (dashboard placeholder), `/resources` (list reference), `/resources/:id` (detail stub), `/settings` (form template), `/health` (status JSON for monitoring).
* Layout shells (`DashboardLayout`, `SettingsLayout`, etc.) come from `@starter/ui/layouts`; route modules compose them declaratively.
* Guards from `@starter/auth/web` enforce session/role checks; feature flag guard ensures flagged routes automatically redirect when disabled.
* 404/500/loading boundaries implemented via shared components exported from `@starter/ui` (`<ErrorBoundary>`, `<LoadingState>`), not custom React error boundaries per route.

### 4.3 Data fetching & state

* `AppProviders` from `@starter/platform-query` wraps the route tree with TanStack Query client, suspense boundaries, and cache hydration.
* Example `resources` route uses `@starter/data-access` list query + DataTable composite with filters/sorting tied to URL state via `@starter/platform-router` helpers.
* Local UI state leverages `@starter/platform-store` for persisted preferences (e.g., theme, table density).
* Expose ready-made hooks: `useResourceFilters`, `useCurrentUser`, `useFeatureFlags`, `useAnalytics` (all delivered by internal packages).

### 4.4 UI & UX standards

* Global theming via tokens; dark/light mode toggle stored via `@starter/platform-store` hook; respects OS preference on first load.
* Accessibility: include skip links, focus management, aria landmarks using `@starter/ui` primitives; run Storybook axe checks automatically.
* Include example forms using `@starter/ui` form controls + Zod schema helpers from `@starter/utils`; validation errors follow design tokens.
* Responsiveness: default breakpoints defined in `@starter/ui/tokens`; grid/layout examples demonstrate desktop/tablet/mobile patterns.

### 4.5 Authentication & authorization

* `@starter/auth/web` wraps Simple Auth SDK providing `<AuthProvider>`, `useSession`, and route guards; sample login/logout flows included with mock credentials.
* Session persistence uses Secure LS or IndexedDB via the auth package; tokens refreshed through shared background jobs when connected to API preview.
* Authorization helper `withPermission` available for component-level gating; sample admin banner demonstrates usage.

### 4.6 Analytics, feature flags, and logging

* Analytics provider from `@starter/utils/analytics` initialises Segment-compatible events with local console sink fallback; instrumentation helpers (`trackPageView`, `trackInteraction`) included.
* Feature flag provider from `@starter/utils/flags` (wrapping LaunchDarkly-compatible interface) loads defaults from `.env.example` and exposes typed hooks.
* Client-side logging routes events to shared logger (`@starter/utils/logging`) aligned with backend taxonomy; logs include correlation IDs from `@starter/platform-router`.

### 4.7 Testing & quality

* Vitest + Testing Library configured via `@starter/jest-config` (web preset) with path aliases; sample tests illustrate provider-aware rendering helper.
* Playwright e2e tests for login, list page interactions, settings form submission using MSW mocks from `@starter/data-access/testing`.
* Storybook Scenes (list page, empty/error states, settings form) assembled with `@starter/storybook-config`; CI enforces axe and visual regression budgets.
* Lighthouse CI budgets for performance/accessibility/best practices (≥ 90 scores) executed in PRD-05 pipeline against preview builds.

### 4.8 Developer experience

* CLI script `pnpm web:scaffold` generates feature skeletons (route, component, Storybook story, test) and ensures imports rely solely on `@starter/*`.
* ESLint boundaries rule (configured via `@starter/config-eslint`) blocks direct imports from `react`, `@tanstack/*`, or `simple-auth` within `apps/web`.
* `/docs/web-shell.md` documents architecture, available hooks/components, analytics/flag conventions, and extension recipes referencing playbook definitions.
* Optional integration examples (e.g., `<ModalWorkflow>`, `<Wizard>`) live under `examples/with-web-feature` to demonstrate best practices without bloating the app shell.

---

## 5. Technical approach

1. **Single import surface** — All third-party dependencies are wrapped in `@starter/*` packages; tree-shaking is preserved through ESM exports and typed facades.
2. **Router-driven architecture** — TanStack Router orchestrates layout/data/loader lifecycles; route modules remain declarative and generator-friendly.
3. **State hydration ready** — While SPA is default, providers expose hydration hooks to support future SSR/edge rendering experiments without breaking contracts.
4. **Mock-friendly design** — API clients, analytics, and auth providers accept dependency injection for tests; MSW handlers sourced from `@starter/data-access` ensure parity with backend contracts.
5. **Performance awareness** — Analyze bundle composition via Vite plugin (shipped in `@starter/vite-config`); budgets enforced in CI with failing thresholds generating actionable reports.

---

## 6. Metrics & success criteria

* **Time to first feature:** ≤ 30 minutes to build list page hitting API preview.
* **Bundle budgets:** Main JS bundle ≤ 160 KB gzip; DataTable page additional ≤ 45 KB (excluding shared libs). Exceptions require ADR.
* **Coverage:** ≥ 85% statements/branches for shared components and route handlers.
* **Accessibility:** Axe and Lighthouse accessibility scores ≥ 90 for baseline pages.
* **Adoption:** 100% new web apps extend this shell without customizing config packages or importing third-party libs directly.

---

## 7. Risks & mitigations

| Risk                                   | Impact                                   | Mitigation                                                                 |
| -------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| TanStack API changes                   | Breaks wrappers and route scaffolds      | Pin versions in `@starter` packages; contract tests; document upgrade playbook. |
| Auth provider divergence               | Teams re-implement auth scaffolding      | Maintain Simple Auth adapters centrally; provide extension guide via ADR. |
| Bundle creep due to composites         | Slower pages, budget violations          | Track via Vite analyzer; enforce budgets; document lazy-loading patterns. |
| Analytics/flags vendor changes         | Drift between environments               | Wrappers vendor-agnostic; configuration via env + documentation.         |
| Testing flakiness in Playwright        | Slows PR velocity                         | Stabilize selectors, use MSW mocks, run retries with trace artifacts.    |

---

## 8. Rollout plan

1. **Phase 1 — Foundation**
   * Initialize Vite project with shared configs, router bootstrap, providers, theming, and authentication stub.
   * Integrate shared UI tokens and base components; ensure ESLint boundaries enforce package-only imports.

2. **Phase 2 — Data & analytics**
   * Wire TanStack Query, data-access clients, DataTable list page, analytics + feature flag providers, and logging hooks.
   * Add MSW mocks, sample events, and documentation updates.

3. **Phase 3 — Quality & testing**
   * Configure Vitest, Playwright, Storybook Scenes, Lighthouse budgets.
   * Ensure CI integration via PRD-05 workflows and telemetry instrumentation hooks.

4. **Phase 4 — DX enhancements**
   * Add scaffolding CLI, extension docs, and optional integrations (wizard templates, modal flows).
   * Collect telemetry/feedback during beta squads; iterate on performance budgets and docs.

---

## 9. Acceptance tests (definition of done)

1. `pnpm dev:web` starts application with mocked auth; navigating to `/resources` shows DataTable with sample data from MSW and URL-synced filters.
2. Replacing OpenAPI spec and running `pnpm web:generate` regenerates clients; route using new endpoint compiles without manual edits outside route module.
3. ESLint boundaries fail when a developer imports `@tanstack/react-query` or `simple-auth` directly from `apps/web`.
4. Playwright smoke covering login + list interactions passes locally and in CI using generated MSW handlers.
5. Lighthouse CI report for preview build meets ≥90 scores; failing budgets block merge with actionable docs link.
6. Feature scaffolding CLI generates route + Storybook + test with zero TODOs and only `@starter/*` imports.

---

## 10. Dependencies & out of scope

* Depends on PRD-01 for workspace bootstrap, Dev Container, and remote cache configuration.
* Depends on PRD-02 for UI, routing, query, auth, analytics, and config packages.
* Depends on PRD-04 for API endpoints implementing the List contract consumed by `@starter/data-access`.
* Out of scope: native mobile shells, alternative build pipelines, or server-driven UI experiments.

---

## 11. Appendix

* **Reference implementations:** TanStack Start examples, Vite React templates, Simple Auth SPA blueprints.
* **Playbook alignment:**
  * Definition of Ready — route scaffolds available, auth & analytics configured, Storybook Scenes documented.
  * Definition of Done — DataTable wired to API, tests + Lighthouse budgets passing, analytics events reviewed.
* **Future enhancements:** optional SSR bridge (TanStack Start), micro-frontend compatibility evaluation, component-level theming packs.

