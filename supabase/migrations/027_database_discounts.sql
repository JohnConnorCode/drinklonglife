-- =====================================================
-- DATABASE-ONLY DISCOUNTS
-- =====================================================
-- Migration: 027_database_discounts.sql
-- Date: 2025-12-05
-- Description: Store discount codes entirely in database (no Stripe sync)

-- Table: discounts
-- Stores discount/coupon definitions - NO Stripe dependency
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code (what user enters)
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,

  -- Discount value (one of these must be set)
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_percent NUMERIC(5,2),      -- e.g., 20.00 for 20% off
  discount_amount_cents INTEGER,       -- e.g., 1000 for $10 off

  -- Restrictions
  min_amount_cents INTEGER DEFAULT 0,  -- Minimum cart subtotal to use code
  max_redemptions INTEGER,             -- NULL = unlimited
  times_redeemed INTEGER DEFAULT 0,    -- Track how many times used
  first_time_only BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,               -- NULL = no start restriction
  expires_at TIMESTAMPTZ,              -- NULL = never expires

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation constraints
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

-- Anyone can validate a code (SELECT by code)
CREATE POLICY "Public can validate codes"
  ON public.discounts
  FOR SELECT
  USING (is_active = true);

-- Admins can manage discounts
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

-- Service role has full access
CREATE POLICY "Service role full access"
  ON public.discounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_discounts ON public.discounts;
CREATE TRIGGER set_updated_at_discounts
  BEFORE UPDATE ON public.discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to validate and get discount
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  p_code TEXT,
  p_subtotal_cents INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_id UUID,
  code TEXT,
  name TEXT,
  discount_type TEXT,
  discount_percent NUMERIC,
  discount_amount_cents INTEGER,
  min_amount_cents INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_discount RECORD;
BEGIN
  -- Look up code (case insensitive)
  SELECT d.* INTO v_discount
  FROM public.discounts d
  WHERE UPPER(d.code) = UPPER(p_code);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER, 'Invalid discount code'::TEXT;
    RETURN;
  END IF;

  -- Check if active
  IF NOT v_discount.is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER, 'This code is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Check start date
  IF v_discount.starts_at IS NOT NULL AND v_discount.starts_at > NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER, 'This code is not yet active'::TEXT;
    RETURN;
  END IF;

  -- Check expiration
  IF v_discount.expires_at IS NOT NULL AND v_discount.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER, 'This code has expired'::TEXT;
    RETURN;
  END IF;

  -- Check max redemptions
  IF v_discount.max_redemptions IS NOT NULL AND v_discount.times_redeemed >= v_discount.max_redemptions THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER, 'This code has reached its maximum uses'::TEXT;
    RETURN;
  END IF;

  -- Check minimum amount
  IF v_discount.min_amount_cents > 0 AND p_subtotal_cents < v_discount.min_amount_cents THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, v_discount.min_amount_cents,
      format('Minimum order of $%s required for this code', (v_discount.min_amount_cents / 100.0)::TEXT)::TEXT;
    RETURN;
  END IF;

  -- TODO: Check first_time_only if p_user_id provided
  -- Would need to query orders table to see if user has previous orders

  -- Valid!
  RETURN QUERY SELECT
    true,
    v_discount.id,
    v_discount.code,
    v_discount.name,
    v_discount.discount_type,
    v_discount.discount_percent,
    v_discount.discount_amount_cents,
    v_discount.min_amount_cents,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- =====================================================
-- SEED SOME EXAMPLE DISCOUNTS
-- =====================================================
-- Uncomment to add test discounts:

-- INSERT INTO public.discounts (code, name, discount_type, discount_percent, description)
-- VALUES ('SAVE20', '20% Off', 'percent', 20, 'Get 20% off your order');

-- INSERT INTO public.discounts (code, name, discount_type, discount_amount_cents, min_amount_cents, description)
-- VALUES ('10OFF', '$10 Off', 'amount', 1000, 5000, '$10 off orders over $50');

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'discounts'
  ) THEN
    RAISE NOTICE 'discounts table created successfully!';
  END IF;
END $$;
