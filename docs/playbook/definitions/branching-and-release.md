# Branching and Release Strategy

Our branching model balances rapid iteration with controlled releases. It is designed for trunk-based development with
short-lived feature branches, automated testing, and incremental rollouts.

## Branch Types

- **`main`** – Always releasable. Protected by required status checks and reviews. Deploys to production on a regular cadence.
- **Feature branches** – Named `feature/<ticket-id>-<slug>`. Created from `main` and merged back via pull requests once they
  pass the Definition of Done.
- **Release branches** – Used only when coordinating multi-day stabilization. Named `release/<YYYY-MM-DD>` and created from
  `main`. Hotfixes merge into both `main` and the active release branch.
- **Hotfix branches** – Named `hotfix/<ticket-id>-<slug>`. Cut from the latest production tag, cherry-picked back into `main`
  after verification.

## Release Cadence

1. **Continuous delivery:** Small changes merged to `main` auto-deploy to staging and, after automated checks, to production
   (if feature flags allow).
2. **Scheduled drops:** For large initiatives, bundle changes weekly. Tag releases as `v<major>.<minor>.<patch>`.
3. **Emergency fixes:** Use hotfix branches with expedited reviews, followed by postmortems to reinforce quality gates.

## Deployment Flow

1. Merge approved pull requests into `main`.
2. CI builds artifacts, runs tests, and creates a release candidate.
3. Deploy to staging; run smoke tests, contract tests, and exploratory checks.
4. Promote to production via automated pipeline with manual approval from the release manager.
5. Monitor telemetry and error budgets; be ready to rollback using feature flags or automated rollback scripts.

## Governance & Tooling

- **Branch protection:** Require up-to-date status checks, linear history, and signed commits if mandated.
- **Tagging:** Each production deployment receives an annotated Git tag linking to release notes.
- **Release notes:** Document shipped features, migrations, and operational considerations using the
  [Release section of the PRD template](../templates/PRD.md) or a dedicated changelog entry.
- **Metrics:** Track deployment frequency, lead time for changes, and change failure rate; review during retrospectives.

## Communication

- Publish weekly status updates covering planned releases, risks, and rollbacks.
- Coordinate freeze windows (e.g., holidays) with stakeholders two sprints in advance.
- Document feature flag rollout plans and clean-up timelines in Jira/Linear to avoid flag debt.
