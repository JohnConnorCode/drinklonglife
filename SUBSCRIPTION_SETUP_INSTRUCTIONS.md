# Subscription & Webhook Setup Instructions

This document outlines the steps needed to complete subscription support and webhook integration for the e-commerce platform.

## Status: 19/19 Tests Passing (2 Skipped - Subscription & Webhook Tests)

## Part 1: Database Migration (MANUAL STEP REQUIRED)

### Step 1.1: Run Database Migration

The migration file has been created at `supabase/migrations/009_add_billing_type_to_variants.sql`.

**To execute this migration:**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new)

2. Copy and paste the following SQL:

```sql
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
```

3. Click **RUN** to execute the migration

4. Verify success by running:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'product_variants'
AND column_name IN ('billing_type', 'recurring_interval', 'recurring_interval_count');
```

You should see 3 rows returned showing the new columns.

---

## Part 2: Create Subscription Products in Stripe (MANUAL STEP REQUIRED)

### Step 2.1: Create Subscription Products in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)

2. For each product (Green Bomb, Red Bomb, Yellow Bomb), create **monthly subscription variants**:

#### Green Bomb Monthly Subscription
- Click **+ Add product**
- Name: `Green Bomb - Monthly Subscription`
- Description: `Monthly subscription for Green Bomb juice`
- Pricing:
  - **Gallon**: Recurring, Monthly, $XX.XX (set your price)
  - **Half Gallon**: Recurring, Monthly, $XX.XX
  - **Shot**: Recurring, Monthly, $XX.XX

#### Red Bomb Monthly Subscription
- Name: `Red Bomb - Monthly Subscription`
- Description: `Monthly subscription for Red Bomb juice`
- Pricing: (same structure as Green Bomb)

#### Yellow Bomb Monthly Subscription
- Name: `Yellow Bomb - Monthly Subscription`
- Description: `Monthly subscription for Yellow Bomb juice`
- Pricing: (same structure as Yellow Bomb)

### Step 2.2: Document Price IDs

After creating the products, **copy all the price IDs** (they look like `price_xxxxxxxxxxxxx`) and save them. You'll need these for the sync script.

Create a file called `STRIPE_SUBSCRIPTION_PRICE_IDS.txt` with the format:

```
# Green Bomb Monthly
price_green_gallon_monthly=price_xxxxxxxxxxxxx
price_green_half_monthly=price_xxxxxxxxxxxxx
price_green_shot_monthly=price_xxxxxxxxxxxxx

# Red Bomb Monthly
price_red_gallon_monthly=price_xxxxxxxxxxxxx
price_red_half_monthly=price_xxxxxxxxxxxxx
price_red_shot_monthly=price_xxxxxxxxxxxxx

# Yellow Bomb Monthly
price_yellow_gallon_monthly=price_xxxxxxxxxxxxx
price_yellow_half_monthly=price_xxxxxxxxxxxxx
price_yellow_shot_monthly=price_xxxxxxxxxxxxx
```

---

## Part 3: Sync Subscription Products to Database

### Step 3.1: Run Subscription Sync Script

Once you've created the subscription products in Stripe and documented the price IDs, run:

```bash
node scripts/sync-subscription-products.mjs
```

This script will:
1. Fetch subscription products from Stripe API
2. Insert them into the `product_variants` table
3. Set `billing_type='recurring'`
4. Set `recurring_interval='month'` and `recurring_interval_count=1`

The script has NOT been created yet - it will be created in the next step.

---

## Part 4: Webhook Integration

### Step 4.1: Set Up Stripe CLI Webhook Forwarding

1. Install Stripe CLI if not already installed:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Start webhook forwarding to local dev server:
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret (starts with `whsec_`)

5. Add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxxxxxxxxxx
```

6. Restart dev server:
```bash
npm run dev
```

### Step 4.2: Test Webhook Handler

Test that webhooks are working:

```bash
stripe trigger checkout.session.completed
```

Then check your database to verify an order was created.

### Step 4.3: Verify RLS Policies

The webhook handler uses the service role key to bypass RLS. Verify this is working by checking that orders are being created with the correct user associations.

---

## Part 5: Update Frontend to Show Subscription Options

### Step 5.1: Update Pricing Page

Edit `app/(website)/pricing/page.tsx` to:
1. Show both one-time purchase AND subscription options
2. Display monthly pricing for subscriptions
3. Add toggle or tabs to switch between purchase types
4. Update "Add to Cart" buttons to handle subscription products

---

## Part 6: Implement Tests

### Step 6.1: Unskip and Implement Subscription Tests

Edit `tests/e2e/checkout/subscription-checkout.spec.ts`:

1. Remove the `.skip` marker
2. Implement tests for subscription checkout flow
3. Verify subscription created via webhook

### Step 6.2: Unskip and Implement Webhook Tests

Edit `tests/e2e/checkout/webhook-verification.spec.ts`:

1. Remove the `.skip` marker
2. Implement tests for order creation from webhook
3. Implement tests for subscription creation from webhook
4. Verify customer linking

---

## Part 7: Final Verification

### Step 7.1: Run Full Test Suite

```bash
npx playwright test tests/e2e/checkout/ --project=chromium
```

Expected result: **27+ tests passing** (all tests, including subscriptions and webhooks)

---

## Current Progress Checklist

- [x] Database migration file created (`009_add_billing_type_to_variants.sql`)
- [ ] **MANUAL: Run migration in Supabase Dashboard**
- [ ] **MANUAL: Create subscription products in Stripe Dashboard**
- [ ] **MANUAL: Document all subscription price IDs**
- [ ] Create and run subscription sync script
- [ ] Set up Stripe CLI webhook forwarding
- [ ] Update .env.local with webhook secret
- [ ] Verify webhook handler creates orders
- [ ] Verify RLS policies work correctly
- [ ] Update pricing page to show subscription options
- [ ] Implement subscription checkout tests
- [ ] Implement webhook verification tests
- [ ] Run full test suite → 100% passing

---

## Notes

- All subscription products should use `recurring` billing type with `month` interval
- Webhook handler at `app/api/stripe/webhook/route.ts` already exists and handles `checkout.session.completed` events
- Subscription table already exists from migration `006_subscriptions_table.sql`
- Purchases table already exists from migration `007_purchases_table.sql`
