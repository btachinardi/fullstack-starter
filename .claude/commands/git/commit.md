---
description: Intelligently commit git changes using semantic commit messages with smart grouping for multi-concern changes
allowed-tools: Bash(git *:*), Task
model: claude-sonnet-4-5
---

# /git:commit

Intelligently commit git changes using semantic commit messages with smart grouping for multi-concern changes.

## Objective

Orchestrate intelligent git commits by delegating to specialized subagents for change analysis, commit grouping, and message generation. This command coordinates the workflow while maintaining quality standards and user interaction.

## Context & Prerequisites

**Project Context:**
- Semantic commit format: `type(scope): description`
- Commit types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`
- Scope indicates the affected area (e.g., `api`, `web`, `ui`, `docs`, `config`)
- SubagentStop hook auto-commits with appropriate type/scope based on changes
- This command can be invoked manually or with subagent context from hooks

**Specialized Subagents:**
- `commit-grouper`: Analyzes changes and creates logical commit groups
- `commit-message-generator`: Generates semantic commit messages for each group

**Prerequisites:**
- Git repository initialized
- Changes exist (staged or unstaged)
- Working directory is clean of conflicts
- Subagent definitions exist in `.claude/agents/`

## Instructions

### Phase 1: Check Git State

**Objective:** Verify git status and prepare for analysis

**Steps:**

1. **Check Git Status**
   ```bash
   git status --porcelain
   ```

2. **Handle Unstaged Changes**
   - If no staged changes but unstaged exist, ask user:
     - Stage all changes: `git add -A`
     - Stage specific files: provide list for selection
     - Cancel operation

3. **Verify Changes Exist**
   - If no changes at all: inform user and exit
   - If changes exist: proceed to Phase 2

**Validation:**
- [ ] Git status checked
- [ ] Staged changes exist or user declined to stage
- [ ] Ready to proceed with analysis

---

### Phase 2: Delegate to commit-grouper

**Objective:** Use specialized subagent to analyze changes and create logical commit groups

**Steps:**

1. **Invoke commit-grouper Subagent**

   Use the Task tool to invoke the commit-grouper subagent:

   ```
   Task(
     subagent_type="commit-grouper",
     description="Analyze git changes and create logical commit groups",
     prompt="Analyze all staged git changes and group them into logical commits using the dependency-flow strategy. Return JSON structure with groups containing: id, type, scope, description, files, reasoning."
   )
   ```

2. **Wait for Subagent Response**
   - Subagent will analyze git status and diffs
   - Subagent will determine grouping strategy (single-commit vs. multi-commit)
   - Subagent will return JSON structure with commit groups

3. **Parse Commit Groups**

   Expected JSON structure:
   ```json
   {
     "strategy": "dependency-flow",
     "total_files": 15,
     "total_groups": 3,
     "groups": [
       {
         "id": "group-1",
         "type": "chore",
         "scope": "deps",
         "description": "Update dependencies",
         "files": ["package.json", "pnpm-lock.yaml"],
         "reasoning": "Dependency updates should be committed separately"
       },
       {
         "id": "group-2",
         "type": "feat",
         "scope": "api",
         "description": "Add authentication endpoints",
         "files": ["apps/api/src/auth/*.ts"],
         "reasoning": "Backend auth implementation"
       }
     ]
   }
   ```

4. **Present Groups to User**

   Show proposed commit groups:
   ```
   Found 15 files across 3 systems

   Proposed 3 commit groups:

   Group 1 (chore/deps): Update dependencies
     Files: package.json, pnpm-lock.yaml
     Reason: Dependency updates should be committed separately

   Group 2 (feat/api): Add authentication endpoints
     Files: apps/api/src/auth/controller.ts, apps/api/src/auth/service.ts, ...
     Reason: Backend auth implementation

   Group 3 (feat/web): Add login UI components
     Files: apps/web/src/components/auth/LoginForm.tsx, ...
     Reason: Frontend auth UI
   ```

5. **Get User Approval**
   - Ask: "Approve these commit groups? (Y/n)"
   - If yes: proceed to Phase 3
   - If no: offer to:
     - Modify groups manually
     - Use different grouping strategy (re-invoke commit-grouper with new strategy)
     - Proceed with single commit instead
     - Cancel operation

**Validation:**
- [ ] commit-grouper subagent invoked successfully
- [ ] Commit groups received and parsed
- [ ] Groups presented to user clearly
- [ ] User has approved or modified groups
- [ ] All staged files accounted for in groups

---

### Phase 3: Delegate to commit-message-generator (Parallel)

**Objective:** Generate semantic commit messages for each group using parallel subagent invocations

**CRITICAL:** Invoke all message generators IN PARALLEL using a SINGLE response with MULTIPLE Task tool calls.

**Steps:**

1. **Invoke commit-message-generator for All Groups (Parallel)**

   In a **single response**, call the Task tool **multiple times** (once per group):

   **Example for 3 groups:**
   ```
   # Call all three Task invocations in ONE message:

   Task 1:
   Task(
     subagent_type="commit-message-generator",
     description="Generate message for group-1",
     prompt="Generate semantic commit message for this commit group:\n\n" + JSON.stringify(group1)
   )

   Task 2:
   Task(
     subagent_type="commit-message-generator",
     description="Generate message for group-2",
     prompt="Generate semantic commit message for this commit group:\n\n" + JSON.stringify(group2)
   )

   Task 3:
   Task(
     subagent_type="commit-message-generator",
     description="Generate message for group-3",
     prompt="Generate semantic commit message for this commit group:\n\n" + JSON.stringify(group3)
   )
   ```

   **IMPORTANT:** All three Task calls happen in parallel - Claude Code executes them concurrently.

2. **Wait for All Subagents to Complete**
   - All message generators run simultaneously
   - Wait for all responses before proceeding
   - Total time ≈ time of slowest generator (not sum of all)

3. **Collect Generated Messages**

   Each subagent returns a commit message in format:
   ```
   type(scope): subject line

   Optional body explaining the changes
   and providing context.

   Optional footer with references
   Closes #123
   ```

4. **Present All Messages to User**

   Show all generated commit messages for review:
   ```
   Generated commit messages:

   Commit 1:
   ─────────────────────────────────────
   chore(deps): update dependencies to latest versions

   Update all dependencies to latest compatible versions
   including security patches.
   ─────────────────────────────────────
   Files: package.json, pnpm-lock.yaml

   Commit 2:
   ─────────────────────────────────────
   feat(api): add JWT authentication endpoints

   Implement secure authentication flow using JWT tokens.
   Includes login, logout, and token refresh endpoints.

   Closes #234
   ─────────────────────────────────────
   Files: apps/api/src/auth/controller.ts, apps/api/src/auth/service.ts, ...

   Commit 3:
   ─────────────────────────────────────
   feat(web): add login UI components

   Create login form with email/password validation
   and integration with authentication API.
   ─────────────────────────────────────
   Files: apps/web/src/components/auth/LoginForm.tsx, ...
   ```

5. **Get User Approval**
   - Ask: "Approve all commit messages? (Y/n)"
   - If yes: proceed to Phase 4
   - If no: offer to:
     - Edit specific messages manually
     - Regenerate specific messages (re-invoke subagent for that group)
     - Cancel operation

**Validation:**
- [ ] All commit-message-generator subagents invoked in parallel
- [ ] All messages received successfully
- [ ] Messages follow semantic commit format
- [ ] Messages presented clearly to user
- [ ] User has approved all messages

---

### Phase 4: Execute Commits

**Objective:** Execute the planned commits with generated messages in correct order

**Steps:**

1. **Prepare Commit Execution**
   - Create temporary files for multi-line commit messages if needed
   - Prepare file lists for each commit group
   - Determine commit order (respect dependencies from grouper)

2. **For Each Commit Group (in dependency order):**

   a. **Reset staging area:**
      ```bash
      git reset
      ```

   b. **Stage files for this group:**
      ```bash
      git add <file1> <file2> <file3> ...
      ```

   c. **Verify staging:**
      ```bash
      git status --porcelain
      ```
      Confirm only intended files are staged.

   d. **Create commit:**
      - If message is single-line:
        ```bash
        git commit -m "message"
        ```
      - If message has body/footer:
        ```bash
        echo "message" > /tmp/commit-msg.txt
        git commit -F /tmp/commit-msg.txt
        ```

   e. **Verify commit created:**
      ```bash
      git log -1 --oneline
      ```
      Show commit hash and subject to user.

   f. **Continue to next group**

3. **Final Verification**

   After all commits created:

   a. **Show all commits:**
      ```bash
      git log -<N> --oneline
      ```
      Where N = number of commits just created.

   b. **Verify clean state:**
      ```bash
      git status
      ```
      Confirm no staged or unstaged changes remain.

   c. **Cleanup:**
      - Remove temporary message files
      - Confirm all operations successful

4. **Success Report**

   Present summary to user:
   ```
   ✓ Successfully created 3 commits:

   1. a1b2c3d chore(deps): update dependencies to latest versions
   2. d4e5f6g feat(api): add JWT authentication endpoints
   3. h7i8j9k feat(web): add login UI components

   Next steps:
   - Review commits: git log -3
   - Push to remote: git push
   - Create pull request if needed
   ```

**Validation:**
- [ ] All commits created successfully
- [ ] Each commit contains correct files
- [ ] Each commit has correct message
- [ ] Working directory is clean
- [ ] User notified of success

---

### Phase 5: SubagentStop Hook Integration (Optional)

**Objective:** Handle invocation from SubagentStop hook with agent metadata

**When Invoked from Hook:**

1. **Detect Hook Context**
   - Check for subagent context (session_id, invocation_id, agent_type, prompt)
   - If present: activate auto-commit mode
   - If absent: use normal interactive mode (Phases 1-4)

2. **Auto-Commit Mode Behavior**
   - **Skip user prompts**: Auto-approve all decisions
   - **Prefer single commit**: Invoke commit-grouper with "single-commit" strategy hint
   - **Include agent metadata**: Ensure commit message footer includes:
     ```
     Agent: <subagent-type>
     Session-ID: <session-id>
     Invocation-ID: <invocation-id>

     Prompt:
     <full-prompt>
     ```
   - **Execute immediately**: Create commit without waiting for approval
   - **Log results**: Output to stderr for hook logging

3. **Example Auto-Commit Flow**
   ```
   [git:commit] Detected SubagentStop hook invocation
   [git:commit] Agent: subagent-creator
   [git:commit] Analyzing changes...
   [git:commit] Creating single commit with agent metadata...
   ✓ Committed: a1b2c3d feat(agents): add commit-grouper subagent
   ```

**Validation:**
- [ ] Hook context detected correctly
- [ ] Auto-commit mode activated
- [ ] Single commit strategy used
- [ ] Agent metadata included in footer
- [ ] Commit executed without prompts

---

## Output Format

### Phase 1: Git Status Check

```
Checking git status...

Found 8 staged files:
M  apps/api/src/auth/controller.ts
M  apps/api/src/auth/service.ts
A  apps/web/src/components/LoginForm.tsx
M  docs/auth.md
...

Proceeding with commit analysis.
```

### Phase 2: Commit Grouping (via commit-grouper)

```
Invoking commit-grouper subagent...

Found 8 files across 3 systems

Proposed 3 commit groups:

Group 1 (feat/api): Add authentication endpoints
  Files: apps/api/src/auth/controller.ts, apps/api/src/auth/service.ts
  Reason: Backend authentication implementation

Group 2 (feat/web): Add login UI component
  Files: apps/web/src/components/LoginForm.tsx
  Reason: Frontend authentication UI

Group 3 (docs): Document authentication flow
  Files: docs/auth.md
  Reason: Documentation changes should be separate

Approve these commit groups? (Y/n):
```

### Phase 3: Message Generation (via commit-message-generator)

```
Generating commit messages (3 parallel subagents)...

Generated commit messages:

Commit 1:
─────────────────────────────────────
feat(api): add JWT authentication endpoints

Implement login and logout endpoints with JWT token
generation and validation.

Closes #234
─────────────────────────────────────
Files: apps/api/src/auth/controller.ts, apps/api/src/auth/service.ts

Commit 2:
─────────────────────────────────────
feat(web): add login form component

Create login form with email/password validation
and error handling.
─────────────────────────────────────
Files: apps/web/src/components/LoginForm.tsx

Commit 3:
─────────────────────────────────────
docs: add authentication flow documentation

Document authentication endpoints and token handling.
─────────────────────────────────────
Files: docs/auth.md

Approve all commit messages? (Y/n):
```

### Phase 4: Commit Execution

```
Creating commits...

  ✓ Commit 1: a1b2c3d feat(api): add JWT authentication endpoints
  ✓ Commit 2: d4e5f6g feat(web): add login form component
  ✓ Commit 3: h7i8j9k docs: add authentication flow documentation

✓ Successfully created 3 commits

Next steps:
- Review: git log -3
- Push: git push
- Create PR if needed
```

### Phase 5: Hook Invocation (Auto-Commit Mode)

```
[git:commit] Detected SubagentStop hook invocation
[git:commit] Agent: subagent-creator
[git:commit] Invoking commit-grouper with single-commit strategy...
[git:commit] Invoking commit-message-generator...
[git:commit] Creating commit with agent metadata...
✓ Committed: a1b2c3d feat(agents): add commit-grouper subagent
```

---

## Quality Standards

### Orchestration Quality
- Subagent invocations are successful
- Parallel message generation maximizes efficiency
- User approval required at key decision points
- Clear communication between command and subagents
- Proper error handling if subagents fail

### Commit Message Quality (delegated to commit-message-generator)
- Subject line under 72 characters
- Uses imperative mood ("add" not "added")
- Type and scope are accurate for changes
- Body explains "why" not just "what"
- No vague language ("improve", "update things")
- Breaking changes clearly marked in footer
- References issues/PRs when applicable

### Commit Grouping Quality (delegated to commit-grouper)
- Each commit has single, focused purpose
- Commits are logically independent
- Commits can be cherry-picked or reverted safely
- Related changes kept together
- Unrelated changes separated
- No "misc changes" or "various updates" commits
- Dependency order respected

### Technical Standards
- All staged changes accounted for in commits
- No partial staging (commit contains complete logical unit)
- Commit order respects dependencies from grouper
- No empty commits
- Commit successfully created in git history
- Proper cleanup of temporary files

---

## Constraints & Boundaries

### Must Do
- Delegate analysis and grouping to commit-grouper subagent
- Delegate message generation to commit-message-generator subagents (in parallel)
- Get user approval before executing commits (unless hook mode)
- Verify each commit was created successfully
- Provide clear feedback to user at each step
- Handle subagent failures gracefully

### Must Not Do
- Perform analysis/grouping directly (delegate to commit-grouper)
- Generate commit messages directly (delegate to commit-message-generator)
- Invoke message generators sequentially (must be parallel)
- Commit without user approval (unless from hook)
- Skip subagent invocation (don't implement logic inline)
- Proceed if subagents fail without offering alternatives

### Scope Management

**In Scope:**
- Orchestrating the commit workflow
- Invoking specialized subagents
- Managing user interaction and approval
- Executing git commands (add, commit, reset)
- Handling hook invocations with agent metadata
- Presenting subagent results to user
- Error recovery and fallback strategies

**Out of Scope:**
- Analyzing git changes directly (delegate to commit-grouper)
- Generating commit messages directly (delegate to commit-message-generator)
- Determining grouping strategy (subagent responsibility)
- Crafting message text (subagent responsibility)
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
