# Database Migration Instructions

## Overview
You need to run two SQL scripts manually in your Supabase Dashboard to complete the product migration from Sanity to Supabase.

## Steps to Run Migrations

### 1. Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new
2. You should be logged into your Supabase account

### 2. Run Product Tables Migration

**File:** `supabase/migrations/005_ecommerce_products.sql`

1. Open the file: `supabase/migrations/005_ecommerce_products.sql`
2. Copy the ENTIRE contents of this file
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press Cmd/Ctrl + Enter
5. Wait for confirmation that the query completed successfully

**What this creates:**
- `products` table (replaces Sanity "blend" schema)
- `ingredients` table
- `product_variants` table (for Stripe price integration)
- `product_ingredients` table (many-to-many relationship)
- `farms` and `ingredient_farms` tables
- All necessary RLS policies
- Helper functions for slug generation

### 3. Run Admin User Setup

**File:** `scripts/create-admin-simple.sql`

1. Open the file: `scripts/create-admin-simple.sql`
2. Copy the ENTIRE contents of this file
3. Paste it into the Supabase SQL Editor (in a new query tab)
4. Click "Run" or press Cmd/Ctrl + Enter
5. Wait for confirmation

**What this does:**
- Creates admin user profile for jt.connor88@gmail.com
- Sets `is_admin = true` flag
- Generates referral code
- Creates referral entry
- Re-enables triggers

### 4. Verify Migration Success

Run this query in the SQL Editor to verify:

```sql
-- Check products table exists
SELECT COUNT(*) as product_count FROM public.products;

-- Check admin user exists
SELECT id, email, is_admin, referral_code
FROM public.profiles
WHERE email = 'jt.connor88@gmail.com';

-- Check all new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'ingredients', 'product_variants', 'product_ingredients', 'farms', 'ingredient_farms')
ORDER BY table_name;
```

Expected results:
- `product_count`: 0 (table exists but empty - ready for products to be added)
- Admin user row should show `is_admin: true`
- All 6 tables should be listed

## Next Steps After Migration

1. Run `npm run build` to verify TypeScript compilation
2. Test Stripe integration with new Supabase product system
3. Deploy to production with Vercel
4. Verify production deployment

## Troubleshooting

If you encounter errors:

1. **"relation already exists"**: Tables may already be created. Check if they exist with:
   ```sql
   SELECT * FROM public.products LIMIT 1;
   ```

2. **"permission denied"**: Make sure you're using the service role or owner account in Supabase Dashboard

3. **Trigger errors**: The admin setup script handles trigger creation/deletion automatically

## Important Notes

- These migrations are **idempotent** - they use `CREATE TABLE IF NOT EXISTS` and `DROP TRIGGER IF EXISTS`
- You can safely re-run them if something goes wrong
- The migrations do NOT delete any existing data
- Sanity data is preserved - this only creates new Supabase tables

## Files Reference

- Product migration: `/Users/johnconnor/Documents/GitHub/DrinkLongLife/supabase/migrations/005_ecommerce_products.sql`
- Admin setup: `/Users/johnconnor/Documents/GitHub/DrinkLongLife/scripts/create-admin-simple.sql`
