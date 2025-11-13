import Stripe from 'stripe';

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.');
}

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Export publishable key for client-side usage
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
    console.error(`Error fetching Stripe price ${priceId}:`, error);
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
 */
export async function createCheckoutSession({
  priceId,
  mode,
  successUrl,
  cancelUrl,
  customerId,
  customerEmail,
  metadata = {},
}: {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
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

  return await stripe.checkout.sessions.create(sessionParams);
}

/**
 * Create a Billing Portal session for subscription management
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
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
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
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
    console.error(`Error fetching price metadata for ${priceId}:`, error);
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
    console.error(`Error fetching Stripe customer ${customerId}:`, error);
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
    console.error(`Error fetching invoices for customer ${customerId}:`, error);
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
    const params: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customerId,
    };

    if (subscriptionId) {
      params.subscription = subscriptionId;
    }

    const invoice = await stripe.invoices.retrieveUpcoming(params);
    return invoice;
  } catch (error) {
    // Upcoming invoice may not exist (e.g., no active subscriptions)
    if ((error as any)?.statusCode === 404) {
      return null;
    }
    console.error(`Error fetching upcoming invoice for customer ${customerId}:`, error);
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
    });
    return customer;
  } catch (error) {
    console.error(`Error applying coupon to customer ${customerId}:`, error);
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
    });
    return customer;
  } catch (error) {
    console.error(`Error removing coupon from customer ${customerId}:`, error);
    return null;
  }
}
