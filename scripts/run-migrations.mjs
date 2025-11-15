#!/usr/bin/env node

/**
 * Run Database Migrations
 *
 * This script executes SQL migrations against the Supabase database.
 * It reads the migration files and admin setup SQL, then runs them in order.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🚀 Running Database Migrations...\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

async function runSQL(name, sql) {
  console.log(`📝 Running: ${name}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct query instead
      const { error: directError } = await supabase.from('_migrations').insert({ name });

      if (directError && directError.message.includes('does not exist')) {
        // Use postgres REST API to execute raw SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql_query: sql }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`   ✅ ${name} completed successfully`);
        return;
      }

      throw error;
    }

    console.log(`   ✅ ${name} completed successfully`);
  } catch (err) {
    console.error(`   ❌ Error in ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  try {
    // Step 1: Run 005_ecommerce_products.sql migration
    console.log('='.repeat(60));
    console.log('STEP 1: Running Product Tables Migration');
    console.log('='.repeat(60) + '\n');

    const productMigration = readFileSync(
      join(projectRoot, 'supabase/migrations/005_ecommerce_products.sql'),
      'utf-8'
    );

    await runSQL('005_ecommerce_products', productMigration);

    // Step 2: Run admin setup SQL
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Running Admin User Setup');
    console.log('='.repeat(60) + '\n');

    const adminSetup = readFileSync(
      join(projectRoot, 'scripts/create-admin-simple.sql'),
      'utf-8'
    );

    await runSQL('create_admin_user', adminSetup);

    // Step 3: Verify tables exist
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: Verifying Database Tables');
    console.log('='.repeat(60) + '\n');

    const { data: tables, error: tablesError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (tablesError && tablesError.code === 'PGRST116') {
      console.log('⚠️  Warning: products table may not exist yet');
      console.log('   This might be expected if migration needs manual execution');
    } else {
      console.log('✅ Products table exists and is accessible');
    }

    // Step 4: Verify admin user
    console.log('\n📋 Checking admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, referral_code')
      .eq('email', 'jt.connor88@gmail.com')
      .single();

    if (adminError) {
      console.log('⚠️  Warning: Could not verify admin user');
      console.log('   Error:', adminError.message);
    } else if (adminUser) {
      console.log('✅ Admin user verified:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   is_admin: ${adminUser.is_admin}`);
      console.log(`   Referral code: ${adminUser.referral_code || '(not set)'}`);
    } else {
      console.log('⚠️  Admin user not found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION PROCESS COMPLETE');
    console.log('='.repeat(60));
    console.log('\nNote: If you see warnings above, you may need to run the SQL');
    console.log('files manually in the Supabase Dashboard > SQL Editor:');
    console.log('  1. supabase/migrations/005_ecommerce_products.sql');
    console.log('  2. scripts/create-admin-simple.sql\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Please run the migrations manually in Supabase Dashboard:');
    console.error('   1. Go to https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new');
    console.error('   2. Copy and paste the contents of:');
    console.error('      - supabase/migrations/005_ecommerce_products.sql');
    console.error('      - scripts/create-admin-simple.sql');
    console.error('   3. Run each SQL script separately\n');
    process.exit(1);
  }
}

main();
