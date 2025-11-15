-- Create admin profile by temporarily disabling the referral trigger
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Disable the trigger that's causing issues
DROP TRIGGER IF EXISTS trigger_create_referral_entry ON public.profiles;

-- Step 2: Create the admin profile
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

-- Step 3: Manually create the referral entry (since trigger won't fire)
INSERT INTO public.referrals (referrer_id, referral_code)
SELECT id, referral_code
FROM public.profiles
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e'::uuid
ON CONFLICT (referral_code) DO NOTHING;

-- Step 4: Re-enable the trigger for future users
CREATE TRIGGER trigger_create_referral_entry
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_entry();

-- Step 5: Verify it worked
SELECT id, email, is_admin, referral_code, created_at
FROM public.profiles
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e';

-- Step 6: Verify referral entry was created
SELECT id, referrer_id, referral_code
FROM public.referrals
WHERE referrer_id = '13356806-31ef-4ea8-8c2a-9dff3189894e';
