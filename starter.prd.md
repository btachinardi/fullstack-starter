# Fullstack Starter - Modular Monorepo Architecture PRD

## Executive Summary

Reorganize the fullstack-starter monorepo from a flat library structure to a modular, feature-based architecture that enables better code reuse, clearer separation of concerns, and easier plugin-style feature integration.

## Problem Statement

The current monorepo structure uses a flat `libs/*` organization that doesn't scale well for:
- **Feature modules**: No clear pattern for fullstack features (auth, notifications, etc.)
- **Development tools**: CLI tools are in `cli/tools` instead of a dedicated `dev/*` workspace
- **Code discovery**: Hard to distinguish core/base libraries from feature modules
- **Reusability**: Difficult to see which libraries form complete fullstack features

## Goals

1. **Modular Architecture**: Organize libraries by purpose (base vs features)
2. **Feature Completeness**: Each feature module provides both `api` and `web` packages
3. **Clear Hierarchy**: Separate base infrastructure from feature modules
4. **Development Workflow**: Dedicated `dev/*` workspace for tooling and dev apps
5. **Zero Breaking Changes**: Maintain all existing functionality during migration

## Non-Goals

- Changing build tooling or CI/CD configuration
- Modifying application logic beyond import path updates
- Adding new features beyond basic auth and health modules
- Performance optimization (unless migration causes degradation)

## Success Criteria

- [ ] All libraries organized into `libs/core/*` (4 packages) or `libs/<feature>/*`
- [ ] Core packages consolidated: `@libs/core/api`, `@libs/core/web`, `@libs/core/ui`, `@libs/core/utils`
- [ ] Bootstrap functions (`bootstrapApi`, `bootstrapApp`) implemented and working
- [ ] Shared error classes in `@libs/core/utils` used by both frontend and backend
- [ ] Auth module provides working fullstack authentication via `{ auth: true }` config
- [ ] Health module provides working health checks via `{ health: true }` config
- [ ] Scalar UI for beautiful API documentation at `/api/docs`
- [ ] Zero-config feature integration working for both auth and health
- [ ] All tests passing after migration
- [ ] Zero TypeScript errors
- [ ] All apps (`web`, `api`) start and function correctly with bootstrap
- [ ] Development CLI migrated to `dev/cli`
- [ ] Documentation updated with new structure and bootstrap pattern

## User Stories

### As a Developer

- I want to add authentication with a single line configuration `bootstrapApp({ auth: true })`
- I want to add health checks with a single line configuration `bootstrapApp({ health: true })`
- I want to understand which libraries are core vs features at a glance
- I want to reuse complete feature modules across multiple products
- I want development tools organized separately from production code
- I want zero-config setup for common features (auth, health, etc.)

### As a Project Maintainer

- I want to add new feature modules following a clear pattern
- I want to scale the monorepo without structure confusion
- I want to version and publish feature modules independently

## Technical Specification

### Target Directory Structure

```
fullstack-starter/
├── apps/              (@apps/*)
│   ├── api/          # NestJS API application → @apps/api
│   └── web/          # React web application → @apps/web
├── dev/               (@dev/*)
│   ├── cli/          # Development CLI → @dev/cli
│   ├── web/          # [Future] Dev tools web UI → @dev/web
│   └── api/          # [Future] Dev tools API → @dev/api
├── configs/           (@configs/*)
│   ├── typescript/   # TypeScript configs → @configs/typescript
│   └── jest/         # Jest configs → @configs/jest
└── libs/
    ├── core/         (@libs/core/*)
    │   ├── api/      # Backend everything → @libs/core/api
    │   │   ├── bootstrap.ts  - bootstrapApi function
    │   │   ├── db/           - Prisma client wrapper
    │   │   ├── decorators/   - NestJS decorators
    │   │   └── utils/        - Node.js-specific utilities
    │   ├── web/      # Frontend everything → @libs/core/web
    │   │   ├── bootstrap.tsx - bootstrapApp function
    │   │   ├── query/        - TanStack Query wrapper
    │   │   ├── router/       - TanStack Router wrapper
    │   │   ├── store/        - TanStack Store wrapper
    │   │   ├── data-access/  - API client
    │   │   └── utils/        - Browser-specific utilities
    │   ├── ui/       # Component library → @libs/core/ui
    │   │   ├── components/   - All UI components
    │   │   └── utils/        - UI utilities (cn, etc.)
    │   └── utils/    # Pure TypeScript utilities → @libs/core/utils
    │       ├── errors/       - Shared error classes (NetworkError, etc.)
    │       ├── types/        - Shared TypeScript types
    │       └── format/       - Pure formatting utilities
    ├── auth/         (@libs/auth/*)
    │   ├── api/      # NestJS auth module → @libs/auth/api
    │   └── web/      # React auth UI → @libs/auth/web
    └── health/       (@libs/health/*)
        ├── api/      # NestJS health endpoints → @libs/health/api
        └── web/      # React health status UI → @libs/health/web
```

### Package Naming Convention

- **Core packages**: `@libs/core/<name>` (e.g., `@libs/core/api`, `@libs/core/web`, `@libs/core/ui`, `@libs/core/utils`)
- **Feature packages**: `@libs/<feature>/<platform>` (e.g., `@libs/auth/web`, `@libs/auth/api`)
- **App packages**: `@apps/<name>` (e.g., `@apps/api`, `@apps/web`)
- **Dev packages**: `@dev/<name>` (e.g., `@dev/cli`, `@dev/web`)
- **Config packages**: `@configs/<name>` (e.g., `@configs/typescript`, `@configs/jest`)

**Core Package Breakdown**:
- `@libs/core/api` - All backend utilities (bootstrap, Prisma, NestJS helpers, Node.js utils)
- `@libs/core/web` - All frontend utilities (bootstrap, TanStack wrappers, API client, browser utils)
- `@libs/core/ui` - Component library + UI utilities (components, `cn()` utility)
- `@libs/core/utils` - Pure TypeScript (shared errors, types, formatters - zero runtime deps)

### Bootstrap Pattern

The core of the developer experience is a single-line configuration approach through bootstrap functions in `@libs/core/api` and `@libs/core/web`.

**API Bootstrap** (`@libs/core/api`):
```typescript
// apps/api/src/main.ts
import { bootstrapApi } from '@libs/core/api';

async function bootstrap() {
  const app = await bootstrapApi({
    auth: true,        // Automatically registers AuthModule from @libs/auth/api
    health: true,      // Automatically registers HealthModule from @libs/health/api
    cors: true,
    openapi: {         // Scalar UI for beautiful API documentation
      title: 'My API',
      version: '1.0',
      description: 'My awesome API'
    }
  });

  await app.listen(3001);
}
```

- OpenAPI documentation automatically available at `/api/docs` (Scalar UI)
- OpenAPI JSON spec available at `/api/docs-json`

**Web Bootstrap** (`@libs/core/web`):
```typescript
// apps/web/src/main.tsx
import { bootstrapApp } from '@libs/core/web';

bootstrapApp({
  auth: true,        // Automatically configures auth routes and providers
  health: true,      // Automatically adds health dashboard route
  routes: [
    // Custom app routes
  ]
});
```

**Benefits**:
- Zero-config feature integration
- Consistent configuration across apps
- Feature modules can be toggled on/off easily
- Reduces boilerplate in application code
- Makes it easy to spin up new apps with standard features
- Beautiful API documentation out of the box with Scalar UI

**Implementation Details**:
- Bootstrap functions conditionally import feature modules
- Each feature module provides a registration function
- Base bootstrap manages module initialization order
- Configuration is validated at startup
- Type-safe configuration with TypeScript
- OpenAPI documentation auto-generated with Scalar UI at `/api/docs`
- Swagger decorators converted to OpenAPI spec automatically

### Migration Strategy

#### Phase 1: Core Infrastructure (Checkpoint 1)
1. Create `libs/core/*` directory structure (api, web, ui, utils)
2. Consolidate existing libraries:
   - Merge query, router, store, data-access → `@libs/core/web`
   - Merge db, decorators, pipes → `@libs/core/api`
   - Move ui components and cn() → `@libs/core/ui`
   - Extract shared errors/types → `@libs/core/utils`
3. Implement bootstrap functions in `@libs/core/api` and `@libs/core/web`
4. Update all import paths in apps and packages
5. Verify all tests pass
6. **Checkpoint**: Apps start and function correctly with consolidated packages

#### Phase 2: Development Tools (Checkpoint 2)
1. Create `dev/cli` directory
2. Move `cli/tools` to `dev/cli` with new package name `@dev/cli`
3. Update all references to CLI tools
4. Verify CLI commands work
5. **Checkpoint**: Dev tools accessible and functional

#### Phase 3: Auth Module (Checkpoint 3)
1. Design auth module architecture (JWT, guards, DTOs)
2. Create `libs/auth/api` with NestJS components
3. Create `libs/auth/web` with React components
4. Integrate auth into `apps/api` and `apps/web`
5. Add auth database schema to Prisma
6. Implement basic login/logout flow
7. **Checkpoint**: Users can register, login, and logout

#### Phase 4: Health Module (Checkpoint 4)
1. Design health check architecture
2. Create `libs/health/api` with NestJS health endpoints
3. Create `libs/health/web` with React health status pages
4. Integrate health checks into both apps
5. **Checkpoint**: Health endpoints respond correctly

#### Phase 5: Documentation & Cleanup (Final)
1. Update `CLAUDE.md` with new structure
2. Update `README.md` with migration guide
3. Update package documentation
4. Remove deprecated paths
5. Final verification of all functionality

### Usage Examples

**Library Import Paths - Before:**
```typescript
import { Button } from '@libs/ui';
import { ApiClient } from '@libs/data-access';
import { createQueryWrapper } from '@libs/query';
```

**Library Import Paths - After (Consolidated):**
```typescript
// Core packages - consolidated by concern
import { bootstrapApp, ApiClient, createQueryWrapper, useRouter } from '@libs/core/web';
import { Button, cn } from '@libs/core/ui';
import { NetworkError, ValidationError, formatDate } from '@libs/core/utils';

// Feature modules
import { AuthGuard, JwtStrategy } from '@libs/auth/api';
import { LoginForm, useAuth } from '@libs/auth/web';
```

**Key improvements:**
- Frontend utilities consolidated into `@libs/core/web` (query, router, store, data-access)
- Backend utilities consolidated into `@libs/core/api` (db, decorators, pipes)
- Shared errors and types in `@libs/core/utils` (used by both FE & BE)
- UI components and `cn()` in `@libs/core/ui`

**Application Setup - Before:**
```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Manual configuration...
  await app.listen(3001);
}
```

**Application Setup - After:**
```typescript
// apps/api/src/main.ts
import { bootstrapApi } from '@libs/core/api';

async function bootstrap() {
  const app = await bootstrapApi({
    auth: true,
    health: true,
    cors: true,
    openapi: { title: 'My API', version: '1.0', description: 'API Documentation' }
  });

  await app.listen(3001);
}
```

> With this simple configuration, you get:
> - Full authentication with JWT
> - Health check endpoints
> - CORS enabled
> - Beautiful API documentation at `/api/docs` (Scalar UI)
> - OpenAPI spec at `/api/docs-json`

### Authentication Module Specification

**libs/auth/api**:
- JWT strategy with Passport
- Auth guards (Public, Authenticated, Roles)
- DTOs (LoginDto, RegisterDto, TokenDto)
- Auth service (login, register, validate token)
- Auth controller (POST /auth/login, POST /auth/register, GET /auth/me)

**libs/auth/web**:
- Login page component
- Register page component
- Auth store (user state, tokens)
- Auth hooks (useAuth, useUser, useLogin, useLogout)
- Protected route wrapper
- Auth API client

### Health Module Specification

**libs/health/api**:
- Health controller (GET /health, GET /health/db, GET /health/ready)
- Database health indicator
- Disk health indicator
- Memory health indicator

**libs/health/web**:
- Health dashboard component
- System status widget
- Health check hooks
- Status badge components

## Dependencies

### New Dependencies (Base API)
- `@nestjs/swagger`: OpenAPI spec generation for NestJS
- `@scalar/nestjs-api-reference`: Beautiful Scalar UI for API documentation

### New Dependencies (Auth)
- `@nestjs/passport`: NestJS Passport integration
- `@nestjs/jwt`: JWT token generation/validation
- `passport-jwt`: JWT Passport strategy
- `bcrypt`: Password hashing
- `@types/bcrypt`: TypeScript types for bcrypt

### New Dependencies (Health)
- `@nestjs/terminus`: NestJS health check module

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes during migration | High | Checkpoint-based approach, comprehensive testing |
| Import path resolution issues | Medium | Update TypeScript path mappings, verify builds |
| Circular dependencies | Medium | Careful dependency planning, no base → feature imports |
| Lost functionality | High | Test suite validation at each checkpoint |
| Developer confusion | Low | Clear documentation, migration guide |

## Testing Strategy

### Checkpoint Testing
At each checkpoint, verify:
- [ ] All apps start without errors (`pnpm dev`)
- [ ] TypeScript compilation succeeds (`pnpm typecheck`)
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual smoke testing of web UI

### Feature Testing
- **Auth**: Register → Login → Access protected route → Logout → Verify token invalidation
- **Health**: Call health endpoints → Verify response structure → Check database connectivity

## Rollback Plan

If critical issues arise:
1. Revert to commit before migration started
2. Address issues in separate branch
3. Re-attempt migration with fixes

## Future Extensions

After initial migration, enable:
- `libs/ai/*` - AI agents and workflow management
- `libs/notifications/*` - User notification system
- `libs/whatsapp/*` - WhatsApp Business API integration
- `libs/payments/*` - Payment processing
- Additional feature modules as needed

## Acceptance Criteria

### Must Have
- [x] Core libraries migrated to `libs/core/*`
- [x] Bootstrap functions implemented (`bootstrapApi`, `bootstrapApp`)
- [x] Development CLI migrated to `dev/cli`
- [x] Auth module provides login/register/logout via `{ auth: true }`
- [x] Health module provides API and web health checks via `{ health: true }`
- [x] Zero-config feature integration working
- [x] All existing functionality preserved
- [x] All tests passing
- [x] Documentation updated with bootstrap pattern

### Nice to Have
- [ ] Migration script for automated import path updates
- [ ] Visual health dashboard in web app
- [ ] Role-based access control in auth module
- [ ] OAuth provider support (Google, GitHub)
- [ ] Additional bootstrap options (logging, analytics, etc.)

## Timeline Estimate

- **Phase 1** (Core Infrastructure + Bootstrap + Consolidation): 4-5 hours
- **Phase 2** (Development Tools): 1 hour
- **Phase 3** (Auth Module with Bootstrap): 4-5 hours
- **Phase 4** (Health Module with Bootstrap): 2-3 hours
- **Phase 5** (Documentation): 1-2 hours

**Total**: 13-17 hours

**Note**: Phase 1 takes longer due to consolidating 9 packages into 4 core packages.

## References

- Current structure: `./CLAUDE.md`
- TypeScript path mappings: `./tsconfig.base.json`
- Turborepo configuration: `./turbo.json`
- Package workspace: `./package.json`
