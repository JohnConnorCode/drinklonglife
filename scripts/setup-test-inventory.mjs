#!/usr/bin/env node

/**
 * Setup Test Inventory
 *
 * Ensures at least one product variant has inventory tracking enabled
 * and sufficient stock for testing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestInventory() {
  console.log('🔧 Setting up test inventory...\n');

  // Find first active variant
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('id, stripe_price_id, label, products:product_id (name)')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (variantError || !variant) {
    console.error('❌ No active variants found in database');
    return false;
  }

  console.log(`📦 Configuring variant: ${variant.products?.name} - ${variant.label}`);
  console.log(`   Variant ID: ${variant.id}`);
  console.log(`   Price ID: ${variant.stripe_price_id}`);

  // Enable inventory tracking and set stock to 100
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({
      track_inventory: true,
      stock_quantity: 100,
      low_stock_threshold: 10,
    })
    .eq('id', variant.id);

  if (updateError) {
    console.error('❌ Failed to update variant:', updateError.message);
    return false;
  }

  console.log('✅ Inventory tracking enabled');
  console.log('✅ Stock quantity set to 100');
  console.log('✅ Low stock threshold set to 10\n');

  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SETUP TEST INVENTORY');
  console.log('═══════════════════════════════════════════\n');

  const success = await setupTestInventory();

  console.log('═══════════════════════════════════════════');
  if (success) {
    console.log('  ✅ SETUP COMPLETE');
  } else {
    console.log('  ❌ SETUP FAILED');
  }
  console.log('═══════════════════════════════════════════\n');

  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
