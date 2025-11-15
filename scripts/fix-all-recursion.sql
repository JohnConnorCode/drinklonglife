-- STEP 1: Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- STEP 2: Fix the is_user_admin function to use auth.users metadata instead of profiles table
-- This breaks the infinite recursion by not querying profiles
DROP FUNCTION IF EXISTS is_user_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check user_metadata for is_admin flag
  -- This avoids querying profiles table
  SELECT COALESCE((raw_user_meta_data->>'is_admin')::boolean, FALSE) INTO v_is_admin
  FROM auth.users
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

-- STEP 3: Recreate the admin policy using the fixed function
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_user_admin(auth.uid()));

-- Now the flow is:
-- 1. Policy checks is_user_admin(auth.uid())
-- 2. Function queries auth.users (NOT profiles)
-- 3. No recursion!
