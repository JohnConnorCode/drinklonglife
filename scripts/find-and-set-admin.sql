-- Find existing auth users and set one as admin
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: List all auth users
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Step 2: Check if any profiles exist
SELECT
  id,
  email,
  is_admin,
  created_at
FROM public.profiles;

-- Step 3: If you see an auth user above, replace USER_ID_HERE with the actual ID
-- Then uncomment and run these lines:

/*
-- Create profile for the auth user and set as admin
INSERT INTO public.profiles (
  id,
  email,
  is_admin,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'jt.connor88@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    updated_at = NOW();

-- Verify
SELECT id, email, is_admin, created_at
FROM public.profiles
WHERE email = 'jt.connor88@gmail.com';
*/
