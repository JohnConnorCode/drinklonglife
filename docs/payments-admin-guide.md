# 💳 Payments System Admin Guide

## Overview

This guide explains how to manage the Stripe + Sanity payments system for Long Life. You can manage everything through the Stripe Dashboard and Sanity Studio—**no code required**.

---

## 🎯 Quick Start Checklist

Before going live, ensure:

- [ ] Stripe account is set up and verified
- [ ] Environment variables are configured in production
- [ ] Test purchases work in test mode
- [ ] Stripe webhook is configured and working
- [ ] At least one product is created in Stripe and Sanity

---

## 📋 Table of Contents

1. [Understanding the System](#understanding-the-system)
2. [Stripe Setup](#stripe-setup)
3. [Managing Products in Stripe](#managing-products-in-stripe)
4. [Managing Products in Sanity](#managing-products-in-sanity)
5. [Product Variants (Sizes)](#product-variants-sizes)
6. [Changing Prices](#changing-prices)
7. [Turning Products On/Off](#turning-products-onoff)
8. [Billing Portal](#billing-portal)
9. [Webhooks](#webhooks)
10. [Testing](#testing)
11. [Going Live](#going-live)
12. [Troubleshooting](#troubleshooting)

---

## Understanding the System

### How It Works

```
┌─────────┐     ┌────────┐     ┌──────────┐
│ Stripe  │────>│ Sanity │────>│ Website  │
└─────────┘     └────────┘     └──────────┘
   Money         Presentation    Display
  Pricing         Visibility    Checkout
```

- **Stripe** = Source of truth for money, prices, billing
- **Sanity** = Controls which products show on site, titles, descriptions
- **Website** = Displays products and handles checkout

### Key Concepts

**Product**: A single offering (e.g., "Green Detox Monthly Subscription")

**Price**: The amount customers pay (e.g., $50/month)

**Variant**: A size option (Gallons, Half Gallons, Shots)

**Active/Inactive**: Controls visibility on your website

---

## Stripe Setup

### 1. Create Your Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up or log in
3. Complete verification

### 2. Get Your API Keys

1. In Stripe Dashboard, go to **Developers → API Keys**
2. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
3. Add them to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Configure Webhook

See [Webhooks section](#webhooks) below.

---

## Managing Products in Stripe

### Creating a Product

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add Product**
3. Fill in:
   - **Name**: e.g., "Green Detox"
   - **Description**: Optional
   - **Image**: Optional
4. Click **Save Product**
5. **Copy the Product ID** (starts with `prod_`)

### Adding Prices (Variants)

For each product, you need to create **three separate prices** for the three sizes:

#### Example: Green Detox Product

**1. Gallons - $50/month**

1. In your product, click **+ Add another price**
2. Set:
   - **Price**: `$50`
   - **Billing period**: `Monthly` (or one-time if not a subscription)
   - **Currency**: `USD`
3. Under **Price metadata**, add:
   - `size_key` → `gallon`
   - `size_label` → `Gallons`
4. Click **Add price**
5. **Copy the Price ID** (starts with `price_`)

**2. Half Gallons - $35/month**

1. Click **+ Add another price**
2. Set:
   - **Price**: `$35`
   - **Billing period**: `Monthly`
3. Under **Price metadata**, add:
   - `size_key` → `half_gallon`
   - `size_label` → `Half Gallons`
4. **Copy the Price ID**

**3. Shots - $5/month**

1. Click **+ Add another price**
2. Set:
   - **Price**: `$5`
   - **Billing period**: `Monthly`
3. Under **Price metadata**, add:
   - `size_key` → `shot`
   - `size_label` → `Shots`
4. **Copy the Price ID**

### Important Notes

- Each size must have its own **separate Price** in Stripe
- Metadata (`size_key` and `size_label`) is **required**
- Use consistent `size_key` values: `gallon`, `half_gallon`, `shot`

---

## Managing Products in Sanity

### Creating a Product

1. Open **Sanity Studio** (usually at `yourdomain.com/studio`)
2. Click **Stripe Product** in the left menu
3. Click **+ Create**
4. Fill in:

#### Required Fields

- **Product Title**: Display name (e.g., "Green Detox - Monthly Subscription")
- **Slug**: Auto-generates from title
- **Stripe Product ID**: Paste from Stripe (e.g., `prod_xxxxx`)
- **Active**: Toggle ON to show on website

#### Optional Fields

- **Description**: Rich text about the product
- **Badge**: Text like "MOST POPULAR" or "BEST VALUE"
- **Featured**: Makes it stand out on the pricing page
- **Tier Key**: For feature gating (e.g., `basic`, `pro`, `premium`)
- **Image**: Product photo
- **CTA Label**: Button text (default: "Subscribe")
- **Display Order**: Lower numbers appear first

#### Variants (Sizes)

Click **+ Add variant** three times to create:

**Variant 1: Gallons**
- **Size Key**: `gallon`
- **Display Label**: `Gallons`
- **Stripe Price ID**: `price_xxxxx` (from Stripe)
- **Default Selection**: ON (for your most popular size)
- **Display Order**: `1`

**Variant 2: Half Gallons**
- **Size Key**: `half_gallon`
- **Display Label**: `Half Gallons`
- **Stripe Price ID**: `price_xxxxx`
- **Display Order**: `2`

**Variant 3: Shots**
- **Size Key**: `shot`
- **Display Label**: `Shots`
- **Stripe Price ID**: `price_xxxxx`
- **Display Order**: `3`

5. Click **Publish**

---

## Product Variants (Sizes)

### How Variants Work

Each product can have multiple size options. The customer selects a size, and that determines which Stripe Price is used for checkout.

### Variant Requirements

- **Minimum 1 variant** per product (but typically 3)
- Each variant must have a valid Stripe Price ID
- `size_key` must match between Stripe and Sanity
- Display order controls how they appear (1, 2, 3...)

### Supported Size Keys

- `gallon` → Gallons
- `half_gallon` → Half Gallons
- `shot` → Shots

You can add more if needed, but these three are standard.

---

## Changing Prices

### ⚠️ Important: Never Edit an Active Price

Stripe doesn't allow editing prices that are in use. Instead, you **create a new price** and replace the old one.

### Steps to Change a Price

1. **In Stripe:**
   - Go to your product
   - Click **+ Add another price**
   - Enter the new price amount
   - Add the same metadata (`size_key`, `size_label`)
   - Click **Add price**
   - **Copy the new Price ID**
   - **Archive the old price** (optional but recommended)

2. **In Sanity:**
   - Open the product document
   - Find the variant you're updating
   - **Replace the old Stripe Price ID with the new one**
   - Click **Publish**

3. **Result:**
   - New customers see the new price immediately
   - Existing subscribers keep their old price (unless you change them manually in Stripe)

---

## Turning Products On/Off

### Hide a Product from the Website

1. Open the product in Sanity Studio
2. Toggle **Active** to OFF
3. Click **Publish**

The product will no longer appear on `/pricing` page.

### Show a Product

1. Toggle **Active** to ON
2. Click **Publish**

### Delete a Product

1. In Sanity, click the three dots (•••) menu
2. Select **Delete**
3. Confirm

**Note**: This only removes it from your website. The Stripe product still exists.

---

## Billing Portal

The Billing Portal allows customers to:

- View their subscription details
- Update payment methods
- Cancel subscriptions
- View invoices

### Configuration

1. In Stripe Dashboard, go to **Settings → Billing → Customer Portal**
2. Configure:
   - **Features**: Enable/disable features (update payment, cancel subscription, etc.)
   - **Branding**: Add your logo
   - **Return URL**: Set to `https://yourdomain.com/account`
3. Click **Save**

### How Customers Access It

Customers can access the billing portal from:

- Their account page (if you add a "Manage Subscription" button)
- Links in subscription emails

---

## Webhooks

### What Are Webhooks?

Webhooks notify your website when something happens in Stripe (payment succeeded, subscription cancelled, etc.).

### Setting Up the Webhook

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **+ Add endpoint**
3. Set:
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `payment_intent.succeeded`
4. Click **Add endpoint**
5. **Copy the Signing Secret** (starts with `whsec_`)
6. Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testing Webhooks Locally

Use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Testing

### Test Mode vs Live Mode

Stripe has two modes:

- **Test Mode**: Use test credit cards, no real money
- **Live Mode**: Real payments

Toggle between them in the Stripe Dashboard (top right).

### Test Credit Cards

In test mode, use these cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date, any CVC.

### Testing the Flow

1. Create a test product in Stripe
2. Create a test product in Sanity with `isActive = true`
3. Go to `/pricing` on your site
4. Click a product's Subscribe button
5. Fill in the Stripe Checkout form with test card
6. Verify you land on `/checkout/success`
7. Check Stripe Dashboard to see the subscription

---

## Going Live

### Checklist

1. **Stripe:**
   - [ ] Complete business verification
   - [ ] Switch to **Live Mode**
   - [ ] Get live API keys
   - [ ] Create live products and prices
   - [ ] Configure live webhook

2. **Environment Variables:**
   - [ ] Update production `.env` with live Stripe keys
   - [ ] Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
   - [ ] Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)

3. **Sanity:**
   - [ ] Update products with live Stripe Price IDs
   - [ ] Set products to active
   - [ ] Test on production domain

4. **Testing:**
   - [ ] Make a real $1 test purchase
   - [ ] Verify webhook events come through
   - [ ] Test subscription cancellation
   - [ ] Refund the test purchase

---

## Troubleshooting

### "Invalid price ID" error

**Cause**: The Stripe Price ID in Sanity doesn't exist or is incorrect.

**Fix**:
1. Copy the Price ID from Stripe
2. Paste it exactly in Sanity (including `price_` prefix)
3. Publish

### Product not showing on /pricing page

**Check**:
1. Is **Active** toggled ON in Sanity?
2. Does the product have at least one variant?
3. Are the Stripe Price IDs valid?
4. Try clearing your browser cache

### Webhook not receiving events

**Check**:
1. Is the webhook URL correct?
2. Is `STRIPE_WEBHOOK_SECRET` set correctly?
3. Check Stripe Dashboard → Webhooks → Click your webhook → View attempts
4. Verify your server is reachable from the internet

### Customer can't cancel subscription

**Fix**:
1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable "Cancel subscriptions"
3. Save

### Prices not updating

**Cause**: Prices are cached.

**Fix**:
- The `/pricing` page revalidates every hour
- Force refresh: Clear cache or wait up to 1 hour

### Database errors

**Check**:
1. Has `prisma migrate` been run?
2. Is `DATABASE_URL` set correctly?
3. Run: `npx prisma generate` then `npx prisma db push`

---

## Support

### Resources

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Sanity Documentation**: [sanity.io/docs](https://sanity.io/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

### Getting Help

For technical issues:

1. Check the browser console for errors
2. Check server logs
3. Verify environment variables
4. Test in Stripe test mode first

### Common Questions

**Q: Can customers buy multiple products?**
A: Yes! They can subscribe to multiple products or make multiple one-time purchases.

**Q: Can I offer discounts?**
A: Yes! Create discount codes in Stripe → Products → Coupons. Customers can apply them at checkout.

**Q: How do I refund a customer?**
A: In Stripe Dashboard → Payments → Find the payment → Click Refund.

**Q: Can I change a customer's subscription manually?**
A: Yes! In Stripe Dashboard → Customers → Find customer → Click subscription → Update subscription.

**Q: How do I export customer data?**
A: In Stripe Dashboard → Customers → Export (top right).

---

## Summary

### Admin Workflow

**To add a new product:**
1. Create product in Stripe
2. Create 3 prices (Gallons, Half Gallons, Shots) with metadata
3. Create product in Sanity with the Price IDs
4. Set Active = ON
5. Publish

**To change a price:**
1. Create new price in Stripe with updated amount
2. Update Price ID in Sanity
3. Archive old price in Stripe
4. Publish in Sanity

**To hide a product:**
1. Set Active = OFF in Sanity
2. Publish

That's it! No code changes needed. 🎉

---

**Last Updated**: 2025-11-13
**Version**: 1.0
