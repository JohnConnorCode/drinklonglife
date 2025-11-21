# Database Schema Update Required

## Issue

The auto-sync feature allows creating products without pre-existing Stripe IDs, but the database currently has a NOT NULL constraint on `stripe_price_id` in the `product_variants` table.

This prevents the auto-sync workflow from working properly when:
1. Admin creates a new product with variants (without Stripe IDs)
2. Auto-sync tries to create the product in database first
3. Database rejects it due to NULL stripe_price_id

## Solution

Make the `stripe_price_id` column nullable in the `product_variants` table.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Paste and run this SQL:

```sql
ALTER TABLE product_variants
ALTER COLUMN stripe_price_id DROP NOT NULL;
```

5. Verify the change:

```sql
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'product_variants'
  AND column_name = 'stripe_price_id';
```

Expected result: `is_nullable` should be `YES`

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push --file scripts/update-stripe-price-id-nullable.sql
```

## Impact

After this change:
- ✅ Admins can create products without Stripe IDs
- ✅ Auto-sync will work as designed:
  1. Create product/variants in DB (stripe_price_id = NULL)
  2. Create product/prices in Stripe
  3. Update DB with Stripe IDs
- ✅ Existing products/variants are unaffected
- ✅ Normal checkout flow continues to work

## Verification

After applying the schema change, test the auto-sync feature:

```bash
node scripts/test-schema-validation.mjs
```

Expected output: All 3 tests should pass.
