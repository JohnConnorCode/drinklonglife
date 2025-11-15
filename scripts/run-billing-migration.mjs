#!/usr/bin/env node

/**
 * Run Billing Type Migration
 * Adds billing_type support to product_variants table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

console.log('🚀 Running Billing Type Migration...\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(projectRoot, 'supabase/migrations/009_add_billing_type_to_variants.sql'),
      'utf-8'
    );

    console.log('📝 Executing migration SQL...\n');

    // Split into individual statements and execute each
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;

      console.log(`Executing: ${statement.substring(0, 50)}...`);

      const { error } = await supabase.rpc('exec', { query: statement + ';' });

      if (error) {
        // If exec RPC doesn't exist, we'll need to run it manually
        console.log(`⚠️  Could not execute via RPC: ${error.message}`);
        console.log('📋 Please run this migration manually in Supabase Dashboard:');
        console.log('   https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new');
        console.log('\nMigration SQL:');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
        process.exit(1);
      }

      console.log('   ✅ Success\n');
    }

    // Verify the columns were added
    console.log('🔍 Verifying migration...\n');

    const { data, error } = await supabase
      .from('product_variants')
      .select('id, billing_type, recurring_interval, recurring_interval_count')
      .limit(1);

    if (error) {
      console.log('⚠️  Could not verify columns:', error.message);
      console.log('   The migration may have succeeded but verification failed.');
      console.log('   Please check the table schema manually.\n');
    } else {
      console.log('✅ Migration verified successfully!');
      console.log('   New columns added to product_variants:');
      console.log('   - billing_type');
      console.log('   - recurring_interval');
      console.log('   - recurring_interval_count\n');
    }

    console.log('='.repeat(60));
    console.log('✅ MIGRATION COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Please run the migration manually:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new');
    console.error('   2. Copy contents of: supabase/migrations/009_add_billing_type_to_variants.sql');
    console.error('   3. Execute the SQL\n');
    process.exit(1);
  }
}

runMigration();
