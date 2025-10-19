# Definition of Done

The **Definition of Done (DoD)** is the shared contract that confirms a feature increment delivers customer value, meets
quality expectations, and is fully operational. Work that passes DoD is releasable without additional heroics.

## Completion Checklist

| Area | Criteria |
| --- | --- |
| Functionality | • All acceptance criteria satisfied and demonstrated in the staging environment.<br>• No critical or high-severity defects remain open.<br>• Feature flags or configuration toggles documented with rollout status. |
| Quality Assurance | • Automated tests updated (unit, integration, contract, and E2E as applicable) with pipelines passing.<br>• Regression, exploratory, and non-functional testing executed per the [Test Plan](../templates/Test-plan.md).<br>• QA sign-off recorded in the tracking system. |
| Documentation & Comms | • User-facing documentation updated (release notes, help center, in-app messaging).<br>• Runbooks, API docs, and architecture diagrams refreshed.<br>• Stakeholders notified via agreed channels (Slack, email, changelog). |
| Operations | • Monitoring dashboards, alerts, and logging updated; SLOs validated.<br>• Rollback plan verified and tested when feasible.<br>• Security/privacy requirements met with evidence captured (penetration test, ASVS checklist, DPIA). |
| Governance | • Linked Jira/Linear tickets closed with links to PRs and supporting artifacts.<br>• ADRs/RFCs merged and referenced in code or docs.<br>• Release approvals obtained from product, engineering, and QA owners. |

## Release Readiness Activities

1. **Demo the feature** in sprint review or async recording to validate outcomes.
2. **Verify telemetry** is capturing KPIs outlined in the [Analytics Plan](../templates/Analytics-plan.md).
3. **Confirm operational handoff** to on-call/DevOps, including runbooks and escalation paths.
4. **Track post-release follow-ups** such as deprecating legacy endpoints, cleaning up flags, or completing adoption tasks.

## Sustaining the DoD

- **Continuous improvement:** After each release retrospective, capture DoD gaps and feed them into updates.
- **Tooling alignment:** Automate checklist enforcement via CI/CD gates, PR templates, and release pipelines wherever possible.
- **Visibility:** Publish the DoD in onboarding materials and link from the engineering handbook and workflow guides.
- **Audit trail:** When exceptions are made, document rationale, timeline for remediation, and responsible owner.
