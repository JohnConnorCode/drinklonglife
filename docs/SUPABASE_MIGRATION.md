# 🔄 Supabase Migration Guide

## Overview

This document describes the refactor from Prisma + NextAuth to Supabase for authentication and database management. **All Stripe and Sanity functionality remains identical** — only the persistence and auth layer has changed.

---

## What Changed

### Removed

- ❌ Prisma ORM (`prisma/schema.prisma`)
- ❌ NextAuth.js (`lib/auth.ts`, `app/api/auth/[...nextauth]`)
- ❌ Local SQLite database
- ❌ `@prisma/client`, `prisma`, `@auth/prisma-adapter` packages
- ❌ `next-auth` package

### Added

- ✅ Supabase client (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- ✅ Supabase Auth helpers (`lib/supabase/auth.ts`)
- ✅ SQL schema for Supabase (`supabase/schema.sql`)
- ✅ `@supabase/supabase-js`, `@supabase/ssr` packages

### Modified

- 🔄 `lib/subscription.ts` - Now uses Supabase instead of Prisma
- 🔄 `app/api/stripe/webhook/route.ts` - Uses Supabase for database operations
- 🔄 `app/api/checkout/route.ts` - Uses Supabase Auth instead of NextAuth
- 🔄 `app/api/billing-portal/route.ts` - Uses Supabase Auth instead of NextAuth
- 🔄 `app/(website)/account/page.tsx` - Uses Supabase Auth for user session
- 🔄 `.env.example` - Updated environment variables

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Fill in:
   - **Name**: drinklonglife (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Project Settings → API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 3. Set Environment Variables

Update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (unchanged)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:3000/account
```

### 4. Run the SQL Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the editor
5. Click **Run**

This creates:
- `profiles` table (extends auth.users)
- `subscriptions` table
- `purchases` table
- RLS policies
- Triggers for auto-creating profiles

### 5. Enable Email Auth (Optional)

If you want users to sign up with email:

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates if desired
4. Set **Site URL** to your domain

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  tier_key TEXT,
  size_key TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Purchases Table

```sql
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  size_key TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Authentication Flow

### Old (NextAuth):
```typescript
// Server Component
const session = await getServerSession(authOptions);
if (!session?.user) redirect('/api/auth/signin');
const userId = session.user.id;
```

### New (Supabase Auth):
```typescript
// Server Component
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');
const userId = user.id;
```

---

## Code Changes Summary

### Subscription Helpers (`lib/subscription.ts`)

**Before (Prisma):**
```typescript
const subscription = await prisma.subscription.findFirst({
  where: { userId, tierKey, status: { in: ['active', 'trialing'] } }
});
```

**After (Supabase):**
```typescript
const { data } = await supabase
  .from('subscriptions')
  .select('id')
  .eq('user_id', userId)
  .eq('tier_key', tierKey)
  .in('status', ['active', 'trialing'])
  .limit(1);
```

### Webhook Handler

**Before:**
```typescript
const user = await prisma.user.findUnique({
  where: { stripeCustomerId: customer }
});
```

**After:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('stripe_customer_id', customer)
  .single();
```

### Checkout API

**Before:**
```typescript
const session = await getServerSession(authOptions);
if (session?.user) {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
}
```

**After:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
}
```

---

## Testing

### 1. Verify Database Schema

In Supabase Dashboard → Table Editor, verify:
- ✅ `profiles` table exists
- ✅ `subscriptions` table exists
- ✅ `purchases` table exists

### 2. Test User Signup

```bash
# Option 1: Use Supabase Dashboard
# Go to Authentication → Users → Add User

# Option 2: Create signup page (not included in this refactor)
# Users can sign up via Supabase Auth UI
```

### 3. Test Webhook

1. Create a test user in Supabase
2. Note the user's UUID
3. Create a Stripe checkout with metadata `userId: <uuid>`
4. Complete checkout
5. Verify in Supabase Table Editor that subscription was created

### 4. Test Account Page

1. Sign in with a user who has subscriptions
2. Visit `/account`
3. Verify subscriptions and purchases display correctly

---

## Row Level Security (RLS)

RLS is enabled on all tables to ensure users can only access their own data.

### Policies

**Profiles:**
- Users can view their own profile
- Users can update their own profile
- Service role has full access

**Subscriptions:**
- Users can view their own subscriptions
- Service role has full access (for webhooks)

**Purchases:**
- Users can view their own purchases
- Service role has full access (for webhooks)

---

## Advantages of Supabase

### vs Prisma + NextAuth

✅ **Fewer dependencies** - One service instead of two libraries
✅ **Real-time capabilities** - Supabase supports realtime subscriptions (optional)
✅ **Built-in auth** - No need for separate auth library
✅ **Hosted database** - No need to manage PostgreSQL yourself
✅ **Row Level Security** - Built-in security at database level
✅ **Auto-generated APIs** - Instant REST and GraphQL APIs
✅ **Dashboard** - Visual interface for data management

---

## Migration from Existing Prisma Data

If you had existing data in Prisma/SQLite, you'll need to migrate it:

### Export from Prisma

```bash
# This would require custom migration script
# Not provided in this refactor
```

### Import to Supabase

```sql
-- Example: Insert user
INSERT INTO public.profiles (id, email, name, stripe_customer_id)
VALUES ('uuid-here', 'user@example.com', 'John Doe', 'cus_xxxxx');

-- Example: Insert subscription
INSERT INTO public.subscriptions (
  user_id, stripe_subscription_id, stripe_customer_id,
  stripe_price_id, stripe_product_id, status
)
VALUES (
  'user-uuid', 'sub_xxxxx', 'cus_xxxxx',
  'price_xxxxx', 'prod_xxxxx', 'active'
);
```

---

## Troubleshooting

### "No user found for customer"

**Cause**: Webhook trying to create subscription but user doesn't exist in Supabase.

**Fix**: Ensure user is created in Supabase before checkout. The profile should be auto-created when user signs up via Supabase Auth.

### "PGRST116" error

**Cause**: No rows returned from `.single()` query.

**Fix**: This is expected when no data exists. The code handles this gracefully.

### RLS policy blocking writes

**Cause**: Service role key not set correctly.

**Fix**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables and webhooks use `createServiceRoleClient()`.

---

## What Stayed the Same

✅ Stripe integration - All Stripe code unchanged
✅ Sanity CMS - All content management unchanged
✅ Product variants - Gallons/Half Gallons/Shots still work
✅ Pricing page - UI unchanged
✅ Checkout flow - Same user experience
✅ Billing portal - Same functionality
✅ Admin workflow - Same Stripe + Sanity management

**Only the authentication and database layer changed.**

---

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

For Stripe/Sanity issues:
- See `docs/payments-admin-guide.md`
- See `docs/SETUP.md`

---

**Migration Date**: 2025-11-13
**Version**: 2.0.0 (Supabase)
