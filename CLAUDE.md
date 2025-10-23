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

# Database
pnpm api:migrate      # Run Prisma migrations
pnpm api:seed         # Seed database
pnpm api:db:studio    # Launch Prisma Studio

# CI/CD
pnpm ci:local         # Run full CI pipeline locally
pnpm ci:bootstrap     # Validate environment setup
```

---

## Workspace Projects

### Apps (`apps/`)

#### **api** (`@apps/api`)

**NestJS REST API with Prisma ORM**

- **Stack**: NestJS 10 + Fastify, Prisma 6, PostgreSQL/SQLite
- **Features**: OpenAPI/Swagger docs, validation (class-validator), dependency injection
- **Dev**: `pnpm dev:api` (watch mode on default port)
- **Type**: CommonJS module
- **Dependencies**: `@libs/api`, `@libs/db`, `@libs/utils`

#### **web** (`@apps/web`)

**React SPA with Vite and TanStack ecosystem**

- **Stack**: React 18, Vite 6, TanStack Query/Router, Tailwind CSS
- **Features**: Type-safe routing, server state management, component library
- **Dev**: `pnpm dev:web` (Vite dev server, default port 3000)
- **Type**: ESM module
- **Dependencies**: `@libs/data-access`, `@libs/ui`, `@libs/query`, `@libs/router`, `@libs/utils`

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

#### Data & API Layer

**data-access**

- Type-safe HTTP client (`ApiClient`) with Zod validation
- CRUD resource wrappers (`ResourcesApi`)
- Error handling (auth, validation, network, not found)
- Query parameter and pagination support

**db**

- Prisma client singleton with connection management
- Migration and schema management utilities
- Development-friendly logging and HMR support

**api**

- NestJS DTOs and validation decorators
- OpenAPI/Swagger integration utilities
- Shared backend types and API contracts

---

#### Client State & Routing

**query**

- TanStack Query 5 wrapper with opinionated defaults
- Query key factory for consistent caching
- Pre-configured retry logic and stale time (5min)
- Re-exports: useQuery, useMutation, useInfiniteQuery, useSuspenseQuery

**router**

- TanStack Router 1 wrapper for type-safe routing
- Navigation, route matching, parameter utilities
- Support for lazy loading and code splitting

**store**

- TanStack Store 0.5 wrapper for lightweight state management
- Reactive store with useStore hook
- Example: Theme store (light/dark/system)

---

#### UI & Utilities

**ui**

- Reusable React component library (Button, Card, Table, Input)
- Styled with class-variance-authority (CVA) for variants
- Tree-shakeable individual exports
- Composable component patterns

**utils**

- Unified utility package for both web and Node.js environments
- **Web utilities**: Error classes (AppError, NetworkError, AuthError, ValidationError), logger, CSS utilities (`cn`)
- **Node utilities** (`@libs/utils`): Server error classes with HTTP status codes, Node-specific logger
- Format utilities and shared functionality
- Supports both ESM and CommonJS via `typesVersions`

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
├── apps/              # Deployable applications (api, web)
├── configs/           # Shared tooling configurations
│   ├── typescript
│   └── jest
├── libs/              # Shared libraries
│   ├── api            # NestJS utilities and DTOs
│   ├── db             # Prisma client wrapper
│   ├── query          # TanStack Query wrapper
│   ├── router         # TanStack Router wrapper
│   ├── store          # TanStack Store wrapper
│   ├── data-access    # API client layer
│   ├── ui             # Component library
│   └── utils          # Unified utilities (web + node)
└── cli/               # Development CLI utilities
    └── tools          # General purpose CLI utilities
```

### Dependency Flow

- **Apps** depend on **packages** (workspace:\*)
- **Packages** are independently versioned and publishable
- **Config packages** (in `configs/`) provide consistent tooling across workspace
- **Framework wrappers** (api, db, query, router, store) wrap external libraries with project conventions

### Type Safety

- End-to-end TypeScript coverage
- Shared `tsconfig.base.json` extended by all packages
- Runtime validation via Zod (data-access, utils)
- API contracts via class-validator (api package)

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

### Adding New Packages

1. Create package in `libs/<name>`
2. Add `package.json` with `@libs/<name>` as package name
3. Extend appropriate config packages (eslint, typescript, etc.)
4. Update dependent packages to import via `@libs/<name>`
5. Add to Turborepo pipeline in `turbo.json` if needed

---

## Key Technologies

- **Frontend**: React 18, Vite 6, TanStack Query/Router/Store, Tailwind CSS
- **Backend**: NestJS 10, Fastify, Prisma 6, PostgreSQL
- **Testing**: Vitest (unit/integration), Jest (API), Playwright (E2E - planned)
- **Tooling**: PNPM Workspaces, Turborepo, Biome, TypeScript 5.7
- **DevOps**: Docker Compose (local), GitHub Actions (CI), Render.com (deploy - planned)

---

## Best Practices

- **Vertical Slices**: Build features across all layers (UI → API → DB)
- **Type Safety**: Leverage TypeScript strictly; use Zod for runtime validation
- **Code Reuse**: Extract common logic into shared packages
- **Testing**: Write tests alongside implementation (unit → integration → E2E)
- **Documentation**: Update CLAUDE.md when adding/changing workspace structure
- **Commits**: Follow Conventional Commits for changelog generation
- **PRs**: Keep focused and small; link to PRD/specs when applicable

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
