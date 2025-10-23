---
description: Incrementally apply systematic improvements based on aggregated learning patterns, processing one improvement per invocation
model: claude-sonnet-4-5
---

# /learn:improve

Apply systematic improvements to CLAUDE.md, subagents, and slash commands based on patterns from `ai/learn/aggregated.md`, processing exactly ONE improvement per invocation to enable user approval and focused changes.

## Objective

Analyze patterns from consolidated learning reports and propose targeted improvements to project documentation, agents, and commands. Use stateful tracking to enable incremental progress with user approval gates.

## Context & Prerequisites

**File Structure:**
```
ai/learn/
├── aggregated.md           # Input: Consolidated patterns from /learn:aggregate
├── improvements.tasks.md   # State: Track applied/pending/skipped improvements
└── <individual reports>    # Reference if needed for context
```

**Processing Model:**
- **ONE improvement per invocation** - Never process multiple improvements
- **User approval required** - Present proposal, wait for yes/no/later
- **Stateful tracking** - Maintain state across invocations via improvements.tasks.md
- **Delegate to specialists** - Use subagent-writer and slash-command-writer agents

**Prerequisites:**
- `ai/learn/aggregated.md` exists (run `/learn:aggregate` first if not)
- Patterns have been consolidated with occurrence counts
- Ready to make systematic improvements

## Instructions

### Phase 1: Load & Analyze

**Objective:** Load learning data and identify unaddressed patterns

**Steps:**

1. **Load Aggregated Knowledge Base**

   Read `ai/learn/aggregated.md` to extract all patterns.

   If file doesn't exist:
   ```
   ⚠️ No aggregated knowledge base found.
   Run `/learn:aggregate` first to consolidate learning reports.
   ```
   STOP execution.

2. **Load or Create Improvements Tracker**

   Try to read `ai/learn/improvements.tasks.md`.

   - **If exists:** Read and parse existing tracked improvements
   - **If doesn't exist:** Create new tracker with structure:

   ```markdown
   ---
   description: Track which learning patterns have been addressed
   ---

   # Learning Improvement Tracking

   ## Applied Improvements

   ## Pending Improvements

   ## Skipped Patterns

   ```

3. **Extract Patterns from Aggregated Knowledge**

   Parse `aggregated.md` and extract patterns from each section:
   - Tool Call Failures
   - User Corrections
   - Persistent Task Failures
   - Efficiency & Parallelization
   - Planning & Todo Management
   - Context & Memory
   - Communication Quality
   - Code Quality & Type Safety
   - Scope Discipline
   - Rule Adherence
   - Successful Patterns

   For each pattern, extract:
   - Pattern name/description
   - Occurrence count (from "Occurrences: X sessions")
   - Severity/impact level
   - Context and examples

4. **Identify Unaddressed Patterns**

   Cross-reference extracted patterns with improvements tracker:
   - Filter out patterns marked as `[x]` (Applied) or `[~]` (Skipped)
   - Keep only patterns not yet addressed

   If no unaddressed patterns:
   ```
   ✅ All patterns addressed!
   Total applied: X improvements
   Total skipped: Y patterns

   Review CLAUDE.md and agents to see applied improvements.
   ```
   STOP execution.

**Validation:**

- [ ] Aggregated knowledge base loaded successfully
- [ ] Improvements tracker loaded or created
- [ ] All patterns extracted with metadata
- [ ] Unaddressed patterns identified

---

### Phase 2: Prioritization

**Objective:** Score and select highest priority unaddressed pattern

**Steps:**

1. **Score Each Unaddressed Pattern**

   Calculate priority score using three factors:

   **A. Frequency Score** (occurrences × 2)
   - 1 occurrence: 2 points
   - 2 occurrences: 4 points
   - 3 occurrences: 6 points
   - 4+ occurrences: 8+ points

   **B. Severity Score** (from context/impact description)
   - Critical: 3 points (causes failures, blocks work)
   - Medium: 2 points (reduces efficiency, quality issues)
   - Minor: 1 point (small improvements)

   **C. Scope Score** (how broadly applicable)
   - Global: 3 points (affects all work)
   - Common: 2 points (affects many tasks)
   - Specific: 1 point (narrow use case)

   **Priority Score = (Frequency × 2) + Severity + Scope**

   Examples:
   - Pattern with 5 occurrences, Critical, Global: (5 × 2) + 3 + 3 = 16 points
   - Pattern with 2 occurrences, Medium, Common: (2 × 2) + 2 + 2 = 8 points
   - Pattern with 1 occurrence, Minor, Specific: (1 × 2) + 1 + 1 = 4 points

2. **Sort by Priority Score**

   Order unaddressed patterns by priority score (highest first).

3. **Select Top Priority Pattern**

   Choose the highest scoring pattern for processing.

   If multiple patterns have same score, prefer:
   1. Higher occurrence count
   2. Higher severity
   3. Broader scope
   4. Most recent occurrence

**Validation:**

- [ ] All patterns scored using consistent criteria
- [ ] Scoring factors clearly identified
- [ ] Patterns sorted by priority
- [ ] Single highest priority pattern selected

---

### Phase 3: Categorize & Propose

**Objective:** Determine improvement type and generate detailed proposal for user approval

**Steps:**

1. **Determine Improvement Type**

   Apply decision framework to categorize the selected pattern:

   **Decision Tree:**

   ```
   Occurrences < 2?
     → SKIP (not recurring enough, mark as [~])

   Occurrences ≥ 3 AND Global scope?
     → CLAUDE.md UPDATE

   Existing agent had issues in pattern?
     → IMPROVE EXISTING AGENT (via subagent-writer)

   Existing command had issues in pattern?
     → IMPROVE EXISTING COMMAND (via slash-command-writer)

   Complex task (3+ steps) + Can be isolated?
     → CREATE NEW AGENT (via subagent-writer)

   Workflow pattern + Needs session context?
     → CREATE NEW COMMAND (via slash-command-writer)

   Too specific / One-off?
     → SKIP (mark as [~])
   ```

2. **Generate Detailed Proposal**

   Create comprehensive proposal with:

   **Proposal Structure:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Pattern: <Pattern Name>
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📈 Statistics:
      • Occurrences: X sessions
      • Severity: <Critical/Medium/Minor> (<impact description>)
      • Scope: <Global/Common/Specific> (<affects what>)
      • Priority Score: X points

   📋 Context from sessions:
      • <Date/session>: <specific instance>
      • <Date/session>: <specific instance>
      • <Date/session>: <specific instance>

   🎯 Proposed Improvement:
      Type: <CLAUDE.md / Improve Agent / Create Agent / Improve Command / Create Command / Skip>
      File: <path to file that will be modified/created>
      Section: <section name if CLAUDE.md>

      Change: <specific change description>

      Preview/Diff:
      ───────────────────────────────────────
      <Show what will be added/modified>
      <For CLAUDE.md: show exact text to add>
      <For agents/commands: describe changes>
      ───────────────────────────────────────

   💡 Expected Impact:
      • <Benefit 1>
      • <Benefit 2>
      • <Benefit 3>

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Apply this improvement?
     • yes - Apply now
     • no - Skip permanently (mark as resolved)
     • later - Keep pending for now
   ```

3. **Present to User**

   Display proposal and WAIT for user response.

   Do not proceed until user provides answer: yes, no, or later.

**Validation:**

- [ ] Pattern categorized using decision framework
- [ ] Improvement type determined with clear rationale
- [ ] Detailed proposal generated with all sections
- [ ] Preview/diff shows specific changes
- [ ] Expected impact clearly stated
- [ ] User presented with clear options

**Stop Condition:** WAIT for user response before proceeding to Phase 4.

---

### Phase 4: Apply Improvement (If User Approves)

**Objective:** Execute approved improvement using appropriate tools/agents

**User Response Handling:**

- **If "later":** Skip to Phase 5, mark as pending (keep `[ ]` status)
- **If "no":** Skip to Phase 5, mark as skipped (`[~]` status)
- **If "yes":** Continue with steps below

**Steps:**

1. **Route to Appropriate Implementation**

   Based on improvement type determined in Phase 3:

   **A. CLAUDE.md Update**

   1. Determine which CLAUDE.md to update:
      - User's global: `C:\Users\bruno\.claude\CLAUDE.md`
      - Project-specific: `C:\Users\bruno\Documents\Work\Projects\fullstack-starter\CLAUDE.md`

      If ambiguous, ask user:
      ```
      Which CLAUDE.md should be updated?
      1. Global (affects all projects): ~/.claude/CLAUDE.md
      2. Project (affects this project only): ./CLAUDE.md
      ```

   2. Read current CLAUDE.md file

   3. Identify exact section to modify (e.g., "Workflow Rules", "Type Safety", "Tool Optimization")

   4. Generate specific text to add:
      - Match existing formatting (bullets, indentation, tone)
      - Add, don't replace (unless contradictory)
      - Be specific, not vague
      - Include rationale in comment if needed

   5. Use Edit tool to add content to identified section

   6. Verify edit succeeded by reading modified section

   Example addition:
   ```markdown
   ## Workflow Rules
   - **File Operations**: Always Read file before Edit/Write operations
     - Prevents tool failures on non-existent paths
     - Validates file content before modification
     - Use Glob to check existence if Read is too heavy
   ```

   **B. Improve Existing Agent**

   1. Identify agent file path (e.g., `.claude/agents/test-writer.md`)

   2. Use Task tool to delegate to subagent-writer:
      ```
      Task: subagent_type="subagent-writer"

      Prompt: "Update existing agent at <file-path> to address: <pattern-name>

      Current issues:
      <description from pattern>

      Specific improvements needed:
      <list concrete changes>

      Examples from failures:
      <context from sessions>

      Expected result: Agent produces <desired behavior> and avoids <problematic behavior>."
      ```

   3. Wait for subagent-writer completion

   4. Verify agent file was updated

   **C. Create New Agent**

   1. Determine agent name (descriptive, action-oriented)

   2. Use Task tool to delegate to subagent-writer:
      ```
      Task: subagent_type="subagent-writer"

      Prompt: "Create new agent '<agent-name>' for: <purpose>

      Addresses pattern: <pattern-name>
      Occurred: X times in sessions

      Agent should handle:
      <specific behaviors>

      Context from failures:
      <examples from sessions>

      Success criteria:
      <what successful execution looks like>

      Expected workflow:
      <step-by-step process agent should follow>"
      ```

   3. Wait for subagent-writer completion

   4. Verify new agent file created

   **D. Improve Existing Command**

   1. Identify command file path (e.g., `.claude/commands/test.md`)

   2. Use Task tool to delegate to slash-command-writer:
      ```
      Task: subagent_type="slash-command-writer"

      Prompt: "Update existing command at <file-path> to address: <pattern-name>

      Current issues:
      <description from pattern>

      Specific improvements needed:
      <list concrete changes to instructions/constraints>

      Examples from failures:
      <context from sessions>

      Expected result: Command produces <desired behavior> and prevents <problematic behavior>."
      ```

   3. Wait for slash-command-writer completion

   4. Verify command file was updated

   **E. Create New Command**

   1. Determine command name (descriptive, kebab-case)

   2. Use Task tool to delegate to slash-command-writer:
      ```
      Task: subagent_type="slash-command-writer"

      Prompt: "Create new command '/command-name' for: <purpose>

      Addresses pattern: <pattern-name>
      Occurred: X times in sessions

      Command should encapsulate:
      <workflow steps>

      Context from manual repetitions:
      <examples from sessions>

      Template complexity: <Minimal/Standard/Comprehensive>

      Output should be:
      <deliverables and format>

      Success criteria:
      <what successful execution looks like>"
      ```

   3. Wait for slash-command-writer completion

   4. Verify new command file created

**Validation:**

- [ ] User approval received ("yes")
- [ ] Routed to correct implementation path
- [ ] For CLAUDE.md: Edit applied successfully
- [ ] For agents: subagent-writer completed successfully
- [ ] For commands: slash-command-writer completed successfully
- [ ] Changes verified (file read or agent report)

---

### Phase 5: Track & Report

**Objective:** Update tracking file and report progress to user

**Steps:**

1. **Update Improvements Tracker**

   Edit `ai/learn/improvements.tasks.md`:

   **If user approved ("yes"):**

   Move to "Applied Improvements" section:
   ```markdown
   ## Applied Improvements

   - [x] Pattern: <Pattern name> (X occurrences)
     - Type: <CLAUDE.md/Agent/Command>
     - File: <path to modified/created file>
     - Section: <section if CLAUDE.md>
     - Change: <brief description>
     - Applied: <current date>
   ```

   **If user skipped ("no"):**

   Move to "Skipped Patterns" section:
   ```markdown
   ## Skipped Patterns

   - [~] Pattern: <Pattern name> (X occurrences)
     - Reason: User chose to skip
     - Skipped: <current date>
   ```

   **If user deferred ("later"):**

   Keep in "Pending Improvements" section:
   ```markdown
   ## Pending Improvements

   - [ ] Pattern: <Pattern name> (X occurrences)
     - Priority: <High/Medium/Low>
     - Suggested Type: <improvement type>
   ```

2. **Count Progress**

   Parse improvements tracker and count:
   - Applied improvements (with `[x]`)
   - Pending patterns (with `[ ]`)
   - Skipped patterns (with `[~]`)

3. **Generate Report**

   **If improvement applied:**
   ```
   ✅ Applied improvement: <type>
      Pattern: <pattern name>
      Changed: <file path>
      Impact: <expected improvement>

   📊 Progress:
      Applied: X improvements
      Pending: Y patterns
      Skipped: Z patterns

   🔄 Run `/learn:improve` again to process next pattern.
   ```

   **If improvement skipped:**
   ```
   ⏭️ Skipped pattern: <pattern name>
      Reason: User chose not to apply

   📊 Progress:
      Applied: X improvements
      Pending: Y patterns
      Skipped: Z patterns

   🔄 Run `/learn:improve` again to process next pattern.
   ```

   **If improvement deferred:**
   ```
   ⏸️ Deferred pattern: <pattern name>
      Status: Kept as pending

   📊 Progress:
      Applied: X improvements
      Pending: Y patterns
      Skipped: Z patterns

   🔄 Run `/learn:improve` again to process next pattern.
   ```

4. **STOP - Do NOT Process Next Pattern**

   Critical: STOP execution here. Wait for user to invoke command again.

**Validation:**

- [ ] Improvements tracker updated correctly
- [ ] Pattern marked with correct status ([x], [~], or [ ])
- [ ] Metadata added (date, file, change description)
- [ ] Progress counted accurately
- [ ] Report generated with correct information
- [ ] Command stops (does NOT continue to next pattern)

---

## Output Format

### During Processing (User Approves)

```
Phase 1: Loading learning data...
  ✓ Loaded: ai/learn/aggregated.md
  ✓ Loaded: ai/learn/improvements.tasks.md
  ✓ Extracted 15 patterns
  ✓ Identified 8 unaddressed patterns

Phase 2: Prioritizing patterns...
  ✓ Scored all patterns
  ✓ Top priority (score: 23): Missing File Path Validation

Phase 3: Generating proposal...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern: Missing File Path Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Statistics:
   • Occurrences: 5 sessions
   • Severity: Critical (causes 30% of tool failures)
   • Scope: Global (affects all file operations)
   • Priority Score: 23 points

📋 Context from sessions:
   • 2025-01-15: Edit tool failed on non-existent path
   • 2025-01-16: Write tool failed without Read check
   • 2025-01-17: NotebookEdit failed on missing notebook

🎯 Proposed Improvement:
   Type: CLAUDE.md update
   File: C:\Users\bruno\.claude\CLAUDE.md
   Section: Workflow Rules

   Change: Add mandatory file verification rule

   Preview:
   ───────────────────────────────────────
   ## Workflow Rules
   + - **File Operations**: Always Read file before Edit/Write operations
   +   - Prevents tool failures on non-existent paths
   +   - Validates file content before modification
   +   - Use Glob to check existence if Read is too heavy
   ───────────────────────────────────────

💡 Expected Impact:
   • Prevent 30% of tool call failures
   • Reduce user corrections for file operation errors
   • Improve workflow reliability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply this improvement?
  • yes - Apply now
  • no - Skip permanently (mark as resolved)
  • later - Keep pending for now

> User: yes

Phase 4: Applying improvement...
  ✓ Read: C:\Users\bruno\.claude\CLAUDE.md
  ✓ Identified section: Workflow Rules
  ✓ Applied edit successfully
  ✓ Verified change

Phase 5: Updating tracker...
  ✓ Marked as applied in improvements.tasks.md

✅ Applied improvement: CLAUDE.md update
   Pattern: Missing File Path Validation (5 occurrences)
   Changed: C:\Users\bruno\.claude\CLAUDE.md
   Impact: Prevent 30% of tool call failures

📊 Progress:
   Applied: 1 improvement
   Pending: 7 patterns
   Skipped: 0 patterns

🔄 Run `/learn:improve` again to process next pattern.
```

---

### On Completion (No Unaddressed Patterns)

```
Phase 1: Loading learning data...
  ✓ Loaded: ai/learn/aggregated.md
  ✓ Loaded: ai/learn/improvements.tasks.md
  ✓ Extracted 15 patterns
  ✓ No unaddressed patterns found

✅ All patterns addressed!

📊 Summary:
   Applied: 12 improvements
   Skipped: 3 patterns
   Total patterns: 15

🎯 Improvements Made:
   CLAUDE.md updates: 5
   Agent improvements: 4
   New agents created: 1
   Command improvements: 2
   New commands created: 0

Review applied changes:
  • CLAUDE.md for new rules and guidelines
  • .claude/agents/ for updated/new agents
  • .claude/commands/ for updated/new commands
```

---

## Quality Standards

### Proposal Quality

- **Clear presentation:** User can make informed decision without confusion
- **Complete information:** All relevant context from aggregated.md included
- **Specific changes:** Not vague "improve X" but concrete additions/modifications
- **Realistic impact:** Expected benefits clearly stated, not oversold
- **Accurate categorization:** Improvements routed to correct target (CLAUDE.md vs agent vs command)

### Implementation Quality

- **CLAUDE.md updates:** Match existing style, add to correct section, be specific
- **Agent improvements:** Delegate to subagent-writer with clear requirements
- **Command improvements:** Delegate to slash-command-writer with clear requirements
- **Verification:** Always verify changes were applied successfully
- **No over-engineering:** Respect minimum occurrence thresholds, don't create for single occurrences

### Tracking Quality

- **State consistency:** Tracking file always reflects current state accurately
- **Complete metadata:** Applied improvements include date, file, change description
- **Clear status:** Each pattern has unambiguous status ([x], [~], or [ ])
- **Progress visibility:** User always knows what's completed and what remains

### Process Quality

- **One pattern per invocation:** Never process multiple patterns
- **User approval gates:** Always present proposal and wait for response
- **Stateful progress:** Can resume after interruption without data loss
- **Incremental progress:** Each invocation makes measurable forward progress

---

## Constraints & Boundaries

### Must Do

- Process EXACTLY ONE pattern per invocation (never multiple)
- Present proposal and WAIT for user approval (yes/no/later)
- Use improvements.tasks.md for stateful tracking
- Score patterns using consistent priority formula
- Route to appropriate implementation (CLAUDE.md, agent, or command)
- Delegate agent/command work to specialist agents
- Verify changes were applied successfully
- Update tracker with correct status and metadata
- Report progress after each invocation
- STOP after processing one pattern (wait for next invocation)
- Respect minimum occurrence thresholds (skip patterns with <2 occurrences)

### Must Not Do

- Process multiple patterns in single invocation
- Apply improvements without user approval
- Skip proposal phase and apply directly
- Make assumptions about which CLAUDE.md to update (ask if ambiguous)
- Create agents/commands for single-occurrence patterns
- Modify files directly that should be delegated (agents, commands)
- Continue to next pattern automatically
- Change existing tracking entries (only add or update status)
- Over-engineer solutions for simple patterns

### Scope

**In Scope:**
- Analyzing aggregated learning patterns
- Scoring and prioritizing patterns
- Generating detailed improvement proposals
- Updating CLAUDE.md directly
- Delegating to subagent-writer for agents
- Delegating to slash-command-writer for commands
- Tracking applied/pending/skipped improvements
- Reporting progress

**Out of Scope:**
- Creating learning reports (use `/learn:analyze`)
- Aggregating reports (use `/learn:aggregate`)
- Modifying individual learning reports
- Applying multiple improvements in one invocation
- Automatically applying improvements without user approval
- Making changes to code files directly
- Committing changes to git
- Creating visualizations or dashboards

---

## Decision Framework Reference

### When to Update CLAUDE.md

**Criteria:**
- Pattern appeared **3+ times** across sessions
- Affects **broad categories** of work (not task-specific)
- Represents **general principle** or rule violation
- Impact is **universal** (helps in all contexts)

**Examples:**
- "Always Read before Edit" → Workflow Rules section
- "Scope creep (adding unrequested features)" → Scope Discipline section
- "Parallelization misses" → Tool Optimization section

### When to Improve Existing Agent

**Criteria:**
- Agent was **used in session** and had specific issues
- Pattern is **agent-specific** (not general workflow issue)
- Improvement is **highly targeted** to that agent's domain
- Pattern appeared **2+ times**

**Action:** Delegate to subagent-writer agent

### When to Create New Agent

**Criteria:**
- **Recurring complex task** (appeared 2+ times)
- Task has **3+ distinct steps** that could be codified
- Task requires **specialized domain knowledge**
- Would benefit from **isolated context**

**Action:** Delegate to subagent-writer agent

**Examples:**
- Create `type-guard-generator` if repeatedly needing type guards
- Create `api-client-writer` if frequently building API clients

### When to Improve Existing Command

**Criteria:**
- Command was **used in session** and produced poor results
- Instructions were **unclear or incomplete**
- Missing **important constraints** or examples
- Pattern appeared **2+ times**

**Action:** Delegate to slash-command-writer agent

### When to Create New Command

**Criteria:**
- **Manual workflow** repeated 2+ times
- Needs **specific template** or structure
- Requires **session context** (can't delegate to subagent)
- Benefits from **reusable prompt**
- Pattern appeared **2+ times**

**Action:** Delegate to slash-command-writer agent

**Examples:**
- Create `/refactor:extract-service` for extracting NestJS services
- Create `/debug:trace-error` for debugging recurring error patterns

### When to Skip (Mark as [~])

**Criteria:**
- Pattern appeared only **1 time** (not recurring)
- Simpler to do manually than codify
- Too specific to be reusable
- Already well-documented elsewhere
- User chose "no" when presented with proposal

---

## Examples

### Example 1: CLAUDE.md Update Approved

**User:** `/learn:improve`

**Output:**
```
Phase 1: Loading learning data...
  ✓ Loaded aggregated.md with 15 patterns
  ✓ Found 8 unaddressed patterns

Phase 2: Prioritizing...
  ✓ Top priority (score: 23): Missing File Path Validation

Phase 3: Generating proposal...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern: Missing File Path Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Statistics:
   • Occurrences: 5 sessions
   • Severity: Critical (causes 30% of tool failures)
   • Scope: Global (affects all file operations)
   • Priority Score: 23 points

🎯 Proposed Improvement:
   Type: CLAUDE.md update
   File: C:\Users\bruno\.claude\CLAUDE.md
   Section: Workflow Rules

   Change: Add mandatory file verification rule

💡 Expected Impact:
   • Prevent 30% of tool call failures
   • Reduce user corrections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply this improvement?
```

**User:** `yes`

**Output:**
```
Phase 4: Applying improvement...
  ✓ Updated C:\Users\bruno\.claude\CLAUDE.md

✅ Applied improvement: CLAUDE.md update
   Pattern: Missing File Path Validation
   Changed: C:\Users\bruno\.claude\CLAUDE.md

📊 Progress:
   Applied: 1 improvement
   Pending: 7 patterns
   Skipped: 0 patterns

🔄 Run `/learn:improve` again to process next pattern.
```

---

### Example 2: User Defers Improvement

**User:** `/learn:improve`

[Phase 1-3 output showing proposal...]

**User:** `later`

**Output:**
```
⏸️ Deferred pattern: Scope Creep Prevention
   Status: Kept as pending

📊 Progress:
   Applied: 1 improvement
   Pending: 7 patterns
   Skipped: 0 patterns

🔄 Run `/learn:improve` again to process next pattern (will pick different pattern).
```

---

### Example 3: Creating New Agent

**User:** `/learn:improve`

**Output:**
```
Phase 3: Generating proposal...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern: Missing Type Guards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Statistics:
   • Occurrences: 4 sessions
   • Severity: Medium (causes type safety issues)
   • Scope: Common (affects type validation tasks)
   • Priority Score: 12 points

🎯 Proposed Improvement:
   Type: Create new agent
   File: .claude/agents/type-guard-generator.md

   Change: Create specialized agent to generate type guards

💡 Expected Impact:
   • Eliminate unsafe type assertions
   • Improve runtime type safety
   • Standardize type validation patterns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply this improvement?
```

**User:** `yes`

**Output:**
```
Phase 4: Applying improvement...
  ✓ Delegating to subagent-writer...
  [subagent-writer creates type-guard-generator.md]
  ✓ Agent created successfully

✅ Applied improvement: New agent created
   Pattern: Missing Type Guards (4 occurrences)
   Changed: .claude/agents/type-guard-generator.md

📊 Progress:
   Applied: 2 improvements
   Pending: 6 patterns
   Skipped: 0 patterns

🔄 Run `/learn:improve` again to process next pattern.
```

---

## Edge Cases

### Edge Case 1: No Aggregated Knowledge Base

**Scenario:** User runs `/learn:improve` but `ai/learn/aggregated.md` doesn't exist

**Handling:**
```
Phase 1: Loading learning data...
  ⚠️ No aggregated knowledge base found at: ai/learn/aggregated.md

Run `/learn:aggregate` first to consolidate learning reports into aggregated.md.

Cannot proceed without aggregated learning data.
```

---

### Edge Case 2: All Patterns Have Single Occurrence

**Scenario:** All patterns in aggregated.md appeared only once

**Handling:**
```
Phase 2: Prioritizing patterns...
  ⚠️ All patterns have single occurrences (not recurring)

Skipping all patterns - improvements require 2+ occurrences for reliability.

✅ No actionable patterns found.

Recommendation: Continue work and run `/learn:analyze` + `/learn:aggregate`
after more sessions to identify recurring patterns.
```

---

### Edge Case 3: User Provides Invalid Response

**Scenario:** User responds with something other than yes/no/later

**Handling:**
```
⚠️ Invalid response: "<user input>"

Please respond with:
  • yes - Apply this improvement now
  • no - Skip permanently (won't apply)
  • later - Keep pending for now (will ask again)

Apply this improvement?
```

---

### Edge Case 4: CLAUDE.md Ambiguous (Both Global and Project Exist)

**Scenario:** Pattern requires CLAUDE.md update but both global and project files exist

**Handling:**
```
Phase 4: Applying improvement...
  ⚠️ Multiple CLAUDE.md files found

Which CLAUDE.md should be updated?

1. Global (affects all projects): C:\Users\bruno\.claude\CLAUDE.md
2. Project (affects this project only): C:\Users\bruno\Documents\Work\Projects\fullstack-starter\CLAUDE.md

Recommendation:
  - Global: If rule applies universally to all your work
  - Project: If rule is specific to this project's conventions

Choice (1 or 2):
```

---

### Edge Case 5: Improvement Application Fails

**Scenario:** Edit tool fails or agent doesn't complete successfully

**Handling:**
```
Phase 4: Applying improvement...
  ❌ Failed to apply improvement: <error message>

Pattern will remain as pending for retry.

Possible actions:
1. Fix the issue manually
2. Run `/learn:improve` again to retry
3. Skip this pattern if no longer relevant

📊 Progress:
   Applied: X improvements
   Pending: Y patterns (including this one)
   Skipped: Z patterns
```

---

## Related Commands

- `/learn:analyze`: Create individual learning report from current session
- `/learn:aggregate`: Consolidate learning reports into aggregated.md
- `/git:commit`: Commit improvement changes to version control

**Workflow:**
1. `/learn:analyze` - After session, analyze what was learned
2. `/learn:aggregate` - Consolidate multiple session reports
3. `/learn:improve` - Apply systematic improvements (run multiple times)
4. `/git:commit` - Commit applied improvements

---

## Changelog

**Version 1.0** (2025-10-23)

- Initial implementation of incremental learning improvement application
- Stateful tracking via `improvements.tasks.md`
- Exactly one improvement per invocation with user approval gate
- Priority scoring based on frequency, severity, and scope
- Decision framework for categorizing improvements
- Delegation to subagent-writer and slash-command-writer agents
- Support for CLAUDE.md updates, agent improvements/creation, command improvements/creation
- Progress reporting and comprehensive edge case handling
