#!/usr/bin/env node
/**
 * Create Missing Production Stripe Prices
 *
 * Creates production prices for variants that only have test prices
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use LIVE key for production
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
  process.exit(1);
}

// Get Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found in environment');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-10-29.clover',
});

console.log('\n🔧 Creating Missing Production Stripe Prices\n');
console.log('━'.repeat(60));

// Fetch from Supabase
async function fetchSupabase(table, select = '*', filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter ? `&${filter}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${table}: ${await response.text()}`);
  }
  return response.json();
}

// Update Supabase
async function updateSupabase(table, id, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${await response.text()}`);
  }
  return response.json();
}

// The 4 variants that need production prices
const variantsToFix = [
  { label: '16 oz Bottle', price: 1299 },
  { label: '32 oz Bottle', price: 2299 },
  { label: '64 oz Jug', price: 3999 },
  { label: '1 Gallon', price: 6999 },
];

async function main() {
  try {
    // First, get or create a Stripe product for Yellow Bomb
    console.log('📦 Checking for Yellow Bomb product in Stripe...\n');

    // Get Yellow Bomb from Supabase
    const products = await fetchSupabase('products', 'id,name,stripe_product_id', 'slug=eq.yellow-bomb');

    if (!products || products.length === 0) {
      console.error('❌ Yellow Bomb product not found in Supabase');
      process.exit(1);
    }

    const yellowBomb = products[0];
    console.log(`   Found: ${yellowBomb.name}`);
    console.log(`   Stripe Product ID: ${yellowBomb.stripe_product_id || 'NONE'}\n`);

    let stripeProductId = yellowBomb.stripe_product_id;

    // Check if the existing product ID works in production
    let needsNewProduct = !stripeProductId;

    if (stripeProductId) {
      try {
        await stripe.products.retrieve(stripeProductId);
        console.log('   ✅ Stripe product exists in production\n');
      } catch {
        console.log('   ⚠️  Stripe product ID is from test mode, creating new production product...\n');
        needsNewProduct = true;
      }
    }

    // Create Stripe product if needed
    if (needsNewProduct) {
      console.log('   Creating Stripe product in PRODUCTION...');
      const product = await stripe.products.create({
        name: 'Yellow Bomb',
        description: 'Our signature immune-boosting juice blend with turmeric, ginger, and citrus.',
        active: true,
      });
      stripeProductId = product.id;
      console.log(`   ✅ Created: ${stripeProductId}\n`);

      // Update Supabase with Stripe product ID
      await updateSupabase('products', yellowBomb.id, { stripe_product_id: stripeProductId });
      console.log('   ✅ Updated Supabase product with Stripe ID\n');
    }

    // Get variants from Supabase
    const variants = await fetchSupabase(
      'product_variants',
      'id,label,price_usd,stripe_price_id',
      `product_id=eq.${yellowBomb.id}`
    );

    console.log('━'.repeat(60));
    console.log('💰 Creating prices for variants...\n');

    for (const variant of variants) {
      const fixInfo = variantsToFix.find(v => v.label === variant.label);
      if (!fixInfo) continue;

      console.log(`📍 ${variant.label}`);
      console.log(`   Current price ID: ${variant.stripe_price_id}`);
      console.log(`   Expected amount: $${(fixInfo.price / 100).toFixed(2)}`);

      // Create price in Stripe
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: fixInfo.price,
        currency: 'usd',
        metadata: {
          variant_label: variant.label,
        },
      });

      console.log(`   ✅ Created price: ${price.id}`);

      // Update Supabase variant with new price ID
      await updateSupabase('product_variants', variant.id, {
        stripe_price_id: price.id,
      });

      console.log(`   ✅ Updated Supabase\n`);
    }

    console.log('━'.repeat(60));
    console.log('\n✅ All missing prices created!\n');
    console.log('🔍 Run validate-checkout.mjs to verify:\n');
    console.log('   node scripts/validate-checkout.mjs\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
