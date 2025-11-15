-- Create purchases table for tracking one-time Stripe payments
-- This table is used by the webhook handler to track successful one-time purchases

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  size_key TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_stripe_payment_intent_id_idx ON public.purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON public.purchases(status);
CREATE INDEX IF NOT EXISTS purchases_user_status_idx ON public.purchases(user_id, status);
CREATE INDEX IF NOT EXISTS purchases_user_size_idx ON public.purchases(user_id, size_key);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON public.purchases(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchases_updated_at_trigger
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchases_updated_at();

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do anything (for webhooks and admin operations)
CREATE POLICY "Service role has full access to purchases"
  ON public.purchases
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Comment on table
COMMENT ON TABLE public.purchases IS 'Tracks one-time Stripe purchases for users';
COMMENT ON COLUMN public.purchases.stripe_payment_intent_id IS 'Stripe payment intent ID - nullable for backwards compatibility';
COMMENT ON COLUMN public.purchases.size_key IS 'Product variant size key for the purchased item';
COMMENT ON COLUMN public.purchases.amount IS 'Purchase amount in cents';
COMMENT ON COLUMN public.purchases.status IS 'Payment status: pending, succeeded, failed, refunded';
