#!/usr/bin/env node
/**
 * Setup script for discounts table
 * Checks if table exists and provides migration instructions or seeds data
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function main() {
  console.log('🔍 Checking if discounts table exists...\n');

  // Check if table exists
  const { data, error } = await supabase
    .from('discounts')
    .select('id')
    .limit(1);

  if (error && (error.message.includes('does not exist') || error.code === 'PGRST205')) {
    console.log('❌ discounts table does not exist.\n');
    console.log('━'.repeat(60));
    console.log('\n📋 MIGRATION REQUIRED\n');
    console.log('Please run the following SQL in the Supabase SQL Editor:\n');
    console.log(`🔗 https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
    console.log('━'.repeat(60));

    // Read and output the migration SQL
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '027_database_discounts.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log('\n' + sql);
    } else {
      console.log('\n❌ Migration file not found at:', migrationPath);
    }

    console.log('\n━'.repeat(60));
    console.log('\nAfter running the SQL, run this script again to seed test data.');
    console.log('━'.repeat(60));
    return;
  }

  if (error) {
    console.error('❌ Unexpected error:', error.message);
    return;
  }

  console.log('✅ discounts table exists!\n');

  // Seed test discount codes
  console.log('📦 Seeding test discount codes...\n');

  const testDiscounts = [
    {
      code: 'SAVE20',
      name: '20% Off',
      description: 'Get 20% off your order',
      discount_type: 'percent',
      discount_percent: 20,
      is_active: true,
    },
    {
      code: 'WELCOME10',
      name: '$10 Off First Order',
      description: '$10 off orders over $50',
      discount_type: 'amount',
      discount_amount_cents: 1000,
      min_amount_cents: 5000,
      first_time_only: true,
      is_active: true,
    },
    {
      code: 'JUICE25',
      name: '25% Off',
      description: 'Special 25% discount',
      discount_type: 'percent',
      discount_percent: 25,
      is_active: true,
    },
    {
      code: 'HALFOFF',
      name: '50% Off',
      description: 'Half price on your order',
      discount_type: 'percent',
      discount_percent: 50,
      is_active: true,
    },
    {
      code: 'FLAT5',
      name: '$5 Off',
      description: '$5 off any order',
      discount_type: 'amount',
      discount_amount_cents: 500,
      is_active: true,
    }
  ];

  for (const discount of testDiscounts) {
    const { data: inserted, error: insertError } = await supabase
      .from('discounts')
      .upsert(discount, { onConflict: 'code' })
      .select()
      .single();

    if (insertError) {
      console.log(`   ❌ ${discount.code}: ${insertError.message}`);
    } else {
      console.log(`   ✅ ${discount.code}: ${discount.name} (${discount.discount_type === 'percent' ? discount.discount_percent + '%' : '$' + (discount.discount_amount_cents / 100).toFixed(2)} off)`);
    }
  }

  // List all discounts
  console.log('\n📋 All discount codes in database:\n');
  const { data: allDiscounts, error: listError } = await supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (listError) {
    console.error('Error listing discounts:', listError);
  } else {
    console.table(allDiscounts.map(d => ({
      code: d.code,
      name: d.name,
      type: d.discount_type,
      value: d.discount_percent ? `${d.discount_percent}%` : `$${(d.discount_amount_cents/100).toFixed(2)}`,
      min: d.min_amount_cents ? `$${(d.min_amount_cents/100).toFixed(2)}` : '-',
      active: d.is_active ? '✓' : '✗',
      used: d.times_redeemed || 0
    })));
  }

  console.log('\n✅ Setup complete!');
  console.log('\n🔗 Test the discount validation API:');
  console.log('   curl -X POST http://localhost:3000/api/coupons/validate -H "Content-Type: application/json" -d \'{"code":"SAVE20"}\'');
}

main().catch(console.error);
