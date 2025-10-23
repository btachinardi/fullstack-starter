# PRD-01: Workspace Bootstrapping & Toolchain

## Document control

- **Status:** Draft (for sign-off)
- **Last updated:** 2025-10-19
- **Owners:** Platform Engineering Guild
- **Stakeholders:** Feature Enablement, Developer Experience, QA Automation, Security Engineering
- **Related artifacts:** [Feature Delivery Playbook](../../playbook/README.md), [ADR Template](../../playbook/templates/ADR.md), [PRD-05 Developer Workflow, Quality, and CI/CD](prd-05-developer-workflow-quality-cicd.md)

---

## 1. Background & problem statement

The fullstack-starter must let product teams ship domain features without wrestling the toolchain. Today, onboarding a new engineer takes ~0.5–2 days to align Node/pnpm, understand the `apps/*` ↔ `packages/*` dependency model, and mirror CI locally. Divergent environments cause “works on my machine” bugs and slow PR cycles.

We will standardize the developer environment, automate bootstrap, and align local workflows with the CI/CD expectations defined in PRD-05. Decisions are fixed here to prevent drift: we pin the toolchain via Corepack, standardize Windows on WSL2, adopt Dev Containers by default, and agree on remote cache strategy up front.

---

## 2. Goals & non-goals

### 2.1 Goals

1. **One-command onboarding** — A single documented command performs prerequisite checks, installs dependencies, configures hooks, prepares env files, and prints next steps.
2. **Deterministic environments** — Toolchain is pinned via `packageManager` (pnpm) and `.nvmrc` (Node LTS) enforced through Corepack and Dev Container defaults.
3. **First-class monorepo behavior** — Turborepo pipelines model `apps/*` → `packages/*` dependencies so apps consume package outputs without manual wiring.
4. **DX guardrails** — Canonical scripts and VS Code recommendations ensure local workflows match CI expectations.
5. **Self-service troubleshooting** — Bootstrap emits human-readable logs and machine-readable JSON summaries with guided troubleshooting.
6. **Security baseline** — Bootstrap enforces secret scanning hooks, pnpm store integrity, and least-privilege cache tokens.

### 2.2 Non-goals

- Cloud infrastructure provisioning or secrets lifecycle (covered by PRD-05 and deployment ADRs).
- Domain-specific code; app templates remain minimal.
- Supporting package managers other than pnpm in v1.
- Supporting native Windows without WSL2.

---

## 3. Personas & user stories

| Role              | Scenario                                    | Success criteria                                                                                                                                |
| ----------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| New engineer      | Clones repo and runs the bootstrap command. | Setup validates prerequisites, installs, prepares `.env*`, and prints next steps in **≤5 min (90th pct)** in Dev Container; **≤10 min** native. |
| QA automation     | CI runner checks out repo.                  | `pnpm setup --check` verifies environment; `pnpm install` obeys lockfile; Turborepo graph reflects package dependencies.                        |
| Tech lead         | Audits readiness before onboarding a squad. | `/docs/getting-started.md`, `.vscode/`, and Dev Container provide clear instructions; telemetry shows healthy success rate.                     |
| Security engineer | Reviews compliance.                         | Reproducible configs, gitleaks hooks, SBOM generation hooks, and cache tokens scoped least-privilege.                                           |
| Windows developer | Onboards from 'indows.                      | WSL2 flow documented and validated in CI'; no “native Windows only” gaps.                                                                       |

---

## 4. Functional requirements

### 4.1 Workspace & manifest

- Maintain `pnpm-workspace.yaml` covering `apps/*`, `packages/*`, and tooling packages.
- Root `package.json` MUST include:
  - `packageManager` pinning exact pnpm version (e.g., `"pnpm@X.Y.Z"`).
  - `engines.node` matching `.nvmrc` (LTS).
  - Scripts: `setup`, `dev`, `lint`, `test`, `typecheck`, `build`, `format`, `clean`, `smoke`.
- Commit `.npmrc`/pnpm config to enforce store integrity, hoist policy, and registry mirrors as needed.

### 4.2 Toolchain pinning & platform policy

- Enable **Corepack** in repo to manage pnpm version.
- Provide `.nvmrc` and optional `.node-version` for Volta/asdf compatibility.
- **Windows policy:** WSL2 is the supported path; Docker Desktop documented only as fallback (with known caveats).
- Document optional local providers (asdf, Volta) but make them non-blocking.

### 4.3 Dev environment standardization

- Provide `.devcontainer/devcontainer.json` with Node LTS, Corepack, pnpm, git, and Docker socket access.
- Preinstall VS Code extensions (ESLint, Prettier, Tailwind, Prisma, PNPM, Docker, GitHub Actions).
- Dev Container workspace mounts `apps/`, `packages/`, caches pnpm store, and runs `pnpm setup` on postCreate.
- Native setup guides in `/docs/getting-started.md` cover macOS + WSL2 with parity to Dev Container.

### 4.4 Bootstrap script (`scripts/setup.mjs`)

- Node ESM (no Bash), cross-platform, idempotent, non-interactive.
- Capabilities:
  - Preflight checks (Corepack, Node/pnpm versions, git, Docker availability when required).
  - `pnpm install --frozen-lockfile` with cache warmup.
  - Generate `.env.local`/`.env` from 'emplates per workspace without overwriting existing values'; warn for missing secrets.
  - Install/configure Husky hooks: `pre-commit` (format + lint via lint-staged, <2s median), `commit-msg` (conventional commits), `pre-push` (targeted `typecheck`).
  - Emit human log to `.logs/setup-<timestamp>.log` and JSON summary to `.logs/setup-<timestamp>.json` (steps, timings, exit codes).
- Flags: `--check`, `--verbose`, `--json`, `--migrate-env`.
- Exit codes map 1:1 to failure stages for support playbooks.

### 4.5 Environment management

- Each workspace ships `.env.example` with comments for required variables and secrets placeholders.
- Runtime env validated via `dotenv-flow` + Zod schema; missing/invalid variables crash startup with table output and link to `/docs/env.md`.
- `packages/config-env/` tracks schema versions and codemods consumed by `setup --migrate-env`.

### 4.6 Turborepo pipelines

- `turbo.json` defines `build`, `lint`, `test`, `typecheck`, `format`, `smoke` pipelines with explicit `dependsOn` from `apps/*` to `packages/*`.
- Default remote cache: S3/MinIO adapter configured via `TURBO_REMOTE_CACHE_URL` and token; Vercel remote cache supported when `TURBO_TOKEN` present.
- Pipelines gracefully fall back to local cache when remote credentials unavailable.
- Provide docs snippet showing how to inspect dependency graph (`pnpm turbo graph`).

### 4.7 CI touchpoints

- Provide reusable script `pnpm ci:bootstrap` that runs `pnpm setup --check` without mutating files for CI usage.
- Document handshake with PRD-05 workflows to reuse bootstrap logic; detailed CI implementation resides in PRD-05.
- CODEOWNERS protect `scripts/setup.mjs`, `.devcontainer/`, `turbo.json`, and `packages/config-env`.

### 4.8 Editor & tooling recommendations

- `.vscode/extensions.json` and `.vscode/settings.json` align with playbook standards (format-on-save, TS SDK path, pnpm enablement, Tailwind class sorting).
- Provide recommended terminal aliases and pnpm scripts in `/docs/getting-started.md`.

### 4.9 Security & supply chain guardrails

- Husky hooks run gitleaks on staged files; repo-level `.gitleaks.toml` maintained by platform team.
- `pnpm install` uses `--frozen-lockfile` and `pnpm store prune` optional command documented for cleanup.
- Generate SBOM via `pnpm sbom` script (CycloneDX) as part of `pnpm setup --check`; CI attachment handled in PRD-05.
- Cache credentials stored in `.env.local` templates with comments referencing PRD-05 for distribution.

### 4.10 Documentation

- `/docs/getting-started.md`: prerequisites, Dev Container instructions, native alternatives, bootstrap command, troubleshooting tree.
- `/docs/env.md`: variable reference, validation behavior, migration policy, link to config-env changelog.
- ADRs capturing Turborepo vs Nx decision, remote cache provider, Dev Container baseline.

### 4.11 Quality gates

- Lint: **0 errors, 0 warnings** on bootstrap script and configs.
- Typecheck: `pnpm typecheck --filter setup...` clean (`--noEmit`).
- Test coverage (setup modules): **≥80%** across unit + integration.
- Smoke test: on clean clone, `pnpm setup` followed by `pnpm turbo run lint test build --filter ...` completes within agreed budgets (documented in `/docs/getting-started.md`).
- Hooks: `pre-commit` median runtime **<2s** on changed files.

### 4.12 Optional telemetry

- Opt-in telemetry captures step timings/failure stage from 'pnpm setup` to improve onboarding'; data stored locally unless user consents to upload.
- Telemetry toggle stored in `.env.local` (`SETUP_TELEMETRY=optional`).

---

## 5. Technical approach

1. **Monorepo tooling** — Adopt Turborepo for task orchestration (ADR). Provides caching, dependency graphing, CI integration.
2. **Toolchain pinning** — Use `packageManager` + Corepack, `.nvmrc`, and Dev Container to keep Node/pnpm consistent; Renovate monitors updates.
3. **Environment validation** — `dotenv-flow` + Zod ensures deterministic runtime env; config-env package centralizes schemas.
4. **Bootstrap implementation** — Node ESM script orchestrates preflight, installs, env templating, hooks, logging, telemetry, migrations.
5. **Remote cache** — Default to S3/MinIO adapter; fall back gracefully; document tokens/rotation expectations.
6. **Windows standard** — Require WSL2; CI includes Windows job using same scripts for parity.

---

## 6. Metrics & success criteria

- **Time to first successful `pnpm dev`:** Dev Container P90 ≤ 5 minutes; native (macOS/WSL2) P90 ≤ 10 minutes.
- **Toolchain adherence:** 100% new clones use pinned Node/pnpm within two weeks of launch.
- **Support load:** <5% onboarding tickets relate to environment setup in first quarter.
- **Setup coverage:** ≥80% coverage across bootstrap modules.
- **Bootstrap success rate:** ≥95% of telemetry-enabled runs succeed without manual intervention.

---

## 7. Risks & mitigations

| Risk                           | Impact                             | Mitigation                                                                               |
| ------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Cross-platform differences     | Setup fails for subset of devs.    | Pure Node ESM (no Bash), CI on Ubuntu + Windows (WSL2), documented fallbacks.            |
| Toolchain drift                | Breakages after Node/pnpm updates. | Renovate schedule; quarterly review of `.nvmrc` & `packageManager`; ADR for major bumps. |
| Secret leakage via env files   | Security incident.                 | Only placeholders generated; `.env*` ignored; gitleaks hooks enforced.                   |
| Slow hooks frustrate devs      | Hooks disabled locally.            | lint-staged on changed files, performance budgets, feedback channel documented.          |
| Remote cache credential misuse | Unauthorized access.               | Least-privilege tokens, CI-only storage, quarterly rotation, audit logs.                 |

---

## 8. Rollout plan

1. **Alpha (platform branch)**
   - Ship Dev Container, bootstrap script, env validation, remote cache defaults, docs draft.
   - Run on 3 clean machines (macOS, Ubuntu, Windows/WSL2); capture timings and issues.
2. **Beta (two product squads)**
   - Collect telemetry (opt-in) and manual feedback; fix hook performance; add CODEOWNERS protections.
3. **GA**
   - Merge to `main`; update starter docs; share onboarding metrics dashboard; require Dev Container or WSL2 usage.
4. **Maintenance**
   - Quarterly audits; Renovate-driven updates; rotate cache tokens; monitor telemetry for regressions.

---

## 9. Acceptance tests (definition of done)

1. On mismatched Node/pnpm versions, `pnpm setup` exits non-zero with remediation guidance referencing docs.
2. Running `pnpm setup` twice yields zero git diff; JSON summary reports "no-op" steps on second run.
3. CI job invoking `pnpm ci:bootstrap` succeeds on Ubuntu + Windows (WSL2) runners without modifying files.
4. Removing required env var causes startup to fail with Zod table and link to `/docs/env.md`.
5. Removing remote cache credentials falls back to local cache; pipelines still pass.
6. Committing mock secret triggers gitleaks locally and via Husky; SBOM command generates artifact.

---

## 10. Dependencies & out of scope

- Depends on platform decisions captured in ADRs (Turborepo, remote cache provider, Dev Container baseline).
- Provides bootstrap foundation consumed by PRD-02 (packages), PRD-03 (web shell), PRD-04 (API shell), and PRD-05 (CI/CD).
- Out of scope: release automation, preview environments, production infrastructure provisioning.

---

## 11. Open questions

- Codespaces resource quotas and cost controls for heavy builds.
- Whether macOS runner becomes required in CI vs optional (coordinate with PRD-05).
- Long-term telemetry storage policy (local only vs opt-in upload).

---

## 12. Appendix

- **Reference implementations:** Vercel Turborepo starter; Shopify web+service monorepos (for pipeline patterns).
- **Playbook alignment:**
  - Definition of Ready — Dev Container present; bootstrap documented; env templates versioned.
  - Definition of Done — Setup tests + CI parity; security scans; SBOM generated; coverage ≥80% on setup modules.
- **Future enhancements:** CLI generator for new apps/packages, Renovate/Dependabot baseline config, optional Make/Just entrypoints.
