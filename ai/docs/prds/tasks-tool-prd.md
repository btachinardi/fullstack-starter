# Tasks Management Tool System PRD

**Status:** Draft
**Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Platform Engineering
**Implementation:**
- Main CLI Tool: `tasks` (MCP tool or npm script)
- Slash Command: `/tasks:create`
- Sub-Agents: `research-writer`, `prd-writer`, `task-writer`, `task-validator`

---

## Executive Summary

The Tasks Management Tool System provides a sophisticated approach to managing development work through structured task documents (`*.tasks.md` files). This system replaces the current TodoWrite tool with a more comprehensive solution that integrates PRD-driven development, research documentation, task decomposition, and validation workflows.

This system provides value by creating a complete workflow from idea to implementation: preliminary research informs PRDs, PRDs drive task document creation, tasks are validated for completeness, and the orchestrator iterates until validation passes. Users can manage tasks through a CLI tool that supports listing, filtering, status updates, and multi-document operations.

The task document format uses YAML frontmatter and code blocks to enable structured, machine-readable task definitions that can be processed by both humans and automated systems.

---

## Problem Statement

**Current Pain Points:**
- TodoWrite creates simple checkbox lists without structured metadata or validation
- No formal connection between PRDs and implementation task lists
- No preliminary research documentation before PRD creation
- Lack of task validation against PRD requirements
- No standardized task document format with machine-readable structure
- Limited task management capabilities (no filtering, status updates, or multi-document operations)
- No dependency tracking or deliverables specification in current todo format

**Why This System is Needed:**
- Complex features require research before planning (PRD) and implementation (tasks)
- Tasks need rich metadata (type, project, dependencies, deliverables) for orchestration
- Validation ensures task completeness relative to PRD requirements
- CLI tool enables efficient task management across multiple documents
- Structured YAML format enables automation and tooling integration
- Multiple task lists within a document enable logical grouping (db, api, web, test, doc)

---

## Goals & Non-Goals

### Goals

1. **Comprehensive Workflow:** Support research → PRD → tasks → validation lifecycle
2. **Structured Task Format:** YAML-based tasks with metadata (type, project, deliverables, dependencies, status)
3. **CLI Task Management:** Provide tool for listing, filtering, status updates, and task operations
4. **Document Scoping:** Support simple name, complete path, and partial path document references
5. **Task Validation:** Automated validation of task documents against PRD requirements
6. **Iterative Refinement:** Orchestrator iterates task-writer → task-validator until valid
7. **Agent Integration:** Seamless integration with existing prd-writer and new specialized agents
8. **Multi-Document Support:** Handle multiple task documents per project with discovery and selection
9. **Replace TodoWrite:** Provide migration path from simple todo lists to structured tasks

### Non-Goals

- Real-time collaboration features (multiple users editing same task document)
- Task time tracking or estimation (beyond basic metadata)
- Integration with external project management tools (Jira, Linear, etc.)
- Gantt charts or visual timeline representations
- Resource allocation or capacity planning
- Automatic task execution (that's for orchestrators/agents to consume tasks)
- Task document templates beyond the standard format (users can create their own)

---

## Task Decomposition

### Phase 1: CLI Tool Implementation

**Purpose:** Create the core CLI tool for managing `*.tasks.md` files with all specified actions.

**Inputs:**
- User command invocations with flags and arguments
- Task documents (`*.tasks.md` files) in the project
- YAML structure definitions for task metadata

**Process:**
1. Design CLI interface with command structure (list, get, start, delete, cancel, complete, reset, add, list-docs)
2. Implement document discovery and scoping logic (simple name, complete path, partial path)
3. Create YAML parser for task documents (frontmatter + task blocks)
4. Implement task filtering options (by status, by task list, by agent, head, tail)
5. Build task status update operations (start, cancel, complete, reset)
6. Implement task CRUD operations (add task, delete task, get details)
7. Create interactive document selection for multi-document scenarios
8. Add validation for task document structure

**Sub-Agent(s):**
- `code-writer`: Implements CLI tool in TypeScript or Python
  - Tools: Inherit all (Read, Write, Edit, Bash)
  - Model: Sonnet 4.5 (complex CLI logic and YAML parsing)
  - Output: Functional CLI tool with all actions

**Outputs:**
- CLI tool executable (`tasks` command)
- Support for all 9 actions:
  1. List tasks with filtering
  2. Get task details
  3. Start task (mark as in progress)
  4. Delete task
  5. Cancel task (mark as cancelled)
  6. Complete task (mark as completed)
  7. Reset task (mark as todo)
  8. Add task to list
  9. List all task lists in document

**Success Criteria:**
- ✓ All 9 actions implemented and functional
- ✓ Document scoping works for all 3 formats (simple, complete, partial path)
- ✓ YAML parsing handles frontmatter and task blocks correctly
- ✓ Interactive selection works when document is omitted
- ✓ Task filtering produces accurate results
- ✓ Status updates preserve document structure and formatting

**Failure Handling:**
- If YAML parsing fails → show clear error with line number
- If document not found → suggest similar names, list all available documents
- If task ID not found → list all tasks in document
- If invalid status transition → explain valid transitions

---

### Phase 2: Task Document Format Specification

**Purpose:** Define and document the `*.tasks.md` format with YAML frontmatter and task blocks.

**Inputs:**
- Example task document from request (Dashboard example)
- Requirements for task metadata fields
- Task list naming conventions

**Process:**
1. Document YAML frontmatter structure (title, description, source)
2. Specify task block naming convention (`tasks:name`)
3. Define task field schema (id, title, type, project, description, deliverables, requirements, status, depends_on)
4. Create examples for different task types (database-schema, endpoint, ui-component, etc.)
5. Document task list grouping strategies (db, api, web, test, doc)
6. Specify status values and lifecycle (todo → in progress → completed | cancelled)
7. Define dependency reference format (array of task IDs)

**Sub-Agent(s):**
- `docs-writer`: Creates format specification documentation
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: Comprehensive format specification

**Outputs:**
- `*.tasks.md` format specification document
- Task field schema with validation rules
- Examples covering all common task types
- Best practices for task decomposition
- Guidance on task list organization

**Success Criteria:**
- ✓ Format specification is clear and unambiguous
- ✓ Schema covers all required and optional fields
- ✓ Examples demonstrate real-world usage
- ✓ Validation rules are machine-readable

**Failure Handling:**
- N/A (documentation phase)

---

### Phase 3: Research Writer Agent

**Purpose:** Create specialized agent for preliminary research before PRD creation.

**Inputs:**
- User request for new feature or system
- Optional context (existing code, related features, requirements)

**Process:**
1. Design research-writer agent with clear directive for research documentation
2. Define research document structure (problem space, existing solutions, constraints, recommendations)
3. Implement methodology for comprehensive research (codebase analysis, pattern discovery, constraint identification)
4. Create output format for research documents (`ai/docs/research/[topic].md`)
5. Integrate with `/tasks:create` workflow as optional first step

**Sub-Agent(s):**
- `subagent-writer`: Creates the research-writer agent definition
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: `.claude/agents/planning/research-writer.md`

**Outputs:**
- `research-writer` agent file with:
  - YAML frontmatter (name, description, tools, model)
  - System prompt for research methodology
  - Examples of research output
  - Integration points with prd-writer

**Success Criteria:**
- ✓ Agent can conduct comprehensive research on feature requests
- ✓ Research output follows consistent structure
- ✓ Research documents inform PRD creation effectively
- ✓ Agent integrates smoothly with `/tasks:create` workflow

**Failure Handling:**
- If research scope too broad → request user to narrow focus
- If insufficient context → ask targeted questions
- If no existing patterns found → document greenfield approach

---

### Phase 4: Task Writer Agent (Rename from todo-writer)

**Purpose:** Rename and update `todo-writer` to `task-writer` specialized for creating `*.tasks.md` documents.

**Inputs:**
- PRD document (required)
- User requirements or feature specifications
- Project structure and conventions

**Process:**
1. Rename `todo-writer.md` to `task-writer.md`
2. Update agent description to focus on `*.tasks.md` format
3. Modify methodology to create YAML-based task blocks
4. Add logic for task list grouping and naming
5. Implement task field population (type, project, deliverables, requirements, dependencies)
6. Update output format to match `*.tasks.md` specification
7. Add validation for task document structure before writing

**Sub-Agent(s):**
- `code-writer`: Performs file rename and updates agent content
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: Updated `.claude/agents/planning/task-writer.md`

**Outputs:**
- Renamed and updated `task-writer` agent
- Agent capable of creating structured `*.tasks.md` files
- Task decomposition from PRD requirements
- Proper task list organization (db, api, web, test, doc)
- Task dependencies and deliverables specified

**Success Criteria:**
- ✓ Agent creates valid `*.tasks.md` documents
- ✓ All task fields populated appropriately
- ✓ Tasks organized into logical task lists
- ✓ Dependencies correctly identified and referenced
- ✓ Task types match available orchestrators/agents

**Failure Handling:**
- If PRD not provided → request PRD file path or offer to create one
- If task decomposition unclear → ask for clarification on scope
- If task types unknown → use generic types, flag for review

---

### Phase 5: Task Validator Agent

**Purpose:** Create agent to validate task documents for completeness and correctness against PRD.

**Inputs:**
- Task document (`*.tasks.md`)
- Source PRD document (from frontmatter `source` field)
- Validation rules and criteria

**Process:**
1. Design task-validator agent with validation methodology
2. Implement PRD requirement extraction and comparison
3. Create validation checks:
   - All PRD requirements covered by tasks
   - Task dependencies are valid (no circular refs, IDs exist)
   - Task fields are complete (required fields present)
   - Task types are recognized
   - Deliverables are specific and actionable
   - Status values are valid
4. Generate validation report with issues and suggestions
5. Return pass/fail status with detailed feedback

**Sub-Agent(s):**
- `subagent-writer`: Creates the task-validator agent definition
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: `.claude/agents/planning/task-validator.md`

**Outputs:**
- `task-validator` agent file
- Validation report structure:
```json
{
  "status": "pass" | "fail",
  "issues": [
    {
      "severity": "error" | "warning",
      "category": "coverage" | "dependency" | "format" | "completeness",
      "message": "Description of issue",
      "suggestion": "How to fix",
      "location": "tasks:api, task 1.3"
    }
  ],
  "coverage": {
    "prd_requirements": 15,
    "requirements_covered": 13,
    "requirements_missing": ["REQ-7: Performance optimization", "REQ-9: Error logging"]
  },
  "summary": "Validation summary text"
}
```

**Success Criteria:**
- ✓ Validator accurately detects missing PRD requirements
- ✓ Dependency validation catches circular and invalid references
- ✓ Format validation ensures all required fields present
- ✓ Suggestions are actionable and specific
- ✓ Validation completes in < 30 seconds for typical task documents

**Failure Handling:**
- If PRD not found → report error, cannot validate without source PRD
- If task document malformed → return specific YAML parsing errors
- If validation logic errors → return partial results with warning

---

### Phase 6: Slash Command & Orchestration

**Purpose:** Create `/tasks:create` slash command that orchestrates the complete workflow.

**Inputs:**
- User request for task document creation
- Optional: PRD file path
- Optional: Research request

**Process:**
1. Create `/tasks:create` command in `.claude/commands/planning/`
2. Implement workflow orchestration:
   - Step 0: Check if PRD exists or gather requirements from user
   - Step 1 (optional): Invoke `research-writer` if user requests preliminary research
   - Step 2: Invoke `prd-writer` to create or use existing PRD
   - Step 3: Invoke `task-writer` to create task document from PRD
   - Step 4: Invoke `task-validator` to validate task document
   - Step 5: If validation fails → invoke `task-writer` to update based on feedback
   - Step 6: Repeat steps 4-5 until validation passes (max 3 iterations)
   - Step 7: Present final task document to user
3. Add user interaction points:
   - Gather requirements if PRD not provided
   - Confirm research scope if requested
   - Review PRD before task creation
   - Review validation results and accept/modify
4. Implement iteration limit to prevent infinite loops
5. Add progress reporting using TodoWrite or status messages

**Sub-Agent(s):**
- `slash-command-writer`: Creates the `/tasks:create` command
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: `.claude/commands/planning/tasks-create.md`

**Outputs:**
- `/tasks:create` slash command file
- Orchestration workflow with iteration
- User approval gates at key decision points
- Clear progress reporting

**Success Criteria:**
- ✓ Workflow completes successfully from request to validated task document
- ✓ Iteration improves task document based on validation feedback
- ✓ User can provide PRD or have system create one
- ✓ Research step is optional and clearly offered
- ✓ Command handles errors gracefully at each step

**Failure Handling:**
- If validation never passes after 3 iterations → present best attempt, ask user for manual review
- If PRD creation fails → report error, cannot proceed without PRD
- If user cancels at any gate → clean exit with partial work saved
- If agent invocation fails → report specific error, offer retry or manual fallback

---

### Phase 7: Integration & Testing

**Purpose:** Integrate all components and validate the complete system with real-world scenarios.

**Inputs:**
- All implemented components (CLI tool, agents, slash command)
- Test scenarios (various feature types, complexity levels)

**Process:**
1. Integration test: CLI tool with sample task documents
2. Integration test: `/tasks:create` end-to-end workflow
3. Test document scoping (simple, complete, partial paths)
4. Test task filtering and status updates
5. Test validation iteration (task-writer → task-validator loop)
6. Test error handling and edge cases
7. Performance test: CLI tool with large task documents (100+ tasks)
8. User acceptance test: Create task document for real feature

**Sub-Agent(s):**
- `test-writer`: Creates test cases and validation scripts
  - Tools: Inherit all
  - Model: Sonnet 4.5
  - Output: Test suite for tasks system

**Outputs:**
- Integration test suite
- Test scenarios covering all actions and workflows
- Performance benchmarks
- Bug reports and fixes
- User acceptance validation

**Success Criteria:**
- ✓ All CLI actions work correctly with various task documents
- ✓ `/tasks:create` workflow completes successfully for test features
- ✓ Validation iteration improves task quality measurably
- ✓ CLI tool handles 100+ task documents efficiently
- ✓ Error messages are clear and actionable
- ✓ No data loss during status updates or edits

**Failure Handling:**
- If integration issues found → fix and re-test
- If performance issues → optimize YAML parsing or filtering
- If validation issues → refine task-validator logic

---

## Sub-Agent Design

### Sub-Agent: research-writer

**Type:** Generation

**Purpose:** Conduct preliminary research on feature requests to inform PRD creation with analysis of existing solutions, constraints, and recommendations.

**Tools:** Inherit all
**Rationale:** Needs to read existing code, search patterns, explore codebase, and write research documents.

**Model:** Sonnet 4.5
**Rationale:** Research requires complex reasoning, pattern recognition, and comprehensive analysis.

**Auto-Commit:** true
**Rationale:** Creates research documents that should be committed.

**Input Schema:**
```json
{
  "topic": "Feature or system to research",
  "context": "Optional context or specific areas to investigate",
  "scope": "broad | focused",
  "output_path": "ai/docs/research/[topic].md"
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "research_file": "ai/docs/research/dashboard-research.md",
    "key_findings": [
      "Existing pattern X can be reused",
      "Constraint Y must be addressed",
      "Technology Z is recommended"
    ],
    "recommendations": [
      "Use existing auth pattern",
      "Consider React Query for data fetching"
    ]
  }
}
```

**Responsibilities:**
1. Analyze existing codebase for related patterns and implementations
2. Identify technical constraints and architectural considerations
3. Research external solutions and best practices (from knowledge)
4. Document findings in structured research document
5. Provide actionable recommendations for PRD writer

**Never:**
- Create PRDs (that's prd-writer's job)
- Create tasks (that's task-writer's job)
- Make implementation decisions (research informs, doesn't decide)

**Success Criteria:**
- Research document is comprehensive and well-organized
- Findings are specific and actionable
- Recommendations clearly justified
- Research informs PRD creation effectively

**Error Scenarios:**
- **Scenario:** Topic too vague → **Action:** Ask clarifying questions, suggest specific research areas
- **Scenario:** No existing patterns found → **Action:** Document greenfield approach, research external solutions
- **Scenario:** Conflicting constraints → **Action:** Document trade-offs, present options to user

---

### Sub-Agent: task-writer

**Type:** Generation

**Purpose:** Generate comprehensive `*.tasks.md` documents from PRD specifications with structured YAML task blocks, dependencies, and deliverables.

**Tools:** Inherit all
**Rationale:** Needs to read PRD documents, analyze project structure, and write task documents.

**Model:** Sonnet 4.5
**Rationale:** Task decomposition requires strategic thinking, dependency analysis, and understanding of technical architecture.

**Auto-Commit:** true
**Rationale:** Creates task documents that should be committed.

**Input Schema:**
```json
{
  "prd_path": "ai/docs/prds/dashboard-prd.md",
  "output_path": "ai/docs/tasks/dashboard.tasks.md",
  "options": {
    "granularity": "fine | medium | coarse",
    "include_test_tasks": true,
    "include_doc_tasks": true
  }
}
```

**Output Schema:**
```json
{
  "status": "success",
  "data": {
    "task_file": "ai/docs/tasks/dashboard.tasks.md",
    "task_count": 42,
    "task_lists": ["db", "api", "web", "test", "doc"],
    "validation_status": "pending"
  }
}
```

**Responsibilities:**
1. Parse PRD to extract requirements and user stories
2. Decompose requirements into granular, actionable tasks
3. Organize tasks into logical task lists (db, api, web, test, doc)
4. Populate task metadata (id, title, type, project, description, deliverables, requirements, status, depends_on)
5. Identify task dependencies and create dependency chains
6. Write valid `*.tasks.md` document with YAML frontmatter and task blocks

**Never:**
- Validate tasks (that's task-validator's job)
- Execute tasks (that's for orchestrators/executors)
- Modify PRD documents

**Success Criteria:**
- Task document has valid YAML structure
- All PRD requirements covered by tasks
- Tasks are granular and actionable
- Dependencies are logical and complete
- Task types match available orchestrators

**Error Scenarios:**
- **Scenario:** PRD not found → **Action:** Request PRD path, offer to create PRD first
- **Scenario:** PRD requirements unclear → **Action:** Ask user for clarification, make best guess with note
- **Scenario:** Task decomposition ambiguous → **Action:** Create high-level tasks, flag for refinement

---

### Sub-Agent: task-validator

**Type:** Validation

**Purpose:** Validate `*.tasks.md` documents for completeness, correctness, and alignment with source PRD requirements.

**Tools:** Read, Grep
**Rationale:** Needs to read task documents and PRDs, search for patterns. No write operations (validation only).

**Model:** Sonnet 4.5
**Rationale:** Validation requires complex reasoning to compare PRD requirements with task coverage and identify gaps.

**Auto-Commit:** false
**Rationale:** Validation agent produces reports, doesn't modify code.

**Input Schema:**
```json
{
  "task_file": "ai/docs/tasks/dashboard.tasks.md",
  "validation_rules": {
    "require_deliverables": true,
    "require_dependencies": false,
    "check_prd_coverage": true
  }
}
```

**Output Schema:**
```json
{
  "status": "pass" | "fail",
  "data": {
    "issues": [
      {
        "severity": "error" | "warning",
        "category": "coverage" | "dependency" | "format" | "completeness",
        "message": "Missing PRD requirement: User authentication flow",
        "suggestion": "Add tasks for login, logout, and session management",
        "location": "tasks:api"
      }
    ],
    "coverage": {
      "prd_requirements": 15,
      "requirements_covered": 13,
      "requirements_missing": ["REQ-7: Performance optimization"]
    },
    "dependency_graph": {
      "valid": true,
      "circular_refs": []
    },
    "summary": "13/15 requirements covered. Add 3 tasks for complete coverage."
  }
}
```

**Responsibilities:**
1. Parse task document and extract all tasks
2. Read source PRD and extract requirements
3. Validate PRD coverage (all requirements have corresponding tasks)
4. Validate task dependencies (no circular refs, all IDs exist)
5. Validate task structure (required fields present, valid status values)
6. Generate detailed validation report with actionable feedback

**Never:**
- Modify task documents (only validate)
- Create new tasks (suggest them in validation report)
- Execute tasks

**Success Criteria:**
- Accurately detects missing PRD requirements (100% recall)
- Identifies circular and invalid dependencies
- Validates all required task fields
- Provides specific, actionable suggestions

**Error Scenarios:**
- **Scenario:** PRD file not found → **Action:** Return error, cannot validate without source PRD
- **Scenario:** Malformed YAML → **Action:** Return specific parsing errors with line numbers
- **Scenario:** Validation logic errors → **Action:** Return partial results with warning

---

## Workflow & Orchestration

### Overview Diagram

```
User: /tasks:create [feature]
    ↓
Main: Gather requirements or PRD path
    ↓
User: Provide requirements / PRD / request research
    ↓
[Optional: Phase 0 - Research]
    └→ research-writer
        ↓ Returns: research document
    ↓
[Phase 1: PRD Creation/Use]
    ├→ Use existing PRD (if provided)
    └→ prd-writer (if not provided)
        ↓ Returns: PRD document
    ↓
User: Review PRD (approval gate)
    ↓
[Phase 2: Task Document Creation]
    └→ task-writer
        ↓ Returns: tasks.md document
    ↓
[Phase 3: Validation Loop]
    └→ task-validator
        ↓ Returns: validation report
        ↓
    ├─ PASS → Phase 4 (Complete)
    └─ FAIL → task-writer (iteration with feedback)
        ↓ Returns: updated tasks.md
        └→ task-validator (repeat)
            ↓
        (Max 3 iterations)
    ↓
[Phase 4: Finalization]
    └→ Present final task document to user
    ↓
Complete

---

CLI Usage (after task document created):

User: tasks list --doc=dashboard
    ↓
CLI: Parse dashboard.tasks.md
    ↓
CLI: Display filtered task list
    ↓
Complete

User: tasks start 1.3 --doc=dashboard
    ↓
CLI: Update task 1.3 status to "in progress"
    ↓
CLI: Save updated dashboard.tasks.md
    ↓
Complete
```

### Execution Flow

1. **Phase 0 - Research (Optional):**
   - Main command asks if user wants preliminary research
   - If yes → invoke `research-writer` with topic
   - Wait for research document
   - Present research to user for review

2. **Phase 1 - PRD (Sequential):**
   - Check if user provided PRD path
   - If yes → use existing PRD
   - If no → gather requirements, invoke `prd-writer`
   - Present PRD to user for review and approval

3. **User Approval Gate:**
   - User reviews PRD
   - Options: Approve, Request changes, Cancel
   - If approved → proceed to Phase 2

4. **Phase 2 - Task Creation (Sequential):**
   - Invoke `task-writer` with PRD path
   - Wait for task document creation
   - Present task document summary to user

5. **Phase 3 - Validation Loop (Iterative):**
   - Invoke `task-validator` with task document
   - Wait for validation report
   - If PASS → proceed to Phase 4
   - If FAIL:
     - Show validation issues to user
     - Invoke `task-writer` with validation feedback
     - Repeat validation (max 3 iterations)
     - If still fails after 3 iterations → present best attempt to user

6. **Phase 4 - Finalization:**
   - Present final validated task document
   - Show summary (task count, task lists, coverage)
   - Provide instructions for using CLI tool

7. **CLI Operations (User-driven):**
   - User invokes `tasks` command with action
   - CLI parses task documents
   - CLI performs requested action (list, update status, add task, etc.)
   - CLI saves updated document if modified

### Orchestration Pattern

**Sequential Pipeline** for main workflow (Research → PRD → Tasks → Validation)

**Rationale:** Each phase depends on outputs from previous phase. Must create PRD before tasks, must create tasks before validation.

**Iterative Loop** for validation refinement (Task Creation ↔ Validation)

**Rationale:** Validation feedback improves task quality. Task-writer updates based on validator suggestions, then re-validates until pass or iteration limit.

---

## User Interaction Design

### Gate 1: Requirements Gathering

**Trigger:** `/tasks:create` invoked without PRD

**Present to User:**
```
No PRD provided. Would you like to:

1. Provide existing PRD path
2. Describe feature for new PRD creation
3. Request preliminary research first

Enter choice (1/2/3):
```

**User Options:**
- **1 (Provide PRD):** User enters path, skip to PRD review
- **2 (Create PRD):** Ask user questions, invoke prd-writer
- **3 (Research first):** Invoke research-writer, then proceed to PRD

---

### Gate 2: PRD Review

**Trigger:** After PRD created or loaded

**Present to User:**
```
PRD created: ai/docs/prds/dashboard-prd.md

Summary:
- Feature: Dashboard with widgets and metrics
- Requirements: 15 functional, 8 non-functional
- Complexity: Medium-High
- Estimated effort: 3-4 weeks

Review PRD before creating tasks? [Y/n/edit]
```

**User Options:**
- **Y (Approve):** Proceed to task creation
- **n (Skip review):** Proceed to task creation
- **edit:** User edits PRD manually, then re-invoke

---

### Gate 3: Validation Results

**Trigger:** After task-validator completes

**Present to User:**
```
Task Validation Results:

✅ PASS (iteration 2/3)

Task document: ai/docs/tasks/dashboard.tasks.md
- 42 tasks across 5 task lists (db, api, web, test, doc)
- 15/15 PRD requirements covered
- 0 dependency issues
- All required fields present

Proceed with this task document? [Y/n]
```

OR if validation fails:

```
Task Validation Results:

❌ FAIL (iteration 1/3)

Issues found:
1. [ERROR] Missing PRD requirement: "User authentication flow"
   → Suggestion: Add tasks for login, logout, session management in tasks:api

2. [WARNING] Task 1.8 depends on 1.9 which depends on 1.8 (circular)
   → Suggestion: Remove circular dependency or reorder tasks

3. [ERROR] Missing deliverables for task 1.5 (Redux store slice)
   → Suggestion: Specify Redux actions, reducers, selectors as deliverables

Updating task document based on feedback...
```

**User Options:**
- **Automatic:** System continues iteration (no user input needed)
- **After 3 iterations fail:** User can approve best attempt or cancel

---

### Progress Reporting

**Format:**
```
✓ Phase 0: Research Complete (ai/docs/research/dashboard-research.md)

✓ Phase 1: PRD Created (ai/docs/prds/dashboard-prd.md)
  - 15 requirements identified
  - User approval received

✓ Phase 2: Task Document Created (ai/docs/tasks/dashboard.tasks.md)
  - 38 initial tasks across 5 task lists

⟳ Phase 3: Validation Iteration 1/3
  - task-validator: 3 issues found
  - task-writer: Updating based on feedback...

⟳ Phase 3: Validation Iteration 2/3
  - task-validator: 1 issue found
  - task-writer: Updating based on feedback...

✓ Phase 3: Validation PASSED (iteration 2/3)
  - 42 tasks, 15/15 requirements covered

✓ Phase 4: Task Document Finalized
```

---

## Quality Gates & Validation

### Level 1: Input Validation

**Validates:** User input and environment setup

**Checks:**
- ✓ If PRD path provided, file exists
- ✓ Output paths are valid and writable
- ✓ Required directories exist (ai/docs/tasks/, ai/docs/prds/)
- ✓ YAML parsing libraries available

**Failure Action:** Report specific error (file not found, permission denied, etc.) and provide fix suggestions

---

### Level 2: Phase Output Validation

**Phase 0 Validation (Research - Optional):**
- ✓ Research document created with valid markdown
- ✓ Key findings and recommendations present
- ✓ Document saved to correct location

**Phase 1 Validation (PRD):**
- ✓ PRD file exists and is valid markdown
- ✓ PRD contains requirements section
- ✓ PRD has clear goals and scope

**Phase 2 Validation (Task Creation):**
- ✓ Task document created with valid YAML frontmatter
- ✓ At least one task list present
- ✓ All tasks have required fields (id, title, status)
- ✓ YAML structure is parseable

**Phase 3 Validation (Task Validation):**
- ✓ Validation report returned with status
- ✓ All PRD requirements checked against tasks
- ✓ Dependency graph analyzed
- ✓ Issues categorized and prioritized

**Failure Action:** Report which phase failed and why, offer retry or manual fallback

---

### Level 3: Final Output Validation

**Success Criteria:**
1. Task document passes task-validator validation
2. All PRD requirements have corresponding tasks
3. No circular or invalid task dependencies
4. All task fields complete and valid
5. Task document saved to correct location with proper formatting

**Validation Script:** (Optional)
```bash
# Validate task document structure
tasks validate --doc=dashboard.tasks.md

# Output:
# ✓ YAML structure valid
# ✓ All task IDs unique
# ✓ All dependencies reference valid task IDs
# ✓ All status values valid (todo|in progress|completed|cancelled)
# ✓ All required fields present
# ✓ 15/15 PRD requirements covered
```

---

## Rollback Strategy

### When to Rollback

- User cancels at any approval gate
- Fatal error occurs during agent invocation
- Iteration limit reached without passing validation (user declines best attempt)

### Rollback Mechanisms

**For Document Creation:**
- Delete partially created documents if user cancels
- Preserve research and PRD even if task creation fails (they're still valuable)
- Offer to save in-progress task document as draft (`.draft.tasks.md`)

**For Iteration Failures:**
- Keep best attempt from iterations (highest validation score)
- Save all iteration versions as `.tasks.v1.md`, `.tasks.v2.md`, etc.
- Allow user to review and select preferred version

**Example:**
```bash
# After 3 failed iterations:
Validation did not pass after 3 attempts.

Saved iterations:
  - dashboard.tasks.v1.md (13/15 requirements, 2 dependency issues)
  - dashboard.tasks.v2.md (14/15 requirements, 1 dependency issue)
  - dashboard.tasks.v3.md (15/15 requirements, 0 dependency issues, 1 format issue)

Best attempt: v3 (15/15 requirements covered)

Accept v3 as final task document? [Y/n/manual]
```

### Partial Success Handling

**Scenario:** Research and PRD created, but task creation fails

**Action:** Preserve research and PRD documents, report task creation error, offer retry or manual task creation

---

## CLI Tool Specification

### Command Structure

```bash
tasks <action> [arguments] [options]
```

### Actions

1. **list**: List all tasks with filtering
```bash
tasks list --doc=dashboard
tasks list --doc=dashboard --status=todo
tasks list --doc=dashboard --list=api
tasks list --doc=dashboard --head=10
tasks list --doc=dashboard --tail=5
tasks list --doc=dashboard --agent=code-writer
```

2. **get**: Get task details
```bash
tasks get 1.3 --doc=dashboard
```

3. **start**: Mark task as in progress
```bash
tasks start 1.3 --doc=dashboard
```

4. **delete**: Remove task from document
```bash
tasks delete 1.3 --doc=dashboard
```

5. **cancel**: Mark task as cancelled
```bash
tasks cancel 1.3 --doc=dashboard
```

6. **complete**: Mark task as completed
```bash
tasks complete 1.3 --doc=dashboard
```

7. **reset**: Mark task as todo
```bash
tasks reset 1.3 --doc=dashboard
```

8. **add**: Add task to list
```bash
tasks add --doc=dashboard --list=api --title="New task" --type=endpoint
```

9. **list-docs**: List all task documents
```bash
tasks list-docs
tasks list-docs --path=ai/docs/tasks/
```

### Document Scoping

**Simple name:**
```bash
tasks list --doc=dashboard
# Searches for: **/dashboard.tasks.md
```

**Complete path:**
```bash
tasks list --doc=ai/docs/tasks/dashboard.tasks.md
# Uses exact path
```

**Partial path:**
```bash
tasks list --doc=auth/v1
# Searches for: **/auth/v1.tasks.md
```

**Omitted (interactive):**
```bash
tasks list
# Discovers all *.tasks.md files
# Presents selection menu:
# 1. dashboard.tasks.md (42 tasks)
# 2. auth-system.tasks.md (28 tasks)
# 3. api-refactor.tasks.md (15 tasks)
# Select document (1-3):
```

### Output Format

**List output:**
```
Tasks in dashboard.tasks.md:

tasks:db (2 tasks)
  [TODO] 1.1 - Define database schema for dashboard data
  [TODO] 1.2 - Create database migration for dashboard tables

tasks:api (4 tasks)
  [TODO] 1.3 - Build dashboard API endpoints
  [IN PROGRESS] 1.4 - Implement dashboard service logic
  [TODO] 1.5 - Add API validation middleware
  [TODO] 1.6 - Create API documentation

tasks:web (3 tasks)
  [TODO] 1.7 - Create Redux store slice for dashboards
  [TODO] 1.8 - Design Dashboard UI component
  [COMPLETED] 1.9 - Create Dashboard page

Total: 9 tasks (6 todo, 1 in progress, 2 completed)
```

**Get output:**
```
Task: 1.3 - Build dashboard API endpoints

Title: Build dashboard API endpoints
Type: endpoint
Project: apps/api
Status: todo
Depends on: [1.2]

Description:
Implement RESTful endpoints for fetching, creating, updating, and
deleting dashboards and associated data.

Deliverables:
  - GET /dashboards: List all dashboards with pagination
  - GET /dashboards/{id}: Retrieve dashboard details
  - POST /dashboards: Create new dashboard
  - PUT /dashboards/{id}: Update dashboard
  - DELETE /dashboards/{id}: Delete dashboard

Requirements:
  - Validate incoming data according to schema
  - Support filtering by owner, date, team
  - Return formatted data for frontend
  - Handle errors with consistent responses
  - Ensure authorized access only
```

---

## Implementation Mapping

### Slash Command: `/tasks:create`

**Location:** `.claude/commands/planning/tasks-create.md`

**User Invocations:**
```bash
/tasks:create dashboard                    # Create from scratch
/tasks:create --prd=ai/docs/prds/dashboard-prd.md  # Use existing PRD
/tasks:create --research dashboard         # Start with research
```

**Command Responsibilities:**
1. Parse user input (feature name, flags)
2. Check for existing PRD or gather requirements
3. Optionally invoke research-writer for preliminary research
4. Invoke prd-writer (if PRD not provided)
5. Present PRD to user for approval
6. Invoke task-writer to create task document
7. Invoke task-validator to validate tasks
8. Iterate task-writer ↔ task-validator until pass (max 3 iterations)
9. Present final task document with summary
10. Provide CLI usage instructions

**Command Does NOT:**
- Parse YAML (delegates to CLI tool)
- Execute tasks (for orchestrators to consume)
- Directly modify files (delegates to sub-agents)

**Orchestration Flow:**
```markdown
/tasks:create invoked
  ↓
Parse input, check for PRD
  ↓
If --research flag:
  Task(sub_agent_type="research-writer", prompt=...)
  ↓ ← Receives research document
  ↓
If no PRD:
  AskUserQuestions → Gather requirements
  Task(sub_agent_type="prd-writer", prompt=...)
  ↓ ← Receives PRD document
  ↓
User reviews PRD → Approval
  ↓
Task(sub_agent_type="task-writer", prompt=...)
  ↓ ← Receives task document
  ↓
Iteration loop (max 3):
  Task(sub_agent_type="task-validator", prompt=...)
  ↓ ← Receives validation report
  ↓
  If PASS → Exit loop
  If FAIL:
    Task(sub_agent_type="task-writer", prompt="Update based on: [issues]...")
    ↓ ← Receives updated task document
    Continue loop
  ↓
Present final task document
  ↓
Show CLI usage instructions
  ↓
Complete
```

---

### CLI Tool Implementation

**Location:** `tools/src/tasks/` or `scripts/tasks/`

**Technology:** TypeScript (Node.js) or Python

**Dependencies:**
- YAML parser (js-yaml or PyYAML)
- CLI framework (Commander.js or Click)
- File system operations
- Pattern matching (glob)

**Architecture:**
```
tasks/
├── cli.ts               # Main CLI entry point
├── parser.ts            # YAML parsing and validation
├── actions.ts           # Action implementations (list, start, etc.)
├── discovery.ts         # Document discovery and scoping
├── formatter.ts         # Output formatting
└── types.ts             # TypeScript types for task structure
```

**Key Functions:**
- `discoverDocuments(scope)`: Find task documents based on scope
- `parseTaskDocument(path)`: Parse YAML frontmatter and task blocks
- `filterTasks(tasks, filters)`: Apply filtering criteria
- `updateTaskStatus(taskId, status, doc)`: Update and save
- `addTask(taskData, listName, doc)`: Insert new task
- `validateDocument(doc)`: Check YAML structure

---

## Testing & Validation

### Test Scenarios

**1. Complete Workflow (Happy Path)**
- **Input:** `/tasks:create dashboard` without PRD
- **Expected:** Research (if requested) → PRD created → Tasks created → Validation passes → Final document
- **Validation:** Task document has all PRD requirements, valid structure, passes validation

**2. Existing PRD Workflow**
- **Input:** `/tasks:create --prd=ai/docs/prds/existing.prd.md`
- **Expected:** Skip PRD creation → Tasks created → Validation passes
- **Validation:** Tasks accurately reflect existing PRD requirements

**3. Validation Iteration**
- **Input:** `/tasks:create complex-feature` (intentionally vague)
- **Expected:** Tasks created → Validation fails → Task-writer updates → Validation passes (after 2 iterations)
- **Validation:** Final document better than initial attempt, validation issues resolved

**4. CLI List with Filtering**
- **Input:** `tasks list --doc=dashboard --status=todo --list=api`
- **Expected:** Only todo tasks from api task list displayed
- **Validation:** Output matches filter criteria exactly

**5. CLI Status Update**
- **Input:** `tasks start 1.3 --doc=dashboard`
- **Expected:** Task 1.3 status updated to "in progress", document saved
- **Validation:** Document still valid YAML, only status changed

**6. CLI Document Discovery (Partial Path)**
- **Input:** `tasks list --doc=auth/v1`
- **Expected:** Finds `**/auth/v1.tasks.md`, lists tasks
- **Validation:** Correct document found even with partial path

**7. Validation Failure After Max Iterations**
- **Input:** `/tasks:create` with PRD missing critical details
- **Expected:** 3 iterations → Still fails → Present best attempt
- **Validation:** User notified, can accept or manually edit

**8. CLI Interactive Selection**
- **Input:** `tasks list` (no --doc flag)
- **Expected:** Discovers all task documents, presents menu, user selects
- **Validation:** Correct document loaded after selection

---

## Document Format Example

### Complete `*.tasks.md` File

```markdown
---
title: Dashboard
description: This is the dashboard feature tasks document.
source: ai/docs/prds/dashboard-prd.md
---

# Dashboard Feature Tasks

This document tracks all tasks for implementing the Dashboard feature based on the PRD.

## Database Tasks

```yaml tasks:db
tasks:
  - id: 1.1
    title: Define database schema for dashboard data
    type: database-schema
    project: apps/api
    description: Design and document the database schema to support dashboard entities, metrics, filters, and widgets.
    deliverables:
      - CREATE TABLE `dashboards` with fields for id, name, owner_id, created_at, updated_at, visibility
      - CREATE TABLE `widgets` with fields for id, dashboard_id (FK), type, config, position
      - CREATE TABLE `dashboard_metrics` with fields for id, dashboard_id (FK), metric_name, value_type, description
      - CREATE TABLE `dashboard_filters` with fields for id, dashboard_id (FK), filter_type, filter_value
      - UPDATE TABLE `users` to add dashboard ownership fields
      - Data migration steps as needed
    requirements:
      - Enable flexible analytics across multiple metrics and dimensions
      - Efficiently store time series data for user and usage events
      - Support aggregation queries (sum, avg, count, min, max)
      - Enable tracking and filtering by user segments and cohorts
      - Store widget and dashboard configuration metadata
      - Ensure historical data integrity with immutable records
      - Optimize for fast read queries for dashboard loading
      - Include indices on frequently queried fields (date, user_id, metric)
      - Be compatible with analytics tools (BI tools, ETL jobs)
      - Follow data privacy regulations (GDPR, CCPA)
    status: todo

  - id: 1.2
    title: Create database migration for dashboard tables
    type: database-migration
    project: apps/api
    description: Write migration scripts to create necessary tables and indexes for dashboards.
    deliverables:
      - Migration file for dashboards table
      - Migration file for widgets table
      - Migration file for dashboard_metrics table
      - Migration file for dashboard_filters table
      - Migration file for users table updates
      - Rollback scripts for all migrations
    requirements:
      - Migrations must be idempotent (can run multiple times safely)
      - Include proper foreign key constraints
      - Add appropriate indexes for performance
      - Support both up and down migrations
      - Test migrations on staging database
    status: todo
    depends_on: [1.1]
```

## API Tasks

```yaml tasks:api
tasks:
  - id: 1.3
    title: Build dashboard API endpoints
    type: endpoint
    project: apps/api
    description: Implement RESTful endpoints for fetching, creating, updating, and deleting dashboards and associated data.
    deliverables:
      - GET /dashboards - List all dashboards with pagination, filtering, search
      - GET /dashboards/{id} - Retrieve dashboard details with widgets and config
      - POST /dashboards - Create new dashboard with validated schema
      - PUT /dashboards/{id} - Update dashboard metadata, widgets, layout
      - DELETE /dashboards/{id} - Delete dashboard with cascading removal
    requirements:
      - Validate incoming data according to predefined schema
      - Support filtering dashboards by owner, creation date, team
      - Return dashboard data formatted for frontend consumption
      - Handle error cases with clear, consistent error responses
      - Ensure only authorized users can create, update, or delete dashboards
      - Efficiently query database using appropriate indexes
    status: todo
    depends_on: [1.2]

  - id: 1.4
    title: Implement dashboard service logic
    type: service
    project: apps/api
    description: Develop service layer functions for processing dashboard data and business logic.
    deliverables:
      - DashboardService class with CRUD methods
      - Widget management service functions
      - Metrics aggregation service
      - Filter processing service
      - Permission checking service
    requirements:
      - Separate business logic from controller layer
      - Implement data validation and sanitization
      - Handle edge cases and error scenarios
      - Support transactions for multi-step operations
      - Maintain consistent data state
    status: todo
    depends_on: [1.3]
```

## Web Tasks

```yaml tasks:web
tasks:
  - id: 1.5
    title: Create Redux store slice for dashboards
    type: store
    project: apps/web
    description: Define Redux store slice, actions, and reducers to manage dashboard state on the frontend.
    deliverables:
      - dashboardSlice with initial state definition
      - Actions: fetchDashboards, createDashboard, updateDashboard, deleteDashboard
      - Reducers for all actions
      - Selectors: selectDashboards, selectDashboardById, selectLoading, selectError
      - Async thunks for API integration
    requirements:
      - Follow Redux Toolkit patterns
      - Handle loading and error states
      - Normalize dashboard data for efficient access
      - Support optimistic updates for better UX
    status: todo

  - id: 1.6
    title: Design Dashboard UI component
    type: ui-component
    project: apps/web
    description: Build a reusable React component to display dashboard, including charts, tables, and widgets.
    deliverables:
      - Dashboard component with props interface
      - Widget rendering logic for different widget types
      - Responsive grid layout for widgets
      - Loading and error states UI
      - Empty state UI when no widgets
    requirements:
      - Component should be responsive (mobile, tablet, desktop)
      - Support drag-and-drop widget rearrangement
      - Render charts using chart library (Chart.js or Recharts)
      - Follow design system styling
      - Accessible (WCAG 2.1 AA)
    status: todo
    depends_on: [1.5]

  - id: 1.7
    title: Create Dashboard page
    type: page
    project: apps/web
    description: Implement the main page that renders the dashboard component and handles route integration.
    deliverables:
      - DashboardPage component
      - Route configuration in app router
      - Page-level data fetching
      - Page metadata (title, description)
    requirements:
      - Fetch dashboard data on page load
      - Handle authentication (redirect if not logged in)
      - Show loading state while fetching
      - Handle error states gracefully
    status: todo
    depends_on: [1.6]

  - id: 1.8
    title: Integrate API calls with UI
    type: integration
    project: apps/web
    description: Connect dashboard UI components and Redux store with backend API endpoints for real data flow.
    deliverables:
      - API client functions for all dashboard endpoints
      - Redux thunks calling API client
      - Error handling and retry logic
      - Request caching strategy
    requirements:
      - Use existing API client infrastructure
      - Handle authentication tokens
      - Implement request cancellation for unmounted components
      - Show user-friendly error messages
    status: todo
    depends_on: [1.3, 1.5, 1.6]
```

## Test Tasks

```yaml tasks:test
tasks:
  - id: 1.9
    title: Write basic unit and integration tests
    type: test
    project: apps/api
    description: Create test cases for backend endpoints, service layer, and frontend dashboard components.
    deliverables:
      - Unit tests for DashboardService (80%+ coverage)
      - Integration tests for API endpoints
      - Unit tests for Redux slice (actions, reducers, selectors)
      - Component tests for Dashboard UI
      - E2E tests for critical user flows
    requirements:
      - Tests should be fast and reliable
      - Use appropriate test libraries (Jest, React Testing Library)
      - Mock external dependencies
      - Test edge cases and error scenarios
      - Achieve >80% code coverage
    status: todo
    depends_on: [1.3, 1.4, 1.6]
```

## Documentation Tasks

```yaml tasks:doc
tasks:
  - id: 1.10
    title: Document Dashboard feature
    type: documentation
    project: docs/features
    description: Write user and developer documentation for dashboard usage and development.
    deliverables:
      - User guide: How to create and customize dashboards
      - Developer guide: Dashboard architecture and components
      - API documentation: Dashboard endpoints reference
      - Component documentation: Dashboard UI component API
    requirements:
      - Documentation should be clear and comprehensive
      - Include screenshots and examples
      - Keep documentation in sync with implementation
      - Follow documentation standards
    status: todo
    depends_on: [1.7, 1.8]
```

---

## Open Questions

- [ ] Should CLI tool be implemented as MCP server tool or standalone npm script?
- [ ] How to handle task document merge conflicts in version control (multiple users editing)?
- [ ] Should task-validator have configurable strictness levels (strict/moderate/lenient)?
- [ ] Do we need task templates for common task types (endpoint, ui-component, etc.)?
- [ ] Should CLI support batch operations (update multiple task statuses at once)?
- [ ] How to handle task renumbering when tasks are added/deleted mid-document?
- [ ] Should we support task comments or notes (beyond description field)?

---

## Future Enhancements

- Task templates for common task types (reduce boilerplate when adding tasks)
- Task time tracking (actual time spent vs. estimated)
- Automatic dependency graph visualization (generate diagrams from depends_on)
- Task assignment to specific agents or team members
- Integration with git commits (link commits to task IDs)
- Task analytics (completion rates, bottlenecks, velocity metrics)
- Export to external formats (JSON, CSV, project management tools)
- Watch mode for CLI (auto-refresh task list when document changes)
- Task commenting system (discussion threads on tasks)
- Task history tracking (see who changed what and when)

---

## References

- [Agent PRD Guidelines](../../ai/agents/AGENT_PRD_GUIDELINES.md)
- [Subagent Guidelines](../../ai/claude/agents/SUBAGENT_GUIDELINES.md)
- [Subagent Template](../../ai/claude/agents/SUBAGENT_TEMPLATE.md)
- [Model Selection Guide](../../ai/claude/MODEL_GUIDELINES.md)
- [Slash Command Guidelines](../../ai/claude/commands/SLASH_COMMAND_GUIDELINES.md)
- [Todo Writer Agent](./.claude/agents/planning/todo-writer.md) (to be renamed to task-writer)

---

**End of PRD**
