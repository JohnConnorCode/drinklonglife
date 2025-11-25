import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { upsertSubscription, createPurchase, updatePurchaseStatus } from '@/lib/subscription';
import { completeReferral } from '@/lib/referral-utils';
import { trackServerEvent } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email/send-template';
import {
  InvoiceWithSubscription,
  getShippingDetails,
  getSubscriptionPeriods,
} from '@/lib/stripe/types';

/**
 * Webhook Event Handlers
 *
 * These functions process Stripe webhook events and are used by both:
 * 1. The main webhook endpoint (app/api/stripe/webhook/route.ts)
 * 2. The webhook retry cron job (app/api/cron/retry-webhooks/route.ts)
 *
 * This centralization ensures consistent event processing and easier maintenance.
 */

/**
 * Handle successful checkout session
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { customer, subscription, payment_intent, metadata, mode } = session;

  if (!customer || typeof customer !== 'string') {
    logger.error('No customer in checkout session');
    return;
  }

  const supabase = createServiceRoleClient();

  // Update user with Stripe customer ID
  const userId = metadata?.userId;
  if (userId) {
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer })
      .eq('id', userId);
  }

  // Handle tier upgrade purchases
  if (metadata?.type === 'tier_upgrade' && userId && metadata?.newTier) {
    await handleTierUpgrade(userId, metadata.newTier);
  }

  // Handle subscription checkout
  if (mode === 'subscription' && subscription) {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      typeof subscription === 'string' ? subscription : subscription.id
    );
    await handleSubscriptionChange(stripeSubscription);

    // Send subscription confirmation email
    if (session.customer_email || session.customer_details?.email) {
      const price = stripeSubscription.items.data[0]?.price;
      const product = typeof price?.product === 'string'
        ? await stripe.products.retrieve(price.product)
        : price?.product;

      await sendEmail({
        to: (session.customer_email || session.customer_details?.email)!,
        template: 'subscription_confirmation',
        data: {
          customerName: session.customer_details?.name || 'there',
          customerEmail: session.customer_email || session.customer_details?.email,
          planName: (product && 'name' in product) ? product.name : 'Subscription',
          planPrice: price?.unit_amount || 0,
          billingInterval: price?.recurring?.interval || 'month',
          nextBillingDate: new Date(getSubscriptionPeriods(stripeSubscription).currentPeriodEnd * 1000).toLocaleDateString(),
          currency: session.currency || 'usd',
        },
        userId,
      });
    }

    // Complete referral if this is the first subscription
    if (userId) {
      await completeReferral(userId);
    }
  }

  // Handle one-time payment checkout
  if (mode === 'payment' && payment_intent) {
    const paymentIntentId = typeof payment_intent === 'string' ? payment_intent : payment_intent.id;

    // Release inventory reservations and decrease stock
    if (session.id) {
      const { data: reservations } = await supabase
        .from('inventory_reservations')
        .select('variant_id, quantity')
        .eq('checkout_session_id', session.id);

      if (reservations && reservations.length > 0) {
        for (const reservation of reservations) {
          await supabase.rpc('decrease_inventory', {
            p_variant_id: reservation.variant_id,
            p_quantity: reservation.quantity,
          });
        }

        // Delete reservations after processing
        await supabase
          .from('inventory_reservations')
          .delete()
          .eq('checkout_session_id', session.id);
      }
    }

    // Create order record
    const { data: orderData } = await supabase
      .from('orders')
      .upsert({
        stripe_session_id: session.id,
        stripe_customer_id: customer,
        stripe_payment_intent_id: paymentIntentId,
        customer_email: session.customer_email || session.customer_details?.email,
        amount_total: session.amount_total,
        amount_subtotal: session.amount_subtotal,
        currency: session.currency,
        status: 'completed',
        payment_status: session.payment_status,
        payment_method_id: session.payment_method_types?.[0],
        user_id: userId || null,
        metadata: session.metadata || {},
        fulfillment_status: 'pending',
        shipping_name: getShippingDetails(session)?.name || session.customer_details?.name,
        shipping_address_line1: getShippingDetails(session)?.address?.line1,
        shipping_address_line2: getShippingDetails(session)?.address?.line2,
        shipping_city: getShippingDetails(session)?.address?.city,
        shipping_state: getShippingDetails(session)?.address?.state,
        shipping_postal_code: getShippingDetails(session)?.address?.postal_code,
        shipping_country: getShippingDetails(session)?.address?.country,
      }, {
        onConflict: 'stripe_session_id',
      })
      .select()
      .single();

    // Track purchase event
    if (userId && session.amount_total && orderData?.id) {
      await trackServerEvent('purchase_completed', {
        userId,
        orderId: orderData.id,
        amount: session.amount_total / 100,
        currency: session.currency || 'usd',
      });
    }
  }
}

/**
 * Handle subscription creation/update
 */
export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const { id, customer, items, status, metadata } = subscription;
  // Get subscription period properties using type-safe helper
  const periods = getSubscriptionPeriods(subscription);
  const current_period_start = periods.currentPeriodStart;
  const current_period_end = periods.currentPeriodEnd;
  const cancel_at_period_end = periods.cancelAtPeriodEnd;
  const canceled_at = periods.canceledAt;

  if (typeof customer !== 'string') {
    logger.error('Invalid customer in subscription');
    return;
  }

  // Get the price and product from the subscription
  const price = items.data[0]?.price;
  if (!price) {
    logger.error('No price in subscription');
    return;
  }

  const productId = typeof price.product === 'string' ? price.product : price.product?.id;
  if (!productId) {
    logger.error('No product in subscription');
    return;
  }

  const supabase = createServiceRoleClient();

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customer)
    .single();

  if (!profile) {
    logger.error(`No user found for customer ${customer}`);
    return;
  }

  // Upsert subscription
  await upsertSubscription({
    userId: profile.id,
    stripeCustomerId: customer,
    stripeSubscriptionId: id,
    stripePriceId: price.id,
    stripeProductId: productId,
    tierKey: metadata?.tier_key,
    sizeKey: metadata?.size_key,
    status,
    currentPeriodStart: new Date(current_period_start * 1000),
    currentPeriodEnd: new Date(current_period_end * 1000),
    cancelAtPeriodEnd: cancel_at_period_end,
    canceledAt: canceled_at ? new Date(canceled_at * 1000) : undefined,
  });

  // Sync subscription status and current plan to profile
  const currentPlanLabel = metadata?.tier_key
    ? `${metadata.tier_key}${metadata.size_key ? ` - ${metadata.size_key}` : ''}`
    : undefined;

  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      current_plan: currentPlanLabel || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
}

/**
 * Handle subscription deletion
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createServiceRoleClient();

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(subscription.canceled_at! * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

/**
 * Handle successful invoice payment
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceWithSub = invoice as InvoiceWithSubscription;
  const subscription = invoiceWithSub.subscription;

  if (!subscription) {
    return; // Not a subscription invoice
  }

  const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionChange(stripeSubscription);
}

/**
 * Handle failed invoice payment
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceWithSub = invoice as InvoiceWithSubscription;
  const subscription = invoiceWithSub.subscription;

  if (!subscription) {
    return; // Not a subscription invoice
  }

  const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;
  const supabase = createServiceRoleClient();

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);
}

/**
 * Handle successful payment intent
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { id, amount, currency, customer, metadata } = paymentIntent;

  if (!customer || typeof customer !== 'string') {
    logger.error('No customer in payment intent');
    return;
  }

  const supabase = createServiceRoleClient();

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customer)
    .single();

  if (!profile) {
    logger.error(`No user found for customer ${customer}`);
    return;
  }

  // Check if purchase already exists
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id, status')
    .eq('stripe_payment_intent_id', id)
    .single();

  if (existingPurchase) {
    // Update status if needed
    if (existingPurchase.status !== 'succeeded') {
      await updatePurchaseStatus(id, 'succeeded');
    }
    return;
  }

  // Create purchase record
  await createPurchase({
    userId: profile.id,
    stripePriceId: metadata?.priceId || '',
    stripeProductId: metadata?.productId || '',
    sizeKey: metadata?.size_key,
    amount,
    currency,
    status: 'succeeded',
    stripePaymentIntentId: id,
  });
}

/**
 * Handle tier upgrade purchases
 */
async function handleTierUpgrade(userId: string, newTier: string) {
  const supabase = createServiceRoleClient();

  // Get current tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('partnership_tier')
    .eq('id', userId)
    .single();

  const oldTier = profile?.partnership_tier || 'none';

  // Update user's tier
  await supabase
    .from('profiles')
    .update({
      partnership_tier: newTier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Track analytics event
  await trackServerEvent('tier_upgraded', {
    userId,
    oldTier,
    newTier,
  });

  logger.info(`User ${userId} upgraded from ${oldTier} to ${newTier}`);
}

/**
 * Process a webhook event by type
 * Used by retry mechanism to replay failed webhooks
 */
export async function processWebhookEvent(eventType: string, eventData: any): Promise<void> {
  switch (eventType) {
    case 'checkout.session.completed': {
      await handleCheckoutSessionCompleted(eventData as Stripe.Checkout.Session);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      await handleSubscriptionChange(eventData as Stripe.Subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      await handleSubscriptionDeleted(eventData as Stripe.Subscription);
      break;
    }

    case 'invoice.paid': {
      await handleInvoicePaid(eventData as Stripe.Invoice);
      break;
    }

    case 'invoice.payment_failed': {
      await handleInvoicePaymentFailed(eventData as Stripe.Invoice);
      break;
    }

    case 'payment_intent.succeeded': {
      await handlePaymentIntentSucceeded(eventData as Stripe.PaymentIntent);
      break;
    }

    default:
      logger.warn(`Unhandled webhook event type: ${eventType}`);
  }
}
