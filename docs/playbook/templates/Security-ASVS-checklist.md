# Security ASVS Checklist

- **Feature / Service:** _Name_
- **Reviewer:** _Security champion_
- **Date:** _YYYY-MM-DD_

## Authentication & Session Management
- [ ] Uses centralized auth mechanisms (SSO, OAuth, JWT) correctly.
- [ ] Session timeouts and refresh policies align with requirements.
- [ ] Passwords or secrets never logged or stored in plaintext.

## Access Control
- [ ] Role/permission checks enforced server-side.
- [ ] Multi-tenant boundaries validated (no cross-tenant data leaks).
- [ ] Horizontal/vertical privilege escalation tests performed.

## Input Validation & Output Encoding
- [ ] Validate and sanitize all external inputs.
- [ ] Prevent injection (SQL, NoSQL, command) via parameterization.
- [ ] Encode output for context (HTML, JSON, logs).

## Data Protection
- [ ] Sensitive data encrypted in transit (TLS 1.2+) and at rest.
- [ ] Data retention and deletion policies applied.
- [ ] Secrets stored in managed vault/key store.

## Logging & Monitoring
- [ ] Security events logged with correlation IDs.
- [ ] Alerting configured for suspicious activity.
- [ ] Logs protected from tampering and meet privacy policies.

## Dependency & Platform Security
- [ ] Third-party libraries scanned for vulnerabilities.
- [ ] Containers/VMs hardened (minimal base images, patched OS).
- [ ] Infrastructure as code reviewed for misconfigurations.

## Incident Response Preparedness
- [ ] Runbook updated with security considerations.
- [ ] Contact info for incident response documented.
- [ ] Backups/restores tested for critical data.

## Sign-off
- [ ] Security review complete
- Notes / Exceptions:

## Revision History
| Date | Author | Summary |
| --- | --- | --- |
| _YYYY-MM-DD_ | _Name_ | _Initial draft_ |
