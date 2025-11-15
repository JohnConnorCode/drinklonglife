#!/usr/bin/env node

/**
 * Run Migration via PostgreSQL Connection
 */

import pkg from 'pg';
const { Client } = pkg;
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

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// Construct PostgreSQL connection string
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('❌ Missing database password');
  console.error('   Please add SUPABASE_DB_PASSWORD or DB_PASSWORD to .env.local');
  console.error('   You can find it in Supabase Dashboard → Project Settings → Database');
  process.exit(1);
}

const connectionString = `postgresql://postgres.${projectRef}:${DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

console.log('🚀 Running database migration...\n');
console.log(`📍 Project: ${projectRef}\n`);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  const migrationSQL = readFileSync(
    join(projectRoot, 'supabase/migrations/009_add_billing_type_to_variants.sql'),
    'utf-8'
  );

  console.log('📝 Executing migration...\n');

  await client.query(migrationSQL);

  console.log('✅ Migration completed successfully!\n');

  // Verify columns
  console.log('🔍 Verifying columns...\n');
  const result = await client.query(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'product_variants'
    AND column_name IN ('billing_type', 'recurring_interval', 'recurring_interval_count')
    ORDER BY column_name
  `);

  if (result.rows.length === 3) {
    console.log('✅ All columns verified:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`);
    });
  } else {
    console.log(`⚠️  Expected 3 columns, found ${result.rows.length}`);
  }

  console.log('\n✅ Migration complete!');

} catch (err) {
  console.error('❌ Migration failed:', err.message);
  if (err.message.includes('already exists')) {
    console.log('\n✅ Columns already exist - migration was previously applied');
  } else {
    process.exit(1);
  }
} finally {
  await client.end();
}
