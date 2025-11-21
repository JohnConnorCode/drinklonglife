#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 UPDATING DATABASE SCHEMA\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Making stripe_price_id nullable in product_variants table...\n');

// Use Supabase RPC to execute SQL
const sql = `
ALTER TABLE product_variants
ALTER COLUMN stripe_price_id DROP NOT NULL;
`;

try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log('❌ Failed via RPC. Error:', error);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:\n');
    console.log('───────────────────────────────────────────────────────────');
    console.log('ALTER TABLE product_variants');
    console.log('ALTER COLUMN stripe_price_id DROP NOT NULL;');
    console.log('───────────────────────────────────────────────────────────\n');
    process.exit(1);
  }

  console.log('✅ Schema updated successfully!\n');
  console.log('stripe_price_id is now nullable in product_variants table.\n');
  console.log('You can now create variants without Stripe IDs.\n');

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('\nPlease run this SQL manually in Supabase SQL Editor:\n');
  console.log('───────────────────────────────────────────────────────────');
  console.log('ALTER TABLE product_variants');
  console.log('ALTER COLUMN stripe_price_id DROP NOT NULL;');
  console.log('───────────────────────────────────────────────────────────\n');
  console.log('Steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Paste the SQL above');
  console.log('5. Click "Run"');
  console.log('\n');
  process.exit(1);
}
