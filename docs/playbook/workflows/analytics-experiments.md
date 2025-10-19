# Analytics & Experimentation Workflow

Use this workflow when instrumenting features, running experiments, or updating dashboards to ensure trustworthy insights
and timely decisions.

## 1. Planning & Alignment
- Define hypotheses, KPIs, and guardrails in the [Analytics Plan](../templates/Analytics-plan.md).
- Partner with product and engineering to embed analytics requirements in tickets.
- Validate data governance considerations (privacy, retention, consent).

**Exit criteria:** Analytics plan approved, tracking scope documented, stakeholders aligned on success metrics.

## 2. Instrumentation & Development
- Implement tracking events with consistent naming conventions and versioning.
- Add experimentation toggles/feature flags to control audience exposure.
- Update schemas and ETL jobs as needed; document in the data catalog.

**Exit criteria:** Events deployed to staging, schema validated, QA sign-off received.

## 3. Validation & QA
- Perform event QA using tag managers, browser dev tools, or automated scripts.
- Reconcile counts between source systems and data warehouse.
- Run experiment simulations to ensure assignment, bucketing, and exclusions behave correctly.

**Exit criteria:** Tracking accuracy confirmed, dashboards configured, alerts set for anomalies.

## 4. Launch & Monitoring
- Start experiment or enable tracking in production with guardrails configured.
- Monitor data quality dashboards, experiment metrics, and guardrail breaches daily.
- Communicate status updates and interim reads to stakeholders.

**Exit criteria:** Experiment runs for planned duration with sufficient power; data quality remains acceptable.

## 5. Analysis & Decision
- Analyze results using agreed statistical methods (e.g., Bayesian, sequential testing).
- Document insights, recommendations, and next steps.
- Archive experiment results in a central repository with links to dashboards.

**Exit criteria:** Decision communicated, backlog updated, and learnings shared in retrospectives.

## Continuous Improvement
- Maintain an analytics QA checklist to capture recurring issues.
- Review experiment pipeline performance quarterly to reduce latency.
- Incorporate feedback from product teams to refine metrics and dashboards.
