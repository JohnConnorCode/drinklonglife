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
