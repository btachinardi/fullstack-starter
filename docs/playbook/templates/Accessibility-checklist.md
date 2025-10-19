# Accessibility Review Checklist

- **Feature / Screen:** _Name_
- **Reviewer:** _Accessibility champion_
- **Date:** _YYYY-MM-DD_

## 1. Perceivable
- Text alternatives provided for images, icons, and media.
- Captions/transcripts available for audio/video content.
- Content reflows gracefully for zoom (200%) and responsive layouts.
- Color contrast meets WCAG 2.1 AA (use tooling to verify).

## 2. Operable
- Keyboard navigation supported for all interactive elements.
- Focus order matches visual order; visible focus indicator present.
- No keyboard traps; escape/hide modals via keyboard controls.
- Gestures have accessible alternatives (e.g., swipe actions).

## 3. Understandable
- Labels, instructions, and error messages are clear and concise.
- Form inputs include programmatic labels and helpful defaults.
- Timeouts configurable or warnings provided.
- Language attribute set correctly for localized content.

## 4. Robust
- Semantic HTML used; ARIA applied only when necessary.
- Components tested with screen readers (NVDA/JAWS/VoiceOver).
- Supports high contrast mode and reduced motion preferences.
- No accessibility violations in automated scans (axe, Lighthouse).

## 5. Additional Checks
- Localization strings reviewed for truncation or overlap.
- Accessible documentation and help content updated.
- Accessibility debt or follow-up tasks logged with owners.

## Sign-off
- [ ] Accessibility review complete
- Notes / Exceptions:

## Revision History
| Date | Author | Summary |
| --- | --- | --- |
| _YYYY-MM-DD_ | _Name_ | _Initial draft_ |
