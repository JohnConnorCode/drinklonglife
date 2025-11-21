import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, createCartCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getStripeClient } from '@/lib/stripe/config';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface CartItemRequest {
  priceId: string;
  quantity: number;
}

interface CheckoutRequestBody {
  // Legacy single-item checkout
  priceId?: string;
  mode?: 'payment' | 'subscription';

  // Cart-based checkout
  items?: CartItemRequest[];
  couponCode?: string;

  // URLs
  successPath?: string;
  cancelPath?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // CRITICAL SECURITY: Rate limiting to prevent checkout spam
    // For authenticated users: rate limit by user ID
    // For guests: rate limit by IP address
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const rateLimitKey = user ? `checkout:user:${user.id}` : `checkout:ip:${clientIp}`;
    const { success, remaining, reset } = rateLimit(rateLimitKey, 20, '5m');

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many checkout attempts. Please wait a moment and try again.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        }
      );
    }

    const body: CheckoutRequestBody = await req.json();

    const {
      priceId,
      mode,
      items,
      couponCode,
      successPath,
      cancelPath,
      successUrl: providedSuccessUrl,
      cancelUrl: providedCancelUrl,
    } = body;

    // CRITICAL SECURITY: Only trust environment variable for origin, not client headers
    const trustedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const finalSuccessUrl = providedSuccessUrl || `${trustedOrigin}${successPath || '/checkout/success'}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = providedCancelUrl || `${trustedOrigin}${cancelPath || '/cart'}`;

    // Get dynamic Stripe client based on current mode (test/production)
    const stripeClient = await getStripeClient();

    // Handle authenticated vs guest checkout
    let customerId: string | undefined;

    if (user) {
      // Get user profile from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email, full_name')
        .eq('id', user.id)
        .single();

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
      } else if (profile?.email || user.email) {
        const email = profile?.email || user.email!;
        const customer = await getOrCreateCustomer({
          email,
          name: profile?.full_name || user.user_metadata?.name || undefined,
          metadata: { userId: user.id },
          stripe: stripeClient,
        });

        // Save customer ID to database
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', user.id);

        customerId = customer.id;
      }
    }

    // Prepare metadata
    const metadata: Record<string, string> = {};
    if (user) {
      metadata.userId = user.id;
    } else {
      // For guest checkout, track IP for security monitoring
      metadata.guestCheckout = 'true';
      metadata.clientIp = clientIp;
    }

    // CART-BASED CHECKOUT (multiple items)
    if (items && items.length > 0) {
      // CRITICAL SECURITY: Validate all prices server-side to prevent price manipulation
      const validatedLineItems = [];
      let checkoutMode: 'payment' | 'subscription' = 'payment';
      const billingTypes = new Set<string>();

      for (const item of items) {
        // Validate quantity
        if (item.quantity < 1 || item.quantity > 999 || !Number.isInteger(item.quantity)) {
          return NextResponse.json(
            { error: `Invalid quantity for item: ${item.quantity}. Must be between 1 and 999` },
            { status: 400 }
          );
        }

        // Fetch price from Stripe to ensure it's valid and active
        try {
          const price = await stripeClient.prices.retrieve(item.priceId);

          // Security checks
          if (!price.active) {
            return NextResponse.json(
              { error: `Price ${item.priceId} is not active` },
              { status: 400 }
            );
          }

          // Verify price belongs to an active product
          const productId = typeof price.product === 'string' ? price.product : price.product.id;
          const product = await stripeClient.products.retrieve(productId);

          if (!product.active) {
            return NextResponse.json(
              { error: `Product for price ${item.priceId} is not active` },
              { status: 400 }
            );
          }

          // INVENTORY CHECK: Verify sufficient stock available
          const { data: variant } = await supabase
            .from('product_variants')
            .select('id, track_inventory, stock_quantity')
            .eq('stripe_price_id', item.priceId)
            .single();

          if (variant?.track_inventory && variant.stock_quantity !== null) {
            if (variant.stock_quantity < item.quantity) {
              return NextResponse.json(
                {
                  error: `Insufficient stock for this item. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`,
                  availableStock: variant.stock_quantity,
                },
                { status: 400 }
              );
            }
          }

          // Detect billing type and check for mixed cart
          const billingType = price.type === 'recurring' ? 'subscription' : 'one-time';
          billingTypes.add(billingType);

          // CRITICAL: Prevent mixing one-time and subscription items
          if (billingTypes.size > 1) {
            return NextResponse.json(
              {
                error: 'Cannot mix one-time purchases and subscriptions in the same cart. Please checkout separately.',
                details: 'Stripe requires separate checkout sessions for one-time and recurring billing.'
              },
              { status: 400 }
            );
          }

          // Set checkout mode based on billing type
          if (price.type === 'recurring') {
            checkoutMode = 'subscription';

            // Enforce quantity=1 for subscription items
            if (item.quantity > 1) {
              return NextResponse.json(
                { error: `Subscription items must have quantity of 1. Item ${item.priceId} has quantity ${item.quantity}` },
                { status: 400 }
              );
            }
          }

          validatedLineItems.push({
            price: item.priceId,
            quantity: item.quantity,
          });
        } catch (error) {
          logger.error(`❌ Invalid price ID: ${item.priceId}`, error);
          return NextResponse.json(
            { error: `Invalid price ID: ${item.priceId}` },
            { status: 400 }
          );
        }
      }

      const lineItems = validatedLineItems;

      const checkoutSession = await createCartCheckoutSession(
        {
          lineItems,
          mode: checkoutMode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata,
          couponCode,
        },
        stripeClient
      );

      return NextResponse.json({ url: checkoutSession.url });
    }

    // LEGACY SINGLE-ITEM CHECKOUT
    if (priceId && mode) {
      // CRITICAL SECURITY: Validate price server-side
      try {
        const price = await stripeClient.prices.retrieve(priceId);

        if (!price.active) {
          return NextResponse.json(
            { error: 'Selected price is not available' },
            { status: 400 }
          );
        }

        // Verify price type matches mode
        const isSubscription = price.type === 'recurring';
        if ((mode === 'subscription' && !isSubscription) || (mode === 'payment' && isSubscription)) {
          return NextResponse.json(
            { error: 'Price type does not match checkout mode' },
            { status: 400 }
          );
        }

        // INVENTORY CHECK: Verify sufficient stock available
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, track_inventory, stock_quantity')
          .eq('stripe_price_id', priceId)
          .single();

        if (variant?.track_inventory && variant.stock_quantity !== null) {
          if (variant.stock_quantity < 1) {
            return NextResponse.json(
              {
                error: 'This item is currently out of stock',
                availableStock: 0,
              },
              { status: 400 }
            );
          }
        }
      } catch (error) {
        logger.error(`❌ Invalid price ID: ${priceId}`, error);
        return NextResponse.json(
          { error: 'Invalid price selected' },
          { status: 400 }
        );
      }

      const checkoutSession = await createCheckoutSession(
        {
          priceId,
          mode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata,
        },
        stripeClient
      );

      return NextResponse.json({ url: checkoutSession.url });
    }

    // Invalid request
    return NextResponse.json(
      { error: 'Invalid checkout request. Must provide either items[] or priceId+mode' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
