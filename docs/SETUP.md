# 🚀 Stripe Payment System - Setup Guide

## Quick Start

This guide will help you set up the complete Stripe + Sanity payments system.

---

## Prerequisites

- Node.js 18+ installed
- Stripe account
- Sanity account
- Access to your production server

---

## 1. Install Dependencies

Already done! Dependencies are listed in `package.json`.

---

## 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the required values:

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:3000/account
```

Get these from:
- API Keys: https://dashboard.stripe.com/test/apikeys
- Webhook Secret: https://dashboard.stripe.com/test/webhooks (after creating endpoint)

### Database Configuration

```env
DATABASE_URL=file:./dev.db
```

For production, use PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Authentication

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

Generate a secret:
```bash
openssl rand -base64 32
```

---

## 3. Set Up Database

### Generate Prisma Client

```bash
npm run db:generate
```

### Push Schema to Database

```bash
npm run db:push
```

This creates the database tables for:
- Users
- Accounts (NextAuth)
- Sessions (NextAuth)
- Subscriptions
- Purchases

### Verify Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 to view your database.

---

## 4. Configure Stripe Products

### In Stripe Dashboard:

1. Go to **Products**
2. Create a product (e.g., "Green Detox")
3. Add **three prices** for sizes:
   - Gallons: $50/month with metadata `size_key=gallon`, `size_label=Gallons`
   - Half Gallons: $35/month with metadata `size_key=half_gallon`, `size_label=Half Gallons`
   - Shots: $5/month with metadata `size_key=shot`, `size_label=Shots`
4. Copy the Product ID and all Price IDs

---

## 5. Configure Products in Sanity

### Start Sanity Studio:

```bash
npm run studio
```

Open http://localhost:3333/studio

### Create a Stripe Product:

1. Click **Stripe Product** → **Create**
2. Fill in:
   - **Title**: "Green Detox - Monthly Subscription"
   - **Stripe Product ID**: `prod_xxxxx` (from Stripe)
   - **Active**: Toggle ON
   - **Variants**: Add three variants with the Price IDs from Stripe
3. Click **Publish**

---

## 6. Set Up Stripe Webhook

### Create Webhook Endpoint:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Webhook Locally:

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

Forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 7. Run the Application

### Development Mode:

```bash
npm run dev
```

App runs at: http://localhost:8080

### Test the Flow:

1. Go to http://localhost:8080/pricing
2. Click on a product
3. Click "Subscribe Now"
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify landing on success page
7. Check Stripe Dashboard for the subscription

---

## 8. Going Live

### Checklist:

- [ ] Switch Stripe to **Live Mode**
- [ ] Get live API keys
- [ ] Update environment variables with live keys
- [ ] Create live products in Stripe
- [ ] Update Sanity products with live Price IDs
- [ ] Configure live webhook endpoint
- [ ] Test real $1 purchase
- [ ] Deploy to production

### Production Environment Variables:

Set these in your hosting platform (Vercel, Netlify, etc.):

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from live webhook)
STRIPE_BILLING_PORTAL_RETURN_URL=https://yourdomain.com/account
DATABASE_URL=postgresql://... (production database)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=... (different from dev)
```

---

## Project Structure

```
drinklonglife/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   ├── checkout/              # Checkout session creation
│   │   ├── billing-portal/        # Subscription management
│   │   └── stripe/webhook/        # Stripe webhook handler
│   └── (website)/
│       ├── pricing/               # Pricing page
│       └── checkout/
│           ├── success/           # Success page
│           └── cancel/            # Cancel page
├── components/
│   └── pricing/
│       ├── CheckoutButton.tsx     # Checkout button component
│       └── PricingCard.tsx        # Pricing card component
├── lib/
│   ├── stripe.ts                  # Stripe utilities
│   ├── subscription.ts            # Subscription helpers
│   ├── prisma.ts                  # Prisma client
│   └── auth.ts                    # NextAuth config
├── prisma/
│   └── schema.prisma              # Database schema
├── sanity/
│   └── schemas/
│       ├── stripeProduct.ts       # Stripe product schema
│       └── subscriptionPageSettings.ts
├── types/
│   └── stripe.ts                  # TypeScript types
└── docs/
    ├── payments-admin-guide.md    # Admin guide
    └── SETUP.md                   # This file
```

---

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run studio           # Start Sanity Studio
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio
```

---

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run:
```bash
npm run db:generate
```

### Database errors

1. Check `DATABASE_URL` is set correctly
2. Run `npm run db:push` to sync schema
3. Verify database file exists (for SQLite)

### Webhook not working

1. Check `STRIPE_WEBHOOK_SECRET` is set
2. Verify webhook endpoint URL is correct
3. Use Stripe CLI for local testing

### Products not showing

1. Verify products are set to `isActive = true` in Sanity
2. Check Stripe Price IDs are correct
3. Clear cache and refresh

---

## Security Notes

⚠️ **Never commit:**
- `.env.local` file
- Stripe secret keys
- Database credentials
- NextAuth secret

✅ **Always:**
- Use environment variables
- Test in Stripe test mode first
- Verify webhook signatures
- Use HTTPS in production

---

## Support

For detailed admin instructions, see:
- [Admin Guide](./payments-admin-guide.md)

For Stripe documentation:
- https://stripe.com/docs

For Sanity documentation:
- https://sanity.io/docs

---

**Last Updated**: 2025-11-13
