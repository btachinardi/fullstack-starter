# @fullstack-starter/tools

CLI tools and utilities for the fullstack-starter project, including a comprehensive session parser for Claude Code `.jsonl` transcript files.

## Features

- 🔍 **Strongly-Typed Session Parser** - Parse Claude Code session files with full TypeScript support
- 📊 **Session Analytics** - Extract statistics, token usage, and conversation flow
- 🔧 **Tool Analysis** - Track all tool uses (Read, Write, Edit, Bash, etc.)
- 🤖 **Subagent Tracking** - Identify and analyze subagent invocations
- 📁 **File Access Tracking** - Monitor which files were read, written, or edited
- 💬 **Conversation Export** - Extract clean conversation flow
- 📝 **Structured Logging** - Platform-appropriate logging with rich metadata and powerful querying
- 🔎 **Log Query Tools** - Search, filter, and analyze logs by source, level, tool, session, date range
- 🎯 **CLI Interface** - Easy command-line access to all features

## Installation

```bash
cd tools
pnpm install
```

## Build

```bash
# Build once
pnpm build

# Build and watch for changes
pnpm dev

# Type check
pnpm typecheck

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## CLI Usage

The CLI has a single entry point (`tools`) that dispatches to different tool functions.

### Quick Commands (Recommended)

Use the convenient npm scripts:

```bash
# Session commands
pnpm session:list
pnpm session:info <file>
pnpm session:tools <file>
pnpm session:agents <file>
pnpm session:files <file>
pnpm session:conversation <file>
pnpm session:bash <file>
pnpm session:export <file>

# Log commands
pnpm logs:tail
pnpm logs:stats
pnpm logs:query
pnpm logs:sources
pnpm logs:tools
```

### Direct CLI Usage

```bash
# Main CLI entry point
pnpm tools <tool> <command> [options]

# Session tool
pnpm tools session list
pnpm tools session info <file>
pnpm tools session tools <file> --count
pnpm tools session files <file> --read
pnpm tools session agents <file>
pnpm tools session conversation <file> --limit 50
pnpm tools session bash <file>
pnpm tools session export <file> --pretty
```

### All Session Commands

```bash
# List all available sessions
pnpm session:list

# Show session information and statistics
pnpm session:info <session-file.jsonl>

# List all tools used in a session
pnpm session:tools <session-file.jsonl>
pnpm session:tools <session-file.jsonl> --count

# Show files accessed during session
pnpm session:files <session-file.jsonl>
pnpm session:files <session-file.jsonl> --read
pnpm session:files <session-file.jsonl> --written
pnpm session:files <session-file.jsonl> --edited

# List subagent invocations
pnpm session:agents <session-file.jsonl>

# View conversation flow
pnpm session:conversation <session-file.jsonl>
pnpm session:conversation <session-file.jsonl> --limit 50

# List bash commands
pnpm session:bash <session-file.jsonl>

# Export session as JSON
pnpm session:export <session-file.jsonl> --pretty
pnpm session:export <session-file.jsonl> --output session.json
```

### All Log Commands

```bash
# Show last 20 log entries
pnpm logs:tail
pnpm tools logs tail -n 50

# Query logs with filters
pnpm logs:query
pnpm tools logs query --source subagent-stop
pnpm tools logs query --level error
pnpm tools logs query --tool Bash
pnpm tools logs query --session <session-id>
pnpm tools logs query --search "Agent SDK"
pnpm tools logs query --start 2025-10-01 --end 2025-10-31

# Show log statistics
pnpm logs:stats

# List all log sources
pnpm logs:sources

# List all logged tools
pnpm logs:tools
```

**Log Locations:**
- Windows: `%APPDATA%\fullstack-starter\tools\logs\YYYY-MM-DD.jsonl`
- macOS: `~/Library/Application Support/fullstack-starter/tools/logs/YYYY-MM-DD.jsonl`
- Linux: `~/.local/share/fullstack-starter/tools/logs/YYYY-MM-DD.jsonl`

### Examples

```bash
# Typical session file location (Windows)
SESSION_FILE="C:\Users\bruno\.claude\projects\C--Users-bruno-Documents-Work-Projects-fullstack-starter\<session-id>.jsonl"

# Show session stats
pnpm session info "$SESSION_FILE"

# Find which subagents were used
pnpm session agents "$SESSION_FILE"

# Export conversation to JSON
pnpm session export "$SESSION_FILE" --pretty --output conversation.json
```

## Programmatic Usage

### Basic Parsing

```typescript
import { parseSession, SessionParser } from '@fullstack-starter/tools';

// Quick parse
const session = await parseSession('path/to/session.jsonl');
console.log(session.metadata.totalEntries);

// Or use the parser class for more control
const parser = new SessionParser();
await parser.load('path/to/session.jsonl');

// Get various data
const toolUses = parser.getToolUses();
const filesRead = parser.getFilesRead();
const conversation = parser.getConversationFlow();
```

### Advanced Querying

```typescript
import { SessionParser } from '@fullstack-starter/tools';

const parser = new SessionParser();
await parser.load('session.jsonl');

// Find all Task tool invocations (subagents)
const subagents = parser.getSubagentInvocations();
for (const agent of subagents) {
  console.log(`Agent: ${agent.subagentType}`);
  console.log(`Prompt: ${agent.prompt}`);
}

// Get token usage statistics
const tokens = parser.getTokenUsage();
console.log(`Total tokens: ${tokens.totalInputTokens + tokens.totalOutputTokens}`);

// Find entries in a time range
const entries = parser.getEntriesByTimeRange(
  '2025-10-20T19:00:00Z',
  '2025-10-20T20:00:00Z'
);

// Search for specific content
const results = parser.searchEntries('TypeScript');

// Get all bash commands executed
const commands = parser.getBashCommands();
for (const cmd of commands) {
  console.log(`Command: ${cmd.command}`);
  console.log(`Description: ${cmd.description}`);
}
```

### Type-Safe Tool Access

```typescript
import { SessionParser, isToolUse, type ToolUse } from '@fullstack-starter/tools';

const parser = new SessionParser();
await parser.load('session.jsonl');

// Get all Read tool uses with proper typing
const readTools = parser.getToolUsesByName('Read');
for (const tool of readTools) {
  const input = tool.input as { file_path: string };
  console.log(`Read file: ${input.file_path}`);
}

// Type-safe tool filtering
const entries = parser.getAssistantMessages();
for (const entry of entries) {
  const content = entry.message.content;
  if (typeof content !== 'string') {
    for (const item of content) {
      if (isToolUse(item) && item.name === 'Write') {
        const input = item.input as { file_path: string; content: string };
        console.log(`Created: ${input.file_path}`);
      }
    }
  }
}
```

### Analyzing Conversations

```typescript
import { SessionParser } from '@fullstack-starter/tools';

const parser = new SessionParser();
await parser.load('session.jsonl');

// Get clean conversation flow
const conversation = parser.getConversationFlow();
for (const msg of conversation) {
  console.log(`[${msg.timestamp}] ${msg.role}: ${msg.content}`);
}

// Extract thinking blocks
const thinking = parser.getThinkingBlocks();
for (const block of thinking) {
  console.log(`[${block.timestamp}] Thinking: ${block.thinking}`);
}

// Get user messages only
const userMessages = parser.getUserMessages();
console.log(`User asked ${userMessages.length} questions`);
```

## TypeScript Types

The package exports comprehensive TypeScript types for all session data:

```typescript
import type {
  SessionEntry,
  ParsedSession,
  UserEntry,
  AssistantEntry,
  SystemEntry,
  ToolUse,
  ToolName,
  MessageContent,
  // ... and many more
} from '@fullstack-starter/tools';
```

### Type Guards

Use type guards for safe type narrowing:

```typescript
import {
  isUserEntry,
  isAssistantEntry,
  isSystemEntry,
  isToolUse,
  isTextContent,
  isThinkingContent,
} from '@fullstack-starter/tools';

for (const entry of parser.getEntries()) {
  if (isUserEntry(entry)) {
    // entry is now typed as UserEntry
    console.log(entry.message.content);
  } else if (isAssistantEntry(entry)) {
    // entry is now typed as AssistantEntry
    const content = entry.message.content;
    // ... work with assistant message
  }
}
```

## Session Data Structure

### Entry Types

The parser recognizes these entry types:

- **`user`** - User messages
- **`assistant`** - Assistant messages with tool uses and responses
- **`system`** - System messages and local commands
- **`summary`** - Session summaries
- **`file-history-snapshot`** - File snapshots
- **`create`** - File creation events
- **`update`** - File update events

### Tool Types

Supported tools (with typed inputs):

- `Read` - Read file contents
- `Write` - Write files
- `Edit` - Edit files with search/replace
- `Glob` - Find files by pattern
- `Grep` - Search file contents
- `Bash` - Execute bash commands
- `Task` - Invoke subagents
- `TodoWrite` - Manage todo lists
- `AskUserQuestion` - Interactive questions
- `WebFetch` - Fetch web content
- `WebSearch` - Search the web
- `NotebookEdit` - Edit Jupyter notebooks
- `BashOutput` - Read bash output
- `KillShell` - Kill background shells
- `Skill` - Execute skills
- `SlashCommand` - Run slash commands
- `ExitPlanMode` - Exit plan mode

## API Reference

### SessionParser Class

#### Methods

##### `load(filePath: string): Promise<ParsedSession>`

Load and parse a session file.

##### `getParsedSession(): ParsedSession`

Get the complete parsed session with metadata.

##### `getUserMessages(): UserEntry[]`

Get all user messages.

##### `getAssistantMessages(): AssistantEntry[]`

Get all assistant messages.

##### `getSystemMessages(): SystemEntry[]`

Get all system messages.

##### `getToolUses(): ToolUse[]`

Get all tool uses across the session.

##### `getToolUsesByName(toolName: ToolName): ToolUse[]`

Get tool uses filtered by tool name.

##### `getSubagentInvocations()`

Get all Task tool invocations (subagent calls).

##### `getFilesRead(): string[]`

Get list of all files read.

##### `getFilesWritten(): string[]`

Get list of all files written.

##### `getFilesEdited(): string[]`

Get list of all files edited.

##### `getBashCommands(): Array<{command: string, description?: string}>`

Get all bash commands executed.

##### `getConversationFlow()`

Get conversation with user and assistant messages only.

##### `getThinkingBlocks()`

Get all thinking blocks (internal reasoning).

##### `getTokenUsage()`

Get token usage statistics.

##### `getEntriesByTimeRange(start: string, end: string): SessionEntry[]`

Find entries within a time range.

##### `searchEntries(searchText: string, caseSensitive?: boolean): SessionEntry[]`

Search for entries containing specific text.

##### `getSummary(): string | null`

Get session summary if available.

##### `toJSON(): ParsedSession`

Export session as JSON.

##### `getEntries(): SessionEntry[]`

Get raw entries array.

## Development

### Project Structure

```
tools/
├── src/
│   ├── types/
│   │   └── session.ts         # TypeScript type definitions
│   ├── services/
│   │   ├── session-parser.ts  # Main parser implementation
│   │   └── session-parser.test.ts
│   ├── cli/
│   │   └── session.ts         # CLI implementation
│   └── index.ts               # Main exports
├── dist/                      # Build output
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── biome.json
└── README.md
```

### Scripts

- `pnpm build` - Build the project
- `pnpm dev` - Build and watch for changes
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint code with Biome
- `pnpm format` - Format code with Biome

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

## Use Cases

### Track Subagent Activity

Find what subagents were used and what they did:

```typescript
const parser = new SessionParser();
await parser.load('session.jsonl');

const agents = parser.getSubagentInvocations();
for (const agent of agents) {
  console.log(`${agent.subagentType}: ${agent.description}`);
}
```

### Analyze File Changes

See which files were modified:

```typescript
const filesWritten = parser.getFilesWritten();
const filesEdited = parser.getFilesEdited();

console.log('Created:', filesWritten);
console.log('Modified:', filesEdited);
```

### Export Conversation

Extract clean conversation for documentation:

```typescript
const conversation = parser.getConversationFlow();
const markdown = conversation
  .map((msg) => `**${msg.role}**: ${msg.content}`)
  .join('\n\n');
```

### Cost Analysis

Calculate API costs based on token usage:

```typescript
const tokens = parser.getTokenUsage();
const inputCost = (tokens.totalInputTokens / 1000000) * 3.0; // $3 per 1M
const outputCost = (tokens.totalOutputTokens / 1000000) * 15.0; // $15 per 1M
const totalCost = inputCost + outputCost;

console.log(`Estimated cost: $${totalCost.toFixed(4)}`);
```

## License

MIT

## Contributing

This is part of the fullstack-starter internal tools. Follow the project's contribution guidelines.
