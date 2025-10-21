# Create Agent System

Orchestrate the creation of a complete agent system by delegating to specialized creator agents.

## Objective

Design and implement a complete agent system consisting of one or more orchestration commands and specialized sub-agents that work together to accomplish complex workflows.

## Context & Prerequisites

**Project Context:**
- Agent systems consist of orchestration commands (slash commands) and specialized sub-agents
- Commands delegate tasks to sub-agents and coordinate their outputs
- Sub-agents focus on specific capabilities (analysis, generation, validation, etc.)
- This command itself is a meta-agent system that creates agent systems

**Available Creator Agents:**
- `subagent-creator`: Creates specialized sub-agent files
- `command-creator`: Creates slash command files

**Templates:**
- Sub-agent template: `.claude-code/SUBAGENT_TEMPLATE.md`
- Command template: `.claude-code/SLASH_COMMAND_TEMPLATE.md`

**Prerequisites:**
- User has described the agent system requirements
- Clear understanding of workflow to be automated
- Identified inputs, processes, and expected outputs

---

## Instructions

### Phase 1: Requirements Discovery & System Design

**Objective:** Understand requirements and design the agent system architecture

**Steps:**

1. **Gather Requirements**
   - Ask user to describe the workflow or problem to solve
   - Identify the main goal and expected outcomes
   - Understand input data and expected output format
   - Clarify quality standards and constraints
   - Determine if this is analysis, generation, workflow automation, or hybrid

2. **Design Agent System Architecture**
   - Identify discrete capabilities needed (e.g., analysis, generation, validation)
   - Map capabilities to specialized sub-agents (1 capability = 1 sub-agent)
   - Design orchestration flow between sub-agents
   - Determine how many orchestration commands needed (usually 1, sometimes 2-3)
   - Identify coordination points and data handoffs
   - Plan validation and quality checkpoints

3. **Create System Plan**
   Document the agent system design:
   ```
   ## Agent System: [Name]

   **Purpose:** [One-line description]

   **Architecture:**
   - Orchestration Command: /[command-name]
     - Purpose: [What it orchestrates]
     - Flow: [Step-by-step coordination logic]

   - Sub-Agent: [agent-name-1]
     - Purpose: [What it does]
     - Tools: [Tools needed]
     - Inputs: [What it receives]
     - Outputs: [What it produces]

   - Sub-Agent: [agent-name-2]
     - Purpose: [What it does]
     - Tools: [Tools needed]
     - Inputs: [What it receives]
     - Outputs: [What it produces]

   **Workflow:**
   1. User invokes /[command-name]
   2. Command gathers context and requirements
   3. Command delegates to [agent-1] with prompt: "[specific task]"
   4. Command validates [agent-1] output
   5. Command delegates to [agent-2] with prompt: "[specific task]" and [agent-1] results
   6. Command validates [agent-2] output
   7. Command compiles final report with all results

   **Success Criteria:**
   - [Criterion 1]
   - [Criterion 2]
   - [Criterion 3]
   ```

4. **Review Plan with User**
   - Present the system design
   - Confirm architecture meets requirements
   - Adjust based on feedback
   - Get approval to proceed

**Validation Checkpoint:**
- [ ] Requirements clearly documented
- [ ] Architecture identifies all needed capabilities
- [ ] Each sub-agent has single, focused responsibility
- [ ] Orchestration flow is logical and complete
- [ ] Data handoffs between agents are defined
- [ ] User has approved the design

---

### Phase 2: Sub-Agent Creation

**Objective:** Create all specialized sub-agents using the subagent-creator agent

**Steps:**

1. **For Each Sub-Agent in the Design:**

   Invoke the subagent-creator agent with detailed specifications:

   ```
   Task: subagent_type="subagent-creator",
         prompt="Create a sub-agent named '[agent-name]' with the following specifications:

   **Purpose:** [Specific purpose from design]

   **Responsibilities:**
   - [Responsibility 1]
   - [Responsibility 2]
   - [Responsibility 3]

   **Tools Required:** [List of tools or '*' for all]

   **Workflow Phases:**
   1. [Phase 1 name]: [What it accomplishes]
   2. [Phase 2 name]: [What it accomplishes]
   3. [Phase 3 name]: [What it accomplishes]

   **Input Format:**
   [Description of what this agent receives]

   **Output Format:**
   [Description of what this agent produces]

   **Quality Standards:**
   - [Standard 1]
   - [Standard 2]

   **Examples:**
   [Provide 1-2 usage examples]
   "
   ```

2. **Validate Sub-Agent Creation**
   - Review the created sub-agent file
   - Verify it matches specifications
   - Confirm file location is correct
   - Check that all template sections are complete
   - Ensure instructions are clear and actionable

3. **Document Sub-Agent**
   - Record sub-agent name and location
   - Note key capabilities and outputs
   - Document how orchestration command will invoke it

4. **Repeat for All Sub-Agents**
   - Create each sub-agent sequentially
   - Maintain consistency across sub-agents
   - Ensure no capability gaps or overlaps

**Validation Checkpoint:**
- [ ] All sub-agents created successfully
- [ ] Each sub-agent file is complete and valid
- [ ] Sub-agents cover all required capabilities
- [ ] No overlap or conflict between sub-agents
- [ ] All sub-agents follow template structure

---

### Phase 3: Orchestration Command Creation

**Objective:** Create orchestration command(s) using the command-creator agent

**Steps:**

1. **For Each Orchestration Command in the Design:**

   Invoke the command-creator agent with detailed specifications:

   ```
   Task: subagent_type="command-creator",
         prompt="Create a slash command named '/[command-name]' with the following specifications:

   **Purpose:** [Specific purpose from design]

   **Workflow Overview:**
   [High-level description of what the command orchestrates]

   **Phases:**

   ### Phase 1: [Phase Name]
   **Objective:** [What this phase accomplishes]
   **Actions:**
   - [Action 1]
   - [Action 2]
   **Validation:** [How to verify phase success]

   ### Phase 2: [Phase Name]
   **Objective:** [What this phase accomplishes]
   **Actions:**
   - Delegate to '[agent-name]' sub-agent
   - Prompt: '[Detailed prompt describing task and context]'
   - Expected output: [What agent should produce]
   **Validation:** [How to verify phase success]

   ### Phase 3: [Phase Name]
   **Objective:** [What this phase accomplishes]
   **Actions:**
   - Delegate to '[agent-name]' sub-agent
   - Prompt: '[Detailed prompt describing task and context]'
   - Provide results from Phase 2: [What to pass forward]
   - Expected output: [What agent should produce]
   **Validation:** [How to verify phase success]

   ### Phase 4: [Final Phase Name]
   **Objective:** [What this phase accomplishes]
   **Actions:**
   - Compile results from all previous phases
   - Validate against success criteria
   - Generate final report
   **Validation:** [How to verify completion]

   **Output Format:**
   [Detailed specification of final deliverables]

   **Quality Standards:**
   - [Standard 1]
   - [Standard 2]

   **Sub-Agent Coordination:**
   - [How to handle sub-agent failures]
   - [How to validate sub-agent outputs]
   - [How to pass context between sub-agents]
   "
   ```

2. **Validate Command Creation**
   - Review the created command file
   - Verify orchestration logic is complete
   - Confirm sub-agent invocation prompts are detailed
   - Check that coordination between phases is clear
   - Ensure validation checkpoints are included

3. **Document Command**
   - Record command name and location
   - Note invocation syntax
   - Document expected outcomes

**Validation Checkpoint:**
- [ ] All orchestration commands created successfully
- [ ] Each command file is complete and valid
- [ ] Sub-agent invocation prompts are detailed and context-rich
- [ ] Coordination logic between phases is clear
- [ ] Validation checkpoints are included
- [ ] Output specifications are actionable

---

### Phase 4: System Integration & Documentation

**Objective:** Validate the complete agent system and create comprehensive documentation

**Steps:**

1. **System Validation**
   - Review all created files:
     - Sub-agent files in `.claude-code/agents/`
     - Command files in `.claude/commands/`
   - Verify naming consistency across files
   - Check that command references to sub-agents match actual sub-agent names
   - Ensure data flow between components is coherent
   - Validate that templates were followed correctly

2. **Integration Testing Plan**
   Create a test plan document:
   ```markdown
   # Agent System Test Plan: [System Name]

   ## Test Scenarios

   ### Scenario 1: [Scenario Name]
   **Objective:** [What to test]
   **Steps:**
   1. Invoke: /[command-name]
   2. Provide input: [Sample input]
   3. Verify: [Expected outcomes]

   ### Scenario 2: [Scenario Name]
   [Continue for key scenarios]

   ## Validation Checklist
   - [ ] Command invokes successfully
   - [ ] Sub-agents execute in correct order
   - [ ] Data passes correctly between agents
   - [ ] Output meets specifications
   - [ ] Error handling works as expected
   ```

3. **Create System Documentation**
   Create comprehensive documentation in `ai/docs/agent-systems/[system-name].md`:
   ```markdown
   # Agent System: [System Name]

   ## Overview
   [Description of what this agent system does]

   ## Architecture

   ### Orchestration Commands
   - **/[command-name]**: [Purpose and usage]

   ### Specialized Sub-Agents
   - **[agent-name-1]**: [Purpose and capabilities]
   - **[agent-name-2]**: [Purpose and capabilities]

   ## Workflow
   [Step-by-step description of how the system works]

   ## Usage

   ### Basic Usage
   ```
   /[command-name]
   ```

   ### Example Scenarios
   [2-3 example use cases]

   ## Files Created
   - `.claude/commands/[category]/[command-name].md`
   - `.claude-code/agents/[agent-name-1].md`
   - `.claude-code/agents/[agent-name-2].md`

   ## Maintenance
   [Guidelines for updating and extending the system]
   ```

4. **Create Quick Reference**
   Add entry to agent system registry (if it exists) or create one:
   ```markdown
   ## [System Name]
   **Command:** `/[command-name]`
   **Purpose:** [One-line description]
   **Use When:** [Scenarios for using this system]
   **Sub-Agents:** [agent-1], [agent-2]
   ```

**Validation Checkpoint:**
- [ ] All files validated for correctness
- [ ] Integration between components verified
- [ ] Test plan created
- [ ] Comprehensive documentation written
- [ ] Quick reference available
- [ ] System ready for use

---

### Phase 5: Delivery & Next Steps

**Objective:** Deliver the complete agent system with usage guidance

**Steps:**

1. **Compile Delivery Report**
   Create final report with:
   - System overview and architecture
   - List of all created files with locations
   - Usage instructions
   - Test scenarios
   - Success criteria verification

2. **Provide Usage Guidance**
   - Explain how to invoke the main command
   - Describe expected inputs and outputs
   - Provide example invocations
   - Suggest initial test scenarios

3. **Recommend Next Steps**
   - Test the system with real scenarios
   - Gather feedback on usability
   - Iterate on prompts and coordination logic
   - Document learnings and improvements

**Validation Checkpoint:**
- [ ] All deliverables complete
- [ ] Usage guidance is clear
- [ ] User understands how to use the system
- [ ] Next steps are actionable

---

## Output Format

### Final Deliverables

1. **Sub-Agent Files** (`.claude-code/agents/`)
   - `[agent-name-1].md`
   - `[agent-name-2].md`
   - [Additional sub-agents as designed]

2. **Command Files** (`.claude/commands/[category]/`)
   - `[command-name].md`
   - [Additional commands as designed]

3. **System Documentation** (`ai/docs/agent-systems/`)
   - `[system-name].md` - Complete system documentation
   - `[system-name]-test-plan.md` - Testing scenarios

4. **Delivery Report**
   ```markdown
   # Agent System Delivery Report

   ## System: [Name]
   **Created:** [Date]
   **Purpose:** [Description]

   ## Architecture
   [Visual or textual representation of system]

   ## Files Created
   - Commands:
     - [File path and purpose]
   - Sub-Agents:
     - [File path and purpose]
   - Documentation:
     - [File path and purpose]

   ## Usage
   **Primary Command:** `/[command-name]`
   **Purpose:** [What it does]
   **Example:** [Example invocation]

   ## Validation Results
   - Architecture: ✅ Complete and coherent
   - Sub-agents: ✅ All created and validated
   - Commands: ✅ All created and validated
   - Integration: ✅ Verified
   - Documentation: ✅ Comprehensive

   ## Test Scenarios
   [List of test scenarios from test plan]

   ## Next Steps
   1. [Recommended action 1]
   2. [Recommended action 2]
   3. [Recommended action 3]
   ```

---

## Quality Standards

### Architecture Quality
- Single responsibility for each sub-agent
- Clear data flow between components
- Logical orchestration sequence
- Appropriate delegation (not too fine-grained or coarse-grained)
- Coherent abstraction levels

### File Quality
- All template sections complete
- Instructions are clear and actionable
- Sub-agent prompts are detailed and context-rich
- Validation checkpoints are meaningful
- Examples are provided where helpful

### Integration Quality
- Command references match sub-agent names exactly
- Data formats between agents are compatible
- Coordination logic handles success and failure paths
- Output compilation creates coherent final result

### Documentation Quality
- System overview is clear and complete
- Architecture is well-explained
- Usage examples are practical
- Maintenance guidance is provided

---

## Constraints & Boundaries

### Must Do
- Design complete agent system architecture before creating any files
- Delegate all file creation to specialist agents (subagent-creator, command-creator)
- Validate each component after creation
- Ensure orchestration command prompts are detailed and context-rich
- Create comprehensive system documentation
- Provide test plan and usage guidance

### Must Not Do
- Create sub-agent or command files directly (always delegate)
- Skip the system design phase
- Create overlapping or conflicting sub-agents
- Leave validation steps undefined
- Proceed without user approval of architecture
- Omit documentation or testing guidance

### Scope Management
- **In Scope:**
  - Agent system architecture design
  - Orchestration workflow design
  - Delegating file creation to specialist agents
  - System integration validation
  - Documentation creation

- **Out of Scope:**
  - Writing sub-agent or command files directly (delegate to creators)
  - Implementing the functionality the agent system automates
  - Testing the agent system extensively (provide test plan)
  - Modifying templates or creator agents

---

## Examples

### Example 1: Simple Analysis System

**User Request:** "Create an agent system that analyzes API performance"

**System Design:**
- Command: `/analyze-api-performance`
- Sub-Agent: `api-metrics-analyzer` (analyzes metrics and identifies bottlenecks)
- Sub-Agent: `optimization-recommender` (suggests improvements based on analysis)

**Workflow:**
1. User invokes `/analyze-api-performance`
2. Command gathers API context
3. Command delegates to `api-metrics-analyzer` with context
4. Command validates analysis results
5. Command delegates to `optimization-recommender` with analysis results
6. Command compiles final report with findings and recommendations

### Example 2: Complex Generation System

**User Request:** "Create an agent system that scaffolds complete features with backend, frontend, and tests"

**System Design:**
- Command: `/scaffold-feature`
- Sub-Agent: `backend-generator` (creates API endpoints and services)
- Sub-Agent: `frontend-generator` (creates UI components and pages)
- Sub-Agent: `test-generator` (creates tests for backend and frontend)
- Sub-Agent: `documentation-generator` (creates documentation for the feature)

**Workflow:**
1. User invokes `/scaffold-feature` with feature description
2. Command analyzes requirements and plans architecture
3. Command delegates backend creation to `backend-generator`
4. Command delegates frontend creation to `frontend-generator` with backend context
5. Command delegates test creation to `test-generator` with backend and frontend artifacts
6. Command delegates documentation to `documentation-generator` with all artifacts
7. Command validates all components integrate correctly
8. Command provides final report with all created files and usage instructions

### Example 3: Review and Improvement System

**User Request:** "Create an agent system that reviews code and suggests improvements"

**System Design:**
- Command: `/review-and-improve`
- Sub-Agent: `code-analyzer` (analyzes code quality, performance, security)
- Sub-Agent: `improvement-generator` (generates specific improvements based on analysis)
- Sub-Agent: `validation-agent` (validates improvements don't break functionality)

**Workflow:**
1. User invokes `/review-and-improve` with code target
2. Command delegates analysis to `code-analyzer`
3. Command reviews analysis findings with user
4. Command delegates improvement generation to `improvement-generator`
5. Command delegates validation to `validation-agent`
6. Command compiles review report with improvements and validation results

---

## Related Commands

- `/agents:list` - List all available agent systems (if it exists)
- `/agents:test` - Test an agent system with scenarios (if it exists)
- `/agents:document` - Generate documentation for an agent system (if it exists)

---

## Troubleshooting

### Architecture Issues
- **Problem:** Too many sub-agents (>5)
  - **Solution:** Look for ways to combine related capabilities

- **Problem:** Sub-agent responsibilities overlap
  - **Solution:** Refine boundaries; split or merge agents

- **Problem:** Orchestration is too complex
  - **Solution:** Simplify workflow; reduce handoffs; clarify dependencies

### Creation Issues
- **Problem:** Sub-agent creator produces unclear instructions
  - **Solution:** Provide more detailed specifications to subagent-creator

- **Problem:** Command creator doesn't include sufficient orchestration detail
  - **Solution:** Provide more explicit coordination logic to command-creator

### Integration Issues
- **Problem:** Sub-agent names don't match command references
  - **Solution:** Standardize naming before creation; validate after

- **Problem:** Data formats between agents don't align
  - **Solution:** Define explicit input/output contracts in specifications

---

**Command Version:** 1.0
**Last Updated:** 2025-10-20
**Owner:** Platform Engineering
