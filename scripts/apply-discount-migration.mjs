#!/usr/bin/env node
/**
 * Apply discount migration directly to Supabase
 * Uses the REST API with service role key
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({})
  });
  return response;
}

async function createDiscountsTable() {
  console.log('Creating discounts table via Supabase Management API...\n');

  // The Management API endpoint for running SQL
  const managementUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  const sql = `
    -- Table: discounts
    CREATE TABLE IF NOT EXISTS public.discounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT,
      description TEXT,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
      discount_percent NUMERIC(5,2),
      discount_amount_cents INTEGER,
      min_amount_cents INTEGER DEFAULT 0,
      max_redemptions INTEGER,
      times_redeemed INTEGER DEFAULT 0,
      first_time_only BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      starts_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT valid_discount_value CHECK (
        (discount_type = 'percent' AND discount_percent IS NOT NULL AND discount_percent > 0 AND discount_percent <= 100) OR
        (discount_type = 'amount' AND discount_amount_cents IS NOT NULL AND discount_amount_cents > 0)
      )
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);
    CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(is_active) WHERE is_active = true;

    -- Enable RLS
    ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

    -- RLS Policies (drop first if exists to avoid errors)
    DROP POLICY IF EXISTS "Public can validate codes" ON public.discounts;
    CREATE POLICY "Public can validate codes"
      ON public.discounts
      FOR SELECT
      USING (is_active = true);

    DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
    CREATE POLICY "Admins can manage discounts"
      ON public.discounts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );

    DROP POLICY IF EXISTS "Service role full access" ON public.discounts;
    CREATE POLICY "Service role full access"
      ON public.discounts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    -- Trigger for updated_at (using existing function)
    DROP TRIGGER IF EXISTS set_updated_at_discounts ON public.discounts;
    CREATE TRIGGER set_updated_at_discounts
      BEFORE UPDATE ON public.discounts
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    -- Function to increment redemption count
    CREATE OR REPLACE FUNCTION public.redeem_discount(p_discount_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE public.discounts
      SET times_redeemed = times_redeemed + 1,
          updated_at = NOW()
      WHERE id = p_discount_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // We need to use the Supabase Management API with an access token
  // or use direct database connection. Let's try pg package.
  console.log('SQL to run:\n');
  console.log(sql);
  console.log('\n---\n');
  console.log('Since we need direct DB access, let me try another approach...');
}

// Try using supabase-js to call a migration RPC if available
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    db: { schema: 'public' },
    auth: { persistSession: false }
  });

  console.log('🚀 Attempting to create discounts table...\n');

  // First check if table exists by trying to query it
  const { data: existingTable, error: checkError } = await supabase
    .from('discounts')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('✅ discounts table already exists!\n');
  } else {
    console.log('Table does not exist. Creating via SQL Editor is required.');
    console.log('\n📋 Copy this SQL and run it in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new\n');
    console.log('--- START SQL ---');
    console.log(`
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_percent NUMERIC(5,2),
  discount_amount_cents INTEGER,
  min_amount_cents INTEGER DEFAULT 0,
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  first_time_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_discount_value CHECK (
    (discount_type = 'percent' AND discount_percent IS NOT NULL AND discount_percent > 0 AND discount_percent <= 100) OR
    (discount_type = 'amount' AND discount_amount_cents IS NOT NULL AND discount_amount_cents > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(is_active) WHERE is_active = true;

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can validate codes" ON public.discounts;
CREATE POLICY "Public can validate codes" ON public.discounts FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
CREATE POLICY "Admins can manage discounts" ON public.discounts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

DROP POLICY IF EXISTS "Service role full access" ON public.discounts;
CREATE POLICY "Service role full access" ON public.discounts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_discounts ON public.discounts;
CREATE TRIGGER set_updated_at_discounts BEFORE UPDATE ON public.discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.redeem_discount(p_discount_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discounts SET times_redeemed = times_redeemed + 1, updated_at = NOW() WHERE id = p_discount_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert test discounts
INSERT INTO public.discounts (code, name, description, discount_type, discount_percent, is_active)
VALUES ('SAVE20', '20% Off', 'Get 20% off your order', 'percent', 20, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.discounts (code, name, description, discount_type, discount_amount_cents, min_amount_cents, first_time_only, is_active)
VALUES ('WELCOME10', '$10 Off First Order', '$10 off orders over $50', 'amount', 1000, 5000, true, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.discounts (code, name, description, discount_type, discount_percent, is_active)
VALUES ('JUICE25', '25% Off', 'Special 25% discount', 'percent', 25, true)
ON CONFLICT (code) DO NOTHING;
    `);
    console.log('--- END SQL ---\n');
    return;
  }

  // If table exists, insert test data
  console.log('Inserting test discount codes...\n');

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
      console.error(`❌ Error creating ${discount.code}:`, error.message);
    } else {
      console.log(`✅ Created discount: ${discount.code} (${discount.name})`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
