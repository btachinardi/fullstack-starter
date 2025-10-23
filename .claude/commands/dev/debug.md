---
description: Run pnpm dev and systematically fix all errors until applications are running successfully
model: claude-sonnet-4-5
---

# /dev:debug

Run `pnpm dev` and systematically fix all errors until development servers are running successfully without errors.

## When to Use This Command

Invoke `/dev:debug` when:

- Development servers fail to start
- Startup errors are preventing compilation or runtime
- You need systematic error diagnosis and fixing
- Multiple error types appear and you want automated triage
- You want dependency-aware fix prioritization (avoid wasted effort)

## What This Command Does

1. **Validates environment** (Node, PNPM, dependencies) before attempting startup
2. **Starts dev servers with monitoring** and captures all error output
3. **Categorizes errors systematically** (TypeScript, Prisma, dependencies, environment, ports, build, runtime)
4. **Fixes errors in dependency-aware priority order** (ports → deps → Prisma → env → types → runtime)
5. **Delegates complex debugging** to specialized subagents when stuck (8x context efficiency)
6. **Validates success comprehensively** (HTTP health checks, process validation, log scanning)
7. **Keeps servers running** for continued development

## Success Criteria

- ✅ Both API and web development servers running
- ✅ Zero errors in logs (60-second monitoring window)
- ✅ HTTP endpoints accessible (localhost:3000 and :3001)
- ✅ TypeScript compilation successful
- ✅ Hot reload working
- ✅ All fixes follow best practices (no hacks, no type safety violations)

---

## Context & Prerequisites

### Project Context

- **Monorepo:** PNPM workspace with Turborepo orchestration
- **Applications:**
  - `api`: NestJS 10 + Fastify (port 3001)
  - `web`: React 18 + Vite 6 (port 3000)
- **Development command:** `pnpm dev` (starts both apps in parallel)
- **Individual commands:** `pnpm dev:api`, `pnpm dev:web`
- **Type system:** TypeScript 5.7 with strict mode
- **Linter:** Biome 1.9+

### Common Error Categories

1. **TypeScript Errors** - Type mismatches, missing types, strict mode violations
2. **Build/Import Errors** - Module not found, import resolution failures
3. **Dependency Issues** - Missing packages, version conflicts
4. **Prisma Issues** - Schema validation, client not generated, migrations
5. **Environment Issues** - Missing `.env` variables, invalid configuration
6. **Runtime Errors** - Server crashes, API failures, unhandled exceptions
7. **Port Conflicts** - Ports already in use by other processes

### Required Tools

**NOTE:** These tools need to be implemented in the `tools/` package:

- **`pnpm tools dev:start-monitored`** - Start dev servers with log capture
- **`pnpm tools dev:categorize-errors`** - Parse and categorize error logs
- **`pnpm tools dev:health-check`** - Validate server health (HTTP + process)

### Prerequisites

- Node.js 20.18.0+ installed
- PNPM 9.15.0+ installed
- Git repository initialized
- `package.json` exists at project root

### Available Subagents

**Built-In:**

- **lint-debugger** - Fixes TypeScript and linting errors systematically

**Analysis Specialists (Research & Guidance):**

- **root-cause-analyst**

  - **When:** Stuck >15 min, tried 2-3 solutions, considering hacks
  - **What:** Analyzes root cause, suggests 3-5 alternatives, ranks by best practices
  - **Use for:** Complex bugs, unclear root cause, evaluating solution approaches

- **stack-trace-analyzer**

  - **When:** Complex multi-file stack traces, unclear error origin
  - **What:** Parses traces, identifies call sequence, pinpoints exact error location
  - **Use for:** NestJS dependency errors, async errors, webpack trace parsing

- **common-error-researcher**

  - **When:** Unfamiliar error, framework-specific issue, need community solutions
  - **What:** Searches GitHub issues, Stack Overflow, finds proven solutions
  - **Use for:** Error messages you haven't seen, known framework bugs

- **best-practices-researcher**
  - **When:** Need official guidance, validating configuration, learning proper patterns
  - **What:** Searches official docs, official repos, core team blogs only
  - **Use for:** "What's the right way to configure X?", verifying against official patterns

**Domain Specialists (Configuration & Fixes):**

- **monorepo-specialist**

  - **When:** PNPM workspace issues, package resolution, build output problems
  - **What:** Expert in NestJS + Turborepo + PNPM integration
  - **Use for:** Module resolution, workspace packages, monorepo build issues

- **build-system-debugger**
  - **When:** Webpack/Vite errors, TypeScript compilation, module system conflicts
  - **What:** Diagnoses webpack, Vite, TypeScript config issues
  - **Use for:** Build failures, dist structure, CommonJS/ESM conflicts

---

## Quick Decision Tree

When encountering errors, use this decision tree for strategy selection:

**Basic Strategies:**

1. **Port conflict?** → A (kill process or change port)
2. **Module not found / dependency error?** → B (install packages)
3. **Prisma error?** → C (generate client, validate schema)
4. **Missing env var?** → D (create/update .env files)
5. **TypeScript errors?** → E (<10: manual fix, >10: delegate)
6. **Import resolution / "Cannot find module"?** → F (fix paths)
7. **Runtime crash / exception?** → G (analyze stack, fix code)

**Advanced Strategies (when stuck):** 8. **Error unclear / complex stack?** → L (stack-trace-analyzer) 9. **Configuration question?** → I-B (best-practices-researcher) 10. **Known error but unfamiliar?** → I (common-error-researcher) 11. **Monorepo issue?** → J (monorepo-specialist) 12. **Build problem?** → K (build-system-debugger) 13. **Still stuck after multiple attempts?** → H (root-cause-analyst)

**Multi-Specialist Pattern (when comprehensive analysis needed):**
Invoke 3-4 specialists in PARALLEL (single response):

- Stack Trace Analyzer (understand error)
- Common Error Researcher (find solutions)
- Best Practices Researcher (validate official docs)
- Domain specialist (Monorepo or Build System)

Time savings: 5-10 min parallel analysis → consensus solution vs 45+ min trial-and-error

---

## Workflow Overview

```
User invokes /dev:debug
    ↓
[Phase 0: Pre-Flight Checks] (<10s)
    ├→ Check Node.js / PNPM / Git
    ├→ Check running processes (kill if needed)
    └→ Verify dependencies (install if needed)
    ↓
[Phase 1: Monitored Startup & Analysis] (~45s)
    ├→ pnpm tools dev:start-monitored
    ├→ Wait 30 seconds (monitoring)
    └→ pnpm tools dev:categorize-errors
    ↓
User Approval Gate: Error summary
    ↓
[Phase 2: Systematic Resolution] (2-5 min)
    ├→ Basic Strategies A-G (priority order)
    │   ├→ A: Port conflicts
    │   ├→ B: Dependencies
    │   ├→ C: Prisma
    │   ├→ D: Environment
    │   ├→ E: TypeScript (delegate if >10 errors)
    │   ├→ F: Build/Import
    │   └→ G: Runtime
    │
    └→ IF STUCK (>15 min OR 3 failures):
        Advanced Strategies H-L (parallel)
        ├→ H: root-cause-analyst
        ├→ I: common-error-researcher
        ├→ I-B: best-practices-researcher
        ├→ J: monorepo-specialist
        ├→ K: build-system-debugger
        └→ L: stack-trace-analyzer
    ↓
[Phase 3: Verification] (~90s)
    ├→ pnpm tools dev:health-check
    └→ Validate 60 seconds (HTTP + logs + compilation)
    ↓
Success → Monitoring commands
```

**Execution Pattern:**

- Phases execute sequentially (0 → 1 → 2 → 3)
- Basic strategies (A-G) apply in priority order
- Advanced strategies (H-L) invoked in parallel when stuck
- TodoWrite tracks real-time progress

---

## Phase 0: Pre-Flight Checks

**Objective:** Validate environment readiness before attempting dev server startup

**When to execute:** Immediately upon command invocation

**Process:**

1. **Check Prerequisites**

   Verify required tools installed:

   ```bash
   node --version    # Must be ≥ 20.18.0
   pnpm --version    # Must be ≥ 9.15.0
   test -d .git      # Git repo must exist
   test -f package.json  # Root package.json must exist
   ```

   **Expected Output:** Version numbers and file existence confirmation

   **Validation:** [ ] All prerequisites met

2. **Check Running Processes**

   Scan for existing dev server processes:

   ```bash
   ps aux | grep -E "(vite|nest)" | grep -v grep
   ```

   **If processes found:**

   - Present to user: "Dev servers appear to be running. Kill and restart? (Y/n)"
   - Yes: `kill -9 <PID>` for each process
   - No: Exit with message to stop servers manually

   **Expected Output:** List of PIDs or empty result

   **Validation:** [ ] No conflicting processes remain

3. **Check Dependencies**

   Verify node_modules and lockfile:

   ```bash
   test -d node_modules && test -f pnpm-lock.yaml
   ```

   **If missing:** Run `pnpm install` to bootstrap

   **Expected Output:** Confirmation of existence or installation logs

   **Validation:** [ ] Dependencies installed

**Success Criteria:**

- [ ] Node 20.18.0+ and PNPM 9.15.0+ installed
- [ ] No conflicting dev server processes
- [ ] Dependencies exist (`node_modules/` and `pnpm-lock.yaml`)
- [ ] Environment ready to start dev servers

**Failure Handling:**

- **If:** Prerequisites missing → **Then:** Report error, exit (cannot proceed)
- **If:** User declines to kill processes → **Then:** Exit with manual stop instructions
- **If:** `pnpm install` fails → **Then:** Report error, exit (cannot proceed without deps)

**Tools Used:** Task tool for direct bash operations

**Time Target:** <10 seconds

---

## Phase 1: Monitored Startup & Error Analysis

**Objective:** Start dev servers with monitoring, capture all errors, and categorize systematically

**When to execute:** After Phase 0 validation succeeds

**Process:**

1. **Start Development Servers with Monitoring**

   Execute monitored startup tool:

   ```bash
   pnpm tools dev:start-monitored --log /tmp/dev-output.log --pid /tmp/dev-pid.txt
   ```

   **NOTE:** This tool needs to be implemented. It should:

   - Start `pnpm dev` in background
   - Redirect stdout + stderr to log file
   - Save process ID to PID file
   - Return immediately with startup status

   **Expected Output:** Startup confirmation with PID

   **Validation:** [ ] Dev servers started (process exists)

2. **Monitor Initial Startup**

   Wait for compilation and error detection:

   ```bash
   sleep 30
   ```

   Allow time for:

   - Initial compilation
   - Module resolution
   - TypeScript checking
   - Server startup

   **Expected Output:** Time elapsed

   **Validation:** [ ] 30 seconds elapsed

3. **Categorize Errors**

   Parse log file and categorize errors:

   ```bash
   pnpm tools dev:categorize-errors /tmp/dev-output.log --format json
   ```

   **NOTE:** This tool needs to be implemented. It should return structured JSON with error categories, counts, details, and risk level assessment.

   **Expected Output:** Structured JSON with error categories

   **Validation:** [ ] Errors categorized by type

4. **Assess Server Health**

   Check process and HTTP endpoint status:

   ```bash
   pnpm tools dev:health-check --format json
   ```

   **NOTE:** This tool needs to be implemented. It should return process status, HTTP status for both apps, and overall health.

   **Expected Output:** JSON with health status

   **Validation:** [ ] Server health assessed

5. **Create Error Summary**

   Aggregate results for user presentation:

   - Total error count
   - Breakdown by category
   - Most critical issues (blocking errors)
   - Recommended fix strategy
   - Estimated fix time

   **Expected Output:** Structured summary for user approval gate

   **Validation:** [ ] Summary created with recommendations

6. **Present to User (Approval Gate 1)**

   Show comprehensive error report:

   ```
   Development Server Debug - Error Summary

   Found 23 errors preventing dev server startup:

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Error Categories:
     ✗ TypeScript: 15 errors across 5 files
     ✗ Prisma: Client not generated
     ✗ Environment: 2 missing variables

   Risk Level: MEDIUM
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Most Critical Issues:
     1. Prisma client not generated → API will crash
     2. Missing DATABASE_URL → Blocks Prisma
     3. 15 TypeScript errors → Prevents compilation

   Recommended Fix Strategy:
     1. Generate Prisma client (Strategy C)
     2. Configure environment (Strategy D)
     3. Delegate TypeScript to lint-debugger (Strategy E)

   Estimated Time: 3-5 minutes

   Proceed with automated fixes? (Y/n)
   ```

   **User Options:**

   - Y: Continue to Phase 2
   - n: Exit (manual debugging)
   - Timeout (30s): Default yes

   **Validation:** [ ] User approval received

7. **Stop Dev Servers**

   Clean shutdown for fixing:

   ```bash
   kill $(cat /tmp/dev-pid.txt 2>/dev/null) 2>/dev/null
   ```

   **Expected Output:** Process terminated

   **Validation:** [ ] Servers stopped

**Success Criteria:**

- [ ] Dev servers started (even with errors)
- [ ] All errors captured in log file
- [ ] Errors categorized into 7 categories
- [ ] Error counts accurate
- [ ] Server health assessed
- [ ] Fix strategy identified
- [ ] User informed and approved

**Failure Handling:**

- **If:** Dev servers crash immediately → **Then:** Report to user, attempt recovery in Phase 2
- **If:** Log file empty → **Then:** Use stderr as fallback
- **If:** User declines fixes → **Then:** Exit gracefully

**Tools Used:**

- `pnpm tools dev:start-monitored` (NOTE: To be implemented)
- `pnpm tools dev:categorize-errors` (NOTE: To be implemented)
- `pnpm tools dev:health-check` (NOTE: To be implemented)

**Time Target:** ~45 seconds

---

## Phase 2: Systematic Error Resolution

**Objective:** Fix all identified errors using dependency-aware priority order and specialized strategies

**When to execute:** After Phase 1 approval gate

**Process:**

### Introduction

Apply fixes in **strict priority order** based on error categories. This order ensures dependencies are resolved before dependent systems:

**Priority Order:**

1. Port Conflicts (A) - CRITICAL: Blocks all startups
2. Dependencies (B) - HIGH: Required before code runs
3. Prisma (C) - HIGH: Required for API functionality
4. Environment (D) - MEDIUM: Required for configuration
5. TypeScript (E) - MEDIUM: Prevents compilation
6. Build/Import (F) - MEDIUM: Prevents bundling
7. Runtime (G) - LOW: Happens after startup

**Delegation Strategy:**

- **Basic strategies (A-G):** Handle standard, well-understood error types
- **Advanced strategies (H-L):** Invoke specialists when stuck (>15 min OR 3 failed attempts)
- **Parallel invocation:** All advanced specialists invoked simultaneously for 8x efficiency

### Basic Strategies (A-G)

#### Strategy A: Port Conflict Resolution

**When:** Port conflict errors detected (EADDRINUSE, "address already in use")

**What it does:** Identifies process using ports 3000/3001 and resolves conflicts

**Why use this:** Ports must be free before dev servers can start. This is a blocking issue preventing all other fixes from being testable.

**Priority:** 1 (CRITICAL - must fix first)

**Steps:**

1. Identify conflicting process: `lsof -i :3000 -i :3001 | grep LISTEN`
2. Present options to user:
   - **Option A:** Kill process: `kill -9 [PID]`
   - **Option B:** Change port in `.env` files
3. Execute chosen solution
4. Verify ports free: `lsof -i :3000 -i :3001` (should return empty)

**Validation:**

- [ ] Port 3000 is free
- [ ] Port 3001 is free
- [ ] No conflicting processes remain

**Failure:** If ports still occupied → Manual intervention required

---

#### Strategy B: Dependency Resolution

**When:** Module not found, package missing, version conflicts, peer dependency errors

**What it does:** Installs missing packages, resolves version conflicts, repairs workspace dependencies

**Why use this:** Missing or conflicting dependencies prevent code from executing. Must be resolved before any code fixes.

**Priority:** 2 (HIGH - required before code runs)

**Steps:**

1. Extract missing package names from error messages
2. Determine workspace context (which app needs dependency)
3. Install missing packages:
   - Workspace: `cd [workspace] && pnpm add [package]`
   - Root: `pnpm add -w [package]`
4. Resolve conflicts: `pnpm install --force` OR `pnpm update [package]`
5. Verify: `pnpm install --frozen-lockfile` (should succeed)

**Validation:**

- [ ] All missing packages installed
- [ ] No version conflicts remain
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] Package in `node_modules/`

**Failure:** If installation fails → Check package name, version compatibility, registry access

---

#### Strategy C: Prisma Issues

**When:** Prisma schema errors, migration needed, client not generated, database connection issues

**What it does:** Validates Prisma schema, generates client, checks database connectivity

**Why use this:** Prisma client must exist before API code can compile. Missing client causes TypeScript errors AND runtime crashes.

**Priority:** 3 (HIGH - API cannot function without Prisma)

**Steps:**

1. Validate schema: `cd apps/api && pnpm prisma validate`
   - If invalid: Fix schema syntax, re-validate
2. Generate client: `pnpm prisma generate`
3. Check migrations: `pnpm prisma migrate status`
4. Verify DB connection: `pnpm prisma db pull` (if needed)

**Validation:**

- [ ] Schema valid (`prisma validate` succeeds)
- [ ] Client generated (files in `packages/db/node_modules/.prisma/client/`)
- [ ] No migration errors
- [ ] DB connection successful (if required)

**Failure:** If schema invalid → Fix syntax errors; If DB unreachable → Start database service

---

#### Strategy D: Environment Configuration

**When:** Missing environment variables, configuration errors, invalid env file format

**What it does:** Creates/updates `.env` files with required variables, sets development defaults

**Why use this:** Environment variables required for Prisma, API, and services. Missing vars cause startup failures.

**Priority:** 4 (MEDIUM - required for configuration)

**Steps:**

1. Identify missing variables from error messages
2. Check for `.env.example`: `find . -name ".env.example"`
3. Create/update `.env`:
   - If missing: `cp apps/[app]/.env.example apps/[app]/.env`
   - If exists: Add missing variables
4. Set dev-appropriate values (e.g., `DATABASE_URL=postgresql://localhost:5432/dev`)
5. Validate: Check if env errors resolved

**Validation:**

- [ ] All required `.env` files exist
- [ ] All required variables set
- [ ] Values valid for dev environment
- [ ] No env errors in next startup

**Failure:** If values invalid → Check format, service availability

---

#### Strategy E: TypeScript and Linting Errors

**When:** TypeScript compilation errors, type mismatches, strict mode violations

**What it does:** Fixes TypeScript errors manually (<10 errors) or delegates to lint-debugger (>10 errors)

**Why use this:** TypeScript errors prevent compilation. Many errors indicate systematic issues better handled by specialized agent.

**Priority:** 5 (MEDIUM - prevents compilation)

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
2. Wait for completion
3. Review fixes, verify zero errors

**If <10 TypeScript errors (MANUAL):**

1. Run: `pnpm typecheck 2>&1 | tee /tmp/typecheck-errors.log`
2. For each error:
   - Read file at error location
   - Understand type mismatch
   - Apply minimal fix (type guard, annotation, import fix)
   - **Never** use `any` or non-null assertions
3. Verify: `pnpm typecheck` (repeat until zero errors)

**Validation:**

- [ ] Zero TypeScript errors
- [ ] Type safety standards followed (no `any`, no `!`)
- [ ] Type guards used instead of assertions
- [ ] Code compiles successfully

**Failure:** If errors persist → Escalate to advanced strategies

---

#### Strategy F: Build/Import Resolution

**When:** "Cannot find module", import resolution failures, path mapping issues

**What it does:** Fixes import paths, updates tsconfig path mappings, resolves module resolution

**Why use this:** Import errors prevent bundling. Common in monorepos with workspace:\* and path mappings.

**Priority:** 6 (MEDIUM - prevents bundling)

**Steps:**

1. For each "module not found":
   - Verify file exists at path
   - Check path correctness (relative vs absolute vs alias)
   - Verify tsconfig.json path mappings
2. Fix import statements:
   - Correct relative depth (`../../` vs `../`)
   - Use workspace names (`@starter/utils`)
   - Fix extensions if needed
3. Fix tsconfig paths if aliases broken
4. Verify: `pnpm typecheck` should resolve imports

**Validation:**

- [ ] All import paths resolve
- [ ] No "Cannot find module" errors
- [ ] tsconfig paths align with structure
- [ ] Typecheck passes

**Failure:** If paths still broken → Check package.json exports, build output structure

---

#### Strategy G: Runtime Error Fixes

**When:** Server starts but crashes, unhandled exceptions, runtime errors after compilation succeeds

**What it does:** Analyzes runtime errors, fixes code issues causing crashes

**Why use this:** Runtime errors occur after compilation, often due to undefined access, missing imports, invalid calls

**Priority:** 7 (LOW - only after compilation succeeds)

**Steps:**

1. Analyze stack trace from `/tmp/dev-output.log`
   - Identify error message
   - Find file and line number
   - Trace call sequence
2. Read problematic code
3. Identify root cause:
   - Undefined access → Add null checks
   - Missing imports → Add imports
   - Invalid API calls → Fix endpoints
   - DB connection → Check Prisma
4. Apply minimal fix
5. Test: Restart dev server, monitor for resolution

**Validation:**

- [ ] Runtime error no longer in logs
- [ ] Server starts and stays running
- [ ] Null/undefined handled
- [ ] All imports correct

**Failure:** If crashes persist → Check database services, external dependencies

---

### Advanced Strategies (H-L)

**When to use:** Stuck on same error >15 minutes OR standard strategies fail after 2-3 attempts OR error is complex/unfamiliar

#### Strategy H: Root Cause Analysis

**When:** Complex errors with unclear root cause, considering hacks, multiple failed attempts

**What it does:** Delegates to root-cause-analyst for comprehensive analysis and solution ranking

**Why use this:** Prevents hacks, finds sustainable solutions based on best practices

**Priority:** HIGH (when stuck)

**Invocation:**

```
Task(
  subagent_type="root-cause-analyst",
  description="Analyze root cause and alternative solutions",
  prompt="I'm stuck debugging this error: [paste error and stack trace].

  Context:
  - What I've tried: [list attempts]
  - Current hypothesis: [theory]
  - Stack: NestJS + PNPM workspace + Turborepo + Webpack

  Please:
  1. Analyze root cause (not symptoms)
  2. Suggest 3-5 alternative solutions
  3. Identify best practices approach
  4. Explain trade-offs
  5. Warn if solution is a hack vs proper fix"
)
```

**Expected Output:** Diagnostic report with ranked solutions and trade-off analysis

**Validation:**

- [ ] Root cause identified (not symptoms)
- [ ] Solution aligns with best practices
- [ ] No technical debt introduced

---

#### Strategy I: Community Error Research

**When:** Unfamiliar error, framework-specific issue, need battle-tested solutions

**What it does:** Delegates to common-error-researcher to search GitHub/Stack Overflow

**Why use this:** Community has likely solved this before

**Priority:** MEDIUM (use early when error recognizable but unfamiliar)

**Invocation:**

```
Task(
  subagent_type="common-error-researcher",
  description="Research community solutions",
  prompt="Research this error: [error message]

  Context:
  - Framework: NestJS 10 + Fastify
  - Build: Webpack 5 + TypeScript 5.7
  - Monorepo: PNPM workspaces + Turborepo
  - What I've tried: [attempts]

  Search for:
  1. GitHub issues (nestjs/nest, vitejs/vite, pnpm/pnpm)
  2. Stack Overflow (100+ votes preferred)
  3. Recent closed issues (within last year)
  4. Solutions for our stack versions
  5. Success indicators (maintainer responses)

  Prioritize recent solutions (2024-2025)."
)
```

**Expected Output:** Top 5 solutions with sources, dates, success indicators

**Validation:**

- [ ] Solution from credible source
- [ ] Stack versions match
- [ ] Not a one-off workaround

---

#### Strategy I-B: Official Best Practices Research

**When:** Need to verify "the right way", want official guidance, validating setup

**What it does:** Delegates to best-practices-researcher to search official sources ONLY

**Why use this:** Official sources are authoritative, prevent bad patterns

**Priority:** MEDIUM (use when configuration questions arise)

**Invocation:**

```
Task(
  subagent_type="best-practices-researcher",
  description="Research official best practices",
  prompt="Research the official way to: [question]

  Our current setup:
  [Paste config from package.json, tsconfig.json, etc.]

  Search official sources only:
  1. Official docs (docs.nestjs.com, pnpm.io, turbo.build)
  2. Official example repos
  3. Core team blogs, migration guides
  4. Official RFCs, changelogs

  Compare our setup vs official and identify:
  - What we're doing correctly
  - What should change
  - Why official pattern recommended
  - Migration steps if needed"
)
```

**Expected Output:** Official recommendations with source URLs

**Validation:**

- [ ] All claims have official URLs
- [ ] Versions compatible
- [ ] Official pattern understood

---

#### Strategy J: Monorepo-Specific Debugging

**When:** Module resolution errors, workspace package issues, build output problems

**What it does:** Delegates to monorepo-specialist for PNPM + NestJS + Turborepo expertise

**Why use this:** Monorepo resolution different from standard Node.js

**Priority:** HIGH (when monorepo errors detected)

**Invocation:**

```
Task(
  subagent_type="monorepo-specialist",
  description="Diagnose monorepo configuration",
  prompt="Diagnose this monorepo problem: [error]

  Setup:
  - PNPM 9.15.0+ with workspace:*
  - Turborepo 2.x orchestration
  - NestJS 10 (webpack enabled)
  - React 18 + Vite 6
  - TypeScript 5.7 strict mode

  Issue: [error and stack trace]
  Tried: [attempts]

  Analyze:
  1. Known PNPM workspace issue?
  2. package.json exports correct?
  3. tsconfig paths align with structure?
  4. Webpack externals correct?
  5. Following NestJS + Turborepo + PNPM patterns?

  Provide config fixes with file diffs."
)
```

**Expected Output:** Configuration fixes (package.json, tsconfig, webpack)

**Validation:**

- [ ] package.json exports correct
- [ ] workspace:\* dependencies resolve
- [ ] tsconfig paths aligned
- [ ] Webpack externals configured

---

#### Strategy K: Build System Debugging

**When:** Webpack/Vite errors, TypeScript compilation, module system conflicts

**What it does:** Delegates to build-system-debugger for deep config diagnosis

**Why use this:** Build systems have complex interactions

**Priority:** HIGH (when build errors persist)

**Invocation:**

```
Task(
  subagent_type="build-system-debugger",
  description="Debug build system config",
  prompt="Debug this build error: [error]

  Setup:
  - NestJS 10 with webpack: true
  - TypeScript 5.7 strict, outDir: ./dist
  - Module: CommonJS (API), ESM (utils)
  - PNPM workspace externals
  - Turborepo parallel builds

  Issue: [error and unexpected output]
  Observed: [what you see]

  Diagnose:
  1. Webpack, TypeScript, or module system issue?
  2. nest-cli.json webpack config
  3. tsconfig compiler options (outDir, rootDir)
  4. package.json "type" and "exports"
  5. CommonJS vs ESM conflicts
  6. Webpack externals

  Provide config fixes with explanations."
)
```

**Expected Output:** Build configuration fixes

**Validation:**

- [ ] Config follows patterns
- [ ] Compiler options correct
- [ ] Module system consistent
- [ ] Build succeeds

---

#### Strategy L: Stack Trace Analysis

**When:** Multi-file stack traces, unclear origin, deep async calls, webpack obfuscation

**What it does:** Delegates to stack-trace-analyzer to parse complex traces

**Why use this:** Complex traces hard to parse manually

**Priority:** MEDIUM (use early when trace complex)

**Invocation:**

```
Task(
  subagent_type="stack-trace-analyzer",
  description="Parse complex stack trace",
  prompt="Analyze this stack trace:

  Error: [message]

  Stack: [full trace]

  Context:
  - Triggered by: [action]
  - Source maps: [yes/no]
  - Framework: [NestJS/React]

  Identify:
  1. Error type and category
  2. Exact file:line to investigate
  3. Call sequence
  4. Immediate vs root cause
  5. Which file to debug first
  6. Debugging steps"
)
```

**Expected Output:** File:line, call sequence, root cause identification

**Validation:**

- [ ] Exact location identified
- [ ] Root cause understood
- [ ] Call sequence makes sense

---

### Parallel Multi-Specialist Pattern

**When comprehensive analysis needed:**

Invoke 3-4 specialists simultaneously in **single response**:

```
Task(subagent_type="stack-trace-analyzer", description="Parse error", prompt="[full error]")
Task(subagent_type="best-practices-researcher", description="Find official pattern", prompt="[question]")
Task(subagent_type="monorepo-specialist", description="Check workspace config", prompt="[setup]")
Task(subagent_type="root-cause-analyst", description="Analyze alternatives", prompt="[context]")
```

All run in parallel, results compared, consensus synthesized.

**Time Savings:** 5-10 min total vs 45+ min sequential trial-and-error

---

**Success Criteria:**

- [ ] Appropriate strategies selected
- [ ] Fixes applied in priority order
- [ ] Each fix validated before next
- [ ] Delegated if >10 TS errors
- [ ] Fixes minimal and targeted
- [ ] Code follows conventions
- [ ] Zero blocking errors remain

**Failure Handling:**

- **If:** Fix fails validation → Try alternative, escalate if stuck 3 times
- **If:** Advanced strategies fail → Report to user, manual intervention
- **If:** >3 consecutive failures → Halt, report state

**Tools Used:** Task (for subagent delegation), TodoWrite (for progress tracking)

**Time Target:** 2-5 minutes typical

---

## Phase 3: Verification & Health Check

**Objective:** Restart dev servers and confirm they run successfully without errors for sustained period

**When to execute:** After Phase 2 completes

**Process:**

1. **Clear Previous State**

   Remove old logs and temporary files:

   ```bash
   rm -f /tmp/dev-output.log /tmp/dev-pid.txt
   ```

   **Expected Output:** Files removed

   **Validation:** [ ] Old state cleared

2. **Restart Development Servers**

   Fresh startup with monitoring:

   ```bash
   pnpm tools dev:start-monitored --log /tmp/dev-output.log --pid /tmp/dev-pid.txt
   ```

   **Expected Output:** Servers started, PID saved

   **Validation:** [ ] Dev servers restarted

3. **Monitor Startup (60 seconds)**

   Wait for complete startup (longer than Phase 1 for thorough validation):

   ```bash
   sleep 60
   ```

   **Expected Output:** Time elapsed

   **Validation:** [ ] 60 seconds monitored

4. **Comprehensive Health Validation**

   Check all health indicators:

   ```bash
   pnpm tools dev:health-check --format json
   ```

   **NOTE:** Tool returns structured health data

   **Expected Output:** JSON with health status

   **Validation:** [ ] All health checks pass

5. **Scan for Errors**

   Search log for error patterns:

   ```bash
   grep -iE "(error|exception|fail|critical)" /tmp/dev-output.log | tail -n 20
   ```

   **If errors found:**

   - Categorize new errors
   - Return to Phase 2
   - Apply additional fixes
   - Iterate until clean

   **If no errors:**

   - Proceed to success reporting

   **Expected Output:** Empty result OR error list

   **Validation:** [ ] Zero errors in logs

6. **Verify Compilation Success**

   Check for success messages:

   ```bash
   grep -E "(Compiled successfully|successfully started)" /tmp/dev-output.log
   ```

   Look for:

   - Web: "Compiled successfully", "ready in [time]"
   - API: "Nest application successfully started"

   **Expected Output:** Success messages found

   **Validation:** [ ] Compilation successful

7. **Optional: Test Hot Reload**

   Validate watch mode:

   ```bash
   touch apps/web/src/App.tsx
   sleep 5
   tail -n 20 /tmp/dev-output.log
   ```

   Check for:

   - Change detected
   - Recompilation
   - No errors

   **Expected Output:** Hot reload messages

   **Validation:** [ ] Hot reload working (optional)

8. **Present Success Report**

   Show comprehensive success summary (see Output Format section)

   **Expected Output:** Success report with URLs and monitoring commands

   **Validation:** [ ] Success report presented

9. **Provide Monitoring Instructions**

   Tell user how to monitor servers:

   ```
   Monitoring Commands:
   - View logs: tail -f /tmp/dev-output.log
   - Check process: ps -p $(cat /tmp/dev-pid.txt)
   - Test web: open http://localhost:3000
   - Test API: curl http://localhost:3001
   - Stop: kill $(cat /tmp/dev-pid.txt)
   ```

   **Expected Output:** Monitoring guidance

   **Validation:** [ ] Instructions provided

10. **Keep Servers Running**

    **CRITICAL:** Do NOT kill dev server process. Leave running for user.

    **Expected Output:** Servers continue running

    **Validation:** [ ] Servers left running

**Success Criteria:**

- [ ] Dev servers restarted successfully
- [ ] Both web and API accessible
- [ ] Zero errors in last 60 seconds
- [ ] Compilation successful
- [ ] HTTP health checks pass (200 responses)
- [ ] Hot reload working (if tested)
- [ ] Success report presented
- [ ] Monitoring instructions provided
- [ ] Servers left running

**Failure Handling:**

- **If:** Errors found → Return to Phase 2 with error details
- **If:** Health checks fail → Investigate failure (process crash, port, compilation)
- **If:** Hot reload broken → Not blocking, report but mark success if servers running
- **If:** Validation fails 3 times → Halt, report persistent issues

**Tools Used:**

- `pnpm tools dev:start-monitored` (NOTE: To be implemented)
- `pnpm tools dev:health-check` (NOTE: To be implemented)

**Time Target:** ~90 seconds

---

## Output Format

### Example 1: Phase 1 Assessment Report

```
Development Server Debug - Initial Assessment

Running: pnpm dev

Waiting 30 seconds for startup...

Server Status:
- Dev Process: RUNNING (PID: 12345)
- Web App (http://localhost:3000): FAILED (compilation errors)
- API App (http://localhost:3001): FAILED (TypeScript errors)

Error Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TypeScript Errors: 23 errors across 8 files
  Build/Import Errors: 5 module resolution failures
  Dependency Issues: 0 packages
  Prisma Issues: Yes - Client not generated
  Environment Issues: 2 missing variables (DATABASE_URL, JWT_SECRET)
  Runtime Errors: 0
  Port Conflicts: No
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Issues: 31

Most Critical Issues:
1. TypeScript: 23 type errors preventing compilation
2. Prisma: Client not generated - API will fail
3. Environment: Missing DATABASE_URL and JWT_SECRET

Recommended Fix Strategy:
1. Generate Prisma client (Strategy C)
2. Configure environment variables (Strategy D)
3. Delegate TypeScript fixes to lint-debugger (Strategy E)

Estimated Time: 3-5 minutes
Risk Level: MEDIUM

Proceed with automated fixes? (Y/n)
```

### Example 2: Phase 2 Fix Execution Progress

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Applying Fixes - Priority Order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/3] Strategy C: Prisma Client Generation
────────────────────────────────────────────
Running: pnpm prisma generate
✓ Prisma client generated successfully
Files: packages/db/node_modules/.prisma/client/

[2/3] Strategy D: Environment Configuration
────────────────────────────────────────────
Creating apps/api/.env from .env.example
Setting: DATABASE_URL=postgresql://localhost:5432/dev
Setting: JWT_SECRET=dev-secret-key-change-in-production
✓ Environment configured

[3/3] Strategy E: TypeScript Error Fixes (DELEGATION)
────────────────────────────────────────────
Delegating to lint-debugger agent...

lint-debugger: Running typecheck...
lint-debugger: Found 23 TypeScript errors
lint-debugger: Fixing type imports in apps/api/src/auth/controller.ts
lint-debugger: Adding type guards in apps/web/src/hooks/useAuth.ts
lint-debugger: Fixing null handling in apps/api/src/users/service.ts
lint-debugger: Running typecheck again...
lint-debugger: ✓ Zero TypeScript errors

✓ lint-debugger complete: Fixed 23 errors across 8 files in 2m 15s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix Summary:
- Prisma: Client generated
- Environment: 2 variables configured
- TypeScript: 23 errors fixed by lint-debugger

Total Fixes Applied: 26
Files Modified: 9 files
Time Elapsed: 3m 45s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceeding to verification...
```

### Example 3: Phase 3 Success Report

```
✓ Development Servers Running Successfully

Final Verification Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server Status:
  ✓ Dev Process: RUNNING (PID: 12456, uptime: 1m 30s)
  ✓ Web App: http://localhost:3000 - OK (200, 45ms)
  ✓ API App: http://localhost:3001 - OK (200, 23ms)

Error Analysis:
  ✓ Compilation: Success - No errors
  ✓ TypeScript: Success - 0 errors
  ✓ Build: Success - Both apps built
  ✓ Runtime: Success - No errors in 60s monitoring
  ✓ Hot Reload: Working (tested)

Applications Ready:
  → Web: http://localhost:3000
  → API: http://localhost:3001
  → API Docs: http://localhost:3001/api

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary of Session:
  Total Errors Fixed: 26 errors across 3 categories
  Fixes Applied:
    1. Prisma client generated
    2. Environment variables configured (2 vars)
    3. 23 TypeScript errors fixed by lint-debugger
    4. 1 import path corrected

  Files Modified: 9 files
    - apps/api/.env (created)
    - apps/api/src/auth/controller.ts
    - apps/api/src/users/service.ts
    - apps/web/src/hooks/useAuth.ts
    - apps/web/src/components/Button.tsx
    - (+ 4 more files)

  Total Time: 5m 15s
  Strategies Used: C, D, E (basic strategies only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monitoring Instructions:

  View live logs:
    tail -f /tmp/dev-output.log

  Check server status:
    ps -p $(cat /tmp/dev-pid.txt)

  Test endpoints:
    curl http://localhost:3000      # Web app
    curl http://localhost:3001      # API health

  Stop servers when done:
    kill $(cat /tmp/dev-pid.txt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Open http://localhost:3000 in browser
  2. Test application functionality
  3. Make changes - hot reload is active
  4. Servers will continue running until stopped

Your development environment is ready!
```

---

## Quality Standards

### Error Detection

- All error types captured from output
- Errors categorized correctly (7 categories)
- Error counts accurate
- Stack traces preserved
- No errors missed or ignored

### Fix Quality

- Fixes minimal and targeted
- Root causes addressed (not symptoms)
- Code follows project conventions
- No type safety violations (`any`, `!`, unsafe `as`)
- Functionality preserved
- No regressions introduced

### Delegation Quality

- Appropriate delegation to lint-debugger for extensive TS errors
- Clear communication with delegated agents
- Agent results validated before proceeding
- Fallback to manual if delegation fails

### Verification Thoroughness

- Both web and API apps verified
- Health checks on endpoints
- Log output scanned for errors
- Hot reload tested (if applicable)
- Servers left running after success

### Communication Quality

- Clear progress updates during each phase
- Error summaries actionable
- Fix strategies explained
- Success confirmation with evidence
- Monitoring instructions provided

---

## Constraints & Boundaries

### Must Do

- Run initial assessment before fixing
- Categorize all errors by type
- Apply fixes in priority order (A → B → C → D → E → F → G)
- Delegate to lint-debugger if >10 TypeScript errors
- Verify server health after fixes
- Leave servers running at end (don't kill)
- Provide monitoring instructions

### Must Not Do

- Skip error assessment (need full picture)
- Fix errors randomly without prioritization
- Make config changes without understanding
- Use type safety violations in fixes
- Disable strict TypeScript to "fix" errors
- Kill dev servers at end (user needs them)
- Proceed if verification fails without re-fixing

### In Scope

- Starting and monitoring dev servers
- Analyzing error output
- Fixing TS, build, dependency, Prisma, env errors
- Delegating to lint-debugger
- Manual runtime error fixes
- Port conflict resolution
- Verifying server health
- Providing monitoring guidance

### Out of Scope

- Test failures (use `test-debugger`)
- Full CI pipeline (use `/dev:validate`)
- Committing fixes (suggest `/git:commit`)
- Deploying applications
- Database migrations (only client generation)
- Installing new features
- Refactoring beyond fixes
- Performance optimization

---

## Related Commands

- **`/dev:validate`**: Comprehensive validation including tests and build - use before commits
- **`/git:commit`**: Commit the fixes applied by this command
- **Individual app scripts**: `pnpm dev:api` or `pnpm dev:web` for debugging single apps

---

## Changelog

**Version 2.0** (2025-10-22)

- Optimized structure following comprehensive PRD
- Standardized all strategies with "When/What/Why/Priority" pattern
- Introduced tool abstractions (dev:start-monitored, dev:categorize-errors, dev:health-check)
- Delegated all bash operations to tools/subagents
- Reduced token count by ~10-15% while improving clarity
- Enhanced validation gates and success criteria
- Added comprehensive examples with decision-making
- Applied agent optimization best practices from research
- Changed allowed-tools to Task and TodoWrite only (strategic orchestration)

**Version 1.0** (2025-10-21)

- Initial implementation with Phase 0 advanced strategies
- 6 specialized subagents, 4 phases, 12 strategies
