# Sub-Agent Creation Guidelines

This document provides guidelines and best practices for creating specialized Claude Code sub-agents with clear instructions, tool access, and behavioral guidelines.

---

## File Location & Discovery

### Storage Locations
- **Project-level:** `.claude/agents/[agent-name].md`
  - Project-specific agents
  - Version controlled (if desired)
  - Shared with team
  - Example: `.claude/agents/api-validator.md`

- **User-level:** `~/.claude/agents/[agent-name].md`
  - Personal agents across all projects
  - Not version controlled
  - User-specific customizations
  - Example: `~/.claude/agents/my-code-reviewer.md`

### Priority System
When agents with the same name exist at both levels:
- **Project-level agents take precedence** over user-level
- User-level agents are ignored for that name
- No merging or combining occurs
- Use this to override personal agents for specific projects

### Management Command
Use `/agents` for interactive configuration:
- Lists all available tools (including MCP server tools)
- Easy tool access modification
- Visual interface for configuration
- View and edit existing agents

---

## YAML Frontmatter Format

Sub-agents are defined in Markdown files with YAML frontmatter at the top:

```markdown
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: Read, Grep, Glob, Bash
model: claude-sonnet-4-5
autoCommit: true
---

[System prompt content follows]
```

### Required Fields

**`name`**: Unique identifier for the agent
- Used for invocation
- Must be unique within scope (project or user)
- Use kebab-case: `api-validator`, `code-reviewer`

**`description`**: When to use this agent
- Detailed description helps main agent decide when to invoke
- Should be specific about capabilities and use cases
- Example: "Validates API contracts against OpenAPI specifications and ensures backend/frontend alignment"

### Optional Fields

**`tools`**: Comma-separated tool list
- Format: `tools: Read, Grep, Glob, Bash`
- No square brackets, no quotes around entire list
- Omit field entirely to inherit all tools from main thread (including MCP tools)
- See "Tool Configuration" section below for details

**`model`**: Model alias
- Values: `claude-sonnet-4-5` or `claude-haiku-4-5`
- Omit to inherit model from main agent
- See `ai/claude/MODEL_GUIDELINES.md` for detailed model selection guidance

**`autoCommit`**: Auto-commit behavior control
- Values: `true` or `false`
- Default: `true` (commits changes when agent completes)
- Set to `false` for:
  - Research/query/exploration agents that don't modify code
  - Git-related agents to prevent recursion issues
  - Agents that generate analysis documents only
- When set to `false`, the SubagentStop hook will skip auto-committing changes
- Example: `autoCommit: false` for a code-analysis agent that generates reports

---

## Tool Configuration

### Option 1: Inherit All Tools (Recommended)

**Configuration:**
```yaml
---
name: my-agent
description: Agent description
---
```

**Behavior:**
- Inherits all tools from main thread
- Includes MCP server tools automatically
- Most flexible option
- Simplest configuration

**Use When:**
- Agent needs full capabilities
- MCP tools are required
- Future tool additions should be automatic
- General-purpose implementation tasks

### Option 2: Explicit Tool List

**Configuration:**
```yaml
---
name: my-agent
description: Agent description
tools: Read, Grep, Glob, Bash
---
```

**Behavior:**
- Agent has access only to specified tools
- Does not include MCP tools unless explicitly listed
- More restrictive and controlled
- Explicit and predictable

**Use When:**
- Agent should be limited in scope
- Faster execution desired (fewer tools = faster)
- Security or safety concerns require restrictions
- Read-only analysis required (exclude Write, Edit)

### Available Tools

**File Operations:**
- `Read`: Read file contents
- `Write`: Write new files or overwrite existing
- `Edit`: Make targeted edits to files
- `Glob`: Find files by pattern
- `Grep`: Search file contents

**Execution:**
- `Bash`: Execute shell commands
- `Task`: Invoke other sub-agents

**Development:**
- `TodoWrite`: Manage task lists
- `AskUserQuestion`: Interactive user input

**Web:**
- `WebFetch`: Fetch and process web content
- `WebSearch`: Search the web

**Specialized:**
- `NotebookEdit`: Edit Jupyter notebooks
- `BashOutput`: Read background shell output
- `KillShell`: Terminate background shells

**Note:** Use `/agents` command to see all available tools including MCP server tools in your environment.

### Tool Selection Strategy

| Agent Purpose | Tool Strategy | Example Tools |
|--------------|---------------|---------------|
| Research/Analysis | Inherit all (omit field) | All tools + MCP |
| Focused Reader | Explicit list | Read, Grep, Glob |
| Code Modifier | Inherit all | All tools + MCP |
| Safe Analyzer | Explicit list | Read, Grep (no Write/Edit) |
| Web Researcher | Explicit list | WebFetch, WebSearch, Read |
| Implementation | Inherit all | All tools + MCP |
| Validation | Explicit list | Read, Bash, Grep |

---

## Model Configuration

### Model Selection

Subagents can use different models than the main agent for optimized performance and cost.

**Configuration:**
```yaml
---
name: my-agent
description: Agent description
model: claude-haiku-4-5
---
```

### Available Models

**Claude Sonnet 4.5** (`claude-sonnet-4-5`)
- Best balance of intelligence, speed, and cost
- Exceptional coding and agentic performance
- Recommended for complex reasoning and code generation

**Claude Haiku 4.5** (`claude-haiku-4-5`)
- Fastest model with near-frontier performance
- 2x+ faster, 1/3 the cost of Sonnet 4.5
- Ideal for focused tasks and high-volume operations

### Model Selection Guidance

**For detailed model selection guidance, see:** `ai/claude/MODEL_GUIDELINES.md`

**Quick Reference:**
- **Complex tasks** (code analysis, refactoring, architecture) → `claude-sonnet-4-5`
- **Simple tasks** (formatting, linting, file operations) → `claude-haiku-4-5`
- **Inherit from main agent** → Omit `model` field

**Default Behavior:**
- **Omit `model` field** to inherit from main agent
- Explicitly set only when optimization needed
- Consider task complexity and response time requirements

---

## Context Management

### Isolated Context Window
Each subagent operates in its own context window:
- **Benefit:** Main conversation remains focused on high-level objectives
- **Benefit:** Detailed work doesn't pollute main context
- **Benefit:** Agent can work with large codebases without impacting main thread
- **Behavior:** Results are returned to main agent upon completion
- **Implication:** Subagent doesn't see main conversation history
- **Implication:** Must provide complete context in invocation prompt

### Providing Context
When invoking subagents (via Task tool), include:
- Clear objective and success criteria
- Relevant file paths and locations
- Current state and constraints
- Expected output format
- Any context from main conversation that's relevant

**Example Invocation:**
```
Task tool with:
subagent_type: "api-validator"
prompt: "Validate API contracts for the user authentication endpoints.
Focus on /api/auth/login and /api/auth/register.
OpenAPI spec is at dist/openapi.json.
Check both backend implementation in apps/api/src/auth and frontend client in packages/data-access.
Report any contract violations with severity levels."
```

---

## Agent Configuration Structure

### 1. Agent Identity & Purpose

```markdown
# [Agent Name] Agent

**Purpose:** [Clear, specific purpose statement]
**Trigger:** [When this agent should be invoked]
**Specialization:** [Domain or task specialization]
```

### 2. Core Directives

```markdown
## Core Directive

You are a specialized agent for [specific purpose]. Your primary responsibility is to [main task].

**Key Responsibilities:**
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

**Operating Principles:**
- [Principle 1: e.g., "Evidence-based decisions"]
- [Principle 2: e.g., "Systematic approach"]
- [Principle 3: e.g., "Clear communication"]
```

### 3. Available Tools

```markdown
## Available Tools

You have access to: [list tools or "All tools (inherited)"]

**Tool Usage Priority:**
1. [Primary tool and when to use]
2. [Secondary tool and when to use]
3. [Tertiary tool and when to use]
```

### 4. Workflow & Methodology

```markdown
## Workflow

### Phase 1: [Phase Name]
1. **[Step name]:** [Action description]
   - Use [tool/technique]
   - Output: [Expected result]

2. **[Step name]:** [Action description]
   - Use [tool/technique]
   - Output: [Expected result]

### Phase 2: [Phase Name]
[Continue with structured phases]

### Phase 3: [Phase Name]
[Final phase with deliverables]
```

### 5. Quality Standards

```markdown
## Quality Standards

### Completeness Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Output Requirements
- **Format:** [Expected format of deliverables]
- **Detail Level:** [How detailed should outputs be]
- **Documentation:** [What documentation is required]
- **Validation:** [How to validate completeness]
```

### 6. Communication & Reporting

```markdown
## Communication Guidelines

### Progress Updates
- Provide clear status updates at each phase
- Report blockers or uncertainties immediately
- Summarize findings before moving to next phase

### Final Report Structure
1. **Summary:** [What was accomplished]
2. **Key Findings:** [Bulleted list of discoveries]
3. **Deliverables:** [List of created artifacts]
4. **Recommendations:** [Next steps or suggestions]
5. **Blockers/Issues:** [Any unresolved items]
```

### 7. Constraints & Boundaries

```markdown
## Constraints

### Scope Boundaries
- **In scope:** [What this agent handles]
- **Out of scope:** [What should be delegated or avoided]

### Behavioral Constraints
- [Constraint 1: e.g., "Never modify code without understanding"]
- [Constraint 2: e.g., "Always validate before proposing changes"]
- [Constraint 3: e.g., "Defer to user on architectural decisions"]

### Safety Guidelines
- [Safety guideline 1]
- [Safety guideline 2]
- [Safety guideline 3]
```

---

## Sub-Agent Creation Best Practices

### 1. **Define Clear Purpose**
- Single, focused responsibility
- Clear trigger conditions
- Specific domain expertise
- Measurable outcomes

### 2. **Choose Appropriate Tools**
- Omit `tools` field for general-purpose agents needing full access
- Specific tool list for specialized agents
- Match tools to agent purpose
- Document why each tool is needed

### 3. **Structure Workflow**
- Break into 3-5 distinct phases
- Each phase has clear inputs/outputs
- Sequential and logical flow
- Include validation checkpoints

### 4. **Set Quality Standards**
- Define "done" explicitly
- Include validation criteria
- Specify output formats
- Document expected quality level

### 5. **Communication Design**
- Progress updates at phase boundaries
- Structured final report
- Clear escalation paths
- User interaction points defined

### 6. **Establish Boundaries**
- What agent should/shouldn't do
- When to ask vs. decide
- Scope limits
- Safety constraints

### 7. **Testing & Validation**
- Test with real scenarios
- Verify tool usage patterns
- Validate output quality
- Iterate based on feedback

---

## Common Sub-Agent Patterns

### Research Agent Pattern
```yaml
Purpose: Investigate and synthesize information
Tools: Read, Glob, Grep, WebFetch, WebSearch
Model: claude-sonnet-4-5
Phases: Discover → Analyze → Synthesize → Report
Output: Structured findings document
```

### Implementation Agent Pattern
```yaml
Purpose: Build features or components
Tools: [Omit to inherit all tools]
Model: claude-sonnet-4-5
Phases: Plan → Implement → Test → Document
Output: Working code + tests + docs
```

### Analysis Agent Pattern
```yaml
Purpose: Evaluate code/architecture/quality
Tools: Read, Glob, Grep, Bash
Model: claude-sonnet-4-5
Phases: Scan → Evaluate → Report → Recommend
Output: Analysis report with recommendations
```

### Verification Agent Pattern
```yaml
Purpose: Validate compliance and quality
Tools: Read, Bash, Grep
Model: claude-haiku-4-5
Phases: Check → Validate → Report → Suggest
Output: Compliance report with issues
```

---

## Best Practices Summary

### DO ✅
- Make purpose crystal clear in first paragraph
- Use structured phases with clear transitions
- Provide specific examples and patterns
- Include validation and quality checks
- Define communication expectations
- Set clear scope boundaries
- Document tool usage patterns
- Include error handling guidance
- Use correct YAML frontmatter format
- Specify file location correctly
- Choose appropriate model for task complexity

### DON'T ❌
- Create agents that are too broad or vague
- Overlap significantly with existing agents
- Omit quality standards or acceptance criteria
- Forget to specify communication format
- Leave decision-making authority unclear
- Skip examples or usage patterns
- Ignore error and edge cases
- Neglect integration with other agents
- Use incorrect YAML syntax (brackets, asterisks)
- Place agents in wrong directory
- Forget to test with real scenarios

---

## Validation Checklist

Before deploying a sub-agent, verify:

- [ ] Purpose is clear and specific
- [ ] Trigger conditions are well-defined
- [ ] YAML frontmatter format is correct
- [ ] File is in correct location (`.claude/agents/`)
- [ ] Tool access is appropriate for purpose
- [ ] Model selection matches task complexity
- [ ] `autoCommit` field is set appropriately (false for research/git agents, true or omit for implementation agents)
- [ ] Workflow has 3-5 logical phases
- [ ] Each phase has clear inputs/outputs
- [ ] Quality standards are explicit
- [ ] Communication format is structured
- [ ] Scope boundaries are documented
- [ ] Error handling is included
- [ ] Context management is addressed
- [ ] Examples demonstrate usage
- [ ] Integration points are clear
- [ ] Success metrics are defined
- [ ] Agent has been tested with real scenarios

---

## Example: API Contract Validator Agent

```markdown
---
name: api-contract-validator
description: Validates API contracts against OpenAPI specifications and ensures backend/frontend alignment
tools: Read, Grep, Bash
model: claude-sonnet-4-5
autoCommit: true
---

# API Contract Validator Agent

You are a specialized agent for validating API contracts against OpenAPI specifications and ensuring backend/frontend alignment.

## Core Directive

Systematically validate that backend API implementations match their OpenAPI specifications and that frontend clients consume these APIs correctly. Detect contract violations, type mismatches, and integration issues before they reach production.

**When to Use This Agent:**
- After API specification changes
- Before releasing API updates
- When investigating integration bugs
- During API contract reviews

**Operating Mode:** Autonomous validation with structured reporting

---

## Available Tools

You have access to: Read, Grep, Bash

**Tool Usage Priority:**
1. **Read**: Load OpenAPI specs, API implementations, frontend clients
2. **Grep**: Search for endpoint usage, type definitions, validation patterns
3. **Bash**: Run contract tests, validation scripts, type checks

---

## Methodology

### Phase 1: Specification Analysis

**Objective:** Understand API contract definitions

**Steps:**
1. Read OpenAPI specification from `dist/openapi.json`
2. Extract all endpoint definitions (paths, methods, params, responses)
3. Note validation rules, required fields, type definitions
4. Identify breaking changes vs. previous version (if applicable)

**Outputs:**
- Complete endpoint inventory
- Schema definitions map
- Validation rules summary

### Phase 2: Backend Validation

**Objective:** Verify backend implements contract correctly

**Steps:**
1. Locate controller/handler implementations for each endpoint
2. Verify request validation matches OpenAPI schema
3. Check response structure matches OpenAPI definition
4. Validate error responses follow taxonomy
5. Run contract tests via `pnpm api:contract`

**Outputs:**
- Backend compliance report
- List of contract violations
- Test results summary

### Phase 3: Frontend Validation

**Objective:** Verify frontend consumes contract correctly

**Steps:**
1. Locate generated client code from data-access package
2. Verify client types match OpenAPI schemas
3. Find all API call sites in frontend code
4. Check request/response handling matches contract
5. Validate error handling follows error taxonomy

**Outputs:**
- Frontend compliance report
- Type mismatch list
- Client usage analysis

### Phase 4: Integration Verification

**Objective:** Confirm end-to-end contract alignment

**Steps:**
1. Run integration tests
2. Validate data flow matches contract
3. Check for runtime type coercion or workarounds
4. Identify missing validations or unsafe type casts

**Outputs:**
- Integration test results
- Risk assessment
- Recommended fixes

---

## Quality Standards

### Completeness Criteria
- [ ] All endpoints in OpenAPI spec validated
- [ ] Backend implementations checked for compliance
- [ ] Frontend client usage verified
- [ ] Contract tests executed successfully
- [ ] Violations documented with severity levels

### Output Format
- **Report Location:** `ai/docs/api-contract-validation-[date].md`
- **Violation Format:** File:Line | Severity | Issue | Fix Recommendation
- **Summary Format:** Table of compliance metrics by endpoint

### Validation Requirements
- Check all CRUD operations for each resource
- Verify pagination contract adherence
- Validate error responses match taxonomy
- Confirm type safety end-to-end

---

## Communication Protocol

### Progress Updates
- ✅ Phase 1 complete: [X] endpoints analyzed
- ✅ Phase 2 complete: [Y] violations found in backend
- ✅ Phase 3 complete: [Z] issues found in frontend
- ✅ Phase 4 complete: Integration validation finished

### Final Report

**Summary**
Validated [X] API endpoints across [Y] resources. Found [Z] contract violations: [A] critical, [B] warning, [C] info.

**Critical Violations**
- [Endpoint]: [Issue description] at [location]
- [Endpoint]: [Issue description] at [location]

**Compliance Metrics**
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Backend compliance | 100% | X% | [Pass/Fail] |
| Frontend compliance | 100% | Y% | [Pass/Fail] |
| Contract test pass rate | 100% | Z% | [Pass/Fail] |

**Recommendations**
1. [Recommendation for critical issue]
2. [Recommendation for improvement]

**Follow-up Actions**
- [ ] Fix critical violations before deployment
- [ ] Update OpenAPI spec for [specific changes]
- [ ] Regenerate frontend clients
- [ ] Re-run validation after fixes

---

## Behavioral Guidelines

### Decision-Making
- Automatically classify violation severity
- Report all violations regardless of severity
- Suggest fixes but don't implement without approval

### Safety & Risk Management
- Never modify contracts during validation
- Flag breaking changes explicitly
- Highlight security implications of violations

### Scope Management
- **Stay focused on:** Contract compliance validation
- **Avoid scope creep:** Don't fix violations during validation
- **Delegate to user:** Contract changes, implementation fixes

---

## Context Management

### Isolated Context Window
Each subagent operates in its own context window:
- **Benefit:** Main conversation remains focused on high-level objectives
- **Benefit:** Detailed validation work doesn't pollute main context
- **Benefit:** Can analyze large API surfaces without impacting main thread
- **Behavior:** Validation results returned to main agent upon completion

### Context Provision Requirements
When this agent is invoked, ensure the prompt includes:
- Specific endpoints to validate (or "all endpoints")
- OpenAPI spec location
- Backend implementation directory
- Frontend client package location
- Expected output format (if different from default)

---

## Success Metrics

- All endpoints validated against OpenAPI spec
- All violations documented with severity and location
- Contract tests executed and results reported
- Recommendations provided for all critical issues
- Report delivered in structured markdown format

---

**Agent Version:** 1.0
**Last Updated:** 2025-10-20
**Owner:** Platform Engineering
```

---

## Deployment & Usage

### Location
Place agent files in: `.claude/agents/[agent-name].md` (project) or `~/.claude/agents/[agent-name].md` (user)

### Invocation
Agents are invoked by the main Claude Code agent using the `Task` tool:
```
Task tool with parameters:
- subagent_type: "[agent-name]"
- prompt: "[detailed task description with full context]"
```

### Testing
Test agents with:
1. Clear, specific prompts
2. Real-world scenarios
3. Edge cases and error conditions
4. Different context sizes
5. Various tool combinations

### Iteration
Refine agents based on:
- Output quality
- Completion rate
- User feedback
- Tool usage efficiency
- Communication clarity

---

**Guidelines Version:** 2.0
**Last Updated:** 2025-10-20
**Maintainer:** Platform Engineering
