#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const logsDir = join(rootDir, '.logs');

// Parse CLI flags
const args = process.argv.slice(2);
const flags = {
  check: args.includes('--check'),
  verbose: args.includes('--verbose'),
  json: args.includes('--json'),
  migrateEnv: args.includes('--migrate-env'),
};

// Logging setup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = join(logsDir, `setup-${timestamp}.log`);
const jsonFile = join(logsDir, `setup-${timestamp}.json`);

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const steps = [];
let currentStep = null;

function log(message, level = 'info') {
  const entry = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;

  if (!flags.json) {
    console.log(entry);
  }

  try {
    const logContent = existsSync(logFile) ? readFileSync(logFile, 'utf-8') : '';
    writeFileSync(logFile, logContent + entry + '\\n');
  } catch (err) {
    // Ignore log file errors
  }
}

function startStep(name) {
  currentStep = {
    name,
    startTime: Date.now(),
    status: 'running',
  };
  log(`Starting: ${name}`, 'info');
}

function endStep(status = 'success', error = null) {
  if (currentStep) {
    currentStep.endTime = Date.now();
    currentStep.duration = currentStep.endTime - currentStep.startTime;
    currentStep.status = status;
    if (error) {
      currentStep.error = error.message || String(error);
    }
    steps.push(currentStep);
    log(`${status === 'success' ? '✓' : '✗'} ${currentStep.name} (${currentStep.duration}ms)`, status === 'success' ? 'info' : 'error');
    currentStep = null;
  }
}

function exec(command, options = {}) {
  try {
    const output = execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: flags.verbose ? 'inherit' : 'pipe',
      ...options,
    });
    return output?.trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\\n${error.message}`);
  }
}

// Check prerequisites
function checkPrerequisites() {
  startStep('Check prerequisites');

  try {
    // Check Node version
    const nodeVersion = process.version.slice(1);
    const [major, minor] = nodeVersion.split('.').map(Number);
    const requiredMajor = 20;
    const requiredMinor = 18;

    if (major < requiredMajor || (major === requiredMajor && minor < requiredMinor)) {
      throw new Error(
        `Node.js ${requiredMajor}.${requiredMinor}.0 or higher is required. Current: ${nodeVersion}\\n` +
        `Please update Node.js or use the Dev Container.`
      );
    }
    log(`✓ Node.js version: ${nodeVersion}`);

    // Check pnpm
    try {
      const pnpmVersion = exec('pnpm --version');
      log(`✓ pnpm version: ${pnpmVersion}`);
    } catch {
      throw new Error(
        'pnpm is not available. Please enable Corepack with: corepack enable'
      );
    }

    // Check git
    try {
      exec('git --version');
      log('✓ git is available');
    } catch {
      throw new Error('git is required but not found in PATH');
    }

    // Check Docker (optional)
    try {
      exec('docker --version');
      log('✓ Docker is available');
    } catch {
      log('⚠ Docker not found (optional for local development)', 'warn');
    }

    endStep('success');
  } catch (error) {
    endStep('failed', error);
    throw error;
  }
}

// Install dependencies
function installDependencies() {
  startStep('Install dependencies');

  try {
    if (flags.check) {
      log('Skipping dependency installation (--check mode)');
      endStep('skipped');
      return;
    }

    log('Running: pnpm install --frozen-lockfile');
    exec('pnpm install --frozen-lockfile');

    endStep('success');
  } catch (error) {
    endStep('failed', error);
    throw error;
  }
}

// Generate environment files
function generateEnvFiles() {
  startStep('Generate environment files');

  try {
    const workspaces = ['apps/web', 'apps/api'];
    let generated = 0;

    for (const workspace of workspaces) {
      const exampleFile = join(rootDir, workspace, '.env.example');
      const localFile = join(rootDir, workspace, '.env.local');

      if (existsSync(exampleFile)) {
        if (!existsSync(localFile)) {
          const content = readFileSync(exampleFile, 'utf-8');
          writeFileSync(localFile, content);
          log(`Created ${workspace}/.env.local from template`);
          generated++;
        } else {
          log(`${workspace}/.env.local already exists (skipped)`);
        }
      }
    }

    if (generated === 0 && !flags.check) {
      log('No environment files generated (templates not found or files exist)');
    }

    endStep('success');
  } catch (error) {
    endStep('failed', error);
    throw error;
  }
}

// Setup Husky hooks
function setupHusky() {
  startStep('Setup Git hooks');

  try {
    if (flags.check) {
      log('Skipping Git hooks installation (--check mode)');
      endStep('skipped');
      return;
    }

    // Initialize Husky
    exec('pnpm exec husky init');

    // Create pre-commit hook
    const preCommitPath = join(rootDir, '.husky', 'pre-commit');
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
pnpm exec lint-staged

# Run gitleaks (if available)
if command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --verbose
fi
`;
    writeFileSync(preCommitPath, preCommitContent);
    exec(`chmod +x ${preCommitPath}`);
    log('✓ Created pre-commit hook');

    // Create commit-msg hook
    const commitMsgPath = join(rootDir, '.husky', 'commit-msg');
    const commitMsgContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate conventional commit format
commit_msg=$(cat $1)
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\(.+\\))?: .{1,100}"

if ! echo "$commit_msg" | grep -Eq "$pattern"; then
  echo "Error: Commit message does not follow conventional commits format"
  echo "Format: <type>(<scope>): <subject>"
  echo "Example: feat(api): add user authentication"
  exit 1
fi
`;
    writeFileSync(commitMsgPath, commitMsgContent);
    exec(`chmod +x ${commitMsgPath}`);
    log('✓ Created commit-msg hook');

    // Create pre-push hook
    const prePushPath = join(rootDir, '.husky', 'pre-push');
    const prePushContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run typecheck on changed packages
pnpm turbo run typecheck --filter=...[HEAD^]
`;
    writeFileSync(prePushPath, prePushContent);
    exec(`chmod +x ${prePushPath}`);
    log('✓ Created pre-push hook');

    endStep('success');
  } catch (error) {
    endStep('failed', error);
    throw error;
  }
}

// Write summary
function writeSummary() {
  const summary = {
    timestamp: new Date().toISOString(),
    mode: flags.check ? 'check' : 'setup',
    steps,
    totalDuration: steps.reduce((sum, step) => sum + (step.duration || 0), 0),
    success: steps.every(step => step.status === 'success' || step.status === 'skipped'),
  };

  try {
    writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
    log(`Summary written to: ${jsonFile}`);
  } catch (err) {
    log(`Failed to write summary: ${err.message}`, 'error');
  }

  if (flags.json) {
    console.log(JSON.stringify(summary, null, 2));
  }

  return summary;
}

// Main execution
async function main() {
  log('=== Fullstack Starter Setup ===');
  log(`Mode: ${flags.check ? 'Check' : 'Setup'}`);
  log(`Working directory: ${rootDir}`);

  try {
    checkPrerequisites();
    installDependencies();
    generateEnvFiles();
    setupHusky();

    const summary = writeSummary();

    if (!flags.json) {
      console.log('\\n✨ Setup completed successfully!');
      console.log('\\nNext steps:');
      console.log('  1. Review and update .env.local files in apps/');
      console.log('  2. Run: pnpm dev');
      console.log('\\nFor more information, see: /docs/getting-started.md');
    }

    process.exit(0);
  } catch (error) {
    writeSummary();

    if (!flags.json) {
      console.error('\\n❌ Setup failed:', error.message);
      console.error('\\nFor troubleshooting, check:');
      console.error(`  - Log file: ${logFile}`);
      console.error(`  - JSON summary: ${jsonFile}`);
      console.error('  - Documentation: /docs/getting-started.md');
    }

    process.exit(1);
  }
}

main();
