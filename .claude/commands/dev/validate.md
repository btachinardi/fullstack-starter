---
description: Orchestrate all validation agents to check and systematically fix all project issues until CI passes
allowed-tools: Bash(pnpm *:*), Task, Read
model: claude-sonnet-4-5
---

# /dev:validate

Orchestrate all validation agents to check and systematically fix all project issues until the entire CI pipeline passes.

## Objective

Run comprehensive validation across the entire project and systematically fix all issues by orchestrating specialized validation agents (ci-debugger, lint-debugger, test-debugger) until the project is in a clean, committable state with 100% CI success rate.

## Context & Prerequisites

**Project Context:**
- CI pipeline validates: bootstrap, lint, typecheck, test, build, security
- Specialized agents handle validation systematically:
  - `ci-debugger`: Full CI orchestration (recommended)
  - `lint-debugger`: Linting and type-checking fixes
  - `test-debugger`: Test failure debugging and fixes
- Command: `pnpm ci:local` simulates complete CI pipeline locally
- Project may be monorepo or single-project setup

**Specialized Validation Agents:**
- **ci-debugger**: Runs full CI pipeline, delegates to lint/test agents as needed, handles bootstrap/build/security
- **lint-debugger**: Fixes linting errors and type-checking failures
- **test-debugger**: Debugs and fixes test failures systematically

**Prerequisites:**
- Git repository initialized
- `pnpm-lock.yaml` exists (will be created if missing)
- Validation agent definitions exist in `.claude/agents/validation/`
- Node.js and pnpm installed

## Instructions

### Phase 1: Initial Assessment

**Objective:** Run quick checks to identify which validation areas have issues

**Steps:**

1. **Quick Status Check**

   Run a fast assessment of project health:
   ```bash
   pnpm ci:local
   ```

   If `pnpm-lock.yaml` is missing:
   - Run `pnpm install` first to bootstrap dependencies
   - Then run `pnpm ci:local`

2. **Parse CI Results**

   Analyze the output to identify which jobs are failing:
   - Setup / Bootstrap: Dependency resolution issues
   - Lint: Code style violations (ESLint, Prettier)
   - Type Check: TypeScript compilation errors
   - Test: Unit, integration, or e2e test failures
   - Build: Compilation or bundling failures
   - Security: Secret leaks (Gitleaks) or vulnerabilities (SBOM)

3. **Count Total Issues**

   For each failing job type, count:
   - Total errors in lint job
   - Total type-checking errors
   - Total test failures
   - Build failures (yes/no)
   - Security issues found

4. **Present Assessment to User**

   Show summary:
   ```
   Validation Assessment:
   - Bootstrap: [PASS/FAIL] - [Details]
   - Linting: [X errors found]
   - Type Checking: [Y errors found]
   - Tests: [Z failures found]
   - Build: [PASS/FAIL/SKIPPED]
   - Security: [PASS/FAIL/SKIPPED]

   Recommended approach: [Full CI / Individual Agents]
   ```

5. **Determine Strategy**

   Choose validation approach:
   - **Default (Recommended)**: Use ci-debugger for comprehensive CI pipeline validation
   - **Alternative**: Use individual agents for faster iteration during development

   Present both options to user if there are multiple failure types.

**Validation:**
- [ ] Initial CI run completed
- [ ] All failing jobs identified
- [ ] Error counts captured
- [ ] Strategy determined
- [ ] User informed of scope

---

### Phase 2: Execute Validation Strategy

**Objective:** Orchestrate validation agents to fix all issues systematically

**IMPORTANT:** Choose ONE of the following approaches based on Phase 1 assessment.

---

#### **Option A: Full CI Validation (RECOMMENDED)**

**When to use:**
- Before pushing to GitHub
- Before creating a PR
- When ensuring complete CI pipeline health
- When multiple job types are failing
- Default for comprehensive validation

**Steps:**

1. **Invoke ci-debugger Agent**

   Use the Task tool to delegate complete CI validation:
   ```
   Task(
     subagent_type="ci-debugger",
     description="Run complete CI pipeline validation and fix all failures",
     prompt="Execute full local CI pipeline using `pnpm ci:local`. Identify all failing jobs (bootstrap, lint, typecheck, test, build, security) and systematically fix them until 100% CI success rate is achieved. Delegate to lint-debugger for extensive lint/type issues and test-debugger for test failures as appropriate."
   )
   ```

2. **Wait for ci-debugger Completion**

   The ci-debugger will:
   - Run complete CI pipeline
   - Fix bootstrap issues first (dependencies)
   - Fix type-checking errors (may delegate to lint-debugger)
   - Fix linting issues (may delegate to lint-debugger)
   - Fix test failures (may delegate to test-debugger)
   - Fix build issues
   - Handle security issues
   - Iterate until all jobs pass

3. **Review ci-debugger Results**

   The agent will return:
   - Complete CI job status (all should be PASS)
   - Summary of all fixes applied
   - Files modified by category
   - Delegation summary (which agents were invoked)
   - Final validation confirmation

4. **Proceed to Phase 3**

   Once ci-debugger reports 100% CI success, move to final validation.

**Delegation Summary:**
- ci-debugger handles complete orchestration
- Automatically delegates to lint-debugger when: >50 lint errors OR >20 type errors
- Automatically delegates to test-debugger when: >10 test failures
- Handles bootstrap, build, and security issues directly

---

#### **Option B: Individual Agent Validation (FASTER ITERATION)**

**When to use:**
- During active development
- When only specific job types are failing
- For faster iteration cycles
- When you know exactly which area needs fixing

**Steps:**

1. **Fix Linting and Type-Checking First** (if failing)

   If lint or typecheck jobs failed in Phase 1:
   ```
   Task(
     subagent_type="lint-debugger",
     description="Fix all linting and type-checking errors",
     prompt="Run all linting and type-checking tools (ESLint, Prettier, TypeScript). Fix all errors systematically until zero errors remain. Start with auto-fixes, then manually fix remaining issues."
   )
   ```

   Wait for lint-debugger to complete and report zero errors.

2. **Fix Test Failures** (if tests failed)

   If test job failed in Phase 1:
   ```
   Task(
     subagent_type="test-debugger",
     description="Fix all failing tests",
     prompt="Run all project tests, identify failures, and systematically fix them one at a time until 100% test pass rate is achieved. Debug root causes and apply minimal fixes."
   )
   ```

   Wait for test-debugger to complete and report 100% pass rate.

3. **Validate Build** (if not yet validated)

   Run build manually to ensure compilation succeeds:
   ```bash
   pnpm build
   ```

   If build fails:
   - Check error messages for missing imports or configuration issues
   - Fix build configuration or missing dependencies
   - Re-run build until successful

4. **Handle Security Issues** (if present)

   If security jobs failed:
   - Review Gitleaks output for exposed secrets
   - Remove secrets or add to `.gitleaksignore` if false positives
   - Update vulnerable dependencies: `pnpm update [package]`
   - Rotate any compromised credentials

5. **Proceed to Phase 3**

   Once all individual agents report success, move to final validation.

**Delegation Summary:**
- lint-debugger fixes linting and type-checking
- test-debugger fixes test failures
- Manual intervention for build and security (no specialized agents)
- Faster for targeted fixes during development

---

**Validation:**
- [ ] Appropriate validation strategy executed
- [ ] All delegated agents completed successfully
- [ ] Fixes applied systematically
- [ ] Progress tracked and reported
- [ ] Ready for final validation

---

### Phase 3: Final Validation

**Objective:** Confirm entire CI pipeline passes and provide comprehensive summary

**Steps:**

1. **Run Complete CI Pipeline**

   Execute final validation to confirm all jobs pass:
   ```bash
   pnpm ci:local
   ```

   This runs all jobs in sequence:
   - Setup / Bootstrap Check
   - Lint
   - Type Check
   - Test
   - Build
   - Security / Gitleaks (if installed)
   - Security / SBOM (if installed)

2. **Verify 100% Success Rate**

   Check that ALL jobs pass:
   - ✅ Setup / Bootstrap: PASSED
   - ✅ Lint: PASSED (0 errors, 0 warnings)
   - ✅ Type Check: PASSED (0 TypeScript errors)
   - ✅ Test: PASSED (100% test pass rate)
   - ✅ Build: PASSED (all packages built successfully)
   - ✅ Security / Gitleaks: PASSED or SKIPPED
   - ✅ Security / SBOM: PASSED or SKIPPED

3. **Compile Summary of Changes**

   If using ci-debugger (Option A):
   - Use summary from ci-debugger output
   - Include delegation details

   If using individual agents (Option B):
   - Compile summaries from lint-debugger and test-debugger
   - Add build and security fixes performed manually

4. **Present Final Report**

   Show comprehensive summary (see Output Format below)

5. **Suggest Next Steps**

   Based on project state:
   - If validation was invoked before commit: Suggest `/git:commit`
   - If validation was for PR readiness: Confirm ready to push
   - If validation was for CI debugging: Confirm CI will pass in GitHub Actions

**Validation:**
- [ ] Final CI run executed
- [ ] All jobs passing (100% success)
- [ ] No errors or warnings in any job
- [ ] Summary compiled from all agents
- [ ] Next steps communicated
- [ ] Code ready for commit/push

---

## Output Format

### Phase 1: Assessment

```
Validation Assessment Complete

Running initial CI check...
[CI output showing job results]

Summary:
- Bootstrap: [✅ PASS / ❌ FAIL - details]
- Linting: [X errors found]
- Type Checking: [Y errors found]
- Tests: [Z failures / All passing]
- Build: [✅ PASS / ❌ FAIL / ⏭️ SKIPPED]
- Security: [✅ PASS / ❌ FAIL / ⏭️ SKIPPED]

Total issues to fix: [N]

Recommended approach:
[Full CI Validation (Option A) / Individual Agents (Option B)]

Proceeding with [chosen approach]...
```

### Phase 2: Validation Execution

**Option A Output:**
```
Invoking ci-debugger agent for comprehensive CI validation...

[ci-debugger progress updates]
- Running full CI pipeline...
- Identified [X] failing jobs
- Fixing bootstrap issues... ✅
- Delegating type-check fixes to lint-debugger... ✅
- Delegating test fixes to test-debugger... ✅
- Fixing build issues... ✅
- All CI jobs now passing

ci-debugger Summary:
- Fixed [X] issues across [Y] categories
- Delegated to lint-debugger: [Yes/No]
- Delegated to test-debugger: [Yes/No]
- All CI jobs: 100% passing
```

**Option B Output:**
```
Invoking individual validation agents...

Step 1: Fixing linting and type-checking
[lint-debugger progress updates]
✅ lint-debugger complete: Fixed [X] errors

Step 2: Fixing test failures
[test-debugger progress updates]
✅ test-debugger complete: Fixed [Y] test failures

Step 3: Validating build
Running: pnpm build
✅ Build successful

Step 4: Security validation
✅ No security issues detected

Individual agents complete: All validation passing
```

### Phase 3: Final Report

```
✅ Validation Complete - Project Ready for Commit

Final CI Pipeline Results:
┌─────────────────────────┬──────────┬─────────────┐
│ Job                     │ Status   │ Details     │
├─────────────────────────┼──────────┼─────────────┤
│ Setup / Bootstrap       │ ✅ PASS  │ 0 errors    │
│ Lint                    │ ✅ PASS  │ 0 errors    │
│ Type Check              │ ✅ PASS  │ 0 errors    │
│ Test                    │ ✅ PASS  │ [N] tests   │
│ Build                   │ ✅ PASS  │ All pkgs    │
│ Security / Gitleaks     │ ✅ PASS  │ No secrets  │
│ Security / SBOM         │ ⏭️ SKIP  │ Not setup   │
└─────────────────────────┴──────────┴─────────────┘

Summary of Fixes:
- Linting: Fixed [X] errors across [Y] files
- Type Checking: Fixed [Z] type errors across [A] files
- Tests: Fixed [B] test failures across [C] test suites
- Build: [Details if any fixes needed]
- Security: [Details if any fixes needed]

Files Modified:
[Categorized list of all files changed during validation]

Validation Approach Used: [Option A: Full CI / Option B: Individual Agents]

Agent Delegation:
- ci-debugger: [Invoked/Not invoked]
- lint-debugger: [Invoked/Not invoked] - [Reason]
- test-debugger: [Invoked/Not invoked] - [Reason]

CI Readiness:
✅ All quality gates passing
✅ Code ready to commit
✅ CI will pass in GitHub Actions
✅ Project in clean, committable state

Next Steps:
1. Review changes: git status
2. Commit fixes: /git:commit
3. Push to GitHub: git push
4. Verify CI passes in GitHub Actions

Your project is now validated and ready! 🚀
```

---

## Quality Standards

### Orchestration Quality
- Appropriate validation strategy selected based on assessment
- Correct agents delegated for each failure type
- All delegated agents complete successfully
- Progress tracked and reported throughout
- User informed at key decision points

### Validation Completeness
- All CI jobs pass with exit code 0
- Bootstrap: Dependencies resolved
- Lint: 0 errors, 0 warnings
- Type Check: 0 TypeScript errors
- Test: 100% pass rate
- Build: All packages built successfully
- Security: No issues detected (or gracefully skipped if tools missing)

### Fix Quality
- Fixes are minimal and targeted (delegated agents ensure this)
- Code follows project conventions
- Functionality preserved during fixes
- No regressions introduced
- Build artifacts are functional

### Communication Quality
- Clear progress updates during validation
- Assessment summary before fixing
- Delegation transparency (which agents used)
- Comprehensive final report
- Actionable next steps

---

## Constraints & Boundaries

### Must Do
- Run initial CI assessment before fixing
- Choose appropriate validation strategy (default to ci-debugger)
- Delegate to specialized agents for their domains
- Re-run complete CI pipeline for final validation
- Provide comprehensive summary with all fixes
- Suggest `/git:commit` after successful validation

### Must Not Do
- Skip initial assessment (need to know what's broken)
- Attempt to fix issues directly (delegate to agents)
- Proceed if agents fail without reporting to user
- Skip final CI validation (must confirm 100% success)
- Disable quality checks or skip tests to "pass"
- Make configuration changes without agent approval

### Scope Management

**In Scope:**
- Orchestrating validation workflow
- Running initial CI assessment
- Invoking appropriate validation agents
- Tracking progress across agents
- Compiling final report from all agents
- Suggesting next steps

**Out of Scope:**
- Fixing issues directly (delegate to ci-debugger, lint-debugger, test-debugger)
- Analyzing specific error messages (agents handle this)
- Determining fix strategies (agents decide)
- Making architectural decisions (agents escalate to user)
- Committing changes (suggest `/git:commit` instead)
- Pushing to remote (user decision)

---

## Examples

### Example 1: Full CI Validation Before Commit

**User:** `/dev:validate`

**Phase 1: Assessment**
```
Running validation assessment...

CI Results:
- Bootstrap: ✅ PASS
- Linting: ❌ 47 errors found
- Type Checking: ❌ 23 errors found
- Tests: ❌ 5 failures found
- Build: ⏭️ SKIPPED (type check failed)
- Security: ✅ PASS

Total issues: 75

Recommended approach: Full CI Validation (ci-debugger)
Proceeding with ci-debugger...
```

**Phase 2: Validation**
```
Invoking ci-debugger agent...

ci-debugger: Running full CI pipeline
ci-debugger: Fixing type-check errors (delegating to lint-debugger)...
ci-debugger: Fixing lint errors (delegating to lint-debugger)...
ci-debugger: Fixing test failures (delegating to test-debugger)...
ci-debugger: Running build... ✅
ci-debugger: All CI jobs passing

ci-debugger complete:
- Fixed 70 lint/type errors via lint-debugger
- Fixed 5 test failures via test-debugger
- Build now successful
```

**Phase 3: Final Report**
```
✅ Validation Complete

All CI Jobs: ✅ PASSING (100% success)

Summary:
- Fixed 47 linting errors
- Fixed 23 type errors
- Fixed 5 test failures
- Build successful

Files Modified: 18 files across packages

Next Steps:
1. Review changes: git status
2. Commit fixes: /git:commit
3. Ready to push!
```

---

### Example 2: Fast Iteration with Individual Agents

**User:** `/dev:validate`

**Phase 1: Assessment**
```
Running validation assessment...

CI Results:
- Bootstrap: ✅ PASS
- Linting: ❌ 12 errors (minor issues)
- Type Checking: ✅ PASS
- Tests: ✅ PASS
- Build: ✅ PASS
- Security: ✅ PASS

Total issues: 12 lint errors

Recommended approach: Individual Agents (faster for targeted fix)
Options:
  A) Full CI validation (comprehensive)
  B) Individual agents (faster - just lint-debugger needed)

Proceeding with Option B (Individual Agents)...
```

**Phase 2: Validation**
```
Invoking lint-debugger for targeted fix...

lint-debugger: Running ESLint...
lint-debugger: Auto-fixing 8 errors...
lint-debugger: Manually fixing 4 errors...
lint-debugger: All linting tools passing ✅

lint-debugger complete: Fixed 12 errors across 4 files
```

**Phase 3: Final Report**
```
✅ Validation Complete

All CI Jobs: ✅ PASSING (100% success)

Summary:
- Fixed 12 linting errors via lint-debugger
- All other jobs already passing

Files Modified: 4 files

Next Steps:
- Code ready to commit: /git:commit
```

---

### Example 3: Everything Already Passing

**User:** `/dev:validate`

**Phase 1: Assessment**
```
Running validation assessment...

CI Results:
- Bootstrap: ✅ PASS
- Linting: ✅ PASS (0 errors)
- Type Checking: ✅ PASS (0 errors)
- Tests: ✅ PASS (247 tests)
- Build: ✅ PASS
- Security: ✅ PASS

Total issues: 0

✅ All validation checks passing!

No fixes needed - project is already in a clean state.
```

**Early Exit - No Phase 2 or Phase 3 needed**
```
✅ Validation Complete

Your project is already validated and ready!

All CI Jobs: ✅ PASSING (100% success)
- Bootstrap: ✅ Dependencies resolved
- Lint: ✅ 0 errors
- Type Check: ✅ 0 errors
- Test: ✅ 247 tests passing
- Build: ✅ All packages built
- Security: ✅ No issues

No changes made (everything already passing).

Next Steps:
- Ready to commit new changes: /git:commit
- Ready to push: git push
- CI will pass in GitHub Actions ✅
```

---

## Related Commands

- **`/git:commit`**: Commit validated changes after running this command
- **`/format`**: Quick code formatting (subset of validation)
- **`/test`**: Run tests only (use test-debugger agent for fixes)

---

## Integration with Workflow

**Typical Usage Pattern:**

1. **During Development:**
   ```
   [Make changes]
   /dev:validate  (quick check, use Option B for speed)
   /git:commit
   git push
   ```

2. **Before PR:**
   ```
   /dev:validate  (full CI validation, use Option A)
   /git:commit
   git push
   [Create PR - CI will pass]
   ```

3. **CI Debugging:**
   ```
   [CI fails in GitHub Actions]
   /dev:validate  (use Option A to simulate full CI)
   [Fix all issues locally]
   /git:commit
   git push
   [CI now passes in GitHub Actions]
   ```

**Pre-Commit Hook Integration:**
This command can be integrated as a pre-commit validation step to ensure all commits meet quality standards.

---

**Command Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Platform Engineering
