-- =====================================================
-- COMPLETE ADMIN SETUP SCRIPT
-- =====================================================
-- This script does everything needed to set up admin access:
-- 1. Adds is_admin column to profiles table (if not exists)
-- 2. Creates helper functions for admin management
-- 3. Sets jt.connor88@gmail.com as admin
-- 4. Verifies the setup
-- =====================================================

-- Step 1: Add is_admin column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Step 2: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM public.profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create function to set user as admin (can only be called by service role or existing admins)
CREATE OR REPLACE FUNCTION public.set_user_admin(
  p_user_id UUID,
  p_is_admin BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is admin or service role
  IF NOT (auth.jwt()->>'role' = 'service_role' OR public.is_user_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Only admins can modify admin status';
  END IF;

  UPDATE public.profiles
  SET is_admin = p_is_admin,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Set jt.connor88@gmail.com as admin
UPDATE public.profiles
SET is_admin = true,
    updated_at = NOW()
WHERE email = 'jt.connor88@gmail.com';

-- Step 5: Verify the setup
DO $$
DECLARE
  v_admin_count INTEGER;
  v_user_record RECORD;
BEGIN
  -- Check if is_admin column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    RAISE NOTICE '✅ is_admin column exists';
  ELSE
    RAISE EXCEPTION '❌ is_admin column was not created';
  END IF;

  -- Count admin users
  SELECT COUNT(*) INTO v_admin_count
  FROM public.profiles
  WHERE is_admin = true;

  RAISE NOTICE '✅ Total admin users: %', v_admin_count;

  -- Check specific user
  SELECT id, email, is_admin, created_at INTO v_user_record
  FROM public.profiles
  WHERE email = 'jt.connor88@gmail.com';

  IF FOUND THEN
    IF v_user_record.is_admin THEN
      RAISE NOTICE '✅ User jt.connor88@gmail.com is now an admin';
      RAISE NOTICE '   User ID: %', v_user_record.id;
      RAISE NOTICE '   Created: %', v_user_record.created_at;
    ELSE
      RAISE WARNING '⚠️  User jt.connor88@gmail.com exists but is_admin is not true';
    END IF;
  ELSE
    RAISE WARNING '⚠️  User jt.connor88@gmail.com not found in profiles table';
    RAISE NOTICE '   Action: User needs to sign up first at /signup';
  END IF;
END $$;

-- Step 6: Display final verification query results
SELECT
  id,
  email,
  is_admin,
  created_at,
  updated_at
FROM public.profiles
WHERE email = 'jt.connor88@gmail.com';
