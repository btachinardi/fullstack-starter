#!/bin/bash
set -e

# Quick CI Check Script
# Runs essential checks only (faster than full CI simulation)

echo "⚡ Running quick CI checks..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

FAILED=0

run_check() {
  local name="$1"
  local command="$2"

  echo -e "${BLUE}→ $name...${NC}"

  if eval "$command" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC}"
  else
    echo -e "  ${RED}✗ FAILED${NC}"
    echo ""
    echo "Run this to see details:"
    echo "  $command"
    echo ""
    FAILED=1
  fi
}

# Essential checks only
run_check "Lockfile exists" "test -f pnpm-lock.yaml"
run_check "TypeScript (packages)" "pnpm turbo run typecheck --filter='./packages/*' --summarize"
run_check "TypeScript (apps)" "pnpm turbo run typecheck --filter='./apps/*' --summarize"
run_check "Linting" "pnpm turbo run lint --filter='./packages/*' --filter='./apps/*' --summarize"
run_check "Tests" "pnpm turbo run test --filter='./packages/*' --summarize"

echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All quick checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Run 'pnpm ci:local' for detailed output.${NC}"
  exit 1
fi
