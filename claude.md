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

## Email System (Database-Driven Templates)

**Status**: ✅ Production-ready enterprise email system

### Architecture Overview

The email system uses **database-driven templates** with a Supabase Edge Function for sending. This allows admins to edit email templates through a web UI without code changes.

**Key Components**:
1. **Database Tables** - Templates, notifications (audit trail), user preferences
2. **Supabase Edge Function** - Variable substitution, user preferences, Resend API integration
3. **Admin UI** - `/admin/email-templates` for template management
4. **Simple API** - `sendEmail()` function for application code

### Environment Variables

**Vercel (Next.js)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_8UeJfPqu_PRRGUb3rCYCJBEZytgTgjkJk
```

**Supabase Edge Function** (Project Settings → Edge Functions):
```bash
RESEND_API_KEY=re_8UeJfPqu_PRRGUb3rCYCJBEZytgTgjkJk
EMAIL_FROM="Long Life <hello@drinklonglife.com>"
```

### Database Tables

**`email_template_versions`** - Database-driven email templates
- Fields: `template_name`, `version_type` (draft/published), `subject_template`, `html_template`, `data_schema`
- Draft/publish workflow: Edit drafts safely, publish to production
- Variable substitution: `{{variableName}}` syntax

**`email_notifications`** - Complete audit trail for all sent emails
- Fields: `user_id`, `email`, `template_name`, `status` (pending/sent/failed), `sent_at`, `error_message`
- Tracks every email sent through the system
- Replaces old `email_queue` table

**`email_preferences`** - Granular user email preferences
- Fields: `user_id`, `all_emails_enabled`, `marketing_emails`, `order_confirmations`, `subscription_notifications`, etc.
- Unsubscribe tokens for one-click unsubscribe
- Automatically created for new users

### How to Send Emails

**From application code**:
```typescript
import { sendEmail } from '@/lib/email/send-template';

await sendEmail({
  to: 'customer@example.com',
  template: 'order_confirmation', // Template name from database
  data: {
    orderNumber: '12345',
    customerName: 'John Doe',
    items: [...],
    subtotal: 5000, // Amount in cents
    total: 5500,
    currency: 'usd',
  },
  userId: 'user-uuid', // Optional, for tracking and preferences
});
```

### Email Flow

1. **Application** calls `sendEmail()` with template name and data
2. **Edge Function** loads published template from database
3. **Variable Substitution** replaces `{{variableName}}` with actual data
4. **User Preferences** checked (skip if user disabled this email type)
5. **Audit Record** created in `email_notifications` table
6. **Resend API** sends the email
7. **Audit Updated** with sent status or error message

### Current Templates

- `order_confirmation` - Order confirmation with items, totals
- `subscription_confirmation` - Subscription welcome email
- `newsletter_welcome` - Newsletter signup confirmation
- `contact_form_notification` - Contact form submission (internal)

### Admin UI

**Location**: `/admin/email-templates`

**Features** (currently implemented):
- ✅ View all templates by category
- ✅ See draft vs published status
- ⚠️  Edit/Preview/Test functionality (coming soon)

**How to add templates**:
1. Use the seed script: `node scripts/seed-email-templates.mjs`
2. Or insert directly into `email_template_versions` table
3. Templates must be published to be used in production

### Deployment Checklist

- [x] Database migration applied (`021_email_system_complete.sql`)
- [ ] Templates seeded (`node scripts/seed-email-templates.mjs`)
- [ ] Edge function deployed (`supabase functions deploy send-email`)
- [ ] Environment variables configured in Supabase
- [x] Stripe webhook updated to use `sendEmail()`
- [x] Admin UI accessible at `/admin/email-templates`

### Migration from Old System

**Old system** (deprecated):
- `email_queue` table
- `/api/cron/process-email-queue` cron job
- React Email templates (`lib/email/templates.tsx`)

**New system**:
- `email_notifications` table (audit trail + queue)
- Supabase Edge Function (`supabase/functions/send-email`)
- Database-driven templates (editable via admin UI)

**Note**: Old React Email templates kept temporarily for reference in `lib/email/templates.tsx`.
