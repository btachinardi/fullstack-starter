# API Delivery Workflow

This workflow guides teams building or evolving APIs, ensuring contract stability, documentation quality, and operational
readiness.

## 1. Design & Review
- Document requirements in the [PRD](../templates/PRD.md) and outline endpoints using the
  [OpenAPI template](../templates/API-spec-openapi.yaml).
- Run an architecture review to validate authentication, authorization, and data exposure.
- Coordinate with consumers (internal/external) to gather feedback on proposed contracts.

**Exit criteria:** Draft OpenAPI spec approved, dependencies identified, Definition of Ready satisfied.

## 2. Implementation
- Develop endpoints behind feature flags using contract-first development.
- Maintain backward compatibility; version APIs when breaking changes are unavoidable.
- Add unit, integration, and contract tests (e.g., Pact) to CI.

**Exit criteria:** Code merged with passing tests, updated documentation, and new endpoints deployed to staging.

## 3. Validation & Hardening
- Execute the [API test plan](../templates/Test-plan.md) focusing on schema validation and error handling.
- Run load tests to confirm latency and throughput targets; consult the [Performance checklist](../templates/Performance-checklist.md).
- Complete security reviews with the [ASVS checklist](../templates/Security-ASVS-checklist.md) and validate rate limiting.

**Exit criteria:** Definition of Done met, staging smoke tests pass, and release plan finalized.

## 4. Release & Communication
- Publish updated API documentation/portal entries with change logs.
- Notify consumers of rollout timelines, deprecation schedules, and migration guides.
- Monitor key metrics (error rate, p95 latency) with alert thresholds.

**Exit criteria:** Production rollout complete, telemetry stable, and consumer feedback addressed.

## 5. Post-Launch Stewardship
- Track adoption, monitor feature flags, and sunset legacy versions.
- Capture lessons learned in retrospectives or ADR updates.
- Keep schema registry and sample clients in sync with the live API.
