#!/usr/bin/env node
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

console.log('🔧 APPLYING MIGRATION 016\n');
console.log('═══════════════════════════════════════════════════════════\n');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

// Extract project ref from Supabase URL
const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];

// Supabase direct connection (not pooler)
const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

console.log(`Connecting to project: ${projectRef}...\n`);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  // Read the migration file
  const migrationSQL = readFileSync('supabase/migrations/016_make_stripe_price_id_nullable.sql', 'utf8');

  console.log('Applying migration: 016_make_stripe_price_id_nullable.sql\n');
  console.log('SQL:');
  console.log('─'.repeat(60));
  console.log(migrationSQL);
  console.log('─'.repeat(60));
  console.log('');

  // Execute the migration
  await client.query(migrationSQL);

  console.log('✅ Migration applied successfully!\n');

  // Verify the change
  console.log('Verifying change...');
  const verifyResult = await client.query(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'product_variants'
      AND column_name = 'stripe_price_id';
  `);

  console.log('Column info:');
  console.log(`  Column: ${verifyResult.rows[0].column_name}`);
  console.log(`  Type: ${verifyResult.rows[0].data_type}`);
  console.log(`  Nullable: ${verifyResult.rows[0].is_nullable}`);
  console.log('');

  // Record in migrations table
  console.log('Recording migration...');
  await client.query(`
    INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
    VALUES ('016', ARRAY[$1], '016_make_stripe_price_id_nullable.sql')
    ON CONFLICT (version) DO NOTHING;
  `, [migrationSQL]);

  console.log('✅ Migration recorded\n');

  await client.end();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ MIGRATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Auto-sync feature is now fully functional.');
  console.log('Admins can create products without Stripe IDs.\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.code) {
    console.error(`Code: ${error.code}`);
  }
  console.error('\nFull error:', error);
  await client.end();
  process.exit(1);
}
