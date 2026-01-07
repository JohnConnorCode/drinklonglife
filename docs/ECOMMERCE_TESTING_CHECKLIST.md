# E-Commerce Testing Checklist

Complete end-to-end testing guide for the Drink Long Life e-commerce system.

## Pre-Testing Setup

Before testing, ensure:
- [ ] Stripe test keys are configured in `.env.local`
- [ ] Sanity CMS is set up and accessible
- [ ] Dev server is running: `npm run dev`
- [ ] Stripe CLI is monitoring webhooks (optional but recommended)

## Phase 1: Admin Setup (Sanity Workflow)

### Creating a Test Stripe Product

- [ ] Log in to Stripe Dashboard (test mode)
- [ ] Navigate to Products → Create Product
- [ ] Enter product name: "Test Blend - Yellow Bomb"
- [ ] **IMPORTANT**: Copy the Product ID (starts with `prod_`)
- [ ] Add pricing variants:
  - [ ] Size: "1-Gallon Jug" → Price: $25.00 → Copy Price ID (price_...)
  - [ ] Size: "½-Gallon Jug" → Price: $15.00 → Copy Price ID (price_...)
  - [ ] Size: "Shot" → Price: $5.00 → Copy Price ID (price_...)
- [ ] Make product Active (toggle on)

### Creating StripeProduct in Sanity

- [ ] Log in to Sanity Studio
- [ ] Go to **Stripe Products** section
- [ ] Click **+ New Stripe Product**
- [ ] Fill in:
  - [ ] Title: "Test Blend - Yellow Bomb"
  - [ ] Stripe Product ID: (paste `prod_` ID from Stripe)
  - [ ] Add first variant:
    - [ ] Size Key: "jug-1-gallon"
    - [ ] Label: "1-Gallon Jug"
    - [ ] Stripe Price ID: (paste `price_` ID from Stripe)
    - [ ] Is Default: ON (toggle)
    - [ ] UI Order: 1
  - [ ] Add second variant:
    - [ ] Size Key: "jug-half-gallon"
    - [ ] Label: "½-Gallon Jug"
    - [ ] Stripe Price ID: (paste `price_` ID)
    - [ ] Is Default: OFF
    - [ ] UI Order: 2
  - [ ] Add third variant:
    - [ ] Size Key: "shot"
    - [ ] Label: "Shot"
    - [ ] Stripe Price ID: (paste `price_` ID)
    - [ ] Is Default: OFF
    - [ ] UI Order: 3
- [ ] Click **Publish**

### Creating Blend in Sanity

- [ ] Go to **Blends** section
- [ ] Click **+ New Blend**
- [ ] Fill in required fields:
  - [ ] Blend Name: "Test Blend - Yellow Bomb"
  - [ ] Slug: "test-yellow-bomb" (auto-generated)
  - [ ] Tagline: "Test blend for e-commerce verification"
  - [ ] Label Color: "Yellow"
  - [ ] Functions: Add at least 1 (e.g., "Energy")
  - [ ] Blend Image: Upload test image
  - [ ] Ingredients: Add at least 2 ingredients
  - [ ] Display Order: 1
- [ ] Link to Stripe Product:
  - [ ] Scroll to **Stripe Product for Checkout** field
  - [ ] Click reference field and search for "Test Blend"
  - [ ] Select the StripeProduct you created above
- [ ] Click **Publish**

## Phase 2: Frontend Verification

### Check Blends Listing Page

- [ ] Navigate to `http://localhost:3000/blends`
- [ ] Verify:
  - [ ] Test blend appears in grid
  - [ ] Blend name displays correctly
  - [ ] Blend image loads
  - [ ] Tagline displays
  - [ ] Function badges show (e.g., "Energy")
  - [ ] Label color appears correct (yellow background)

### Check Blend Detail Page

- [ ] Click on test blend card
- [ ] Verify you're on `/blends/test-yellow-bomb`
- [ ] Verify header section:
  - [ ] Blend name displays large
  - [ ] Tagline shows
  - [ ] Hero image loads and displays
  - [ ] Label color background visible
  - [ ] Function badges show
- [ ] Verify ingredients section:
  - [ ] "What's inside" section appears
  - [ ] All ingredients display
  - [ ] Ingredient icons show (first letter of name)
  - [ ] Types and seasonality display
- [ ] Verify pricing section:
  - [ ] "Choose your size" heading appears
  - [ ] All 3 variants display as cards
  - [ ] "1-Gallon Jug" shows price $25.00
  - [ ] "½-Gallon Jug" shows price $15.00
  - [ ] "Shot" shows price $5.00
  - [ ] "Most Popular" badge on 1-Gallon Jug (default variant)
  - [ ] "Reserve Now" button on each variant

## Phase 3: Checkout Flow - Guest User

### Step 1: Click Reserve Now

- [ ] Click "Reserve Now" on 1-Gallon Jug ($25.00)
- [ ] Button shows "Processing..." state
- [ ] No errors in browser console

### Step 2: Stripe Checkout Opens

- [ ] Stripe Checkout modal appears
- [ ] Verify displayed info:
  - [ ] Product name shows (Test Blend)
  - [ ] Quantity shows "1"
  - [ ] Total price shows $25.00
- [ ] Email field is visible (guest checkout)

### Step 3: Complete Payment

- [ ] Fill in email: `test@example.com`
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/26)
- [ ] CVC: Any 3-digit number (e.g., 123)
- [ ] Name: "Test User"
- [ ] Click **Pay**

### Step 4: Verify Success Page

- [ ] Redirected to `/checkout/success?...`
- [ ] Success page displays:
  - [ ] ✓ Check mark icon in circle
  - [ ] "Payment Successful!" heading
  - [ ] Confirmation message
  - [ ] "What's Next?" section with 3 items
  - [ ] "Back to Home" button
  - [ ] "View Our Blends" button
- [ ] No errors in console

### Step 5: Verify in Stripe Dashboard

- [ ] Go to Stripe Dashboard → Payments
- [ ] Find payment for $25.00
- [ ] Verify:
  - [ ] Status: Succeeded
  - [ ] Email: test@example.com
  - [ ] Amount: $25.00
  - [ ] Product: Test Blend

## Phase 4: Checkout Flow - Different Sizes

### Test ½-Gallon Size

- [ ] Navigate back to `/blends/test-yellow-bomb`
- [ ] Click "Reserve Now" on ½-Gallon Jug ($15.00)
- [ ] Stripe Checkout opens
- [ ] Verify price shows $15.00
- [ ] Complete payment with test card
- [ ] Success page loads
- [ ] Check Stripe Dashboard shows $15.00 payment

### Test Shot Size

- [ ] Navigate back to `/blends/test-yellow-bomb`
- [ ] Click "Reserve Now" on Shot ($5.00)
- [ ] Stripe Checkout opens
- [ ] Verify price shows $5.00
- [ ] Complete payment with test card
- [ ] Success page loads
- [ ] Check Stripe Dashboard shows $5.00 payment

## Phase 5: Error Handling

### Test Invalid Price ID

- [ ] Manually edit StripeProduct in Sanity
- [ ] Change Stripe Price ID to invalid value: `price_invalid123`
- [ ] Publish changes
- [ ] Go to blend detail page
- [ ] Click "Reserve Now"
- [ ] Verify error message appears:
  - [ ] Button shows "This item is not available for purchase yet"
  - [ ] OR API returns error about invalid price

### Test Network Error

- [ ] Open browser DevTools
- [ ] Go to Network tab
- [ ] Filter by `/api/checkout`
- [ ] Go to blend detail, click "Reserve Now"
- [ ] Observe request to `/api/checkout` POST
- [ ] Verify request body contains:
  - [ ] `priceId`: (correct price ID)
  - [ ] `mode`: "payment"
  - [ ] `successPath`: `/checkout/success...`
  - [ ] `cancelPath`: `/blends/test-yellow-bomb`

## Phase 6: Admin Updates

### Update Blend Pricing

- [ ] Go to Stripe Dashboard
- [ ] Find Test Blend product
- [ ] Click on "1-Gallon Jug" price
- [ ] Change price from $25.00 to $30.00
- [ ] Save
- [ ] Go to blend detail page
- [ ] Refresh page (Ctrl+Shift+R)
- [ ] Verify 1-Gallon price now shows $30.00

### Add New Variant

- [ ] Go to Stripe Dashboard
- [ ] Find Test Blend product
- [ ] Add new price: "Large (2-Gallon)" at $40.00
- [ ] Copy new Price ID
- [ ] Go to Sanity → Stripe Products → Test Blend
- [ ] Add new variant:
  - [ ] Size Key: "jug-2-gallon"
  - [ ] Label: "Large (2-Gallon)"
  - [ ] Stripe Price ID: (paste new price ID)
  - [ ] UI Order: 4
- [ ] Publish
- [ ] Go to blend detail page
- [ ] Refresh
- [ ] Verify new size appears at bottom of pricing section
- [ ] Verify price shows $40.00

## Phase 7: Production Checklist

Before deploying to production:

- [ ] All Stripe keys are production keys (pk_live_, sk_live_)
- [ ] Webhook signing secret is production secret (whsec_...)
- [ ] All blends have real product images (not test images)
- [ ] All prices are correct
- [ ] Business email is set for order confirmations
- [ ] Stripe customer portal is configured
- [ ] Email templates are reviewed
- [ ] Terms of Service are linked from checkout
- [ ] Privacy Policy is available
- [ ] Support email is configured correctly
- [ ] Verify domain in NEXT_PUBLIC_SITE_URL matches production domain

## Troubleshooting

### Issue: "Invalid price ID" Error

**Solution:**
1. Go to Stripe Dashboard → Products
2. Find your product
3. Click on the price
4. Copy the full Price ID (starts with `price_`)
5. Update StripeProduct in Sanity with exact ID
6. Republish

### Issue: Price Not Showing on Website

**Solution:**
1. Hard refresh page: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Check browser console for errors
3. Verify StripeProduct is published in Sanity
4. Verify blend is linked to StripeProduct
5. Check Sanity query in Vision tool

### Issue: Checkout Button Disabled

**Solution:**
1. Verify stripePriceId exists in size object
2. Check Stripe Price ID format (must start with `price_`)
3. Verify product is active in Stripe
4. Check browser console for validation errors

### Issue: Redirects to Wrong Success Page

**Solution:**
1. Verify successPath in ReserveBlendButton is correct
2. Check Origin header is being sent correctly
3. Verify NEXT_PUBLIC_SITE_URL is set in environment
4. Check Stripe checkout session URLs in API logs

## Testing Checklist Summary

**Completed Items: ____ / 70**

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Admin Setup | ☐ | Setting up Stripe & Sanity |
| Phase 2: Frontend | ☐ | Verifying page displays |
| Phase 3: Guest Checkout | ☐ | Testing payment flow |
| Phase 4: Multiple Sizes | ☐ | Testing different variants |
| Phase 5: Error Handling | ☐ | Testing error cases |
| Phase 6: Admin Updates | ☐ | Testing price/variant changes |
| Phase 7: Production | ☐ | Pre-deployment checklist |

---

## Support

If you encounter issues during testing:

1. Check browser console for errors (F12 → Console)
2. Check server logs in terminal
3. Verify all environment variables are set
4. Check Stripe API keys are correct
5. Review troubleshooting section above
6. Contact support@drinklonglife.com for production issues
