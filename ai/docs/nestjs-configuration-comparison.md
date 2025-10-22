# NestJS Configuration Comparison: packages/nest vs apps/api

**Analysis Date:** 2025-10-22
**Purpose:** Compare official NestJS CLI defaults with current production API configuration

---

## Executive Summary

This document compares two NestJS projects in the fullstack-starter monorepo:

1. **`packages/nest`** - Fresh NestJS CLI scaffold (official defaults)
2. **`apps/api`** - Production API with monorepo integration

**Key Finding:** The dependency injection errors in `apps/api` were caused by using **type-only imports** (`import type`) for services that need runtime dependency injection. This is incompatible with NestJS's decorator-based DI system which requires actual class references.

**Root Cause Analysis:**
```typescript
// ❌ WRONG - Type-only import (no runtime value)
import type { AppService } from './app.service';

// ✅ CORRECT - Regular import (runtime class reference)
import { AppService } from './app.service';
```

NestJS requires actual class constructors for dependency injection metadata. Type-only imports are erased at runtime, leaving `undefined` in the DI container.

---

## Configuration Comparison

### 1. TypeScript Configuration

| Setting | packages/nest (Official) | apps/api (Current) | Impact |
|---------|-------------------------|-------------------|--------|
| **module** | `"nodenext"` (auto-detect) | `"commonjs"` (explicit) | Both output CommonJS for Node.js |
| **moduleResolution** | `"nodenext"` (modern) | `"node"` (classic) | `nodenext` is more accurate |
| **target** | `"ES2023"` | `"ES2021"` | Minor syntax difference |
| **noImplicitAny** | `false` ❌ | `true` ✅ | apps/api is stricter |
| **strictNullChecks** | `true` ✅ | `true` ✅ | Both enforce null safety |
| **strictBindCallApply** | `false` ❌ | `true` ✅ | apps/api is stricter |
| **noUnusedLocals** | Not set | `true` ✅ | apps/api enforces cleanup |
| **noUnusedParameters** | Not set | `true` ✅ | apps/api enforces cleanup |
| **resolvePackageJsonExports** | `true` ✅ | Not set | packages/nest respects modern exports |
| **isolatedModules** | `true` ✅ | `true` ✅ | Both enable safe transpilation |
| **emitDecoratorMetadata** | `true` ✅ | `true` ✅ | Required for NestJS DI |
| **experimentalDecorators** | `true` ✅ | `true` ✅ | Required for NestJS DI |

**Verdict:** `apps/api` has **stricter** TypeScript configuration than official NestJS defaults. This aligns with monorepo standards (no `any`, no unused vars).

---

### 2. NestJS CLI Configuration (nest-cli.json)

| Setting | packages/nest (Official) | apps/api (Current) | Notes |
|---------|-------------------------|-------------------|-------|
| **webpack** | Not set (false) | `true` | apps/api uses webpack bundling |
| **deleteOutDir** | `true` | `true` | Both clean dist/ before build |
| **sourceRoot** | `"src"` | `"src"` | Standard |
| **collection** | `"@nestjs/schematics"` | `"@nestjs/schematics"` | Standard |

**Key Difference:** `apps/api` enables **webpack bundling** for optimized production builds. This is recommended for monorepos to handle workspace package resolution.

---

### 3. Package Dependencies

#### HTTP Platform

| Component | packages/nest | apps/api |
|-----------|--------------|----------|
| **Adapter** | Express (`@nestjs/platform-express`) | Fastify (`@nestjs/platform-fastify`) |
| **Performance** | Baseline | ~2x faster request handling |
| **Logger** | Manual setup | Built-in Fastify logger |

**Recommendation:** Fastify is a better choice for production APIs (faster, built-in logging).

#### Additional Dependencies in apps/api

| Package | Purpose | Why Not in packages/nest |
|---------|---------|--------------------------|
| `@fastify/static` | Static file serving | Optional feature |
| `@nestjs/swagger` | OpenAPI/Swagger docs | Not in minimal scaffold |
| `@prisma/client` | Database ORM | No database in scaffold |
| `class-validator` | DTO validation | Not in minimal scaffold |
| `class-transformer` | DTO transformation | Not in minimal scaffold |
| `@starter/api` | Workspace package (pagination) | Monorepo-specific |
| `@starter/db` | Workspace package (Prisma) | Monorepo-specific |
| `@starter/utils` | Workspace package (errors) | Monorepo-specific |
| `zod` | Runtime validation | Additional validation layer |
| `dotenv` | Environment loading | Production requirement |

**Verdict:** `apps/api` has production-grade dependencies while `packages/nest` is minimal.

---

### 4. Build & Module System

| Aspect | packages/nest | apps/api |
|--------|--------------|----------|
| **Build Tool** | NestJS CLI (TypeScript) | NestJS CLI + Webpack |
| **Output Format** | CommonJS (separate files) | CommonJS (bundled) |
| **Source Maps** | Yes | Yes |
| **Tree Shaking** | No | Yes (via webpack) |
| **External Deps** | Bundled | Workspace packages external |
| **Build Command** | `nest build` | `nest build` |

**Impact of Webpack:** In monorepos, webpack is critical for:
- Marking workspace packages as **externals** (not bundled)
- Proper module resolution for `@starter/*` imports
- Smaller bundle sizes via tree shaking

**Related Error:** The "Cannot find module './app.module'" error occurs when webpack externalizes workspace packages but they're incorrectly imported as type-only.

---

### 5. Testing Configuration

| Setting | packages/nest | apps/api |
|---------|--------------|----------|
| **Framework** | Jest | Jest |
| **Transformer** | ts-jest | ts-jest |
| **Test Pattern** | `.*\.spec\.ts$` | `.*\.spec\.ts$` |
| **Coverage Dir** | `../coverage` | `./coverage` |
| **Path Aliases** | Not configured | Configured (`@/*`, `@starter/*`) |
| **E2E Tests** | Separate config (`test/jest-e2e.json`) | Not configured |

**Recommendation:** `apps/api` should add E2E test configuration similar to `packages/nest`.

---

### 6. Linting & Formatting

| Tool | packages/nest | apps/api |
|------|--------------|----------|
| **ESLint** | v9 Flat Config (`eslint.config.mjs`) | Biome (unified linter + formatter) |
| **Prettier** | Standalone (`.prettierrc`) | Integrated with Biome |
| **Rules** | Permissive (allows `any`) | Strict (no `any`, no assertions) |

**Philosophy:**
- `packages/nest`: Beginner-friendly, loose linting
- `apps/api`: Production-grade, enforces best practices

---

## Root Cause: Dependency Injection Failure

### The Problem

When running `pnpm dev`, NestJS threw this error:

```
ERROR [ExceptionHandler] Nest can't resolve dependencies of the AppController (?).
Please make sure that the argument Object at index [0] is available in the AppModule context.
```

### The Cause

**Files with incorrect imports:**

1. `apps/api/src/app.controller.ts`:
```typescript
import type { AppService } from './app.service';  // ❌ Type-only import
```

2. `apps/api/src/resources/resources.controller.ts`:
```typescript
import type { ResourcesService } from './resources.service';  // ❌ Type-only import
```

### Why This Breaks NestJS

NestJS dependency injection works via **decorator metadata**:

```typescript
@Injectable()
export class AppService { }

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  //                                       ^^^^^^^^^^^ NestJS reads this type at runtime
}
```

**Metadata Flow:**
1. TypeScript's `emitDecoratorMetadata: true` emits type information as metadata
2. `reflect-metadata` library stores this at runtime
3. NestJS reads `design:paramtypes` metadata to resolve dependencies

**What happens with `import type`:**
```typescript
import type { AppService } from './app.service';  // Erased at runtime

// Compiled output (metadata):
Reflect.metadata("design:paramtypes", [Object])  // ❌ Lost type info!
//                                      ^^^^^^ Generic Object, not AppService
```

**What happens with regular import:**
```typescript
import { AppService } from './app.service';  // Available at runtime

// Compiled output (metadata):
Reflect.metadata("design:paramtypes", [AppService])  // ✅ Correct type!
//                                      ^^^^^^^^^^ Actual class reference
```

### The Fix

Changed both controllers from type-only to regular imports:

```diff
- import type { AppService } from './app.service';
+ import { AppService } from './app.service';

- import type { ResourcesService } from './resources.service';
+ import { ResourcesService } from './resources.service';
```

**Result:** Dependency injection now works correctly.

---

## Best Practices from Official NestJS

### 1. Import Patterns

**Services & Providers:**
```typescript
// ✅ CORRECT - Regular import for DI
import { AppService } from './app.service';

// ✅ ALSO CORRECT - Types that aren't injected can be type-only
import type { CreateResourceDto } from './dto';
```

**Rule:** Only use `import type` for **types/interfaces** that are never used as runtime values (DTOs, interfaces, type aliases). Always use regular imports for **classes** used in dependency injection.

### 2. Module Resolution

The official NestJS CLI uses **`moduleResolution: "nodenext"`** which properly handles:
- Package.json `exports` field
- ESM/CommonJS dual packages
- Modern Node.js resolution algorithm

**Recommendation:** Update `apps/api/tsconfig.json`:
```diff
{
  "compilerOptions": {
-   "moduleResolution": "node",
+   "moduleResolution": "nodenext",
    "module": "commonjs",
+   "resolvePackageJsonExports": true
  }
}
```

### 3. TypeScript Strictness

Official defaults are permissive (`noImplicitAny: false`), but production code should be strict.

**Current `apps/api` approach is better** - keep strict mode enabled.

### 4. Testing Structure

Official scaffold separates unit and E2E tests:
- **Unit tests:** `src/**/*.spec.ts` (fast, isolated)
- **E2E tests:** `test/**/*.e2e-spec.ts` (slow, full integration)

**Recommendation:** Add E2E tests to `apps/api`:
```bash
mkdir apps/api/test
# Create jest-e2e.json and app.e2e-spec.ts
```

### 5. Webpack for Monorepos

When using workspace packages, enable webpack in `nest-cli.json`:
```json
{
  "compilerOptions": {
    "webpack": true,
    "webpackConfigPath": "webpack.config.js"  // Optional custom config
  }
}
```

This ensures:
- Workspace packages are marked as externals
- Tree shaking removes unused code
- Source maps work correctly

---

## Configuration Recommendations

### Priority 1: Fix Import Patterns (COMPLETED)

**Status:** ✅ Fixed by changing type-only imports to regular imports

**Files Modified:**
- `apps/api/src/app.controller.ts`
- `apps/api/src/resources/resources.controller.ts`

### Priority 2: Update TypeScript Module Resolution

**File:** `apps/api/tsconfig.json`

```diff
{
  "compilerOptions": {
-   "moduleResolution": "node",
+   "moduleResolution": "nodenext",
+   "resolvePackageJsonExports": true
  }
}
```

**Benefits:**
- Better package.json `exports` field handling
- Future-proof for ESM migration
- Matches official NestJS defaults

### Priority 3: Verify Webpack Configuration

**File:** `apps/api/nest-cli.json`

Current configuration already enables webpack:
```json
{
  "compilerOptions": {
    "webpack": true  // ✅ Already enabled
  }
}
```

**Verify externals** are properly configured for workspace packages. Check if a custom `webpack.config.js` is needed to mark `@starter/*` as external.

### Priority 4: Add E2E Testing

**Test Naming Convention:**
- **Unit/Integration tests**: `*.spec.ts` (located in `src/`)
- **E2E tests**: `*.e2e.spec.ts` (located in `test/`)

**Create:** `apps/api/test/` directory with E2E tests

```bash
mkdir apps/api/test
```

**Add:** `apps/api/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e.spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@starter/(.*)$": "<rootDir>/../../packages/$1/src"
  }
}
```

**Add:** `apps/api/test/resources.e2e.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ResourcesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/resources (GET)', () => {
    return request(app.getHttpServer())
      .get('/resources')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('total');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Add script to package.json:**
```json
{
  "scripts": {
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### Priority 5: Missing @fastify/static Package

**Status:** ✅ Fixed by installing `@fastify/static@^7.0.4`

The package was missing, causing a warning during startup. Now installed with the correct version compatible with `@nestjs/platform-fastify`.

---

## Turborepo Integration Best Practices

Based on the guidance you provided, here's how our current setup aligns:

### Current turbo.json Analysis

**File:** `C:\Users\bruno\Documents\Work\Projects\fullstack-starter\turbo.json`

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],    // ✅ Build dependencies first
      "outputs": ["dist/**"]      // ✅ Cache dist/ folder
    },
    "dev": {
      "cache": false,             // ✅ Never cache dev mode
      "persistent": true          // ✅ Keep process running
    },
    "test": {
      "dependsOn": ["^build"],    // ✅ Build before testing
      "cache": false              // Consider enabling cache
    },
    "lint": {
      "dependsOn": ["^build"]     // ✅ Build before linting
    }
  }
}
```

**Alignment with Best Practices:**
- ✅ Build dependencies configured correctly
- ✅ Output directories specified for caching
- ✅ Dev mode doesn't cache (correct for watch mode)
- ✅ Persistent dev tasks configured

**Potential Improvements:**

1. **Enable test caching** (optional):
```json
{
  "test": {
    "dependsOn": ["^build"],
    "outputs": ["coverage/**"]  // Cache coverage reports
  }
}
```

2. **Add typecheck task:**
```json
{
  "typecheck": {
    "dependsOn": ["^build"],
    "outputs": []
  }
}
```

---

## PNPM Workspace Integration

### Current Configuration

**Root package.json:**
```json
{
  "name": "@fullstack-starter/root",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "configs/*",
    "tools"
  ]
}
```

**Workspace Dependencies in apps/api:**
```json
{
  "dependencies": {
    "@starter/api": "workspace:*",
    "@starter/db": "workspace:*",
    "@starter/utils": "workspace:*"
  }
}
```

**Status:** ✅ Properly configured

The `workspace:*` protocol ensures:
- Type-safe imports across packages
- Automatic linking (no symlink issues)
- Central dependency deduplication
- Correct build order via Turborepo

---

## Summary & Action Items

### ✅ Completed

1. **Fixed dependency injection errors** - Changed type-only imports to regular imports
2. **Installed @fastify/static** - Compatible version 7.0.4
3. **Analyzed both projects** - Comprehensive comparison documented

### 🔄 Recommended Next Steps

1. **Update module resolution** (Priority 2)
   - Change to `moduleResolution: "nodenext"`
   - Add `resolvePackageJsonExports: true`

2. **Add E2E testing** (Priority 4)
   - Create `apps/api/test/` directory
   - Add jest-e2e.json configuration
   - Write E2E tests for Resources API

3. **Verify webpack externals** (Priority 3)
   - Confirm `@starter/*` packages are externalized
   - Check if custom webpack.config.js is needed

4. **Consider test caching** (Optional)
   - Enable cache for test task in turbo.json
   - Cache coverage reports

### 📋 Checklist for Future NestJS Apps in Monorepo

- [ ] Enable webpack in nest-cli.json
- [ ] Use `workspace:*` for local package dependencies
- [ ] Configure path aliases in tsconfig.json and jest.config.js
- [ ] Never use `import type` for classes used in dependency injection
- [ ] Set up both unit tests and E2E tests
- [ ] Configure Turborepo tasks (build, dev, test, lint)
- [ ] Use Fastify adapter for better performance
- [ ] Enable strict TypeScript mode
- [ ] Add Swagger/OpenAPI documentation
- [ ] Set up Prisma for database access

---

## References

- **Official NestJS CLI:** `npx @nestjs/cli new`
- **Turborepo + NestJS:** https://turbo.build/repo/docs/guides/tools/nestjs
- **PNPM Workspaces:** https://pnpm.io/workspaces
- **NestJS Webpack:** https://docs.nestjs.com/cli/monorepo#webpack-options
- **TypeScript Decorators:** https://www.typescriptlang.org/docs/handbook/decorators.html

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Next Review:** When adding new NestJS apps to monorepo
