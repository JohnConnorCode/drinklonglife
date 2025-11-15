# Stripe Checkout Setup Guide

## 🚨 CRITICAL: Why Checkout Is Failing

Your checkout is failing because **Stripe API keys are not configured** in your environment. The error you're seeing ("failed to start checkout") is caused by missing environment variables.

## How It Works

Your e-commerce system uses a two-part configuration:

1. **Sanity CMS** - Controls which mode to use (`test` or `production`)
2. **Environment Variables** - Store the actual Stripe API keys

### The Flow:

```
User clicks "Proceed to Checkout"
  ↓
Code checks Sanity for Stripe mode (test or production)
  ↓
Based on mode, loads appropriate API keys from environment variables
  ↓
If keys are missing → Error: "Stripe secret key is not configured"
  ↓
Checkout fails
```

---

## 🔧 LOCAL DEVELOPMENT SETUP

### Step 1: Get Your Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

### Step 2: Configure `.env.local`

I've created a `.env.local` file for you. Replace the placeholder values:

```bash
# REQUIRED for checkout to work locally:
STRIPE_SECRET_KEY_TEST=sk_test_51xxxxxx  # Your actual test secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51xxxxxx  # Your actual test publishable key

# OR use these generic fallbacks:
STRIPE_SECRET_KEY=sk_test_51xxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxx
```

### Step 3: Also Set Your Other Credentials

The `.env.local` file also needs:
- Sanity project ID, dataset, and API tokens
- Supabase URL and keys

### Step 4: Restart Your Development Server

```bash
npm run dev
# or
yarn dev
```

### Step 5: Test Checkout

1. Add items to cart
2. Click checkout
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

---

## 🚀 PRODUCTION (VERCEL) SETUP

### Step 1: Get Your Stripe Production Keys

1. Go to https://dashboard.stripe.com/apikeys
2. **⚠️ IMPORTANT:** Make sure you're in **Production mode** (not test mode)
3. Copy your **Secret key** (starts with `sk_live_`)
4. Copy your **Publishable key** (starts with `pk_live_`)

### Step 2: Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (`drinklonglife`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY_PRODUCTION` | `sk_live_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION` | `pk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET_PRODUCTION` | `whsec_...` | Production |
| `STRIPE_SECRET_KEY_TEST` | `sk_test_...` | Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST` | `pk_test_...` | Preview, Development |

**OR** use generic keys (simpler approach):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | All |

### Step 3: Also Verify These Are Set

Make sure these are also configured in Vercel:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (should be your production URL)

### Step 4: Configure Stripe Mode in Sanity

1. Go to your Sanity Studio: https://your-project.sanity.studio
2. Find **Stripe Settings** document
3. Set mode to:
   - **Test Mode** - For testing with test cards
   - **Production Mode** - For live transactions (⚠️ REAL MONEY)

### Step 5: Redeploy (If Needed)

If you just added environment variables, Vercel should automatically redeploy. If not:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

Or use the Vercel dashboard to redeploy.

### Step 6: Test on Production

1. Visit your live site
2. Add items to cart
3. Click checkout
4. If in **Test Mode**: Use test card `4242 4242 4242 4242`
5. If in **Production Mode**: Use real card (⚠️ REAL CHARGES)

---

## 🔍 Troubleshooting

### Still seeing "Stripe secret key is not configured"?

**Check 1: Verify environment variables are set**

Local:
```bash
cat .env.local | grep STRIPE
```

Production:
- Go to Vercel → Settings → Environment Variables
- Verify keys are there and saved

**Check 2: Verify Sanity connection**

Your app needs to fetch Stripe mode from Sanity. If Sanity is down or credentials are wrong, it falls back to environment variables.

**Check 3: Check the browser console and server logs**

The improved error handling now shows the actual error. Look for:
- Browser console (F12 → Console tab)
- Vercel logs (if in production)

### Error: "No checkout URL received from server"

This means the Stripe session was created but didn't return a URL. Check:
1. Stripe API keys are valid (not expired or revoked)
2. Network connection is working
3. Stripe account is in good standing

### Error during customer creation

Check:
1. Supabase is connected and profile table exists
2. User is logged in or guest checkout is enabled

---

## 📋 Quick Checklist

### For Local Development:
- [ ] Created `.env.local` file
- [ ] Added `STRIPE_SECRET_KEY_TEST` or `STRIPE_SECRET_KEY`
- [ ] Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST` or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Added Sanity credentials
- [ ] Added Supabase credentials
- [ ] Restarted dev server
- [ ] Tested checkout with test card

### For Production (Vercel):
- [ ] Set `STRIPE_SECRET_KEY_PRODUCTION` or `STRIPE_SECRET_KEY` in Vercel
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION` in Vercel
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Verified all Sanity and Supabase vars are set
- [ ] Configured Stripe mode in Sanity CMS
- [ ] Redeployed application
- [ ] Tested checkout on live site

---

## 💡 Key Files

- **Environment config**: `.env.local` (local), Vercel dashboard (production)
- **Stripe integration**: `lib/stripe.ts`, `lib/stripe/config.ts`
- **Checkout API**: `app/api/checkout/route.ts`
- **Cart page**: `app/(website)/cart/page.tsx`
- **Sanity schema**: `sanity/schemas/stripeSettings.ts`

---

## ✅ After Setup

Once configured, your checkout will:

1. ✅ Show cart icon in header with item count
2. ✅ Allow users to access cart on mobile and desktop
3. ✅ Display detailed error messages if something goes wrong
4. ✅ Successfully redirect to Stripe Checkout
5. ✅ Process payments through Stripe
6. ✅ Handle both guest and authenticated checkout
7. ✅ Support coupons and discounts
8. ✅ Collect shipping addresses for physical products

---

## 🎯 Test Cards

### Successful Payment:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

### Declined Payment:
- **Card**: `4000 0000 0000 0002`

### Requires Authentication:
- **Card**: `4000 0025 0000 3155`

More test cards: https://stripe.com/docs/testing#cards

---

## 🔒 Security Notes

- **NEVER** commit `.env.local` to git (it's in `.gitignore`)
- **NEVER** expose secret keys in client-side code
- **ALWAYS** use test keys for development
- **ALWAYS** verify Stripe mode in Sanity before going live
- Production keys should only be in Vercel environment variables
