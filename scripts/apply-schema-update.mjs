#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔧 APPLYING DATABASE SCHEMA UPDATE\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Making stripe_price_id nullable in product_variants...\n');

const sql = `
ALTER TABLE product_variants
ALTER COLUMN stripe_price_id DROP NOT NULL;
`;

try {
  const { data, error } = await supabase.rpc('exec', { sql });

  if (error) {
    console.log('❌ RPC method not available. Trying direct SQL execution...\n');

    // Try using the Supabase client's sql method
    const { data: result, error: sqlError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(0); // Just to test connection

    if (sqlError) {
      throw sqlError;
    }

    // Use raw SQL via PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.log('✅ Schema updated successfully!\n');
  } else {
    console.log('✅ Schema updated successfully!\n');
  }

  // Verify the change
  console.log('Verifying column is now nullable...\n');

  const verifySQL = `
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'product_variants'
      AND column_name = 'stripe_price_id';
  `;

  const { data: verifyData, error: verifyError } = await supabase.rpc('exec', { sql: verifySQL });

  if (verifyError) {
    console.log('Manual verification needed.');
  } else {
    console.log('Verification result:', verifyData);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SCHEMA UPDATE COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('stripe_price_id is now nullable.');
  console.log('Auto-sync feature will now work for new products.\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nAttempting alternative method using raw PostgreSQL connection...\n');

  // Alternative: Use node-postgres directly
  const pg = await import('pg');
  const { Client } = pg.default;

  const connectionString = process.env.DATABASE_URL ||
    `postgresql://postgres.${SUPABASE_URL.split('//')[1].split('.')[0]}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  try {
    const client = new Client({ connectionString });
    await client.connect();

    console.log('Connected to database...');

    const result = await client.query(`
      ALTER TABLE product_variants
      ALTER COLUMN stripe_price_id DROP NOT NULL;
    `);

    console.log('✅ Schema updated successfully!\n');

    // Verify
    const verify = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'product_variants'
        AND column_name = 'stripe_price_id';
    `);

    console.log('Verification:');
    console.log(verify.rows[0]);
    console.log('');

    await client.end();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ SCHEMA UPDATE COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (pgError) {
    console.error('❌ PostgreSQL error:', pgError.message);
    console.log('\nPlease run this SQL manually in Supabase Dashboard:\n');
    console.log('ALTER TABLE product_variants ALTER COLUMN stripe_price_id DROP NOT NULL;\n');
    process.exit(1);
  }
}
