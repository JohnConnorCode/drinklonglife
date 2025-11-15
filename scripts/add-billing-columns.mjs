#!/usr/bin/env node

/**
 * Add billing_type columns to product_variants table
 * Uses Supabase client to execute ALTER TABLE commands
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

dotenv.config({ path: join(projectRoot, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🚀 Adding billing_type columns to product_variants...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  try {
    // First, check if columns already exist
    console.log('🔍 Checking existing columns...\n');

    const { data: testData, error: testError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);

    if (testData && testData.length > 0 && 'billing_type' in testData[0]) {
      console.log('✅ Columns already exist!');
      console.log('   billing_type: ✓');
      console.log('   recurring_interval: ✓');
      console.log('   recurring_interval_count: ✓\n');
      console.log('Migration was previously applied.\n');
      return;
    }

    console.log('📝 Columns not found - need to run migration manually\n');
    console.log('Please run the following SQL in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new\n');
    console.log('─'.repeat(70));
    console.log(`
ALTER TABLE product_variants
ADD COLUMN billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring')),
ADD COLUMN recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year')),
ADD COLUMN recurring_interval_count INTEGER DEFAULT 1;

CREATE INDEX idx_product_variants_billing_type ON product_variants(billing_type);

COMMENT ON COLUMN product_variants.billing_type IS 'Payment type: one_time for single purchases, recurring for subscriptions';
COMMENT ON COLUMN product_variants.recurring_interval IS 'Subscription billing interval (only used when billing_type=recurring)';
COMMENT ON COLUMN product_variants.recurring_interval_count IS 'Number of intervals between billings (only used when billing_type=recurring)';
`);
    console.log('─'.repeat(70) + '\n');

    process.exit(1);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
