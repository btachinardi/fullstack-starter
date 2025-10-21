Create a new tool in our project for managing task documents.

Task documents are special markdown files marked as `*.tasks.md`.

This tool must be able to parse a Task document and perform the following actions in it:

1. List all tasks (options: by status, by task list, head, tail, by agent)
2. Get task details (shows the details of a specific task)
3. Start task (marks a task as in progress)
4. Delete task (removes a task from the document)
5. Cancel task (marks a task as cancelled)
6. Complete task (marks a task as completed)
7. Reset task (marks a task as todo)
8. Add task to list (adds a task to a specific task list in the document)
9. List all task lists (show all tasks lists in a specific document)

These actions can be scoped to a specific document, or when omitted, it will then look for all `*.task.md` files in the document and present them as an option list for the user to select which document they want to work with.

The tool can receive the document argument as a simple name or a complete path:

1. Simple name: `--doc=auth-system`, will look in the project for a file named `auth-system.tasks.md`. It must strip all extensions from the input name so it can work with any variants like `auth-system.md`, `auth-system.tasks` or `auth-system.tasks.md`.

2. Complete path: `--doc=ai/docs/tasks/auth-system.tasks.md`, will look for the file at the given path.

3. Partial path: `--doc=auth/v1`, will look for all files named `v1.tasks.md` that are under any directory named `auth/`.

This system should also come with a slash command + subagents for:

1. `/tasks:create`: Create a new task document. It must be instructed to either receive a PRD file or AskUserQuestions to gather the information and requirements for first creating the PRD file, and then create the task document based on the PRD file.
2. Use the `research-writer` agent to create preliminary research for the PRD file (optional).
3. Use the `prd-writer` agent to create the PRD file based on the research and the user's requirements.
4. Rename `todo-writer` to `task-writer` and update it to be specialized at creating task documents.
5. Create `task-validator` agent to validate the task documents, checking for errors and inconsistencies in the task lists and tasks, verifying completness and correctness of the task lists and tasks when compared to the PRD file.
6. The orchestrator should be instructed to iterate over the document, by invoking the `task-writer` to create or update the task document, and then invoke the `task-validator` to validate the task document, repeating the process until the task document is valid and complete.

A `*.tasks.md` file should be a markdown file with the following frontmatter:

```
title: Dashboard
description: This is the dashboard feature tasks document.
source: ai/docs/prds/dashboard-prd.md
```

And the tasks codeblock format:

```yaml tasks:db
tasks:
  - id: 1.1
    title: Define database schema for dashboard data
    type: database-schema
    project: apps/api
    description: Design and document the database schema to support dashboard entities, metrics, filters, and widgets.
    deliverables:
      - CREATE TABLE `dashboards` with fields for id, name, owner_id, created_at, updated_at, and visibility.
      - CREATE TABLE `widgets` with fields for id, dashboard_id (foreign key), type, config, and position.
      - CREATE TABLE `dashboard_metrics` with fields for id, dashboard_id (foreign key), metric_name, value_type, description.
      - CREATE TABLE `dashboard_filters` with fields for id, dashboard_id (foreign key), filter_type, filter_value.
      - UPDATE TABLE `users` to add fields or foreign keys supporting dashboard ownership or sharing.
      - Data migration steps as needed to populate new tables or convert existing analytics data to this schema.
    requirements:
      - The database schema should enable flexible analytics across multiple metrics and dimensions.
      - The schema must efficiently store time series data for user and usage events.
      - Support aggregation queries (sum, avg, count, min, max) for dashboards and charts.
      - Enable tracking and filtering by different user segments and cohorts.
      - Store widget and dashboard configuration metadata for customizable analytics.
      - Ensure historical data integrity with immutable records, audit trails for changes.
      - Optimize for fast read queries for dashboard loading and reporting.
      - Include indices or partitions on frequently queried fields (e.g., date, user_id, metric).
      - Be compatible with analytics tools or pipelines (e.g., BI tools, ETL jobs).
      - Follow data privacy and regulatory compliance (GDPR, CCPA), e.g., with user data pseudonymization.
    status: todo

  - id: 1.2
    title: Create database migration for dashboard tables
    type: database-migration
    project: apps/api
    description: Write migration scripts to create necessary tables and indexes for dashboards.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.1]
```

```yaml tasks:api
tasks:
  - id: 1.3
    title: Build dashboard API endpoints
    type: endpoint
    project: apps/api
    description: Implement RESTful endpoints for fetching, creating, updating, and deleting dashboards and associated data.
    deliverables:
      - `GET /dashboards`: List all dashboards with pagination, filtering, and search support.
      - `GET /dashboards/{id}`: Retrieve details of a specific dashboard, including widgets and configuration.
      - `POST /dashboards`: Create a new dashboard with a validated schema and default widgets.
      - `PUT /dashboards/{id}`: Update dashboard metadata, widgets, and layout; validate user permissions.
      - `DELETE /dashboards/{id}`: Delete a dashboard, ensuring cascading removal of associated widgets/data as needed.
    requirements:
      - The endpoints must validate incoming data according to a predefined dashboard schema.
      - Support filtering dashboards by owner, creation date, or team.
      - Return dashboard data formatted for front-end consumption, including nested widgets and metrics.
      - Handle error cases with clear, consistent error responses (e.g., unauthorized, not found, validation errors).
      - Ensure that only authorized users can create, update, or delete dashboards and related entities.
      - The endpoints must efficiently query the database using appropriate indexes.
    status: todo
    depends_on: [1.2]

  - id: 1.4
    title: Implement dashboard service logic
    type: service
    project: apps/api
    description: Develop service layer functions for processing dashboard data and business logic.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.3]
```

```yaml tasks:web
tasks:
  - id: 1.5
    title: Create Redux store slice for dashboards
    type: store
    project: apps/web
    description: Define Redux store slice, actions, and reducers to manage dashboard state on the front-end.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo

  - id: 1.6
    title: Design Dashboard UI component
    type: ui-component
    project: apps/web
    description: Build a reusable React component to display dashboard, including charts, tables, and widgets.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.5]

  - id: 1.7
    title: Create Dashboard page
    type: page
    project: apps/web
    description: Implement the main page that renders the dashboard component and handles route integration.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.6]

  - id: 1.8
    title: Integrate API calls with UI
    type: integration
    project: apps/web
    description: Connect dashboard UI components and Redux store with backend API endpoints for real data flow.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.3, 1.5, 1.6]
```

```yaml tasks:test
tasks:
  - id: 1.9
    title: Write basic unit and integration tests
    type: test
    project: apps/api
    description: Create test cases for backend endpoints, service layer, and front-end dashboard components.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.3, 1.4, 1.6]
```

```yaml tasks:doc
tasks:
  - id: 1.10
    title: Document Dashboard feature
    type: documentation
    project: docs/features
    description: Write user and developer documentation for dashboard usage and development.
    deliverables:
      - ...
    requirements:
      - ...
    status: todo
    depends_on: [1.7, 1.8]
```

The previous tasks are structured as YAML lists where each item describes a specific task required for building the Dashboard feature.

Each task list entry contains the following fields:

- id: A unique identifier (e.g., 1.6) for ordering and referencing task dependencies.
- title: A concise summary of the task.
- type: The type of task (e.g., endpoint, service, store, ui-component, page, integration, test, documentation, database-schema, database-migration, etc), specifies which agent should be used to complete the task with predefined deliverables.
- project: The project or codebase location most relevant for the work (e.g., apps/web, apps/api, docs/features).
- description: A detailed explanation of what needs to be completed.
- deliverables: (Optional) A list of deliverables that must be produced by the task.
- requirements: (Optional) A list of requirements that must be met by the task.
- status: The current progress state of the task (e.g., todo, in progress, completed, cancelled).
- depends_on: (Optional) List of prerequisite task ids that this task depends on, helping define execution order.

This YAML structure provides clear task breakdown, dependency tracking, and a direct mapping from requirements to actionable engineering work. Each task list should be named with the prefix `tasks:` followed by the name of the task list (e.g., `tasks:db`, `tasks:api`, `tasks:web`, `tasks:test`, `tasks:doc`).
