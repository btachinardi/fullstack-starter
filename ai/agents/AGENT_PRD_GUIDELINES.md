# Agent PRD Guidelines

## Overview

This document provides comprehensive guidelines for writing Product Requirement Documents (PRDs) for Claude Code agents. Agent PRDs serve as the source specification for complex, orchestrated systems that decompose high-level tasks into specialized workflows executed by coordinated sub-agents.

**Key Principle:** Main agents orchestrate workflows but **never perform file changes directly**. All file operations must be delegated to specialized sub-agents.

## Document Purpose

Agent PRDs define:
- **Task Decomposition:** How complex tasks break down into manageable subtasks
- **Sub-Agent Design:** Specialized agents for each task type
- **Workflow Orchestration:** Sequential and parallel execution patterns
- **Quality Gates:** Validation checkpoints and success criteria
- **User Interactions:** Approval gates and feedback loops

## PRD Location

All agent PRDs must be placed in:
```
ai/agents/{agent-name}.prd.md
```

For domain-specific agents, use subdirectories:
```
ai/agents/git/{agent-name}.prd.md
ai/agents/testing/{agent-name}.prd.md
ai/agents/refactoring/{agent-name}.prd.md
```

---

## PRD Structure

### Required Sections

Every agent PRD must include the following sections:

#### 1. Header Metadata

```markdown
# Agent Name PRD

**Status:** Draft | In Review | Accepted | Implemented
**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Owner:** Team/Individual
**Implementation:**
- Main Agent: `/slash-command-name` or `agent-name`
- Sub-Agents: `sub-agent-1`, `sub-agent-2`, ...
```

#### 2. Executive Summary

Provide a concise (2-3 paragraph) overview:
- What problem does this agent solve?
- What value does it provide to users?
- What are the key capabilities?

**Example:**
```markdown
## Executive Summary

The Refactoring Orchestrator agent helps developers safely refactor code across
multiple files while maintaining consistency, test coverage, and documentation.
It breaks down refactoring requests into isolated changes, validates each step,
and ensures no breaking changes are introduced.

This agent provides value by automating the tedious coordination required for
large refactorings, reducing human error, and ensuring comprehensive validation
at each step. Users can request high-level refactorings and trust the system to
execute them safely.
```

#### 3. Problem Statement

Clearly define:
- Current pain points
- Why manual execution is problematic
- Complexity factors that require orchestration
- Scale or scope that necessitates automation

#### 4. Goals & Non-Goals

**Goals:** (3-5 specific, measurable objectives)
- What the agent will accomplish
- Success criteria
- Key capabilities

**Non-Goals:** (What is explicitly out of scope)
- Prevents scope creep
- Clarifies boundaries
- Sets expectations

**Example:**
```markdown
## Goals & Non-Goals

### Goals
1. Decompose complex refactorings into safe, atomic changes
2. Validate each change preserves functionality (tests pass)
3. Update all related documentation and types automatically
4. Provide clear rollback strategy if validation fails
5. Complete refactorings 10x faster than manual execution

### Non-Goals
- Performance optimization (covered by separate perf-optimizer agent)
- Code style changes (covered by linting/formatting tools)
- Cross-repository refactorings (single repo only)
- AI-suggested refactorings (only executes user-requested changes)
```

---

## Context Efficiency & Token Optimization

**Core Principle:** Context quality > context quantity. Research shows 8x efficiency gains through strategic context management.

### Context Quality Metrics

| Approach | Token Usage | Useful Signal | Efficiency |
|----------|-------------|---------------|------------|
| Slash command only | 169,000 | 9% | Baseline |
| Subagent delegation | 21,000 | 76% | 8x better |

**Key Finding:** Delegating verbose operations to subagents reduces context pollution from 91% noise to 24% noise.

### Context Isolation Pattern

**Problem:** Verbose operations (logs, stack traces, web searches) pollute main thread context, degrading reasoning quality.

**Solution:** Use subagents as context isolation boundaries:

```markdown
# ❌ Bad: Load verbose output into main thread
/command
  Run: pnpm dev
  Load: 50,000 lines of output into context
  Parse: Try to analyze everything
  Result: 91% noise, poor focus

# ✅ Good: Isolate noise in subagent
/command
  Run: pnpm dev > /tmp/output.log
  Read: Last 100 lines only (summary)
  Delegate: Task(stack-trace-analyzer) for deep analysis
  Result: 76% useful signal, clear objectives
```

### Token Budget Guidelines

**When to Compress:**
- Repetitive information (reference shared docs instead of duplicating)
- Output templates (create once, reference elsewhere)
- Standard procedures (link to guides instead of inline steps)

**When to Expand:**
- Core decision-making logic (upfront clarity prevents rework)
- Phase definitions (detail prevents ambiguity)
- Examples (depth teaches reasoning patterns)

**ROI Analysis:**
```
Terse approach:  5K tokens (instructions) + 30K tokens (rework) = 35K total
Clear approach: 20K tokens (instructions) +  2K tokens (rework) = 22K total

Savings: 37% fewer tokens overall through upfront clarity
```

### Information Density Best Practices

**Use structured formats for high information density:**

| Format | Best For | Density Score |
|--------|----------|---------------|
| Tables | Decision criteria, comparisons | Very High |
| Checklists | Validation steps | High |
| JSON schemas | Input/output contracts | Very High |
| Numbered lists | Sequential processes | High |
| Prose | Background context, rationale | Medium |

**Example - High Density Structure:**
```markdown
✅ Good (Dense, Scannable):
## Phase Validation
- [ ] All files accounted for (sum = total)
- [ ] No duplicate files across groups
- [ ] Dependency chains are acyclic
- [ ] Each group has valid commit type

❌ Bad (Verbose Prose):
"The agent should verify that all files are included and make sure no files
appear in multiple groups and check that the dependency ordering is correct
and validate each group has an appropriate type."
```

### Upfront Clarity ROI

**Research Finding:** Detailed instructions outperform terse ones by reducing rework costs.

| Instruction Length | Initial Cost | Rework Cost | Total Cost | Quality |
|-------------------|--------------|-------------|------------|---------|
| Terse (200 lines) | 5K tokens | 30K tokens | 35K tokens | Low |
| Verbose prose (1000) | 25K tokens | 10K tokens | 35K tokens | Medium |
| **Structured (800)** | **20K tokens** | **2K tokens** | **22K tokens** | **High** |

**Key Insight:** Structured, detailed instructions save tokens overall AND improve quality.

**Practical Guidelines:**
- Simple agents: 300-500 lines with 2-3 phases
- Medium agents: 500-800 lines with 3-4 phases
- Complex agents: 800-1200 lines with 4-6 phases
- Don't sacrifice clarity for brevity

---

## Task Decomposition

### Decomposition Strategy

Break the complex task into **3-7 distinct phases**. Each phase should:
- Have clear inputs and outputs
- Be independently validatable
- Represent a logical step in the workflow
- Map to one or more sub-agent invocations

### Phase Definition Template

For each phase, specify:

```markdown
### Phase N: {Phase Name}

**Purpose:** {1-2 sentence description}

**Inputs:**
- {Required data/files from previous phases or user}
- {Context needed for execution}

**Process:**
1. {Step-by-step breakdown}
2. {Each step should be concrete}
3. {Include validation checkpoints}

**Sub-Agent(s):**
- `sub-agent-name`: {What it does in this phase}
- `another-agent`: {Parallel execution if applicable}

**Outputs:**
- {Structured data format}
- {Files created/modified}
- {Metadata for next phase}

**Success Criteria:**
- {How to determine this phase succeeded}
- {Validation requirements}

**Failure Handling:**
- {What to do if validation fails}
- {Rollback strategy}
```

### Example: Refactoring Workflow

```markdown
## Task Decomposition

### Phase 1: Analysis & Planning

**Purpose:** Analyze the codebase to identify all locations affected by the
requested refactoring and create a dependency-ordered execution plan.

**Inputs:**
- User refactoring request (e.g., "rename function `foo` to `bar`")
- Target file/directory scope

**Process:**
1. Use code search to find all references to target symbol
2. Analyze import/export relationships to build dependency graph
3. Identify test files that cover affected code
4. Create ordered change groups based on dependencies
5. Estimate blast radius (files/lines affected)

**Sub-Agent(s):**
- `refactoring-analyzer`: Performs comprehensive code analysis
  - Tools: Read, Grep, Glob, Bash
  - Model: Sonnet 4.5 (complex reasoning required)
  - Output: JSON with change groups and dependency graph

**Outputs:**
```json
{
  "change_groups": [
    {
      "id": "group-1",
      "type": "implementation",
      "files": ["src/core/foo.ts"],
      "dependencies": [],
      "estimated_lines": 45
    },
    {
      "id": "group-2",
      "type": "consumers",
      "files": ["src/services/bar.ts", "src/api/baz.ts"],
      "dependencies": ["group-1"],
      "estimated_lines": 120
    }
  ],
  "test_files": ["tests/core/foo.test.ts", "tests/integration/api.test.ts"],
  "total_impact": {
    "files": 8,
    "lines": 230,
    "risk_level": "medium"
  }
}
```

**Success Criteria:**
- All symbol references found (no false negatives)
- Dependency graph is acyclic (no circular dependencies)
- Change groups cover 100% of affected code

**Failure Handling:**
- If circular dependencies detected → report to user, request manual resolution
- If blast radius exceeds threshold (e.g., 50+ files) → request user confirmation
```

---

## Sub-Agent Design

### Design Principles

1. **Single Responsibility:** Each sub-agent has ONE focused purpose
2. **Composition Over Complexity:** Multiple simple agents > one complex agent
3. **Reusability:** Design for use across multiple parent agents
4. **Clear Contracts:** Well-defined inputs/outputs in structured formats

### Sub-Agent Specification Template

For each sub-agent, provide:

```markdown
### Sub-Agent: {agent-name}

**Type:** Analysis | Implementation | Validation | Generation

**Purpose:** {1-2 sentence clear description}

**Tools:**
- Inherit all | Explicit list (Read, Write, Edit, Grep, Glob, Bash)
- **Rationale:** {Why these tools?}

**Model:**
- Sonnet 4.5 (complex reasoning/generation) | Haiku 4.5 (fast/simple tasks)
- **Rationale:** {Why this model?}

**Auto-Commit:** true | false
- **Rationale:** {Why enable/disable?}

**Input Schema:**
```json
{
  "field1": "description",
  "field2": {
    "nested": "structure"
  }
}
```

**Output Schema:**
```json
{
  "result": "structured data",
  "metadata": {
    "execution_time": "ms",
    "status": "success|failure"
  }
}
```

**Responsibilities:**
1. {Specific task 1}
2. {Specific task 2}
3. {Never responsibilities - what this agent must NOT do}

**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

**Error Scenarios:**
- **Scenario:** {What went wrong} → **Action:** {How to handle}
- **Scenario:** {Another error} → **Action:** {Recovery strategy}

**Example Invocation:**
```
Main agent delegates via Task tool:
prompt: "Analyze the refactoring impact for renaming `calculateTotal` to
`computeSum` in src/billing/ directory. Return structured JSON with all
references, dependency graph, and risk assessment."

sub_agent_type: refactoring-analyzer
```

**Dependencies:**
- May invoke: {Other sub-agents this one can delegate to}
- Invoked by: {Parent agents that use this sub-agent}
```

### Sub-Agent Classification

#### Analysis Agents
- **Purpose:** Understand code, find patterns, create reports
- **Tools:** Read, Grep, Glob, Bash (no write operations)
- **Model:** Sonnet 4.5 (complex reasoning)
- **Auto-Commit:** false
- **Examples:** `code-analyzer`, `dependency-mapper`, `test-coverage-reporter`

#### Implementation Agents
- **Purpose:** Make code changes, create files, refactor
- **Tools:** Inherit all (Read, Write, Edit, etc.)
- **Model:** Sonnet 4.5 (code generation quality)
- **Auto-Commit:** true (unless part of git workflow)
- **Examples:** `refactoring-executor`, `feature-implementer`, `test-generator`

#### Validation Agents
- **Purpose:** Verify correctness, run tests, check compliance
- **Tools:** Read, Bash (execute tests/linters)
- **Model:** Haiku 4.5 (fast execution) OR Sonnet (complex validation logic)
- **Auto-Commit:** false
- **Examples:** `test-runner`, `type-checker`, `lint-validator`

#### Generation Agents
- **Purpose:** Create multiple related artifacts
- **Tools:** Inherit all
- **Model:** Sonnet 4.5
- **Auto-Commit:** true
- **Examples:** `component-generator`, `api-scaffold`, `documentation-generator`

---

## Tool Abstraction Guidelines

**Core Principle:** Encapsulate complex, repeated operations into `pnpm tools <name>` commands instead of raw bash scripts.

### When to Create Tools

| Scenario | Create Tool? | Rationale |
|----------|--------------|-----------|
| Complex command with 5+ arguments | ✅ Yes | Encapsulates complexity |
| Operation repeated in 3+ agents/commands | ✅ Yes | DRY principle, consistency |
| Multi-step process with error handling | ✅ Yes | Encapsulates logic, handles errors |
| Requires specific environment setup | ✅ Yes | Setup handled internally |
| Simple one-liner command | ❌ No | Overhead not justified |
| One-time operation | ❌ No | Tool creation overhead too high |

### Tool Design Principles

**Single Responsibility:**
```bash
# ✅ Good: Focused tools
pnpm tools dev:categorize-errors /tmp/dev.log
pnpm tools dev:health-check
pnpm tools dev:start-monitored

# ❌ Bad: Swiss-army-knife tool
pnpm tools dev:everything --categorize --health --start
```

**Clear Interface:**
```bash
# ✅ Good: Explicit parameters
pnpm tools session info --format json
pnpm tools logs tail --lines 100 --follow

# ❌ Bad: Ambiguous flags
pnpm tools session -f json -i
pnpm tools logs -l 100 -f
```

**Consistent Error Handling:**
```typescript
// ✅ Good: Clear error messages
try {
  const session = await loadSession();
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error('No active session found. Start Claude Code first.');
  }
  throw error;
}

// ❌ Bad: Generic errors
try {
  const session = await loadSession();
} catch (error) {
  throw new Error('Error loading session');
}
```

### Tool Implementation Template

**File Structure:**
```
tools/
├── src/
│   ├── commands/
│   │   ├── dev/
│   │   │   ├── categorize-errors.ts    # Logic
│   │   │   ├── health-check.ts
│   │   │   └── index.ts                # Command exports
│   │   └── session/
│   │       ├── info.ts
│   │       └── conversation.ts
│   └── cli/
│       └── main.ts                      # CLI entry point
```

**Command Template:**
```typescript
// tools/src/commands/dev/categorize-errors.ts
import { readFileSync } from 'fs';

export interface CategorizeOptions {
  format?: 'json' | 'text';
}

export async function categorizeErrors(
  logFile: string,
  options: CategorizeOptions = {}
) {
  // Validate inputs
  if (!existsSync(logFile)) {
    throw new Error(`Log file not found: ${logFile}`);
  }

  // Execute logic
  const content = readFileSync(logFile, 'utf-8');
  const results = parseAndCategorize(content);

  // Format output
  return options.format === 'json'
    ? JSON.stringify(results, null, 2)
    : formatAsText(results);
}
```

### Benefits of Tool Abstraction

**Consistency:**
- All agents use same tool → same behavior
- Single source of truth for complex operations

**Maintainability:**
- Update logic in one place → all agents benefit
- Easier to test (unit tests for tools)

**Clarity:**
- Agent instructions become simpler
- Focus on logic, not parsing/formatting

**Example - Error Categorization:**

```markdown
# ❌ Before: 40 lines of bash in every agent
Bash: cat /tmp/dev.log | grep -E "error|exception" | while read line; do
  if [[ $line =~ TS[0-9]+ ]]; then
    # TypeScript error
    # ... 15 more lines of parsing ...
  elif [[ $line =~ "Cannot find module" ]]; then
    # Dependency error
    # ... 10 more lines of parsing ...
  fi
done

# ✅ After: One line tool call
Bash: pnpm tools dev:categorize-errors /tmp/dev.log --format json

# Returns structured data:
{
  "typescript": { "count": 15, "files": [...], "errors": [...] },
  "dependency": { "count": 3, "files": [...], "errors": [...] },
  "summary": { "total": 18, "critical": 5, "risk_level": "medium" }
}
```

### Migration Strategy

**Identify candidates:**
1. Grep for bash commands used in 3+ agents/commands
2. Look for complex parsing logic (regex, awk, sed)
3. Find operations with multiple steps

**Extract to tool:**
1. Create tool in `tools/src/commands/[domain]/[operation].ts`
2. Implement with proper error handling and validation
3. Add unit tests
4. Update agents to use tool instead of raw bash

**Update agent instructions:**
```markdown
# Before:
5. **Parse errors from log:**
   ```bash
   cat /tmp/dev.log | grep -E ... | awk ... | sed ...
   # 20+ lines of complex bash
   ```

# After:
5. **Parse errors from log:**
   ```bash
   pnpm tools dev:categorize-errors /tmp/dev.log --format json
   ```
   Returns structured JSON with error categories, counts, and details.
```

---

## Workflow & Orchestration

### Workflow Definition

Define the complete end-to-end flow:

```markdown
## Workflow

### Overview Diagram

```
User Input
    ↓
[Phase 1: Analysis]
    ├→ sub-agent-1 (analyzer)
    └→ sub-agent-2 (dependency-mapper)
    ↓
User Approval Gate
    ↓
[Phase 2: Implementation]
    ├→ sub-agent-3 (implementer-1) ──┐
    ├→ sub-agent-4 (implementer-2) ──┼→ Parallel Execution
    └→ sub-agent-5 (implementer-3) ──┘
    ↓
[Phase 3: Validation]
    └→ sub-agent-6 (test-runner)
    ↓
    ├─ Success → Phase 4
    └─ Failure → Rollback + Report
    ↓
[Phase 4: Finalization]
    └→ sub-agent-7 (doc-updater)
    ↓
Complete
```

### Execution Flow

1. **Sequential Phases:** Phases execute in order (1 → 2 → 3 → 4)
2. **Parallel Sub-Agents:** Within a phase, independent sub-agents run concurrently
3. **Validation Gates:** Each phase validates before proceeding
4. **User Gates:** User approval required at key decision points
```

### Orchestration Patterns

#### Pattern 1: Sequential Pipeline

```markdown
**When to Use:** Each phase depends on previous phase outputs

**Example:** Code Migration
1. Analyze old code structure
2. Generate new code (depends on #1 analysis)
3. Run tests (depends on #2 implementation)
4. Update docs (depends on #3 validation passing)

**Implementation:**
- Main agent invokes sub-agent-1 via Task tool
- Waits for completion
- Processes results
- Invokes sub-agent-2 with results from sub-agent-1
- Continues chain...
```

#### Pattern 2: Parallel Fanout

```markdown
**When to Use:** Multiple independent tasks can run simultaneously

**Example:** Multi-File Refactoring
After planning phase identifies 5 file groups to refactor:
- Invoke refactoring-executor 5 times in parallel (single response, multiple Task calls)
- Each gets separate file group
- All execute concurrently
- Main agent collects results when all complete

**Performance:** Total time ≈ slowest sub-agent, not sum of all

**Implementation:**
```python
# Single response with multiple Task invocations
for group in change_groups:
    Task(
        prompt=f"Refactor files in {group.id} according to plan...",
        sub_agent_type="refactoring-executor"
    )
```
```

#### Pattern 3: Map-Reduce

```markdown
**When to Use:** Process many items, then aggregate results

**Example:** Codebase-Wide Analysis
1. **Map Phase:** Invoke analyzer for each module (parallel)
2. **Reduce Phase:** Aggregate all results into single report

**Implementation:**
- Phase 1: Parallel fanout (N sub-agents)
- Phase 2: Single aggregator sub-agent processes all results
```

#### Pattern 4: Conditional Branching

```markdown
**When to Use:** Different paths based on validation results

**Example:** Refactoring with Validation
1. Implement changes
2. Run tests
   - ✅ Pass → Update docs → Complete
   - ❌ Fail → Rollback → Report error → End

**Implementation:**
- Main agent checks validation results
- Invokes different sub-agents based on status
- May skip phases or jump to error handling
```

### Parallel Execution Guidelines

**When to Execute in Parallel:**
- Sub-agents operate on different files (no conflicts)
- No data dependencies between tasks
- Order of execution doesn't matter
- Want to minimize total execution time

**When NOT to Parallelize:**
- Tasks have dependencies (A must complete before B)
- Risk of file conflicts (multiple agents editing same file)
- Validation must happen before proceeding
- User approval needed between stages

**Parallel Invocation Syntax:**
```markdown
**Critical:** All parallel Task invocations must be in a SINGLE response:

✅ Correct:
```
Main agent sends ONE message with:
- Task call for sub-agent-1
- Task call for sub-agent-2
- Task call for sub-agent-3
```

❌ Incorrect:
```
Main agent sends message with Task call for sub-agent-1
Main agent waits for result
Main agent sends message with Task call for sub-agent-2
Main agent waits for result
...
```
This is sequential, not parallel!
```
```

---

## Strategy Documentation Pattern

**Core Principle:** Document strategies with consistent "When/What/Why/Priority" structure for clarity and quick decision-making.

### Strategy Template

```markdown
### Strategy [Letter/Name]: [Strategy Name]

**When:** [Clear trigger conditions - when to use this strategy]

**What it does:** [Concrete description of actions taken]

**Why use this:** [Justification and benefits over alternatives]

**Priority:** [1-5 or High/Medium/Low based on impact/urgency]

**Steps:**
1. [Numbered, actionable process]
2. [Each step concrete and measurable]
3. [Include validation checkpoints]

**Validation:**
- [ ] [Measurable success criterion 1]
- [ ] [Measurable success criterion 2]

**Example:**
[Brief example showing strategy in action]
```

### Example - Port Conflict Strategy

```markdown
### Strategy A: Port Conflict Resolution

**When:** Port conflict errors detected (EADDRINUSE, "address already in use")

**What it does:** Identifies process using required ports (3000/3001) and resolves conflicts

**Why use this:** Ports must be free before dev servers can start. This is a blocking issue that prevents all other fixes.

**Priority:** 1 (CRITICAL - must fix before proceeding)

**Steps:**
1. Identify conflicting process: `lsof -i :3000 -i :3001 | grep LISTEN`
2. Choose resolution approach:
   - **Option A:** Kill process (if safe): `kill -9 [PID]`
   - **Option B:** Change port in `.env` files: Edit `apps/web/.env` and `apps/api/.env`
3. Verify ports are now free: `lsof -i :3000 -i :3001` returns no results

**Validation:**
- [ ] Port 3000 is free
- [ ] Port 3001 is free
- [ ] No conflicting processes remain

**Example:**
```
$ lsof -i :3000
node    12345 user   24u  IPv4  TCP *:3000 (LISTEN)

Decision: Process 12345 is old dev server, safe to kill
Action: kill -9 12345
Verify: lsof -i :3000 (no output)
Result: Port now available ✓
```
```

### Strategy Comparison Table

For quick scanning, provide comparison table:

| Strategy | When | Priority | Typical Time | Risk |
|----------|------|----------|--------------|------|
| A: Port Conflict | EADDRINUSE error | 1 (Critical) | 30 seconds | Low |
| B: Dependencies | Module not found | 2 (High) | 2-5 minutes | Low |
| C: Prisma Issues | Client/schema error | 3 (High) | 1-2 minutes | Low |
| D: Environment | Missing env vars | 4 (Medium) | 1 minute | Low |
| E: TypeScript (delegate) | >10 TS errors | 5 (Medium) | 2-3 minutes | Low |
| F: Build Errors | Compilation failed | 6 (Medium) | 3-5 minutes | Medium |
| G: Configuration | Config/path issues | 7 (Low) | 5-10 minutes | Medium |

### Benefits of Structured Strategy Documentation

**Consistency:** All strategies follow same pattern, easy to scan
**Clarity:** "When/What/Why" answers key questions immediately
**Priority:** Explicit priority guides execution order
**Measurability:** Validation checklist ensures completeness

---

## User Interaction Design

### Approval Gates

Define when user confirmation is required:

```markdown
## User Interaction Points

### Gate 1: Plan Review (After Phase 1)

**Trigger:** Analysis complete, before any file changes

**Present to User:**
- Summary of changes to be made
- Files affected (count + list)
- Estimated risk level
- Dependency graph visualization (if complex)

**User Options:**
- ✅ Approve → Proceed to Phase 2
- 🔄 Modify → User edits plan, re-run analysis
- ❌ Cancel → Abort operation

**Example Output:**
```
Found 8 files to refactor:

Implementation Changes (no dependencies):
  - src/core/foo.ts (45 lines)

Consumer Updates (depends on implementation):
  - src/services/bar.ts (67 lines)
  - src/api/baz.ts (53 lines)
  - ... (5 more files)

Tests to Update:
  - tests/core/foo.test.ts
  - tests/integration/api.test.ts

Risk Level: MEDIUM
Estimated Time: 2-3 minutes

Proceed with refactoring? [Y/n]
```

### Gate 2: Validation Failure (After Phase 3)

**Trigger:** Tests fail after implementation

**Present to User:**
- Which tests failed
- Error messages
- Affected files
- Rollback option

**User Options:**
- 🔄 Retry → Re-run validation (if transient failure)
- ↩️ Rollback → Undo all changes, restore original state
- 🔧 Debug → Show detailed logs, let user investigate
```

### Progress Reporting

```markdown
## Progress Updates

**Frequency:** After each phase completion

**Format:**
```
✓ Phase 1: Analysis Complete
  - 8 files analyzed
  - 3 change groups created
  - Dependency graph validated

⟳ Phase 2: Implementation (2/5 sub-agents complete)
  - group-1: ✓ Complete
  - group-2: ✓ Complete
  - group-3: ⟳ In progress...
  - group-4: ⏳ Pending
  - group-5: ⏳ Pending
```

**Real-Time Updates:** Use TodoWrite tool to show progress
```

---

## Quality Gates & Validation

### Validation Strategy

Define validation at multiple levels:

```markdown
## Quality Assurance

### Level 1: Input Validation (Phase 0)

**Validates:** User request is actionable

**Checks:**
- Required parameters present
- File paths exist
- Scope is reasonable (not too broad)
- No conflicting flags

**Failure Action:** Report error to user, request correction

---

### Level 2: Phase Output Validation

**Validates:** Each phase produces correct outputs

**Phase 1 Validation (Analysis):**
- ✓ Dependency graph is acyclic
- ✓ All affected files found (confidence check)
- ✓ Change groups are non-empty
- ✓ Risk level calculated

**Phase 2 Validation (Implementation):**
- ✓ All specified files modified
- ✓ No syntax errors introduced
- ✓ File count matches plan

**Phase 3 Validation (Testing):**
- ✓ All tests pass
- ✓ No new type errors
- ✓ Linting passes
- ✓ Build succeeds

**Failure Action:** Halt pipeline, rollback if needed, report to user

---

### Level 3: Final Output Validation

**Validates:** Complete workflow produces desired outcome

**Checks:**
- ✓ User's original request fulfilled
- ✓ No side effects (unexpected changes)
- ✓ Documentation updated
- ✓ All validation gates passed

**Success Criteria:**
1. Original functionality preserved (tests pass)
2. Requested changes applied correctly
3. No breaking changes introduced
4. Related artifacts updated (docs, types, tests)

**Failure Action:** Should never reach this point if previous validations work
```

### Rollback Strategy

```markdown
## Rollback Strategy

### When to Rollback

- Validation fails at any phase
- User cancels mid-execution (if safe to rollback)
- Unrecoverable error occurs

### Rollback Mechanisms

**For File Changes:**
- Git-based: `git stash` before changes, `git stash pop` to rollback
- Snapshot-based: Copy files before modification, restore from snapshot
- Atomic commits: Each phase is a separate commit, `git reset` to rollback

**For Multi-Phase Workflows:**
- Track which phases completed successfully
- Rollback in reverse order (Phase 3 → Phase 2 → Phase 1)
- Clean up intermediate artifacts

**Example:**
```bash
# Before Phase 2 (Implementation)
git add -A
git stash push -m "Pre-refactoring snapshot"

# If Phase 3 (Validation) fails:
git stash pop  # Restore original state
```

### Partial Success Handling

**Scenario:** 3/5 parallel sub-agents succeed, 2 fail

**Options:**
1. **All-or-Nothing:** Rollback everything, report failure
2. **Partial Commit:** Commit successful changes, report failed groups to user
3. **Retry Failed:** Re-run only failed sub-agents (if idempotent)

**Recommendation:** Document the chosen strategy in PRD
```

---

## Agent Optimization Principles

**Goal:** Create agents that are clear, maintainable, and token-efficient (in that order).

### Optimization Priority Framework

| Priority | Focus Area | Metrics | Example Actions |
|----------|-----------|---------|-----------------|
| **1. Clarity** | Can agent execute task correctly? | Zero ambiguity, clear decision points | Add "When/What/Why" to strategies |
| **2. Maintainability** | Can agent be updated easily? | DRY violations, duplication count | Extract tools, standardize patterns |
| **3. Token Efficiency** | Are instructions optimal length? | Token count, information density | Use tables > prose, reference > duplicate |

**Key Insight:** Optimizing for token count at the expense of clarity is counterproductive. Clarity reduces rework, which saves more tokens overall.

### Refactoring Patterns for Existing Agents

#### Pattern 1: Standardize Strategy Documentation

**Before:**
```markdown
### Strategy A: Port Conflicts
When: EADDRINUSE errors
Steps: Find and kill process
```

**After:**
```markdown
### Strategy A: Port Conflict Resolution
**When:** Port conflict errors detected (EADDRINUSE, "address already in use")
**What it does:** Identifies process using ports 3000/3001 and resolves conflicts
**Why use this:** Blocking issue - must fix before other strategies can work
**Priority:** 1 (CRITICAL)
**Steps:** [Detailed numbered steps]
**Validation:** [Checklist]
```

**Impact:** +15% clarity, +5% tokens, +30% maintainability

#### Pattern 2: Consolidate Examples

**Before:** 5 shallow examples (20-30 lines each, output-focused)
**After:** 3 deep examples (80-120 lines each, decision-focused)

**Benefits:**
- Examples teach decision-making patterns
- Show trade-offs and alternatives
- Demonstrate when to escalate or delegate
- Include time/quality metrics

**Impact:** +50% pedagogical value, +20% tokens (acceptable trade-off)

#### Pattern 3: Extract Repeated Operations to Tools

**Before:** 40 lines of bash parsing in 3 agents
**After:** `pnpm tools dev:categorize-errors` used by all 3

**Impact:** -120 lines total, +80% maintainability, +100% testability

### Measurement Approach

**Clarity Assessment:**
- Can new developer understand agent's purpose? (yes/no)
- Are decision points explicit? (count ambiguous sections)
- Do examples teach or just show output? (teachable moments count)

**Maintainability Metrics:**
- Duplication count (grep for repeated patterns)
- Tool abstraction opportunities (bash commands used 3+ times)
- Consistency violations (strategies with different structures)

**Token Efficiency:**
- Total token count (baseline)
- Information density (tables vs prose ratio)
- Reference vs duplication ratio

### Incremental Optimization Roadmap

**Phase 1: High Priority (Do First)**
- Fix consistency issues (standardize all strategies)
- Deepen examples (2-3 excellent > 5 shallow)
- Create high-impact tools (used in 3+ agents)

**Phase 2: Medium Priority (Do Next)**
- Convert prose to structured formats (tables, checklists)
- Extract shared content to reference docs
- Add missing validation checklists

**Phase 3: Low Priority (Nice-to-Have)**
- Create additional tools (single-use complex operations)
- Add efficiency metrics to examples
- Polish formatting and navigation

**ROI Framework:**

| Effort | Impact on Clarity | Impact on Maintainability | Do It? |
|--------|-------------------|---------------------------|--------|
| High | High | High | ✅ Yes (Phase 1) |
| High | High | Low | ✅ Yes (if clarity critical) |
| High | Low | High | ⚠️ Maybe (Phase 2) |
| High | Low | Low | ❌ No |
| Low | High | High | ✅ Yes (quick wins) |
| Low | Any | Any | ✅ Yes (low cost) |

---

## Implementation Mapping

### Slash Command Implementation

```markdown
## Slash Command: `/refactor`

**Location:** `.claude/commands/refactoring/refactor.md`

**User Invocation:**
```bash
/refactor rename function calculateTotal to computeSum in src/billing/
```

**Command Responsibilities:**
1. Parse user input (extract refactoring type, target, scope)
2. Validate inputs
3. Orchestrate sub-agents (via Task tool)
4. Manage user approval gates
5. Present results

**Command Does NOT:**
- Directly analyze code (delegates to `refactoring-analyzer`)
- Directly modify files (delegates to `refactoring-executor`)
- Directly run tests (delegates to `test-runner`)

**Orchestration Flow:**
```markdown
/refactor invoked
  ↓
Command validates input
  ↓
Task(sub_agent_type="refactoring-analyzer", prompt=...)
  ↓ ← Receives analysis JSON
  ↓
Command presents plan to user
  ↓
User approves
  ↓
Task(sub_agent_type="refactoring-executor", ...) × N (parallel)
  ↓ ← All executors complete
  ↓
Task(sub_agent_type="test-runner", prompt=...)
  ↓ ← Receives test results
  ↓
If tests pass:
  Task(sub_agent_type="doc-updater", prompt=...)
  ↓
  Present success summary
Else:
  Rollback + error report
```
```

### Sub-Agent Implementation

```markdown
## Sub-Agent Files

### 1. refactoring-analyzer
**Location:** `.claude/agents/refactoring/refactoring-analyzer.md`

**YAML Frontmatter:**
```yaml
---
name: refactoring-analyzer
description: Analyzes codebase to identify all locations affected by a refactoring request and creates dependency-ordered execution plan
tools: Read, Grep, Glob, Bash
model: claude-sonnet-4-5
autoCommit: false
---
```

**Prompt Structure:** (730+ lines based on SUBAGENT_TEMPLATE.md)
- Agent Identity
- Core Directive: "You are a specialized code analysis agent..."
- Available Tools: Read, Grep, Glob, Bash
- Methodology: 5-phase analysis process
- Quality Standards: Completeness, accuracy, dependency validation
- Communication Protocol: Structured JSON output
- Examples: 3-5 concrete analysis scenarios
- Integration: Works with refactoring-executor, test-runner

---

### 2. refactoring-executor
**Location:** `.claude/agents/refactoring/refactoring-executor.md`

**YAML Frontmatter:**
```yaml
---
name: refactoring-executor
description: Executes specific file refactorings based on analysis plan, ensuring syntax correctness and preserving functionality
model: claude-sonnet-4-5
autoCommit: true
---
```

**Prompt Structure:**
- Agent Identity: "You are a specialized code refactoring implementation agent..."
- Core Directive: Execute refactoring, preserve behavior
- Available Tools: All (inherits - Read, Write, Edit, Bash, etc.)
- Methodology: Read → Modify → Validate syntax → Report
- Quality Standards: No syntax errors, exact changes only
- Examples: Function renames, type updates, import fixes
```

---

## Documentation Requirements

### Required Documentation

For each agent PRD, provide:

1. **User-Facing Documentation**
   - Location: `docs/agents/{agent-name}.md`
   - Content: How to use the slash command, examples, FAQs
   - Audience: End users (developers using the agent)

2. **Implementation Documentation**
   - Location: This PRD + code comments in `.claude/`
   - Content: Architecture, sub-agent specs, workflows
   - Audience: Agent developers, maintainers

3. **Examples & Tutorials**
   - Location: `docs/examples/agents/{agent-name}/`
   - Content: Real-world usage scenarios with before/after
   - Audience: New users learning the agent

### Example Quality Guidelines

**Core Principle:** Examples should teach decision-making, not just show output.

#### Example Depth Standard

**Minimum Standard:** 80-120 lines per pedagogical example

**Required Elements:**
1. **Context:** What situation triggered this example?
2. **Decision Points:** Why was option A chosen over B?
3. **Process:** Step-by-step with reasoning at each step
4. **Outcome:** What happened? Was it successful?
5. **Lessons:** What can readers learn? When to use different approach?

#### Example Structure Pattern

```markdown
### Example [N]: [Scenario Type] - [Key Learning]

**Context:**
[Describe starting situation, what triggered agent invocation]

**Phase 1: [Phase Name]**
```
[Show actual output or relevant snapshot]
```

**Decision Process:**
[Explain reasoning - why these choices were made]
- **Option A:** [Description] → [Why chosen/rejected]
- **Option B:** [Description] → [Why chosen/rejected]
- **Selected:** [Option] because [rationale]

**Phase 2: [Next Phase]**
[Continue with decisions and outcomes]

**Summary & Lessons:**
**Total Time:** [Duration]
**Fixes Applied:** [List with context]
**Key Decisions:** [What mattered and why]
**Alternative Approaches:** [What else could have been done]
**When to Use Different Approach:** [Guidance for similar scenarios]

**Time Comparison:**
- Manual approach: [Estimate] (reasoning: [why])
- Agent approach: [Actual] (savings: [X%])
```

#### Example Diversity Guidelines

| Example Type | Percentage | Purpose | Depth |
|--------------|------------|---------|-------|
| **Common Case** | 60% (2-3 examples) | Teach standard workflow | 80-100 lines |
| **Complex Case** | 30% (1-2 examples) | Teach decision-making | 100-120 lines |
| **Edge Case** | 10% (1 example) | Teach exception handling | 60-80 lines |

#### Anti-Pattern: Minimal Examples

**❌ Bad Example (Output-Only, No Learning):**
```markdown
### Example 1: TypeScript Errors

**Input:** `/dev:debug`

**Output:**
```
✓ Phase 1: Assessment Complete
✓ Phase 2: Fixed 15 TypeScript errors
✓ Phase 3: Verification Passed
```

**Problems:**
- No context (why did errors occur?)
- No decision-making (how were they fixed?)
- No lessons (what should reader learn?)
- Too brief (15 lines, minimal pedagogical value)
```

**✅ Good Example (Decision-Focused, Teaching):**
```markdown
### Example 1: Common Scenario - Multiple Error Types

**Context:**
After pulling latest from develop, dev server fails. User doesn't know error types or count.

**Phase 1: Assessment & Decision-Making**
```
Server Status: RUNNING but compilation failed
Errors: 15 TypeScript + 1 Prisma + 2 Environment
Total: 18 issues
```

**Decision Process:**
Agent analyzes priorities:
- **Prisma must come first** - If client not generated, other fixes pointless
- **Environment second** - DATABASE_URL needed for Prisma
- **TypeScript last** - 15 errors > 10 threshold → delegate to lint-debugger

**Strategy Selection:** C (Prisma) → D (Environment) → E (TypeScript delegation)
**Rationale:** Follow dependency chain, use delegation threshold

**Phase 2: Systematic Fixes**
[Show each fix with decisions and validation]

**Phase 3: Verification**
[Show validation steps and success]

**Summary & Lessons:**
**Total Time:** 3m 45s (vs 15-20m manual)
**Key Decisions:**
1. Priority order prevented wasted effort (Prisma first)
2. Delegation threshold worked (15 > 10 justified delegation)
3. Systematic approach caught all issues

**Alternative Approaches:**
- ❌ Fix TypeScript first → Would still fail (Prisma missing)
- ❌ Fix manually → 4x slower, higher error risk
- ✅ Systematic + delegation → Fast, comprehensive

**When to Use Different:**
- <10 TS errors: Fix manually instead of delegating
- Prisma schema invalid: Need manual schema fixes first
```

**Benefits:**
- **Teaching-focused:** Shows not just what happened, but why
- **Decision transparency:** Explains reasoning at each step
- **Complete workflow:** From problem to solution with context
- **Actionable lessons:** Readers learn patterns they can apply
- **Trade-off analysis:** Shows alternatives and why they were rejected

### Example Documentation Structure

```markdown
docs/
├── agents/
│   ├── refactoring-orchestrator.md          # User guide
│   └── testing-workflow.md
├── examples/
│   └── agents/
│       └── refactoring/
│           ├── 01-simple-function-rename.md
│           ├── 02-multi-file-type-update.md
│           └── 03-api-contract-change.md
```

---

## Real-World Case Studies

### Case Study 1: `/git:commit` Command - Excellent Delegation Pattern

**What Made It Successful:**

**1. Clear Responsibility Separation**
- Command: Orchestrates workflow, manages user interaction
- `commit-grouper`: Analyzes and groups changes (974 lines)
- `commit-message-generator`: Creates messages (invoked in parallel)

**2. Parallel Execution Efficiency**
```markdown
# Lines 139-170 demonstrate optimal parallelization
Phase 3: Message generation for 3 groups
  Task(sub_agent="commit-message-generator", group=group-1)
  Task(sub_agent="commit-message-generator", group=group-2)
  Task(sub_agent="commit-message-generator", group=group-3)
  # All three in SINGLE response

Time savings: 3 × 30s sequential = 90s → 35s parallel = 61% faster
```

**3. Structured Outputs Enable Composition**
- `commit-grouper` returns JSON with exact schema
- Command validates JSON structure
- `commit-message-generator` receives validated group objects
- No ambiguity, no rework

**Metrics:**
- Token efficiency: 8x cleaner context (analysis isolated in subagent)
- Time savings: 60%+ through parallelization
- Reliability: JSON contracts prevent integration errors

**Key Patterns to Replicate:**
✅ Orchestrator doesn't analyze - delegates to specialist
✅ Parallel invocation in single response (not sequential)
✅ Structured JSON contracts between agents
✅ Validation gates between phases

**File Location:** `.claude/commands/git/commit.md` (617 lines)

---

### Case Study 2: `/dev:debug` Phase 0 - Context Isolation Best Practice

**What Made It Successful:**

**1. Advanced Delegation When Stuck (Lines 93-476)**
```markdown
Trigger: >15 min without progress, tried 2-3 solutions

Strategy: Delegate to specialists in PARALLEL
  - stack-trace-analyzer: Parse 10,000-line traces → 50-line summary
  - common-error-researcher: Search 100s of results → top 5 solutions
  - monorepo-specialist: Analyze configs → targeted fixes

Main thread receives: 400 lines actionable intel
Instead of: 50,000 lines raw diagnostic data

Context efficiency: 8x cleaner (91% noise → 24% noise)
```

**2. Decision Tree for Strategy Selection (Lines 1028-1035)**
```markdown
Quick Decision Tree:
1. Error unclear? → L (stack-trace-analyzer)
2. Config question? → I-B (best-practices-researcher)
3. Known error? → I (common-error-researcher)
4. Monorepo issue? → J (monorepo-specialist)
5. Build problem? → K (build-system-debugger)
6. Still stuck? → H (root-cause-analyst)

Prevents: Circular debugging, wasted time
Enables: Fast, correct specialist selection
```

**3. Context Isolation Through File System (Lines 516-528)**
```bash
# Write verbose output to file
pnpm dev 2>&1 | tee /tmp/dev-output.log &

# Main thread reads ONLY tail (last 100 lines)
tail -n 100 /tmp/dev-output.log

# Subagents read full file when needed
Task(stack-trace-analyzer, log=/tmp/dev-output.log)
```

**Metrics:**
- Context pollution: 91% → 24% (8x improvement)
- Time to solution: 45+ min manual → 5 min with specialists (9x faster)
- Success rate: Systematic approach prevents missed issues

**Key Patterns to Replicate:**
✅ Delegate verbose operations to subagents (context isolation)
✅ Write raw output to disk, load summaries only
✅ Provide decision tree for specialist selection
✅ Document efficiency metrics to justify delegation

**File Location:** `.claude/commands/dev/debug.md` (1,796 lines)

---

### Case Study 3: `commit-grouper` Subagent - Single Responsibility Example

**What Made It Successful:**

**1. Laser-Focused Responsibility**
```markdown
Must Do:
- Analyze git changes (status, diffs)
- Categorize by system and nature
- Group logically with dependencies
- Return structured JSON

Must NOT Do:
- Generate commit messages (commit-message-generator's job)
- Execute git commands (orchestrator's job)
- Write documentation
- Make commits
```

**2. Self-Contained Instructions (974 Lines)**
- Complete problem definition
- Tool usage guidance (when to use Read vs Grep vs Bash)
- Decision criteria (4 strategies with "when to use")
- Quality standards (9 validation checkboxes)
- 3 comprehensive examples (40-100 lines each)

**3. Explicit Output Contract (Lines 428-447)**
```json
{
  "strategy_used": "dependency-flow",
  "commit_groups": [
    {
      "id": "group-1",
      "type": "feat",
      "scope": "api",
      "files": ["apps/api/src/auth/controller.ts"],
      "reasoning": "Why grouped this way"
    }
  ],
  "metadata": {
    "total_files": 8,
    "total_groups": 3
  }
}
```

**Metrics:**
- Reusability: Used by `/git:commit`, potential for other git workflows
- Reliability: Structured output prevents integration failures
- Maintainability: Single responsibility = easy to update/test

**Key Patterns to Replicate:**
✅ One job, one output format, clear boundaries
✅ Self-contained instructions (no external context assumptions)
✅ Explicit JSON schema for outputs
✅ 3-5 diverse examples showing decision-making

**File Location:** `.claude/agents/git/commit-grouper.md` (974 lines)

---

## Testing & Validation

### PRD Validation Checklist

Before considering a PRD complete, verify:

- [ ] All required sections present (metadata, summary, problem, goals, etc.)
- [ ] Task decomposition into 3-7 clear phases
- [ ] Each phase has defined inputs, outputs, success criteria
- [ ] 3-10 sub-agents specified with complete details
- [ ] Sub-agent tool restrictions justified
- [ ] Sub-agent model selections justified
- [ ] Workflow diagram shows complete flow
- [ ] Parallel execution opportunities identified
- [ ] User approval gates defined
- [ ] Validation strategy defined for each phase
- [ ] Rollback strategy documented
- [ ] Implementation mapping to slash command + sub-agents
- [ ] Error handling for all failure scenarios
- [ ] Examples provided for complex workflows

### Agent Implementation Testing

**Phase 1: Sub-Agent Unit Tests**
- Test each sub-agent independently
- Validate input/output schemas
- Test error scenarios

**Phase 2: Integration Tests**
- Test slash command orchestration
- Validate phase transitions
- Test parallel execution

**Phase 3: End-to-End Tests**
- Real-world scenarios from docs/examples/
- Validate complete workflows
- Measure performance (execution time)

**Phase 4: User Acceptance Testing**
- Pilot with small user group
- Gather feedback on UX (approval gates, progress reporting)
- Iterate on confusing areas

---

## PRD Template

Use this template as a starting point for new agent PRDs:

```markdown
# {Agent Name} PRD

**Status:** Draft
**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Owner:** {Your Name/Team}
**Implementation:**
- Main Agent: `/{slash-command}`
- Sub-Agents: `sub-agent-1`, `sub-agent-2`, ...

---

## Executive Summary

{2-3 paragraphs: What does this agent do? What value does it provide? Key capabilities?}

---

## Problem Statement

{Describe the current pain points and why this agent is needed}

---

## Goals & Non-Goals

### Goals
1. {Specific, measurable goal}
2. {Another goal}
3. ...

### Non-Goals
1. {What is explicitly out of scope}
2. {What this agent won't do}
3. ...

---

## Task Decomposition

### Phase 1: {Phase Name}

**Purpose:** {What this phase accomplishes}

**Inputs:**
- {Required inputs}

**Process:**
1. {Step-by-step breakdown}

**Sub-Agent(s):**
- `sub-agent-name`: {Role in this phase}

**Outputs:**
```json
{
  "output_field": "description"
}
```

**Success Criteria:**
- {How to validate success}

**Failure Handling:**
- {What to do if this phase fails}

---

### Phase 2: {Next Phase}

{Repeat structure...}

---

{Continue for all phases...}

---

## Sub-Agent Design

### Sub-Agent: {agent-name}

**Type:** Analysis | Implementation | Validation | Generation

**Purpose:** {Clear description}

**Tools:** {List or "Inherit all"}
**Model:** Sonnet 4.5 | Haiku 4.5
**Auto-Commit:** true | false

**Input Schema:**
```json
{...}
```

**Output Schema:**
```json
{...}
```

**Responsibilities:**
1. {Specific responsibility}
2. ...

**Success Criteria:**
- {Measurable outcome}

**Error Scenarios:**
- **Scenario:** {Error condition} → **Action:** {How to handle}

---

{Repeat for all sub-agents...}

---

## Workflow & Orchestration

### Overview Diagram

```
{ASCII workflow diagram showing phases and sub-agents}
```

### Execution Flow

{Describe the complete end-to-end flow}

### Orchestration Pattern

{Sequential Pipeline | Parallel Fanout | Map-Reduce | Conditional Branching}

**Rationale:** {Why this pattern?}

---

## User Interaction Design

### Gate 1: {Approval Gate Name}

**Trigger:** {When does this gate activate?}

**Present to User:**
- {Information shown}

**User Options:**
- ✅ {Option 1}
- ❌ {Option 2}

---

## Quality Gates & Validation

### Level 1: Input Validation

**Checks:**
- {Validation check}

**Failure Action:** {What happens}

---

### Level 2: Phase Output Validation

**Phase N Validation:**
- ✓ {Check 1}
- ✓ {Check 2}

---

### Level 3: Final Output Validation

**Success Criteria:**
1. {Final criterion}

---

## Rollback Strategy

**When to Rollback:** {Conditions}

**Rollback Mechanism:** {How to undo changes}

---

## Implementation Mapping

### Slash Command: `/{command-name}`

**Location:** `.claude/commands/{category}/{command-name}.md`

**Command Responsibilities:**
1. {What the command does}

**Orchestration Flow:**
```
{Flow description}
```

---

### Sub-Agent Files

**{sub-agent-name}**
**Location:** `.claude/agents/{category}/{sub-agent-name}.md`

**YAML Frontmatter:**
```yaml
---
name: {agent-name}
description: {description}
tools: {tools list or omit to inherit}
model: claude-sonnet-4-5
autoCommit: true
---
```

---

## Testing & Validation

### Test Scenarios

1. **Scenario:** {Test case description}
   - **Input:** {Test input}
   - **Expected Output:** {Expected result}
   - **Validation:** {How to verify}

---

## Open Questions

- [ ] {Question requiring resolution before implementation}
- [ ] {Another open question}

---

## Future Enhancements

- {Potential future capability}
- {Another enhancement for later versions}

---

## References

- [Subagent Guidelines](../claude/agents/SUBAGENT_GUIDELINES.md)
- [Subagent Template](../claude/agents/SUBAGENT_TEMPLATE.md)
- [Model Selection Guide](../claude/MODEL_GUIDELINES.md)
- {Other relevant docs}

---

**End of PRD**
```

---

## Best Practices

### DO:
✅ Start with user needs, then design the agent
✅ Break complex tasks into 3-7 clear phases
✅ Design sub-agents with single, focused responsibilities
✅ Identify parallel execution opportunities
✅ Define clear validation at every phase
✅ Document rollback strategies
✅ Provide concrete examples
✅ Use structured data formats (JSON) for inter-agent communication
✅ Consider error scenarios explicitly
✅ Add user approval gates at key decision points
✅ Use context isolation for verbose operations
✅ Create tools for repeated bash patterns (3+ uses)
✅ Write 80-120 line examples with decision-making
✅ Document strategies with When/What/Why/Priority

### DON'T:
❌ Create monolithic agents that do everything
❌ Have main agent perform file changes directly
❌ Skip validation between phases
❌ Ignore error handling
❌ Forget to specify input/output schemas
❌ Over-parallelize (causes race conditions)
❌ Under-parallelize (misses performance gains)
❌ Design sub-agents that depend on main agent context
❌ Skip documentation
❌ Forget to test the full workflow
❌ Put verbose output in main thread (use subagents)
❌ Write minimal examples that skip reasoning
❌ Duplicate bash logic across strategies (create tool)

---

## Examples

### Example 1: Simple Agent (2-3 Sub-Agents)

See: `ai/agents/examples/simple-test-runner.prd.md`
- 3 phases: Analysis → Execution → Reporting
- 3 sub-agents: test-finder, test-executor, report-generator
- Sequential pipeline pattern

### Example 2: Complex Agent (5-7 Sub-Agents)

See: `ai/agents/examples/complex-refactoring-orchestrator.prd.md`
- 5 phases: Analysis → Planning → Implementation → Validation → Finalization
- 7 sub-agents: analyzer, dependency-mapper, plan-generator, executor (×3 parallel), validator, doc-updater
- Map-reduce pattern with parallel fanout

### Example 3: Real-World Implementation

See: `.claude/commands/git/commit.md` + `commit-grouper.md` + `commit-message-generator.md`
- Implemented agent system for intelligent git commits
- Demonstrates: parallel execution, structured outputs, user approval gates

---

## Appendix

### A. Schema Formats

**JSON Schema for Sub-Agent Outputs:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success", "failure", "partial"]
    },
    "data": {
      "type": "object",
      "description": "Agent-specific output data"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "execution_time_ms": {"type": "number"},
        "agent_version": {"type": "string"}
      }
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": {"type": "string"},
          "message": {"type": "string"},
          "context": {"type": "object"}
        }
      }
    }
  }
}
```

### B. Workflow Patterns Catalog

1. **Sequential Pipeline:** A → B → C → D
2. **Parallel Fanout:** A → (B1, B2, B3) → C
3. **Map-Reduce:** A → (B1, B2, ..., Bn) → C (aggregator)
4. **Conditional Branch:** A → B → {C1 if success, C2 if failure}
5. **Retry Loop:** A → B → {C if success, retry B if transient failure, fail if permanent}
6. **Checkpoint/Resume:** A → B → checkpoint → C → D (resume from checkpoint on failure)

### C. Common Anti-Patterns

**Anti-Pattern 1: God Agent**
- **Problem:** Single agent tries to do everything
- **Solution:** Decompose into specialized sub-agents

**Anti-Pattern 2: Context Leakage**
- **Problem:** Sub-agent assumes it has main conversation context
- **Solution:** Pass all required context in the prompt

**Anti-Pattern 3: Missing Validation**
- **Problem:** Phase N fails but Phase N+1 executes anyway
- **Solution:** Validate outputs before proceeding to next phase

**Anti-Pattern 4: Serial Execution When Parallel Is Possible**
- **Problem:** 5 independent tasks run sequentially (5x slower)
- **Solution:** Identify independence and parallelize

**Anti-Pattern 5: No Rollback**
- **Problem:** Partial failure leaves codebase in broken state
- **Solution:** Design rollback strategy from the start

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-10-22 | Documentation Writer | Added context optimization, tool abstraction, example quality, strategy patterns, case studies |
| 1.0 | 2025-10-21 | Agent Platform Team | Initial comprehensive guidelines |

---

**End of Guidelines**
