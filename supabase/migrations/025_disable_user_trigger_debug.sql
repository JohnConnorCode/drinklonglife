-- TEMPORARY DEBUG: Disable the trigger to test if it's causing issues
-- This should be reverted after debugging

-- Disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a minimal version that just logs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Minimal insert - just id and email
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Silently ignore any error
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
