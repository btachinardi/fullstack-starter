# Infrastructure & Observability Workflow

Follow this workflow when provisioning infrastructure, updating platform services, or enhancing observability tooling.

## 1. Planning & Design
- Document infrastructure goals, capacity targets, and compliance needs in an RFC or PRD.
- Evaluate cloud architecture, networking, and dependency impacts; align with SRE/on-call stakeholders.
- Define observability objectives (metrics, logs, traces) and required dashboards.

**Exit criteria:** Design approved, infrastructure budget confirmed, Definition of Ready satisfied.

## 2. Implementation
- Use infrastructure-as-code (Terraform, CloudFormation, Pulumi) with peer reviews and automated linting.
- Apply least-privilege IAM policies and secret management best practices.
- Implement observability changes alongside infrastructure updates (exporters, agents, instrumentation).

**Exit criteria:** IaC changes merged, integration tests passing, staging environment provisioned.

## 3. Validation & Resilience Testing
- Run smoke tests and chaos/resilience drills (failovers, AZ outages) in non-production environments.
- Validate monitoring dashboards, alert thresholds, and runbooks for new components.
- Assess cost impacts and optimize resource sizing.

**Exit criteria:** Observability coverage verified, resilience tests documented, approvals from platform owners.

## 4. Deployment & Change Management
- Follow change management policy: change ticket, communication plan, and maintenance window.
- Execute deployments with automated pipelines; maintain rollback scripts or IaC state backups.
- Monitor rollout via dashboards and logs; keep stakeholders updated in real time.

**Exit criteria:** Deployment complete without critical alerts, rollback plan no longer needed, change ticket closed.

## 5. Operations & Continuous Improvement
- Schedule post-change reviews to capture improvements and outstanding risks.
- Track infrastructure KPIs (availability, latency, cost) and update capacity plans quarterly.
- Iterate on observability instrumentation to reduce MTTR and increase detection coverage.
