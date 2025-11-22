-- Migration: Add Inventory Reservation System
-- Prevents race conditions where multiple users can buy the last item simultaneously
-- Created: 2025-11-22

-- Create inventory_reservations table to hold stock during checkout
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  checkout_session_id TEXT NOT NULL UNIQUE,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  released BOOLEAN DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  CONSTRAINT valid_expiry CHECK (expires_at > reserved_at)
);

-- Index for efficient lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_reservations_variant ON public.inventory_reservations(variant_id) WHERE NOT released;
CREATE INDEX IF NOT EXISTS idx_reservations_expires ON public.inventory_reservations(expires_at) WHERE NOT released;
CREATE INDEX IF NOT EXISTS idx_reservations_session ON public.inventory_reservations(checkout_session_id);

-- Enable RLS
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

-- RLS policies (read-only for authenticated users, modifications via functions only)
CREATE POLICY "Reservations readable by authenticated users"
  ON public.inventory_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to get available stock (actual stock - active reservations)
CREATE OR REPLACE FUNCTION public.get_available_stock(p_variant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actual_stock INTEGER;
  v_reserved_stock INTEGER;
BEGIN
  -- Get actual stock quantity
  SELECT stock_quantity INTO v_actual_stock
  FROM public.product_variants
  WHERE id = p_variant_id;

  -- If stock tracking disabled or NULL, return unlimited
  IF v_actual_stock IS NULL THEN
    RETURN 999999;
  END IF;

  -- Calculate total reserved (not yet released and not expired)
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_stock
  FROM public.inventory_reservations
  WHERE variant_id = p_variant_id
    AND NOT released
    AND expires_at > NOW();

  -- Return available stock
  RETURN GREATEST(v_actual_stock - v_reserved_stock, 0);
END;
$$;

-- Function to reserve inventory atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION public.reserve_inventory(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_session_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_stock INTEGER;
  v_actual_stock INTEGER;
  v_track_inventory BOOLEAN;
  v_reservation_id UUID;
BEGIN
  -- Check if variant exists and get stock info
  SELECT stock_quantity, track_inventory
  INTO v_actual_stock, v_track_inventory
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE; -- Lock the row to prevent concurrent modifications

  -- If variant not found
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Variant not found',
      'available_stock', 0
    );
  END IF;

  -- If inventory tracking disabled, allow reservation
  IF NOT v_track_inventory OR v_actual_stock IS NULL THEN
    INSERT INTO public.inventory_reservations (variant_id, quantity, checkout_session_id)
    VALUES (p_variant_id, p_quantity, p_session_id)
    RETURNING id INTO v_reservation_id;

    RETURN jsonb_build_object(
      'success', true,
      'reservation_id', v_reservation_id,
      'available_stock', 999999
    );
  END IF;

  -- Get available stock (actual - reserved)
  v_available_stock := public.get_available_stock(p_variant_id);

  -- Check if enough stock available
  IF v_available_stock < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient stock',
      'available_stock', v_available_stock,
      'requested', p_quantity
    );
  END IF;

  -- Create reservation
  INSERT INTO public.inventory_reservations (variant_id, quantity, checkout_session_id)
  VALUES (p_variant_id, p_quantity, p_session_id)
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'available_stock', v_available_stock - p_quantity
  );
END;
$$;

-- Function to release a reservation (when checkout cancelled or expired)
CREATE OR REPLACE FUNCTION public.release_reservation(p_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.inventory_reservations
  SET released = TRUE,
      released_at = NOW()
  WHERE checkout_session_id = p_session_id
    AND NOT released;

  RETURN FOUND;
END;
$$;

-- Function to clean up expired reservations (run via cron or periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleaned INTEGER;
BEGIN
  UPDATE public.inventory_reservations
  SET released = TRUE,
      released_at = NOW()
  WHERE NOT released
    AND expires_at < NOW();

  GET DIAGNOSTICS v_cleaned = ROW_COUNT;

  RETURN v_cleaned;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.inventory_reservations TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_stock TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reserve_inventory TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.release_reservation TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_reservations TO authenticated;

-- Add comment explaining the system
COMMENT ON TABLE public.inventory_reservations IS 'Holds inventory during checkout to prevent overselling via race conditions';
COMMENT ON FUNCTION public.reserve_inventory IS 'Atomically reserves inventory with row-level locking to prevent race conditions';
COMMENT ON FUNCTION public.get_available_stock IS 'Returns available stock (actual stock minus active reservations)';
