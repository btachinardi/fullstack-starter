# Test Fixtures - Prisma Build Tool

Test schemas for validating the Prisma build tool in various scenarios.

---

## Test Projects

### 1. test-auth (No Dependencies)

**Purpose:** Test basic library schema with no imports

**Schema:** `auth` namespace
**Models:**
- User
- Session

**Use Cases:**
- Basic schema parsing
- Single schema build
- Namespace extraction

---

### 2. test-payments (No Dependencies)

**Purpose:** Test independent library schema

**Schema:** `payments` namespace
**Models:**
- Payment
- Transaction
**Enums:**
- PaymentStatus

**Use Cases:**
- Enum extraction
- Independent library testing
- Multiple model handling

---

### 3. test-blog (Imports test-auth)

**Purpose:** Test library-to-library dependency

**Schema:** `blog` namespace
**Imports:** `test-auth`
**Models:**
- Post
- Comment

**Use Cases:**
- Dependency chain resolution
- Cross-library imports
- Multi-level dependency testing

---

### 4. test-app (Imports All)

**Purpose:** Test application importing multiple libraries

**Schema:** `public` namespace
**Imports:**
- test-auth
- test-payments
- test-blog

**Models:**
- Product
- Order

**Enums:**
- OrderStatus

**Use Cases:**
- Multiple import resolution
- Complex dependency graph
- Complete schema composition
- All namespaces together

---

### 5. test-circular-a & test-circular-b

**Purpose:** Test circular dependency detection

**Schema:** `circular_a` and `circular_b`
**Imports:** Each imports the other

**Use Cases:**
- Circular dependency error detection
- Error message validation
- Graph cycle detection

---

## Dependency Graph

```
test-app
├── test-auth (no dependencies)
├── test-payments (no dependencies)
└── test-blog
    └── test-auth (already resolved)

test-circular-a ⟷ test-circular-b (cycle!)
```

---

## Test Scenarios

### Scenario 1: Single Library Schema
```bash
pnpm tools prisma build test/fixtures/test-auth/prisma/schema.prisma
```
**Expected:** Success, no imports, 2 models

### Scenario 2: Library Importing Library
```bash
pnpm tools prisma build test/fixtures/test-blog/prisma/schema.prisma
```
**Expected:** Success, 1 import, 4 models (2 from auth + 2 native)

### Scenario 3: App Importing Multiple Libraries
```bash
pnpm tools prisma build test/fixtures/test-app/prisma/schema.prisma
```
**Expected:** Success, 3 imports, 8 models total

### Scenario 4: Circular Dependency
```bash
pnpm tools prisma build test/fixtures/test-circular-a/prisma/schema.prisma
```
**Expected:** Error with cycle path shown

---

## Using in Tests

```typescript
import { resolve } from 'node:path';

const fixturesDir = resolve(__dirname, '../test/fixtures');

// Test paths
const authSchema = resolve(fixturesDir, 'test-auth/prisma/schema.prisma');
const blogSchema = resolve(fixturesDir, 'test-blog/prisma/schema.prisma');
const appSchema = resolve(fixturesDir, 'test-app/prisma/schema.prisma');
const circularA = resolve(fixturesDir, 'test-circular-a/prisma/schema.prisma');
```

---

## Validation Checklist

- [x] test-auth: No dependencies, auth namespace
- [x] test-payments: No dependencies, payments namespace
- [x] test-blog: Imports test-auth, blog namespace
- [x] test-app: Imports all 3 libs, public namespace
- [x] test-circular-a/b: Circular dependency test
- [ ] Migrations: Add test migrations (future)
- [ ] Invalid schemas: Add malformed schema tests (future)

---

## Notes

- All schemas use relative imports for test isolation
- Each schema defines its own namespace
- Fixtures are self-contained (no external dependencies)
- Can be used for both unit and integration tests
