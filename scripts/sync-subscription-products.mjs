#!/usr/bin/env node

/**
 * Sync Subscription Products from Stripe to Database
 *
 * This script fetches all recurring subscription products from Stripe
 * and inserts them into the product_variants table with billing_type='recurring'
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_TEST;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   STRIPE_SECRET_KEY_TEST:', STRIPE_SECRET_KEY ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Initialize Stripe and Supabase clients
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🚀 Syncing Subscription Products from Stripe...\n');

/**
 * Product name to database product slug mapping
 */
const PRODUCT_NAME_TO_SLUG = {
  'Green Bomb': 'green-bomb',
  'Red Bomb': 'red-bomb',
  'Yellow Bomb': 'yellow-bomb',
};

/**
 * Size variations mapping - maps Stripe naming to database size_key
 */
const SIZE_MAPPING = {
  'gallon': 'gallon',
  'gal': 'gallon',
  'half gallon': 'half_gallon',
  'half-gallon': 'half_gallon',
  'half': 'half_gallon',
  'shot': 'shot',
};

/**
 * Size to label mapping
 */
const SIZE_LABELS = {
  'gallon': '1-Gallon Jug',
  'half_gallon': '½-Gallon Bottle',
  'shot': '2oz Shot',
};

/**
 * Extract size from product/price name
 */
function extractSize(name) {
  const nameLower = name.toLowerCase();

  for (const [key, value] of Object.entries(SIZE_MAPPING)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Get base product name from subscription product name
 */
function getBaseProductName(name) {
  // Extract base product name (e.g., "Green Bomb - Monthly Subscription" → "Green Bomb")
  const match = name.match(/^(.+?)\s*-\s*(Monthly|Weekly|Yearly|Daily)\s*Subscription/i);
  return match ? match[1].trim() : null;
}

async function syncSubscriptionProducts() {
  try {
    console.log('📦 Fetching subscription products from Stripe...\n');

    // Fetch all products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    console.log(`Found ${products.data.length} active products in Stripe\n`);

    // Filter for subscription products
    const subscriptionProducts = products.data.filter(product =>
      product.name.toLowerCase().includes('subscription')
    );

    console.log(`Found ${subscriptionProducts.length} subscription products\n`);

    if (subscriptionProducts.length === 0) {
      console.log('⚠️  No subscription products found!');
      console.log('   Please create subscription products in Stripe Dashboard first.');
      console.log('   See SUBSCRIPTION_SETUP_INSTRUCTIONS.md for details.\n');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each subscription product
    for (const product of subscriptionProducts) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Processing: ${product.name}`);
      console.log(`Stripe Product ID: ${product.id}`);

      // Get base product name
      const baseProductName = getBaseProductName(product.name);
      if (!baseProductName) {
        console.log(`⚠️  Could not extract base product name, skipping`);
        skipCount++;
        continue;
      }

      const productSlug = PRODUCT_NAME_TO_SLUG[baseProductName];
      if (!productSlug) {
        console.log(`⚠️  Unknown product "${baseProductName}", skipping`);
        skipCount++;
        continue;
      }

      // Look up product UUID by slug
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productSlug)
        .single();

      if (productError || !productData) {
        console.log(`⚠️  Could not find product with slug "${productSlug}", skipping`);
        skipCount++;
        continue;
      }

      const productId = productData.id;
      console.log(`Base Product: ${baseProductName} (${productSlug}, ${productId})`);

      // Fetch all prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      });

      console.log(`Found ${prices.data.length} price(s)`);

      // Process each price
      for (const price of prices.data) {
        try {
          // Only process recurring prices
          if (price.type !== 'recurring') {
            console.log(`  ⏭️  Skipping non-recurring price ${price.id}`);
            continue;
          }

          const size = extractSize(price.nickname || product.name);
          if (!size) {
            console.log(`  ⚠️  Could not determine size for price ${price.id}, skipping`);
            skipCount++;
            continue;
          }

          const interval = price.recurring?.interval;
          const intervalCount = price.recurring?.interval_count || 1;

          console.log(`  📌 Price ID: ${price.id}`);
          console.log(`     Size: ${size}`);
          console.log(`     Amount: $${(price.unit_amount / 100).toFixed(2)}`);
          console.log(`     Interval: ${intervalCount} ${interval}(s)`);

          // Check if this variant already exists
          const { data: existing } = await supabase
            .from('product_variants')
            .select('id')
            .eq('stripe_price_id', price.id)
            .single();

          if (existing) {
            console.log(`  ℹ️  Variant already exists, skipping`);
            skipCount++;
            continue;
          }

          // Insert into database
          const { data, error} = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              size_key: size,
              label: SIZE_LABELS[size] + ' (Monthly)',
              price_usd: price.unit_amount / 100, // Convert cents to dollars
              stripe_price_id: price.id,
              is_default: false,
              display_order: size === 'gallon' ? 1 : size === 'half_gallon' ? 2 : 3,
              is_active: true,
              billing_type: 'recurring',
              recurring_interval: interval,
              recurring_interval_count: intervalCount,
            })
            .select()
            .single();

          if (error) {
            console.log(`  ❌ Error inserting variant: ${error.message}`);
            errorCount++;
          } else {
            console.log(`  ✅ Successfully inserted variant (ID: ${data.id})`);
            successCount++;
          }
        } catch (err) {
          console.log(`  ❌ Error processing price ${price.id}: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 SYNC SUMMARY');
    console.log(`${'═'.repeat(60)}`);
    console.log(`✅ Successfully synced: ${successCount} variants`);
    console.log(`⏭️  Skipped: ${skipCount} (already exist or invalid)`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`${'═'.repeat(60)}\n`);

    if (successCount > 0) {
      console.log('🎉 Subscription products successfully synced to database!\n');
      console.log('Next steps:');
      console.log('  1. Update pricing page to show subscription options');
      console.log('  2. Implement subscription checkout tests');
      console.log('  3. Set up webhook integration (see SUBSCRIPTION_SETUP_INSTRUCTIONS.md)\n');
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncSubscriptionProducts();
