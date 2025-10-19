# Coding Standards

Coding standards promote readability, maintainability, and security across the codebase. This guide summarizes shared
principles and points to language- or framework-specific conventions maintained in the repository.

## Core Principles

1. **Clarity over cleverness:** Prefer explicit, descriptive code. Optimize for the next engineer reading it.
2. **Consistency first:** Follow established project patterns—naming, file layout, error handling—before introducing new ones.
3. **Fail safely:** Validate inputs, handle error conditions, and avoid leaking sensitive data in logs or responses.
4. **Automate enforcement:** Use linters, formatters, and type checkers in CI to catch deviations early.
5. **Document intent:** Augment complex logic with comments that explain _why_ a decision was made, referencing ADRs or RFCs.

## Language & Framework Guides

- **Frontend (React/TypeScript):** Adopt strict TypeScript typing, hooks best practices, and accessibility rules. See
  `docs/frontend/style-guide.md` (create if missing) for granular conventions.
- **Backend (Node/Express or Nest):** Align with 12-factor app principles, dependency injection patterns, and structured
  logging.
- **Database & migrations:** Write idempotent migrations, include rollback steps, and review with the
  [DB migration checklist](../templates/DB-migration-checklist.md).
- **Testing:** Organize tests mirroring source structure. Use deterministic data builders and avoid flaky asynchronous waits.

## Secure Coding Expectations

- Sanitize user input and enforce output encoding for any rendered HTML.
- Store secrets in environment management tooling; never commit them to Git.
- Use prepared statements/ORM protections against SQL injection.
- Implement role-based access checks server-side, even if gated in the UI.
- Update third-party dependencies promptly when security advisories are published.

## Review & Evolution

- Reevaluate standards quarterly or when introducing major frameworks.
- Capture decisions about deviations in an [ADR](../templates/ADR.md) and reference them inline.
- Encourage knowledge sharing via brown bags or pairing sessions to socialize updates.
- Link coding standard updates from the [feature workflow overview](../workflows/feature-overview.md) so teams see downstream
  impacts.
