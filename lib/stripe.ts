import Stripe from 'stripe';
import { getStripeKeys } from './stripe/config';
import { logger } from './logger';

// Legacy singleton stripe instance - DO NOT USE for checkout operations
// Use getStripeClient() from lib/stripe/config.ts instead for dynamic key support
let _legacyStripe: Stripe | null = null;

function getLegacyStripe(): Stripe {
  if (_legacyStripe) return _legacyStripe;

  // Fallback for backward compatibility - uses hardcoded keys from env
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }

  _legacyStripe = new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });

  return _legacyStripe;
}

// Export stripe for backward compatibility, but prefer getStripeClient()
// Using getter to defer initialization until first access (prevents build-time env var requirement)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getLegacyStripe();
    return client[prop as keyof Stripe];
  }
});

// Export publishable key getter for dynamic support
export async function getPublishableKey(): Promise<string> {
  const keys = await getStripeKeys();
  return keys.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

// Legacy export for client-side usage
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Get Stripe Price details including amount and billing interval
 */
export async function getStripePrice(priceId: string): Promise<Stripe.Price | null> {
  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });
    return price;
  } catch (error) {
    logger.error(`Error fetching Stripe price ${priceId}:`, error);
    return null;
  }
}

/**
 * Get multiple Stripe Prices at once
 */
export async function getStripePrices(priceIds: string[]): Promise<Map<string, Stripe.Price>> {
  const priceMap = new Map<string, Stripe.Price>();

  await Promise.all(
    priceIds.map(async (priceId) => {
      const price = await getStripePrice(priceId);
      if (price) {
        priceMap.set(priceId, price);
      }
    })
  );

  return priceMap;
}

/**
 * Format amount from cents to dollars
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

/**
 * Get billing interval label
 */
export function getBillingInterval(price: Stripe.Price): string {
  if (!price.recurring) {
    return 'one-time';
  }

  const { interval, interval_count } = price.recurring;

  if (interval_count === 1) {
    return interval; // "month" or "year"
  }

  return `${interval_count} ${interval}s`; // "3 months" or "2 years"
}

/**
 * Create a Stripe Checkout Session
 * Optionally pass a Stripe client for dynamic key support.
 * If not provided, uses legacy hardcoded keys.
 */
export async function createCheckoutSession(
  {
    priceId,
    mode,
    successUrl,
    cancelUrl,
    customerId,
    customerEmail,
    metadata = {},
    idempotencyKey,
  }: {
    priceId: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
  },
  stripeClient?: Stripe
): Promise<Stripe.Checkout.Session> {
  const client = stripeClient || stripe;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  // Add customer if provided
  if (customerId) {
    sessionParams.customer = customerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Add subscription-specific settings
  if (mode === 'subscription') {
    sessionParams.subscription_data = {
      metadata,
    };
  } else {
    sessionParams.payment_intent_data = {
      metadata,
    };
  }

  // Enable shipping address collection for ALL orders
  sessionParams.shipping_address_collection = {
    allowed_countries: ['US', 'CA'],
  };

  // Enable automatic tax calculation (Stripe Tax)
  sessionParams.automatic_tax = {
    enabled: true,
  };

  // Use idempotency key if provided to prevent duplicate charges
  const requestOptions = idempotencyKey ? { idempotencyKey } : undefined;

  return await client.checkout.sessions.create(sessionParams, requestOptions);
}

/**
 * Create a Stripe Checkout Session for cart with multiple items
 * Optionally pass a Stripe client for dynamic key support.
 *
 * Discount handling:
 * - promotionCodeId: Stripe promotion code ID (promo_xxx) - applies with restrictions
 * - couponCode: Raw coupon ID - fallback, no restrictions
 */
export async function createCartCheckoutSession(
  {
    lineItems,
    mode,
    successUrl,
    cancelUrl,
    customerId,
    customerEmail,
    metadata = {},
    promotionCodeId,
    couponCode,
    idempotencyKey,
  }: {
    // HYBRID PRICING: Support both price (subscriptions) and price_data (one-time)
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    promotionCodeId?: string; // Preferred: Stripe promotion code ID (promo_xxx)
    couponCode?: string;      // Fallback: raw coupon ID
    idempotencyKey?: string;
  },
  stripeClient?: Stripe
): Promise<Stripe.Checkout.Session> {
  const client = stripeClient || stripe;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  // Add customer if provided
  if (customerId) {
    sessionParams.customer = customerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  } else if (mode === 'payment') {
    // For guest checkout in payment mode, allow Stripe to collect email
    // NOTE: customer_creation is only allowed in payment mode, not subscription mode
    sessionParams.customer_creation = 'always';
  }

  // Add discount - prefer promotion code (has restrictions) over raw coupon
  if (promotionCodeId) {
    // Promotion code: applies first-time, min amount, and other restrictions
    sessionParams.discounts = [{ promotion_code: promotionCodeId }];
  } else if (couponCode) {
    // Fallback: raw coupon (no customer restrictions)
    sessionParams.discounts = [{ coupon: couponCode }];
  }

  // Add subscription-specific settings
  if (mode === 'subscription') {
    sessionParams.subscription_data = {
      metadata,
    };
  } else {
    sessionParams.payment_intent_data = {
      metadata,
    };
  }

  // Enable shipping address collection for ALL orders (one-time AND subscriptions)
  sessionParams.shipping_address_collection = {
    allowed_countries: ['US', 'CA'],
  };

  // Enable automatic tax calculation (Stripe Tax)
  sessionParams.automatic_tax = {
    enabled: true,
  };

  // Use idempotency key if provided to prevent duplicate charges
  const requestOptions = idempotencyKey ? { idempotencyKey } : undefined;

  return await client.checkout.sessions.create(sessionParams, requestOptions);
}

/**
 * Create a Billing Portal session for subscription management
 * Optionally pass a Stripe client for dynamic key support.
 */
export async function createBillingPortalSession(
  {
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  },
  stripeClient?: Stripe
): Promise<Stripe.BillingPortal.Session> {
  const client = stripeClient || stripe;
  return await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateCustomer({
  email,
  name,
  metadata = {},
  stripe: stripeClient,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
  stripe?: Stripe;
}): Promise<Stripe.Customer> {
  const client = stripeClient || stripe;

  // Search for existing customer by email
  const existingCustomers = await client.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await client.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  return subscriptions.data;
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Resume a subscription (undo cancel at period end)
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get product metadata (size info) from Stripe Price
 */
export async function getPriceMetadata(priceId: string): Promise<{
  sizeKey?: string;
  sizeLabel?: string;
} | null> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return {
      sizeKey: price.metadata?.size_key,
      sizeLabel: price.metadata?.size_label,
    };
  } catch (error) {
    logger.error(`Error fetching price metadata for ${priceId}:`, error);
    return null;
  }
}

/**
 * Get Stripe customer details
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error) {
    logger.error(`Error fetching Stripe customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Get customer invoices with pagination
 */
export async function getCustomerInvoices(
  customerId: string,
  options: {
    limit?: number;
    starting_after?: string;
  } = {}
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: options.limit || 10,
      starting_after: options.starting_after,
    });
    return invoices.data;
  } catch (error) {
    logger.error(`Error fetching invoices for customer ${customerId}:`, error);
    return [];
  }
}

/**
 * Get upcoming invoice for a subscription
 */
export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string
): Promise<Stripe.Invoice | null> {
  try {
    const params: any = {
      customer: customerId,
    };

    if (subscriptionId) {
      params.subscription = subscriptionId;
    }

    const invoice = await (stripe.invoices as any).retrieveUpcoming(params);
    return invoice;
  } catch (error) {
    // Upcoming invoice may not exist (e.g., no active subscriptions)
    if ((error as any)?.statusCode === 404) {
      return null;
    }
    logger.error(`Error fetching upcoming invoice for customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Apply coupon to a customer
 */
export async function applyCustomerCoupon(
  customerId: string,
  couponId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.update(customerId, {
      coupon: couponId,
    } as any);
    return customer;
  } catch (error) {
    logger.error(`Error applying coupon to customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Remove coupon from a customer
 */
export async function removeCustomerCoupon(
  customerId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.update(customerId, {
      coupon: '',
    } as any);
    return customer;
  } catch (error) {
    logger.error(`Error removing coupon from customer ${customerId}:`, error);
    return null;
  }
}
