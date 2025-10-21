# Local CI/CD Testing

Test your changes locally before pushing to ensure CI/CD will pass in GitHub Actions.

## Quick Start

### Option 1: Quick Check (Recommended) ⚡
Fast check of essential CI steps (~30 seconds):

```bash
pnpm ci:quick
```

This runs:
- Lockfile validation
- TypeScript checks (packages + apps)
- Linting
- Tests

### Option 2: Full CI Simulation 🔍
Complete simulation matching GitHub Actions (~2-5 minutes):

```bash
pnpm ci:local
```

This runs all CI jobs:
1. **Setup** - Bootstrap validation
2. **Lint** - Code style and quality
3. **TypeScript** - Type checking
4. **Test** - Unit and integration tests
5. **Build** - Production builds
6. **Security** - Secret scanning and dependency audit (optional)

## Usage Examples

### Before Committing
```bash
# Quick check before commit
pnpm ci:quick

# If it passes, commit
git add .
git commit -m "feat: add feature"
```

### Before Creating PR
```bash
# Full CI simulation
pnpm ci:local

# If it passes, push
git push
```

### Stop on First Failure
```bash
# Exit immediately on first failing job
CI_FAIL_FAST=true pnpm ci:local
```

### Run Individual Checks
```bash
# Just typecheck
pnpm typecheck

# Just lint
pnpm lint

# Just test
pnpm test

# Just build
pnpm build
```

## Advanced: Using `act` (GitHub Actions Locally)

For exact GitHub Actions simulation with Docker:

### Installation

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows:**
```bash
choco install act-cli
```

### Usage

**Run full CI workflow:**
```bash
act push
```

**Run specific job:**
```bash
act -j lint        # Run lint job only
act -j typecheck   # Run typecheck job only
act -j build       # Run build job only
```

**List available workflows:**
```bash
act -l
```

**Dry run (see what would run):**
```bash
act -n
```

**Run with specific GitHub event:**
```bash
act pull_request
```

### Configuration

Create `.actrc` file in project root:
```bash
# Use medium-sized runner
-P ubuntu-latest=catthehacker/ubuntu:act-latest

# Set platform
--platform ubuntu-latest=catthehacker/ubuntu:act-latest

# Reuse containers for speed
--reuse
```

### Troubleshooting `act`

**Missing secrets:**
```bash
# Pass secrets manually
act -s GITHUB_TOKEN=xxx

# Or create .secrets file
echo "GITHUB_TOKEN=xxx" > .secrets
act --secret-file .secrets
```

**Docker issues:**
```bash
# Ensure Docker is running
docker ps

# Clear act cache
act --rm
```

**Platform-specific issues:**
```bash
# Use specific platform
act --platform ubuntu-latest=ubuntu:22.04
```

## CI/CD Optimization Tips

### 1. Use Turbo Cache
Turbo automatically caches task outputs:
```bash
# First run: slow
pnpm build

# Second run: instant (cached)
pnpm build
```

### 2. Filter Packages
Only run checks on changed packages:
```bash
# Only check apps
pnpm typecheck --filter "./apps/*"

# Only check packages
pnpm typecheck --filter "./packages/*"

# Specific package
pnpm test --filter @starter/utils
```

### 3. Parallel Execution
Turbo runs tasks in parallel automatically:
```bash
# Runs typecheck on all packages in parallel
pnpm typecheck
```

### 4. Skip Cache
Force fresh execution:
```bash
pnpm build --force
```

## Common Issues

### Issue: Lockfile Mismatch
```
Error: pnpm-lock.yaml is out of date
```

**Solution:**
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
```

### Issue: Tests Fail Locally but Pass in CI
```
Different Node.js or pnpm version
```

**Solution:**
```bash
# Use exact versions from .nvmrc and package.json
nvm use
corepack enable
pnpm install
```

### Issue: Build Fails in CI but Works Locally
```
Missing environment variables or different config
```

**Solution:**
```bash
# Simulate CI environment
CI=true pnpm build

# Check .env files are in .gitignore
git check-ignore .env
```

### Issue: Slow CI Times
```
No caching or too many packages rebuilt
```

**Solutions:**
- Check Turbo is caching properly: `pnpm build --summarize`
- Use `--filter` to only build changed packages
- Enable GitHub Actions caching (already configured)

## Comparison Matrix

| Method | Speed | Accuracy | Docker Required | Internet Required |
|--------|-------|----------|-----------------|-------------------|
| `ci:quick` | ⚡⚡⚡ Fast | Good | ❌ No | ❌ No |
| `ci:local` | ⚡⚡ Medium | Great | ❌ No | ❌ No |
| `act` | ⚡ Slow | Perfect | ✅ Yes | ✅ Yes |
| GitHub Actions | N/A | Perfect | N/A | ✅ Yes |

## Recommended Workflow

```bash
# 1. During development - quick check
pnpm ci:quick

# 2. Before commit - full local CI
pnpm ci:local

# 3. Before PR (optional) - exact CI with act
act push

# 4. Push and let GitHub Actions run
git push
```

## Scripts Reference

| Script | Description | Time | Use When |
|--------|-------------|------|----------|
| `pnpm ci:quick` | Essential checks only | ~30s | During development |
| `pnpm ci:local` | Full CI simulation | ~2-5min | Before commit/push |
| `pnpm typecheck` | Type checking only | ~10s | Quick type validation |
| `pnpm lint` | Linting only | ~5s | Code style check |
| `pnpm test` | Tests only | ~1min | After changes |
| `pnpm build` | Build only | ~1-2min | Verify build works |
| `act` | GitHub Actions locally | ~5-10min | Before important PRs |

## Integration with Git Hooks

The project uses Husky for Git hooks:

**Pre-commit:** Runs lint-staged (linting + formatting on staged files)
**Pre-push:** Could add `pnpm ci:quick` to prevent broken pushes

### Enable pre-push check:
```bash
# Add to .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm ci:quick
```

## Resources

- [Turbo Documentation](https://turbo.build/repo/docs)
- [act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm CI Documentation](https://pnpm.io/continuous-integration)
