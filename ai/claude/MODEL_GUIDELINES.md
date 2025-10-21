# Claude Model Selection Guidelines

**Last Updated:** 2025-10-20
**Based on:** Official Claude Documentation (October 2025)

---

## Current Recommended Models (Claude 4.5 Family)

### Claude Sonnet 4.5

**Model Alias:** `claude-sonnet-4-5`

**When to Use:**
- Default choice for most use cases
- Best balance of intelligence, speed, and cost
- Exceptional performance in coding tasks
- Agentic workflows and tool use
- Complex reasoning and analysis
- Code generation and refactoring
- Architecture and design decisions

**Characteristics:**
- Frontier-level intelligence
- Strong coding capabilities (best in class)
- Excellent agentic performance
- Good speed for complex tasks
- Moderate cost

**Use Cases:**
- Code review and analysis
- Complex refactoring
- Architecture design
- Strategic decision-making
- Documentation generation
- Multi-step workflows
- Research and analysis

### Claude Haiku 4.5

**Model Alias:** `claude-haiku-4-5`

**When to Use:**
- Real-time applications
- High-volume processing
- Cost-sensitive deployments
- Fast, simple operations
- Near-frontier performance needed quickly

**Characteristics:**
- Fastest Haiku model
- Near-frontier performance (similar to Claude Sonnet 4)
- One-third the cost of Sonnet 4.5
- More than twice the speed of Sonnet 4.5
- Strong reasoning capabilities

**Use Cases:**
- File formatting and linting
- Running tests
- Simple git operations
- Build and deploy scripts
- Data transformations
- Frequently-run commands
- Performance-critical operations

---

## Model Selection Strategy

### For Sub-Agents

**Use Sonnet 4.5 (`claude-sonnet-4-5`) for:**
- Code analysis and review agents
- Architecture and design agents
- Refactoring agents
- Documentation generation agents
- Complex validation agents
- Research and exploration agents
- Strategic planning agents

**Use Haiku 4.5 (`claude-haiku-4-5`) for:**
- File formatting agents
- Test execution agents
- Simple validation agents
- File organization agents
- Quick search agents
- Build and deploy agents
- High-frequency agents

**Omit model field (inherit) when:**
- Agent needs vary by context
- Flexibility is more important than optimization
- Prototyping or experimentation
- General-purpose utilities

### For Slash Commands

**Use Sonnet 4.5 (`claude-sonnet-4-5`) for:**
- `/generate-*` - Code generation commands
- `/analyze-*` - Analysis and review commands
- `/refactor-*` - Refactoring commands
- `/design-*` - Architecture commands
- `/review-*` - Code review commands
- Complex workflows with decision-making

**Use Haiku 4.5 (`claude-haiku-4-5`) for:**
- `/format-*` - Formatting commands
- `/test-*` - Test execution commands
- `/lint-*` - Linting commands
- `/build-*` - Build commands
- `/deploy-*` - Deployment commands
- Simple, deterministic operations

**Omit model field (inherit) when:**
- Mixed complexity in command
- User preference matters
- General-purpose command
- Command under development

---

## Model Aliases vs Versioned Names

### Use Aliases (Recommended)

**Aliases:** `claude-sonnet-4-5`, `claude-haiku-4-5`

**Benefits:**
- Automatically point to latest model version
- No updates needed when new versions release
- Simpler to remember and type
- Better for templates and examples

**Drawbacks:**
- Behavior may change when model updates
- Less predictable in production

**Best For:**
- Templates and documentation
- Development and experimentation
- Commands that should use latest features
- General-purpose configurations

### Use Versioned Names (For Production)

**Versioned:** `claude-sonnet-4-5-20250929`, `claude-haiku-4-5-20251001`

**Benefits:**
- Consistent, predictable behavior
- No unexpected changes
- Better for production stability

**Drawbacks:**
- Need manual updates for new versions
- Longer identifiers
- May miss improvements in newer versions

**Best For:**
- Production applications
- Critical workflows
- Compliance requirements
- Reproducible results

### Recommendation

**For Templates:** Use aliases (`claude-sonnet-4-5`, `claude-haiku-4-5`)
**For Production:** Consider versioned names for stability

---

## Cost Optimization

### High-Volume Operations

For commands or agents that run frequently:
- Prefer Haiku 4.5 when possible
- Haiku 4.5 is 1/3 the cost of Sonnet 4.5
- Haiku 4.5 is 2x+ faster than Sonnet 4.5
- Near-frontier performance for many tasks

### Cost vs Quality Tradeoff

**Sonnet 4.5:**
- Higher cost, best quality
- Use for complex, high-value tasks
- Use when quality matters more than cost

**Haiku 4.5:**
- Lower cost, near-frontier quality
- Use for simple, high-frequency tasks
- Use when speed and cost matter

### Examples

**High-Cost Scenario (Use Sonnet 4.5):**
- One-time architecture review
- Complex refactoring of core module
- Critical security analysis

**Cost-Optimized Scenario (Use Haiku 4.5):**
- Format 100 files daily
- Run tests on every commit
- Lint check before each PR

---

## Migration from Claude 3.5

### Old Models → New Models

- `claude-3-5-sonnet-20241022` → `claude-sonnet-4-5`
- `claude-3-5-haiku-20241022` → `claude-haiku-4-5`

### Changes

**Performance:**
- Claude 4.5 models offer significant improvements
- Better coding capabilities
- Improved agentic performance
- Faster execution (especially Haiku 4.5)

**Compatibility:**
- Same API, same capabilities
- Drop-in replacement
- No code changes needed

### Migration Checklist

- [ ] Update model identifiers in templates
- [ ] Update model identifiers in custom agents
- [ ] Update model identifiers in slash commands
- [ ] Test commands with new models
- [ ] Update documentation references
- [ ] Communicate changes to team

---

## Quick Reference

### Model Aliases

| Model | Alias | Use For |
|-------|-------|---------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | Complex coding, analysis, design |
| Claude Haiku 4.5 | `claude-haiku-4-5` | Fast operations, high-volume, cost-sensitive |

### Decision Tree

```
Need complex reasoning or code generation?
├─ Yes → claude-sonnet-4-5
└─ No
   └─ Need speed or running frequently?
      ├─ Yes → claude-haiku-4-5
      └─ No → Either (or omit for default)
```

### Template Examples

**Sub-Agent with Sonnet:**
```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
model: claude-sonnet-4-5
---
```

**Sub-Agent with Haiku:**
```yaml
---
name: file-formatter
description: Formats files according to project standards
model: claude-haiku-4-5
---
```

**Slash Command with Sonnet:**
```yaml
---
description: Generate React component with tests
model: claude-sonnet-4-5
---
```

**Slash Command with Haiku:**
```yaml
---
description: Run all tests with coverage
model: claude-haiku-4-5
---
```

---

## Additional Resources

- [Official Claude Models Overview](https://docs.claude.com/en/docs/about-claude/models/overview)
- [Choosing the Right Model](https://docs.claude.com/en/docs/about-claude/models/choosing-a-model)
- [What's New in Claude 4.5](https://docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-5)
- [Migrating to Claude 4.5](https://docs.claude.com/en/docs/about-claude/models/migrating-to-claude-4)

---

**Version:** 1.0
**Maintainer:** Platform Engineering
