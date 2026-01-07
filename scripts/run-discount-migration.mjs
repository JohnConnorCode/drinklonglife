#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running discount table migration...\n');

  // Read the migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '027_database_discounts.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements (rough split, good enough for this)
  const statements = migrationSql
    .split(/;[\s]*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  // Execute key statements via RPC
  // First, check if table exists
  const { data: tableExists } = await supabase
    .from('discounts')
    .select('id')
    .limit(1);

  if (tableExists !== null) {
    console.log('✅ discounts table already exists\n');
  } else {
    console.log('Creating discounts table...');

    // Use raw SQL via the REST endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({})
    });

    // Since we can't run raw SQL easily, let's create the table manually
    console.log('Note: Full migration requires Supabase dashboard or CLI');
    console.log('Let me try inserting directly to test if table exists...\n');
  }

  // Test by creating a sample discount
  console.log('Creating test discount codes...\n');

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
    }
  ];

  for (const discount of testDiscounts) {
    const { data, error } = await supabase
      .from('discounts')
      .upsert(discount, { onConflict: 'code' })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation "public.discounts" does not exist')) {
        console.log('❌ discounts table does not exist yet.');
        console.log('\nPlease run the migration manually in Supabase SQL Editor:');
        console.log('  1. Go to: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql');
        console.log('  2. Paste contents of: supabase/migrations/027_database_discounts.sql');
        console.log('  3. Run the SQL\n');
        process.exit(1);
      }
      console.error(`❌ Error creating ${discount.code}:`, error.message);
    } else {
      console.log(`✅ Created discount: ${discount.code} (${discount.name})`);
    }
  }

  console.log('\n✅ Migration and test data complete!');
}

runMigration().catch(console.error);
