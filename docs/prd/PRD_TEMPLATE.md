# PRD-[##]: [Component/Feature Name]

**[Optional: Technology Stack Summary]**
**Frontend:** [e.g., React + Vite + TanStack + Tailwind]
**Backend:** [e.g., NestJS + Prisma + PostgreSQL + Redis]

## Document control

* **Status:** [Draft | Review | Approved | In Progress | Completed]
* **Last updated:** [YYYY-MM-DD]
* **Owners:** [Team/Guild responsible for this PRD]
* **Stakeholders:** [List of teams, guilds, or roles with interest in this PRD]
* **Related artifacts:** [Links to related PRDs, playbooks, ADRs, documentation]

---

## 1. Background & problem statement

[2-4 paragraphs describing:
- Current state and pain points
- Why this problem needs solving now
- Impact on users/teams/business
- Context on technology choices or architectural decisions
- How this fits into the broader system/platform]

**Key challenges:**
- [Specific challenge 1]
- [Specific challenge 2]
- [Specific challenge 3]

---

## 2. Goals & non-goals

### 2.1 Goals

[Number goals (1-7 typically) with clear, measurable outcomes]

1. **[Goal category]** — [Specific deliverable and outcome]
2. **[Goal category]** — [Specific deliverable and outcome]
3. **[Goal category]** — [Specific deliverable and outcome]
4. **[Goal category]** — [Specific deliverable and outcome]
5. **[Goal category]** — [Specific deliverable and outcome]

### 2.2 Non-goals

[Explicitly state what is out of scope to prevent scope creep]

* [Non-goal 1 - explain why it's excluded]
* [Non-goal 2 - explain why it's excluded]
* [Non-goal 3 - explain why it's excluded]
* [Responsibility attribution - if applicable, note which PRD owns excluded items]

---

## 3. Personas & user stories

[Table format showing who uses this, their scenarios, and success criteria]

| Role | Scenario | Success criteria |
| ---- | -------- | ---------------- |
| [Role name] | [What they're trying to accomplish] | [How we know they succeeded] |
| [Role name] | [What they're trying to accomplish] | [How we know they succeeded] |
| [Role name] | [What they're trying to accomplish] | [How we know they succeeded] |
| [Role name] | [What they're trying to accomplish] | [How we know they succeeded] |

---

## 4. Functional requirements

### 4.1 [Requirement Category 1]

[Detailed description of this requirement area]

* **[Subcategory]:**
  * [Specific requirement detail]
  * [Technical specification]
  * [Configuration or setup needs]
* **[Subcategory]:**
  * [Specific requirement detail]

### 4.2 [Requirement Category 2]

[Detailed description of this requirement area]

* **[Subcategory]:**
  * [Specific requirement detail]
  * [Code example if applicable]
  ```[language]
  [code example]
  ```

### 4.3 [Requirement Category 3]

[Continue with additional functional requirements as needed]

[Common categories to consider:
- Project setup/structure
- Configuration and environment
- Core functionality/features
- Integration points
- Data models/contracts
- API specifications
- UI/UX requirements
- Testing requirements
- Documentation requirements
- Quality gates
- Security requirements
- Performance requirements
- Observability/monitoring
- Distribution/deployment]

### 4.N [Additional Requirements]

[Add sections as needed for your specific PRD]

---

## 5. Integration with [related systems/PRDs]

[Describe how this PRD integrates with other components]

* **[Related PRD/System]:** [How they interact, what's consumed/provided]
* **[Related PRD/System]:** [How they interact, what's consumed/provided]
* **Dependency flow:** [Describe the flow of data/contracts/artifacts]
* **Enforcement:** [How integration contracts are enforced - ESLint rules, types, tests, etc.]

---

## 6. Technical approach

[Describe the technical strategy and key implementation decisions]

1. **[Approach aspect 1]** — [Description of technique, pattern, or architecture]
2. **[Approach aspect 2]** — [Description of technique, pattern, or architecture]
3. **[Approach aspect 3]** — [Description of technique, pattern, or architecture]
4. **[Approach aspect 4]** — [Description of technique, pattern, or architecture]
5. **[Approach aspect 5]** — [Description of technique, pattern, or architecture]

[Include diagrams, code examples, or architecture illustrations if helpful]

---

## 7. Metrics & success criteria

[Define quantifiable metrics that validate success]

* **[Metric category]:** [Target value or threshold with measurement method]
* **[Metric category]:** [Target value or threshold with measurement method]
* **[Metric category]:** [Target value or threshold with measurement method]
* **[Metric category]:** [Target value or threshold with measurement method]

[Common metric categories:
- Time to productivity/first feature
- Adoption rate
- Code coverage
- Performance budgets (bundle size, load time, etc.)
- Quality scores (accessibility, security, etc.)
- Error/defect rates
- Developer satisfaction
- Documentation completeness]

---

## 8. Risks & mitigations

[Table format for risks, impacts, and mitigation strategies]

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| [Description of risk] | [High/Medium/Low and explanation] | [How to prevent or handle this risk] |
| [Description of risk] | [High/Medium/Low and explanation] | [How to prevent or handle this risk] |
| [Description of risk] | [High/Medium/Low and explanation] | [How to prevent or handle this risk] |
| [Description of risk] | [High/Medium/Low and explanation] | [How to prevent or handle this risk] |

---

## 9. Rollout plan

[Break implementation into phases with clear deliverables]

**Phase 1 (Weeks [X-Y], MVP)**
* [Deliverable 1]
* [Deliverable 2]
* [Deliverable 3]

**Phase 2 (Weeks [X-Y])**
* [Deliverable 1]
* [Deliverable 2]
* [Deliverable 3]

**Phase 3 (Week [X]+)**
* [Deliverable 1]
* [Deliverable 2]
* [Deliverable 3]

[Optional: Include rollout gates, validation checkpoints, or beta testing phases]

---

## 10. Acceptance tests (definition of done)

[Numbered list of specific, testable acceptance criteria]

1. **[Test category]:** [Specific test or validation that must pass]
2. **[Test category]:** [Specific test or validation that must pass]
3. **[Test category]:** [Specific test or validation that must pass]
4. **[Test category]:** [Specific test or validation that must pass]
5. **[Test category]:** [Specific test or validation that must pass]
6. **[Test category]:** [Specific test or validation that must pass]

[Each acceptance test should be:
- Specific and unambiguous
- Independently verifiable
- Result in clear pass/fail
- Cover functional and quality requirements
- Include integration points with other systems]

---

## 11. Dependencies & out of scope

[List dependencies and explicitly state what's excluded]

* **Depends on:**
  * [PRD or system dependency with explanation]
  * [PRD or system dependency with explanation]
* **Provides to:**
  * [PRD or system that consumes outputs from this]
  * [PRD or system that consumes outputs from this]
* **Out of scope:**
  * [Excluded item with reason or reference to owning PRD]
  * [Excluded item with reason or reference to owning PRD]

---

## 12. Final decisions

[Document key architectural or technical decisions]

* **[Decision topic]:** [Decision and rationale]
* **[Decision topic]:** [Decision and rationale]
* **[Decision topic]:** [Decision and rationale]
* **[Decision topic]:** [Decision and rationale]

[Common decision topics:
- Technology choices
- Browser/platform support
- Architecture patterns
- API/protocol choices
- Package organization
- Testing strategies
- Distribution methods]

---

## 13. Appendix

### 13.1 [Appendix Topic]

[Additional reference material, diagrams, examples, or specifications]

### 13.2 [Appendix Topic]

[Additional reference material]

### 13.3 [Appendix Topic]

[Additional reference material]

[Common appendix sections:
- Architecture diagrams
- API specifications/contracts
- Component APIs
- Data models/schemas
- Example code
- Configuration references
- Workflow diagrams
- Playbook alignment
- Future enhancements/roadmap]

---

**End of PRD-[##].**
