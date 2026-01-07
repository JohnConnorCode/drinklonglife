# Blend Product Setup Guide

Complete guide for admins to manage blends and enable e-commerce through Sanity CMS and Stripe.

## Table of Contents

1. [System Overview](#system-overview)
2. [Creating Stripe Products](#creating-stripe-products)
3. [Setting Up Blends in Sanity](#setting-up-blends-in-sanity)
4. [Linking Blends to Stripe Products](#linking-blends-to-stripe-products)
5. [Testing Checkout Flow](#testing-checkout-flow)
6. [Troubleshooting](#troubleshooting)

---

## System Overview

The Drink Long Life e-commerce system uses a **dual-document approach** for maximum flexibility:

### 1. **Stripe Products** (Primary E-Commerce System)
- Hosted in Stripe dashboard
- Contains detailed pricing variants
- Each variant has a unique Price ID (e.g., `price_xxxxx`)
- Synced to Sanity via the `StripeProduct` document schema

### 2. **Blends** (Content + Commerce)
- Hosted in Sanity CMS
- Content-focused: name, description, ingredients, tagline, etc.
- Commerce-enabled: references a Stripe Product document
- Displays on the website through `/blends/[slug]` pages

### 3. **Connection Flow**

```
Stripe Dashboard
    ↓
Creates: Product + Price IDs
    ↓
StripeProduct Document (Sanity)
    ↓ (referenced by)
Blend Document (Sanity)
    ↓
Website Display
    ↓
ReserveBlendButton Component
    ↓
Stripe Checkout
```

---

## Creating Stripe Products

### Step 1: Log in to Stripe Dashboard

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Products** (left sidebar)

### Step 2: Create a New Product

1. Click **+ Add product**
2. Fill in product details:
   - **Name**: E.g., "Yellow Bomb Blend"
   - **Description**: Marketing copy (optional)
   - **Image**: Upload product photo (optional)

### Step 3: Add Pricing Variants

Each size/variant needs its own price:

1. In the pricing section, click **+ Add price**
2. Configure each variant:
   - **Size Name**: E.g., "1-Gallon Jug", "½-Gallon Jug", "Shot"
   - **Price**: Enter USD amount
   - **Billing period**: Select "One-time" (for this product)
   - Click **Save**

### Step 4: Capture Price IDs

**Important**: You need the Price ID (starts with `price_`) for each variant.

1. After creating prices, go to the **Pricing** tab
2. For each price, click the three dots (⋯) → **Copy price ID**
3. Save these IDs temporarily - you'll need them in Sanity

**Example**:
```
1-Gallon Jug: price_1RkC4xCu8SiOGapK
½-Gallon Jug: price_1RkC4xCu8SiOGapL
Shot:         price_1RkC4xCu8SiOGapM
```

### Step 5: Get Product ID (Optional but Helpful)

1. In the product details, find **Product ID** (starts with `prod_`)
2. Note this down - helpful for reference
3. Make the product **active** (toggle switch in top right)

---

## Setting Up Blends in Sanity

### Accessing Sanity Studio

1. Go to your Sanity Studio at: `[your-project-url].sanity.studio`
2. Navigate to **Blends** section (left sidebar)

### Creating a New Blend

1. Click **+ New** or select an existing blend
2. Fill in **Required Fields**:

#### Basic Info
- **Blend Name**: E.g., "Yellow Bomb"
- **Slug**: Auto-generated from name, e.g., "yellow-bomb"
- **Tagline**: Short description, e.g., "Wake the system. Feel the rush."

#### Functional Benefits
- **Functions**: Add 3-5 short words describing benefits
  - Example: ["Energy", "Focus", "Immunity"]
  - These appear as badges on the blend card

#### Visual Identity
- **Label Color**: Choose from:
  - Yellow (for energizing blends)
  - Red (for primary/bold blends)
  - Green (for healing/wellness blends)
- **Blend Image**: Upload high-resolution product photo
  - Minimum: 1200x1200px
  - Use hotspot to focus on bottle
  - Add alt text for accessibility

#### Ingredients
- **Add Ingredients**: Click **+ Add item**
- Search for existing ingredients or create new ones
- **Order matters**: First ingredient is most prominent
- **Minimum**: 2 ingredients required

#### Content & Marketing
- **Description**: Rich text explanation of what makes it special
  - Use formatting (bold, headers, lists)
  - Appears on blend detail page
- **Blend Story**: Optional deeper narrative
- **Detailed Function**: Optional scientific explanation
- **Best For**: Use cases (e.g., "Morning boost", "Post-workout recovery")
- **How to Use**: Consumption recommendations

#### Display & Ordering
- **Featured**: Toggle to feature on homepage
- **Display Order**: Number for sorting (1 = first, 2 = second, etc.)
- Blends are displayed in ascending order

#### SEO
- **Meta Title**: Page title for search engines
- **Meta Description**: Short description for search results

### Save the Blend

Click **Publish** to make it live. The blend won't be purchasable until linked to a Stripe Product (next section).

---

## Linking Blends to Stripe Products

### Why Link?

When you link a blend to a Stripe Product:
- ✅ Variants automatically display on the website
- ✅ "Reserve Now" button becomes active
- ✅ Customers can checkout with proper pricing
- ✅ All pricing managed in Stripe, synced to website

### Prerequisites

Before linking, ensure you have:
1. ✅ Created the Stripe Product (see [Creating Stripe Products](#creating-stripe-products))
2. ✅ Created the StripeProduct document in Sanity (see below)
3. ✅ Created the Blend document in Sanity (see [Setting Up Blends](#setting-up-blends-in-sanity))

### Step 1: Create StripeProduct Document in Sanity

1. In Sanity Studio, go to **Stripe Products** section
2. Click **+ New Stripe Product**
3. Fill in:
   - **Title**: Product name (e.g., "Yellow Bomb")
   - **Stripe Product ID**: Paste the Product ID from Stripe (e.g., `prod_xxxxx`)
   - **Variants**: Click **+ Add variant** for each price you created
     - **Size Key**: Internal identifier (e.g., "jug-1-gallon")
     - **Label**: Display name (e.g., "1-Gallon Jug")
     - **Stripe Price ID**: Paste from Stripe (e.g., `price_1RkC4x...`)
     - **Is Default**: Toggle **ON** for the most popular variant
     - **UI Order**: Number for display order (1, 2, 3...)
4. Click **Publish**

### Step 2: Link Blend to StripeProduct

1. Open the Blend document in Sanity
2. Scroll to **Stripe Product for Checkout** field
3. Click the reference field and search for your StripeProduct
4. Select it from the dropdown
5. Click **Publish** to save

### Step 3: Verify on Website

1. Go to the blend page: `[your-site]/blends/[slug]`
2. Scroll to "Choose your size" section
3. Verify you see:
   - All variant sizes displayed
   - Correct pricing for each
   - "Most Popular" badge on the default variant
   - "Reserve Now" button is clickable

---

## Testing Checkout Flow

### Prerequisites

- Dev environment running (`npm run dev`)
- Stripe test keys configured in `.env.local`
- Blend linked to Stripe Product

### Test Payment Cards

Use these Stripe test card numbers:

| Scenario | Card Number | Details |
|----------|------------|---------|
| Successful | `4242 4242 4242 4242` | Any future expiry, any CVC |
| Declined | `4000 0000 0000 0002` | Any future expiry, any CVC |
| 3D Secure | `4000 0025 0000 3155` | Triggers auth challenge |

### Full Checkout Test

1. **Navigate to blend page**
   - Go to `http://localhost:3000/blends/[slug]`

2. **Select a size**
   - Click "Reserve Now" on any variant

3. **Verify checkout page**
   - Stripe Checkout modal appears
   - Product name and price are correct
   - All variants were available to select

4. **Complete test payment**
   - Email: Any email address
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/26)
   - CVC: Any 3-digit number (e.g., 123)
   - Click **Pay**

5. **Verify success**
   - Redirected to success page: `/checkout/success?blend=[slug]&size=[id]`
   - Success message displays
   - Check Stripe dashboard → **Payments** for the test payment

### Database Sync Check

After successful payment:
1. Go to Stripe dashboard → **Customers**
2. Find customer by email
3. Verify order appears under **Subscriptions/Payments**

---

## Troubleshooting

### Problem: Blend shows but "Reserve Now" is disabled

**Possible Causes:**
1. Stripe Product not linked to blend
2. Price ID missing or invalid format

**Solution:**
1. Check blend's **Stripe Product for Checkout** field
2. Verify StripeProduct document has all variants with Price IDs
3. Test Price IDs start with `price_`

**Check in browser console:**
```javascript
// This should show the size object with stripePriceId:
console.log(size);
// Output should be: { _id: "...", name: "...", stripePriceId: "price_..." }
```

---

### Problem: Checkout page doesn't appear when clicking "Reserve Now"

**Possible Causes:**
1. `/api/checkout` endpoint not configured
2. Stripe keys not set in environment variables
3. Network error

**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
2. Restart dev server: `npm run dev`
3. Check browser console for error messages:
   ```
   Open DevTools (F12) → Console tab
   Look for red error messages starting with "Checkout error:"
   ```

**Common errors:**
```
"Failed to create checkout session"
→ Check Stripe API keys are correct

"price_id is invalid"
→ Price ID format wrong (must be price_xxxxx)

"Cannot read property 'url' of null"
→ Session creation failed, check Stripe API response
```

---

### Problem: Price doesn't display on website

**Possible Causes:**
1. Stripe Product linked but query hasn't refreshed
2. Variant missing Price ID
3. Cache issue

**Solution:**
1. Reload page (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
2. Check Sanity query: Verify `blendQuery` is fetching `stripeProduct.variants`
3. Verify variant in StripeProduct has a **Stripe Price ID** field filled in

**Test query in Sanity:**
1. Go to Sanity Studio
2. Open **Vision** (top navigation)
3. Run this GROQ query:
   ```groq
   *[_type == "blend" && slug.current == "yellow-bomb"][0]{
     name,
     "stripeProduct": stripeProduct->{
       title,
       "variants": variants[]{
         label,
         stripePriceId
       }
     }
   }
   ```
4. Should show all variants with Price IDs

---

### Problem: Old sizePrice data still showing instead of Stripe variants

**Expected Behavior:**
- If Stripe Product is linked → show variants from Stripe
- If NOT linked → show legacy sizePrice documents (if any exist)

**Solution:**
1. Ensure Stripe Product is **properly linked** in blend
2. Verify StripeProduct document is **published**
3. Hard reload website (Ctrl+Shift+R)

**Check code logic:** (For developers)
- File: `app/(website)/blends/[slug]/page.tsx` lines 265-271
- Shows Stripe variants first if `blend.stripeProduct?.variants?.length > 0`
- Falls back to `blend.sizes` if not available

---

### Problem: Variant display order is wrong

**Possible Causes:**
1. `uiOrder` not set on variants
2. Variants not sorted correctly

**Solution:**
1. Open StripeProduct in Sanity
2. Check each variant has a **UI Order** number
3. Set to 1, 2, 3 in desired order
4. Reload website

---

### Problem: "Most Popular" badge on wrong variant

**Expected:**
- Variant with `isDefault: true` gets the "Most Popular" badge

**Solution:**
1. Open StripeProduct in Sanity
2. Find the variant you want featured
3. Toggle **Is Default** to ON
4. Disable it for other variants
5. Publish and reload

---

## Quick Reference

### Sanity Documents Structure

```
Blend
├── Name, Slug, Tagline
├── Ingredients (references)
├── Images
├── Content (description, story, etc.)
├── Sizes (legacy - array of sizePrice references)
└── Stripe Product (reference)
    └── Links to StripeProduct

StripeProduct
├── Title
├── Stripe Product ID
└── Variants[]
    ├── Size Key
    ├── Label
    ├── Stripe Price ID ← CRITICAL
    ├── Is Default
    └── UI Order
```

### Environment Variables

For checkout to work, ensure these are set:

**Development** (`.env.local`):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Production** (Vercel dashboard):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Useful Stripe URLs

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Card Numbers**: https://stripe.com/docs/testing
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Webhook Signing Secrets**: https://dashboard.stripe.com/webhooks

---

## Support

If you encounter issues not covered here:

1. **Check browser console** (F12 → Console tab)
2. **Check server logs** (where you ran `npm run dev`)
3. **Verify Stripe keys** are correct in environment
4. **Test with Stripe test cards** (4242...)
5. **Check Sanity documents** are published
6. **Reload with hard refresh** (Ctrl+Shift+R)

For technical questions, contact the development team with:
- Error message from console
- Steps to reproduce
- Screenshot of Sanity document
- Screenshot of website

---

## Checklist: Adding a New Blend

Use this checklist when adding a new blend to the site:

- [ ] **Stripe**: Create product in Stripe dashboard
- [ ] **Stripe**: Create price variants for each size
- [ ] **Stripe**: Copy all Price IDs (price_xxxxx)
- [ ] **Stripe**: Make product active
- [ ] **Sanity**: Create StripeProduct document with all variants
- [ ] **Sanity**: Publish StripeProduct
- [ ] **Sanity**: Create Blend document
- [ ] **Sanity**: Upload blend image with alt text
- [ ] **Sanity**: Add 2+ ingredients
- [ ] **Sanity**: Set Display Order number
- [ ] **Sanity**: Set Label Color
- [ ] **Sanity**: Link Stripe Product in blend
- [ ] **Sanity**: Publish Blend
- [ ] **Website**: Navigate to blend page
- [ ] **Website**: Verify all sizes display with correct prices
- [ ] **Website**: Verify "Reserve Now" button is active
- [ ] **Checkout**: Test with Stripe test card (4242...)
- [ ] **Success**: Verify test payment appears in Stripe dashboard

---

## FAQ

**Q: Can I use the legacy sizePrice documents?**
A: Yes, for backward compatibility. Blends without a Stripe Product link will display sizePrice documents if they exist. However, new blends should use the Stripe Product approach.

**Q: What if I need to update prices?**
A: Update in Stripe dashboard, and changes sync immediately to the website (Sanity just references the Stripe Price ID).

**Q: Can I delete a Stripe Product?**
A: Only if no blend references it. First remove the reference from the Blend document.

**Q: How do customers get receipts?**
A: Stripe automatically sends emails. Customers can view invoices in Stripe Customer Portal.

**Q: Where can I see sales?**
A: Stripe Dashboard → **Payments** tab. Filter by date or customer.

---

Last Updated: November 2024
