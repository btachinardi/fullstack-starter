---
description: Perform deep session analysis to identify learning opportunities and actionable improvements
---

# /learn:analyze

Perform deep session analysis to identify learning opportunities, extract actionable insights, and create comprehensive learning report.

## Objective

Analyze the current Claude Code session to extract high-value learnings by systematically evaluating:
- What went wrong (failures, corrections, struggles)
- What went right (successes, effective patterns)
- Actionable improvements for future sessions

Create a brutally honest learning report with specific, actionable recommendations backed by concrete examples from the session.

## Context & Prerequisites

**Session Context:**

- All session data is available in memory (tool calls, user messages, task history, conversation flow)
- Analysis must happen in main conversation (NO subagents - they don't have access to full session)
- Report will be saved to `ai/learn/<session_name_or_timestamp>.md`

**Critical Constraint:**

- **NO SUBAGENTS**: This command CANNOT use Task tool or any subagents
- All analysis must be performed directly in the main conversation
- Reason: Subagents don't have access to full session context (tool calls, messages, etc.)

**Prerequisites:**

- Active Claude Code session with meaningful work completed
- Directory `ai/learn/` exists (create if needed)

**Analysis Categories:**

The command evaluates 11 core areas:
1. Tool Call Failures (why failed, preventable, patterns)
2. User Corrections (what was wrong, root cause, what user wanted)
3. Persistent Task Failures (stuck in loops, hacks vs solutions)
4. Efficiency & Parallelization (missed opportunities, redundant operations)
5. Planning & Todo Management (TodoWrite quality, completion tracking)
6. Context & Memory (re-reading, forgetting, redundant questions)
7. Communication Quality (verbosity, marketing language, clarity)
8. Code Quality & Type Safety (type assertions, any usage, incomplete code)
9. Scope Discipline (feature creep, YAGNI violations, over-engineering)
10. Rule Adherence (which CLAUDE.md rules followed/violated)
11. Successful Patterns (what worked exceptionally well)

## Instructions

### Phase 1: High-Impact Scan (Quick Initial Assessment)

**Objective:** Rapidly capture big-impression items to prioritize deeper analysis

**What to do:**

1. **Create File Skeleton**

   Create `ai/learn/<session_name_or_timestamp>.md` with the following structure:

   ```markdown
   # Session Learning Report
   **Session**: <name/timestamp>
   **Date**: <date>

   ## High-Impact Issues (Initial Scan)
   🔴 **Critical**
   -

   🟡 **Medium Impact**
   -

   🟢 **Successes**
   -

   ---

   ## Detailed Analysis

   ### Tool Call Failures


   ### User Corrections


   ### Persistent Task Failures


   ### Efficiency & Parallelization


   ### Planning & Todo Management


   ### Context & Memory


   ### Communication Quality


   ### Code Quality & Type Safety


   ### Scope Discipline


   ### Rule Adherence (CLAUDE.md)


   ### Successful Patterns


   ## Patterns Identified


   ## Action Items for Future Sessions
   - [ ]
   - [ ]
   - [ ]

   ## Executive Summary

   ```

2. **Perform Rapid Scan**

   Think through the session and identify:
   - 🔴 **Critical issues**: Major failures, significant corrections, fundamental misunderstandings
   - 🟡 **Medium issues**: Moderate struggles, inefficiencies, missed opportunities
   - 🟢 **Successes**: Notable wins, effective problem-solving, exemplary patterns

3. **Write High-Impact Issues Section**

   Edit the file to add 1-line descriptions for each issue/success identified.
   This creates a priority roadmap for deeper analysis.

**Validation:**

- [ ] File created with full skeleton structure
- [ ] At least 3 critical issues identified (or note "None")
- [ ] At least 3 medium issues identified (or note "None")
- [ ] At least 3 successes identified
- [ ] Each item is 1 line maximum

**Time Target:** 2-3 minutes

---

### Phase 2: Deep Dive Analysis (Think → Edit → Repeat)

**Objective:** Systematically analyze each category with depth, using thinking mode extensively

**Process Pattern:**

For EACH category below:
1. **THINK** deeply about the category (use thinking blocks ~70% of time)
2. **EDIT** the file to add detailed findings
3. Move to next category

**CRITICAL:** Use thinking mode extensively. Most of your work should be thinking through what happened, why it happened, and what to learn from it.

**Analysis Categories:**

#### 1. Tool Call Failures

**Think about:**
- Which tool calls failed or returned errors?
- Why did they fail? (Wrong parameters, invalid paths, incorrect syntax, missing prerequisites)
- Were failures preventable with better planning or context awareness?
- How were failures handled? (Retry, workaround, gave up, asked user)
- Are there patterns in failures? (Same tool repeatedly, specific error types)

**What to write:**
- Specific tool calls that failed (tool name, parameters used, error message)
- Root cause analysis for each failure
- Whether failure was preventable and how
- Quality of recovery/handling
- Patterns across multiple failures

**Example:**
```markdown
### Tool Call Failures

**Edit tool failed 3 times on auth.module.ts (lines 45-67)**
- Root Cause: Tried to edit file before reading it, violated Edit tool rules
- Preventable: Yes - should have used Read first per tool documentation
- Recovery: Eventually used Read → Edit pattern correctly
- Pattern: Rushed into editing without understanding file structure first

**Glob pattern failed to find test files**
- Root Cause: Used `*.test.ts` instead of `**/*.test.ts` (missing recursive)
- Preventable: Yes - documentation shows recursive patterns
- Recovery: User corrected pattern, then succeeded
- Pattern: Insufficient knowledge of glob syntax
```

#### 2. User Corrections

**Think about:**
- What did user correct or clarify?
- What was I doing wrong or misunderstanding?
- What did user actually want that I missed?
- What was root cause of misunderstanding? (Didn't read carefully, assumed incorrectly, missed context)
- Could this have been avoided?

**What to write:**
- Each correction with context (what I did vs. what user wanted)
- Root cause of each misunderstanding
- Patterns in corrections (reading comprehension, assumption-making, scope creep)

**Example:**
```markdown
### User Corrections

**Correction 1: "Don't create tests yet, just the component"**
- What I did: Started generating component + tests + stories simultaneously
- What user wanted: Component only, tests later
- Root cause: Didn't read "just the component" carefully, applied standard pattern
- Avoidable: Yes - should have read user message more carefully

**Correction 2: "Use existing Button component, don't create new one"**
- What I did: Started creating new Button.tsx file
- What user wanted: Import from @libs/core/ui
- Root cause: Didn't check existing components before creating new
- Avoidable: Yes - should have searched codebase first (Glob + Grep)
```

#### 3. Persistent Task Failures

**Think about:**
- Which tasks took multiple attempts or got stuck?
- What kept failing or not working?
- Did I get stuck in loops? (Try → Fail → Retry same approach → Fail again)
- Did I eventually solve it properly or use a hack/workaround?
- What was blocking progress?

**What to write:**
- Tasks that struggled with multiple failures
- Number of attempts and what changed between attempts
- Whether final solution was proper or a workaround
- What eventually unlocked success

**Example:**
```markdown
### Persistent Task Failures

**Task: Fix TypeScript errors in auth module**
- Attempts: 4
- Pattern: Each attempt fixed surface issue but missed underlying type problem
- Stuck because: Focused on symptoms (errors) not root cause (missing interface)
- Eventually solved: User pointed to missing AuthConfig interface
- Learning: Should have traced error to its source first, not band-aid fixes

**Task: Get dev server running**
- Attempts: 3
- Pattern: Fixed one error, revealed next error, repeated
- Stuck because: Ran dev before installing dependencies
- Hack used: None - eventually ran pnpm install properly
- Learning: Should run bootstrap/setup steps before dev commands
```

#### 4. Efficiency & Parallelization

**Think about:**
- Did I run operations sequentially that could have been parallel?
- Did I make redundant tool calls? (Read same file twice, repeat same command)
- Did I use wrong tools? (bash grep instead of Grep tool, find instead of Glob)
- Did I miss opportunities to batch operations?
- What was time cost of inefficiencies?

**What to write:**
- Specific missed parallelization opportunities with time impact
- Redundant operations that wasted time
- Wrong tool choices that slowed things down
- Estimate of time wasted

**Example:**
```markdown
### Efficiency & Parallelization

**Missed parallel opportunity: Read 5 config files**
- What I did: 5 sequential Read calls (one response each)
- Should have: Single response with 5 parallel Read calls
- Time wasted: ~60 seconds (5x slower than needed)
- Pattern: Default to sequential when parallel was possible

**Redundant operation: Read package.json 3 times**
- Why: Forgot contents between edits, re-read each time
- Should have: Read once, keep context in memory
- Time wasted: ~15 seconds
- Pattern: Poor context retention

**Wrong tool: Used bash find instead of Glob**
- Why: Familiar with bash, didn't consider specialized tools
- Should have: Used Glob tool (faster, more reliable)
- Time impact: ~10 seconds + wrong results first time
- Pattern: Defaulting to bash instead of specialized tools
```

#### 5. Planning & Todo Management

**Think about:**
- Did I use TodoWrite for multi-step tasks?
- Were todo items clear and actionable?
- Did I update todo status properly? (in_progress → completed)
- Did I mark tasks complete prematurely?
- Did I forget to update todos?
- Did I have multiple tasks "in_progress" at once? (Should be exactly one)

**What to write:**
- TodoWrite usage quality assessment
- Specific examples of good/bad todo management
- Premature completions or forgotten updates
- Whether todos helped or were ignored

**Example:**
```markdown
### Planning & Todo Management

**Good: Created todos for 5-phase feature implementation**
- Clear breakdown of phases
- Updated status after each phase
- Kept exactly one task in_progress at a time
- Helped track progress and maintain focus

**Bad: Marked "Fix type errors" complete while 3 errors remained**
- Premature completion because initial errors fixed
- Didn't verify all errors resolved
- Had to reopen task later
- Pattern: Marking complete when "mostly done" not "fully done"

**Bad: Forgot to create todos for 4-step migration**
- Jumped directly to implementation
- Lost track of progress midway
- User had to ask "what's left?"
- Pattern: Skipping todos for "simple" tasks that turned complex
```

#### 6. Context & Memory

**Think about:**
- Did I re-read files unnecessarily?
- Did I forget information from earlier in session?
- Did I ask user questions I should have remembered?
- Did I repeat mistakes after user corrections?
- Did I maintain context across operations?

**What to write:**
- Specific context failures (forgot X from earlier)
- Re-reading same information multiple times
- Questions that showed poor memory
- Repeated mistakes after corrections

**Example:**
```markdown
### Context & Memory

**Re-read auth.module.ts 4 times in 10 minutes**
- Why: Kept forgetting import structure between edits
- Should have: Retained mental model after first read
- Pattern: Not building lasting mental context

**Forgot user said "use Prisma, not TypeORM"**
- Evidence: Started implementing TypeORM repository 5 minutes later
- Why: Focused on implementation details, didn't retain key constraint
- Impact: Wasted 3 minutes before user corrected again
- Pattern: Not maintaining user requirements in working memory

**Asked "Which test framework?" after user mentioned Jest earlier**
- Evidence: User said "run Jest tests" in previous message
- Why: Not reading previous messages before asking questions
- Pattern: Lazy questioning instead of context review
```

#### 7. Communication Quality

**Think about:**
- Was I too verbose or too terse?
- Did I use marketing language? ("blazingly fast", "excellent", "magnificent")
- Was I clear and professional?
- Did I provide enough context in explanations?
- Did I use emojis without user request?

**What to write:**
- Examples of verbose/unclear communication
- Any marketing language used (should be NONE)
- Clarity issues
- Professionalism assessment

**Example:**
```markdown
### Communication Quality

**Marketing language violation: "This excellent solution will be blazingly fast"**
- Location: Response about caching strategy
- Problem: Using superlatives without evidence
- Should have: "This caching approach reduces API calls by [X]%"
- Pattern: Over-enthusiastic instead of factual

**Too verbose: 200-word explanation for simple edit**
- Context: User asked to rename function
- What I did: Explained renaming theory, patterns, trade-offs for 200 words
- Should have: "Renamed getUserData → fetchUserData in 3 files"
- Pattern: Over-explaining trivial changes

**Good: Clear, factual error report**
- "Build failed: Missing import in line 47 (auth.module.ts)"
- Professional, specific, actionable
- No fluff, no marketing language
```

#### 8. Code Quality & Type Safety

**Think about:**
- Did I use `any` types?
- Did I use type assertions (`as`)?
- Did I use non-null assertions?
- Did I leave TODO comments?
- Did I generate incomplete code?
- Did I follow type safety rules from CLAUDE.md?

**What to write:**
- Each type safety violation with location
- Incomplete code generated
- Whether violations were caught/fixed
- Pattern analysis

**Example:**
```markdown
### Code Quality & Type Safety

**Used type assertion: `data as User` in auth.service.ts line 34**
- Context: API response parsing
- Problem: Unsafe - no runtime validation
- Should have: Created type guard `isUser(data: unknown): data is User`
- Caught: No - user didn't notice, code shipped with type assertion
- Pattern: Taking shortcut with `as` instead of proper type guards

**Generated incomplete function: `calculateTotal() { throw new Error("Not implemented") }`**
- Context: User asked for cart total calculation
- Problem: Placeholder instead of real implementation
- Should have: Implemented complete function or asked for requirements
- Pattern: Generating scaffolding when user expects working code

**Good: Proper type guards in validation.ts**
- Used `isErrorResponse(data: unknown): data is ErrorResponse` pattern
- No `any`, no assertions, no non-null assertions
- Followed type safety rules correctly
```

#### 9. Scope Discipline

**Think about:**
- Did I add features user didn't ask for?
- Did I over-engineer simple solutions?
- Did I build enterprise features for MVP requests?
- Did I follow YAGNI (You Aren't Gonna Need It)?
- Did I stay focused on requirements?

**What to write:**
- Each scope creep instance with what was asked vs. what I built
- Over-engineering examples
- Complexity added beyond requirements
- Times I correctly resisted scope creep

**Example:**
```markdown
### Scope Discipline

**Scope creep: User asked for login form, I added password reset**
- What user asked: "Create login form with email/password"
- What I built: Login form + password reset + email verification
- Problem: Added 2 features user didn't request
- Why: Assumed "login form" means "complete auth system"
- Pattern: Over-delivering beyond explicit requirements

**Over-engineering: Created 3-layer architecture for simple utility**
- Context: User asked for function to format dates
- What I built: DateFormatter class + DateFormatterFactory + DateFormatterConfig
- Should have: Single `formatDate(date, format)` function
- Pattern: Enterprise patterns for simple needs

**Good: Resisted urge to add Storybook when not requested**
- User asked: "Create Button component"
- I created: Button.tsx only (not stories, not tests)
- Correct: Built exactly what was asked
- Pattern: Staying focused on explicit requirements
```

#### 10. Rule Adherence (CLAUDE.md)

**Think about:**
- Which rules from CLAUDE.md did I follow well?
- Which rules did I violate?
- Are there patterns in violations?
- Did violations cause problems?

**What to write:**
- Rules followed consistently (examples)
- Rules violated (specific instances)
- Patterns in violations
- Impact of violations

**Example:**
```markdown
### Rule Adherence (CLAUDE.md)

**Rule followed: "Think Before Build" (PRINCIPLES.md)**
- Evidence: Created todos, analyzed patterns before implementing auth
- Impact: Smooth implementation, no backtracking
- Pattern: Consistent planning discipline

**Rule violated: "Parallel Everything" (RULES.md)**
- Evidence: Made 5 sequential Read calls instead of parallel
- Impact: ~60 seconds wasted time
- Pattern: Defaulting to sequential operations
- Frequency: 3 instances in this session

**Rule violated: "No Marketing Language" (RULES.md)**
- Evidence: Used "excellent" and "blazingly fast" in explanations
- Impact: Less professional communication
- Pattern: Over-enthusiastic tone
- Frequency: 2 instances in this session

**Rule followed: "Always Read Before Edit" (tool rules)**
- Evidence: 100% of Edit calls were preceded by Read
- Impact: Zero Edit failures due to not reading first
- Pattern: Consistent adherence to tool prerequisites
```

#### 11. Successful Patterns

**Think about:**
- What worked exceptionally well?
- What problem-solving approaches were effective?
- What decisions were particularly good?
- What patterns should be repeated in future sessions?

**What to write:**
- Specific successes with context
- Why they worked well
- What made them effective
- How to repeat in future

**Example:**
```markdown
### Successful Patterns

**Success: Used Grep to find all imports before refactoring**
- Context: Renaming module, needed to update all imports
- Approach: Grep → Review results → Plan changes → Execute
- Why effective: Found all 47 instances, zero misses
- Repeat: Always search before global changes

**Success: Created comprehensive type guards for API responses**
- Context: External API with unknown response types
- Approach: Define interfaces → Write type guards → Validate runtime
- Why effective: Zero type errors, runtime safety
- Repeat: Type guards for all external data

**Success: Broke complex migration into 5 phases with todos**
- Context: Database migration affecting 12 files
- Approach: Plan phases → Create todos → Execute one at a time → Validate each
- Why effective: Clear progress, no confusion, user could track
- Repeat: Multi-phase todos for complex tasks
```

**Validation for Phase 2:**

- [ ] All 11 categories analyzed
- [ ] Each category has specific examples (not vague statements)
- [ ] Thinking mode used extensively (~70% of time)
- [ ] File edited incrementally (not all at once)
- [ ] Examples include context, root cause, impact
- [ ] Patterns identified across multiple instances

**Time Target:** 15-20 minutes (most time spent thinking)

---

### Phase 3: Synthesis (Think → Edit)

**Objective:** Identify cross-cutting patterns and generate actionable improvements

**Process:**

1. **THINK About Cross-Cutting Patterns**

   Review all detailed analysis and identify themes:
   - What patterns appear across multiple categories?
   - What root causes explain multiple failures?
   - What strengths appear consistently?
   - What weaknesses are systemic vs. isolated?

2. **EDIT to Add Patterns Section**

   Write "## Patterns Identified" section with:
   - Recurring themes across categories
   - Root causes that explain multiple issues
   - Systemic strengths to build on
   - Systemic weaknesses to address

   **Example:**
   ```markdown
   ## Patterns Identified

   **Pattern: Default to Sequential Operations**
   - Appeared in: Efficiency, Tool Usage, Planning
   - Evidence: 5 sequential Reads, 3 sequential Greps, sequential file edits
   - Root cause: Not thinking "can these run in parallel?" before acting
   - Impact: ~2 minutes wasted across session

   **Pattern: Insufficient Context Retention**
   - Appeared in: Context & Memory, User Corrections, Tool Failures
   - Evidence: Re-read files 4x, forgot user requirements, repeated mistakes
   - Root cause: Not building lasting mental models of code/requirements
   - Impact: Redundant work, user corrections, confusion

   **Pattern: Strong Type Safety Discipline**
   - Appeared in: Code Quality, Successful Patterns
   - Evidence: Proper type guards, no `any`, runtime validation
   - Root cause: Consistent application of type safety rules
   - Impact: Zero type-related bugs, high code quality
   ```

3. **THINK About Actionable Improvements**

   For each pattern/issue identified, ask:
   - What specific behavior should change?
   - How can this be prevented in future?
   - What checklist item or reminder would help?
   - What should I start/stop/continue doing?

4. **EDIT to Add Action Items**

   Write "## Action Items for Future Sessions" with:
   - Specific, actionable improvements (checkbox format)
   - Each item addresses a specific pattern/issue
   - Items are measurable and concrete (not vague)
   - Priority order (most impactful first)

   **Example:**
   ```markdown
   ## Action Items for Future Sessions

   - [ ] Before ANY operation, ask: "Can these run in parallel?" - Review RULES.md parallel execution section
   - [ ] After reading file, write 1-sentence mental summary to aid retention
   - [ ] Before asking user question, scan previous 5 messages for answer
   - [ ] When user corrects me, add note to session memory: "User wants X not Y"
   - [ ] Use TodoWrite for ALL tasks with 3+ steps (no exceptions)
   - [ ] Mark todos complete ONLY when 100% done (not "mostly done")
   - [ ] Before any Edit, verify Read was performed (check tool call history)
   - [ ] When generating code, implement 100% (no TODOs, no placeholders)
   - [ ] Avoid marketing language: Remove "excellent", "blazingly", "magnificent" from vocabulary
   - [ ] Before creating new file, search for existing implementation (Glob + Grep)
   - [ ] For API responses, ALWAYS use type guards (never `as` casting)
   - [ ] When task fails, analyze root cause before retrying (don't repeat same approach)
   ```

5. **THINK About Overall Synthesis**

   Synthesize everything into high-level takeaways:
   - What's the biggest lesson from this session?
   - What was most impactful (good and bad)?
   - What's one thing to definitely repeat?
   - What's one thing to definitely avoid?

6. **EDIT to Add Executive Summary (Written LAST)**

   Write "## Executive Summary" with:
   - High-level synthesis (3-5 paragraphs)
   - Biggest wins and biggest struggles
   - Key takeaways and main improvements needed
   - Overall session assessment

   **Example:**
   ```markdown
   ## Executive Summary

   This session demonstrated strong type safety discipline and effective problem-solving patterns, but suffered from efficiency issues due to defaulting to sequential operations and poor context retention.

   **Key Strengths:**
   Type safety was excellent throughout - proper type guards for all external data, zero use of `any` or unsafe type assertions, comprehensive runtime validation. This prevented type-related bugs and produced high-quality, maintainable code. Problem decomposition was also strong, with effective use of TodoWrite for complex multi-phase tasks.

   **Key Weaknesses:**
   Parallelization was consistently missed - 5 instances of sequential operations that could have been parallel, wasting ~2 minutes of execution time. Context retention was poor, evidenced by re-reading the same files 4 times and forgetting user requirements stated minutes earlier. Communication included 2 instances of marketing language violations ("excellent", "blazingly fast") when factual language was required.

   **Main Improvement Needed:**
   Before executing ANY operation, explicitly ask "Can these run in parallel?" This single behavior change would capture most efficiency gains. Secondary improvement: Build lasting mental models after reading files/requirements to avoid redundant operations and forgotten context.

   **Overall Assessment:**
   Quality-focused session with strong code output, but efficiency improvements would significantly reduce execution time. No critical failures or scope creep issues. Strong adherence to CLAUDE.md rules overall (80%+), with specific areas for improvement identified.
   ```

**Validation for Phase 3:**

- [ ] Cross-cutting patterns identified (at least 3)
- [ ] Each pattern references multiple categories
- [ ] Action items are specific and measurable (not vague)
- [ ] Action items have checklist format
- [ ] Executive summary written LAST (after full analysis)
- [ ] Executive summary is balanced (strengths AND weaknesses)
- [ ] Executive summary includes overall assessment

**Time Target:** 5-7 minutes

---

## Output Format

### File Location

`ai/learn/<session_name_or_timestamp>.md`

Examples:
- `ai/learn/auth-implementation-20251023.md`
- `ai/learn/session-2024-10-23-143022.md`

### File Structure

```markdown
# Session Learning Report
**Session**: <name/timestamp>
**Date**: <date>

## High-Impact Issues (Initial Scan)
🔴 **Critical**
- <Major failure with 1-line description>

🟡 **Medium Impact**
- <Moderate issue with 1-line description>

🟢 **Successes**
- <Notable win with 1-line description>

---

## Detailed Analysis

### Tool Call Failures
<Deep dive with context, root cause, prevention>

### User Corrections
<What was wrong, what user wanted, why it happened>

### Persistent Task Failures
<Struggles, loops, eventual solution or hack>

### Efficiency & Parallelization
<Missed opportunities, redundant operations>

### Planning & Todo Management
<TodoWrite usage quality, completion tracking>

### Context & Memory
<Re-reading files, forgetting context, redundant questions>

### Communication Quality
<Verbosity, tone, clarity issues>

### Code Quality & Type Safety
<Type assertions, any usage, incomplete code>

### Scope Discipline
<Feature creep, YAGNI violations, over-engineering>

### Rule Adherence (CLAUDE.md)
<Which rules followed/violated, patterns>

### Successful Patterns
<What worked exceptionally well>

## Patterns Identified
<Recurring themes across categories>

## Action Items for Future Sessions
- [ ] <Specific, actionable improvement>
- [ ] <Pattern to watch for>
- [ ] <Rule to emphasize>

## Executive Summary
<High-level synthesis - written LAST>
```

### Report Characteristics

- **Brutally honest**: No sugar-coating, focus on learnings
- **Specific**: Concrete examples with context (file paths, line numbers, tool names)
- **Actionable**: Every finding leads to specific improvement action
- **Balanced**: Celebrates successes AND identifies improvements
- **Evidence-based**: Examples from actual session, not hypotheticals
- **Pattern-focused**: Recurring themes, not just isolated incidents

## Quality Standards

### Completeness Criteria

- [ ] File created in `ai/learn/` directory
- [ ] All 11 analysis categories present and analyzed
- [ ] High-impact scan completed with at least 6 items total
- [ ] Each category has specific examples (not vague statements)
- [ ] Patterns identified across categories (at least 3)
- [ ] Action items are specific and measurable (at least 8)
- [ ] Executive summary written last and synthesizes all findings
- [ ] Report is brutally honest (no marketing language in assessment)
- [ ] Thinking mode used extensively (~70% of Phase 2 time)

### Analysis Quality

- **Specific over vague**: "Used `as User` in auth.service.ts line 34" not "Some type issues"
- **Root cause over symptoms**: "Didn't read carefully" not "Made mistake"
- **Evidence-based**: "Re-read file 4 times" not "Memory seemed poor"
- **Actionable**: "Before Edit, verify Read was performed" not "Be more careful"
- **Balanced**: Both strengths and weaknesses represented
- **Pattern-focused**: Connects dots across multiple instances

### Writing Quality

- **Professional tone**: No marketing language in self-assessment
- **Clear structure**: Easy to scan and find specific learnings
- **Concrete examples**: File paths, line numbers, specific tools/commands
- **Measurable impact**: Time wasted, errors caused, efficiency gains
- **Honest assessment**: Acknowledges mistakes and areas for improvement

## Constraints & Boundaries

### Must Do

- Perform all analysis in main conversation (NO subagents)
- Use thinking mode extensively (~70% of time in Phase 2)
- Create file skeleton before starting detailed analysis
- Write high-impact scan immediately (Phase 1)
- Edit incrementally (never write entire sections at once)
- Provide specific examples with context for every finding
- Identify cross-cutting patterns
- Generate actionable improvement checklist
- Write executive summary LAST (after full analysis)
- Be brutally honest - this is for improvement, not validation

### Must Not Do

- Use Task tool or subagents (they don't have session context)
- Write all sections at once (must be incremental edits)
- Use vague assessments ("could be better", "some issues")
- Skip thinking mode (must think deeply about each category)
- Sugar-coat failures or make excuses
- Use marketing language in self-assessment
- Generate generic advice (must be specific to this session)
- Mark analysis complete without executive summary
- Write executive summary before detailed analysis

### In Scope

- Tool call failures and patterns
- User corrections and misunderstandings
- Task management and completion tracking
- Efficiency and parallelization opportunities
- Code quality and type safety
- Scope discipline and feature creep
- Communication quality
- CLAUDE.md rule adherence
- Context retention and memory
- Successful patterns worth repeating

### Out of Scope

- Analyzing other people's code (focus on assistant's actions)
- General advice not related to this session
- Theoretical improvements without evidence from session
- External factors outside assistant control
- User behavior or decisions (focus on assistant learnings)

## Examples

### Example: High-Impact Scan Section

```markdown
## High-Impact Issues (Initial Scan)
🔴 **Critical**
- Used type assertion `as User` in 3 locations without runtime validation (type safety violation)
- Made 5 sequential Read calls that should have been parallel (~60s wasted)
- Forgot user requirement "use Prisma not TypeORM", started implementing wrong ORM

🟡 **Medium Impact**
- Re-read package.json 3 times instead of retaining context
- Marked "Fix type errors" complete while 3 errors still existed (premature completion)
- Used marketing language "excellent solution" twice in explanations

🟢 **Successes**
- Created comprehensive type guards for all API responses (zero type errors)
- Broke complex migration into 5 phases with clear todos (excellent tracking)
- Used Grep to find all 47 imports before refactoring (zero misses)
```

### Example: Detailed Analysis Section

```markdown
### Tool Call Failures

**Edit tool failed 3 times on auth.module.ts**
- Error: "File not read before editing"
- Root cause: Tried to edit file without reading it first, violated Edit tool rules
- Location: auth.module.ts lines 45-67
- Preventable: Yes - should have used Read first per tool documentation
- How handled: After 3 failures, user corrected me, then I used Read → Edit correctly
- Pattern: Rushing into edits without reading, violating tool prerequisites

**Glob pattern failed to find test files**
- Pattern used: `*.test.ts` (expected `**/*.test.ts`)
- Error: No results returned when 12 test files exist
- Root cause: Forgot glob patterns need `**` for recursive search
- Preventable: Yes - documentation clearly shows recursive pattern syntax
- How handled: User corrected pattern, second attempt succeeded
- Pattern: Insufficient knowledge of glob syntax, not referencing docs

**Zero failures with Bash tool**
- All 15 git commands succeeded on first try
- All 8 pnpm commands succeeded on first try
- Pattern: Strong familiarity with git and pnpm, consistent success
```

### Example: Patterns Section

```markdown
## Patterns Identified

**Pattern: Default to Sequential Operations**
- Appeared in: Efficiency (5 sequential Reads), Tool Usage (3 sequential Greps), Planning (sequential file edits)
- Evidence: 5 Read calls in separate responses instead of single response with 5 parallel calls
- Root cause: Not pausing to think "can these run in parallel?" before executing
- Impact: ~2 minutes wasted execution time across session (~15% of total time)
- Frequency: 8 instances where parallelization was missed

**Pattern: Strong Type Safety Discipline**
- Appeared in: Code Quality (proper type guards), Successful Patterns (zero type errors), Rule Adherence (followed type safety rules 100%)
- Evidence: Created type guards for all external data, zero use of `any`, runtime validation
- Root cause: Consistent application of CLAUDE.md type safety rules
- Impact: High code quality, zero type-related bugs, maintainable code
- Frequency: 100% adherence across 47 type-related decisions

**Pattern: Insufficient Context Retention**
- Appeared in: Context & Memory (re-reading files), User Corrections (forgot requirements), Tool Failures (repeated mistakes)
- Evidence: Re-read package.json 3x, forgot "use Prisma" requirement, repeated Edit-without-Read mistake
- Root cause: Not building lasting mental models of code structure and requirements
- Impact: Redundant operations, user corrections needed, wasted time
- Frequency: 7 instances of forgotten context
```

### Example: Action Items Section

```markdown
## Action Items for Future Sessions

- [ ] Before ANY multi-operation task, explicitly ask: "Can these run in parallel?" and batch independent operations
- [ ] After reading any file, write 1-sentence mental summary to aid retention (e.g., "package.json: pnpm workspace with 8 packages")
- [ ] Before asking user ANY question, scan previous 10 messages to check if already answered
- [ ] When user corrects me, immediately add to session memory note: "CORRECTION: User wants X not Y because Z"
- [ ] Use TodoWrite for ALL tasks with 3+ steps - no exceptions, even if task seems "simple"
- [ ] Mark todos complete ONLY when 100% done (run validation check before marking complete)
- [ ] Before ANY Edit call, verify in tool call history that Read was performed (enforce prerequisite)
- [ ] For ALL external API responses: Create proper type guard, never use `as` type assertion
- [ ] When task fails, spend 30 seconds analyzing WHY before retrying (don't repeat same failing approach)
- [ ] Remove from vocabulary: "excellent", "blazingly", "magnificent", "superb" - use factual language only
- [ ] Before creating new file/component, run: Glob to check existence + Grep to check usage patterns
- [ ] After any user correction, ask myself: "Why did I miss this? What pattern explains it?"
```

### Example: Executive Summary Section

```markdown
## Executive Summary

This session demonstrated exceptional type safety discipline and effective problem decomposition, but suffered significantly from defaulting to sequential operations and poor context retention, resulting in ~15% time waste.

**Major Strengths:**
Type safety was exemplary throughout the session. Every external API response received a proper type guard with runtime validation, zero use of `any` types, and zero unsafe type assertions. This prevented type-related bugs entirely and produced highly maintainable code. Problem decomposition was also strong - the complex database migration was broken into 5 clear phases with TodoWrite tracking, allowing excellent progress visibility and systematic execution.

**Major Weaknesses:**
Parallelization was consistently missed across 8 instances, with the most egregious being 5 sequential Read calls that added ~60 seconds of unnecessary wait time. This represents ~15% of total session time wasted on serialization. Context retention was poor, evidenced by re-reading package.json 3 times within 10 minutes and forgetting the user's explicit "use Prisma not TypeORM" requirement stated 5 minutes earlier, leading to 3 minutes of wrong implementation.

**Critical Incident:**
The most impactful failure was starting TypeORM implementation after user explicitly said "use Prisma" 5 minutes earlier. Root cause: Not maintaining user requirements in working memory. This wasted 3 minutes and required user correction. Prevention: After user states requirement, write explicit note in session memory.

**Communication Issues:**
Two instances of marketing language violations ("excellent solution", "blazingly fast") when factual technical language was required per RULES.md. This reduces professionalism and credibility.

**Main Improvement Needed:**
Single highest-impact improvement: Before executing ANY multi-operation task, pause and explicitly ask "Can these run in parallel?" Then batch all independent operations into single response. This one behavior change would eliminate ~15% time waste and is immediately actionable.

**Overall Assessment:**
Quality-focused session producing high-quality, type-safe code with zero critical bugs. Strong adherence to type safety rules (100%) and good problem decomposition (80%). However, efficiency suffered significantly from sequential operations and poor context retention. No scope creep or feature bloat issues. CLAUDE.md rule adherence: 75% (strong on type safety and code quality, weak on parallelization and communication). Session achieved goals but took ~15% longer than necessary due to efficiency issues.

**Key Takeaway:**
Think "parallel by default, sequential only when dependent" instead of current "sequential by default". This mindset shift would transform efficiency.
```

## Related Commands

- `/git:commit`: Commit learning reports after creation
- `/agents:optimizer`: Similar deep analysis pattern for optimizing agents
- None: This is a unique introspection command with no direct alternatives

## Changelog

**Version 1.0** (2025-10-23)

- Initial implementation of session learning analysis command
- Three-phase process: High-Impact Scan → Deep Dive Analysis → Synthesis
- 11 analysis categories covering tool failures, user corrections, efficiency, planning, context, communication, code quality, scope, rules, and successes
- Critical constraint: NO subagents (must analyze in main conversation)
- Thinking mode emphasis (~70% of Phase 2 time)
- Incremental file editing approach (skeleton → edit repeatedly)
- Brutal honesty requirement for actionable learnings
- Comprehensive examples showing expected output quality
