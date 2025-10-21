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
| 1.0 | 2025-10-21 | Agent Platform Team | Initial comprehensive guidelines |

---

**End of Guidelines**
