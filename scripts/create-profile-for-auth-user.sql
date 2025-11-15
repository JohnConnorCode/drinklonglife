-- Create profile for existing auth user and set as admin
-- Run this in Supabase Dashboard > SQL Editor

-- Insert profile for the auth user
INSERT INTO public.profiles (
  id,
  email,
  is_admin,
  created_at,
  updated_at
)
VALUES (
  '13356806-31ef-4ea8-8c2a-9dff3189894e'::uuid,
  'jt.connor88@gmail.com',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    email = 'jt.connor88@gmail.com',
    updated_at = NOW();

-- Verify it worked
SELECT id, email, is_admin, created_at, updated_at
FROM public.profiles
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e';
