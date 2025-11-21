-- =====================================================
-- ORDER FULFILLMENT TRACKING
-- =====================================================
-- Migration: 018_add_order_fulfillment_tracking.sql
-- Date: 2025-11-21
-- Description: Add fulfillment status tracking and shipping info to orders

-- =====================================================
-- ADD FULFILLMENT COLUMNS TO ORDERS TABLE
-- =====================================================

-- Add fulfillment status (separate from payment status)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending' CHECK (
  fulfillment_status IN (
    'pending',      -- Order received, not yet processed
    'processing',   -- Order being prepared
    'shipped',      -- Order shipped to customer
    'delivered',    -- Order delivered
    'cancelled',    -- Order cancelled
    'refunded'      -- Order refunded
  )
);

-- Add shipping information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT;

-- Add tracking information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Add admin notes
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS orders_fulfillment_status_idx ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS orders_shipped_at_idx ON public.orders(shipped_at) WHERE shipped_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.orders.fulfillment_status IS 'Order fulfillment status: pending → processing → shipped → delivered';
COMMENT ON COLUMN public.orders.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN public.orders.tracking_url IS 'Full URL to track shipment';


-- =====================================================
-- ORDER STATUS HISTORY TABLE
-- =====================================================
-- Track all status changes for audit trail

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- Status Change
  from_status TEXT,
  to_status TEXT NOT NULL,

  -- Who made the change
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by_email TEXT, -- For webhook/system changes

  -- Additional info
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS order_status_history_created_at_idx ON public.order_status_history(created_at DESC);

-- RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view status history for their own orders
CREATE POLICY "Users can view their own order status history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.user_id = auth.uid()
        OR orders.customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- Admins can view all status history
CREATE POLICY "Admins can view all order status history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can insert status history
CREATE POLICY "Admins can create order status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to order status history"
  ON public.order_status_history FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE public.order_status_history IS 'Audit trail for all order status changes';


-- =====================================================
-- FUNCTIONS FOR ORDER MANAGEMENT
-- =====================================================

-- Function to update order fulfillment status with automatic history tracking
CREATE OR REPLACE FUNCTION public.update_order_fulfillment_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_admin_user_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_tracking_number TEXT DEFAULT NULL,
  p_tracking_url TEXT DEFAULT NULL,
  p_carrier TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_status TEXT;
  v_admin_email TEXT;
BEGIN
  -- Validate status
  IF p_new_status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Invalid fulfillment status: %', p_new_status;
  END IF;

  -- Get current status
  SELECT fulfillment_status INTO v_old_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Don't update if status is the same
  IF v_old_status = p_new_status THEN
    RETURN TRUE;
  END IF;

  -- Get admin email if admin user ID provided
  IF p_admin_user_id IS NOT NULL THEN
    SELECT email INTO v_admin_email
    FROM public.profiles
    WHERE id = p_admin_user_id;
  END IF;

  -- Update order status
  UPDATE public.orders
  SET
    fulfillment_status = p_new_status,
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    tracking_url = COALESCE(p_tracking_url, tracking_url),
    carrier = COALESCE(p_carrier, carrier),
    shipped_at = CASE WHEN p_new_status = 'shipped' AND shipped_at IS NULL THEN NOW() ELSE shipped_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Record status change in history
  INSERT INTO public.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by,
    changed_by_email,
    notes
  ) VALUES (
    p_order_id,
    v_old_status,
    p_new_status,
    p_admin_user_id,
    v_admin_email,
    p_notes
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get orders pending fulfillment
CREATE OR REPLACE FUNCTION public.get_pending_orders()
RETURNS TABLE (
  order_id UUID,
  customer_email TEXT,
  amount_total INTEGER,
  created_at TIMESTAMPTZ,
  fulfillment_status TEXT,
  days_pending INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.customer_email,
    o.amount_total,
    o.created_at,
    o.fulfillment_status,
    EXTRACT(DAY FROM NOW() - o.created_at)::INTEGER AS days_pending
  FROM public.orders o
  WHERE o.fulfillment_status IN ('pending', 'processing')
    AND o.status = 'completed'
  ORDER BY o.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get orders by fulfillment status
CREATE OR REPLACE FUNCTION public.get_orders_by_status(p_status TEXT)
RETURNS TABLE (
  order_id UUID,
  customer_email TEXT,
  amount_total INTEGER,
  created_at TIMESTAMPTZ,
  fulfillment_status TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.customer_email,
    o.amount_total,
    o.created_at,
    o.fulfillment_status,
    o.tracking_number,
    o.shipped_at
  FROM public.orders o
  WHERE o.fulfillment_status = p_status
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- TRIGGERS
-- =====================================================

-- Automatically record status history when fulfillment_status changes
CREATE OR REPLACE FUNCTION public.log_fulfillment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status THEN
    INSERT INTO public.order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by_email,
      notes
    ) VALUES (
      NEW.id,
      OLD.fulfillment_status,
      NEW.fulfillment_status,
      'system',
      'Automatic status change'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on orders table (only fire for non-function updates)
CREATE TRIGGER log_fulfillment_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status)
  EXECUTE FUNCTION public.log_fulfillment_status_change();


-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.update_order_fulfillment_status IS 'Update order fulfillment status with automatic history tracking';
COMMENT ON FUNCTION public.get_pending_orders IS 'Get all orders pending fulfillment (pending or processing status)';
COMMENT ON FUNCTION public.get_orders_by_status IS 'Get all orders by fulfillment status';
