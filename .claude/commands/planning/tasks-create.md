---
description: Create comprehensive task documents from PRDs with automated validation and iterative refinement
allowed-tools: Task, AskUserQuestion, Read
model: claude-sonnet-4-5
---

# /tasks:create

Create comprehensive task documents (*.tasks.md) from PRD specifications through an orchestrated workflow: research (optional) → PRD creation → task generation → validation → iterative refinement.

## Objective

Orchestrate the complete task document creation workflow by delegating to specialized subagents (research-writer, prd-writer, task-writer, task-validator) while maintaining quality standards through validation loops. Produce validated, executable task documents ready for CLI management and team execution.

## Context & Prerequisites

**Task Document System:**
- Format: `*.tasks.md` files with YAML frontmatter and YAML task blocks
- Location: `ai/docs/tasks/`
- Structure: Organized by task lists (db, api, web, test, doc)
- CLI Tool: Managed via `node tools/dist/cli/main.js tasks <command>`
- Format Specification: `ai/docs/specifications/task-document-format.md`

**Specialized Subagents:**
- `research-writer`: Conducts preliminary research before PRD creation
- `prd-writer`: Creates product requirement documents
- `task-writer`: Generates structured task documents from PRDs
- `task-validator`: Validates task documents against PRD requirements

**Prerequisites:**
- Subagent definitions exist in `.claude/agents/planning/`
- Format specification exists at `ai/docs/specifications/task-document-format.md`
- CLI tool built at `tools/dist/cli/main.js`

## Instructions

### Phase 0: Requirements Gathering

**Objective:** Determine if PRD exists or gather requirements for creation

**Steps:**

1. **Check User Input**

   Determine what the user provided:
   - Full PRD path: `--prd=ai/docs/prds/feature-name-prd.md`
   - Feature name only: `dashboard` or `user-authentication`
   - Detailed requirements: prose description of feature

2. **Ask User About Approach**

   If no PRD path provided, use AskUserQuestion to determine approach:

   ```
   AskUserQuestion(
     questions: [
       {
         question: "How would you like to create the task document?",
         header: "Approach",
         multiSelect: false,
         options: [
           {
             label: "Use existing PRD",
             description: "I have a PRD file ready to use"
           },
           {
             label: "Create PRD from requirements",
             description: "I'll describe the feature and you create the PRD"
           },
           {
             label: "Research then create PRD",
             description: "Conduct preliminary research before creating PRD"
           }
         ]
       }
     ]
   )
   ```

3. **Handle User Choice**

   Based on user selection:
   - **Use existing PRD:** Ask for PRD path, skip to Phase 3
   - **Create PRD from requirements:** Gather requirements, proceed to Phase 2
   - **Research then create PRD:** Gather research topic, proceed to Phase 1

### Phase 1: Preliminary Research (Optional)

**Objective:** Conduct research to inform PRD creation

**Steps:**

1. **Invoke research-writer Subagent**

   ```
   Task(
     subagent_type="research-writer",
     description="Research {feature-name} feature",
     prompt="Conduct preliminary research on {feature-name}. Analyze existing codebase for related patterns, identify technical constraints, research best practices, and provide recommendations. Create research document at ai/docs/research/{feature-name}-research.md with findings that will inform PRD creation."
   )
   ```

2. **Wait for Research Completion**
   - Subagent will analyze codebase
   - Subagent will document findings and recommendations
   - Subagent will create research document

3. **Present Research Summary**

   Show user:
   ```
   ✅ Research Complete

   Research Document: ai/docs/research/{feature-name}-research.md

   Key Findings:
   - [Finding 1]
   - [Finding 2]
   - [Finding 3]

   Recommendations:
   - [Recommendation 1]
   - [Recommendation 2]
   ```

4. **Proceed to Phase 2**

### Phase 2: PRD Creation

**Objective:** Create or load PRD document

**Steps:**

1. **If Using Existing PRD:**

   Read and validate PRD file:
   ```
   Read(file_path="{user-provided-prd-path}")
   ```

   Verify PRD has:
   - Requirements section
   - User stories or acceptance criteria
   - Feature objectives

   Skip to Phase 3.

2. **If Creating New PRD:**

   Invoke prd-writer subagent:

   ```
   Task(
     subagent_type="prd-writer",
     description="Create PRD for {feature-name}",
     prompt="Create a comprehensive Product Requirement Document for {feature-name} based on the following requirements:

{user-provided-requirements}

{if research exists: 'Reference research findings from ai/docs/research/{feature-name}-research.md'}

Create PRD at ai/docs/prds/{feature-name}-prd.md following the standard PRD format. Include:
- Problem statement
- Goals and objectives
- User stories
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Technical considerations
- Out of scope items"
   )
   ```

3. **Wait for PRD Creation**
   - Subagent will create comprehensive PRD
   - PRD will be saved to ai/docs/prds/

4. **Present PRD Summary**

   ```
   ✅ PRD Created

   PRD Document: ai/docs/prds/{feature-name}-prd.md

   Summary:
   - Requirements: {count} functional, {count} non-functional
   - User Stories: {count}
   - Complexity: {Simple/Medium/Complex}
   - Estimated Effort: {timeline}
   ```

5. **Get User Approval**

   Ask user to review PRD:
   ```
   AskUserQuestion(
     questions: [
       {
         question: "Review the PRD and choose how to proceed:",
         header: "PRD Review",
         multiSelect: false,
         options: [
           {
             label: "Approve and continue",
             description: "PRD looks good, proceed with task document creation"
           },
           {
             label: "Edit PRD manually",
             description: "I'll make changes to the PRD before continuing"
           },
           {
             label: "Cancel",
             description: "Stop the process"
           }
         ]
       }
     ]
   )
   ```

   - If "Edit manually": Pause, inform user to edit PRD, then re-invoke command
   - If "Cancel": Exit gracefully
   - If "Approve": Proceed to Phase 3

### Phase 3: Task Document Creation

**Objective:** Generate task document from PRD

**Steps:**

1. **Invoke task-writer Subagent**

   ```
   Task(
     subagent_type="task-writer",
     description="Create task document for {feature-name}",
     prompt="Create a comprehensive task document for {feature-name} based on the PRD at {prd-path}.

Generate task document at ai/docs/tasks/{feature-name}.tasks.md following the task document format specification at ai/docs/specifications/task-document-format.md.

Requirements:
- Break down all PRD requirements into granular tasks (1-4 hours each)
- Organize tasks into logical task lists (db, api, web, test, doc)
- Specify concrete deliverables and requirements for each task
- Define task dependencies with depends_on field
- Assign appropriate task types
- Ensure all tasks have required fields: id, title, type, project, description, status

Create tasks for:
- Database schema and migrations (tasks:db)
- Backend API endpoints and services (tasks:api)
- Frontend components and pages (tasks:web)
- Test cases (tasks:test)
- Documentation (tasks:doc)"
   )
   ```

2. **Wait for Task Document Creation**
   - Subagent will analyze PRD
   - Subagent will create structured task document
   - Task document saved to ai/docs/tasks/

3. **Present Task Document Summary**

   ```
   ✅ Task Document Created

   File: ai/docs/tasks/{feature-name}.tasks.md

   Summary:
   - Total Tasks: {count}
   - Task Lists: {lists}
   - Source PRD: {prd-path}
   ```

4. **Proceed to Phase 4**

### Phase 4: Validation Loop

**Objective:** Validate and iteratively refine task document

**Steps:**

1. **Initialize Validation Loop**

   Set iteration counter: `iteration = 1`
   Set max iterations: `max_iterations = 3`

2. **Invoke task-validator Subagent**

   ```
   Task(
     subagent_type="task-validator",
     description="Validate task document (iteration {iteration})",
     prompt="Validate the task document at ai/docs/tasks/{feature-name}.tasks.md against its source PRD.

Perform comprehensive validation:

1. Structural Validation
   - YAML frontmatter complete
   - All tasks have required fields
   - YAML syntax valid

2. PRD Coverage Validation
   - All PRD requirements covered by tasks
   - No orphaned requirements

3. Dependency Validation
   - No circular dependencies
   - All depends_on references valid
   - Logical dependency order

4. Task Quality Validation
   - Tasks are granular (1-4 hours)
   - Deliverables specific
   - Requirements clear

5. Completeness Validation
   - Test tasks exist
   - Documentation tasks exist
   - Error handling addressed

Provide detailed validation report with:
- Pass/Fail status
- List of errors (severity: error)
- List of warnings (severity: warning)
- Specific recommendations for fixes
- PRD coverage percentage

Format as structured validation report."
   )
   ```

3. **Parse Validation Results**

   Expect validation report with:
   - Overall status: PASS or FAIL
   - Error count
   - Warning count
   - Specific issues with task IDs
   - Recommendations

4. **If Validation PASSES:**

   ```
   ✅ Validation Passed (iteration {iteration}/{max_iterations})

   Task Document: ai/docs/tasks/{feature-name}.tasks.md
   - {task-count} tasks across {list-count} task lists
   - {coverage}% PRD requirements covered
   - 0 errors, {warning-count} warnings

   The task document is ready for execution!
   ```

   Proceed to Phase 5.

5. **If Validation FAILS:**

   ```
   ❌ Validation Failed (iteration {iteration}/{max_iterations})

   Issues Found:
   - {error-count} errors
   - {warning-count} warnings

   Top Issues:
   1. {issue-1}
   2. {issue-2}
   3. {issue-3}

   Refining task document based on validation feedback...
   ```

   If `iteration < max_iterations`:
     - Increment iteration counter
     - Invoke task-writer with validation feedback (Step 6)
     - Repeat validation (Step 2)

   If `iteration >= max_iterations`:
     - Validation failed after max attempts
     - Present best attempt to user (Step 7)

6. **Refine Task Document Based on Validation**

   ```
   Task(
     subagent_type="task-writer",
     description="Refine task document based on validation feedback",
     prompt="Update the task document at ai/docs/tasks/{feature-name}.tasks.md to address the following validation issues:

{validation-issues}

Specific fixes required:
- {issue-1-fix}
- {issue-2-fix}
- {issue-3-fix}

Maintain the existing task structure while addressing these issues. Ensure:
- All PRD requirements are covered
- Dependencies are valid (no circular refs)
- Tasks have specific deliverables
- YAML syntax is correct

Update the task document in place."
   )
   ```

   After refinement, repeat validation (return to Step 2).

7. **Handle Max Iterations Exceeded**

   ```
   ⚠️  Validation did not pass after {max_iterations} iterations.

   Best attempt saved at: ai/docs/tasks/{feature-name}.tasks.md

   Remaining issues:
   - {issue-1}
   - {issue-2}

   Recommendations:
   1. Review task document manually
   2. Address remaining issues
   3. Run CLI validation: node tools/dist/cli/main.js tasks validate --doc={feature-name}
   ```

   Ask user how to proceed:
   ```
   AskUserQuestion(
     questions: [
       {
         question: "Validation did not pass. How would you like to proceed?",
         header: "Next Steps",
         multiSelect: false,
         options: [
           {
             label: "Accept best attempt",
             description: "Use the task document as-is and fix issues manually"
           },
           {
             label: "Cancel",
             description: "Discard the task document"
           }
         ]
       }
     ]
   )
   ```

   - If "Accept": Proceed to Phase 5 with warnings
   - If "Cancel": Exit gracefully

### Phase 5: Finalization

**Objective:** Present final task document and usage instructions

**Steps:**

1. **Run CLI Validation**

   Verify task document is parseable by CLI:
   ```
   Bash(
     command="node tools/dist/cli/main.js tasks validate --doc={feature-name}",
     description="Validate task document with CLI tool"
   )
   ```

2. **Present Final Summary**

   ```
   ✅ Task Document Complete

   **File:** ai/docs/tasks/{feature-name}.tasks.md

   **Summary:**
   - Total Tasks: {count}
   - Task Lists: {db, api, web, test, doc}
   - Source PRD: {prd-path}
   - Validation Status: ✅ PASSED

   **Task Breakdown:**
   - tasks:db: {count} tasks (database schema and migrations)
   - tasks:api: {count} tasks (backend endpoints and services)
   - tasks:web: {count} tasks (frontend components and pages)
   - tasks:test: {count} tasks (test cases)
   - tasks:doc: {count} tasks (documentation)

   **Dependencies:**
   - Critical path: {task-chain}
   - Parallel opportunities: {count} tasks can run concurrently

   **Next Steps:**

   1. View all tasks:
      ```
      node tools/dist/cli/main.js tasks list --doc={feature-name}
      ```

   2. View specific task details:
      ```
      node tools/dist/cli/main.js tasks get 1.1 --doc={feature-name}
      ```

   3. Start working on a task:
      ```
      node tools/dist/cli/main.js tasks start 1.1 --doc={feature-name}
      ```

   4. Mark task as complete:
      ```
      node tools/dist/cli/main.js tasks complete 1.1 --doc={feature-name}
      ```

   5. Track progress:
      ```
      node tools/dist/cli/main.js tasks list --doc={feature-name} --status="in progress"
      ```

   **Workflow Created:**
   {if research exists: '✅ Research: ai/docs/research/{feature-name}-research.md'}
   ✅ PRD: {prd-path}
   ✅ Tasks: ai/docs/tasks/{feature-name}.tasks.md

   Your team can now begin execution using the tasks CLI tool!
   ```

3. **Store Task Document Path**

   For future reference, the task document is at:
   `ai/docs/tasks/{feature-name}.tasks.md`

## Error Handling

### When Blocked

**PRD Issues:**
- PRD file not found → Ask user to verify path
- PRD missing requirements → Ask user to complete PRD
- PRD format invalid → Suggest using prd-writer to fix

**Validation Never Passes:**
- After 3 iterations → Present best attempt
- Give user choice to accept or cancel
- Provide manual fix recommendations

**CLI Tool Issues:**
- CLI validation fails → Show error output
- Suggest checking YAML syntax
- Offer to re-run task-writer with strict validation

### When Uncertain

**Scope Questions:**
- Present options to user via AskUserQuestion
- Explain trade-offs of each approach
- Document chosen approach in task document

**Technical Approach:**
- If multiple valid approaches → Present options
- Recommend preferred approach with rationale
- Let user decide on implementation strategy

## Quality Checks

Before finalizing, verify:
- [ ] Task document exists at correct location
- [ ] YAML frontmatter complete (title, description, source)
- [ ] All task lists properly formatted
- [ ] CLI validation passes
- [ ] No circular dependencies
- [ ] All PRD requirements covered
- [ ] Test and documentation tasks included
- [ ] File committed to git (if autoCommit enabled)

## Success Metrics

- Complete workflow executed (research → PRD → tasks → validation)
- Task document validates successfully (or user accepts best attempt)
- All PRD requirements translated to tasks
- Task document is CLI-compatible and parseable
- User can immediately begin work using CLI tool
- Clear next steps provided

---

**Command Version:** 1.0
**Last Updated:** 2025-10-21
**Owner:** Platform Engineering
