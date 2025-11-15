-- Add billing type support to product_variants table for subscriptions
-- This enables the same product to have both one-time purchase and subscription variants

ALTER TABLE product_variants
ADD COLUMN billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring')),
ADD COLUMN recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year')),
ADD COLUMN recurring_interval_count INTEGER DEFAULT 1;

-- Add index for performance when filtering by billing type
CREATE INDEX idx_product_variants_billing_type ON product_variants(billing_type);

-- Add helpful comments explaining the new columns
COMMENT ON COLUMN product_variants.billing_type IS 'Payment type: one_time for single purchases, recurring for subscriptions';
COMMENT ON COLUMN product_variants.recurring_interval IS 'Subscription billing interval (only used when billing_type=recurring)';
COMMENT ON COLUMN product_variants.recurring_interval_count IS 'Number of intervals between billings (only used when billing_type=recurring)';
