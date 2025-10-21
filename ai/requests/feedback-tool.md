One of the main limitations of AI agents that I noticed so far while using them extensively in my daily work is that, unlike humans, the AI agents do not learn from their experiences and mistakes, not do they communicate between each other to share knowledge and to give feedback to agents specialized into other pipeline/workflow stages.

For example, a good development team setup would be able to give feedback to designers when their specifications are lacking something important to enable them to implement those. Or, they can also give feedback to the QA team when they are receiving incomplete information, like missing reproduction steps, in bugs and tickets.

Then, we also have individual learnings: when a developer faces a bug that takes them hours to find a solution, the next time they find this same bug, they will have the experience / learning / memories about how to handle them. This can also happen when they see their code fail in production, from rejected PRs, or even in simple development loops, where they write code, it fails in lint/parse/tests, and then they go on and fix. But the next time they write code, they will have learned from these previous experiences and they will "one-shot" coding tasks a lot more. This is what makes someone with 20 years of experience so much more valuable than juniors that are just starting.

But when we talk about agents, we usually have short lived memories + agent instructions. While in the same session, the agent will learn from previous mistakes, but once you start a new session with that same agent, it will start from scratch and fail to have any improvements from other experiences.

This happens because the agent is actually a set of system prompt instructions that hardly change. For these instructions to change, generally the human in the loop will "make" the agents learn from their mistakes after supervising their sessions and seeing agents fail.

But what if we could have agents that can persist learning experiences and event give feedback on other agents work?

I want to propose and create a system where this is possible. To do this, I imagine the following workflow:

1. In their sessions, agents can use a specialized `agent:feedback-writer` subagent that will generate markdown files for each feedback in `ai/feedback/<target-agent-name>/<timestamp>_<memory_name>.md`. This agent must receive the following input from the main agent:

1.a) `sources`: the list of specific original text/code/spec that triggered this annotation, it must contain the `content`, `file`, `lineStart` and `lineEnd`.
1.b) `observation`: a field to describe the facts and observations that lead to a problem or something that triggered a new learning
1.c) `insight`: a field to show the reasoning around the observation
1.d) `feedback`: where the solution to the problem, or the guidelines to apply an insight are explicitly declared/defined.
1.e) `solutions`: an optional list with the same structure as the `sources` list, but now pointing to the actual solutions of a problem.

The subagent should then use the git cli to find out who were the authors for the source content that generated this feedback, and should notice that when the content is not commited yet, this means that the main agent is the target author.

The generated markdown must then contain a standardized structure (we should have a template for these files), for all the details about this feedback, including:

1. The agent that created this feedback
2. The agent that is the target of this feedback
3. All of the details provided about the feedback
4. Integration Status: whether this feedback was:
   4.a) Waiting for review
   4.b) Accepted and must be integrated into the target agent's instructions
   4.c) Rejected and will not be integrated

---

Then, for this self improving system to work, we would have these workflows:

## Create Agent `/agent:create`

1. Agent PRD: all agents must have a source PRD used when generating their instructions.
2. `agent:prd-creator`: a specialized subagent for generating agent PRDs based on the agent PRD template and the user's request about the target agent functionality.
3. `agent:creator`: a specialized subagent that can write the <agent-name>.md claude-code agent instruction file. It must use the source Agent PRD + the Agent Template for generating the final agent instructions.
4. `/agent:create`: a custom slash command instructed to gather agent requirements from the user and then use the previous subagents to generate the PRD, the Agent and verify the final Agent.

## Update Agent `/agent:update [agent-name] [optional-user-request-or-feedback]`

1. `agent-feedbacks --name=<agent_name> --status=waiting_for_review`: a simple CLI tool that can be used to retrieve a list of all feedbacks for any specific agent name whose status is `waiting_for_review`, `rejected` or `accepted`.
2. `agent:feedback-reviewer`: a specialized subagent that can review a feedback and Approve or Reject it. Feedbacks can be rejected when it's content do not contain enough evidence to prove it's correctness, or if it goes strictly against the project's playbook/rules or the agent's source PRD. The reviewer can also add `## Review Notes` section to the feedback document, both to justify a rejection, but also to improve upon the original feedback, specifically for better integration with the agent's PRD and project rules.
3. `agent:prd-updater`: a specialized agent that can update the PRD based on a feedback file. This subagent must be extremelly strict and must deny/reject update requests if it deems that the feedback is not PRD worthy. For example:
   3.a) Reject when the feedback is transient, like bugs or errors / problems not directly related to PRD requirements. For example, a feedback about how to debug a specific type of error, or how to correctly use an API.
   3.b) Accept and Update when the feedback is directly related to the PRD requirements. For example, when the template for a design/plan document is missing key sections, or when the agent's workflow must include extra steps.
4. `agent:update-planner`: a specialized agent that can review the current agent's instructions to the current version of the PRD + all accepted feedbacks for that agent. It must output a temporary analysis about how to improve the current agent and integrate all the missing requirements from the PRD and all missing examples/instructions for feedback integration.
5. `agent:updater`: a specialized agent that can update an existing agent file based on the previously generated update plan file. After finishing, the agent must clean (delete) the temporary plan file.
6. `/agent:update`: a custom slash command for updating a specific agent or the next agent that needs to be updated.
   6.a) Receive user feedback (optional): the user may call this command with a specific request/feedback about the target agent. When this happens, the `/agent:update` must first interact with the user to gather all information required to then use the `agent:feedback-writer` to generate a new feedback file and then immediately use the `agent:feedback-reviewer` to check if the feedback is valid, or if it goes against the original PRD or global project rules. If this step happens, it must only continue to the next step after the user feedback passes the review.
   6.b) Review all pending feedbacks: then, it must use the cli tool for finding all feedbacks that are waiting for review, and then delegate review tasks for each file individially, using the `agent:feedback-reviewer` subagent.
   6.c) Next, it must use the `agent:prd-updater` for all newly accepted feedbacks (one subagent task per feedback) to ensure the PRD is updated with relevant feedback.
   6.d) Next, it must use the `agent:update-planner` subagent to generate the temporary update plan and analysis file.
   6.e) Finally, it must use the `agent:updater` subagent to consume the plan and implement the final changes to the agent file.

Note: when the `/agent:update` command does not receive any specified agent name, it must:

1. Try to infer from the user request/feedback which agent they are targeting, and MUST confirm with the user if that is the correct agent before continuing.
2. If no agent name nor user feedback/request are specified, the agent must use the cli to find the next agent with pending feedback and then update that specific agent.

---

## Improvement Recursion

The agents and slash commands for this system should also use this system itself! Their first version will not be perfect, but once it is running, they can start learning from their mistakes and receive feedback from the user.

---

## Deliverables

We must have a list (per category) for all subagents, custom slash commands, templates and scripts we will need to have this system up and running

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
  - { file: '...', lines: '10-24', authors: ['alice <…>', 'bob <…>'] }
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
   - Writes feedback file from JSON payload; computes slug; updates index.

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
