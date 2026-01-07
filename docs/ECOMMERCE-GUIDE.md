# E-Commerce System Guide
## Long Life - Production-Ready Checkout & Payment Processing

**Last Updated:** November 23, 2025
**Status:** Production Ready ✅

---

## Table of Contents
1. [Overview](#overview)
2. [Cart System](#cart-system)
3. [Checkout Flow](#checkout-flow)
4. [Payment Processing](#payment-processing)
5. [Inventory Management](#inventory-management)
6. [Order Fulfillment](#order-fulfillment)
7. [Email Notifications](#email-notifications)
8. [Testing Guide](#testing-guide)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Long Life e-commerce system is a fully-featured, production-ready checkout and payment processing platform built on:
- **Stripe** for payment processing (dual test/production mode)
- **Supabase** for database and authentication
- **Next.js** for server-side rendering and API routes
- **Zustand** for client-side cart state management

### Key Features
✅ **Cart Management** - Client-side cart with localStorage persistence
✅ **Server-Side Validation** - Comprehensive validation before checkout
✅ **Inventory Tracking** - Real-time stock levels with reservations
✅ **Payment Processing** - Secure Stripe integration with webhooks
✅ **Order Management** - Complete order lifecycle tracking
✅ **Email System** - Database-driven transactional emails
✅ **Admin Dashboard** - Full order and inventory management

---

## Cart System

### File Location
- **Store:** `lib/store/cartStore.ts`
- **Validation API:** `app/api/cart/validate/route.ts`

### Cart Store (Zustand)

The cart is managed client-side using Zustand with localStorage persistence:

```typescript
import { useCartStore } from '@/lib/store/cartStore';

// In your component
const cartStore = useCartStore();
const items = cartStore.items;
const total = cartStore.getTotal();

// Add item
cartStore.addItem({
  priceId: 'price_abc123...',
  productName: 'Green Bomb',
  productType: 'one-time', // or 'subscription'
  quantity: 2,
  amount: 4999, // in cents
  metadata: {
    blendSlug: 'green-bomb',
    sizeKey: '16oz',
  },
});

// Remove item
cartStore.removeItem('price_abc123-16oz-green-bomb');

// Clear cart
cartStore.clearCart();
```

### Cart Validation Rules

1. **Price ID Format:** Must start with `price_` and be at least 20 characters
2. **Quantity:** Must be integer between 1-999
3. **Billing Type Mixing:** Cannot mix one-time and subscription items
4. **Subscription Quantity:** Subscriptions must have quantity = 1

### Server-Side Cart Validation

**CRITICAL:** Always validate cart before checkout:

```typescript
// Call before checkout
const response = await fetch('/api/cart/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartStore.items.map(item => ({
      priceId: item.priceId,
      quantity: item.quantity,
    })),
  }),
});

const result = await response.json();
if (!result.valid) {
  // Handle validation errors
  result.errors.forEach(error => {
    console.error(error.priceId, error.error, error.available);
  });
}
```

The validation API checks:
- ✅ Price exists in Stripe and is active
- ✅ Product is active
- ✅ Inventory levels (if tracking enabled)
- ✅ Quantity validity
- ✅ Subscription quantity rules

---

## Checkout Flow

### File Location
- **API Route:** `app/api/checkout/route.ts`
- **Validation:** `lib/validations/checkout.ts`

### Standard Checkout Process

```
1. User adds items to cart
   ↓
2. User clicks "Checkout"
   ↓
3. CLIENT: Validate cart with /api/cart/validate
   ↓
4. CLIENT: Call /api/checkout with validated items
   ↓
5. SERVER: Validate request with Zod schema
   ↓
6. SERVER: Verify each price with Stripe
   ↓
7. SERVER: Reserve inventory (atomic operation)
   ↓
8. SERVER: Create Stripe Checkout Session
   ↓
9. CLIENT: Redirect to Stripe hosted checkout
   ↓
10. USER: Completes payment on Stripe
   ↓
11. WEBHOOK: Stripe sends checkout.session.completed
   ↓
12. SERVER: Process webhook, decrease inventory, send confirmation email
   ↓
13. CLIENT: Redirect to success page
```

### Creating Checkout Session

```typescript
// Multi-item cart checkout
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      { priceId: 'price_abc123', quantity: 2 },
      { priceId: 'price_def456', quantity: 1 },
    ],
    couponCode: 'WELCOME10', // optional
    successPath: '/checkout/success', // optional
    cancelPath: '/cart', // optional
  }),
});

const { sessionUrl } = await response.json();
window.location.href = sessionUrl; // Redirect to Stripe
```

### Security Features

1. **Rate Limiting:** 20 attempts per 5 minutes per user/IP
2. **Server-Side Price Validation:** Prevents price manipulation
3. **Inventory Reservation:** Atomic stock decrease
4. **Webhook Idempotency:** Prevents duplicate processing
5. **Trusted Origins:** Only uses environment variable for URLs

---

## Payment Processing

### Stripe Integration

#### Dual-Mode Configuration
The app supports both test and production Stripe modes, switchable via admin panel:

**Environment Variables:**
```bash
# Test Mode
STRIPE_SECRET_KEY_TEST=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...

# Production Mode
STRIPE_SECRET_KEY_PRODUCTION=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION=pk_live_...
STRIPE_WEBHOOK_SECRET_PRODUCTION=whsec_...
```

#### Webhook Events Handled

**File:** `app/api/stripe/webhook/route.ts`

- `checkout.session.completed` - Order completion
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription change
- `customer.subscription.deleted` - Cancellation
- `invoice.paid` - Subscription renewal
- `invoice.payment_failed` - Failed payment
- `payment_intent.succeeded` - One-time payment

#### Webhook Security

1. **Signature Verification:** All webhooks verify Stripe signature
2. **Idempotency:** Duplicate events are detected and skipped
3. **Error Logging:** Failed webhooks logged to `webhook_failures` table

---

## Inventory Management

### File Location
- **Migration:** `supabase/migrations/017_add_inventory_management.sql`
- **Reservations:** `supabase/migrations/019_add_inventory_reservations.sql`

### Inventory Tracking

Each product variant can have:
- `stock_quantity` - Current inventory level (NULL = unlimited)
- `track_inventory` - Enable/disable tracking (boolean)
- `low_stock_threshold` - Alert threshold (default: 5)

### Inventory Operations

```sql
-- Decrease inventory (called during checkout)
SELECT decrease_inventory(
  p_variant_id := 'uuid-here',
  p_quantity := 2,
  p_order_id := 'uuid-here',
  p_stripe_session_id := 'cs_test_...'
);

-- Reserve inventory (called before Stripe session creation)
SELECT reserve_inventory(
  p_variant_id := 'uuid-here',
  p_quantity := 2,
  p_session_id := 'cs_test_...'
);

-- Release reservation (called if payment fails or expires)
SELECT release_reservation(
  p_session_id := 'cs_test_...'
);
```

### Inventory Transaction Log

All inventory changes are logged in `inventory_transactions`:
- `sale` - Inventory decreased due to order
- `restock` - Admin increased inventory
- `adjustment` - Admin corrected inventory
- `return` - Customer returned product

---

## Order Fulfillment

### Order Lifecycle

```
pending → processing → completed
         ↓
     cancelled / refunded
```

### Fulfillment Statuses

- `pending` - Order received, not yet started
- `processing` - Preparing order
- `shipped` - Order shipped (tracking added)
- `delivered` - Confirmed delivery
- `cancelled` - Order cancelled
- `returned` - Product returned

### Admin Actions

```typescript
// Update order status
PUT /api/admin/orders/[id]/status
{
  "status": "processing",
  "notes": "Started preparing order",
  "tracking_number": "1Z999AA1..."  // optional for shipped status
}

// Refund order
POST /api/admin/orders/[id]/refund
{
  "amount": 4999,  // optional, partial refund
  "reason": "requested_by_customer",
  "notes": "Customer changed mind"
}
```

---

## Email Notifications

### Database-Driven Templates

**File:** `supabase/migrations/021_email_system_complete.sql`

Emails are stored in the database and can be edited by admins without code changes.

### Available Templates

1. **order_confirmation** - Sent after successful one-time purchase
2. **subscription_confirmation** - Sent after subscription signup
3. **newsletter_welcome** - Sent after newsletter signup
4. **contact_form_notification** - Internal notification for contact form

### Sending Emails

```typescript
import { sendEmail } from '@/lib/email/send-template';

await sendEmail({
  to: 'customer@example.com',
  template: 'order_confirmation',
  data: {
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    items: [{
      name: 'Green Bomb - 16oz',
      quantity: 2,
      price: 4999,
    }],
    subtotal: 9998,
    total: 10998,
    currency: 'usd',
  },
  userId: 'user-uuid',  // optional, for tracking
});
```

### Email Preferences

Users can manage email preferences at `/account/email-preferences`:
- Marketing emails
- Order confirmations
- Product updates
- Newsletter

One-click unsubscribe links are included in all marketing emails.

---

## Testing Guide

### E2E Tests

**File:** `tests/e2e/checkout/*.spec.ts`

Run checkout tests:
```bash
npm run test:e2e
```

### Manual Testing Checklist

**Cart:**
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Clear cart
- [ ] Cart persists after refresh
- [ ] Cannot mix one-time and subscription

**Checkout:**
- [ ] Validate cart before checkout
- [ ] Checkout with one item
- [ ] Checkout with multiple items
- [ ] Apply coupon code
- [ ] Invalid coupon shows error
- [ ] Out of stock prevents checkout

**Payment:**
- [ ] Complete payment with test card
- [ ] Cancel during payment
- [ ] Failed payment shows error
- [ ] Webhook processes correctly
- [ ] Order created in database
- [ ] Confirmation email sent
- [ ] Inventory decreased

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

## Security Best Practices

### Checkout Security

1. **Rate Limiting:** All checkout endpoints have rate limiting
2. **Server-Side Validation:** Never trust client-side data
3. **Price Verification:** Always fetch prices from Stripe
4. **Inventory Atomicity:** Use database functions for stock updates
5. **Webhook Verification:** Verify all Stripe signatures
6. **Idempotency:** Check for duplicate events
7. **Sensitive Data Redaction:** Logger redacts emails, price IDs, etc.

### PCI Compliance

✅ **No card data storage** - All payments handled by Stripe
✅ **HTTPS enforced** - Strict Transport Security enabled
✅ **Secure headers** - CSP, X-Frame-Options, etc.
✅ **Encrypted connections** - TLS 1.2+ required

---

## Troubleshooting

### Common Issues

#### Cart validation fails
**Solution:** Check that price IDs are valid and products are active in Stripe.

#### Inventory goes negative
**Solution:** Verify `track_inventory` is enabled and `decrease_inventory` function is called correctly.

#### Webhook not processing
**Solution:** Check webhook secret matches Stripe dashboard. Verify webhook URL is accessible.

#### Email not sending
**Solution:** Check Resend API key. Verify templates are published in database.

#### Order stuck in pending
**Solution:** Check `webhook_events` table for failed webhooks. Manually retry or create new order.

### Debug Mode

Enable debug logging:
```bash
DEBUG=true npm run dev
```

### Checking Logs

**Vercel:**
```bash
vercel logs --follow
```

**Supabase:**
Check Edge Function logs in Supabase Dashboard → Edge Functions → Logs

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in relevant files
3. Check E2E tests for examples
4. Contact development team

---

**Document Version:** 1.0
**Author:** Architecture & QA Team
**Next Review:** December 2025
