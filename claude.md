# Claude Development Guidelines

This file contains important patterns, conventions, and rules for this project to prevent repeated mistakes.

## Loading States & User Experience

### CRITICAL: No Loading Skeletons on User-Facing Pages

**Rule**: NEVER use loading skeletons, Suspense boundaries, or loading states on any user-facing pages.

**Why**: Everything should load immediately with Server-Side Rendering (SSR). Loading skeletons look clunky and hurt UX.

**Where loading states ARE allowed**:
- ✅ Admin pages (`/admin/*`) - These are internal tools where loading states are acceptable
- ✅ Admin components that fetch data

**Where loading states are FORBIDDEN**:
- ❌ Homepage, product pages, checkout flow
- ❌ Any public-facing page the customer sees
- ❌ Marketing pages, about pages, contact pages

**Examples**:

```tsx
// ❌ WRONG - User-facing page with loading state
export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProductDetails />
    </Suspense>
  );
}

// ✅ CORRECT - User-facing page with SSR
export default async function ProductPage() {
  const product = await getProduct(); // Server-side data fetch
  return <ProductDetails product={product} />;
}

// ✅ CORRECT - Admin page CAN use loading states
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" lines={5} />}>
      <OrdersList />
    </Suspense>
  );
}
```

## Build Verification

### CRITICAL: Always Run Local Build Before Pushing

**Rule**: ALWAYS run `npm run build` locally and verify it passes BEFORE pushing to production.

**Why**: We've wasted Vercel resources and deployment time with builds that fail due to TypeScript errors, missing props, and syntax errors that could have been caught locally.

**Process**:
1. Make changes
2. Run `npm run build` locally
3. Fix any errors
4. Commit and push only after build succeeds

**Common build errors to watch for**:
- TypeScript prop mismatches (e.g., `count` vs `lines`)
- Syntax errors (typos in function names)
- Missing imports
- Invalid component props
- `useSearchParams()` not wrapped in Suspense boundary
- Client components using Next.js hooks without proper setup

### useSearchParams and Client Components

When using `useSearchParams()` in a client component, it MUST be wrapped in a Suspense boundary:

```tsx
// ❌ WRONG - Will cause build error
'use client';
export default function Page() {
  const searchParams = useSearchParams(); // ERROR
  return <div>...</div>;
}

// ✅ CORRECT - Wrapped in Suspense
'use client';
import { Suspense } from 'react';

function PageContent() {
  const searchParams = useSearchParams(); // OK
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
```

## Component Prop Consistency

### LoadingSkeleton Component

The `LoadingSkeleton` component uses these props:
- `variant?: 'text' | 'card' | 'table' | 'stat'`
- `lines?: number` (NOT `count`)
- `className?: string`

**Common mistake**: Using `count` instead of `lines`

```tsx
// ❌ WRONG
<LoadingSkeleton count={5} />

// ✅ CORRECT
<LoadingSkeleton variant="table" lines={5} />
```

## Security

### Sanity Studio Access Control

**Rule**: Sanity Studio MUST be inside the `(admin)` route group to be protected by authentication.

**Location**: `app/(admin)/studio/[[...tool]]/page.tsx` (NOT `app/studio/[[...tool]]/page.tsx`)

**Why**: The `(admin)` route group is protected by middleware that checks:
1. User is authenticated (logged in)
2. User has `is_admin = true` in their profile

**Sanity Config**: Must use `/admin/studio` as basePath:

```typescript
// sanity.config.ts
const config: Config = defineConfig({
  basePath: '/admin/studio', // IMPORTANT: Must match protected route
  // ... rest of config
});
```

**Verification**:
- `/studio` → Shows homepage (catch-all route) or 404
- `/admin/studio` → Redirects to login if not authenticated
- After login with admin account → Shows Sanity Studio

## Product Management & Stripe Integration

### Auto-Sync to Stripe

**Rule**: Products and prices are managed in Supabase and can automatically sync to Stripe.

**Workflow** (`/admin/products`):
1. Admin creates/edits product in Supabase admin UI
2. Adds variants with `price_usd` values
3. Checks "Auto-sync to Stripe" checkbox (enabled by default)
4. Clicks "Create Product" or "Update Product"
5. System automatically:
   - Saves product to Supabase
   - Creates/updates Stripe product
   - Creates/updates Stripe prices for all variants
   - Updates Supabase with new Stripe IDs

**Key Features**:
- ✅ Auto-sync checkbox in Settings section
- ✅ Real-time sync status messages
- ✅ Automatic Stripe product/price creation
- ✅ No need to visit Stripe Dashboard
- ✅ Manual "Sync to Stripe" button still available for existing products

**Requirements for Auto-Sync**:
- Product must have at least one variant
- Variants must have `price_usd` set (dollar amount)
- Auto-sync checkbox must be checked

**File Locations**:
- Form: `app/(admin)/admin/products/ProductForm.tsx`
- API: `app/api/admin/products/[id]/sync-stripe/route.ts`
- Logic: `lib/stripe/product-sync.ts`

**Example**:
```
1. Create "Orange Bomb" product
2. Add variant: "1 Gallon", price_usd = 49.99
3. Check "Auto-sync to Stripe" ✓
4. Click "Create Product"
5. System shows: "✅ Synced to Stripe! Product: prod_xxx, Prices: 1"
6. Product ready for checkout immediately
```

## Environment Variables

### Transactional Email (Resend)

**Where configured**: Vercel Project Settings → Environment Variables

**Required variables**:
```bash
RESEND_API_KEY=re_8UeJfPqu_PRRGUb3rCYCJBEZytgTgjkJk
EMAIL_FROM="Long Life <hello@drinklonglife.com>"
```

**Usage**:
- Order confirmations sent via Stripe webhook
- Subscription confirmations
- Shipping notifications
- Email queue processor (`/api/cron/process-email-queue`)

**How emails work**:
1. Stripe webhook queues email to `email_queue` table
2. Vercel Cron runs processor every hour (Hobby plan limit)
3. Processor sends up to 50 emails per run via Resend API
4. Failed emails retry up to 3 times

**Note**: Hobby plan limits cron to hourly. For faster email delivery (every 5 min), upgrade to Vercel Pro or manually trigger: `curl https://drinklonglife.com/api/cron/process-email-queue`
