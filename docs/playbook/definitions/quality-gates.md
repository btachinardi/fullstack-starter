# Quality Gates

Quality gates ensure every code change and release passes objective standards before reaching customers. They combine
automated checks with human review to create reliable guardrails across the delivery pipeline.

## Continuous Integration Gates

1. **Static analysis:** Linting, formatting, and type checks run automatically for every change. Failures block merges until
   resolved.
2. **Unit & integration tests:** Critical paths require high coverage; pipelines must pass on main branches before deploys.
3. **Security scanning:** Dependency vulnerability scans (SCA), secret detection, and static application security testing
   (SAST) execute on each merge request.
4. **Build verification:** Containers or packages must build successfully with reproducible versions.

## Pre-Deployment Gates

- **Code review:** At least two reviewers with relevant domain expertise approve changes. Use the
  [Code Review Checklist](../templates/Code-review-checklist.md) to enforce consistency.
- **Test environment validation:** Staging smoke tests, contract tests, and exploratory sessions confirm functionality.
- **Performance baseline:** Run targeted performance tests (load, stress, or profiling) when SLIs/SLOs are affected.
- **Security sign-off:** For sensitive features, complete the [Security ASVS checklist](../templates/Security-ASVS-checklist.md)
  and threat modeling updates.

## Release Gates

1. **Change management:** Release notes drafted, stakeholders notified, and on-call aware of the deployment window.
2. **Operational readiness:** Monitoring dashboards and alert thresholds reviewed; runbooks updated.
3. **Compliance checks:** Privacy/Data Protection Impact Assessments (DPIA) complete where applicable; audit logs enabled.
4. **Rollback plan:** Automated rollback or blue/green procedures rehearsed, with verification in staging.

## Measuring Gate Effectiveness

- Track gate failure rates and mean time to resolution; adjust processes when bottlenecks appear.
- Instrument gates with analytics (pipeline duration, flake rate) to justify investments in tooling.
- Pair retrospective insights with gate revisions to maintain high signal-to-noise ratios.

## Exceptions and Escalations

- Document gate bypasses in the release ticket with owner, justification, and remediation timeline.
- Require director-level approval for bypassing security or compliance gates.
- After any exception, schedule a post-incident review to prevent repeated occurrences.
