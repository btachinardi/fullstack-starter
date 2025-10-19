# Security & Privacy Workflow

Apply this workflow when features handle sensitive data, introduce new integrations, or modify authentication/authorization
flows.

## 1. Threat Modeling & Requirements
- Identify data classifications, regulatory obligations, and privacy considerations in the PRD.
- Conduct a lightweight threat model (attack surface, assets, trust boundaries).
- Determine required reviews (security architecture, privacy counsel, compliance).

**Exit criteria:** Risks documented with mitigation strategies; Definition of Ready satisfied.

## 2. Design & Controls
- Capture architectural decisions in an ADR/RFC, highlighting security trade-offs.
- Define authentication, authorization, encryption, and auditing controls.
- Plan logging, anomaly detection, and incident response updates.

**Exit criteria:** Control design approved by security/privacy stakeholders.

## 3. Implementation
- Follow secure coding standards and leverage vetted libraries.
- Implement least-privilege access, secret rotation, and secure configuration defaults.
- Update automated security tests (SAST, DAST, dependency scanning) and infrastructure policies.

**Exit criteria:** Code merged with passing security scans; documentation updated with control mappings.

## 4. Validation & Certification
- Execute manual security testing, penetration tests, or red team exercises as needed.
- Complete the [Security ASVS checklist](../templates/Security-ASVS-checklist.md) and data protection impact assessments.
- Verify privacy notices, consent flows, and data subject rights processes.

**Exit criteria:** Findings resolved or accepted with tracked remediation; go/no-go sign-off granted.

## 5. Launch & Monitoring
- Enable security monitoring dashboards, alerts, and automated incident response hooks.
- Communicate rollout plan to on-call/security operations teams.
- Establish logging retention and audit requirements.

**Exit criteria:** Production release complete with monitoring active and incident runbooks updated.

## 6. Continuous Governance
- Schedule periodic control reviews and access audits.
- Track outstanding security/privacy debt in the risk register.
- Share lessons learned in post-incident reviews and update standards accordingly.
