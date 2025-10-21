# Refactoring Orchestrator Agent PRD

**Status:** Example
**Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Agent Platform Team
**Implementation:**
- Main Agent: `/refactor`
- Sub-Agents: `refactoring-analyzer`, `dependency-mapper`, `impact-assessor`, `plan-generator`, `refactoring-executor` (×N parallel), `test-validator`, `doc-updater`

---

## Executive Summary

The Refactoring Orchestrator agent enables developers to safely execute complex, multi-file refactorings with confidence. It analyzes the entire impact of a refactoring, creates dependency-ordered execution plans, validates correctness at each step, and automatically updates related documentation and tests.

This agent transforms risky, hours-long manual refactorings into safe, automated workflows that complete in minutes. By decomposing refactorings into validated stages with automatic rollback on failure, it reduces human error and allows developers to focus on higher-level design decisions rather than mechanical file edits.

Key capabilities include: intelligent impact analysis, parallel execution of independent changes, comprehensive validation (tests, types, linting), and automatic documentation updates.

---

## Problem Statement

**Current Pain Points:**
- Large refactorings (rename function used in 50+ files) are error-prone and tedious
- Manually tracking all references and dependencies is difficult and error-prone
- Fear of breaking changes prevents necessary refactorings
- No systematic validation that refactoring preserves behavior
- Documentation and tests fall out of sync after refactorings
- Refactorings that could run in parallel are done sequentially (wasted time)

**Why Orchestration is Needed:**
- Impact analysis requires complex code graph traversal and reasoning
- Dependency ordering prevents breaking intermediate states
- Parallel execution across file groups requires careful conflict detection
- Multi-stage validation (syntax → tests → types → linting) has complex dependencies
- Rollback strategy must coordinate across multiple file change sets

**Complexity Factors:**
- Typical refactorings affect 10-100 files
- Import graph analysis requires recursive traversal
- Change dependencies create ordering constraints
- Multiple validation types must all pass before proceeding
- Partial failures require selective rollback

---

## Goals & Non-Goals

### Goals
1. Support common refactoring patterns: rename (symbol/file), extract (function/module), move (function/file), inline
2. Analyze complete impact across entire codebase (100% recall on references)
3. Execute refactorings 20x faster than manual (minutes vs. hours)
4. Guarantee correctness via comprehensive validation (tests, types, linting all pass)
5. Automatically update documentation, examples, and tests affected by refactoring
6. Provide clear rollback on any failure (restore original state atomically)
7. Support parallel execution for independent change groups (5x performance boost)

### Non-Goals
- AI-suggested refactorings (only executes user-specified refactorings)
- Performance optimization (covered by separate `perf-optimizer` agent)
- Code style changes beyond necessary refactoring (use linters/formatters)
- Cross-repository refactorings (single repository only)
- Interactive refactoring (wizards with multiple prompts - prefer declarative upfront)

---

## Task Decomposition

### Phase 1: Comprehensive Analysis

**Purpose:** Deeply analyze the codebase to understand the complete scope and impact of the requested refactoring.

**Inputs:**
- User refactoring request: type (rename/extract/move/inline), target symbol, new name/location
- Scope constraints (directories, file patterns to include/exclude)
- User preferences (auto-update tests, docs, examples)

**Process:**
1. Identify target symbol (function, class, type, file) and validate it exists
2. Search entire codebase for all references (imports, calls, type references)
3. Build complete import dependency graph
4. Identify test files that cover affected code
5. Find documentation (README, .md files, JSDoc) that reference target
6. Estimate blast radius (files, lines, test coverage)

**Sub-Agent(s):**
- `refactoring-analyzer`: Deep code analysis specialist
  - Tools: Read, Grep, Glob, Bash
  - Model: Sonnet 4.5 (complex reasoning for symbol resolution)
  - Output: Comprehensive analysis JSON

- `dependency-mapper`: Dependency graph builder
  - Tools: Read, Grep, Glob
  - Model: Sonnet 4.5 (graph traversal reasoning)
  - Output: Dependency graph JSON (nodes + edges)

**Parallel Execution:** YES - analyzer and dependency-mapper can run simultaneously

**Outputs:**
```json
{
  "target": {
    "type": "function",
    "name": "calculateTotal",
    "file": "src/billing/calculator.ts",
    "line": 45,
    "signature": "function calculateTotal(items: Item[]): number"
  },
  "references": [
    {
      "file": "src/billing/invoice.ts",
      "line": 23,
      "type": "import",
      "context": "import { calculateTotal } from './calculator'"
    },
    {
      "file": "src/api/checkout.ts",
      "line": 67,
      "type": "call",
      "context": "const total = calculateTotal(cartItems)"
    }
    // ... 48 more references
  ],
  "dependency_graph": {
    "nodes": ["src/billing/calculator.ts", "src/billing/invoice.ts", ...],
    "edges": [
      {"from": "src/billing/invoice.ts", "to": "src/billing/calculator.ts"}
    ]
  },
  "test_coverage": {
    "files": [
      "tests/billing/calculator.test.ts",
      "tests/integration/billing.test.ts"
    ],
    "line_coverage": 0.92
  },
  "documentation_references": [
    {
      "file": "docs/billing.md",
      "line": 12,
      "context": "Use `calculateTotal()` to compute final amounts"
    }
  ],
  "blast_radius": {
    "total_files": 52,
    "total_lines": 340,
    "risk_level": "high"
  }
}
```

**Success Criteria:**
- Target symbol found and validated
- All references discovered (confidence >99% via multiple search strategies)
- Dependency graph is complete and acyclic
- Test coverage information accurate

**Failure Handling:**
- If target not found → report error, suggest alternatives (fuzzy search)
- If circular dependencies detected → report to user, request manual resolution
- If blast radius exceeds threshold (>100 files) → require explicit user confirmation

---

### Phase 2: Risk Assessment & Planning

**Purpose:** Evaluate refactoring complexity and risk, then generate a detailed, dependency-ordered execution plan.

**Inputs:**
- Analysis results from Phase 1
- User risk tolerance (aggressive/conservative)
- Validation requirements (which checks to run)

**Process:**
1. Assess refactoring risk based on blast radius, test coverage, complexity
2. Group changes by dependency relationships and file type
3. Create dependency-ordered execution plan (topological sort)
4. Identify opportunities for parallel execution (independent groups)
5. Estimate execution time and failure probability
6. Generate rollback strategy specific to this refactoring

**Sub-Agent(s):**
- `impact-assessor`: Risk analysis specialist
  - Tools: Read (to read test files, check coverage)
  - Model: Sonnet 4.5 (complex risk reasoning)
  - Output: Risk assessment JSON

- `plan-generator`: Execution plan creator
  - Tools: Read (to understand file structures)
  - Model: Sonnet 4.5 (complex planning)
  - Output: Execution plan JSON

**Parallel Execution:** YES - impact assessment and plan generation can overlap (assessor runs first, planner uses partial results)

**Outputs:**
```json
{
  "risk_assessment": {
    "overall_risk": "medium",
    "factors": [
      {
        "factor": "blast_radius",
        "value": "52 files",
        "risk": "high",
        "rationale": "Affects >50 files, potential for widespread breakage"
      },
      {
        "factor": "test_coverage",
        "value": "92%",
        "risk": "low",
        "rationale": "High test coverage increases confidence"
      },
      {
        "factor": "refactoring_type",
        "value": "rename",
        "risk": "low",
        "rationale": "Rename is mechanical, low semantic risk"
      }
    ],
    "failure_probability": 0.15,
    "recommended_approach": "conservative"
  },
  "execution_plan": {
    "strategy": "dependency-ordered-parallel",
    "groups": [
      {
        "id": "group-1",
        "phase": "implementation",
        "files": ["src/billing/calculator.ts"],
        "changes": "Rename function definition",
        "dependencies": [],
        "parallel_safe": false,
        "estimated_time_ms": 500
      },
      {
        "id": "group-2a",
        "phase": "direct-consumers",
        "files": ["src/billing/invoice.ts", "src/billing/summary.ts"],
        "changes": "Update imports and calls",
        "dependencies": ["group-1"],
        "parallel_safe": true,
        "estimated_time_ms": 1000
      },
      {
        "id": "group-2b",
        "phase": "direct-consumers",
        "files": ["src/api/checkout.ts", "src/api/cart.ts"],
        "changes": "Update imports and calls",
        "dependencies": ["group-1"],
        "parallel_safe": true,
        "estimated_time_ms": 1200
      },
      {
        "id": "group-3",
        "phase": "indirect-consumers",
        "files": ["src/services/*.ts"],
        "changes": "Update transitive dependencies",
        "dependencies": ["group-2a", "group-2b"],
        "parallel_safe": true,
        "estimated_time_ms": 2000
      }
    ],
    "total_estimated_time_ms": 4700,
    "parallel_speedup": "2.5x"
  },
  "rollback_strategy": {
    "type": "git-stash",
    "checkpoints": ["pre-refactor", "post-phase-1", "post-phase-2"],
    "recovery_steps": [
      "git stash pop to restore original state",
      "Run tests to verify restoration"
    ]
  }
}
```

**Success Criteria:**
- Risk assessment covers all major factors
- Execution plan has valid topological order (no circular dependencies)
- Parallel groups are truly independent (no file conflicts)
- Time estimates are reasonable

**Failure Handling:**
- If risk is unacceptably high → require user confirmation or suggest safer approach
- If plan cannot be parallelized → fall back to sequential execution
- If rollback strategy cannot be determined → abort, report to user

---

### Phase 3: User Approval Gate

**Purpose:** Present complete plan to user for review and approval before making any changes.

**Inputs:**
- Risk assessment from Phase 2
- Execution plan from Phase 2
- Summary statistics

**Process:**
1. Format risk assessment for user readability
2. Display execution plan with grouping and dependencies
3. Show estimated time and success probability
4. Present rollback strategy
5. Wait for user decision (approve, modify, cancel)

**Sub-Agent(s):** None (main agent handles presentation)

**Outputs:**
- User decision: `approved | modified | cancelled`
- If modified: updated scope or preferences

**Success Criteria:**
- User understands the plan and risks
- User makes informed decision

**Failure Handling:**
- If user cancels → abort gracefully
- If user requests modifications → return to Phase 1 with new parameters

---

### Phase 4: Staged Execution

**Purpose:** Execute refactoring changes in dependency-ordered groups, with validation checkpoints.

**Inputs:**
- Execution plan from Phase 2 (approved by user)
- Target symbol details
- New name/location for refactoring

**Process:**
1. Create git checkpoint (stash or commit current state)
2. For each dependency group (in topological order):
   a. Execute all changes in group (parallel if safe)
   b. Validate syntax (no parse errors)
   c. If any failure → rollback and abort
3. Track progress for user visibility
4. Collect metadata on all changes made

**Sub-Agent(s):**
- `refactoring-executor`: File modification specialist (invoked N times in parallel per group)
  - Tools: Read, Write, Edit, Grep
  - Model: Sonnet 4.5 (code generation quality)
  - Parallel Invocation: YES (one per file or per group, depending on group size)
  - Output: Execution result JSON per file

**Parallel Execution:** YES - within each group, if `parallel_safe: true`

**Outputs:**
```json
{
  "execution_results": [
    {
      "group_id": "group-1",
      "status": "success",
      "files_modified": ["src/billing/calculator.ts"],
      "changes": [
        {
          "file": "src/billing/calculator.ts",
          "line": 45,
          "old": "function calculateTotal",
          "new": "function computeSum"
        }
      ],
      "duration_ms": 450
    },
    {
      "group_id": "group-2a",
      "status": "success",
      "files_modified": ["src/billing/invoice.ts", "src/billing/summary.ts"],
      "changes": [...],
      "duration_ms": 920
    }
    // ... more groups
  ],
  "total_files_modified": 52,
  "total_changes": 340,
  "total_duration_ms": 4200
}
```

**Success Criteria:**
- All changes applied successfully (no file write errors)
- No syntax errors introduced
- All files still parseable by language parser
- Dependency order respected (group-1 before group-2, etc.)

**Failure Handling:**
- **Syntax error:** Immediately rollback group, report error, abort
- **File write error:** Rollback group, report error, abort
- **Executor timeout:** Kill process, rollback group, abort

---

### Phase 5: Comprehensive Validation

**Purpose:** Validate that refactoring preserves behavior and code quality.

**Inputs:**
- Execution results from Phase 4
- Test configuration
- Type checker configuration
- Linter configuration

**Process:**
1. Run all relevant tests (from Phase 1 analysis)
2. Run type checker on affected files
3. Run linter on affected files
4. Check for runtime errors (if applicable)
5. Aggregate all validation results

**Sub-Agent(s):**
- `test-validator`: Test execution and validation specialist
  - Tools: Bash (to run tests)
  - Model: Haiku 4.5 (fast, simple execution)
  - Output: Test results JSON

**Parallel Execution:** NO - validation steps are fast and often interdependent (e.g., type checking may surface issues tests would catch)

**Outputs:**
```json
{
  "validation_results": {
    "tests": {
      "status": "passed",
      "total": 247,
      "passed": 247,
      "failed": 0,
      "duration_ms": 3200
    },
    "type_check": {
      "status": "passed",
      "errors": [],
      "warnings": []
    },
    "linting": {
      "status": "passed",
      "errors": [],
      "warnings": ["Prefer const over let in calculator.ts:52"]
    },
    "overall_status": "passed"
  }
}
```

**Success Criteria:**
- All tests pass (100%)
- No new type errors introduced
- No new linting errors (warnings acceptable)
- Validation completes in reasonable time (<5 minutes)

**Failure Handling:**
- **Tests fail:** Rollback all changes, present test failures to user, abort
- **Type errors:** Rollback all changes, present type errors, abort
- **Linting errors:** Warn user, offer to continue or rollback
- **Validation timeout:** Rollback, report timeout, abort

---

### Phase 6: Documentation & Finalization

**Purpose:** Update all related documentation, examples, and metadata to reflect the refactoring.

**Inputs:**
- Original analysis (documentation references)
- Refactoring details (old name → new name)
- Validation results (ensure success before updating docs)

**Process:**
1. Update documentation files (README, .md files) that reference old symbol
2. Update code examples in docs
3. Update JSDoc/TSDoc comments
4. Generate refactoring summary for changelog
5. Commit all changes with descriptive message

**Sub-Agent(s):**
- `doc-updater`: Documentation update specialist
  - Tools: Read, Edit, Write
  - Model: Sonnet 4.5 (understanding context in docs)
  - Output: Documentation update results

**Parallel Execution:** NO - doc updates are fast and sequential is fine

**Outputs:**
```json
{
  "documentation_updates": {
    "files_updated": [
      "docs/billing.md",
      "README.md",
      "src/billing/calculator.ts"
    ],
    "changes": [
      {
        "file": "docs/billing.md",
        "line": 12,
        "old": "Use `calculateTotal()` to compute final amounts",
        "new": "Use `computeSum()` to compute final amounts"
      }
    ]
  },
  "changelog_entry": "### Changed\n- Renamed `calculateTotal` to `computeSum` in billing module for clarity (52 files affected)\n",
  "commit_message": "refactor(billing): rename calculateTotal to computeSum\n\nRenamed function across 52 files to better reflect its purpose.\nAll tests pass, documentation updated.\n\nRefs: #1234"
}
```

**Success Criteria:**
- All documentation references updated
- No broken links or outdated references remain
- Changelog entry is clear and informative

**Failure Handling:**
- **Doc update fails:** Warn user, but don't rollback code changes (docs can be fixed later)
- **Commit fails:** Report error, leave changes staged for user to commit manually

---

## Sub-Agent Design

### Sub-Agent: refactoring-analyzer

**Type:** Analysis

**Purpose:** Perform comprehensive code analysis to identify all references to a target symbol and understand refactoring scope.

**Tools:** Read, Grep, Glob, Bash
**Rationale:** Needs to read files, search for patterns (imports, calls), find files by glob patterns, and potentially run language-specific tools (e.g., TypeScript compiler API for precise symbol resolution).

**Model:** Sonnet 4.5
**Rationale:** Complex reasoning required for symbol resolution, understanding import patterns, and distinguishing true references from string literals.

**Auto-Commit:** false
**Rationale:** Analysis agent, makes no changes.

**Input Schema:**
```json
{
  "refactoring_type": "rename|extract|move|inline",
  "target": {
    "symbol": "calculateTotal",
    "file": "src/billing/calculator.ts",
    "line": 45
  },
  "scope": {
    "include": ["src/**/*.ts", "tests/**/*.ts"],
    "exclude": ["node_modules/**", "dist/**"]
  }
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "target": {...},
    "references": [...],
    "test_coverage": {...},
    "documentation_references": [...],
    "blast_radius": {...}
  }
}
```

**Responsibilities:**
1. Locate target symbol precisely (handle overloads, shadowing)
2. Find all direct references (imports, calls, type references)
3. Identify test files covering affected code
4. Search documentation for symbol mentions
5. Estimate impact (files, lines, complexity)

**Never:**
- Modify any files
- Execute refactoring changes
- Run tests or validation

**Success Criteria:**
- >99% recall on references (no false negatives)
- >90% precision (minimal false positives)
- Complete analysis in <10 seconds for typical codebase

**Error Scenarios:**
- **Symbol not found:** Return error with fuzzy search suggestions
- **Ambiguous symbol (multiple definitions):** Ask user to specify which one
- **Search timeout:** Return partial results with warning

---

### Sub-Agent: dependency-mapper

**Type:** Analysis

**Purpose:** Build a complete dependency graph of the codebase to determine change ordering.

**Tools:** Read, Grep, Glob
**Rationale:** Read files to parse imports, grep for import patterns, glob to find all relevant files.

**Model:** Sonnet 4.5
**Rationale:** Graph traversal and topological sorting require complex reasoning.

**Auto-Commit:** false

**Input Schema:**
```json
{
  "files": ["src/billing/calculator.ts", "src/billing/invoice.ts", ...],
  "language": "typescript|javascript|python"
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "dependency_graph": {
      "nodes": ["file1.ts", "file2.ts"],
      "edges": [{"from": "file2.ts", "to": "file1.ts"}]
    },
    "cycles": [],
    "topological_order": ["file1.ts", "file2.ts", ...]
  }
}
```

**Responsibilities:**
1. Parse import statements from all files
2. Build directed graph (file → dependencies)
3. Detect circular dependencies
4. Compute topological ordering

**Success Criteria:**
- Graph is complete (all imports captured)
- Cycles detected and reported
- Topological order is valid

---

### Sub-Agent: impact-assessor

**Type:** Analysis

**Purpose:** Evaluate refactoring risk based on multiple factors (blast radius, test coverage, complexity).

**Tools:** Read
**Rationale:** Read test files and coverage reports.

**Model:** Sonnet 4.5
**Rationale:** Risk assessment requires nuanced reasoning about multiple factors.

**Auto-Commit:** false

**Input Schema:**
```json
{
  "blast_radius": {...},
  "test_coverage": {...},
  "refactoring_type": "rename",
  "user_risk_tolerance": "conservative|moderate|aggressive"
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "overall_risk": "low|medium|high",
    "factors": [...],
    "failure_probability": 0.15,
    "recommended_approach": "conservative|aggressive"
  }
}
```

**Responsibilities:**
1. Assess multiple risk factors
2. Weight factors by importance
3. Provide overall risk rating
4. Recommend approach

**Success Criteria:**
- Risk assessment is reasonable and justified
- Recommendations align with risk level

---

### Sub-Agent: plan-generator

**Type:** Generation

**Purpose:** Create detailed, dependency-ordered execution plan with parallel execution opportunities.

**Tools:** Read
**Rationale:** May need to read files to understand structure for grouping.

**Model:** Sonnet 4.5
**Rationale:** Planning requires complex reasoning about dependencies and parallelism.

**Auto-Commit:** false

**Input Schema:**
```json
{
  "references": [...],
  "dependency_graph": {...},
  "risk_assessment": {...}
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "execution_plan": {
      "strategy": "dependency-ordered-parallel",
      "groups": [...],
      "total_estimated_time_ms": 4700,
      "parallel_speedup": "2.5x"
    },
    "rollback_strategy": {...}
  }
}
```

**Responsibilities:**
1. Group changes by dependency relationships
2. Determine topological execution order
3. Identify parallel execution opportunities
4. Estimate execution time
5. Design rollback strategy

**Success Criteria:**
- Plan respects all dependencies (valid topological order)
- Parallel groups have no file conflicts
- Time estimates are reasonable

---

### Sub-Agent: refactoring-executor

**Type:** Implementation

**Purpose:** Execute specific file changes for a refactoring (rename symbols, update imports, move code).

**Tools:** Read, Write, Edit, Grep
**Rationale:** Full file manipulation capabilities needed. Edit for precise changes, Write for new files, Read to understand context.

**Model:** Sonnet 4.5
**Rationale:** Code generation quality matters; must preserve semantics perfectly.

**Auto-Commit:** true
**Rationale:** This is an implementation agent making file changes.

**Input Schema:**
```json
{
  "group_id": "group-2a",
  "files": ["src/billing/invoice.ts"],
  "refactoring": {
    "type": "rename",
    "old_name": "calculateTotal",
    "new_name": "computeSum",
    "scope": "all_references"
  }
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "group_id": "group-2a",
    "files_modified": ["src/billing/invoice.ts"],
    "changes": [
      {
        "file": "src/billing/invoice.ts",
        "line": 5,
        "old": "import { calculateTotal } from './calculator'",
        "new": "import { computeSum } from './calculator'"
      }
    ],
    "duration_ms": 320
  }
}
```

**Responsibilities:**
1. Read target files
2. Apply refactoring changes precisely
3. Validate syntax after changes
4. Report all modifications made

**Never:**
- Run tests (that's test-validator's job)
- Analyze dependencies (that's dependency-mapper's job)
- Update documentation (that's doc-updater's job)

**Success Criteria:**
- Changes applied correctly (exact match to refactoring intent)
- No syntax errors introduced
- All files parseable after changes

**Error Scenarios:**
- **File write error:** Return error, don't attempt other files in group
- **Syntax error after change:** Return error with details
- **Symbol not found in file:** Return error, possible false positive from analysis

---

### Sub-Agent: test-validator

**Type:** Validation

**Purpose:** Execute tests and report results for validation.

**Tools:** Bash
**Rationale:** Run test commands (npm test, vitest, etc.).

**Model:** Haiku 4.5
**Rationale:** Simple execution task, fast response needed.

**Auto-Commit:** false

**Input Schema:**
```json
{
  "test_files": ["tests/billing/calculator.test.ts"],
  "test_command": "npm test",
  "timeout_ms": 60000
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "tests": {
      "status": "passed|failed",
      "total": 247,
      "passed": 247,
      "failed": 0,
      "failures": [],
      "duration_ms": 3200
    }
  }
}
```

**Responsibilities:**
1. Execute test command
2. Parse test output
3. Report results

**Success Criteria:**
- All tests executed
- Results parsed correctly

---

### Sub-Agent: doc-updater

**Type:** Implementation

**Purpose:** Update documentation files to reflect refactoring changes.

**Tools:** Read, Edit, Write
**Rationale:** Full file manipulation for docs.

**Model:** Sonnet 4.5
**Rationale:** Understanding context in documentation requires reasoning.

**Auto-Commit:** true

**Input Schema:**
```json
{
  "documentation_references": [...],
  "refactoring": {
    "old_name": "calculateTotal",
    "new_name": "computeSum"
  }
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "files_updated": ["docs/billing.md"],
    "changes": [...]
  }
}
```

**Responsibilities:**
1. Update documentation references
2. Update code examples in docs
3. Update comments/JSDoc

**Success Criteria:**
- All references updated
- No broken links

---

## Workflow & Orchestration

### Overview Diagram

```
User: /refactor rename calculateTotal to computeSum
    ↓
[Phase 1: Analysis]
    ├→ refactoring-analyzer ──┐
    └→ dependency-mapper    ──┼→ PARALLEL
                             ─┘
        ↓ Returns: {references, dependency_graph}
    ↓
[Phase 2: Planning]
    ├→ impact-assessor ──┐
    └→ plan-generator  ──┼→ PARALLEL
                        ─┘
        ↓ Returns: {risk_assessment, execution_plan}
    ↓
[Phase 3: User Approval Gate]
    Main: Present plan to user
    User: Approve / Modify / Cancel
    ↓
[Phase 4: Execution]
    Create git checkpoint
    ↓
    For each group in topological order:
      ├→ refactoring-executor (file 1) ──┐
      ├→ refactoring-executor (file 2) ──┼→ PARALLEL (if safe)
      └→ refactoring-executor (file 3) ──┘
          ↓ All complete
          ↓ Validate syntax
          ↓ If success → next group
          ↓ If failure → ROLLBACK + ABORT
    ↓
[Phase 5: Validation]
    └→ test-validator
        ↓ Returns: {test results}
        ↓ If all pass → Phase 6
        ↓ If any fail → ROLLBACK + ABORT
    ↓
[Phase 6: Finalization]
    └→ doc-updater
        ↓ Returns: {documentation updates}
    ↓
Complete: Success summary
```

### Execution Flow

1. **Phase 1 - Analysis (Parallel):**
   - Main agent invokes `refactoring-analyzer` and `dependency-mapper` in parallel (single response, two Task calls)
   - Both complete, results aggregated

2. **Phase 2 - Planning (Parallel):**
   - Main agent invokes `impact-assessor` and `plan-generator` in parallel
   - Results combined into comprehensive plan

3. **Phase 3 - User Approval (Interactive):**
   - Main agent presents plan and risk assessment
   - User decides: approve, modify, or cancel
   - If approved → Phase 4

4. **Phase 4 - Staged Execution (Sequential groups, parallel within groups):**
   - Create git checkpoint
   - For each group in dependency order:
     - Invoke N `refactoring-executor` agents in parallel (one per file or per batch)
     - Wait for all to complete
     - Validate syntax
     - If failure → rollback + abort
     - If success → next group

5. **Phase 5 - Validation (Sequential):**
   - Invoke `test-validator`
   - If tests fail → rollback + abort
   - If tests pass → Phase 6

6. **Phase 6 - Finalization (Sequential):**
   - Invoke `doc-updater`
   - Generate summary
   - Present to user

### Orchestration Patterns

**Pattern 1: Parallel Fanout (Phases 1, 2)**
- Independent analysis tasks run simultaneously
- Performance: 2x faster than sequential

**Pattern 2: Sequential Pipeline with Parallel Stages (Phase 4)**
- Groups execute sequentially (dependency order)
- Within each group, file changes execute in parallel
- Performance: 5x faster than fully sequential

**Pattern 3: Validation Gate (Phases 4, 5)**
- Each phase validates before proceeding
- Any failure triggers immediate rollback

---

## User Interaction Design

### Gate 1: Plan Approval (After Phase 2)

**Trigger:** Planning complete, before any file changes

**Present to User:**
```
Refactoring Plan: Rename calculateTotal → computeSum

Impact Analysis:
  ✓ 52 files affected
  ✓ 340 lines of code
  ✓ 247 tests covering affected code (92% coverage)
  ✓ 3 documentation files reference this function

Risk Assessment: MEDIUM
  • High blast radius (52 files) - but mechanical rename is low semantic risk
  • High test coverage (92%) - increases confidence
  • Estimated success probability: 85%

Execution Plan:
  Group 1: Update implementation (1 file)
    - src/billing/calculator.ts

  Group 2: Update direct consumers (8 files, PARALLEL)
    - src/billing/invoice.ts
    - src/api/checkout.ts
    - ... (6 more)

  Group 3: Update indirect consumers (43 files, PARALLEL)
    - src/services/*.ts
    - ... (42 more)

Estimated time: ~5 seconds
Rollback strategy: Git stash (can restore if anything fails)

Proceed with refactoring? [Y/n/modify]
```

**User Options:**
- ✅ **Y:** Proceed
- **n:** Cancel
- **modify:** Change scope or preferences

---

### Progress Updates

```
✓ Phase 1: Analysis Complete (52 files, 340 lines)
✓ Phase 2: Planning Complete (3 groups, 5s estimated)

⟳ Phase 4: Execution (Group 2/3)
  ✓ Group 1: Implementation (1 file)
  ✓ Group 2: Direct consumers (8 files, 920ms)
  ⏳ Group 3: Indirect consumers (43 files, in progress...)

⏳ Phase 5: Validation (running tests...)
```

---

## Quality Gates & Validation

### Level 1: Input Validation
- ✓ Target symbol exists
- ✓ Scope is valid
- ✓ No conflicting refactorings in progress

### Level 2: Phase Output Validation

**Phase 1:**
- ✓ All references found
- ✓ Dependency graph is acyclic

**Phase 4:**
- ✓ All files modified successfully
- ✓ No syntax errors

**Phase 5:**
- ✓ All tests pass
- ✓ No type errors
- ✓ No linting errors

### Level 3: Final Validation
- ✓ Refactoring complete
- ✓ All validation passed
- ✓ Documentation updated

---

## Rollback Strategy

**Mechanism:** Git stash

**Checkpoints:**
- Pre-refactoring: `git stash push -m "Pre-refactoring checkpoint"`
- After Phase 4: Staged changes
- After Phase 5: Tests passed

**Rollback Triggers:**
- Syntax error in Phase 4
- Test failure in Phase 5
- User cancellation

**Rollback Process:**
```bash
git reset --hard
git stash pop
# Restore original state
```

---

## Implementation Mapping

### Slash Command: `/refactor`

**Location:** `.claude/commands/refactoring/refactor.md`

**Orchestration Flow:**
```
/refactor invoked
  ↓
Parse user input
  ↓
Task(refactoring-analyzer) + Task(dependency-mapper) [PARALLEL]
  ↓
Task(impact-assessor) + Task(plan-generator) [PARALLEL]
  ↓
Present plan → User approval
  ↓
For each group:
  Task(refactoring-executor) × N [PARALLEL]
  ↓
Task(test-validator)
  ↓
Task(doc-updater)
  ↓
Present summary
```

---

## Testing & Validation

### Test Scenarios

1. **Simple rename (10 files)** - Should complete in <3s, all tests pass
2. **Large rename (100 files)** - Should parallelize effectively, <10s
3. **Failing tests** - Should rollback all changes, report failures
4. **Circular dependencies** - Should detect and report error before execution
5. **Partial execution failure** - Should rollback partial changes cleanly

---

**End of PRD**
