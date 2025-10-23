---
description: Incrementally aggregate learning reports into consolidated knowledge base, processing one file per invocation
---

# /learn:aggregate

Incrementally aggregate learning reports from `ai/learn/*.md` into consolidated knowledge base `ai/learn/aggregated.md`, processing exactly ONE file per invocation to avoid context overload.

## Objective

Process individual learning reports and merge them into `ai/learn/aggregated.md` - a consolidated knowledge base that removes redundancy and merges similar topics WITHOUT compromising information. Use stateful task tracking to enable incremental progress across multiple invocations.

## Context & Prerequisites

**File Structure:**
```
ai/learn/
├── 2025-01-15-feature-implementation.md    # Individual learning reports
├── 2025-01-16-bug-fix-session.md
├── 2025-01-17-refactoring.md
├── aggregated.tasks.md                      # Tracks which files processed
└── aggregated.md                            # Consolidated knowledge base
```

**Critical Constraint:**
- **Process EXACTLY ONE file per invocation** to avoid overwhelming context
- **Stateful tracking** via `aggregated.tasks.md` maintains progress across invocations
- User must invoke command repeatedly until all files processed

**Prerequisites:**
- Directory `ai/learn/` exists with learning report files
- Learning reports follow standard format from `/learn:analyze` command

## Instructions

### Phase 1: Initialize Task Tracker

**Objective:** Establish or update task tracking for incremental processing

**Steps:**

1. **Scan for Learning Reports**

   Use Glob to find all learning report files:
   ```
   Glob: ai/learn/*.md
   ```

   Exclude from results:
   - `aggregated.md` (the output file)
   - `aggregated.tasks.md` (the task tracker)

2. **Load or Create Task Tracker**

   Try to read `ai/learn/aggregated.tasks.md`.

   - **If file exists:** Read and parse existing tasks
   - **If file doesn't exist:** Create new task tracker with header:

   ```markdown
   ---
   description: Tracking aggregation progress for learning reports
   ---

   # Learning Report Aggregation Tasks

   ```

3. **Sync Task List with Files**

   Compare scanned files vs. tasks in tracker:

   - **For each file found by Glob:**
     - If NOT in task tracker: Add as new task with `[ ]` status
     - If already in tracker: Keep existing status

   - **Task format:**
     ```markdown
     - [ ] 2025-01-15-feature-implementation.md
     - [x] 2025-01-16-bug-fix-session.md  # Completed
     - [ ] 2025-01-17-refactoring.md
     ```

4. **Write Updated Task Tracker**

   Save updated `ai/learn/aggregated.tasks.md` with all files tracked.

**Validation:**

- [ ] All learning report files discovered
- [ ] Task tracker exists with all files listed
- [ ] Each task has clear status (`[ ]` or `[x]`)
- [ ] Excluded files (aggregated.md, aggregated.tasks.md) not in task list

---

### Phase 2: Find Next Unprocessed File

**Objective:** Identify the next pending file to process

**Steps:**

1. **Parse Task Tracker**

   Read `ai/learn/aggregated.tasks.md` and parse task list.

2. **Find First Pending Task**

   Search for first task with `[ ]` status (unchecked checkbox).

   - **If found:** Extract filename from task line
   - **If NOT found:** All files processed - report completion and STOP

3. **Report to User**

   If pending file found:
   ```
   Next file to process: <filename>
   ```

   If no pending files:
   ```
   ✅ All learning reports aggregated!
   Total reports processed: <count>
   Review consolidated knowledge: ai/learn/aggregated.md
   ```

**Validation:**

- [ ] Task tracker parsed successfully
- [ ] Next pending file identified OR completion detected
- [ ] User informed of status

**Stop Condition:** If no pending files, STOP here and report completion.

---

### Phase 3: Process ONE File

**Objective:** Read individual learning report, merge into aggregated knowledge base with deduplication

**Steps:**

1. **Read Individual Learning Report**

   Read the pending file: `ai/learn/<filename>`

   Extract content from sections:
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
   - Action Items

2. **Read Current Aggregated Knowledge Base**

   Try to read `ai/learn/aggregated.md`.

   - **If exists:** Read current content and structure
   - **If doesn't exist:** Create with skeleton structure:

   ```markdown
   # Aggregated Learning Knowledge Base

   **Last Updated**: <current date>
   **Total Reports Processed**: 0

   ---

   ## Tool Call Failures


   ## User Corrections


   ## Persistent Task Failures


   ## Efficiency & Parallelization


   ## Planning & Todo Management


   ## Context & Memory


   ## Communication Quality


   ## Code Quality & Type Safety


   ## Scope Discipline


   ## Rule Adherence (CLAUDE.md)


   ## Successful Patterns


   ## Action Items

   ### High Priority


   ### Medium Priority


   ### Patterns to Watch


   ```

3. **Merge Learnings with Deduplication**

   For each learning category, apply deduplication strategy:

   **Deduplication Rules:**

   - **Identify similar patterns:** Same root cause, similar context, same type of issue
   - **Merge occurrences:** Combine into single entry with multiple dates/sessions
   - **Preserve unique details:** Keep ALL unique context, examples, specific instances
   - **Update occurrence counts:** Track "Occurrences: X sessions"
   - **Consolidate action items:** Merge duplicate actions, increase priority for frequent issues

   **Merge Pattern Example:**

   *Before (Individual Report):*
   ```markdown
   ### Tool Call Failures
   Edit failed on auth.module.ts - tried to edit without reading first
   ```

   *Existing in Aggregated:*
   ```markdown
   ### Tool Call Failures

   #### Pattern: Missing File Path Validation
   **Occurrences**: 2 sessions
   **Context**:
   - 2025-01-15: Edit tool failed on non-existent path
   - 2025-01-16: Write tool failed without Read check
   ```

   *After Merge:*
   ```markdown
   ### Tool Call Failures

   #### Pattern: Missing File Path Validation
   **Occurrences**: 3 sessions
   **Context**:
   - 2025-01-15: Edit tool failed on non-existent path
   - 2025-01-16: Write tool failed without Read check
   - 2025-01-17: Edit failed on auth.module.ts - tried to edit without reading

   **Root Cause**: Not verifying file exists before edit operations

   **Prevention**:
   - Always Read file before Edit/Write
   - Check file existence with Glob/Read first
   ```

   **For New Patterns:**

   If learning doesn't match existing patterns, add as new entry with:
   - Pattern name/description
   - Context from this session
   - Root cause analysis
   - Prevention strategies

4. **Update Action Items**

   Merge action items from individual report into aggregated action items:

   - **High Priority:** Issues appearing 3+ times
   - **Medium Priority:** Issues appearing 2 times
   - **Patterns to Watch:** Issues appearing once

   Mark items as complete `[x]` if pattern has not appeared in recent sessions (last 5 reports).

5. **Update Metadata**

   Update header in aggregated.md:
   ```markdown
   **Last Updated**: <current date>
   **Total Reports Processed**: <count + 1>
   ```

6. **Write Updated Aggregated Knowledge Base**

   Save the merged content to `ai/learn/aggregated.md`.

**Validation:**

- [ ] Individual report read successfully
- [ ] Aggregated KB read or created
- [ ] Similar patterns identified and merged
- [ ] Unique details preserved
- [ ] Occurrence counts updated
- [ ] Action items consolidated by frequency
- [ ] Metadata updated
- [ ] File written successfully

---

### Phase 4: Update Task Tracker and Report Progress

**Objective:** Mark file as completed and inform user of progress

**Steps:**

1. **Mark File as Completed**

   Edit `ai/learn/aggregated.tasks.md`:
   - Find the task line for processed file
   - Change `[ ]` to `[x]`
   - Keep filename and any comments

2. **Count Remaining Files**

   Parse task list and count:
   - Total files
   - Completed files (with `[x]`)
   - Remaining files (with `[ ]`)

3. **Report Progress to User**

   Output:
   ```
   ✅ Processed: <filename>

   📊 Progress:
   - Completed: X files
   - Remaining: Y files

   🔄 Run `/learn:aggregate` again to process next file.
   ```

4. **STOP - Do NOT Process Next File**

   Critical: STOP execution here. Wait for user to invoke command again.

**Validation:**

- [ ] Task marked as completed in tracker
- [ ] Progress calculated correctly
- [ ] User informed of status
- [ ] Command stops (does NOT continue to next file)

---

## Output Format

### During Processing

```
Phase 1: Scanning learning reports...
  Found 5 learning reports
  Task tracker updated: 3 pending, 2 completed

Phase 2: Finding next file...
  Next file: 2025-01-17-refactoring.md

Phase 3: Processing file...
  Reading: ai/learn/2025-01-17-refactoring.md
  Reading: ai/learn/aggregated.md
  Merging learnings with deduplication...
  - Merged 3 patterns into existing entries
  - Added 2 new patterns
  - Consolidated 5 action items
  Updated: ai/learn/aggregated.md

Phase 4: Updating tracker...
  Marked as completed: 2025-01-17-refactoring.md

✅ Processed: 2025-01-17-refactoring.md

📊 Progress:
- Completed: 3 files
- Remaining: 2 files

🔄 Run `/learn:aggregate` again to process next file.
```

### On Completion (No Pending Files)

```
Phase 1: Scanning learning reports...
  Found 5 learning reports
  Task tracker status: 5 completed, 0 pending

✅ All learning reports aggregated!

📊 Summary:
- Total reports processed: 5
- Consolidated knowledge base: ai/learn/aggregated.md
- Task tracker: ai/learn/aggregated.tasks.md

Review your consolidated knowledge base at:
  ai/learn/aggregated.md
```

---

## Quality Standards

### Deduplication Quality

- **No information loss:** Every unique detail from individual reports preserved
- **Pattern consolidation:** Similar issues merged under common patterns with occurrence counts
- **Occurrence accuracy:** Counts reflect actual number of sessions/instances
- **Context preservation:** All unique examples, dates, file paths maintained
- **Root cause identification:** Merged patterns identify underlying causes
- **Prevention strategies:** Consolidated approaches to avoid recurring issues

### Processing Quality

- **Exactly one file per invocation:** Never process multiple files
- **Stateful tracking:** Task tracker maintains accurate state across invocations
- **Progress visibility:** User always knows what's completed and what remains
- **Incremental progress:** Each invocation makes measurable forward progress
- **Graceful continuation:** Can resume after interruption without data loss

### Knowledge Base Quality

- **Scannable structure:** Easy to find patterns by category
- **Actionable insights:** Action items prioritized by frequency
- **Evidence-based:** All patterns backed by specific examples
- **Clear patterns:** Root causes identified, not just symptoms
- **Evolving priorities:** Action items adjust based on recurring issues

---

## Constraints & Boundaries

### Must Do

- Process EXACTLY ONE file per invocation (never multiple)
- Use `aggregated.tasks.md` for stateful tracking
- Preserve ALL unique information when merging
- Update occurrence counts when merging similar patterns
- Report progress after each invocation
- STOP after processing one file (wait for next invocation)
- Create aggregated.md with skeleton if doesn't exist
- Validate task tracker is synced with actual files

### Must Not Do

- Process multiple files in single invocation
- Delete or lose information from individual reports
- Merge patterns that are not actually similar
- Skip deduplication (don't just append)
- Continue to next file automatically
- Modify individual learning reports
- Remove task tracker or aggregated.md
- Process files out of order without reason

### Scope

**In Scope:**
- Scanning `ai/learn/` directory for reports
- Managing task tracker (`aggregated.tasks.md`)
- Reading individual learning reports
- Merging learnings with deduplication
- Updating aggregated knowledge base
- Tracking and reporting progress
- Identifying patterns across reports
- Consolidating action items by frequency

**Out of Scope:**
- Creating new learning reports (see `/learn:analyze`)
- Analyzing current session (use `/learn:analyze`)
- Modifying individual reports
- Deleting processed reports
- Generating summaries outside aggregated.md
- Pushing changes to git
- Creating visualizations or dashboards

---

## Examples

### Example 1: First Invocation (No Task Tracker Exists)

**User:** `/learn:aggregate`

**Output:**
```
Phase 1: Scanning learning reports...
  Found 3 files:
  - 2025-01-15-auth-implementation.md
  - 2025-01-16-bug-fixes.md
  - 2025-01-17-refactoring.md

  Created task tracker: ai/learn/aggregated.tasks.md
  Status: 3 pending, 0 completed

Phase 2: Finding next file...
  Next file: 2025-01-15-auth-implementation.md

Phase 3: Processing file...
  Reading: ai/learn/2025-01-15-auth-implementation.md
  Created: ai/learn/aggregated.md (new file)
  Merged learnings:
  - Added 8 new patterns
  - Added 12 action items

Phase 4: Updating tracker...
  Marked as completed: 2025-01-15-auth-implementation.md

✅ Processed: 2025-01-15-auth-implementation.md

📊 Progress:
- Completed: 1 files
- Remaining: 2 files

🔄 Run `/learn:aggregate` again to process next file.
```

---

### Example 2: Middle Invocation (Merging Similar Patterns)

**User:** `/learn:aggregate`

**Output:**
```
Phase 1: Scanning learning reports...
  Found 3 files
  Task tracker status: 1 completed, 2 pending

Phase 2: Finding next file...
  Next file: 2025-01-16-bug-fixes.md

Phase 3: Processing file...
  Reading: ai/learn/2025-01-16-bug-fixes.md
  Reading: ai/learn/aggregated.md
  Merging learnings with deduplication...

  Merged patterns:
  - "Missing File Path Validation" (occurrence +1, now 2 sessions)
  - "Scope Creep - Adding Unrequested Features" (occurrence +1, now 2 sessions)

  New patterns:
  - "Insufficient Regex Validation" (new pattern)

  Action items:
  - Promoted "Always Read before Edit" to High Priority (3 occurrences)
  - Added "Validate regex patterns mentally" to Medium Priority

Phase 4: Updating tracker...
  Marked as completed: 2025-01-16-bug-fixes.md

✅ Processed: 2025-01-16-bug-fixes.md

📊 Progress:
- Completed: 2 files
- Remaining: 1 files

🔄 Run `/learn:aggregate` again to process next file.
```

---

### Example 3: Final Invocation (All Files Processed)

**User:** `/learn:aggregate`

**Output:**
```
Phase 1: Scanning learning reports...
  Found 3 files
  Task tracker status: 3 completed, 0 pending

✅ All learning reports aggregated!

📊 Summary:
- Total reports processed: 3
- Total patterns identified: 15
- High priority action items: 5
- Medium priority action items: 8

Files:
- Aggregated knowledge: ai/learn/aggregated.md
- Task tracker: ai/learn/aggregated.tasks.md

Review your consolidated knowledge base to identify recurring patterns and prioritize improvements.
```

---

### Example 4: New File Added Later

**Context:** User runs `/learn:analyze` which creates `2025-01-20-new-feature.md`

**User:** `/learn:aggregate`

**Output:**
```
Phase 1: Scanning learning reports...
  Found 4 files (1 new file detected)

  New file added to tracker:
  - 2025-01-20-new-feature.md

  Task tracker status: 3 completed, 1 pending

Phase 2: Finding next file...
  Next file: 2025-01-20-new-feature.md

Phase 3: Processing file...
  Reading: ai/learn/2025-01-20-new-feature.md
  Reading: ai/learn/aggregated.md
  Merging learnings...
  - Merged 2 patterns into existing entries
  - Added 1 new pattern

Phase 4: Updating tracker...
  Marked as completed: 2025-01-20-new-feature.md

✅ Processed: 2025-01-20-new-feature.md

📊 Progress:
- Completed: 4 files
- Remaining: 0 files

All files processed! Review ai/learn/aggregated.md for consolidated insights.
```

---

## Edge Cases

### Edge Case 1: First Run - No Files Exist

**Scenario:** `ai/learn/` exists but contains no learning reports

**Handling:**
```
Phase 1: Scanning learning reports...
  No learning reports found in ai/learn/

  Create learning reports with: /learn:analyze

⚠️ No files to aggregate. Run `/learn:analyze` to create learning reports first.
```

---

### Edge Case 2: Task Tracker Corrupted or Unparseable

**Scenario:** `aggregated.tasks.md` exists but is malformed

**Handling:**
```
Phase 1: Scanning learning reports...
  ⚠️ Task tracker corrupted or unparseable

  Recreating task tracker from directory scan...
  Found 3 files - all marked as pending
  Created fresh task tracker: ai/learn/aggregated.tasks.md

Phase 2: Finding next file...
  Next file: 2025-01-15-auth-implementation.md

[Continue with normal processing]
```

---

### Edge Case 3: Aggregated.md Deleted but Task Tracker Shows Completed

**Scenario:** User deleted `aggregated.md` but `aggregated.tasks.md` shows files as completed

**Handling:**

Option A (Safe): Reprocess all files
```
Phase 1: Scanning learning reports...
  ⚠️ Aggregated knowledge base not found but task tracker shows 3 completed files

  Options:
  1. Reprocess all files (reset task tracker)
  2. Skip processing (assumes manual deletion)

  Recommended: Reprocess all files

  Resetting task tracker and starting fresh...
```

Option B (User choice): Ask user
```
⚠️ Aggregated.md missing but task tracker shows completed files.

What would you like to do?
A) Reprocess all files (reset tracker)
B) Assume manual deletion (don't reprocess)

Choice:
```

---

## Related Commands

- `/learn:analyze`: Create individual learning report from current session
- `/git:commit`: Commit aggregated knowledge base changes
- None: This command is unique for aggregating learning reports

---

## Changelog

**Version 1.0** (2025-10-23)

- Initial implementation of incremental learning report aggregation
- Stateful task tracking via `aggregated.tasks.md`
- Exactly one file processed per invocation to avoid context overload
- Deduplication strategy that preserves all unique information
- Pattern merging with occurrence counting
- Action item consolidation by frequency
- Progress reporting after each invocation
- Graceful handling of edge cases (missing files, corrupted trackers, new files)
