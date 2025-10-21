# Test Runner Agent PRD

**Status:** Example
**Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Agent Platform Team
**Implementation:**
- Main Agent: `/test:run`
- Sub-Agents: `test-finder`, `test-executor`, `report-generator`

---

## Executive Summary

The Test Runner Agent provides an intelligent interface for running tests across a codebase. It automatically discovers relevant tests based on changed files, executes them efficiently, and generates comprehensive reports with actionable insights.

This agent provides value by eliminating the guesswork of which tests to run after making changes, running tests in parallel for performance, and presenting results in a clear, actionable format. Users can simply request "run tests for my changes" and trust the system to do the right thing.

---

## Problem Statement

**Current Pain Points:**
- Developers manually determine which tests to run after code changes
- Running all tests is slow; running selective tests risks missing related failures
- Test output is verbose and hard to parse for actionable insights
- No standard way to run tests across different test frameworks (Jest, Vitest, Playwright)

**Why Orchestration is Needed:**
- Test discovery requires understanding import graphs and test patterns
- Parallel execution across test suites improves performance 10x
- Report generation requires aggregating results from multiple test runners
- Different test types (unit, integration, e2e) require different strategies

---

## Goals & Non-Goals

### Goals
1. Automatically discover relevant tests based on changed files (90%+ accuracy)
2. Execute tests in parallel when possible (10x faster than sequential)
3. Generate clear, actionable reports highlighting failures and warnings
4. Support multiple test frameworks (Jest, Vitest, Playwright) with unified interface
5. Complete test runs in <30 seconds for typical changes (5-10 files)

### Non-Goals
- Writing new tests (covered by `test-generator` agent)
- Fixing failing tests (user responsibility or separate `test-fixer` agent)
- Performance profiling of tests (covered by `perf-analyzer` agent)
- CI/CD integration (handled by build pipeline, not this agent)

---

## Task Decomposition

### Phase 1: Test Discovery

**Purpose:** Identify all tests relevant to the current changes based on file analysis and import graphs.

**Inputs:**
- Changed files (from git diff or user-specified paths)
- Test framework configuration (detected from package.json)
- Codebase structure (src/, tests/, __tests__/ patterns)

**Process:**
1. Analyze changed files to extract imported modules
2. Search for test files that directly test changed files
3. Build reverse dependency graph to find tests of consumers
4. Categorize tests by type (unit, integration, e2e)
5. Estimate execution time for each test suite

**Sub-Agent(s):**
- `test-finder`: Comprehensive test discovery agent
  - Tools: Read, Grep, Glob, Bash
  - Model: Sonnet 4.5 (complex import graph reasoning)
  - Output: JSON with categorized test files

**Outputs:**
```json
{
  "test_suites": [
    {
      "type": "unit",
      "framework": "vitest",
      "files": [
        "tests/core/auth.test.ts",
        "tests/utils/validation.test.ts"
      ],
      "estimated_time_ms": 2000,
      "reasoning": "Direct tests for changed files in src/core/auth.ts and src/utils/validation.ts"
    },
    {
      "type": "integration",
      "framework": "jest",
      "files": [
        "tests/integration/api.test.ts"
      ],
      "estimated_time_ms": 5000,
      "reasoning": "Integration tests import auth module"
    }
  ],
  "total_tests": 247,
  "estimated_total_time_ms": 7000
}
```

**Success Criteria:**
- All directly related tests found (100% recall)
- No irrelevant tests included (>90% precision)
- Test categorization is accurate

**Failure Handling:**
- If no tests found → warn user, ask if they want to run all tests
- If too many tests found (>500) → ask user to narrow scope

---

### Phase 2: Test Execution

**Purpose:** Execute all discovered tests in parallel groups, capturing output and exit codes.

**Inputs:**
- Test suites from Phase 1 (JSON)
- Test framework configurations
- Environment variables (from .env.test)

**Process:**
1. Group tests by framework for parallel execution
2. Prepare test environment (env vars, database, etc.)
3. Execute each test suite in parallel
4. Capture stdout, stderr, exit codes for each suite
5. Monitor for timeouts (kill tests that exceed threshold)

**Sub-Agent(s):**
- `test-executor`: Test execution specialist
  - Tools: Bash (to run test commands)
  - Model: Haiku 4.5 (fast, simple execution logic)
  - Parallel Invocation: YES (one per test framework)
  - Output: Execution results JSON

**Outputs:**
```json
{
  "executions": [
    {
      "suite_id": "unit-vitest",
      "status": "success",
      "exit_code": 0,
      "duration_ms": 1850,
      "tests_run": 245,
      "tests_passed": 245,
      "tests_failed": 0,
      "stdout": "...",
      "stderr": ""
    },
    {
      "suite_id": "integration-jest",
      "status": "failure",
      "exit_code": 1,
      "duration_ms": 4200,
      "tests_run": 12,
      "tests_passed": 10,
      "tests_failed": 2,
      "failures": [
        {
          "test": "API authentication flow",
          "file": "tests/integration/api.test.ts:45",
          "error": "Expected 200, received 401",
          "stack": "..."
        }
      ],
      "stdout": "...",
      "stderr": "..."
    }
  ],
  "total_duration_ms": 4200,
  "overall_status": "failure"
}
```

**Success Criteria:**
- All test suites executed (no crashes)
- Exit codes captured correctly
- Failures parsed with file/line information

**Failure Handling:**
- If test runner crashes → capture error, report to user
- If timeout exceeded → kill process, report timeout
- If all tests fail → check environment setup, suggest fixes

---

### Phase 3: Report Generation

**Purpose:** Aggregate results from all test executions and generate a clear, actionable report.

**Inputs:**
- Execution results from Phase 2 (JSON)
- Original changed files
- Test discovery reasoning

**Process:**
1. Parse test outputs to extract failures, warnings, coverage
2. Group failures by type (assertion, timeout, error)
3. Link failures back to changed files
4. Generate summary statistics
5. Create actionable recommendations

**Sub-Agent(s):**
- `report-generator`: Report formatting specialist
  - Tools: Read (to read test files for context)
  - Model: Haiku 4.5 (fast formatting)
  - Output: Formatted markdown report

**Outputs:**
```markdown
# Test Results

## Summary
- **Status:** ❌ FAILED
- **Duration:** 4.2s
- **Tests Run:** 257
- **Passed:** 255 ✅
- **Failed:** 2 ❌

## Failures

### 1. API authentication flow
**File:** `tests/integration/api.test.ts:45`
**Error:** Expected 200, received 401

**Related Changes:**
- `src/core/auth.ts:67` - Modified authentication logic

**Suggestion:** Check that the new auth logic returns correct status codes

---

### 2. Token validation
**File:** `tests/integration/api.test.ts:78`
**Error:** Token validation failed

**Related Changes:**
- `src/core/auth.ts:89` - Updated token validation

**Suggestion:** Verify token format matches expected schema

---

## Performance
- Unit tests: 1.9s (245 tests)
- Integration tests: 4.2s (12 tests)

## Next Steps
1. Fix failing authentication tests
2. Re-run: `/test:run --only-failed`
```

**Success Criteria:**
- Report is clear and actionable
- Failures linked to relevant changed files
- Suggestions are helpful

**Failure Handling:**
- If report generation fails → return raw test output

---

## Sub-Agent Design

### Sub-Agent: test-finder

**Type:** Analysis

**Purpose:** Discover all tests relevant to changed files by analyzing import graphs and test patterns.

**Tools:** Read, Grep, Glob, Bash
**Rationale:** Needs to read package.json, search for test files (Grep), find patterns (Glob), and potentially run test framework introspection commands (Bash). No write operations needed.

**Model:** Sonnet 4.5
**Rationale:** Complex reasoning required for import graph analysis and relevance determination.

**Auto-Commit:** false
**Rationale:** Analysis agent, makes no file changes.

**Input Schema:**
```json
{
  "changed_files": ["src/core/auth.ts", "src/utils/validation.ts"],
  "scope": "relevant" | "all",
  "test_patterns": ["**/*.test.ts", "**/*.spec.ts"]
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "test_suites": [
      {
        "type": "unit|integration|e2e",
        "framework": "jest|vitest|playwright",
        "files": ["path/to/test.ts"],
        "estimated_time_ms": 2000,
        "reasoning": "Why these tests are relevant"
      }
    ],
    "total_tests": 247,
    "estimated_total_time_ms": 7000
  }
}
```

**Responsibilities:**
1. Analyze changed files to determine test relevance
2. Build import graph to find transitive dependencies
3. Categorize tests by type and framework
4. Estimate execution time based on historical data or heuristics

**Never:**
- Execute tests (that's test-executor's job)
- Modify test files
- Generate reports

**Success Criteria:**
- All directly related tests found (100% recall)
- Minimal irrelevant tests (>90% precision)
- Accurate categorization by framework

**Error Scenarios:**
- **Scenario:** No tests found for changed files → **Action:** Return empty suite, suggest running all tests or writing new tests
- **Scenario:** Cannot determine test framework → **Action:** Return best guess, warn user to verify
- **Scenario:** Import graph is circular → **Action:** Break cycle, continue analysis, report warning

**Example Invocation:**
```
Main agent (/test:run) delegates:

Task(
  sub_agent_type="test-finder",
  prompt="""
  Analyze the following changed files and identify all relevant tests:

  Changed files:
  - src/core/auth.ts (authentication logic updated)
  - src/utils/validation.ts (new validation rules)

  Test patterns to search: **/*.test.ts, **/*.spec.ts

  Return structured JSON with test suites categorized by type and framework.
  """
)
```

**Dependencies:**
- Invoked by: `/test:run` command
- May invoke: None (terminal agent)

---

### Sub-Agent: test-executor

**Type:** Validation

**Purpose:** Execute test suites in parallel, capturing all output and exit codes.

**Tools:** Bash
**Rationale:** Needs to execute test commands (npm test, vitest run, etc.). No file reading/writing needed.

**Model:** Haiku 4.5
**Rationale:** Simple execution logic, fast response needed. No complex reasoning required.

**Auto-Commit:** false
**Rationale:** Validation agent, makes no code changes.

**Input Schema:**
```json
{
  "suite": {
    "id": "unit-vitest",
    "framework": "vitest",
    "files": ["tests/core/auth.test.ts"],
    "command": "vitest run tests/core/auth.test.ts"
  },
  "timeout_ms": 30000,
  "env_vars": {
    "NODE_ENV": "test"
  }
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "suite_id": "unit-vitest",
    "status": "success|failure|timeout",
    "exit_code": 0,
    "duration_ms": 1850,
    "tests_run": 245,
    "tests_passed": 245,
    "tests_failed": 0,
    "failures": [...],
    "stdout": "...",
    "stderr": "..."
  }
}
```

**Responsibilities:**
1. Execute test command with proper environment setup
2. Monitor execution for timeouts
3. Capture stdout, stderr, exit code
4. Parse test framework output to extract counts and failures

**Never:**
- Analyze which tests to run (that's test-finder's job)
- Generate reports (that's report-generator's job)
- Modify test files or code

**Success Criteria:**
- Test suite executes to completion or timeout
- All output captured accurately
- Exit code reflects actual test result

**Error Scenarios:**
- **Scenario:** Test runner command not found → **Action:** Return error with installation suggestion
- **Scenario:** Timeout exceeded → **Action:** Kill process, return timeout status with partial output
- **Scenario:** Cannot parse test output → **Action:** Return raw output, warn about unknown format

**Example Invocation:**
```
Main agent (/test:run) delegates (in parallel for 3 suites):

# Parallel execution - all 3 in single response
Task(
  sub_agent_type="test-executor",
  prompt="Execute: vitest run tests/core/auth.test.ts ..."
)
Task(
  sub_agent_type="test-executor",
  prompt="Execute: jest tests/integration/api.test.ts ..."
)
Task(
  sub_agent_type="test-executor",
  prompt="Execute: playwright test e2e/login.spec.ts ..."
)
```

**Dependencies:**
- Invoked by: `/test:run` command
- May invoke: None (terminal agent)

---

### Sub-Agent: report-generator

**Type:** Generation

**Purpose:** Transform raw test execution results into clear, actionable reports.

**Tools:** Read
**Rationale:** May need to read test files to provide context. No execution or modification needed.

**Model:** Haiku 4.5
**Rationale:** Formatting task, fast response needed. Minimal reasoning required.

**Auto-Commit:** false
**Rationale:** Generates report text, not file changes.

**Input Schema:**
```json
{
  "executions": [...],
  "changed_files": ["src/core/auth.ts"],
  "discovery_metadata": {...}
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "report_markdown": "# Test Results\n\n...",
    "summary": {
      "total": 257,
      "passed": 255,
      "failed": 2,
      "duration_ms": 4200,
      "overall_status": "failure"
    }
  }
}
```

**Responsibilities:**
1. Parse test execution results
2. Link failures to changed files
3. Generate actionable suggestions
4. Format as clear markdown report

**Never:**
- Execute tests
- Modify code or test files
- Make decisions about which tests to run

**Success Criteria:**
- Report is readable and well-formatted
- All failures clearly presented with context
- Suggestions are actionable

**Error Scenarios:**
- **Scenario:** Cannot parse test output format → **Action:** Return raw output with warning
- **Scenario:** Too many failures to display (>50) → **Action:** Summarize top 10, link to full output

**Example Invocation:**
```
Main agent (/test:run) delegates:

Task(
  sub_agent_type="report-generator",
  prompt="""
  Generate a test report from the following execution results:

  [JSON with executions]

  Changed files: src/core/auth.ts, src/utils/validation.ts

  Return markdown report with:
  - Summary statistics
  - Detailed failure information
  - Links to changed files
  - Actionable suggestions
  """
)
```

**Dependencies:**
- Invoked by: `/test:run` command
- May invoke: None (terminal agent)

---

## Workflow & Orchestration

### Overview Diagram

```
User: /test:run
    ↓
[Phase 1: Discovery]
    └→ test-finder
        ↓ Returns JSON: {test_suites: [...]}
    ↓
Main: Present discovered tests to user
    ↓
User: Approve or modify
    ↓
[Phase 2: Execution]
    ├→ test-executor (suite 1) ──┐
    ├→ test-executor (suite 2) ──┼→ PARALLEL
    └→ test-executor (suite 3) ──┘
        ↓ All complete
        ↓ Returns: [{execution results}]
    ↓
[Phase 3: Reporting]
    └→ report-generator
        ↓ Returns: markdown report
    ↓
Main: Display report to user
    ↓
Complete
```

### Execution Flow

1. **Phase 1 - Discovery (Sequential):**
   - Main agent invokes `test-finder` with changed files
   - Waits for structured JSON response
   - Presents discovered tests to user

2. **User Approval Gate:**
   - User reviews test list
   - Options: Approve, Modify scope, Cancel
   - If approved → proceed to Phase 2

3. **Phase 2 - Execution (Parallel):**
   - Main agent invokes one `test-executor` per test framework
   - All executors run concurrently (3 parallel = ~1x time, not 3x)
   - Collects results from all executions

4. **Phase 3 - Reporting (Sequential):**
   - Main agent invokes `report-generator` with aggregated results
   - Waits for formatted report
   - Displays to user

5. **Final Output:**
   - User sees clear report
   - Options: Fix issues, Re-run failed tests, Continue

### Orchestration Pattern

**Sequential Pipeline** for phases (Discovery → Execution → Reporting)

**Rationale:** Each phase depends on outputs from previous phase:
- Execution needs test list from Discovery
- Reporting needs results from Execution

**Parallel Fanout** within Phase 2 (Execution)

**Rationale:** Test suites are independent, can run simultaneously:
- Unit tests (Vitest) and Integration tests (Jest) don't conflict
- Parallel execution reduces total time from 10s to 4s

---

## User Interaction Design

### Gate 1: Test Discovery Approval

**Trigger:** After Phase 1 completes, before execution

**Present to User:**
```
Found 257 tests to run:

Unit Tests (Vitest):
  ✓ tests/core/auth.test.ts (45 tests, ~1.5s)
  ✓ tests/utils/validation.test.ts (200 tests, ~0.5s)

Integration Tests (Jest):
  ✓ tests/integration/api.test.ts (12 tests, ~4s)

Total estimated time: ~7 seconds

Run these tests? [Y/n/modify]
```

**User Options:**
- ✅ **Y (Yes):** Proceed to Phase 2
- **n (No):** Cancel operation
- **modify:** User specifies different scope (e.g., "only unit tests")

---

### Progress Updates

**Real-Time Display (Using TodoWrite):**
```
✓ Phase 1: Test Discovery Complete (257 tests found)

⟳ Phase 2: Test Execution (2/3 suites complete)
  ✓ Unit tests (Vitest): 245 passed
  ✓ Integration tests (Jest): 10/12 passed, 2 failed
  ⏳ E2E tests (Playwright): Running...

⏳ Phase 3: Generating report...
```

**Final Output:**
```
✓ Test run complete (4.2s)

Results:
  ✅ 255 passed
  ❌ 2 failed

[Detailed report below...]
```

---

## Quality Gates & Validation

### Level 1: Input Validation

**Validates:** User request is actionable

**Checks:**
- ✓ Changed files exist or git diff returns valid output
- ✓ Test framework(s) installed (package.json check)
- ✓ Test scripts configured

**Failure Action:** Report error with setup instructions

---

### Level 2: Phase Output Validation

**Phase 1 Validation (Discovery):**
- ✓ test-finder returns valid JSON schema
- ✓ All test files referenced actually exist
- ✓ Estimated times are positive numbers

**Phase 2 Validation (Execution):**
- ✓ All test-executors completed (not timed out)
- ✓ Exit codes captured
- ✓ Test counts match expected (from discovery)

**Phase 3 Validation (Reporting):**
- ✓ report-generator returns markdown string
- ✓ Summary statistics match execution data

**Failure Action:** If any validation fails, report to user with raw data

---

### Level 3: Final Output Validation

**Success Criteria:**
1. All discovered tests executed (no crashes)
2. Results accurately reflect test outcomes
3. Report is actionable and clear

---

## Rollback Strategy

**When to Rollback:** Not applicable (read-only agent, no file changes)

**Cleanup Required:**
- Kill any hanging test processes
- Clear temporary test artifacts (if any)

---

## Implementation Mapping

### Slash Command: `/test:run`

**Location:** `.claude/commands/testing/run.md`

**User Invocations:**
```bash
/test:run                          # Run tests for changed files
/test:run --all                    # Run all tests
/test:run src/core/auth.ts         # Run tests for specific file
/test:run --only-failed            # Re-run previously failed tests
```

**Command Responsibilities:**
1. Parse user input (scope, flags)
2. Validate environment (test frameworks installed)
3. Orchestrate 3-phase workflow
4. Manage user approval gate
5. Present final report

**Command Does NOT:**
- Find tests (delegates to test-finder)
- Execute tests (delegates to test-executor)
- Generate reports (delegates to report-generator)

**Orchestration Flow:**
```markdown
/test:run invoked
  ↓
Determine changed files (git diff or user-specified)
  ↓
Task(sub_agent_type="test-finder", prompt=...)
  ↓ ← Receives {test_suites: [...]}
  ↓
Present test list to user → Wait for approval
  ↓
User approves
  ↓
For each test suite:
  Task(sub_agent_type="test-executor", prompt=...) [PARALLEL]
  ↓ ← All complete, receive [{execution results}]
  ↓
Task(sub_agent_type="report-generator", prompt=...)
  ↓ ← Receive markdown report
  ↓
Display report to user
  ↓
Complete
```

---

### Sub-Agent Files

**test-finder**
**Location:** `.claude/agents/testing/test-finder.md`

**YAML Frontmatter:**
```yaml
---
name: test-finder
description: Discovers all tests relevant to changed files by analyzing import graphs and test patterns
tools: Read, Grep, Glob, Bash
model: claude-sonnet-4-5
autoCommit: false
---
```

---

**test-executor**
**Location:** `.claude/agents/testing/test-executor.md`

**YAML Frontmatter:**
```yaml
---
name: test-executor
description: Executes test suites, capturing output and exit codes for reporting
tools: Bash
model: claude-haiku-4-5
autoCommit: false
---
```

---

**report-generator**
**Location:** `.claude/agents/testing/report-generator.md`

**YAML Frontmatter:**
```yaml
---
name: report-generator
description: Transforms raw test execution results into clear, actionable markdown reports
tools: Read
model: claude-haiku-4-5
autoCommit: false
---
```

---

## Testing & Validation

### Test Scenarios

**1. Basic Happy Path**
- **Input:** `/test:run` with 2 changed files
- **Expected:** Discover 5 relevant tests, execute in parallel, generate report showing all pass
- **Validation:** Report matches actual test results

**2. Failing Tests**
- **Input:** `/test:run` with code that breaks 2 tests
- **Expected:** Discover tests, execute, generate report highlighting 2 failures with context
- **Validation:** Failures correctly linked to changed files

**3. No Tests Found**
- **Input:** `/test:run` with changed README.md
- **Expected:** test-finder returns empty suite, command suggests running all tests or confirms no action needed
- **Validation:** User not confused, clear messaging

**4. Multiple Frameworks**
- **Input:** `/test:run` in repo with Jest, Vitest, and Playwright
- **Expected:** Discover tests across all frameworks, execute in parallel (3 test-executors), aggregate results
- **Validation:** All frameworks execute, total time ≈ slowest framework, not sum

**5. Timeout Handling**
- **Input:** `/test:run` with infinite loop in test
- **Expected:** test-executor times out after 30s, returns partial output, report shows timeout error
- **Validation:** Process killed, agent doesn't hang

---

## Open Questions

- [ ] How to handle tests that require external services (database, API)? Auto-detect and start Docker containers?
- [ ] Should we cache test results for unchanged files to speed up subsequent runs?
- [ ] How to integrate with watch mode for continuous testing during development?

---

## Future Enhancements

- Support for test coverage reporting (integrate with coverage tools)
- Visual regression testing (screenshot comparison)
- Test result caching based on file hashes
- Integration with CI/CD to compare local vs. CI results
- Flaky test detection (track test stability over time)

---

## References

- [Subagent Guidelines](../../claude/agents/SUBAGENT_GUIDELINES.md)
- [Model Selection Guide](../../claude/MODEL_GUIDELINES.md)
- [Agent PRD Guidelines](../AGENT_PRD_GUIDELINES.md)

---

**End of PRD**
