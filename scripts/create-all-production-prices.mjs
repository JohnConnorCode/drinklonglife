#!/usr/bin/env node
/**
 * Create All Production Stripe Prices
 *
 * Comprehensive script to migrate ALL products from test to production Stripe
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use LIVE key for production
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-10-29.clover',
});

console.log('\n🔧 Creating ALL Production Stripe Prices\n');
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

// Check if price exists in production
async function priceExistsInProduction(priceId) {
  if (!priceId) return false;
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.active;
  } catch {
    return false;
  }
}

// Check if product exists in production
async function getOrCreateProduct(product) {
  const { id, name, tagline, stripe_product_id } = product;

  // Check if existing Stripe product works
  if (stripe_product_id) {
    try {
      const existing = await stripe.products.retrieve(stripe_product_id);
      if (existing) {
        console.log(`   ✅ Product "${name}" exists in production: ${stripe_product_id}`);
        return stripe_product_id;
      }
    } catch {
      console.log(`   ⚠️  Product "${name}" has test mode ID, creating production version...`);
    }
  }

  // Create new production product
  const newProduct = await stripe.products.create({
    name,
    description: tagline || `${name} - Long Life Juice`,
    active: true,
  });

  console.log(`   ✅ Created production product: ${newProduct.id}`);

  // Update Supabase
  await updateSupabase('products', id, { stripe_product_id: newProduct.id });
  console.log(`   ✅ Updated Supabase product`);

  return newProduct.id;
}

async function main() {
  try {
    // Step 1: Get all products from Supabase
    console.log('📦 Fetching all products from Supabase...\n');
    const products = await fetchSupabase('products', 'id,name,slug,tagline,stripe_product_id', 'is_active=eq.true');

    console.log(`   Found ${products.length} active products\n`);

    let totalFixed = 0;
    let totalSkipped = 0;

    for (const product of products) {
      console.log('━'.repeat(60));
      console.log(`\n📦 Processing: ${product.name}\n`);

      // Ensure product exists in production
      const stripeProductId = await getOrCreateProduct(product);

      // Get variants for this product
      const variants = await fetchSupabase(
        'product_variants',
        'id,label,price_usd,stripe_price_id,billing_type,recurring_interval,recurring_interval_count',
        `product_id=eq.${product.id}&is_active=eq.true`
      );

      if (variants.length === 0) {
        console.log(`   ⚠️  No active variants found`);
        continue;
      }

      console.log(`   Found ${variants.length} variants\n`);

      for (const variant of variants) {
        const { id, label, price_usd, stripe_price_id, billing_type, recurring_interval, recurring_interval_count } = variant;

        console.log(`   💰 ${label} ($${price_usd})`);

        // Check if current price works in production
        const isValid = await priceExistsInProduction(stripe_price_id);

        if (isValid) {
          console.log(`      ✅ Already valid: ${stripe_price_id}\n`);
          totalSkipped++;
          continue;
        }

        if (!price_usd || price_usd <= 0) {
          console.log(`      ⚠️  No price set, skipping\n`);
          totalSkipped++;
          continue;
        }

        // Create new production price
        const priceData = {
          product: stripeProductId,
          unit_amount: Math.round(price_usd * 100),
          currency: 'usd',
          metadata: {
            variant_label: label,
          },
        };

        // Add recurring info if subscription
        if (billing_type === 'recurring' && recurring_interval) {
          priceData.recurring = {
            interval: recurring_interval,
            interval_count: recurring_interval_count || 1,
          };
        }

        const newPrice = await stripe.prices.create(priceData);
        console.log(`      ✅ Created: ${newPrice.id}`);

        // Update Supabase
        await updateSupabase('product_variants', id, { stripe_price_id: newPrice.id });
        console.log(`      ✅ Updated Supabase\n`);

        totalFixed++;
      }
    }

    console.log('━'.repeat(60));
    console.log('\n✅ MIGRATION COMPLETE!\n');
    console.log(`   🔧 Fixed: ${totalFixed} variants`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} variants (already valid or no price)\n`);
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
