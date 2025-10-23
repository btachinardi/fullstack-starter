# Fullstack Starter - Project Guide

A batteries-included monorepo for full-stack TypeScript applications with high quality standards and feature delivery workflows.

---

## PNPM Workspace & Dev Tooling

### Package Manager

- **PNPM 9.15.0+**: Fast, disk-efficient workspace management
- **Node 20.18.0+**: Required runtime version
- **Workspace Protocol**: Packages linked via `workspace:*` for type-safe inter-package dependencies

### Build & Task Orchestration

- **Turborepo**: Parallel task execution with intelligent caching (`turbo.json`)
- **Pipeline**: Topologically sorted builds, parallel dev/test/lint execution
- **Caching**: Local `.turbo` cache for faster rebuilds

### Code Quality Tooling

- **TypeScript 5.7**: Strict mode enforcement across all packages
- **Biome 2.2.7+**: Unified linter and formatter (Rust-based)
- **Husky + lint-staged**: Pre-commit hooks for quality gates
- **Gitleaks**: Secret detection in commits
- **Security Audits**: pnpm audit for dependency vulnerabilities

### Key Root Scripts

```bash
pnpm dev              # Start all apps in watch mode (parallel)
pnpm build            # Build all packages/apps topologically
pnpm check            # Perform lint and format using biome
pnpm typecheck        # TypeScript validation across workspace
pnpm test             # Run all test suites
pnpm clean            # Remove all build artifacts and node_modules

# App-specific
pnpm dev:web          # Start web app only
pnpm dev:api          # Start API server only

# Database (from apps/api directory)
pnpm db:migrate       # Build schema + run migrations
pnpm db:generate      # Build schema + generate client
pnpm db:push          # Build schema + push to database
pnpm db:studio        # Launch Prisma Studio

# CI/CD
pnpm ci:local         # Run full CI pipeline locally
pnpm ci:bootstrap     # Validate environment setup
```

---

## Workspace Projects

### Apps (`apps/`)

#### **api** (`@apps/api`)

**NestJS REST API with Prisma ORM and Better Auth**

- **Stack**: NestJS 11, Prisma 6, PostgreSQL/SQLite, Better Auth
- **Features**: Built-in auth, health checks, OpenAPI docs, validation, dependency injection
- **Dev**: `pnpm dev:api` (watch mode on port 3001)
- **Type**: CommonJS module
- **Dependencies**: `@libs/platform/api`, `@libs/core/api`

#### **web** (`@apps/web`)

**Next.js App Router with React 19**

- **Stack**: Next.js 16, React 19, Tailwind CSS, Turbopack
- **Features**: App Router, Server Components, component library
- **Dev**: `pnpm dev:web` (Next.js dev server with Turbopack, port 3000)
- **Type**: ESM module
- **Dependencies**: `@libs/platform/web`, `@libs/core/ui`, `@libs/core/web`, `@libs/health/web`

---

### Configuration (`configs/`)

**typescript** (`@configs/typescript`)

- Base TypeScript compiler configurations
- Strict mode, ES2022 target, declaration file generation
- Variants: base, react, node

**jest** (`@configs/jest`)

- Jest configuration
- Jest presets
- Jest plugins

---

### Libraries (`libs/`)

The monorepo uses a **layered architecture** separating foundational building blocks from platform wiring:

#### Core Packages (`libs/core/`) - Foundational Building Blocks

**api** (`@libs/core/api`)

- **Foundational NestJS utilities** - Shared decorators, Prisma client, base utilities
- `@Public` decorator for marking public routes (shared across all modules)
- Prisma client singleton with connection pooling
- PrismaClient type exports
- Legacy DTOs (to be moved to feature modules)
- **Minimal dependencies** - Only @nestjs/common, @nestjs/mapped-types, @prisma/client
- Depends on: None (foundational layer)

**web** (`@libs/core/web`)

- **Foundational React utilities** - Browser hooks and utilities
- Browser-specific hooks (`useIsMobile()`)
- Future: Additional foundational hooks
- **Minimal dependencies** - Only react, react-dom
- Depends on: None (foundational layer)

**ui** (`@libs/core/ui`)

- **Component library + UI utilities**
- Reusable React components (Button, Card, Table, Input, etc.)
- Styled with class-variance-authority (CVA) for variants
- `cn()` utility for Tailwind className merging (tailwind-merge + clsx)
- Tree-shakeable individual exports
- Composable component patterns

**utils** (`@libs/core/utils`)

- **Pure TypeScript utilities with ZERO dependencies**
- Shared error classes used by BOTH frontend and backend:
  - `AppError` - Base error with statusCode
  - `NetworkError` - HTTP/network failures (FE calling BE, BE calling external APIs)
  - `ValidationError` - Validation failures
  - `AuthError` - Authentication/authorization failures
  - `NotFoundError` - Resource not found (404)
  - `ServerError` - Internal server errors (500)
- Shared TypeScript types (`Nullable<T>`, `Optional<T>`, `DeepPartial<T>`)
- Pure formatting utilities (capitalize, isEmpty, isString, isNumber)
- NO browser APIs, NO Node.js APIs, NO framework dependencies

---

#### Platform Packages (`libs/platform/`) - Bootstrapping & Wiring

**api** (`@libs/platform/api`)

- **Application bootstrapping and module wiring** for NestJS
- `bootstrapApp()` - Zero-config app factory with auto-configuration
- `createApp()` - Flexible app factory for custom setups
- `BaseAppModule` - Wires auth + health modules together
- Prisma client re-export from @libs/core/api
- Auto-configuration: CORS, body parser, shutdown hooks, logging
- Depends on: `@libs/auth/api`, `@libs/health/api`, `@libs/core/api`

**web** (`@libs/platform/web`)

- **Application bootstrapping and provider wiring** for React/Next.js
- `Providers` component - Wires all global providers (Query, Themes)
- TanStack Query configuration
- Next Themes configuration
- Future: Router providers, Auth providers
- Depends on: `@tanstack/react-query`, `next-themes`, `@libs/core/web`

---

#### Feature Modules (`libs/*/`)

**auth/api** (`@libs/auth/api`)

- **Backend authentication** using Better Auth
- Email/password authentication with session management
- Prisma schema with User, Session, Account, Verification models
- NestJS integration via `@thallesp/nestjs-better-auth`
- Exports: `AuthModule`, `auth` instance, `prisma` client, decorators
- Depends on: `@libs/core/api` (for @Public decorator)

**auth/web** (`@libs/auth/web`)

- **Frontend authentication** using Better Auth React client
- Customizable login/signup pages with branding support
- Auth hooks: `useAuth()`, `useSession()`
- Components: `LoginPage`, `SignupPage`, `LogoutButton`, `AuthLayout`
- Branding interface for product name/logo customization
- Depends on: `@libs/core/ui`, `@libs/core/utils`

**health/api** (`@libs/health/api`)

- **Backend health monitoring** using @nestjs/terminus
- Health endpoints: `/health`, `/health/db`, `/health/ready`, `/health/live`
- Prisma health indicator for database connectivity checks
- Memory, disk, and database health monitoring
- All endpoints marked as `@Public` (no authentication required)
- **Flat structure** - Single files, no unnecessary folders
- Depends on: `@libs/core/api` (for @Public decorator)

**health/web** (`@libs/health/web`)

- **Frontend health monitoring dashboard**
- Real-time health status display with auto-refresh (30s)
- Hooks: `useHealth()`, `useDbHealth()`, `useReadiness()`
- `HealthStatusDashboard` component with color-coded status
- TanStack Query integration for data fetching
- Depends on: `@libs/core/ui`, `@tanstack/react-query`

**email/api** (`@libs/email/api`)

- **Backend email service** using Resend
- Email sending with template support
- React Email templates
- Transactional email support
- Depends on: Core email functionality

**email/templates** (`@libs/email/templates`)

- **Email templates** using React Email
- Reusable email components
- Welcome emails, verification emails, etc.

---

### Tools (`cli/tools/`)

**@cli/tools**

- **CLI utilities** for project management and development workflows
- **Session Management**: Inspect Claude Code session data (info, agents, tools, files, conversation, bash history)
- **Log Analysis**: Tail, query, and analyze logs with stats and source tracking
- **Stack**: Commander.js, Chalk, Ora (spinners), Claude Agent SDK
- **Build**: TypeScript + tsup (bundler)
- **Usage**: `pnpm tools <command>` or `node cli/tools/dist/cli/main.js`

**Key Commands**:

```bash
pnpm tools session info          # Session metadata
pnpm tools session conversation  # View conversation history
pnpm tools logs tail             # Tail project logs
pnpm tools logs query <term>     # Search logs
```

---

## Architecture Patterns

### Monorepo Organization

```
fullstack-starter/
├── apps/              (@apps/*) - Deployable applications
│   ├── api/          → @apps/api (NestJS + Prisma)
│   └── web/          → @apps/web (Next.js)
├── dev/               (@dev/*) - Development tools
│   └── cli/          → @dev/cli (CLI tools + Prisma build tool)
├── configs/           (@configs/*) - Shared configurations
│   ├── typescript/   → @configs/typescript
│   └── jest/         → @configs/jest
├── libs/
│   ├── core/         (@libs/core/*) - Foundational building blocks
│   │   ├── api/      → @libs/core/api (NestJS decorators, Prisma client)
│   │   ├── web/      → @libs/core/web (React hooks)
│   │   ├── ui/       → @libs/core/ui (Components + cn utility)
│   │   └── utils/    → @libs/core/utils (Pure TS + shared errors)
│   ├── platform/     (@libs/platform/*) - Bootstrapping & wiring
│   │   ├── api/      → @libs/platform/api (App factory, BaseAppModule)
│   │   └── web/      → @libs/platform/web (Global providers)
│   ├── auth/         (@libs/auth/*) - Authentication feature
│   │   ├── api/      → @libs/auth/api (Better Auth backend)
│   │   └── web/      → @libs/auth/web (Better Auth frontend)
│   └── health/       (@libs/health/*) - Health monitoring feature
│       ├── api/      → @libs/health/api (Health endpoints - flat)
│       └── web/      → @libs/health/web (Health dashboard)
└── cli/               (Legacy - empty, being migrated to dev/)
```

### Dependency Flow

**Three-layer architecture:**

1. **Core Layer** - Foundational building blocks (no dependencies on other libs)
   - `@libs/core/api` - Decorators (@Public), Prisma client
   - `@libs/core/web` - Browser hooks (useIsMobile)
   - `@libs/core/ui` - UI components + cn() utility
   - `@libs/core/utils` - Shared errors, pure TypeScript utilities

2. **Feature Layer** - Domain-specific modules (depend on core)
   - `@libs/auth/api` → depends on `@libs/core/api`
   - `@libs/auth/web` → depends on `@libs/core/ui`, `@libs/core/utils`
   - `@libs/health/api` → depends on `@libs/core/api`
   - `@libs/health/web` → depends on `@libs/core/ui`

3. **Platform Layer** - Bootstrapping & wiring (depends on core + features)
   - `@libs/platform/api` → wires `@libs/auth/api` + `@libs/health/api` + `@libs/core/api`
   - `@libs/platform/web` → wires providers with `@libs/core/web`

4. **Application Layer** - Deployable apps (depend on platform)
   - `@apps/api` → depends on `@libs/platform/api` + `@libs/core/api`
   - `@apps/web` → depends on `@libs/platform/web` + feature modules

**Flow diagram:**
```
@apps/* → @libs/platform/* → @libs/feature/* → @libs/core/*
```

### Import Patterns

**Core packages (foundational utilities):**
```typescript
// From @libs/core/ui - Components and UI utilities
import { Button, Card, Input, cn } from '@libs/core/ui';

// From @libs/core/utils - Shared errors and pure utilities
import { NetworkError, ValidationError, isEmpty } from '@libs/core/utils';

// From @libs/core/web - Browser hooks
import { useIsMobile } from '@libs/core/web';

// From @libs/core/api - Decorators, Prisma client, base utilities
import { Public, prisma, PrismaClient, CreateLinkDto } from '@libs/core/api';
```

**Platform packages (bootstrapping & wiring):**
```typescript
// From @libs/platform/api - App bootstrapping
import { bootstrapApp, createApp, BaseAppModule } from '@libs/platform/api';
import type { AppFactoryConfig } from '@libs/platform/api';

// From @libs/platform/web - Global providers
import { Providers } from '@libs/platform/web';
```

**Feature modules:**
```typescript
// From @libs/auth/web - Authentication frontend
import { LoginPage, SignupPage, useAuth, LogoutButton } from '@libs/auth/web';

// From @libs/auth/api - Authentication backend
import { AuthModule, auth } from '@libs/auth/api';

// From @libs/health/web - Health monitoring UI
import { HealthStatusDashboard, useHealth, useDbHealth } from '@libs/health/web';

// From @libs/health/api - Health monitoring backend
import { HealthModule, HealthController, PrismaHealthIndicator } from '@libs/health/api';
```

**Shared error usage (Frontend & Backend):**
```typescript
// Frontend - ApiClient throwing NetworkError
if (!response.ok) {
  throw new NetworkError('API request failed', response.status);
}

// Backend - Service calling external API
if (!whatsappResponse.ok) {
  throw new NetworkError('WhatsApp API failed', whatsappResponse.status);
}

// Both can catch the same error type
try {
  await operation();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network issue:', error.statusCode);
  }
}
```

**Using @Public decorator (shared from core):**
```typescript
// Any module can mark routes as public
import { Public } from '@libs/core/api';

@Controller('health')
@Public()  // All routes in this controller are public
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

// Or mark individual routes
@Controller('api')
export class ApiController {
  @Get('status')
  @Public()  // Only this route is public
  getStatus() {
    return { online: true };
  }
}
```

### Architecture Philosophy

**Core vs Platform Split:**

The monorepo separates **foundational building blocks** from **application wiring**:

- **Core packages** (`@libs/core/*`):
  - Provide reusable primitives: decorators, hooks, components, utilities
  - Have minimal dependencies
  - Never depend on feature modules
  - Example: `@Public` decorator shared by all modules

- **Platform packages** (`@libs/platform/*`):
  - Handle application bootstrapping and module orchestration
  - Wire feature modules together (auth + health in BaseAppModule)
  - Configure global providers (Query, Themes)
  - Depend on core + feature modules

- **Feature modules** (`@libs/auth/*`, `@libs/health/*`):
  - Self-contained domain logic
  - Depend only on core packages
  - Can be wired into platform or used directly

**Flat Structure for Small Modules:**

Single files don't need folder wrappers:

```typescript
// ❌ Over-engineered (3 files in folders)
libs/health/api/src/
├── controllers/
│   └── health.controller.ts
├── indicators/
│   └── prisma.health.ts
└── decorators/
    └── public.decorator.ts

// ✅ Flat (3 files at root level)
libs/health/api/src/
├── health.controller.ts
├── health.module.ts
└── prisma-health.indicator.ts
```

### Type Safety

- End-to-end TypeScript coverage
- Shared type utilities in `@libs/core/utils`
- Shared error classes with instanceof checking
- TypeScript strict mode enforced across all packages

### Quality Gates

- Pre-commit: lint-staged with Biome auto-fix
- CI: typecheck → lint → test → build (enforced via Turborepo)
- Local CI: `pnpm ci:local` runs full pipeline
- Manual: `pnpm lint:assertions` - Type assertion code review tool (run periodically)

---

## Development Workflow

1. **Setup**: `pnpm install` (workspace install)
2. **Environment**: Copy `.env.example` → `.env` for each app
3. **Database**: `pnpm api:migrate` (Prisma migrations)
4. **Dev**: `pnpm dev` (starts all apps in parallel)
5. **Build**: `pnpm build` (topological build order)
6. **Test**: `pnpm test` (all test suites)
7. **Quality**: `pnpm lint && pnpm typecheck && pnpm format:check`
8. **Code Review** (optional): `pnpm lint:assertions` - Review type assertions

### Adding New Feature Modules

Feature modules follow the pattern: `libs/<feature>/{api,web}`

**Example: Adding a `notifications` feature module:**

1. Create packages:
   ```
   libs/notifications/api/  → @libs/notifications/api
   libs/notifications/web/  → @libs/notifications/web
   ```

2. Configure package.json for each:
   - API package depends on `@libs/core/api` (for decorators, utilities)
   - Web package depends on `@libs/core/web`, `@libs/core/ui` (for hooks, components)

3. Update pnpm-workspace.yaml:
   ```yaml
   packages:
     - "libs/notifications/*"
   ```

4. Add to Turborepo pipeline in `turbo.json` if needed

5. Wire into platform (if needed):
   - Add to `@libs/platform/api` BaseAppModule if it's a global feature
   - Otherwise, import directly in app module

**Package guidelines:**
- **Core packages** (`@libs/core/*`) - Foundational, minimal dependencies, shared by all
- **Platform packages** (`@libs/platform/*`) - Bootstrap & wiring, orchestrate features
- **Feature modules** - New features always go here, not in core
- **Flat structure** - Single files don't need folders (e.g., health/api)

---

## Key Technologies

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Turbopack
- **Backend**: NestJS 11, Prisma 6, PostgreSQL/SQLite, Better Auth
- **Testing**: Jest (API), Vitest (planned), Playwright (E2E - planned)
- **Tooling**: PNPM Workspaces, Turborepo, Biome, TypeScript 5.9
- **DevOps**: Docker Compose (local), GitHub Actions (CI - planned)

---

## Best Practices

- **Vertical Slices**: Build features across all layers (UI → API → DB)
- **Type Safety**: Leverage TypeScript strictly; use Zod for runtime validation
- **Code Reuse**: Extract common logic into shared packages
- **Testing**: Write tests alongside implementation (unit → integration → E2E)
- **Documentation**: Update CLAUDE.md when adding/changing workspace structure
- **Commits**: Follow Conventional Commits for changelog generation
- **PRs**: Keep focused and small; link to PRD/specs when applicable

### Architecture Best Practices

**When to use each layer:**

1. **Add to @libs/core** - Rarely
   - Only add truly foundational primitives
   - Must be reusable by ALL modules
   - Examples: decorators, base hooks, shared clients
   - Keep dependencies minimal

2. **Add to @libs/platform** - For wiring
   - Application initialization logic
   - Global provider configuration
   - Module orchestration (BaseAppModule)
   - Bootstrap functions

3. **Add to feature modules** - Most common
   - All new domain features
   - Self-contained functionality
   - Can depend on core, not other features
   - Examples: auth, health, notifications, payments

**Structure guidelines:**
- **Flat structure**: If module has 1-5 files, keep them at src/ root
- **Organized structure**: If module has 6+ files or clear sub-domains, use folders
- **No single-file folders**: Never wrap one file in a folder

---

## Type Safety & Code Quality Standards

This project enforces **100% type-safe, lint-clean code** with zero tolerance for shortcuts. All code must pass strict TypeScript and Biome checks before committing.

### TypeScript Strict Mode

**Enabled strict checks:**
- `strict`: true (enables all strict type checking)
- `noImplicitAny`: Disallow implicit `any` types
- `strictNullChecks`: Enforce null/undefined handling
- `strictFunctionTypes`: Strict function type checking
- `noUnusedLocals`: Error on unused variables
- `noUnusedParameters`: Error on unused parameters

### Type Safety Rules

**Never use `any`** - Always use proper types:
```typescript
// ❌ WRONG - Using any
let data: any = await response.json();

// ✅ CORRECT - Using proper types with type guards
interface ErrorResponse {
  message?: string;
  code?: string;
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data;
}

const data: unknown = await response.json();
const error = isErrorResponse(data) ? data : { message: 'Unknown error' };
```

**Prefer type guards over type assertions (`as`)**:
```typescript
// ❌ WRONG - Unsafe type assertion
const user = data as User;

// ✅ CORRECT - Using type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as { id: unknown; name: unknown }).id === 'string' &&
    typeof (data as { id: unknown; name: unknown }).name === 'string'
  );
}

const user = isUser(data) ? data : null;
```

**Valid use cases for type assertions**:
- Generic types: `return data as T` (when T is a type parameter)
- Jest mocks: `const mock = service as jest.Mocked<typeof service>`
- Double casting for safety: `const value = (input as unknown) as TargetType`
- Global object typing: `(globalThis as NodeGlobal).process`

**Manual code review tool**:
Run `pnpm lint:assertions` periodically to identify potentially unsafe type assertions.
This is a code review aid, not an automated blocker - it helps find assertions that
could be replaced with type guards for better runtime safety.

**Never use non-null assertions (`!`)** - Always handle undefined/null:
```typescript
// ❌ WRONG - Using non-null assertion
const element = document.getElementById('root')!;
const value = array[0]!;

// ✅ CORRECT - Proper null handling
const element = document.getElementById('root');
if (!element) {
  throw new Error('Root element not found');
}

const value = array[0];
if (!value) {
  return null;
}
```

**Always handle regex match groups**:
```typescript
// ❌ WRONG - Assuming match groups exist
const match = str.match(/(\d+)/);
const number = match[1]; // Could be undefined!

// ✅ CORRECT - Check match and groups
const match = str.match(/(\d+)/);
if (!match || !match[1]) {
  throw new Error('No match found');
}
const number = match[1];
```

**Always validate unknown data**:
```typescript
// ❌ WRONG - Accessing properties on unknown
function handleData(data: unknown) {
  console.log(data.message); // Error!
}

// ✅ CORRECT - Type guard before access
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    console.log((data as { message: unknown }).message);
  }
}
```

### Biome Configuration

**Enforced rules** (see `biome.json`):
- **No explicit any**: `noExplicitAny: "warn"` - Warnings for any usage (will be error in future)
- **No unused variables**: `noUnusedVariables: "error"`
- **No var**: `noVar: "error"` - Use const/let only
- **Use const**: `useConst: "error"` - Prefer const over let
- **Organize imports**: Automatic import sorting
- **Format**: Single quotes, 2-space indent, 100 line width, semicolons, es5 trailing commas

**NestJS support:**
- `unsafeParameterDecoratorsEnabled: true` - Required for parameter decorators

**Testing globals:**
- Jest globals recognized: `jest`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`

### Code Quality Checklist

Before committing code, ensure:

- [ ] Zero TypeScript errors (`pnpm typecheck`)
- [ ] Zero Biome errors (`pnpm lint`)
- [ ] All tests passing (`pnpm test`)
- [ ] No `any` types
- [ ] No type assertions (`as`)
- [ ] No non-null assertions (`!`)
- [ ] All `unknown` values validated with type guards
- [ ] All regex matches checked for null/undefined
- [ ] All array accesses checked for undefined
- [ ] All optional properties handled
- [ ] No unused variables or imports

### Type Guard Pattern

**Standard type guard template:**
```typescript
interface MyType {
  requiredField: string;
  optionalField?: number;
}

function isMyType(data: unknown): data is MyType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiredField' in data &&
    typeof (data as { requiredField: unknown }).requiredField === 'string'
  );
}

// Usage
const data: unknown = await fetchData();
if (isMyType(data)) {
  // data is now MyType - safe to use
  console.log(data.requiredField);
}
```

### Error Handling

**Always type errors properly:**
```typescript
// ❌ WRONG - Assuming error type
try {
  await someOperation();
} catch (error) {
  console.log(error.message); // Error! error is unknown
}

// ✅ CORRECT - Type guard or type check
try {
  await someOperation();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.log(message);
}
```

### Summary

**Zero tolerance for:**
- `any` types
- Type assertions (`as`)
- Non-null assertions (`!`)
- Unsafe property access
- Unhandled undefined/null

**Always use:**
- Proper interfaces and types
- Type guards for validation
- Explicit null/undefined checks
- Type-safe error handling
- Strict TypeScript settings

---

## References

- **Main README**: `./README.md` - Feature delivery playbook overview
- **Playbook**: `./PLAYBOOK_DRAFT.md` - Workflows, templates, and standards
- **Implementation**: `./IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- **Tools Docs**: `./tools/README.md` - CLI tools architecture and usage
