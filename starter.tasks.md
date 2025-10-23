# Fullstack Starter - Modular Architecture Migration Tasks

> **Source**: starter.prd.md
> **Status**: Not Started
> **Priority**: High
> **Estimated Effort**: 13-17 hours

---

## Phase 1: Core Infrastructure Migration & Consolidation

**Objective**: Consolidate 9 flat libraries into 4 core packages with clear separation of concerns
**Checkpoint**: ✅ Checkpoint 1 - Core libraries functional, apps working with bootstrap

### Task 1.1: Create Core Library Structure

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 20 minutes
**Dependencies**: None
**Type**: Infrastructure

**Description**:
Create the new `libs/core/*` directory structure for 4 consolidated core packages.

**Deliverables**:
- [ ] Create `libs/core/` directory
- [ ] Create subdirectories: `api/`, `web/`, `ui/`, `utils/`
- [ ] Document consolidation strategy in task notes

**Requirements**:
- Only 4 core packages: api (backend everything), web (frontend everything), ui (components + cn), utils (pure TS + shared errors)
- Maintain consistency with PNPM workspace conventions
- Prepare for package.json updates

**Acceptance Criteria**:
- All `libs/core/*` directories exist (4 total)
- Directory structure matches PRD specification

---

### Task 1.2: Create @libs/core/utils - Pure TypeScript Utilities

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Task 1.1
**Type**: Implementation

**Description**:
Create pure TypeScript utilities package with ZERO runtime dependencies. Extract shared errors, types, and formatters that work in BOTH frontend and backend.

**Deliverables**:
- [ ] Create `libs/core/utils/` structure
- [ ] Create `package.json` with name `@libs/core/utils`
- [ ] Create `tsconfig.json` extending base config
- [ ] Extract/create shared error classes:
  - `errors/app-error.ts` - Base error with statusCode and message
  - `errors/network-error.ts` - HTTP/network failures (used by FE & BE)
  - `errors/validation-error.ts` - Validation failures
  - `errors/auth-error.ts` - Authentication/authorization failures
  - `errors/not-found-error.ts` - Resource not found (404)
  - `errors/server-error.ts` - Internal server errors (500)
- [ ] Create shared types directory (`types/`)
- [ ] Extract pure string/array/object utilities from existing `libs/utils`
- [ ] Configure with ZERO dependencies (or minimal like `date-fns`)
- [ ] Export all from barrel `src/index.ts`

**Requirements**:
- NO browser APIs (window, document, localStorage)
- NO Node.js APIs (fs, path, process)
- NO framework dependencies (React, NestJS)
- Pure TypeScript/JavaScript only
- All errors extend base AppError class
- Error classes can be caught with `instanceof` checks

**Example Error Structure**:
```typescript
// errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// errors/network-error.ts
export class NetworkError extends AppError {
  constructor(message: string, statusCode: number = 0) {
    super(message, statusCode, 'NETWORK_ERROR');
  }
}
```

**Acceptance Criteria**:
- Package builds successfully: `pnpm --filter @libs/core/utils build`
- Zero runtime dependencies (check package.json)
- Errors can be imported by both `@libs/core/web` and `@libs/core/api`
- No compilation errors

---

### Task 1.3: Create @libs/core/ui - Components + UI Utilities

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Task 1.2
**Type**: Implementation

**Description**:
Consolidate UI components and UI-specific utilities (like `cn()`) into single package.

**Deliverables**:
- [ ] Create `libs/core/ui/` structure
- [ ] Move `libs/ui/src/components/*` to `libs/core/ui/src/components/`
- [ ] Create `src/utils/cn.ts` for className utility
- [ ] Create `package.json` with name `@libs/core/ui`
- [ ] Create `tsconfig.json` extending base React config
- [ ] Configure dependencies: `tailwind-merge`, `clsx`, `class-variance-authority`
- [ ] Import shared types from `@libs/core/utils` if needed
- [ ] Update all internal component imports
- [ ] Export components and cn() from barrel `src/index.ts`
- [ ] Remove old `libs/ui` directory

**cn() Utility Structure**:
```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Requirements**:
- Preserve all existing components (Button, Card, Input, etc.)
- Include `cn()` utility for Tailwind className merging
- Maintain build configuration and component variants
- UI-specific utilities stay here (not in @libs/core/utils)
- Can import shared types from @libs/core/utils

**Acceptance Criteria**:
- Package builds successfully: `pnpm --filter @libs/core/ui build`
- All components render correctly
- `cn()` utility works for className merging
- TypeScript exports resolve correctly

---

### Task 1.4: Create @libs/core/api - Backend Everything

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 2 hours
**Dependencies**: Task 1.2
**Type**: Implementation

**Description**:
Consolidate ALL backend utilities into single package: Bootstrap, Prisma, NestJS helpers, Node.js utils.

**Deliverables**:
- [ ] Create `libs/core/api/` structure:
  - `bootstrap/` - bootstrapApi function (created later)
  - `db/` - Prisma client wrapper (from libs/db)
  - `decorators/` - NestJS decorators (from libs/api)
  - `dto/` - Base DTOs (from libs/api)
  - `pipes/` - Custom pipes (from libs/api)
  - `filters/` - Exception filters (from libs/api)
  - `utils/` - Node.js-specific utilities
- [ ] Merge content from existing `libs/api`
- [ ] Merge content from existing `libs/db`
- [ ] Create `package.json` with name `@libs/core/api`
- [ ] Add dependency on `@libs/core/utils`
- [ ] Configure NestJS dependencies (@nestjs/*, prisma, etc.)
- [ ] Update all internal imports
- [ ] Export all from barrel `src/index.ts`
- [ ] Remove old `libs/api` and `libs/db` directories

**Node.js Utils Structure**:
```typescript
// utils/logger.ts - Server-side logger
// utils/env.ts - Environment variable helpers
// utils/file.ts - File system utilities
```

**Requirements**:
- Preserve Prisma client singleton and connection management
- Maintain all NestJS decorators (@ApiProperty, etc.)
- Include OpenAPI decorators for Scalar UI integration
- Can throw NetworkError from @libs/core/utils when calling external APIs
- Node.js-specific code only (no browser APIs)

**Acceptance Criteria**:
- Package builds successfully: `pnpm --filter @libs/core/api build`
- Prisma client generates and connects correctly
- NestJS imports resolve correctly
- Can import and throw NetworkError from @libs/core/utils
- No circular dependencies

---

### Task 1.5: Create @libs/core/web - Frontend Everything

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 2 hours
**Dependencies**: Task 1.2, Task 1.3
**Type**: Implementation

**Description**:
Consolidate ALL frontend utilities into single package using Context API pattern: Bootstrap, TanStack wrappers, API client, browser utils.

**Deliverables**:
- [ ] Create `libs/core/web/` structure:
  - `bootstrap/` - bootstrapApp function (created later)
  - `query/` - TanStack Query wrapper (from libs/query)
  - `router/` - TanStack Router wrapper (from libs/router)
  - `store/` - TanStack Store wrapper (from libs/store)
  - `data-access/` - API client + Context (from libs/data-access)
  - `hooks/` - Custom React hooks
  - `utils/` - Browser-specific utilities
  - `context/` - React Context providers
- [ ] Merge content from `libs/query`
- [ ] Merge content from `libs/router`
- [ ] Merge content from `libs/store`
- [ ] Merge content from `libs/data-access`
- [ ] Create `package.json` with name `@libs/core/web`
- [ ] Add dependency on `@libs/core/utils` and `@libs/core/ui`
- [ ] Configure React and TanStack dependencies
- [ ] Update all internal imports
- [ ] Export all from barrel `src/index.ts`
- [ ] Remove old library directories

**Context-Based API Client Pattern**:
```typescript
// data-access/api-context.tsx
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ApiClient } from './api-client';

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const apiClient = useMemo(() => new ApiClient(config), []);
  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
}

export function useApiClient() {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApiClient must be used within ApiProvider');
  return api;
}

// data-access/api-client.ts
import { NetworkError, ValidationError, AuthError } from '@libs/core/utils';

export class ApiClient {
  async request(url: string) {
    try {
      const response = await fetch(url);
      if (response.status === 401) throw new AuthError('Unauthorized');
      if (response.status === 422) throw new ValidationError('Validation failed');
      if (!response.ok) throw new NetworkError('Request failed', response.status);
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new NetworkError('Network connection failed', 0);
      }
      throw error;
    }
  }
}
```

**Requirements**:
- Preserve all TanStack wrappers (Query, Router, Store)
- Use Context API for dependency injection (NO DI containers)
- API client throws shared errors from @libs/core/utils
- Include browser-specific utilities (localStorage, etc.)
- Follow React idioms (hooks, context, functional components)
- NO Angular-style dependency injection

**Acceptance Criteria**:
- Package builds successfully: `pnpm --filter @libs/core/web build`
- TanStack wrappers work correctly
- API client functions and throws shared errors
- Context providers work correctly
- Custom hooks are functional
- No circular dependencies

---

### Task 1.6: Update Import Paths in apps/web

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Tasks 1.2-1.5
**Type**: Refactoring

**Description**:
Update all import paths in web application to use new consolidated `@libs/core/*` packages.

**Deliverables**:
- [ ] Find and replace imports:
  - `@libs/ui` → `@libs/core/ui`
  - `@libs/utils` → `@libs/core/utils`
  - `@libs/query` → `@libs/core/web`
  - `@libs/router` → `@libs/core/web`
  - `@libs/store` → `@libs/core/web`
  - `@libs/data-access` → `@libs/core/web`
- [ ] Update `apps/web/package.json` dependencies
- [ ] Update import statements to use consolidated exports
- [ ] Verify all imports resolve correctly

**Import Examples**:
```typescript
// Before
import { Button } from '@libs/ui';
import { ApiClient } from '@libs/data-access';
import { useQuery } from '@libs/query';

// After
import { Button, cn } from '@libs/core/ui';
import { ApiClient, useApiClient, createQueryWrapper } from '@libs/core/web';
import { NetworkError, formatDate } from '@libs/core/utils';
```

**Requirements**:
- Use search/replace across all source files
- Update both source files and configuration files
- Test that app starts after changes

**Acceptance Criteria**:
- Zero TypeScript errors: `pnpm --filter @apps/web typecheck`
- App builds successfully: `pnpm --filter @apps/web build`
- App starts in dev mode: `pnpm dev:web`
- No broken imports

---

### Task 1.7: Update Import Paths in apps/api

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 1.2, 1.4
**Type**: Refactoring

**Description**:
Update all import paths in API application to use new consolidated `@libs/core/*` packages.

**Deliverables**:
- [ ] Find and replace imports:
  - `@libs/api` → `@libs/core/api`
  - `@libs/db` → `@libs/core/api`
  - `@libs/utils` → `@libs/core/utils`
- [ ] Update `apps/api/package.json` dependencies
- [ ] Update Prisma imports
- [ ] Update NestJS module imports
- [ ] Verify all imports resolve correctly

**Import Examples**:
```typescript
// Before
import { PrismaService } from '@libs/db';
import { AppError } from '@libs/utils';

// After
import { PrismaService } from '@libs/core/api';
import { NetworkError, AppError } from '@libs/core/utils';
```

**Requirements**:
- Update all NestJS module imports
- Update Prisma client imports
- Update shared error imports
- Test build after changes

**Acceptance Criteria**:
- Zero TypeScript errors: `pnpm --filter @apps/api typecheck`
- App builds successfully: `pnpm --filter @apps/api build`
- App starts in dev mode: `pnpm dev:api`
- Prisma client works correctly

---

### Task 1.8: Update TypeScript Path Mappings

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 20 minutes
**Dependencies**: Tasks 1.2-1.5
**Type**: Configuration

**Description**:
Update TypeScript path mappings in root tsconfig to support new consolidated packages.

**Deliverables**:
- [ ] Update `tsconfig.base.json` paths:
  - Remove old `@libs/ui`, `@libs/query`, etc.
  - Add `@libs/core/api`, `@libs/core/web`, `@libs/core/ui`, `@libs/core/utils`
- [ ] Verify path resolution in IDE
- [ ] Test that TypeScript compilation uses correct paths

**Path Mappings**:
```json
{
  "compilerOptions": {
    "paths": {
      "@libs/core/api": ["libs/core/api/src/index.ts"],
      "@libs/core/web": ["libs/core/web/src/index.ts"],
      "@libs/core/ui": ["libs/core/ui/src/index.ts"],
      "@libs/core/utils": ["libs/core/utils/src/index.ts"],
      "@libs/auth/api": ["libs/auth/api/src/index.ts"],
      "@libs/auth/web": ["libs/auth/web/src/index.ts"],
      "@apps/*": ["apps/*"],
      "@dev/*": ["dev/*"]
    }
  }
}
```

**Requirements**:
- Remove all old path mappings
- Add new consolidated package paths
- Ensure apps can resolve core packages

**Acceptance Criteria**:
- TypeScript resolves all imports correctly
- IDE autocomplete works for new paths
- No "cannot find module" errors

---

### Task 1.9: Update Turborepo Configuration

**Status**: Pending
**Priority**: High
**Estimated Time**: 20 minutes
**Dependencies**: Tasks 1.2-1.5
**Type**: Configuration

**Description**:
Update Turborepo pipeline to reflect new package structure.

**Deliverables**:
- [ ] Update `turbo.json` to reference new packages
- [ ] Update build pipeline dependencies
- [ ] Update development task dependencies
- [ ] Test that build order is correct

**Requirements**:
- Core packages build before apps
- Dependencies respect build order
- Parallel builds where possible

**Acceptance Criteria**:
- `pnpm build` succeeds and builds in correct order
- `pnpm dev` starts all apps correctly
- Build cache works as expected

---

### Task 1.10: Create @libs/core/web Bootstrap Package

**Status**: Pending
**Priority**: High
**Estimated Time**: 1.5 hours
**Dependencies**: Task 1.5
**Type**: Implementation

**Description**:
Create the web bootstrapper function that provides zero-config app setup with feature toggles using Context API.

**Deliverables**:
- [ ] Create `libs/core/web/src/bootstrap/bootstrap.tsx`
- [ ] Implement `bootstrapApp()` function
- [ ] Define `AppConfig` interface with feature flags (auth, health, routes)
- [ ] Setup React root with all required providers:
  - ApiProvider (from data-access/api-context)
  - QueryClientProvider (from query/)
  - RouterProvider (from router/)
  - Any global stores
- [ ] Implement conditional feature registration
- [ ] Export from `src/index.ts`

**Bootstrap Structure**:
```typescript
// bootstrap/bootstrap.tsx
import { createRoot } from 'react-dom/client';
import { ApiProvider } from '../data-access/api-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AppConfig {
  auth?: boolean;
  health?: boolean;
  routes?: RouteObject[];
}

export function bootstrapApp(config: AppConfig) {
  const queryClient = new QueryClient();
  const rootElement = document.getElementById('root');

  if (!rootElement) throw new Error('Root element not found');

  const root = createRoot(rootElement);

  root.render(
    <ApiProvider>
      <QueryClientProvider client={queryClient}>
        {/* Conditionally render auth/health based on config */}
        <App config={config} />
      </QueryClientProvider>
    </ApiProvider>
  );
}
```

**Requirements**:
- Accept configuration object with optional feature flags
- Setup all Context providers in correct order
- Handle initialization order correctly
- Type-safe configuration with TypeScript
- Feature modules registered conditionally

**Acceptance Criteria**:
- Package builds successfully
- TypeScript types are properly exported
- Can be imported by web applications
- Providers nest correctly

---

### Task 1.11: Create @libs/core/api Bootstrap Function

**Status**: Pending
**Priority**: High
**Estimated Time**: 1.5 hours
**Dependencies**: Task 1.4
**Type**: Implementation

**Description**:
Create bootstrap function in `@libs/core/api` that provides zero-config NestJS app setup with Scalar UI.

**Deliverables**:
- [ ] Install dependencies: `@nestjs/swagger`, `@scalar/nestjs-api-reference`
- [ ] Create `libs/core/api/src/bootstrap/bootstrap.ts`
- [ ] Implement `bootstrapApi()` function
- [ ] Define `ApiConfig` interface with feature flags (auth, health, cors, openapi)
- [ ] Implement conditional module registration
- [ ] Setup CORS configuration
- [ ] Setup OpenAPI documentation with Scalar UI:
  - Generate OpenAPI spec with `@nestjs/swagger`
  - Serve Scalar UI at `/api/docs`
  - Serve OpenAPI JSON at `/api/docs-json`
- [ ] Handle global pipes (ValidationPipe with transform and whitelist)
- [ ] Handle global filters
- [ ] Export from `src/index.ts`

**Bootstrap Structure**:
```typescript
// bootstrap/bootstrap.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

interface ApiConfig {
  auth?: boolean;
  health?: boolean;
  cors?: boolean | CorsOptions;
  openapi?: {
    title: string;
    version: string;
    description?: string;
  };
}

export async function bootstrapApi(config: ApiConfig) {
  // Create dynamic app module based on config
  const AppModule = createAppModule(config);

  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // CORS
  if (config.cors) {
    app.enableCors(typeof config.cors === 'boolean' ? {} : config.cors);
  }

  // OpenAPI with Scalar UI
  if (config.openapi) {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder()
      .setTitle(config.openapi.title)
      .setVersion(config.openapi.version)
      .setDescription(config.openapi.description || '')
      .build()
    );

    // Serve Scalar UI
    app.use('/api/docs', apiReference({
      spec: { content: document },
    }));

    // Serve OpenAPI JSON
    SwaggerModule.setup('api/docs-json', app, document);
  }

  return app;
}

function createAppModule(config: ApiConfig) {
  const imports = [];

  if (config.auth) {
    const { AuthModule } = require('@libs/auth/api');
    imports.push(AuthModule);
  }

  if (config.health) {
    const { HealthModule } = require('@libs/health/api');
    imports.push(HealthModule);
  }

  @Module({ imports })
  class DynamicAppModule {}

  return DynamicAppModule;
}
```

**Requirements**:
- Accept configuration object with optional feature flags
- Create NestJS app with NestFactory
- Conditionally import feature modules based on config
- Configure global validation pipe with transform and whitelist
- Setup Scalar UI when openapi config provided
- Scalar UI should have beautiful theme and be production-ready
- Type-safe configuration

**Acceptance Criteria**:
- Package builds successfully
- Bootstrap function creates valid NestJS app
- Configuration is validated at startup
- Scalar UI accessible at `/api/docs` when configured
- OpenAPI spec accessible at `/api/docs-json`

---

### Task 1.12: Update Apps to Use Bootstrap Functions

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 1.10, 1.11
**Type**: Refactoring

**Description**:
Update both applications to use the new bootstrap functions (without features enabled yet).

**Deliverables**:
- [ ] Update `apps/api/src/main.ts` to use `bootstrapApi({})`
- [ ] Update `apps/web/src/main.tsx` to use `bootstrapApp({})`
- [ ] Remove manual NestJS setup from API
- [ ] Remove manual React setup from web (if any)
- [ ] Test both apps start correctly

**API Example**:
```typescript
// apps/api/src/main.ts
import { bootstrapApi } from '@libs/core/api';

async function bootstrap() {
  const app = await bootstrapApi({
    cors: true,
    openapi: {
      title: 'Fullstack Starter API',
      version: '1.0.0',
      description: 'API for fullstack starter application'
    }
  });

  await app.listen(3001);
}

bootstrap();
```

**Web Example**:
```typescript
// apps/web/src/main.tsx
import { bootstrapApp } from '@libs/core/web';

bootstrapApp({
  routes: [] // Custom routes added later
});
```

**Requirements**:
- Maintain existing functionality
- Start with empty config (no features enabled)
- Ensure apps work identically to before

**Acceptance Criteria**:
- API starts without errors: `pnpm dev:api`
- Web starts without errors: `pnpm dev:web`
- Scalar UI accessible at `http://localhost:3001/api/docs`
- No functionality lost

---

### Task 1.13: CHECKPOINT 1 - Validate Core Migration

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 1.1-1.12
**Type**: Testing

**Description**:
Comprehensive validation that all core libraries are consolidated and apps function correctly.

**Test Checklist**:
- [ ] Run `pnpm install` - no errors
- [ ] Run `pnpm typecheck` - zero errors
- [ ] Run `pnpm lint` - zero errors
- [ ] Run `pnpm test` - all tests pass
- [ ] Run `pnpm build` - all packages build
- [ ] Run `pnpm dev` - both apps start
- [ ] Verify only 4 core packages exist: api, web, ui, utils
- [ ] Manual test: Navigate web app UI
- [ ] Manual test: Call API endpoints
- [ ] Manual test: Visit Scalar UI at `/api/docs`
- [ ] Verify shared errors can be caught in both FE and BE
- [ ] Verify `cn()` utility works in components
- [ ] Verify Context providers work correctly
- [ ] Verify no console errors in browser
- [ ] Verify no errors in API logs

**Validation Checklist**:
- [ ] `libs/core/utils` has zero dependencies
- [ ] `libs/core/api` can throw NetworkError
- [ ] `libs/core/web` can throw NetworkError
- [ ] `cn()` is exported from `@libs/core/ui`
- [ ] ApiProvider context works in web app
- [ ] Bootstrap functions work without feature flags

**Acceptance Criteria**:
- All automated checks pass
- Both apps functional and responsive
- No degradation in performance or functionality
- Only 4 core packages in `libs/core/*`
- Shared errors work across FE and BE
- Ready to proceed to Phase 2

---

## Phase 2: Development Tools Migration

**Objective**: Move CLI tools to dedicated `dev/` workspace
**Checkpoint**: ✅ Checkpoint 2 - Dev tools accessible and functional

### Task 2.1: Create dev/ Workspace Structure

**Status**: Pending
**Priority**: High
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.13
**Type**: Infrastructure

**Description**:
Create the new `dev/` workspace directory for development tools.

**Deliverables**:
- [ ] Create `dev/` directory
- [ ] Create `dev/cli/` subdirectory
- [ ] Document structure in task notes

**Acceptance Criteria**:
- Directories exist and follow monorepo conventions

---

### Task 2.2: Migrate cli/tools to dev/cli

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Task 2.1
**Type**: Migration

**Description**:
Move CLI tools from `cli/tools` to `dev/cli` with new package name.

**Deliverables**:
- [ ] Move `cli/tools/*` to `dev/cli/`
- [ ] Update `dev/cli/package.json` name to `@dev/cli`
- [ ] Update TypeScript path mappings
- [ ] Update build scripts
- [ ] Update CLI entrypoint if needed
- [ ] Remove old `cli/tools` directory
- [ ] Remove empty `cli/` directory

**Requirements**:
- Preserve all CLI commands (session, logs, etc.)
- Maintain Commander.js configuration
- Keep tsup build configuration

**Acceptance Criteria**:
- Package builds: `pnpm --filter @dev/cli build`
- CLI commands work: `pnpm tools session info`

---

### Task 2.3: Update CLI Tool References

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 30 minutes
**Dependencies**: Task 2.2
**Type**: Refactoring

**Description**:
Update all references to CLI tools across the project.

**Deliverables**:
- [ ] Update root `package.json` scripts (tools:*)
- [ ] Update documentation references to CLI
- [ ] Update any GitHub Actions workflows
- [ ] Update Claude Code configuration if it references CLI

**Requirements**:
- Maintain all existing CLI functionality
- Ensure scripts work from project root

**Acceptance Criteria**:
- All `pnpm tools *` commands work
- Documentation is up-to-date

---

### Task 2.4: CHECKPOINT 2 - Validate Dev Tools Migration

**Status**: Pending
**Priority**: High
**Estimated Time**: 15 minutes
**Dependencies**: Tasks 2.1-2.3
**Type**: Testing

**Description**:
Validate that CLI tools are accessible and functional from new location.

**Test Checklist**:
- [ ] Run `pnpm tools session info` - works
- [ ] Run `pnpm tools logs tail` - works
- [ ] Run `pnpm tools logs query test` - works
- [ ] Verify CLI help text displays
- [ ] Check build output structure

**Acceptance Criteria**:
- All CLI commands functional
- No broken references
- Ready to proceed to Phase 3

---

## Phase 3: Authentication Module Implementation

**Objective**: Create fullstack authentication module with JWT
**Checkpoint**: ✅ Checkpoint 3 - Users can register, login, and logout

### Task 3.1: Design Authentication Architecture

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: Task 2.4
**Type**: Design

**Description**:
Design the authentication system architecture, database schema, and API contracts.

**Deliverables**:
- [ ] Document auth flow (register → login → token → protected routes)
- [ ] Design User model schema (id, email, password, createdAt, updatedAt)
- [ ] Define JWT payload structure (userId, email, iat, exp)
- [ ] Specify API endpoints (/auth/register, /auth/login, /auth/me)
- [ ] Plan auth guard implementation

**Requirements**:
- JWT-based authentication
- Bcrypt password hashing
- Passport.js integration
- Refresh token support optional

**Acceptance Criteria**:
- Architecture documented
- Database schema defined
- API contracts specified

---

### Task 3.2: Create libs/auth/api Package Structure

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.1
**Type**: Infrastructure

**Description**:
Set up the NestJS authentication package structure.

**Deliverables**:
- [ ] Create `libs/auth/api/` directory
- [ ] Create `package.json` with name `@libs/auth/api`
- [ ] Create `tsconfig.json` extending base config
- [ ] Create source directory structure:
  - `src/guards/` - Auth guards
  - `src/strategies/` - Passport strategies
  - `src/dto/` - DTOs (login, register, token)
  - `src/services/` - Auth service
  - `src/controllers/` - Auth controller
  - `src/decorators/` - Custom decorators
- [ ] Create barrel export `src/index.ts`

**Requirements**:
- Follow NestJS module conventions
- Use workspace protocol for dependencies
- Configure TypeScript strict mode

**Acceptance Criteria**:
- Package structure matches NestJS best practices
- Package builds successfully (even if empty)

---

### Task 3.3: Add Authentication Database Schema

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.2
**Type**: Database

**Description**:
Add User model to Prisma schema for authentication.

**Deliverables**:
- [ ] Add User model to Prisma schema
- [ ] Create migration: `pnpm api:migrate dev --name add_auth_user`
- [ ] Generate Prisma client: `pnpm api:generate`
- [ ] Document schema in comments

**User Model Schema**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Requirements**:
- Use cuid for IDs
- Email must be unique
- Include timestamps

**Acceptance Criteria**:
- Migration runs successfully
- User model available in Prisma client
- Database table created

---

### Task 3.4: Install Authentication Dependencies

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 15 minutes
**Dependencies**: Task 3.2
**Type**: Configuration

**Description**:
Install required NPM packages for authentication.

**Deliverables**:
- [ ] Install to `libs/auth/api`:
  - `@nestjs/passport`
  - `@nestjs/jwt`
  - `passport`
  - `passport-jwt`
  - `bcrypt`
- [ ] Install types: `@types/passport-jwt`, `@types/bcrypt`
- [ ] Update package.json dependencies

**Requirements**:
- Use compatible versions with NestJS 10
- Add to both dependencies and devDependencies as appropriate

**Acceptance Criteria**:
- `pnpm install` completes successfully
- No peer dependency warnings

---

### Task 3.5: Implement Auth DTOs

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.4
**Type**: Implementation

**Description**:
Create Data Transfer Objects for authentication endpoints.

**Deliverables**:
- [ ] Create `src/dto/register.dto.ts`:
  - email (string, email validation)
  - password (string, min 8 chars)
  - name (string, optional)
- [ ] Create `src/dto/login.dto.ts`:
  - email (string, email validation)
  - password (string)
- [ ] Create `src/dto/token.dto.ts`:
  - accessToken (string)
  - expiresIn (number)
- [ ] Add class-validator decorators
- [ ] Add @ApiProperty decorators for OpenAPI documentation
- [ ] Export from barrel

**Requirements**:
- Use class-validator decorators
- Include @ApiProperty decorators for OpenAPI spec generation
- Follow existing DTO patterns in `@libs/core/api`

**Acceptance Criteria**:
- DTOs compile without errors
- Validation decorators configured correctly

---

### Task 3.6: Implement JWT Strategy

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Task 3.5
**Type**: Implementation

**Description**:
Implement Passport JWT strategy for token validation.

**Deliverables**:
- [ ] Create `src/strategies/jwt.strategy.ts`
- [ ] Extend `PassportStrategy` with JWT strategy
- [ ] Implement `validate()` method
- [ ] Configure JWT extraction from Authorization header
- [ ] Add JWT secret from environment variables
- [ ] Export from barrel

**Requirements**:
- Extract JWT from Bearer token
- Validate user exists in database
- Return user payload for request context

**Acceptance Criteria**:
- Strategy compiles without errors
- Follows NestJS Passport patterns

---

### Task 3.7: Implement Auth Guards

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.6
**Type**: Implementation

**Description**:
Create authentication guards for protecting routes.

**Deliverables**:
- [ ] Create `src/guards/jwt-auth.guard.ts` - Extends AuthGuard('jwt')
- [ ] Create `src/guards/public.guard.ts` - Allows public routes
- [ ] Create `src/decorators/public.decorator.ts` - @Public() decorator
- [ ] Export from barrel

**Requirements**:
- JwtAuthGuard requires valid JWT
- Public decorator bypasses auth
- Follow NestJS guard patterns

**Acceptance Criteria**:
- Guards compile without errors
- Can be applied to controllers/routes

---

### Task 3.8: Implement Auth Service

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Task 3.7
**Type**: Implementation

**Description**:
Implement core authentication business logic.

**Deliverables**:
- [ ] Create `src/services/auth.service.ts`
- [ ] Implement `register(dto: RegisterDto)`:
  - Hash password with bcrypt
  - Create user in database
  - Generate JWT token
- [ ] Implement `login(dto: LoginDto)`:
  - Find user by email
  - Verify password with bcrypt
  - Generate JWT token
- [ ] Implement `validateUser(userId: string)`:
  - Find user by ID
  - Return user data
- [ ] Implement `generateToken(user)`:
  - Create JWT with payload
  - Set expiration (e.g., 7 days)
- [ ] Add proper error handling
- [ ] Export from barrel

**Requirements**:
- Use Prisma client for database operations
- Hash passwords before storing
- Never return password in responses
- Handle duplicate email error
- Handle invalid credentials error

**Acceptance Criteria**:
- Service compiles without errors
- All methods properly typed
- Error handling in place

---

### Task 3.9: Implement Auth Controller

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Task 3.8
**Type**: Implementation

**Description**:
Create REST API endpoints for authentication.

**Deliverables**:
- [ ] Create `src/controllers/auth.controller.ts`
- [ ] POST `/auth/register` - Register new user
- [ ] POST `/auth/login` - Login existing user
- [ ] GET `/auth/me` - Get current user (protected)
- [ ] Add @ApiOperation, @ApiResponse decorators for OpenAPI
- [ ] Add validation pipes
- [ ] Export from barrel

**Requirements**:
- Use @Public() decorator for register/login
- Use JwtAuthGuard for /me endpoint
- Return proper HTTP status codes
- Include OpenAPI documentation with @ApiOperation and @ApiResponse

**Acceptance Criteria**:
- Controller compiles without errors
- Endpoints follow REST conventions
- OpenAPI documentation properly generated for Scalar UI

---

### Task 3.10: Create Auth Module

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.9
**Type**: Implementation

**Description**:
Create NestJS module that ties together all auth components.

**Deliverables**:
- [ ] Create `src/auth.module.ts`
- [ ] Register JWT module with configuration
- [ ] Register Passport module
- [ ] Provide Auth service
- [ ] Register JWT strategy
- [ ] Export Auth service and guards
- [ ] Export module from `src/index.ts`

**Requirements**:
- Configure JWT secret from environment
- Set JWT expiration time
- Make module reusable

**Acceptance Criteria**:
- Module compiles without errors
- Can be imported by other modules
- All dependencies properly configured

---

### Task 3.11: Create libs/auth/web Package Structure

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.10
**Type**: Infrastructure

**Description**:
Set up the React authentication package structure.

**Deliverables**:
- [ ] Create `libs/auth/web/` directory
- [ ] Create `package.json` with name `@libs/auth/web`
- [ ] Create `tsconfig.json` extending base React config
- [ ] Create source directory structure:
  - `src/components/` - React components
  - `src/stores/` - Auth state management
  - `src/hooks/` - Custom hooks
  - `src/api/` - API client methods
  - `src/types/` - TypeScript types
- [ ] Create barrel export `src/index.ts`

**Requirements**:
- Configure for React + TypeScript
- Use workspace dependencies
- Follow existing library patterns

**Acceptance Criteria**:
- Package structure matches conventions
- Package builds successfully

---

### Task 3.12: Implement Auth Store

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Task 3.11
**Type**: Implementation

**Description**:
Create TanStack Store for auth state management.

**Deliverables**:
- [ ] Create `src/stores/auth.store.ts`
- [ ] Define auth state interface:
  - user (User | null)
  - token (string | null)
  - isAuthenticated (boolean)
  - isLoading (boolean)
- [ ] Implement store actions:
  - setUser(user)
  - setToken(token)
  - clearAuth()
- [ ] Add localStorage persistence for token
- [ ] Export store and hooks

**Requirements**:
- Use `@libs/core/store` wrapper
- Persist token to localStorage
- Clear auth on logout

**Acceptance Criteria**:
- Store compiles without errors
- State updates correctly
- Token persistence works

---

### Task 3.13: Implement Auth API Client

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.12
**Type**: Implementation

**Description**:
Create API client methods for authentication endpoints.

**Deliverables**:
- [ ] Create `src/api/auth.api.ts`
- [ ] Implement `register(dto)` - POST /auth/register
- [ ] Implement `login(dto)` - POST /auth/login
- [ ] Implement `getMe()` - GET /auth/me
- [ ] Add request/response types
- [ ] Export from barrel

**Requirements**:
- Use `@libs/core/data-access` ApiClient
- Handle errors appropriately
- Type all requests and responses

**Acceptance Criteria**:
- API client compiles without errors
- All methods properly typed

---

### Task 3.14: Implement Auth Hooks

**Status**: Pending
**Priority**: High
**Estimated Time**: 1 hour
**Dependencies**: Task 3.13
**Type**: Implementation

**Description**:
Create React hooks for authentication operations.

**Deliverables**:
- [ ] Create `src/hooks/use-auth.ts`:
  - useAuth() - Returns auth state and actions
- [ ] Create `src/hooks/use-login.ts`:
  - useLogin() - Login mutation with TanStack Query
- [ ] Create `src/hooks/use-register.ts`:
  - useRegister() - Register mutation
- [ ] Create `src/hooks/use-logout.ts`:
  - useLogout() - Logout action
- [ ] Create `src/hooks/use-current-user.ts`:
  - useCurrentUser() - Query for current user
- [ ] Export all hooks from barrel

**Requirements**:
- Use `@libs/core/query` for mutations
- Update auth store on success
- Handle errors with toasts/notifications
- Invalidate queries on logout

**Acceptance Criteria**:
- All hooks compile without errors
- Mutations update store correctly
- Errors handled gracefully

---

### Task 3.15: Implement Login Component

**Status**: Pending
**Priority**: High
**Estimated Time**: 1 hour
**Dependencies**: Task 3.14
**Type**: Implementation

**Description**:
Create login form component with validation.

**Deliverables**:
- [ ] Create `src/components/login-form.tsx`
- [ ] Add email input with validation
- [ ] Add password input with validation
- [ ] Add submit button with loading state
- [ ] Add error display
- [ ] Add link to register page
- [ ] Use `@libs/core/ui` components (Input, Button, Form)
- [ ] Export from barrel

**Requirements**:
- Client-side form validation
- Show loading state during submission
- Display API errors
- Redirect to dashboard on success

**Acceptance Criteria**:
- Component renders correctly
- Form validation works
- Successful login redirects user

---

### Task 3.16: Implement Register Component

**Status**: Pending
**Priority**: High
**Estimated Time**: 1 hour
**Dependencies**: Task 3.14
**Type**: Implementation

**Description**:
Create registration form component with validation.

**Deliverables**:
- [ ] Create `src/components/register-form.tsx`
- [ ] Add email input with validation
- [ ] Add password input with validation (min 8 chars)
- [ ] Add name input (optional)
- [ ] Add confirm password input
- [ ] Add submit button with loading state
- [ ] Add error display
- [ ] Add link to login page
- [ ] Use `@libs/core/ui` components
- [ ] Export from barrel

**Requirements**:
- Validate passwords match
- Client-side validation
- Show loading state
- Display API errors
- Redirect to login on success

**Acceptance Criteria**:
- Component renders correctly
- Form validation works
- Successful registration proceeds to login

---

### Task 3.17: Implement Protected Route Wrapper

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.14
**Type**: Implementation

**Description**:
Create component for protecting authenticated routes.

**Deliverables**:
- [ ] Create `src/components/protected-route.tsx`
- [ ] Check authentication state
- [ ] Redirect to login if not authenticated
- [ ] Show loading state while checking auth
- [ ] Export from barrel

**Requirements**:
- Use `@libs/core/router` for navigation
- Use useAuth hook for state
- Preserve intended destination for redirect

**Acceptance Criteria**:
- Unauthenticated users redirected
- Authenticated users see content
- Loading state displays correctly

---

### Task 3.18: Integrate Auth into apps/api via Bootstrap

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: Task 3.10
**Type**: Integration

**Description**:
Enable auth module in API using bootstrap configuration (zero-config approach).

**Deliverables**:
- [ ] Add `@libs/auth/api` to `apps/api/package.json`
- [ ] Add `@libs/auth/api` to `libs/core/api` dependencies
- [ ] Update `bootstrapApi()` to support `auth: true` config
- [ ] Implement conditional AuthModule registration in bootstrap
- [ ] Update `apps/api/src/main.ts` to enable auth: `bootstrapApi({ auth: true, openapi: {...} })`
- [ ] Add JWT_SECRET to .env
- [ ] Test auth endpoints in Scalar UI at `/api/docs`

**Requirements**:
- Bootstrap function conditionally imports AuthModule when `auth: true`
- Environment variable for JWT secret
- No manual module imports in app code
- Single-line configuration

**Acceptance Criteria**:
- API starts without errors with `auth: true`
- API starts without errors with `auth: false` (or omitted)
- Auth endpoints visible in Scalar UI when enabled
- Can register and login via API docs interface

---

### Task 3.19: Integrate Auth into apps/web via Bootstrap

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 3.17, 3.18
**Type**: Integration

**Description**:
Enable auth module in web app using bootstrap configuration (zero-config approach).

**Deliverables**:
- [ ] Add `@libs/auth/web` to `apps/web/package.json`
- [ ] Add `@libs/auth/web` to `libs/core/web` dependencies
- [ ] Update `bootstrapApp()` to support `auth: true` config
- [ ] Implement conditional auth setup in bootstrap:
  - Register auth routes (/login, /register)
  - Setup auth providers and stores
  - Configure protected route wrapper
- [ ] Update `apps/web/src/main.tsx` to enable auth: `bootstrapApp({ auth: true })`
- [ ] Add logout button to navigation
- [ ] Show user info when authenticated

**Requirements**:
- Bootstrap function conditionally imports auth module when `auth: true`
- Auth routes automatically registered
- No manual route configuration in app code
- Single-line configuration
- Initialize auth state on app load
- Persist token in localStorage

**Acceptance Criteria**:
- Web app starts without errors with `auth: true`
- Web app starts without errors with `auth: false` (or omitted)
- Login page renders at /login when enabled
- Register page renders at /register when enabled
- Protected routes redirect when not authenticated
- User can complete full auth flow

---

### Task 3.20: CHECKPOINT 3 - Validate Authentication Module

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 3.1-3.19
**Type**: Testing

**Description**:
Comprehensive validation of authentication functionality.

**Test Checklist**:
- [ ] Run `pnpm typecheck` - zero errors
- [ ] Run `pnpm lint` - zero errors
- [ ] Run `pnpm build` - all packages build
- [ ] Run `pnpm dev` - both apps start
- [ ] Manual: Register new user via web UI
- [ ] Manual: Login with registered user
- [ ] Manual: Access protected dashboard
- [ ] Manual: Verify user info displays
- [ ] Manual: Logout successfully
- [ ] Manual: Verify redirect to login after logout
- [ ] Manual: Try accessing protected route when logged out
- [ ] API: Navigate to `/api/docs` and verify Scalar UI loads
- [ ] API: Test /auth/register endpoint in Scalar UI
- [ ] API: Test /auth/login endpoint in Scalar UI
- [ ] API: Test /auth/me endpoint with token in Scalar UI
- [ ] Verify token in localStorage
- [ ] Verify token expiration handling

**Acceptance Criteria**:
- Full authentication flow works end-to-end
- No TypeScript errors
- No console errors
- Token persistence works
- Ready to proceed to Phase 4

---

## Phase 4: Health Check Module Implementation

**Objective**: Create fullstack health monitoring module
**Checkpoint**: ✅ Checkpoint 4 - Health endpoints respond correctly

### Task 4.1: Create libs/health/api Package Structure

**Status**: Pending
**Priority**: High
**Estimated Time**: 20 minutes
**Dependencies**: Task 3.20
**Type**: Infrastructure

**Description**:
Set up the NestJS health check package structure.

**Deliverables**:
- [ ] Create `libs/health/api/` directory
- [ ] Create `package.json` with name `@libs/health/api`
- [ ] Create `tsconfig.json` extending base config
- [ ] Create source directory structure:
  - `src/controllers/` - Health controller
  - `src/indicators/` - Custom health indicators
- [ ] Create barrel export `src/index.ts`

**Acceptance Criteria**:
- Package structure matches NestJS conventions
- Package builds successfully

---

### Task 4.2: Install Health Check Dependencies

**Status**: Pending
**Priority**: High
**Estimated Time**: 10 minutes
**Dependencies**: Task 4.1
**Type**: Configuration

**Description**:
Install required NPM packages for health checks.

**Deliverables**:
- [ ] Install to `libs/health/api`:
  - `@nestjs/terminus`
- [ ] Update package.json dependencies

**Requirements**:
- Use version compatible with NestJS 10

**Acceptance Criteria**:
- `pnpm install` completes successfully
- No peer dependency warnings

---

### Task 4.3: Implement Health Controller

**Status**: Pending
**Priority**: High
**Estimated Time**: 45 minutes
**Dependencies**: Task 4.2
**Type**: Implementation

**Description**:
Create health check endpoints for monitoring.

**Deliverables**:
- [ ] Create `src/controllers/health.controller.ts`
- [ ] GET `/health` - Overall health status
- [ ] GET `/health/db` - Database connectivity
- [ ] GET `/health/ready` - Readiness probe
- [ ] GET `/health/live` - Liveness probe
- [ ] Add @Public() decorator for public access
- [ ] Add @ApiOperation, @ApiResponse decorators for OpenAPI
- [ ] Export from barrel

**Requirements**:
- Use @nestjs/terminus health indicators
- Include database health check
- Include memory health check
- Include disk health check
- Return standard health check format
- Document endpoints with OpenAPI decorators

**Acceptance Criteria**:
- Controller compiles without errors
- Endpoints follow health check standards
- Health endpoints visible in Scalar UI

---

### Task 4.4: Implement Custom Health Indicators

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 30 minutes
**Dependencies**: Task 4.3
**Type**: Implementation

**Description**:
Create custom health indicators for app-specific checks.

**Deliverables**:
- [ ] Create `src/indicators/database.indicator.ts`
  - Check Prisma connection
  - Execute simple query
- [ ] Export from barrel

**Requirements**:
- Extend HealthIndicator from @nestjs/terminus
- Return proper health check response format
- Handle errors gracefully

**Acceptance Criteria**:
- Indicators compile without errors
- Can be used in health controller

---

### Task 4.5: Create Health Module

**Status**: Pending
**Priority**: High
**Estimated Time**: 20 minutes
**Dependencies**: Task 4.4
**Type**: Implementation

**Description**:
Create NestJS module for health checks.

**Deliverables**:
- [ ] Create `src/health.module.ts`
- [ ] Import TerminusModule
- [ ] Register health controller
- [ ] Register custom indicators
- [ ] Export module from `src/index.ts`

**Acceptance Criteria**:
- Module compiles without errors
- Can be imported by other modules

---

### Task 4.6: Create libs/health/web Package Structure

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 20 minutes
**Dependencies**: Task 4.5
**Type**: Infrastructure

**Description**:
Set up the React health check package structure.

**Deliverables**:
- [ ] Create `libs/health/web/` directory
- [ ] Create `package.json` with name `@libs/health/web`
- [ ] Create `tsconfig.json` extending base React config
- [ ] Create source directory structure:
  - `src/components/` - Health components
  - `src/hooks/` - Health check hooks
  - `src/api/` - Health API client
  - `src/types/` - TypeScript types
- [ ] Create barrel export `src/index.ts`

**Acceptance Criteria**:
- Package structure matches conventions
- Package builds successfully

---

### Task 4.7: Implement Health API Client

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 20 minutes
**Dependencies**: Task 4.6
**Type**: Implementation

**Description**:
Create API client methods for health endpoints.

**Deliverables**:
- [ ] Create `src/api/health.api.ts`
- [ ] Implement `getHealth()` - GET /health
- [ ] Implement `getDbHealth()` - GET /health/db
- [ ] Implement `getReadiness()` - GET /health/ready
- [ ] Add response types
- [ ] Export from barrel

**Requirements**:
- Use `@libs/core/data-access` ApiClient
- Type all responses
- Handle errors

**Acceptance Criteria**:
- API client compiles without errors
- All methods properly typed

---

### Task 4.8: Implement Health Hooks

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 30 minutes
**Dependencies**: Task 4.7
**Type**: Implementation

**Description**:
Create React hooks for health checks.

**Deliverables**:
- [ ] Create `src/hooks/use-health.ts`:
  - useHealth() - Query overall health
- [ ] Create `src/hooks/use-db-health.ts`:
  - useDbHealth() - Query database health
- [ ] Configure auto-refresh (e.g., every 30 seconds)
- [ ] Export from barrel

**Requirements**:
- Use `@libs/core/query` for queries
- Auto-refresh at regular intervals
- Handle errors gracefully

**Acceptance Criteria**:
- Hooks compile without errors
- Auto-refresh works

---

### Task 4.9: Implement Health Status Component

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 45 minutes
**Dependencies**: Task 4.8
**Type**: Implementation

**Description**:
Create health status dashboard component.

**Deliverables**:
- [ ] Create `src/components/health-status.tsx`
- [ ] Display overall system health
- [ ] Display database health status
- [ ] Show status badges (healthy/unhealthy)
- [ ] Show last check timestamp
- [ ] Add refresh button
- [ ] Use `@libs/core/ui` components
- [ ] Export from barrel

**Requirements**:
- Color-coded status indicators
- Loading states
- Error handling
- Responsive design

**Acceptance Criteria**:
- Component renders correctly
- Shows accurate health status
- Updates automatically

---

### Task 4.10: Integrate Health into apps/api via Bootstrap

**Status**: Pending
**Priority**: High
**Estimated Time**: 15 minutes
**Dependencies**: Task 4.5
**Type**: Integration

**Description**:
Enable health module in API using bootstrap configuration (zero-config approach).

**Deliverables**:
- [ ] Add `@libs/health/api` to `libs/core/api` dependencies (should already have it)
- [ ] Update `bootstrapApi()` to support `health: true` config
- [ ] Implement conditional HealthModule registration in bootstrap
- [ ] Update `apps/api/src/main.ts` to enable health: `bootstrapApi({ auth: true, health: true, openapi: {...} })`
- [ ] Test health endpoints in Scalar UI at `/api/docs`

**Requirements**:
- Bootstrap function conditionally imports HealthModule when `health: true`
- No manual module imports in app code
- Single-line configuration

**Acceptance Criteria**:
- API starts without errors with `health: true`
- API starts without errors with `health: false` (or omitted)
- Health endpoints visible in Scalar UI when enabled
- All checks return correct status
- Health endpoints can be tested directly in Scalar UI

---

### Task 4.11: Integrate Health into apps/web via Bootstrap

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 20 minutes
**Dependencies**: Tasks 4.9, 4.10
**Type**: Integration

**Description**:
Enable health module in web app using bootstrap configuration (zero-config approach).

**Deliverables**:
- [ ] Add `@libs/health/web` to `libs/core/web` dependencies (should already have it)
- [ ] Update `bootstrapApp()` to support `health: true` config
- [ ] Implement conditional health setup in bootstrap:
  - Register /health route with HealthStatus component
  - Setup health providers
- [ ] Update `apps/web/src/main.tsx` to enable health: `bootstrapApp({ auth: true, health: true })`
- [ ] Add health link to navigation (optional)

**Requirements**:
- Bootstrap function conditionally imports health module when `health: true`
- Health route automatically registered
- No manual route configuration in app code
- Single-line configuration

**Acceptance Criteria**:
- Web app starts without errors with `health: true`
- Web app starts without errors with `health: false` (or omitted)
- Health page renders at /health when enabled
- Shows real-time health status
- Auto-refreshes correctly

---

### Task 4.12: CHECKPOINT 4 - Validate Health Module

**Status**: Pending
**Priority**: High
**Estimated Time**: 30 minutes
**Dependencies**: Tasks 4.1-4.11
**Type**: Testing

**Description**:
Comprehensive validation of health check functionality.

**Test Checklist**:
- [ ] Run `pnpm typecheck` - zero errors
- [ ] Run `pnpm lint` - zero errors
- [ ] Run `pnpm build` - all packages build
- [ ] Run `pnpm dev` - both apps start
- [ ] Manual: Navigate to /health page in web app
- [ ] Manual: Verify health status displays
- [ ] Manual: Check auto-refresh works
- [ ] API: Navigate to `/api/docs` in Scalar UI
- [ ] API: Test /health endpoint in Scalar UI
- [ ] API: Test /health/db endpoint in Scalar UI
- [ ] API: Test /health/ready endpoint in Scalar UI
- [ ] API: Test /health/live endpoint in Scalar UI
- [ ] API: Verify response format in Scalar UI
- [ ] Manual: Stop database and check unhealthy status
- [ ] Manual: Restart database and check recovery

**Acceptance Criteria**:
- All health endpoints functional
- Web UI displays health correctly
- No TypeScript errors
- No console errors
- Ready to proceed to Phase 5

---

## Phase 5: Documentation & Cleanup

**Objective**: Update documentation and finalize migration
**Checkpoint**: ✅ Final - Project fully migrated and documented

### Task 5.1: Update CLAUDE.md Documentation

**Status**: Pending
**Priority**: High
**Estimated Time**: 1 hour
**Dependencies**: Task 4.12
**Type**: Documentation

**Description**:
Update project documentation to reflect new structure.

**Deliverables**:
- [ ] Update workspace structure section
- [ ] Document `libs/core/*` packages
- [ ] Document `libs/auth/*` packages
- [ ] Document `libs/health/*` packages
- [ ] Document `dev/cli` location
- [ ] Update dependency flow diagram
- [ ] Update import path examples
- [ ] Add authentication setup instructions
- [ ] Add health check setup instructions

**Acceptance Criteria**:
- All sections updated
- Accurate structure documentation
- Clear usage examples

---

### Task 5.2: Update README.md

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 30 minutes
**Dependencies**: Task 5.1
**Type**: Documentation

**Description**:
Update main README with new structure and features.

**Deliverables**:
- [ ] Add authentication feature to features list
- [ ] Add health checks to features list
- [ ] Update quick start guide
- [ ] Add migration notes
- [ ] Update architecture overview

**Acceptance Criteria**:
- README reflects current state
- Quick start is accurate

---

### Task 5.3: Create Migration Guide

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 45 minutes
**Dependencies**: Task 5.1
**Type**: Documentation

**Description**:
Create guide for migrating from old structure to new.

**Deliverables**:
- [ ] Create `MIGRATION.md` document
- [ ] Document old → new package mappings
- [ ] Provide import path update examples
- [ ] List breaking changes
- [ ] Add troubleshooting section

**Acceptance Criteria**:
- Clear migration steps
- All mappings documented

---

### Task 5.4: Update Package Documentation

**Status**: Pending
**Priority**: Low
**Estimated Time**: 30 minutes
**Dependencies**: Task 5.1
**Type**: Documentation

**Description**:
Add/update README files in library packages.

**Deliverables**:
- [ ] Add README to `libs/auth/api`
- [ ] Add README to `libs/auth/web`
- [ ] Add README to `libs/health/api`
- [ ] Add README to `libs/health/web`
- [ ] Update README in `libs/core/*` packages

**Acceptance Criteria**:
- Each package has README
- Usage examples included

---

### Task 5.5: Clean Up Deprecated Paths

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 20 minutes
**Dependencies**: Task 5.1
**Type**: Cleanup

**Description**:
Remove any remaining references to old structure.

**Deliverables**:
- [ ] Search for old import paths
- [ ] Remove any old library directories
- [ ] Clean up TypeScript path mappings
- [ ] Remove unused dependencies

**Acceptance Criteria**:
- No old paths remain
- Clean workspace structure

---

### Task 5.6: Final Validation

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 45 minutes
**Dependencies**: Tasks 5.1-5.5
**Type**: Testing

**Description**:
Final comprehensive validation of entire project.

**Test Checklist**:
- [ ] Run `pnpm install` - clean install
- [ ] Run `pnpm typecheck` - zero errors
- [ ] Run `pnpm lint` - zero errors
- [ ] Run `pnpm test` - all tests pass
- [ ] Run `pnpm build` - all packages build
- [ ] Run `pnpm dev` - both apps start
- [ ] Run `pnpm tools session info` - CLI works
- [ ] Manual: Complete auth flow (register → login → logout)
- [ ] Manual: Check health dashboard
- [ ] Manual: Navigate all routes
- [ ] Manual: Test protected routes
- [ ] API: Navigate to `/api/docs` and verify Scalar UI loads beautifully
- [ ] API: Test all auth endpoints in Scalar UI
- [ ] API: Test all health endpoints in Scalar UI
- [ ] API: Verify OpenAPI spec at `/api/docs-json`
- [ ] Check for console errors
- [ ] Check for API errors
- [ ] Verify documentation accuracy
- [ ] Review git changes

**Acceptance Criteria**:
- All automated checks pass
- All manual tests successful
- Documentation complete
- Project ready for production use

---

## Summary

**Total Tasks**: 65
**Checkpoints**: 5
**Phases**: 5
**Estimated Total Time**: 12-16 hours

### Critical Path
1. Phase 1 (Base Migration + Bootstrap) → Checkpoint 1
2. Phase 2 (Dev Tools) → Checkpoint 2
3. Phase 3 (Auth with Bootstrap) → Checkpoint 3
4. Phase 4 (Health with Bootstrap) → Checkpoint 4
5. Phase 5 (Documentation) → Final

### Checkpoint Schedule
- **Checkpoint 1**: After Task 1.14 - Base libraries functional + bootstrap implemented
- **Checkpoint 2**: After Task 2.4 - Dev tools accessible
- **Checkpoint 3**: After Task 3.20 - Auth working end-to-end with zero-config setup
- **Checkpoint 4**: After Task 4.12 - Health checks operational with zero-config setup
- **Final**: After Task 5.6 - Project complete

### Dependencies Graph
```
Phase 1 ──> Phase 2 ──> Phase 3 ──> Phase 4 ──> Phase 5
   ↓           ↓           ↓           ↓           ↓
   CP1        CP2         CP3         CP4       Final
```

### Risk Mitigation
- Test at each checkpoint before proceeding
- Commit after each successful checkpoint
- Keep rollback plan ready
- Document issues as they arise
