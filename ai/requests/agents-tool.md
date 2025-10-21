One of the main limitations I've encountered when running multiple AI agents simultaneously is that all their changes get mixed together in the git changes, making commits harder to manage and potentially introducing conflicts when two agents edit the same file.

For example, when I have an agent working on frontend components while another agent is refactoring the backend API, their changes can overlap in shared files like configuration files, shared utilities, or even the same source files. This creates a messy git history where it's impossible to track which changes belong to which task, and merge conflicts become inevitable.

Then, we also have the problem of context isolation: when agents work on different tasks simultaneously, they can interfere with each other's work, overwrite each other's changes, or create dependencies that weren't intended. This is similar to how multiple developers working on the same codebase without proper branching strategies can create chaos.

But when we talk about AI agents, we usually have them all working in the same workspace directory with shared git state. While each agent session might be isolated in terms of conversation context, they all operate on the same file system and git repository, leading to the problems described above.

This happens because there's no built-in mechanism to isolate agent work environments. Each agent session operates directly on the main workspace, and there's no coordination between different agent sessions to prevent conflicts.

But what if we could have a system that creates isolated work environments for each agent session, similar to how developers use feature branches and separate working directories?

I want to propose and create a system where this is possible. To do this, I imagine the following workflow:

1. When starting a new agent session, the system should use a specialized `agent:worktree-manager` subagent that will:
   1.a) Create a new git worktree in a dedicated directory structure
   1.b) Create and switch to a new `agents:<request_name>` branch based on the current main branch
   1.c) Open a new terminal/cmd window with Claude running in the isolated worktree
   1.d) Track the agent session in a specialized markdown file for coordination

The subagent should then use git worktree commands to create isolated environments and should notice when worktrees already exist to prevent conflicts. It should also handle cleanup of completed or abandoned agent sessions.

The generated worktree must then contain a standardized structure (we should have a template for these files), for all the details about this agent session, including:

1. The agent session ID and request name
2. The worktree path and branch name
3. The terminal process ID for the agent session
4. Session Status: whether this session is:
   4.a) Active (currently running)
   4.b) Completed (ready for merge)
   4.c) Abandoned (needs cleanup)
   4.d) Merged (successfully integrated)

---

Then, for this agent isolation system to work, we would have these workflows:

## Start Agent Session `/agent:start`

1. Agent Session Tracking: all agent sessions must have a source tracking file used for coordination.
2. `agent:worktree-manager`: a specialized subagent for creating isolated work environments based on the current main branch and user's request.
3. `agent:session-tracker`: a specialized subagent that can write the <session-id>.md agent session tracking file. It must use the session template and track all relevant metadata.
4. `/agent:start`: a custom slash command instructed to gather session requirements from the user and then use the previous subagents to create the worktree, branch, and tracking file.

## Manage Agent Sessions `/agent:manage [session-id] [action]`

1. `agent-sessions --status=active|completed|abandoned`: a simple CLI tool that can be used to retrieve a list of all agent sessions with their current status.
2. `agent:session-coordinator`: a specialized subagent that can coordinate between different agent sessions and prevent conflicts. It can detect when multiple agents are working on the same files and provide warnings or suggestions.
3. `agent:merge-coordinator`: a specialized agent that can handle merging completed agent sessions back to the main branch. This subagent must be extremely careful and must validate that:
   3.a) The agent session has been properly completed and tested
   3.b) There are no conflicts with the main branch
   3.c) All changes are properly documented and reviewed
4. `agent:cleanup-manager`: a specialized agent that can clean up abandoned or completed agent sessions, removing worktrees and branches that are no longer needed.
5. `agent:conflict-detector`: a specialized agent that can detect potential conflicts between active agent sessions and provide recommendations for resolution.
6. `/agent:manage`: a custom slash command for managing agent sessions.
   6.a) List active sessions: show all currently running agent sessions with their status and progress
   6.b) Merge completed session: merge a completed agent session back to main branch
   6.c) Cleanup abandoned sessions: remove worktrees and branches for abandoned sessions
   6.d) Detect conflicts: check for potential conflicts between active sessions

Note: when the `/agent:manage` command does not receive any specified session-id, it must:

1. Show a list of all available sessions with their status
2. Allow the user to select which session to manage
3. If no action is specified, show available actions for the selected session

---

## Session Coordination

The agent session management system should also coordinate between sessions to prevent conflicts and provide visibility into what each agent is working on.

---

## Deliverables

We must have a list (per category) for all subagents, custom slash commands, templates and scripts we will need to have this system up and running

Love this. Let's turn your idea into a concrete, shippable v1. Below are the **deliverables you asked for—grouped by subagents, slash commands, templates, and scripts/CLI**—with tight specs (inputs/outputs, file paths, statuses) so you can implement immediately.

# Directory layout (convention)

```
ai/
  agents/                 # <agent-name>.md instruction files (Claude/Code/…)
  sessions/               # <session-id>.md session tracking files
  worktrees/              # git worktree directories
    <session-id>/         # isolated work environment
  templates/
    session.md
    worktree-setup.md
    merge-plan.md
    conflict-report.md
  cli/                    # TS/Node commands (bin proxies)
  indexes/
    sessions.jsonl        # flattened index for quick queries
  logs/
    sessions/              # per-session logs
  .hooks/                 # Git hooks used by the CLI
```

---

# Subagents (core)

Each subagent receives a JSON payload, manages worktrees/sessions, and returns a small JSON result.

### 1) `agent:worktree-manager` (you described)

- **Purpose:** Create and manage isolated git worktrees for agent sessions.
- **Input:**
  - `sessionId` (string)
  - `requestName` (string)
  - `baseBranch` (string, default: "main")
  - `agentType` (string, optional: "claude", "code", etc.)

- **Side-effects:**
  - Create git worktree in `ai/worktrees/<session-id>/`
  - Create and checkout branch `agents:<request-name>`
  - Write `ai/sessions/<session-id>.md` using the Session Template.
  - Append a row to `ai/indexes/sessions.jsonl`.

- **Output:** `{ worktreePath, branchName, sessionId, status: "active" }`.

### 2) `agent:session-tracker`

- **Purpose:** Track agent session metadata and progress.
- **Inputs:** `{ sessionId, worktreePath, branchName, agentType, requestName }`
- **Logic:**
  - Monitor session status and progress
  - Track file changes and commits
  - Update session metadata

- **Side-effects:** Update the session file's metadata and progress.
- **Output:** `{ sessionId, status, progress, lastActivity }`.

### 3) `agent:session-coordinator`

- **Purpose:** Coordinate between multiple agent sessions to prevent conflicts.
- **Inputs:** `{ activeSessions[], projectRulesPath }`
- **Logic:**
  - Detect overlapping file modifications
  - Check for potential merge conflicts
  - Provide coordination recommendations

- **Side-effects:** Update session coordination metadata.
- **Output:** `{ conflicts[], recommendations[], warnings[] }`.

### 4) `agent:merge-coordinator`

- **Purpose:** Handle merging completed agent sessions back to main branch.
- **Inputs:** `{ sessionId, targetBranch, mergeStrategy }`
- **Strict rules:**
  - **Validate** session completion and testing
  - **Check** for conflicts with target branch
  - **Require** proper documentation and review

- **Side-effects:** Merge session branch to target; update session status.
- **Output:** `{ sessionId, mergeResult, conflicts[], status }`.

### 5) `agent:cleanup-manager`

- **Purpose:** Clean up abandoned or completed agent sessions.
- **Inputs:** `{ sessionIds[], cleanupMode }`
- **Logic:**
  - Remove worktrees for abandoned sessions
  - Delete branches for completed sessions
  - Archive session tracking files

- **Side-effects:** Remove worktrees, delete branches, archive files.
- **Output:** `{ cleanedSessions[], errors[] }`.

### 6) `agent:conflict-detector`

- **Purpose:** Detect potential conflicts between active sessions.
- **Inputs:** `{ activeSessions[], fileSystemState }`
- **Side-effects:** Write conflict reports to `ai/logs/conflicts/`.
- **Output:** `{ conflicts[], recommendations[], severity }`.

### 7) `agent:terminal-launcher`

- **Purpose:** Launch agent sessions in isolated terminal environments.
- **Inputs:** `{ sessionId, worktreePath, agentType, sessionConfig }`
- **Side-effects:** Start new terminal process with Claude in worktree.
- **Output:** `{ processId, terminalPath, status }`.

### 8) `agent:session-verifier` (quality gate)

- **Purpose:** Validate agent sessions before merge or cleanup.
- **Checks:** session completion, test results, documentation, conflicts.
- **Inputs:** `{ sessionId, verificationRules }`
- **Output:** `{ ok: boolean, issues[], recommendations[] }`.

---

# Subagents (supporting / optional)

### 9) `agent:progress-monitor`

- Convert session activity into progress reports and status updates.

### 10) `agent:session-indexer`

- Maintain `ai/indexes/sessions.jsonl` and session metadata for quick retrieval.

### 11) `agent:conflict-resolver`

- Automatically resolve simple conflicts or provide resolution guidance.

### 12) `agent:session-auditor`

- Ensure session integrity and proper cleanup of resources.

---

# Slash commands (UX orchestration)

### `/agent:start`

- **Args:** `[request-name] [agent-type] [base-branch]`
- **Flow:**
  1. `agent:worktree-manager` → create worktree and branch
  2. `agent:session-tracker` → create session tracking
  3. `agent:terminal-launcher` → start agent in isolated environment

- **Output:** session details, worktree path, terminal info.

### `/agent:manage [session-id] [action]`

- **Flow:**
  1. If no session-id: list all sessions with status
  2. If action = "list": show session details
  3. If action = "merge": `agent:merge-coordinator` → merge to main
  4. If action = "cleanup": `agent:cleanup-manager` → remove session
  5. If action = "conflicts": `agent:conflict-detector` → check conflicts

- **Output:** action results, session status, recommendations.

### `/agent:sessions [--status=active|completed|abandoned]`

- Shows all sessions with their current status, progress, and metadata.

### `/agent:coordinate`

- Runs conflict detection and coordination between active sessions.

### `/agent:cleanup [--force]`

- Cleans up abandoned or completed sessions (with confirmation).

---

# Templates

### 1) **Session Template**: `ai/templates/session.md`

```markdown
---
id: ${sessionId}
createdAt: ${iso8601}
requestName: ${requestName}
agentType: ${agentType}
status: active # active | completed | abandoned | merged
worktreePath: ${worktreePath}
branchName: ${branchName}
baseBranch: ${baseBranch}
processId: ${processId}
terminalPath: ${terminalPath}
progress: 0 # 0-100
lastActivity: ${iso8601}
conflicts: []
dependencies: []
---

# Session Overview

**Request:** ${requestName}
**Agent Type:** ${agentType}
**Status:** ${status}

# Progress Tracking

## Completed Tasks

- [ ] Initial setup
- [ ] Worktree creation
- [ ] Branch creation
- [ ] Agent session started

## Current Activity

${currentActivity}

## File Changes

${table of modified files}

## Commits

${list of commits in session}

## Conflicts & Issues

${conflicts and issues}

## Dependencies

${other sessions this depends on}

## Merge Plan (when completed)

${planned merge strategy}

## Session Log

${session activity log}
```

### 2) **Worktree Setup Template**: `ai/templates/worktree-setup.md`

```markdown
# Worktree Setup — ${sessionId}

## Environment

- **Worktree Path:** ${worktreePath}
- **Branch:** ${branchName}
- **Base Branch:** ${baseBranch}
- **Agent Type:** ${agentType}

## Setup Steps

1. Create worktree directory
2. Initialize git worktree
3. Create and checkout branch
4. Copy project files
5. Install dependencies
6. Start agent session

## Configuration

${session-specific configuration}

## Dependencies

${required packages and tools}

## Environment Variables

${session-specific env vars}
```

### 3) **Merge Plan Template**: `ai/templates/merge-plan.md`

```markdown
# Merge Plan — ${sessionId}

## Session Summary

- **Request:** ${requestName}
- **Duration:** ${duration}
- **Files Changed:** ${fileCount}
- **Commits:** ${commitCount}

## Changes to Merge

${list of changes by category}

## Conflict Resolution

${conflicts and resolution strategy}

## Testing Required

${tests to run before merge}

## Documentation Updates

${docs that need updating}

## Rollback Plan

${rollback strategy if issues arise}

## Merge Strategy

${merge approach and validation}
```

### 4) **Conflict Report Template**: `ai/templates/conflict-report.md`

```markdown
# Conflict Report — ${timestamp}

## Conflicting Sessions

${list of conflicting sessions}

## File Conflicts

${table of conflicting files}

## Severity Assessment

${conflict severity and impact}

## Resolution Recommendations

${suggested resolution approaches}

## Coordination Actions

${recommended coordination steps}

## Timeline Impact

${estimated impact on session timelines}
```

### 5) **Session Changelog Template**: `ai/templates/session-changelog.md`

```markdown
# Session Changelog — ${sessionId}

## Session Lifecycle

- ${date}: Session created
- ${date}: Worktree setup completed
- ${date}: Agent session started
- ${date}: Progress milestones
- ${date}: Session completed/abandoned

## Key Activities

${major activities and milestones}

## File Changes Summary

${summary of all file changes}

## Conflicts Resolved

${conflicts encountered and resolved}

## Dependencies

${sessions this depended on or affected}
```

---

# Scripts / CLI (Node+TS recommended)

> Put executables in `ai/cli/` and expose bin shims in `package.json`.

### Core

1. **`agent-sessions`**
   - `--status=<status>` `--format=table|json`
   - Reads `ai/sessions/*.md`, surfaces session metadata.

2. **`agent-session-create`** (used by subagent or slash)
   - Creates session tracking file from JSON payload; updates index.

3. **`agent-worktree-create`**
   - `--session-id=<id>` `--request-name=<name>` `--base-branch=<branch>`.
   - Creates worktree and branch; returns session details.

4. **`agent-terminal-launch`**
   - `--session-id=<id>` `--agent-type=<type>`.
   - Launches agent in isolated terminal environment.

5. **`agent-session-merge`**
   - `--session-id=<id>` `--target-branch=<branch>` `--strategy=<strategy>`.
   - Merges completed session to target branch.

6. **`agent-session-cleanup`**
   - `--session-id=<id>` `--mode=<abandoned|completed|all>`.
   - Cleans up session resources.

7. **`agent-conflict-detect`**
   - Scans active sessions for potential conflicts.

8. **`agent-session-coordinate`**
   - Coordinates between active sessions to prevent conflicts.

9. **`agent-session-verify`**
   - Validates session completion and readiness for merge.

10. **`agent-session-monitor`**
    - Monitors active sessions and updates progress.

### Supporting / quality-of-life

11. **`agent-session-next`**
    - Returns next session that needs attention.

12. **`agent-session-scan`**
    - Scans for abandoned sessions and suggests cleanup.

13. **`.hooks/pre-commit`** (git hook)
    - Prevents commits in worktree directories without proper session tracking.

14. **`agent-session-report`**
    - Generates dashboard of all sessions with status and progress.

15. **`agent-worktree-list`**
    - Lists all active worktrees and their associated sessions.

---

# Status model & governance

- **Session statuses:** `active` → `completed | abandoned` → `merged` (immutable after completion).
- **Session lifecycle:**
  1. `active` → agent working in isolated environment
  2. `completed` → ready for merge after validation
  3. `abandoned` → cleanup required
  4. `merged` → successfully integrated to main branch

- **Conflict resolution:**
  1. Detect conflicts between active sessions
  2. Provide coordination recommendations
  3. Prevent merge conflicts through isolation
  4. Track dependencies between sessions

- **Traceability:** Every session change is tracked in session files and git history.
