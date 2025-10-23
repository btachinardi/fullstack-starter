# Tasks Tool

Task document management for `*.tasks.md` files with YAML task blocks.

## Overview

The tasks tool provides a complete CLI interface for managing task documents written in markdown with YAML frontmatter and task blocks. It supports task lifecycle management, progress tracking, and document validation.

## Features

- **Task Lifecycle Management**: Create, start, complete, cancel, and reset tasks
- **Smart Workflow**: Automatically find and start the next TODO task
- **Progress Tracking**: Real-time completion statistics (excludes cancelled tasks)
- **Document Discovery**: Flexible document selection by name, partial path, or full path
- **Validation**: Ensure task documents follow the correct structure
- **Verbose Mode**: Optional detailed logging with `--verbose` flag

## Task Document Format

Task documents are markdown files with `.tasks.md` extension containing:

1. **YAML Frontmatter**: Document metadata
2. **Task Lists**: YAML code blocks with task definitions

### Example Document

```markdown
---
title: Feature Implementation
description: Tasks for implementing the new feature
source: path/to/prd.md
---

## Database Tasks

```yaml tasks:db
tasks:
  - id: "1.1"
    title: Define database schema
    type: database-schema
    project: apps/api
    description: Create Prisma schema for the feature
    status: completed
    deliverables:
      - Prisma schema file
      - Migration files
    requirements:
      - Follow naming conventions
      - Add indexes for performance

  - id: "1.2"
    title: Create database migration
    type: database-migration
    project: apps/api
    description: Generate and test migration
    status: in progress
    depends_on:
      - "1.1"
```

## API Tasks

```yaml tasks:api
tasks:
  - id: "2.1"
    title: Build API endpoints
    type: endpoint
    project: apps/api
    description: Create REST endpoints
    status: todo
    depends_on:
      - "1.2"
```
```

## Commands

### Discovery Commands

#### `tasks list-docs`

List all task documents in the project.

```bash
pnpm tools tasks list-docs
pnpm tools tasks list-docs --path ./ai/docs
```

**Options:**
- `-p, --path <path>` - Search path (defaults to current directory)

---

### Task Query Commands

#### `tasks list`

List all tasks with optional filtering.

```bash
# List all tasks
pnpm tools tasks list -d feature-name

# Filter by status
pnpm tools tasks list --status "in progress"
pnpm tools tasks list --status todo

# Filter by task list
pnpm tools tasks list --list api

# Filter by type
pnpm tools tasks list --type endpoint

# Filter by project
pnpm tools tasks list --project apps/api

# Show first/last N tasks
pnpm tools tasks list --head 5
pnpm tools tasks list --tail 3
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-s, --status <status>` - Filter by status (todo, in progress, completed, cancelled)
- `-l, --list <name>` - Filter by task list name
- `-t, --type <type>` - Filter by task type
- `-p, --project <name>` - Filter by project
- `--head <n>` - Show only first N tasks
- `--tail <n>` - Show only last N tasks

#### `tasks get`

Get details of a specific task.

```bash
pnpm tools tasks get 1.2 -d feature-name
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path

**Output:**
```
📋 Task: 1.2 - Create database migration

Title:       Create database migration
Type:        database-migration
Project:     apps/api
List:        tasks:db
Status:      in progress
Depends on:  1.1

Description:
  Generate and test migration

Deliverables:
  • Migration files

Requirements:
  • Follow naming conventions
```

---

### Task Lifecycle Commands

#### `tasks next` ⭐

Automatically find the next TODO task, mark it as in progress, and display its details.

```bash
# Start next task
pnpm tools tasks next -d feature-name

# With verbose logging
pnpm tools tasks next -d feature-name --verbose
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-v, --verbose` - Show detailed progress messages

**Output:**
```
📋 Task: 1.2 - Create database migration

Title:       Create database migration
Type:        database-migration
Project:     apps/api
List:        tasks:db
Status:      in progress
Depends on:  1.1

Description:
  Generate and test migration

Deliverables:
  • Migration files

To complete this task run:
  `pnpm tools tasks complete 1.2 -d feature-name`
```

**Verbose Output:**
```
- Finding next TODO task...
✔ Task 1.2 status updated: todo → in progress

<task details>
```

#### `tasks start`

Mark a specific task as in progress.

```bash
pnpm tools tasks start 2.1 -d feature-name
pnpm tools tasks start 2.1 -d feature-name --verbose
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-v, --verbose` - Show detailed progress messages

#### `tasks complete` ⭐

Mark a task as completed and show progress statistics.

```bash
pnpm tools tasks complete 1.2 -d feature-name
pnpm tools tasks complete 1.2 -d feature-name --verbose
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-v, --verbose` - Show detailed progress messages

**Output (< 100%):**
```
📊 Progress: 5/6 tasks completed (83%)

Run `pnpm tools tasks next -d feature-name` to start working on the next task.
```

**Output (100%):**
```
📊 Progress: 6/6 tasks completed (100%)

🎉 Congratulations! All tasks in Feature Implementation are complete!
```

**Note:** Progress calculation excludes cancelled tasks from the total count.

#### `tasks cancel`

Mark a task as cancelled.

```bash
pnpm tools tasks cancel 2.1 -d feature-name
pnpm tools tasks cancel 2.1 -d feature-name --verbose
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-v, --verbose` - Show detailed progress messages

#### `tasks reset`

Reset a task back to TODO status.

```bash
pnpm tools tasks reset 1.2 -d feature-name
pnpm tools tasks reset 1.2 -d feature-name --verbose
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-v, --verbose` - Show detailed progress messages

---

### Management Commands

#### `tasks add`

Add a new task to a task list.

```bash
pnpm tools tasks add \
  -d feature-name \
  -l api \
  -t "Implement authentication" \
  --type endpoint \
  -p apps/api \
  --desc "Add JWT authentication to endpoints"
```

**Required Options:**
- `-d, --doc <name>` - Document name, path, or partial path
- `-l, --list <name>` - Task list name (e.g., "api", "web", "db")
- `-t, --title <title>` - Task title
- `--type <type>` - Task type (e.g., "endpoint", "ui-component")
- `-p, --project <name>` - Project path (e.g., "apps/api")

**Optional:**
- `--desc <description>` - Task description

#### `tasks delete`

Delete a task from the document.

```bash
pnpm tools tasks delete 2.1 -d feature-name
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path

#### `tasks validate`

Validate task document structure and report errors.

```bash
pnpm tools tasks validate -d feature-name
```

**Options:**
- `-d, --doc <name>` - Document name, path, or partial path

**Output (Valid):**
```
✓ Validation Passed

Tasks:       7
Task Lists:  3
```

**Output (Invalid):**
```
✗ Validation Failed

Found 2 error(s):

  [ERROR] Task 1.2 missing required field: title
    Location: tasks:db
    Field: title

  [ERROR] Task 1.3 has invalid status: done
    Location: tasks:api
    Field: status
```

---

## Workflow Examples

### Typical Development Workflow

```bash
# 1. Start working on next task
pnpm tools tasks next -d my-feature

# 2. Work on the task...

# 3. Complete task and see progress
pnpm tools tasks complete 1.2 -d my-feature

# Output:
# 📊 Progress: 2/5 tasks completed (40%)
# Run `pnpm tools tasks next -d my-feature` to start working on the next task.

# 4. Continue with next task
pnpm tools tasks next -d my-feature
```

### Clean Output Mode (Default)

For a streamlined workflow without verbose logging:

```bash
# No spinner messages, just essential info
pnpm tools tasks next -d feature
pnpm tools tasks complete 1.2 -d feature
```

### Verbose Mode (Debugging)

When you need detailed logging:

```bash
# Shows all spinner messages and status updates
pnpm tools tasks next -d feature --verbose
pnpm tools tasks complete 1.2 -d feature --verbose
```

### Managing Task Status

```bash
# Start a specific task
pnpm tools tasks start 2.1 -d feature

# Cancel a task (won't affect progress %)
pnpm tools tasks cancel 2.1 -d feature

# Reset a task to TODO
pnpm tools tasks reset 2.1 -d feature
```

### Querying Tasks

```bash
# View all in-progress tasks
pnpm tools tasks list --status "in progress"

# View API-related tasks
pnpm tools tasks list --list api

# View task details
pnpm tools tasks get 1.2 -d feature
```

---

## Document Discovery

The tool supports three ways to specify documents:

1. **Simple Name**: `--doc feature` → searches for `**/feature.tasks.md`
2. **Partial Path**: `--doc auth/v1` → searches for `**/auth/v1.tasks.md`
3. **Complete Path**: `--doc ai/docs/tasks/feature.tasks.md` → uses exact path

The `.tasks.md` extension is optional in all cases.

---

## Progress Calculation

Progress statistics exclude cancelled tasks from the total count:

**Formula:** `completed / (todo + in progress + completed)`

**Example:**
- 5 completed tasks
- 1 todo task
- 1 cancelled task
- **Progress: 5/6 = 83%** (cancelled task not counted)

When all active tasks are completed, you'll reach 100% even if some tasks were cancelled.

---

## Task Status Values

- `todo` - Not started
- `in progress` - Currently being worked on
- `completed` - Finished successfully
- `cancelled` - No longer needed (excluded from progress calculation)

---

## Task Types

Common task types include:
- `database-schema`
- `database-migration`
- `endpoint`
- `service`
- `store`
- `ui-component`
- `page`
- `integration`
- `test`
- `documentation`

Custom types are also supported.

---

## Service Functions

### Core Functions

#### `discoverDocuments(options?: DocumentScopeOptions): Promise<DiscoveredDocument[]>`

Discover task documents based on scope options.

```typescript
const documents = await discoverDocuments({ doc: 'feature-name' });
```

#### `parseTaskDocument(filePath: string): Promise<TaskDocument>`

Parse a task document from file.

```typescript
const document = await parseTaskDocument('/path/to/feature.tasks.md');
```

#### `listTasks(documentPath: string, options?: ListTasksOptions): Promise<{document, tasks}>`

List all tasks with optional filtering.

```typescript
const { document, tasks } = await listTasks(documentPath, {
  status: 'in progress',
  list: 'api'
});
```

#### `getTask(documentPath: string, taskId: string): Promise<{task, listName} | null>`

Get a specific task by ID.

```typescript
const result = await getTask(documentPath, '1.2');
if (result) {
  const { task, listName } = result;
}
```

#### `startNextTask(documentPath: string): Promise<{success, task?, listName?, message}>`

Find and start the next TODO task.

```typescript
const result = await startNextTask(documentPath);
if (result.success) {
  console.log(`Started task: ${result.task.id}`);
}
```

#### `getDocumentProgress(documentPath: string): Promise<{totalTasks, completedTasks, percentageComplete, documentName}>`

Get progress statistics (excludes cancelled tasks).

```typescript
const progress = await getDocumentProgress(documentPath);
console.log(`${progress.completedTasks}/${progress.totalTasks} completed (${progress.percentageComplete}%)`);
```

### Task Operations

#### `updateTaskStatus(documentPath: string, taskId: string, newStatus: TaskStatus): Promise<TaskOperationResult>`

Update task status.

```typescript
const result = await updateTaskStatus(documentPath, '1.2', 'completed');
console.log(result.message);
```

#### `addTask(documentPath: string, options: AddTaskOptions): Promise<TaskOperationResult>`

Add a new task.

```typescript
const result = await addTask(documentPath, {
  list: 'api',
  title: 'Implement authentication',
  type: 'endpoint',
  project: 'apps/api',
  description: 'Add JWT auth'
});
```

#### `deleteTask(documentPath: string, taskId: string): Promise<TaskOperationResult>`

Delete a task.

```typescript
const result = await deleteTask(documentPath, '1.2');
console.log(result.message);
```

#### `validateDocument(documentPath: string): Promise<TaskDocumentValidation>`

Validate document structure.

```typescript
const validation = await validateDocument(documentPath);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

---

## Types

See `tasks.types.ts` for complete type definitions:

- `Task` - Individual task definition
- `TaskList` - Collection of tasks
- `TaskDocument` - Complete parsed document
- `TaskStatus` - Valid status values
- `TaskType` - Task type categories
- `TaskOperationResult` - Result of task operations
- `ListTasksOptions` - Filtering options
- `AddTaskOptions` - Options for adding tasks

---

## Architecture

The tasks tool follows the vertical module structure:

```
dev/cli/src/tools/tasks/
├── tasks.types.ts      # Type definitions
├── tasks.service.ts    # Business logic (parsing, operations)
├── tasks.spec.ts       # Unit tests
├── index.ts            # Barrel export
└── README.md           # This file
```

**CLI Integration:** Commands are registered in `dev/cli/src/cli/main.ts`

---

## Best Practices

1. **Use `tasks next`** for streamlined workflow - automatically finds and starts the next task
2. **Enable verbose mode** only when debugging or troubleshooting
3. **Cancel instead of delete** tasks that are no longer needed (maintains history)
4. **Validate documents** after manual edits to ensure correct structure
5. **Use meaningful task IDs** like `1.1`, `1.2` for easy reference and ordering
6. **Set dependencies** using `depends_on` to track task relationships
7. **Monitor progress** with `tasks complete` to stay motivated and track completion

---

## Common Issues

### No TODO tasks found

All tasks are either in progress, completed, or cancelled. Use `tasks list` to see current status.

### Task not found

Ensure the task ID is correct. Use `tasks list` to see all available tasks.

### Document validation fails

Check that:
- YAML frontmatter has `title` and `source` fields
- Task blocks use correct syntax: ` ```yaml tasks:name `
- All tasks have required fields: `id`, `title`, `type`, `project`, `status`
- Status values are valid: `todo`, `in progress`, `completed`, `cancelled`

### Multiple documents found

Be more specific with the document name or use a partial/complete path.
