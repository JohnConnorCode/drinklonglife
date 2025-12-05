import { NextRequest, NextResponse } from 'next/server';
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
 * Verify webhook signature against both test and production secrets.
 * This allows the webhook to work regardless of which Stripe mode is active.
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  stripeInstance: Stripe
): Stripe.Event | null {
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET_TEST,
    process.env.STRIPE_WEBHOOK_SECRET_PRODUCTION,
    process.env.STRIPE_WEBHOOK_SECRET, // fallback for legacy config
  ].filter(Boolean) as string[];

  for (const secret of secrets) {
    try {
      return stripeInstance.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
      // Try next secret
      continue;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature against both test and production secrets
    let event: Stripe.Event | null = null;
    try {
      event = verifyWebhookSignature(body, signature, stripe);
    } catch (err) {
      logger.error('Webhook signature verification error:', err);
    }

    if (!event) {
      logger.error('Webhook signature verification failed for all configured secrets');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // IDEMPOTENCY: Check if we've already processed this webhook event
    const supabase = createServiceRoleClient();
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      // Event already processed, return success to prevent retry
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Record that we're processing this event
    await supabase
      .from('webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);

    // CRITICAL: Log webhook failure for manual retry/investigation
    try {
      if (event && 'id' in event && 'type' in event) {
        const supabase = createServiceRoleClient();
        await supabase.from('webhook_failures').insert({
          event_id: event.id,
          event_type: event.type,
          event_data: event as Record<string, unknown>,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (logError) {
      logger.error('Failed to log webhook failure:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
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

    // Send subscription confirmation email via new email system
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

    // Create order record for E2E test verification (upsert to prevent duplicates)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .upsert({
        stripe_session_id: session.id,
        stripe_customer_id: customer,
        stripe_payment_intent_id: paymentIntentId,
        customer_email: session.customer_email || session.customer_details?.email,
        amount_total: session.amount_total,
        amount_subtotal: session.amount_subtotal,
        currency: session.currency,
        status: 'completed', // Order is completed after successful payment
        payment_status: session.payment_status,
        payment_method_id: session.payment_method_types?.[0],
        user_id: userId || null,
        metadata: session.metadata || {},
        fulfillment_status: 'pending', // Default fulfillment status
        // Capture shipping information from Stripe
        shipping_name: getShippingDetails(session)?.name || session.customer_details?.name,
        shipping_address_line1: getShippingDetails(session)?.address?.line1,
        shipping_address_line2: getShippingDetails(session)?.address?.line2,
        shipping_city: getShippingDetails(session)?.address?.city,
        shipping_state: getShippingDetails(session)?.address?.state,
        shipping_postal_code: getShippingDetails(session)?.address?.postal_code,
        shipping_country: getShippingDetails(session)?.address?.country,
      }, {
        onConflict: 'stripe_session_id',
        ignoreDuplicates: false, // Update if already exists
      })
      .select()
      .single();

    if (orderError) {
      logger.error('Error creating order record:', orderError);
    } else {
      // Decrease inventory for all line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price'],
      });

      if (lineItems && lineItems.data.length > 0) {
        // Process inventory decreases for each line item
        for (const item of lineItems.data) {
          const price = item.price;
          if (price && price.id) {
            // Find variant by stripe_price_id
            const { data: variant } = await supabase
              .from('product_variants')
              .select('id')
              .eq('stripe_price_id', price.id)
              .single();

            if (variant) {
              // Call decrease_inventory function
              const { error: inventoryError } = await supabase.rpc('decrease_inventory', {
                p_variant_id: variant.id,
                p_quantity: item.quantity || 1,
                p_order_id: orderData?.id || null,
                p_stripe_session_id: session.id,
              });

              if (inventoryError) {
                logger.error(`Error decreasing inventory for variant ${variant.id}:`, inventoryError);
              }
            }
          }
        }

        // Send order confirmation email via new email system
        if (session.customer_email || session.customer_details?.email) {
          await sendEmail({
            to: (session.customer_email || session.customer_details?.email)!,
            template: 'order_confirmation',
            data: {
              orderNumber: session.id.replace('cs_', ''),
              customerName: session.customer_details?.name || 'there',
              customerEmail: session.customer_email || session.customer_details?.email,
              items: lineItems.data.map(item => ({
                name: item.description || 'Product',
                quantity: item.quantity || 1,
                price: item.amount_total || 0,
              })),
              subtotal: session.amount_subtotal || 0,
              total: session.amount_total || 0,
              currency: session.currency || 'usd',
            },
            userId,
          });
        }

        // CRITICAL: Release inventory reservation now that payment succeeded
        await supabase.rpc('release_reservation', {
          p_session_id: session.id
        });
      }
    }

    const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await handlePaymentIntentSucceeded(stripePaymentIntent);

    // Complete referral if this is the first purchase
    if (userId) {
      await completeReferral(userId);
    }
  }

  // Track promotion code redemption if a discount was applied
  await trackPromotionRedemption(session, userId, mode === 'subscription' ? 'subscription' : 'one-time');
}

/**
 * Track promotion code usage for analytics
 */
async function trackPromotionRedemption(
  session: Stripe.Checkout.Session,
  userId: string | undefined,
  orderType: 'one-time' | 'subscription'
) {
  // Check if discount was applied (total_details has discount breakdown)
  if (!session.total_details?.breakdown?.discounts?.length) {
    return;
  }

  const supabase = createServiceRoleClient();

  for (const discountItem of session.total_details.breakdown.discounts) {
    try {
      const discount = discountItem.discount as any;

      // Get coupon details
      const coupon = discount.coupon;
      if (!coupon) continue;

      // Check if this is the first order for this customer
      let isFirstOrder = false;
      if (session.customer) {
        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('stripe_customer_id', session.customer);
        isFirstOrder = (count || 0) <= 1; // This order is the first
      }

      // Insert redemption record
      await supabase.from('promotion_redemptions').insert({
        promotion_code_id: discount.promotion_code || null,
        promotion_code: coupon.name || coupon.id,
        coupon_id: coupon.id,
        customer_id: session.customer || null,
        customer_email: session.customer_email || session.customer_details?.email,
        user_id: userId || null,
        checkout_session_id: session.id,
        discount_type: coupon.percent_off ? 'percent_off' : 'amount_off',
        discount_value: coupon.percent_off || coupon.amount_off || 0,
        discount_amount: discountItem.amount || 0,
        subtotal: session.amount_subtotal || 0,
        total: session.amount_total || 0,
        currency: session.currency || 'usd',
        is_first_order: isFirstOrder,
        order_type: orderType,
      });

      logger.info(`Tracked promotion redemption: ${coupon.name || coupon.id} for session ${session.id}`);
    } catch (error) {
      // Don't fail the webhook if tracking fails
      logger.error('Error tracking promotion redemption:', error);
    }
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
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
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { id, customer } = subscription;
  const supabase = createServiceRoleClient();

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', id);

  // Find user and update profile
  if (typeof customer === 'string') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer)
      .single();

    if (profile) {
      // Check if user has any other active subscriptions
      const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', profile.id)
        .in('status', ['active', 'trialing'])
        .limit(1);

      // Only update status to 'canceled' if no other active subscriptions
      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
    }
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Use type-safe invoice with subscription
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
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Use type-safe invoice with subscription
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
 * Handle successful one-time payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
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
 * Handle tier upgrade purchase
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
}
