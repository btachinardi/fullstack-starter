---
description: Run pnpm dev and systematically fix all errors until applications are running successfully
allowed-tools: Bash(pnpm *:*), Bash(ps *:*), Bash(kill *:*), Task, Read, Edit, Write
model: claude-sonnet-4-5
---

# /dev:debug

Run `pnpm dev` and systematically fix all errors until all applications are running successfully without errors.

## Objective

Execute the development server (`pnpm dev`) and systematically identify, analyze, and fix all errors (TypeScript errors, build errors, dependency issues, runtime errors) until both API and web applications start successfully and remain running without errors.

## Context & Prerequisites

**Project Context:**

- PNPM workspace monorepo with Turborepo orchestration
- Applications: `api` (NestJS + Fastify) and `web` (React + Vite)
- Development command: `pnpm dev` starts both apps in parallel watch mode
- Individual app commands: `pnpm dev:api`, `pnpm dev:web`
- TypeScript 5.7 with strict mode enforcement
- Biome for linting and formatting

**Common Error Categories:**

- **TypeScript errors**: Type mismatches, missing types, strict mode violations
- **Build errors**: Import resolution, module not found, syntax errors
- **Dependency issues**: Missing packages, version conflicts, workspace resolution
- **Prisma issues**: Schema validation, migration needed, client generation
- **Environment issues**: Missing `.env` variables, invalid configuration
- **Runtime errors**: Server crashes, API endpoint failures, client-side errors
- **Port conflicts**: Ports already in use by other processes

**Built-in Specialized Agents:**

- **lint-debugger**: Fixes TypeScript and linting errors systematically
- **test-debugger**: Debugs and fixes test failures (if dev mode runs tests)

**Available Debugging Subagents:**

These specialized subagents are available to help with complex debugging scenarios. If they don't exist yet, create them once using `@subagent-writer` (see Workflow Integration section).

**Analysis Specialists (Research & Guidance):**

- **root-cause-analyst**
  - **When:** Stuck >15 min, tried 2-3 solutions, considering hacks
  - **What:** Analyzes root cause, suggests 3-5 alternative solutions, ranks by best practices
  - **Output:** Diagnostic report with ranked solutions and trade-off analysis
  - **Use for:** Complex bugs, unclear root cause, evaluating solution approaches

- **stack-trace-analyzer**
  - **When:** Complex multi-file stack traces, unclear error origin
  - **What:** Parses stack traces, identifies call sequence, pinpoints exact error location
  - **Output:** File and line number to investigate, call sequence diagram
  - **Use for:** NestJS dependency errors, async errors, webpack trace parsing

- **common-error-researcher**
  - **When:** Unfamiliar error, framework-specific issue, need community solutions
  - **What:** Searches GitHub issues, Stack Overflow, finds proven solutions
  - **Output:** Top 5 solutions with sources, dates, and success indicators
  - **Use for:** Error messages you haven't seen, known framework bugs

- **best-practices-researcher**
  - **When:** Need official guidance, validating configuration, learning proper patterns
  - **What:** Searches official docs, official repos, core team blogs only
  - **Output:** Official recommendations with source links, configuration examples
  - **Use for:** "What's the right way to configure X?", verifying against official patterns

**Domain Specialists (Configuration & Fixes):**

- **monorepo-specialist**
  - **When:** PNPM workspace issues, package resolution, build output structure problems
  - **What:** Expert in NestJS + Turborepo + PNPM integration and configuration
  - **Output:** Configuration fixes, package.json exports, tsconfig paths
  - **Use for:** Module resolution, workspace packages, monorepo build issues

- **build-system-debugger**
  - **When:** Webpack/Vite errors, TypeScript compilation, module system conflicts
  - **What:** Diagnoses webpack, Vite, TypeScript config issues
  - **Output:** Build configuration fixes, compiler option recommendations
  - **Use for:** Build failures, dist structure, CommonJS/ESM conflicts

**Prerequisites:**

- Git repository initialized
- Node.js 20.18.0+ and PNPM 9.15.0+ installed
- `pnpm-lock.yaml` exists (or will be created via `pnpm install`)

## Instructions

### Phase 0: Advanced Debugging Strategies (When You're Stuck)

**Objective:** Use specialized subagents and advanced techniques to break through debugging roadblocks

**When to Use:**

- You've spent >15 minutes on the same error without progress
- The error is complex or unfamiliar (build systems, module resolution, monorepo issues)
- You've tried 2-3 solutions and none worked
- You're considering workarounds or "hacks" instead of proper fixes
- The error involves multiple interacting systems (webpack + TypeScript + PNPM)

**Strategy H: Root Cause Analysis (when stuck on complex issues)**

**When to use:** Complex errors with unclear root cause, considering hacks, or multiple failed fix attempts

**Steps:**

1. **Delegate to root-cause-analyst**

   ```
   Task(
     subagent_type="root-cause-analyst",
     description="Analyze root cause and alternative solutions",
     prompt="I'm stuck debugging this error: [paste error message and stack trace].

     Context:
     - What I've tried: [list attempts]
     - Current hypothesis: [your theory]
     - Stack: NestJS + PNPM workspace + Turborepo + Webpack

     Please:
     1. Analyze the root cause (not symptoms)
     2. Suggest 3-5 alternative solution approaches
     3. Identify which approach is most aligned with best practices
     4. Explain trade-offs of each approach
     5. Warn me if I'm about to implement a hack vs proper fix"
   )
   ```

2. **Review Analysis**
   - Consider alternative solutions suggested
   - Choose the most sustainable approach
   - Avoid quick hacks that create technical debt

3. **Implement Recommended Solution**
   - Follow the best practice approach identified
   - Document why other approaches were rejected

**Strategy I: Community Error Research (for known errors with solutions)**

**When to use:** Unfamiliar error messages, known framework bugs, need battle-tested community solutions

**What it does:** Searches GitHub issues and Stack Overflow for community-validated solutions with success rates

**Steps:**

1. **Delegate to common-error-researcher**

   ```
   Task(
     subagent_type="common-error-researcher",
     description="Research community solutions for error",
     prompt="Research this error and find community solutions: [error message]

     Context:
     - Framework: NestJS 10 + Fastify
     - Build tool: Webpack 5 + TypeScript 5.7
     - Monorepo: PNPM workspaces + Turborepo

     Current situation: [what you've tried]

     Please search for:
     1. GitHub issues in nestjs/nest, vitejs/vite, pnpm/pnpm repos
     2. Stack Overflow high-voted answers (100+ votes preferred)
     3. Recently closed issues (within last year)
     4. Solutions specific to our stack versions
     5. Success indicators (confirmed fixes, maintainer responses)

     Prioritize recent solutions (2024-2025) for our stack."
   )
   ```

2. **Review Community Solutions**
   - Check solution dates (prefer 2024-2025)
   - Verify tech stack match (versions matter!)
   - Look for maintainer confirmation or high votes
   - Avoid one-off workarounds

3. **Validate Before Implementing**
   - Test highest-rated solution first
   - Verify it works before marking complete

**Strategy I-B: Official Best Practices Research (for configuration validation)**

**When to use:** Need to verify "the right way" to configure something, want official guidance, validating current setup

**What it does:** Searches only official documentation, official repos, and core team guidance (no community forums)

**Steps:**

1. **Delegate to best-practices-researcher**

   ```
   Task(
     subagent_type="best-practices-researcher",
     description="Research official best practices",
     prompt="Research the official recommended way to: [your question]

     Our current setup:
     [Paste current configuration from package.json, tsconfig.json, etc.]

     Please search official sources only:
     1. Official docs (docs.nestjs.com, pnpm.io, turbo.build)
     2. Official example repos (nestjs/typescript-starter, etc.)
     3. Core team blogs and migration guides
     4. Official RFCs and changelogs

     Compare our setup vs official recommendations and identify:
     - What we're doing correctly
     - What should be changed
     - Why the official pattern is recommended
     - Migration steps if changes needed"
   )
   ```

2. **Review Official Recommendations**
   - All claims should have official source URLs
   - Check version compatibility
   - Understand the "why" behind recommendations

3. **Implement Official Pattern**
   - Follow official examples closely
   - Don't deviate without good reason
   - Document any intentional differences

**Choosing Between Researchers:**
- Use **best-practices-researcher** first to learn the "official way"
- Use **common-error-researcher** when official docs don't cover your specific error
- Use BOTH in parallel when you need comprehensive perspective

**Strategy J: Monorepo-Specific Debugging**

**When to use:** Module resolution errors, workspace package issues, build output problems, PNPM linking issues

**What it does:** Expert analysis of NestJS + Turborepo + PNPM workspace integration, focusing on package exports, module resolution, and build configuration

**Why use this:** Monorepo module resolution is different from standard Node.js - workspace packages, TypeScript paths, and build tools interact in complex ways. This specialist knows PNPM's specific behaviors.

**Steps:**

1. **Delegate to monorepo-specialist**

   ```
   Task(
     subagent_type="monorepo-specialist",
     description="Diagnose monorepo configuration issue",
     prompt="Diagnose this monorepo problem: [error]

     Our setup:
     - PNPM 9.15.0+ workspaces with workspace:* protocol
     - Turborepo 2.x for task orchestration
     - NestJS 10 (webpack mode enabled in nest-cli.json)
     - React 18 + Vite 6
     - TypeScript 5.7 strict mode

     Issue details:
     [Paste complete error message and stack trace]

     What I've tried:
     [List attempted fixes]

     Please analyze:
     1. Is this a known PNPM workspace resolution issue?
     2. Are package.json exports configured correctly for all workspace packages?
     3. Do tsconfig.json path mappings align with package structure?
     4. Is webpack configured correctly for monorepo externals?
     5. Are we following NestJS + Turborepo + PNPM best practices?

     Provide specific configuration fixes with file diffs."
   )
   ```

2. **Review Monorepo Configuration Analysis**
   - Check package.json "type", "main", "exports" recommendations
   - Verify workspace:* dependencies are correct
   - Validate tsconfig paths align with package structure

3. **Apply Monorepo-Specific Fixes**
   - Update package.json exports to point to built .js files
   - Fix tsconfig path mappings
   - Configure webpack externals for workspace packages
   - Run pnpm install if package.json changes made

**Strategy K: Build System Debugging**

**When to use:** Webpack/Vite compilation errors, TypeScript compiler issues, module system conflicts, nested dist folder problems

**What it does:** Deep diagnosis of webpack, Vite, and TypeScript configuration issues, focusing on build output structure and module resolution

**Why use this:** Build systems have complex interactions between webpack loaders, TypeScript compiler, and module systems. This specialist understands webpack externals, TypeScript outDir/rootDir, and CommonJS/ESM nuances.

**Steps:**

1. **Delegate to build-system-debugger**

   ```
   Task(
     subagent_type="build-system-debugger",
     description="Debug build system configuration",
     prompt="Debug this build/compilation error: [error]

     Current build setup:
     - NestJS 10 with webpack: true (nest-cli.json)
     - TypeScript 5.7 strict mode, outDir: ./dist
     - Module system: CommonJS (API), ESM (utils packages)
     - PNPM workspace packages marked as webpack externals
     - Turborepo orchestrating parallel builds

     Build output issue:
     [Paste error, unexpected output structure, or compilation failure]

     What I've observed:
     - Expected: dist/main.js
     - Actual: [what you're seeing]

     Please diagnose:
     1. Is this a webpack, TypeScript, or module system issue?
     2. Check nest-cli.json webpack configuration
     3. Analyze tsconfig.json compiler options (outDir, rootDir, composite)
     4. Verify package.json "type" and "exports" consistency
     5. Identify CommonJS vs ESM conflicts
     6. Check webpack externals configuration

     Provide specific configuration fixes with explanations."
   )
   ```

2. **Review Build System Analysis**
   - Understand whether issue is webpack, TypeScript, or module system
   - Check if recommended fixes align with NestJS + monorepo patterns
   - Verify fixes won't break other parts of build

3. **Apply Build Configuration Fixes**
   - Update nest-cli.json (enable webpack if needed)
   - Fix TypeScript compiler options
   - Align module system (all CommonJS or all ESM)
   - Clear build caches after config changes

**Strategy L: Stack Trace Analysis (for complex error messages)**

**When to use:** Multi-file stack traces, unclear error origin, deep async call stacks, webpack obfuscated errors

**What it does:** Parses complex stack traces to identify the exact file, line, and call sequence causing the error

**Why use this:** Complex stack traces (especially from NestJS DI, webpack bundles, or async code) can be hard to parse. This specialist extracts the signal from the noise.

**Steps:**

1. **Delegate to stack-trace-analyzer**

   ```
   Task(
     subagent_type="stack-trace-analyzer",
     description="Parse complex stack trace",
     prompt="Analyze this stack trace and identify root cause:

     Error message:
     [Paste full error message]

     Stack trace:
     [Paste complete stack trace]

     Context:
     - What triggered it: [user action, server startup, etc.]
     - Source maps available: [yes/no]
     - Framework: [NestJS/React/etc.]

     Please identify:
     1. Error type and category
     2. Exact file and line number to investigate
     3. Call sequence that led to error
     4. Immediate cause vs root cause
     5. Which file to debug first
     6. Suggested debugging steps"
   )
   ```

2. **Review Analysis Results**
   - Note the exact file and line to investigate
   - Understand the call sequence
   - Focus on root cause, not intermediate calls

3. **Investigate Identified Location**
   - Read the file at the exact line number provided
   - Understand the context around the error
   - Apply targeted fix based on root cause

**Debugging Workflow Tips:**

1. **Start with the Right Specialist**
   - **Error unclear?** → stack-trace-analyzer first to understand what's happening
   - **Know the error but unfamiliar?** → common-error-researcher for community solutions
   - **Need official guidance?** → best-practices-researcher for authoritative patterns
   - **Stuck after trying fixes?** → root-cause-analyst for alternative approaches
   - **Monorepo/workspace issue?** → monorepo-specialist for PNPM + NestJS expertise
   - **Build/compilation problem?** → build-system-debugger for webpack/TypeScript config

2. **Combine Specialists for Maximum Insight**
   - **Best combo for unfamiliar errors:** stack-trace-analyzer + common-error-researcher
   - **Best combo for config issues:** best-practices-researcher + monorepo-specialist
   - **Best combo when stuck:** root-cause-analyst + best-practices-researcher
   - **Full investigation:** Run 3+ specialists in parallel and synthesize their findings

3. **Don't Go in Circles - Delegate Early**
   - Same fix attempted 3 times → delegate to root-cause-analyst
   - >15 minutes without progress → delegate to appropriate specialist
   - Considering a hack/workaround → delegate to root-cause-analyst (will warn you!)
   - Unsure if config is correct → delegate to best-practices-researcher

4. **Optimal Delegation Patterns**

   **Pattern 1: Unknown Error**
   ```
   Step 1: stack-trace-analyzer (understand the error)
   Step 2: common-error-researcher (find solutions)
   Step 3: Apply highest-rated solution
   ```

   **Pattern 2: Configuration Confusion**
   ```
   Step 1: best-practices-researcher (find official way)
   Step 2: monorepo-specialist (apply to your monorepo)
   Step 3: Implement official pattern
   ```

   **Pattern 3: Stuck After Multiple Attempts**
   ```
   Parallel: root-cause-analyst + common-error-researcher + best-practices-researcher
   Wait: Review all three perspectives
   Choose: Best approach based on combined recommendations
   ```

5. **Efficiency Tips**
   - Always run multiple specialists in PARALLEL (single message, multiple Task calls)
   - Don't wait for one to finish before starting another (they're independent)
   - Compare their recommendations before implementing
   - Use analysis specialists (stack-trace, researchers) before domain specialists

**Example: Comprehensive Multi-Specialist Debugging**

```
# Complex monorepo build error - get all perspectives at once:

# In a SINGLE message, invoke multiple specialists:

Task(
  subagent_type="stack-trace-analyzer",
  description="Parse error message",
  prompt="[full error and stack trace]"
)

Task(
  subagent_type="best-practices-researcher",
  description="Find official NestJS monorepo pattern",
  prompt="What's the official way to configure NestJS in PNPM monorepo?"
)

Task(
  subagent_type="monorepo-specialist",
  description="Diagnose workspace configuration",
  prompt="Check our PNPM workspace + NestJS setup against best practices"
)

Task(
  subagent_type="root-cause-analyst",
  description="Analyze root cause and alternatives",
  prompt="I've tried X, Y, Z. Help me find the proper solution."
)

# All run in parallel, get results in ~2-3 minutes
# Compare findings and implement the consensus recommendation
```

---

### Phase 1: Initial Execution and Error Assessment

**Objective:** Start dev servers and capture all initial errors

**Steps:**

1. **Check for Running Dev Servers**

   Before starting, check if dev servers are already running:

   ```bash
   ps aux | grep -E "(vite|nest)"
   ```

   If processes found:

   - Ask user: "Dev servers appear to be running. Kill and restart? (Y/n)"
   - If yes: Kill processes and proceed
   - If no: Exit and suggest user stops servers manually

2. **Bootstrap Dependencies (if needed)**

   Check if `node_modules` and `pnpm-lock.yaml` exist:

   ```bash
   ls -la node_modules pnpm-lock.yaml 2>/dev/null || echo "MISSING"
   ```

   If missing or outdated:

   ```bash
   pnpm install
   ```

   Wait for installation to complete. Capture any errors.

3. **Start Development Servers**

   Execute dev command in background to capture output:

   ```bash
   pnpm dev 2>&1 | tee /tmp/dev-output.log &
   DEV_PID=$!
   echo $DEV_PID > /tmp/dev-pid.txt
   ```

   This:

   - Runs `pnpm dev` in background
   - Redirects both stdout and stderr to log file
   - Saves process ID for later management

4. **Monitor Startup Output (30 seconds)**

   Wait for initial startup and error detection:

   ```bash
   sleep 30
   tail -n 100 /tmp/dev-output.log
   ```

   Monitor for:

   - Compilation errors
   - TypeScript errors
   - Server start messages
   - Port conflict errors
   - Runtime errors

5. **Parse and Categorize Errors**

   Analyze the log output to identify error types:

   **TypeScript Errors:**

   - Pattern: `TS[0-9]+:`, `error TS`, `Type error`
   - Extract: file path, line number, error code, message

   **Build/Import Errors:**

   - Pattern: `Cannot find module`, `Module not found`, `import.*failed`
   - Extract: module name, requesting file

   **Dependency Errors:**

   - Pattern: `ERR_PNPM`, `Cannot find package`, `peer dependency`
   - Extract: package name, version constraint

   **Prisma Errors:**

   - Pattern: `Prisma schema`, `prisma generate`, `migration`
   - Extract: schema issues, migration status

   **Environment Errors:**

   - Pattern: `environment variable`, `missing.*env`, `configuration`
   - Extract: variable name, expected format

   **Runtime Errors:**

   - Pattern: `Error:`, `Exception`, `UnhandledPromise`, stack traces
   - Extract: error message, stack trace, file location

   **Port Conflicts:**

   - Pattern: `EADDRINUSE`, `port.*already in use`, `listen.*EACCES`
   - Extract: port number, conflicting process

6. **Count and Categorize Issues**

   Create error summary:

   ```
   Error Assessment:
   - TypeScript Errors: [X] errors across [Y] files
   - Build/Import Errors: [X] errors
   - Dependency Issues: [X] packages
   - Prisma Issues: [Yes/No]
   - Environment Issues: [X] missing variables
   - Runtime Errors: [X] errors
   - Port Conflicts: [Yes/No] - Port [XXXX]

   Total Issues: [N]
   ```

7. **Determine Servers Running Status**

   Check if servers managed to start despite errors:

   ```bash
   ps -p $(cat /tmp/dev-pid.txt 2>/dev/null) >/dev/null 2>&1 && echo "RUNNING" || echo "CRASHED"
   curl -s http://localhost:3000 >/dev/null && echo "WEB: OK" || echo "WEB: FAIL"
   curl -s http://localhost:3001 >/dev/null && echo "API: OK" || echo "API: FAIL"
   ```

8. **Present Assessment to User**

   Show comprehensive error report:

   ```
   Development Server Assessment:

   Status:
   - Dev Process: [RUNNING/CRASHED]
   - Web App (port 3000): [OK/FAIL/NOT_STARTED]
   - API App (port 3001): [OK/FAIL/NOT_STARTED]

   [Error summary from step 6]

   Most Critical Issues:
   1. [Issue category]: [Specific error]
   2. [Issue category]: [Specific error]
   3. [Issue category]: [Specific error]

   Recommended Fix Strategy:
   [Strategy based on error types - see Phase 2 for options]
   ```

9. **Stop Dev Servers (for fixing)**

   If errors found and servers are running:

   ```bash
   kill $(cat /tmp/dev-pid.txt 2>/dev/null) 2>/dev/null
   ```

   Explanation: We need to stop servers to apply fixes, then restart.

**Validation:**

- [ ] Dev servers started (even if with errors)
- [ ] All errors captured and logged to `/tmp/dev-output.log`
- [ ] Errors categorized by type
- [ ] Error counts and severity determined
- [ ] Server running status assessed
- [ ] Fix strategy identified
- [ ] User informed of scope and approach

---

### Phase 2: Systematic Error Fixing

**Objective:** Fix all identified errors systematically until servers can start cleanly

**IMPORTANT:** Choose the appropriate strategy based on Phase 1 assessment. Multiple strategies may be combined.

---

#### Strategy A: Port Conflict Resolution (if detected)

**When to use:** Port conflict errors found (EADDRINUSE)

**Steps:**

1. **Identify Conflicting Process**

   ```bash
   lsof -i :3000 -i :3001 | grep LISTEN
   ```

2. **Present Options to User**

   - Kill conflicting process (if safe)
   - Change port in `.env` files
   - Use different ports via command flags

3. **Execute Chosen Solution**

   **Option 1: Kill process**

   ```bash
   kill -9 [PID]
   ```

   **Option 2: Update .env files**

   ```bash
   # Edit apps/web/.env
   PORT=3002

   # Edit apps/api/.env
   PORT=3003
   ```

4. **Verify Resolution**
   - Confirm ports are now free
   - Update monitoring URLs if ports changed

---

#### Strategy B: Dependency Resolution (if missing packages)

**When to use:** Module not found, package missing, version conflicts

**Steps:**

1. **Analyze Missing Dependencies**

   From error messages, extract:

   - Package names
   - Requested from which workspace
   - Expected version (if specified)

2. **Install Missing Packages**

   For workspace packages:

   ```bash
   cd [workspace-path]
   pnpm add [package-name]
   ```

   For root-level deps:

   ```bash
   pnpm add -w [package-name]
   ```

3. **Resolve Version Conflicts**

   If peer dependency conflicts:

   ```bash
   pnpm install --force
   ```

   Or update conflicting packages:

   ```bash
   pnpm update [package-name]
   ```

4. **Verify Installation**

   ```bash
   pnpm install --frozen-lockfile
   ```

   Should complete without errors.

---

#### Strategy C: Prisma Issues (if schema/migration errors)

**When to use:** Prisma schema errors, migration needed, client not generated

**Steps:**

1. **Validate Prisma Schema**

   ```bash
   cd apps/api
   pnpm prisma validate
   ```

   If schema invalid:

   - Read error message carefully
   - Fix schema syntax in `prisma/schema.prisma`
   - Re-validate until valid

2. **Generate Prisma Client**

   ```bash
   pnpm prisma generate
   ```

   This regenerates the type-safe client.

3. **Check Migration Status**

   ```bash
   pnpm prisma migrate status
   ```

   If migrations pending:

   ```bash
   pnpm prisma migrate dev
   ```

4. **Verify Database Connection**

   ```bash
   pnpm prisma db pull
   ```

   Should succeed if database is reachable.

---

#### Strategy D: Environment Configuration (if env variable errors)

**When to use:** Missing environment variables, configuration errors

**Steps:**

1. **Identify Missing Variables**

   From error messages, extract required variables.

2. **Check for `.env.example` Files**

   ```bash
   find . -name ".env.example" -type f
   ```

3. **Create/Update `.env` Files**

   For each app missing configuration:

   ```bash
   # If .env doesn't exist
   cp apps/[app]/.env.example apps/[app]/.env

   # Edit to set required values
   ```

4. **Validate Environment**

   Restart dev server briefly to check if env errors resolved.

---

#### Strategy E: TypeScript and Linting Errors (if TS errors found)

**When to use:** TypeScript compilation errors, type mismatches, strict mode violations

**IMPORTANT:** Use this strategy if more than 10 TypeScript errors detected.

**Steps:**

1. **Delegate to lint-debugger Agent**

   Use Task tool to invoke specialized agent:

   ```
   Task(
     subagent_type="lint-debugger",
     description="Fix all TypeScript errors preventing dev server startup",
     prompt="Fix all TypeScript compilation errors found in the development server output. Focus on errors preventing server startup. Run typecheck after fixes to ensure zero errors remain."
   )
   ```

2. **Wait for lint-debugger Completion**

   The agent will:

   - Run `pnpm typecheck` to identify all TS errors
   - Fix type errors systematically
   - Re-run typecheck until zero errors
   - Report all fixes applied

3. **Review Fixes**

   After agent completes:

   - Read summary of fixes applied
   - Verify file changes are appropriate
   - Confirm zero TypeScript errors reported

**Alternative (for <10 TS errors):**

Fix TypeScript errors manually:

1. **Read Error Details**

   ```bash
   pnpm typecheck 2>&1 | tee /tmp/typecheck-errors.log
   ```

2. **For Each Error:**

   - Read file at error location
   - Understand type mismatch or violation
   - Apply minimal fix (add type annotation, fix import, etc.)
   - Use type guards instead of `as` assertions
   - Never use `any` or non-null assertions

3. **Verify Fix**

   ```bash
   pnpm typecheck
   ```

   Repeat until zero errors.

---

#### Strategy F: Runtime Error Fixes (if server crashes or throws)

**When to use:** Server starts but crashes, unhandled exceptions, runtime errors

**Steps:**

1. **Analyze Stack Traces**

   From `/tmp/dev-output.log`:

   - Identify error message
   - Find stack trace
   - Locate source file and line number

2. **Read Problematic Code**

   Use Read tool to examine file at error location:

   ```
   Read(file_path="[error-file-path]")
   ```

3. **Identify Root Cause**

   Common runtime errors:

   - Undefined property access: Add null checks
   - Missing imports: Add import statements
   - Invalid API calls: Fix endpoint URLs or parameters
   - Database connection: Check Prisma setup
   - Configuration: Verify environment variables

4. **Apply Minimal Fix**

   Use Edit tool to fix the issue:

   - Add null/undefined checks
   - Fix import paths
   - Correct API configuration
   - Add error handling

5. **Test Fix**

   Restart dev server partially:

   ```bash
   # For API errors
   pnpm dev:api

   # For Web errors
   pnpm dev:web
   ```

   Monitor for error resolution.

---

#### Strategy G: Build/Import Resolution (if module errors)

**When to use:** "Cannot find module", import resolution failures, path mapping issues

**Steps:**

1. **Verify Import Paths**

   For each "module not found" error:

   - Check file exists at import path
   - Verify path is correct (relative vs. absolute)
   - Check tsconfig.json path mappings

2. **Fix Path Mappings**

   If using aliases like `@starter/*`:

   ```bash
   # Check tsconfig.json paths
   cat tsconfig.json | grep -A 10 "paths"
   ```

   Update if incorrect.

3. **Fix Import Statements**

   Use Edit tool to correct import paths:

   - Fix relative path depth (`../../` vs `../`)
   - Use correct workspace package names (`@starter/utils`)
   - Fix file extensions if needed

4. **Verify Resolution**

   ```bash
   pnpm typecheck
   ```

   Should resolve import errors.

---

**Fix Execution Order:**

Always follow this priority:

1. **Port conflicts** (Strategy A) - Must fix first, blocks startup
2. **Dependencies** (Strategy B) - Required before code runs
3. **Prisma** (Strategy C) - Required for API to function
4. **Environment** (Strategy D) - Required for configuration
5. **TypeScript** (Strategy E) - Prevents compilation
6. **Build/Import** (Strategy G) - Prevents bundling
7. **Runtime** (Strategy F) - Happens after startup

**Use Advanced Strategies (H-L) when:**
- Standard strategies fail after 2-3 attempts
- Error is unfamiliar or complex
- You're stuck for >15 minutes
- Considering hacks or workarounds
- Need to validate configuration against official patterns

**Quick Decision Tree:**
1. **Error unclear?** → L (stack-trace-analyzer)
2. **Configuration question?** → I-B (best-practices-researcher)
3. **Known error, need fix?** → I (common-error-researcher)
4. **Monorepo issue?** → J (monorepo-specialist)
5. **Build system problem?** → K (build-system-debugger)
6. **Tried multiple fixes, still stuck?** → H (root-cause-analyst)

**Validation:**

- [ ] Appropriate strategies selected based on error types
- [ ] Fixes applied in correct priority order
- [ ] Each fix verified before proceeding to next
- [ ] Delegated to lint-debugger if extensive TS errors
- [ ] All fixes are minimal and targeted
- [ ] Code follows project conventions
- [ ] No type safety violations introduced

---

### Phase 3: Verification and Monitoring

**Objective:** Restart dev servers and confirm they run successfully without errors

**Steps:**

1. **Clear Previous Logs**

   ```bash
   rm -f /tmp/dev-output.log /tmp/dev-pid.txt
   ```

2. **Restart Development Servers**

   Execute fresh dev server start:

   ```bash
   pnpm dev 2>&1 | tee /tmp/dev-output.log &
   DEV_PID=$!
   echo $DEV_PID > /tmp/dev-pid.txt
   ```

3. **Monitor Startup (60 seconds)**

   Wait longer this time to ensure complete startup:

   ```bash
   sleep 60
   tail -n 150 /tmp/dev-output.log
   ```

   Look for:

   - ✅ Compilation successful messages
   - ✅ Server started messages
   - ✅ Port listening messages
   - ❌ Any error messages (should be zero)

4. **Verify Server Health**

   **Check processes:**

   ```bash
   ps -p $(cat /tmp/dev-pid.txt) -o pid,cmd,etime
   ```

   **Check web app:**

   ```bash
   curl -s http://localhost:3000 | head -n 5
   ```

   Should return HTML (React app).

   **Check API app:**

   ```bash
   curl -s http://localhost:3001/api/health || curl -s http://localhost:3001
   ```

   Should return JSON or success response.

5. **Scan for Errors in Output**

   Search log for error patterns:

   ```bash
   grep -iE "(error|exception|fail|critical)" /tmp/dev-output.log | tail -n 20
   ```

   **If errors found:**

   - Return to Phase 2 with new error information
   - Apply additional fixes
   - Iterate until clean

   **If no errors:**

   - Proceed to success reporting

6. **Verify Hot Reload (optional)**

   Make a trivial change to test watch mode:

   ```bash
   # Touch a component file to trigger rebuild
   touch apps/web/src/App.tsx
   sleep 5
   tail -n 20 /tmp/dev-output.log
   ```

   Should show:

   - Change detected
   - Recompilation
   - No errors

7. **Present Success Report**

   Show comprehensive success summary (see Output Format below)

8. **Provide Monitoring Instructions**

   Tell user how to monitor servers:

   ```
   Monitoring Commands:
   - View live logs: tail -f /tmp/dev-output.log
   - Check processes: ps -p $(cat /tmp/dev-pid.txt)
   - Test web app: open http://localhost:3000
   - Test API: curl http://localhost:3001/api/health
   - Stop servers: kill $(cat /tmp/dev-pid.txt)
   ```

9. **Keep Servers Running**

   **IMPORTANT:** Do NOT kill the dev server process at the end.
   Leave it running in the background for the user.

**Validation:**

- [ ] Dev servers restarted successfully
- [ ] Both web and API apps accessible
- [ ] Zero errors in startup logs
- [ ] No errors in last 60 seconds of runtime
- [ ] Hot reload working (if tested)
- [ ] Success report presented
- [ ] Monitoring instructions provided
- [ ] Servers left running for user

---

## Output Format

### Phase 1: Assessment Report

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

Stopping dev servers to apply fixes...
```

### Phase 2: Fix Execution Progress

```
Applying Fixes - Strategy Priority Order

[1/4] Prisma Client Generation (Strategy C)
────────────────────────────────────────────
Running: pnpm prisma generate
✓ Prisma client generated successfully
Files: packages/db/node_modules/.prisma/client/

[2/4] Environment Configuration (Strategy D)
────────────────────────────────────────────
Creating apps/api/.env from .env.example
Setting: DATABASE_URL=postgresql://localhost:5432/dev
Setting: JWT_SECRET=dev-secret-key-change-in-production
✓ Environment configured

[3/4] TypeScript Error Fixes (Strategy E)
────────────────────────────────────────────
Delegating to lint-debugger agent...

lint-debugger: Running typecheck...
lint-debugger: Found 23 TypeScript errors
lint-debugger: Fixing type imports in apps/api/src/auth/controller.ts
lint-debugger: Adding type guards in apps/web/src/hooks/useAuth.ts
lint-debugger: Fixing null handling in apps/api/src/users/service.ts
lint-debugger: Running typecheck again...
lint-debugger: ✓ Zero TypeScript errors

✓ lint-debugger complete: Fixed 23 errors across 8 files

[4/4] Build/Import Resolution (Strategy G)
────────────────────────────────────────────
Fixing import path in apps/web/src/components/Button.tsx
  Before: import { cn } from '../../utils'
  After:  import { cn } from '@starter/utils'

✓ All import paths resolved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix Summary:
- Prisma: Client generated
- Environment: 2 variables configured
- TypeScript: 23 errors fixed
- Imports: 1 path corrected

Total Fixes Applied: 26
Files Modified: 9 files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceeding to verification...
```

### Phase 3: Success Report

```
✓ Development Servers Running Successfully

Final Verification Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server Status:
  ✓ Dev Process: RUNNING (PID: 12456, uptime: 1m 30s)
  ✓ Web App: http://localhost:3000 - OK (200)
  ✓ API App: http://localhost:3001 - OK (200)

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
  1. Prisma client generated
  2. Environment variables configured
  3. 23 TypeScript errors fixed by lint-debugger
  4. 1 import path corrected

Files Modified: 9 files
  - apps/api/.env (created)
  - apps/api/src/auth/controller.ts
  - apps/api/src/users/service.ts
  - apps/web/src/hooks/useAuth.ts
  - apps/web/src/components/Button.tsx
  - (+ 4 more files)

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

Your development environment is ready! 🚀
```

---

## Quality Standards

### Error Detection

- All error types captured from output
- Errors categorized correctly
- Error counts are accurate
- Stack traces preserved for analysis
- No errors missed or ignored

### Fix Quality

- Fixes are minimal and targeted
- Root causes addressed, not symptoms
- Code follows project conventions (TypeScript strict, no `any`)
- No type safety violations introduced (`as`, non-null assertions, `any`)
- Functionality preserved during fixes
- No regressions introduced

### Delegation Quality

- Appropriate delegation to lint-debugger for extensive TS errors
- Clear communication with delegated agents
- Agent results validated before proceeding
- Fallback to manual fixes if delegation fails

### Verification Thoroughness

- Both web and API apps verified
- Health checks performed on endpoints
- Log output scanned for errors
- Hot reload tested if applicable
- Servers left running after success

### Communication Quality

- Clear progress updates during each phase
- Error summaries are actionable
- Fix strategies explained to user
- Success confirmation with evidence
- Monitoring instructions provided

---

## Constraints & Boundaries

### Must Do

- Run initial assessment before fixing anything
- Categorize all errors by type
- Apply fixes in correct priority order (port → deps → prisma → env → types → runtime)
- Delegate to lint-debugger if >10 TypeScript errors
- Verify server health after fixes
- Leave servers running at end (don't kill processes)
- Provide monitoring instructions to user

### Must Not Do

- Skip error assessment (need to know what's broken)
- Fix errors randomly without prioritization
- Make configuration changes without understanding impact
- Use type safety violations (`any`, `as`, non-null assertions) in fixes
- Disable strict TypeScript or linting to "fix" errors
- Kill dev servers at end (user needs them running)
- Proceed if verification fails without re-fixing

### Scope Management

**In Scope:**

- Starting and monitoring dev servers
- Analyzing error output
- Fixing TypeScript, build, dependency, Prisma, environment errors
- Delegating to lint-debugger for extensive TS errors
- Manual runtime error fixes
- Port conflict resolution
- Verifying server health
- Providing monitoring guidance

**Out of Scope:**

- Fixing test failures (not part of dev server startup)
- Running full CI pipeline (use `/dev:validate` instead)
- Committing fixes (suggest `/git:commit` after success)
- Deploying applications
- Database migrations (only Prisma client generation)
- Installing new features or packages beyond fixing errors
- Refactoring code beyond minimal fixes
- Performance optimization

---

## Examples

### Example 1: TypeScript Errors and Missing Prisma Client

**User:** `/dev:debug`

**Phase 1: Assessment**

```
Running pnpm dev...

Server Status:
- Dev Process: RUNNING
- Web App: FAILED (compilation errors)
- API App: FAILED (Prisma client missing)

Error Summary:
  TypeScript Errors: 15 errors across 5 files
  Prisma Issues: Yes - Client not generated

Recommended: Generate Prisma client, then delegate to lint-debugger
```

**Phase 2: Fixes**

```
[1/2] Prisma Client Generation
✓ pnpm prisma generate successful

[2/2] TypeScript Fixes
Delegating to lint-debugger...
✓ lint-debugger fixed 15 errors
```

**Phase 3: Verification**

```
✓ Dev servers running successfully
✓ Web: http://localhost:3000 - OK
✓ API: http://localhost:3001 - OK

15 errors fixed, servers ready!
```

---

### Example 2: Port Conflict

**User:** `/dev:debug`

**Phase 1: Assessment**

```
Running pnpm dev...

Server Status:
- Dev Process: CRASHED
- Port Conflicts: Yes - Port 3000 in use

Error: listen EADDRINUSE: address already in use :::3000
```

**Phase 2: Fixes**

```
[1/1] Port Conflict Resolution

Found process using port 3000:
  PID 8765: node (another dev server)

Options:
  1) Kill process 8765
  2) Change port in .env

User chose: 1

Killing process 8765...
✓ Port 3000 now available
```

**Phase 3: Verification**

```
✓ Dev servers running successfully
✓ Web: http://localhost:3000 - OK
✓ API: http://localhost:3001 - OK

1 port conflict resolved, servers ready!
```

---

### Example 3: Already Running Successfully

**User:** `/dev:debug`

**Phase 1: Assessment**

```
Running pnpm dev...

Server Status:
- Dev Process: RUNNING
- Web App: OK
- API App: OK

Error Summary:
  Total Issues: 0

✓ All applications running successfully!

No fixes needed - development environment is healthy.
```

**Early Exit - Monitoring Instructions Provided**

```
✓ Development environment already running

Applications:
  → Web: http://localhost:3000
  → API: http://localhost:3001

Monitor: tail -f /tmp/dev-output.log
Stop: kill $(cat /tmp/dev-pid.txt)
```

---

### Example 4: Missing Environment Variables

**User:** `/dev:debug`

**Phase 1: Assessment**

```
Running pnpm dev...

Server Status:
- Dev Process: RUNNING
- API App: CRASHED (env error)

Error: Environment variable DATABASE_URL is required
```

**Phase 2: Fixes**

```
[1/1] Environment Configuration

Missing variables in apps/api/.env:
  - DATABASE_URL
  - JWT_SECRET

Creating apps/api/.env from .env.example...
✓ Environment configured with development defaults
```

**Phase 3: Verification**

```
✓ Dev servers running successfully
✓ API: http://localhost:3001 - OK

2 environment variables configured, servers ready!
```

---

### Example 5: Complex Module Resolution Error (Using Advanced Strategies)

**User:** `/dev:debug`

**Phase 1: Assessment**

```
Running pnpm dev...

Server Status:
- Dev Process: RUNNING
- Web App: OK
- API App: FAILED (module loading error)

Error: SyntaxError: Unexpected token 'export'
  at packages/db/src/index.ts:7

Build succeeded but runtime error loading workspace packages.
```

**Initial Fix Attempts (15 minutes spent):**

```
Attempt 1: Fixed package.json exports to use .js files
Result: Same error persists

Attempt 2: Changed TypeScript module output
Result: New errors appeared

Attempt 3: Tried different tsconfig settings
Result: Still stuck - considering symlinking hack
```

**Phase 0: Using Advanced Strategies**

```
[Delegate to THREE specialists in parallel for comprehensive analysis]

# Invoked in a SINGLE message:
- stack-trace-analyzer: Parse the exact error
- best-practices-researcher: Find official NestJS monorepo configuration
- monorepo-specialist: Diagnose our specific setup

stack-trace-analyzer findings:
- Error type: Module system mismatch (CommonJS trying to load ESM)
- Root location: packages/utils/src/index.js (file exists but wrong format)
- Call sequence: webpack bundle → require('@starter/utils') → Node ESM loader
- Root cause: package.json "type": "module" but built output is CommonJS

best-practices-researcher findings:
- Official NestJS docs recommend CommonJS for backend apps
- Official NestJS monorepo examples use "type": "commonjs" for shared packages
- PNPM official docs: workspace packages should match consumer's module system
- Webpack externals require packages to be loadable by Node's require()
- Source: docs.nestjs.com/cli/monorepo, pnpm.io/workspaces

monorepo-specialist findings:
- PNPM workspace packages are loaded at runtime (not bundled by webpack)
- Our @starter/utils has "type": "module" but built as CommonJS
- NestJS API app is CommonJS → workspace packages must also be CommonJS
- Solution: Change "type": "commonjs" in packages/utils/package.json
- Also fix package.json exports to point to .js files (not .ts)

Consensus recommendation: Align all workspace packages to CommonJS (matches NestJS + official examples)
AVOID: Symlinks, webpack bundling workspace packages, or custom loaders
```

**Phase 2: Applying Recommended Fix**

```
[1/1] Module System Alignment
────────────────────────────────────────────
Based on monorepo-specialist analysis:

Editing packages/utils/package.json
  Before: "type": "module"
  After:  "type": "commonjs"

✓ Module system aligned with NestJS (CommonJS)
```

**Phase 3: Verification**

```
✓ Dev servers running successfully
✓ Web: http://localhost:3000 - OK
✓ API: http://localhost:3001 - OK

Result: Problem solved in 5 minutes with specialist help
Avoided: 30+ minutes of trial-and-error + potential hack implementation

Key learning: Delegate to specialists when stuck >15 minutes
```

**What Made the Difference:**

- **Without subagents**: 45+ minutes of trial and error, likely would have implemented symlink hack
- **With 3 subagents in parallel**: 5 minutes to proper solution with official validation
- **stack-trace-analyzer**: Identified exact root cause (module system mismatch)
- **best-practices-researcher**: Confirmed official NestJS pattern (CommonJS for monorepos)
- **monorepo-specialist**: Provided specific fix (package.json "type" field)
- **Result**: Proper solution that aligns with official docs + avoids technical debt

**Time Comparison:**
- Manual debugging: 45+ min → likely ends with hack
- Single specialist: 15 min → might miss best practices
- Triple specialists (parallel): 5 min → official + validated solution

**Key Insight:** Using multiple specialists in parallel gives you:
1. **Accuracy** - Cross-validation from different perspectives
2. **Speed** - Parallel execution, no sequential delays
3. **Quality** - Official validation + practical expertise
4. **Confidence** - Consensus recommendations are rarely wrong

---

## Related Commands

- **`/dev:validate`**: Comprehensive validation including tests and build - use before commits
- **`/git:commit`**: Commit the fixes applied by this command
- **Individual app scripts**: `pnpm dev:api` or `pnpm dev:web` for debugging single apps

---

## Workflow Integration

**Typical Usage Pattern:**

1. **Project Setup (First Time):**

   ```
   git clone [repo]
   pnpm install

   # Create debugging subagents once (if not already created):
   # These enhance the /dev:debug command with specialized expertise
   # Only needs to be done once per project

   @subagent-writer create root-cause-analyst       # Alternative solutions when stuck
   @subagent-writer create stack-trace-analyzer     # Parse complex error messages
   @subagent-writer create common-error-researcher  # Find community solutions
   @subagent-writer create best-practices-researcher # Validate against official docs
   @subagent-writer create monorepo-specialist      # PNPM + NestJS + Turborepo expert
   @subagent-writer create build-system-debugger   # Webpack/Vite/TypeScript config

   /dev:debug  (handles Prisma, env, initial errors - now with subagent support!)
   ```

2. **After Pulling Changes:**

   ```
   git pull
   pnpm install
   /dev:debug  (fixes any new errors from changes)
   ```

3. **After Making Changes:**

   ```
   [Make code changes]
   /dev:debug  (fixes TypeScript or runtime errors)
   [Continue development]
   ```

4. **Debugging Startup Issues:**
   ```
   [Dev server won't start]
   /dev:debug  (systematically fixes until working)
   ```

---

**Command Version:** 2.1
**Last Updated:** 2025-10-21
**Owner:** Platform Engineering

**Changelog:**
- **v2.1**: Added best-practices-researcher, enhanced all strategy descriptions with "When/What/Why", added Quick Decision Tree, updated Example 5 with triple-specialist parallel debugging
- **v2.0**: Added Phase 0 - Advanced Debugging Strategies with specialized subagents (root-cause-analyst, stack-trace-analyzer, common-error-researcher, monorepo-specialist, build-system-debugger)
- **v1.0**: Initial version with basic debugging strategies (A-G)

**Subagents Created:**
- root-cause-analyst (`.claude/agents/validation/`)
- stack-trace-analyzer (`.claude/agents/validation/`)
- common-error-researcher (`.claude/agents/validation/`)
- best-practices-researcher (`.claude/agents/validation/`)
- monorepo-specialist (`.claude/agents/infrastructure/`)
- build-system-debugger (`.claude/agents/validation/`)

**Note:** Create these subagents once during project setup for enhanced debugging capabilities (see Workflow Integration section)
