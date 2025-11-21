-- Make stripe_price_id nullable to support auto-sync feature
-- This allows creating products/variants without pre-existing Stripe IDs
-- The auto-sync workflow will add Stripe IDs after creating them in Stripe

ALTER TABLE product_variants
ALTER COLUMN stripe_price_id DROP NOT NULL;

-- Verify the change
COMMENT ON COLUMN product_variants.stripe_price_id IS 'Stripe Price ID - nullable to support auto-sync workflow';
