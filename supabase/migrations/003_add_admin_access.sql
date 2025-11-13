-- =====================================================
-- ADD ADMIN ACCESS CONTROL
-- =====================================================
-- Migration: 003_add_admin_access.sql
-- Date: 2025-11-13
-- Description: Add is_admin column for admin console access

-- Add is_admin column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM public.profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user as admin (can only be called by existing admins or service role)
CREATE OR REPLACE FUNCTION public.set_user_admin(
  p_user_id UUID,
  p_is_admin BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is admin or service role
  IF NOT (auth.jwt()->>'role' = 'service_role' OR public.is_user_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Only admins can modify admin status';
  END IF;

  UPDATE public.profiles
  SET is_admin = p_is_admin,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy for admin-only operations
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_user_admin(auth.uid()));

-- Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    RAISE NOTICE 'is_admin column added successfully!';
  END IF;
END $$;
