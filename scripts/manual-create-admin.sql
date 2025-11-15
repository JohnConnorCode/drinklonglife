-- Manual Admin User Creation
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Check if there are any auth users
DO $$
DECLARE
  v_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_user_count
  FROM auth.users;

  RAISE NOTICE 'Total auth users: %', v_user_count;
END $$;

-- Step 2: Check what columns exist in profiles table
DO $$
DECLARE
  v_columns TEXT;
BEGIN
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'profiles';

  RAISE NOTICE 'Profiles table columns: %', v_columns;
END $$;

-- Step 3: Manually create a profile for admin user
INSERT INTO public.profiles (
  id,
  email,
  is_admin,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'jt.connor88@gmail.com',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true,
    updated_at = NOW();

-- Step 4: Verify the profile was created
SELECT id, email, is_admin, created_at
FROM public.profiles
WHERE email = 'jt.connor88@gmail.com';
