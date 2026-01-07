#!/usr/bin/env node
/**
 * Direct PostgreSQL connection to run migration
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase connection details - load from environment
const PROJECT_REF = 'qjgenpwbaquqrvyrfsdo';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD environment variable');
  process.exit(1);
}

// Connection string format for Supabase
// Use the direct connection (not pooler) for DDL operations
const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log('🔌 Connecting to Supabase PostgreSQL...');
console.log(`   Host: db.${PROJECT_REF}.supabase.co`);

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '027_database_discounts.sql');
    let migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments for cleaner execution
    migrationSql = migrationSql.replace(/--.*$/gm, '');

    console.log('📝 Running migration...\n');

    // Execute the full migration
    await client.query(migrationSql);

    console.log('✅ Migration completed!\n');

    // Insert test data
    console.log('📦 Inserting test discount codes...\n');

    const testDiscounts = [
      { code: 'SAVE20', name: '20% Off', description: 'Get 20% off your order', discount_type: 'percent', discount_percent: 20 },
      { code: 'WELCOME10', name: '$10 Off First Order', description: '$10 off orders over $50', discount_type: 'amount', discount_amount_cents: 1000, min_amount_cents: 5000, first_time_only: true },
      { code: 'JUICE25', name: '25% Off', description: 'Special 25% discount', discount_type: 'percent', discount_percent: 25 }
    ];

    for (const d of testDiscounts) {
      try {
        const columns = Object.keys(d);
        const values = Object.values(d);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await client.query(
          `INSERT INTO public.discounts (${columns.join(', ')}, is_active)
           VALUES (${placeholders}, true)
           ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
          values
        );
        console.log(`   ✅ ${d.code}: ${d.name}`);
      } catch (err) {
        console.error(`   ❌ ${d.code}: ${err.message}`);
      }
    }

    // List all discounts
    console.log('\n📋 Current discounts in database:');
    const result = await client.query('SELECT code, name, discount_type, discount_percent, discount_amount_cents, is_active FROM public.discounts ORDER BY created_at');
    console.table(result.rows);

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\n💡 Note: The direct database hostname may not be accessible from your network.');
      console.log('   Try using the Supabase Dashboard to run the SQL manually.');
    }
  } finally {
    await client.end();
  }
}

runMigration();
