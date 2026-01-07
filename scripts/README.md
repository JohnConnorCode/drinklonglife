# Scripts Directory

This directory contains utility scripts for managing the DrinkLongLife e-commerce platform. All product-related scripts use **Supabase + Stripe only** (NOT Sanity CMS).

## Essential Product & Stripe Scripts

### Core Stripe Mode Management

- **`update-all-prices.mjs`** - Switch between TEST and LIVE Stripe modes
  - Updates Supabase product_variants with correct price IDs
  - Usage: `node scripts/update-all-prices.mjs [test|live]`

- **`validate-current-mode.mjs`** - Validate current Stripe configuration
  - Checks Supabase database matches Stripe mode
  - Verifies all price amounts ($50/$35/$5)
  - Run before deploying to production

- **`STRIPE_MODE_SWITCHING.md`** - Complete guide for TEST/LIVE mode switching
  - Step-by-step instructions
  - Verification checklists
  - Troubleshooting guide

### Stripe Product Management

- **`check-live-products.mjs`** - Check what products exist in LIVE Stripe mode
  - Lists all products and prices in production Stripe account
  - Useful before creating new LIVE prices

- **`create-live-prices.mjs`** - Create LIVE mode prices for Yellow Bomb
  - Creates production prices at correct amounts
  - Run once when setting up LIVE mode

- **`create-missing-live-prices.mjs`** - Create LIVE prices for Green/Red Bomb
  - Creates production prices for Green and Red Bomb products
  - Run once when adding new products to LIVE mode

### Subscription Management

- **`create-stripe-subscriptions.mjs`** - Create subscription products in Stripe
  - Creates monthly/weekly/yearly subscription prices
  - One-time setup for subscription products

- **`sync-subscription-products.mjs`** - Sync subscription products from Stripe to Supabase
  - Fetches recurring prices from Stripe
  - Inserts into product_variants with billing_type='recurring'

### Webhook Management

- **`setup-stripe-webhook.mjs`** - Register production webhook via Stripe API
  - Configures webhook endpoint for production
  - Sets up event notifications

## Database Management Scripts

### Supabase Product Data

- **`check-products.mjs`** - Check product data in Supabase
  - Verifies product catalog
  - Checks variants and pricing

- **`sync-variant-data.mjs`** - Sync variant data between systems
  - Ensures consistency across product variants

- **`validate-database.mjs`** - Validate database structure and data
  - Checks schema integrity
  - Verifies relationships

### Database Migrations

- **`run-migrations.mjs`** - Run database migrations
- **`run-migration-api.mjs`** - Run migrations via Supabase API
- **`run-migration-direct.mjs`** - Run migrations directly
- **`run-migration-pg.mjs`** - Run migrations using PostgreSQL client
- **`run-billing-migration.mjs`** - Run billing-specific migrations
- **`add-billing-columns.mjs`** - Add billing columns to tables

### Row-Level Security (RLS)

- **`check-rls-policies.mjs`** - Check RLS policies
- **`fix-rls-policy.mjs`** - Fix RLS policies
- **`execute-rls-fix.mjs`** - Execute RLS fixes
- **`list-all-policies.mjs`** - List all RLS policies

## User & Auth Management

- **`check-auth-users.mjs`** - Check Supabase auth users
- **`check-all-profiles.mjs`** - Check user profiles
- **`check-db.mjs`** - General database health check

## Testing Scripts

- **`test-product-load.mjs`** - Test product page loading
  - Tests blend pages at localhost:3000
  - Verifies buttons and pricing display

- **`test-production-checkout.mjs`** - Test production checkout flow
  - Validates end-to-end checkout
  - Tests with real Stripe integration

## Data Source Architecture

### Products & E-Commerce → Supabase ONLY

All product data, variants, pricing, and checkout functionality uses **Supabase + Stripe**:

- Product catalog: `products` table
- Variants & pricing: `product_variants` table
- Ingredients: `ingredients` and `product_ingredients` tables
- Management: `/admin/products` admin panel

### Content (NOT Products) → Sanity CMS

Sanity is used ONLY for content pages:

- Homepage content
- Blog posts
- Marketing pages
- Navigation
- Testimonials

## Removed Scripts (Outdated Sanity-Based)

The following scripts were removed because they used an outdated Sanity-based approach:

- ❌ `validate-checkout.mjs` - Used Sanity for validation
- ❌ `test-checkout-fix.mjs` - Used Sanity client
- ❌ `fix-blend-prices.mjs` - Updated Sanity CMS
- ❌ `add-stripe-prices-to-blends.mjs` - Added prices to Sanity
- ❌ `check-blend.mjs` - Checked Sanity for blend data
- ❌ `fix-blends.mjs` - Fixed blend data in Sanity
- ❌ `create-test-blend.mjs` - Created blends in Sanity
- ❌ `complete-blend-data.mjs` - Completed blend data in Sanity
- ❌ `update-blend-prices-direct.mjs` - Updated Sanity prices
- ❌ `update-display-prices.mjs` - Updated display prices in Sanity
- ❌ `test-dual-pricing.mjs` - Tested Sanity dual pricing
- ❌ `add-subscription-prices.mjs` - Added subscriptions to Sanity
- ❌ `check-stripe-mode.mjs` - Checked Sanity Stripe mode

## Common Tasks

### Switch to LIVE Mode (Production)

```bash
# 1. Update database with LIVE price IDs
node scripts/update-all-prices.mjs live

# 2. Update .env.local
# Change: STRIPE_SECRET_KEY to use ${STRIPE_SECRET_KEY_PRODUCTION}

# 3. Clear cache and restart
rm -rf .next && npm run dev

# 4. Validate configuration
node scripts/validate-current-mode.mjs
```

### Switch to TEST Mode (Development)

```bash
# 1. Update database with TEST price IDs
node scripts/update-all-prices.mjs test

# 2. Update .env.local
# Change: STRIPE_SECRET_KEY to use ${STRIPE_SECRET_KEY_TEST}

# 3. Clear cache and restart
rm -rf .next && npm run dev

# 4. Validate configuration
node scripts/validate-current-mode.mjs
```

### Manage Products

Products are managed via the admin panel at:
```
http://localhost:3000/admin/products
```

The admin panel provides full control over:
- Product details (name, slug, description, image)
- Ingredients and display order
- Variants (sizes, prices, Stripe price IDs)
- Billing types (one-time, recurring)

## Environment Variables Required

```bash
# Stripe Keys
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_SECRET_KEY_PRODUCTION=sk_live_...
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_TEST}  # or ${STRIPE_SECRET_KEY_PRODUCTION}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Support

For issues with scripts, check:
1. `.env.local` has correct environment variables
2. Supabase is accessible
3. Stripe keys are for the correct mode (TEST/LIVE)
4. Admin panel at `/admin/products` for product management
