-- Create admin profile - simplified approach
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Disable BOTH triggers temporarily
DROP TRIGGER IF EXISTS trigger_create_referral_entry ON public.profiles;
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON public.profiles;

-- Step 2: Create the admin profile WITHOUT referral_code (to avoid trigger issues)
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
);

-- Step 3: Generate and add referral code to the profile
UPDATE public.profiles
SET referral_code = generate_referral_code()
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e'::uuid;

-- Step 4: Manually create the referral entry (simple INSERT, no ON CONFLICT)
INSERT INTO public.referrals (referrer_id, referral_code)
SELECT id, referral_code
FROM public.profiles
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e'::uuid;

-- Step 5: Re-enable both triggers for future users
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

CREATE TRIGGER trigger_create_referral_entry
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_entry();

-- Step 6: Verify it worked
SELECT id, email, is_admin, referral_code, created_at
FROM public.profiles
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e';

-- Step 7: Verify referral entry was created
SELECT id, referrer_id, referral_code
FROM public.referrals
WHERE referrer_id = '13356806-31ef-4ea8-8c2a-9dff3189894e';
