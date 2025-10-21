# Security Policy

## Known Vulnerabilities

### Moderate: validator.js URL Validation Bypass (CVE-2025-56200)

**Status**: Accepted Risk
**Severity**: Moderate (CVSS 6.1)
**Package**: `validator@13.15.15` (transitive dependency via `class-validator@0.14.2`)
**Advisory**: https://github.com/advisories/GHSA-9965-vmph-33xx

**Details**:
- The `isURL()` function in validator.js has a protocol parsing discrepancy that could lead to XSS/Open Redirect attacks
- **No patched version exists** as of 2025-10-21
- This is a transitive dependency through NestJS's `class-validator`

**Mitigation**:
- ✅ We do **not use** the vulnerable `isURL()` function in our codebase
- ✅ We only use basic validators: `IsString`, `IsNotEmpty`, `IsOptional`
- ✅ URL validation, if needed, should be implemented with additional server-side checks
- ✅ Monitoring for updates to `validator.js` package

**Action Items**:
- [ ] Monitor https://github.com/validatorjs/validator.js for patches
- [ ] Update `class-validator` when a version with patched `validator` is released
- [ ] If URL validation is added to the API, implement additional validation beyond `isURL()`

## Security Auditing

Our CI pipeline runs security audits with the following configuration:

- **Local CI** (`pnpm ci:local`): Fails only on **high/critical** vulnerabilities
- **GitHub Actions CI**: May fail on moderate+ vulnerabilities (adjust as needed)

To manually check for all vulnerabilities:
```bash
pnpm audit --production
```

To check only high/critical:
```bash
pnpm audit --production --audit-level=high
```

## Reporting Security Issues

If you discover a security vulnerability, please email [security contact] or open a private security advisory on GitHub.

Do not open public issues for security vulnerabilities.
