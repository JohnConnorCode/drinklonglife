# 🔐 Account Management System

## Overview

This document describes the complete user account management system built on **Supabase Auth**, **Stripe**, and **Sanity CMS**. This system provides full user authentication, subscription management, billing, and partnership perks.

---

## Architecture

### Identity & Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Supabase   │◄────►│   Next.js    │◄────►│   Stripe    │
│    Auth     │      │     App      │      │   Billing   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                    │                      │
       │                    ▼                      │
       │            ┌──────────────┐               │
       │            │   Supabase   │               │
       └───────────►│   Database   │◄──────────────┘
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    Sanity    │
                    │     CMS      │
                    └──────────────┘
```

### Key Components

1. **Supabase Auth** - User authentication (email, OAuth)
2. **Supabase Database** - User profiles, subscriptions, purchases, discounts
3. **Stripe** - Payment processing, subscriptions, invoices
4. **Sanity CMS** - Content for perks and discounts (admin-managed)
5. **Next.js App** - Frontend and API routes

---

## Database Schema

### Enhanced Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  name TEXT,
  full_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'none',
  current_plan TEXT,
  partnership_tier TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `subscription_status` - Synced from Stripe: `active`, `canceled`, `trialing`, `past_due`, `incomplete`, `none`
- `current_plan` - Human-readable plan description (e.g., "Pro - Gallon")
- `partnership_tier` - User's partnership level: `none`, `affiliate`, `partner`, `vip`

### User Discounts Table

```sql
CREATE TABLE public.user_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  discount_code TEXT NOT NULL,
  source TEXT,
  stripe_coupon_id TEXT,
  sanity_perk_id TEXT,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, discount_code)
);
```

**Purpose:** Track which discounts/coupons have been applied to each user.

---

## Authentication Flow

### Sign Up

1. User fills out signup form (`/signup`)
2. `SignupForm` component calls `supabase.auth.signUp()`
3. Supabase creates user in `auth.users` table
4. Database trigger `handle_new_user()` creates profile in `public.profiles`
5. User receives email confirmation (if enabled)
6. User is redirected to `/account` after confirmation

### Login

1. User fills out login form (`/login`)
2. `LoginForm` component calls `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOAuth()`
3. Supabase validates credentials and creates session
4. User is redirected to `/account` (or `redirectTo` parameter)

### Google OAuth

1. User clicks "Sign in with Google"
2. Supabase redirects to Google OAuth consent screen
3. Google redirects to `/api/auth/callback` with authorization code
4. Callback route exchanges code for session
5. User is redirected to intended destination

### Sign Out

1. User clicks "Sign Out" button
2. `SignOutButton` component calls `/api/auth/signout` API
3. API calls `supabase.auth.signOut()`
4. User is redirected to homepage

---

## Protected Routes

### Middleware (`middleware.ts`)

The middleware runs on every request and:

1. **Checks authentication** for routes starting with `/account`
2. **Redirects to `/login`** if user is not authenticated
3. **Redirects authenticated users** away from `/login` and `/signup` to `/account`
4. **Preserves redirect destination** via `redirectTo` query parameter

**Protected Routes:**
- `/account` - Dashboard
- `/account/billing` - Billing & Invoices
- `/account/perks` - Perks & Rewards

---

## Webhook Integration

### Syncing Stripe to Supabase

The webhook handler (`/api/stripe/webhook`) listens for Stripe events and syncs data:

**Events Handled:**
1. `checkout.session.completed` - Create/update customer, subscription, or purchase
2. `customer.subscription.created` - Create subscription
3. `customer.subscription.updated` - Update subscription status
4. `customer.subscription.deleted` - Mark subscription as canceled
5. `invoice.paid` - Update subscription status
6. `invoice.payment_failed` - Mark subscription as past_due
7. `payment_intent.succeeded` - Create one-time purchase

**Profile Sync Logic:**

When a subscription is created/updated:
```typescript
await supabase
  .from('profiles')
  .update({
    subscription_status: status,
    current_plan: `${tierKey} - ${sizeKey}`,
    updated_at: NOW()
  })
  .eq('id', userId);
```

When a subscription is canceled:
```typescript
// Only update status if user has no other active subscriptions
const { data: activeSubscriptions } = await supabase
  .from('subscriptions')
  .select('id')
  .eq('user_id', userId)
  .in('status', ['active', 'trialing'])
  .limit(1);

if (!activeSubscriptions || activeSubscriptions.length === 0) {
  await supabase
    .from('profiles')
    .update({ subscription_status: 'canceled' })
    .eq('id', userId);
}
```

---

## Account Pages

### 1. Dashboard (`/account`)

**Features:**
- User welcome message with full name
- Quick stats: Status, Total Spent, Membership Tier
- Quick action buttons to Billing, Perks, and Pricing
- Active subscriptions list
- Purchase history
- Past subscriptions (if any)

**Data Sources:**
- User profile from Supabase
- Subscriptions from `getUserSubscriptions()`
- Purchases from `getUserPurchases()`

### 2. Billing & Invoices (`/account/billing`)

**Features:**
- Subscription management with Stripe Billing Portal link
- Upcoming invoice preview
- Invoice history table with download links
- Payment method management (via Stripe Portal)

**Data Sources:**
- Subscriptions from Supabase
- Invoices from `getCustomerInvoices()` (Stripe)
- Upcoming invoice from `getUpcomingInvoice()` (Stripe)

### 3. Perks & Rewards (`/account/perks`)

**Features:**
- Membership tier display
- User's active discount codes (from database)
- Partnership perks based on tier (from Sanity)
- Available promotional discounts (from Sanity)

**Data Sources:**
- Partnership tier from Supabase profile
- Active discounts from `user_discounts` table
- Partnership perks from Sanity (filtered by tier)
- User discounts from Sanity (filtered by eligibility)

---

## Partnership Tiers

### Tier Hierarchy

```
VIP (highest)
  ↓
Partner
  ↓
Affiliate
  ↓
Standard Member (none)
```

### Tier Access Rules

- **VIP** users can access perks for: Affiliate, Partner, and VIP
- **Partner** users can access perks for: Affiliate and Partner
- **Affiliate** users can access perks for: Affiliate only
- **Standard** users have no partnership perks

### Managing Tiers

Partnership tiers are managed manually in Supabase. To update a user's tier:

```sql
UPDATE public.profiles
SET partnership_tier = 'partner'
WHERE email = 'user@example.com';
```

Or via Supabase Dashboard:
1. Go to Table Editor → profiles
2. Find the user
3. Edit `partnership_tier` column
4. Choose: `none`, `affiliate`, `partner`, or `vip`

---

## Perks & Discounts (Sanity CMS)

### Partnership Perks

**Schema:** `partnershipPerk`

Admins create perks in Sanity Studio that display to users based on their tier.

**Key Fields:**
- `title` - Perk name
- `shortDescription` - Brief description
- `requiredTier` - Minimum tier to access (`affiliate`, `partner`, `vip`)
- `category` - Type of perk (discount, early access, gift, etc.)
- `icon` - Emoji or icon
- `ctaLabel` / `ctaUrl` - Call to action button
- `featured` - Show prominently

**Example:**
```json
{
  "title": "20% Off Annual Plans",
  "shortDescription": "Get 20% off when you switch to an annual subscription.",
  "requiredTier": "partner",
  "category": "discount",
  "icon": "💰",
  "featured": true
}
```

### User Discounts

**Schema:** `userDiscount`

Promotional discount codes that display to eligible users.

**Key Fields:**
- `displayTitle` - Public-facing title
- `discountCode` - Actual code users enter
- `stripeCouponId` - Corresponding Stripe coupon
- `discountType` - `percentage`, `fixed_amount`, `free_shipping`
- `discountValue` - Amount (20 = 20%, 500 = $5.00)
- `eligibility` - Who can use: `all`, `new_customers`, `existing_customers`, `tier_specific`
- `requiredTier` - Required tier (if `tier_specific`)
- `startsAt` / `expiresAt` - Active date range
- `featured` - Show prominently

**Example:**
```json
{
  "displayTitle": "Summer Sale 2024",
  "discountCode": "SUMMER2024",
  "stripeCouponId": "summer_2024",
  "discountType": "percentage",
  "discountValue": 25,
  "eligibility": "all",
  "startsAt": "2024-06-01T00:00:00Z",
  "expiresAt": "2024-08-31T23:59:59Z",
  "featured": true
}
```

---

## Applying Discounts to Users

### Via Database Function

Use the `apply_discount_to_user()` function:

```sql
SELECT apply_discount_to_user(
  p_user_id := 'user-uuid-here',
  p_discount_code := 'WELCOME20',
  p_source := 'referral',
  p_stripe_coupon_id := 'welcome_20',
  p_sanity_perk_id := 'perk-doc-id',
  p_expires_at := '2024-12-31T23:59:59Z'
);
```

### Via API Route (Future Enhancement)

Create an API route at `/api/apply-discount`:

```typescript
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { discountCode } = await req.json();

  // Validate discount code in Sanity
  // Apply to user via database function
  // Return success/error
}
```

---

## Stripe Helpers

### New Functions Added

**`getStripeCustomer(customerId)`**
- Get full Stripe customer details
- Returns customer object or null

**`getCustomerInvoices(customerId, options)`**
- Get paginated list of customer invoices
- Options: `limit`, `starting_after`
- Returns array of Stripe invoices

**`getUpcomingInvoice(customerId, subscriptionId?)`**
- Get the next upcoming invoice for a customer
- Returns invoice preview or null

**`applyCustomerCoupon(customerId, couponId)`**
- Apply a coupon to a customer
- Affects future invoices

**`removeCustomerCoupon(customerId)`**
- Remove active coupon from customer

---

## Testing

### 1. Test Signup Flow

```bash
# Visit signup page
open http://localhost:3000/signup

# Fill form and submit
# Check Supabase Auth → Users for new user
# Check Database → profiles for new profile
# Verify email was sent (if confirmation enabled)
```

### 2. Test Login Flow

```bash
# Visit login page
open http://localhost:3000/login

# Login with credentials
# Should redirect to /account
# Verify session is active
```

### 3. Test Protected Routes

```bash
# Without logging in, visit:
open http://localhost:3000/account

# Should redirect to /login?redirectTo=/account
# After logging in, should redirect back to /account
```

### 4. Test Webhook Integration

```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Create a test checkout
# Complete payment
# Check database:
# - profiles: subscription_status updated
# - subscriptions: new record created
```

### 5. Test Perks Display

```bash
# Manually set partnership_tier in Supabase
UPDATE profiles SET partnership_tier = 'partner' WHERE email = 'test@example.com';

# Create perks in Sanity Studio with requiredTier = 'partner'
# Visit /account/perks
# Verify perks display correctly
```

---

## Common Operations

### Upgrade User to Partner

```sql
UPDATE public.profiles
SET partnership_tier = 'partner'
WHERE email = 'user@example.com';
```

### Give User a Discount

```sql
SELECT apply_discount_to_user(
  p_user_id := (SELECT id FROM profiles WHERE email = 'user@example.com'),
  p_discount_code := 'VIP20',
  p_source := 'manual',
  p_stripe_coupon_id := 'vip_20'
);
```

### Check User's Active Discounts

```sql
SELECT * FROM get_active_discounts(
  (SELECT id FROM profiles WHERE email = 'user@example.com')
);
```

### View User's Subscription Status

```sql
SELECT
  email,
  subscription_status,
  current_plan,
  partnership_tier
FROM profiles
WHERE email = 'user@example.com';
```

---

## Troubleshooting

### User Can't Log In

**Possible causes:**
1. Email confirmation not completed (check Supabase → Auth → Users)
2. Incorrect password
3. Account disabled in Supabase

**Solution:**
- Verify user exists in Supabase Auth
- Check email confirmation status
- Reset password if needed

### Profile Not Created After Signup

**Possible causes:**
1. Database trigger `handle_new_user()` not running
2. RLS policies blocking insert

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually create profile if missing
INSERT INTO public.profiles (id, email, name, full_name)
VALUES (
  'user-uuid-from-auth',
  'user@example.com',
  'User Name',
  'User Full Name'
);
```

### Subscription Status Not Syncing

**Possible causes:**
1. Webhook not receiving events
2. Webhook secret mismatch
3. Customer ID not set in profile

**Solution:**
- Check webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` env variable
- Manually sync:
```sql
SELECT sync_profile_from_stripe(
  p_user_id := 'user-uuid',
  p_subscription_status := 'active',
  p_current_plan := 'Pro - Gallon'
);
```

### Perks Not Displaying

**Possible causes:**
1. Partnership tier not set in database
2. Perks not active in Sanity
3. Perks `requiredTier` doesn't match user's tier

**Solution:**
- Check user's `partnership_tier` in database
- Verify perks are published and `isActive = true` in Sanity
- Check perk's `requiredTier` field

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:3000/account

# Sanity (existing)
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled:

**Profiles:**
- Users can view/update their own profile
- Service role has full access

**Subscriptions:**
- Users can view their own subscriptions
- Service role has full access (for webhooks)

**Purchases:**
- Users can view their own purchases
- Service role has full access (for webhooks)

**User Discounts:**
- Users can view their own discounts
- Service role has full access

### API Routes

- Authentication routes (`/api/auth/*`) use server-side Supabase client
- Checkout route validates user session before creating Stripe session
- Billing portal route requires authenticated user
- Webhook route validates Stripe signature

### Middleware

- Protects `/account` routes from unauthorized access
- Uses Supabase session cookies for authentication
- Redirects to login with return URL preserved

---

## Future Enhancements

### Potential Features

1. **Referral System**
   - Generate unique referral codes
   - Track referrals in database
   - Auto-apply discounts to referrers and referees

2. **Discount Application API**
   - `/api/apply-discount` endpoint
   - Validate discount eligibility
   - Auto-apply to Stripe customer

3. **Partnership Applications**
   - Form to apply for partnership tiers
   - Admin review workflow
   - Auto-send welcome email with perks

4. **Email Notifications**
   - Subscription renewal reminders
   - New perks notifications
   - Discount expiration warnings

5. **Admin Dashboard**
   - View all users and their tiers
   - Bulk assign discounts
   - Analytics on perk usage

---

## Support

For issues or questions:
- **Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Sanity**: [sanity.io/docs](https://sanity.io/docs)

---

## Admin Console

The system includes a restricted-access admin console for managing users and system operations.

### Features

1. **Admin Dashboard** (`/admin`)
   - System health metrics
   - User count statistics
   - Partnership tier breakdown

2. **User Management** (`/admin/users`)
   - Search users by email or name
   - View detailed user profiles
   - Update partnership tiers
   - Re-sync subscription data from Stripe

3. **Admin Access Control**
   - Uses `is_admin` boolean column in profiles
   - Protected by middleware
   - Requires explicit grant via SQL

### Granting Admin Access

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'admin@example.com';
```

### Admin Operations

**Update Partnership Tier:**
1. Navigate to `/admin/users`
2. Search for user
3. Click "Manage →"
4. Select new tier from dropdown
5. Click "Update Tier"

**Re-sync from Stripe:**
1. Go to user detail page
2. Click "Sync Now" in Admin Actions section
3. System fetches latest data from Stripe
4. Profile updates with current subscription status

### Security

- Admin routes protected by middleware
- Non-admins redirected to `/unauthorized`
- Admin status checked on every request
- All admin API routes verify admin access

**See [ADMIN_CONSOLE.md](./ADMIN_CONSOLE.md) for complete operator guide.**

---

**Migration Date**: 2025-11-13
**Version**: 3.0.0 (Account Management System)
**Last Updated**: 2025-11-13 (Added Admin Console)
