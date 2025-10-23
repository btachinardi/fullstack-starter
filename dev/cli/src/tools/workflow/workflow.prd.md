# PRD: Workflow Orchestration System

**Author:** PRD Writer Agent
**Date:** 2025-10-23
**Status:** Draft
**Version:** 1.0

## Executive Summary

Implement an intelligent workflow orchestration system that enables both main agents and end users to create, manage, and execute multi-step agent pipelines with logical gates, conditional branching, loops, and intelligent tool selection. This system addresses the gap between high-level user requests ("continue work on X") and the systematic execution required to complete complex, multi-phase development tasks.

**Impact:** Transforms vague continuation requests into structured, resumable workflows with proper error handling, state management, and progress tracking. Expected to reduce agent decision overhead by 60% and enable 100% resumability across session interruptions.

---

## Problem Statement

Current agent workflows suffer from several critical limitations:

**1. No Structured Continuation Pattern**

When users request "continue work on X," agents must:
- Manually search for task documents or PRDs
- Determine next steps without workflow context
- Re-analyze state that was previously known
- Repeat the same decision-making process each time

This results in:
- Inconsistent execution patterns across agents
- Lost context between sessions
- High cognitive overhead for simple continuation requests
- No clear progress tracking or resumability

**2. Lack of Workflow State Management**

Current implementations have no way to:
- Persist multi-step workflows across sessions
- Resume workflows after interruption
- Track which steps have been completed
- Handle conditional logic and loops programmatically
- Store workflow variables and intermediate results

**3. Manual Task Orchestration**

Agents must manually orchestrate complex workflows:
- Search for specialized slash commands
- Determine optimal tool selection
- Handle error recovery without guidance
- Manage dependencies between steps
- Track progress through mental models only

**4. No Workflow Reusability**

Common patterns like "PRD → tasks → implementation → validation → commit" must be:
- Re-planned for every similar request
- Manually orchestrated each time
- Implemented differently by different agents
- Cannot be templatized or reused

---

## Goals & Objectives

**Primary Goals:**

1. Enable structured, resumable workflows for complex multi-step tasks
2. Reduce agent cognitive overhead from planning to execution
3. Provide intelligent workflow planning based on project state
4. Enable workflow persistence across session interruptions
5. Support conditional logic, loops, and error handling in workflows

**Success Metrics:**

- Workflow continuation requests execute in < 10 seconds (vs. 60+ seconds manual)
- 100% workflow resumability after session restart
- Zero lost context when resuming workflows
- 80% reduction in agent decision-making overhead for continuation requests
- 90% of common patterns templatized in workflow-planner

**Non-Goals (Out of Scope):**

- Visual workflow editors or graphical interfaces
- Workflow version control beyond basic file state
- Real-time collaboration on workflows
- Workflow sharing across projects
- Complex DAG execution engines (keep simple, linear with conditional branches)

---

## User Stories

### For Main Agents (Primary Users)

**US-1: Workflow Creation from User Request**

**As a** main agent
**I want to** delegate workflow planning to the workflow-planner subagent
**So that** I can immediately execute structured workflows instead of manual planning

**Acceptance Criteria:**

- Main agent can invoke `Task(workflow-planner, "USER: continue work on X")`
- workflow-planner analyzes project state and returns workflow ID
- workflow-planner checks for specialized slash commands first
- workflow-planner creates custom workflows when no command exists
- Workflow includes specific tools, subagents, and logical gates
- Main agent receives workflow ID and execution instructions

**US-2: Workflow Step Execution**

**As a** main agent
**I want to** execute workflow steps one at a time using CLI tool
**So that** I can follow a structured execution path with clear instructions

**Acceptance Criteria:**

- Agent can run `pnpm tools workflow next <workflow-id>`
- Tool returns clear, actionable instruction for current step
- Tool handles step types: actions, conditionals, loops, variables
- Tool tracks step completion state automatically
- Tool provides next step after current completes
- Tool indicates when workflow is complete

**US-3: Conditional Workflow Logic**

**As a** main agent
**I want to** handle conditional branches and loops in workflows
**So that** I can adapt execution based on runtime conditions

**Acceptance Criteria:**

- Workflow supports "if file not found, go to Step X" logic
- Workflow supports "if validation failed, retry Step Y" logic
- Agent provides answers to conditional questions via `--answer` flag
- Tool evaluates conditions and determines next step
- Loops execute until exit condition met
- Workflow tracks loop iterations

**US-4: Workflow State Persistence**

**As a** main agent
**I want to** resume workflows after session interruption
**So that** I can continue from where I left off without losing progress

**Acceptance Criteria:**

- Workflow state persists to `.claude/workflows/<id>.json`
- State includes completed steps, current step, variables
- Agent can resume workflow in new session using same workflow ID
- `workflow next` resumes from last incomplete step
- No duplicate step execution after resume
- Workflow state survives system restart

**US-5: Error Handling and Recovery**

**As a** main agent
**I want to** handle failures gracefully with retry logic
**So that** I can recover from errors without manual intervention

**Acceptance Criteria:**

- Workflow includes fallback steps for common failures
- Agent can retry failed steps using workflow guidance
- Workflow redirects to error analysis subagents when needed
- Agent receives recovery instructions from workflow
- Failed workflows can be resumed after fixes applied
- Workflow logs error context for debugging

### For End Users (Secondary Users)

**US-6: User-Initiated Workflow Management**

**As a** developer/user
**I want to** manage workflows via `/workflow` slash command
**So that** I can create, monitor, and control workflows from chat

**Acceptance Criteria:**

- User can run `/workflow plan <request>` to create workflow
- User can run `/workflow status` to see active workflows
- User can run `/workflow continue <id>` to resume workflow
- User can run `/workflow cancel <id>` to stop workflow
- User receives clear workflow summaries and progress updates
- User can see which step is currently executing

**US-7: Workflow Progress Visibility**

**As a** developer/user
**I want to** see workflow progress and status
**So that** I can understand what's being executed and track completion

**Acceptance Criteria:**

- User sees workflow step breakdown on creation
- User sees current step indicator during execution
- User sees completed vs. remaining steps in status
- User receives notifications on step completion
- User sees estimated time remaining (optional)
- User receives final success/failure report

---

## Requirements

### Functional Requirements

#### FR-1: Workflow Planning (workflow-planner Subagent)

**FR-1.1: Intelligent Workflow Creation**

- Analyze user requests to determine intent and requirements
- Check for existing specialized slash commands first (e.g., `/dev:continue`)
- Design custom workflows when no matching command exists
- Include specific tool names, subagent types, and CLI commands
- Define logical gates, loops, and error handling
- Return workflow creation command + execution instructions

**FR-1.2: Project State Analysis**

- Search for task documents (`.tasks.md`) in `ai/docs/tasks/`
- Search for PRD documents (`.prd.md`) in `ai/docs/prds/`
- Detect project structure and available tools
- Identify available subagents from `.claude/agents/`
- Determine current task progress and status
- Recommend appropriate delegation strategies

**FR-1.3: Workflow Step Design**

- Create action steps (run command, delegate to subagent)
- Create conditional steps (if/else branching)
- Create loop steps (repeat until condition)
- Create variable steps (store/retrieve state)
- Define step dependencies and execution order
- Include error handling and fallback logic

#### FR-2: Workflow CLI Tool

**FR-2.1: Workflow Creation**

- Command: `pnpm tools workflow create --name="<name>" --task="<description>" --step="<step>" ...`
- Generate unique workflow ID (e.g., "continue-work-x")
- Handle duplicate names by appending counter (e.g., "continue-work-x-2")
- Persist workflow to `.claude/workflows/<workflow-id>.json`
- Return workflow ID for execution
- Validate workflow structure before saving

**FR-2.2: Step Execution**

- Command: `pnpm tools workflow next <workflow-id> [--answer="yes|no"]`
- Load workflow state from disk
- Determine current step based on completion state
- Execute step logic based on step type
- Return actionable instruction to agent
- Update workflow state with step completion
- Persist updated state to disk

**FR-2.3: Workflow Status**

- Command: `pnpm tools workflow status <workflow-id>`
- Display workflow name and description
- Show total steps, completed steps, remaining steps
- Highlight current step with context
- Display stored variables and state
- Show execution history with timestamps
- Calculate progress percentage

**FR-2.4: Workflow Management**

- Command: `pnpm tools workflow list`
- List all active workflows with IDs
- Show workflow status (in progress, completed, failed)
- Display creation date and last updated time
- Show current step for in-progress workflows

- Command: `pnpm tools workflow delete <workflow-id>`
- Remove workflow state file
- Confirm deletion with user
- Clean up associated temporary files

#### FR-3: Step Type Support

**FR-3.1: Action Steps**

- Execute CLI commands (e.g., `pnpm tools tasks next -d X`)
- Delegate to subagents (e.g., `Task(root-cause-analyst)`)
- Run git operations (e.g., `/git:commit`)
- Execute validation pipelines
- Return execution results to workflow

**FR-3.2: Conditional Steps**

- Evaluate boolean conditions (file exists, validation passed)
- Branch to different steps based on condition
- Accept agent/user input via `--answer` flag
- Support if/else logic (if condition, go to Step X, else Step Y)
- Handle null/undefined condition values gracefully

**FR-3.3: Loop Steps**

- Define loop exit conditions
- Track loop iteration count
- Prevent infinite loops (max iterations limit)
- Jump to loop start step on iteration
- Exit loop when condition met
- Support "repeat until no tasks remain" pattern

**FR-3.4: Variable Steps**

- Store values from command outputs (e.g., task-id, file-path)
- Retrieve stored values in subsequent steps
- Support string interpolation in step instructions
- Persist variables in workflow state
- Clear variables on workflow completion

#### FR-4: /workflow Slash Command

**FR-4.1: Workflow Planning Interface**

- Command: `/workflow plan <request>`
- Invoke workflow-planner subagent with user request
- Receive workflow creation command from planner
- Execute workflow creation via CLI tool
- Return workflow ID and execution summary to user
- Display workflow step breakdown

**FR-4.2: Workflow Execution Interface**

- Command: `/workflow continue <workflow-id>`
- Resume workflow execution from current step
- Execute steps via `pnpm tools workflow next`
- Display step instructions to user
- Update user on step completion
- Report workflow completion or errors

**FR-4.3: Workflow Monitoring Interface**

- Command: `/workflow status [workflow-id]`
- Show status of specific workflow or all workflows
- Display progress indicators
- Show current step being executed
- Report any errors or blockers

**FR-4.4: Workflow Control Interface**

- Command: `/workflow cancel <workflow-id>`
- Stop workflow execution gracefully
- Save current state before cancellation
- Mark workflow as cancelled in state
- Provide cancellation confirmation

### Non-Functional Requirements

#### NFR-1: Performance

- Workflow creation completes in < 2 seconds
- Step execution overhead < 100ms (excluding step work itself)
- Workflow state read/write in < 50ms
- Support up to 100 concurrent workflows
- Support workflows with up to 50 steps

#### NFR-2: Reliability

- Workflow state persists atomically (no partial writes)
- State file corruption recoverable via validation
- Workflow resumption works 100% after interruption
- Tool failures don't corrupt workflow state
- State recovery possible from backup/history

#### NFR-3: Usability

- Step instructions are clear and actionable
- Error messages include recovery suggestions
- Workflow status output is human-readable
- Workflow IDs are memorable and unique
- CLI output follows existing tool conventions

#### NFR-4: Maintainability

- Workflow state uses standard JSON format
- Step types are extensible (new types can be added)
- Workflow files are human-readable and editable
- Logging includes workflow ID and step context
- Code follows vertical module structure (NestJS-like)

#### NFR-5: Observability

- Log all workflow state transitions
- Track step execution time
- Record workflow creation and completion times
- Log errors with workflow and step context
- Support structured logging for analysis

---

## Technical Specification

### Architecture Overview

**Components:**

1. **workflow-planner Subagent** - Strategic planning agent (`.claude/agents/planning/workflow-planner.md`)
2. **workflow CLI Tool** - State management and execution (`dev/cli/src/tools/workflow/`)
3. **/workflow Slash Command** - User interface (`.claude/commands/workflow/workflow.md`)

**Data Flow:**

```
User: "continue work on X"
    ↓
Main Agent → Task(workflow-planner, "USER: continue work on X")
    ↓
workflow-planner analyzes request
    ↓
workflow-planner returns workflow creation command
    ↓
Main Agent → pnpm tools workflow create --name="continue-work-x" --step="..." --step="..."
    ↓
CLI Tool creates workflow, returns ID
    ↓
Main Agent → pnpm tools workflow next <workflow-id>
    ↓
CLI Tool returns step instruction
    ↓
Main Agent executes instruction
    ↓
Main Agent → pnpm tools workflow next <workflow-id>
    ↓
... (repeat until workflow complete)
```

### Data Models

#### Workflow State Schema

```typescript
interface WorkflowState {
  /** Unique workflow identifier */
  id: string;

  /** Human-readable workflow name */
  name: string;

  /** Brief description of workflow purpose */
  task: string;

  /** Workflow execution status */
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

  /** Workflow creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Workflow completion timestamp (if completed) */
  completedAt?: string;

  /** Ordered list of workflow steps */
  steps: WorkflowStep[];

  /** Index of current step (0-based) */
  currentStepIndex: number;

  /** Stored variables from step executions */
  variables: Record<string, string>;

  /** Execution history log */
  executionHistory: ExecutionHistoryEntry[];
}

interface WorkflowStep {
  /** Step index (0-based) */
  index: number;

  /** Step type */
  type: 'action' | 'conditional' | 'loop' | 'variable';

  /** Step instruction or description */
  instruction: string;

  /** Conditional logic (for conditional steps) */
  condition?: {
    /** Condition expression (e.g., "file_exists", "validation_passed") */
    expression: string;

    /** Step index to jump to if condition true */
    ifTrue?: number;

    /** Step index to jump to if condition false */
    ifFalse?: number;
  };

  /** Loop logic (for loop steps) */
  loop?: {
    /** Step index to jump back to for next iteration */
    targetStepIndex: number;

    /** Exit condition expression */
    exitCondition: string;

    /** Maximum iterations allowed */
    maxIterations: number;

    /** Current iteration count */
    currentIteration: number;
  };

  /** Variable operations (for variable steps) */
  variable?: {
    /** Variable name to store/retrieve */
    name: string;

    /** Operation type */
    operation: 'store' | 'retrieve';

    /** Source for value (e.g., "command_output", "user_input") */
    source?: string;
  };

  /** Step completion status */
  completed: boolean;

  /** Step execution timestamp */
  executedAt?: string;

  /** Step result/output (optional) */
  result?: string;
}

interface ExecutionHistoryEntry {
  /** Timestamp of execution */
  timestamp: string;

  /** Step index executed */
  stepIndex: number;

  /** Execution result status */
  status: 'success' | 'failure' | 'skipped';

  /** Execution details or error message */
  message: string;
}
```

#### Workflow Creation Command Format

```typescript
interface CreateWorkflowCommand {
  /** Workflow name (kebab-case) */
  name: string;

  /** Task description */
  task: string;

  /** Array of step definitions */
  steps: string[];
}
```

**Step Definition Format:**

Each step is a string with format: `<type>: <instruction>`

**Examples:**

```bash
# Action step
"action: Run pnpm tools tasks next -d user-profile"

# Conditional step
"conditional: If file not found at ai/docs/tasks/user-profile.tasks.md, go to Step 2"

# Loop step
"loop: Go to Step 4 until no tasks remain"

# Variable step
"variable: Store task-id from command output"
```

### Component Specifications

#### workflow-planner Subagent

**File:** `.claude/agents/planning/workflow-planner.md`

**Responsibilities:**

1. Analyze user request to determine intent
2. Check for specialized slash commands (e.g., `/dev:continue [feature]`)
3. Design workflow with optimal tools and delegation
4. Generate workflow creation command
5. Provide execution instructions to main agent

**Input Format:**

```
USER: continue work on user authentication
```

**Output Format:**

```
WORKFLOW CREATED: continue-work-user-authentication

SUMMARY: Resume work on user authentication feature with task execution, validation, and commit workflow

EXECUTION INSTRUCTIONS:
- Use `pnpm tools workflow next continue-work-user-authentication` to execute each step
- Follow the returned instructions exactly
- Use --answer flag when prompted for decisions
- Workflow will complete when all steps executed

WORKFLOW STEPS:
1. Search for task document at ai/docs/tasks/user-authentication.tasks.md
2. If not found, search for PRD at ai/docs/prds/user-authentication.prd.md
3. If PRD found, delegate to prd-task-decomposer
4. Run pnpm tools tasks next -d user-authentication
5. Delegate to recommended subagent from task metadata
6. If task failed, delegate to root-cause-analyst then retry Step 5
7. Delegate to task-validator for validation
8. If validation failed, go to Step 5 with feedback
9. Run pnpm tools tasks complete <task-id> -d user-authentication
10. Run /git:commit
11. Go to Step 4 (loop until no tasks remain)

WORKFLOW CREATION COMMAND:
pnpm tools workflow create --name="continue-work-user-authentication" \
  --task="Resume work on user authentication feature" \
  --step="action: Search for ai/docs/tasks/user-authentication.tasks.md" \
  --step="conditional: If file not found, go to Step 3" \
  --step="action: Search for ai/docs/prds/user-authentication.prd.md" \
  --step="action: Run pnpm tools tasks next -d user-authentication" \
  --step="variable: Store task-id and recommended-agent from output" \
  --step="action: Delegate to ${recommended-agent} for task ${task-id}" \
  --step="conditional: If task failed, go to Step 8" \
  --step="action: Delegate to root-cause-analyst" \
  --step="loop: Go to Step 6 until task succeeds" \
  --step="action: Delegate to task-validator" \
  --step="conditional: If validation failed, go to Step 6 with feedback" \
  --step="action: Run pnpm tools tasks complete ${task-id} -d user-authentication" \
  --step="action: Run /git:commit" \
  --step="loop: Go to Step 4 until no TODO tasks remain"
```

**Agent Configuration:**

- Model: claude-sonnet-4-5 (strategic planning requires advanced reasoning)
- Tools: Read, Grep, Glob (for project state analysis)
- Auto-commit: false (read-only analysis)

#### workflow CLI Tool

**Module Structure:**

```
dev/cli/src/tools/workflow/
├── workflow.types.ts      # Type definitions
├── workflow.service.ts    # Business logic
├── workflow.spec.ts       # Tests
└── index.ts              # Barrel export
```

**Core Functions:**

```typescript
/**
 * Create new workflow with steps
 */
export async function createWorkflow(options: {
  name: string;
  task: string;
  steps: string[];
}): Promise<{ workflowId: string; filePath: string }>;

/**
 * Execute next step in workflow
 */
export async function executeNextStep(
  workflowId: string,
  answer?: 'yes' | 'no'
): Promise<{
  instruction: string;
  stepIndex: number;
  completed: boolean;
  nextStep?: string;
}>;

/**
 * Get workflow status
 */
export async function getWorkflowStatus(
  workflowId: string
): Promise<{
  workflow: WorkflowState;
  progress: {
    totalSteps: number;
    completedSteps: number;
    percentageComplete: number;
  };
}>;

/**
 * List all workflows
 */
export async function listWorkflows(): Promise<{
  workflows: Array<{
    id: string;
    name: string;
    status: WorkflowState['status'];
    progress: number;
    createdAt: string;
    updatedAt: string;
  }>;
}>;

/**
 * Delete workflow
 */
export async function deleteWorkflow(
  workflowId: string
): Promise<{ success: boolean; message: string }>;

/**
 * Parse step definition string into WorkflowStep
 */
function parseStepDefinition(
  stepDefinition: string,
  index: number
): WorkflowStep;

/**
 * Evaluate conditional expression
 */
function evaluateCondition(
  expression: string,
  variables: Record<string, string>,
  answer?: 'yes' | 'no'
): boolean;

/**
 * Determine next step based on current step and execution result
 */
function determineNextStep(
  workflow: WorkflowState,
  currentStepIndex: number,
  answer?: 'yes' | 'no'
): number | null;
```

**CLI Commands:**

```typescript
// Command registration in dev/cli/src/cli/main.ts
program
  .command('workflow')
  .description('Manage workflows')
  .addCommand(
    new Command('create')
      .description('Create new workflow')
      .requiredOption('--name <name>', 'Workflow name')
      .requiredOption('--task <description>', 'Task description')
      .option('--step <step>', 'Workflow step (can be repeated)', collectSteps, [])
      .action(createWorkflowCommand)
  )
  .addCommand(
    new Command('next')
      .description('Execute next workflow step')
      .argument('<workflow-id>', 'Workflow ID')
      .option('--answer <answer>', 'Answer to conditional (yes/no)')
      .action(nextStepCommand)
  )
  .addCommand(
    new Command('status')
      .description('Get workflow status')
      .argument('<workflow-id>', 'Workflow ID')
      .action(statusCommand)
  )
  .addCommand(
    new Command('list')
      .description('List all workflows')
      .action(listCommand)
  )
  .addCommand(
    new Command('delete')
      .description('Delete workflow')
      .argument('<workflow-id>', 'Workflow ID')
      .action(deleteCommand)
  );
```

#### /workflow Slash Command

**File:** `.claude/commands/workflow/workflow.md`

**Subcommands:**

- `/workflow plan <request>` - Create workflow via workflow-planner
- `/workflow continue <workflow-id>` - Resume workflow execution
- `/workflow status [workflow-id]` - Show workflow status
- `/workflow cancel <workflow-id>` - Cancel workflow

**Implementation Pattern:**

```markdown
## /workflow plan

**Objective:** Create workflow by delegating to workflow-planner subagent

**Steps:**

1. Invoke workflow-planner: `Task(workflow-planner, "USER: <request>")`
2. Receive workflow creation command from planner
3. Execute creation command: `pnpm tools workflow create ...`
4. Return workflow ID and summary to user
5. Display workflow steps for transparency

## /workflow continue

**Objective:** Resume workflow execution from current step

**Steps:**

1. Load workflow status: `pnpm tools workflow status <workflow-id>`
2. Display current step to user
3. Execute next step: `pnpm tools workflow next <workflow-id>`
4. Follow step instruction
5. Repeat until workflow complete or error
6. Report completion status to user
```

### Integration Points

#### 1. Task Management System

**Integration:**

- Read task documents via `pnpm tools tasks list --doc=<name>`
- Get next task via `pnpm tools tasks next -d <doc>`
- Complete tasks via `pnpm tools tasks complete <id> -d <doc>`
- Workflow embeds task IDs in variables
- Workflow loops until no TODO tasks remain

**Example Workflow Steps:**

```
1. action: Run pnpm tools tasks next -d user-profile
2. variable: Store task-id from output
3. action: Delegate to ${recommended-agent} for task ${task-id}
4. action: Run pnpm tools tasks complete ${task-id} -d user-profile
5. loop: Go to Step 1 until no TODO tasks
```

#### 2. Subagent System

**Integration:**

- Workflow delegates to subagents via `Task(subagent-type, prompt)`
- Workflow stores subagent recommendations in variables
- Error handling delegates to specialized agents (root-cause-analyst, test-debugger)
- Workflow-planner is itself a subagent

**Example Workflow Steps:**

```
1. action: Delegate to Task(test-writer, "Create tests for user profile feature")
2. conditional: If tests fail, go to Step 4
3. action: Complete step
4. action: Delegate to Task(test-debugger, "Fix failing tests")
5. loop: Go to Step 2 until tests pass
```

#### 3. Git Integration

**Integration:**

- Workflow runs `/git:commit` after task completion
- Workflow can check git status for clean state
- Workflow handles commit failures via retry logic

**Example Workflow Steps:**

```
1. action: Run pnpm tools tasks complete ${task-id}
2. action: Run /git:commit
3. conditional: If commit failed, go to Step 5
4. action: Proceed to next task
5. action: Delegate to commit-message-generator for retry
6. loop: Go to Step 2 until commit succeeds
```

#### 4. Validation Pipeline

**Integration:**

- Workflow runs `pnpm lint && pnpm typecheck && pnpm build && pnpm test`
- Workflow delegates to specialized debuggers on failure
- Workflow retries after fixes applied

**Example Workflow Steps:**

```
1. action: Run pnpm lint && pnpm typecheck && pnpm build && pnpm test
2. conditional: If validation failed, go to Step 4
3. action: Validation passed, continue
4. action: Delegate to Task(lint-debugger) or Task(test-debugger) based on failure
5. loop: Go to Step 1 until validation passes
```

### File Storage Structure

**Workflow State Files:**

```
.claude/
└── workflows/
    ├── continue-work-user-auth.json
    ├── continue-work-user-auth-2.json
    ├── fix-validation-errors.json
    └── implement-feature-x.json
```

**State File Example:**

```json
{
  "id": "continue-work-user-auth",
  "name": "Continue Work on User Auth",
  "task": "Resume work on user authentication feature",
  "status": "in_progress",
  "createdAt": "2025-10-23T10:30:00Z",
  "updatedAt": "2025-10-23T11:45:00Z",
  "steps": [
    {
      "index": 0,
      "type": "action",
      "instruction": "Search for ai/docs/tasks/user-auth.tasks.md",
      "completed": true,
      "executedAt": "2025-10-23T10:31:00Z",
      "result": "File found"
    },
    {
      "index": 1,
      "type": "action",
      "instruction": "Run pnpm tools tasks next -d user-auth",
      "completed": true,
      "executedAt": "2025-10-23T10:32:00Z",
      "result": "Task 1.3: Implement login endpoint"
    },
    {
      "index": 2,
      "type": "variable",
      "instruction": "Store task-id from output",
      "completed": true,
      "executedAt": "2025-10-23T10:32:30Z",
      "variable": {
        "name": "task-id",
        "operation": "store",
        "source": "command_output"
      }
    },
    {
      "index": 3,
      "type": "action",
      "instruction": "Delegate to code-writer for task ${task-id}",
      "completed": false
    }
  ],
  "currentStepIndex": 3,
  "variables": {
    "task-id": "1.3",
    "recommended-agent": "code-writer"
  },
  "executionHistory": [
    {
      "timestamp": "2025-10-23T10:31:00Z",
      "stepIndex": 0,
      "status": "success",
      "message": "Found task document"
    },
    {
      "timestamp": "2025-10-23T10:32:00Z",
      "stepIndex": 1,
      "status": "success",
      "message": "Retrieved next task: 1.3"
    },
    {
      "timestamp": "2025-10-23T10:32:30Z",
      "stepIndex": 2,
      "status": "success",
      "message": "Stored task-id=1.3"
    }
  ]
}
```

---

## Implementation Plan

### Phase 1: CLI Tool Foundation (3 days)

**Objective:** Build core workflow CLI tool with state management

**Tasks:**

- [ ] Create workflow module structure (`workflow.types.ts`, `workflow.service.ts`, `index.ts`)
- [ ] Define TypeScript interfaces for WorkflowState and WorkflowStep
- [ ] Implement `createWorkflow()` function with JSON persistence
- [ ] Implement workflow ID generation with duplicate handling
- [ ] Implement `getWorkflowStatus()` function
- [ ] Implement `listWorkflows()` function
- [ ] Implement `deleteWorkflow()` function
- [ ] Add CLI commands (create, status, list, delete)
- [ ] Write unit tests for core functions
- [ ] Test workflow state persistence and loading

**Deliverables:**

- Working CLI tool for basic workflow CRUD operations
- State persistence to `.claude/workflows/` directory
- Unit tests with 80%+ coverage
- CLI commands integrated into main CLI program

**Validation:**

- [ ] Can create workflow with multiple steps
- [ ] Workflow state persists to disk correctly
- [ ] Can load and display workflow status
- [ ] Duplicate names handled with counter suffix
- [ ] Delete removes workflow file

---

### Phase 2: Step Execution Engine (4 days)

**Objective:** Implement step execution logic with all step types

**Tasks:**

- [ ] Implement `executeNextStep()` function
- [ ] Implement step type parser (`parseStepDefinition()`)
- [ ] Add action step execution
- [ ] Add conditional step logic with `--answer` support
- [ ] Add loop step logic with iteration tracking
- [ ] Add variable step storage and retrieval
- [ ] Implement `determineNextStep()` for navigation
- [ ] Add infinite loop prevention (max iterations)
- [ ] Implement workflow completion detection
- [ ] Add execution history logging
- [ ] Write integration tests for step execution
- [ ] Test workflow resumption after interruption

**Deliverables:**

- Full step execution engine supporting all step types
- `workflow next` command working end-to-end
- Variable interpolation in step instructions
- Conditional branching and loop execution
- Integration tests covering common workflows

**Validation:**

- [ ] Action steps execute and return instructions
- [ ] Conditional steps branch correctly based on answer
- [ ] Loop steps iterate and exit on condition
- [ ] Variables stored and retrieved correctly
- [ ] Workflow state updates after each step
- [ ] Can resume workflow from any step

---

### Phase 3: workflow-planner Subagent (3 days)

**Objective:** Create intelligent workflow planning subagent

**Tasks:**

- [ ] Create subagent file at `.claude/agents/planning/workflow-planner.md`
- [ ] Define subagent methodology and phases
- [ ] Implement project state analysis logic
- [ ] Add slash command detection and recommendation
- [ ] Implement custom workflow design patterns
- [ ] Add common workflow templates (PRD → tasks → implementation)
- [ ] Include error handling and recovery patterns
- [ ] Add tool and subagent recommendations
- [ ] Test workflow-planner with various user requests
- [ ] Validate generated workflows are executable

**Deliverables:**

- workflow-planner subagent definition
- Common workflow templates built-in
- Project state analysis capabilities
- Slash command detection logic
- Generated workflows follow best practices

**Validation:**

- [ ] workflow-planner analyzes "continue work on X" correctly
- [ ] Detects when specialized slash command exists
- [ ] Creates custom workflows when no command exists
- [ ] Generated workflows include error handling
- [ ] Output format matches specification

---

### Phase 4: /workflow Slash Command (2 days)

**Objective:** Create user-facing slash command interface

**Tasks:**

- [ ] Create slash command file at `.claude/commands/workflow/workflow.md`
- [ ] Implement `/workflow plan` command
- [ ] Implement `/workflow continue` command
- [ ] Implement `/workflow status` command
- [ ] Implement `/workflow cancel` command
- [ ] Add command orchestration logic
- [ ] Test slash command invocation flow
- [ ] Validate user experience and output formatting

**Deliverables:**

- Complete /workflow slash command
- All subcommands functional
- User-friendly output formatting
- Integration with workflow-planner and CLI tool

**Validation:**

- [ ] `/workflow plan` creates workflow via planner
- [ ] `/workflow continue` executes workflow steps
- [ ] `/workflow status` displays clear status
- [ ] `/workflow cancel` stops workflow gracefully
- [ ] Commands integrate smoothly with CLI tool

---

### Phase 5: Integration & Testing (3 days)

**Objective:** Integrate with existing systems and comprehensive testing

**Tasks:**

- [ ] Integrate with task management system
- [ ] Test task execution workflows end-to-end
- [ ] Integrate with git commit workflow
- [ ] Test multi-phase workflows with loops
- [ ] Add validation pipeline integration
- [ ] Test error recovery patterns
- [ ] Create example workflows for common patterns
- [ ] Write end-to-end tests for full workflows
- [ ] Test workflow resumption across sessions
- [ ] Performance testing (state persistence, execution speed)
- [ ] Documentation for workflow creation patterns

**Deliverables:**

- Full integration with task, git, validation systems
- End-to-end tests for common workflows
- Example workflow templates
- Performance benchmarks
- Integration documentation

**Validation:**

- [ ] "Continue work on X" workflow executes successfully
- [ ] Workflow persists and resumes correctly
- [ ] Error recovery works as designed
- [ ] Performance meets NFR targets
- [ ] All integrations tested

---

### Phase 6: Documentation & Polish (2 days)

**Objective:** Complete documentation and user experience polish

**Tasks:**

- [ ] Write CLI tool README with examples
- [ ] Document workflow step syntax and types
- [ ] Create workflow design guide
- [ ] Add troubleshooting section
- [ ] Polish CLI output formatting
- [ ] Add helpful error messages
- [ ] Create workflow best practices guide
- [ ] Add examples to workflow-planner
- [ ] Final testing and bug fixes

**Deliverables:**

- Complete documentation for all components
- Workflow design guide and best practices
- Polished CLI output
- Example workflows and templates

**Validation:**

- [ ] Documentation complete and accurate
- [ ] Error messages helpful and actionable
- [ ] CLI output follows conventions
- [ ] Examples work as documented

---

**Total Estimate:** 17 days (~3.5 weeks)

---

## Success Metrics

### Quantitative Metrics

- **Workflow Creation Time:** < 2 seconds for workflow-planner analysis
- **Step Execution Overhead:** < 100ms per step
- **State Persistence:** < 50ms read/write operations
- **Resumability:** 100% successful workflow resumption after interruption
- **Test Coverage:** ≥ 80% for workflow CLI tool
- **Performance:** Support 100 concurrent workflows without degradation

### Qualitative Metrics

- Main agents report reduced decision overhead for continuation requests
- Workflows execute consistently across different agents
- Users understand workflow progress and status clearly
- Error messages provide actionable recovery steps
- Workflow state is human-readable and debuggable
- Integration with existing tools feels seamless

### Adoption Metrics

- 80% of "continue work" requests use workflow system
- 90% of common patterns templatized in workflow-planner
- Zero workflow state corruption incidents
- Positive user feedback on workflow clarity and progress tracking

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Workflow state file corruption | Low | High | Atomic writes, state validation on load, backup to execution history |
| Infinite loops in workflow logic | Medium | Medium | Max iteration limits, loop detection, timeout mechanisms |
| Complex conditional logic hard to debug | Medium | Medium | Detailed execution history, step-by-step debugging, verbose logging |
| workflow-planner generates invalid workflows | Medium | Medium | Workflow validation before execution, schema validation, example templates |
| Step execution failures break workflow state | Low | High | Atomic state updates, rollback on failure, error recovery patterns |
| Poor integration with existing tools | Medium | High | Thorough integration testing, gradual rollout, feedback loops |
| Users find workflow syntax too complex | Medium | Medium | Clear documentation, examples, workflow-planner abstracts complexity |
| Performance issues with large workflows | Low | Medium | Performance testing, optimization, workflow splitting guidance |

---

## Open Questions

- [ ] Should workflows support parallel step execution (DAG-style), or keep simple linear with branches?
  - **Recommendation:** Start with linear + branches for simplicity, add parallel in v2 if needed

- [ ] What is the maximum recommended workflow size (number of steps)?
  - **Recommendation:** Soft limit of 50 steps, suggest splitting larger workflows

- [ ] Should workflow state include full command outputs or just summaries?
  - **Recommendation:** Summaries only, with option to log full outputs separately

- [ ] How should workflow variables handle complex objects vs. simple strings?
  - **Recommendation:** v1 supports strings only, JSON serialization in v2 if needed

- [ ] Should workflows be shareable/exportable across projects?
  - **Recommendation:** Out of scope for v1, consider template library in v2

- [ ] What happens if a workflow references a subagent that no longer exists?
  - **Recommendation:** Validation check on workflow creation, error with suggestions on execution

- [ ] Should workflow-planner learn from execution patterns over time?
  - **Recommendation:** Out of scope for v1, machine learning in future version

- [ ] How to handle workflow versioning when workflow format changes?
  - **Recommendation:** Include schema version in state file, migration guide for major changes

---

## Appendices

### Appendix A: Example Workflows

#### Example 1: Simple "Continue Work" Workflow

```json
{
  "id": "continue-work-profile",
  "name": "Continue Work on User Profile",
  "task": "Resume user profile customization feature",
  "steps": [
    {
      "index": 0,
      "type": "action",
      "instruction": "Search for ai/docs/tasks/user-profile.tasks.md"
    },
    {
      "index": 1,
      "type": "conditional",
      "instruction": "If task document not found, search for PRD",
      "condition": {
        "expression": "file_not_found",
        "ifTrue": 2,
        "ifFalse": 3
      }
    },
    {
      "index": 2,
      "type": "action",
      "instruction": "Delegate to Task(prd-task-decomposer) to create tasks from PRD"
    },
    {
      "index": 3,
      "type": "action",
      "instruction": "Run pnpm tools tasks next -d user-profile"
    },
    {
      "index": 4,
      "type": "variable",
      "instruction": "Store task-id and recommended-agent from output",
      "variable": {
        "name": "task-id",
        "operation": "store",
        "source": "command_output"
      }
    },
    {
      "index": 5,
      "type": "action",
      "instruction": "Delegate to ${recommended-agent} for task ${task-id}"
    },
    {
      "index": 6,
      "type": "conditional",
      "instruction": "If task failed, delegate to root-cause-analyst",
      "condition": {
        "expression": "task_failed",
        "ifTrue": 7,
        "ifFalse": 9
      }
    },
    {
      "index": 7,
      "type": "action",
      "instruction": "Delegate to Task(root-cause-analyst) to diagnose failure"
    },
    {
      "index": 8,
      "type": "loop",
      "instruction": "Retry task execution",
      "loop": {
        "targetStepIndex": 5,
        "exitCondition": "task_succeeds",
        "maxIterations": 3,
        "currentIteration": 0
      }
    },
    {
      "index": 9,
      "type": "action",
      "instruction": "Run pnpm tools tasks complete ${task-id} -d user-profile"
    },
    {
      "index": 10,
      "type": "action",
      "instruction": "Run /git:commit"
    },
    {
      "index": 11,
      "type": "loop",
      "instruction": "Continue to next task",
      "loop": {
        "targetStepIndex": 3,
        "exitCondition": "no_todo_tasks",
        "maxIterations": 50,
        "currentIteration": 0
      }
    }
  ]
}
```

#### Example 2: Validation Fix Workflow

```json
{
  "id": "fix-validation-errors",
  "name": "Fix Validation Errors",
  "task": "Resolve lint, typecheck, build, and test errors",
  "steps": [
    {
      "index": 0,
      "type": "action",
      "instruction": "Run pnpm lint && pnpm typecheck && pnpm build && pnpm test"
    },
    {
      "index": 1,
      "type": "conditional",
      "instruction": "Check which validation failed",
      "condition": {
        "expression": "validation_passed",
        "ifTrue": 10,
        "ifFalse": 2
      }
    },
    {
      "index": 2,
      "type": "conditional",
      "instruction": "If lint errors, delegate to lint-debugger",
      "condition": {
        "expression": "lint_errors",
        "ifTrue": 3,
        "ifFalse": 4
      }
    },
    {
      "index": 3,
      "type": "action",
      "instruction": "Delegate to Task(lint-debugger) to fix lint errors"
    },
    {
      "index": 4,
      "type": "conditional",
      "instruction": "If typecheck errors, delegate to code analysis",
      "condition": {
        "expression": "typecheck_errors",
        "ifTrue": 5,
        "ifFalse": 6
      }
    },
    {
      "index": 5,
      "type": "action",
      "instruction": "Delegate to Task(code-writer) to fix type errors"
    },
    {
      "index": 6,
      "type": "conditional",
      "instruction": "If build errors, delegate to build-system-debugger",
      "condition": {
        "expression": "build_errors",
        "ifTrue": 7,
        "ifFalse": 8
      }
    },
    {
      "index": 7,
      "type": "action",
      "instruction": "Delegate to Task(build-system-debugger) to fix build errors"
    },
    {
      "index": 8,
      "type": "conditional",
      "instruction": "If test errors, delegate to test-debugger",
      "condition": {
        "expression": "test_errors",
        "ifTrue": 9,
        "ifFalse": 0
      }
    },
    {
      "index": 9,
      "type": "action",
      "instruction": "Delegate to Task(test-debugger) to fix test failures"
    },
    {
      "index": 10,
      "type": "action",
      "instruction": "All validation passed, workflow complete"
    }
  ]
}
```

### Appendix B: Workflow Step Syntax Reference

#### Action Steps

Format: `action: <instruction>`

Examples:
- `action: Run pnpm tools tasks next -d feature-x`
- `action: Delegate to Task(code-writer, "Implement login endpoint")`
- `action: Run /git:commit`
- `action: Search for ai/docs/prds/feature-x.prd.md`

#### Conditional Steps

Format: `conditional: If <condition>, <action>`

Condition Formats:
- `If file not found, go to Step X`
- `If validation passed, complete workflow`
- `If task failed, go to Step Y`
- `If answer is yes, proceed to Step Z`

Examples:
- `conditional: If file not found at ai/docs/tasks/feature.tasks.md, go to Step 2`
- `conditional: If validation failed, go to Step 5`
- `conditional: If tests pass, go to Step 10`

#### Loop Steps

Format: `loop: Go to Step X until <condition>`

Examples:
- `loop: Go to Step 4 until no TODO tasks remain`
- `loop: Go to Step 6 until validation passes`
- `loop: Go to Step 2 until answer is yes`
- `loop: Repeat Steps 3-7 until all tests pass`

#### Variable Steps

Format: `variable: Store <variable-name> from <source>`

Examples:
- `variable: Store task-id from command output`
- `variable: Store prd-path from search result`
- `variable: Store recommended-agent from task metadata`

Variable Usage:
- Use `${variable-name}` in step instructions
- Example: `action: Delegate to ${recommended-agent} for task ${task-id}`

### Appendix C: Alternatives Considered

**Alternative 1: Workflow DSL (Domain-Specific Language)**

- **Pros:** More expressive, type-safe workflow definitions
- **Cons:** Higher learning curve, requires parser, adds complexity
- **Decision:** Rejected for v1 - simple string-based steps are sufficient

**Alternative 2: YAML Workflow Definitions**

- **Pros:** Human-readable, standard format, easier multi-line definitions
- **Cons:** Requires YAML parser, more verbose than CLI flags
- **Decision:** Considered for v2 - CLI string flags easier for programmatic creation

**Alternative 3: Hardcoded Workflow Templates**

- **Pros:** Faster execution, no parsing overhead, guaranteed correctness
- **Cons:** Inflexible, requires code changes to add workflows, no customization
- **Decision:** Rejected - dynamic workflow creation is core requirement

**Alternative 4: DAG-Based Parallel Execution**

- **Pros:** Supports complex parallel workflows, more powerful
- **Cons:** Much higher complexity, harder to debug, overkill for most use cases
- **Decision:** Out of scope for v1 - linear + branches sufficient initially

**Alternative 5: Embedded Scripting Language (JavaScript/Lua)**

- **Pros:** Maximum flexibility, full programming language capabilities
- **Cons:** Security risks, complexity, overkill for simple workflows
- **Decision:** Rejected - declarative steps safer and simpler

---

**Review Status:** Awaiting stakeholder review
**Next Review Date:** 2025-10-30
**Approvers:** Platform Engineering Lead, Agent Framework Owner, CLI Tools Maintainer
