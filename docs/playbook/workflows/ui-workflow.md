# UI Delivery Workflow

This workflow ensures user-facing experiences are delightful, accessible, and maintainable from concept to launch.

## 1. Discovery & Definition
- Document user problems, personas, and desired outcomes in the [PRD](../templates/PRD.md).
- Audit existing patterns or components that could be reused.
- Outline analytics, accessibility, and localization requirements early.

**Exit criteria:** Definition of Ready satisfied with UI spec drafted and research inputs linked.

## 2. Design Iteration
- Collaborate on wireframes, high-fidelity mocks, and prototypes; capture decisions in the [UI spec](../templates/UI-spec.md).
- Run design critiques and usability testing to validate flows.
- Align with engineering on technical feasibility, performance implications, and responsive behavior.

**Exit criteria:** Finalized design artifacts with annotations and accessibility checks complete.

## 3. Implementation
- Build UI using the design system/component library; document any net-new components.
- Pair with design during development to address visual QA quickly.
- Integrate analytics events, feature flags, and localization files.

**Exit criteria:** Feature available in staging, automated tests passing (unit, visual regression, accessibility).

## 4. Validation
- Execute the [Accessibility checklist](../templates/Accessibility-checklist.md) and [QA checklist](../templates/QA-checklist.md).
- Perform cross-browser/device testing and responsive validation.
- Review copy, localization, and empty/error states with stakeholders.

**Exit criteria:** Definition of Done achieved; outstanding issues logged with resolution owners.

## 5. Launch & Iterate
- Roll out using canary or feature flag strategies; monitor UX metrics (conversion, funnel drop-off).
- Gather qualitative feedback from user research or support channels.
- Triage post-launch improvements and feed into backlog.

**Exit criteria:** UI stable in production, feedback loops active, follow-up items prioritized.
