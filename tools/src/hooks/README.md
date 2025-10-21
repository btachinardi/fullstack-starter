# Claude Code Hooks

TypeScript hooks for Claude Code with strongly-typed inputs using our session parser.

## Available Hooks

### `subagent-stop.ts`

Automatically commits changes made by Claude Code subagents when they complete.

**Features:**
- Uses Claude Agent SDK to invoke `/git:commit` slash command
- Passes subagent invocation context to the command for intelligent commit generation
- Uses session parser to extract detailed subagent information
- Leverages `/git:commit` for semantic commit messages and smart grouping
- Excludes hook log file from commits
- Strongly-typed using hook service

**How It Works:**
1. Hook detects subagent completion
2. Extracts subagent details from session (agent type, prompt, IDs)
3. Stages all changes (excluding log file)
4. Invokes `/git:commit` via Agent SDK with subagent context
5. `/git:commit` analyzes changes and creates intelligent semantic commit
6. Commit includes agent metadata in footer

**Commit Message Format:**
The actual format depends on `/git:commit` analysis, but typically:
```
<type>(<scope>): <subject>

<body explaining changes>

Agent: <subagent-type>
Session-ID: <session-id>
Invocation-ID: <tool-use-id>
Timestamp: <formatted-timestamp>

Prompt:
<truncated-prompt-text>

🤖 Auto-committed via /git:commit from SubagentStop hook
```

**Example Commit:**
```
feat(agent): add slash command creator subagent

Created specialized subagent for generating optimized custom
slash commands following project templates and best practices.

Agent: subagent-creator
Session-ID: 1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d
Invocation-ID: toolu_01Sx5EFM4ViaXkqZECJ3Zgqu
Timestamp: 10/20/2025, 5:38:23 PM

Prompt:
Create a new Claude Code subagent named `slash-command-creator` that
specializes in creating optimized custom slash commands...

🤖 Auto-committed via /git:commit from SubagentStop hook
```

**Why Agent SDK?**
Using the Agent SDK to invoke `/git:commit` provides:
- **Intelligent analysis** of what changed (not just generic "chore(agent)")
- **Semantic commit types** based on actual changes (feat/fix/docs/etc.)
- **Smart grouping** - can split large multi-system changes into focused commits
- **Better commit messages** - explains "why" not just "what"
- **Consistency** - same commit logic for manual and automated commits
- **Extensibility** - improvements to `/git:commit` benefit the hook automatically

## Configuration

Add hooks to your Claude Code config file (`claude_desktop_config.json`):

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "type": "command",
        "command": "node tools/dist/hooks/subagent-stop.js"
      }
    ]
  }
}
```

### Config File Locations

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

### Environment Variables

The SubagentStop hook requires the `ANTHROPIC_API_KEY` environment variable to use the Agent SDK:

```bash
# Set in your shell profile (.bashrc, .zshrc, etc.)
export ANTHROPIC_API_KEY="your-api-key-here"
```

Or add to Claude Code's environment configuration.

## Hook Service

The `hook-input.ts` service provides strongly-typed parsing of hook inputs.

### Quick Usage

```typescript
import { createSubagentStopHook } from '../services/hook-input.js';
import type { SubagentStopInput } from '../services/hook-input.js';

async function handleSubagentStop(input: SubagentStopInput): Promise<void> {
  console.log('Session ID:', input.session_id);
  console.log('Transcript:', input.transcript_path);
  // Your logic here
}

const main = createSubagentStopHook(handleSubagentStop);
main();
```

### Available Hook Types

```typescript
// SubagentStop - when a subagent finishes
SubagentStopInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: 'SubagentStop';
  stop_hook_active: boolean;
}

// PreToolUse - before a tool is executed
PreToolUseInput {
  hook_event_name: 'PreToolUse';
  tool_name: string;
  tool_input: Record<string, unknown>;
  // ... base fields
}

// PostToolUse - after a tool is executed
PostToolUseInput {
  hook_event_name: 'PostToolUse';
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: unknown;
  is_error?: boolean;
  // ... base fields
}

// UserPromptSubmit - when user submits a message
UserPromptSubmitInput {
  hook_event_name: 'UserPromptSubmit';
  user_message: string;
  // ... base fields
}
```

### Using the HookHandler Base Class

```typescript
import { HookHandler } from '../services/hook-input.js';
import type { SubagentStopInput } from '../services/hook-input.js';

class MySubagentHook extends HookHandler<SubagentStopInput> {
  validateInput(input: HookInput): input is SubagentStopInput {
    return input.hook_event_name === 'SubagentStop';
  }

  async execute(): Promise<void> {
    console.log('Processing subagent stop for:', this.input.session_id);
    // Your logic here
  }
}

// Run it
const handler = new MySubagentHook();
handler.run();
```

## Creating New Hooks

### Method 1: Using Helper Functions (Recommended)

```typescript
#!/usr/bin/env node
import { createSubagentStopHook } from '../services/hook-input.js';
import type { SubagentStopInput } from '../services/hook-input.js';

async function handleHook(input: SubagentStopInput): Promise<void> {
  // Your strongly-typed hook logic
  console.log(`Session: ${input.session_id}`);
}

const main = createSubagentStopHook(handleHook);

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

### Method 2: Using Base Class

```typescript
#!/usr/bin/env node
import { HookHandler, HookInputParser } from '../services/hook-input.js';
import type { PreToolUseInput } from '../services/hook-input.js';

class MyToolHook extends HookHandler<PreToolUseInput> {
  validateInput(input: HookInput): input is PreToolUseInput {
    return HookInputParser.isPreToolUse(input);
  }

  async execute(): Promise<void> {
    console.log(`Tool: ${this.input.tool_name}`);
    // Validate/modify tool input
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const handler = new MyToolHook();
  handler.run();
}
```

### Method 3: Manual Parsing

```typescript
#!/usr/bin/env node
import { HookInputParser } from '../services/hook-input.js';

async function main() {
  const input = await HookInputParser.parseStdin();

  if (HookInputParser.isSubagentStop(input)) {
    // TypeScript knows input is SubagentStopInput here
    console.log(input.session_id);
  }
}

main();
```

## Build Process

Hooks are built along with the tools package:

```bash
cd tools
pnpm build
```

Output:
```
dist/
└── hooks/
    ├── subagent-stop.js       # Executable hook
    └── subagent-stop.js.map   # Source map
```

## Logging

### Structured Logging System

All hooks use a structured logging system that stores logs in platform-appropriate locations:

**Log Locations:**
- Windows: `%APPDATA%\<workspace>\tools\logs\YYYY-MM-DD.jsonl`
- macOS: `~/Library/Application Support/<workspace>/tools/logs/YYYY-MM-DD.jsonl`
- Linux: `~/.local/share/<workspace>/tools/logs/YYYY-MM-DD.jsonl`

**Features:**
- Structured JSON logs with timestamps and context
- Multiple log levels (debug, info, warn, error)
- Automatic daily log rotation
- Rich metadata (source, tool name, session ID, etc.)
- Agent SDK output logging
- Easy querying and filtering

### Query Logs

```bash
# Show last 20 log entries
pnpm logs:tail

# Show last 50 entries
pnpm tools logs tail -n 50

# Query by source
pnpm tools logs query --source subagent-stop

# Query by log level
pnpm tools logs query --level error

# Search in messages
pnpm tools logs query --search "Agent SDK"

# Query by tool name
pnpm tools logs query --tool Bash

# Query by session ID
pnpm tools logs query --session "1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d"

# Filter by date range
pnpm tools logs query --start 2025-10-01 --end 2025-10-31

# Show log statistics
pnpm logs:stats

# List all log sources
pnpm logs:sources

# List all logged tools
pnpm logs:tools
```

### Using Logging in Hooks

```typescript
import { createHookLogger } from '../services/logger.js';
import type { SubagentStopInput } from '../services/hook-input.js';

async function handleSubagentStop(input: SubagentStopInput): Promise<void> {
  // Create logger with session context
  const logger = createHookLogger('my-hook', input.session_id, input.transcript_path);

  await logger.info('Hook started');
  await logger.debug('Processing details', { data: someData });
  await logger.warn('Potential issue detected', { issue: details });
  await logger.error('Operation failed', { error: err });

  // Update context during execution
  logger.updateContext({ step: 'validation' });

  // Create child logger
  const childLogger = logger.child('my-hook:git', { operation: 'commit' });
  await childLogger.info('Creating commit');
}
```

## Debugging

### Check Logs

```bash
# View recent logs
pnpm logs:tail

# Search for errors
pnpm tools logs query --level error

# Filter by specific hook
pnpm tools logs query --source subagent-stop

# View detailed Agent SDK outputs
pnpm tools logs query --source subagent-stop --level debug
```

### Test Hook Manually

```bash
# Create test input
echo '{
  "session_id": "test-123",
  "transcript_path": "path/to/session.jsonl",
  "cwd": "/path/to/project",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false
}' | node tools/dist/hooks/subagent-stop.js
```

### Common Issues

**Hook not running:**
- Check hook is configured in `claude_desktop_config.json`
- Verify path to hook script is correct
- Check script has execute permissions
- Review Claude Code logs

**Hook failing:**
- Check logs with `pnpm logs:query --source subagent-stop --level error`
- Verify tools package is built (`pnpm build`)
- Ensure session file exists and is readable
- Check git repository is initialized
- Verify `ANTHROPIC_API_KEY` environment variable is set

## Hook Catalog

### Subagent Stop Hook

**File:** `subagent-stop.ts`
**Event:** `SubagentStop`
**Purpose:** Auto-commit subagent changes with detailed metadata

**Uses:**
- Session parser to extract subagent details
- Git commands to commit changes
- Structured commit messages

### Future Hooks (Ideas)

**Pre-Tool Validation:**
- Validate Bash commands before execution
- Check file paths exist before Read/Write
- Enforce naming conventions

**Post-Tool Logging:**
- Log all file modifications
- Track API costs from tool usage
- Monitor performance metrics

**User Prompt Enhancement:**
- Add context from previous sessions
- Inject project-specific guidelines
- Auto-add relevant file paths

## Examples

### Example: Tool Usage Logger

```typescript
import { createPostToolUseHook } from '../services/hook-input.js';
import type { PostToolUseInput } from '../services/hook-input.js';
import { appendFile } from 'node:fs/promises';

async function logToolUsage(input: PostToolUseInput): Promise<void> {
  const log = `${new Date().toISOString()} | ${input.tool_name} | ${input.is_error ? 'ERROR' : 'SUCCESS'}\n`;
  await appendFile('tool-usage.log', log);
}

const main = createPostToolUseHook(logToolUsage);
```

### Example: Bash Command Validator

```typescript
import { createPreToolUseHook } from '../services/hook-input.js';
import type { PreToolUseInput } from '../services/hook-input.js';

async function validateBashCommand(input: PreToolUseInput): Promise<void> {
  if (input.tool_name !== 'Bash') return;

  const command = input.tool_input.command as string;
  const dangerous = ['rm -rf /', 'dd if=', 'mkfs'];

  if (dangerous.some((cmd) => command.includes(cmd))) {
    console.error(`Dangerous command blocked: ${command}`);
    process.exit(2); // Exit code 2 blocks the tool
  }
}

const main = createPreToolUseHook(validateBashCommand);
```

## Best Practices

1. **Always use the hook service** for type-safe inputs
2. **Log errors to stderr** not stdout
3. **Use appropriate exit codes:**
   - `0` = Success
   - `1` = Error (logged but continues)
   - `2` = Block (prevents tool execution for PreToolUse)
4. **Keep hooks fast** - they run synchronously
5. **Handle errors gracefully** - don't crash the main process
6. **Test with actual Claude Code** before deploying
7. **Document hook behavior** clearly

## Resources

- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Session Parser API](../services/session-parser.ts)
- [Hook Input Types](../services/hook-input.ts)
- [Example Hooks](https://github.com/anthropics/claude-code/tree/main/examples/hooks)
