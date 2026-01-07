# Stripe & Sanity E-Commerce Setup - COMPLETE

## Setup Date
November 14, 2025

## What Was Accomplished

### 1. Sanity Schema Registration
- ✅ Registered `stripeSettings` schema in Sanity
- ✅ Schema now available in Sanity Studio

### 2. Stripe Test Products Created
All products created in **Test Mode**:

**Green Bomb** (prod_TQBwKRn0Y9ZQJO)
- Gallon: price_1STLYqCu8SiOGapKOM9yjxCL ($48.00)
- Half Gallon: price_1STLYrCu8SiOGapKupt9c8IG ($28.00)
- 2oz Shot: price_1STLYrCu8SiOGapKx9RMXCG5 ($6.00)

**Red Bomb** (prod_TQBwGjv8jzVcwu)
- Gallon: price_1STLYsCu8SiOGapK7Z0iLCh8 ($48.00)
- Half Gallon: price_1STLYsCu8SiOGapKa7MM8WXM ($28.00)
- 2oz Shot: price_1STLYsCu8SiOGapKqnGYhhKG ($6.00)

**Yellow Bomb** (prod_TQBwO0picCgej5)
- Gallon: price_1STLYtCu8SiOGapKRvX8LhDL ($48.00)
- Half Gallon: price_1STLYuCu8SiOGapK8Zv4O8D2 ($28.00)
- 2oz Shot: price_1STLYuCu8SiOGapKCBkBupAy ($6.00)

### 3. Sanity Documents Created

**stripeSettings** (singleton)
- ID: `stripeSettings`
- Mode: `test`
- Controls dynamic key switching between test/production

**stripeProduct Documents:**
- `stripe-product-green-bomb` with 3 variants
- `stripe-product-red-bomb` with 3 variants
- `stripe-product-yellow-bomb` with 3 variants

### 4. Coupon Codes Created

**WELCOME20**
- Type: Percentage Off (20%)
- Duration: Once
- Stripe ID: WELCOME20
- Sanity userDiscount: `user-discount-welcome20`

**REFER20**
- Type: Percentage Off (20%)
- Duration: Once
- Stripe ID: REFER20
- Sanity userDiscount: `user-discount-refer20`

## Current Status

### ✅ WORKING IN TEST MODE
- Stripe products and prices configured
- Sanity CMS fully configured
- Coupon validation functional
- Dynamic key switching ready
- Checkout API ready

### ⚠️ PENDING FOR PRODUCTION

1. **Create Production Stripe Products**
   - Run same script with production Stripe keys
   - Or manually create products in Stripe Dashboard (live mode)

2. **Configure Webhooks in Stripe Dashboard**
   - Test: Already configured
   - Production: Go to https://dashboard.stripe.com
   - Add endpoint: `https://drinklonglife.com/api/stripe/webhook`
   - Select events: checkout.session.completed, payment_intent.succeeded, customer.subscription.*, invoice.paid

3. **Switch Sanity stripeSettings**
   - Currently: `mode: "test"`
   - For production: Update to `mode: "production"`
   - Can be done through Sanity Studio or API

## How to Test (Test Mode)

```bash
# Start dev server
npm run dev

# In another terminal, start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test card numbers:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
```

Visit: http://localhost:3000/blends/green-bomb
Click "Reserve Now" and complete checkout

## How to Deploy to Production

```bash
# 1. Create production products (run script with prod keys or manual)
# 2. Update stripeSettings mode to "production" in Sanity
# 3. Configure webhooks in Stripe Dashboard
# 4. Git commit and push
git add .
git commit -m "Complete Stripe and Sanity e-commerce setup"
git push origin main

# 5. Vercel will auto-deploy
```

## Files Created/Modified

- `sanity/schemas/index.ts` - Added stripeSettings schema registration
- `scripts/setup-stripe-and-sanity.ts` - Automated setup script
- `STRIPE_SETUP_COMPLETE.md` - This documentation

## Support

- Stripe Dashboard: https://dashboard.stripe.com
- Sanity Studio: https://drinklonglife.sanity.studio
- Docs: https://stripe.com/docs

## Script for Future Use

To recreate setup or create production products:

```bash
# For test mode (already done)
npx tsx scripts/setup-stripe-and-sanity.ts

# For production mode (update script to use STRIPE_SECRET_KEY_PRODUCTION)
# Then run the same command
```
