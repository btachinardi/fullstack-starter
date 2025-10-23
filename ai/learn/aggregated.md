# Aggregated Learning Knowledge Base

**Last Updated**: 2025-10-23
**Total Reports Processed**: 3

---

## Tool Call Failures

### Pattern: Edit Tool Failures - File Not Read First
**Occurrences**: 2 sessions
**Context**:
- 2025-10-23 (health-and-core-refactor): 4 instances - "File has not been read yet. Read it first before writing to it"
  - libs/core/api/package.json, libs/platform/api/src/prisma.client.ts, libs/health/api/src/index.ts
- **Note**: auth-email and cli-refactoring had ZERO failures of this type (100% adherence)

**Root Cause**: Rushed into editing without reading first, violated Edit tool prerequisites

**Prevention**:
- Check tool call history before Edit operations to verify Read was performed
- Add mental checkpoint: "Did I read this file in current context?"
- Always run Read before Edit - no exceptions

**Recovery**: Had to add Read calls, then retry Edit operations

**Pattern**: Not checking tool call history before Edit operations, forgetting prerequisite requirement

### Pattern: File Modified by Linter Between Read and Edit
**Occurrences**: 2 sessions
**Context**:
- 2025-10-23 (auth-email-implementation): Edit failed twice on libs/core/api/package.json - Biome linter auto-formatted files between Read and Edit operations
- 2025-10-23 (health-and-core-refactor): 3 instances - pnpm install triggered formatting/linting that changed files

**Root Cause**: External file modification (linter) causing edit conflicts, not accounting for external file modifications during long workflows

**Prevention**:
- Re-read file immediately before Edit if linter is active
- Consider disabling auto-format during bulk operations
- Batch edits to minimize time window for external modifications
- For package.json edits after pnpm install: Re-read file before Edit to account for linter modifications

### Pattern: Not Checking Existing Patterns Before Creating New Structures
**Occurrences**: 1 session (CRITICAL - ~15 minutes wasted)
**Context**:
- 2025-10-23 (health-and-core-refactor): Created @libs/health-api when pattern was @libs/health/api (required renaming 8 files, ~10 minutes)
- 2025-10-23 (health-and-core-refactor): Didn't check apps/web/tsconfig.json for Next.js path mapping pattern before implementing (~5 minutes trying wrong build configs)
- 2025-10-23 (health-and-core-refactor): Created nested folder structure (controllers/, indicators/) when CLAUDE.md states "Flat structure for small modules" (~3 minutes moving files)

**Root Cause**: Jumping to implementation without exploring existing patterns first

**Prevention**:
- **Before creating ANY new package/structure**: ALWAYS grep existing patterns first
  - Package naming: `find libs -name "package.json" -exec grep -H '"name"' {} \;` to see naming convention
  - Structure: `ls libs/similar-package` to see organization
  - Config: `cat apps/web/tsconfig.json` or equivalent working example FIRST
- Before structuring files: Read CLAUDE.md "Flat Structure" guidance, count files (1-5 = flat, 6+ = organized)
- Two minutes of grepping and reading examples prevents 15 minutes of rework

**Impact**: ~20% of session time wasted on avoidable rework

**Pattern**: "Explore first, implement second" is more efficient than "implement first, refactor when wrong"

### Pattern: Assuming CLI Syntax Without Verification
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (auth-email-implementation): Better Auth CLI command failed with "unknown option '--adapter=prisma'" - CLI changed from v1.2 to v1.3 (removed --adapter flag)

**Root Cause**: Assuming CLI syntax without checking help/documentation first

**Prevention**:
- Always run `--help` command FIRST before using unfamiliar CLI tools
- Verify current version syntax for tools that update frequently
- Check changelog for breaking changes in CLI tools

### Pattern: Missing TypeScript Configuration for Cross-Package Imports
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (auth-email-implementation): email/api importing React components from templates caused "React refers to UMD global" errors - took 3 iterations to fix (jsx: "react" → "react-jsx" → added skipLibCheck)

**Root Cause**: Cross-package React imports need proper JSX configuration and skipLibCheck

**Prevention**:
- Research TypeScript configuration requirements for cross-package patterns upfront
- For React Email + NestJS: use jsx: "react-jsx" and skipLibCheck: true
- Plan TypeScript configuration when building packages that cross-reference
- For Next.js web packages: Use source file references via tsconfig paths, NOT dist compilation (noEmit: true pattern)

### Pattern: Edit String Matching Failures (Whitespace Mismatches)
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): Edit tool failed on session.service.ts - tried to match indented code with tabs but provided spaces in old_string

**Root Cause**: Not preserving exact whitespace when preparing Edit calls (tabs vs spaces confusion)

**Prevention**:
- Read the exact indentation from Read output and preserve it exactly in old_string
- Use smaller, more unique strings for matching instead of large blocks
- Be careful with exact string matching requirements

### Pattern: Platform-Specific Command Usage
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): `tree` command failed on Windows - "tree: command not found" in git bash

**Root Cause**: Using platform-specific commands without checking availability

**Prevention**:
- Use cross-platform tools: Glob or ls instead of tree
- Avoid Windows-specific or Unix-specific commands
- Test commands work across platforms

### Pattern: Not Validating Generated Code Output
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): Generate tool produced `Test-demoOptions` interface with hyphen (invalid TypeScript identifier) - caused TS1005 syntax errors

**Root Cause**: Claimed tool complete before testing generated output compiles

**Prevention**:
- Always test generated code output BEFORE declaring success
- Run TypeScript compilation on generated files
- Validate code generation templates produce syntactically correct output

### Pattern: Trusting Agent Outputs Without Verification
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): Agent reported "Created logs module structure successfully" but no files existed in dev/cli/src/tools/logs/

**Root Cause**: Agent may have encountered error but reported success anyway, didn't verify with Glob

**Prevention**:
- After ANY agent completes work, independently verify with Glob/Read/Bash
- Don't trust agent output summaries - check the actual work
- Use Glob to count files if agent claims specific number created

**Notable Success**: auth-email and cli-refactoring had zero Edit failures due to "not reading first" - 100% of Edit calls were preceded by Read operations in those sessions

---

## User Corrections

### Pattern: Not Checking Existing Patterns Before Implementation
**Occurrences**: 1 session (3 corrections)
**Context**:
- 2025-10-23 (health-and-core-refactor): Package naming - Created @libs/health-api when pattern was @libs/health/api
- 2025-10-23 (health-and-core-refactor): Next.js build approach - Tried dist compilation when source references are the pattern
- 2025-10-23 (health-and-core-refactor): Folder structure - Created nested folders when should be flat

**User Corrections**:
- "Fix the naming, it should be `@libs/health/web` and `@libs/health/api`"
- "Due to limitations related to how nextjs works, we should directly reference the source files when referencing other packages, look at @apps\web\tsconfig.json for an example"
- "Then, we should also keep small modules like this one more flat: no need to hide single files behind a folder"

**Root Cause**: Didn't check existing examples (@libs/auth/api, apps/web/tsconfig.json, CLAUDE.md) before creating new structures

**Prevention**:
- Before creating new package of same type: `cat apps/web/tsconfig.json` or equivalent working example FIRST
- Before structuring files: Read CLAUDE.md "Flat Structure" guidance
- Always grep existing patterns: `find libs -name "package.json" | head -5 | xargs grep name`

**Impact**: ~15 minutes of rework, 8 files renamed, multiple imports updated

**User Provided Architectural Guidance**:
- 2025-10-23 (health-and-core-refactor): "We need to split our current `@libs/core` projects into `@libs/core` and `@libs/platform`" - Architectural improvement that enhanced design

### Pattern: Tool Permission Handling
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (auth-email-implementation): Tried `pnpm add -g @better-auth/cli` (failed with permissions), user suggested workspace installation instead
- 2025-10-23 (auth-email-implementation): Tried `rm -rf libs/api/node_modules` (failed), user handled deletion manually

**Root Cause**: Attempting multiple methods without asking user preference first

**Prevention**:
- Ask user for preferred approach upfront when dealing with tool permissions
- Clarify intent (global vs local install, manual vs automated cleanup) before executing

### Pattern: Premature Completion Declaration Without Validation
**Occurrences**: 1 session (3 instances)
**Context**:
- 2025-10-23 (cli-refactoring): Declared refactoring complete, suggested cleanup, said "everything is working" WITHOUT running validation
- 2025-10-23 (cli-refactoring): Suggested cleaning up old files without verifying ALL files migrated (spec files missing)
- 2025-10-23 (cli-refactoring): Marked todos complete without running typecheck/tests

**User Corrections**:
- "Can you check our current test coverage" (had to ask twice for proper validation)
- "be 100% absolutely sure everything is correctly migrated before suggesting cleaning"

**Root Cause**: Conflating "work implemented" with "work validated and verified"

**Prevention**:
- NEVER claim task complete without running full validation first: `pnpm lint && pnpm build && pnpm test`
- Before suggesting cleanup/deletion, use Glob to verify ALL related files (including .spec.ts) are migrated
- When marking todo complete, run validation check first - only mark complete if validation passes
- When build fails repeatedly with same error: Pause and analyze output for 30 seconds instead of re-running
- "Work implemented" ≠ "Work complete" - Completion requires validation

**Impact**: User had to push back 3 times with explicit requests

### Pattern: Defensive "Not My Problem" Mindset
**Occurrences**: 1 session (CRITICAL)
**Context**:
- 2025-10-23 (cli-refactoring): Created section titled "Pre-Existing Issues (Not from Refactoring)" suggesting they weren't my responsibility

**User Correction**: "Please, no 'not my problem' mindset here. Help me fix all of those issues, even if refactoring did not cause them."

**Root Cause**: Trying to deflect responsibility for problems instead of helping solve them

**Prevention**:
- ALWAYS help fix issues regardless of origin - no "not my problem" or "pre-existing" deflections
- When encountering ANY issues, help fix them proactively
- The role is to help solve problems, not deflect responsibility or make excuses
- Never use defensive language about who caused problems

**Impact**: Fundamental attitude problem that undermines trust and helpfulness

**User Provided Guidance (Helpful, Not Corrections)**:
- 2025-10-23 (auth-email-implementation): User explained Next.js limitations requiring direct source file references (not dist)
- 2025-10-23 (auth-email-implementation): User provided shadcn examples for auth pages (helpful design guidance, not correction)
- 2025-10-23 (health-and-core-refactor): Core/platform split guidance - Architectural improvement

---

## Persistent Task Failures

### Pattern: Treating Architectural Problems as Configuration Problems
**Occurrences**: 1 session (2 instances)
**Context**:
- 2025-10-23 (health-and-core-refactor): Circular dependency between @libs/core/api and @libs/health/api - tried to fix via dependency juggling instead of recognizing architectural issue (~8 minutes)
- 2025-10-23 (health-and-core-refactor): Multiple package.json edits trying to solve architectural coupling

**Failed Approach**: Remove dep → build fails → add dep back → circular error → remove different dep → repeat

**Resolution**: Architectural change - HealthModule.forRoot() pattern with dependency injection, @Public decorator moved to core

**Learning**: When circular dependency detected or errors persist after 2 attempts, pause and ask "Is this an architectural problem?" Circular dependencies and tight coupling are design issues requiring design solutions (DI, abstraction layers, interface segregation), not configuration solutions

**Prevention**:
- When Turbo reports circular dependency: Immediately analyze architecture (DI, interface abstraction, layer violation), don't try configuration fixes
- When dependencies are circular, it's an architecture problem not a dependency problem

### Pattern: Circular Dependency Recognition and Pivot
**Occurrences**: 2 sessions
**Context**:
- 2025-10-23 (auth-email-implementation): Better Auth Prisma plugin - auth.config.ts imports Prisma client, but client doesn't exist until plugin runs (2 attempts)
- 2025-10-23 (health-and-core-refactor): @libs/health/api needed prisma but couldn't depend on @libs/core/api (3 attempts, eventually solved with DI)

**Resolution**:
- auth-email: Recognized architectural impossibility, pivoted to manual schema approach
- health-core: Implemented HealthModule.forRoot(prismaClient) pattern with @Inject("PRISMA_CLIENT")

**Learning**: Circular dependencies need different approach - can't generate what you're importing. Quick recognition and strategy pivot prevents wasted time. When facing circular dependencies, recognize quickly and pivot to DI or interface abstraction

**Pattern**: Proper solutions - dependency injection, copying models directly, architectural refactoring

### Pattern: TypeScript Type Narrowing in Complex Expressions
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): Type error `Type 'string | undefined' not assignable to 'TaskStatus | undefined'` in main.ts line 1103 (2 attempts)

**Failed Approach**: Agent tried ternary fix but TypeScript couldn't narrow type in inline ternary within function arguments

**Solution**: Extract variable with proper type guard before passing to function

**Learning**: TypeScript can't narrow types in inline ternary expressions within function arguments

**Prevention**:
- Use explicit type guards with variable extraction for complex type narrowing
- Don't rely on inline conditionals within function arguments for type narrowing

### Pattern: Iterative Code Generation Template Refinement
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (cli-refactoring): Generate tool produced invalid TypeScript identifiers across 3 test iterations

**Progression**:
- Attempt 1: Simple capitalize() → Generated `Test-demoOptions` (hyphen in name)
- Attempt 2: Fixed PascalCase → Found issues with camelCase function names
- Attempt 3: Implemented toPascalCase(), toCamelCase(), toConstName() → Success

**Learning**: Template generation requires comprehensive case conversion utilities, each test reveals another naming convention issue

**Resolution**: Final templates produce zero-error TypeScript code

**Pattern**: Test-driven iteration for code generation templates

### Pattern: Next.js Build Configuration Persistence
**Occurrences**: 1 session
**Context**:
- 2025-10-23 (health-and-core-refactor): Tried 4 attempts to get dist/ output for @libs/platform/web (tsc -b, rm tsconfig.tsbuildinfo, --force, checking tsbuildinfo)

**Stuck Because**: nextjs.json config had `noEmit: true`, overriding tsconfig settings

**Solution**: User pointed to source file reference pattern with tsconfig paths

**Learning**: For Next.js packages, source file references are the correct pattern, not dist compilation. Kept trying to make dist work when it wasn't needed

---

## Efficiency & Parallelization

### Successful Patterns

**Strong parallel tool usage:**
- Multiple instances of parallel Read calls (4-5 files at once)
- Parallel Glob + Read operations (find files → read all in single response)
- Proper sequential operations when dependencies exist (Edit after Read, Install after package.json)

**Parallel agent invocations:**
- 2025-10-23 (cli-refactoring): Single message with 3 Task agent invocations for logs module, tasks module, and moving shared services
- Time saved: ~5-10 minutes compared to sequential approach
- Pattern: Recognized independent operations and batched them

**Parallel file reads during exploration:**
- 2025-10-23 (health-and-core-refactor): Read(health.controller.ts) + Read(health.module.ts) + Glob(libs/core/api/**/*.ts) in single response
- Saved ~30 seconds compared to sequential

**Parallel package.json edits during rename:**
- 2025-10-23 (health-and-core-refactor): 4 package.json files edited in parallel during @libs/health-api → @libs/health/api rename
- Saved ~45 seconds

**Examples from sessions:**
- 2025-10-23 (auth-email-implementation): Read 4 package.json files in parallel when examining project structure
- 2025-10-23 (auth-email-implementation): Used Grep tool (not bash grep), Glob tool (not find) consistently
- 2025-10-23 (cli-refactoring): 4 Read calls in single message (main.ts, package.json, session.ts, logs.ts)

### Improvement Opportunities

**Missed opportunity: Sequential builds instead of parallel**
- 2025-10-23 (health-and-core-refactor): Used `pnpm --filter @libs/health/api build && pnpm --filter @libs/health/web build` (sequential with &&)
- Could have: Two separate pnpm build calls in single message (parallel execution)
- Time wasted: ~10 seconds
- Pattern: Defaulting to bash chaining instead of parallel tool calls
- Apply "parallel first" mindset to ALL operations, not just file reads

**Minor inefficiency: Multiple edits to same file**
- 2025-10-23 (auth-email-implementation): libs/auth/web/src/index.ts edited 3 times incrementally
- Could batch exports into single edit after all components created
- Time impact: ~20 seconds (acceptable trade-off for incremental development)

**Missed opportunity: Sequential test generation and validation**
- 2025-10-23 (cli-refactoring): Generate → Test → Delete → Generate → Test → Delete (sequential)
- Could have: After first failure, analyzed and fixed template then tested once
- Time impact: Minor (~30 seconds)

**Inefficiency: Re-running commands hoping for different results**
- 2025-10-23 (health-and-core-refactor): Ran pnpm build multiple times getting same error
- Could have: Analyzed first output more carefully instead of re-running
- Time impact: ~30 seconds across 3 redundant build attempts

**Inefficiency: Re-reading same files**
- 2025-10-23 (health-and-core-refactor): Re-read libs/core/api/package.json 2 times during dependency cleanup
- Could have: Retained dependency list from first read
- Time impact: ~10 seconds
- Pattern: Not keeping package structure in working memory

**Potential parallelization gain:**
- Could parallelize `pnpm install` across multiple packages (though pnpm handles workspace installs efficiently anyway)
- Impact: Would save ~30 seconds across multiple package installs

**Redundant but conservative operation:**
- 2025-10-23 (cli-refactoring): Agent fixed Prisma type errors in both old (commands/) and new (tools/) locations even though one would be deleted
- Pattern: Conservative approach during migration (fix everything, delete later) - actually good for ensuring old code works during transition

---

## Planning & Todo Management

### Exemplary Patterns

**Excellent TodoWrite usage:**
- 2025-10-23 (auth-email-implementation): Created todos immediately, 15+ updates throughout session, exactly one task in_progress at all times, marked complete immediately after finishing
- 2025-10-23 (cli-refactoring): Created 8 clear todos at session start, maintained exactly one in_progress task, updated status consistently after each phase
- 2025-10-23 (health-and-core-refactor): Created 13-item todo breakdown for health module, comprehensive and specific

**Key characteristics:**
- Clear task descriptions with active forms
- Updated after each task completion
- User could track progress at any time
- Todos drove execution, not afterthought
- Maintained exactly one in_progress task at a time (rule: "Exactly ONE task must be in_progress at any time")

**Adapted todo list as work evolved:**
- 2025-10-23 (cli-refactoring): Original plan had 8 items, discovered new issues (type errors, missing fixtures), updated todo list to reflect new work
- 2025-10-23 (health-and-core-refactor): Replaced original todos with new ones when user requested core/platform split, stayed relevant to current work

**Examples of good management:**
1. Initial auth migration todos (15 tasks) - clear breakdown, updated after each completion
2. Email implementation todos (9 tasks) - phased approach clearly defined
3. CLI refactoring todos (8 tasks) - comprehensive coverage, adapted as issues discovered
4. Health module todos (13 tasks) - specific, actionable, clear completion criteria
5. Consolidated todos appropriately - merged related tasks when scope became clearer

**Impact**: TodoWrite helped maintain focus, prevented scope creep, provided visible progress

**No premature completions detected:**
- 2025-10-23 (health-and-core-refactor): All completed tasks were actually finished before marking complete
- Evidence: Each "completed" todo had corresponding successful build or validation

### Issues to Avoid

**Marking tasks complete before validation:**
- 2025-10-23 (cli-refactoring): Marked "Refactor main.ts" complete without running typecheck
- User had to push back and request proper validation
- Should have: Run validation BEFORE marking complete
- Pattern: Marking complete based on "work done" not "work validated"

**Todo list becoming stale:**
- 2025-10-23 (cli-refactoring): Last todo list had 6 completed items but wasn't tracking final analysis work
- Should have: Created new todos for test coverage enhancement work
- Pattern: TodoWrite usage declined after main refactoring "finished"

**Todo descriptions could be more specific:**
- 2025-10-23 (health-and-core-refactor): "Update all imports and dependencies" (which imports? which dependencies?)
- Better: "Update @libs/core/api imports in apps/api to use @libs/platform/api"
- Impact: Minor - todos were still clear enough

---

## Context & Memory

### Strengths

**Strong context retention:**
- 2025-10-23 (auth-email-implementation): Remembered architecture patterns from CLAUDE.md consistently, applied "core vs feature module" distinction correctly, maintained understanding across multiple operations
- 2025-10-23 (cli-refactoring): Maintained context of vertical module pattern throughout, applied same pattern consistently to all 5 tools (session, logs, tasks, prisma, generate)
- 2025-10-23 (health-and-core-refactor): Built mental model during exploration, retained it through execution - correctly identified all affected imports when moving files from core to platform

**Minimal re-reading (when working well):**
- Most files read once and context retained
- Re-reads were purposeful (checking for changes after edits)

**Remembered user preferences:**
- 2025-10-23 (auth-email-implementation): Branding customization requirement maintained across all 5 auth pages, applied consistent GalleryVerticalEnd logo pattern

**Remembered to update imports after moving files:**
- 2025-10-23 (cli-refactoring): After moving shared services, updated session.service.ts imports; after creating new modules, updated main.ts imports
- 2025-10-23 (health-and-core-refactor): When moving files from core to platform, remembered apps/api/src/main.ts and apps/api/src/app.module.ts would need updates

**Quick recovery:**
- 2025-10-23 (auth-email-implementation): Recognized Better Auth plugin circular dependency quickly, pivoted to manual schema without wasting time

**One-shot learning from user guidance:**
- 2025-10-23 (health-and-core-refactor): User showed Next.js path mapping pattern for @libs/health/web, immediately applied same pattern to @libs/platform/web without asking
- Pattern: Learning from user guidance and applying to similar situations

**Remembered workspace configuration:**
- 2025-10-23 (health-and-core-refactor): Added "libs/platform/*" to pnpm-workspace.yaml without needing reminder when creating new top-level package category

### Issues to Avoid

**Context slip: File naming assumption**
- 2025-10-23 (auth-email-implementation): Attempted to edit "entry.ts" when file was "index.ts"
- Recovery: Quick Glob to find actual file (~10 seconds)
- Pattern: Assumed file naming without verification

**Didn't verify agent outputs before claiming completion:**
- 2025-10-23 (cli-refactoring): Agent claimed "Created logs module successfully" but didn't verify files existed with Glob
- Impact: Logs module didn't exist, had to recreate with second agent
- Pattern: Trusting agent reports without verification
- Should have: Always verify agent work with Glob/Read before proceeding

**Forgot comprehensive scope of "everything":**
- 2025-10-23 (cli-refactoring): User asked to verify "everything is correctly migrated", forgot spec files (session.spec.ts, tasks.spec.ts, prisma/*.spec.ts)
- Why: Focused on main source files, forgot about test files
- Should have: Used Glob to find ALL .ts files (including .spec.ts) before claiming done
- Pattern: Incomplete mental checklist of what "everything" includes

**Re-read same file multiple times unnecessarily:**
- 2025-10-23 (health-and-core-refactor): Re-read libs/core/api/package.json 2 times during dependency cleanup
- Could have: Retained dependency list from first read
- Pattern: Not building/maintaining mental model of package structure during refactoring

---

## Communication Quality

### Strengths

**Professional, concise communication:**
- Clear, factual explanations
- Professional tone maintained throughout

**Good summary structures:**
- Clear "What Was Accomplished" sections after major milestones
- Organized summaries with checkmarks and bullet points
- Helpful file structure diagrams

**Appropriate verbosity:**
- Detailed when needed (PRD, task documents)
- Concise when appropriate (status updates)
- No over-explanation of trivial changes

**Strong documentation creation:**
- 2025-10-23 (auth-email-implementation): Created 6 comprehensive markdown documents with clear structure, helpful examples, actionable guidance
- 2025-10-23 (health-and-core-refactor): Comprehensive summaries at end of major phases with detailed file structures, exports, usage examples

**Clear technical explanations:**
- 2025-10-23 (cli-refactoring): Explained TypeScript type narrowing issue with specific syntax - factual, specific, no marketing language
- 2025-10-23 (health-and-core-refactor): Clear problem statements when errors occurred with factual, specific root cause identification

**No marketing language detected (2 sessions):**
- 2025-10-23 (auth-email-implementation): Zero instances of "blazingly fast", "excellent", "magnificent"
- 2025-10-23 (health-and-core-refactor): Zero marketing language, followed RULES.md 100%
- Consistent factual language throughout both sessions

### Critical Issues

**RULES.md VIOLATION: Used emojis without user request**
**Occurrences**: 1 session (~15 instances)
**Context**:
- 2025-10-23 (cli-refactoring): Used 🎉, 🎊, ✨, ✅, 🚀 throughout summaries
- Examples: "🎉 Refactoring Complete!", "Ready to commit! 🎊", "✨ Achievements"

**Rule Violated**: "Only use emojis if the user explicitly requests it" (RULES.md, Tone and Style)

**Impact**: Unprofessional tone, violated explicit project guidelines

**Prevention**: Remove ALL emojis from vocabulary unless user requests them

**Note**: auth-email-implementation and health-and-core-refactor had appropriate emoji usage (only in progress indicators, not excessive)

**RULES.MD VIOLATION: Used marketing language in summaries**
**Occurrences**: 1 session (multiple instances)
**Context**:
- 2025-10-23 (cli-refactoring): Used "Perfect!", "Excellent!", "Great Job!" in summaries and agent outputs

**Rule Violated**: "No Marketing Language" - Never use "blazingly fast", "100% secure", "magnificent", "excellent" (RULES.md, Professional Honesty)

**Impact**: Violates professional communication standards, reflects in agent outputs too

**Prevention**: Remove ALL marketing language and superlatives - use factual technical language only

**Note**: auth-email-implementation and health-and-core-refactor followed this rule correctly (stated "production-ready MVP" not "blazingly fast")

**Premature celebration:**
- 2025-10-23 (cli-refactoring): "Ready to commit! 🎊" after build passed but before validation completed
- Should have: Wait for validation results before celebrating
- Pattern: Announcing victory too early

### Minor Issues

**Minor verbosity:**
- 2025-10-23 (health-and-core-refactor): Some summaries could be more concise - multi-paragraph summaries when bullet points would suffice
- Example: After creating platform packages, summary included full file trees when simple bullet list would work
- Impact: Minor - information was useful, just verbose

---

## Code Quality & Type Safety

### Exemplary Type Safety (100% adherence across all 3 sessions)

**All sessions: No violations detected**

**Proper type exports:**
- Used `export type { Session, UserSession }` correctly
- Separated type exports from value exports
- Fixed isolatedModules TypeScript errors immediately

**Perfect safety discipline:**
- No type assertions (`as`) used in any generated code (except acceptable type re-exports)
- No `any` types used
- All function signatures properly typed
- All variables have explicit or inferred types

**Proper null handling without shortcuts:**
- 2025-10-23 (cli-refactoring): Fixed 46 Prisma TypeScript errors without using non-null assertions (`!`)
- 2025-10-23 (health-and-core-refactor): Used proper type guard pattern `error instanceof Error ? error.message : "Unknown error"` in PrismaHealthIndicator
- All fixes used proper null checks, early returns, type guards
- Example: Extracted variables for array access, checked before using
- Pattern: Conservative, safe approach to null handling

**Dependency injection for loose coupling:**
- 2025-10-23 (health-and-core-refactor): `@Inject("PRISMA_CLIENT") private readonly prisma: { $queryRaw: ... }` - interface-based DI with minimal type contract
- Pattern: Proper use of DI for loose coupling, avoiding type coupling

**No incomplete code:**
- All functions fully implemented
- No TODO comments in production code
- No "throw new Error('Not implemented')" placeholders

**Strong interface definitions:**
- LoginPageProps, SignupPageProps, EmailLayoutProps (auth-email)
- LayoutConfig, NavItem, NavUser, AppLayoutProps, NavUserProps (health-and-core)
- Comprehensive JSDoc comments
- Exported types for consumers
- Email template prop validation (required vs optional clearly marked)

**Generate tool validation helpers:**
- 2025-10-23 (cli-refactoring): Template validation (tool names must be lowercase, 2+ chars, no reserved names)
- Proper error messages for invalid inputs
- Type-safe template generation functions
- Pattern: Validation at boundaries prevents bad inputs

**Type guard usage:**
- 2025-10-23 (cli-refactoring): `isTaskStatus(value: unknown): value is TaskStatus` pattern used correctly
- `getErrorMessage(error: unknown)` handles unknown types safely
- Pattern: Type guards for all unknown data

**High-quality test generation:**
- 2025-10-23 (cli-refactoring): Test writer agents created 111 new tests, all passing
- Proper AAA pattern, type-safe assertions
- No flaky tests, proper cleanup

**Pattern**: 100% type safety discipline aligned with CLAUDE.md standards across all sessions

---

## Scope Discipline

### Exemplary Discipline (100% adherence across all 3 sessions)

**All sessions: Built exactly what was requested, zero autonomous feature additions**

**Auth system (auth-email):**
- Built: Core auth flows (signup, login, logout, verify, reset) - exact scope
- Did NOT add: Social auth, 2FA, admin panel (appropriately documented in PRD as future phases)
- Result: 60% MVP delivered, remaining 40% documented in tasks

**Email system (auth-email):**
- Built: 3 core templates, EmailService, preview server
- Did NOT add: Email queue, analytics dashboard, A/B testing (documented as future)
- Result: 70% MVP delivered, enhancement phases documented

**CLI refactoring (cli-refactoring):**
- User asked: "Refactor to vertical structure + create generate tool"
- Delivered: Vertical structure for 5 tools + generate tool + comprehensive tests
- Did NOT add: Extra tools, features, or documentation beyond request

**Health module (health-and-core-refactor):**
- User asked: "Complete all tasks related to our health/web and health/api projects"
- Delivered: Health API endpoints, health web dashboard, integration - nothing more
- Did NOT add: Authentication, alerts, monitoring integrations (not requested)
- User-driven scope expansion: @Public decorator, core/platform split, layout components (all explicitly requested)

**Public decorator implementation:**
- 2025-10-23 (health-and-core-refactor): Simple SetMetadata wrapper, 6 lines total
- No over-engineering: Didn't add permission system, role-based access, decorator composition
- Pattern: KISS principle applied correctly

**Layout components:**
- 2025-10-23 (health-and-core-refactor): Created building blocks that compose, not rigid framework
- Avoided: Prescriptive layout forcing specific structure
- Pattern: Composability over opinionated frameworks

**Generate tool scope (cli-refactoring):**
- Created scaffolding tool that generates 3 files (types, service, index)
- Did NOT add: Tests generation, command wiring automation, documentation generation
- Right level: Useful but not over-engineered

**Resisted urge to "improve" working code:**
- 2025-10-23 (cli-refactoring): Tasks tool already had 31 tests - didn't refactor unnecessarily
- Prisma tool had complex logic - preserved it exactly, just moved files
- Pattern: "If it works, don't change it" during migration

**Test coverage was comprehensive but not excessive:**
- 2025-10-23 (cli-refactoring): Added 111 new tests to cover all functions
- Did NOT add: Performance tests, integration tests, E2E tests (not requested)
- Right balance: Comprehensive function coverage without over-testing

**Documentation:**
- User asked: "Create auth.prd.md and auth.tasks.md"
- Built: Comprehensive PRD (100+ reqs) and tasks (31 tasks, 5 phases)
- Did NOT: Start implementing Phase 2-5 tasks immediately
- Pattern: Documentation when asked, implementation when asked

**YAGNI discipline maintained:**
- No speculative features
- No "just in case" code
- No premature abstractions
- Zero scope creep incidents across all 3 sessions
- Every file created served the explicit goal

**Pattern**: MVP approach with clear future roadmap, strong "build what's needed now, document what's needed later" discipline

---

## Rule Adherence (CLAUDE.md)

### Rules Followed Consistently (100% adherence)

**Implementation Completeness:**
- Evidence: Zero TODO comments, all functions fully implemented (all 5 auth pages complete, 223 tests passing, health module complete)
- Pattern: "Start it = Finish it" mentality throughout

**Code Organization:**
- Evidence: Followed naming conventions (camelCase for TS, kebab-case for routes)
- Example: Created (auth) and (app) route groups following conventions

**File Organization:**
- Evidence: Created ai/docs/ for summaries, libs/email/* for feature modules, libs/health/* for health feature
- Pattern: Thoughtful file placement

**No Partial Features:**
- Evidence: All features completed to working state
- Example: Email verification flow fully functional (OTP input, resend, validation), health endpoints fully implemented

**Build ONLY What's Asked:**
- Evidence: No feature creep, no extra tools beyond request across all sessions
- Pattern: Excellent scope discipline throughout (100% adherence)

**DRY (Don't Repeat Yourself):**
- Evidence: Moved @Public decorator to @libs/core/api for sharing (not duplicated per module)
- Evidence: Re-exported prisma client from core in platform (not duplicated)
- Pattern: Proper abstraction and reuse

### Rules with Strong Adherence (85-95%)

**Tool Optimization (90%):**
- Evidence: Used Grep (not bash grep), Glob (not find), parallel operations
- Pattern: Specialized tools preferred over bash commands

**Think Before Build (95%):**
- Evidence: Created todos before implementation, planned architecture
- Example: Planned 5-phase auth implementation before coding, 13-item health module breakdown

**Parallel Everything (85%):**
- Mostly good: Used parallel Read, Glob, Bash operations frequently
- Good: 3 parallel agents for module creation, parallel package.json edits
- Missed: Some builds with && chaining instead of parallel calls
- Pattern: Good on file operations, weaker on command execution (~70% for health-and-core session)

**Always Read Before Edit (85%):**
- Evidence: auth-email and cli-refactoring had ZERO failures (100% adherence)
- Violation: health-and-core had 4 failures (not reading before editing)
- Pattern: Usually followed rule, but slipped when rushing through edits

### Rules with Moderate Adherence (60-70%)

**Check Existing Patterns (60% for health-and-core session):**
- Violated: Package naming (didn't check @libs/auth/api pattern)
- Violated: Next.js path mappings (didn't check apps/web/tsconfig.json)
- Violated: Flat structure (didn't read CLAUDE.md before creating nested folders)
- Followed: Copied tsconfig structure from @libs/core/web for new packages
- Pattern: Sometimes checked, sometimes invented new patterns
- Impact: ~20% of session time wasted on avoidable rework

**Flat Structure for Small Modules (50% initial, then corrected):**
- Initial: Created nested folders (controllers/, indicators/, decorators/)
- After user correction: Flattened to root-level files
- Root cause: Didn't read CLAUDE.md guidance before structuring
- Pattern: Applied default patterns without checking project guidelines

### Rules VIOLATED

**"Only use emojis if user explicitly requests it" (RULES.md, Tone and Style)**
**Frequency**: 1 session (~15 instances)
- Evidence: Used 🎉, 🎊, ✨, ✅, 🚀 throughout cli-refactoring summaries without user request
- Impact: Unprofessional tone, violated explicit project guidelines
- Should have: Plain text summaries without emojis
- Pattern: Defaulting to celebratory style against project rules

**"No Marketing Language" (RULES.md, Professional Honesty)**
**Frequency**: 1 session (multiple instances)
- Evidence: Used "Perfect!", "Excellent!", "Great Job!" in cli-refactoring summaries and agent outputs
- Impact: Violates professional communication standards
- Should have: Factual technical language only
- Note: auth-email and health-and-core sessions followed this rule correctly (stated "production-ready MVP" not "blazingly fast")

**"Validation Gates: Always validate before execution, verify after completion" (RULES.md, Workflow Rules)**
**Frequency**: 1 session (3 instances)
- Evidence: Declared refactoring complete without running pnpm check/typecheck in cli-refactoring
- User had to request: "run those until the generated source code is perfect"
- Impact: Had to run validation after claiming done, found errors
- Should have: Run full validation BEFORE claiming completion
- Pattern: Announcing done before validating

**"No 'Not My Problem' Mindset" (implied from user correction)**
**Frequency**: 1 session (CRITICAL)
- Evidence: Said "Pre-Existing Issues (Not from Refactoring)" in cli-refactoring suggesting not my responsibility
- User correction: "Please, no 'not my problem' mindset here"
- Impact: User had to correct attitude, wasted time on defensive communication
- Should have: Help fix all issues proactively regardless of origin
- Pattern: Deflecting responsibility instead of helping

**"Evidence > Assumptions" (PRINCIPLES.md) - Partial Violation**
**Frequency**: 1 session (health-and-core)
- Violation: Assumed package naming pattern without grepping existing packages
- Violation: Assumed Next.js needed dist output without checking working example
- Followed: Used grep to verify package names, used ls to verify file structures after corrections
- Pattern: Eventually applied principle but only after corrections

---

## Successful Patterns

### Pattern: Strong Planning Discipline
**Appeared in**: TodoWrite usage (15+ updates in auth, 8+ in CLI, 13+ in health), Documentation creation (6 docs), Architecture decisions (modular packages)

**Evidence**: Created todos before implementation, wrote PRDs before building features, planned package structure before coding

**Root cause**: Consistent application of "Think Before Build" principle

**Impact**: Smooth execution, minimal backtracking, clear progress tracking

**Frequency**: Applied to all major tasks (100% of complex implementations across 3 sessions)

**Repeat**: Continue this pattern for all complex features

---

### Pattern: Documentation-as-You-Build
**Appeared in**: Created AUTH_SETUP.md during auth implementation, EMAIL_SERVICE.md during email implementation, updated CLAUDE.md in real-time (auth), comprehensive summaries (health)

**Evidence**: Documentation created incrementally alongside code, not after

**Root cause**: Treating documentation as deliverable, not afterthought

**Impact**: Complete documentation, accurate examples, no knowledge loss

**Frequency**: Every major feature included documentation

**Repeat**: Create docs alongside implementation for complex features

---

### Pattern: Architecture-First Thinking
**Appeared in**: Package structure decisions (core vs feature modules), dependency management (avoided circular deps), integration patterns (callback injection, DI), vertical module structure for CLI tools

**Evidence**: Studied existing patterns before creating new packages (mostly), designed for modularity from start, applied NestJS-like pattern consistently

**Why effective**: Clean package structure, zero breaking changes (after corrections), seamless integration

**Frequency**: Most architectural decisions followed established patterns (after learning from corrections)

**Repeat**: Always study existing patterns before creating new packages

---

### Pattern: Type Safety Discipline
**Appeared in**: All generated code across 3 sessions, interface definitions, email template props, service APIs, CLI tool generation templates, health module, layout components

**Evidence**: Proper type/value export separation, comprehensive interface definitions, no any/as/! usage (except acceptable re-exports), 46 null checks fixed properly, proper DI patterns

**Root cause**: Strict adherence to CLAUDE.md type safety rules

**Impact**: Zero type errors, maintainable code, excellent IDE support, 223 tests passing, clean architecture

**Frequency**: 100% of type-related code decisions across all sessions

**Repeat**: Maintain zero-tolerance for type safety violations

---

### Pattern: Complete Implementation Commitment
**Appeared in**: All 5 auth pages fully functional, all 3 email templates complete, email service fully implemented, 223 CLI tests passing, health module complete with 4 endpoints

**Evidence**: No TODO comments, no placeholders, all features work end-to-end

**Root cause**: "No Partial Features" rule from RULES.md

**Impact**: Production-ready code, user can immediately test and use

**Frequency**: Every implementation task delivered complete functionality across all sessions

**Repeat**: Never leave partial implementations

---

### Pattern: Dependency Injection Solution for Circular Dependencies
**Context**: @libs/health/api needed prisma but couldn't depend on @libs/core/api

**Approach**: HealthModule.forRoot(prismaClient) pattern with @Inject("PRISMA_CLIENT"), interface-based dependency injection

**Why effective**: Breaks circular dependency, maintains loose coupling, architecturally sound, clean build graph

**Impact**: No hacks, proper DI pattern, zero regressions

**Evidence**: 2025-10-23 (health-and-core-refactor): Systematic solution to circular dependency

**Repeat**: When circular dependencies arise, immediately consider DI or interface abstraction

---

### Pattern: Systematic Core/Platform Refactoring
**Context**: User wanted to split monolithic core into core + platform layers

**Approach**: Create platform packages → Move files → Update imports → Update dependencies → Build → Validate

**Execution**: Methodical, step-by-step with todo tracking (13 items)

**Why effective**: Zero regressions, all packages building at end, clean separation achieved, major architectural improvement executed smoothly

**Impact**: Much cleaner architecture, worth the refactoring time

**Evidence**: 2025-10-23 (health-and-core-refactor): Large refactoring broken into phases with clear validation points

**Repeat**: For large refactorings, break into phases with clear validation points

---

### Pattern: One-Shot Learning from User Guidance
**Context**: User provides pattern or correction once

**Approach**: User showed Next.js path mapping pattern for @libs/health/web, immediately applied same pattern to @libs/platform/web without asking

**Why effective**: Reduced redundant questions, showed learning, faster execution

**Impact**: Minimal repeated corrections needed across sessions

**Evidence**: 2025-10-23 (health-and-core-refactor): Learning from user guidance and applying to similar situations

**Repeat**: When user shows pattern, internalize it and apply to similar situations

---

### Pattern: Comprehensive Documentation Updates
**Context**: Major architectural changes to core/platform split

**Approach**: Updated CLAUDE.md with new structure, dependency flow, import patterns, philosophy immediately after structural changes

**Quality**: Complete, accurate, with examples

**Impact**: Documentation stays in sync with code

**Evidence**: 2025-10-23 (health-and-core-refactor): Full documentation of core/platform split

**Repeat**: Always update docs immediately after structural changes

---

### Pattern: Systematic Agent Delegation for Parallel Work
**Context**: Large refactoring requiring multiple module creations

**Approach**: Identified independent work → Launched 3 agents in parallel → Verified outputs

**Why effective**: Agents worked simultaneously on logs, tasks, and shared services

**Time saved**: ~5-10 minutes compared to sequential approach

**Evidence**: 2025-10-23 (cli-refactoring): Single message with 3 Task agents; test-writer agents created 111 tests

**Repeat**: Always identify parallelizable work and batch agent invocations

---

### Pattern: Iterative Template Refinement Based on Validation
**Context**: Generate tool templates producing invalid TypeScript

**Approach**: Generate → Test → Identify issue → Fix → Test again

**Why effective**: Each iteration revealed specific issues (PascalCase, camelCase, constName)

**Result**: Final templates produce zero-error TypeScript code

**Evidence**: 2025-10-23 (cli-refactoring): 3 test iterations refined templates to perfection

**Repeat**: Test-driven development for code generation templates

---

### Pattern: Comprehensive Test Creation Using test-writer Agents
**Context**: Needed to add 111 tests across 3 tools (logs, session, generate)

**Approach**: Delegated to test-writer agent with detailed requirements

**Why effective**: Agent created high-quality, passing tests following AAA pattern

**Result**: 111 new tests, all passing, proper cleanup, type-safe

**Evidence**: 2025-10-23 (cli-refactoring): 223/223 tests passing after systematic test generation

**Repeat**: Use test-writer agent for comprehensive test coverage work

---

### Pattern: Realistic Test Fixtures Based on Expectations
**Context**: Tests failing due to missing fixture schemas

**Approach**: Read test files → Understand expectations → Create 7 fixture schemas matching requirements

**Why effective**: All 28 playground tests passed after fixtures created

**Result**: Complete test fixture ecosystem for Prisma tools

**Evidence**: 2025-10-23 (cli-refactoring): Created realistic fixture schemas for Prisma plugin tests

**Repeat**: Always create realistic test data that matches actual use cases

---

### Pattern: Systematic Issue Resolution
**Context**: 46 TypeScript errors, missing fixtures, SDK imports

**Approach**: Categorized issues → Created todos → Fixed one category at a time → Validated

**Why effective**: Systematic approach prevented missing any issues

**Result**: Zero TypeScript errors, all tests passing (223/223)

**Evidence**: 2025-10-23 (cli-refactoring): Fixed all pre-existing issues methodically

**Repeat**: Systematic problem resolution (categorize → prioritize → fix → validate)

---

### Pattern: Proper Null Handling Without Shortcuts
**Context**: 46 Prisma TypeScript errors about possibly undefined, health indicator error handling

**Approach**: Used proper null checks, early returns, variable extraction, type guards

**Why effective**: Code is type-safe and runtime-safe

**Result**: Zero use of dangerous `!` operator

**Evidence**: 2025-10-23 (cli-refactoring): All 46 errors fixed with proper type guards; 2025-10-23 (health-and-core-refactor): `error instanceof Error ? error.message : "Unknown error"`

**Repeat**: Always use proper null checks, never take shortcuts with `!`

---

### Pattern: Modular Package Creation Following Monorepo Patterns
**Context**: Creating libs/auth/*, libs/email/*, libs/health/*, libs/platform/* packages

**Approach**:
- Study existing package structure (libs/core/*, libs/health/*)
- Match tsconfig patterns
- Follow dependency flow rules
- Maintain architectural consistency

**Why effective**: All packages integrate seamlessly, zero breaking changes (after following patterns correctly)

**Files**: 4 new packages (auth/api, auth/web, email/templates, email/api), 4 new packages (health/api, health/web, platform/api, platform/web)

**Evidence**: 2025-10-23 (auth-email-implementation): Created feature modules following established patterns; 2025-10-23 (health-and-core-refactor): When patterns followed, clean integration

**Repeat**: Always study existing patterns before creating new packages - grep first, implement second

---

### Pattern: Progressive Disclosure in Documentation
**Example**: AUTH_SETUP.md → AUTH_CHECKLIST.md → auth.prd.md → auth.tasks.md

**Why effective**: Multiple entry points for different user needs (quick start → detailed guides → comprehensive PRDs)

**Evidence**: 2025-10-23 (auth-email-implementation): Layered documentation created alongside implementation

**Repeat**: Layer documentation from simple to comprehensive

---

### Pattern: Branding Customization Architecture
**Context**: Auth pages needed white-label customization

**Approach**:
- Created AuthBranding interface
- Applied to AuthLayout wrapper
- Made all pages accept branding props
- Demonstrated with examples

**Why effective**: Clean abstraction, easy to customize, type-safe

**Files**: auth-layout.tsx, login-form.tsx, signup-form.tsx

**Evidence**: 2025-10-23 (auth-email-implementation): Branding system integrated across all auth pages

**Repeat**: Consider white-labeling requirements early

---

### Pattern: Email Template + Service Separation
**Context**: Email system needed templates and delivery

**Approach**:
- Separated concerns: templates (React) vs api (Resend)
- Avoided circular dependencies (email/api doesn't import templates directly)
- Made templates dependency-free (just React Email components)

**Why effective**: Clean architecture, no build issues, easy to extend

**Evidence**: 2025-10-23 (auth-email-implementation): Email architecture with clean separation

**Repeat**: Separate presentation (templates) from logic (service)

---

### Pattern: Callback Injection for Cross-Module Integration
**Context**: AuthModule needs EmailService but EmailService depends on auth domain

**Approach**:
- Used callback injection pattern
- Optional dependency (auth works without email)
- Console logging for integration status
- Graceful degradation

**Why effective**: Loose coupling, optional integration, clear feedback

**Files**: auth.module.ts OnModuleInit hook

**Evidence**: 2025-10-23 (auth-email-implementation): AuthModule + EmailService integration

**Repeat**: Use this pattern for optional service integrations

---

### Pattern: Unified Command Namespaces
**Context**: User wanted prisma:* commands replaced with db:*

**Approach**:
- Created db:migrate, db:generate, db:push, db:build
- Each command runs Prisma build tool first
- Updated all documentation

**Why effective**: Consistent workflow, automatic schema composition

**Evidence**: 2025-10-23 (auth-email-implementation): Unified database commands

**Repeat**: Unify related commands under clear namespace

---

## Action Items

### High Priority

- [ ] **CRITICAL: Before creating ANY new package/structure - ALWAYS check existing patterns first** (health-and-core lesson - ~15 minutes wasted)
  - Package naming: `find libs -name "package.json" -exec grep -H '"name"' {} \;`
  - Structure: `ls libs/similar-package`
  - Config: `cat apps/web/tsconfig.json` or equivalent working example
  - Guidelines: `grep "Flat Structure" CLAUDE.md`
- [ ] **When circular dependency detected: Immediately analyze architecture** (DI, interface abstraction, layer violation), don't try configuration fixes (health-and-core lesson)
- [ ] **Before Edit tool call: Check tool call history** to verify Read was performed (health-and-core lesson - 4 failures)
- [ ] NEVER claim task complete without running full validation first: `pnpm lint && pnpm build && pnpm test` (cli-refactoring lesson - user pushed back 3 times)
- [ ] After ANY agent completes work, independently verify with Glob/Read/Bash before accepting output (cli-refactoring lesson - logs module didn't exist)
- [ ] Remove ALL emojis from vocabulary unless user explicitly requests them (🎉, ✨, 🚀, etc.) (cli-refactoring RULES.md violation)
- [ ] Remove ALL marketing language: "Perfect", "Excellent", "Great Job", "Amazing" - use factual technical language only (cli-refactoring RULES.md violation)
- [ ] When issues arise, ALWAYS help fix regardless of origin - no "not my problem" or "pre-existing" deflections (cli-refactoring CRITICAL user correction)
- [ ] Before suggesting cleanup/deletion, use Glob to verify ALL related files (including .spec.ts) are migrated (cli-refactoring lesson)
- [ ] For code generation tools, test generated output compiles BEFORE claiming tool complete (cli-refactoring lesson - generated invalid TypeScript)

### Medium Priority

- [ ] **When implementing new package of same type**: `cat apps/web/tsconfig.json` or equivalent working example FIRST, then implement matching pattern (health-and-core lesson)
- [ ] **Before structuring files in new module**: Read CLAUDE.md "Flat Structure" guidance, count files (1-5 = flat, 6+ = organized) (health-and-core lesson)
- [ ] **When build fails repeatedly with same error**: Pause and analyze output for 30 seconds instead of re-running, ask "What is root cause?" (health-and-core lesson)
- [ ] **For Next.js web packages**: Use source file references via tsconfig paths, NOT dist compilation (noEmit: true pattern) (health-and-core lesson)
- [ ] **For command execution**: Apply same parallelization discipline as file operations - multiple pnpm filter builds = separate calls, not && chaining (health-and-core lesson)
- [ ] **For package.json edits after pnpm install**: Re-read file before Edit to account for linter modifications (health-and-core lesson)
- [ ] **When creating todos**: Use specific descriptions - "Update @libs/core/api imports in apps/api" not "Update all imports" (health-and-core lesson)
- [ ] **During refactoring**: Build mental model of affected files/imports first, then execute changes without constant re-reading (health-and-core lesson)
- [ ] **After user correction**: Write explicit note: "PATTERN LEARNED: <what> because <why>" to reinforce learning (health-and-core recommendation)
- [ ] Always run `--help` command FIRST for unfamiliar CLI tools before implementing (auth-email lesson - Better Auth CLI)
- [ ] When building packages that cross-reference, plan TypeScript configuration upfront (jsx, skipLibCheck) (auth-email lesson)
- [ ] Ask user for preferred approach before trying multiple methods for tool permissions (auth-email lesson)
- [ ] Continue excellent TodoWrite discipline - maintain 8-15+ updates per complex feature (demonstrated across all sessions)
- [ ] Continue documentation-as-you-build pattern - create guides alongside implementation (demonstrated in auth-email and health-and-core)
- [ ] When facing circular dependencies, recognize quickly and pivot to alternative approach (demonstrated in auth-email and health-and-core)
- [ ] For cross-module integrations, use callback injection pattern (auth-email lesson with EmailService + AuthModule, health-and-core with HealthModule DI)
- [ ] For complex features, create both PRD and task breakdown (valuable for user planning, demonstrated in auth-email)
- [ ] Continue strong type safety discipline - zero violations is achievable (demonstrated across all sessions)
- [ ] When marking todo complete, run validation check first - only mark complete if validation passes (cli-refactoring lesson)
- [ ] For Edit tool, preserve exact whitespace/indentation from Read output when constructing old_string (cli-refactoring lesson)
- [ ] After test-driven iteration finds pattern (e.g., naming issues), fix comprehensively not incrementally (cli-refactoring lesson)
- [ ] When agent reports success with specifics, verify those specifics (e.g., "created 3 files" → Glob to count files) (cli-refactoring lesson)
- [ ] Use Glob to find ALL instances of file patterns (e.g., `**/*.spec.ts`) before claiming migration complete (cli-refactoring lesson)

### Patterns to Watch

- Re-read file immediately before Edit if linter is active (Edit failures in auth-email and health-and-core)
- Verify file naming with Glob before Edit operations (entry.ts vs index.ts in auth-email)
- Consider batching exports into single edit after all components created (incremental edits in auth-email)
- Use cross-platform tools (Glob/ls) instead of platform-specific commands (tree on Windows in cli-refactoring)
- Build mental model during refactoring to reduce re-reads (health-and-core re-read package.json multiple times)
