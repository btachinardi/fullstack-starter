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

**Specialized Agents:**
- **lint-debugger**: Fixes TypeScript and linting errors systematically
- **test-debugger**: Debugs and fixes test failures (if dev mode runs tests)

**Prerequisites:**
- Git repository initialized
- Node.js 20.18.0+ and PNPM 9.15.0+ installed
- `pnpm-lock.yaml` exists (or will be created via `pnpm install`)

## Instructions

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
   - Never use `any` or `!` non-null assertions

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
- No type safety violations introduced (`as`, `!`, `any`)
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
- Use type safety violations (`any`, `as`, `!`) in fixes
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
   /dev:debug  (handles Prisma, env, initial errors)
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

**Command Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Platform Engineering
