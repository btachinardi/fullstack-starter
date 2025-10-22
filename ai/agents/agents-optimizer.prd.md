# Agent Optimizer PRD

**Status:** Draft
**Version:** 1.0
**Last Updated:** 2025-10-22
**Owner:** Platform Engineering / Agent Framework Team
**Implementation:**
- Main Agent: `/agents:optimizer`
- Sub-Agents: `agent-analyzer`, `optimization-planner`, `optimization-validator`
- Built-In Agents: `prd-writer`, `slash-command-writer`, `subagent-writer`, `docs-writer`

---

## Executive Summary

The `/agents:optimizer` command automates the optimization of Claude Code slash commands and subagents using research-backed best practices. It transforms manual optimization from a 6-8 hour expert-driven process into a 15-25 minute automated workflow while ensuring 100% adherence to established guidelines.

**What It Does:**
- Analyzes existing agents against 7 research-validated optimization patterns
- Generates prioritized recommendations with effort/impact estimates
- Creates comprehensive PRDs for commands following AGENT_PRD_GUIDELINES.md
- Implements optimizations via delegation to built-in writer agents
- Validates improvements through metrics (token reduction, quality scores, guideline adherence)

**Why It Matters:**
- **Consistency:** All agents follow same optimization patterns, preventing quality drift
- **Speed:** 95% time reduction (6-8 hours → 15-25 minutes)
- **Quality:** 100% guideline adherence through automated checklist validation
- **Knowledge Distribution:** Best practices actively applied, not just documented
- **Scalability:** Can optimize entire agent library systematically

**Value Proposition:**
This command packages our successful `/dev:debug` optimization methodology (85KB research → analysis → PRD → implementation → 12% token reduction + improved clarity) into a reusable system that can optimize ANY agent/command consistently and comprehensively.

---

## Problem Statement

### Current Challenges

**Manual Optimization is Slow and Expert-Dependent:**
- 6-8 hours per agent (research, analysis, PRD writing, rewrite, testing, validation)
- Requires deep knowledge of 85KB research document + guidelines
- Only platform team members have necessary context
- Optimization backlog growing faster than manual capacity

**Inconsistent Quality Across Agents:**
- Different developers apply different patterns (no standardization)
- Some agents have "When/What/Why" strategy structure, others don't
- Example depth varies wildly (15-line outputs vs 120-line decision-focused)
- Tool abstraction decisions made ad-hoc (duplication vs encapsulation)

**Best Practices Locked in Documentation:**
- 85KB research document exists but isn't actively applied
- AGENT_PRD_GUIDELINES.md comprehensive but requires manual interpretation
- Agent optimization patterns documented in case studies but not systematically enforced
- Knowledge accessible but not actionable without expert analysis

**No Systematic Review Process:**
- Agents optimized reactively (when problems noticed), not proactively
- No scheduled review cycles (agents drift from current standards)
- Hard to validate if optimization follows all 7 research patterns
- Missed opportunities identified only during deep debugging

**Technical Debt Accumulation:**
- Old agents written before research findings accumulate inconsistencies
- Refactoring manual, time-consuming, error-prone
- No easy way to measure quality metrics (token efficiency, guideline adherence)
- Optimization ROI unclear (time saved, improvements gained)

### Impact of Current State

**Developer Experience:**
- Confusion when examples teach different patterns
- Cognitive load from inconsistent strategy structures
- Duplicate logic across agents (error categorization, health checks)
- Longer debugging time due to outdated patterns

**Maintenance Burden:**
- Changes to best practices require manual agent updates
- 40+ agents in codebase, each needing review
- No centralized tracking of optimization status
- Hard to ensure consistent improvements across library

**Quality Variability:**
- Some agents exemplary (commit-grouper: 974 lines, excellent structure)
- Others need improvement (inconsistent strategy docs, shallow examples)
- No objective quality score (manual expert review only)
- Platform team bottleneck for optimization decisions

---

## Goals & Non-Goals

### Goals

1. **Automate Complete Optimization Workflow**
   - From agent analysis → recommendations → PRD generation → implementation → validation
   - Zero manual intervention except approval gates
   - Complete in 15-25 minutes (vs 6-8 hours manual)

2. **Ensure 100% Guideline Adherence**
   - Validate against all 7 research patterns (command design, delegation, phases, context, parallel execution, structured formats, examples)
   - Check AGENT_PRD_GUIDELINES.md completeness (all required sections, quality criteria)
   - Enforce consistency (all strategies have "When/What/Why", all examples have decision-making)

3. **Generate Comprehensive Analysis Reports**
   - Strengths/weaknesses with line number references
   - Prioritized recommendations (HIGH/MEDIUM/LOW with effort/impact)
   - Token reduction estimates (current vs optimized)
   - Specific actionable fixes (not generic advice)

4. **Create Optimized Implementations**
   - Commands follow slash-command patterns (orchestration, delegation, validation gates)
   - Subagents follow template structure (single responsibility, input/output contracts)
   - PRDs comprehensive (task decomposition, sub-agent design, workflow orchestration)
   - All outputs pass validation checklists

5. **Measure and Validate Improvements**
   - Token reduction percentage (target: 10-15%)
   - Quality score improvements (0-5 scale per pattern)
   - Guideline adherence (checklist pass rate)
   - Before/after comparison reports

6. **Support Both Commands and Subagents**
   - Commands: Full PRD generation → slash-command-writer
   - Subagents: Direct optimization via subagent-writer (no PRD needed)
   - Conditional branching based on target type

7. **Scale to Entire Agent Library**
   - Batch mode capability (future: optimize directory)
   - Optimization history tracking (versioning)
   - Systematic review scheduling (quarterly optimization passes)

### Non-Goals

1. **Creating New Agents from Scratch**
   - Use existing templates and manual authoring
   - Optimizer only improves existing agents
   - Rationale: Creation requires product decisions, not optimization

2. **Optimizing Agents Outside `.claude/` Directory**
   - Only `.claude/commands/` and `.claude/agents/` in scope
   - No optimization of arbitrary markdown files
   - Rationale: Agent-specific patterns don't apply elsewhere

3. **Automatic Deployment Without Review**
   - Always require user approval after planning phase
   - Never commit optimized agents without human validation
   - Rationale: Safety, quality control, learning opportunities

4. **Generic Code Optimization**
   - Not a general refactoring tool (no TypeScript/JavaScript optimization)
   - Focus on agent-specific patterns (delegation, context, examples)
   - Rationale: Specialized tool for agent optimization only

5. **Real-Time Optimization During Execution**
   - No runtime agent modification
   - All optimization happens offline (command invocation)
   - Rationale: Complexity, safety concerns

---

## Task Decomposition

### Phase 0: Input Validation & Context Loading

**Objective:** Validate target agent exists, load all required context for analysis

**Purpose:** Ensure all prerequisites met before beginning analysis

**Inputs:**
- User-provided file path to target agent (command or subagent)
- Optional: Optimization goals (`clarity`, `maintainability`, `token_efficiency`)

**Process:**
1. **Validate Target File**
   - Check file exists at provided path
   - Verify file is in `.claude/commands/` or `.claude/agents/`
   - Read file contents, verify valid markdown format
   - Extract YAML frontmatter (if command)

2. **Determine Agent Type**
   - Command: Has frontmatter with `description`, `allowed-tools`, `model`
   - Subagent: Has frontmatter with `name`, `description`, optionally `tools`, `model`, `autoCommit`
   - Set type flag for conditional branching in later phases

3. **Load Required Context**
   - Read `ai/docs/agent-optimization-research.md` (85KB research)
   - Read `ai/agents/AGENT_PRD_GUIDELINES.md` (comprehensive guidelines)
   - Optional: Load related agents (if cross-references found)
   - Optional: Load existing PRD (if optimizing previously PRD'd command)

4. **Validate Prerequisites**
   - Research document accessible
   - Guidelines document accessible
   - Target file parseable (valid markdown, frontmatter)

**Sub-Agent(s):** None (direct file operations)

**Outputs:**
```json
{
  "target_file": "absolute/path/to/agent.md",
  "agent_type": "command | subagent",
  "agent_info": {
    "name": "debug",
    "line_count": 1796,
    "estimated_tokens": 85000,
    "has_frontmatter": true,
    "has_examples": true
  },
  "context_loaded": {
    "research_doc": true,
    "guidelines_doc": true,
    "existing_prd": false
  },
  "optimization_goals": ["clarity", "maintainability", "token_efficiency"]
}
```

**Success Criteria:**
- [ ] Target file exists and is readable
- [ ] Agent type determined (command or subagent)
- [ ] Research and guidelines documents loaded
- [ ] File structure validated (markdown + frontmatter)
- [ ] Ready for analysis phase

**Failure Handling:**
- **If:** File not found → Report error, exit gracefully
- **If:** File not in `.claude/` → Confirm user wants to proceed (warn: non-agent file)
- **If:** Research/guidelines missing → Report error, cannot proceed without context
- **If:** Invalid markdown → Attempt parsing, warn user, proceed with caution

**Tools Used:** Read, Grep (for file existence checks)

**Time Target:** <10 seconds

---

### Phase 1: Comprehensive Analysis

**Objective:** Systematically evaluate target agent against 7 research patterns and guidelines, identify strengths/weaknesses/recommendations

**Purpose:** Create detailed diagnostic report with prioritized, actionable feedback

**Inputs:**
- Loaded agent content from Phase 0
- Agent type (command vs subagent)
- Research document (7 patterns)
- Guidelines document (completeness criteria)

**Process:**
1. **Evaluate Agent Structure**
   - Check required sections present (Core Directive, Methodology, Quality Standards, etc.)
   - Validate section hierarchy and organization
   - Assess information density (structured formats vs prose)

2. **Assess Pattern Adherence (7 Patterns)**
   - **Pattern 1: Command Design** - Orchestration vs implementation (score 0-5)
   - **Pattern 2: Delegation Framework** - When/how to delegate (score 0-5)
   - **Pattern 3: Phase/Workflow** - Clear objectives, validation gates (score 0-5)
   - **Pattern 4: Context Optimization** - Isolation, summaries, no pollution (score 0-5)
   - **Pattern 5: Parallel Execution** - Correct syntax, time savings (score 0-5)
   - **Pattern 6: Structured Formats** - Tables, checklists, schemas (score 0-5)
   - **Pattern 7: Example Quality** - Decision-focused, 80-120 lines, diverse (score 0-5)

3. **Identify Strengths**
   - What agent does well (line number references)
   - Patterns to preserve during optimization
   - Exemplary sections to use as templates

4. **Identify Weaknesses**
   - Missing or incomplete sections
   - Inconsistencies (e.g., Strategy A-G lack "When/What/Why" but H-L have it)
   - Redundancy (duplicate logic, verbose prose)
   - Token inefficiency (150+ lines for basic strategy)

5. **Generate Recommendations**
   - Prioritize by impact (HIGH/MEDIUM/LOW)
   - Estimate effort (hours to implement)
   - Estimate token savings (% reduction)
   - Provide specific fixes (not generic advice)

6. **Calculate Metrics**
   - Overall quality score (average of 7 pattern scores)
   - Token reduction potential (estimated %)
   - Guideline adherence percentage (sections present / required)

**Sub-Agent(s):**
- **`agent-analyzer`**: Performs comprehensive evaluation
  - **Type:** Analysis
  - **Tools:** Read, Grep
  - **Model:** Sonnet 4.5 (complex reasoning for pattern evaluation)
  - **Auto-Commit:** false

**Outputs:**
```json
{
  "agent_info": {
    "name": "debug",
    "type": "command",
    "line_count": 1796,
    "estimated_tokens": 85000
  },
  "evaluation": {
    "overall_score": 4.6,
    "category_scores": {
      "command_design": 5,
      "delegation_framework": 5,
      "phase_workflow": 4,
      "context_optimization": 5,
      "parallel_execution": 5,
      "structured_formats": 5,
      "example_quality": 3
    }
  },
  "strengths": [
    "Exemplary Phase 0 advanced delegation (lines 93-476)",
    "Excellent context isolation via /tmp logs (lines 516-528)",
    "Correct parallel invocation syntax documented (lines 442-475)",
    "Comprehensive validation checklists (5-10 per phase)",
    "Example 5 is gold standard (lines 1606-1718)"
  ],
  "weaknesses": [
    "Strategies A-G lack 'When/What/Why' structure (lines 669-1007)",
    "Examples 1-4 are shallow, output-focused (lines 1441-1602)",
    "Duplicate error categorization logic (lines 549-589, repeated Phase 3)",
    "Health check commands repeated (Phase 1 and Phase 3)",
    "No tool abstractions for common operations"
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "HIGH",
      "category": "strategy_consistency",
      "issue": "Strategies A-G lack 'When/What/Why/Priority' structure present in H-L",
      "recommendation": "Add 'When/What/Why/Priority' to all strategies A-G following H-L pattern",
      "line_numbers": "669-1007",
      "estimated_impact": "25% token reduction in Phase 2 section, high clarity improvement",
      "effort": "2-3 hours",
      "example_before": "#### Strategy A: Port Conflict Resolution (if detected)\n**When to use:** Port conflict errors found (EADDRINUSE)",
      "example_after": "#### Strategy A: Port Conflict Resolution\n**When:** Port conflict errors detected (EADDRINUSE, \"address already in use\")\n**What it does:** Identifies process using ports and resolves conflicts\n**Why use this:** Blocking issue preventing all other fixes\n**Priority:** 1 (CRITICAL)"
    },
    {
      "id": "rec-2",
      "priority": "HIGH",
      "category": "example_depth",
      "issue": "Examples 1-4 are 15-30 lines, output-focused, lack decision-making (Example 5 is 112 lines, decision-focused)",
      "recommendation": "Consolidate Examples 1-4 into 2 deep examples matching Example 5 depth (80-120 lines with decisions, trade-offs, time metrics)",
      "line_numbers": "1441-1602",
      "estimated_impact": "+1500 tokens but massive pedagogical value improvement",
      "effort": "2-3 hours"
    },
    {
      "id": "rec-3",
      "priority": "HIGH",
      "category": "tool_abstraction",
      "issue": "40+ lines of error categorization logic duplicated, no reusability",
      "recommendation": "Create `pnpm tools dev:categorize-errors` tool, use in Phases 1 & 3",
      "line_numbers": "549-589",
      "estimated_impact": "-800 tokens, high maintainability gain, enables testing",
      "effort": "4-6 hours"
    }
  ],
  "metrics": {
    "current_tokens": 85000,
    "estimated_optimized_tokens": 82700,
    "token_reduction_percent": 2.7,
    "guideline_sections_present": 18,
    "guideline_sections_total": 20,
    "adherence_percent": 90
  }
}
```

**Success Criteria:**
- [ ] All 7 patterns evaluated with scores (0-5)
- [ ] At least 3 strengths identified with line references
- [ ] At least 3 weaknesses identified with specifics
- [ ] Recommendations prioritized (HIGH/MEDIUM/LOW)
- [ ] Effort and impact estimates provided
- [ ] Overall quality score calculated (0-5)
- [ ] Token reduction potential estimated

**Failure Handling:**
- **If:** Cannot parse agent structure → Provide partial analysis, note parsing issues
- **If:** Research patterns unclear → Use guideline-based evaluation only
- **If:** No weaknesses found → Mark as "optimized", provide minimal recommendations

**Tools Used:** Task tool (for agent-analyzer delegation)

**Time Target:** 2-3 minutes

---

### Phase 2: Optimization Planning

**Objective:** Convert analysis recommendations into actionable, sequenced optimization roadmap with effort/impact estimates

**Purpose:** Create implementation plan user can review and approve before changes

**Inputs:**
- Analysis report from Phase 1 (recommendations, scores, metrics)
- Optimization goals from Phase 0
- Agent type (affects planning - commands need PRD, subagents don't)

**Process:**
1. **Group Recommendations by Phase**
   - Phase 1: High-priority consistency fixes (strategy structure, validation)
   - Phase 2: Example improvements (depth, decision-making, diversity)
   - Phase 3: Tool abstractions (encapsulate duplicate logic)
   - Phase 4: Token optimization (structured formats, reference docs)

2. **Estimate Effort and Impact**
   - Effort: Hours to implement (low: <2h, medium: 2-4h, high: 4-6h)
   - Impact: Token reduction % + quality improvement (low/medium/high)
   - ROI: Effort vs impact trade-off

3. **Sequence Tasks**
   - High-priority, low-effort first (quick wins)
   - High-priority, high-effort second (major improvements)
   - Low-priority, low-effort third (polish)
   - Skip low-priority, high-effort (not worth it)

4. **Define Success Metrics**
   - Token reduction target (e.g., 10-15%)
   - Quality score target (e.g., 4.0 → 4.8)
   - Guideline adherence target (e.g., 90% → 100%)
   - Validation pass rate (all checklists pass)

5. **Create Implementation Order**
   - List tasks in execution order
   - Mark dependencies (Task B depends on Task A)
   - Identify parallelizable tasks
   - Note approval gates

**Sub-Agent(s):**
- **`optimization-planner`**: Converts analysis to roadmap
  - **Type:** Planning
  - **Tools:** Read
  - **Model:** Sonnet 4.5 (strategic planning)
  - **Auto-Commit:** false

**Outputs:**
```json
{
  "optimization_phases": [
    {
      "phase": 1,
      "name": "Strategy Standardization",
      "recommendations": ["rec-1"],
      "priority": "HIGH",
      "estimated_effort": "2-3 hours",
      "estimated_impact": "25% token reduction Phase 2, high clarity gain",
      "tasks": [
        "Add 'When/What/Why/Priority' to Strategy A",
        "Add 'When/What/Why/Priority' to Strategy B",
        "... (repeat for C-G)"
      ]
    },
    {
      "phase": 2,
      "name": "Example Deepening",
      "recommendations": ["rec-2"],
      "priority": "HIGH",
      "estimated_effort": "2-3 hours",
      "estimated_impact": "+1500 tokens, very high pedagogical value",
      "tasks": [
        "Consolidate Examples 1-4 into Example 1 (common case)",
        "Expand Example 1 to 80-100 lines with decision-making",
        "Keep Example 5 as-is (already excellent)"
      ]
    },
    {
      "phase": 3,
      "name": "Tool Abstraction",
      "recommendations": ["rec-3", "rec-4"],
      "priority": "HIGH",
      "estimated_effort": "6-9 hours",
      "estimated_impact": "-1300 tokens, very high maintainability",
      "tasks": [
        "Create dev:categorize-errors tool",
        "Create dev:health-check tool",
        "Update agent to use tools instead of raw bash"
      ]
    }
  ],
  "total_estimates": {
    "effort_hours": 13,
    "token_reduction_percent": 2.7,
    "net_token_reduction": 2300,
    "quality_improvement": "4.6 → 4.9 (estimated)"
  },
  "implementation_order": [
    "Phase 1: Strategy Standardization (high priority, medium effort)",
    "Phase 2: Example Deepening (high priority, medium effort)",
    "Phase 3: Tool Abstraction (high priority, high effort)"
  ],
  "success_metrics": [
    "Token reduction ≥ 2.5% (target: 2.7%)",
    "Quality score ≥ 4.8 (current: 4.6)",
    "All strategies have 'When/What/Why/Priority' structure",
    "All examples 80-120 lines with decision-making",
    "Zero duplication of error categorization logic"
  ]
}
```

**Success Criteria:**
- [ ] All recommendations assigned to phases
- [ ] Effort estimates for each phase (hours)
- [ ] Impact estimates for each phase (tokens %, quality)
- [ ] Implementation order defined (priority-based)
- [ ] Success metrics measurable (specific targets)
- [ ] Total estimates calculated (effort, token reduction)

**Failure Handling:**
- **If:** Recommendations conflict → Resolve conflicts, document trade-offs
- **If:** Effort estimates unknown → Provide range, mark as uncertain
- **If:** Impact unclear → Default to conservative estimates

**Tools Used:** Task tool (for optimization-planner delegation)

**Time Target:** 1-2 minutes

---

### User Approval Gate: Review Optimization Plan

**Trigger:** After Phase 2 completes

**Present to User:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent Optimization Plan: /dev:debug
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analysis Summary:
  Overall Quality Score: 4.6 / 5.0 (92%)
  Current Token Count: ~85,000 tokens
  Guideline Adherence: 90% (18/20 sections)

Top Strengths:
  ✓ Exemplary Phase 0 delegation pattern
  ✓ Excellent context isolation (8x efficiency)
  ✓ Correct parallel execution syntax

Top Weaknesses:
  ✗ Strategy documentation inconsistent (A-G vs H-L)
  ✗ Examples shallow (1-4) vs deep (5)
  ✗ Duplicate logic (error categorization, health checks)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Optimization Roadmap:

Phase 1: Strategy Standardization [HIGH PRIORITY]
  What: Add "When/What/Why/Priority" to Strategies A-G
  Impact: -2,500 tokens (25% Phase 2), high clarity
  Effort: 2-3 hours

Phase 2: Example Deepening [HIGH PRIORITY]
  What: Consolidate Examples 1-4, expand to 80-120 lines
  Impact: +1,500 tokens, very high teaching value
  Effort: 2-3 hours

Phase 3: Tool Abstraction [HIGH PRIORITY]
  What: Create dev:categorize-errors and dev:health-check tools
  Impact: -1,300 tokens, very high maintainability
  Effort: 6-9 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Estimates:
  Time Investment: 13 hours
  Token Reduction: -2,300 (2.7%)
  Quality Improvement: 4.6 → 4.9 (estimated)
  Guideline Adherence: 90% → 100%

Success Metrics:
  ✓ Token reduction ≥ 2.5%
  ✓ Quality score ≥ 4.8
  ✓ All strategies standardized
  ✓ All examples decision-focused
  ✓ Zero logic duplication

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
  1. ✅ Proceed with all phases (recommended)
  2. 🔄 Select specific phases only
  3. ❌ Cancel optimization

Your choice: [1/2/3]
```

**User Options:**
- **Option 1:** Proceed with all phases → Continue to Phase 3 (or Phase 4 if command needs PRD)
- **Option 2:** Select phases → Show phase menu, user chooses subset
- **Option 3:** Cancel → Exit gracefully, save analysis report

**Timeout:** 2 minutes, default: Proceed (Option 1)

**Validation:**
- [ ] User choice recorded
- [ ] Selected phases documented
- [ ] Plan approved or modified

---

### Phase 3: PRD Generation (Commands Only)

**Objective:** Create comprehensive PRD following AGENT_PRD_GUIDELINES.md for slash commands

**Purpose:** Document requirements before implementing optimizations (commands are complex orchestrators requiring specs)

**Conditional:** Execute ONLY if agent type is "command". Skip for subagents (they follow template, don't need PRD).

**Inputs:**
- Current command content
- Analysis report (strengths, weaknesses, recommendations)
- Optimization plan (phases, tasks, success metrics)
- Agent optimization research (best practices)
- PRD guidelines (structure, completeness criteria)

**Process:**
1. **Invoke Built-In PRD Writer**
   - Delegate to `prd-writer` agent via Task tool
   - Provide comprehensive context (current command, analysis, optimization plan)
   - Request PRD following AGENT_PRD_GUIDELINES.md structure

2. **PRD Writer Extracts Requirements**
   - What command currently does (from existing content)
   - What optimizations will change (from optimization plan)
   - Sub-agents required (from delegation analysis)
   - Workflow orchestration (from phase structure)

3. **PRD Writer Applies Best Practices**
   - Task decomposition (3-7 phases with validation gates)
   - Sub-agent design (single responsibility, input/output contracts)
   - Workflow patterns (sequential, parallel, conditional)
   - Quality gates (validation, rollback, success criteria)
   - Tool abstractions (encapsulate complex operations)
   - Strategy documentation ("When/What/Why/Priority")
   - Example quality (80-120 lines, decision-focused)

4. **PRD Writer Creates Complete Document**
   - All required sections (metadata, summary, problem, goals, decomposition, sub-agents, workflow, validation, etc.)
   - Structured output formats (JSON schemas, tables, checklists)
   - Concrete examples (before/after, workflows)

5. **Write PRD to File**
   - Location: `ai/agents/{category}/{name}.prd.md`
   - Example: `ai/agents/dev/debug.prd.md`

**Sub-Agent(s):**
- **`prd-writer`** (Built-In): Generates comprehensive PRD
  - **Type:** Generation
  - **Tools:** Inherit all (Read, Write)
  - **Model:** Sonnet 4.5 (complex document generation)
  - **Auto-Commit:** false (user reviews before committing)

**Outputs:**
```json
{
  "prd_file": "ai/agents/dev/debug.prd.md",
  "prd_metadata": {
    "status": "Draft",
    "version": "1.0",
    "sections_count": 20,
    "line_count": 1850,
    "estimated_tokens": 45000
  },
  "validation": {
    "all_sections_present": true,
    "task_decomposition_complete": true,
    "sub_agents_specified": true,
    "workflow_defined": true,
    "examples_included": true,
    "quality_gates_defined": true
  }
}
```

**Success Criteria:**
- [ ] PRD file created in correct location
- [ ] All required sections present (per guidelines)
- [ ] Task decomposition into 3-7 phases
- [ ] Sub-agent specifications complete (tools, model, contracts)
- [ ] Workflow orchestration defined (sequential/parallel patterns)
- [ ] Quality gates and validation strategy defined
- [ ] Examples concrete and actionable
- [ ] PRD passes validation checklist

**Failure Handling:**
- **If:** PRD generation fails → Retry with more specific prompt, fallback to manual PRD creation
- **If:** Validation fails → Identify missing sections, re-generate those sections
- **If:** Sub-agent specs incomplete → Request PRD writer to expand specifications

**Tools Used:** Task tool (for prd-writer delegation)

**Time Target:** 3-5 minutes

---

### Phase 4: Implementation

**Objective:** Rewrite agent/command following PRD (if command) or optimization plan (if subagent), applying all recommendations

**Purpose:** Create optimized version adhering to all guidelines and best practices

**Inputs:**
- **If command:** Generated PRD from Phase 3
- **If subagent:** Optimization plan from Phase 2
- Current agent content
- Optimization recommendations

**Process:**

**For Commands (Slash Commands):**
1. **Invoke Built-In Slash Command Writer**
   - Delegate to `slash-command-writer` via Task tool
   - Provide PRD as specification
   - Request command following PRD structure exactly

2. **Slash Command Writer Implements**
   - Creates frontmatter (description, allowed-tools, model)
   - Implements all phases from PRD
   - Adds delegation patterns (Task tool invocations)
   - Applies "When/What/Why/Priority" to strategies
   - Creates comprehensive examples (80-120 lines, decision-focused)
   - Adds validation checklists (5-10 per phase)
   - Includes output format templates
   - Documents quality standards and constraints

3. **Write Optimized Command**
   - Location: `.claude/commands/{category}/{name}.md`
   - Version increment in changelog
   - Preserve original as `.bak` (rollback option)

**For Subagents:**
1. **Invoke Built-In Subagent Writer**
   - Delegate to `subagent-writer` via Task tool
   - Provide optimization plan and recommendations
   - Request subagent following SUBAGENT_TEMPLATE.md

2. **Subagent Writer Implements**
   - Creates frontmatter (name, description, tools, model, autoCommit)
   - Implements phases from template
   - Defines input/output contracts (JSON schemas)
   - Single responsibility enforcement
   - Complete tool usage guidance
   - Self-contained instructions

3. **Write Optimized Subagent**
   - Location: `.claude/agents/{category}/{name}.md`
   - Version increment
   - Preserve original as `.bak`

**Sub-Agent(s):**
- **`slash-command-writer`** (Built-In): Creates optimized commands
  - **Type:** Implementation
  - **Tools:** Inherit all
  - **Model:** Sonnet 4.5
  - **Auto-Commit:** false
- **`subagent-writer`** (Built-In): Creates optimized subagents
  - **Type:** Implementation
  - **Tools:** Inherit all
  - **Model:** Sonnet 4.5
  - **Auto-Commit:** false

**Outputs:**
```json
{
  "optimized_file": ".claude/commands/dev/debug.md",
  "backup_file": ".claude/commands/dev/debug.md.bak",
  "file_metadata": {
    "version": "2.0",
    "line_count": 1575,
    "estimated_tokens": 74500,
    "sections_count": 12
  },
  "changes_applied": [
    "Added 'When/What/Why/Priority' to Strategies A-G (lines 450-850)",
    "Expanded Examples 1-2 to 100+ lines with decision-making (lines 1400-1600)",
    "Replaced error categorization bash with tool call (line 320)",
    "Replaced health check bash with tool call (lines 610, 1050)",
    "Consolidated strategy documentation for consistency"
  ]
}
```

**Success Criteria:**
- [ ] Optimized file created in correct location
- [ ] Original preserved as `.bak`
- [ ] All recommendations applied
- [ ] Follows PRD specification (if command)
- [ ] Follows template structure (if subagent)
- [ ] Version incremented in changelog
- [ ] File syntactically valid (markdown + frontmatter)

**Failure Handling:**
- **If:** Writer agent fails → Retry with clearer prompt, escalate to manual
- **If:** Syntax errors introduced → Validate, fix, re-generate
- **If:** Recommendations not fully applied → Review, request re-implementation

**Tools Used:** Task tool (for writer delegation)

**Time Target:** 5-8 minutes

---

### Phase 5: Validation & Comparison

**Objective:** Validate optimized agent meets quality standards and measure improvements vs original

**Purpose:** Confirm optimizations successful, quantify gains, identify any regressions

**Inputs:**
- Original agent file (`.bak`)
- Optimized agent file (new version)
- Optimization plan (success metrics)
- Analysis report (baseline scores)

**Process:**
1. **Syntax Validation**
   - Parse markdown structure
   - Validate YAML frontmatter
   - Check all sections present
   - Verify internal links resolve

2. **Guideline Compliance Check**
   - Required sections present (per AGENT_PRD_GUIDELINES.md)
   - Strategies have "When/What/Why/Priority" structure
   - Examples are 80-120 lines with decision-making
   - Validation checklists present (5-10 per phase)
   - Tool abstractions documented
   - Delegation patterns correct

3. **Metrics Comparison**
   - Line count: Before vs after
   - Token count: Estimate before vs after
   - Token reduction percentage
   - Quality scores: Re-evaluate 7 patterns (0-5 each)
   - Overall score improvement

4. **Improvement Verification**
   - Token reduction matches estimate (±5%)
   - Quality score improvement ≥ expected
   - No regressions (no patterns got worse)
   - All success metrics met

5. **Generate Comparison Report**
   - Before/after table (metrics)
   - Improvements list (what changed, impact)
   - Issues list (any problems found)
   - Overall assessment (PASSED/FAILED/NEEDS_REVIEW)

**Sub-Agent(s):**
- **`optimization-validator`**: Measures and validates improvements
  - **Type:** Validation
  - **Tools:** Read, Bash (for token counting via wc)
  - **Model:** Haiku 4.5 (fast validation checks)
  - **Auto-Commit:** false

**Outputs:**
```json
{
  "validation_results": {
    "syntax_valid": true,
    "structure_valid": true,
    "follows_guidelines": true,
    "all_sections_present": true,
    "strategies_standardized": true,
    "examples_depth_adequate": true,
    "tool_abstractions_used": true
  },
  "metrics": {
    "original_lines": 1796,
    "optimized_lines": 1575,
    "line_reduction_percent": 12.3,
    "original_tokens": 85000,
    "optimized_tokens": 74500,
    "token_reduction_percent": 12.4
  },
  "quality_scores": {
    "before": {
      "command_design": 5,
      "delegation_framework": 5,
      "phase_workflow": 4,
      "context_optimization": 5,
      "parallel_execution": 5,
      "structured_formats": 5,
      "example_quality": 3,
      "overall": 4.6
    },
    "after": {
      "command_design": 5,
      "delegation_framework": 5,
      "phase_workflow": 5,
      "context_optimization": 5,
      "parallel_execution": 5,
      "structured_formats": 5,
      "example_quality": 5,
      "overall": 5.0
    },
    "improvement": 0.4
  },
  "improvements": [
    {
      "category": "strategy_consistency",
      "description": "All strategies now have 'When/What/Why/Priority' structure",
      "metric": "100% consistency (was 50%)"
    },
    {
      "category": "example_depth",
      "description": "Examples expanded from 15-30 lines to 80-120 lines with decision-making",
      "metric": "Average example depth: 105 lines (was 25 lines)"
    },
    {
      "category": "tool_abstraction",
      "description": "Error categorization and health checks now use tools instead of raw bash",
      "metric": "2 new tools, -800 tokens duplication"
    }
  ],
  "issues": [],
  "overall_assessment": "PASSED"
}
```

**Success Criteria:**
- [ ] All validation checks pass
- [ ] Token reduction ≥ target (or within ±5%)
- [ ] Quality score improved (no regressions)
- [ ] All success metrics met
- [ ] No critical issues identified
- [ ] Comparison report generated

**Failure Handling:**
- **If:** Validation fails → Identify specific issues, request fixes, re-validate
- **If:** Token reduction below target → Acceptable if quality improved significantly
- **If:** Quality regression detected → Investigate, revert if necessary, re-optimize
- **If:** Syntax errors → Fix immediately, re-validate

**Tools Used:** Task tool (for optimization-validator delegation), Bash (for token counting)

**Time Target:** ~1 minute

---

### Phase 6: Documentation & Changelog

**Objective:** Update related documentation, generate changelog entry, create optimization summary

**Purpose:** Ensure changes documented, discoverable, and traceable

**Inputs:**
- Optimized agent file
- Validation report (metrics, improvements)
- Original analysis report
- Optimization plan

**Process:**
1. **Update Agent Changelog**
   - Add version entry to agent file (e.g., `## Changelog` section)
   - Document changes applied (strategies standardized, examples deepened, tools abstracted)
   - Include metrics (token reduction %, quality improvement)

2. **Update Related Documentation**
   - If command references are broken, update them
   - If new tools created, document in tools/README.md
   - If PRD generated, ensure linked from command

3. **Generate Optimization Summary**
   - File: `ai/docs/optimizations/{agent-name}-optimization-YYYYMMDD.md`
   - Content: Analysis → Plan → Implementation → Validation → Results
   - Purpose: Audit trail, learning resource, optimization history

4. **Create Next Steps Guidance**
   - Suggest manual review areas
   - Recommend testing (if command has examples)
   - Propose follow-up optimizations (if any deferred)

**Sub-Agent(s):**
- **`docs-writer`** (Built-In): Updates documentation
  - **Type:** Documentation
  - **Tools:** Inherit all
  - **Model:** Sonnet 4.5
  - **Auto-Commit:** false

**Outputs:**
```json
{
  "changelog_updated": true,
  "docs_updated": [
    "tools/README.md (added dev:categorize-errors, dev:health-check)"
  ],
  "optimization_summary_file": "ai/docs/optimizations/debug-optimization-20251022.md",
  "next_steps": [
    "Review optimized debug.md manually",
    "Test command with real dev server errors",
    "Consider creating dev:start-monitored tool (deferred from optimization plan)"
  ]
}
```

**Success Criteria:**
- [ ] Changelog entry added to agent file
- [ ] Related docs updated (tools, references)
- [ ] Optimization summary created
- [ ] Next steps documented
- [ ] All documentation consistent

**Failure Handling:**
- **If:** Changelog update fails → Manually add entry, note in summary
- **If:** Docs update fails → Note in summary, request manual update

**Tools Used:** Task tool (for docs-writer delegation)

**Time Target:** 1-2 minutes

---

## Sub-Agent Design

### Sub-Agent: agent-analyzer

**Type:** Analysis

**Purpose:** Systematically evaluate agent against AGENT_PRD_GUIDELINES.md and 7 research patterns, generating comprehensive diagnostic report with strengths, weaknesses, and prioritized recommendations

**Tools:**
- Read (load agent file, research, guidelines)
- Grep (search for patterns, find examples, locate sections)

**Rationale:** Analysis-only agent, no modifications needed. Read and Grep sufficient for evaluation.

**Model:** claude-sonnet-4-5

**Rationale:** Complex reasoning required for pattern evaluation, trade-off analysis, scoring across 7 dimensions. Haiku insufficient for nuanced quality assessment.

**Auto-Commit:** false

**Rationale:** Analysis agent produces reports, not code changes.

**Input Schema:**
```json
{
  "agent_file_path": "absolute/path/to/agent.md",
  "agent_type": "command | subagent",
  "guidelines_path": "ai/agents/AGENT_PRD_GUIDELINES.md",
  "research_path": "ai/docs/agent-optimization-research.md",
  "optimization_goals": ["clarity", "maintainability", "token_efficiency"]
}
```

**Output Schema:**
```json
{
  "agent_info": {
    "name": "string",
    "type": "command | subagent",
    "line_count": "number",
    "estimated_tokens": "number"
  },
  "evaluation": {
    "overall_score": "number (0-5)",
    "category_scores": {
      "command_design": "number (0-5)",
      "delegation_framework": "number (0-5)",
      "phase_workflow": "number (0-5)",
      "context_optimization": "number (0-5)",
      "parallel_execution": "number (0-5)",
      "structured_formats": "number (0-5)",
      "example_quality": "number (0-5)"
    }
  },
  "strengths": [
    "string with line number reference"
  ],
  "weaknesses": [
    "string with specific issue and line numbers"
  ],
  "recommendations": [
    {
      "id": "string",
      "priority": "HIGH | MEDIUM | LOW",
      "category": "string",
      "issue": "string (what's wrong)",
      "recommendation": "string (specific fix)",
      "line_numbers": "string (e.g., '669-1007')",
      "estimated_impact": "string (token reduction, quality gain)",
      "effort": "string (hours estimate)",
      "example_before": "string (optional)",
      "example_after": "string (optional)"
    }
  ],
  "metrics": {
    "current_tokens": "number",
    "estimated_optimized_tokens": "number",
    "token_reduction_percent": "number",
    "guideline_sections_present": "number",
    "guideline_sections_total": "number",
    "adherence_percent": "number"
  }
}
```

**Responsibilities:**
1. Load and parse target agent file (read, extract sections)
2. Evaluate against 7 research patterns (score each 0-5)
3. Check AGENT_PRD_GUIDELINES.md completeness (required sections present)
4. Identify specific issues with line number references
5. Generate prioritized recommendations (HIGH/MEDIUM/LOW with effort/impact)
6. Estimate token reduction potential
7. Calculate overall quality score

**Success Criteria:**
- All 7 patterns evaluated with scores
- At least 3 strengths identified
- At least 3 weaknesses identified
- Recommendations prioritized by impact
- Specific line number references for all issues
- Token reduction estimate provided

**Error Scenarios:**
- **Scenario:** Agent file unreadable → **Action:** Report error, return partial analysis if possible
- **Scenario:** Guidelines/research missing → **Action:** Use internal knowledge, note limitation
- **Scenario:** Cannot score pattern → **Action:** Mark as N/A, explain why

**Example Invocation:**
```markdown
Main agent delegates:
Task(
  subagent_type="agent-analyzer",
  description="Analyze /dev:debug command against optimization guidelines",
  prompt="Analyze the agent at .claude/commands/dev/debug.md.

  Evaluate against 7 research patterns (command design, delegation, phases, context, parallel execution, structured formats, examples).

  Check completeness against AGENT_PRD_GUIDELINES.md.

  Identify strengths (what to preserve) and weaknesses (what to improve) with specific line number references.

  Generate prioritized recommendations (HIGH/MEDIUM/LOW) with effort estimates (hours) and impact estimates (token reduction %, quality gain).

  Estimate overall token reduction potential.

  Return structured JSON following output schema."
)
```

**Dependencies:**
- None (standalone analysis agent)

**Invoked By:**
- `/agents:optimizer` (Phase 1)

---

### Sub-Agent: optimization-planner

**Type:** Planning

**Purpose:** Convert analysis recommendations into actionable optimization roadmap with sequenced phases, effort/impact estimates, and success metrics

**Tools:**
- Read (access analysis report, guidelines for reference)

**Rationale:** Planning agent uses analysis output, no file searches needed. Read sufficient.

**Model:** claude-sonnet-4-5

**Rationale:** Strategic planning requires complex reasoning, trade-off analysis, sequencing logic. Haiku insufficient.

**Auto-Commit:** false

**Rationale:** Planner produces roadmap document, not code changes.

**Input Schema:**
```json
{
  "analysis_report": {
    "agent_info": "object",
    "evaluation": "object",
    "strengths": "array",
    "weaknesses": "array",
    "recommendations": "array",
    "metrics": "object"
  },
  "optimization_goals": ["clarity", "maintainability", "token_efficiency"]
}
```

**Output Schema:**
```json
{
  "optimization_phases": [
    {
      "phase": "number",
      "name": "string",
      "recommendations": ["rec-id"],
      "priority": "HIGH | MEDIUM | LOW",
      "estimated_effort": "string (hours)",
      "estimated_impact": "string (%, description)",
      "tasks": ["string (actionable task)"]
    }
  ],
  "total_estimates": {
    "effort_hours": "number",
    "token_reduction_percent": "number",
    "net_token_reduction": "number",
    "quality_improvement": "string (before → after score)"
  },
  "implementation_order": [
    "string (phase description with priority and effort)"
  ],
  "success_metrics": [
    "string (measurable success criterion)"
  ]
}
```

**Responsibilities:**
1. Group recommendations by logical phase (consistency fixes, example improvements, tool abstractions, etc.)
2. Estimate effort for each phase (hours based on complexity)
3. Estimate impact for each phase (token reduction %, quality gain)
4. Sequence phases by priority and dependencies (high-priority first, dependencies respected)
5. Define success metrics (how to measure if optimization succeeded)
6. Calculate total estimates (sum of efforts, net token reduction, quality improvement)
7. Create implementation order (prioritized task list)

**Success Criteria:**
- All recommendations assigned to phases
- Effort and impact estimates for each phase
- Clear implementation order
- Measurable success metrics defined
- Total estimates calculated

**Error Scenarios:**
- **Scenario:** Recommendations conflict → **Action:** Resolve conflict, document trade-off, pick best option
- **Scenario:** Effort estimate unknown → **Action:** Provide range (e.g., "2-4 hours"), mark uncertain
- **Scenario:** Impact unclear → **Action:** Conservative estimate, note uncertainty

**Example Invocation:**
```markdown
Task(
  subagent_type="optimization-planner",
  description="Create optimization roadmap from analysis",
  prompt="Convert the analysis recommendations into a phased implementation plan.

  Group recommendations by logical phases (e.g., consistency fixes, example improvements, tool abstractions).

  Estimate effort (hours) and impact (token reduction %, quality gain) for each phase.

  Sequence phases by priority (HIGH first) and dependencies.

  Define measurable success metrics (how to know if optimization succeeded).

  Calculate total estimates (effort hours, token reduction, quality improvement).

  Return structured JSON following output schema."
)
```

**Dependencies:**
- Depends on: agent-analyzer (receives analysis report as input)

**Invoked By:**
- `/agents:optimizer` (Phase 2)

---

### Sub-Agent: optimization-validator

**Type:** Validation

**Purpose:** Validate optimized agent meets quality standards, measure improvements vs original, generate before/after comparison report

**Tools:**
- Read (load original and optimized files)
- Bash (for token counting: `wc -w file.md`)

**Rationale:** Validation requires file comparison and token counting. Bash for simple counting commands, Read for file content.

**Model:** claude-haiku-4-5

**Rationale:** Fast validation checks, straightforward comparison logic. Haiku sufficient for structured validation tasks.

**Auto-Commit:** false

**Rationale:** Validator produces reports, not code changes.

**Input Schema:**
```json
{
  "original_file_path": "string (path to .bak file)",
  "optimized_file_path": "string (path to new version)",
  "optimization_plan": {
    "success_metrics": ["string"],
    "total_estimates": "object"
  },
  "baseline_scores": {
    "overall_score": "number",
    "category_scores": "object"
  }
}
```

**Output Schema:**
```json
{
  "validation_results": {
    "syntax_valid": "boolean",
    "structure_valid": "boolean",
    "follows_guidelines": "boolean",
    "all_sections_present": "boolean",
    "strategies_standardized": "boolean",
    "examples_depth_adequate": "boolean",
    "tool_abstractions_used": "boolean"
  },
  "metrics": {
    "original_lines": "number",
    "optimized_lines": "number",
    "line_reduction_percent": "number",
    "original_tokens": "number",
    "optimized_tokens": "number",
    "token_reduction_percent": "number"
  },
  "quality_scores": {
    "before": "object (7 pattern scores + overall)",
    "after": "object (7 pattern scores + overall)",
    "improvement": "number (delta)"
  },
  "improvements": [
    {
      "category": "string",
      "description": "string",
      "metric": "string (quantified improvement)"
    }
  ],
  "issues": [
    "string (problems found, if any)"
  ],
  "overall_assessment": "PASSED | FAILED | NEEDS_REVIEW"
}
```

**Responsibilities:**
1. Validate YAML frontmatter (syntax, required fields)
2. Check all required sections present (per guidelines)
3. Count lines and estimate tokens (before/after) using `wc`
4. Verify improvements match plan (token reduction within ±5%)
5. Re-evaluate quality scores (7 patterns, 0-5 each)
6. Identify any regressions (patterns that got worse)
7. Generate comparison report (before/after metrics, improvements, issues)
8. Determine overall assessment (PASSED/FAILED/NEEDS_REVIEW)

**Success Criteria:**
- All validation checks pass
- Measurable improvements confirmed
- No critical issues identified
- Token reduction matches estimate (±5%)
- Quality score improved (no regressions)

**Error Scenarios:**
- **Scenario:** Syntax errors in optimized file → **Action:** Mark FAILED, list errors, suggest fixes
- **Scenario:** Token reduction below target → **Action:** Mark NEEDS_REVIEW if quality improved, FAILED if quality also regressed
- **Scenario:** Quality regression detected → **Action:** Mark FAILED, identify which patterns regressed, recommend revert

**Example Invocation:**
```markdown
Task(
  subagent_type="optimization-validator",
  description="Validate optimized agent and measure improvements",
  prompt="Compare the original agent (.claude/commands/dev/debug.md.bak) with the optimized version (.claude/commands/dev/debug.md).

  Validate:
  - YAML frontmatter syntax
  - All required sections present
  - Strategies have 'When/What/Why/Priority' structure
  - Examples are 80-120 lines with decision-making
  - Tool abstractions used instead of raw bash

  Measure:
  - Line count before/after
  - Token count before/after (use wc -w)
  - Token reduction percentage
  - Quality scores before/after (re-evaluate 7 patterns)

  Verify improvements match optimization plan estimates (±5%).

  Identify any issues or regressions.

  Return structured JSON with overall assessment (PASSED/FAILED/NEEDS_REVIEW)."
)
```

**Dependencies:**
- Depends on: optimization-planner (uses success metrics from plan)
- Depends on: agent-analyzer (uses baseline scores for comparison)

**Invoked By:**
- `/agents:optimizer` (Phase 5)

---

## Workflow & Orchestration

### Overview Diagram

```
User invokes /agents:optimizer <target_file>
    ↓
[Phase 0: Input Validation & Context Loading] (<10s)
    └→ Load target, guidelines, research
    ↓
[Phase 1: Comprehensive Analysis] (~2-3 min)
    └→ Task(agent-analyzer)
    ↓
[Phase 2: Optimization Planning] (~1-2 min)
    └→ Task(optimization-planner)
    ↓
User Approval Gate: Review optimization plan
    ├→ Proceed (default)
    ├→ Select phases
    └→ Cancel
    ↓
[Phase 3: PRD Generation] (~3-5 min) [CONDITIONAL: If command]
    └→ Task(prd-writer)
    ↓
[Phase 4: Implementation] (~5-8 min)
    ├→ Task(slash-command-writer) [if command]
    └→ Task(subagent-writer) [if subagent]
    ↓
[Phase 5: Validation & Comparison] (~1 min)
    └→ Task(optimization-validator)
    ↓
[Phase 6: Documentation & Changelog] (~1-2 min)
    └→ Task(docs-writer)
    ↓
Present optimization summary with metrics
```

### Execution Flow

**Sequential Pipeline with Conditional Branching:**
- Phases execute in order (0 → 1 → 2 → 3/4 → 5 → 6)
- Single user approval gate (after planning)
- Conditional branching (PRD generation only for commands)
- Validation gate before documentation

**Parallelization Opportunities:**
- None in current design (phases have sequential dependencies)
- Future enhancement: Batch mode could optimize multiple agents in parallel

**Total Time:** 15-25 minutes (vs 6-8 hours manual)

**Time Savings:** ~95% reduction

### Orchestration Pattern

**Pattern:** Sequential Pipeline with Conditional Branching

**Rationale:**
- Each phase depends on previous results (cannot parallelize)
- PRD generation conditional on agent type (commands only)
- User approval gate gates implementation (safety)
- Validation gates quality (prevents bad optimizations)

---

## User Interaction Design

### Gate 1: Target Selection (Invocation)

**Trigger:** User invokes `/agents:optimizer`

**Present:**
```
/agents:optimizer <file_path>

Examples:
  /agents:optimizer .claude/commands/dev/debug.md
  /agents:optimizer .claude/agents/git/commit-grouper.md
```

**User Provides:**
- File path to target agent (command or subagent)

**Validation:**
- File exists
- File in `.claude/commands/` or `.claude/agents/`
- File readable

**Options:**
- Valid path → Proceed to Phase 0
- Invalid path → Error message, request correct path

---

### Gate 2: Optimization Plan Review (After Phase 2)

**Trigger:** Planning complete

**Present:** (See Phase 2 approval gate section above)

**Summary:**
- Analysis summary (quality score, token count, adherence %)
- Top strengths and weaknesses
- Optimization roadmap (phases with effort/impact)
- Total estimates (time, token reduction, quality improvement)
- Success metrics

**Options:**
1. ✅ Proceed with all phases (recommended)
   - Continue to Phase 3 (if command) or Phase 4 (if subagent)
2. 🔄 Select specific phases only
   - Show phase menu
   - User selects subset
   - Continue with selected phases
3. ❌ Cancel optimization
   - Save analysis report
   - Exit gracefully

**Timeout:** 2 minutes, default: Proceed (Option 1)

**Validation:**
- [ ] User choice recorded
- [ ] Selected phases documented

---

### Gate 3: Optimization Summary (After Phase 6)

**Trigger:** All phases complete

**Present:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Optimization Complete: /dev:debug
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results:
  ✓ Token Reduction: -10,500 tokens (12.4%)
  ✓ Quality Improvement: 4.6 → 5.0
  ✓ Guideline Adherence: 90% → 100%

Changes Applied:
  1. Strategy Standardization (Strategies A-G)
     - Added "When/What/Why/Priority" structure
     - Token reduction: -2,500 (25% of Phase 2)

  2. Example Deepening (Examples 1-2)
     - Expanded from 15-30 lines to 80-120 lines
     - Added decision-making, trade-offs, time metrics
     - Token increase: +1,500 (pedagogical value)

  3. Tool Abstraction
     - Created dev:categorize-errors tool
     - Created dev:health-check tool
     - Token reduction: -800 (eliminated duplication)

Files Modified:
  ✓ .claude/commands/dev/debug.md (optimized)
  ✓ .claude/commands/dev/debug.md.bak (backup)
  ✓ ai/agents/dev/debug.prd.md (PRD created)
  ✓ tools/README.md (documented new tools)
  ✓ ai/docs/optimizations/debug-optimization-20251022.md (summary)

Validation: PASSED
  ✓ All syntax checks pass
  ✓ All guideline sections present
  ✓ Token reduction within estimate (12.4% vs 10-15% target)
  ✓ Quality improvement confirmed (no regressions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Review optimized debug.md manually
  2. Test command with real scenarios
  3. Commit changes: /git:commit
  4. Optional: Create deferred tools (dev:start-monitored)

Optimization History:
  ai/docs/optimizations/debug-optimization-20251022.md
```

**No User Action Required** (informational)

---

## Quality Gates & Validation

### Level 1: Input Validation (Phase 0)

**Validates:** Target file is valid and accessible

**Checks:**
- [ ] File exists at provided path
- [ ] File in `.claude/commands/` or `.claude/agents/`
- [ ] File is readable
- [ ] File contains valid markdown
- [ ] Frontmatter parseable (YAML)
- [ ] Research and guidelines documents accessible

**Failure Action:**
- Report specific error (file not found, invalid format, etc.)
- Exit gracefully
- Do not proceed to analysis

---

### Level 2: Phase Output Validation

**Validates:** Each phase produces correct, complete outputs

**Phase 1 Validation (Analysis):**
- [ ] All 7 patterns evaluated (scores 0-5)
- [ ] Strengths list non-empty (≥3 items)
- [ ] Weaknesses list non-empty (≥3 items)
- [ ] Recommendations prioritized (HIGH/MEDIUM/LOW)
- [ ] Line number references specific
- [ ] Token reduction estimate provided

**Phase 2 Validation (Planning):**
- [ ] All recommendations assigned to phases
- [ ] Effort estimates provided (hours)
- [ ] Impact estimates provided (tokens %, quality)
- [ ] Implementation order defined
- [ ] Success metrics measurable

**Phase 3 Validation (PRD, if command):**
- [ ] PRD file created in correct location
- [ ] All required sections present (per guidelines)
- [ ] Task decomposition complete (3-7 phases)
- [ ] Sub-agent specifications complete
- [ ] Workflow orchestration defined
- [ ] Quality gates defined

**Phase 4 Validation (Implementation):**
- [ ] Optimized file created
- [ ] Original backed up (`.bak`)
- [ ] File syntactically valid
- [ ] Version incremented
- [ ] Recommendations applied

**Phase 5 Validation (Validation itself):**
- [ ] All validation checks executed
- [ ] Metrics calculated (tokens, quality scores)
- [ ] Improvements identified
- [ ] Issues list populated (if any)
- [ ] Overall assessment determined

**Phase 6 Validation (Documentation):**
- [ ] Changelog updated
- [ ] Related docs updated
- [ ] Optimization summary created
- [ ] Next steps documented

**Failure Action:** Halt pipeline, report specific validation failure, request fixes, retry

---

### Level 3: Final Output Validation

**Validates:** Complete optimization produces desired outcome

**Checks:**
- [ ] Optimized file syntactically valid
- [ ] Token reduction ≥ 5% (target: 10-15%)
- [ ] Quality score improved (no regressions)
- [ ] All guideline adherence checks pass
- [ ] Success metrics met (per optimization plan)
- [ ] No critical issues identified

**Success Criteria:**
1. File valid and deployable
2. Measurable improvements achieved
3. No breaking changes introduced
4. Documentation complete

**Failure Action:**
- Should not reach this if previous validations work
- If failures detected: investigate, potentially revert, re-optimize

---

## Tool Abstraction

### When to Create Tools

This command itself is a meta-tool (optimizes agents). It does not create tools during execution (tool creation is a recommendation in optimization plans, executed manually or by future enhancements).

**Future Tool Candidates:**
- `pnpm tools agents:analyze` - Run agent-analyzer standalone
- `pnpm tools agents:validate` - Run optimization-validator standalone
- `pnpm tools agents:tokens` - Count tokens in agent file

**Decision:** Start without custom tools. Optimization command uses subagents for all operations. If patterns emerge (multiple commands need token counting), extract to tool.

---

## Strategy Documentation

### Strategy A: Command Optimization

**When:** Target is a slash command (file in `.claude/commands/**/*.md`)

**What it does:** Full PRD generation → slash-command-writer workflow

**Why use this:** Commands are complex orchestrators requiring comprehensive specifications before rewriting

**Priority:** HIGH (commands are user-facing, high impact)

**Steps:**
1. Analyze command against 7 patterns
2. Generate optimization plan
3. Create PRD following AGENT_PRD_GUIDELINES.md
4. Rewrite command via slash-command-writer
5. Validate improvements

**Success Criteria:**
- [ ] PRD comprehensive (all required sections)
- [ ] Command follows PRD exactly
- [ ] Delegation patterns correct
- [ ] Validation gates in place

---

### Strategy B: Subagent Optimization

**When:** Target is a subagent (file in `.claude/agents/**/*.md`)

**What it does:** Direct optimization via subagent-writer (no PRD)

**Why use this:** Subagents follow template, less complexity, PRD overhead not justified

**Priority:** HIGH (subagents are reusable, impact multiple commands)

**Steps:**
1. Analyze subagent against 7 patterns
2. Generate optimization plan
3. Skip PRD generation (use template structure)
4. Rewrite subagent via subagent-writer
5. Validate improvements

**Success Criteria:**
- [ ] Subagent follows template structure
- [ ] Single responsibility maintained
- [ ] Input/output contracts clear
- [ ] Self-contained instructions

---

### Strategy C: Iterative Optimization

**When:** User selects specific phases only (not full optimization)

**What it does:** Execute selected phases, skip others

**Why use this:** Allows incremental improvements, focused changes, testing before full commitment

**Priority:** MEDIUM (useful for large agents, conservative optimizations)

**Steps:**
1. Present phase menu after planning
2. User selects phases (e.g., "1,3" for phases 1 and 3 only)
3. Execute selected phases in order
4. Validate partial optimization
5. Document which phases applied

**Success Criteria:**
- [ ] Selected phases executed correctly
- [ ] Skipped phases documented
- [ ] Partial improvements validated
- [ ] User can resume later

---

## Context Efficiency Design

Apply research findings:

**Main Command (`/agents:optimizer`):**
- **Estimated tokens:** 10-15K (coordination, workflow, user interaction only)
- **Role:** Orchestrator (delegates all heavy lifting)
- **Efficiency:** High (minimal context, clear delegation)

**Analysis Subagent (`agent-analyzer`):**
- **Estimated tokens:** 20-30K (detailed evaluation logic, 7 patterns, scoring, recommendations)
- **Role:** Specialist (deep analysis)
- **Efficiency:** Excellent (isolated context, single responsibility)

**Planning Subagent (`optimization-planner`):**
- **Estimated tokens:** 8-10K (roadmap generation, sequencing logic)
- **Role:** Specialist (strategic planning)
- **Efficiency:** Excellent (focused task)

**Validation Subagent (`optimization-validator`):**
- **Estimated tokens:** 5-8K (fast checks, metrics comparison)
- **Role:** Specialist (validation)
- **Efficiency:** Very high (Haiku model, simple logic)

**Implementation via Built-In Writers:**
- **PRD Writer:** Inherits context (research, guidelines, analysis)
- **Slash Command Writer:** Inherits context (PRD, guidelines)
- **Subagent Writer:** Inherits context (template, guidelines)
- **Docs Writer:** Inherits context (optimization summary)

**Total System Context:** ~50-70K tokens (main + 3 subagents + built-in context)

**Efficiency Assessment:** Excellent
- Specialized agents prevent context pollution
- Each agent has single responsibility
- Clear delegation boundaries
- Research shows 8x efficiency gains with this pattern

---

## Performance Requirements

| Phase | Target | Acceptable | Failure |
|-------|--------|-----------|---------|
| Phase 0: Input Validation | <10s | <30s | >1 min |
| Phase 1: Analysis | 2-3 min | 1-5 min | >10 min |
| Phase 2: Planning | 1-2 min | 1-3 min | >5 min |
| User Approval Gate | 30s-2 min | <5 min | >10 min (timeout) |
| Phase 3: PRD Generation | 3-5 min | 2-8 min | >15 min |
| Phase 4: Implementation | 5-8 min | 4-12 min | >20 min |
| Phase 5: Validation | <1 min | <2 min | >5 min |
| Phase 6: Documentation | 1-2 min | 1-3 min | >5 min |
| **Total (Command)** | **15-25 min** | **12-35 min** | **>60 min** |
| **Total (Subagent)** | **10-18 min** | **8-25 min** | **>45 min** |

**Performance vs Manual:**
- Manual optimization: 6-8 hours (expert)
- Automated optimization: 15-25 minutes
- **Time savings: 95%** (24x faster)

---

## Success Metrics

### Efficiency Metrics
- **Time Savings:** 95% reduction (6-8 hours → 15-25 min)
- **Expert Hours Saved:** 320 hours/year (assuming 40 agents × 8 hours each)
- **Optimization Throughput:** 40 agents optimizable in 16 hours (vs 320 hours manual)

### Quality Metrics
- **Token Efficiency:** 10-15% average reduction per optimized agent
- **Quality Improvement:** Average score increase of 0.3-0.5 (on 0-5 scale)
- **Guideline Adherence:** 100% (measured via checklist validation)
- **Consistency:** All optimized agents follow same patterns (7 research patterns)

### Adoption Metrics
- **Coverage:** 80% of agents optimized within 6 months (32/40 agents)
- **Re-optimization Rate:** <10% (agents stay optimized, don't drift)
- **User Satisfaction:** 90%+ approval on plan review gate (users trust recommendations)

### Impact Metrics
- **Developer Experience:** 50% reduction in agent-related debugging time
- **Maintenance Burden:** 40% reduction in agent update effort (DRY, tool abstractions)
- **Knowledge Distribution:** 100% of team can optimize agents (not just platform experts)

---

## Testing & Validation

### Test Scenarios

**Scenario 1: Optimize Simple Command**
- **Input:** `.claude/commands/planning/research.md` (minimal changes needed)
- **Expected:** Analysis identifies minor improvements, planning suggests 1-2 phases, optimization quick (<15 min)
- **Validation:** Token reduction modest (5-10%), quality score slight improvement

**Scenario 2: Optimize Complex Command**
- **Input:** `.claude/commands/dev/debug.md` (major restructuring required)
- **Expected:** Analysis identifies many issues, planning suggests 3-4 phases, comprehensive PRD generated
- **Validation:** Token reduction significant (10-15%), quality score major improvement (4.6 → 5.0)

**Scenario 3: Optimize Subagent**
- **Input:** `.claude/agents/git/commit-grouper.md` (already well-structured)
- **Expected:** Analysis finds minimal issues, planning suggests 1 phase (minor polish), PRD skipped
- **Validation:** Token reduction minimal (<5%), quality maintained or slightly improved

**Scenario 4: Optimize Already-Optimized Agent**
- **Input:** Recently optimized agent (v2.0)
- **Expected:** Analysis scores high (4.8-5.0), planning suggests no changes or minimal polish
- **Validation:** Minimal recommendations, user chooses to skip optimization

**Scenario 5: Invalid Input Handling**
- **Input:** File not found, wrong directory, invalid markdown
- **Expected:** Phase 0 catches error, reports to user, exits gracefully
- **Validation:** Clear error message, no crashes, no partial state

**Scenario 6: User Cancels at Approval Gate**
- **Input:** Valid agent, analysis complete, user cancels at approval
- **Expected:** Save analysis report, exit gracefully, no changes made
- **Validation:** Analysis saved to `ai/docs/optimizations/{name}-analysis-{date}.md`

---

## Migration & Rollout Plan

### Phase 1: MVP Development (Week 1-2)

**Deliverables:**
- Create 3 core subagents (analyzer, planner, validator)
- Implement `/agents:optimizer` main command
- Basic workflow (Phases 0-6)
- Test on 2-3 pilot agents

**Success Criteria:**
- [ ] Command successfully optimizes debug command (known case)
- [ ] All subagents function correctly
- [ ] Validation catches errors
- [ ] Documentation complete

---

### Phase 2: Validation & Refinement (Week 3)

**Deliverables:**
- Optimize 5-10 agents as validation
- Gather metrics (time, token reduction, quality improvements)
- Refine based on feedback
- Document edge cases

**Success Criteria:**
- [ ] 5 agents optimized successfully
- [ ] Average time <20 minutes
- [ ] Average token reduction 10-15%
- [ ] No regressions detected
- [ ] User approval rate >80%

---

### Phase 3: Rollout & Training (Week 4+)

**Deliverables:**
- Document usage in project README
- Create user guide with examples
- Train team on `/agents:optimizer` workflow
- Set optimization schedule (quarterly reviews)

**Success Criteria:**
- [ ] All team members can use command
- [ ] Optimization schedule established
- [ ] 20 agents optimized in first quarter
- [ ] 80% coverage within 6 months

---

### Phase 4: Batch Mode & Automation (Future)

**Deliverables:**
- Batch optimization (optimize directory)
- CI integration (suggest optimizations on PR)
- Optimization history tracking
- Visual diff reports

**Success Criteria:**
- [ ] Can optimize 10 agents in single command
- [ ] CI detects drift from standards
- [ ] Optimization history queryable
- [ ] Before/after diffs clear

---

## Open Questions

### High Priority (Blocking MVP)
- [ ] Should we support batch optimization (multiple agents at once) in v1.0 or defer to v2.0?
- [ ] How to handle agent-specific exceptions (some agents intentionally violate patterns)?
- [ ] Should validation be strict (block on any failure) or permissive (warn but allow)?

### Medium Priority (Nice to Have)
- [ ] Should we generate A/B comparison reports (side-by-side markdown)?
- [ ] Should we track optimization history (git-like versioning for agents)?
- [ ] Should we support "dry-run" mode (analysis + plan without implementation)?
- [ ] Should we create optimization presets (quick/balanced/comprehensive)?

### Low Priority (Future Enhancements)
- [ ] Should we create visual dashboards (agent quality scores, optimization trends)?
- [ ] Should we support custom guidelines (per-project optimization rules)?
- [ ] Should we integrate with CI (auto-suggest optimizations on agent changes)?

---

## Future Enhancements (v2.0+)

### Optimization Presets
- **Quick:** Token reduction only (no structural changes)
- **Balanced:** Token + clarity (moderate structural changes)
- **Comprehensive:** Full restructure (all recommendations applied)

**Invocation:** `/agents:optimizer <file> --preset balanced`

---

### Batch Optimization Mode
- **Feature:** Optimize all commands in directory
- **Invocation:** `/agents:optimizer .claude/commands/dev/ --batch`
- **Process:** Analyze all, prioritize by quality score, optimize in sequence
- **Output:** Summary report with all optimizations

---

### Learning Mode
- **Feature:** Track common issues across all optimizations
- **Purpose:** Identify systematic patterns (e.g., "70% of agents lack 'When/What/Why' in strategies")
- **Action:** Proactively suggest fixes, update templates, improve guidelines

---

### Visual Diff Reports
- **Feature:** Side-by-side comparison of before/after
- **Format:** Markdown with diff syntax highlighting
- **Sections:** Strategies comparison, examples comparison, metrics comparison

---

### Optimization History
- **Feature:** Track all optimizations in `.agents-history/`
- **Format:** Git-like versioning (v1.0, v1.1, v2.0)
- **Query:** `pnpm tools agents:history debug` → Show all optimization runs

---

### Auto-Optimization CI Integration
- **Feature:** CI job runs analyzer on changed agents
- **Action:** Comments on PR with recommendations
- **Trigger:** Any `.md` file change in `.claude/`

---

### Performance Profiling
- **Feature:** Actual execution time measurements (not estimates)
- **Metrics:** Time per phase, token usage per subagent, quality score deltas
- **Dashboard:** Visual trends over time

---

## References

### Research & Analysis
1. **Agent Optimization Research** - `ai/docs/agent-optimization-research.md`
   - 7 optimization patterns (command design, delegation, phases, context, parallel execution, structured formats, examples)
   - 85KB comprehensive best practices
   - Industry sources + internal codebase analysis

2. **Agent PRD Guidelines** - `ai/agents/AGENT_PRD_GUIDELINES.md`
   - PRD structure template
   - Sub-agent design principles
   - Tool abstraction guidelines
   - Example quality standards
   - Context efficiency patterns

3. **Debug Command Analysis** - `ai/docs/debug-command-analysis.md`
   - Real-world optimization case study
   - Before/after comparison
   - Specific recommendations with line numbers
   - Tool abstraction opportunities

4. **Debug Command PRD** - `ai/agents/dev/debug.prd.md`
   - Comprehensive PRD example (~1,900 lines)
   - Task decomposition (6 phases)
   - Sub-agent specifications (6 specialists)
   - Workflow orchestration
   - Success metrics

---

### Related Commands & Agents
1. **`/git:commit`** - `.claude/commands/git/commit.md`
   - Exemplar orchestration pattern
   - Parallel subagent invocation
   - Structured output contracts

2. **`commit-grouper`** - `.claude/agents/git/commit-grouper.md`
   - Single responsibility pattern
   - 974 lines, excellent structure
   - Input/output contracts

3. **`/dev:debug`** - `.claude/commands/dev/debug.md`
   - Optimization target (v1.0 → v2.0)
   - Phase 0 advanced delegation
   - Context isolation patterns

---

### Official Sources (via Research)
4. [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents) - Anthropic
5. [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) - Anthropic
6. [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic
7. [Context Engineering: Slash Commands vs Subagents](https://jxnl.co/writing/2025/08/29/context-engineering-slash-commands-subagents/) - Jason Liu (8x efficiency research)

---

## Appendices

### Appendix A: Optimization Checklist

Complete checklist for validating optimized agents:

**Structure:**
- [ ] YAML frontmatter valid and complete
- [ ] All required sections present
- [ ] Section hierarchy logical (Core Directive → Methodology → Quality → Examples → Integration)
- [ ] Information density high (tables, checklists, schemas used)

**Strategies (if applicable):**
- [ ] All strategies use "When/What/Why/Priority" pattern
- [ ] Priorities consistent across strategies
- [ ] Validation checklists present (5-10 per strategy)
- [ ] Examples concrete and actionable

**Examples:**
- [ ] 3-5 examples covering common, complex, edge cases
- [ ] Each example 80-120 lines (decision-focused)
- [ ] Decision-making explicit ("Why option A over B?")
- [ ] Time/quality metrics included
- [ ] Lessons/trade-offs documented

**Tool Abstractions:**
- [ ] Complex operations encapsulated in `pnpm tools` commands
- [ ] Raw bash used only for simple one-liners
- [ ] Duplicate logic eliminated (DRY principle)
- [ ] Tools documented in tools/README.md

**Delegation:**
- [ ] Complex analysis delegated to subagents
- [ ] Parallel execution used where applicable
- [ ] Delegation syntax correct (all Task calls in single response)
- [ ] Context isolation for verbose operations

**Context Optimization:**
- [ ] Verbose output written to files (logs), not main context
- [ ] Summaries loaded, not full logs
- [ ] Subagents handle noise isolation
- [ ] No context pollution (>90% useful signal)

**Validation Gates:**
- [ ] Each phase has validation checklist
- [ ] Success criteria measurable
- [ ] Failure handling documented
- [ ] User approval gates at key decision points

---

### Appendix B: Evaluation Rubric (7 Patterns, 0-5 Scale)

**Pattern 1: Command Design (Orchestration vs Implementation)**
- **5:** Command orchestrates only, all heavy lifting delegated
- **4:** Mostly orchestration, minor direct implementation
- **3:** Balanced (some orchestration, some implementation)
- **2:** Mostly direct implementation, minimal delegation
- **1:** No delegation, command does everything
- **0:** Not applicable or cannot assess

**Pattern 2: Delegation Framework**
- **5:** Clear triggers, decision tree, correct syntax, parallel execution
- **4:** Good delegation, minor syntax issues or missing parallelization
- **3:** Adequate delegation, no decision tree
- **2:** Minimal delegation, unclear when to use
- **1:** No delegation framework
- **0:** N/A

**Pattern 3: Phase/Workflow Definition**
- **5:** 3-7 phases, clear objectives, validation gates, explicit transitions
- **4:** Good phases, minor validation gaps
- **3:** Phases present, objectives unclear
- **2:** Minimal phase structure
- **1:** No phases, linear flow only
- **0:** N/A

**Pattern 4: Context Optimization**
- **5:** Isolation via files/subagents, summaries only, >90% signal
- **4:** Good isolation, minor leaks
- **3:** Some isolation, still verbose in main context
- **2:** Minimal isolation, context pollution present
- **1:** No isolation, all noise in main thread
- **0:** N/A

**Pattern 5: Parallel Execution**
- **5:** Correct syntax, explicit guidance, time savings documented
- **4:** Correct syntax, guidance present, no metrics
- **3:** Parallel execution mentioned, syntax unclear
- **2:** Opportunities missed (sequential where parallel possible)
- **1:** No parallel execution
- **0:** N/A (not applicable for simple agents)

**Pattern 6: Structured Formats**
- **5:** Extensive use of tables, checklists, schemas, visual structure
- **4:** Good use of structured formats, some prose
- **3:** Balanced (some structure, some prose)
- **2:** Mostly prose, minimal structure
- **1:** All prose, no structured formats
- **0:** N/A

**Pattern 7: Example Quality**
- **5:** 3-5 examples, 80-120 lines, decision-focused, diverse, metrics
- **4:** Good examples, minor depth issues
- **3:** Examples present, output-focused (not decision-focused)
- **2:** Minimal examples, shallow
- **1:** No examples or trivial only
- **0:** N/A

---

### Appendix C: Sample Analysis Report

**Example:** Analysis of `/dev:debug` command (v1.0)

```json
{
  "agent_info": {
    "name": "debug",
    "type": "command",
    "file": ".claude/commands/dev/debug.md",
    "line_count": 1796,
    "estimated_tokens": 85000,
    "version": "1.0"
  },
  "evaluation": {
    "overall_score": 4.6,
    "category_scores": {
      "command_design": 5,
      "delegation_framework": 5,
      "phase_workflow": 4,
      "context_optimization": 5,
      "parallel_execution": 5,
      "structured_formats": 5,
      "example_quality": 3
    }
  },
  "strengths": [
    "Exemplary Phase 0 advanced delegation pattern (lines 93-476) with 6 specialists",
    "Excellent context isolation via /tmp logs (lines 516-528) preventing 91% pollution",
    "Correct parallel invocation syntax documented (lines 442-475) with 8x efficiency",
    "Comprehensive validation checklists (7-8 per phase, lines 647-656, 1036-1044, 1168-1177)",
    "Example 5 is gold standard (lines 1606-1718): 112 lines, decision-focused, metrics"
  ],
  "weaknesses": [
    "Strategies A-G lack 'When/What/Why/Priority' structure (lines 669-1007) present in H-L",
    "Examples 1-4 shallow, output-focused (lines 1441-1602): 15-30 lines, no decisions",
    "Duplicate error categorization logic (lines 549-589 Phase 1, repeated Phase 3)",
    "Health check commands repeated (Phase 1 lines 604-612, Phase 3 lines 1086-1108)",
    "No tool abstractions for common operations (error parsing, health checks)"
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "HIGH",
      "category": "strategy_consistency",
      "issue": "Strategies A-G lack 'When/What/Why/Priority' structure present in H-L",
      "recommendation": "Add 'When/What/Why/Priority' to all strategies A-G",
      "line_numbers": "669-1007",
      "estimated_impact": "-2,500 tokens (25% Phase 2), high clarity improvement",
      "effort": "2-3 hours"
    }
  ],
  "metrics": {
    "current_tokens": 85000,
    "estimated_optimized_tokens": 82700,
    "token_reduction_percent": 2.7,
    "guideline_sections_present": 18,
    "guideline_sections_total": 20,
    "adherence_percent": 90
  }
}
```

---

### Appendix D: Sample Optimization Plan

**Example:** Optimization plan for `/dev:debug` command

```json
{
  "optimization_phases": [
    {
      "phase": 1,
      "name": "Strategy Standardization",
      "recommendations": ["rec-1"],
      "priority": "HIGH",
      "estimated_effort": "2-3 hours",
      "estimated_impact": "-2,500 tokens (25% Phase 2), high clarity",
      "tasks": [
        "Add 'When/What/Why/Priority' to Strategy A (Port Conflicts)",
        "Add 'When/What/Why/Priority' to Strategy B (Dependencies)",
        "Add 'When/What/Why/Priority' to Strategy C (Prisma)",
        "Add 'When/What/Why/Priority' to Strategy D (Environment)",
        "Add 'When/What/Why/Priority' to Strategy E (TypeScript)",
        "Add 'When/What/Why/Priority' to Strategy F (Build/Import)",
        "Add 'When/What/Why/Priority' to Strategy G (Runtime)"
      ]
    },
    {
      "phase": 2,
      "name": "Example Deepening",
      "recommendations": ["rec-2"],
      "priority": "HIGH",
      "estimated_effort": "2-3 hours",
      "estimated_impact": "+1,500 tokens, very high pedagogical value",
      "tasks": [
        "Consolidate Examples 1-4 into 2 comprehensive examples",
        "Expand Example 1 to 80-100 lines with decision-making process",
        "Expand Example 2 to 80-100 lines with trade-offs and timing",
        "Keep Example 5 as-is (already excellent gold standard)",
        "Add time comparison metrics to all examples"
      ]
    },
    {
      "phase": 3,
      "name": "Tool Abstraction",
      "recommendations": ["rec-3", "rec-4"],
      "priority": "HIGH",
      "estimated_effort": "6-9 hours",
      "estimated_impact": "-1,300 tokens, very high maintainability",
      "tasks": [
        "Create pnpm tools dev:categorize-errors tool",
        "Create pnpm tools dev:health-check tool",
        "Update Phase 1 to use dev:categorize-errors (replace lines 549-589)",
        "Update Phase 1 to use dev:health-check (replace lines 604-612)",
        "Update Phase 3 to use dev:health-check (replace lines 1086-1108)",
        "Document tools in tools/README.md"
      ]
    }
  ],
  "total_estimates": {
    "effort_hours": 13,
    "token_reduction_percent": 2.7,
    "net_token_reduction": 2300,
    "quality_improvement": "4.6 → 4.9 (estimated)"
  },
  "implementation_order": [
    "Phase 1: Strategy Standardization (high priority, medium effort, quick win)",
    "Phase 2: Example Deepening (high priority, medium effort, high pedagogical value)",
    "Phase 3: Tool Abstraction (high priority, high effort, foundation for future)"
  ],
  "success_metrics": [
    "Token reduction ≥ 2.5% (target: 2.7%)",
    "Quality score ≥ 4.8 (current: 4.6)",
    "All strategies have 'When/What/Why/Priority' structure (100% consistency)",
    "All examples 80-120 lines with decision-making (average depth: 100 lines)",
    "Zero duplication of error categorization logic (DRY achieved)"
  ]
}
```

---

**End of PRD**

**Version:** 1.0
**Document Status:** Draft - Ready for Review
**Review Recommended:** Platform Engineering Team, Agent Framework Team
**Next Steps:** Review PRD → Implement MVP → Test on pilot agents → Refine → Rollout
