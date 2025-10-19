# Definition of Ready

A feature reaches the **Definition of Ready (DoR)** when the team can begin implementation without uncovering ambiguous
requirements or hidden dependencies. Meeting these criteria keeps sprint commitments reliable and reduces the need for
rework mid-iteration.

## Core Readiness Checklist

| Theme | Checklist Items |
| --- | --- |
| Product & Outcomes | • Problem statement, goals, and success metrics documented in the [PRD template](../templates/PRD.md).<br>• Acceptance criteria written as user stories or Gherkin scenarios.<br>• Impact analysis for affected user segments and markets. |
| Design & UX | • Latest mocks, redlines, or interactive prototypes linked in the [UI specification](../templates/UI-spec.md).<br>• Accessibility considerations reviewed with the [Accessibility checklist](../templates/Accessibility-checklist.md). |
| Engineering | • Architectural approach reviewed; major decisions captured in an [ADR](../templates/ADR.md) or [RFC](../templates/RFC.md).<br>• Dependencies on other services, jobs, or infrastructure identified with owners acknowledged.<br>• Feature flag strategy defined, including rollout criteria and kill-switch plan. |
| QA & Testing | • Test strategy captured in the [Test Plan](../templates/Test-plan.md) and exploratory notes prepared.<br>• Test data requirements documented, synthetic data sources identified.<br>• Automation candidates classified (unit, integration, E2E). |
| Data & Analytics | • Analytics tracking and experimentation needs detailed in the [Analytics Plan](../templates/Analytics-plan.md).<br>• Dashboards or alerting updates identified and ticketed.<br>• Success metrics have baseline values and projected movement. |

A DoR review should be completed before a feature is scheduled into a sprint or delivery milestone. Use the table as a
checklist during backlog refinement and update the linked artifacts when gaps are discovered.

## Tailoring for Specialty Tracks

- **API work:** Confirm versioning strategy, deprecation notices, and contract tests are prepared. Link to the
  [API workflow](../workflows/api-workflow.md) for additional steps.
- **UI features:** Verify responsive states, localization strings, and accessibility acceptance criteria. Align with the
  [UI workflow](../workflows/ui-workflow.md).
- **Background jobs & data pipelines:** Validate throughput expectations, failure handling, and observability coverage
  (alerts, dashboards). Coordinate with the [background jobs workflow](../workflows/background-jobs.md).
- **Security/privacy impacting changes:** Ensure threat models are updated and required assessments scheduled as outlined in
  the [security & privacy workflow](../workflows/security-privacy.md).

## Maintaining the DoR

- **Review cadence:** Revisit the checklist quarterly with product, engineering, design, QA, and data representatives to
  confirm it reflects current practices.
- **Living links:** Replace placeholder links in artifacts with the permanent location (e.g., product docs, Figma files).
- **Feedback loop:** Encourage sprint retrospectives to call out DoR misses. Update the criteria with concrete examples to
  prevent recurrence.
- **Traceability:** Reference the DoR in Jira/Linear issues so downstream stakeholders know when an item is implementation
  ready.
