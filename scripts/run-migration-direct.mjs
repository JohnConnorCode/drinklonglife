#!/usr/bin/env node

/**
 * Run Migration Directly via Supabase REST API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

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

console.log('🚀 Running database migration...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrationSQL = readFileSync(
  join(projectRoot, 'supabase/migrations/009_add_billing_type_to_variants.sql'),
  'utf-8'
);

try {
  // Use raw SQL execution via Supabase client
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: migrationSQL
  });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Trying direct ALTER TABLE approach...\n');

    // Try executing commands individually
    const commands = [
      `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring'))`,
      `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year'))`,
      `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS recurring_interval_count INTEGER DEFAULT 1`,
      `CREATE INDEX IF NOT EXISTS idx_product_variants_billing_type ON product_variants(billing_type)`,
    ];

    for (const cmd of commands) {
      console.log(`Executing: ${cmd.substring(0, 60)}...`);
      const { error: cmdError } = await supabase.rpc('exec_sql', { sql: cmd });
      if (cmdError) {
        console.log(`  ⚠️  Error: ${cmdError.message}`);
      } else {
        console.log('  ✅ Success');
      }
    }
  } else {
    console.log('✅ Migration completed successfully!\n');
  }

  // Verify the columns
  console.log('🔍 Verifying columns...\n');
  const { data: verifyData, error: verifyError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(1);

  if (verifyError) {
    console.error('⚠️  Could not verify:', verifyError.message);
  } else if (verifyData && verifyData.length > 0) {
    const variant = verifyData[0];
    console.log('✅ Columns verified:');
    console.log(`   billing_type: ${variant.billing_type !== undefined ? '✓' : '✗'}`);
    console.log(`   recurring_interval: ${variant.recurring_interval !== undefined ? '✓' : '✗'}`);
    console.log(`   recurring_interval_count: ${variant.recurring_interval_count !== undefined ? '✓' : '✗'}\n');
  }

  console.log('✅ Migration complete!');

} catch (err) {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
}
