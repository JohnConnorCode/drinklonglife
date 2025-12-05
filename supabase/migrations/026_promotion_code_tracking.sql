-- Promotion Code Redemption Tracking
-- Tracks all coupon/promotion code usage for analytics and reporting

-- Table: promotion_redemptions
-- Stores each time a promotion code is used at checkout
CREATE TABLE IF NOT EXISTS promotion_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe identifiers
  promotion_code_id TEXT,           -- Stripe promotion code ID (promo_xxx)
  promotion_code TEXT NOT NULL,     -- The actual code customers entered (SAVE20)
  coupon_id TEXT NOT NULL,          -- Underlying Stripe coupon ID

  -- Customer info (nullable for guest checkout)
  customer_id TEXT,                 -- Stripe customer ID
  customer_email TEXT,              -- Customer email
  user_id UUID REFERENCES auth.users(id), -- Supabase user if logged in

  -- Order details
  checkout_session_id TEXT NOT NULL UNIQUE, -- Stripe checkout session ID
  order_id UUID REFERENCES orders(id),       -- Our order ID once created

  -- Discount details
  discount_type TEXT NOT NULL,      -- 'percent_off' or 'amount_off'
  discount_value INTEGER NOT NULL,  -- Percentage (e.g., 20) or cents (e.g., 1000)
  discount_amount INTEGER NOT NULL, -- Actual discount in cents applied

  -- Order totals
  subtotal INTEGER NOT NULL,        -- Order subtotal before discount (cents)
  total INTEGER NOT NULL,           -- Final total after discount (cents)
  currency TEXT DEFAULT 'usd',

  -- Context
  is_first_order BOOLEAN DEFAULT false,  -- Was this customer's first order?
  order_type TEXT DEFAULT 'one-time',    -- 'one-time' or 'subscription'

  -- Timestamps
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_promotion_redemptions_code ON promotion_redemptions(promotion_code);
CREATE INDEX idx_promotion_redemptions_coupon ON promotion_redemptions(coupon_id);
CREATE INDEX idx_promotion_redemptions_customer ON promotion_redemptions(customer_email);
CREATE INDEX idx_promotion_redemptions_user ON promotion_redemptions(user_id);
CREATE INDEX idx_promotion_redemptions_date ON promotion_redemptions(redeemed_at);
CREATE INDEX idx_promotion_redemptions_session ON promotion_redemptions(checkout_session_id);

-- RLS policies
ALTER TABLE promotion_redemptions ENABLE ROW LEVEL SECURITY;

-- Admin can see all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON promotion_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can see their own redemptions
CREATE POLICY "Users can view own redemptions"
  ON promotion_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert (from webhook)
CREATE POLICY "Service role can insert redemptions"
  ON promotion_redemptions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- View for promotion code analytics
CREATE OR REPLACE VIEW promotion_analytics AS
SELECT
  promotion_code,
  coupon_id,
  COUNT(*) as total_redemptions,
  COUNT(DISTINCT customer_email) as unique_customers,
  SUM(discount_amount) as total_discount_given,
  SUM(total) as total_revenue,
  AVG(subtotal) as avg_order_value,
  MIN(redeemed_at) as first_used,
  MAX(redeemed_at) as last_used,
  COUNT(*) FILTER (WHERE is_first_order) as first_order_count,
  COUNT(*) FILTER (WHERE order_type = 'subscription') as subscription_count
FROM promotion_redemptions
GROUP BY promotion_code, coupon_id;

-- Grant access to analytics view
GRANT SELECT ON promotion_analytics TO authenticated;

COMMENT ON TABLE promotion_redemptions IS 'Tracks all promotion code usage for analytics';
COMMENT ON VIEW promotion_analytics IS 'Aggregated analytics per promotion code';
