#!/usr/bin/env node
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

console.log('🔧 APPLYING DATABASE SCHEMA UPDATE\n');
console.log('═══════════════════════════════════════════════════════════\n');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

// Extract project ref from Supabase URL
// URL format: https://[project-ref].supabase.co
const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];

// Supabase connection string format
const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log(`Connecting to Supabase project: ${projectRef}...\n`);

const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  // Check current state
  console.log('Checking current schema...');
  const checkResult = await client.query(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'product_variants'
      AND column_name = 'stripe_price_id';
  `);

  if (checkResult.rows.length > 0) {
    console.log(`Current state: is_nullable = ${checkResult.rows[0].is_nullable}\n`);

    if (checkResult.rows[0].is_nullable === 'YES') {
      console.log('✅ stripe_price_id is already nullable!');
      console.log('   No changes needed.\n');
      await client.end();
      process.exit(0);
    }
  }

  // Apply the change
  console.log('Applying schema change...');
  await client.query(`
    ALTER TABLE product_variants
    ALTER COLUMN stripe_price_id DROP NOT NULL;
  `);

  console.log('✅ Schema updated successfully!\n');

  // Verify the change
  console.log('Verifying change...');
  const verifyResult = await client.query(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'product_variants'
      AND column_name = 'stripe_price_id';
  `);

  console.log('New state:');
  console.log(`  Column: ${verifyResult.rows[0].column_name}`);
  console.log(`  Type: ${verifyResult.rows[0].data_type}`);
  console.log(`  Nullable: ${verifyResult.rows[0].is_nullable}`);
  console.log('');

  await client.end();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SCHEMA UPDATE COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('What this means:');
  console.log('  ✓ stripe_price_id is now nullable in product_variants');
  console.log('  ✓ Auto-sync feature will work for new products');
  console.log('  ✓ Admins can create products without Stripe IDs');
  console.log('  ✓ Stripe IDs will be added automatically via sync\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
  await client.end();
  process.exit(1);
}
