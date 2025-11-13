-- =====================================================
-- ENHANCED PROFILES AND USER ACCOUNT MANAGEMENT
-- =====================================================
-- Migration: 002_enhanced_profiles.sql
-- Date: 2025-11-13
-- Description: Add fields for subscription status, partnership tiers, and user discounts

-- =====================================================
-- UPDATE PROFILES TABLE
-- =====================================================

-- Add new columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('active', 'canceled', 'trialing', 'past_due', 'incomplete', 'none')),
ADD COLUMN IF NOT EXISTS current_plan TEXT,
ADD COLUMN IF NOT EXISTS partnership_tier TEXT DEFAULT 'none' CHECK (partnership_tier IN ('none', 'affiliate', 'partner', 'vip'));

-- Create index for faster lookups by subscription status
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_partnership_tier_idx ON public.profiles(partnership_tier);

-- =====================================================
-- USER DISCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discount_code TEXT NOT NULL,
  source TEXT, -- e.g., "referral", "partner_x", "campaign_y", "sanity_perk"
  stripe_coupon_id TEXT,
  sanity_perk_id TEXT, -- Reference to Sanity perk document
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate active discounts for same code per user
  UNIQUE(user_id, discount_code)
);

-- Indexes for user_discounts
CREATE INDEX IF NOT EXISTS user_discounts_user_id_idx ON public.user_discounts(user_id);
CREATE INDEX IF NOT EXISTS user_discounts_active_idx ON public.user_discounts(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS user_discounts_stripe_coupon_idx ON public.user_discounts(stripe_coupon_id);

-- Enable Row Level Security on user_discounts
ALTER TABLE public.user_discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_discounts
CREATE POLICY "Users can view their own discounts"
  ON public.user_discounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to user_discounts"
  ON public.user_discounts
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TRIGGERS FOR user_discounts
-- =====================================================

-- Trigger for updated_at on user_discounts
DROP TRIGGER IF EXISTS set_updated_at_user_discounts ON public.user_discounts;
CREATE TRIGGER set_updated_at_user_discounts
  BEFORE UPDATE ON public.user_discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to sync user profile from Stripe webhook data
CREATE OR REPLACE FUNCTION public.sync_profile_from_stripe(
  p_user_id UUID,
  p_subscription_status TEXT,
  p_current_plan TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    subscription_status = p_subscription_status,
    current_plan = COALESCE(p_current_plan, current_plan),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active discounts
CREATE OR REPLACE FUNCTION public.get_active_discounts(p_user_id UUID)
RETURNS TABLE (
  discount_code TEXT,
  source TEXT,
  stripe_coupon_id TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ud.discount_code,
    ud.source,
    ud.stripe_coupon_id,
    ud.expires_at
  FROM public.user_discounts ud
  WHERE ud.user_id = p_user_id
    AND ud.active = TRUE
    AND (ud.expires_at IS NULL OR ud.expires_at > NOW())
  ORDER BY ud.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply discount to user
CREATE OR REPLACE FUNCTION public.apply_discount_to_user(
  p_user_id UUID,
  p_discount_code TEXT,
  p_source TEXT,
  p_stripe_coupon_id TEXT DEFAULT NULL,
  p_sanity_perk_id TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  INSERT INTO public.user_discounts (
    user_id,
    discount_code,
    source,
    stripe_coupon_id,
    sanity_perk_id,
    expires_at
  )
  VALUES (
    p_user_id,
    p_discount_code,
    p_source,
    p_stripe_coupon_id,
    p_sanity_perk_id,
    p_expires_at
  )
  ON CONFLICT (user_id, discount_code)
  DO UPDATE SET
    active = TRUE,
    updated_at = NOW()
  RETURNING id INTO v_discount_id;

  RETURN v_discount_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE handle_new_user FUNCTION
-- =====================================================

-- Drop existing function and recreate with full_name support
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  -- Check if columns were added
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name IN ('full_name', 'subscription_status', 'current_plan', 'partnership_tier')
  ) THEN
    RAISE NOTICE 'Enhanced profiles columns added successfully!';
  END IF;

  -- Check if user_discounts table exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_discounts'
  ) THEN
    RAISE NOTICE 'user_discounts table created successfully!';
  END IF;
END $$;
