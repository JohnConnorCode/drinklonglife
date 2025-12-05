-- Migration: Fix all signup-related triggers
-- This drops problematic triggers that were causing "Database error creating new user"

-- Drop ALL triggers on profiles that might interfere with signup
DROP TRIGGER IF EXISTS trigger_create_referral_entry ON public.profiles;
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON public.profiles;

-- Drop the problematic function that tries to create referral entries automatically
DROP FUNCTION IF EXISTS create_referral_entry() CASCADE;

-- Recreate handle_new_user with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate referral code
  v_referral_code := generate_referral_code();

  -- Insert profile (without creating referral entry - that's done in app code now)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    referral_code
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    v_referral_code
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile when user signs up - simplified version without referral entry auto-creation';
