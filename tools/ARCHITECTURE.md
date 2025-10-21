# Tools Architecture

## Design Philosophy

The tools package follows a **separation of concerns** architecture with strongly-typed pure functions separated from CLI presentation logic.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         CLI Entry Point                 │
│      (src/cli/main.ts)                  │
│                                         │
│  - Argument parsing                     │
│  - Command routing                      │
│  - Output formatting                    │
│  - Error handling                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Tool Functions                   │
│      (src/tools/*.ts)                   │
│                                         │
│  - Pure, testable functions             │
│  - Strongly-typed signatures            │
│  - Business logic only                  │
│  - Return structured data               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Services                        │
│   (src/services/*.ts)                   │
│                                         │
│  - SessionParser                        │
│  - Parsing & processing logic           │
│  - Data transformation                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Types                          │
│     (src/types/*.ts)                    │
│                                         │
│  - TypeScript type definitions          │
│  - Type guards                          │
│  - Interfaces & enums                   │
└─────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. CLI Layer (`src/cli/main.ts`)

**Purpose:** Handle user interaction and presentation

**Responsibilities:**
- Parse command-line arguments
- Route to appropriate tool function
- Transform CLI args into function parameters
- Format output for terminal display
- Handle errors and display user-friendly messages
- Provide spinner/progress indicators

**Example:**
```typescript
session
  .command('info <file>')
  .action(async (file: string) => {
    const spinner = ora('Parsing session...').start();
    const result = await sessionTools.sessionInfo(file);
    spinner.succeed('Session parsed successfully');
    // Format and display result
  });
```

### 2. Tool Functions Layer (`src/tools/*.ts`)

**Purpose:** Pure, testable business logic

**Responsibilities:**
- Implement tool-specific logic
- Accept strongly-typed parameters
- Return structured data (not formatted strings)
- Be completely pure (no I/O, no console.log)
- Be easily testable in isolation

**Example:**
```typescript
export async function sessionInfo(filePath: string): Promise<SessionInfoResult> {
  const parser = new SessionParser();
  const session = await parser.load(filePath);
  const tokens = parser.getTokenUsage();

  return {
    sessionId: session.sessionId,
    stats: { /* ... */ },
    tokens: { /* ... */ },
  };
}
```

### 3. Services Layer (`src/services/*.ts`)

**Purpose:** Core parsing and processing logic

**Responsibilities:**
- Parse session files
- Process and transform data
- Provide query/filter methods
- Abstract complexity from tools

**Example:**
```typescript
export class SessionParser {
  async load(filePath: string): Promise<ParsedSession> { /* ... */ }
  getToolUses(): ToolUse[] { /* ... */ }
  getSubagentInvocations(): SubagentInvocation[] { /* ... */ }
}
```

### 4. Types Layer (`src/types/*.ts`)

**Purpose:** TypeScript type definitions

**Responsibilities:**
- Define all data structures
- Provide type guards for safe narrowing
- Document data shapes
- Enable compile-time safety

**Example:**
```typescript
export interface SessionEntry { /* ... */ }
export interface ToolUse { /* ... */ }
export function isToolUse(content: MessageContent): content is ToolUse { /* ... */ }
```

## Single Entry Point Design

### Why Single Entry Point?

1. **Consistency:** Similar to standard tools (git, docker, npm)
2. **Extensibility:** Easy to add new tools without new binaries
3. **Discoverability:** `tools --help` shows all available tools
4. **Type Safety:** Tool functions have clear signatures

### Command Structure

```
tools <tool-name> <command> [options] [arguments]
  │       │           │          │         │
  │       │           │          │         └─ Command arguments
  │       │           │          └─────────── Command options/flags
  │       │           └────────────────────── Subcommand
  │       └────────────────────────────────── Tool name
  └────────────────────────────────────────── Binary name
```

**Examples:**
```bash
tools session info file.jsonl
tools session tools file.jsonl --count
tools session agents file.jsonl
```

## Type Safety Flow

```
User Input (CLI)
    ↓
Argument Parsing (Commander)
    ↓
Type Transformation
    ↓
Strongly-Typed Tool Function
    ↓
Structured Return Type
    ↓
Format for Display
    ↓
Terminal Output
```

## ESM and `.js` Extensions

### Why `.js` in TypeScript Imports?

TypeScript uses `.js` extensions in imports when targeting ESM (ECMAScript Modules):

```typescript
// Even though this is a .ts file:
import { sessionInfo } from './tools/session.js';  // ✅ Correct

// NOT:
import { sessionInfo } from './tools/session.ts';  // ❌ Wrong
import { sessionInfo } from './tools/session';     // ❌ Wrong (in ESM)
```

**Reason:**
- TypeScript compiles `.ts` → `.js`
- Node.js ESM requires explicit file extensions
- The import must reference the *compiled* file, not the source

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}

// package.json
{
  "type": "module"  // Enables ESM
}
```

## Adding New Tools

To add a new tool:

1. **Create tool functions** in `src/tools/<tool-name>.ts`
2. **Export types** for parameters and return values
3. **Add CLI commands** in `src/cli/main.ts`
4. **Export from index** in `src/index.ts`
5. **Add convenience scripts** in `package.json`

**Example: Adding a Git Tool**

```typescript
// 1. src/tools/git.ts
export interface CommitInfo {
  hash: string;
  author: string;
  message: string;
  date: string;
}

export async function gitLog(limit: number = 10): Promise<CommitInfo[]> {
  // Implementation
  return commits;
}

// 2. src/cli/main.ts
const git = program.command('git').description('Git utilities');

git
  .command('log')
  .option('-n, --limit <number>', 'Number of commits', '10')
  .action(async (options) => {
    const commits = await gitTools.gitLog(parseInt(options.limit));
    // Format and display
  });

// 3. src/index.ts
export * from './tools/git.js';

// 4. package.json
{
  "scripts": {
    "git:log": "pnpm tools git log"
  }
}
```

## Testing Strategy

### Tool Functions (Pure)
```typescript
import { describe, it, expect } from 'vitest';
import { sessionInfo } from './session.js';

describe('sessionInfo', () => {
  it('should parse session and return info', async () => {
    const result = await sessionInfo('test-session.jsonl');
    expect(result.sessionId).toBeDefined();
    expect(result.stats.totalEntries).toBeGreaterThan(0);
  });
});
```

### Services
```typescript
describe('SessionParser', () => {
  it('should extract tool uses', async () => {
    const parser = new SessionParser();
    await parser.load('test-session.jsonl');
    const tools = parser.getToolUses();
    expect(Array.isArray(tools)).toBe(true);
  });
});
```

### CLI (Integration)
```bash
# Test via actual CLI
pnpm build
pnpm tools session info test-file.jsonl
```

## Build Configuration

### tsup.config.ts

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',        // Library entry
    'cli/main': 'src/cli/main.ts' // CLI entry
  },
  format: ['esm'],
  dts: {
    entry: { index: 'src/index.ts' }  // Only lib gets .d.ts
  },
  // Add shebang to CLI files
  esbuildOptions(options) {
    if (options.entryNames === 'cli/main') {
      options.banner = { js: '#!/usr/bin/env node' };
    }
  },
});
```

### Outputs

```
dist/
├── index.js          # Library export
├── index.d.ts        # TypeScript declarations
├── index.js.map      # Source map
└── cli/
    ├── main.js       # CLI executable (with shebang)
    └── main.js.map   # Source map
```

## Package.json Structure

```json
{
  "name": "@fullstack-starter/tools",
  "type": "module",          // Enable ESM
  "bin": {
    "tools": "./dist/cli/main.js"  // CLI binary
  },
  "scripts": {
    "tools": "node dist/cli/main.js",
    "session:info": "pnpm tools session info",
    // ... convenience scripts
  }
}
```

## Usage Patterns

### Programmatic (Library)

```typescript
import { sessionInfo, sessionTools } from '@fullstack-starter/tools';

const info = await sessionInfo('session.jsonl');
const tools = await sessionTools('session.jsonl', { includeCount: true });
```

### CLI (Direct)

```bash
pnpm tools session info session.jsonl
pnpm tools session tools session.jsonl --count
```

### CLI (Convenience)

```bash
pnpm session:info session.jsonl
pnpm session:tools session.jsonl
```

## Best Practices

### ✅ DO

- Keep tool functions pure and testable
- Use strong typing everywhere
- Return structured data from tools
- Handle formatting in CLI layer
- Export all types publicly
- Use type guards for narrowing
- Add JSDoc to public APIs
- Write tests for tool functions

### ❌ DON'T

- Mix formatting with business logic
- Use `console.log` in tool functions
- Return formatted strings from tools
- Put I/O logic in tool functions
- Forget to export types
- Use `any` type
- Skip error handling
- Forget `.js` extensions in imports

## Future Enhancements

Potential additions while maintaining architecture:

- **New Tools:** `git`, `npm`, `docker` utilities
- **Plugins:** User-defined tool plugins
- **Config Files:** `.toolsrc` for defaults
- **Interactive Mode:** REPL-style interface
- **Streaming:** Handle large session files
- **Caching:** Cache parsed sessions
- **Formatting:** Custom output formats (JSON, CSV, etc.)

All additions should follow the same layered architecture pattern.
