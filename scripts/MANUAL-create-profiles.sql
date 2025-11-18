-- =====================================================
-- CREATE PROFILES FOR AUTH USERS
-- =====================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql
--
-- This will create profile records for auth users that don't have them yet.

-- First, let's see what we're missing
SELECT
  au.id,
  au.email,
  au.created_at,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Now create the missing profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as full_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the profiles were created
SELECT
  id,
  email,
  full_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
