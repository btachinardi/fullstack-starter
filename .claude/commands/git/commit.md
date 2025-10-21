---
description: Intelligently commit git changes using semantic commit messages with smart grouping for multi-concern changes
allowed-tools: Bash(git *:*), Read, Grep, Glob
model: claude-sonnet-4-5
---

# /git:commit

Intelligently commit git changes using semantic commit messages with smart grouping for multi-concern changes.

## Objective

Analyze staged changes, generate proper semantic commit messages following project conventions, and intelligently group changes into focused, single-concern commits when changes span multiple systems or features.

## Context & Prerequisites

**Project Context:**
- Semantic commit format: `type(scope): description`
- Commit types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`
- Scope indicates the affected area (e.g., `api`, `web`, `ui`, `docs`, `config`)
- SubagentStop hook auto-commits with `chore(agent): changes from <agent-name>`
- This command can be invoked manually or with subagent context from hooks

**Prerequisites:**
- Git repository initialized
- Changes exist (staged or unstaged)
- Working directory is clean of conflicts

**Semantic Commit Convention:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type Guidelines:**
- `feat`: New features or functionality
- `fix`: Bug fixes
- `chore`: Maintenance tasks (dependencies, config, tooling)
- `docs`: Documentation only changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `style`: Code style changes (formatting, missing semicolons)
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes
- `build`: Build system or external dependencies
- `revert`: Reverting previous commits

## Instructions

### Phase 1: Change Analysis

**Objective:** Understand what changes exist and their nature

**Steps:**

1. **Check Git Status**
   - Run: `git status --porcelain`
   - Identify staged vs unstaged changes
   - If no staged changes but unstaged exist, ask user:
     - Stage all changes: `git add -A`
     - Stage specific files: provide list for selection
     - Cancel operation

2. **Analyze Staged Changes**
   - Run: `git diff --staged --stat` for overview
   - Run: `git diff --staged` for detailed changes
   - Identify modified, added, deleted files
   - Categorize by file type and location

3. **Detect Change Scope**
   Analyze files to identify affected systems:
   - **Frontend:** Changes in `apps/web/`, `packages/ui/`, React components
   - **Backend:** Changes in `apps/api/`, server code, database
   - **Configuration:** Changes in config files, `.env`, `package.json`, tooling
   - **Documentation:** Changes in `docs/`, `README.md`, `.md` files
   - **Tests:** Changes in `*.test.*`, `*.spec.*`, test directories
   - **Infrastructure:** Changes in CI/CD, Docker, deployment configs
   - **Shared:** Changes in `packages/` affecting multiple apps

4. **Determine Change Nature**
   For each file/group, identify:
   - Is it a new feature? (new files, new functionality)
   - Is it a bug fix? (fixing broken behavior)
   - Is it refactoring? (improving code without changing behavior)
   - Is it maintenance? (dependencies, config, tooling)
   - Is it documentation? (only docs changes)
   - Is it testing? (only test changes)

**Validation:**
- [ ] All staged changes identified
- [ ] Change scope categorized (frontend/backend/config/docs/etc.)
- [ ] Change nature determined (feat/fix/refactor/chore/etc.)
- [ ] Multi-system changes flagged if present

---

### Phase 2: Commit Strategy Decision

**Objective:** Determine if changes should be one commit or split into multiple focused commits

**Steps:**

1. **Evaluate Commit Complexity**

   **Single Commit Criteria:**
   - All changes belong to same system (e.g., only frontend)
   - All changes have same type (e.g., all feature work)
   - Changes are tightly coupled (can't be separated logically)
   - Total changes are small/focused (< 10 files or < 200 lines)

   **Multiple Commits Criteria:**
   - Changes span multiple systems (frontend + backend + docs)
   - Changes have different types (features + fixes + chore)
   - Changes are independent and can be tested separately
   - Large changeset (> 10 files or > 200 lines) with logical groupings

2. **Propose Commit Strategy**

   If **single commit** is appropriate:
   - Present proposed commit message
   - Get user confirmation
   - Proceed to Phase 4

   If **multiple commits** are recommended:
   - Present proposed commit groupings:
     ```
     Commit 1: feat(api): Add user authentication endpoints
       - apps/api/src/auth/controller.ts
       - apps/api/src/auth/service.ts
       - apps/api/src/auth/types.ts

     Commit 2: feat(web): Add login UI components
       - apps/web/src/components/auth/LoginForm.tsx
       - apps/web/src/components/auth/LoginButton.tsx

     Commit 3: docs: Add authentication setup guide
       - docs/auth/setup.md
       - README.md
     ```
   - Ask user to:
     - Approve the groupings
     - Modify groupings (which files go where)
     - Proceed with single commit instead
     - Cancel operation

3. **Handle User Feedback**
   - Adjust commit groups based on user input
   - Re-validate groupings make logical sense
   - Ensure all files are accounted for
   - Confirm final commit plan

**Validation:**
- [ ] Commit strategy determined (single vs. multiple)
- [ ] Commit groupings are logical and focused
- [ ] Each group has single responsibility
- [ ] User has approved the plan
- [ ] All staged files accounted for in commit plan

---

### Phase 3: Commit Message Generation

**Objective:** Generate clear, descriptive semantic commit messages for each planned commit

**Steps:**

1. **For Each Commit Group:**

   **Determine Commit Type:**
   - Analyze the nature of changes in the group
   - Select most appropriate semantic type
   - If mixed types, choose the primary one
   - Prefer more specific types (e.g., `fix` over `chore`)

   **Determine Scope:**
   - Identify the primary affected area
   - Use scope that best represents the changes:
     - `api` - Backend/API changes
     - `web` - Web application frontend
     - `ui` - UI component library
     - `db` - Database or migrations
     - `config` - Configuration changes
     - `docs` - Documentation
     - `ci` - CI/CD pipelines
     - `deps` - Dependency updates
     - `agent` - Agent/automation changes
   - Use project-specific scopes when applicable
   - Omit scope if changes are truly global

   **Generate Subject Line:**
   - Start with lowercase verb (add, update, fix, remove, etc.)
   - Keep under 72 characters
   - Be specific about what changed
   - Don't end with period
   - Examples:
     - `feat(api): add JWT authentication middleware`
     - `fix(web): resolve login form validation bug`
     - `chore(deps): update dependencies to latest versions`
     - `docs: add API authentication guide`

   **Generate Body (if needed):**
   - Explain the "why" not the "what"
   - Reference related issues or tickets
   - Note any breaking changes
   - List major changes if subject doesn't cover it
   - Wrap at 72 characters
   - Use bullet points for lists
   - Skip if subject is self-explanatory

   **Generate Footer (if applicable):**
   - Breaking changes: `BREAKING CHANGE: <description>`
   - Issue references: `Closes #123`, `Fixes #456`
   - Co-authors: `Co-authored-by: Name <email>`
   - Agent metadata (if from hook):
     ```
     Agent: <subagent-type>
     Session-ID: <session-id>
     Invocation-ID: <invocation-id>
     Prompt: <full-prompt>
     ```

2. **Message Quality Check:**
   - Subject is clear and specific
   - Type and scope are accurate
   - Body explains reasoning (if present)
   - No vague language ("improve", "update", "fix stuff")
   - Follows imperative mood ("add" not "added" or "adds")
   - Breaking changes clearly marked
   - References are included where appropriate

3. **Present Messages to User:**
   Show each generated commit message:
   ```
   Commit 1:
   ─────────────────────────────────────
   feat(api): add JWT authentication middleware

   Implement secure authentication flow using JWT tokens.
   Includes token generation, validation, and refresh logic.

   Closes #234
   ─────────────────────────────────────

   Files:
   - apps/api/src/auth/jwt.middleware.ts
   - apps/api/src/auth/token.service.ts
   ```

   Ask user to:
   - Approve all messages
   - Edit specific messages
   - Regenerate messages with different approach
   - Cancel operation

**Validation:**
- [ ] All commit messages follow semantic format
- [ ] Types and scopes are accurate
- [ ] Subjects are clear and specific (< 72 chars)
- [ ] Bodies explain "why" when needed
- [ ] Footers include breaking changes and references
- [ ] Messages use imperative mood
- [ ] User has approved all messages

---

### Phase 4: Commit Execution

**Objective:** Execute the planned commits with generated messages

**Steps:**

1. **For Single Commit:**

   a. **Verify staged changes:**
      - Run: `git status --porcelain`
      - Confirm changes match expectations

   b. **Create commit:**
      - Use generated commit message
      - Execute: `git commit -m "<subject>" -m "<body>" -m "<footer>"`
      - Or use temp file for multi-line messages: `git commit -F <message-file>`

   c. **Verify commit:**
      - Run: `git log -1 --pretty=format:"%h %s"`
      - Show commit hash and subject to user
      - Confirm commit was successful

2. **For Multiple Commits:**

   a. **Create temporary commit message files:**
      - Generate message file for each commit
      - Store in temp location: `/tmp/git-commit-msg-1.txt`, etc.

   b. **Reset staging area:**
      - Run: `git reset` (unstage all)
      - Confirm clean slate

   c. **For each commit group in order:**

      **Stage specific files:**
      - Run: `git add <file1> <file2> ...` for files in this group
      - Verify: `git status --porcelain` shows only intended files

      **Create commit:**
      - Execute: `git commit -F /tmp/git-commit-msg-<n>.txt`
      - Capture commit hash

      **Verify commit:**
      - Run: `git log -1 --pretty=format:"%h %s"`
      - Confirm commit created successfully

      **Continue to next group:**
      - Repeat until all groups committed

   d. **Final verification:**
      - Run: `git log -<N> --oneline` (where N = number of commits)
      - Show all created commits to user
      - Run: `git status` to confirm working directory is clean

   e. **Cleanup:**
      - Remove temporary message files
      - Confirm no staged changes remain

3. **Handle Errors:**

   **If commit fails:**
   - Capture error message
   - Show error to user
   - Offer options:
     - Fix the issue and retry
     - Skip this commit
     - Abort all remaining commits
     - Reset to original state

   **If partial success (some commits done, some failed):**
   - List successful commits
   - List failed commits
   - Offer to:
     - Continue with remaining commits
     - Reset recent commits: `git reset --soft HEAD~<n>`
     - Keep successful commits and stop

4. **Success Report:**
   ```
   ✓ Successfully created 3 commits:

   1. a1b2c3d feat(api): add JWT authentication middleware
   2. d4e5f6g feat(web): add login UI components
   3. h7i8j9k docs: add authentication setup guide

   Next steps:
   - Review commits: git log -3
   - Push to remote: git push
   - Create pull request if needed
   ```

**Validation:**
- [ ] All planned commits created successfully
- [ ] Each commit has correct message
- [ ] Each commit contains correct files
- [ ] Working directory is clean
- [ ] No staged changes remain
- [ ] User has been notified of success

---

### Phase 5: Subagent Context Integration (Optional)

**Objective:** Handle invocation from SubagentStop hook with agent metadata

**Steps:**

1. **Detect Hook Invocation:**
   - Check if command was invoked with subagent context
   - Context may include:
     - `session_id`: Current session ID
     - `invocation_id`: Task tool invocation ID
     - `agent_type`: Subagent name (e.g., "subagent-creator")
     - `prompt`: The prompt given to the subagent

2. **Analyze Changes and Determine Scope:**

   **IMPORTANT:** The scope indicates WHAT was changed, not WHO made the change.

   Analyze the staged files to determine the affected area:
   - Changes in `.claude/agents/` → scope: `agents`
   - Changes in `.claude/commands/` → scope: `commands`
   - Changes in `apps/api/` → scope: `api`
   - Changes in `apps/web/` → scope: `web`
   - Changes in `packages/ui/` → scope: `ui`
   - Changes in `docs/` or `*.md` → scope: `docs` (or no scope)
   - Changes in config files → scope: `config`
   - Multiple systems → use primary scope or omit scope

   Then determine the commit type based on nature of changes:
   - New files/features → `feat`
   - Bug fixes → `fix`
   - Documentation only → `docs`
   - Refactoring → `refactor`
   - Maintenance/tooling → `chore`
   - Tests → `test`

   b. **Generate subject from changes:**
      - Use imperative mood based on what was actually changed
      - Examples:
        - Created `.claude/agents/api-validator.md` → `feat(agents): add API validator subagent`
        - Created `.claude/commands/git/commit.md` → `feat(commands): add git commit command`
        - Fixed bug in `apps/api/auth.ts` → `fix(api): resolve authentication issue`
        - Updated `docs/setup.md` → `docs: update setup guide`

   c. **Include agent metadata in footer:**
      ```
      Agent: <subagent-type>
      Session-ID: <session-id>
      Invocation-ID: <invocation-id>

      Prompt:
      <full-prompt>
      ```

   d. **Example full messages:**

      **Example 1: Agent created new subagent**
      ```
      feat(agents): add API contract validator subagent

      Created specialized subagent for validating API implementations
      against OpenAPI specifications and identifying contract violations.

      Agent: subagent-creator
      Session-ID: 1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d
      Invocation-ID: toolu_01Sx5EFM4ViaXkqZECJ3Zgqu

      Prompt:
      Create a subagent that validates API implementations against
      OpenAPI specifications and identifies contract violations...
      ```

      **Example 2: Agent created new slash command**
      ```
      feat(commands): add git commit command

      Created intelligent git commit command that analyzes staged changes
      and generates semantic commit messages with smart grouping.

      Agent: slash-command-creator
      Session-ID: 1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d
      Invocation-ID: toolu_01AbCdEfGhIjKlMn

      Prompt:
      Create a slash command for intelligent git commits that analyzes
      changes and generates semantic commit messages...
      ```

3. **Skip User Interaction (if from hook):**
   - If invoked from hook, skip confirmation prompts
   - Auto-approve commit strategy (prefer single commit for agent work)
   - Auto-approve generated message
   - Execute commit immediately
   - Log results to hook log file

**Validation:**
- [ ] Subagent context detected and parsed
- [ ] Agent metadata included in commit message
- [ ] Appropriate type/scope selected
- [ ] Commit created without user prompts (hook mode)
- [ ] Results logged appropriately

---

## Output Format

### For Manual Invocation

**Terminal Output:**
```
📋 Analyzing staged changes...

Found 8 staged files across 3 systems:
- Frontend (apps/web): 3 files
- Backend (apps/api): 4 files
- Documentation (docs): 1 file

Recommendation: Split into 2 commits
1. feat(api): add user authentication endpoints (4 files)
2. feat(web): add login UI components (3 files)
3. docs: add authentication setup guide (1 file)

Proceed with 3 commits? [Y/n]: Y

Generating commit messages...

Commit 1:
─────────────────────────────────────
feat(api): add user authentication endpoints

Implement JWT-based authentication with login, logout,
and token refresh endpoints.

Closes #234
─────────────────────────────────────
Approve? [Y/n]: Y

[... continue for each commit ...]

✓ Creating commits...
  ✓ Commit 1: a1b2c3d feat(api): add user authentication endpoints
  ✓ Commit 2: d4e5f6g feat(web): add login UI components
  ✓ Commit 3: h7i8j9k docs: add authentication setup guide

✓ Successfully created 3 commits

Next steps:
- Review: git log -3
- Push: git push
- Create PR if needed
```

### For Hook Invocation

**Log Output (to stderr):**
```
[git:commit] Detected SubagentStop hook invocation
[git:commit] Agent: subagent-creator
[git:commit] Session: 1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d
[git:commit] Creating commit with agent metadata...
✓ Committed: a1b2c3d chore(agent): add slash-command-creator agent
```

### Commit Message Format

**Standard Commit:**
```
<type>(<scope>): <subject line>

<body with explanation>
<wrapped at 72 characters>

<footer with references>
Closes #123
```

**Agent Commit:**
```
chore(agent): <subject from agent prompt>

<body with context>

Agent: <subagent-type>
Session-ID: <session-id>
Invocation-ID: <invocation-id>

Prompt:
<truncated-prompt>
```

---

## Quality Standards

### Commit Message Quality
- Subject line under 72 characters
- Uses imperative mood ("add" not "added")
- Type and scope are accurate for changes
- Body explains "why" not just "what"
- No vague language ("improve", "update things")
- Breaking changes clearly marked in footer
- References issues/PRs when applicable

### Commit Granularity
- Each commit has single, focused purpose
- Commits are logically independent
- Commits can be cherry-picked or reverted safely
- Related changes kept together
- Unrelated changes separated
- No "misc changes" or "various updates" commits

### Technical Standards
- All staged changes accounted for in commits
- No partial staging (commit contains complete logical unit)
- Commit order is logical (dependencies before dependents)
- No empty commits
- Commit successfully created in git history

---

## Constraints & Boundaries

### Must Do
- Analyze all staged changes before committing
- Follow semantic commit format strictly
- Group multi-system changes into focused commits
- Include agent metadata when invoked from hooks
- Verify each commit was created successfully
- Provide clear feedback to user at each step

### Must Not Do
- Create commits with vague messages ("update code", "fix stuff")
- Mix unrelated changes in single commit
- Commit without user approval (unless from hook)
- Use past tense in commit subjects
- Exceed 72 characters in subject line
- Skip commit message body when context is needed
- Create empty commits

### Scope Management

**In Scope:**
- Analyzing staged and unstaged changes
- Determining optimal commit strategy
- Generating semantic commit messages
- Executing git commits with proper messages
- Handling hook invocations with agent metadata
- Providing guidance on commit best practices

**Out of Scope:**
- Staging changes (user should stage or command asks)
- Pushing commits to remote
- Creating pull requests
- Squashing or rebasing commits
- Editing previous commits
- Resolving merge conflicts
- Modifying git configuration

---

## Examples

### Example 1: Simple Single-Concern Commit

**User:** `/git:commit`

**Analysis:**
```
Staged files:
- apps/web/src/components/Button.tsx
- apps/web/src/components/Button.test.tsx
- apps/web/src/components/Button.stories.tsx
```

**Strategy:** Single commit (all related to one component)

**Generated Message:**
```
feat(web): add Button component

Implement reusable Button component with variants
for primary, secondary, and tertiary styles.

Includes comprehensive tests and Storybook stories.
```

**Execution:**
```
✓ Created commit: a1b2c3d feat(web): add Button component
```

---

### Example 2: Multi-System Changes Requiring Split

**User:** `/git:commit`

**Analysis:**
```
Staged files:
- apps/api/src/auth/controller.ts (new)
- apps/api/src/auth/service.ts (new)
- apps/web/src/pages/login.tsx (new)
- apps/web/src/hooks/useAuth.ts (new)
- docs/auth/setup.md (new)
- packages/types/src/auth.ts (modified)
- package.json (modified - new deps)
```

**Strategy:** Split into 4 commits

**Commit Groups:**
```
Commit 1: chore(deps): add authentication dependencies
- package.json

Commit 2: feat(types): add authentication types
- packages/types/src/auth.ts

Commit 3: feat(api): add authentication endpoints
- apps/api/src/auth/controller.ts
- apps/api/src/auth/service.ts

Commit 4: feat(web): add login page and auth hook
- apps/web/src/pages/login.tsx
- apps/web/src/hooks/useAuth.ts

Commit 5: docs: add authentication setup guide
- docs/auth/setup.md
```

**Execution:**
```
✓ Commit 1: b2c3d4e chore(deps): add authentication dependencies
✓ Commit 2: c3d4e5f feat(types): add authentication types
✓ Commit 3: d4e5f6g feat(api): add authentication endpoints
✓ Commit 4: e5f6g7h feat(web): add login page and auth hook
✓ Commit 5: f6g7h8i docs: add authentication setup guide
```

---

### Example 3: Agent Hook Invocation

**Context from SubagentStop:**
```json
{
  "session_id": "1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d",
  "agent_type": "subagent-creator",
  "prompt": "Create a subagent that analyzes API performance...",
  "invocation_id": "toolu_01Sx5EFM4ViaXkqZECJ3Zgqu",
}
```

**Analysis:**
```
Staged files:
- .claude/agents/api-performance-analyzer.md
```

**Scope Determination:**
- File is in `.claude/agents/` → scope is `agents`
- New file with new functionality → type is `feat`

**Generated Message:**
```
feat(agents): add API performance analyzer subagent

Created specialized subagent for analyzing API performance
metrics and identifying bottlenecks.

Agent: subagent-creator
Session-ID: 1a7d9110-f81d-4bba-aa6f-2a1e017fbc2d
Invocation-ID: toolu_01Sx5EFM4ViaXkqZECJ3Zgqu

Prompt:
Create a subagent that analyzes API performance...
```

**Execution:**
```
[git:commit] Auto-committing from SubagentStop hook
✓ Created: g7h8i9j feat(agents): add API performance analyzer subagent
```

---

### Example 4: Fix with Issue Reference

**User:** `/git:commit`

**Analysis:**
```
Staged files:
- apps/web/src/components/Form.tsx
- apps/web/src/components/Form.test.tsx
```

**Generated Message:**
```
fix(web): resolve form validation race condition

Fix issue where rapid form submissions could bypass
validation due to async validator race condition.

Add debouncing to validation logic and ensure submit
button is disabled during validation.

Fixes #456
```

---

## Related Commands

- `/git:status` - Show git status with enhanced formatting (if exists)
- `/git:diff` - Show git diff with analysis (if exists)
- `/git:squash` - Squash recent commits (if exists)
- `/git:amend` - Amend previous commit (if exists)
- `/format` - Format code before committing (if exists)
- `/test` - Run tests before committing (if exists)

---

## Integration with Existing Hooks

This command is designed to work alongside the existing `SubagentStop` hook:

**Current Hook Behavior:**
- `tools/src/hooks/subagent-stop.ts` auto-commits with basic `chore(agent)` message
- Includes agent metadata in footer
- Commits all changes without analysis

**Enhanced Workflow Option:**
1. **Keep current hook** for automatic commits (convenience)
2. **Use `/git:commit` manually** when you want:
   - More specific commit types (feat/fix instead of chore)
   - Better commit messages (analyzed, not generic)
   - Split multi-system changes into focused commits
   - Full control over commit strategy

**Future Enhancement:**
- Modify `subagent-stop.ts` to invoke `/git:commit` with subagent context
- This would provide intelligent commits automatically
- Requires hook to support slash command invocation

---

**Command Version:** 1.0
**Last Updated:** 2025-10-20
**Owner:** Platform Engineering
