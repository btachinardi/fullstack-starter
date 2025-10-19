# Code Review Checklist

- **PR Title/Link:** _URL_
- **Reviewer:** _Name_
- **Date:** _YYYY-MM-DD_

## 1. Design & Scope
- Changes align with linked ticket, PRD, or ADR.
- Scope is focused; large changes broken into reviewable chunks.
- Backward compatibility or migration strategy validated.

## 2. Code Quality
- Follows [Coding Standards](../definitions/coding-standards.md) and project conventions.
- Names, abstractions, and comments make intent clear.
- No dead code, TODOs, or debug statements remain.
- Error handling and logging are appropriate and non-sensitive.

## 3. Testing
- Automated tests added or updated; coverage adequate for new logic.
- Tests are deterministic and fail meaningfully.
- Manual QA steps documented in the PR description.

## 4. Security & Privacy
- Input validation, authentication, and authorization checks present.
- Secrets/configuration handled securely.
- Personal data handled per privacy requirements (collection minimized, retention documented).

## 5. Performance & Reliability
- Potential performance impacts considered (N+1 queries, large payloads).
- Long-running jobs or background tasks include retries/backoff.
- Observability instrumentation added or updated (logs, metrics, traces).

## 6. Documentation & Rollout
- Related docs updated (README, runbooks, API spec, etc.).
- Feature flags, migrations, or rollout steps documented.
- Post-merge follow-ups captured in tracking system.

## Sign-off
- [ ] Review complete, approve PR
- [ ] Additional changes requested
- Notes:

## Revision History
| Date | Author | Summary |
| --- | --- | --- |
| _YYYY-MM-DD_ | _Name_ | _Initial draft_ |
