#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const variantData = [
  // Green Bomb
  { stripePriceId: 'price_1STLYqCu8SiOGapKOM9yjxCL', size: '1 Gallon', sizeKey: 'gallon', isDefault: false },
  { stripePriceId: 'price_1STLYrCu8SiOGapKupt9c8IG', size: '½ Gallon', sizeKey: 'half_gallon', isDefault: true },
  { stripePriceId: 'price_1STLYrCu8SiOGapKx9RMXCG5', size: '2 oz Shot', sizeKey: 'shot', isDefault: false },
  // Red Bomb
  { stripePriceId: 'price_1STLYsCu8SiOGapK7Z0iLCh8', size: '1 Gallon', sizeKey: 'gallon', isDefault: false },
  { stripePriceId: 'price_1STLYsCu8SiOGapKa7MM8WXM', size: '½ Gallon', sizeKey: 'half_gallon', isDefault: true },
  { stripePriceId: 'price_1STLYsCu8SiOGapKqnGYhhKG', size: '2 oz Shot', sizeKey: 'shot', isDefault: false },
  // Yellow Bomb
  { stripePriceId: 'price_1STLYtCu8SiOGapKRvX8LhDL', size: '1 Gallon', sizeKey: 'gallon', isDefault: false },
  { stripePriceId: 'price_1STLYuCu8SiOGapK8Zv4O8D2', size: '½ Gallon', sizeKey: 'half_gallon', isDefault: true },
  { stripePriceId: 'price_1STLYuCu8SiOGapKCBkBupAy', size: '2 oz Shot', sizeKey: 'shot', isDefault: false },
];

console.log('🔄 Syncing variant data from Stripe to Supabase...\n');

for (const variant of variantData) {
  try {
    // Get price from Stripe
    const stripePrice = await stripe.prices.retrieve(variant.stripePriceId);
    const price = stripePrice.unit_amount / 100;

    console.log(`Processing ${variant.size} (${variant.stripePriceId})...`);

    // Update variant in database
    const { data, error } = await supabase
      .from('product_variants')
      .update({
        label: variant.size,
        size_key: variant.sizeKey,
        price_usd: price,
        is_default: variant.isDefault,
      })
      .eq('stripe_price_id', variant.stripePriceId)
      .select();

    if (error) {
      console.error(`  ❌ Error updating variant:`, error);
    } else if (data && data.length > 0) {
      console.log(`  ✅ Updated: ${variant.size} - $${price}`);
    } else {
      console.log(`  ⚠️  No variant found with stripe_price_id: ${variant.stripePriceId}`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log('\n✅ Sync complete!\n');

// Verify the update
console.log('🔍 Verifying updates...\n');
const { data: variants } = await supabase
  .from('product_variants')
  .select('*')
  .order('product_id');

variants.forEach(v => {
  console.log(`  ${v.label || 'NO LABEL'} - $${v.price_usd || 'NO PRICE'} (${v.stripe_price_id})`);
});
