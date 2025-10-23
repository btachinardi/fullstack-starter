---
title: Prisma Build Tool
description: Task document for implementing a build tool that enables modular Prisma schema composition across a monorepo with comment-based imports, dependency resolution, and migration merging
source: prisma-build-tool.prd.md
---

# Prisma Build Tool Tasks

Implementation tasks for building a CLI tool that enables modular Prisma schema composition in monorepos. The tool will support comment-based schema imports, automatic dependency resolution, migration merging, and PostgreSQL schema namespacing.

## Phase 1: Schema Parser

```yaml tasks:parser
tasks:
  - id: 1.1
    title: Create schema parser module structure
    type: configuration
    project: cli/tools
    description: Set up the base structure for Prisma schema parsing functionality within the existing CLI tools project
    deliverables:
      - Directory structure at cli/tools/src/commands/prisma/
      - Base TypeScript files for parser, graph, merger, migrations, validator
      - Type definitions file for parser domain models
      - Export configuration in cli/tools/src/index.ts
    requirements:
      - Follow existing CLI tools architecture pattern
      - Use TypeScript with strict mode enabled
      - Maintain consistency with session and logs tool structure
    status: todo

  - id: 1.2
    title: Implement import comment extraction
    type: parser
    project: cli/tools
    description: Parse Prisma schema files and extract @prisma-import comments from the top of files
    deliverables:
      - Function to parse @prisma-import comments using regex
      - Support for workspace paths (@libs/*, @apps/*)
      - Type-safe return structure with array of import paths
      - Error handling for malformed imports
    requirements:
      - Import comments must be at the start of file before datasource
      - One import per line with format "// @prisma-import: <workspace-path>"
      - Validate workspace path format
      - Return empty array if no imports found
    status: todo

  - id: 1.3
    title: Implement generation boundary detection
    type: parser
    project: cli/tools
    description: Detect generation boundary markers in Prisma schema files to identify auto-generated sections
    deliverables:
      - Function to find generation boundary start and end markers
      - Extract content within boundaries
      - Parse metadata from boundary comments (sources, timestamps)
      - Type-safe boundary structure with line numbers
    requirements:
      - Start marker is "// GENERATED SECTION - DO NOT EDIT MANUALLY"
      - End marker is "// END GENERATED SECTION"
      - Extract "Generated from:" list
      - Extract "Last updated:" timestamp
      - Handle missing boundaries gracefully
    status: todo
    depends_on: []

  - id: 1.4
    title: Parse datasource and generator configurations
    type: parser
    project: cli/tools
    description: Extract datasource and generator blocks from Prisma schema files
    deliverables:
      - Function to parse datasource block (provider, url, schemas)
      - Function to parse generator block (provider, output, previewFeatures)
      - Extract model definitions with @@schema directives
      - Type-safe configuration structures
    requirements:
      - Support PostgreSQL provider
      - Extract multi-schema configuration from datasource
      - Parse previewFeatures array including multiSchema
      - Handle multiple generators if present
    status: todo
    depends_on: []

  - id: 1.5
    title: Create schema parser orchestration function
    type: integration
    project: cli/tools
    description: Build main parseSchema function that orchestrates all parsing operations
    deliverables:
      - ParsedSchema type definition with all parsed elements
      - Main parseSchema function accepting file path
      - Integration of import extraction, boundary detection, config parsing
      - Error aggregation and reporting
    requirements:
      - Read file from disk using Node.js fs
      - Return complete ParsedSchema object
      - Handle file not found errors
      - Provide clear error messages for parse failures
      - Include original file path in result
    status: todo
    depends_on: [1.2, 1.3, 1.4]

  - id: 1.6
    title: Write unit tests for schema parser
    type: test
    project: cli/tools
    description: Comprehensive test coverage for all parser functions
    deliverables:
      - Test suite for import comment extraction
      - Test suite for boundary detection
      - Test suite for datasource/generator parsing
      - Test suite for parseSchema integration
      - Test fixtures with sample schema files
    requirements:
      - Use Vitest or Jest based on project standard
      - Achieve 90%+ code coverage for parser module
      - Test edge cases (missing imports, malformed syntax, empty files)
      - Test error conditions and error messages
    status: todo
    depends_on: [1.5]
```

## Phase 2: Dependency Resolution

```yaml tasks:graph
tasks:
  - id: 2.1
    title: Implement workspace path resolver
    type: service
    project: cli/tools
    description: Resolve workspace paths (@libs/*, @apps/*) to absolute file system paths
    deliverables:
      - Function to resolve workspace paths using pnpm workspace configuration
      - Support for @libs/* and @apps/* path patterns
      - Integration with package.json workspace definitions
      - Absolute path resolution for schema files
    requirements:
      - Read workspace configuration from pnpm-workspace.yaml or package.json
      - Handle Windows and Unix path separators
      - Validate resolved paths exist on filesystem
      - Return absolute paths for cross-platform compatibility
    status: todo

  - id: 2.2
    title: Build dependency graph from schema imports
    type: graph
    project: cli/tools
    description: Construct a dependency graph by recursively parsing schema imports
    deliverables:
      - DependencyGraph data structure (Map or adjacency list)
      - Recursive graph building function
      - Node representation with schema path and dependencies
      - Graph traversal utilities
    requirements:
      - Start from entry point schema file
      - Recursively follow all @prisma-import paths
      - Build directed graph of dependencies
      - Track visited nodes to detect cycles
      - Handle schemas with no imports (leaf nodes)
    status: todo
    depends_on: [2.1]

  - id: 2.3
    title: Implement circular dependency detection
    type: validation
    project: cli/tools
    description: Detect circular dependencies in the schema import graph
    deliverables:
      - Cycle detection algorithm (DFS-based)
      - Detailed error messages showing circular path
      - Function returning boolean and cycle path
      - Integration with graph builder
    requirements:
      - Use depth-first search with visited tracking
      - Detect cycles during graph construction
      - Report complete cycle path (A → B → C → A)
      - Provide actionable error message suggesting fixes
    status: todo
    depends_on: [2.2]

  - id: 2.4
    title: Implement topological sort for dependency order
    type: graph
    project: cli/tools
    description: Sort dependency graph in topological order for correct merge sequence
    deliverables:
      - Topological sort algorithm (Kahn's or DFS-based)
      - Function returning ordered list of schema paths
      - Validation that sort is possible (no cycles)
      - Integration with graph structure
    requirements:
      - Return schemas in dependency order (dependencies first)
      - Ensure application schema is last in order
      - Handle multiple valid orderings consistently
      - Throw error if graph has cycles
    status: todo
    depends_on: [2.3]

  - id: 2.5
    title: Create dependency graph builder orchestration
    type: integration
    project: cli/tools
    description: Main buildDependencyGraph function orchestrating all graph operations
    deliverables:
      - DependencyGraphResult type with ordered schemas and metadata
      - Main buildDependencyGraph function
      - Integration of path resolution, graph building, cycle detection, sorting
      - Comprehensive error handling
    requirements:
      - Accept entry point schema path as input
      - Return topologically sorted list of schema paths
      - Include graph metadata (node count, depth)
      - Provide detailed errors for resolution or cycle issues
    status: todo
    depends_on: [2.4]

  - id: 2.6
    title: Write unit tests for dependency resolution
    type: test
    project: cli/tools
    description: Comprehensive test coverage for dependency graph operations
    deliverables:
      - Tests for workspace path resolution
      - Tests for graph construction with various import patterns
      - Tests for circular dependency detection
      - Tests for topological sort correctness
      - Test fixtures with mock workspace structure
    requirements:
      - Test single schema with no imports
      - Test linear dependency chain (A → B → C)
      - Test diamond dependency (A → B/C → D)
      - Test circular dependency error cases
      - Verify topological order is correct
    status: todo
    depends_on: [2.5]
```

## Phase 3: Schema Merger

```yaml tasks:merger
tasks:
  - id: 3.1
    title: Implement generation boundary marker creation
    type: service
    project: cli/tools
    description: Generate boundary marker comments with metadata for merged schemas
    deliverables:
      - Function to create start boundary marker with metadata
      - Function to create end boundary marker
      - Metadata formatting (source list, timestamp)
      - Consistent comment formatting
    requirements:
      - Include list of source schema paths in boundary
      - Add ISO 8601 timestamp for generation time
      - Use clear visual separator (equal signs line)
      - Match format specified in PRD exactly
    status: todo

  - id: 3.2
    title: Implement namespace transformation for models
    type: transformer
    project: cli/tools
    description: Transform Prisma models to use correct @@schema directive based on library namespace
    deliverables:
      - Function to extract namespace from schema path (@libs/api → "auth")
      - Function to add or update @@schema directive on models
      - Model block parser and transformer
      - Preservation of existing model content
    requirements:
      - Map library name to database schema name
      - Add @@schema directive if not present
      - Update @@schema directive if present
      - Preserve model fields, relations, and other directives
      - Handle multi-line model definitions
    status: todo

  - id: 3.3
    title: Implement datasource and generator config merging
    type: merger
    project: cli/tools
    description: Merge datasource and generator configurations from multiple schemas
    deliverables:
      - Function to merge datasource blocks (prefer app's config)
      - Function to merge generator blocks (prefer app's config)
      - Schema list consolidation for datasource.schemas
      - Conflict detection and resolution
    requirements:
      - Use application schema's datasource as base
      - Merge schemas array from all imported schemas
      - Deduplicate schema names in schemas array
      - Use application schema's generator config
      - Preserve previewFeatures and other settings
    status: todo

  - id: 3.4
    title: Implement schema content extraction and filtering
    type: parser
    project: cli/tools
    description: Extract model definitions and other schema content excluding config blocks
    deliverables:
      - Function to extract all model definitions from schema
      - Function to extract enum definitions
      - Function to filter out datasource and generator blocks
      - Content preservation with original formatting
    requirements:
      - Extract complete model blocks with all directives
      - Extract enum definitions
      - Skip datasource and generator blocks
      - Preserve whitespace and comments within models
      - Handle relation definitions correctly
    status: todo

  - id: 3.5
    title: Implement main schema merger function
    type: integration
    project: cli/tools
    description: Orchestrate complete schema merging process
    deliverables:
      - MergedSchema type definition
      - Main mergeSchemas function accepting ordered schemas
      - Integration of boundary creation, namespace transformation, config merging
      - Final schema assembly in correct order
    requirements:
      - Accept topologically sorted array of ParsedSchema objects
      - Merge datasource/generator from application schema
      - Add generation boundary markers
      - Transform and merge imported schema models
      - Append application's native models after boundary
      - Return complete merged schema as string
    status: todo
    depends_on: [3.1, 3.2, 3.3, 3.4]

  - id: 3.6
    title: Write unit tests for schema merger
    type: test
    project: cli/tools
    description: Comprehensive test coverage for schema merging operations
    deliverables:
      - Tests for boundary marker creation
      - Tests for namespace transformation
      - Tests for config merging logic
      - Tests for content extraction
      - Tests for complete merge process
    requirements:
      - Test single schema merge (no imports)
      - Test two-schema merge (lib → app)
      - Test multi-schema merge (multiple libs → app)
      - Verify generation boundaries are correct
      - Verify namespace directives applied correctly
      - Verify datasource.schemas array is correct
    status: todo
    depends_on: [3.5]
```

## Phase 4: Migration Merger

```yaml tasks:migrations
tasks:
  - id: 4.1
    title: Implement migration file scanner
    type: service
    project: cli/tools
    description: Scan and discover migration files from schema directories
    deliverables:
      - Function to find migration directories relative to schema files
      - Function to list all migration folders
      - Migration metadata extraction (timestamp, name)
      - File path resolution for migration.sql files
    requirements:
      - Look for prisma/migrations directory relative to schema
      - Each migration is a folder with migration.sql inside
      - Extract timestamp from folder name (YYYYMMDDHHMMSS_name)
      - Return array of migration metadata with paths
    status: todo

  - id: 4.2
    title: Implement migration timestamp parser
    type: parser
    project: cli/tools
    description: Parse and validate migration timestamps from folder names
    deliverables:
      - Function to extract timestamp from migration folder name
      - Timestamp validation (14-digit format YYYYMMDDHHMMSS)
      - Date parsing for sorting
      - Error handling for malformed timestamps
    requirements:
      - Parse timestamp prefix from folder name
      - Validate format is exactly 14 digits
      - Convert to Date object or comparable number
      - Handle invalid formats with clear errors
    status: todo

  - id: 4.3
    title: Implement migration sorting by timestamp
    type: service
    project: cli/tools
    description: Sort migrations from all schemas in chronological order
    deliverables:
      - Function to sort migrations by timestamp
      - Stable sort for same timestamps
      - Preservation of migration metadata during sort
      - Sorted migration list with source tracking
    requirements:
      - Sort by timestamp ascending (oldest first)
      - Preserve source schema information for each migration
      - Handle migrations with identical timestamps consistently
      - Return sorted array ready for merging
    status: todo
    depends_on: [4.2]

  - id: 4.4
    title: Implement SQL namespace transformation
    type: transformer
    project: cli/tools
    description: Transform migration SQL to use proper schema namespacing
    deliverables:
      - Function to add CREATE SCHEMA statements
      - Function to prefix table names with schema
      - DDL statement parser and transformer
      - SQL content preservation with namespace additions
    requirements:
      - Prepend "CREATE SCHEMA IF NOT EXISTS <schema>;" for library migrations
      - Prefix table names with schema (e.g., "auth"."User")
      - Transform CREATE TABLE, ALTER TABLE, CREATE INDEX statements
      - Handle quoted identifiers correctly
      - Skip transformation for "public" schema (application migrations)
    status: todo

  - id: 4.5
    title: Implement migration file copying with transformation
    type: service
    project: cli/tools
    description: Copy migration files to application directory with namespace transformations
    deliverables:
      - Function to copy migration folders
      - SQL transformation during copy
      - Directory structure preservation
      - Migration lock file generation
    requirements:
      - Create migration folder with original name
      - Read migration.sql from source
      - Apply namespace transformation
      - Write transformed SQL to destination
      - Preserve folder naming convention
    status: todo
    depends_on: [4.4]

  - id: 4.6
    title: Implement migration merger orchestration
    type: integration
    project: cli/tools
    description: Main mergeMigrations function orchestrating complete migration merge process
    deliverables:
      - MergedMigrations type definition
      - Main mergeMigrations function
      - Integration of scanning, sorting, transformation, copying
      - Migration lock file update
    requirements:
      - Accept array of schema paths with migrations
      - Scan all migration directories
      - Sort migrations chronologically
      - Apply namespace transformations
      - Copy to application migration directory
      - Generate migration_lock.toml with import tracking
      - Return migration merge summary
    status: todo
    depends_on: [4.1, 4.3, 4.5]

  - id: 4.7
    title: Write unit tests for migration merger
    type: test
    project: cli/tools
    description: Comprehensive test coverage for migration merging operations
    deliverables:
      - Tests for migration scanning
      - Tests for timestamp parsing and sorting
      - Tests for SQL namespace transformation
      - Tests for migration copying
      - Tests for complete merge process
    requirements:
      - Test migration discovery in various structures
      - Test timestamp parsing edge cases
      - Test chronological sorting with multiple migrations
      - Test SQL transformation for CREATE TABLE, ALTER TABLE
      - Test complete merge with multiple schema migrations
      - Use mock filesystem for testing
    status: todo
    depends_on: [4.6]
```

## Phase 5: CLI Commands

```yaml tasks:cli
tasks:
  - id: 5.1
    title: Add prisma command group to CLI
    type: configuration
    project: cli/tools
    description: Add prisma command group to existing CLI tool structure following session/logs pattern
    deliverables:
      - Prisma command group registration in main.ts
      - Command description and help text
      - Import statements for prisma tool functions
      - Integration with existing Commander.js setup
    requirements:
      - Follow existing CLI tool patterns (session, logs, tasks)
      - Use Commander.js for command structure
      - Include description for help output
      - Maintain consistent CLI style
    status: todo

  - id: 5.2
    title: Implement build command
    type: command
    project: cli/tools
    description: Create prisma build command to compose and generate schemas
    deliverables:
      - Build command with <schema-path> argument
      - Options for --test, --watch, --verbose, --dry-run
      - Integration with parser, graph, merger, migrations modules
      - Spinner feedback using ora
      - Colored output using chalk
    requirements:
      - Accept schema path as required argument
      - Parse schema and build dependency graph
      - Detect circular dependencies and error
      - Merge schemas with generation boundaries
      - Merge migrations by timestamp
      - Write output files (schema.prisma, migrations/)
      - Run prisma generate after build
      - Provide progress feedback with spinners
      - Show summary on completion
    status: todo
    depends_on: [5.1]

  - id: 5.3
    title: Implement validate command
    type: command
    project: cli/tools
    description: Create prisma validate command to check schema composition
    deliverables:
      - Validate command with <schema-path> argument
      - All imports exist check
      - Circular dependency detection
      - Namespace uniqueness validation
      - Prisma syntax validation
      - Detailed error reporting
    requirements:
      - Check all import paths resolve successfully
      - Run circular dependency check
      - Verify all @@schema directives unique
      - Optionally run prisma validate on generated schema
      - Report all validation errors clearly
      - Exit with code 1 on errors
    status: todo
    depends_on: [5.1]

  - id: 5.4
    title: Implement graph command
    type: command
    project: cli/tools
    description: Create prisma graph command to visualize dependency graph
    deliverables:
      - Graph command with <schema-path> argument
      - Tree-style visualization of dependencies
      - Indentation showing hierarchy levels
      - Colored output for readability
      - Option for JSON output format
    requirements:
      - Build dependency graph from schema
      - Display as tree structure with indentation
      - Show schema paths clearly
      - Mark schemas with no dependencies
      - Support --json flag for machine-readable output
      - Include depth and node count in summary
    status: todo
    depends_on: [5.1]

  - id: 5.5
    title: Implement watch mode for build command
    type: feature
    project: cli/tools
    description: Add --watch option to build command for development workflow
    deliverables:
      - File watcher using chokidar or fs.watch
      - Watch all schemas in dependency graph
      - Auto-rebuild on file changes
      - Debounced rebuild (500ms)
      - Clear console between rebuilds
    requirements:
      - Watch entry point schema and all imported schemas
      - Trigger rebuild on any schema file change
      - Debounce rapid changes to avoid excessive rebuilds
      - Show rebuild status with spinner
      - Handle errors gracefully in watch mode
      - Allow graceful shutdown with Ctrl+C
    status: todo
    depends_on: [5.2]

  - id: 5.6
    title: Implement comprehensive error messages
    type: error-handling
    project: cli/tools
    description: Create detailed error messages for all failure modes
    deliverables:
      - Error message templates for each error type
      - Circular dependency error with cycle path
      - Import not found error with suggestions
      - Namespace collision error with locations
      - Prisma syntax error with line numbers
      - Actionable fix suggestions for each error
    requirements:
      - Match error message format from PRD examples
      - Include error context (file, line, location)
      - Provide "To fix:" suggestions
      - Use chalk for colored error output
      - Be specific about what went wrong
    status: todo
    depends_on: [5.2, 5.3, 5.4]

  - id: 5.7
    title: Update package.json with build scripts and dependencies
    type: configuration
    project: cli/tools
    description: Add dependencies and build configuration for Prisma build tool
    deliverables:
      - Updated dependencies (commander, chalk, ora, chokidar)
      - Build script using tsup or tsc
      - Test script configuration
      - Type definitions for Prisma schema parsing
    requirements:
      - Add required npm packages
      - Configure TypeScript build
      - Add Vitest or Jest for tests
      - Ensure types are properly exported
      - Update main/types fields in package.json
    status: todo
    depends_on: []

  - id: 5.8
    title: Write integration tests for CLI commands
    type: test
    project: cli/tools
    description: Test complete CLI workflows end-to-end
    deliverables:
      - Integration test for build command
      - Integration test for validate command
      - Integration test for graph command
      - Test fixtures with mock schemas and workspace
      - Error case testing
    requirements:
      - Use real filesystem in test temp directories
      - Test successful build with imports
      - Test circular dependency error case
      - Test import not found error case
      - Test validate command success and failure
      - Test graph command output format
      - Clean up test artifacts after tests
    status: todo
    depends_on: [5.2, 5.3, 5.4]
```

## Phase 6: Integration Testing

```yaml tasks:integration
tasks:
  - id: 6.1
    title: Create test schema for libs/api with auth models
    type: test-fixture
    project: libs/api
    description: Set up auth schema in libs/api to test schema composition
    deliverables:
      - libs/api/prisma/schema.prisma with User, Session, Account models
      - Database schema configuration using "auth" namespace
      - Generator config with multiSchema preview feature
      - Migration files for auth schema
    requirements:
      - Use @@schema("auth") directive on all models
      - Include datasource with schemas = ["auth"]
      - Add generator with previewFeatures = ["multiSchema"]
      - Create initial migration with auth tables
      - Follow Better Auth schema requirements
    status: todo

  - id: 6.2
    title: Create test schema for apps/api importing libs/api
    type: test-fixture
    project: apps/api
    description: Set up application schema that imports auth schema
    deliverables:
      - apps/api/prisma/schema.prisma with @prisma-import comment
      - Generation boundary markers (empty initially)
      - Application-specific models (Post, Comment)
      - Database schema configuration with both "public" and "auth"
    requirements:
      - Add "// @prisma-import: @libs/api/prisma/schema.prisma" at top
      - Include datasource with schemas = ["public", "auth"]
      - Add Post model with @@schema("public")
      - Add relation to User from auth schema
      - Generator config matching libs/api
    status: todo

  - id: 6.3
    title: Write integration test for schema composition
    type: test
    project: libs/api
    description: Test complete schema composition workflow
    deliverables:
      - Integration test suite for schema build
      - Test running pnpm tools prisma build command
      - Validation of generated schema.prisma
      - Verification of generation boundaries
      - Check for correct namespace directives
    requirements:
      - Use actual CLI tool via child process or direct function call
      - Build apps/api schema importing libs/api
      - Assert generated schema has User, Session, Account models
      - Assert generation boundary markers present and correct
      - Assert Post model remains in correct location
      - Verify datasource.schemas includes both namespaces
    status: todo
    depends_on: [6.1, 6.2]

  - id: 6.4
    title: Write integration test for migration merging
    type: test
    project: libs/api
    description: Test migration merge functionality with multiple migrations
    deliverables:
      - Integration test for migration merge
      - Multiple migration files in libs/api
      - Verification of merged migrations in apps/api
      - Check for correct chronological order
      - Validate namespace transformations in SQL
    requirements:
      - Create 2+ migrations in libs/api/prisma/migrations
      - Create 1+ migrations in apps/api/prisma/migrations
      - Run build command with migration merge
      - Assert migrations copied to apps/api
      - Assert migrations sorted by timestamp
      - Assert CREATE SCHEMA statements added for auth
      - Assert table names prefixed with auth schema
    status: todo
    depends_on: [6.3]

  - id: 6.5
    title: Set up test database for integration tests
    type: test-infrastructure
    project: libs/api
    description: Configure test database for running integration tests with Prisma
    deliverables:
      - Test database setup script
      - DATABASE_URL environment variable configuration
      - Database creation and teardown utilities
      - Prisma client instantiation for tests
    requirements:
      - Use PostgreSQL test database (or SQLite for CI)
      - Create unique database per test run
      - Apply migrations via prisma migrate deploy
      - Clean up database after tests
      - Handle parallel test execution
    status: todo

  - id: 6.6
    title: Write integration test for cross-schema relations
    type: test
    project: libs/api
    description: Test that relations between schemas work correctly after build
    deliverables:
      - Integration test creating related records
      - Test creating User in auth schema
      - Test creating Post in public schema linked to User
      - Verify foreign key constraints work
      - Query test with relations
    requirements:
      - Run full build and migration
      - Use Prisma client to create records
      - Create User record in auth schema
      - Create Post record with authorId foreign key
      - Query Post with author relation
      - Assert relations traverse schemas correctly
    status: todo
    depends_on: [6.5]

  - id: 6.7
    title: Write integration test for error cases
    type: test
    project: cli/tools
    description: Test error handling for common failure scenarios
    deliverables:
      - Test for circular dependency error
      - Test for import not found error
      - Test for namespace collision error
      - Test for invalid Prisma syntax error
      - Verify error messages are helpful
    requirements:
      - Create test fixtures with circular imports
      - Create test fixture with missing import
      - Create test fixture with duplicate model names
      - Run build and assert specific errors thrown
      - Verify error messages match expected format
      - Check that error suggestions are present
    status: todo
    depends_on: [6.3]

  - id: 6.8
    title: Set up CI pipeline for Prisma build tool tests
    type: ci-cd
    project: root
    description: Configure CI to run all Prisma build tool tests
    deliverables:
      - GitHub Actions workflow or CI configuration
      - PostgreSQL service for integration tests
      - Test database setup in CI
      - Coverage reporting
    requirements:
      - Run unit tests for all modules
      - Run integration tests with real database
      - Use PostgreSQL service in CI environment
      - Generate test coverage report
      - Fail pipeline on test failures
      - Ensure tests run on pull requests
    status: todo
    depends_on: [6.6, 6.7]
```

## Phase 7: Documentation

```yaml tasks:docs
tasks:
  - id: 7.1
    title: Write architecture documentation
    type: documentation
    project: ai/docs
    description: Document the architecture and design of the Prisma build tool
    deliverables:
      - Architecture overview document
      - Component diagrams for parser, graph, merger, migrations
      - Data flow documentation
      - Design decisions and rationale
    requirements:
      - Explain modular schema composition concept
      - Document parser architecture and regex patterns
      - Explain dependency graph algorithms
      - Document merge strategy and boundaries
      - Explain migration merge algorithm
      - Include diagrams showing data flow
      - Saved to ai/docs/prisma-build-tool-architecture.md
    status: todo

  - id: 7.2
    title: Write usage guide for library authors
    type: documentation
    project: ai/docs
    description: Guide for creating schemas in libraries
    deliverables:
      - Step-by-step guide for adding schema to library
      - Example library schema with namespace
      - Migration creation instructions
      - Testing guidelines for library schemas
      - Best practices and conventions
    requirements:
      - Show how to create libs/*/prisma/schema.prisma
      - Explain @@schema directive usage and naming
      - Document migration creation with prisma migrate dev
      - Show how to test library schema in isolation
      - Provide complete working example
      - Saved to ai/docs/prisma-build-tool-library-guide.md
    status: todo

  - id: 7.3
    title: Write usage guide for application developers
    type: documentation
    project: ai/docs
    description: Guide for composing schemas in applications
    deliverables:
      - Step-by-step guide for importing library schemas
      - @prisma-import syntax documentation
      - Build command usage examples
      - Generation boundary explanation
      - Cross-schema relation examples
    requirements:
      - Show how to add @prisma-import comments
      - Document datasource.schemas configuration
      - Show how to run build command
      - Explain generated section in schema
      - Show examples of relations across schemas
      - Document watch mode for development
      - Saved to ai/docs/prisma-build-tool-app-guide.md
    status: todo

  - id: 7.4
    title: Write CLI reference documentation
    type: documentation
    project: ai/docs
    description: Complete reference for all CLI commands and options
    deliverables:
      - Command reference for prisma build
      - Command reference for prisma validate
      - Command reference for prisma graph
      - Options documentation for all flags
      - Exit code documentation
      - Examples for each command
    requirements:
      - Document all commands with syntax
      - List and explain all options/flags
      - Show example usage for each command
      - Document exit codes and their meanings
      - Include common workflows
      - Saved to ai/docs/prisma-build-tool-cli-reference.md
    status: todo

  - id: 7.5
    title: Write troubleshooting guide
    type: documentation
    project: ai/docs
    description: Troubleshooting guide for common issues and errors
    deliverables:
      - Common errors and solutions
      - Circular dependency troubleshooting
      - Import resolution issues
      - Migration merge problems
      - Namespace collision fixes
      - Prisma client generation issues
    requirements:
      - List common error messages
      - Explain what each error means
      - Provide step-by-step fix instructions
      - Include examples of problematic schemas
      - Show corrected versions
      - Document debugging techniques
      - Saved to ai/docs/prisma-build-tool-troubleshooting.md
    status: todo

  - id: 7.6
    title: Write migration guide from existing setup
    type: documentation
    project: ai/docs
    description: Guide for migrating existing monorepo to use Prisma build tool
    deliverables:
      - Step-by-step migration process
      - Pre-migration checklist
      - Schema splitting strategy
      - Migration handling during transition
      - Rollback plan
      - Testing migration process
    requirements:
      - Document pre-migration assessment
      - Show how to split monolithic schema
      - Explain how to handle existing migrations
      - Document testing strategy for migration
      - Provide rollback procedures
      - Include complete migration example
      - Saved to ai/docs/prisma-build-tool-migration.md
    status: todo

  - id: 7.7
    title: Update project CLAUDE.md with Prisma build tool information
    type: documentation
    project: root
    description: Add section to CLAUDE.md documenting Prisma build tool
    deliverables:
      - New section in CLAUDE.md for Prisma build tool
      - Quick reference for CLI commands
      - Links to detailed documentation
      - Integration with existing project documentation
    requirements:
      - Add to appropriate section in CLAUDE.md
      - Keep documentation concise and actionable
      - Link to ai/docs for detailed guides
      - Show common commands and workflows
      - Maintain consistency with existing CLAUDE.md style
    status: todo

  - id: 7.8
    title: Create example schemas repository
    type: documentation
    project: ai/docs
    description: Create complete working examples of schema composition
    deliverables:
      - Example 1: Auth library schema
      - Example 2: Payments library schema
      - Example 3: Application schema importing both
      - Example migrations for each
      - README with setup instructions
    requirements:
      - Create realistic example schemas
      - Include all necessary configuration
      - Show multi-level imports (app imports multiple libs)
      - Include migration files
      - Provide setup and run instructions
      - Demonstrate cross-schema relations
      - Store in ai/docs/examples/prisma-schemas/
    status: todo
```

## Phase 8: Polish and Optimization

```yaml tasks:polish
tasks:
  - id: 8.1
    title: Add performance optimization for large schemas
    type: optimization
    project: cli/tools
    description: Optimize parser and merger for handling large schema files
    deliverables:
      - Streaming parser for large files
      - Caching of parsed schemas
      - Incremental build support
      - Performance benchmarks
    requirements:
      - Handle schemas with 100+ models efficiently
      - Cache parsed schemas to avoid re-parsing
      - Only rebuild schemas that changed or depend on changes
      - Build should complete in <5 seconds for typical project
      - Document performance characteristics
    status: todo

  - id: 8.2
    title: Add schema validation with Prisma CLI
    type: feature
    project: cli/tools
    description: Integrate Prisma CLI validation into build process
    deliverables:
      - Run prisma validate on generated schema
      - Parse Prisma validation errors
      - Map errors back to source schemas
      - User-friendly error reporting
    requirements:
      - Execute prisma validate via child process
      - Capture stdout/stderr
      - Parse Prisma error messages
      - Attribute errors to source schema when possible
      - Fail build if validation fails
    status: todo

  - id: 8.3
    title: Add verbose logging mode
    type: feature
    project: cli/tools
    description: Implement detailed logging for debugging and transparency
    deliverables:
      - --verbose flag support
      - Detailed logging at each build step
      - Timing information for each phase
      - Debug output for graph and merge operations
    requirements:
      - Use logger from existing CLI tools
      - Log parser results in verbose mode
      - Log dependency graph structure
      - Log merge decisions and transformations
      - Show timing for each major operation
      - Keep normal output concise
    status: todo

  - id: 8.4
    title: Add dry-run mode
    type: feature
    project: cli/tools
    description: Implement --dry-run flag to preview build without writing files
    deliverables:
      - --dry-run flag support
      - Preview of generated schema
      - Preview of migration operations
      - No file system writes in dry-run mode
    requirements:
      - Run full build process
      - Display generated schema to console
      - Show migration operations that would be performed
      - Do not write any files
      - Do not run prisma generate
      - Clearly indicate dry-run mode is active
    status: todo

  - id: 8.5
    title: Add progress reporting for long operations
    type: ux
    project: cli/tools
    description: Improve user feedback during build process
    deliverables:
      - Progress bar for multi-step builds
      - Step-by-step progress messages
      - Estimated time remaining
      - Clear completion summary
    requirements:
      - Use ora spinner with step messages
      - Show current operation clearly
      - Update spinner text as operation progresses
      - Show summary statistics on completion
      - Use colors for visual feedback
    status: todo

  - id: 8.6
    title: Handle monorepo workspace configurations
    type: compatibility
    project: cli/tools
    description: Support different monorepo tools and workspace configurations
    deliverables:
      - Support for pnpm workspaces
      - Support for npm workspaces
      - Support for yarn workspaces
      - Automatic detection of workspace type
    requirements:
      - Read pnpm-workspace.yaml for pnpm
      - Read package.json workspaces for npm/yarn
      - Auto-detect workspace configuration
      - Resolve workspace paths correctly for each type
      - Document supported workspace tools
    status: todo

  - id: 8.7
    title: Add comprehensive error recovery
    type: error-handling
    project: cli/tools
    description: Implement graceful error handling and recovery strategies
    deliverables:
      - Rollback mechanism for failed builds
      - Backup of original files before modification
      - Cleanup of partial writes on error
      - Error recovery suggestions
    requirements:
      - Backup schema.prisma before overwriting
      - Restore backup on build failure
      - Clean up partial migration copies
      - Suggest recovery steps in error messages
      - Provide --force flag to skip safety checks if needed
    status: todo

  - id: 8.8
    title: Write performance tests and benchmarks
    type: test
    project: cli/tools
    description: Benchmark tool performance and establish performance requirements
    deliverables:
      - Performance test suite
      - Benchmarks for parsing large schemas
      - Benchmarks for graph building
      - Benchmarks for complete build process
      - Performance regression tests
    requirements:
      - Test with schemas of various sizes (10, 50, 100 models)
      - Test with deep dependency chains (5+ levels)
      - Measure and assert build time <5 seconds for typical project
      - Document performance characteristics
      - Add to CI for regression detection
    status: todo
```

## Task Summary

**Total Tasks:** 66 tasks across 8 phases

**Task Breakdown by Phase:**
- Phase 1 (Parser): 6 tasks
- Phase 2 (Dependency Resolution): 6 tasks
- Phase 3 (Schema Merger): 6 tasks
- Phase 4 (Migration Merger): 7 tasks
- Phase 5 (CLI Commands): 8 tasks
- Phase 6 (Integration Testing): 8 tasks
- Phase 7 (Documentation): 8 tasks
- Phase 8 (Polish & Optimization): 8 tasks

**Task Breakdown by Type:**
- Configuration: 3 tasks
- Parser: 5 tasks
- Service: 7 tasks
- Graph: 3 tasks
- Validation: 2 tasks
- Integration: 4 tasks
- Transformer: 3 tasks
- Merger: 1 task
- Command: 4 tasks
- Feature: 4 tasks
- Error Handling: 3 tasks
- Test: 14 tasks
- Test Fixture: 2 tasks
- Test Infrastructure: 1 task
- CI/CD: 1 task
- Documentation: 8 tasks
- Optimization: 1 task
- UX: 1 task
- Compatibility: 1 task

**Critical Path:**
1. Parser foundation (1.1 → 1.2, 1.3, 1.4 → 1.5 → 1.6)
2. Dependency resolution (2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6)
3. Schema merger (3.1, 3.2, 3.3, 3.4 → 3.5 → 3.6)
4. Migration merger (4.1, 4.2 → 4.3, 4.4 → 4.5 → 4.6 → 4.7)
5. CLI commands (5.1 → 5.2, 5.3, 5.4)
6. Integration testing (6.1, 6.2 → 6.3 → 6.4, 6.6, 6.7)
7. Documentation (all Phase 7 tasks can run in parallel)
8. Polish (all Phase 8 tasks can run after Phase 5-6 completion)

**Parallel Opportunities:**
- Parser components (1.2, 1.3, 1.4) can be developed in parallel
- Schema merger components (3.1, 3.2, 3.3, 3.4) can be developed in parallel
- CLI commands (5.2, 5.3, 5.4) can be developed in parallel after 5.1
- Integration test fixtures (6.1, 6.2) can be created in parallel
- All documentation tasks (Phase 7) can be written in parallel
- All polish tasks (Phase 8) are mostly independent

**Estimated Timeline:**
- Phase 1-2: Week 1
- Phase 3-4: Week 2
- Phase 5-6: Week 3
- Phase 7-8: Week 4

Total: 4 weeks for complete implementation with testing and documentation
