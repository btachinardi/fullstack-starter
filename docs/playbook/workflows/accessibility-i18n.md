# Accessibility & Internationalization Workflow

Follow this workflow whenever building or updating user-facing experiences to guarantee inclusive, localized experiences.

## 1. Planning
- Include accessibility and localization requirements in the [UI spec](../templates/UI-spec.md) and [PRD](../templates/PRD.md).
- Identify target locales, language variants, and regional compliance obligations early.
- Engage accessibility champions and localization partners for early feedback.

**Exit criteria:** Requirements documented, Definition of Ready checks complete, resources scheduled.

## 2. Design & Content
- Collaborate with design to ensure semantic structure, contrast ratios, and focus states meet WCAG 2.1 AA.
- Provide localization-ready copy with placeholders and character limits in the UI spec content table.
- Prototype critical flows with screen reader and keyboard navigation scenarios in mind.

**Exit criteria:** Design review approved with accessibility annotations; localized copy prepared for handoff.

## 3. Implementation
- Use semantic HTML, ARIA roles (only when necessary), and accessible component library patterns.
- Externalize strings, support RTL layouts if applicable, and handle pluralization/gender rules.
- Instrument analytics to detect locale usage and accessibility feature adoption where possible.

**Exit criteria:** Feature available in staging with localization files, automated accessibility tests passing.

## 4. Testing
- Execute the [Accessibility checklist](../templates/Accessibility-checklist.md) and document results.
- Validate translations using pseudo-localization or localized builds; include regional formatting for dates, numbers, currency.
- Test with assistive technologies (screen readers, voice control) and various input methods.

**Exit criteria:** Accessibility/locale issues resolved or tracked with owners and timelines; QA sign-off complete.

## 5. Launch & Monitoring
- Coordinate rollout with localization release schedules and translation updates.
- Monitor accessibility feedback channels, support tickets, and analytics anomalies by locale.
- Capture accessibility debt or localization backlog items in the risk register if unresolved.

**Exit criteria:** Inclusive experience live in all targeted locales; monitoring hooks active; backlog updated for follow-ups.

## Continuous Improvement
- Conduct periodic accessibility audits and localization reviews.
- Share learnings in design/engineering critiques to evolve patterns.
- Update component libraries and documentation with improved patterns and internationalization utilities.
