#!/usr/bin/env node
/**
 * Run SQL migration using Supabase PostgREST RPC
 * This works around the need for direct DB access
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('🚀 Creating discounts table and test data...\n');

  // First, let's try to create the table via a series of individual API calls
  // that work through supabase-js

  // Check if we can query information_schema
  const { data: tables, error: tablesError } = await supabase
    .rpc('exec_sql', {
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discounts'"
    });

  if (tablesError) {
    console.log('RPC exec_sql not available, trying alternative approach...\n');

    // Try direct table query
    const { data, error } = await supabase
      .from('discounts')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('❌ Table does not exist.\n');
      console.log('Creating table via WebFetch to Supabase SQL Editor API...\n');

      // Use the Supabase Management API
      const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

      // We need to use the Supabase access token for management API
      // Since we don't have it, let's output the SQL and provide instructions

      console.log('⚠️  Cannot create table via API without Supabase Management Token.\n');
      console.log('Please run this SQL in the Supabase Dashboard SQL Editor:\n');
      console.log(`https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);

      console.log('='.repeat(60));
      console.log(`
-- Create discounts table
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

-- RLS Policies
DROP POLICY IF EXISTS "Public can validate codes" ON public.discounts;
CREATE POLICY "Public can validate codes" ON public.discounts FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
CREATE POLICY "Admins can manage discounts" ON public.discounts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

DROP POLICY IF EXISTS "Service role full access" ON public.discounts;
CREATE POLICY "Service role full access" ON public.discounts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger (uses existing handle_updated_at function)
DROP TRIGGER IF EXISTS set_updated_at_discounts ON public.discounts;
CREATE TRIGGER set_updated_at_discounts BEFORE UPDATE ON public.discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment redemption count
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
      console.log('='.repeat(60));

      return;
    } else if (!error) {
      console.log('✅ Table already exists!\n');
    } else {
      console.error('Unexpected error:', error);
      return;
    }
  }

  // If we got here, table exists - insert test data
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
      console.log(`✅ Created/updated: ${discount.code} (${discount.name})`);
    }
  }

  // List all discounts
  console.log('\n📋 All discounts in database:');
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
      value: d.discount_percent ? `${d.discount_percent}%` : `$${d.discount_amount_cents/100}`,
      active: d.is_active,
      redeemed: d.times_redeemed
    })));
  }

  console.log('\n✅ Done!');
}

runMigration().catch(console.error);
