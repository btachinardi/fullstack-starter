# Feature Workflow Overview

This workflow describes how cross-functional teams move a feature from ideation to validated production outcomes. Each
stage references specialized workflows, definitions, and templates that provide deeper guidance.

## Stage 1 – Discovery & Alignment
- Capture the problem statement, target audience, and desired outcomes in a [PRD](../templates/PRD.md).
- Partner with design, engineering, and data to assess feasibility and identify risks.
- Produce lightweight prototypes or spikes to validate technical unknowns. Document findings in an [ADR](../templates/ADR.md)
  or [RFC](../templates/RFC.md) if strategic.

**Exit criteria:** Problem framing agreed upon, success metrics drafted, Definition of Ready checklist satisfied.

## Stage 2 – Planning & Kickoff
- Break the initiative into tickets with clear acceptance criteria and link to relevant templates (UI spec, API spec, test
  plan).
- Align on milestones, rollout plan, and dependencies. Record the branching strategy for the effort.
- Schedule design reviews, security/privacy consultations, and analytics instrumentation planning.

**Exit criteria:** All work items prioritized, estimates captured, and kickoff completed with stakeholders.

## Stage 3 – Build & Integrate
- Implement slices of functionality via short-lived feature branches; maintain up-to-date documentation.
- Pair program or run async design/dev syncs to resolve issues quickly.
- Continuously update automated tests, feature flags, and observability hooks as code lands.

**Exit criteria:** Code merged to `main`, quality gates passing, and environments reflect latest feature state.

## Stage 4 – Validate & Harden
- Execute the [Test Plan](../templates/Test-plan.md), [QA checklist](../templates/QA-checklist.md), and specialty
  workflows (API, UI, DB, performance, security).
- Run user acceptance testing or beta programs where appropriate. Confirm analytics tracking is accurate.
- Finalize release notes, runbooks, and support enablement materials.

**Exit criteria:** Definition of Done met; release candidate approved by product, engineering, and QA.

## Stage 5 – Launch & Monitor
- Deploy via automated pipelines using canaries or phased rollouts. Track performance against SLOs and KPIs.
- Monitor logs, metrics, and alerts defined in observability workflows. Keep stakeholders informed of status.
- Capture experiment or analytics results; adjust rollout if guardrails breach.

**Exit criteria:** Feature stable in production, telemetry within expected ranges, and follow-up tasks logged.

## Stage 6 – Learn & Iterate
- Review outcomes against goals in retrospectives or post-launch reviews.
- Document learnings, update ADRs/RFCs, and plan next iterations.
- Clean up feature flags, temporary scripts, and debt items.

**Exit criteria:** Insights recorded, backlog refined, and workflow artifacts updated for future reference.

## RACI Snapshot
| Stage | Product | Design | Engineering | QA | Data |
| --- | --- | --- | --- | --- | --- |
| Discovery | A | R | C | C | R |
| Planning | A | R | R | C | C |
| Build | C | C | A/R | R | C |
| Validate | A | C | R | A/R | R |
| Launch | A | C | R | R | R |
| Learn | A | C | R | C | A |

Legend: **R** = Responsible, **A** = Accountable, **C** = Consulted

## Cross-Cutting Practices
- **Feature flags:** Define strategy upfront, track lifecycle, and remove flags promptly after validation.
- **Observability:** Instrument key events early and validate throughout the workflow.
- **Documentation:** Keep templates and definitions updated; link artifacts bidirectionally.
- **Communication:** Provide weekly updates, call out risks, and celebrate wins.
