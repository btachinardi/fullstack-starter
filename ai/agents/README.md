# Agent PRDs

This directory contains Product Requirement Documents (PRDs) for Claude Code agents.

## What Are Agent PRDs?

Agent PRDs are comprehensive specifications for complex, orchestrated systems that:
- **Decompose complex tasks** into manageable subtasks
- **Design specialized sub-agents** for each task type
- **Define workflows** with sequential and parallel execution patterns
- **Specify quality gates** and validation checkpoints
- **Document orchestration patterns** for coordinating multiple agents

## Directory Structure

```
ai/agents/
├── README.md                           # This file
├── AGENT_PRD_GUIDELINES.md             # Complete guide for writing agent PRDs
├── examples/                           # Example PRDs for reference
│   ├── simple-test-runner.prd.md      # Simple 3-agent system example
│   └── complex-refactoring-orchestrator.prd.md  # Complex 7-agent system example
└── {domain}/                           # Domain-specific agent PRDs
    └── {agent-name}.prd.md            # Individual agent PRD
```

## Quick Start

### 1. Read the Guidelines

Start with **[AGENT_PRD_GUIDELINES.md](./AGENT_PRD_GUIDELINES.md)** for comprehensive instructions on:
- PRD structure and required sections
- Task decomposition strategies
- Sub-agent design principles
- Workflow orchestration patterns
- Parallel execution strategies
- Quality gates and validation
- Implementation mapping

### 2. Review Examples

Study the example PRDs to understand different complexity levels:

**Simple Agent (3 sub-agents):**
- [simple-test-runner.prd.md](./examples/simple-test-runner.prd.md)
- 3 phases: Discovery → Execution → Reporting
- Sequential pipeline with parallel execution in Phase 2
- Good starting point for most agents

**Complex Agent (7 sub-agents):**
- [complex-refactoring-orchestrator.prd.md](./examples/complex-refactoring-orchestrator.prd.md)
- 6 phases with multiple sub-agents
- Mixed orchestration patterns (parallel fanout, sequential pipeline, validation gates)
- Advanced example for sophisticated workflows

### 3. Create Your PRD

1. **Choose a template:** Copy the template from [AGENT_PRD_GUIDELINES.md:L853](./AGENT_PRD_GUIDELINES.md#L853)
2. **Define your problem:** Start with a clear problem statement and goals
3. **Decompose the task:** Break it into 3-7 clear phases
4. **Design sub-agents:** Specify 3-10 specialized sub-agents
5. **Plan workflows:** Define orchestration patterns (sequential, parallel, conditional)
6. **Add validation:** Define quality gates and rollback strategies
7. **Map to implementation:** Specify slash command + sub-agent files

### 4. Implement the Agent

Once your PRD is approved:

1. **Create slash command:** `.claude/commands/{category}/{command}.md`
2. **Create sub-agents:** `.claude/agents/{category}/{agent-name}.md`
3. **Follow templates:** Use [SUBAGENT_TEMPLATE.md](../claude/agents/SUBAGENT_TEMPLATE.md) for agent files
4. **Test thoroughly:** Validate each sub-agent independently, then test full workflow

## Key Principles

### 1. Main Agent Never Modifies Files

The main agent (slash command) **orchestrates** but **never directly modifies files**. All file operations must be delegated to specialized sub-agents.

✅ **Correct:**
```
/refactor command
  → Invokes refactoring-analyzer (analysis, no changes)
  → Invokes refactoring-executor (makes file changes)
  → Invokes test-validator (validation, no changes)
```

❌ **Incorrect:**
```
/refactor command
  → Analyzes code itself
  → Modifies files itself
  → Runs tests itself
```

### 2. Single Responsibility Per Sub-Agent

Each sub-agent has ONE focused purpose:

✅ **Good:**
- `test-finder`: Only discovers tests
- `test-executor`: Only runs tests
- `report-generator`: Only formats reports

❌ **Bad:**
- `test-agent`: Discovers tests, runs them, AND generates reports

### 3. Maximize Parallel Execution

Identify opportunities for parallel execution:

**Example:**
```
Sequential (slow):
  Phase 1 → Phase 2a → Phase 2b → Phase 2c → Phase 3
  Total time: 1s + 2s + 2s + 2s + 1s = 8s

Parallel (fast):
  Phase 1 → (Phase 2a, Phase 2b, Phase 2c in parallel) → Phase 3
  Total time: 1s + 2s (max of parallel) + 1s = 4s
```

### 4. Validate Early and Often

Add validation checkpoints between phases:

```
Phase 1: Analysis
  ↓ Validate: All references found
Phase 2: Planning
  ↓ Validate: Plan is sound
Phase 3: Execution
  ↓ Validate: No syntax errors
Phase 4: Testing
  ↓ Validate: All tests pass
Phase 5: Finalization
```

### 5. Design for Failure

Every PRD must include:
- **Rollback strategy** (how to undo changes)
- **Error handling** (what to do when sub-agents fail)
- **User communication** (how to report failures clearly)

## PRD Checklist

Before considering your PRD complete, verify:

- [ ] Executive summary explains value clearly
- [ ] Problem statement identifies pain points
- [ ] Goals are specific and measurable
- [ ] Non-goals prevent scope creep
- [ ] Task decomposition has 3-7 clear phases
- [ ] Each phase has inputs, outputs, success criteria
- [ ] 3-10 sub-agents specified with complete details
- [ ] Tool restrictions justified for each sub-agent
- [ ] Model selections justified (Sonnet vs. Haiku)
- [ ] Workflow diagram shows complete flow
- [ ] Parallel execution opportunities identified
- [ ] User approval gates defined
- [ ] Validation strategy for each phase
- [ ] Rollback strategy documented
- [ ] Implementation mapping complete
- [ ] Error handling for all scenarios
- [ ] Examples provided for workflows

## Common Patterns

### Pattern 1: Analysis → Execution → Validation

**Use Case:** Most implementation agents

```
Phase 1: Analyze (what needs to change?)
  → Sub-Agent: analyzer

Phase 2: Execute (make the changes)
  → Sub-Agent(s): executor × N (parallel)

Phase 3: Validate (did it work?)
  → Sub-Agent: validator
```

**Examples:** refactoring, code generation, migration

### Pattern 2: Discovery → Transformation → Aggregation (Map-Reduce)

**Use Case:** Processing many independent items

```
Phase 1: Discover (find all items)
  → Sub-Agent: discoverer

Phase 2: Transform (process each item in parallel)
  → Sub-Agent: transformer × N (parallel)

Phase 3: Aggregate (combine results)
  → Sub-Agent: aggregator
```

**Examples:** batch processing, multi-file analysis, report generation

### Pattern 3: Plan → Approve → Execute → Validate → Finalize

**Use Case:** High-risk operations requiring user approval

```
Phase 1: Plan (what will we do?)
  → Sub-Agent: planner

Phase 2: User Approval Gate
  → User reviews plan

Phase 3: Execute (do it)
  → Sub-Agent(s): executor × N

Phase 4: Validate (confirm success)
  → Sub-Agent: validator

Phase 5: Finalize (update docs, commit)
  → Sub-Agent: finalizer
```

**Examples:** refactoring, deployment, migrations

## Sub-Agent Types

### Analysis Agents
- **Purpose:** Understand code, find patterns, generate reports
- **Tools:** Read, Grep, Glob, Bash (no writes)
- **Model:** Sonnet 4.5
- **Auto-Commit:** false
- **Examples:** `code-analyzer`, `dependency-mapper`, `test-finder`

### Implementation Agents
- **Purpose:** Make code changes, create files
- **Tools:** All (Read, Write, Edit, Grep, Glob, Bash)
- **Model:** Sonnet 4.5
- **Auto-Commit:** true
- **Examples:** `refactoring-executor`, `feature-implementer`, `migration-runner`

### Validation Agents
- **Purpose:** Verify correctness, run tests, check compliance
- **Tools:** Read, Bash (run tests/checkers)
- **Model:** Haiku 4.5 (fast) OR Sonnet 4.5 (complex validation)
- **Auto-Commit:** false
- **Examples:** `test-runner`, `type-checker`, `lint-validator`

### Generation Agents
- **Purpose:** Create multiple related artifacts
- **Tools:** All
- **Model:** Sonnet 4.5
- **Auto-Commit:** true
- **Examples:** `component-generator`, `api-scaffold`, `doc-generator`

## Resources

### Documentation
- [AGENT_PRD_GUIDELINES.md](./AGENT_PRD_GUIDELINES.md) - Complete PRD writing guide
- [SUBAGENT_GUIDELINES.md](../claude/agents/SUBAGENT_GUIDELINES.md) - Sub-agent implementation best practices
- [SUBAGENT_TEMPLATE.md](../claude/agents/SUBAGENT_TEMPLATE.md) - Sub-agent file template
- [MODEL_GUIDELINES.md](../claude/MODEL_GUIDELINES.md) - Model selection guide

### Examples
- [simple-test-runner.prd.md](./examples/simple-test-runner.prd.md) - Simple 3-agent example
- [complex-refactoring-orchestrator.prd.md](./examples/complex-refactoring-orchestrator.prd.md) - Complex 7-agent example
- [git/commit.md](../../.claude/commands/git/commit.md) - Real working agent system

### Implemented Agents
- `.claude/commands/git/commit.md` - Intelligent git commit command
- `.claude/agents/git/commit-grouper.md` - Commit change grouping agent
- `.claude/agents/git/commit-message-generator.md` - Semantic commit message agent

## Workflow

### Creating a New Agent System

1. **Write PRD** (this directory)
   - Define problem, goals, phases, sub-agents
   - Get feedback, iterate on design

2. **Implement Slash Command** (`.claude/commands/`)
   - Main orchestrator
   - Handles user interaction
   - Delegates to sub-agents

3. **Implement Sub-Agents** (`.claude/agents/`)
   - Each sub-agent in separate file
   - Follow SUBAGENT_TEMPLATE.md structure
   - Include YAML frontmatter

4. **Test & Iterate**
   - Test each sub-agent independently
   - Test full workflow end-to-end
   - Gather user feedback

5. **Document** (`docs/`)
   - User-facing documentation
   - Examples and tutorials
   - FAQs

## Best Practices

### DO:
✅ Start with a clear problem statement
✅ Design for composability (reusable sub-agents)
✅ Identify parallel execution opportunities
✅ Add validation checkpoints
✅ Document failure scenarios
✅ Include concrete examples
✅ Plan rollback strategies
✅ Get feedback on PRD before implementing

### DON'T:
❌ Create monolithic agents
❌ Let main agent modify files directly
❌ Skip validation between phases
❌ Ignore error handling
❌ Over-parallelize (causes race conditions)
❌ Under-parallelize (misses performance)
❌ Forget user approval gates for risky operations

## Getting Help

- **Questions about PRD guidelines?** See [AGENT_PRD_GUIDELINES.md](./AGENT_PRD_GUIDELINES.md)
- **Questions about implementation?** See [SUBAGENT_GUIDELINES.md](../claude/agents/SUBAGENT_GUIDELINES.md)
- **Need examples?** Check `examples/` directory
- **Want to discuss design?** Open an issue or PR with your PRD draft

---

**Happy agent building!** 🤖
