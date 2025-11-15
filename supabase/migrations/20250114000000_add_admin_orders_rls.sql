-- Add RLS policies to allow admins to manage all orders
-- This fixes the critical issue where admin queries were returning empty results

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_user_admin(auth.uid()));

-- Allow admins to update all orders (for status changes)
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_user_admin(auth.uid()));

-- Allow admins to delete orders if needed
CREATE POLICY "Admins can delete all orders"
  ON public.orders FOR DELETE
  USING (public.is_user_admin(auth.uid()));

-- Note: INSERT policy is not needed for admins since orders are created via webhook with service role
