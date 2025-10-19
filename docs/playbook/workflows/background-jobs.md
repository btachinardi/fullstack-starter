# Background Jobs Workflow

Use this workflow for asynchronous workers, scheduled tasks, or queue-driven processes to ensure reliability and
observability.

## 1. Planning & Design
- Document job purpose, SLAs, and failure impact in the [PRD](../templates/PRD.md) or technical brief.
- Choose execution model (cron, event-driven, streaming) and assess infrastructure requirements.
- Define retry, dead-letter, and idempotency strategies.

**Exit criteria:** Architecture approved, dependencies mapped, Definition of Ready complete.

## 2. Implementation
- Implement jobs with idempotent handlers and structured logging.
- Guard against duplicate processing and race conditions.
- Add unit and integration tests using representative queue fixtures.

**Exit criteria:** Code merged to `main`, tests passing, feature flags/controls in place.

## 3. Validation & Load Testing
- Simulate peak workloads using staging or performance environments.
- Validate retry/backoff behavior and monitor queue depth, processing time, and error rates.
- Execute failure drills (e.g., downstream outages) to confirm graceful degradation.

**Exit criteria:** Performance checklist completed, runbooks drafted, and alerts configured.

## 4. Deployment & Monitoring
- Deploy jobs with blue/green or canary strategies when possible.
- Monitor key metrics (throughput, latency, DLQ size) via dashboards and alerts.
- Ensure on-call engineers have runbooks and escalation paths.

**Exit criteria:** Production deployment stable for agreed burn-in period with no critical issues.

## 5. Operations & Maintenance
- Schedule periodic reviews of job metrics, queue sizing, and resource usage.
- Clean up temporary logging, feature flags, or catch-up scripts post-launch.
- Log post-incident analyses and feed improvements into coding standards or infrastructure docs.
