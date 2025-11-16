/**
 * Validates the current Stripe mode configuration
 * Checks Supabase database and verifies all prices match Stripe
 *
 * This script validates ONLY Supabase (NOT Sanity).
 * Products are managed via the admin panel at /admin/products
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripeKey = process.env.STRIPE_SECRET_KEY;
const isLiveMode = stripeKey.startsWith('sk_live');
const mode = isLiveMode ? 'LIVE' : 'TEST';

console.log(`\n🔍 Validating ${mode} Mode Configuration\n`);
console.log(`   Stripe Key: ${stripeKey.substring(0, 15)}...`);
console.log(`   Mode: ${mode} ${isLiveMode ? '⚠️  REAL MONEY' : '✅ Safe for testing'}`);
console.log(`   Data Source: Supabase (admin panel at /admin/products)`);
console.log('\n' + '═'.repeat(60) + '\n');

const stripe = new Stripe(stripeKey);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const BLEND_SLUGS = ['green-bomb', 'red-bomb', 'yellow-bomb'];
const EXPECTED_PRICES = { shot: 5, half_gallon: 35, gallon: 50 };

let allValid = true;

for (const slug of BLEND_SLUGS) {
  console.log(`📦 ${slug}:`);

  // Get product from Supabase
  const productRes = await fetch(`${SUPABASE_URL}/rest/v1/products?slug=eq.${slug}&select=id,name`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const products = await productRes.json();

  if (!products || products.length === 0) {
    console.log(`   ❌ Not found in Supabase\n`);
    allValid = false;
    continue;
  }

  const product = products[0];

  // Get variants
  const variantsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${product.id}&select=*&order=display_order`,
    {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }
  );
  const variants = await variantsRes.json();

  if (!variants || variants.length === 0) {
    console.log(`   ❌ No variants configured\n`);
    allValid = false;
    continue;
  }

  // Check each variant
  for (const variant of variants) {
    const priceId = variant.stripe_price_id;

    if (!priceId) {
      console.log(`   ❌ ${variant.label}: Missing price ID`);
      allValid = false;
      continue;
    }

    // Validate price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount / 100;
      const expectedAmount = EXPECTED_PRICES[variant.size_key] || variant.price_usd;

      const isCorrectAmount = amount === expectedAmount;
      const isCorrectMode = isLiveMode ? price.livemode : !price.livemode;

      if (!isCorrectMode) {
        console.log(`   ❌ ${variant.label}: Wrong mode! Price is ${price.livemode ? 'LIVE' : 'TEST'} but app is in ${mode} mode`);
        console.log(`      Price ID: ${priceId}`);
        allValid = false;
      } else if (!isCorrectAmount) {
        console.log(`   ⚠️  ${variant.label}: Amount mismatch - Stripe: $${amount}, Expected: $${expectedAmount}`);
        console.log(`      Price ID: ${priceId}`);
        allValid = false;
      } else {
        console.log(`   ✅ ${variant.label}: ${priceId} - $${amount}`);
      }
    } catch (error) {
      if (error.code === 'resource_missing') {
        console.log(`   ❌ ${variant.label}: Price ${priceId} does not exist in ${mode} mode`);
        console.log(`      This price ID is for the wrong Stripe mode!`);
      } else {
        console.log(`   ❌ ${variant.label}: Error - ${error.message}`);
      }
      allValid = false;
    }
  }

  console.log('');
}

console.log('═'.repeat(60));
if (allValid) {
  console.log(`✅ ALL CHECKS PASSED - ${mode} mode is properly configured\n`);
  console.log(`   All products in Supabase have valid ${mode} mode price IDs`);
  console.log(`   All prices match expected amounts ($50/$35/$5)\n`);
  console.log(`💡 To manage products, use the admin panel:`);
  console.log(`   http://localhost:3000/admin/products\n`);
} else {
  console.log(`❌ VALIDATION FAILED - ${mode} mode has configuration issues\n`);
  console.log(`   Fix issues above or run:`);
  console.log(`   node scripts/update-all-prices.mjs ${mode.toLowerCase()}\n`);
  console.log(`   Or fix manually in admin panel:`);
  console.log(`   http://localhost:3000/admin/products\n`);
}
