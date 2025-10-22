Love this. Let’s turn your idea into a concrete, shippable v1. Below are the **deliverables you asked for—grouped by subagents, slash commands, templates, and scripts/CLI**—with tight specs (inputs/outputs, file paths, statuses) so you can implement immediately.

# Directory layout (convention)

```
ai/
  agents/                 # <agent-name>.md instruction files (Claude/Code/…)
  prd/                    # <agent-name>.prd.md (source of truth)
  feedback/
    <agent-name>/
      2025-10-20T15-04-01Z_missing-repro-steps.md
      2025-10-20T15-40-12Z_prd-missing-acceptance-criteria.md
  templates/
    feedback.md
    agent.prd.md
    agent.instructions.md
    update-plan.md
    changelog.md
    pr-template.md
  rules/                  # global project rules / playbook
  cli/                    # TS/Node commands (bin proxies)
  indexes/
    feedback.jsonl        # flattened index for quick queries
    embeddings/           # optional vector index
  logs/
  .hooks/                 # Git hooks used by the CLI
```

---

# Subagents (core)

Each subagent receives a JSON payload, writes files under `ai/…`, and returns a small JSON result.

### 1) `agent:feedback-writer` (you described)

- **Purpose:** Persist cross-agent learnings as reviewable feedback.
- **Input:**

  - `authorAgent` (string)
  - `targetAgent` (string)
  - `sources[]`: `{ content, file, lineStart, lineEnd }`
  - `observation` (string)
  - `insight` (string)
  - `feedback` (string; explicit “do X / add Y / change Z”)
  - `solutions[]` (optional same shape as `sources`)

- **Side-effects:**

  - `git blame` for each `file:lineStart..lineEnd` to list authors; if file is uncommitted, mark `author = authorAgent`.
  - Write `ai/feedback/<targetAgent>/<timestamp>_<slug>.md` using the Feedback Template.
  - Append a row to `ai/indexes/feedback.jsonl`.

- **Output:** `{ path, id, status: "waiting_for_review" }`.

### 2) `agent:feedback-reviewer`

- **Purpose:** Decide: `accepted` / `rejected` (+ notes).
- **Inputs:** `{ path, projectRulesPath, prdPath }`
- **Logic:**

  - Validate evidence: sources→observation→insight→feedback chain.
  - Check against **global rules** (`ai/rules/*`) and **target PRD** (`ai/prd/<agent>.prd.md`).

- **Side-effects:** Update the feedback file’s `status` and add `## Review Notes`.
- **Output:** `{ path, status, reasons[] }`.

### 3) `agent:prd-creator`

- **Purpose:** Generate an **Agent PRD** from a user request.
- **Inputs:** `{ agentName, userRequest, projectRulesPath, prdTemplatePath }`
- **Side-effects:** Write `ai/prd/<agentName>.prd.md`.
- **Output:** `{ path }`.

### 4) `agent:creator`

- **Purpose:** Produce first **agent instruction file** from PRD + template.
- **Inputs:** `{ agentName, prdPath, agentTemplatePath }`
- **Side-effects:** Write `ai/agents/<agentName>.md`.
- **Output:** `{ path }`.

### 5) `agent:prd-updater`

- **Purpose:** Update PRD from **accepted** feedback (only if PRD-worthy).
- **Inputs:** `{ prdPath, feedbackPath }`
- **Strict rules:**

  - **Reject** if transient/debug-only/bug-fix guidance.
  - **Accept** only if requirement/process/template gaps.

- **Side-effects:** Edits PRD; appends to `## Changelog` block.
- **Output:** `{ prdPath, changed: boolean, reason }`.

### 6) `agent:update-planner`

- **Purpose:** Plan diffs needed to bring the agent file up to PRD + accepted feedbacks.
- **Inputs:** `{ agentPath, prdPath, acceptedFeedbackPaths[] }`
- **Side-effects:** Write `ai/agents/.plans/<agent>.plan.md` (uses Update-Plan Template).
- **Output:** `{ planPath }`.

### 7) `agent:updater`

- **Purpose:** Apply the plan to the agent instruction file.
- **Inputs:** `{ agentPath, planPath }`
- **Side-effects:** Update `ai/agents/<agent>.md`; delete `planPath`; write `ai/changelogs/<agent>.md`.
- **Output:** `{ agentPath, integratedFeedbackIds[] }`.

### 8) `agent:verifier` (quality gate)

- **Purpose:** Sanity-check agents after creation/update.
- **Checks:** template sections present, examples runnable, tool constraints respected, instructions ≤ size budget, references resolvable.
- **Inputs:** `{ agentPath, prdPath }`
- **Output:** `{ ok: boolean, issues[] }`.

---

# Subagents (supporting / optional)

### 9) `agent:observation-catcher`

- Convert runtime errors / failed test outputs into **draft** feedback files (status: `waiting_for_review`).

### 10) `agent:indexer`

- Maintain `ai/indexes/feedback.jsonl` and an optional vector index for semantic retrieval.

### 11) `agent:router`

- Infer `targetAgent` from filenames, paths, or heuristics when not given.

### 12) `agent:integrity-auditor`

- Ensure every `accepted` feedback has either PRD change or explicit “no-PRD” rationale.

---

# Slash commands (UX orchestration)

### `/agent:create`

- **Args:** `[agent-name] [purpose (free text)]`
- **Flow:**

  1. `agent:prd-creator` → PRD
  2. `agent:creator` → agent file
  3. `agent:verifier` → report problems (inline)

- **Output:** links to PRD/agent, verify report.

### `/agent:update [agent-name] [optional-user-feedback]`

- **Flow:** 0) If `agent-name` omitted and text looks like feedback, **infer** target and **confirm with user** (your rule).

  1. If user supplied feedback: `agent:feedback-writer` → `agent:feedback-reviewer` (must pass before proceeding).
  2. Batch-review all `waiting_for_review`: call `agent:feedback-reviewer` per file.
  3. For each newly `accepted`: run `agent:prd-updater`.
  4. `agent:update-planner` (PRD + accepted feedbacks).
  5. `agent:updater` → update agent file.
  6. `agent:verifier`.

- **Output:** summary table of processed feedbacks + links to diffs.

### `/agent:status [agent-name]`

- Shows PRD version, last update, pending feedback counts per status.

### `/feedback:list [--name=<agent>] [--status=waiting|accepted|rejected]`

- Convenience view (wraps `agent-feedbacks` CLI).

### `/agent:list`

- Lists all agents with PRD presence, verification status, pending feedback.

---

# Templates

### 1) **Feedback Template**: `ai/templates/feedback.md`

```markdown
---
id: ${timestamp}_${slug}
createdAt: ${iso8601}
authorAgent: ${authorAgent}
targetAgent: ${targetAgent}
status: waiting_for_review # waiting_for_review | accepted | rejected | superseded
evidenceScore: null # optional numeric, set by reviewer
relatedPRDImpact: null # "none" | "minor" | "major"
sourceAuthors: # filled via git blame
  - { file: "...", lines: "10-24", authors: ["alice <…>", "bob <…>"] }
---

# Observation

${observation}

# Insight

${insight}

# Feedback (Actionable Guidance)

${feedback}

# Sources

${table of sources: file, lines, excerpt}

# Solutions (Optional)

${table of solution refs}

## Review Notes (filled by reviewer)

- decision: waiting_for_review
- rationale:
- reviewer:
- date:
```

### 2) **Agent PRD Template**: `ai/templates/agent.prd.md`

```markdown
# ${Agent Name} — PRD

## 1. Purpose & Scope

## 2. Inputs & Outputs (schemas)

## 3. Tools & Permissions

## 4. Workflow & Decision Rules

## 5. Templates & Conventions it must honor

## 6. Non-Goals / Anti-patterns

## 7. Quality Gates (Verifier must enforce)

## 8. Telemetry & Feedback Triggers

## 9. Open Questions

---

## Changelog

- 2025-10-20: v1 initial
```

### 3) **Agent Instructions Template**: `ai/templates/agent.instructions.md`

```markdown
# ${Agent Name} — Operating Spec (for LLM)

## Mission

## Constraints (hard rules)

## IO Schemas (JSON)

## Tools & When-To-Use

## Step-by-step Loop

## Failure Handling & When to Emit Feedback (call agent:feedback-writer)

## Examples (good/bad)

## Glossary
```

### 4) **Update Plan Template**: `ai/templates/update-plan.md`

```markdown
# Update Plan — ${agentName}

## Inputs

- PRD: ${path}
- Accepted Feedbacks:
  - ${id}: ${title} → sections to apply

## Diffs Required

- Section: ${...}
  - Change:
  - Rationale (PRD clause / Feedback id):

## Risk & Tests

## Done Criteria
```

### 5) **Changelog Template**: `ai/templates/changelog.md`

```markdown
# ${Agent Name} — Changes

- ${date}: Integrated feedback ${ids}. Summary: …
```

### 6) **PR Template**: `ai/templates/pr-template.md`

```markdown
## Summary

## Linked Feedback

- [ ] ${id}

## PRD Impact

- [ ] Updated PRD section(s)

## Verification

- [ ] agent:verifier passed
```

---

# Scripts / CLI (Node+TS recommended)

> Put executables in `ai/cli/` and expose bin shims in `package.json`.

### Core

1. **`agent-feedbacks`**

   - `--name=<agent>` `--status=<status>` `--format=table|json`
   - Reads `ai/feedback/<agent>/*.md`, surfaces frontmatter.

2. **`agent-feedback-create`** (used by subagent or slash)

   - Writes feedback file from 'SON payload; computes slug'; updates index.

3. **`agent-feedback-review`**

   - `--path=<feedback.md>` `--decision=accept|reject` `--reason="…"`.
   - Mutates status + appends “Review Notes”.

4. **`agent-author-detect`**

   - Wrap `git blame` by `file:lineStart..lineEnd`; fallback to `authorAgent`.

5. **`agent-prd-create`**

   - From request → PRD (uses PRD template).

6. **`agent-create`**

   - From PRD → agent instructions (uses Instructions template).

7. **`agent-prd-update`**

   - `--prd=<path>` `--feedback=<path>`; enforces PRD-worthiness rules.

8. **`agent-update-plan`**

   - Synthesizes `accepted` feedbacks + PRD into a concrete plan md.

9. **`agent-update-apply`**

   - Applies plan to `<agent>.md`; writes changelog; deletes plan.

10. **`agent-verify`**

    - Lints presence of mandatory sections, cross-links, token budget, examples, references.

11. **`agent-index`**

    - Maintains `ai/indexes/feedback.jsonl`, optional embeddings; supports `--rebuild`.

### Supporting / quality-of-life

12. **`agent-next`**

    - Returns next agent with pending `waiting_for_review` feedback.

13. **`agent-scan-runtime`**

    - Converts logs/test failures into **draft** feedback files via `agent:observation-catcher`.

14. **`.hooks/commit-msg`** (git hook)

    - Reject commit if touching `ai/agents/<name>.md` without referencing at least one `accepted` feedback ID or “no-feedback-needed” tag in message.

15. **`agent-report`**

    - Generates a dashboard summary (counts per status, agents freshness vs PRD, last change).

---

# Status model & governance

- **Feedback statuses:** `waiting_for_review` → `accepted | rejected | superseded` (immutable after decision; superseding creates a new file and links prior id).
- **Integration lifecycle:**

  1. `accepted` → may or may not touch PRD (record decision).
  2. If PRD-worthy → `agent:prd-updater`.
  3. Always considered by `agent:update-planner` for instruction updates.

- **Traceability:** Every agent change references feedback IDs in changelog and commit.

---

# Minimal V1 (what to implement first)

1. **Core subagents:** feedback-writer, feedback-reviewer, prd-creator, creator, prd-updater, update-planner, updater, verifier.
2. **Slash commands:** `/agent:create`, `/agent:update`, `/agent:status`, `/feedback:list`.
3. **Templates:** feedback, PRD, instructions, update-plan, changelog, PR template.
4. **CLI:** agent-feedbacks, agent-feedback-create, agent-feedback-review, agent-prd-create, agent-create, agent-prd-update, agent-update-plan, agent-update-apply, agent-verify, agent-index.
5. **Git hook:** commit-msg guard.
