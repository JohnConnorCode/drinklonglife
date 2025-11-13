#!/bin/bash

set -e

echo "🔍 Validating E2E Test Environment Setup..."
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version 18 or higher required (found: $(node -v))"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Node.js $(node -v)"
fi

# Check npm
echo ""
echo "📦 Checking npm..."
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ npm $(npm -v)"
fi

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Run: npm install"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ node_modules exists"
fi

# Check Playwright installation
echo ""
echo "🎭 Checking Playwright..."
if [ ! -d "node_modules/@playwright" ]; then
  echo "❌ Playwright not installed. Run: npm install"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Playwright installed"
fi

# Check if Playwright browsers are installed
echo ""
echo "🌐 Checking Playwright browsers..."
if npx playwright --version &> /dev/null; then
  echo "✅ Playwright CLI available"

  # Check if chromium is installed
  if npx playwright test --list 2>&1 | grep -q "Chromium"; then
    echo "✅ Chromium browser available"
  else
    echo "⚠️  Chromium browser may not be installed. Run: npx playwright install chromium"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "⚠️  Could not verify Playwright browsers. Run: npx playwright install"
  WARNINGS=$((WARNINGS + 1))
fi

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."

REQUIRED_ENV_VARS=(
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
  "NEXT_PUBLIC_SANITY_DATASET"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

OPTIONAL_ENV_VARS=(
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "SANITY_READ_TOKEN"
  "SUPABASE_SERVICE_ROLE_KEY"
)

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ .env.local exists"

  # Source .env.local for checking
  set -a
  source .env.local
  set +a

  # Check required variables
  for VAR in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo "❌ Missing required variable: $VAR"
      ERRORS=$((ERRORS + 1))
    else
      echo "✅ $VAR is set"
    fi
  done

  # Check optional variables
  for VAR in "${OPTIONAL_ENV_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo "⚠️  Optional variable not set: $VAR"
      WARNINGS=$((WARNINGS + 1))
    else
      echo "✅ $VAR is set"
    fi
  done
fi

# Check test directory structure
echo ""
echo "📁 Checking test directory structure..."
if [ ! -d "tests/e2e" ]; then
  echo "❌ tests/e2e directory not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ tests/e2e directory exists"

  TEST_COUNT=$(find tests/e2e -name "*.spec.ts" | wc -l)
  echo "✅ Found $TEST_COUNT test files"
fi

# Check playwright config
echo ""
echo "⚙️  Checking Playwright configuration..."
if [ ! -f "playwright.config.ts" ]; then
  echo "⚠️  playwright.config.ts not found"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ playwright.config.ts exists"
fi

# Summary
echo ""
echo "════════════════════════════════════════"
echo "📊 Validation Summary"
echo "════════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
  echo "❌ $ERRORS error(s) found"
fi

if [ $WARNINGS -gt 0 ]; then
  echo "⚠️  $WARNINGS warning(s) found"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed!"
  echo ""
  echo "🚀 You're ready to run E2E tests:"
  echo "   npm run test:e2e          # Run all tests"
  echo "   npm run test:e2e:headed   # Run with visible browser"
  echo "   npm run test:e2e:ui       # Run with Playwright UI"
  echo "   npm run test:e2e:debug    # Run in debug mode"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ Environment is ready with minor warnings"
  echo ""
  echo "🚀 You can run E2E tests:"
  echo "   npm run test:e2e"
  exit 0
else
  echo ""
  echo "❌ Please fix the errors above before running tests"
  exit 1
fi
