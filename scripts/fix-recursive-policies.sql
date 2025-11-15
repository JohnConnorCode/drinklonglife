-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- The other policies are fine and don't cause recursion:
-- - "Users can view their own profile" - uses auth.uid() = id (no recursion)
-- - "Users can update their own profile" - uses auth.uid() = id (no recursion)
-- - "Admins can view all profiles" - uses is_user_admin() function (should be fine if function is simple)
-- - "Service role has full access" - uses true (no recursion)
-- - "profiles_insert_policy" - uses auth.uid() = id (no recursion)

-- Note: "Admins can view all profiles" uses is_user_admin() function
-- If that function also queries profiles, it needs to be fixed too
-- Check the function definition with:
-- SELECT pg_get_functiondef('is_user_admin'::regproc);
