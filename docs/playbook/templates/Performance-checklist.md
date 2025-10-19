# Performance Readiness Checklist

- **Feature / Service:** _Name_
- **Reviewer:** _Performance owner_
- **Date:** _YYYY-MM-DD_

## Baselines & Goals
- Current performance metrics (latency, throughput, resource usage).
- Target SLO/SLI adjustments or guardrails.

## Profiling & Testing
- [ ] Profiling performed (CPU, memory, network) with findings documented.
- [ ] Load/stress tests executed; include peak and sustained load scenarios.
- [ ] Results compared against baselines and SLOs.
- [ ] Resource utilization monitored (container limits, DB connections).

## Optimization Actions
- [ ] Identified bottlenecks addressed (queries, caching, batching).
- [ ] Third-party calls evaluated for latency and retries.
- [ ] Asynchronous processing leveraged where appropriate.
- [ ] Graceful degradation strategies defined.

## Deployment Considerations
- [ ] Capacity planning completed (autoscaling, queue sizing).
- [ ] Feature flag or canary rollout plan captured.
- [ ] Monitoring dashboards updated with relevant metrics.
- [ ] Alerts tuned to avoid noise while catching regressions.

## Post-Launch Plan
- [ ] Establish post-release review window and responsible owner.
- [ ] Capture metrics daily during ramp-up.
- [ ] Document cleanup tasks (temporary logging, profiling hooks).

## Revision History
| Date | Author | Summary |
| --- | --- | --- |
| _YYYY-MM-DD_ | _Name_ | _Initial draft_ |
