/**
 * Extended Stripe Types
 *
 * Stripe's TypeScript definitions don't always include all properties
 * that are present at runtime. These extended types provide proper
 * typing for commonly used properties that exist but aren't in the base types.
 */

import Stripe from 'stripe';

/**
 * Checkout Session with shipping details
 * shipping_details is populated when shipping is collected during checkout
 */
export interface CheckoutSessionWithShipping extends Stripe.Checkout.Session {
  shipping_details?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
}

/**
 * Subscription with period and cancellation properties
 * These properties always exist on subscriptions but may not be in TS types
 */
export interface SubscriptionWithPeriods extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
}

/**
 * Invoice with subscription reference
 * subscription property exists on invoices related to subscriptions
 */
export interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription | null;
}

/**
 * Type guard to check if a checkout session has shipping details
 */
export function hasShippingDetails(
  session: Stripe.Checkout.Session
): session is CheckoutSessionWithShipping {
  return 'shipping_details' in session && session.shipping_details !== undefined;
}

/**
 * Helper to safely get shipping details from a checkout session
 */
export function getShippingDetails(session: Stripe.Checkout.Session) {
  const sessionWithShipping = session as CheckoutSessionWithShipping;
  return sessionWithShipping.shipping_details || null;
}

/**
 * Helper to safely get subscription period data
 */
export function getSubscriptionPeriods(subscription: Stripe.Subscription) {
  const sub = subscription as SubscriptionWithPeriods;
  return {
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: sub.canceled_at,
  };
}
