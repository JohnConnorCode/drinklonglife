-- =====================================================
-- INVENTORY MANAGEMENT SYSTEM
-- =====================================================
-- Migration: 017_add_inventory_management.sql
-- Date: 2025-11-21
-- Description: Add inventory tracking to prevent overselling

-- =====================================================
-- ADD INVENTORY COLUMNS TO PRODUCT_VARIANTS
-- =====================================================

-- Add stock quantity tracking
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Add check constraint to ensure stock_quantity is non-negative
ALTER TABLE public.product_variants
ADD CONSTRAINT stock_quantity_non_negative CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

-- Add check constraint to ensure low_stock_threshold is positive
ALTER TABLE public.product_variants
ADD CONSTRAINT low_stock_threshold_positive CHECK (low_stock_threshold > 0);

-- Add index for inventory queries
CREATE INDEX IF NOT EXISTS product_variants_stock_quantity_idx
ON public.product_variants(stock_quantity)
WHERE track_inventory = TRUE;

-- Add index for low stock alerts
CREATE INDEX IF NOT EXISTS product_variants_low_stock_idx
ON public.product_variants(stock_quantity, low_stock_threshold)
WHERE track_inventory = TRUE AND stock_quantity <= low_stock_threshold;

COMMENT ON COLUMN public.product_variants.stock_quantity IS 'Current inventory level. NULL = unlimited stock (no tracking)';
COMMENT ON COLUMN public.product_variants.track_inventory IS 'Enable inventory tracking for this variant';
COMMENT ON COLUMN public.product_variants.low_stock_threshold IS 'Alert threshold for low stock warnings';


-- =====================================================
-- INVENTORY_TRANSACTIONS TABLE
-- =====================================================
-- Track all inventory changes for audit trail

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,

  -- Transaction Details
  type TEXT NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL, -- Negative for sales, positive for restocks
  previous_quantity INTEGER,
  new_quantity INTEGER,

  -- Related Order Info (for sales and returns)
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  stripe_session_id TEXT,

  -- Admin Info (for restocks and adjustments)
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for inventory audit queries
CREATE INDEX IF NOT EXISTS inventory_transactions_variant_id_idx
ON public.inventory_transactions(variant_id);

CREATE INDEX IF NOT EXISTS inventory_transactions_type_idx
ON public.inventory_transactions(type);

CREATE INDEX IF NOT EXISTS inventory_transactions_order_id_idx
ON public.inventory_transactions(order_id);

CREATE INDEX IF NOT EXISTS inventory_transactions_created_at_idx
ON public.inventory_transactions(created_at DESC);

-- RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all inventory transactions
CREATE POLICY "Admins can view inventory transactions"
  ON public.inventory_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can insert inventory transactions
CREATE POLICY "Admins can create inventory transactions"
  ON public.inventory_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Service role has full access for webhook processing
CREATE POLICY "Service role has full access to inventory transactions"
  ON public.inventory_transactions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE public.inventory_transactions IS 'Audit trail for all inventory changes';
COMMENT ON COLUMN public.inventory_transactions.quantity_change IS 'Negative for sales/adjustments down, positive for restocks/returns';


-- =====================================================
-- INVENTORY MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to check if variant has sufficient stock
CREATE OR REPLACE FUNCTION public.check_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_track_inventory BOOLEAN;
  v_stock_quantity INTEGER;
BEGIN
  -- Get variant inventory settings
  SELECT track_inventory, stock_quantity
  INTO v_track_inventory, v_stock_quantity
  FROM public.product_variants
  WHERE id = p_variant_id;

  -- If variant not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If inventory tracking is disabled, always return true
  IF v_track_inventory = FALSE THEN
    RETURN TRUE;
  END IF;

  -- If stock_quantity is NULL (unlimited), return true
  IF v_stock_quantity IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if sufficient stock available
  RETURN v_stock_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to decrease inventory (for sales)
CREATE OR REPLACE FUNCTION public.decrease_inventory(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_track_inventory BOOLEAN;
  v_previous_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Get current inventory settings
  SELECT track_inventory, stock_quantity
  INTO v_track_inventory, v_previous_quantity
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE; -- Lock row to prevent race conditions

  -- If variant not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If inventory tracking is disabled, return true (no-op)
  IF v_track_inventory = FALSE THEN
    RETURN TRUE;
  END IF;

  -- If stock_quantity is NULL (unlimited), return true (no-op)
  IF v_previous_quantity IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if sufficient stock
  IF v_previous_quantity < p_quantity THEN
    RETURN FALSE;
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_previous_quantity - p_quantity;

  -- Update variant stock
  UPDATE public.product_variants
  SET stock_quantity = v_new_quantity
  WHERE id = p_variant_id;

  -- Record transaction
  INSERT INTO public.inventory_transactions (
    variant_id,
    type,
    quantity_change,
    previous_quantity,
    new_quantity,
    order_id,
    stripe_session_id
  ) VALUES (
    p_variant_id,
    'sale',
    -p_quantity,
    v_previous_quantity,
    v_new_quantity,
    p_order_id,
    p_stripe_session_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to increase inventory (for restocks or returns)
CREATE OR REPLACE FUNCTION public.increase_inventory(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_type TEXT DEFAULT 'restock',
  p_admin_user_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_track_inventory BOOLEAN;
  v_previous_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Validate type
  IF p_type NOT IN ('restock', 'adjustment', 'return') THEN
    RAISE EXCEPTION 'Invalid inventory transaction type: %', p_type;
  END IF;

  -- Get current inventory settings
  SELECT track_inventory, stock_quantity
  INTO v_track_inventory, v_previous_quantity
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE; -- Lock row to prevent race conditions

  -- If variant not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If inventory tracking is disabled, return true (no-op)
  IF v_track_inventory = FALSE THEN
    RETURN TRUE;
  END IF;

  -- If stock_quantity is NULL, initialize to quantity
  IF v_previous_quantity IS NULL THEN
    v_previous_quantity := 0;
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_previous_quantity + p_quantity;

  -- Update variant stock
  UPDATE public.product_variants
  SET stock_quantity = v_new_quantity
  WHERE id = p_variant_id;

  -- Record transaction
  INSERT INTO public.inventory_transactions (
    variant_id,
    type,
    quantity_change,
    previous_quantity,
    new_quantity,
    order_id,
    admin_user_id,
    notes
  ) VALUES (
    p_variant_id,
    p_type,
    p_quantity,
    v_previous_quantity,
    v_new_quantity,
    p_order_id,
    p_admin_user_id,
    p_notes
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get low stock variants
CREATE OR REPLACE FUNCTION public.get_low_stock_variants()
RETURNS TABLE (
  variant_id UUID,
  product_name TEXT,
  variant_label TEXT,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS variant_id,
    p.name AS product_name,
    pv.label AS variant_label,
    pv.stock_quantity,
    pv.low_stock_threshold
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE pv.track_inventory = TRUE
    AND pv.stock_quantity IS NOT NULL
    AND pv.stock_quantity <= pv.low_stock_threshold
    AND pv.is_active = TRUE
  ORDER BY pv.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get out of stock variants
CREATE OR REPLACE FUNCTION public.get_out_of_stock_variants()
RETURNS TABLE (
  variant_id UUID,
  product_name TEXT,
  variant_label TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS variant_id,
    p.name AS product_name,
    pv.label AS variant_label
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE pv.track_inventory = TRUE
    AND pv.stock_quantity IS NOT NULL
    AND pv.stock_quantity <= 0
    AND pv.is_active = TRUE
  ORDER BY p.name, pv.label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.check_variant_stock IS 'Check if variant has sufficient stock for purchase';
COMMENT ON FUNCTION public.decrease_inventory IS 'Decrease inventory after successful sale (call from webhook)';
COMMENT ON FUNCTION public.increase_inventory IS 'Increase inventory for restocks, returns, or adjustments';
COMMENT ON FUNCTION public.get_low_stock_variants IS 'Get all variants below their low stock threshold';
COMMENT ON FUNCTION public.get_out_of_stock_variants IS 'Get all variants with zero or negative stock';
