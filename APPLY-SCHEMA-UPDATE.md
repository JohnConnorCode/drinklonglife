# Database Schema Update - IMMEDIATE ACTION REQUIRED

## What needs to be done

Run this single SQL command in your Supabase dashboard to enable the auto-sync feature:

```sql
ALTER TABLE product_variants ALTER COLUMN stripe_price_id DROP NOT NULL;
```

## How to apply (takes 30 seconds)

1. Go to: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new
2. Paste the SQL above
3. Click "Run" (bottom right)
4. Done!

## Why this is needed

The auto-sync feature you implemented allows creating products WITHOUT pre-existing Stripe IDs. The workflow is:

1. Admin creates product in UI (no Stripe IDs yet)
2. Product saved to database
3. Auto-sync creates Stripe product/prices
4. Database updated with Stripe IDs

Currently, the database rejects step 2 because `stripe_price_id` has a NOT NULL constraint. This update removes that constraint.

## Impact

After this change:
- ✅ Auto-sync will work for new products
- ✅ Admins can create products via UI without Stripe IDs
- ✅ Existing products unchanged
- ✅ No downtime required

## Verification

After running the SQL, verify it worked:

```bash
node scripts/test-schema-validation.mjs
```

Expected output: All 3 tests should pass.

---

**This is a one-time schema update. It only needs to be run once.**
