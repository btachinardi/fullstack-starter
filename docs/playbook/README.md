# Feature Delivery Playbook

Welcome to the Feature Delivery Playbook for the fullstack-starter project. This living documentation captures the agreed-upon
ways we plan, build, ship, and learn from product features. It consolidates workflows, definitions, and templates so that
cross-functional teams can move fast while maintaining quality.

## How to Use This Playbook

- **Start with the workflow overview** (`workflows/feature-overview.md`) to understand the canonical stages from idea to production
  monitoring. Each specialized workflow dives into area-specific practices referenced in the overview.
- **Apply the definitions** in the `definitions/` directory to ensure every initiative meets the same standards for readiness,
  completion, and code quality. These pages describe the gates that features must clear before progressing.
- **Adopt the templates** in the `templates/` directory when authoring product briefs, technical specs, test plans, and checklists.
  They keep teams aligned on structure and accelerate reviews.
- **Link artifacts back** to the playbook. Every PRD, RFC, ADR, or checklist stored elsewhere should reference the template version
  used and note any deviations.

## Repository Structure

```
/docs/playbook
  README.md                → This navigation guide.
  definitions/             → Shared standards and quality gates.
  templates/               → Authoring templates and checklists.
  workflows/               → End-to-end and specialty delivery guides.
```

Each directory is self-contained and may reference supporting material in the broader repository. When adding new content,
include cross-links so that readers can traverse from workflow steps to definitions and templates without context switching.

## Maintaining the Playbook

- **Versioning:** Treat updates like code changes—open a PR summarizing the intent, highlight the affected teams, and ensure
  reviewers from product, engineering, and QA sign off.
- **Change log:** Record notable process updates within the relevant file under a "Revision History" section so future readers can
  see when and why adjustments happened.
- **Contribution workflow:** Propose changes via RFC or ADR when altering foundational practices such as the Definition of Ready,
  CI quality gates, or branching strategy. Reference those decisions in the playbook once approved.
- **Review cadence:** Revisit critical pages (workflow overview, DoR/DoD, quality gates) at least quarterly or after major
  retrospectives to keep guidance aligned with reality.

## Related Resources

- **Feature workflow overview:** `workflows/feature-overview.md`
- **Specialized workflows:** API, UI, database, background jobs, infrastructure & observability, security & privacy, performance,
  accessibility & i18n, analytics & experimentation.
- **Templates:** Product requirements, API/UI specifications, QA/Code Review checklists, ADR/RFC formats, and more to standardize
  planning and execution.

By consolidating our delivery practices here, we ensure every team member can onboard quickly, contribute confidently, and uphold
our quality bar as the product evolves.
