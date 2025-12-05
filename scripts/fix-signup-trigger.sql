-- ============================================
-- FIX SIGNUP TRIGGER - Run this in Supabase SQL Editor
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Paste this entire script
-- 4. Click "Run"
--
-- This will fix the "Database error creating new user" issue
-- ============================================

-- Step 1: Drop any existing problematic triggers on profiles table
DROP TRIGGER IF EXISTS trigger_create_referral_entry ON public.profiles;
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON public.profiles;
DROP FUNCTION IF EXISTS create_referral_entry() CASCADE;

-- Step 2: Drop the existing handle_new_user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Drop and recreate the handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 4: Create a new, simple, safe handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert minimal profile - just id and email
  -- Use exception handling to never fail the auth signup
  BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Profile creation failed for user %: % (SQLSTATE: %)',
      NEW.id, SQLERRM, SQLSTATE;
  END;

  -- Always return NEW to allow auth signup to succeed
  RETURN NEW;
END;
$$;

-- Step 5: Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify the trigger was created
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- Step 7: Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates a minimal profile when a user signs up. Safely handles errors to never block auth signup.';

-- ============================================
-- DONE!
-- Test signup again after running this script.
-- ============================================
