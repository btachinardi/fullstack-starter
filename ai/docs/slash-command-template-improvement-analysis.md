# Slash Command Template & Guidelines Improvement Analysis

**Created:** 2025-10-20
**Purpose:** Analysis and improvement plan for SLASH_COMMAND_TEMPLATE.md and SLASH_COMMAND_GUIDELINES.md based on official Claude Code documentation

---

## Executive Summary

This document analyzes our current slash command template and guidelines against the official Claude Code documentation and identifies specific improvements to align with official specifications while maintaining our enhanced structure.

**Key Findings:**
- Missing YAML frontmatter in template (no frontmatter at all currently)
- Missing critical fields: `description`, `allowed-tools`, `argument-hint`, `model`
- Missing $ARGUMENTS placeholder documentation
- Missing positional arguments ($1, $2, $3) support
- Missing bash execution (!) prefix feature
- Missing file reference (@) feature
- Correct file location guidance (✅ .claude/commands/)
- Our comprehensive structure is excellent but needs official features

**Priority Improvements:**
1. Add YAML frontmatter structure to template
2. Document all official frontmatter fields
3. Add $ARGUMENTS and positional arguments documentation
4. Document allowed-tools field for bash command control
5. Document bash execution (!) and file reference (@) features
6. Add model selection field

---

## Current State Analysis

### SLASH_COMMAND_TEMPLATE.md

**Current Structure:**
```markdown
# [Command Name]

[One-line description of what this command does and when to use it]

## Objective
[Clear, specific statement of what should be accomplished]

## Context & Prerequisites
...
```

**Issues:**
- ❌ No YAML frontmatter at all
- ❌ Missing `description` field (required for /help)
- ❌ Missing `allowed-tools` field for bash command control
- ❌ Missing `argument-hint` field for user guidance
- ❌ Missing `model` field for model selection
- ❌ No mention of $ARGUMENTS placeholder
- ❌ No mention of positional arguments ($1, $2, $3)
- ❌ No mention of bash execution (!) prefix
- ❌ No mention of file reference (@) feature
- ❌ Format is comprehensive but not executable as-is

**Strengths:**
- ✅ Correct file location (.claude/commands/)
- ✅ Excellent comprehensive structure for complex commands
- ✅ Clear phase-based workflow approach
- ✅ Good quality standards and constraints sections
- ✅ Strong examples and related commands sections

### SLASH_COMMAND_GUIDELINES.md

**Current Content:**
- What slash commands are
- File location guidance (correct)
- Naming conventions
- Template variations (Minimal, Standard, Comprehensive)
- Command patterns (Analysis, Generation, Workflow, Review, Troubleshooting)
- Best practices
- Complete examples

**Issues:**
- ❌ No YAML frontmatter documentation at all
- ❌ Missing `description` field explanation
- ❌ Missing `allowed-tools` field explanation
- ❌ Missing `argument-hint` field explanation
- ❌ Missing `model` field explanation
- ❌ No $ARGUMENTS placeholder documentation
- ❌ No positional arguments documentation
- ❌ No bash execution (!) prefix documentation
- ❌ No file reference (@) documentation
- ❌ Examples don't show frontmatter usage

**Strengths:**
- ✅ Correct file location documented (.claude/commands/)
- ✅ Excellent command patterns and examples
- ✅ Strong best practices section
- ✅ Good organization strategies
- ✅ Comprehensive testing guidance
- ✅ Clear do's and don'ts

---

## Official Documentation Findings

### File Location (Confirmed Correct ✅)

**Project-scoped commands:**
- Location: `.claude/commands/`
- Shared with team, version controlled
- Shows "(project)" in /help

**User-scoped commands:**
- Location: `~/.claude/commands/`
- Personal commands across projects
- Shows "(user)" in /help

**Namespace Support:**
- Directory structure: `.claude/commands/category/command.md`
- Invocation: `/category:command`
- Organizational flexibility

### YAML Frontmatter Format

**Official Structure:**
```markdown
---
description: Brief description of what the command does
allowed-tools: Bash(git add:*), Bash(git status:*)
argument-hint: [message] [options]
model: claude-3-5-haiku-20241022
---

# Command Content

Instructions for Claude with $ARGUMENTS placeholder.
```

**Key Fields:**

#### 1. `description` (Required)
- **Purpose:** Shows in /help command list
- **Format:** Brief, one-line description
- **Behavior:** Used in context, must be populated
- **Example:** `description: Create a git commit`

#### 2. `allowed-tools` (Optional)
- **Purpose:** Specifies which bash commands can be executed
- **Format:** `Bash(command:pattern), Bash(command:pattern)`
- **Behavior:** Controls tool access, outputs embedded in prompt
- **Example:** `allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)`
- **Use Case:** Security, limiting command scope

#### 3. `argument-hint` (Optional)
- **Purpose:** Displays hint for arguments the command accepts
- **Format:** `[arg1] [arg2] [arg3]`
- **Behavior:** Shows user what arguments to provide
- **Example:** `argument-hint: [pr-number] [priority] [assignee]`
- **Use Case:** User guidance, documentation

#### 4. `model` (Optional)
- **Purpose:** Specifies which Claude model to use
- **Format:** Full model identifier
- **Example:** `model: claude-3-5-haiku-20241022`
- **Use Case:** Optimize cost/speed for specific commands
- **Options:**
  - `claude-3-5-sonnet-20241022` - More capable, complex tasks
  - `claude-3-5-haiku-20241022` - Faster, simpler tasks

### Argument Placeholders

#### $ARGUMENTS
- **Purpose:** Captures all text after command name
- **Format:** `$ARGUMENTS` in command content
- **Example:** `/refactor component.js` → `$ARGUMENTS = "component.js"`
- **Use Case:** Single argument or free-form text

**Example Command:**
```markdown
---
description: Refactor a component
argument-hint: [file-path]
---

Refactor the component at: $ARGUMENTS
```

#### Positional Arguments
- **Purpose:** Capture specific argument positions
- **Format:** `$1`, `$2`, `$3`, etc.
- **Example:** `/review-pr 123 high john` → `$1=123`, `$2=high`, `$3=john`
- **Use Case:** Multiple specific arguments

**Example Command:**
```markdown
---
description: Review pull request
argument-hint: [pr-number] [priority] [assignee]
---

Review PR #$1 with priority $2 and assign to $3
```

### Advanced Features

#### Bash Execution (! prefix)
- **Purpose:** Execute bash commands before slash command runs
- **Format:** `!command` in chat
- **Behavior:** Output included in command context
- **Example:** `!git log --oneline -5` then `/analyze-commits`
- **Use Case:** Provide current state to command

#### File References (@ prefix)
- **Purpose:** Reference files in command invocation
- **Format:** `@file-path` in chat
- **Behavior:** File content included in context
- **Example:** `/review @src/component.tsx @src/component.test.tsx`
- **Use Case:** Commands that operate on specific files

---

## Gap Analysis

### Critical Gaps (Must Fix)

1. **No YAML Frontmatter in Template**
   - Current: Template starts with `# [Command Name]`
   - Required: Must have YAML frontmatter at top
   - Impact: Commands missing critical metadata

2. **Missing `description` Field**
   - Current: No mention of description field
   - Required: Mandatory field for /help
   - Impact: Commands won't show in /help properly

3. **No $ARGUMENTS Documentation**
   - Current: No mention of $ARGUMENTS placeholder
   - Required: Core feature for argument passing
   - Impact: Users can't create parameterized commands

4. **Missing `allowed-tools` Field**
   - Current: No mention of tool control
   - Required: Important for security and scope
   - Impact: Can't restrict bash command access

### High Priority Gaps

5. **Missing `argument-hint` Field**
   - Current: No mention of argument hints
   - Required: Important for UX
   - Impact: Users don't know what arguments to provide

6. **Missing `model` Field**
   - Current: No mention of model selection
   - Required: Cost/performance optimization
   - Impact: Can't optimize model per command

7. **No Positional Arguments ($1, $2, $3)**
   - Current: No documentation of positional args
   - Required: Multi-argument commands
   - Impact: Complex commands difficult to create

8. **Missing Bash Execution (!) Feature**
   - Current: No mention of ! prefix
   - Required: Dynamic context provision
   - Impact: Can't execute commands before slash command

9. **Missing File Reference (@) Feature**
   - Current: No mention of @ prefix
   - Required: File-based commands
   - Impact: Can't reference files in invocations

### Medium Priority Gaps

10. **No Frontmatter Examples in Guidelines**
    - Current: Examples show content only
    - Required: Show complete files with frontmatter
    - Impact: Users don't see complete picture

11. **Missing Model Selection Strategy**
    - Current: No guidance on when to use which model
    - Required: Help users optimize costs
    - Impact: Suboptimal model selection

12. **Missing Argument Patterns**
    - Current: No patterns for common argument types
    - Required: Best practices for args
    - Impact: Inconsistent argument handling

### Low Priority Gaps

13. **Namespace Documentation Could Be Enhanced**
    - Current: Mentions directory structure
    - Enhancement: Show more namespace examples
    - Impact: Minor - basic info present

14. **Priority System Not Explicit**
    - Current: Mentions project/user scopes
    - Enhancement: Clarify project > user precedence
    - Impact: Minor - implicit understanding

---

## Improvement Recommendations

### SLASH_COMMAND_TEMPLATE.md Changes

#### 1. Add YAML Frontmatter (Critical)

**Add at the very beginning:**
```markdown
---
description: [Brief one-line description for /help]
allowed-tools: [Optional: Bash(command:pattern), Bash(command:pattern)]
argument-hint: [Optional: [arg1] [arg2] [arg3]]
model: [Optional: claude-3-5-sonnet-20241022 or claude-3-5-haiku-20241022]
---

# [Command Name]
```

#### 2. Add Configuration Guidance Section

**Add after the frontmatter:**
```markdown
# [Command Name]

[One-line description of what this command does and when to use it]

## Configuration

**Frontmatter Fields:**
- `description`: Shows in /help - keep brief and clear
- `allowed-tools`: (Optional) Restrict bash commands - format: `Bash(cmd:pattern)`
- `argument-hint`: (Optional) Guide users on arguments - format: `[arg1] [arg2]`
- `model`: (Optional) Specify model - `claude-3-5-sonnet-20241022` or `claude-3-5-haiku-20241022`

**Arguments:**
- Use `$ARGUMENTS` to capture all text after command name
- Use `$1`, `$2`, `$3` for specific positional arguments
- Arguments are provided when invoking: `/command arg1 arg2 arg3`
```

#### 3. Update Instructions Section

**Add argument handling guidance:**
```markdown
## Instructions

### Argument Handling
This command accepts arguments via:
- `$ARGUMENTS`: [What the full arguments represent]
- OR `$1`: [What first argument represents]
- OR `$2`: [What second argument represents]
- OR `$3`: [What third argument represents]

### Phase 1: [Phase Name]
[Detailed instructions that may reference $ARGUMENTS or $1, $2, $3]
- Process $ARGUMENTS: [How to use the arguments]
- [Specific action 1]
- [Specific action 2]
```

#### 4. Add Complete Example

**Add example at the end:**
```markdown
## Complete Example

### Simple Command with Single Argument

```markdown
---
description: Format and lint a specific file
argument-hint: [file-path]
model: claude-3-5-haiku-20241022
---

# Format File Command

Format and lint the file at: $ARGUMENTS

1. Read the file at the specified path
2. Run prettier: `pnpm prettier --write $ARGUMENTS`
3. Run eslint: `pnpm eslint --fix $ARGUMENTS`
4. Report any remaining issues
```

### Complex Command with Multiple Arguments

```markdown
---
description: Create feature branch and initial PR draft
allowed-tools: Bash(git:*), Bash(gh:*)
argument-hint: [feature-name] [ticket-id] [description]
model: claude-3-5-sonnet-20241022
---

# Create Feature Workflow

Create feature branch "$1" for ticket $2 with description: $3

## Steps

1. Create and checkout branch: `git checkout -b feature/$1`
2. Create initial commit structure for $2
3. Push branch: `git push -u origin feature/$1`
4. Create draft PR: `gh pr create --draft --title "$2: $1" --body "$3"`
5. Output PR URL and next steps
```
```

### SLASH_COMMAND_GUIDELINES.md Changes

#### 1. Add YAML Frontmatter Section (Critical)

**Add new section early in guidelines:**
```markdown
## YAML Frontmatter Configuration

All slash commands support optional YAML frontmatter for metadata and configuration.

### Frontmatter Structure

```markdown
---
description: Brief description of what the command does
allowed-tools: Bash(git add:*), Bash(git status:*)
argument-hint: [message] [options]
model: claude-3-5-haiku-20241022
---

# Command Content
[Command instructions here]
```

### Frontmatter Fields

#### `description` (Required)
**Purpose:** Shows in /help command list and is used in context

**Format:** Single line, brief and clear

**Examples:**
- `description: Create a git commit with conventional format`
- `description: Generate React component with tests and stories`
- `description: Analyze API performance and suggest optimizations`

**Best Practices:**
- Keep under 80 characters
- Start with action verb
- Be specific about what command does
- Don't include command name (already shown)

#### `allowed-tools` (Optional)
**Purpose:** Restrict which bash commands can be executed, with output embedded in prompt

**Format:** `Bash(command:pattern), Bash(command:pattern)`

**Examples:**
```yaml
# Allow only git commands
allowed-tools: Bash(git:*)

# Allow specific git subcommands
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git push:*)

# Allow multiple tools
allowed-tools: Bash(git:*), Bash(pnpm test:*), Bash(gh:*)
```

**Use Cases:**
- Security: Limit command to safe operations
- Scope: Prevent unintended tool usage
- Performance: Reduce available tool set
- Safety: Prevent destructive operations

**Pattern Matching:**
- `*` matches any arguments
- `command:*` matches all invocations of command
- Multiple commands separated by commas

#### `argument-hint` (Optional)
**Purpose:** Display hint showing what arguments the command accepts

**Format:** `[arg1] [arg2] [arg3]`

**Examples:**
```yaml
# Single argument
argument-hint: [file-path]

# Multiple arguments
argument-hint: [pr-number] [priority] [assignee]

# Optional arguments
argument-hint: [component-name] [--with-tests]

# Flexible arguments
argument-hint: [source-file] [target-file] [options...]
```

**Best Practices:**
- Use square brackets for each argument
- Use descriptive names
- Indicate optional args: `[--flag]`
- Show multiple possibilities: `[file-path...]`

#### `model` (Optional)
**Purpose:** Specify which Claude model to use for this command

**Format:** Full model identifier

**Options:**
```yaml
# Sonnet - More capable, complex reasoning
model: claude-3-5-sonnet-20241022

# Haiku - Faster, lower cost, simpler tasks
model: claude-3-5-haiku-20241022
```

**Selection Strategy:**

| Command Type | Recommended Model | Rationale |
|-------------|------------------|-----------|
| Code generation | Sonnet | Complex reasoning required |
| File formatting | Haiku | Simple, rule-based task |
| Architecture design | Sonnet | Strategic thinking needed |
| Running tests | Haiku | Straightforward execution |
| Code review | Sonnet | Nuanced analysis required |
| Git operations | Haiku | Simple command execution |
| Documentation generation | Sonnet | Understanding and synthesis |
| Linting/formatting | Haiku | Fast, simple operations |

**Cost Optimization:**
- Use Haiku for commands that run frequently
- Use Haiku for simple, well-defined tasks
- Use Sonnet for complex, creative, or analytical commands
- Default (omit field) to inherit main agent's model
```

#### 2. Add Arguments Documentation Section

**Add new section:**
```markdown
## Argument Handling

Slash commands support dynamic arguments passed at invocation time.

### $ARGUMENTS Placeholder

**Purpose:** Captures all text after the command name

**Syntax:** `$ARGUMENTS` in command content

**Example Command:**
```markdown
---
description: Refactor a component
argument-hint: [file-path]
---

Refactor the component located at: $ARGUMENTS

1. Read the file at $ARGUMENTS
2. Analyze the code structure
3. Suggest and implement refactoring improvements
4. Run tests to verify changes
```

**Invocation:**
```
/refactor src/components/Button.tsx
```

**Result:** `$ARGUMENTS = "src/components/Button.tsx"`

**Use Cases:**
- Single file path argument
- Free-form text (commit messages, descriptions)
- Simple commands with one parameter
- When argument structure doesn't need parsing

### Positional Arguments

**Purpose:** Capture specific argument positions for structured multi-argument commands

**Syntax:** `$1`, `$2`, `$3`, `$4`, etc.

**Example Command:**
```markdown
---
description: Review pull request with priority and assignee
argument-hint: [pr-number] [priority] [assignee]
---

# Review Pull Request

Review PR #$1 with priority level $2 and assign to @$3

## Steps

1. Fetch PR details: `gh pr view $1`
2. Analyze changes based on $2 priority level
3. Generate review comments
4. Assign to $3: `gh pr edit $1 --add-assignee $3`
5. Post review summary
```

**Invocation:**
```
/review-pr 123 high john
```

**Result:**
- `$1 = "123"`
- `$2 = "high"`
- `$3 = "john"`

**Use Cases:**
- Commands with multiple specific arguments
- Structured argument patterns
- When argument order is important
- Clearer than parsing $ARGUMENTS

**Best Practices:**
- Use positional args when you need 2+ arguments
- Provide clear argument-hint in frontmatter
- Document what each position represents
- Validate argument count if needed
- Use descriptive names in documentation

### Combining Approaches

**Mixed Usage:**
You can use both $ARGUMENTS and positional args, but positional args are parsed from $ARGUMENTS:

```markdown
First argument is $1, rest are: $ARGUMENTS
```

**Invocation:** `/command arg1 arg2 arg3`
- `$1 = "arg1"`
- `$ARGUMENTS = "arg1 arg2 arg3"`

**Recommendation:** Choose one approach per command for clarity.
```

#### 3. Add Advanced Features Section

**Add new section:**
```markdown
## Advanced Features

### Bash Execution (! prefix)

**Purpose:** Execute bash commands before slash command runs, with output included in context

**Syntax:** `!command` in chat before or with slash command

**Example Usage:**

```
!git log --oneline -5
/analyze-commits
```

**Behavior:**
1. `git log --oneline -5` executes first
2. Output captured and included in context
3. `/analyze-commits` runs with git log output available

**Use Cases:**
- Provide current state to command
- Include dynamic data in context
- Check preconditions
- Gather information for analysis

**Example Pattern:**
```
!pnpm test -- --coverage
/analyze-coverage
```

The command receives test coverage output and can analyze it.

### File References (@ prefix)

**Purpose:** Reference files in command invocation, with content included in context

**Syntax:** `@file-path` in command invocation

**Example Usage:**

```
/review @src/components/Button.tsx @src/components/Button.test.tsx
```

**Behavior:**
1. Both file contents loaded into context
2. Command receives files for processing
3. Can reference file contents in analysis

**Use Cases:**
- Code review commands
- Refactoring commands
- Documentation generation
- File comparison or analysis

**Example Command:**
```markdown
---
description: Compare two files and suggest unification
argument-hint: @file1 @file2
---

# Compare and Unify Files

Compare the provided files and suggest how to unify them:

1. Analyze structure and purpose of each file
2. Identify common patterns and duplications
3. Suggest refactoring to eliminate duplication
4. Provide unified implementation
```

**Multiple Files:**
```
/compare-files @src/utils/format.ts @src/helpers/formatter.ts @src/lib/formatting.ts
```

All three files are loaded and available to the command.

### Combining Advanced Features

**Powerful Pattern:**
```
!git diff main...HEAD
/review-changes @CHANGELOG.md
```

1. Git diff output captured
2. CHANGELOG.md content loaded
3. Command can review changes and update changelog accordingly
```

#### 4. Update All Examples

**Update Minimal Command Example:**
```markdown
### Minimal Command

```markdown
---
description: Format all code following project standards
model: claude-3-5-haiku-20241022
allowed-tools: Bash(pnpm:*)
---

Format all code in the project.

1. Run: `pnpm format`
2. Verify: `pnpm lint` passes without errors
3. Report any issues found
```
```

**Update Medium Complexity Example:**
```markdown
### Medium Complexity Command

```markdown
---
description: Create conventional commit following project standards
allowed-tools: Bash(git:*)
argument-hint: [message]
model: claude-3-5-haiku-20241022
---

# Create Conventional Commit

Create a conventional commit with message: $ARGUMENTS

## Steps

1. Review changes: `git status`
2. Verify diff: `git diff`
3. Stage changes: `git add .`
4. Create commit with format: `type(scope): $ARGUMENTS`
   - Types: feat, fix, docs, style, refactor, test, chore
5. Verify commit created: `git log -1`
```
```

**Update High Complexity Example:**
```markdown
### High Complexity Command

```markdown
---
description: Prepare and execute release following workflow
allowed-tools: Bash(pnpm:*), Bash(git:*), Bash(gh:*)
model: claude-3-5-sonnet-20241022
argument-hint: [version-type]
---

# Release Workflow

Prepare and execute release for version type: $ARGUMENTS (major|minor|patch)

## Prerequisites
Check all prerequisites before proceeding:
- [ ] All tests passing: `pnpm test`
- [ ] Changesets created: Check `.changeset/` directory
- [ ] Documentation updated
- [ ] CHANGELOG reviewed

## Steps

1. Validate prerequisites (fail if any check fails)
2. Generate changelog: `pnpm changeset version`
3. Review version bumps in package.json files
4. Run final test suite: `pnpm test`
5. Create release commit: `git commit -m "chore: release"`
6. Create git tag: `git tag v[version]`
7. Push with tags: `git push --follow-tags`
8. Create GitHub release: `gh release create v[version]`
9. Publish packages: `pnpm changeset publish`

## Validation
After release:
- [ ] NPM packages published successfully
- [ ] GitHub release created
- [ ] Documentation deployed
- [ ] Team notified

## Rollback
If issues occur during release:
1. `git tag -d v[version]`
2. `git reset --hard HEAD~1`
3. `git push origin :refs/tags/v[version]`
4. Investigate and fix issues before retrying
```
```

#### 5. Add Frontmatter Best Practices Section

**Add new section:**
```markdown
## Frontmatter Best Practices

### When to Use Each Field

#### Always Use `description`
- ✅ **Required:** Every command must have a description
- Shows in `/help` output
- Used in context when command executes
- Keep brief (under 80 chars) but descriptive

#### Use `allowed-tools` When:
- ✅ Command should be restricted to specific bash commands
- ✅ Security or safety concerns exist
- ✅ Performance optimization needed (fewer tools = faster)
- ✅ Scope should be explicitly limited
- ❌ Don't use for commands needing all tools
- ❌ Don't use unless there's a good reason

#### Use `argument-hint` When:
- ✅ Command accepts arguments
- ✅ Argument structure isn't obvious
- ✅ Multiple arguments need clear ordering
- ✅ User guidance improves UX
- ❌ Don't use for commands without arguments

#### Use `model` When:
- ✅ Command has specific performance needs (use Haiku)
- ✅ Command requires complex reasoning (use Sonnet)
- ✅ Cost optimization is important
- ✅ Speed is critical (use Haiku)
- ❌ Don't specify unless optimizing for specific use case

### Frontmatter Anti-Patterns

❌ **Don't Over-Restrict:**
```yaml
# Bad: Too restrictive without reason
allowed-tools: Bash(echo:*)
```

❌ **Don't Write Vague Descriptions:**
```yaml
# Bad: Not descriptive
description: Do stuff

# Good: Clear and specific
description: Format TypeScript files and run ESLint fixes
```

❌ **Don't Specify Model Without Reason:**
```yaml
# Bad: No performance consideration
model: claude-3-5-haiku-20241022  # Why Haiku? If no reason, omit.

# Good: Clear reasoning
model: claude-3-5-haiku-20241022  # Simple formatting task, speed matters
```

❌ **Don't Create Confusing Argument Hints:**
```yaml
# Bad: Unclear arguments
argument-hint: [a] [b] [c]

# Good: Descriptive names
argument-hint: [component-name] [output-directory] [--with-tests]
```

### Minimal vs Full Configuration

**Minimal (Simple Commands):**
```yaml
---
description: Run all tests with coverage
---
```

**Moderate (Restricted + Arguments):**
```yaml
---
description: Create git commit with conventional format
allowed-tools: Bash(git:*)
argument-hint: [message]
---
```

**Full (Complex + Optimized):**
```yaml
---
description: Generate full-stack CRUD feature with tests
allowed-tools: Bash(pnpm:*), Bash(git:*)
argument-hint: [entity-name] [--api-only] [--ui-only]
model: claude-3-5-sonnet-20241022
---
```
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Immediate)

**Priority:** CRITICAL
**Effort:** 2-3 hours
**Impact:** Makes template produce functional commands

1. **Add YAML Frontmatter to Template**
   - Add frontmatter structure at very top
   - Include all four fields with placeholders
   - Add configuration guidance section
   - Show where to place frontmatter

2. **Add $ARGUMENTS Documentation**
   - Document $ARGUMENTS placeholder in template
   - Add usage examples
   - Show in template instructions section
   - Provide invocation examples

3. **Add `description` Field Documentation**
   - Explain it's required
   - Show in frontmatter
   - Provide examples
   - Document /help behavior

4. **Update All Template Examples**
   - Add frontmatter to all examples in guidelines
   - Show complete command files
   - Demonstrate various configurations
   - Include minimal, moderate, and full examples

### Phase 2: Feature Additions (High Priority)

**Priority:** HIGH
**Effort:** 3-4 hours
**Impact:** Adds all official features

5. **Add `allowed-tools` Documentation**
   - Create dedicated section in guidelines
   - Explain pattern matching syntax
   - Provide security use cases
   - Show multiple examples
   - Document best practices

6. **Add `argument-hint` Documentation**
   - Create section in guidelines
   - Show various hint patterns
   - Explain UX benefits
   - Provide examples
   - Document conventions

7. **Add `model` Field Documentation**
   - Create model selection section
   - Document Sonnet vs Haiku
   - Provide selection strategy matrix
   - Show cost/performance tradeoffs
   - Add optimization guidance

8. **Add Positional Arguments ($1, $2, $3)**
   - Document in arguments section
   - Show multi-argument examples
   - Compare with $ARGUMENTS
   - Provide best practices
   - Add complex example

9. **Add Bash Execution (!) Documentation**
   - Create advanced features section
   - Explain ! prefix behavior
   - Show use cases
   - Provide examples
   - Document combinations

10. **Add File Reference (@) Documentation**
    - Document in advanced features
    - Explain @ prefix behavior
    - Show use cases
    - Provide multi-file examples
    - Document limitations

### Phase 3: Enhancement & Examples (Medium Priority)

**Priority:** MEDIUM
**Effort:** 2-3 hours
**Impact:** Improves usability and understanding

11. **Create Comprehensive Examples**
    - Simple command with single argument
    - Complex command with multiple arguments
    - Command with allowed-tools restriction
    - Command with model optimization
    - Command using ! and @ features

12. **Add Frontmatter Best Practices Section**
    - When to use each field
    - Anti-patterns to avoid
    - Minimal vs full configuration
    - Decision trees for field usage

13. **Update Command Patterns**
    - Update all 5 pattern templates
    - Add frontmatter to each
    - Show argument handling
    - Include model selection

14. **Create Quick Start Guide**
    - Minimal viable command
    - 5-minute command creation
    - Progressive enhancement path
    - Common patterns cheat sheet

### Phase 4: Documentation Polish (Low Priority)

**Priority:** LOW
**Effort:** 1-2 hours
**Impact:** Improves discoverability

15. **Add Frontmatter Reference**
    - Quick reference table
    - All fields with descriptions
    - Examples for each field
    - Copy-paste snippets

16. **Enhance Troubleshooting**
    - Frontmatter parsing errors
    - Argument handling issues
    - Tool restriction problems
    - Model selection issues

17. **Add Migration Guide**
    - Converting commands without frontmatter
    - Adding arguments to existing commands
    - Optimizing with model selection
    - Progressive enhancement

18. **Cross-Reference Official Docs**
    - Link to official documentation
    - Note where we extend spec
    - Reference specific features
    - Indicate official vs custom

---

## Validation Criteria

### Template File (SLASH_COMMAND_TEMPLATE.md)

**Must Have:**
- [ ] YAML frontmatter at very top
- [ ] All four frontmatter fields documented
- [ ] $ARGUMENTS placeholder explained
- [ ] Configuration guidance section
- [ ] Complete example with frontmatter
- [ ] Instructions show argument handling

**Should Have:**
- [ ] Positional arguments mentioned
- [ ] Advanced features referenced
- [ ] Model selection guidance
- [ ] Tool restriction examples

**Verification:**
- [ ] Copy template and create actual command - should work
- [ ] YAML parses correctly
- [ ] Arguments work as documented
- [ ] Command discoverable via /help

### Guidelines File (SLASH_COMMAND_GUIDELINES.md)

**Must Have:**
- [ ] YAML frontmatter section early in doc
- [ ] All four fields comprehensively documented
- [ ] $ARGUMENTS section with examples
- [ ] Positional arguments section
- [ ] Bash execution (!) documented
- [ ] File reference (@) documented
- [ ] All examples include frontmatter

**Should Have:**
- [ ] Frontmatter best practices section
- [ ] Model selection strategy matrix
- [ ] Tool restriction patterns
- [ ] Argument handling patterns
- [ ] Advanced features combinations

**Verification:**
- [ ] All examples are valid and complete
- [ ] YAML syntax is correct throughout
- [ ] No contradictions with official docs
- [ ] Examples demonstrate all features
- [ ] Best practices are actionable

---

## Gap Summary Table

| Feature | Current State | Required State | Priority | Phase |
|---------|--------------|----------------|----------|-------|
| YAML frontmatter in template | ❌ Missing | ✅ At top of template | Critical | 1 |
| `description` field | ❌ Not documented | ✅ Required field, documented | Critical | 1 |
| `allowed-tools` field | ❌ Not documented | ✅ Optional field, documented | High | 2 |
| `argument-hint` field | ❌ Not documented | ✅ Optional field, documented | High | 2 |
| `model` field | ❌ Not documented | ✅ Optional field, documented | High | 2 |
| $ARGUMENTS placeholder | ❌ Not documented | ✅ Core feature, documented | Critical | 1 |
| Positional arguments ($1, $2) | ❌ Not documented | ✅ Core feature, documented | High | 2 |
| Bash execution (!) | ❌ Not documented | ✅ Advanced feature, documented | High | 2 |
| File reference (@) | ❌ Not documented | ✅ Advanced feature, documented | High | 2 |
| Frontmatter in examples | ❌ Missing | ✅ All examples show frontmatter | Critical | 1 |
| File location | ✅ Correct | ✅ Keep as is | N/A | N/A |
| Namespace support | ⚠️ Basic | ✅ More examples | Medium | 3 |
| Best practices | ✅ Good | ✅ Add frontmatter practices | Medium | 3 |

---

## Risk Assessment

### Low Risk
- Adding frontmatter to examples (additive, educational)
- Documenting official features (alignment, no breaking changes)
- Adding best practices sections (guidance only)

### Medium Risk
- Template format change (users may have copied old version)
- Examples becoming more complex (learning curve)

### Mitigation Strategies

1. **Template Format Change**
   - Clear changelog documentation
   - Show migration from old to new format
   - Provide both minimal and comprehensive versions
   - Gradual adoption path

2. **Increased Complexity**
   - Start with minimal examples
   - Progressive enhancement approach
   - Clear "when to use" guidance for each feature
   - Quick start guide for simplicity

3. **Example Validation**
   - Test every example command
   - Verify YAML parses correctly
   - Confirm arguments work as shown
   - Validate tool restrictions function

---

## Next Steps

### Immediate Actions

1. **Verify All Official Features**
   - Test $ARGUMENTS in real command
   - Test positional arguments ($1, $2, $3)
   - Test allowed-tools with patterns
   - Test model selection
   - Test ! and @ features

2. **Create Test Commands**
   - Minimal command with description only
   - Command with $ARGUMENTS
   - Command with positional args
   - Command with allowed-tools
   - Command with all features

3. **Validate Examples**
   - Copy each example from guidelines
   - Create actual command files
   - Test invocation and behavior
   - Verify all features work as documented

### Approval Needed

- **Template Structure:** Replace current structure with frontmatter-first approach
- **Scope:** Implement all phases or just critical (Phase 1)?
- **Breaking Changes:** Communicate template changes to existing users

### Implementation Owner

- Technical writer for documentation
- Testing for command validation
- Review by Claude Code users

---

## Appendix: Official vs Custom Features

### Official Features (Documented in Claude Docs)
- `description` field (required)
- `allowed-tools` field (optional)
- `argument-hint` field (optional)
- `model` field (optional)
- $ARGUMENTS placeholder
- Positional arguments ($1, $2, $3, etc.)
- Bash execution with ! prefix
- File reference with @ prefix
- File locations: `.claude/commands/` (project) or `~/.claude/commands/` (user)
- Namespace support via directory structure
- Priority system (project > user)

### Custom Extensions (Our Additions)
- Comprehensive template structure (Objective, Context, Prerequisites, Phases, etc.)
- Phase-based workflow approach
- Quality standards section
- Constraints & boundaries section
- Related commands section
- Multiple template variations (Minimal, Standard, Comprehensive)
- Command patterns (Analysis, Generation, Workflow, Review, Troubleshooting)
- Extensive best practices
- Organization strategies

### Status Legend
- ✅ Confirmed official (from Claude Docs)
- ⚠️ Custom extension (explicitly our addition)
- ❌ Missing from our current templates

---

## Comparison: Before vs After

### Before (Current Template)
```markdown
# [Command Name]

[One-line description of what this command does and when to use it]

## Objective
[Clear, specific statement of what should be accomplished]

## Context & Prerequisites
...
```

**Issues:**
- No frontmatter at all
- No argument handling
- Not executable without modification
- Missing official features

### After (Proposed Template)
```markdown
---
description: [Brief one-line description for /help]
allowed-tools: [Optional: Bash(command:pattern), Bash(command:pattern)]
argument-hint: [Optional: [arg1] [arg2] [arg3]]
model: [Optional: claude-3-5-sonnet-20241022 or claude-3-5-haiku-20241022]
---

# [Command Name]

[One-line description of what this command does and when to use it]

## Configuration
[Guidance on frontmatter fields and arguments]

## Instructions

### Argument Handling
- `$ARGUMENTS`: [What it captures]
- OR `$1`, `$2`, `$3`: [Positional arguments]

### Phase 1: [Phase Name]
[Instructions that may use $ARGUMENTS or $1, $2, $3]
...
```

**Improvements:**
- ✅ Official YAML frontmatter
- ✅ All official fields documented
- ✅ Argument handling integrated
- ✅ Configuration guidance
- ✅ Immediately executable
- ✅ Aligned with official docs
- ✅ Maintains our comprehensive structure

---

**Analysis Version:** 1.0
**Next Review:** After Phase 1 implementation
**Owner:** Platform Engineering

