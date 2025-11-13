-- Migration: Referral System and Profile Completion Tracking
-- Created: 2025-11-13
-- Description: Adds referral system tables and profile completion fields

-- =====================================================
-- 1. CREATE REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The user who owns this referral code
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Unique referral code for this user
  referral_code TEXT UNIQUE NOT NULL,

  -- The user who was referred (nullable until someone signs up)
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Tracking
  completed_purchase BOOLEAN DEFAULT FALSE, -- True when referred user makes first purchase
  reward_issued BOOLEAN DEFAULT FALSE, -- True when referrer gets their reward

  -- Reward details
  reward_type TEXT, -- e.g., 'discount_code', 'tier_upgrade', 'credit'
  reward_value TEXT, -- e.g., 'SAVE20', 'affiliate', '20.00'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ, -- When the referred user made first purchase

  -- Indexes
  CONSTRAINT valid_reward_type CHECK (reward_type IN ('discount_code', 'tier_upgrade', 'credit', NULL))
);

-- Index for finding referrals by code (most common lookup)
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- Index for finding a user's referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- Index for checking if a user was referred
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON public.referrals(referred_user_id);

-- =====================================================
-- 2. ADD PROFILE COMPLETION FIELDS
-- =====================================================

-- Add referral code to profiles (each user gets their own referral code)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add profile completion tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Add optional profile fields for completion tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Add referred_by field to track who referred this user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index for finding users referred by someone
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (referrer_id = auth.uid());

-- Users can insert their own referrals (via trigger or app logic)
CREATE POLICY "Users can create their own referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON public.referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Service role can do everything (for webhooks, background jobs)
-- (Service role bypasses RLS, so no need for explicit policy)

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code: 2 letters + 6 numbers (e.g., "AB123456")
    code :=
      CHR(65 + floor(random() * 26)::int) ||
      CHR(65 + floor(random() * 26)::int) ||
      LPAD(floor(random() * 1000000)::text, 6, '0');

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO code_exists;

    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 7; -- Total number of optional fields
  completed_fields INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_id;

  -- Count completed fields
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.shipping_address IS NOT NULL THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.preferences IS NOT NULL THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.stripe_customer_id IS NOT NULL THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.subscription_status IS NOT NULL AND profile_record.subscription_status != 'none' THEN
    completed_fields := completed_fields + 1;
  END IF;

  IF profile_record.partnership_tier IS NOT NULL AND profile_record.partnership_tier != 'none' THEN
    completed_fields := completed_fields + 1;
  END IF;

  RETURN (completed_fields * 100) / total_fields;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if not already set
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Trigger to create referral entry when user signs up
CREATE OR REPLACE FUNCTION create_referral_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a referral entry for this user
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (NEW.id, NEW.referral_code)
  ON CONFLICT (referral_code) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_referral_entry
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_entry();

-- Trigger to update completion percentage on profile update
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- =====================================================
-- 6. SEED REFERRAL CODES FOR EXISTING USERS
-- =====================================================

-- Generate referral codes for users who don't have them yet
UPDATE public.profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Calculate completion percentage for all existing users
UPDATE public.profiles
SET completion_percentage = calculate_profile_completion(id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables exist
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals')),
    'Referrals table was not created';

  RAISE NOTICE 'Migration 004 completed successfully';
  RAISE NOTICE '✓ Referrals table created';
  RAISE NOTICE '✓ Profile completion fields added';
  RAISE NOTICE '✓ RLS policies configured';
  RAISE NOTICE '✓ Helper functions created';
  RAISE NOTICE '✓ Triggers configured';
  RAISE NOTICE '✓ Existing users updated';
END $$;
