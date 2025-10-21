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
- **ESLint**: Configured via `@starter/eslint` with React/Node variants
- **Prettier**: Standardized formatting via `@starter/prettier`
- **Biome** (tools/): Alternative linter/formatter for CLI tools
- **Husky + lint-staged**: Pre-commit hooks for quality gates

### Key Root Scripts

```bash
pnpm dev              # Start all apps in watch mode (parallel)
pnpm build            # Build all packages/apps topologically
pnpm lint             # Run ESLint across workspace
pnpm format           # Format all code with Prettier
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

#### **api** (`@fullstack-starter/api`)

**NestJS REST API with Prisma ORM**

- **Stack**: NestJS 10 + Fastify, Prisma 6, PostgreSQL/SQLite
- **Features**: OpenAPI/Swagger docs, validation (class-validator), dependency injection
- **Dev**: `pnpm dev:api` (watch mode on default port)
- **Type**: CommonJS module
- **Dependencies**: `@starter/api`, `@starter/db`, `@starter/utils`

#### **web** (`@fullstack-starter/web`)

**React SPA with Vite and TanStack ecosystem**

- **Stack**: React 18, Vite 6, TanStack Query/Router, Tailwind CSS
- **Features**: Type-safe routing, server state management, component library
- **Dev**: `pnpm dev:web` (Vite dev server, default port 3000)
- **Type**: ESM module
- **Dependencies**: `@starter/data-access`, `@starter/ui`, `@starter/query`, `@starter/router`, `@starter/utils`

---

### Configuration (`configs/`)

**eslint** (`@starter/eslint`)

- Shared ESLint rules (base, React, Node.js variants)
- Integration with Prettier, TypeScript, import sorting

**prettier** (`@starter/prettier`)

- Standardized code formatting rules
- Consistent style across all workspace packages

**typescript** (`@starter/typescript`)

- Base TypeScript compiler configurations
- Strict mode, ES2022 target, declaration file generation
- Variants: base, react, node

**vite** (`@starter/vite`)

- Shared Vite build configuration for React apps
- Pre-configured code splitting (vendor, router, query chunks)
- Default dev server settings (port 3000)

---

### Packages (`packages/`)

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
- **Node utilities** (`@starter/utils`): Server error classes with HTTP status codes, Node-specific logger
- Format utilities and shared functionality
- Supports both ESM and CommonJS via `typesVersions`

---

### Tools (`tools/`)

**@fullstack-starter/tools**

- **CLI utilities** for project management and development workflows
- **Session Management**: Inspect Claude Code session data (info, agents, tools, files, conversation, bash history)
- **Log Analysis**: Tail, query, and analyze logs with stats and source tracking
- **Stack**: Commander.js, Chalk, Ora (spinners), Claude Agent SDK
- **Build**: TypeScript + tsup (bundler)
- **Usage**: `pnpm tools <command>` or `node tools/dist/cli/main.js`

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
│   ├── eslint
│   ├── prettier
│   ├── typescript
│   └── vite
├── packages/          # Shared libraries
│   ├── api            # NestJS utilities and DTOs
│   ├── db             # Prisma client wrapper
│   ├── query          # TanStack Query wrapper
│   ├── router         # TanStack Router wrapper
│   ├── store          # TanStack Store wrapper
│   ├── data-access    # API client layer
│   ├── ui             # Component library
│   └── utils          # Unified utilities (web + node)
└── tools/             # Development CLI utilities
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

- Pre-commit: lint-staged with Prettier + ESLint auto-fix
- CI: typecheck → lint → test → build (enforced via Turborepo)
- Local CI: `pnpm ci:local` runs full pipeline

---

## Development Workflow

1. **Setup**: `pnpm install` (workspace install)
2. **Environment**: Copy `.env.example` → `.env` for each app
3. **Database**: `pnpm api:migrate` (Prisma migrations)
4. **Dev**: `pnpm dev` (starts all apps in parallel)
5. **Build**: `pnpm build` (topological build order)
6. **Test**: `pnpm test` (all test suites)
7. **Quality**: `pnpm lint && pnpm typecheck && pnpm format:check`

### Adding New Packages

1. Create package in `packages/<name>`
2. Add `package.json` with `@starter/<name>` as package name
3. Extend appropriate config packages (eslint, typescript, etc.)
4. Update dependent packages to import via `@starter/<name>`
5. Add to Turborepo pipeline in `turbo.json` if needed

---

## Key Technologies

- **Frontend**: React 18, Vite 6, TanStack Query/Router/Store, Tailwind CSS
- **Backend**: NestJS 10, Fastify, Prisma 6, PostgreSQL
- **Testing**: Vitest (unit/integration), Jest (API), Playwright (E2E - planned)
- **Tooling**: PNPM Workspaces, Turborepo, ESLint, Prettier, TypeScript 5.7
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

## References

- **Main README**: `./README.md` - Feature delivery playbook overview
- **Playbook**: `./PLAYBOOK_DRAFT.md` - Workflows, templates, and standards
- **Implementation**: `./IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- **Tools Docs**: `./tools/README.md` - CLI tools architecture and usage
