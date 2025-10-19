# Database Change Workflow

This workflow covers schema migrations, data backfills, and performance tuning efforts to maintain data integrity and
system reliability.

## 1. Assessment & Planning
- Capture change rationale, impacted tables, and data volume in the PRD or technical brief.
- Evaluate risks (downtime, lock contention, replication lag) and mitigation strategies.
- Prepare migration checklist using the [DB Migration template](../templates/DB-migration-checklist.md).

**Exit criteria:** Risk assessment documented, rollback plan defined, Definition of Ready satisfied.

## 2. Development
- Develop migrations incrementally; prefer additive changes and phased rollouts.
- Write idempotent scripts with clear comments and version control.
- Update ORM models, stored procedures, and application logic in parallel.

**Exit criteria:** Migration scripts reviewed, automated tests updated, staging environment ready for validation.

## 3. Validation & Performance Testing
- Run migrations on staging with production-like data snapshots.
- Measure query plans, index usage, and performance regressions.
- Execute load or canary tests to ensure SLOs remain intact.

**Exit criteria:** Performance checklist completed, sign-offs from data owners and engineering leads.

## 4. Deployment & Monitoring
- Schedule deployment windows considering peak traffic and replication cycles.
- Enable enhanced monitoring (query latency, locks, replication lag) during rollout.
- Execute verification queries post-migration and document results.

**Exit criteria:** Migration deployed without incidents, verification complete, alerts quiet.

## 5. Post-Migration Activities
- Remove deprecated columns/indices once safe.
- Update data documentation, lineage diagrams, and analytics models.
- Conduct a retrospective to capture lessons learned and feed into future migrations.
