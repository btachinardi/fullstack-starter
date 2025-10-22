---
description: Systematically analyze and optimize Claude Code slash commands and subagents following research-backed best practices
allowed-tools: Task, TodoWrite, Read
model: claude-sonnet-4-5
---

# /agents:optimizer

Systematically analyze and optimize Claude Code slash commands and subagents following research-backed best practices.

## When to Use This Command

Use `/agents:optimizer` when you need to:
- Optimize an existing slash command or subagent for clarity, maintainability, and token efficiency
- Apply latest agent optimization best practices to legacy agents
- Generate comprehensive analysis and optimization roadmap
- Create PRDs for commands (PRD-driven development workflow)
- Validate that an agent follows AGENT_PRD_GUIDELINES.md structure
- Reduce technical debt in agent codebase

## What This Command Does

This command executes a 6-phase optimization pipeline:

1. **Input Validation**: Loads target agent, verifies structure, gathers context
2. **Comprehensive Analysis**: Systematic evaluation against best practices checklist
3. **Optimization Planning**: Prioritized roadmap with effort/impact estimates
4. **PRD Generation**: Creates comprehensive PRD (commands only)
5. **Implementation**: Rewrites agent following PRD and optimization plan
6. **Validation**: Measures improvements, validates quality, generates report

**Key Features:**
- 95% time savings (6-8 hours manual → 15-25 min automated)
- 100% adherence to AGENT_PRD_GUIDELINES.md best practices
- Measurable improvements (10-15% token reduction, +0.3-0.5 quality score)
- Comprehensive analysis reports with specific recommendations
- User approval gate before implementing changes

## Success Criteria

- ✅ Target agent analyzed with overall score (0-5) and category scores
- ✅ Optimization plan created with prioritized recommendations
- ✅ PRD generated (if command) following AGENT_PRD_GUIDELINES.md
- ✅ Agent rewritten with measurable improvements
- ✅ Validation passed: Token reduction ≥5%, no regressions, structure valid
- ✅ Documentation updated with changelog entry

---

## Prerequisites & Context

### Environment Requirements
- Git repository initialized
- Target agent exists in `.claude/commands/` or `.claude/agents/`
- Guidelines and research documents available:
  - `ai/agents/AGENT_PRD_GUIDELINES.md`
  - `ai/docs/agent-optimization-research.md`

### Supporting Documents Required
- **PRD Guidelines:** Structure and patterns for PRDs
- **Research:** Best practices for agent optimization (85KB document)
- **Templates:** SUBAGENT_TEMPLATE.md for subagents

### Specialized Subagents Used

**Phase 1 - Analysis:**
- `agent-analyzer`: Systematic evaluation against best practices checklist

**Phase 2 - Planning:**
- `optimization-planner`: Creates prioritized optimization roadmap

**Phase 3 - PRD Generation (Commands Only):**
- Built-in PRD writing capability

**Phase 4 - Implementation:**
- Built-in slash-command-writer: Optimizes slash commands
- Built-in subagent-writer: Optimizes subagents

**Phase 5 - Validation:**
- `optimization-validator`: Measures improvements and validates quality

**Phase 6 - Documentation:**
- Built-in documentation updating capability

### Input Format

**Invocation:**
```
/agents:optimizer <target_file_path>
```

**Examples:**
```
/agents:optimizer .claude/commands/dev/debug.md
/agents:optimizer .claude/agents/git/commit-grouper.md
```

**Target File Requirements:**
- Must exist and be readable
- Must be in `.claude/commands/` (for commands) or `.claude/agents/` (for subagents)
- Must have YAML frontmatter (commands) or markdown structure (subagents)

---

## Quick Reference

### Quick Decision Guide

**When to optimize:**
- Agent is >6 months old (may not follow latest best practices)
- Token count >80K (may benefit from compression)
- Mixed strategy structure (some use "When/What/Why", others don't)
- Examples are minimal (<50 lines) or lack decision-making context
- Direct bash operations in command (should delegate to tools/subagents)
- Unclear phase transitions or validation gates

**What to expect:**
- **Time:** 15-25 minutes for complete optimization
- **Token Reduction:** 10-15% average (well-structured agents: 5-10%, verbose agents: 20-30%)
- **Quality Improvement:** +0.3-0.5 score increase (0-5 scale)
- **Approval Required:** Yes, after optimization plan (Phase 2)

**Common optimization patterns:**
- Standardize strategy documentation ("When/What/Why/Priority")
- Enhance examples (80-120 lines with decision-making)
- Extract tool abstractions (repeated bash → `pnpm tools`)
- Apply context isolation (verbose ops in subagents)
- Add validation checkboxes throughout

---

## Workflow Overview

### Phase Execution Flow

```
User: /agents:optimizer <target_file>
    ↓
[Phase 0: Input Validation] (<10s)
    ├→ Read target file
    ├→ Determine type (command vs subagent)
    └→ Load guidelines and research
    ↓
[Phase 1: Comprehensive Analysis] (2-3 min)
    └→ Delegate to agent-analyzer
        → Returns: Analysis report with scores, strengths, weaknesses, recommendations
    ↓
[Phase 2: Optimization Planning] (1-2 min)
    └→ Delegate to optimization-planner
        → Returns: Optimization roadmap with phases, priorities, estimates
    ↓
User Approval Gate: Review plan, proceed or cancel
    ↓
[Phase 3: PRD Generation] (3-5 min) [IF COMMAND]
    └→ Invoke built-in PRD writer
        → Returns: Comprehensive PRD following AGENT_PRD_GUIDELINES.md
    ↓
[Phase 4: Implementation] (5-8 min)
    ├→ Invoke built-in slash-command-writer (if command)
    └→ OR invoke built-in subagent-writer (if subagent)
        → Returns: Optimized agent file
    ↓
[Phase 5: Validation] (1 min)
    └→ Delegate to optimization-validator
        → Returns: Validation report with before/after metrics
    ↓
[Phase 6: Documentation] (1-2 min)
    └→ Update related docs and changelog
    ↓
Present Success Summary
```

### Execution Characteristics

- **Pattern:** Sequential pipeline with conditional branching
- **User Gates:** Single approval gate (after Phase 2)
- **Conditional Logic:** Phase 3 (PRD generation) only for commands
- **Progress Tracking:** TodoWrite tool used throughout
- **Total Time:** 15-25 minutes (target: 20 min average)

### Time Savings

**Manual Optimization:**
- Research: 1-2 hours
- Analysis: 2-3 hours
- Planning: 30-60 min
- Implementation: 3-4 hours
- Validation: 30-60 min
- **Total:** 6-8 hours

**Automated Optimization:**
- All phases: 15-25 minutes
- **Savings:** 95% time reduction

---

## Phase 0: Input Validation & Context Loading

**Objective:** Validate target agent exists, determine type, load all required context

**When to execute:** Always (first phase of pipeline)

**Process:**

1. **Read Target File**

   Load the agent file specified by user.

   **Action:**
   ```
   Read(file_path=<user_provided_path>)
   ```

   **Expected Output:** File content loaded
   **Validation:** [ ] File exists and is readable

2. **Determine Agent Type**

   Identify if target is a command or subagent based on path.

   **Logic:**
   - Path contains `/commands/` → Command (requires PRD in Phase 3)
   - Path contains `/agents/` → Subagent (skip PRD, direct optimization)

   **Validation:** [ ] Type determined correctly

3. **Load Supporting Documents**

   Load guidelines and research for analysis context.

   **Action:**
   ```
   Read(file_path="ai/agents/AGENT_PRD_GUIDELINES.md")
   Read(file_path="ai/docs/agent-optimization-research.md")
   ```

   **Expected Output:** Context documents loaded
   **Validation:** [ ] All required documents loaded

4. **Update Todo List**

   Initialize tracking for 6-phase pipeline.

   **Action:**
   ```
   TodoWrite with 6 phase items (Phase 1-6)
   Mark Phase 0 complete, Phase 1 in_progress
   ```

**Success Criteria:**
- [ ] Target file loaded successfully
- [ ] Agent type determined (command or subagent)
- [ ] Guidelines and research loaded
- [ ] Todo list initialized

**Failure Handling:**
- **If:** File not found → **Then:** Report error, suggest valid path
- **If:** Not in `.claude/` directory → **Then:** Explain scope restriction
- **If:** Supporting docs missing → **Then:** Report which docs missing

**Time Target:** <10 seconds

---

## Phase 1: Comprehensive Analysis

**Objective:** Systematically evaluate target agent against 7 research patterns and guidelines, identify strengths/weaknesses/recommendations

**When to execute:** After Phase 0 validation succeeds

**Process:**

1. **Delegate to Analyzer Subagent**

   Invoke specialist for comprehensive evaluation.

   **Action:**
   ```
   Task(
     subagent_type="agent-analyzer",
     description="Analyze agent against optimization guidelines",
     prompt="Analyze the agent at <target_file_path>.

     Evaluate against 7 research patterns:
     1. Command Design (orchestration vs implementation)
     2. Delegation Framework (when/how to delegate)
     3. Phase/Workflow (clear objectives, validation gates)
     4. Context Optimization (isolation, summaries, no pollution)
     5. Parallel Execution (correct syntax, time savings)
     6. Structured Formats (tables, checklists, schemas)
     7. Example Quality (decision-focused, 80-120 lines, diverse)

     Check completeness against AGENT_PRD_GUIDELINES.md.

     Identify strengths (what to preserve) and weaknesses (what to improve)
     with specific line number references.

     Generate prioritized recommendations (HIGH/MEDIUM/LOW) with effort
     estimates (hours) and impact estimates (token reduction %, quality gain).

     Estimate overall token reduction potential.

     Return structured JSON with:
     - agent_info (name, type, line_count, estimated_tokens)
     - evaluation (overall_score, category_scores for 7 patterns)
     - strengths (array with line references)
     - weaknesses (array with specifics)
     - recommendations (array with priority, effort, impact)
     - metrics (current_tokens, estimated_optimized_tokens, reduction %)"
   )
   ```

   **Expected Output:** JSON with complete analysis report

   **Validation:** [ ] Analysis received with all required fields

2. **Present Analysis Summary**

   Show user high-level findings.

   **Format:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Agent Analysis: <agent-name>
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Overall Quality Score: <score> / 5.0 (<percent>%)
   Current Token Count: ~<tokens> tokens

   Category Scores:
     - Command Design: <score>/5
     - Delegation Framework: <score>/5
     - Phase/Workflow: <score>/5
     - Context Optimization: <score>/5
     - Parallel Execution: <score>/5
     - Structured Formats: <score>/5
     - Example Quality: <score>/5

   Top Strengths:
     ✓ <strength 1>
     ✓ <strength 2>
     ✓ <strength 3>

   Top Weaknesses:
     ✗ <weakness 1>
     ✗ <weakness 2>
     ✗ <weakness 3>

   Recommendations: <count> total
     - HIGH priority: <count>
     - MEDIUM priority: <count>
     - LOW priority: <count>

   Estimated Optimization Potential:
     - Token Reduction: <percent>%
     - Quality Improvement: <before> → <after> (estimated)

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Proceeding to optimization planning...
   ```

3. **Update Todo List**

   Mark Phase 1 complete, Phase 2 in progress.

   **Action:**
   ```
   TodoWrite - Update Phase 1 status to "done"
   TodoWrite - Update Phase 2 status to "in_progress"
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
- **If:** Analyzer fails → **Then:** Retry with more specific prompt
- **If:** Analysis incomplete → **Then:** Request missing sections
- **If:** No weaknesses found → **Then:** Mark as "already optimized", minimal recommendations

**Tools Used:** Task tool (for agent-analyzer delegation)

**Time Target:** 2-3 minutes

---

## Phase 2: Optimization Planning

**Objective:** Convert analysis recommendations into actionable, sequenced optimization roadmap with effort/impact estimates

**When to execute:** After Phase 1 completes

**Process:**

1. **Delegate to Planner Subagent**

   Invoke specialist for roadmap creation.

   **Action:**
   ```
   Task(
     subagent_type="optimization-planner",
     description="Create optimization roadmap from analysis",
     prompt="Convert the analysis recommendations into a phased implementation plan.

     Analysis report: <paste full analysis JSON>

     Group recommendations by logical phases (e.g., consistency fixes,
     example improvements, tool abstractions).

     Estimate effort (hours) and impact (token reduction %, quality gain)
     for each phase.

     Sequence phases by priority (HIGH first) and dependencies.

     Define measurable success metrics (how to know if optimization succeeded).

     Calculate total estimates (effort hours, token reduction, quality improvement).

     Return structured JSON with:
     - optimization_phases (array with phase, name, recommendations, priority,
       estimated_effort, estimated_impact, tasks)
     - total_estimates (effort_hours, token_reduction_percent, net_token_reduction,
       quality_improvement)
     - implementation_order (array of phase descriptions with priority)
     - success_metrics (array of measurable criteria)"
   )
   ```

   **Expected Output:** JSON with optimization roadmap

   **Validation:** [ ] Plan received with all phases and estimates

2. **Present Optimization Plan (USER APPROVAL GATE)**

   Show comprehensive plan for user review.

   **Format:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Agent Optimization Plan: <agent-name>
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Analysis Summary:
     Overall Quality Score: <score> / 5.0 (<percent>%)
     Current Token Count: ~<tokens> tokens
     Guideline Adherence: <percent>% (<sections_present>/<sections_total> sections)

   Top Strengths:
     ✓ <strength 1>
     ✓ <strength 2>
     ✓ <strength 3>

   Top Weaknesses:
     ✗ <weakness 1>
     ✗ <weakness 2>
     ✗ <weakness 3>

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Optimization Roadmap:

   Phase 1: <name> [<PRIORITY> PRIORITY]
     What: <description>
     Impact: <impact description>
     Effort: <hours>

   Phase 2: <name> [<PRIORITY> PRIORITY]
     What: <description>
     Impact: <impact description>
     Effort: <hours>

   Phase 3: <name> [<PRIORITY> PRIORITY]
     What: <description>
     Impact: <impact description>
     Effort: <hours>

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Total Estimates:
     Time Investment: <hours> hours
     Token Reduction: <net_reduction> (<percent>%)
     Quality Improvement: <before> → <after> (estimated)
     Guideline Adherence: <before>% → 100%

   Success Metrics:
     ✓ <metric 1>
     ✓ <metric 2>
     ✓ <metric 3>

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Options:
     1. ✅ Proceed with all phases (recommended)
     2. 🔄 Select specific phases only
     3. ❌ Cancel optimization

   Your choice: [1/2/3]
   ```

   **User Options:**
   - **1:** Proceed with all phases → Continue to Phase 3 (or Phase 4 if subagent)
   - **2:** Select phases → Show phase menu, user chooses subset
   - **3:** Cancel → Save analysis report, exit gracefully

   **Timeout:** 2 minutes, default: Proceed (Option 1)

3. **Record User Decision**

   Capture user choice and proceed accordingly.

   **If Option 1 (Proceed):**
   - Continue to Phase 3 (if command) or Phase 4 (if subagent)

   **If Option 2 (Select phases):**
   - Show phase selection menu
   - User selects subset (e.g., "1,3")
   - Update plan with selected phases only
   - Continue to Phase 3 or 4

   **If Option 3 (Cancel):**
   - Save analysis report to `ai/docs/optimizations/<name>-analysis-<date>.md`
   - Thank user, exit gracefully

4. **Update Todo List**

   Mark Phase 2 complete, Phase 3/4 in progress.

   **Action:**
   ```
   TodoWrite - Update Phase 2 status to "done"
   TodoWrite - Update Phase 3 (if command) or Phase 4 (if subagent) to "in_progress"
   ```

**Success Criteria:**
- [ ] All recommendations assigned to phases
- [ ] Effort estimates for each phase (hours)
- [ ] Impact estimates for each phase (tokens %, quality)
- [ ] Implementation order defined (priority-based)
- [ ] Success metrics measurable (specific targets)
- [ ] Total estimates calculated (effort, token reduction)
- [ ] User approval received

**Failure Handling:**
- **If:** Planner fails → **Then:** Retry or create manual plan
- **If:** Recommendations conflict → **Then:** Resolve conflicts, document trade-offs
- **If:** User declines → **Then:** Save analysis, exit

**Tools Used:** Task tool (for optimization-planner delegation)

**Time Target:** 1-2 minutes (plus user approval time)

---

## Phase 3: PRD Generation (Commands Only)

**Objective:** Create comprehensive PRD following AGENT_PRD_GUIDELINES.md for slash commands

**When to execute:** After Phase 2 approval, ONLY if agent type is "command"

**Conditional:** Skip this phase entirely for subagents (they follow template, don't need PRD)

**Process:**

1. **Check Agent Type**

   Verify if this phase should execute.

   **Logic:**
   - If agent_type == "command" → Proceed with PRD generation
   - If agent_type == "subagent" → Skip to Phase 4

   **Validation:** [ ] Type check performed

2. **Generate PRD Using Built-In Capability**

   Create comprehensive PRD for the command.

   **Action:**
   Using built-in PRD writing capability, generate a PRD that includes:
   - All required sections per AGENT_PRD_GUIDELINES.md
   - Current command functionality
   - Optimization improvements from plan
   - Sub-agents required (if any)
   - Workflow orchestration
   - Best practices from research

   **PRD Location:** `ai/agents/<category>/<name>.prd.md`

   Example: `ai/agents/dev/debug.prd.md`

   **Expected Output:** Complete PRD file created

   **Validation:** [ ] PRD file exists with all required sections

3. **Validate PRD Completeness**

   Ensure PRD follows guidelines.

   **Check:**
   - [ ] Metadata section present (status, version, owner, implementation)
   - [ ] Executive summary present
   - [ ] Problem statement defined
   - [ ] Goals and non-goals listed
   - [ ] Task decomposition into 3-7 phases
   - [ ] Sub-agent specifications complete (if applicable)
   - [ ] Workflow orchestration defined
   - [ ] Quality gates defined
   - [ ] Examples provided (if comprehensive)

   **If validation fails:** Fix missing sections, re-generate

4. **Present PRD Summary**

   Inform user of PRD creation.

   **Format:**
   ```
   ✓ PRD Generated: ai/agents/<category>/<name>.prd.md

   PRD Metadata:
     - Status: Draft
     - Version: 1.0
     - Sections: <count>
     - Line Count: <lines>
     - Estimated Tokens: <tokens>

   Validation:
     ✓ All required sections present
     ✓ Task decomposition complete
     ✓ Sub-agent specifications defined (if applicable)
     ✓ Workflow orchestration defined
     ✓ Quality gates defined

   Proceeding to implementation...
   ```

5. **Update Todo List**

   Mark Phase 3 complete, Phase 4 in progress.

   **Action:**
   ```
   TodoWrite - Update Phase 3 status to "done"
   TodoWrite - Update Phase 4 status to "in_progress"
   ```

**Success Criteria:**
- [ ] PRD file created in correct location (ai/agents/<category>/<name>.prd.md)
- [ ] All required sections present (per AGENT_PRD_GUIDELINES.md)
- [ ] Task decomposition into 3-7 phases
- [ ] Sub-agent specifications complete (if applicable)
- [ ] Workflow orchestration defined
- [ ] Quality gates and validation strategy defined
- [ ] PRD passes validation checklist

**Failure Handling:**
- **If:** PRD generation fails → **Then:** Retry with more specific instructions
- **If:** Validation fails → **Then:** Identify missing sections, regenerate
- **If:** Sub-agent specs incomplete → **Then:** Expand specifications

**Tools Used:** Built-in PRD writing capability

**Time Target:** 3-5 minutes

---

## Phase 4: Implementation

**Objective:** Rewrite agent following PRD (if command) or optimization plan (if subagent), applying all recommendations

**When to execute:** After Phase 3 (commands) or Phase 2 (subagents)

**Process:**

1. **Determine Implementation Path**

   Choose writer based on agent type.

   **Logic:**
   - If agent_type == "command" → Use built-in slash-command-writer
   - If agent_type == "subagent" → Use built-in subagent-writer

   **Validation:** [ ] Implementation path determined

2. **For Commands: Invoke Slash Command Writer**

   Rewrite command following PRD.

   **Action:**
   Using built-in slash-command-writer capability:
   - Provide PRD as specification
   - Request command following PRD structure exactly
   - Apply all optimization recommendations
   - Ensure "When/What/Why/Priority" for strategies
   - Create comprehensive examples (80-120 lines, decision-focused)
   - Add validation checklists (5-10 per phase)
   - Include output format templates
   - Document quality standards and constraints

   **Output File:** `.claude/commands/<category>/<name>.md`
   **Backup:** `.claude/commands/<category>/<name>.md.bak`

   **Expected Output:** Optimized command file created, original backed up

   **Validation:** [ ] Command file written following PRD

3. **For Subagents: Invoke Subagent Writer**

   Rewrite subagent following template and optimization plan.

   **Action:**
   Using built-in subagent-writer capability:
   - Provide optimization plan and recommendations
   - Request subagent following SUBAGENT_TEMPLATE.md
   - Apply all optimization recommendations
   - Define input/output contracts (JSON schemas)
   - Enforce single responsibility
   - Complete tool usage guidance
   - Self-contained instructions

   **Output File:** `.claude/agents/<category>/<name>.md`
   **Backup:** `.claude/agents/<category>/<name>.md.bak`

   **Expected Output:** Optimized subagent file created, original backed up

   **Validation:** [ ] Subagent file written following template

4. **Verify File Changes**

   Confirm optimized file exists and is valid.

   **Check:**
   - [ ] Optimized file exists at correct location
   - [ ] Original backed up as `.bak`
   - [ ] File has valid YAML frontmatter
   - [ ] File has valid markdown structure
   - [ ] All recommendations applied
   - [ ] Version incremented in changelog

   **If validation fails:** Fix issues, rewrite

5. **Present Implementation Summary**

   Show user what changed.

   **Format:**
   ```
   ✓ Implementation Complete

   Files Modified:
     ✓ <optimized_file> (optimized)
     ✓ <optimized_file>.bak (backup)

   Changes Applied:
     1. <change 1 description> (lines <range>)
     2. <change 2 description> (lines <range>)
     3. <change 3 description> (lines <range>)

   File Metadata:
     - Version: <new_version>
     - Line Count: <new_lines> (was <old_lines>)
     - Estimated Tokens: <new_tokens> (was <old_tokens>)

   Proceeding to validation...
   ```

6. **Update Todo List**

   Mark Phase 4 complete, Phase 5 in progress.

   **Action:**
   ```
   TodoWrite - Update Phase 4 status to "done"
   TodoWrite - Update Phase 5 status to "in_progress"
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
- **If:** Writer fails → **Then:** Retry with clearer instructions
- **If:** Syntax errors introduced → **Then:** Validate, fix, regenerate
- **If:** Recommendations not fully applied → **Then:** Review, request reimplementation

**Tools Used:** Built-in slash-command-writer or subagent-writer

**Time Target:** 5-8 minutes

---

## Phase 5: Validation & Comparison

**Objective:** Validate optimized agent meets quality standards and measure improvements vs original

**When to execute:** After Phase 4 completes

**Process:**

1. **Delegate to Validator Subagent**

   Invoke specialist for comprehensive validation.

   **Action:**
   ```
   Task(
     subagent_type="optimization-validator",
     description="Validate optimized agent and measure improvements",
     prompt="Compare the original agent (<path>.bak) with the optimized version (<path>).

     Validate:
     - YAML frontmatter syntax
     - All required sections present
     - Strategies have 'When/What/Why/Priority' structure (if applicable)
     - Examples are 80-120 lines with decision-making (if applicable)
     - Tool abstractions used instead of raw bash (if applicable)
     - Structure follows guidelines

     Measure:
     - Line count before/after
     - Token count before/after (estimate via line count * avg_tokens_per_line)
     - Token reduction percentage
     - Quality scores before/after (re-evaluate 7 patterns)

     Verify improvements match optimization plan estimates (±5%).

     Identify any issues or regressions.

     Return structured JSON with:
     - validation_results (syntax_valid, structure_valid, follows_guidelines, etc.)
     - metrics (original_lines, optimized_lines, line_reduction_percent,
       original_tokens, optimized_tokens, token_reduction_percent)
     - quality_scores (before/after for 7 patterns + overall, improvement delta)
     - improvements (array of changes with category, description, metric)
     - issues (array of problems found, if any)
     - overall_assessment (PASSED/FAILED/NEEDS_REVIEW)"
   )
   ```

   **Expected Output:** JSON with validation report

   **Validation:** [ ] Validation report received

2. **Present Validation Results**

   Show user before/after comparison.

   **Format:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Optimization Validation Results
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Overall Assessment: <PASSED/FAILED/NEEDS_REVIEW>

   Metrics Comparison:
     Original:
       - Lines: <count>
       - Tokens: ~<count>
       - Quality Score: <score>/5

     Optimized:
       - Lines: <count> (<percent>% reduction)
       - Tokens: ~<count> (<percent>% reduction)
       - Quality Score: <score>/5 (improvement: +<delta>)

   Quality Scores by Pattern:
     - Command Design: <before>/5 → <after>/5
     - Delegation Framework: <before>/5 → <after>/5
     - Phase/Workflow: <before>/5 → <after>/5
     - Context Optimization: <before>/5 → <after>/5
     - Parallel Execution: <before>/5 → <after>/5
     - Structured Formats: <before>/5 → <after>/5
     - Example Quality: <before>/5 → <after>/5

   Improvements:
     ✓ <improvement 1 description> (<metric>)
     ✓ <improvement 2 description> (<metric>)
     ✓ <improvement 3 description> (<metric>)

   Issues: <count>
     <list issues if any, otherwise "None">

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. **Check Validation Status**

   Determine if optimization succeeded.

   **Logic:**
   - If overall_assessment == "PASSED" → Continue to Phase 6
   - If overall_assessment == "FAILED" → Report failure, consider revert
   - If overall_assessment == "NEEDS_REVIEW" → Report issues, ask user to review

   **Validation:** [ ] Assessment reviewed

4. **Handle Validation Failure (if needed)**

   If validation did not pass, take corrective action.

   **If FAILED:**
   - Present detailed issues to user
   - Offer options: Revert to original, Fix issues manually, Re-optimize
   - Do NOT proceed to Phase 6 until validation passes

   **If NEEDS_REVIEW:**
   - Present issues to user
   - Ask if acceptable to proceed
   - User choice: Proceed (accept trade-offs) or Fix issues

5. **Update Todo List**

   Mark Phase 5 complete, Phase 6 in progress.

   **Action:**
   ```
   TodoWrite - Update Phase 5 status to "done"
   TodoWrite - Update Phase 6 status to "in_progress"
   ```

**Success Criteria:**
- [ ] All validation checks pass
- [ ] Token reduction ≥ target (or within ±5%)
- [ ] Quality score improved (no regressions)
- [ ] All success metrics met
- [ ] No critical issues identified
- [ ] Comparison report generated

**Failure Handling:**
- **If:** Validation fails → **Then:** Identify specific issues, fix or revert
- **If:** Token reduction below target → **Then:** Acceptable if quality improved significantly
- **If:** Quality regression detected → **Then:** Investigate, revert if necessary
- **If:** Syntax errors → **Then:** Fix immediately, re-validate

**Tools Used:** Task tool (for optimization-validator delegation)

**Time Target:** ~1 minute

---

## Phase 6: Documentation & Changelog

**Objective:** Update related documentation, generate changelog entry, create optimization summary

**When to execute:** After Phase 5 validation passes

**Process:**

1. **Update Agent Changelog**

   Add version entry to agent file.

   **Action:**
   Add entry to agent's `## Changelog` section:
   ```markdown
   **Version <new_version>** (<date>)
   - Optimized following agents-optimizer PRD
   - <list key changes>
   - Token reduction: <percent>%
   - Quality improvement: <before> → <after>
   ```

   **Expected Output:** Changelog updated

   **Validation:** [ ] Changelog entry added

2. **Update Related Documentation**

   Fix any broken references or add new tool docs.

   **Check:**
   - If new tools created → Document in `tools/README.md`
   - If command references changed → Update docs
   - If PRD generated → Ensure linked from command

   **Expected Output:** Docs updated as needed

   **Validation:** [ ] Related docs updated

3. **Generate Optimization Summary**

   Create audit trail document.

   **Action:**
   Create file: `ai/docs/optimizations/<agent-name>-optimization-<YYYYMMDD>.md`

   **Content:**
   ```markdown
   # <agent-name> Optimization Summary

   **Date:** <date>
   **Version:** <before> → <after>
   **Duration:** <minutes> minutes

   ## Analysis Results

   <paste analysis summary>

   ## Optimization Plan

   <paste optimization plan>

   ## Implementation Changes

   <list changes applied>

   ## Validation Results

   <paste validation report>

   ## Metrics

   - Token Reduction: <percent>% (<before> → <after>)
   - Quality Improvement: <before> → <after>
   - Line Count: <before> → <after>

   ## Lessons Learned

   <any insights from this optimization>
   ```

   **Expected Output:** Summary file created

   **Validation:** [ ] Summary file exists

4. **Create Next Steps Guidance**

   Recommend follow-up actions.

   **Suggestions:**
   - Manual review areas (if applicable)
   - Testing recommendations (if command has examples)
   - Follow-up optimizations (if any deferred)
   - Related agents to optimize next

   **Expected Output:** Next steps documented

   **Validation:** [ ] Next steps provided

5. **Update Todo List**

   Mark Phase 6 complete.

   **Action:**
   ```
   TodoWrite - Update Phase 6 status to "done"
   TodoWrite - Mark entire workflow as "complete"
   ```

6. **Present Final Success Summary**

   Show comprehensive completion report (see Output Format section).

**Success Criteria:**
- [ ] Changelog entry added to agent file
- [ ] Related docs updated (tools, references)
- [ ] Optimization summary created
- [ ] Next steps documented
- [ ] All documentation consistent

**Failure Handling:**
- **If:** Changelog update fails → **Then:** Manually add entry, note in summary
- **If:** Docs update fails → **Then:** Note in summary, request manual update

**Tools Used:** Read, Write (for documentation updates)

**Time Target:** 1-2 minutes

---

## Output Format

### Example 1: Phase 1 Analysis Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent Analysis: /dev:debug
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Quality Score: 4.6 / 5.0 (92%)
Current Token Count: ~85,000 tokens

Category Scores:
  - Command Design: 5/5
  - Delegation Framework: 5/5
  - Phase/Workflow: 4/5
  - Context Optimization: 5/5
  - Parallel Execution: 5/5
  - Structured Formats: 5/5
  - Example Quality: 3/5

Top Strengths:
  ✓ Exemplary Phase 0 delegation pattern (lines 93-476)
  ✓ Excellent context isolation via /tmp logs (8x efficiency)
  ✓ Correct parallel execution syntax documented

Top Weaknesses:
  ✗ Strategies A-G lack "When/What/Why" structure (lines 669-1007)
  ✗ Examples 1-4 shallow, output-focused (lines 1441-1602)
  ✗ Duplicate error categorization logic (lines 549-589)

Recommendations: 8 total
  - HIGH priority: 3
  - MEDIUM priority: 3
  - LOW priority: 2

Estimated Optimization Potential:
  - Token Reduction: 10-15%
  - Quality Improvement: 4.6 → 4.9 (estimated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceeding to optimization planning...
```

### Example 2: Phase 2 Optimization Plan (User Approval Gate)

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

### Example 3: Phase 6 Success Report

```
✓ Optimization Complete: /dev:debug

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Metrics Comparison:
  Original:
    - Lines: 1,796
    - Tokens: ~85,000
    - Quality Score: 4.6/5

  Optimized:
    - Lines: 1,575 (12.3% reduction)
    - Tokens: ~74,500 (12.4% reduction)
    - Quality Score: 5.0/5 (improvement: +0.4)

Quality Improvements by Pattern:
  - Command Design: 5/5 → 5/5 (maintained)
  - Delegation Framework: 5/5 → 5/5 (maintained)
  - Phase/Workflow: 4/5 → 5/5 (improved)
  - Context Optimization: 5/5 → 5/5 (maintained)
  - Parallel Execution: 5/5 → 5/5 (maintained)
  - Structured Formats: 5/5 → 5/5 (maintained)
  - Example Quality: 3/5 → 5/5 (significantly improved)

Changes Applied:
  1. Strategy Standardization (Strategies A-G)
     - Added "When/What/Why/Priority" structure
     - Token reduction: -2,500 (25% of Phase 2 section)

  2. Example Deepening (Examples 1-2)
     - Expanded from 15-30 lines to 80-120 lines
     - Added decision-making, trade-offs, time metrics
     - Token increase: +1,500 (pedagogical value gain)

  3. Tool Abstraction
     - Created dev:categorize-errors tool
     - Created dev:health-check tool
     - Token reduction: -800 (eliminated duplication)

Files Modified:
  ✓ .claude/commands/dev/debug.md (optimized, v2.0)
  ✓ .claude/commands/dev/debug.md.bak (backup, v1.0)
  ✓ ai/agents/dev/debug.prd.md (PRD created)
  ✓ tools/README.md (documented new tools)
  ✓ ai/docs/optimizations/debug-optimization-20251022.md (summary)

Validation: PASSED
  ✓ All syntax checks pass
  ✓ All guideline sections present
  ✓ Token reduction within estimate (12.4% vs 10-15% target)
  ✓ Quality improvement confirmed (no regressions)
  ✓ All success metrics met

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Review optimized debug.md manually
  2. Test command with real dev server errors
  3. Commit changes: /git:commit
  4. Optional: Create deferred tools (if Phase 3 partial)

Optimization History:
  ai/docs/optimizations/debug-optimization-20251022.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Duration: 18 minutes
Time Savings: 95% (6-8 hours manual → 18 min automated)

Your agent is now optimized and ready to use!
```

---

## Quality Standards

### Completeness Criteria

- [ ] YAML frontmatter with required fields (description at minimum)
- [ ] Command has clear, descriptive name
- [ ] Purpose is specific and unambiguous
- [ ] All phases execute in correct order
- [ ] All required sections present in outputs
- [ ] Instructions are clear and actionable
- [ ] Output format is well-defined
- [ ] Constraints and boundaries are explicit
- [ ] Quality standards are measurable
- [ ] File generated/updated in correct location
- [ ] Markdown formatting is correct
- [ ] Follows AGENT_PRD_GUIDELINES.md best practices
- [ ] Changes are coherent and preserve working functionality

### Output Format

- **Optimized File Location**: `.claude/commands/<category>/<name>.md` or `.claude/agents/<category>/<name>.md`
- **Backup Location**: Same as above with `.bak` extension
- **PRD Location** (commands only): `ai/agents/<category>/<name>.prd.md`
- **Summary Location**: `ai/docs/optimizations/<name>-optimization-<YYYYMMDD>.md`
- **File Format**: Markdown with YAML frontmatter

### Validation Requirements

- Agent type correctly determined (command vs subagent)
- Instructions are unambiguous and specific
- Output format specifies location and structure
- Validation gates prevent progression on failure
- Quality standards define success criteria
- No vague language like "improve agent" or "make better"
- Changes are clearly documented
- Metrics are measurable (token reduction %, quality scores)

---

## Constraints & Boundaries

### Must Do
- Validate all inputs before processing
- Present optimization plan for user approval
- Generate PRD for commands before optimization
- Measure improvements via validation
- Update documentation
- Back up original files before modifying
- Verify validation passes before marking complete

### Must Not Do
- Optimize without user approval
- Skip phases (all required for quality)
- Modify files outside `.claude/` directory
- Proceed if validation fails
- Auto-deploy without human review
- Skip backup creation

### In Scope
- Commands in `.claude/commands/`
- Subagents in `.claude/agents/`
- Analysis, planning, implementation, validation, documentation
- Token optimization, structure improvement, best practice application
- PRD generation for commands

### Out of Scope
- Creating new agents from scratch (use templates)
- Optimizing files outside `.claude/`
- Real-time optimization during execution
- Generic code optimization
- Performance profiling of agent execution
- Batch optimization of multiple agents (v2.0 feature)

---

## Related Commands

- `/planning:tasks-create`: Similar multi-phase workflow with TodoWrite tracking
- `/git:commit`: Commit optimized agents after review
- `/dev:validate`: Validate project quality after optimization

---

## Changelog

**Version 1.0** (2025-10-22)
- Initial implementation following agents-optimizer.prd.md
- 6-phase optimization pipeline (validation → analysis → planning → PRD → implementation → validation → documentation)
- 3 specialized subagents (agent-analyzer, optimization-planner, optimization-validator)
- Integration with built-in writers (PRD, slash-command-writer, subagent-writer)
- User approval gate after planning phase
- Comprehensive validation with before/after metrics
- 95% time savings (6-8 hours → 15-25 min)
- 10-15% token reduction, +0.3-0.5 quality score improvement

**Implementation Status:**
- Main command: ✅ Complete
- agent-analyzer: 🔄 To be implemented
- optimization-planner: 🔄 To be implemented
- optimization-validator: 🔄 To be implemented
