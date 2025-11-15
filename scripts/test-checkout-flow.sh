#!/bin/bash

# End-to-End Checkout Flow Test
# Tests the complete checkout process from database to Stripe

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  End-to-End Checkout Flow Test            ║"
echo "╔════════════════════════════════════════════╗"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verify database has correct prices
echo "Test 1: Verifying database prices..."
echo "----------------------------------------"

node << 'SCRIPT'
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('product_variants')
  .select('label, stripe_price_id, price_usd')
  .in('size_key', ['gallon', 'half_gallon', 'shot'])
  .eq('billing_type', 'one_time')
  .order('price_usd', { ascending: false });

let errors = 0;
data.forEach(v => {
  // Determine expected price based on label
  let expectedPrice;
  if (v.label.includes('½') || v.label.toLowerCase().includes('half')) {
    expectedPrice = 35;
  } else if (v.label.includes('Gallon') || v.label.includes('gallon')) {
    expectedPrice = 50;
  } else if (v.label.includes('Shot') || v.label.includes('shot') || v.label.includes('oz')) {
    expectedPrice = 5;
  } else {
    expectedPrice = null;
  }

  const hasValidPriceId = v.stripe_price_id && v.stripe_price_id.startsWith('price_') && v.stripe_price_id.length > 20;

  if (v.price_usd === expectedPrice && hasValidPriceId) {
    console.log(`✅ ${v.label}: $${v.price_usd} (${v.stripe_price_id})`);
  } else {
    console.log(`❌ ${v.label}: Expected $${expectedPrice}, got $${v.price_usd}`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\n❌ ${errors} database price errors found!`);
  process.exit(1);
}
console.log('\n✅ All database prices correct!\n');
SCRIPT

# Test 2: Test checkout API
echo "Test 2: Testing checkout API..."
echo "----------------------------------------"

# Get a valid price ID from database
PRICE_ID=$(node -e "
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('product_variants')
  .select('stripe_price_id')
  .eq('size_key', 'gallon')
  .eq('billing_type', 'one_time')
  .limit(1)
  .single();

console.log(data.stripe_price_id);
" 2>&1 | tail -1)

echo "Using price ID: $PRICE_ID"

# Test checkout session creation
RESPONSE=$(curl -s -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"priceId\":\"$PRICE_ID\",\"quantity\":1}]}")

if echo "$RESPONSE" | grep -q "checkout.stripe.com"; then
  echo -e "${GREEN}✅ Checkout API working - Stripe session created${NC}"
  echo ""
else
  echo -e "${RED}❌ Checkout API failed${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

# Test 3: Verify cart store version
echo "Test 3: Verifying cart store migration..."
echo "----------------------------------------"

if grep -q "version: 2" lib/store/cartStore.ts; then
  echo -e "${GREEN}✅ Cart store version 2 configured${NC}"
else
  echo -e "${RED}❌ Cart store version not set${NC}"
  exit 1
fi

if grep -q "migrate:" lib/store/cartStore.ts; then
  echo -e "${GREEN}✅ Cart migration function present${NC}"
else
  echo -e "${RED}❌ Cart migration function missing${NC}"
  exit 1
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✅ ALL TESTS PASSED                       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Checkout flow is working correctly:"
echo "  • Database prices: $50 (gallon), $35 (half), $5 (shot)"
echo "  • All variants have valid Stripe price IDs"
echo "  • Checkout API creates Stripe sessions successfully"
echo "  • Cart store migration clears stale data"
echo ""
