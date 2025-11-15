-- STEP 1: Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- STEP 2: Drop and recreate the function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_user_admin(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check user_metadata for is_admin flag
  -- This avoids querying profiles table and breaks the infinite recursion
  SELECT COALESCE((raw_user_meta_data->>'is_admin')::boolean, FALSE) INTO v_is_admin
  FROM auth.users
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

-- STEP 3: Recreate all the policies that were dropped by CASCADE

-- Profile policies
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_user_admin(auth.uid()));

-- Order policies (that were dropped by CASCADE)
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Admins can delete all orders"
ON orders FOR DELETE
TO authenticated
USING (is_user_admin(auth.uid()));
