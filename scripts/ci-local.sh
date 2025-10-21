#!/bin/bash
set -e

# Local CI Simulation Script
# Runs the same checks as GitHub Actions CI pipeline

echo "🚀 Starting Local CI Simulation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FAILED_JOBS=()
PASSED_JOBS=()

run_job() {
  local job_name="$1"
  local command="$2"

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🔨 Running: $job_name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  if eval "$command"; then
    echo ""
    echo -e "${GREEN}✅ $job_name - PASSED${NC}"
    PASSED_JOBS+=("$job_name")
  else
    echo ""
    echo -e "${RED}❌ $job_name - FAILED${NC}"
    FAILED_JOBS+=("$job_name")

    if [ "$CI_FAIL_FAST" = "true" ]; then
      echo -e "${RED}Stopping on first failure (CI_FAIL_FAST=true)${NC}"
      exit 1
    fi
  fi

  echo ""
}

# Check if pnpm-lock.yaml exists
if [ ! -f "pnpm-lock.yaml" ]; then
  echo -e "${RED}❌ Error: pnpm-lock.yaml not found!${NC}"
  echo "Run 'pnpm install' to generate it."
  exit 1
fi

# Simulate GitHub Actions environment
export CI=true
export GITHUB_ACTIONS=true

echo -e "${YELLOW}📦 Installing dependencies with frozen lockfile...${NC}"
pnpm install --frozen-lockfile
echo ""

# Run CI jobs in order (matching GitHub Actions workflow)
run_job "Setup / Bootstrap Check" "pnpm ci:bootstrap"
run_job "Lint" "pnpm turbo run lint --filter='./packages/*' --filter='./apps/*'"
run_job "Type Check" "pnpm turbo run typecheck --filter='./packages/*' --filter='./apps/*'"
run_job "Test" "pnpm turbo run test --filter='./packages/*' --filter='./apps/*'"
run_job "Build" "pnpm turbo run build"

# Optional: Security checks (may require additional setup)
if command -v gitleaks &> /dev/null; then
  run_job "Security / Gitleaks" "gitleaks detect --no-git"
else
  echo -e "${YELLOW}⚠️  Skipping Gitleaks (not installed)${NC}"
  echo "   Install: brew install gitleaks (macOS) or see https://github.com/gitleaks/gitleaks"
  echo ""
fi

if command -v cyclonedx-node-pnpm &> /dev/null; then
  run_job "Security / SBOM" "pnpm sbom"
else
  echo -e "${YELLOW}⚠️  Skipping SBOM generation (cyclonedx-node-pnpm not installed)${NC}"
  echo "   Install: npm install -g @cyclonedx/cyclonedx-npm"
  echo ""
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 CI SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ${#PASSED_JOBS[@]} -gt 0 ]; then
  echo -e "${GREEN}✅ Passed (${#PASSED_JOBS[@]}):${NC}"
  for job in "${PASSED_JOBS[@]}"; do
    echo -e "   ${GREEN}✓${NC} $job"
  done
  echo ""
fi

if [ ${#FAILED_JOBS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Failed (${#FAILED_JOBS[@]}):${NC}"
  for job in "${FAILED_JOBS[@]}"; do
    echo -e "   ${RED}✗${NC} $job"
  done
  echo ""
  echo -e "${RED}CI would fail in GitHub Actions!${NC}"
  exit 1
else
  echo -e "${GREEN}🎉 All checks passed! CI would succeed in GitHub Actions.${NC}"
  exit 0
fi
