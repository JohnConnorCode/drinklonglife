-- Make stripe_price_id nullable to support auto-sync feature
-- This allows creating products/variants without pre-existing Stripe IDs

ALTER TABLE product_variants
ALTER COLUMN stripe_price_id DROP NOT NULL;

-- Verify the change
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'product_variants'
  AND column_name = 'stripe_price_id';
