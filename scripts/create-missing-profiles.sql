-- Create profiles for auth users that don't have them yet

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

-- Show the created profiles
SELECT id, email, full_name, created_at
FROM public.profiles
ORDER BY created_at DESC;
