# Stripe Test Mode Toggle

This document explains how to toggle between Stripe test mode and production mode for testing purchases without real transactions.

## Overview

The application supports dynamic Stripe mode switching, allowing you to test checkout flows in production without processing real payments. The system automatically selects the correct Stripe keys based on the configured mode.

## How It Works

The Stripe mode is determined by checking two sources in this order:

1. **Sanity CMS** - Stripe Settings document (primary control)
2. **Environment Variable** - `STRIPE_MODE` (fallback)

When the mode is set to `test`, the application uses:
- Test publishable key (`pk_test_...`)
- Test secret key (`sk_test_...`)
- Test webhook secret

When the mode is set to `production`, the application uses:
- Live publishable key (`pk_live_...`)
- Live secret key (`sk_live_...`)
- Production webhook secret

## Method 1: Toggle via Sanity CMS (Recommended)

This is the easiest and safest method to toggle modes in production.

### Steps:

1. **Log in to Sanity Studio**:
   ```bash
   npm run sanity
   ```
   Or visit: `http://localhost:3333`

2. **Navigate to Stripe Settings**:
   - Look for "Stripe Settings" in the sidebar
   - Or create a new Stripe Settings document if none exists

3. **Change the Mode**:
   - Select either:
     - **Test Mode (sandbox)** - for testing with test cards
     - **Production Mode (live charges)** - for real transactions

4. **Save the document**

5. **Redeploy the application** (if needed):
   ```bash
   vercel deploy --prod
   ```

   The mode change takes effect immediately after redeployment.

## Method 2: Toggle via Vercel Environment Variable

This method provides direct control through Vercel's dashboard.

### Steps:

1. **Go to Vercel Dashboard**:
   Visit: https://vercel.com/dashboard

2. **Select your project** (DrinkLongLife)

3. **Navigate to Settings → Environment Variables**

4. **Find `STRIPE_MODE`** and click Edit

5. **Change the value**:
   - `test` - for test mode
   - `production` - for production mode

6. **Save and Redeploy**:
   Vercel will prompt you to redeploy for changes to take effect.

## Testing with Test Mode

When test mode is enabled, you can test checkout flows using Stripe's test cards:

### Test Card Numbers:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Test Card Details:
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3-digit number (e.g., `123`)
- **ZIP**: Any 5-digit number (e.g., `12345`)

## Verifying Current Mode

### Via Stripe Dashboard:

1. Go to https://dashboard.stripe.com
2. Check the toggle in the top-left corner:
   - **Test mode** - Orange badge
   - **Live mode** - Blue badge
3. Check recent payments/customers - they should appear in the corresponding mode

### Via Application Logs:

Check your server logs for Stripe API calls. Test mode keys start with `pk_test_` or `sk_test_`.

## Environment Variables Reference

All required environment variables are already configured in Vercel:

### Test Mode Keys:
```bash
STRIPE_SECRET_KEY_TEST=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

### Production Mode Keys:
```bash
STRIPE_SECRET_KEY_PRODUCTION=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION=pk_live_...
STRIPE_WEBHOOK_SECRET_PRODUCTION=whsec_...
```

### Mode Control:
```bash
STRIPE_MODE=production  # or 'test'
```

## Important Notes

1. **Always verify the mode** before testing - check Stripe dashboard or application logs
2. **Test mode does NOT process real charges** - no real money is involved
3. **Production mode processes REAL charges** - real credit cards will be charged
4. **Payment Links respect the mode** - the Stripe Payment Links will use the appropriate test or live mode
5. **Redeploy required** - Mode changes require a redeployment to take effect
6. **Webhooks** - Make sure your webhook endpoints are configured for both test and live modes in the Stripe Dashboard

## Troubleshooting

### Mode isn't changing:
- Verify the Sanity document was saved
- Check Vercel environment variables
- Redeploy the application
- Clear browser cache and hard refresh

### Still seeing live charges in test mode:
- Double-check the Stripe Dashboard mode indicator
- Verify environment variables are correct
- Check application logs for which keys are being used

### Webhooks not working:
- Ensure both test and production webhook secrets are configured
- Verify webhook endpoints in Stripe Dashboard for both modes
- Check webhook logs in Stripe Dashboard

## Implementation Details

The mode toggle is implemented in:
- **Stripe Config**: `lib/stripe/config.ts:9-23` - Mode detection logic
- **Sanity Schema**: `sanity/schemas/stripeSettings.ts` - CMS toggle UI
- **Sanity Query**: `lib/sanity.queries.ts:446-451` - Fetches mode setting

## Support

For issues or questions about Stripe mode toggling, check:
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard
- Sanity Studio: `npm run sanity`
