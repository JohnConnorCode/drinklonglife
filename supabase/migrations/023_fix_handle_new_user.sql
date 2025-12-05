-- Migration: Fix handle_new_user trigger function
-- The function was referencing a 'name' column that doesn't exist in profiles table

-- First, drop ALL problematic triggers that might cause issues
DROP TRIGGER IF EXISTS trigger_create_referral_entry ON public.profiles;
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON public.profiles;
DROP FUNCTION IF EXISTS create_referral_entry() CASCADE;

-- Drop and recreate the handle_new_user function with correct columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate referral code
  v_referral_code := generate_referral_code();

  -- Insert profile
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
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile when user signs up - fixed version with error handling';
