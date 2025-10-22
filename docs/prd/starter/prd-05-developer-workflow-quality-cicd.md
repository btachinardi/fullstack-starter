# PRD-05: Developer Workflow, Quality, and CI/CD

## Document control

- **Status:** Draft (for sign-off)
- **Last updated:** 2025-10-19
- **Owners:** Platform Engineering Guild
- **Stakeholders:** Feature Enablement, Developer Experience, QA Automation, Security Engineering, Release Management
- **Related artifacts:** [Feature Delivery Playbook](../../playbook/README.md), [PRD-01 Workspace Bootstrapping & Toolchain](prd-01-workspace-bootstrapping-toolchain.md), [PRD-02 Shared Configuration & Platform Packages](prd-02-shared-configuration-platform-packages.md)

---

## 1. Background & problem statement

Even with a deterministic workspace and shared packages, teams stall when local checks drift from CI, releases require tribal knowledge, or quality gates rely on manual policing. The starter must encode the Feature Delivery Playbook's workflow expectations in automation so that every project inherits the same enforcement from day one.

We will deliver a GitHub-first workflow that mirrors local commands, gates code quality against the playbook definitions, automates release publishing, and documents responsibilities so feature teams can focus on domain work.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **Unified pipelines** — A primary CI workflow executes lint, typecheck, test, build, accessibility, security, and smoke stages using Turborepo filters with warm caches.
2. **Preview environments** — Pull requests automatically provision ephemeral previews for `apps/web` (Vercel) and `apps/api` (Fly.io or Railway) with teardown automation.
3. **Release orchestration** — Changesets-driven publishing for packages and Docker images with semantic versioning, changelog generation, and release notes.
4. **Quality guardrails** — Secret scanning, dependency review, SBOM, accessibility, and performance checks enforced in CI and referenced in documentation.
5. **Developer workflow docs** — `/docs/dev-workflow.md` describes local ↔ CI parity, troubleshooting, escalation, and ownership mapped to the playbook checklists.

### 2.2 Non-goals

- Implementing observability dashboards or alert routing (covered by platform SRE charters).
- Managing production infrastructure beyond preview lifecycle automation.
- Defining product-specific rollout or incident response processes.

---

## 3. Personas & user stories

| Role              | Scenario                          | Success criteria                                                                                                 |
| ----------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend engineer | Pushes a feature branch.          | CI runs relevant tasks via Turborepo filters; preview URL posted to PR; failure reasons map to playbook gates.   |
| Backend engineer  | Publishes a new API capability.   | Changesets release workflow publishes package + Docker image with generated changelog; SBOM attached to release. |
| QA automation     | Validates accessibility baseline. | Axe/Storybook checks execute automatically; results exported to artifacts; preview accessible for manual QA.     |
| Security engineer | Audits supply-chain posture.      | Secret scanning, dependency review, and SBOM generation run on every push; evidence stored for 90 days.          |
| Release manager   | Cuts a stable release.            | One documented workflow triggers release pipeline; notifications sent to Slack/email with links to artifacts.    |

---

## 4. Functional requirements

### 4.1 CI architecture

- `.github/workflows/ci.yml` orchestrates jobs with Turborepo's `--filter` to run tasks only on affected packages/apps.
- Job stages: `setup` (use `pnpm install --frozen-lockfile`), `lint`, `typecheck`, `test`, `build`, `accessibility`, `security`, `smoke`.
- Matrix: Ubuntu (required), Windows via WSL2 (required for parity), macOS (optional, nightly).
- Cache strategy: GitHub Actions cache for pnpm store + Turborepo remote cache (S3/MinIO default as per PRD-01).
- Workflow uses reusable composite actions stored under `.github/actions/*` for setup and caching.

### 4.2 Preview environments

- `.github/workflows/previews.yml` triggers on PR open/synchronize.
- Uses Vercel CLI for `apps/web` and Fly.io (or Railway) for `apps/api`; secrets managed through environment-specific GitHub environments with manual approval gates as needed.
- Preview metadata (URLs, status) posted as PR comments and stored in `checks` API.
- Automatic teardown on PR close/merge; fallbacks documented for manual cleanup.

### 4.3 Release management

- `.github/workflows/release.yml` listens to merges on `main` or manual dispatch.
- Runs `pnpm changeset version` and `pnpm changeset publish` for packages; publishes Docker images for apps with semver tags (`latest`, `<major>.<minor>.<patch>`).
- Generates release notes via Changesets changelog; posts summary to Slack (via webhook) and GitHub Releases with SBOM attachments.
- Supports dry runs for staging branches using `changeset pre` mode.

### 4.4 Quality enforcement

- Secret scanning: gitleaks in CI + pre-commit; uses centralized config in `packages/config-security` (future optional) or root `.gitleaks.toml`.
- Dependency review: `npm audit` (pnpm `audit`), `pnpm dlx licensee`, and GitHub Dependabot alerts enabled.
- Accessibility: Storybook test runner with axe, plus Playwright component smoke for critical flows.
- Performance budgets: Lighthouse CI run against web preview with thresholds defined in `/docs/performance-budgets.md`.
- SBOM: CycloneDX generated for packages and Docker images; stored as build artifacts and attached to releases.

### 4.5 Local workflow alignment

- `pnpm setup` (PRD-01) installs Husky hooks that run lint-staged (format + lint), conventional commit check, and pre-push `pnpm turbo run typecheck --filter=...[HEAD^]`.
- `/docs/dev-workflow.md` maps local scripts to CI jobs, includes failure lookup tables, and references playbook checklists.
- Provide `pnpm script` wrappers for `ci:lint`, `ci:test`, etc., so developers can reproduce CI locally.

### 4.6 Telemetry & reporting

- Capture pipeline metrics (duration, success rate) via GitHub REST API script executed nightly; export to JSON for dashboards.
- Store artifacts for 30 days minimum; preview usage metrics recorded to monitor cost.
- Optional opt-in telemetry from `pnpm setup` (PRD-01) integrates with pipeline metrics for onboarding reports.

---

## 5. Technical approach

1. **Reusable actions** — Encapsulate install/cache logic in `.github/actions/setup` to ensure parity across workflows.
2. **Environment segregation** — Use GitHub Environments for `preview`, `staging`, `production` secrets; require CODEOWNERS review for workflow changes touching protected envs.
3. **Infrastructure providers** — Standardize on Vercel (web) and Fly.io (API) with Terraform or CLI automation documented; allow overrides via ADR.
4. **Artifact retention** — Configure workflows to upload results (test reports, SBOM, coverage) to GitHub Artifacts and optionally S3 for long-term storage.
5. **Observability hooks** — Expose webhook notifications to Slack or MS Teams to broadcast pipeline state changes.

---

## 6. Metrics & success criteria

- **Pipeline reliability:** ≥ 99% success rate for `main` pipeline over rolling 30 days.
- **CI duration:** Full pipeline ≤ 12 minutes P95 on Ubuntu runner; previews ready ≤ 8 minutes after PR push.
- **Release cadence:** Packages published within 2 hours of merge to `main`; 0 manual steps required.
- **Compliance coverage:** 100% runs produce SBOM and pass secret scan; accessibility checks green for baseline stories.
- **Adoption:** 100% repos scaffolded from starter use provided workflows without local forks.

---

## 7. Risks & mitigations

| Risk                                  | Impact                                    | Mitigation                                                                  |
| ------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Preview provider limits or outages    | PRs blocked from 'alidation               | Document manual fallback deploy flow'; allow maintainers to retrigger jobs. |
| Runner differences (Windows vs Linux) | Flaky CI across platforms                 | Use Dev Container parity, run targeted smoke tests, document known gaps.    |
| Secrets exposure in workflows         | Security incident                         | Enforce environment protection rules; rotate credentials quarterly.         |
| Long-running pipelines                | Slows feedback, encourages bypasses       | Optimize caching, parallelize jobs, track metrics for regression alerts.    |
| Release automation regressions        | Broken package publishes or version drift | Add dry-run mode, automated integration tests for release workflow.         |

---

## 8. Rollout plan

1. **Phase 0 – Design**

   - Finalize workflow architecture ADRs (providers, cache strategy, release cadence).
   - Define quality gate budgets and update playbook checklists.

2. **Phase 1 – CI foundation**

   - Implement `ci.yml` with lint/typecheck/test/build + caching.
   - Integrate gitleaks, dependency review, SBOM generation.

3. **Phase 2 – Previews & quality extensions**

   - Add preview workflow; integrate accessibility + Lighthouse checks.
   - Publish `/docs/dev-workflow.md` and troubleshooting guides.

4. **Phase 3 – Release automation**

   - Wire Changesets release pipeline, Docker publishing, notifications.
   - Validate dry run on staging branch; document rollback procedures.

5. **Phase 4 – Optimization & telemetry**
   - Add telemetry scripts, dashboards, and SLA monitoring.
   - Iterate on performance budgets, bundle caching, and nightly macOS job.

---

## 9. Acceptance tests (definition of done)

1. New PR triggers CI + preview workflows; all stages pass on clean repo clone.
2. Failing lint/test step surfaces actionable error linked to `/docs/dev-workflow.md` troubleshooting table.
3. Merge to `main` publishes updated packages (if changesets present) and Docker images with generated changelog + SBOM attachments.
4. Secret scanning catches injected fake secret in sample commit locally and in CI.
5. Accessibility workflow fails when axe detects WCAG A violation in Storybook scene; failure is visible in PR.
6. Telemetry script outputs JSON metrics file verifying pipeline durations and success rates.

---

## 10. Dependencies & out of scope

- Depends on PRD-01 for deterministic setup scripts and remote cache configuration.
- Depends on PRD-02 for shared configs (ESLint, Jest, Storybook) used by CI.
- Depends on PRD-03/04 for app shells that produce builds and previews.
- Out of scope: domain-specific CD (production deploy) beyond publishing artifacts; full incident management playbooks.

---

## 11. Open questions

- Final provider choice for API previews (Fly.io vs Railway) pending cost/security review.
- Whether macOS runners become required vs nightly optional.
- Strategy for long-term artifact retention beyond GitHub limits (S3, Artifactory?).

---

## 12. Appendix

- **Reference workflows:** Vercel + Turborepo starter, Prisma CI templates, GitHub Actions reusable workflows examples.
- **Playbook alignment:**
  - Definition of Ready — pipelines defined, preview providers configured, quality budgets documented.
  - Definition of Done — CI + preview green, release artifacts published, SBOM + accessibility checks complete.
- **Future enhancements:** integrate CodeQL for advanced static analysis, add flaky test quarantine automation, incorporate dependency diff reporting per PR.
