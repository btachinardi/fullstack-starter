# Task Document Format Specification

## Overview

Task documents (`.tasks.md`) are structured markdown files that define implementation tasks for features or components. They use YAML frontmatter for metadata and YAML code blocks for task definitions.

## File Naming

- **Pattern:** `{feature-name}.tasks.md`
- **Location:** `ai/docs/tasks/`
- **Examples:** `dashboard.tasks.md`, `auth-system.tasks.md`, `api-refactor.tasks.md`

## Document Structure

### 1. YAML Frontmatter (Required)

```yaml
---
title: Feature Name
description: Brief description of the feature
source: path/to/prd-file.md
---
```

**Fields:**
- `title` (required): Human-readable feature name
- `description` (required): Brief description of what this task document covers
- `source` (required): Path to the source PRD document

### 2. Markdown Content (Optional)

Free-form markdown content for context, notes, or documentation.

### 3. Task Lists (Required)

Task lists are defined using YAML code blocks with the naming convention `yaml tasks:{name}`.

**Common Task List Names:**
- `tasks:db` - Database schema and migrations
- `tasks:api` - Backend API endpoints and services
- `tasks:web` - Frontend components and pages
- `tasks:test` - Test cases and test suites
- `tasks:doc` - Documentation tasks

**Example:**

````yaml tasks:api
tasks:
  - id: 1.1
    title: Build dashboard API endpoints
    type: endpoint
    project: apps/api
    description: Implement RESTful endpoints for dashboards.
    deliverables:
      - GET /dashboards - List all dashboards
      - POST /dashboards - Create new dashboard
    requirements:
      - Validate incoming data
      - Handle errors gracefully
    status: todo
    depends_on: []
````

## Task Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "1.1", "2.3") |
| `title` | string | Short, descriptive task title |
| `type` | string | Task type (see Task Types section) |
| `project` | string | Project or codebase location (e.g., "apps/api", "apps/web") |
| `description` | string | Detailed task description |
| `status` | enum | Current status: `todo`, `in progress`, `completed`, `cancelled` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `deliverables` | string[] | List of concrete outputs to produce |
| `requirements` | string[] | List of requirements that must be met |
| `depends_on` | string[] | Task IDs this task depends on |

## Task Types

Common task types for orchestration and organization:

- `database-schema` - Database schema design
- `database-migration` - Migration scripts
- `endpoint` - REST/GraphQL API endpoints
- `service` - Business logic and service layer
- `store` - State management (Redux, Zustand, etc.)
- `ui-component` - Reusable UI components
- `page` - Application pages/routes
- `integration` - Integration between systems
- `test` - Unit, integration, or E2E tests
- `documentation` - Technical documentation

## Task Status Lifecycle

```
todo → in progress → completed
   ↘               ↗
    → cancelled ←
```

**Valid transitions:**
- `todo` → `in progress` - Start working on task
- `in progress` → `completed` - Finish task successfully
- `in progress` → `todo` - Reset task to todo
- Any status → `cancelled` - Cancel task
- `cancelled` → `todo` - Resurrect cancelled task

## Task ID Conventions

Task IDs follow the pattern `{major}.{minor}`:
- Major version: Typically represents the feature phase or epic
- Minor version: Sequential number within the task list

**Examples:**
- `1.1`, `1.2`, `1.3` - Tasks for phase 1
- `2.1`, `2.2` - Tasks for phase 2

**Auto-generation:**
When adding new tasks via CLI, IDs are auto-generated based on existing tasks in the list.

## Dependencies

Tasks can specify dependencies using the `depends_on` field:

```yaml
- id: 1.3
  title: Build API endpoints
  depends_on: [1.2]  # Must complete task 1.2 first
```

**Rules:**
- Dependencies should reference valid task IDs within the document
- Circular dependencies are invalid (will fail validation)
- Cross-list dependencies are supported

## Example Complete Document

````markdown
---
title: User Authentication
description: Task document for implementing user authentication system
source: ai/docs/prds/auth-prd.md
---

# User Authentication Tasks

Implementation tasks for building the authentication system.

## Database Tasks

```yaml tasks:db
tasks:
  - id: 1.1
    title: Design user authentication schema
    type: database-schema
    project: apps/api
    description: Design database schema for users, sessions, and tokens.
    deliverables:
      - CREATE TABLE users
      - CREATE TABLE sessions
      - CREATE TABLE refresh_tokens
    requirements:
      - Support password hashing
      - Enable session management
    status: todo
```

## API Tasks

```yaml tasks:api
tasks:
  - id: 1.2
    title: Implement authentication endpoints
    type: endpoint
    project: apps/api
    description: Create login, logout, and token refresh endpoints.
    deliverables:
      - POST /auth/login
      - POST /auth/logout
      - POST /auth/refresh
    requirements:
      - Use JWT for tokens
      - Implement rate limiting
    status: in progress
    depends_on: [1.1]
```
````

## CLI Tool Integration

Task documents are managed using the `tasks` CLI tool:

```bash
# List all task documents
node tools/dist/cli/main.js tasks list-docs

# List tasks in a document
node tools/dist/cli/main.js tasks list --doc=dashboard

# Get task details
node tools/dist/cli/main.js tasks get 1.3 --doc=dashboard

# Update task status
node tools/dist/cli/main.js tasks start 1.3 --doc=dashboard
node tools/dist/cli/main.js tasks complete 1.3 --doc=dashboard

# Validate document structure
node tools/dist/cli/main.js tasks validate --doc=dashboard
```

## Validation Rules

Task documents must pass these validation rules:

1. **Frontmatter:** Must contain `title`, `description`, and `source`
2. **Task IDs:** Must be unique within the document
3. **Status Values:** Must be one of: `todo`, `in progress`, `completed`, `cancelled`
4. **Required Fields:** All tasks must have `id`, `title`, `type`, `project`, `description`, `status`
5. **Dependencies:** All referenced task IDs must exist in the document
6. **No Circular Dependencies:** Dependency graph must be acyclic

## Best Practices

1. **Granularity:** Keep tasks focused and actionable (completable in 1-4 hours)
2. **Deliverables:** Be specific and measurable
3. **Requirements:** List constraints and quality criteria
4. **Dependencies:** Only specify direct dependencies
5. **Organization:** Group related tasks into logical task lists
6. **Descriptions:** Provide enough context for implementation
7. **Project Paths:** Use consistent project path conventions

## See Also

- [Tasks Tool PRD](../prds/tasks-tool-prd.md) - Complete product requirements
- [Task Writer Agent](../../.claude/agents/planning/task-writer.md) - Agent for generating task documents
- [Task Validator Agent](../../.claude/agents/planning/task-validator.md) - Agent for validating task documents
