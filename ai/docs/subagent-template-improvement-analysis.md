# Sub-Agent Template & Guidelines Improvement Analysis

**Created:** 2025-10-20
**Purpose:** Analysis and improvement plan for SUBAGENT_TEMPLATE.md and SUBAGENT_GUIDELINES.md based on official Claude Code documentation

---

## Executive Summary

This document analyzes our current sub-agent template and guidelines against the official Claude Code documentation and identifies specific improvements to align with official specifications while maintaining our enhanced structure.

**Key Findings:**
- Our YAML metadata structure doesn't match official format
- Missing model configuration option
- Tool configuration format needs adjustment
- File location specification needs clarification
- Our template provides more comprehensive structure than official docs (strength)
- Guidelines are well-structured but need official specification alignment

**Priority Improvements:**
1. Fix YAML frontmatter format to match official specification
2. Add model configuration option
3. Clarify tool inheritance behavior
4. Update file location guidance
5. Add priority system documentation

---

## Current State Analysis

### SUBAGENT_TEMPLATE.md

**Current Metadata Format:**
```yaml
name: [agent-name]
description: [One-line description of agent purpose and when to use it]
tools: [list, of, tools, or, * for all]
proactive: [true|false]  # Whether agent should be invoked automatically
```

**Issues:**
- ❌ Uses `[list, of, tools]` format - should be comma-separated without brackets
- ❌ Uses `*` for all tools - official docs say to omit field entirely for tool inheritance
- ❌ Includes `proactive` field - not documented in official specification
- ❌ Missing `model` field option
- ❌ Metadata shown as example, not as YAML frontmatter in markdown file

**Strengths:**
- ✅ Comprehensive structured sections (Methodology, Quality Standards, Communication Protocol)
- ✅ Clear phase-based workflow approach
- ✅ Error handling guidance
- ✅ Integration and delegation sections
- ✅ Success metrics

### SUBAGENT_GUIDELINES.md

**Current Content:**
- Agent configuration structure patterns
- Creation best practices
- Common agent patterns
- Tool selection matrix
- Validation checklist
- Complete working example

**Issues:**
- ❌ Incorrect YAML format examples throughout
- ❌ Tool configuration guidance misaligned with official behavior
- ❌ Missing file location clarification (.claude/agents vs .claude-code/agents)
- ❌ No mention of model configuration
- ❌ No explanation of priority system (project vs user level)

**Strengths:**
- ✅ Excellent best practices documentation
- ✅ Multiple agent pattern examples
- ✅ Comprehensive tool selection matrix
- ✅ Strong validation checklist
- ✅ Real-world working example

---

## Official Documentation Findings

### File Location
**Official:** `.claude/agents/` (project-level) or `~/.claude/agents/` (user-level)
**Our Current:** `.claude-code/agents/` (incorrect)

**Priority System:**
- Project-level subagents (`.claude/agents/`) take precedence over user-level (`~/.claude/agents/`)

### YAML Frontmatter Format

**Official Format:**
```markdown
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3
model: sonnet
---

[System prompt content follows]
```

**Key Fields:**
- `name`: Required unique identifier
- `description`: Required detailed description of when to use the agent
- `tools`: Optional - comma-separated list (e.g., "Read, Grep, Glob, Bash")
  - Omit field entirely to inherit all tools from main thread (including MCP tools)
  - Specify individual tools for granular control
- `model`: Optional - model alias like "haiku" or "sonnet"

### Tool Configuration Behavior

**Inheritance (Recommended):**
- Omit `tools` field entirely
- Subagent inherits all tools from main thread
- Includes MCP server tools automatically
- Most flexible option

**Explicit Tools:**
- Specify as comma-separated string: `tools: Read, Grep, Glob, Bash`
- No square brackets
- No quotes around the entire list
- Provides granular control

### Management

**`/agents` Command:**
- Interactive interface for modifying tool access
- Lists all available tools including MCP server tools
- Recommended for tool configuration

### Context Management

**Key Behavior:**
- Each subagent operates in its own context window
- Prevents pollution of main conversation
- Keeps main thread focused on high-level objectives
- Subagent results are returned to main thread

---

## Gap Analysis

### Critical Gaps (Must Fix)

1. **YAML Format Mismatch**
   - Current: Shows metadata as code block example
   - Required: Show as actual YAML frontmatter in markdown
   - Impact: Users creating invalid subagent files

2. **Incorrect Tool Syntax**
   - Current: `tools: [list, of, tools, or, * for all]`
   - Required: `tools: Read, Grep, Glob` or omit field
   - Impact: Tool configuration won't work

3. **Wrong File Location**
   - Current: `.claude-code/agents/`
   - Required: `.claude/agents/` or `~/.claude/agents/`
   - Impact: Subagents won't be discovered by Claude Code

4. **Missing Model Configuration**
   - Current: No mention of model field
   - Required: Document `model: sonnet` or `model: haiku` option
   - Impact: Users can't optimize model selection per agent

### Medium Priority Gaps

5. **Undocumented Field: `proactive`**
   - Current: Template includes `proactive: [true|false]`
   - Official: Not documented in official specification
   - Impact: May not work as expected; unclear behavior

6. **Priority System Not Documented**
   - Current: No mention of project vs user level precedence
   - Required: Document priority system
   - Impact: Users don't understand override behavior

7. **Tool Inheritance Not Explained**
   - Current: `*` notation suggested for all tools
   - Required: Explain omitting field inherits all tools + MCP
   - Impact: Users miss MCP tool integration

8. **`/agents` Command Not Mentioned**
   - Current: No reference to management command
   - Required: Document `/agents` interactive interface
   - Impact: Users manually edit files instead of using interface

### Low Priority Gaps

9. **Context Window Behavior**
   - Current: Mentioned briefly
   - Enhancement: Explain isolated context benefits more clearly
   - Impact: Minor - users will still use successfully

10. **Invocation Format**
    - Current: Shows Task tool syntax
    - Enhancement: Could clarify main agent vs user invocation
    - Impact: Minor - documentation is adequate

---

## Improvement Recommendations

### SUBAGENT_TEMPLATE.md Changes

#### 1. Fix YAML Frontmatter (Critical)

**Current:**
```markdown
## Sub-Agent Metadata

```yaml
name: [agent-name]
description: [One-line description of agent purpose and when to use it]
tools: [list, of, tools, or, * for all]
proactive: [true|false]  # Whether agent should be invoked automatically
```
```

**Recommended:**
```markdown
---
name: agent-name
description: Brief description of agent purpose and when to invoke it
tools: Read, Grep, Glob, Bash
model: sonnet
---
```

**Above the YAML frontmatter, add guidance:**
```markdown
# Sub-Agent File Structure

Sub-agents are defined in Markdown files with YAML frontmatter at the top:

**File Location:** `.claude/agents/[agent-name].md` (project) or `~/.claude/agents/[agent-name].md` (user)

**YAML Configuration:**
- `name`: (Required) Unique identifier for the agent
- `description`: (Required) When to use this agent
- `tools`: (Optional) Comma-separated tool list OR omit to inherit all tools + MCP
- `model`: (Optional) Model alias: "sonnet" or "haiku"

**Example:**
```

#### 2. Update Template Structure

**Add at the beginning:**
```markdown
---
name: [agent-name]
description: [Brief description of when to invoke this agent]
tools: Read, Grep, Glob, Bash
model: sonnet
---

# [Agent Name] Agent
```

**Add configuration guidance section:**
```markdown
## Configuration Notes

**Tool Access:**
- Current configuration: [List specified tools or "All tools (inherited)"]
- To modify tool access: Use `/agents` command for interactive configuration
- To inherit all tools: Remove the `tools` field from YAML frontmatter

**Model Selection:**
- Current model: [sonnet/haiku/inherited]
- Sonnet: More capable, higher latency, better for complex tasks
- Haiku: Faster, lower cost, good for focused tasks
```

#### 3. Remove Undocumented Fields

**Remove:**
- `proactive: [true|false]` field (not in official docs)

**Note:** If we want to keep this as a convention, document it as "Custom Extension" and clarify it's not officially supported.

### SUBAGENT_GUIDELINES.md Changes

#### 1. Add File Location Section

**Add at beginning:**
```markdown
## File Location & Discovery

### Storage Locations
- **Project-level:** `.claude/agents/[agent-name].md`
  - Project-specific agents
  - Version controlled (if desired)
  - Shared with team

- **User-level:** `~/.claude/agents/[agent-name].md`
  - Personal agents across projects
  - Not version controlled
  - User-specific customizations

### Priority System
When agents with the same name exist at both levels:
- Project-level agents take precedence
- User-level agents are ignored for that name
- No merging or combining occurs

### Management Command
Use `/agents` for interactive configuration:
- Lists all available tools (including MCP)
- Easy tool access modification
- Visual interface for configuration
```

#### 2. Fix Tool Configuration Section

**Replace Tool Selection Matrix with:**
```markdown
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
- Does not include MCP tools
- More restrictive
- Explicit and controlled

**Use When:**
- Agent should be limited in scope
- Faster execution desired (fewer tools = faster)
- Security or safety concerns require restrictions

### Available Tools
- **File Operations:** Read, Write, Edit, Glob, Grep
- **Execution:** Bash, Task (sub-agents)
- **Development:** TodoWrite, AskUserQuestion
- **Web:** WebFetch, WebSearch
- **Notebooks:** NotebookEdit
- **Shell Management:** BashOutput, KillShell

**Note:** Use `/agents` command to see all available tools including MCP server tools.

### Tool Selection Strategy

| Agent Purpose | Tool Strategy | Example Tools |
|--------------|---------------|---------------|
| Research/Analysis | Inherit all (omit field) | All tools + MCP |
| Focused Reader | Explicit list | Read, Grep, Glob |
| Code Modifier | Inherit all | All tools + MCP |
| Safe Analyzer | Explicit list | Read, Grep (no Write/Edit) |
| Web Researcher | Explicit list | WebFetch, WebSearch, Read |
```

#### 3. Add Model Configuration Section

**Add new section:**
```markdown
## Model Configuration

### Model Selection

Subagents can use different models than the main agent for optimized performance.

**Configuration:**
```yaml
---
name: my-agent
description: Agent description
model: haiku  # or sonnet
---
```

### Model Options

#### Sonnet (Default)
- **Use For:** Complex reasoning, code generation, multi-step workflows
- **Characteristics:** More capable, higher latency, better accuracy
- **Example Agents:** Architecture analysis, code refactoring, complex generation

#### Haiku
- **Use For:** Focused tasks, fast responses, simple operations
- **Characteristics:** Faster, lower cost, good for constrained tasks
- **Example Agents:** File formatting, simple validation, quick searches

### Model Selection Strategy

| Agent Type | Recommended Model | Rationale |
|-----------|------------------|-----------|
| Code analysis | Sonnet | Requires deep understanding |
| File search | Haiku | Simple, fast operation |
| Code generation | Sonnet | Complex reasoning needed |
| Format validation | Haiku | Rule-based, straightforward |
| Architecture design | Sonnet | Requires strategic thinking |
| File organization | Haiku | Simple operations |

**Default Behavior:**
- Omit `model` field to inherit from main agent
- Explicitly set only when optimization needed
```

#### 4. Update Examples Throughout

Replace all YAML examples with correct format:

**Before:**
```yaml
tools: [list, of, tools, or, * for all]
```

**After:**
```yaml
tools: Read, Grep, Glob, Bash
# or omit field entirely to inherit all tools
```

#### 5. Update the Example Agent

**Fix the API Contract Validator example:**
```markdown
---
name: api-contract-validator
description: Validates API contracts against OpenAPI specifications and ensures backend/frontend alignment
tools: Read, Grep, Bash
model: sonnet
---

# API Contract Validator Agent
```

### Both Files: Common Updates

#### Add Context Window Explanation

**Add to both files:**
```markdown
## Context Management

### Isolated Context
Each subagent operates in its own context window:
- **Benefit:** Main conversation remains focused on high-level objectives
- **Benefit:** Detailed work doesn't pollute main context
- **Benefit:** Agent can work with large codebases without impacting main thread
- **Behavior:** Results are returned to main agent upon completion
- **Implication:** Subagent doesn't see main conversation history
- **Implication:** Must provide complete context in invocation prompt

### Providing Context
When invoking subagents, include:
- Clear objective and success criteria
- Relevant file paths and locations
- Current state and constraints
- Expected output format
- Any context from main conversation that's relevant
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Immediate)

**Priority:** CRITICAL
**Effort:** 1-2 hours
**Impact:** Ensures templates produce working subagents

1. **Fix YAML Frontmatter Format**
   - Update SUBAGENT_TEMPLATE.md with correct frontmatter
   - Remove brackets notation: `[list, of, tools]`
   - Replace `*` with omit-field approach
   - Add actual YAML frontmatter to template

2. **Correct File Location**
   - Change `.claude-code/agents/` to `.claude/agents/`
   - Update all references throughout both files
   - Add explanation of project vs user level
   - Document priority system

3. **Fix Tool Configuration Syntax**
   - Change to comma-separated format: `tools: Read, Grep, Glob`
   - Explain omitting field for inheritance
   - Update all examples throughout guidelines

4. **Update Example Agent**
   - Fix API Contract Validator with correct YAML
   - Verify all sections present
   - Test structure completeness

### Phase 2: Feature Additions (High Priority)

**Priority:** HIGH
**Effort:** 2-3 hours
**Impact:** Adds missing official features

5. **Add Model Configuration**
   - Document `model` field in template
   - Add model selection section to guidelines
   - Create model selection strategy matrix
   - Update examples to show model usage

6. **Add Tool Configuration Section**
   - Create comprehensive tool configuration guide
   - Explain inheritance vs explicit
   - Document `/agents` command usage
   - Create tool selection strategy

7. **Add Context Management Section**
   - Explain isolated context window behavior
   - Document how context is provided
   - Show invocation best practices
   - Add context provision checklist

8. **Add Priority System Documentation**
   - Explain project vs user level precedence
   - Document override behavior
   - Show use cases for each level
   - Add troubleshooting section

### Phase 3: Enhancement & Validation (Medium Priority)

**Priority:** MEDIUM
**Effort:** 1-2 hours
**Impact:** Improves quality and completeness

9. **Remove/Document Proactive Field**
   - Decide: Remove or mark as custom extension
   - If keeping: Add "Custom Extensions" section
   - Document behavior and limitations
   - Clarify not officially supported

10. **Enhance Examples**
    - Add 2-3 more working examples
    - Show different tool configurations
    - Demonstrate model selection
    - Cover common use cases

11. **Update Validation Checklist**
    - Add YAML format validation
    - Add file location check
    - Add tool syntax validation
    - Add model configuration check

12. **Create Testing Guide**
    - How to test new subagents
    - Validation steps
    - Common issues and fixes
    - Integration testing

### Phase 4: Documentation Polish (Low Priority)

**Priority:** LOW
**Effort:** 1 hour
**Impact:** Improves usability

13. **Cross-Reference Official Docs**
    - Add links to official documentation
    - Reference specific sections
    - Indicate where we extend official spec
    - Note official vs custom features

14. **Improve Quick Start**
    - Add minimal viable example
    - Create "5-minute subagent" guide
    - Simplify initial learning curve
    - Provide copy-paste starting point

15. **Add Troubleshooting Section**
    - Common YAML errors
    - File location issues
    - Tool configuration problems
    - Context management issues

---

## Validation Criteria

### Template File (SUBAGENT_TEMPLATE.md)

**Must Have:**
- [ ] Correct YAML frontmatter format at top
- [ ] Correct file location specified (`.claude/agents/`)
- [ ] Tool configuration using comma-separated format or omitted
- [ ] Model field included as option
- [ ] All required template sections present
- [ ] Configuration guidance section included

**Should Have:**
- [ ] Context management explanation
- [ ] Tool configuration notes
- [ ] Model selection guidance
- [ ] Examples showing variations

**Verification:**
- [ ] Copy template and create actual subagent - should work without modifications
- [ ] YAML parses correctly
- [ ] File discoverable by Claude Code
- [ ] Tools configured correctly

### Guidelines File (SUBAGENT_GUIDELINES.md)

**Must Have:**
- [ ] File location and priority system documented
- [ ] Correct YAML format in all examples
- [ ] Tool configuration section with inheritance explanation
- [ ] Model configuration section
- [ ] `/agents` command documented
- [ ] Context management section

**Should Have:**
- [ ] Tool selection strategy matrix
- [ ] Model selection strategy matrix
- [ ] Multiple working examples
- [ ] Troubleshooting section
- [ ] Validation checklist

**Verification:**
- [ ] All YAML examples are valid
- [ ] File location references correct
- [ ] Tool syntax matches official docs
- [ ] No contradictions with official docs
- [ ] Extended features clearly marked

---

## Risk Assessment

### Low Risk
- Adding model configuration (additive, backward compatible)
- Enhancing documentation (doesn't break existing)
- Adding context management section (educational)

### Medium Risk
- Changing file location from `.claude-code/` to `.claude/` (breaking change for existing agents)
- Removing `proactive` field (breaking if users rely on it)
- Changing tool syntax (existing agents may need updates)

### Mitigation Strategies

1. **File Location Change**
   - Document migration path
   - Create migration script if needed
   - Support both locations temporarily?
   - Clear communication in changelog

2. **Proactive Field Removal**
   - Research if field actually works first
   - If removing: Add deprecation notice
   - Document as "Legacy/Unsupported"
   - Or move to "Custom Extensions" section

3. **Tool Syntax Change**
   - Provide examples of before/after
   - Create validation tool
   - Document in migration guide
   - Test all example agents

---

## Next Steps

### Immediate Actions

1. **Research Proactive Field**
   - Test if `proactive: true` actually has any effect
   - Check Claude Code release notes for mentions
   - Decision: Remove, keep as custom, or document as legacy

2. **Verify Current File Location**
   - Check if `.claude-code/agents/` is actually wrong
   - Test where Claude Code actually looks for agents
   - Confirm `.claude/agents/` is correct location

3. **Create Test Agent**
   - Build minimal test agent with correct format
   - Verify discovery and invocation
   - Test tool configuration behavior
   - Test model configuration

### Approval Needed

- **Breaking Changes:** File location change, YAML format changes
- **Feature Decisions:** Keep or remove proactive field
- **Scope:** Do all phases or just critical fixes?

### Implementation Owner

- Technical writer for documentation
- Testing for agent validation
- Review by Claude Code power users

---

## Appendix: Official vs Custom Features

### Official Features (Documented)
- `name` field (required)
- `description` field (required)
- `tools` field (optional, comma-separated)
- `model` field (optional, haiku or sonnet)
- File locations: `.claude/agents/` or `~/.claude/agents/`
- Priority system (project > user)
- Context isolation
- `/agents` management command

### Custom Extensions (Our Additions)
- Comprehensive template structure (Methodology, Quality Standards, etc.)
- Phase-based workflow approach
- Communication protocol templates
- Error handling guidance
- Integration & delegation patterns
- Success metrics
- Examples & patterns section

### Potentially Custom (Needs Research)
- `proactive` field - not in official docs
- `.claude-code/agents/` location - may be incorrect
- `*` for all tools - official says omit field

### Status Legend
- ✅ Confirmed official
- ⚠️ Custom extension (explicitly marked as such)
- ❓ Needs verification

---

**Analysis Version:** 1.0
**Next Review:** After Phase 1 implementation
**Owner:** Platform Engineering

