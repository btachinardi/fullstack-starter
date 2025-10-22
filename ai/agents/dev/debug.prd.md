# Development Server Debug Agent PRD

**Status:** Draft
**Version:** 2.0
**Last Updated:** 2025-10-22
**Owner:** Platform Engineering
**Implementation:**
- Main Agent: `/dev:debug` (slash command)
- Sub-Agents:
  - `dev-error-analyzer` (NEW)
  - `lint-debugger` (EXISTING)
  - `root-cause-analyst` (EXISTING)
  - `stack-trace-analyzer` (EXISTING)
  - `common-error-researcher` (EXISTING)
  - `best-practices-researcher` (EXISTING)
  - `monorepo-specialist` (EXISTING)
  - `build-system-debugger` (EXISTING)

---

## Executive Summary

The Development Server Debug Agent automates the complex, multi-step process of diagnosing and fixing errors that prevent development servers from starting successfully. It transforms a manual debugging workflow that typically takes 15-45 minutes (with high error risk) into a systematic, automated process completing in 3-7 minutes with comprehensive error coverage.

This agent provides value by systematically categorizing errors, applying fixes in dependency-aware priority order, delegating complex debugging to specialized subagents, and validating success through comprehensive health checks. Users can invoke `/dev:debug` when dev servers fail and trust the system to identify all blocking errors, apply appropriate fixes, and verify successful startup.

**Key Capabilities:**
- Automated error categorization (TypeScript, dependencies, Prisma, environment, ports, runtime)
- Dependency-aware fix prioritization (ports → deps → Prisma → env → types → runtime)
- Advanced delegation to 6+ specialized debugging subagents when stuck
- Parallel specialist invocation for 8x context efficiency
- Comprehensive validation with automatic rollback on failure

---

## Problem Statement

**Current Pain Points:**

Starting development servers in a PNPM monorepo with NestJS (API) and React+Vite (web) is error-prone and time-consuming when errors occur:

1. **Error Discovery Is Manual**: Developers must parse 1000s of lines of build output to identify all error types
2. **Fix Order Matters**: Fixing TypeScript errors before Prisma client generation wastes effort (code still crashes at runtime)
3. **Complex Errors Are Time Sinks**: Module resolution, webpack config, monorepo path issues can take 30+ minutes to debug
4. **Circular Debugging**: Developers try random fixes, get stuck, and waste time without systematic approach
5. **Context Overload**: Stack traces, webpack output, TypeScript errors create 50,000+ line logs that overwhelm manual analysis

**Why Manual Execution Is Problematic:**

- **High Cognitive Load**: Must remember fix priorities, dependency chains, validation steps
- **Error-Prone**: Easy to miss errors in verbose output or apply fixes in wrong order
- **Time-Consuming**: Average 15-45 minutes for common startup issues
- **Poor Debugging Decisions**: Developers implement "hacks" when stuck instead of finding root cause
- **No Systematic Approach**: Each developer debugs differently, leading to inconsistent outcomes

**Complexity Factors:**

- **7 Error Categories**: TypeScript, build/import, dependency, Prisma, environment, runtime, port conflicts
- **Dependency Chains**: Prisma client must exist before TypeScript can compile, env vars must exist before Prisma connects
- **Monorepo Specifics**: PNPM workspace resolution, workspace:* protocol, TypeScript path mappings, webpack externals
- **Scale**: 45+ packages in workspace, 1000s of files, complex build orchestration via Turborepo

---

## Goals & Non-Goals

### Goals

1. **Start dev servers successfully** without manual intervention in 95% of common error scenarios
2. **Systematically fix all blocking errors** using dependency-aware priority order (zero errors remain)
3. **Complete in <7 minutes** for typical startup issues (15-45 min manual → <7 min automated)
4. **Provide clear progress updates** with error categorization, fix strategies, and real-time status
5. **Delegate complex debugging** to specialized subagents for 8x context efficiency
6. **Validate success comprehensively** through HTTP health checks, process validation, and log scanning

### Non-Goals

- **Full CI pipeline execution** (use `/dev:validate` instead - includes tests, build validation)
- **Test failure debugging** (use `test-debugger` agent for test-specific issues)
- **Performance optimization** (agent fixes errors, doesn't optimize performance)
- **Production deployment** (development environment only)
- **Database migrations** (only Prisma client generation, not schema changes or migrations)
- **Feature implementation** (only fixes blocking errors, doesn't add features)

---

## Task Decomposition

### Phase 0: Pre-Flight Checks

**Purpose:** Validate environment readiness before attempting dev server startup

**Inputs:**
- User invocation: `/dev:debug`
- Project directory context
- Git repository state

**Process:**
1. **Check Prerequisites:**
   - Verify Node.js 20.18.0+ installed (`node --version`)
   - Verify PNPM 9.15.0+ installed (`pnpm --version`)
   - Verify Git repository exists (`.git/` directory present)
   - Verify package.json exists at root

2. **Check Running Processes:**
   - Scan for existing dev server processes (`ps aux | grep -E "(vite|nest)"`)
   - If found: Ask user "Dev servers appear to be running. Kill and restart? (Y/n)"
     - Yes: Kill processes (`kill -9 <PID>`)
     - No: Exit with message to stop servers manually

3. **Check Node Modules:**
   - Verify `node_modules/` exists
   - Verify `pnpm-lock.yaml` exists
   - If missing: Run `pnpm install` (bootstrap dependencies)

**Sub-Agent(s):** None (direct tool use - fast validation operations)

**Tools:** Bash (version checks, process scans, directory checks)

**Outputs:**
- **Go/No-Go Decision**: Boolean indicating environment ready
- **Process Kill List**: PIDs of killed processes (if any)
- **Bootstrap Status**: Whether dependencies were installed

**Success Criteria:**
- [ ] Prerequisites installed (Node 20.18.0+, PNPM 9.15.0+, Git)
- [ ] No conflicting dev server processes running
- [ ] Dependencies installed (`node_modules/` and `pnpm-lock.yaml` exist)
- [ ] Ready to start dev servers

**Failure Handling:**
- Prerequisites missing → Report error to user, exit (cannot proceed)
- User declines to kill processes → Exit gracefully with instructions
- `pnpm install` fails → Report error, exit (cannot proceed without deps)

---

### Phase 1: Monitored Startup & Error Analysis

**Purpose:** Start dev servers with monitoring, capture all errors, and categorize systematically

**Inputs:**
- Environment ready (from Phase 0)
- Clean process state (no conflicting processes)

**Process:**
1. **Start Development Servers with Monitoring:**
   - Execute: `pnpm tools dev:start-monitored --log /tmp/dev-output.log --pid /tmp/dev-pid.txt`
   - Tool handles:
     - Starting `pnpm dev` in background
     - Redirecting all output (stdout + stderr) to log file
     - Saving process ID for later management
     - Returning immediately with startup status

2. **Monitor Initial Startup (30 seconds):**
   - Wait 30 seconds for compilation and initial startup
   - Tool continues capturing output to log file

3. **Capture and Parse Errors:**
   - Execute: `pnpm tools dev:categorize-errors /tmp/dev-output.log --format json`
   - Tool returns structured JSON with:
     - Error counts by category (TypeScript, build, dependency, Prisma, environment, runtime, port)
     - Affected files per category
     - Extracted error details (file, line, code, message)
     - Risk level assessment (low/medium/high/critical)

4. **Delegate to Error Analyzer (context isolation):**
   - If errors found AND log file > 1000 lines (verbose output):
     - Delegate to `dev-error-analyzer` subagent
     - Subagent receives log file path, loads full output
     - Subagent performs deep analysis, validates categorization
     - Subagent returns enriched error report with:
       - Validated error categories
       - Confidence scores per error
       - Recommended fix strategies
       - Priority order
   - If errors found AND log file < 1000 lines:
     - Use tool categorization only (sufficient for simple cases)
     - Main thread processes results directly

5. **Assess Server Health:**
   - Execute: `pnpm tools dev:health-check --format json`
   - Tool returns:
     - Process status (running/crashed, PID, uptime)
     - Web app status (HTTP response code, response time)
     - API app status (HTTP response code, response time)
     - Overall health (healthy/degraded/failed)

6. **Create Error Summary:**
   - Aggregate results from categorization and health check
   - Count total errors by category
   - Identify most critical issues (blocking vs non-blocking)
   - Determine recommended fix strategy based on error types

7. **Stop Dev Servers (for fixing):**
   - If errors found: `pnpm tools dev:stop --pid /tmp/dev-pid.txt`
   - Clean shutdown with timeout handling

**Sub-Agent(s):**
- **dev-error-analyzer** (invoked conditionally for verbose logs)
  - **Type:** Analysis
  - **Purpose:** Parse dev server logs, validate error categorization, recommend fix strategies
  - **Tools:** Read, Grep
  - **Model:** Haiku 4.5 (fast pattern matching + basic reasoning)
  - **Auto-Commit:** false
  - **Input:** Log file path, raw categorization from tool
  - **Output:** Enriched error report (JSON) with validated categories, confidence scores, strategies
  - **When:** Log file > 1000 lines OR complex/ambiguous errors detected by tool

**Tools:**
- **`pnpm tools dev:start-monitored`** (NEW)
  - Purpose: Start dev servers with log capture and PID tracking
  - Inputs: `--log <file>` (log path), `--pid <file>` (PID path)
  - Outputs: Startup status, process PID, log file path
  - Benefits: Encapsulates complex bash, handles errors, consistent logging

- **`pnpm tools dev:categorize-errors`** (NEW)
  - Purpose: Parse dev server logs and categorize errors systematically
  - Inputs: Log file path, `--format json|text`
  - Outputs: Structured JSON with error categories, counts, details
  - Benefits: Reusable, testable, consistent categorization logic

- **`pnpm tools dev:health-check`** (NEW)
  - Purpose: Check dev server health (processes, HTTP endpoints)
  - Inputs: None (uses default ports 3000/3001)
  - Outputs: JSON with process status, HTTP status, overall health
  - Benefits: Consolidates health check logic, reusable across phases

**Outputs:**

```json
{
  "error_summary": {
    "total_errors": 23,
    "categories": {
      "typescript": {
        "count": 15,
        "files": ["apps/api/src/auth/controller.ts", "apps/web/src/hooks/useAuth.ts"],
        "errors": [
          {
            "file": "apps/api/src/auth/controller.ts",
            "line": 42,
            "code": "TS2322",
            "message": "Type 'string | undefined' is not assignable to type 'string'"
          }
        ],
        "recommended_strategy": "E (delegate to lint-debugger)",
        "priority": 5
      },
      "prisma": {
        "count": 1,
        "errors": [{"message": "Prisma Client not generated"}],
        "recommended_strategy": "C (generate Prisma client)",
        "priority": 3
      },
      "environment": {
        "count": 2,
        "missing_vars": ["DATABASE_URL", "JWT_SECRET"],
        "recommended_strategy": "D (configure environment)",
        "priority": 4
      }
    },
    "most_critical": [
      "Prisma client not generated (blocks API startup)",
      "Missing DATABASE_URL (blocks Prisma connection)",
      "15 TypeScript errors (prevents compilation)"
    ],
    "risk_level": "medium"
  },
  "server_health": {
    "process": {"status": "running", "pid": 12345},
    "web": {"status": "failed", "reason": "compilation_error"},
    "api": {"status": "failed", "reason": "prisma_missing"},
    "overall": "failed"
  },
  "recommended_fix_order": ["C", "D", "E"]
}
```

**Success Criteria:**
- [ ] Dev servers started (even if with errors)
- [ ] All errors captured in log file
- [ ] Errors categorized by type (7 categories)
- [ ] Error counts accurate
- [ ] Server health assessed (process + HTTP checks)
- [ ] Fix strategy identified based on error types
- [ ] User informed of error scope and approach

**Failure Handling:**
- Dev servers fail to start at all (immediate crash) → Report to user, attempt recovery in Phase 2
- Log file empty or corrupted → Use stderr capture as fallback
- Health check fails → Record status, proceed to Phase 2 (fixing will address)

---

### Phase 2: Systematic Error Resolution

**Purpose:** Fix all identified errors systematically using dependency-aware priority order and specialized strategies

**Inputs:**
- Error summary from Phase 1 (categorized errors, counts, priorities)
- Recommended fix order (e.g., ["C", "D", "E"])
- Server stopped state (clean slate for fixes)

**Process:**

**Fix Execution Priority (always follow this order):**

1. **Port Conflicts (Strategy A)** - Priority 1 (CRITICAL - blocks all startups)
2. **Dependencies (Strategy B)** - Priority 2 (HIGH - required before code runs)
3. **Prisma (Strategy C)** - Priority 3 (HIGH - required for API functionality)
4. **Environment (Strategy D)** - Priority 4 (MEDIUM - required for configuration)
5. **TypeScript (Strategy E)** - Priority 5 (MEDIUM - prevents compilation)
6. **Build/Import (Strategy F)** - Priority 6 (MEDIUM - prevents bundling)
7. **Runtime (Strategy G)** - Priority 7 (LOW - happens after startup)

**Advanced Strategies (H-L)** - Used when:
- Stuck on same error >15 minutes
- Standard strategies (A-G) fail after 2-3 attempts
- Error is unfamiliar or complex (monorepo, build system, module resolution)
- Considering hacks or workarounds instead of proper fixes

**Strategy Execution Flow:**

1. **Apply Basic Strategies (A-G) in Priority Order:**
   - For each error category in priority order:
     - Execute strategy steps
     - Validate fix (run validation command)
     - If successful: Mark complete, proceed to next
     - If failed after 2 attempts: Escalate to advanced strategies (H-L)

2. **Escalate to Advanced Strategies (H-L) When Stuck:**
   - Present to user: "Complex issue detected. Invoking specialist subagents for analysis."
   - Invoke specialists in PARALLEL (single response, multiple Task calls):
     - `stack-trace-analyzer` - Parse error message and stack trace
     - `common-error-researcher` - Search GitHub/Stack Overflow for solutions
     - `best-practices-researcher` - Find official documentation guidance
     - `monorepo-specialist` - Diagnose PNPM workspace configuration
     - `build-system-debugger` - Analyze webpack/Vite/TypeScript config
   - Wait for all specialists to complete
   - Compare recommendations, synthesize consensus approach
   - Apply recommended fix from specialists

**Sub-Agent(s):**

**Standard Strategy Sub-Agents:**

- **lint-debugger** (EXISTING - built-in)
  - **When:** >10 TypeScript errors detected (Strategy E threshold)
  - **What:** Fix TypeScript compilation errors systematically
  - **Tools:** Read, Edit, Bash (typecheck, lint)
  - **Model:** Sonnet 4.5
  - **Output:** Fixed files, zero TypeScript errors

**Advanced Strategy Sub-Agents (all invoked in parallel when stuck):**

- **root-cause-analyst** (EXISTING - Strategy H)
  - **When:** Stuck >15 min, tried 2-3 solutions, considering hacks
  - **What:** Analyze root cause, suggest 3-5 alternative solutions, rank by best practices
  - **Why:** Prevents implementing hacks, finds sustainable solutions
  - **Output:** Diagnostic report with ranked solutions and trade-off analysis
  - **Tools:** Read, Grep, Glob, WebSearch, WebFetch
  - **Model:** Sonnet 4.5

- **stack-trace-analyzer** (EXISTING - Strategy L)
  - **When:** Complex multi-file stack traces, unclear error origin
  - **What:** Parse stack traces, identify call sequence, pinpoint exact error location
  - **Why:** Complex traces (NestJS DI, webpack, async) hard to parse manually
  - **Output:** File:line to investigate, call sequence diagram
  - **Tools:** Read, Grep
  - **Model:** Sonnet 4.5

- **common-error-researcher** (EXISTING - Strategy I)
  - **When:** Unfamiliar error, framework-specific issue, need community solutions
  - **What:** Search GitHub issues, Stack Overflow, find proven solutions
  - **Why:** Community has likely solved this before
  - **Output:** Top 5 solutions with sources, dates, success indicators
  - **Tools:** WebSearch, WebFetch
  - **Model:** Sonnet 4.5

- **best-practices-researcher** (EXISTING - Strategy I-B)
  - **When:** Need official guidance, validating configuration, learning proper patterns
  - **What:** Search official docs, official repos, core team blogs only
  - **Why:** Validates against authoritative sources, prevents bad patterns
  - **Output:** Official recommendations with source links, config examples
  - **Tools:** WebSearch, WebFetch
  - **Model:** Sonnet 4.5

- **monorepo-specialist** (EXISTING - Strategy J)
  - **When:** Module resolution errors, workspace package issues, build output problems
  - **What:** Expert analysis of NestJS + Turborepo + PNPM workspace integration
  - **Why:** Monorepo module resolution different from standard Node.js, PNPM has specific behaviors
  - **Output:** Configuration fixes (package.json exports, tsconfig paths, webpack externals)
  - **Tools:** Read, Grep, Glob
  - **Model:** Sonnet 4.5

- **build-system-debugger** (EXISTING - Strategy K)
  - **When:** Webpack/Vite errors, TypeScript compilation, module system conflicts
  - **What:** Diagnose webpack, Vite, TypeScript config issues
  - **Why:** Build systems have complex interactions (webpack loaders, TS compiler, module systems)
  - **Output:** Build configuration fixes, compiler option recommendations
  - **Tools:** Read, Grep
  - **Model:** Sonnet 4.5

**Outputs:**

```json
{
  "fixes_applied": [
    {
      "strategy": "C",
      "name": "Prisma Client Generation",
      "actions": ["pnpm prisma generate"],
      "result": "success",
      "files_affected": ["packages/db/node_modules/.prisma/client/"],
      "validation": "Client generated successfully"
    },
    {
      "strategy": "D",
      "name": "Environment Configuration",
      "actions": ["cp apps/api/.env.example apps/api/.env", "set DATABASE_URL", "set JWT_SECRET"],
      "result": "success",
      "files_affected": ["apps/api/.env"],
      "validation": "Environment variables configured"
    },
    {
      "strategy": "E",
      "name": "TypeScript Error Fixes",
      "subagent": "lint-debugger",
      "result": "success",
      "errors_fixed": 15,
      "files_modified": ["apps/api/src/auth/controller.ts", "apps/web/src/hooks/useAuth.ts"],
      "validation": "Zero TypeScript errors (typecheck passed)"
    }
  ],
  "total_fixes": 3,
  "total_files_modified": 6,
  "advanced_strategies_used": false,
  "fix_duration_seconds": 165
}
```

**Success Criteria:**
- [ ] Appropriate strategies selected based on error types
- [ ] Fixes applied in correct priority order
- [ ] Each fix validated before proceeding to next
- [ ] Delegated to lint-debugger if >10 TypeScript errors
- [ ] All fixes are minimal and targeted (no scope creep)
- [ ] Code follows project conventions (type safety, no `any`)
- [ ] Zero blocking errors remain (verified via typecheck/lint)

**Failure Handling:**
- Fix fails validation → Try alternative approach, escalate to advanced strategies if stuck
- Advanced strategies fail → Report to user, request manual intervention
- >3 consecutive fix failures → Halt, report error state to user

---

## Strategy Documentation

All strategies follow consistent "When/What/Why/Priority" structure for clarity and quick decision-making.

### Basic Fix Strategies (A-G)

#### Strategy A: Port Conflict Resolution

**When:** Port conflict errors detected (EADDRINUSE, "address already in use" for ports 3000 or 3001)

**What it does:** Identifies process using required ports and resolves conflicts by killing process or changing ports

**Why use this:** Ports must be free before dev servers can start. This is a blocking issue that prevents all other fixes from being testable.

**Priority:** 1 (CRITICAL - must fix before proceeding with any other strategy)

**Steps:**
1. Identify conflicting process: `lsof -i :3000 -i :3001 | grep LISTEN`
2. Present options to user:
   - **Option A:** Kill process (if safe): `kill -9 [PID]`
   - **Option B:** Change port in `.env` files: Edit `apps/web/.env` and `apps/api/.env`
3. Execute chosen solution
4. Verify ports now free: `lsof -i :3000 -i :3001` returns no results

**Validation:**
- [ ] Port 3000 is free
- [ ] Port 3001 is free
- [ ] No conflicting processes remain

---

#### Strategy B: Dependency Resolution

**When:** Module not found, package missing, version conflicts, peer dependency errors

**What it does:** Installs missing packages, resolves version conflicts, repairs workspace dependencies

**Why use this:** Missing or conflicting dependencies prevent code from running. Must be resolved before any code fixes.

**Priority:** 2 (HIGH - required before code can execute)

**Steps:**
1. Extract missing package names from error messages
2. Determine workspace context (which app/package needs dependency)
3. Install missing packages:
   - Workspace package: `cd [workspace] && pnpm add [package]`
   - Root dependency: `pnpm add -w [package]`
4. Resolve version conflicts:
   - Try: `pnpm install --force` (if peer dependency conflicts)
   - Or: `pnpm update [package]` (if version mismatch)
5. Verify installation: `pnpm install --frozen-lockfile` (should succeed)

**Validation:**
- [ ] All missing packages installed
- [ ] No version conflicts remain
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] Package appears in `node_modules/`

---

#### Strategy C: Prisma Issues

**When:** Prisma schema errors, migration needed, client not generated, database connection issues

**What it does:** Validates Prisma schema, generates client, checks database connectivity

**Why use this:** Prisma client must exist before API code can compile. Missing client causes TypeScript errors AND runtime crashes.

**Priority:** 3 (HIGH - API cannot function without Prisma)

**Steps:**
1. Validate schema: `cd apps/api && pnpm prisma validate`
   - If invalid: Read error, fix schema syntax, re-validate
2. Generate client: `pnpm prisma generate`
3. Check migration status: `pnpm prisma migrate status`
   - If pending migrations: `pnpm prisma migrate dev` (or inform user)
4. Verify database connection: `pnpm prisma db pull` (should succeed if DB reachable)

**Validation:**
- [ ] Schema is valid (`prisma validate` succeeds)
- [ ] Client generated (files in `packages/db/node_modules/.prisma/client/`)
- [ ] No migration errors
- [ ] Database connection successful (if required)

---

#### Strategy D: Environment Configuration

**When:** Missing environment variables, configuration errors, invalid env file format

**What it does:** Creates/updates `.env` files with required variables, sets development defaults

**Why use this:** Environment variables required for Prisma (DATABASE_URL), API (JWT_SECRET), and other services. Missing vars cause startup failures.

**Priority:** 4 (MEDIUM - required for configuration, blocks Prisma connection)

**Steps:**
1. Identify missing variables from error messages
2. Check for `.env.example` files: `find . -name ".env.example"`
3. Create/update `.env` files:
   - If `.env` doesn't exist: `cp apps/[app]/.env.example apps/[app]/.env`
   - If exists but missing vars: Add missing variables
4. Set development-appropriate values (e.g., `DATABASE_URL=postgresql://localhost:5432/dev`)
5. Validate: Restart dev server briefly to check if env errors resolved

**Validation:**
- [ ] All required `.env` files exist
- [ ] All required variables set
- [ ] Values are valid for development environment
- [ ] No environment-related errors in next startup

---

#### Strategy E: TypeScript and Linting Errors

**When:** TypeScript compilation errors, type mismatches, strict mode violations

**What it does:** Fixes TypeScript errors manually (<10 errors) or delegates to lint-debugger (>10 errors)

**Why use this:** TypeScript errors prevent compilation. Many errors indicate systematic issues better handled by specialized agent.

**Priority:** 5 (MEDIUM - prevents compilation, but dependencies must be resolved first)

**Steps:**

**If >10 TypeScript errors (DELEGATE):**
1. Invoke lint-debugger subagent via Task tool:
   ```
   Task(
     subagent_type="lint-debugger",
     description="Fix all TypeScript errors preventing dev server startup",
     prompt="Fix all TypeScript compilation errors. Run typecheck after fixes to ensure zero errors remain."
   )
   ```
2. Wait for lint-debugger completion
3. Review fixes applied, verify zero errors

**If <10 TypeScript errors (MANUAL):**
1. Run typecheck: `pnpm typecheck 2>&1 | tee /tmp/typecheck-errors.log`
2. For each error:
   - Read file at error location
   - Understand type mismatch or violation
   - Apply minimal fix (type annotation, type guard, fix import)
   - **Never** use `any` types or non-null assertions
   - **Prefer** type guards over `as` assertions
3. Verify fix: `pnpm typecheck` (repeat until zero errors)

**Validation:**
- [ ] Zero TypeScript errors (`pnpm typecheck` exit code 0)
- [ ] All fixes follow type safety standards (no `any`, no `!`)
- [ ] Type guards used instead of assertions
- [ ] Code compiles successfully

---

#### Strategy F: Build/Import Resolution

**When:** "Cannot find module", import resolution failures, path mapping issues, workspace package not found

**What it does:** Fixes import paths, updates tsconfig path mappings, resolves module resolution issues

**Why use this:** Import errors prevent bundling. Common in monorepos due to workspace:* protocol and path mappings.

**Priority:** 6 (MEDIUM - prevents bundling, dependencies must exist first)

**Steps:**
1. For each "module not found" error:
   - Verify file exists at import path
   - Check if path is correct (relative vs absolute vs alias)
   - Verify tsconfig.json path mappings
2. Fix import statements:
   - Correct relative path depth (`../../` vs `../`)
   - Use workspace package names (`@starter/utils` instead of relative path)
   - Fix file extensions if needed (`.ts` vs `.js` vs none)
3. Fix tsconfig path mappings (if aliases broken):
   - Check `tsconfig.json` `paths` configuration
   - Align with actual package structure
   - Ensure paths resolve to built `.js` files (not `.ts` sources)
4. Verify resolution: `pnpm typecheck` should resolve import errors

**Validation:**
- [ ] All import paths resolve correctly
- [ ] No "Cannot find module" errors
- [ ] tsconfig paths align with package structure
- [ ] Typecheck passes

---

#### Strategy G: Runtime Error Fixes

**When:** Server starts but crashes, unhandled exceptions, runtime errors after compilation succeeds

**What it does:** Analyzes runtime errors, fixes code issues causing crashes

**Why use this:** Runtime errors occur after compilation, often due to undefined access, missing imports, invalid API calls

**Priority:** 7 (LOW - only happens after compilation succeeds, fix other issues first)

**Steps:**
1. Analyze stack trace from `/tmp/dev-output.log`
   - Identify error message
   - Find source file and line number
   - Trace call sequence
2. Read problematic code: `Read(file_path="[error-file-path]")`
3. Identify root cause:
   - Undefined property access → Add null checks
   - Missing imports → Add import statements
   - Invalid API calls → Fix endpoint/parameters
   - Database connection → Check Prisma setup
4. Apply minimal fix using Edit tool
5. Test fix: Restart dev server, monitor for error resolution

**Validation:**
- [ ] Runtime error no longer appears in logs
- [ ] Server starts and remains running (no crashes)
- [ ] Null/undefined handled properly
- [ ] All imports correct

---

### Advanced Fix Strategies (H-L)

**When to Use Advanced Strategies:**
- Stuck on same error >15 minutes
- Standard strategies (A-G) fail after 2-3 attempts
- Error is unfamiliar or complex
- Considering hacks or workarounds
- Multiple systems interacting (webpack + TypeScript + PNPM)

#### Strategy H: Root Cause Analysis

**When:** Complex errors with unclear root cause, considering hacks, or multiple failed fix attempts

**What it does:** Delegates to root-cause-analyst for comprehensive analysis and alternative solution ranking

**Why use this:** Prevents implementing hacks, finds sustainable solutions based on best practices and proper architecture

**Priority:** HIGH (when stuck - prevents wasted time and technical debt)

**Steps:**
1. Delegate to root-cause-analyst subagent (provide error context, attempted fixes)
2. Review analysis results (root cause, 3-5 alternative solutions, trade-offs)
3. Choose most sustainable approach (avoid quick hacks)
4. Implement recommended solution
5. Document why other approaches were rejected

**Validation:**
- [ ] Root cause identified (not just symptoms)
- [ ] Solution aligns with best practices
- [ ] No technical debt introduced
- [ ] Alternative approaches documented

---

#### Strategy I: Community Error Research

**When:** Unfamiliar error messages, known framework bugs, need battle-tested community solutions

**What it does:** Delegates to common-error-researcher to search GitHub issues and Stack Overflow for proven solutions

**Why use this:** Community has likely solved this error before, saves time vs inventing new solution

**Priority:** MEDIUM (use early when error is recognizable but unfamiliar)

**Steps:**
1. Delegate to common-error-researcher (provide error message, stack, framework versions)
2. Review community solutions (prioritize recent, high-voted, maintainer-confirmed)
3. Validate solution matches tech stack (versions matter!)
4. Test highest-rated solution first
5. Verify it works before marking complete

**Validation:**
- [ ] Solution from credible source (high votes, maintainer response, recent)
- [ ] Stack versions match (NestJS 10, PNPM 9.15, etc.)
- [ ] Solution works (error resolved)
- [ ] Not a one-off workaround (sustainable pattern)

---

#### Strategy I-B: Official Best Practices Research

**When:** Need to verify "the right way" to configure something, want official guidance, validating current setup

**What it does:** Delegates to best-practices-researcher to search official docs, repos, core team guidance ONLY

**Why use this:** Official sources are authoritative, prevent adopting bad community patterns

**Priority:** MEDIUM (use when configuration questions arise)

**Steps:**
1. Delegate to best-practices-researcher (ask specific configuration question, provide current setup)
2. Review official recommendations (all should have source URLs from official docs/repos)
3. Compare current setup vs official pattern
4. Understand "why" behind official recommendations
5. Implement official pattern (don't deviate without good reason)

**Validation:**
- [ ] All claims have official source URLs
- [ ] Versions compatible with our stack
- [ ] Official pattern understood (not just copied)
- [ ] Any deviations documented with rationale

---

#### Strategy J: Monorepo-Specific Debugging

**When:** Module resolution errors, workspace package issues, build output problems, PNPM linking issues

**What it does:** Delegates to monorepo-specialist for expert analysis of NestJS + Turborepo + PNPM workspace integration

**Why use this:** Monorepo module resolution is different from standard Node.js. Workspace packages, TypeScript paths, and build tools interact in complex ways. PNPM has specific behaviors.

**Priority:** HIGH (when monorepo/workspace errors detected)

**Steps:**
1. Delegate to monorepo-specialist (provide error, stack details, current config)
2. Review analysis (package.json exports, tsconfig paths, webpack externals, PNPM workspace resolution)
3. Apply monorepo-specific fixes:
   - Update package.json exports to point to built `.js` files
   - Fix tsconfig path mappings to align with package structure
   - Configure webpack externals for workspace packages
   - Verify workspace:* dependencies correct
4. Run `pnpm install` if package.json changes made
5. Validate fixes

**Validation:**
- [ ] package.json "type", "main", "exports" correct
- [ ] workspace:* dependencies resolve properly
- [ ] tsconfig paths align with package structure
- [ ] Webpack externals configured for workspace packages

---

#### Strategy K: Build System Debugging

**When:** Webpack/Vite compilation errors, TypeScript compiler issues, module system conflicts, nested dist folder problems

**What it does:** Delegates to build-system-debugger for deep diagnosis of webpack, Vite, TypeScript config issues

**Why use this:** Build systems have complex interactions (webpack loaders, TypeScript compiler, module systems). Specialist understands webpack externals, TypeScript outDir/rootDir, CommonJS/ESM nuances.

**Priority:** HIGH (when build/compilation errors persist)

**Steps:**
1. Delegate to build-system-debugger (provide error, build setup details, observed output)
2. Review analysis (webpack vs TypeScript vs module system issue)
3. Apply build configuration fixes:
   - Update nest-cli.json (enable webpack if needed)
   - Fix TypeScript compiler options (outDir, rootDir, composite)
   - Align module system (all CommonJS or all ESM)
   - Check webpack externals configuration
4. Clear build caches after config changes: `rm -rf dist/ .turbo/`
5. Validate fixes

**Validation:**
- [ ] Build configuration follows NestJS + monorepo patterns
- [ ] TypeScript compiler options correct (outDir, rootDir)
- [ ] Module system consistent (CommonJS for NestJS backend)
- [ ] Webpack externals configured properly
- [ ] Build succeeds

---

#### Strategy L: Stack Trace Analysis

**When:** Multi-file stack traces, unclear error origin, deep async call stacks, webpack obfuscated errors

**What it does:** Delegates to stack-trace-analyzer to parse complex stack traces and identify exact file:line to investigate

**Why use this:** Complex stack traces (NestJS DI, webpack bundles, async code) are hard to parse manually. Specialist extracts signal from noise.

**Priority:** MEDIUM (use early when stack trace is complex)

**Steps:**
1. Delegate to stack-trace-analyzer (provide full error message and stack trace)
2. Review analysis (error type, exact file:line, call sequence, root cause vs immediate cause)
3. Focus on root cause (not intermediate calls)
4. Read file at identified location
5. Understand context around error
6. Apply targeted fix based on root cause

**Validation:**
- [ ] Exact error location identified (file:line)
- [ ] Root cause understood (not just symptoms)
- [ ] Call sequence makes sense
- [ ] Fix targets root cause

---

### Quick Decision Tree

When encountering errors, follow this decision tree for strategy selection:

1. **Port conflict (EADDRINUSE)?** → **A** (Port Conflict Resolution)
2. **Module not found / dependency error?** → **B** (Dependency Resolution)
3. **Prisma error?** → **C** (Prisma Issues)
4. **Missing env var?** → **D** (Environment Configuration)
5. **TypeScript errors?**
   - <10 errors → **E (manual)**
   - >10 errors → **E (delegate to lint-debugger)**
6. **Import resolution / "Cannot find module"?** → **F** (Build/Import Resolution)
7. **Runtime crash / exception?** → **G** (Runtime Error Fixes)

**If stuck after trying strategies above:**

8. **Error unclear / complex stack trace?** → **L** (Stack Trace Analysis)
9. **Configuration question / "what's the right way"?** → **I-B** (Best Practices Research)
10. **Known error but unfamiliar?** → **I** (Community Error Research)
11. **Monorepo / workspace issue?** → **J** (Monorepo Specialist)
12. **Build / compilation problem?** → **K** (Build System Debugger)
13. **Tried multiple fixes, still stuck?** → **H** (Root Cause Analysis)

**Optimal Delegation Pattern (when multiple perspectives needed):**

Invoke 3-4 specialists in PARALLEL (single response):
- Stack Trace Analyzer (understand error)
- Common Error Researcher (find solutions)
- Best Practices Researcher (validate against official docs)
- Domain specialist (Monorepo or Build System based on error type)

Wait for all results, compare recommendations, synthesize consensus approach.

**Time Savings:** 3+ specialists in parallel = 5-10 min → consensus solution vs 45+ min manual trial-and-error.

---

### Phase 3: Verification & Health Check

**Purpose:** Restart dev servers and confirm they run successfully without errors for sustained period

**Inputs:**
- All fixes applied from Phase 2
- Clean error state (zero blocking errors expected)
- Dev servers stopped

**Process:**

1. **Clear Previous State:**
   - Remove old logs: `rm -f /tmp/dev-output.log /tmp/dev-pid.txt`
   - Clear any temporary files or caches

2. **Restart Development Servers:**
   - Execute: `pnpm tools dev:start-monitored --log /tmp/dev-output.log --pid /tmp/dev-pid.txt`
   - Fresh startup with monitoring

3. **Monitor Startup (60 seconds):**
   - Wait 60 seconds for complete startup (longer than Phase 1 for thorough validation)
   - Capture all output to log file

4. **Comprehensive Health Validation:**
   - Execute: `pnpm tools dev:health-check --format json`
   - Tool returns:
     - Process status (running, uptime, PID)
     - Web app HTTP status (http://localhost:3000)
     - API app HTTP status (http://localhost:3001)
     - Overall health assessment

5. **Scan for Errors:**
   - Search log for error patterns: `grep -iE "(error|exception|fail|critical)" /tmp/dev-output.log`
   - **If errors found:**
     - Categorize new errors
     - Return to Phase 2 with error information
     - Apply additional fixes
     - Iterate until clean
   - **If no errors:**
     - Proceed to success reporting

6. **Verify Compilation Success:**
   - Check for success messages in log:
     - Web: "Compiled successfully", "ready in [time]"
     - API: "Nest application successfully started", "Listening on port"
   - Verify no TypeScript errors
   - Verify no build errors

7. **Optional: Test Hot Reload:**
   - Make trivial change: `touch apps/web/src/App.tsx`
   - Wait 5 seconds
   - Check log for:
     - Change detected
     - Recompilation
     - No errors
   - Validates watch mode working

**Sub-Agent(s):** None (direct tool use)

**Tools:**
- `pnpm tools dev:start-monitored` (restart servers)
- `pnpm tools dev:health-check` (comprehensive validation)

**Outputs:**

```json
{
  "verification": {
    "status": "success",
    "process": {
      "running": true,
      "pid": 12456,
      "uptime_seconds": 90
    },
    "web_app": {
      "url": "http://localhost:3000",
      "status": "ok",
      "http_code": 200,
      "response_time_ms": 45
    },
    "api_app": {
      "url": "http://localhost:3001",
      "status": "ok",
      "http_code": 200,
      "response_time_ms": 23
    },
    "errors_in_log": 0,
    "compilation_success": true,
    "hot_reload_working": true,
    "monitoring_duration_seconds": 60
  }
}
```

**Success Criteria:**
- [ ] Dev process running (ps check confirms)
- [ ] Web app accessible and returns HTTP 200
- [ ] API app accessible and returns HTTP 200
- [ ] Zero errors in last 60 seconds of logs
- [ ] Compilation successful (success messages present)
- [ ] Hot reload working (if tested)
- [ ] All health checks pass

**Failure Handling:**
- Errors found in logs → Return to Phase 2 with new error details
- Health checks fail → Investigate specific failure (process crash, port issue, compilation)
- Hot reload broken → Not blocking, report to user but mark overall success if servers running
- Validation fails 3 times → Halt, report persistent issues to user, request manual debugging

---

## Workflow & Orchestration

### Overview Diagram

```
User invokes /dev:debug
    ↓
[Phase 0: Pre-Flight Checks] (Direct tool use - <10 seconds)
    ├→ Check Node.js / PNPM / Git
    ├→ Check running processes (kill if needed)
    └→ Verify dependencies (install if needed)
    ↓
[Phase 1: Monitored Startup & Error Analysis]
    ├→ pnpm tools dev:start-monitored (encapsulated startup)
    ├→ Wait 30 seconds (monitoring)
    ├→ pnpm tools dev:categorize-errors (fast categorization)
    └→ IF log > 1000 lines: dev-error-analyzer (context isolation)
    ↓
Present Error Summary to User
    ↓
User Approval Gate: "Found [N] errors. Proceed with automated fixes? (Y/n)"
    ├→ Yes: Continue to Phase 2
    └→ No: Exit (user will debug manually)
    ↓
[Phase 2: Systematic Resolution]
    ├→ Apply Basic Strategies A-G (priority order)
    │   ├→ Strategy A: Port conflicts
    │   ├→ Strategy B: Dependencies
    │   ├→ Strategy C: Prisma
    │   ├→ Strategy D: Environment
    │   ├→ Strategy E: TypeScript (delegate if >10 errors)
    │   │   └→ lint-debugger ──┐
    │   ├→ Strategy F: Build/Import │
    │   └→ Strategy G: Runtime      │
    │                                │
    └→ IF STUCK (>15 min OR 3 failures): Advanced Strategies H-L
        └→ Invoke specialists in PARALLEL (single response):
            ├→ stack-trace-analyzer ──┐
            ├→ common-error-researcher ├→ Parallel execution
            ├→ best-practices-researcher ├→ 8x context efficiency
            ├→ monorepo-specialist ────┤
            └→ build-system-debugger ──┘
                ↓
        Synthesize consensus solution, apply fixes
    ↓
[Phase 3: Verification & Health Check]
    ├→ pnpm tools dev:start-monitored (clean restart)
    ├→ Monitor 60 seconds
    ├→ pnpm tools dev:health-check (comprehensive validation)
    └→ Scan logs for errors
    ↓
IF errors found → Return to Phase 2
IF no errors → Success Report
    ↓
Success:
    ├→ Present comprehensive success report
    ├→ Show server URLs and monitoring commands
    └→ KEEP SERVERS RUNNING (don't kill)
```

### Execution Flow

**Sequential Phases:** 0 → 1 → 2 → 3 (strict dependencies)

**Within Phase 2:**
- Basic strategies (A-G): Sequential by priority order
- Advanced strategies (H-L): Parallel when multiple perspectives needed
- Delegation to lint-debugger: Asynchronous wait

**User Approval Gates:**
- **Gate 1 (after Phase 1):** Show error summary, request permission to fix
- **Gate 2 (before advanced strategies):** Inform about specialist invocation, get confirmation

**Validation:**
- After each strategy: Immediate validation (typecheck, health check)
- After Phase 2 complete: Final validation before Phase 3
- Phase 3: Comprehensive validation (60s monitoring + HTTP checks)

**Rollback:**
- Git stash before Phase 2 (save clean state)
- If validation fails: `git stash pop` (restore original)
- Track which fixes applied, revert in reverse order if needed

### Orchestration Pattern

**Primary Pattern:** Sequential Pipeline with Conditional Branching

**Conditional Branches:**
- Phase 1 → If <10 TS errors: Manual fix | If >10: Delegate to lint-debugger
- Phase 2 → If stuck: Escalate to advanced strategies (parallel fanout)
- Phase 3 → If errors: Return to Phase 2 | If clean: Success

**Parallel Execution Points:**
- Advanced strategies (H-L): All specialists invoked in single response (parallel)
- Message generation in commit workflow: Not applicable here
- Error analysis: If needed, multiple analysis agents can run in parallel

**Performance Characteristics:**
- Phase 0: <10 seconds (fast validation)
- Phase 1: ~45 seconds (30s startup + 15s analysis)
- Phase 2: Variable (2-5 min typical, depends on error count)
  - Basic strategies: 30-60s each
  - Advanced strategies (parallel): ~2-3 min total (vs 15+ min sequential)
- Phase 3: ~90 seconds (60s monitoring + 30s validation)
- **Total: 4-7 minutes** (typical case with moderate errors)

---

## User Interaction Design

### Gate 1: Error Summary Review (After Phase 1)

**Trigger:** Errors detected and categorized in Phase 1

**Present to User:**

```
Development Server Debug - Error Summary

Found 18 errors preventing dev server startup:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error Categories:
  ✗ TypeScript: 15 errors across 5 files
  ✗ Prisma: Client not generated
  ✗ Environment: 2 missing variables (DATABASE_URL, JWT_SECRET)

Risk Level: MEDIUM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Most Critical Issues:
  1. Prisma client not generated → API will crash at runtime
  2. Missing DATABASE_URL → Blocks Prisma connection
  3. 15 TypeScript errors → Prevents compilation

Recommended Fix Strategy:
  1. Generate Prisma client (Strategy C)
  2. Configure environment variables (Strategy D)
  3. Delegate TypeScript fixes to lint-debugger (Strategy E)

Estimated Fix Time: 3-5 minutes

Proceed with automated fixes? (Y/n)
```

**User Options:**
- **Y (Yes):** Proceed to Phase 2, apply fixes automatically
- **n (No):** Exit gracefully, leave errors for manual debugging
- **Timeout (30s):** Default to "Yes" (proceed with fixes)

**Information Provided:**
- Total error count
- Breakdown by category
- Risk level assessment
- Critical issues highlighted
- Recommended strategies with rationale
- Estimated time to completion

---

### Gate 2: Advanced Strategy Confirmation (Before Invoking H-L)

**Trigger:** Stuck on same error >15 min OR standard strategies fail after 3 attempts

**Present to User:**

```
Complex Issue Detected - Specialist Assistance Recommended

Situation:
  - Standard fix strategies attempted: 3 times
  - Time spent on current error: 17 minutes
  - Error category: Module resolution (monorepo)

Issue:
  Error: "Cannot find module '@starter/utils'"
  Location: apps/api/src/auth/controller.ts:5
  Attempted: Fixed imports, checked tsconfig paths, verified package exists
  Status: Still failing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended: Invoke specialist subagents for comprehensive analysis

Specialists to invoke (in parallel):
  → stack-trace-analyzer: Parse error and identify exact issue
  → monorepo-specialist: Diagnose PNPM workspace configuration
  → best-practices-researcher: Validate against official NestJS + PNPM patterns

Expected time: 2-3 minutes (parallel execution)
Context efficiency: 8x cleaner (specialists handle verbose analysis)

Invoke specialist subagents? (Y/n)
```

**User Options:**
- **Y (Yes):** Invoke specialists in parallel, wait for analysis
- **n (No):** Continue with manual debugging approach
- **Timeout (30s):** Default to "Yes" (invoke specialists)

**Why This Gate Matters:**
- Prevents spinning on same error indefinitely
- Gets user buy-in for specialist invocation (may take 2-3 min)
- Explains trade-off (time now vs wasted time later)
- Shows transparency in decision-making

---

### Progress Reporting

**Format:** Real-time updates via TodoWrite tool

**Phase 0 Progress:**
```
✓ Prerequisites validated (Node 20.18.0, PNPM 9.15.0, Git)
✓ No conflicting processes found
✓ Dependencies installed
→ Ready to start dev servers
```

**Phase 1 Progress:**
```
⟳ Starting dev servers with monitoring...
⟳ Monitoring startup (30 seconds)...
✓ Dev servers started (with errors)
⟳ Categorizing errors...
✓ Found 18 errors across 3 categories
→ Presenting error summary to user
```

**Phase 2 Progress:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Applying Fixes - Priority Order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/3] Strategy C: Prisma Client Generation
  ⟳ Running: pnpm prisma generate
  ✓ Prisma client generated successfully
  ✓ Files: packages/db/node_modules/.prisma/client/

[2/3] Strategy D: Environment Configuration
  ⟳ Creating apps/api/.env from .env.example
  ✓ Set: DATABASE_URL=postgresql://localhost:5432/dev
  ✓ Set: JWT_SECRET=dev-secret-key
  ✓ Environment configured

[3/3] Strategy E: TypeScript Error Fixes
  ⟳ Delegating to lint-debugger agent...
  ⟳ lint-debugger: Running typecheck...
  ⟳ lint-debugger: Found 15 TypeScript errors
  ⟳ lint-debugger: Fixing type imports...
  ⟳ lint-debugger: Adding type guards...
  ✓ lint-debugger complete: Fixed 15 errors across 5 files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix Summary:
  - Prisma: Client generated
  - Environment: 2 variables configured
  - TypeScript: 15 errors fixed
  Total Fixes: 18 | Files Modified: 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ Proceeding to verification...
```

**Phase 3 Progress:**
```
⟳ Restarting dev servers for verification...
⟳ Monitoring startup (60 seconds)...
✓ Web app: http://localhost:3000 - OK (200)
✓ API app: http://localhost:3001 - OK (200)
✓ Zero errors in logs
✓ Compilation successful
✓ All health checks passed
```

---

## Quality Gates & Validation

### Level 1: Input Validation (Phase 0)

**Validates:** Environment meets prerequisites before attempting fixes

**Checks:**
- [ ] Node.js version ≥ 20.18.0
- [ ] PNPM version ≥ 9.15.0
- [ ] Git repository exists (`.git/` directory)
- [ ] `package.json` exists at root
- [ ] No conflicting dev processes running (or user approves killing)

**Failure Action:**
- Prerequisites missing → Report error, exit (cannot proceed)
- Conflicting processes + user declines to kill → Exit with instructions
- `pnpm install` fails → Report error, exit (cannot proceed without deps)

---

### Level 2: Phase Output Validation

**Phase 1 Validation:**
- [ ] Dev servers started (process exists, even if with errors)
- [ ] Log file created and contains output
- [ ] All errors captured (no truncation)
- [ ] Errors categorized into 7 categories
- [ ] Risk level calculated (low/medium/high/critical)
- [ ] Recommended strategies identified

**Phase 2 Validation (after each strategy):**
- [ ] Strategy executed without errors
- [ ] Validation command passed (e.g., `pnpm typecheck` exit code 0)
- [ ] Expected files created/modified
- [ ] No new errors introduced
- [ ] Progress toward zero blocking errors

**Phase 3 Validation:**
- [ ] Dev process running (ps check confirms)
- [ ] HTTP health checks pass (both apps return 200)
- [ ] Zero errors in 60-second monitoring window
- [ ] Compilation success messages present in logs
- [ ] No TypeScript errors
- [ ] No build errors

**Failure Action:**
- Phase 1 validation fails → Cannot categorize errors → Report to user, request manual debugging
- Phase 2 strategy validation fails → Try alternative approach, escalate to advanced strategies if stuck >3 attempts
- Phase 3 validation fails → Return to Phase 2 with new error details, iterate (max 3 iterations)

---

### Level 3: Final Output Validation

**Validates:** Complete workflow achieved goal (dev servers running without errors)

**Success Criteria:**
1. **Functional:** Dev servers running and accessible via HTTP
2. **Error-Free:** Zero errors in logs (60s monitoring window)
3. **Compilable:** TypeScript compilation successful
4. **Buildable:** Both apps built without errors
5. **Responsive:** HTTP endpoints respond within 5 seconds
6. **Sustainable:** Fixes follow best practices (no hacks, no type safety violations)

**Validation Execution:**
```bash
# Process validation
ps -p $(cat /tmp/dev-pid.txt) # Must return process info

# HTTP validation
curl -s -w "%{http_code}" http://localhost:3000 # Must return 200
curl -s -w "%{http_code}" http://localhost:3001 # Must return 200

# Error validation
grep -iE "(error|exception|fail|critical)" /tmp/dev-output.log | tail -n 50
# Must return no results OR only non-critical warnings

# Compilation validation
grep -E "(Compiled successfully|successfully started)" /tmp/dev-output.log
# Must find success messages
```

**Failure Action:**
Should never reach this point if previous validations work. If final validation fails:
1. Log complete diagnostic information
2. Report to user with full context
3. Request manual debugging
4. Preserve all logs and state for investigation

---

## Rollback Strategy

### When to Rollback

**Triggers:**
1. User cancels after Phase 1 error summary (chooses "No" at approval gate)
2. Phase 2 fixes introduce new errors (validation detects regressions)
3. Phase 3 validation fails 3 consecutive times (persistent issues)
4. User interrupts process mid-execution (Ctrl+C or similar)

### Rollback Mechanism

**Git-Based Rollback (Primary):**

1. **Before Phase 2 (save clean state):**
   ```bash
   # Stash all uncommitted changes
   git add -A
   git stash push -m "Pre-debug snapshot - $(date +%Y%m%d_%H%M%S)"

   # Save stash reference
   STASH_REF=$(git rev-parse stash@{0})
   echo $STASH_REF > /tmp/debug-stash-ref.txt
   ```

2. **On Rollback (restore original state):**
   ```bash
   # Restore from stash
   STASH_REF=$(cat /tmp/debug-stash-ref.txt)
   git stash pop $STASH_REF

   # Clean up tracking file
   rm -f /tmp/debug-stash-ref.txt
   ```

**File-Based Tracking (Secondary):**

Track which files were modified during Phase 2:

```json
{
  "fixes_applied": [
    {
      "strategy": "C",
      "files_created": ["packages/db/node_modules/.prisma/client/index.js"],
      "files_modified": [],
      "reversible": false
    },
    {
      "strategy": "D",
      "files_created": ["apps/api/.env"],
      "files_modified": [],
      "reversible": true,
      "rollback_action": "rm apps/api/.env"
    },
    {
      "strategy": "E",
      "files_created": [],
      "files_modified": ["apps/api/src/auth/controller.ts", "apps/web/src/hooks/useAuth.ts"],
      "reversible": true,
      "rollback_action": "git checkout -- <file>"
    }
  ]
}
```

**Rollback in Reverse Order:**
- Phase 2 completed 3 strategies: C → D → E
- Rollback order: E → D → C (reverse)
- For each strategy: Execute rollback action OR restore from git stash

### Partial Success Handling

**Scenario:** Phase 2 applies 5 strategies, 3 succeed, 2 fail

**Strategy: All-or-Nothing (Recommended)**
- Rollback ALL changes (restore from git stash)
- Report which strategies failed and why
- User can review error details and retry or debug manually
- **Rationale:** Partial fixes may leave system in inconsistent state

**Alternative: Partial Commit (Not Recommended)**
- Commit successful changes
- Report failed strategies to user
- Risk: Partial state may cause unexpected issues

**Implementation:** Use all-or-nothing approach for reliability

### Rollback Report to User

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rollback Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reason: Phase 3 validation failed after 3 attempts

Changes Reverted:
  - Prisma client generation (packages/db/)
  - Environment configuration (apps/api/.env deleted)
  - TypeScript fixes in 5 files (restored from git stash)

Current State: Restored to pre-debug state

Fixes Applied Before Rollback:
  1. Strategy C: Prisma (successful initially)
  2. Strategy D: Environment (successful initially)
  3. Strategy E: TypeScript (fixed 15 errors)

Persistent Issue:
  After applying all fixes, dev servers still show errors:
  - Error: "Cannot connect to database at localhost:5432"
  - Likely cause: PostgreSQL not running

Recommendation:
  Start PostgreSQL: `brew services start postgresql` (macOS)
  Then retry: `/dev:debug`

Logs Preserved:
  - /tmp/dev-output.log (dev server output)
  - /tmp/debug-rollback.log (rollback details)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Tool Abstraction Specifications

### Tool 1: `pnpm tools dev:start-monitored`

**Purpose:** Encapsulate complex bash startup logic with log capture and PID tracking

**Interface:**
```bash
pnpm tools dev:start-monitored [options]

Options:
  --log <file>       Log file path (default: /tmp/dev-output.log)
  --pid <file>       PID file path (default: /tmp/dev-pid.txt)
  --timeout <sec>    Startup timeout (default: 30)
  --env <key=value>  Additional environment variables

Returns (JSON):
  {
    "status": "started" | "failed",
    "pid": 12345,
    "log_file": "/tmp/dev-output.log",
    "pid_file": "/tmp/dev-pid.txt",
    "started_at": "2025-10-22T10:15:30Z"
  }
```

**Responsibilities:**
1. Start `pnpm dev` in background
2. Redirect stdout + stderr to log file
3. Save PID to file for later management
4. Handle startup errors gracefully
5. Return immediately with status

**Implementation Notes:**
```typescript
// tools/src/commands/dev/start-monitored.ts
export async function startMonitored(options: StartOptions) {
  const logFile = options.log || '/tmp/dev-output.log';
  const pidFile = options.pid || '/tmp/dev-pid.txt';

  // Clear old files
  if (existsSync(logFile)) unlinkSync(logFile);
  if (existsSync(pidFile)) unlinkSync(pidFile);

  // Start pnpm dev with output redirection
  const child = spawn('pnpm', ['dev'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...options.env }
  });

  // Pipe output to log file
  const logStream = createWriteStream(logFile, { flags: 'a' });
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  // Save PID
  writeFileSync(pidFile, child.pid.toString());

  // Detach process (continue running after tool exits)
  child.unref();

  return {
    status: 'started',
    pid: child.pid,
    log_file: logFile,
    pid_file: pidFile,
    started_at: new Date().toISOString()
  };
}
```

**Benefits:**
- Encapsulates complex shell scripting
- Consistent error handling
- Testable (can mock spawn)
- Reusable across commands

---

### Tool 2: `pnpm tools dev:categorize-errors`

**Purpose:** Parse dev server output and categorize errors systematically

**Interface:**
```bash
pnpm tools dev:categorize-errors <log-file> [options]

Options:
  --format <json|text>  Output format (default: json)
  --verbose             Include full error messages
  --threshold <n>       Minimum errors per category to report (default: 1)

Returns (JSON):
  {
    "categories": {
      "typescript": {
        "count": 15,
        "files": ["apps/api/src/auth/controller.ts"],
        "errors": [
          {
            "file": "apps/api/src/auth/controller.ts",
            "line": 42,
            "code": "TS2322",
            "message": "Type 'string | undefined' is not assignable to type 'string'"
          }
        ]
      },
      "build": {...},
      "dependency": {...},
      "prisma": {...},
      "environment": {...},
      "runtime": {...},
      "port": {...}
    },
    "summary": {
      "total": 18,
      "critical": 3,
      "risk_level": "medium"
    }
  }
```

**Error Pattern Definitions:**

```typescript
const ERROR_PATTERNS = {
  typescript: {
    regex: /TS\d{4}:|error TS|Type error/,
    parser: (line: string) => {
      const match = line.match(/(.+\.ts):(\d+):(\d+) - error (TS\d{4}): (.+)/);
      return match ? {
        file: match[1],
        line: parseInt(match[2]),
        code: match[4],
        message: match[5]
      } : { message: line };
    }
  },
  build: {
    regex: /Cannot find module|Module not found|import.*failed/,
    parser: (line: string) => {
      const match = line.match(/Cannot find module '([^']+)'/);
      return { message: line, module: match?.[1] };
    }
  },
  dependency: {
    regex: /ERR_PNPM|Cannot find package|peer dependency/,
    parser: (line: string) => {
      const match = line.match(/Cannot find package '([^']+)'/);
      return { message: line, package: match?.[1] };
    }
  },
  prisma: {
    regex: /Prisma schema|prisma generate|migration/i,
    parser: (line: string) => ({ message: line })
  },
  environment: {
    regex: /environment variable|missing.*env|ENV.*not set/i,
    parser: (line: string) => {
      const match = line.match(/environment variable (\w+)/i);
      return { message: line, variable: match?.[1] };
    }
  },
  runtime: {
    regex: /Error:|Exception|UnhandledPromiseRejection/,
    parser: (line: string) => ({ message: line })
  },
  port: {
    regex: /EADDRINUSE|port.*already in use|listen.*EACCES/i,
    parser: (line: string) => {
      const match = line.match(/port (\d+)|:(\d+)/);
      return { message: line, port: match?.[1] || match?.[2] };
    }
  }
};
```

**Risk Level Calculation:**
```typescript
function calculateRiskLevel(categories: ErrorCategories): RiskLevel {
  const critical = categories.port.count + categories.dependency.count;
  const total = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0);

  if (critical > 0) return 'critical';
  if (total > 20) return 'high';
  if (total > 10) return 'medium';
  return 'low';
}
```

**Benefits:**
- Reusable across multiple commands (`/dev:debug`, `/dev:validate`)
- Testable (can test regex patterns independently)
- Consistent categorization logic
- Easy to extend with new error patterns

---

### Tool 3: `pnpm tools dev:health-check`

**Purpose:** Check development server health (processes, HTTP endpoints, compilation status)

**Interface:**
```bash
pnpm tools dev:health-check [options]

Options:
  --format <json|text>     Output format (default: json)
  --timeout <ms>           HTTP request timeout (default: 5000)
  --web-port <port>        Web app port (default: 3000)
  --api-port <port>        API app port (default: 3001)
  --pid-file <file>        PID file to check (default: /tmp/dev-pid.txt)
  --log-file <file>        Log file to scan (default: /tmp/dev-output.log)

Returns (JSON):
  {
    "process": {
      "status": "running" | "stopped" | "crashed",
      "pid": 12345,
      "uptime_seconds": 90
    },
    "web": {
      "url": "http://localhost:3000",
      "status": "ok" | "failed" | "timeout",
      "http_code": 200,
      "response_time_ms": 45,
      "error": null
    },
    "api": {
      "url": "http://localhost:3001",
      "status": "ok" | "failed" | "timeout",
      "http_code": 200,
      "response_time_ms": 23,
      "error": null
    },
    "compilation": {
      "status": "success" | "failed" | "in_progress",
      "messages": ["Compiled successfully", "ready in 1234ms"]
    },
    "overall": "healthy" | "degraded" | "failed"
  }
```

**Health Check Logic:**

```typescript
async function checkHealth(options: HealthCheckOptions) {
  const results = {
    process: await checkProcess(options.pidFile),
    web: await checkHTTP(`http://localhost:${options.webPort}`, options.timeout),
    api: await checkHTTP(`http://localhost:${options.apiPort}`, options.timeout),
    compilation: await checkCompilation(options.logFile)
  };

  // Calculate overall health
  results.overall = calculateOverallHealth(results);

  return results;
}

async function checkProcess(pidFile: string) {
  if (!existsSync(pidFile)) {
    return { status: 'stopped', pid: null, uptime_seconds: 0 };
  }

  const pid = parseInt(readFileSync(pidFile, 'utf-8'));

  try {
    // Check if process exists (signal 0 = check only, don't kill)
    process.kill(pid, 0);

    // Get uptime from ps
    const psOutput = execSync(`ps -p ${pid} -o etime=`).toString().trim();
    const uptime = parseUptime(psOutput);

    return { status: 'running', pid, uptime_seconds: uptime };
  } catch (error) {
    return { status: 'crashed', pid, uptime_seconds: 0 };
  }
}

async function checkHTTP(url: string, timeout: number) {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeout)
    });

    return {
      url,
      status: response.ok ? 'ok' : 'failed',
      http_code: response.status,
      response_time_ms: Date.now() - start,
      error: null
    };
  } catch (error) {
    return {
      url,
      status: error.name === 'TimeoutError' ? 'timeout' : 'failed',
      http_code: 0,
      response_time_ms: Date.now() - start,
      error: error.message
    };
  }
}

async function checkCompilation(logFile: string) {
  if (!existsSync(logFile)) {
    return { status: 'unknown', messages: [] };
  }

  const content = readFileSync(logFile, 'utf-8');

  if (content.includes('Compiled successfully')) {
    return {
      status: 'success',
      messages: extractMessages(content, /Compiled successfully.*/)
    };
  }

  if (content.includes('Failed to compile')) {
    return {
      status: 'failed',
      messages: extractMessages(content, /Failed to compile.*/)
    };
  }

  return { status: 'in_progress', messages: [] };
}

function calculateOverallHealth(results: HealthResults): HealthStatus {
  if (results.process.status !== 'running') return 'failed';
  if (results.web.status === 'failed' || results.api.status === 'failed') return 'failed';
  if (results.compilation.status === 'failed') return 'failed';
  if (results.web.status === 'timeout' || results.api.status === 'timeout') return 'degraded';
  if (results.compilation.status === 'in_progress') return 'degraded';
  return 'healthy';
}
```

**Benefits:**
- Consolidates duplicate health check logic (used in Phase 1 and Phase 3)
- Provides structured output for programmatic consumption
- Reusable by other monitoring/debugging commands
- Easy to extend with additional health checks (database, external services)

---

### Tool 4: `pnpm tools dev:stop`

**Purpose:** Gracefully stop development servers with timeout handling

**Interface:**
```bash
pnpm tools dev:stop [options]

Options:
  --pid-file <file>    PID file to read (default: /tmp/dev-pid.txt)
  --timeout <sec>      Graceful shutdown timeout (default: 10)
  --force              Skip graceful shutdown, kill immediately

Returns (JSON):
  {
    "status": "stopped" | "forced" | "not_running",
    "pid": 12345,
    "method": "SIGTERM" | "SIGKILL",
    "shutdown_time_ms": 234
  }
```

**Implementation:**
```typescript
async function stopServers(options: StopOptions) {
  const pidFile = options.pidFile || '/tmp/dev-pid.txt';

  if (!existsSync(pidFile)) {
    return { status: 'not_running', pid: null, method: null, shutdown_time_ms: 0 };
  }

  const pid = parseInt(readFileSync(pidFile, 'utf-8'));
  const start = Date.now();

  if (options.force) {
    // Immediate kill
    process.kill(pid, 'SIGKILL');
    unlinkSync(pidFile);
    return { status: 'forced', pid, method: 'SIGKILL', shutdown_time_ms: Date.now() - start };
  }

  // Graceful shutdown with timeout
  try {
    process.kill(pid, 'SIGTERM');

    // Wait up to timeout for process to exit
    const maxWait = options.timeout * 1000;
    const checkInterval = 100;
    let waited = 0;

    while (waited < maxWait) {
      try {
        process.kill(pid, 0); // Check if still running
        await sleep(checkInterval);
        waited += checkInterval;
      } catch {
        // Process exited
        unlinkSync(pidFile);
        return { status: 'stopped', pid, method: 'SIGTERM', shutdown_time_ms: Date.now() - start };
      }
    }

    // Timeout reached, force kill
    process.kill(pid, 'SIGKILL');
    unlinkSync(pidFile);
    return { status: 'forced', pid, method: 'SIGKILL', shutdown_time_ms: Date.now() - start };

  } catch (error) {
    return { status: 'not_running', pid, method: null, shutdown_time_ms: Date.now() - start };
  }
}
```

**Benefits:**
- Graceful shutdown prevents data loss
- Timeout handling ensures cleanup
- Consistent shutdown behavior
- Error handling for edge cases

---

## Performance Requirements

### Phase-Level Performance Targets

| Phase | Target Duration | Acceptable Range | Failure Threshold |
|-------|----------------|------------------|-------------------|
| Phase 0: Pre-Flight | <10 seconds | 5-15 seconds | >30 seconds |
| Phase 1: Startup & Analysis | <60 seconds | 45-90 seconds | >120 seconds |
| Phase 2: Error Resolution | <5 minutes | 2-10 minutes | >15 minutes |
| Phase 3: Verification | <90 seconds | 60-120 seconds | >180 seconds |
| **Total (typical)** | **<7 minutes** | **4-12 minutes** | **>20 minutes** |

### Operation-Level Performance

**Tool Performance:**
- `dev:start-monitored`: <2 seconds (process startup)
- `dev:categorize-errors`: <5 seconds (parse 10K line log)
- `dev:health-check`: <10 seconds (HTTP timeout 5s × 2 apps)
- `dev:stop`: <5 seconds (graceful shutdown) OR <1 second (force)

**Subagent Performance:**
- `dev-error-analyzer`: 10-20 seconds (parse + categorize + recommend)
- `lint-debugger`: 30-180 seconds (depends on error count)
- Advanced specialists (parallel): 60-180 seconds (total, not per specialist)

### Optimization Strategies

**Context Efficiency:**
- Main thread: <20K tokens per phase (avg ~15K)
- Subagent delegation: 8x cleaner context (91% noise → 24% useful signal)
- File-based isolation: Logs written to disk, summaries loaded

**Parallel Execution:**
- Advanced specialists (H-L): All invoked in single response
- Time savings: 60%+ vs sequential execution
- Example: 5 specialists × 3 min each = 15 min sequential → 3 min parallel

**Incremental Validation:**
- Validate after each strategy (immediate feedback)
- Don't wait until end of Phase 2 (catch regressions early)
- Fail fast on critical errors (port conflicts block everything)

---

## Success Metrics

### Primary Metrics

**1. Success Rate:**
- **Target:** 95% of common startup issues resolved without manual intervention
- **Measurement:** Track invocations → successful completions (Phase 3 validation passed)
- **Acceptable:** 90-95% success rate
- **Failure:** <85% success rate (indicates strategy gaps)

**2. Time to Resolution:**
- **Target:** 90% of successful runs complete in <7 minutes
- **Measurement:** Time from invocation to Phase 3 success
- **Breakdown:**
  - Simple cases (1-3 errors): <3 minutes
  - Typical cases (5-10 errors): <5 minutes
  - Complex cases (15+ errors): <10 minutes
- **Comparison:** Manual debugging: 15-45 minutes → 3-7 minutes automated (5-10x faster)

**3. Error Detection Accuracy:**
- **Target:** 100% of blocking errors detected and categorized
- **Measurement:** Compare errors found by agent vs manual review of logs
- **False Negatives:** <1% (missing errors is unacceptable)
- **False Positives:** <5% (categorizing non-errors as errors is acceptable)

**4. Fix Success Rate:**
- **Target:** 95% of applied fixes resolve the error
- **Measurement:** Track strategy executions → validation passed
- **Rollback Rate:** <10% (fixes requiring rollback)

**5. Context Efficiency:**
- **Target:** 8x cleaner context through subagent delegation
- **Measurement:** Compare main thread token usage with vs without subagents
- **Baseline:** 169K tokens (all-in-main-thread approach)
- **Optimized:** <25K tokens (subagent delegation approach)

### Secondary Metrics

**6. User Intervention Rate:**
- **Target:** <10% of runs require user manual debugging
- **Measurement:** Track approval gate cancellations + escalations to manual
- **Acceptable:** 5-15%
- **High intervention rate indicates:** Strategy gaps, complex errors not handled

**7. Advanced Strategy Usage:**
- **Target:** 20-30% of runs use advanced strategies (H-L)
- **Measurement:** Track invocations of specialists vs total runs
- **Too Low (<10%):** May indicate simple errors only
- **Too High (>50%):** May indicate basic strategies insufficient

**8. Rollback Rate:**
- **Target:** <5% of runs require rollback to original state
- **Measurement:** Track rollback executions vs total runs
- **High rollback rate indicates:** Fix quality issues, validation gaps

### Comparative Metrics (Manual vs Automated)

| Metric | Manual Debugging | Automated (Target) | Improvement |
|--------|------------------|-------------------|-------------|
| **Time to Resolution** | 15-45 minutes | 3-7 minutes | **5-10x faster** |
| **Error Detection** | 70-85% (manual scan) | 95-100% (systematic) | **20-30% more complete** |
| **Fix Quality** | Variable (depends on developer) | 95% (validated, best practices) | **Consistent quality** |
| **Context Overload** | 50K+ lines manual review | <100 lines summary | **500x less noise** |
| **Success Rate** | 60-80% (first attempt) | 90-95% (systematic) | **15-35% higher** |

---

## Testing & Validation

### Test Scenarios

#### Scenario 1: Fresh Clone (Missing Everything)

**Starting State:**
```bash
git clone <repo>
cd fullstack-starter
# No node_modules, no .env files, no Prisma client
```

**Expected Agent Behavior:**
1. **Phase 0:** Install dependencies via `pnpm install`
2. **Phase 1:** Detect errors:
   - Prisma client not generated
   - Missing .env files (DATABASE_URL, JWT_SECRET)
   - Possibly TypeScript errors if imports reference Prisma
3. **Phase 2:** Apply strategies:
   - Strategy C: Generate Prisma client
   - Strategy D: Create .env files from .env.example
   - Strategy E: Fix any TypeScript errors (if present)
4. **Phase 3:** Verify dev servers start successfully

**Success Criteria:**
- [ ] All dependencies installed
- [ ] Prisma client generated
- [ ] .env files created with dev defaults
- [ ] Dev servers running without errors
- [ ] Total time <5 minutes

---

#### Scenario 2: TypeScript Errors (10-20 errors)

**Starting State:**
```bash
# After git pull, new strict type checking rules introduced
# 15 TypeScript errors across 5 files (type mismatches, null safety)
```

**Expected Agent Behavior:**
1. **Phase 0:** Environment already set up, skip bootstrapping
2. **Phase 1:** Detect 15 TypeScript errors
   - Categorize as "typescript" with count, files, details
   - Recommend Strategy E (delegate to lint-debugger due to >10 threshold)
3. **Phase 2:** Delegate to lint-debugger
   - lint-debugger analyzes all 15 errors
   - Groups by pattern (type imports, null safety, type mismatches)
   - Fixes systematically
   - Re-runs typecheck until zero errors
4. **Phase 3:** Verify compilation successful

**Success Criteria:**
- [ ] All 15 TypeScript errors detected
- [ ] Delegation to lint-debugger triggered (threshold >10)
- [ ] Zero TypeScript errors after fixes
- [ ] Type safety standards maintained (no `any`, type guards used)
- [ ] Total time <3 minutes

---

#### Scenario 3: Port Conflict

**Starting State:**
```bash
# Dev server already running from previous session
# User invokes /dev:debug (expects automatic handling)
```

**Expected Agent Behavior:**
1. **Phase 0:** Detect running processes on ports 3000/3001
   - Ask user: "Dev servers appear running. Kill and restart? (Y/n)"
   - User chooses Yes
   - Kill processes
2. **Phase 1:** Start dev servers (no port conflicts)
   - No errors expected (previous servers stopped cleanly)
3. **Phase 2:** Skip (no errors)
4. **Phase 3:** Verify servers running

**Success Criteria:**
- [ ] Running processes detected in Phase 0
- [ ] User prompted for confirmation
- [ ] Processes killed successfully
- [ ] New servers start without port conflicts
- [ ] Total time <2 minutes

---

#### Scenario 4: Monorepo Module Resolution Error

**Starting State:**
```bash
# Error: "Cannot find module '@starter/utils'"
# Issue: package.json exports misconfigured (pointing to .ts instead of .js)
```

**Expected Agent Behavior:**
1. **Phase 0:** Environment ready
2. **Phase 1:** Detect build error
   - Categorize as "build" with module resolution details
   - Recommend Strategy F (Build/Import Resolution)
3. **Phase 2:** Apply Strategy F
   - Initial attempts fail (import paths seem correct)
   - After 2 failures, escalate to advanced strategies
   - **Gate 2:** Prompt user about specialist invocation
   - User approves
   - Invoke specialists in parallel:
     - stack-trace-analyzer: Identifies exact error location
     - monorepo-specialist: Diagnoses package.json exports issue
     - best-practices-researcher: Validates against official patterns
   - Specialists return: package.json "exports" should point to dist/*.js not src/*.ts
   - Apply fix: Update package.json exports
   - Run pnpm install (update internal links)
4. **Phase 3:** Verify servers start successfully

**Success Criteria:**
- [ ] Build error detected and categorized
- [ ] Basic strategy attempted first
- [ ] Escalation to specialists triggered after failures
- [ ] User approval obtained (Gate 2)
- [ ] Specialists invoked in parallel (single response)
- [ ] Root cause identified (exports misconfiguration)
- [ ] Fix applied aligns with official best practices
- [ ] Total time <7 minutes (includes specialist analysis)

---

#### Scenario 5: Already Running Successfully

**Starting State:**
```bash
# Dev servers running without errors
# User invokes /dev:debug (checking health)
```

**Expected Agent Behavior:**
1. **Phase 0:** No running processes detected (or user asks to keep)
   - Actually, this is edge case: processes ARE running
   - Prompt: "Dev servers appear running. Kill and restart? (Y/n)"
   - User chooses No (keep running)
   - **Early Exit:** Don't proceed to Phase 1
   - Report: "Dev servers already running. Skipping debug."
2. **Alternative Flow (User Chooses Yes):**
   - Kill processes
   - Phase 1: Start fresh, detect zero errors
   - Phase 2: Skip (nothing to fix)
   - Phase 3: Verify health
   - Report: "Dev servers restarted successfully. Zero errors."

**Success Criteria:**
- [ ] Running processes detected
- [ ] User choice respected
- [ ] If "No": Early exit with informative message
- [ ] If "Yes": Clean restart with verification
- [ ] No unnecessary work performed
- [ ] Total time <1 minute (early exit) or <2 minutes (restart)

---

#### Scenario 6: Complex Build System Error (Requires Multiple Specialists)

**Starting State:**
```bash
# Error: Module system mismatch
# Symptom: "SyntaxError: Unexpected token 'export'" at runtime
# Root cause: package.json "type": "module" but built output is CommonJS
# Complexity: Requires understanding NestJS + webpack + PNPM + module systems
```

**Expected Agent Behavior:**
1. **Phase 0:** Environment ready
2. **Phase 1:** Detect runtime error
   - Categorize as "runtime" with stack trace details
   - Recommend Strategy G (Runtime Error Fixes)
3. **Phase 2:** Apply Strategy G
   - Initial fix attempts fail (trying to fix symptoms)
   - After spending >15 min or 3 failures:
     - Escalate to advanced strategies
     - **Gate 2:** Inform user about specialist invocation
     - User approves
     - Invoke **4 specialists in parallel** (single response):
       - stack-trace-analyzer: Parse error, identify module loading issue
       - monorepo-specialist: Diagnose package.json configuration
       - build-system-debugger: Analyze module system mismatch
       - best-practices-researcher: Find official NestJS + PNPM patterns
   - **Wait for all specialists** (parallel execution ~2-3 min)
   - **Compare recommendations:**
     - stack-trace-analyzer: "Module system mismatch - CommonJS loading ESM"
     - monorepo-specialist: "Change package.json 'type' to 'commonjs'"
     - build-system-debugger: "NestJS backend should use CommonJS"
     - best-practices-researcher: "Official NestJS docs recommend CommonJS"
   - **Consensus:** Change "type": "module" → "type": "commonjs" in affected package
   - Apply fix
   - Clear build caches
4. **Phase 3:** Verify servers start successfully

**Success Criteria:**
- [ ] Complex error detected (runtime + build system interaction)
- [ ] Basic strategies attempted first
- [ ] Escalation triggered (>15 min OR 3 failures)
- [ ] 4 specialists invoked in parallel (not sequential)
- [ ] All specialists complete within 3 minutes
- [ ] Recommendations compared and consensus found
- [ ] Official pattern applied (not hack)
- [ ] Total time <8 minutes (includes specialist analysis time)

**Performance Validation:**
- Without specialists: 45+ minutes manual debugging, likely hack solution
- With sequential specialists: 4 × 5 min = 20 min
- **With parallel specialists: <3 min analysis + 1 min fix = 4 min total**
- **Time savings: 90%+ vs manual, 75%+ vs sequential**

---

### Validation Methodology

**For Each Scenario:**

1. **Setup:**
   - Create clean test environment
   - Apply scenario-specific starting state
   - Document expected errors

2. **Execute:**
   - Invoke `/dev:debug`
   - Monitor execution through all phases
   - Record timings, decisions, delegations

3. **Validate Success Criteria:**
   - Check all checkboxes for scenario
   - Verify time within acceptable range
   - Confirm error detection accuracy
   - Validate fix quality (no hacks, type safety maintained)

4. **Document Results:**
   - Actual time vs target
   - Errors detected vs expected
   - Fixes applied (list)
   - Any deviations from expected behavior

5. **Regression Prevention:**
   - Add scenario as automated test (if possible)
   - Update error patterns if new patterns discovered
   - Document edge cases for future reference

---

## Open Questions

### Implementation Questions

- [ ] **Should `dev:categorize-errors` be a tool or part of dev-error-analyzer subagent?**
  - **Option A:** Standalone tool (fast, reusable, testable)
  - **Option B:** Part of subagent (more integrated, single abstraction)
  - **Recommendation:** Standalone tool (better separation of concerns, reusable by other commands)

- [ ] **What threshold for invoking advanced strategies automatically vs asking user?**
  - **Current:** Ask user at Gate 2 before invoking specialists
  - **Alternative:** Automatically invoke if stuck >15 min (no gate)
  - **Trade-off:** User control vs automation speed
  - **Recommendation:** Keep Gate 2 for transparency, but make default "Yes" with 30s timeout

- [ ] **Should we support selective fix strategies?**
  - **Example:** User requests "fix only TypeScript errors, skip environment setup"
  - **Use Case:** Developer wants targeted fixes, not full automation
  - **Implementation:** Add flags like `--only typescript,prisma` or `--skip environment`
  - **Recommendation:** Yes, add in future version (v2.1) after core functionality stable

### Tool Design Questions

- [ ] **Should health-check tool validate database connectivity?**
  - **Pros:** Comprehensive health validation
  - **Cons:** Adds complexity, requires database credentials
  - **Recommendation:** Add as optional check (`--check-database` flag)

- [ ] **Should tools support custom ports?**
  - **Current:** Hardcoded 3000 (web), 3001 (API)
  - **Alternative:** Read from .env or accept as parameters
  - **Recommendation:** Support via flags, default to standard ports

### Strategy Questions

- [ ] **Should Strategy E threshold (10 errors) be configurable?**
  - **Use Case:** Some teams may want delegation at 5 errors, others at 20
  - **Implementation:** Add `--delegate-threshold <n>` flag
  - **Recommendation:** Keep 10 as default, allow override in future version

- [ ] **When should we use root-cause-analyst vs other specialists?**
  - **Current:** User can invoke any specialist manually
  - **Clearer Guidance:** Decision tree could be more prescriptive
  - **Recommendation:** Add examples showing which specialist for which error type

---

## Future Enhancements

### Version 2.1 Enhancements

**1. Selective Strategy Execution**
- Add flags: `--only <strategies>`, `--skip <strategies>`
- Use case: Developer wants targeted fixes only
- Example: `/dev:debug --only typescript,prisma` (skip env, deps)

**2. Learning Mode**
- Track which errors are most common
- Suggest preventive measures (e.g., "Add pre-commit hook for typecheck")
- Analyze fix success rates, refine strategies

**3. Integration with CI/CD Failure Recovery**
- If CI fails due to startup errors, automatically invoke `/dev:debug` logic
- Apply fixes, create PR with changes
- Notify developer of auto-applied fixes

**4. Performance Profiling Integration**
- After successful startup, optionally run performance checks
- Identify slow compilation, slow tests, bundle size issues
- Report to user with recommendations

### Version 3.0 Enhancements

**5. Machine Learning for Error Pattern Recognition**
- Train model on error logs → categorization
- Improve accuracy beyond regex patterns
- Predict error category before full log analysis

**6. Automated Test Generation for Fixed Errors**
- When error fixed, generate test that would catch regression
- Add to test suite automatically (or prompt user)
- Example: Fixed null safety issue → generate test for null input

**7. Multi-Repository Support**
- Extend to handle errors across multiple repos (microservices)
- Coordinate fixes across repos
- Maintain dependency ordering

**8. Interactive Debugging Mode**
- Step-by-step execution with user approval at each strategy
- Educational mode for junior developers
- Show reasoning for each decision

---

## References

### Current Implementation
- **v1.0 Command:** `.claude/commands/dev/debug.md` (1,796 lines)
- **Analysis Document:** `ai/docs/debug-command-analysis.md` (comprehensive review)

### Research & Guidelines
- **Agent Optimization Research:** `ai/docs/agent-optimization-research.md`
  - Section 4: Context Optimization (8x efficiency research)
  - Section 6: Recommendations for Debug Command
- **Agent PRD Guidelines:** `ai/agents/AGENT_PRD_GUIDELINES.md`
  - Orchestration patterns
  - Phase definition templates
  - Tool abstraction guidelines
  - Example quality standards

### Official Anthropic Sources
- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
- [Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Community Best Practices
- [Jason Liu: Context Engineering - Slash Commands vs Subagents](https://jxnl.co/writing/2025/08/29/context-engineering-slash-commands-subagents/)
  - 8x efficiency research
  - Parallel execution patterns

### Related Agents
- **lint-debugger:** Built-in TypeScript/lint error fixer
- **root-cause-analyst:** `.claude/agents/validation/root-cause-analyst.md`
- **stack-trace-analyzer:** `.claude/agents/validation/stack-trace-analyzer.md`
- **common-error-researcher:** `.claude/agents/validation/common-error-researcher.md`
- **best-practices-researcher:** `.claude/agents/validation/best-practices-researcher.md`
- **monorepo-specialist:** `.claude/agents/infrastructure/monorepo-specialist.md`
- **build-system-debugger:** `.claude/agents/infrastructure/build-system-debugger.md`

### Project Documentation
- **CLAUDE.md:** Project-wide standards and conventions
- **PLAYBOOK_DRAFT.md:** Development workflows and templates
- **tools/README.md:** CLI tools architecture and usage

---

**End of PRD**

---

## Appendix A: Error Categorization Examples

### TypeScript Error Example
```
apps/api/src/auth/controller.ts:42:15 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.

42     const user: string = req.user?.name;
                  ~~~~~~

Category: typescript
File: apps/api/src/auth/controller.ts
Line: 42
Code: TS2322
Message: Type 'string | undefined' is not assignable to type 'string'
Recommended Strategy: E (TypeScript fixes - delegate if >10 errors)
Priority: 5
```

### Prisma Error Example
```
Error:
  @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.

Category: prisma
Message: Prisma client not generated
Recommended Strategy: C (Prisma client generation)
Priority: 3
```

### Environment Error Example
```
Error: Environment variable DATABASE_URL is required but not set

Category: environment
Variable: DATABASE_URL
Recommended Strategy: D (Environment configuration)
Priority: 4
```

### Port Conflict Error Example
```
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1740:16)

Category: port
Port: 3000
Recommended Strategy: A (Port conflict resolution)
Priority: 1
```

---

## Appendix B: Advanced Strategy Invocation Example

**Scenario:** Stuck on module resolution error for 17 minutes

**Gate 2 Presentation:**
```
Complex Issue Detected - Specialist Assistance Recommended

Situation:
  - Standard fix strategies attempted: 3 times
  - Time spent on current error: 17 minutes
  - Error category: Module resolution

Invoking specialists in parallel:
  → stack-trace-analyzer
  → monorepo-specialist
  → best-practices-researcher

Expected time: 2-3 minutes
Proceed? (Y/n)
```

**Parallel Invocation (single response, multiple Task calls):**
```typescript
// Main agent sends ONE response with all Task invocations:

Task({
  subagent_type: "stack-trace-analyzer",
  description: "Parse module resolution error and identify exact issue",
  prompt: `Analyze this error and stack trace:

  Error: Cannot find module '@starter/utils'
  [full stack trace...]

  Identify:
  1. Exact error location (file:line)
  2. Module being imported
  3. Why resolution failed
  4. Call sequence leading to error`
});

Task({
  subagent_type: "monorepo-specialist",
  description: "Diagnose PNPM workspace configuration",
  prompt: `Diagnose this monorepo module resolution issue:

  Error: Cannot find module '@starter/utils'

  Our setup:
  - PNPM 9.15.0 workspaces
  - workspace:* protocol
  - NestJS 10 with webpack

  Analyze:
  1. Is package.json exports configured correctly?
  2. Are tsconfig paths aligned?
  3. Is webpack externals configured?
  4. Provide specific fixes`
});

Task({
  subagent_type: "best-practices-researcher",
  description: "Find official NestJS + PNPM patterns",
  prompt: `Research official best practices for:

  Topic: NestJS + PNPM workspace integration

  Question: How should workspace packages be configured
  for proper module resolution in NestJS apps?

  Search official sources only (docs.nestjs.com, pnpm.io)
  Compare our setup vs official recommendations`
});

// All three execute in parallel, main thread waits for all results
```

**Synthesis of Results:**
```
Specialist Results (completed in 2m 15s):

stack-trace-analyzer:
  - Error location: apps/api/src/auth/controller.ts:5
  - Module: @starter/utils (workspace package)
  - Root cause: Module resolution failing at runtime
  - Likely: package.json exports pointing to wrong files

monorepo-specialist:
  - Issue found: packages/utils/package.json
  - "exports" points to src/*.ts (TypeScript source)
  - Should point to dist/*.js (compiled output)
  - Fix: Update exports to "./dist/*.js"

best-practices-researcher:
  - Official pattern (pnpm.io docs):
    Workspace packages should export compiled files
  - Example from official repo:
    "exports": { ".": "./dist/index.js" }
  - Our current: "exports": { ".": "./src/index.ts" }
  - Recommendation: Match official pattern

Consensus: Change exports to point to dist/*.js (compiled)
Confidence: HIGH (all 3 specialists agree on root cause)

Applying fix: Update packages/utils/package.json exports
```

---

## Appendix C: Success Report Template

**Full Success Report (presented at end of Phase 3):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Development Servers Running Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Final Verification Results:

Server Status:
  ✓ Dev Process: RUNNING (PID: 12456, uptime: 1m 30s)
  ✓ Web App: http://localhost:3000 - OK (200, 45ms)
  ✓ API App: http://localhost:3001 - OK (200, 23ms)

Error Analysis:
  ✓ Compilation: Success - No errors
  ✓ TypeScript: Success - 0 errors
  ✓ Build: Success - Both apps built
  ✓ Runtime: Success - No errors in 60s

Applications Ready:
  → Web: http://localhost:3000
  → API: http://localhost:3001
  → API Docs: http://localhost:3001/api

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary of Fixes Applied:

Phase 2 Execution (3m 45s):
  1. Prisma client generated (Strategy C)
  2. Environment configured - 2 variables (Strategy D)
  3. TypeScript errors fixed - 15 errors (Strategy E - delegated to lint-debugger)

Files Modified: 6 files
  - apps/api/.env (created)
  - apps/api/src/auth/controller.ts (type imports fixed)
  - apps/api/src/users/service.ts (null handling added)
  - apps/web/src/hooks/useAuth.ts (type guards added)
  - apps/web/src/components/Button.tsx (import path fixed)
  - + 1 more file

Total Execution Time: 5m 12s
  - Phase 0: Pre-Flight (8s)
  - Phase 1: Error Analysis (42s)
  - Phase 2: Systematic Fixes (3m 45s)
  - Phase 3: Verification (37s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monitoring Instructions:

  View live logs:
    tail -f /tmp/dev-output.log

  Check server status:
    pnpm tools dev:health-check

  Stop servers when done:
    pnpm tools dev:stop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Open http://localhost:3000 in browser
  2. Test application functionality
  3. Make changes - hot reload is active
  4. Servers will continue running until stopped

Your development environment is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**PRD Version:** 2.0
**Completion Date:** 2025-10-22
**Status:** Ready for Review
**Next Steps:**
1. Review PRD with stakeholders
2. Create new tools (dev:start-monitored, dev:categorize-errors, dev:health-check)
3. Create dev-error-analyzer subagent
4. Implement optimized /dev:debug command following this PRD
5. Test against all 6 scenarios
6. Deploy as /dev:debug-v2 alongside v1.0 for comparison
