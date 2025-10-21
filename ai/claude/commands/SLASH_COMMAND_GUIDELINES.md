# Slash Command Creation Guidelines

This document provides guidelines and best practices for creating custom Claude Code slash commands with clear instructions, context, and execution guidelines.

---

## Slash Command Basics

### What are Slash Commands?
Slash commands are custom shortcuts that expand into detailed prompts when invoked. They allow you to:
- Encapsulate complex, reusable workflows
- Standardize common development tasks
- Provide context-specific instructions
- Save time on repetitive operations

### Command Storage
- **Location:** `.claude/commands/[command-name].md`
- **Format:** Markdown files containing the expanded prompt
- **Invocation:** Type `/[command-name]` in Claude Code chat
- **Scope:** Project-level (gitignored) or global (user config)

### Command Naming Conventions
- Use descriptive, action-oriented names: `/analyze-api`, `/generate-tests`, `/review-pr`
- Use hyphens for multi-word commands: `/create-component`, `/update-docs`
- Prefix related commands: `/git-commit`, `/git-rebase`, `/git-squash`
- Keep names concise but clear: prefer `/test` over `/run-all-tests-with-coverage`

---

## Template Variations

### Minimal Command Template

For simple, straightforward commands:

```markdown
[Clear, specific instruction of what to do]

[Optional: Additional context or constraints]
```

**Example:**
```markdown
---
description: Format all code in the project following project standards
allowed-tools: Bash(pnpm format:*), Bash(pnpm lint:*)
---

# /format
Format all code in the project following project standards.
Run: `pnpm format`
Verify: `pnpm lint` passes without errors.
```

### Standard Command Template

For moderate complexity commands (see SLASH_COMMAND_TEMPLATE.md for full structure):

```markdown
# [Command Name]

[One-line description of what this command does]

## Objective
[Clear statement of the goal or outcome]

## Context
[Any relevant context, constraints, or prerequisites]

## Instructions
1. [Step-by-step instructions if needed]
2. [Or a single comprehensive instruction]
3. [With clear expectations]

## Output Format
[How results should be structured or presented]

## Constraints
- [Constraint 1]
- [Constraint 2]
```

**Example:**
```markdown
---
description: Create a conventional commit following project standards
argument-hint: [message]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*)
---

# /commit
Create a conventional commit following project standards.

1. Run `git status` to review changes
2. Run `git diff` to verify changes
3. Create commit with format: `[type]([scope]): [description]`
   - Types: feat, fix, docs, style, refactor, test, chore
4. Include Co-Authored-By line if pair programming
5. Run `git commit` with generated message
```

### Comprehensive Command Template

For complex, multi-phase workflows (use the full template in SLASH_COMMAND_TEMPLATE.md)

---

## Command Creation Guidelines

### 1. **Define Clear Purpose**
- Single, focused objective
- Specific trigger/use case
- Measurable outcome
- Clear value proposition

### 2. **Provide Sufficient Context**
- Project-specific information
- Technology stack details
- Architectural constraints
- Current state assumptions

### 3. **Write Actionable Instructions**
- Use imperative mood: "Analyze", "Generate", "Review"
- Be specific about tools to use
- Include validation steps
- Define success criteria

### 4. **Specify Output Format**
- Where to save results
- File format and structure
- Naming conventions
- Documentation requirements

### 5. **Set Boundaries**
- What's in scope
- What's out of scope
- Safety constraints
- When to ask for clarification

### 6. **Include Examples**
- Sample inputs
- Expected outputs
- Common scenarios
- Edge cases

---

## Command Patterns

### 1. Analysis Command Pattern

```markdown
# Analyze [Target]

Perform comprehensive analysis of [target] and provide structured findings.

## Objective
Analyze [target] for [specific aspects] and deliver actionable recommendations.

## Instructions
1. **Discovery**: Scan [target] using [tools/methods]
2. **Analysis**: Evaluate against [criteria]
3. **Synthesis**: Summarize findings with severity levels
4. **Recommendations**: Provide prioritized action items

## Output Format
Create `ai/docs/analysis-[target]-[date].md` with:
- Executive summary
- Detailed findings (Critical/Warning/Info)
- Recommendations with priority
- Next steps

## Constraints
- Focus only on [specific scope]
- Use [specific tools or methods]
- Do not modify code during analysis
```

### 2. Generation Command Pattern

```markdown
# Generate [Artifact]

Generate [artifact] following [standard/pattern].

## Objective
Create production-ready [artifact] that meets [requirements].

## Context
- Follow patterns in [reference location]
- Use [technology/framework]
- Align with [standard/convention]

## Instructions
1. Analyze existing [similar artifacts] for patterns
2. Generate [artifact] with:
   - [Required element 1]
   - [Required element 2]
   - [Required element 3]
3. Validate against [criteria]
4. Create documentation in [location]

## Output Format
- Main artifact: [location and filename]
- Tests: [location and coverage requirement]
- Documentation: [location and format]

## Quality Standards
- [Standard 1]: [Validation method]
- [Standard 2]: [Validation method]
- All tests passing with [coverage threshold]
```

### 3. Workflow Command Pattern

```markdown
# [Workflow Name]

Execute [workflow name] following [process/standard].

## Objective
Complete [workflow] from [start state] to [end state].

## Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]

## Instructions

### Step 1: [Step Name]
[Detailed instructions]
**Validation**: [How to verify this step]

### Step 2: [Step Name]
[Detailed instructions]
**Validation**: [How to verify this step]

### Step 3: [Step Name]
[Detailed instructions]
**Validation**: [How to verify this step]

## Completion Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Rollback
If issues occur:
1. [Rollback step 1]
2. [Rollback step 2]
```

### 4. Review Command Pattern

```markdown
# Review [Target]

Review [target] for [aspects] and provide feedback.

## Objective
Evaluate [target] against [standards/requirements].

## Review Criteria

### [Category 1]
- [Criterion 1]
- [Criterion 2]

### [Category 2]
- [Criterion 1]
- [Criterion 2]

## Instructions
1. Read and understand [target]
2. Evaluate against each criterion
3. Document findings with:
   - Issue description
   - Severity (Critical/Major/Minor)
   - Location (file:line)
   - Recommendation
4. Summarize overall assessment

## Output Format
Create review report with:
- Overall score/assessment
- Findings by category and severity
- Required changes (blocking)
- Suggested improvements (non-blocking)
- Positive observations

## Standards
Follow [coding standards/best practices] from [location].
```

### 5. Troubleshooting Command Pattern

```markdown
# Troubleshoot [Issue Type]

Diagnose and resolve [issue type] systematically.

## Objective
Identify root cause of [issue] and implement fix.

## Diagnostic Process

### Phase 1: Information Gathering
- Reproduce issue
- Collect error messages
- Review recent changes
- Check logs and metrics

### Phase 2: Hypothesis Formation
- List possible causes
- Rank by probability
- Identify tests to validate

### Phase 3: Testing & Resolution
- Test hypotheses systematically
- Implement fix for confirmed cause
- Verify fix resolves issue
- Add regression test

## Output Format
Create troubleshooting report:
1. **Issue Description**: [What, when, where]
2. **Symptoms**: [Observable effects]
3. **Root Cause**: [Why it happened]
4. **Resolution**: [What was fixed]
5. **Prevention**: [How to avoid in future]
6. **Artifacts**: [Commits, tests added]

## Constraints
- Do not make changes without understanding root cause
- Always add tests to prevent regression
- Document findings for knowledge sharing
```

---

## Complete Example Commands

### Example 1: API Contract Validation

```markdown
# Validate API Contract

Validate API implementation against OpenAPI specification and ensure backend/frontend alignment.

## Objective
Ensure API endpoints match their OpenAPI contracts and that frontend clients consume these APIs correctly.

## Context
- OpenAPI spec located at: `dist/openapi.json`
- Backend implementation: `apps/api/src/`
- Frontend data-access: `packages/data-access/`
- Contract tests: `apps/api/test/contract/`

## Instructions

### Phase 1: Specification Analysis
1. Read OpenAPI spec from `dist/openapi.json`
2. Extract all endpoint definitions (paths, methods, parameters, responses)
3. Note validation rules and required fields
4. Identify any breaking changes vs. previous version

### Phase 2: Backend Validation
1. Locate controller implementations for each endpoint
2. Verify request validation matches OpenAPI schema
3. Check response structures match definitions
4. Validate error responses follow taxonomy
5. Run contract tests: `pnpm api:contract`

### Phase 3: Frontend Validation
1. Check generated clients in data-access package
2. Verify client types match OpenAPI schemas
3. Find all API call sites in frontend
4. Validate error handling follows patterns

### Phase 4: Report Findings
Create validation report with:
- Compliance metrics (% endpoints validated)
- List of violations (Critical/Warning/Info)
- Specific file:line references
- Recommended fixes

## Output Format
Create `ai/docs/api-contract-validation-[date].md` with:

```markdown
# API Contract Validation Report

## Summary
- Total endpoints: [X]
- Validated: [Y]
- Violations: [Z]

## Critical Violations
- [Endpoint]: [Issue] at [location]

## Warnings
- [Endpoint]: [Issue] at [location]

## Recommendations
1. [Fix recommendation]
2. [Improvement suggestion]
```

## Constraints
- Do not modify contracts or implementations during validation
- Report all violations regardless of severity
- Provide specific locations (file:line) for each issue
- Include examples of correct patterns in recommendations
```

### Example 2: Component Generation

```markdown
# Generate React Component

Generate a production-ready React component following project patterns and standards.

## Objective
Create a new React component with TypeScript, Storybook stories, and tests.

## Context
- Project uses: React 18, TypeScript, Vite, TanStack Query
- UI library: `@starter/ui` (Shadcn-based)
- Component location: `src/components/[category]/`
- Storybook: CSF3 format with controls
- Tests: Vitest + Testing Library

## Prerequisites
Before generating component:
1. Component name and category decided
2. Props interface defined
3. Similar components reviewed for patterns

## Instructions

### Step 1: Analyze Existing Patterns
1. Search for similar components: `pnpm grep "export.*Component" --type ts`
2. Review 2-3 examples for:
   - File structure
   - Props pattern
   - Export style
   - Documentation approach

### Step 2: Generate Component Files
Create three files in `src/components/[category]/[ComponentName]/`:

1. **Component implementation** (`[ComponentName].tsx`):
   - TypeScript interface for props
   - Functional component with proper typing
   - JSDoc documentation
   - Proper exports

2. **Storybook story** (`[ComponentName].stories.tsx`):
   - Default export with meta
   - Primary story with controls
   - Additional stories for variants/states
   - Accessibility checks enabled

3. **Test file** (`[ComponentName].test.tsx`):
   - Render test
   - Props variation tests
   - Interaction tests
   - Accessibility tests

### Step 3: Validate Component
1. Run type check: `pnpm typecheck`
2. Run tests: `pnpm test [ComponentName]`
3. View in Storybook: `pnpm storybook`
4. Check accessibility: Verify axe checks pass

### Step 4: Documentation
Add component to component index:
- Export from category index
- Add to Storybook navigation
- Document in `/docs/components/` if public API

## Output Format

**Files Created:**
- `src/components/[category]/[ComponentName]/[ComponentName].tsx`
- `src/components/[category]/[ComponentName]/[ComponentName].stories.tsx`
- `src/components/[category]/[ComponentName]/[ComponentName].test.tsx`
- `src/components/[category]/index.ts` (updated)

**Validation Results:**
- Type check: [PASS/FAIL]
- Tests: [PASS/FAIL] - [X]% coverage
- Storybook: [Builds successfully]
- Accessibility: [No violations]

## Quality Standards
- TypeScript strict mode compliance
- Test coverage ≥ 85%
- No accessibility violations
- Storybook renders all variants
- Props documented with JSDoc
- Follows project naming conventions

## Constraints
- Import UI primitives from `@starter/ui` only
- No direct imports from Radix/Shadcn
- Follow existing component patterns exactly
- Include all three files (component, story, test)
- Do not commit generated files without user approval

## Related Commands
- `/analyze-components`: Review existing component patterns
- `/test`: Run tests with coverage report
- `/document`: Generate component documentation
```

### Example 3: Test Generation

```markdown
# Generate Tests

Generate comprehensive tests for existing code following project standards.

## Objective
Create thorough test coverage for [target] with unit, integration, and edge case tests.

## Context
- Test framework: Vitest (unit) + Playwright (e2e)
- Coverage target: ≥85% statements/branches
- Test location: `__tests__` or `.test.ts` co-located
- Mocking: MSW for API, vi.mock for modules

## Instructions

### Step 1: Analyze Code Under Test
1. Read target file(s) thoroughly
2. Identify:
   - Public API surface
   - Dependencies and side effects
   - Error conditions
   - Edge cases
   - Complex logic paths
3. Review existing test patterns: `find . -name "*.test.ts" | head -5`

### Step 2: Generate Test Suite
Create test file with:

1. **Setup & Imports**
   - Import code under test
   - Import testing utilities
   - Setup mocks and fixtures

2. **Test Structure**
   ```typescript
   describe('[Component/Function Name]', () => {
     describe('[Feature/Method]', () => {
       it('should [expected behavior]', () => {
         // Arrange
         // Act
         // Assert
       })
     })
   })
   ```

3. **Test Categories**
   - **Happy path**: Normal operation with valid inputs
   - **Edge cases**: Boundary values, empty states, nulls
   - **Error handling**: Invalid inputs, exceptions, failures
   - **Integration**: Interaction with dependencies
   - **Accessibility**: A11y compliance (for UI components)

### Step 3: Generate Specific Tests
For each public method/component:
- Test successful execution with typical inputs
- Test error handling with invalid inputs
- Test edge cases (empty, null, undefined, max values)
- Test side effects (API calls, state changes)
- Test async behavior (loading, success, error states)

### Step 4: Run and Validate
1. Run tests: `pnpm test [file]`
2. Check coverage: `pnpm test:coverage [file]`
3. Verify all tests pass
4. Confirm coverage meets ≥85% threshold
5. Review test quality (no brittle tests, good assertions)

## Output Format

**Test File:** `[target-name].test.ts`

**Test Coverage Report:**
```
File: [filename]
Statements: [X]%
Branches: [Y]%
Functions: [Z]%
Lines: [W]%
```

**Test Summary:**
- Total tests: [X]
- Passing: [Y]
- Coverage: [Z]%
- Key scenarios covered:
  - [Scenario 1]
  - [Scenario 2]
  - [Scenario 3]

## Quality Standards
- Follow Arrange-Act-Assert pattern
- Use descriptive test names: `should [behavior] when [condition]`
- One assertion focus per test (exceptions allowed)
- Mock external dependencies appropriately
- No hardcoded values (use factories/fixtures)
- Include both positive and negative test cases
- Test error messages, not just that errors throw

## Constraints
- Do not modify code under test (unless fixing bugs found)
- Do not skip tests to achieve coverage
- Mock external services (APIs, databases)
- Use project's testing utilities
- Follow existing test patterns in codebase

## Related Commands
- `/test`: Run test suite with coverage
- `/analyze-coverage`: Analyze test coverage gaps
- `/review-tests`: Review test quality and completeness
```

---

## Best Practices

### DO ✅
- **Be Specific**: Provide clear, unambiguous instructions
- **Add Context**: Include project-specific information
- **Define Outputs**: Specify exactly what should be created
- **Set Boundaries**: Clearly state what's in/out of scope
- **Include Examples**: Show expected formats and patterns
- **Validate Quality**: Define success criteria
- **Handle Errors**: Include troubleshooting guidance
- **Document Intent**: Explain the "why" not just "what"

### DON'T ❌
- **Be Vague**: Avoid general instructions like "improve code"
- **Assume Context**: Don't rely on implicit knowledge
- **Skip Validation**: Always define how to verify success
- **Ignore Errors**: Account for failure scenarios
- **Overcomplicate**: Keep commands focused and actionable
- **Duplicate Commands**: Reuse existing commands when possible
- **Forget Examples**: Examples clarify expectations
- **Omit Output Format**: Always specify deliverables

---

## Command Organization Strategies

### By Function
```
.claude/commands/
├── analyze/
│   ├── analyze-api.md
│   ├── analyze-components.md
│   └── analyze-performance.md
├── generate/
│   ├── generate-component.md
│   ├── generate-tests.md
│   └── generate-docs.md
└── workflow/
    ├── feature-workflow.md
    ├── release-workflow.md
    └── bug-workflow.md
```

### By Domain
```
.claude/commands/
├── frontend/
│   ├── create-component.md
│   ├── add-route.md
│   └── style-check.md
├── backend/
│   ├── create-endpoint.md
│   ├── migrate-db.md
│   └── validate-contract.md
└── devops/
    ├── deploy-preview.md
    ├── run-pipeline.md
    └── analyze-logs.md
```

### By Workflow
```
.claude/commands/
├── git/
│   ├── git-commit.md
│   ├── git-pr.md
│   └── git-rebase.md
├── testing/
│   ├── test-unit.md
│   ├── test-e2e.md
│   └── test-contract.md
└── quality/
    ├── lint-fix.md
    ├── format-code.md
    └── security-scan.md
```

---

## Testing Your Commands

### Manual Testing
1. Create command file in `.claude/commands/`
2. Invoke with `/[command-name]` in Claude Code
3. Verify prompt expands correctly
4. Check if instructions are clear
5. Validate outputs meet expectations
6. Iterate based on results

### Testing Checklist
- [ ] Command name is descriptive and intuitive
- [ ] Prompt expands to clear instructions
- [ ] Context is sufficient for execution
- [ ] Output format is well-defined
- [ ] Quality standards are measurable
- [ ] Constraints prevent common mistakes
- [ ] Examples clarify expectations
- [ ] Related commands are documented
- [ ] Command produces expected results
- [ ] Instructions are unambiguous

---

## Command Metadata (Frontmatter)

All slash commands should include YAML frontmatter for metadata. This enables command discovery, tool restrictions, and model selection:

```markdown
---
description: Brief description shown in command palette
argument-hint: [optional arguments]
allowed-tools: Tool1, Tool2
model: claude-sonnet-4-5
disable-model-invocation: false
---

# /command-name

[Rest of command definition]
```

**Frontmatter Fields:**

- `description` (recommended): Brief description of the command (shown in command palette). If omitted, uses first line from prompt.
- `argument-hint` (optional): Arguments expected for the slash command. Example: `[message]` or `add [tagId] | remove [tagId] | list`
- `allowed-tools` (optional): Restrict which tools the command can use. Examples:
  - `Bash(git add:*)` - Only allow git add commands
  - `Read, Write, Edit` - Only allow file operations
  - If omitted, inherits from conversation
- `model` (optional): Specific model for this command (e.g., `claude-sonnet-4-5`, `claude-3-5-haiku-20241022`). If omitted, inherits from conversation.
- `disable-model-invocation` (optional): Set to `true` to prevent SlashCommand tool from calling this command. Default: `false`

---

## Integration with Sub-Agents

Commands can invoke sub-agents for complex workflows:

```markdown
# Complex Workflow Command

Execute [complex workflow] using specialized agents.

## Instructions

### Step 1: Analysis
Invoke the analysis agent:
`Task: subagent_type="analysis-agent", prompt="Analyze [target] for [criteria]"`

Wait for analysis results, then proceed.

### Step 2: Implementation
Based on analysis findings, invoke implementation agent:
`Task: subagent_type="implementation-agent", prompt="Implement [changes] following [patterns]"`

### Step 3: Validation
Invoke validation agent:
`Task: subagent_type="validation-agent", prompt="Validate [outputs] against [standards]"`

## Coordination
- Review each agent's output before proceeding
- Adjust subsequent steps based on findings
- Compile final report from all agent outputs
```

---

## Version Control & Sharing

### Project-Level Commands
- **Location**: `.claude/commands/` (gitignored by default)
- **Scope**: Project-specific workflows
- **Sharing**: Document in project README, not version controlled
- **Examples**: Project-specific build processes, deployment workflows

### Team-Level Commands
- **Location**: `.claude/commands/` (version controlled)
- **Scope**: Team-wide standards and workflows
- **Sharing**: Check into git, include in onboarding
- **Examples**: Code review standards, testing protocols

### Global Commands
- **Location**: `~/.claude/commands/` (user-level)
- **Scope**: Personal productivity commands
- **Sharing**: Share via documentation or dotfiles
- **Examples**: Personal shortcuts, general utilities

---

## Troubleshooting

### Command Not Found
- Verify file exists in `.claude/commands/`
- Check filename matches command name
- Ensure file has `.md` extension
- Restart Claude Code if needed

### Command Not Expanding
- Verify markdown syntax is correct
- Check for special characters in filename
- Ensure file is readable
- Review Claude Code logs for errors

### Unexpected Behavior
- Review command instructions for ambiguity
- Add more specific context
- Include validation steps
- Test with simpler inputs first
- Refine based on actual outputs

---

## Quick Reference Examples

### Simple Commands
```markdown
---
description: Format all code in the project following project standards
allowed-tools: Bash(pnpm format:*), Bash(pnpm lint:*)
---

# /format
Format all code in the project following project standards.
Run: `pnpm format`
Verify: `pnpm lint` passes without errors.
```

```markdown
---
description: Clean build artifacts and temporary files
allowed-tools: Bash(pnpm clean:*), Bash(git status:*)
---

# /clean
Clean build artifacts and temporary files.
Run: `pnpm clean`
Then: `git status` to verify only tracked files remain.
```

### Medium Complexity
```markdown
---
description: Create a conventional commit following project standards
argument-hint: [message]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*)
---

# /commit
Create a conventional commit following project standards.

1. Run `git status` to review changes
2. Run `git diff` to verify changes
3. Create commit with format: `[type]([scope]): [description]`
   - Types: feat, fix, docs, style, refactor, test, chore
4. Include Co-Authored-By line if pair programming
5. Run `git commit` with generated message
```

### High Complexity
```markdown
---
description: Prepare and execute release following release workflow
allowed-tools: Bash(pnpm test:*), Bash(pnpm changeset:*), Bash(git *:*)
model: claude-sonnet-4-5
---

# /release
Prepare and execute release following release workflow.

## Prerequisites
- [ ] All tests passing
- [ ] Changesets created for changes
- [ ] Documentation updated
- [ ] CHANGELOG reviewed

## Steps
1. Run full test suite: `pnpm test`
2. Generate changelog: `pnpm changeset version`
3. Review version bumps in package.json files
4. Create release commit: `git commit -m "chore: release"`
5. Create git tag: `git tag v[version]`
6. Push with tags: `git push --follow-tags`
7. Create GitHub release from tag
8. Publish packages: `pnpm changeset publish`

## Validation
- [ ] NPM packages published
- [ ] GitHub release created
- [ ] Documentation deployed
- [ ] Team notified in Slack
```

---

## Validation Checklist

Before finalizing a command, verify:

- [ ] **Purpose**: Clear, single-focus objective
- [ ] **Instructions**: Specific, actionable steps
- [ ] **Context**: Sufficient project/technical context
- [ ] **Output**: Well-defined deliverables
- [ ] **Validation**: Clear success criteria
- [ ] **Quality**: Measurable standards
- [ ] **Constraints**: Explicit boundaries
- [ ] **Examples**: Clarifying illustrations
- [ ] **Testing**: Tested with real scenarios
- [ ] **Documentation**: Usage and related commands noted

---

**Guidelines Version:** 1.0
**Last Updated:** 2025-10-20
**Maintainer:** Platform Engineering
