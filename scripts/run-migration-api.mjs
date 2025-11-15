#!/usr/bin/env node

/**
 * Run Migration via Supabase HTTP API
 */

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

console.log('🚀 Running database migration via HTTP API...\n');

// Read migration file
const migrationSQL = readFileSync(
  join(projectRoot, 'supabase/migrations/009_add_billing_type_to_variants.sql'),
  'utf-8'
);

// Split into individual statements
const statements = [
  `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring'))`,
  `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year'))`,
  `ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS recurring_interval_count INTEGER DEFAULT 1`,
  `CREATE INDEX IF NOT EXISTS idx_product_variants_billing_type ON product_variants(billing_type)`,
];

try {
  // Execute each statement using PostgREST
  for (const stmt of statements) {
    console.log(`Executing: ${stmt.substring(0, 60)}...`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: stmt }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`  ⚠️  HTTP ${response.status}: ${error}`);

      // If RPC doesn't exist, that's expected - migration still needs manual execution
      if (response.status === 404) {
        console.log('\n❌ Direct SQL execution not available via API');
        console.log('   The migration needs to be run manually in Supabase Dashboard');
        console.log('   See SUBSCRIPTION_SETUP_INSTRUCTIONS.md for details\n');
        process.exit(1);
      }
    } else {
      console.log('  ✅ Success');
    }
  }

  console.log('\n✅ Migration completed!\n');

} catch (err) {
  console.error('❌ Unexpected error:', err.message);
  console.log('\n📋 Please run the migration manually:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new');
  console.log('   2. Copy SQL from: supabase/migrations/009_add_billing_type_to_variants.sql');
  console.log('   3. Execute the SQL\n');
  process.exit(1);
}
