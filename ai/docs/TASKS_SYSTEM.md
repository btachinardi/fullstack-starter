# Tasks Management System Documentation

Complete guide to the tasks management system for creating, validating, and tracking structured task documents.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [CLI Tool Reference](#cli-tool-reference)
- [Task Document Format](#task-document-format)
- [Agent System](#agent-system)
- [Workflow Examples](#workflow-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The tasks management system provides a comprehensive workflow for translating product requirements into executable, trackable tasks:

**Complete Workflow:**
```
PRD Document → Task Document (*.tasks.md) → CLI Management → Execution → Tracking
```

**Key Components:**
1. **CLI Tool** - Command-line interface for managing task documents
2. **Task Writer Agent** - Generates structured task documents from PRDs
3. **Task Validator Agent** - Validates task documents for completeness
4. **Slash Command** - `/tasks:create` orchestrates the complete workflow

**Benefits:**
- ✅ Structured, machine-readable task format (YAML)
- ✅ Automated validation against PRD requirements
- ✅ Dependency tracking and management
- ✅ Progress tracking via CLI commands
- ✅ Integration with agent orchestration system

---

## Quick Start

### 1. Create a Task Document from PRD

Using the `/tasks:create` slash command:

```bash
/tasks:create dashboard
```

This will:
1. Optionally conduct preliminary research
2. Create or use existing PRD
3. Generate task document with validation
4. Provide CLI commands for management

### 2. View All Tasks

```bash
node tools/dist/cli/main.js tasks list --doc=dashboard
```

### 3. Start Working on a Task

```bash
node tools/dist/cli/main.js tasks start 1.1 --doc=dashboard
```

### 4. Mark Task Complete

```bash
node tools/dist/cli/main.js tasks complete 1.1 --doc=dashboard
```

### 5. Track Progress

```bash
node tools/dist/cli/main.js tasks list --doc=dashboard --status="in progress"
```

---

## CLI Tool Reference

### Installation

The tasks CLI is built into the `tools` package:

```bash
cd tools
pnpm build
```

### Global Commands

#### `tasks list-docs`

List all task documents in the project.

```bash
node tools/dist/cli/main.js tasks list-docs
node tools/dist/cli/main.js tasks list-docs --path=ai/docs/tasks
```

**Options:**
- `--path` - Directory to search (defaults to current directory)

---

### Task Management Commands

#### `tasks list`

List all tasks with optional filtering.

```bash
# List all tasks
node tools/dist/cli/main.js tasks list --doc=dashboard

# Filter by status
node tools/dist/cli/main.js tasks list --doc=dashboard --status=todo

# Filter by task list
node tools/dist/cli/main.js tasks list --doc=dashboard --list=api

# Filter by type
node tools/dist/cli/main.js tasks list --doc=dashboard --type=endpoint

# Show first 5 tasks
node tools/dist/cli/main.js tasks list --doc=dashboard --head=5

# Show last 5 tasks
node tools/dist/cli/main.js tasks list --doc=dashboard --tail=5
```

**Options:**
- `--doc` - Document name, path, or partial path
- `--status` - Filter by status (todo, in progress, completed, cancelled)
- `--list` - Filter by task list name (db, api, web, test, doc)
- `--type` - Filter by task type (endpoint, ui-component, etc.)
- `--project` - Filter by project path
- `--head` - Show only first N tasks
- `--tail` - Show only last N tasks

#### `tasks get`

Get detailed information about a specific task.

```bash
node tools/dist/cli/main.js tasks get 1.3 --doc=dashboard
```

**Output includes:**
- Task title, type, project, status
- Full description
- Deliverables list
- Requirements list
- Dependencies

#### `tasks start`

Mark a task as in progress.

```bash
node tools/dist/cli/main.js tasks start 1.3 --doc=dashboard
```

#### `tasks complete`

Mark a task as completed.

```bash
node tools/dist/cli/main.js tasks complete 1.3 --doc=dashboard
```

#### `tasks cancel`

Mark a task as cancelled.

```bash
node tools/dist/cli/main.js tasks cancel 1.3 --doc=dashboard
```

#### `tasks reset`

Reset a task back to todo status.

```bash
node tools/dist/cli/main.js tasks reset 1.3 --doc=dashboard
```

#### `tasks delete`

Delete a task from the document.

```bash
node tools/dist/cli/main.js tasks delete 1.3 --doc=dashboard
```

**Warning:** This permanently removes the task from the document.

#### `tasks add`

Add a new task to a task list.

```bash
node tools/dist/cli/main.js tasks add \
  --doc=dashboard \
  --list=api \
  --title="Create new endpoint" \
  --type=endpoint \
  --project=apps/api \
  --desc="Implement GET /api/dashboards/{id} endpoint"
```

**Required Options:**
- `--doc` - Document name
- `--list` - Task list name (api, web, db, etc.)
- `--title` - Task title
- `--type` - Task type
- `--project` - Project path

**Optional:**
- `--desc` - Task description

#### `tasks validate`

Validate task document structure.

```bash
node tools/dist/cli/main.js tasks validate --doc=dashboard
```

**Checks:**
- YAML frontmatter completeness
- Required task fields present
- Valid status values
- Task ID uniqueness

---

### Document Scoping

The CLI supports three ways to specify documents:

1. **Simple name:** `--doc=dashboard`
   - Searches for `**/dashboard.tasks.md`

2. **Complete path:** `--doc=ai/docs/tasks/dashboard.tasks.md`
   - Uses exact path

3. **Partial path:** `--doc=tasks/dashboard`
   - Searches for `**/tasks/dashboard.tasks.md`

4. **Interactive:** Omit `--doc` to see list of all documents

---

## Task Document Format

### File Structure

```markdown
---
title: Feature Name
description: Brief description
source: ai/docs/prds/feature-prd.md
---

# Feature Name Tasks

Optional markdown content for context.

## Task List Category

\`\`\`yaml tasks:category
tasks:
  - id: 1.1
    title: Task title
    type: task-type
    project: apps/api
    description: Detailed description
    deliverables:
      - Deliverable 1
      - Deliverable 2
    requirements:
      - Requirement 1
      - Requirement 2
    status: todo
    depends_on: []
\`\`\`
```

### Required Fields

**Frontmatter:**
- `title` - Feature name
- `description` - Brief description
- `source` - Path to source PRD

**Tasks:**
- `id` - Unique identifier (e.g., "1.1", "2.3")
- `title` - Short title
- `type` - Task type
- `project` - Project/codebase location
- `description` - Detailed description
- `status` - Current status (todo, in progress, completed, cancelled)

**Optional:**
- `deliverables` - Array of outputs to produce
- `requirements` - Array of constraints
- `depends_on` - Array of dependency task IDs

### Task Types

Common task types:
- `database-schema` - Database design
- `database-migration` - Migration scripts
- `endpoint` - API endpoints
- `service` - Business logic
- `store` - State management
- `ui-component` - UI components
- `page` - Application pages
- `integration` - System integration
- `test` - Test cases
- `documentation` - Documentation

### Task Lists

Organize tasks into logical lists:
- `tasks:db` - Database tasks
- `tasks:api` - Backend API tasks
- `tasks:web` - Frontend tasks
- `tasks:test` - Testing tasks
- `tasks:doc` - Documentation tasks

### Complete Example

See [test-feature.tasks.md](tasks/test-feature.tasks.md) or [format specification](specifications/task-document-format.md) for complete examples.

---

## Agent System

### Available Agents

#### 1. research-writer

Conducts preliminary research before PRD creation.

**Usage:**
- Invoked by `/tasks:create` when user requests research
- Analyzes codebase for related patterns
- Documents findings and recommendations

**Output:**
- Research document at `ai/docs/research/{feature}-research.md`

#### 2. prd-writer

Creates Product Requirement Documents.

**Usage:**
- Invoked by `/tasks:create` to create PRD
- Translates requirements into structured PRD
- Follows standard PRD format

**Output:**
- PRD document at `ai/docs/prds/{feature}-prd.md`

#### 3. task-writer

Generates task documents from PRDs.

**Usage:**
- Invoked by `/tasks:create` to create tasks
- Breaks down PRD requirements into granular tasks
- Organizes into task lists with dependencies

**Output:**
- Task document at `ai/docs/tasks/{feature}.tasks.md`

**Location:** `.claude/agents/planning/task-writer.md`

#### 4. task-validator

Validates task documents against PRD requirements.

**Usage:**
- Invoked by `/tasks:create` during validation loop
- Checks PRD coverage, dependencies, structure
- Provides detailed feedback for improvements

**Output:**
- Validation report with pass/fail status
- Specific issues and recommendations

**Location:** `.claude/agents/planning/task-validator.md`

### Slash Command: /tasks:create

Complete workflow orchestration.

**Usage:**
```bash
/tasks:create {feature-name}
/tasks:create --prd=path/to/prd.md
/tasks:create --research {feature-name}
```

**Workflow:**
1. Requirements gathering (user input or existing PRD)
2. Optional research phase (research-writer)
3. PRD creation or loading (prd-writer)
4. Task document generation (task-writer)
5. Validation loop (task-validator ↔ task-writer)
6. Final document presentation with CLI commands

**Location:** `.claude/commands/planning/tasks-create.md`

---

## Workflow Examples

### Example 1: New Feature from Scratch

```bash
# Step 1: Create task document with research
/tasks:create --research user-dashboard

# Agent workflow:
# → research-writer: Documents findings
# → prd-writer: Creates PRD from research
# → task-writer: Generates tasks from PRD
# → task-validator: Validates completeness
# → task-writer: Refines based on feedback (if needed)
# → Validation passes

# Step 2: View all tasks
node tools/dist/cli/main.js tasks list --doc=user-dashboard

# Step 3: Start working on first task
node tools/dist/cli/main.js tasks start 1.1 --doc=user-dashboard

# Step 4: Track progress
node tools/dist/cli/main.js tasks list --doc=user-dashboard --status="in progress"

# Step 5: Complete task
node tools/dist/cli/main.js tasks complete 1.1 --doc=user-dashboard
```

### Example 2: From Existing PRD

```bash
# Step 1: Create tasks from existing PRD
/tasks:create --prd=ai/docs/prds/analytics-prd.md

# Step 2: View tasks by category
node tools/dist/cli/main.js tasks list --doc=analytics --list=api

# Step 3: Work on tasks
node tools/dist/cli/main.js tasks start 2.1 --doc=analytics
# ... implement the task ...
node tools/dist/cli/main.js tasks complete 2.1 --doc=analytics
```

### Example 3: Manual Task Management

```bash
# List all task documents
node tools/dist/cli/main.js tasks list-docs

# Filter tasks by multiple criteria
node tools/dist/cli/main.js tasks list \
  --doc=dashboard \
  --list=api \
  --status=todo

# Add a new task manually
node tools/dist/cli/main.js tasks add \
  --doc=dashboard \
  --list=api \
  --title="Add caching layer" \
  --type=service \
  --project=apps/api \
  --desc="Implement Redis caching for dashboard queries"

# View task details
node tools/dist/cli/main.js tasks get 3.5 --doc=dashboard

# Validate document structure
node tools/dist/cli/main.js tasks validate --doc=dashboard
```

---

## Best Practices

### Task Document Creation

1. **Use /tasks:create workflow** - Ensures validation and completeness
2. **Start with research** - For complex or unfamiliar features
3. **Review PRD before tasks** - Ensure requirements are clear
4. **Let validation iterate** - Address feedback systematically

### Task Granularity

1. **1-4 hours per task** - Ideal task size
2. **Specific deliverables** - Not "implement feature" but "create POST /api/users endpoint"
3. **Clear requirements** - List constraints and quality criteria
4. **Atomic tasks** - Single, focused responsibility

### Dependency Management

1. **Explicit dependencies** - Use `depends_on` field
2. **Logical ordering** - Database before API, API before frontend
3. **Avoid circular refs** - Validation will catch these
4. **Document rationale** - Explain non-obvious dependencies

### Status Management

1. **Update regularly** - Keep status current via CLI
2. **Use in progress** - Mark tasks when starting work
3. **Complete when done** - Mark completed immediately
4. **Cancel if obsolete** - Mark cancelled rather than delete

### Task Lists Organization

1. **Logical grouping** - db, api, web, test, doc
2. **Consistent naming** - Follow `tasks:name` convention
3. **Include testing** - Always have tasks:test list
4. **Document features** - Include tasks:doc for user-facing changes

---

## Troubleshooting

### CLI Issues

**Problem:** CLI command not found
```bash
# Solution: Build the tools package
cd tools && pnpm build
```

**Problem:** Document not found
```bash
# Solution: List all documents to verify name
node tools/dist/cli/main.js tasks list-docs

# Use exact name from list
node tools/dist/cli/main.js tasks list --doc={exact-name}
```

### Validation Issues

**Problem:** Validation fails with circular dependency
```bash
# Solution: Check dependency graph
# Task A depends on B, B depends on C, C depends on A → circular

# Fix by reordering or breaking the cycle
node tools/dist/cli/main.js tasks get A --doc=feature  # Check dependencies
```

**Problem:** Missing PRD requirements
```bash
# Solution: Add tasks for missing requirements
node tools/dist/cli/main.js tasks add \
  --doc=feature \
  --list=api \
  --title="Implement missing requirement" \
  ...
```

### YAML Syntax Issues

**Problem:** YAML parsing error
```
# Common issues:
- Incorrect indentation (use 2 spaces)
- Missing quotes around special characters
- Malformed arrays (use "- item" format)
- Colons in strings need quotes

# Validate YAML syntax
node tools/dist/cli/main.js tasks validate --doc=feature
```

**Problem:** Task not parsing
```yaml
# Bad: Mixed indentation
tasks:
    - id: 1.1
       title: Test

# Good: Consistent 2-space indentation
tasks:
  - id: 1.1
    title: Test
```

### Agent Issues

**Problem:** /tasks:create fails
```bash
# Check that agents exist
ls .claude/agents/planning/

# Should see:
# - prd-writer.md
# - task-writer.md
# - task-validator.md
# - research-writer.md

# Verify slash command exists
ls .claude/commands/planning/tasks-create.md
```

---

## Reference Links

- [Task Document Format Specification](specifications/task-document-format.md)
- [Tasks Tool PRD](prds/tasks-tool-prd.md)
- [Task Writer Agent](.claude/agents/planning/task-writer.md)
- [Task Validator Agent](.claude/agents/planning/task-validator.md)
- [/tasks:create Slash Command](.claude/commands/planning/tasks-create.md)

---

## Version History

- **v1.0** (2025-10-21) - Initial release with complete CLI tool, agent system, and slash command

---

**Maintained by:** Platform Engineering
**Last Updated:** 2025-10-21
