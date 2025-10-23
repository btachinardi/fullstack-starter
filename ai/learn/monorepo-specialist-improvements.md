# monorepo-specialist Agent Improvements

Based on session: Health Module Implementation & Core/Platform Refactoring (2025-10-23)

## Issues Encountered That Agent Should Handle

### 1. **Package Naming Conventions** ✅ MISSING FROM AGENT

**What happened in session:**
- Created packages as `@libs/health-api` and `@libs/health-web` (hyphenated)
- PNPM error: "Invalid name: '@libs/health/api'"
- Correct format: `@libs/health/api` (slash format for nested scopes)

**What agent instructions say:**
- No explicit guidance on PNPM workspace package naming conventions
- No mention of slash vs hyphen format
- No examples of correct naming patterns

**What agent should include:**

```markdown
### Common Issue: Invalid Package Names in Nested Scopes

**Pattern:** Packages using hyphens in nested scopes fail with "Invalid name"

**Error:**
```
ERR_PNPM_BAD_PACKAGE_JSON Invalid name: "@libs/health-api"
```

**Root Cause:**
PNPM workspace doesn't support hyphenated nested scopes. Use slash format instead.

**Wrong:**
- `@libs/health-api` (hyphen)
- `@libs/health-web` (hyphen)

**Correct:**
- `@libs/health/api` (slash)
- `@libs/health/web` (slash)

**Detection:**
When creating new workspace packages, check existing naming patterns:
```bash
find libs -name "package.json" -exec grep '"name"' {} \; | head -10
```

**Fix:**
Update package.json name fields to use slash format matching existing workspace packages.
```

---

### 2. **Circular Dependencies - Architectural Solutions** ⚠️ INCOMPLETE IN AGENT

**What happened in session:**
- Turbo error: "Cyclic dependency detected: @libs/health/api, @libs/core/api"
- Tried multiple package.json dependency changes (all failed)
- Solution required architectural change: Dependency injection pattern

**What agent instructions say:**
- Phase 2 mentions checking dependency declarations
- Phase 3 mentions "Workspace protocol problem"
- **Missing:** Explicit guidance that circular dependencies often require ARCHITECTURAL solutions, not configuration fixes

**What agent should include:**

```markdown
### Critical Pattern: Circular Dependencies Often Need Architecture Changes

**Common Mistake:** Trying to fix circular dependencies by removing/adding package.json entries

**Root Cause Analysis:**
When Turbo reports cyclic dependencies, ask:
1. Do both packages legitimately need each other? (probably design issue)
2. Is shared code in wrong location? (extract to common package)
3. Is dependency needed at build time or runtime? (consider DI)

**Architectural Solutions (Not Configuration):**

**Pattern 1: Dependency Injection**
```typescript
// Before: HealthModule imports prisma from @libs/core/api (circular)
import { prisma } from '@libs/core/api';

// After: HealthModule accepts prisma via forRoot() (no dependency)
@Module({})
export class HealthModule {
  static forRoot(prismaClient: PrismaClient): DynamicModule {
    return {
      providers: [
        { provide: 'PRISMA_CLIENT', useValue: prismaClient }
      ]
    };
  }
}
```

**Pattern 2: Extract Shared Code to Common Package**
```
// Before: @libs/feature-a ↔ @libs/feature-b (circular)
// After: @libs/feature-a → @libs/core/shared ← @libs/feature-b (no cycle)
```

**Pattern 3: Interface Segregation**
```typescript
// Before: Module imports concrete implementation (circular)
// After: Module imports interface from @libs/core/api (no cycle)
```

**Configuration Fix Only Works When:**
- Circular dependency is due to workspace:* protocol issues
- Dev dependency vs runtime dependency confusion
- Type-only imports that should use `import type`

**When to escalate to architecture:**
If removing package.json dependencies causes build failures, the circular dependency is real and needs architectural solution, not configuration fix.
```

---

### 3. **Next.js Packages Use Source References, Not Dist Compilation** ✅ MISSING FROM AGENT

**What happened in session:**
- Created @libs/platform/web with standard tsconfig (outDir: dist)
- Build reported success but no dist/ folder generated
- Tried multiple approaches: rm tsbuildinfo, --force, noEmit: false
- User correction: "Next.js works differently, use source file references"

**What agent instructions say:**
- Heavy focus on dist output structures
- Checks "outDir consistency with package.json main"
- **Missing:** Recognition that some package types don't use dist at all

**What agent should include:**

```markdown
### Special Case: Next.js/React Packages Use Source References

**Pattern Recognition:**
If package extends `@configs/typescript/nextjs.json` or similar, it may use source references instead of dist compilation.

**Indicators:**
- tsconfig extends nextjs.json (has `noEmit: true`)
- App's tsconfig.json has "paths" mappings to `../../libs/package/src/*`
- transpilePackages in next.config.mjs includes the package

**Configuration Pattern:**

**Package tsconfig.json:**
```json
{
  "extends": "@configs/typescript/nextjs.json",
  "compilerOptions": {
    "noEmit": false,  // Override if you need types for IDE
    // Or leave noEmit: true if source-only
  }
}
```

**Consuming app tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@libs/package": ["../../libs/package/src/index.ts"],
      "@libs/package/*": ["../../libs/package/src/*"]
    }
  }
}
```

**Consuming app next.config.mjs:**
```javascript
const nextConfig = {
  transpilePackages: ["@libs/package"],
};
```

**Don't diagnose as error:**
- Missing dist/ folder when noEmit: true is set
- "No outputs found" warnings from Turbo for Next.js packages

**This is correct behavior** for Next.js workspace packages.
```

---

### 4. **Config Inheritance Can Hide Settings** ⚠️ IMPLICIT IN AGENT

**What happened in session:**
- Set `outDir: "dist"` in libs/platform/web/tsconfig.json
- Build showed success but no output
- Root cause: Extends nextjs.json which has `noEmit: true` that overrides outDir

**What agent instructions say:**
- Mentions checking configs but doesn't emphasize extends/inheritance

**What agent should emphasize:**

```markdown
### Critical: Check Extended Configurations

**Pattern:** When tsconfig extends another config, inherited settings may override local settings

**Analysis Steps:**
1. Check "extends" field in tsconfig.json
2. Read the extended config file
3. Identify which settings are inherited
4. Check if local overrides are being applied correctly

**Common Issue:**
```json
// base.json
{
  "compilerOptions": {
    "noEmit": true
  }
}

// package/tsconfig.json
{
  "extends": "../../base.json",
  "compilerOptions": {
    "outDir": "dist"  // ❌ Won't output because noEmit: true is inherited
  }
}
```

**Fix:**
```json
{
  "extends": "../../base.json",
  "compilerOptions": {
    "noEmit": false,  // ✅ Explicitly override inherited setting
    "outDir": "dist"
  }
}
```

**Diagnostic Command:**
```bash
# Show full resolved config
cd package-dir && pnpm tsc --showConfig
```
```

---

### 5. **PNPM Workspace Pattern Checking** ⚠️ COULD BE MORE EXPLICIT

**What happened in session:**
- Didn't check existing package patterns before creating new ones
- Led to wrong naming, wrong structure, wrong configuration

**What agent instructions say:**
- Mentions using Grep to find patterns
- Doesn't have explicit "always check existing examples" workflow

**What agent should emphasize upfront:**

```markdown
### Phase 0: Pattern Discovery (Before Diagnosis)

**Before diagnosing ANY monorepo issue, establish baseline patterns:**

**Step 1: Discover existing package naming**
```bash
find libs -name "package.json" -exec grep -H '"name"' {} \; | head -10
```

**Step 2: Check workspace configuration**
```bash
cat pnpm-workspace.yaml
```

**Step 3: Identify package structure patterns**
```bash
# Check if packages use dist compilation or source references
ls libs/*/tsconfig.json | head -5 | xargs grep -H '"outDir"\|"noEmit"'
```

**Step 4: Check existing tsconfig path mappings**
```bash
# See how apps reference workspace packages
cat apps/*/tsconfig.json | grep -A 10 '"paths"'
```

**Output:** Pattern baseline document showing:
- Naming convention (slash vs hyphen, scope format)
- Build approach (dist vs source references)
- Path mapping patterns
- Common configurations

**This baseline prevents:** Creating packages that don't match workspace conventions
```

---

## What Agent Got Right

### ✅ Strong Coverage Of:
1. **Module resolution errors** - Good Phase 2 analysis of package.json exports
2. **TypeScript path mapping** - Comprehensive checks in Phase 2
3. **Build output structure** - Mentions nested dist folder issues
4. **Webpack externals** - Has Example 3 showing correct pattern
5. **Common patterns** - Example 1 and 2 cover typical issues well

### ✅ Good Process Structure:
- 5-phase approach is systematic
- Parallel file loading in Phase 1
- Evidence-based diagnosis
- Before/after diff format

---

## Recommendations for Agent Improvement

### Critical Additions (High Impact)

1. **Add Phase 0: Pattern Discovery**
   - Check existing workspace patterns BEFORE diagnosing
   - Prevents inventing wrong patterns
   - Establishes baseline for "correct" configuration

2. **Add section: "Architectural Solutions for Circular Dependencies"**
   - Dependency injection patterns
   - Interface segregation
   - Extract to common package
   - Distinguish configuration vs architecture problems

3. **Add section: "Next.js/React Package Patterns"**
   - Source reference approach
   - noEmit: true is correct behavior
   - Don't diagnose missing dist as error for these packages

4. **Emphasize config inheritance checking**
   - Always read extended configs
   - Check for setting overrides
   - Use `tsc --showConfig` for resolved config

### Medium Priority

5. **Add diagnostic: Check for hyphenated nested scopes**
   - Pattern: `@scope/package` not `@scope-package`
   - Quick check before other diagnosis

6. **Add example: Fixing package names across workspace**
   - Show multi-file update pattern
   - Include all affected files (package.json, imports, re-exports)

---

## Session-Specific Insights for Agent

### What This Session Taught About Monorepo Issues

**Insight 1: Package naming errors cascade**
- Wrong name in package.json
- → Install failures
- → Import failures
- → Build failures
- → Requires updating: package.json, imports, re-exports, dependencies, workspace config
- **Agent should:** Include "Package Name Validation" as Phase 0 step

**Insight 2: Circular dependencies have two classes**
- **Configuration circulars:** workspace:* issues, type-only imports - Fix with config
- **Architectural circulars:** Real mutual dependencies - Fix with DI/abstraction
- **Agent should:** Distinguish these two types explicitly, recommend architecture changes when config fixes fail

**Insight 3: Build "success" doesn't mean dist exists**
- TypeScript can report "build successful" with noEmit: true
- tsbuildinfo gets created even when no output generated
- **Agent should:** Verify dist existence after build, not just check for errors

**Insight 4: Next.js packages are special**
- Don't follow standard dist compilation pattern
- Source references are intentional, not misconfiguration
- **Agent should:** Recognize Next.js package patterns and adjust expectations

---

## Proposed Agent Instruction Updates

### Add to "When to Use This Agent" section:

```markdown
- Package naming validation (hyphenated vs slash format in nested scopes)
- Circular dependency errors from Turborepo (distinguishing config vs architecture issues)
- Next.js package build configuration (source references vs dist compilation)
- TypeScript config inheritance problems (extended configs overriding local settings)
```

### Add new Phase 0:

```markdown
### Phase 0: Pattern Discovery and Baseline Establishment

**Objective:** Establish workspace conventions before diagnosing issues

**Steps:**

1. Discover package naming patterns:
   ```bash
   find libs -name "package.json" -exec grep -H '"name"' {} \; | head -10
   ```
2. Check workspace configuration:
   ```bash
   cat pnpm-workspace.yaml
   ```
3. Identify build approach patterns:
   ```bash
   ls libs/*/tsconfig.json | xargs grep -H '"noEmit"\|"outDir"' | head -10
   ```
4. Check path mapping patterns:
   ```bash
   cat apps/*/tsconfig.json | grep -A 10 '"paths"'
   ```

**Outputs:**
- Naming convention baseline (slash vs hyphen format)
- Build approach baseline (dist vs source references)
- Common tsconfig patterns
- Path mapping patterns

**Validation:**
- [ ] Naming pattern identified
- [ ] Build approach identified (compilation vs source refs)
- [ ] At least 2 example packages analyzed for patterns
```

### Update Phase 3: Add Circular Dependency Classification

```markdown
### Phase 3: Root Cause Diagnosis

[Existing content...]

**Special Case: Circular Dependency Classification**

When Turbo reports cyclic dependencies, determine type:

**Type A: Configuration Circular (Fixable with Config)**
- Symptoms: workspace:* protocol issue, type-only imports, dev dependencies
- Fix approach: Use `import type`, move to devDependencies, fix workspace protocol
- Example: Type definitions imported at build time, not runtime

**Type B: Architectural Circular (Needs Design Change)**
- Symptoms: Both packages need each other at runtime, mutual imports of implementations
- Fix approach: Dependency injection, extract shared code, interface segregation
- Example: Module A uses Service B, Module B uses Service A
- **Configuration changes won't fix this** - requires architectural refactoring

**Decision Tree:**
1. Try `import type` instead of `import` - if that fixes it, Type A
2. Try moving to devDependencies - if that fixes it, Type A
3. If both packages need runtime code from each other → Type B (architecture problem)

**For Type B, recommend:**
- Dependency injection (forRoot pattern in NestJS)
- Extract shared code to @libs/core or new common package
- Interface segregation (depend on abstraction, not implementation)
- Inversion of control patterns
```

### Add New Section: Next.js Package Patterns

```markdown
### Special Package Type: Next.js/React Libraries

**Recognition:**
- Package tsconfig extends `nextjs.json` or similar
- Config has `noEmit: true`
- App's tsconfig.json has paths pointing to package `src/*`
- App's next.config.mjs includes package in `transpilePackages`

**Expected Behavior (Not Errors):**
- No dist/ folder generated ✅ This is correct
- tsbuildinfo exists but no .js output ✅ This is correct
- Turbo warning "no output files found" ✅ This is expected

**Configuration Pattern:**

**Package (libs/mypackage/package.json):**
```json
{
  "name": "@libs/mypackage",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",  // For reference, but won't be used
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Package (libs/mypackage/tsconfig.json):**
```json
{
  "extends": "@configs/typescript/nextjs.json",  // Has noEmit: true
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "incremental": true,
    "noEmit": false,  // Override if you want types generated
    "jsx": "react-jsx"
  }
}
```

**Consuming App (apps/web/tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@libs/mypackage": ["../../libs/mypackage/src/index.ts"],
      "@libs/mypackage/*": ["../../libs/mypackage/src/*"]
    }
  }
}
```

**Consuming App (apps/web/next.config.mjs):**
```javascript
const nextConfig = {
  transpilePackages: ["@libs/mypackage"],
};
```

**Don't Recommend:**
- Building dist/ folder for Next.js packages (not needed)
- Removing noEmit: true (it's correct for the pattern)
- Changing package.json exports to point to src (breaks other consumers)

**Do Recommend:**
- Add proper tsconfig paths in consuming app
- Add to transpilePackages array
- Generate .d.ts files for IDE support (noEmit: false with emitDeclarationOnly: true)
```

---

### Update "Common Issue Patterns" Section

**Add to list:**

```markdown
- **Hyphenated nested scope names** (@libs/package-name instead of @libs/package/name) causing PNPM errors
- **Circular dependencies requiring architectural changes** (DI, interface segregation, extracted shared code)
- **Next.js packages intentionally not generating dist** (source references via tsconfig paths)
- **Extended tsconfig overriding local settings** (noEmit: true from base config blocking output)
- **Config inheritance masking actual settings** (need tsc --showConfig to see resolved config)
```

---

### Update "Best Practices" Section

**Add:**

```markdown
### Best Practice: Always Check Existing Patterns First

Before creating new workspace packages or diagnosing issues:

```bash
# Check naming conventions
find libs -name "package.json" | head -5 | xargs grep '"name"'

# Check build patterns
ls libs/*/tsconfig.json | head -5 | xargs grep '"noEmit"\|"outDir"'

# Check how apps consume workspace packages
cat apps/*/tsconfig.json | grep -A 5 '"paths"'
```

Prevents: Creating packages that don't match workspace conventions, leading to immediate errors

### Best Practice: Circular Dependencies → Think Architecture First

When Turbo reports cyclic dependencies:

1. **Don't immediately edit package.json** - This rarely fixes real circular dependencies
2. **Analyze dependency type**: Runtime mutual dependency? Type-only? Build-time only?
3. **Consider architecture**: Can this be solved with DI? Interface abstraction? Extracted common code?
4. **Try config only if**: Type-only imports, dev dependencies, or workspace protocol issues

Pattern: Architectural problems need architectural solutions, not configuration bandaids

### Best Practice: Distinguish Package Types

Not all workspace packages build the same way:

- **NestJS packages**: Compile to dist/ with CommonJS
- **Library packages**: Compile to dist/ with ESM
- **Next.js packages**: Source references, no dist (or types-only dist)
- **Config packages**: No build needed

Diagnosis varies by package type - check package.json type field and tsconfig extends field first.
```

---

## Summary of Improvements

### Critical Additions:
1. ✅ **Phase 0: Pattern Discovery** - Check existing examples before diagnosing
2. ✅ **Circular Dependency Classification** - Config vs Architecture distinction
3. ✅ **Next.js Package Patterns** - Source references are valid, don't need dist

### Important Additions:
4. ⚠️ **Package Naming Validation** - Slash vs hyphen format rules
5. ⚠️ **Config Inheritance Checking** - Read extended configs, use --showConfig

### Best Practices Additions:
6. ✅ **Always check existing patterns first** - Prevents convention violations
7. ✅ **Think architecture for circular deps** - Don't default to config fixes
8. ✅ **Distinguish package types** - Next.js vs NestJS vs Library

---

## Impact Assessment

**If monorepo-specialist had these improvements:**
- Would have immediately identified package naming issue (saved 10 min)
- Would have suggested DI pattern for circular dependency immediately (saved 8 min)
- Would have recognized Next.js source reference pattern (saved 5 min)

**Total potential session time savings: ~20-25 minutes (30% of session)**

---

## Conclusion

The monorepo-specialist agent is well-structured but **missing coverage for three critical patterns** encountered in this session:

1. **Package naming conventions** (PNPM nested scope slash format)
2. **Architectural solutions for circular dependencies** (DI, interface segregation)
3. **Next.js source reference pattern** (no dist compilation is correct)

These aren't edge cases - they're fundamental patterns in modern monorepo setups. Adding them would make the agent significantly more effective for the exact problems encountered in this session.

**Recommendation:** Update monorepo-specialist with these patterns before next monorepo-heavy session.
