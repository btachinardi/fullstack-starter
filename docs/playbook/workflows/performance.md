# Performance Engineering Workflow

This workflow ensures features meet performance expectations from design through post-launch monitoring.

## 1. Planning
- Define performance goals (latency, throughput, resource usage) in the PRD and analytics plan.
- Identify critical user journeys and service-level indicators (SLIs).
- Align on tooling, environments, and test data needs.

**Exit criteria:** Performance objectives documented; owners and timelines assigned.

## 2. Design & Architecture
- Evaluate architectural decisions for performance trade-offs; capture outcomes in ADRs/RFCs.
- Consider caching, batching, async processing, and data partitioning strategies.
- Partner with infrastructure to ensure capacity planning and scaling policies.

**Exit criteria:** Design review complete with performance considerations approved.

## 3. Implementation & Instrumentation
- Implement code with profiling hooks and fine-grained telemetry (metrics, tracing).
- Guard against regressions using performance-focused unit/integration tests.
- Document configuration knobs (timeouts, concurrency limits) for tuning.

**Exit criteria:** Code merged with instrumentation, baseline profiling results captured.

## 4. Testing & Optimization
- Execute load, stress, and soak tests using representative workloads.
- Analyze results to identify bottlenecks; iterate on optimizations.
- Update the [Performance checklist](../templates/Performance-checklist.md) with findings and actions.

**Exit criteria:** Performance targets met or variances signed off with mitigation plans.

## 5. Launch & Monitoring
- Establish dashboards tracking SLIs/SLOs, resource utilization, and error budgets.
- Configure alerts with runbooks for threshold breaches.
- Plan staged rollouts or canaries to monitor real-user impact.

**Exit criteria:** Production deployment complete with monitoring stable and on-call prepared.

## 6. Continuous Improvement
- Review performance metrics in retrospectives and incident postmortems.
- Update baselines after major releases; retire temporary instrumentation.
- Share learnings across teams to evolve best practices.
