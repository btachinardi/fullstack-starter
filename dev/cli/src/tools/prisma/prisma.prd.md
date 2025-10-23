# Prisma Build Tool - Product Requirements Document

**Version:** 1.0
**Status:** Draft
**Author:** System Architecture
**Date:** 2025-10-23

---

## Executive Summary

A build tool that enables modular Prisma schema composition across a monorepo, allowing libraries to define their own schemas and applications to compose them through a comment-based import system with automatic dependency resolution, migration merging, and database schema namespacing.

---

## Problem Statement

### Current State

The project uses Prisma for database management with Better Auth requiring specific schema models. Currently:

- Auth schema is defined in `libs/api/prisma/schema.prisma`
- Applications cannot extend this schema without duplication
- No clear pattern for library-level schemas
- Migration management is centralized
- No isolation between domain schemas

### Pain Points

1. **Schema Duplication**: Auth models must be copied to each application
2. **No Modularity**: Libraries cannot ship with their own schemas
3. **Tight Coupling**: Application schemas are monolithic
4. **Migration Conflicts**: No automatic merging of library migrations
5. **Namespace Collisions**: All models share the same namespace
6. **Testing Complexity**: Cannot test library schemas in isolation

### Impact

- Reduced code reuse
- Increased maintenance burden
- Difficult to share domain logic across applications
- Poor separation of concerns
- Challenging integration testing

---

## Goals

### Primary Goals

1. **Modular Schemas**: Enable libraries to define and ship Prisma schemas
2. **Schema Composition**: Support importing schemas from dependencies
3. **Migration Merging**: Automatically merge migrations from all imported schemas
4. **Namespace Isolation**: Use PostgreSQL schemas to prevent naming conflicts
5. **Dependency Resolution**: Build dependency graphs and resolve in correct order
6. **Testing Infrastructure**: Support isolated testing of library schemas

### Secondary Goals

- Clear generation boundaries in composed schemas
- Developer-friendly syntax (comment-based imports)
- IDE compatibility (preserve Prisma LSP functionality)
- Migration timestamp preservation
- Comprehensive error messages

### Non-Goals

- **Multi-database support**: Focus on PostgreSQL first
- **Runtime schema composition**: Build-time only
- **Automatic schema updates**: Manual trigger required
- **Backward compatibility**: Breaking changes acceptable for v1
- **GUI tools**: CLI-only interface

---

## Success Metrics

### Technical Metrics

- **Schema Composition Time**: < 1 second for typical project
- **Migration Merge Accuracy**: 100% correct ordering
- **Test Coverage**: ≥ 90% for build tool
- **Error Detection**: Catch circular dependencies and conflicts

### Developer Experience Metrics

- **Setup Time**: < 5 minutes to add schema imports
- **Build Errors**: Clear error messages with actionable guidance
- **Documentation**: Complete examples for all use cases

---

## User Stories

### Library Author

**As a** library author
**I want to** define a Prisma schema within my library
**So that** I can ship domain models with my library code

**Acceptance Criteria:**
- Library can have `prisma/schema.prisma`
- Schema can use database schema namespacing
- Tests can validate schema in isolation
- Migrations are version-controlled

### Application Developer

**As an** application developer
**I want to** import schemas from my libraries
**So that** I can compose my application schema from reusable modules

**Acceptance Criteria:**
- Can import using comment syntax
- Generated schema includes all dependencies
- Migrations are automatically merged
- Clear generation boundaries in output

### DevOps Engineer

**As a** DevOps engineer
**I want** migrations to be automatically merged
**So that** I can deploy with a single migration command

**Acceptance Criteria:**
- Migrations ordered by timestamp
- No manual intervention required
- Works with CI/CD pipelines
- Rollback support

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Build Tool                        │
│                    (cli/tools/prisma)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │        Schema Dependency Graph         │
        │                                        │
        │  libs/api → auth schema (PostgreSQL)   │
        │       │                                │
        │       ▼                                │
        │  apps/api → app schema + auth import   │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │         Schema Composition             │
        │                                        │
        │  1. Parse import comments              │
        │  2. Resolve dependencies               │
        │  3. Merge schemas with boundaries      │
        │  4. Apply namespace transformations    │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │         Migration Merging              │
        │                                        │
        │  1. Collect all migrations             │
        │  2. Sort by timestamp                  │
        │  3. Generate merged migration          │
        │  4. Update migration lock              │
        └────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Generated Files  │
                    │                   │
                    │  • schema.prisma  │
                    │  • migrations/    │
                    └──────────────────┘
```

### Component Architecture

#### 1. Schema Parser

**Responsibility:** Parse Prisma schema files and extract metadata

**Features:**
- Extract import comments
- Identify generation boundaries
- Parse database schema declarations
- Extract model definitions

**Input:**
```prisma
// @prisma-import: @libs/api/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// GENERATED SECTION - DO NOT EDIT MANUALLY
// This section is automatically generated by the Prisma Build Tool
// ============================================================================

// ============================================================================
// END GENERATED SECTION
// ============================================================================

model Post {
  id String @id @default(cuid())
}
```

**Output:**
```typescript
{
  imports: ['@libs/api/prisma/schema.prisma'],
  generationBoundary: { start: 10, end: 14 },
  models: [...],
  datasource: {...},
  generator: {...}
}
```

#### 2. Dependency Graph Builder

**Responsibility:** Build and validate dependency graph

**Features:**
- Resolve workspace paths (@libs/*, @apps/*)
- Detect circular dependencies
- Topological sort
- Validate all imports exist

**Algorithm:**
```typescript
function buildDependencyGraph(entryPoint: string): DependencyGraph {
  const graph = new Map<string, Set<string>>();
  const visited = new Set<string>();

  function visit(path: string) {
    if (visited.has(path)) {
      throw new CircularDependencyError(path);
    }

    visited.add(path);
    const schema = parseSchema(path);

    for (const importPath of schema.imports) {
      const resolved = resolveWorkspacePath(importPath);
      graph.get(path)?.add(resolved);
      visit(resolved);
    }

    visited.delete(path);
  }

  visit(entryPoint);
  return topologicalSort(graph);
}
```

#### 3. Schema Merger

**Responsibility:** Merge schemas preserving boundaries and namespaces

**Features:**
- Respect generation boundaries
- Apply database schema prefixes
- Merge datasource/generator configs
- Preserve comments and formatting

**Merge Strategy:**
```typescript
function mergeSchemas(schemas: ParsedSchema[]): string {
  const sections: string[] = [];

  // 1. Merge datasource/generator (use app's config)
  sections.push(schemas[schemas.length - 1].config);

  // 2. Add generation boundary marker
  sections.push(GENERATION_BOUNDARY_START);

  // 3. Merge imported schemas with namespace transforms
  for (const schema of schemas.slice(0, -1)) {
    const transformed = applyNamespaceTransform(schema);
    sections.push(transformed);
  }

  sections.push(GENERATION_BOUNDARY_END);

  // 4. Add app's native models
  sections.push(schemas[schemas.length - 1].models);

  return sections.join('\n\n');
}
```

#### 4. Migration Merger

**Responsibility:** Merge migrations from all dependencies

**Features:**
- Collect migrations from all schemas
- Sort by timestamp (extracted from filename)
- Generate merged migration directory
- Preserve migration history

**Migration File Format:**
```
YYYYMMDDHHMMSS_description.sql
20241023120000_init_auth.sql
20241023130000_add_posts.sql
```

**Merge Algorithm:**
```typescript
function mergeMigrations(schemas: ParsedSchema[]): Migration[] {
  const allMigrations: Migration[] = [];

  for (const schema of schemas) {
    const migrations = loadMigrations(schema.migrationPath);
    for (const migration of migrations) {
      migration.namespace = schema.dbSchema;
      allMigrations.push(migration);
    }
  }

  // Sort by timestamp (filename prefix)
  return allMigrations.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}
```

---

## Schema Import Syntax

### Comment-Based Imports

**Format:**
```prisma
// @prisma-import: <workspace-path>
```

**Examples:**
```prisma
// Single import
// @prisma-import: @libs/api/prisma/schema.prisma

// Multiple imports
// @prisma-import: @libs/auth/prisma/schema.prisma
// @prisma-import: @libs/payments/prisma/schema.prisma
```

**Rules:**
- Must be at the start of the file (before datasource)
- One import per line
- Workspace paths only (@libs/*, @apps/*)
- Relative paths not supported

### Generation Boundaries

**Format:**
```prisma
// ============================================================================
// GENERATED SECTION - DO NOT EDIT MANUALLY
// This section is automatically generated by the Prisma Build Tool
// Generated from:
//   - @libs/api/prisma/schema.prisma
//   - @libs/payments/prisma/schema.prisma
// Last updated: 2024-10-23T12:00:00Z
// ============================================================================

[GENERATED CONTENT HERE]

// ============================================================================
// END GENERATED SECTION
// ============================================================================
```

**Purpose:**
- Clear visual separation
- Prevent manual edits
- Track generation metadata
- IDE-friendly formatting

---

## Database Schema Namespacing

### PostgreSQL Schemas

Each library uses a PostgreSQL schema for namespace isolation:

```prisma
// libs/api/prisma/schema.prisma

generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/prisma"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth"]
}

model User {
  id    String @id
  email String @unique

  @@schema("auth")
}
```

### Namespace Rules

1. **Library Convention:** `@@schema("<library-name>")`
   - `@libs/api` → `@@schema("auth")`
   - `@libs/payments` → `@@schema("payments")`

2. **App Convention:** `@@schema("public")` (default)

3. **Foreign Keys:** Cross-schema relations supported
   ```prisma
   model Post {
     id       String @id
     authorId String
     author   User   @relation(fields: [authorId], references: [id])

     @@schema("public")
   }

   model User {
     id    String @id
     posts Post[]

     @@schema("auth")
   }
   ```

### Migration Considerations

- Each schema gets separate migration files
- Build tool merges into single migration stream
- Order preserved by timestamp
- Schema creation handled automatically

---

## CLI Tool Design

### Tool Location

```
cli/tools/
├── src/
│   └── commands/
│       └── prisma/
│           ├── build.ts          # Main build command
│           ├── parser.ts         # Schema parser
│           ├── graph.ts          # Dependency graph
│           ├── merger.ts         # Schema merger
│           ├── migrations.ts     # Migration merger
│           └── validator.ts      # Schema validator
└── package.json
```

### Commands

#### `build` - Build composed schema

**Usage:**
```bash
pnpm tools prisma build <schema-path>

# Examples
pnpm tools prisma build apps/api/prisma/schema.prisma
pnpm tools prisma build libs/api/prisma/schema.prisma --test
```

**Options:**
- `--test` - Run in test mode (validate only, no write)
- `--watch` - Watch for changes and rebuild
- `--verbose` - Detailed logging
- `--dry-run` - Show what would be generated

**Behavior:**
1. Parse schema and extract imports
2. Build dependency graph
3. Validate no circular dependencies
4. Merge schemas with generation boundaries
5. Merge migrations by timestamp
6. Write output files
7. Run Prisma generate

#### `validate` - Validate schema composition

**Usage:**
```bash
pnpm tools prisma validate <schema-path>
```

**Checks:**
- All imports exist
- No circular dependencies
- All namespaces unique
- Valid Prisma syntax
- Migration consistency

#### `graph` - Visualize dependency graph

**Usage:**
```bash
pnpm tools prisma graph <schema-path>
```

**Output:**
```
Dependency Graph:
  apps/api/prisma/schema.prisma
    └─ @libs/api/prisma/schema.prisma
       └─ (no dependencies)
```

---

## Testing Strategy

### Unit Tests

**Location:** `cli/tools/src/commands/prisma/__tests__/`

**Coverage:**
- Schema parser
- Dependency graph builder
- Schema merger
- Migration merger
- Namespace transformer

**Example:**
```typescript
describe('SchemaParser', () => {
  it('should extract import comments', () => {
    const schema = `
      // @prisma-import: @libs/api/prisma/schema.prisma
      datasource db { ... }
    `;

    const parsed = parseSchema(schema);
    expect(parsed.imports).toEqual(['@libs/api/prisma/schema.prisma']);
  });

  it('should identify generation boundaries', () => {
    const schema = `
      // GENERATED SECTION
      model User { }
      // END GENERATED SECTION
    `;

    const parsed = parseSchema(schema);
    expect(parsed.generationBoundary).toBeDefined();
  });
});
```

### Integration Tests

**Location:** `libs/api/test/integration/`

**Approach:**
```typescript
describe('Auth Schema Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Build schema
    await buildPrismaSchema('libs/api/prisma/schema.prisma');

    // Run migrations
    await execAsync('npx prisma migrate deploy');

    // Initialize client
    prisma = new PrismaClient();
  });

  it('should create user with auth schema', async () => {
    const user = await prisma.user.create({
      data: {
        id: 'test-id',
        email: 'test@example.com',
      },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

### Test Database Strategy

**Approach:** Each library test uses isolated test database

**Setup:**
```typescript
// libs/api/test/setup.ts

export async function setupTestDatabase() {
  const testDbUrl = `${process.env.DATABASE_URL}_test`;

  // Create test database
  await createDatabase(testDbUrl);

  // Run migrations
  await runMigrations(testDbUrl);

  // Seed data
  await seedDatabase(testDbUrl);

  return testDbUrl;
}
```

---

## Migration Management

### Migration File Structure

```
libs/api/prisma/migrations/
├── 20241023120000_init_auth/
│   └── migration.sql
└── migration_lock.toml

apps/api/prisma/migrations/
├── 20241023120000_init_auth/          # From @libs/api
│   └── migration.sql
├── 20241023130000_add_posts/          # Native migration
│   └── migration.sql
└── migration_lock.toml
```

### Merge Process

1. **Collect Migrations**
   - Scan all imported schemas
   - Load migration files
   - Extract timestamps from filenames

2. **Sort by Timestamp**
   - Parse `YYYYMMDDHHMMSS` prefix
   - Sort chronologically
   - Preserve relative order within same timestamp

3. **Generate Merged Directory**
   - Copy migrations to app's directory
   - Preserve folder structure
   - Update migration_lock.toml

4. **Namespace Transformations**
   - Prepend `CREATE SCHEMA IF NOT EXISTS` statements
   - Add schema prefix to all DDL statements
   - Example:
     ```sql
     -- Original (libs/api)
     CREATE TABLE "User" (...);

     -- Transformed (apps/api)
     CREATE SCHEMA IF NOT EXISTS auth;
     CREATE TABLE auth."User" (...);
     ```

### Migration Lock

```toml
# apps/api/prisma/migration_lock.toml

provider = "postgresql"

[imports]
"@libs/api" = "20241023120000_init_auth"

[native]
last_migration = "20241023130000_add_posts"
```

---

## Error Handling

### Error Categories

#### 1. Circular Dependency

**Error:**
```
Error: Circular dependency detected

  apps/api/prisma/schema.prisma
    → @libs/payments/prisma/schema.prisma
    → @libs/api/prisma/schema.prisma
    → apps/api/prisma/schema.prisma (circular!)

To fix: Remove one of the imports to break the cycle.
```

#### 2. Import Not Found

**Error:**
```
Error: Cannot resolve import

  File: apps/api/prisma/schema.prisma
  Import: @libs/nonexistent/prisma/schema.prisma

  The imported schema does not exist.

To fix:
  - Check the import path is correct
  - Ensure the library is installed
  - Verify the schema file exists
```

#### 3. Namespace Collision

**Error:**
```
Error: Namespace collision detected

  Model "User" exists in multiple schemas without @@schema:
    - @libs/api/prisma/schema.prisma
    - @libs/auth/prisma/schema.prisma

To fix: Add @@schema("namespace") to one or both models
```

#### 4. Invalid Syntax

**Error:**
```
Error: Prisma syntax error in generated schema

  Line 45: Unexpected token '}'

  Generated from: @libs/api/prisma/schema.prisma

To fix: Validate the source schema with 'prisma validate'
```

---

## Development Workflow

### Adding Schema to Library

1. **Create schema file**
   ```bash
   mkdir -p libs/mylib/prisma
   touch libs/mylib/prisma/schema.prisma
   ```

2. **Define schema with namespace**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     schemas  = ["mylib"]
   }

   model MyModel {
     id String @id

     @@schema("mylib")
   }
   ```

3. **Add integration tests**
   ```typescript
   // libs/mylib/test/integration/schema.test.ts
   describe('MyLib Schema', () => {
     it('should validate schema', async () => {
       await buildPrismaSchema('libs/mylib/prisma/schema.prisma');
     });
   });
   ```

4. **Generate and test**
   ```bash
   pnpm tools prisma build libs/mylib/prisma/schema.prisma --test
   cd libs/mylib && npx prisma migrate dev
   pnpm test
   ```

### Composing in Application

1. **Add import comment**
   ```prisma
   // @prisma-import: @libs/mylib/prisma/schema.prisma

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     schemas  = ["public", "mylib"]
   }
   ```

2. **Build composed schema**
   ```bash
   pnpm tools prisma build apps/api/prisma/schema.prisma
   ```

3. **Review generated schema**
   ```prisma
   // ============================================================================
   // GENERATED SECTION
   // Generated from: @libs/mylib/prisma/schema.prisma
   // ============================================================================

   model MyModel {
     id String @id
     @@schema("mylib")
   }

   // ============================================================================
   // END GENERATED SECTION
   // ============================================================================

   model Post {
     id String @id
     @@schema("public")
   }
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev
   ```

---

## Implementation Plan

### Phase 1: Core Parser (Week 1)

- [ ] Schema file parser
- [ ] Import comment extraction
- [ ] Generation boundary detection
- [ ] Basic validation
- [ ] Unit tests

### Phase 2: Dependency Resolution (Week 1)

- [ ] Workspace path resolver
- [ ] Dependency graph builder
- [ ] Circular dependency detection
- [ ] Topological sort
- [ ] Unit tests

### Phase 3: Schema Merger (Week 2)

- [ ] Schema merger implementation
- [ ] Generation boundary injection
- [ ] Namespace transformation
- [ ] Config merging (datasource/generator)
- [ ] Unit tests

### Phase 4: Migration Merger (Week 2)

- [ ] Migration file scanner
- [ ] Timestamp parser
- [ ] Migration sorter
- [ ] Namespace SQL transformer
- [ ] Unit tests

### Phase 5: CLI Tool (Week 3)

- [ ] Build command
- [ ] Validate command
- [ ] Graph command
- [ ] Watch mode
- [ ] Error messages

### Phase 6: Integration Testing (Week 3)

- [ ] libs/api integration tests
- [ ] apps/api composition tests
- [ ] Test database setup
- [ ] Seed data
- [ ] CI/CD integration

### Phase 7: Documentation (Week 4)

- [ ] Architecture guide
- [ ] API documentation
- [ ] Usage examples
- [ ] Troubleshooting guide
- [ ] Migration guide

---

## Open Questions

1. **Schema validation timing**: Should we run `prisma validate` on generated schema?
2. **Watch mode performance**: How to optimize for large schemas?
3. **Migration rollback**: How to handle rollback with merged migrations?
4. **Multi-database support**: Future support for MySQL, SQLite?
5. **IDE integration**: Can we provide Prisma LSP hints for imports?

---

## Risks and Mitigations

### Risk 1: Prisma Version Compatibility

**Risk:** Prisma updates may break parsing logic
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Pin Prisma version in tool dependencies
- Comprehensive test coverage
- Version compatibility matrix

### Risk 2: Complex Dependency Graphs

**Risk:** Large apps may have deep dependency chains
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Optimize graph algorithms
- Cache parsed schemas
- Implement incremental builds

### Risk 3: Migration Conflicts

**Risk:** Merged migrations may conflict
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Timestamp-based ordering
- Namespace isolation
- Pre-merge validation

### Risk 4: Learning Curve

**Risk:** Developers may struggle with new concepts
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Comprehensive documentation
- Example projects
- Clear error messages
- Migration guide from existing setup

---

## Success Criteria

### Must Have

- ✅ Schema composition works for libs/api → apps/api
- ✅ Migrations merge correctly with timestamps
- ✅ Integration tests pass for auth schema
- ✅ No breaking changes to existing Prisma workflows
- ✅ Clear error messages for common issues

### Should Have

- ✅ Watch mode for development
- ✅ Validation command
- ✅ Dependency graph visualization
- ✅ Test database isolation
- ✅ Documentation with examples

### Nice to Have

- IDE autocomplete for imports
- Performance metrics
- Migration rollback support
- Multi-database support
- GUI tool

---

## Appendix

### Example: Full Workflow

**Step 1: Library Schema (libs/api)**

```prisma
// libs/api/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth"]
}

model User {
  id            String    @id
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  image         String?
  sessions      Session[]
  accounts      Account[]

  @@schema("auth")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}

model Account {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}
```

**Step 2: Application Schema (apps/api)**

```prisma
// apps/api/prisma/schema.prisma

// @prisma-import: @libs/api/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth"]
}

// ============================================================================
// GENERATED SECTION - DO NOT EDIT MANUALLY
// This section is automatically generated by the Prisma Build Tool
// Generated from:
//   - @libs/api/prisma/schema.prisma
// Last updated: 2024-10-23T12:00:00Z
// ============================================================================

model User {
  id            String    @id
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  image         String?
  sessions      Session[]
  accounts      Account[]
  posts         Post[]    // Added relation

  @@schema("auth")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}

model Account {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}

// ============================================================================
// END GENERATED SECTION
// ============================================================================

// Application-specific models

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@schema("public")
}
```

**Step 3: Build Command**

```bash
pnpm tools prisma build apps/api/prisma/schema.prisma
```

**Step 4: Output**

```
✓ Parsing schema: apps/api/prisma/schema.prisma
✓ Found imports: @libs/api/prisma/schema.prisma
✓ Building dependency graph
✓ Resolving dependencies
✓ Merging schemas
✓ Merging migrations (2 found)
✓ Generating schema
✓ Running prisma generate

Schema built successfully!
  - Models: 4 (3 imported, 1 native)
  - Migrations: 2 merged
  - Namespaces: auth, public
```

### Glossary

- **Schema Composition**: Combining multiple Prisma schemas into one
- **Generation Boundary**: Marked section in schema that's auto-generated
- **Database Schema**: PostgreSQL namespace (e.g., `public`, `auth`)
- **Dependency Graph**: Tree of import relationships between schemas
- **Migration Merging**: Combining migrations from multiple sources
- **Workspace Path**: Monorepo path using @ syntax (e.g., `@libs/api`)
- **Namespace Isolation**: Using PostgreSQL schemas to prevent naming conflicts

---

## References

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Better Auth Schema Requirements](https://www.better-auth.com/docs/concepts/database)

---

**End of Document**
