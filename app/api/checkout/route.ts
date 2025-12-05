import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { createCheckoutSession, createCartCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getStripeClient } from '@/lib/stripe/config';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

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

  // Database-only discount code
  discountCode?: string;

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
      discountCode,
      successPath,
      cancelPath,
      successUrl: providedSuccessUrl,
      cancelUrl: providedCancelUrl,
    } = body;

    // CRITICAL SECURITY: Only trust environment variable for origin, not client headers
    // CRITICAL: Trim to remove any accidental newlines/whitespace in env var
    const trustedOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com').trim();
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
      const validatedLineItems: Array<{
        price?: string;
        price_data?: {
          currency: string;
          unit_amount: number;
          product_data: {
            name: string;
            images: string[];
          };
        };
        quantity: number;
        variantId: string;
        isSubscription: boolean;
      }> = [];
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

        // HYBRID PRICING: Look up variant from database first
        const { data: variant } = await supabase
          .from('product_variants')
          .select(`
            id,
            label,
            price_usd,
            billing_type,
            stripe_price_id,
            track_inventory,
            stock_quantity,
            products:product_id (
              id,
              name,
              image_url,
              is_active
            )
          `)
          .eq('stripe_price_id', item.priceId)
          .eq('is_active', true)
          .single();

        if (!variant) {
          return NextResponse.json(
            { error: `Product variant not found for: ${item.priceId}` },
            { status: 400 }
          );
        }

        const product = variant.products as any;
        if (!product?.is_active) {
          return NextResponse.json(
            { error: `Product is not available` },
            { status: 400 }
          );
        }

        // Detect billing type and check for mixed cart
        const isSubscription = variant.billing_type === 'recurring';
        const billingType = isSubscription ? 'subscription' : 'one-time';
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
        if (isSubscription) {
          checkoutMode = 'subscription';

          // Enforce quantity=1 for subscription items
          if (item.quantity > 1) {
            return NextResponse.json(
              { error: `Subscription items must have quantity of 1. Item ${item.priceId} has quantity ${item.quantity}` },
              { status: 400 }
            );
          }

          // SUBSCRIPTIONS: Must validate Stripe price exists (required by Stripe)
          try {
            const stripePrice = await stripeClient.prices.retrieve(item.priceId);
            if (!stripePrice.active) {
              return NextResponse.json(
                { error: `Subscription price is not active` },
                { status: 400 }
              );
            }
          } catch (error) {
            logger.error(`❌ Invalid subscription price ID: ${item.priceId}`, error);
            return NextResponse.json(
              { error: `Invalid subscription price. Please contact support.` },
              { status: 400 }
            );
          }

          // Subscription: Use Stripe price ID (required)
          validatedLineItems.push({
            price: item.priceId,
            quantity: item.quantity,
            variantId: variant.id,
            isSubscription: true,
          });
        } else {
          // ONE-TIME: Use dynamic pricing from database (no Stripe price validation needed)
          const unitAmount = Math.round((variant.price_usd || 0) * 100);

          if (unitAmount <= 0) {
            return NextResponse.json(
              { error: `Invalid price for product: ${product.name}` },
              { status: 400 }
            );
          }

          // Build valid image URL for Stripe (must be absolute URL starting with https://)
          let imageUrl: string | null = null;
          if (product.image_url) {
            if (product.image_url.startsWith('http')) {
              imageUrl = product.image_url.trim();
            } else if (product.image_url.startsWith('/')) {
              // Relative URL - prepend site URL (trim to remove any accidental newlines)
              const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com').trim();
              imageUrl = `${siteUrl}${product.image_url.trim()}`;
            }
          }

          validatedLineItems.push({
            price_data: {
              currency: 'usd',
              unit_amount: unitAmount,
              product_data: {
                name: `${product.name} - ${variant.label}`,
                images: imageUrl ? [imageUrl] : [],
              },
            },
            quantity: item.quantity,
            variantId: variant.id,
            isSubscription: false,
          });
        }
      }

      // DATABASE-ONLY DISCOUNTS: Look up and validate discount code
      let discountInfo: {
        discountId: string;
        discountType: 'percent' | 'amount';
        discountPercent?: number;
        discountAmountCents?: number;
        code: string;
      } | null = null;

      if (discountCode && checkoutMode === 'payment') {
        // Only apply discounts to one-time purchases (subscriptions use Stripe pricing)
        const serviceSupabase = createServiceRoleClient();

        const { data: discount, error: discountError } = await serviceSupabase
          .from('discounts')
          .select('*')
          .ilike('code', discountCode.trim().toUpperCase())
          .eq('is_active', true)
          .single();

        if (discountError || !discount) {
          return NextResponse.json(
            { error: 'Invalid discount code' },
            { status: 400 }
          );
        }

        // Validate discount restrictions

        // Check start date (code not yet active)
        if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
          return NextResponse.json(
            { error: 'This discount code is not yet active' },
            { status: 400 }
          );
        }

        // Check expiration date
        if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
          return NextResponse.json(
            { error: 'This discount code has expired' },
            { status: 400 }
          );
        }

        if (discount.max_redemptions !== null && discount.times_redeemed >= discount.max_redemptions) {
          return NextResponse.json(
            { error: 'This discount code has reached its maximum uses' },
            { status: 400 }
          );
        }

        // Check first_time_only restriction
        if (discount.first_time_only) {
          // For authenticated users, check if they have any completed orders
          if (user) {
            const { count } = await serviceSupabase
              .from('orders')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'completed');

            if (count && count > 0) {
              return NextResponse.json(
                { error: 'This discount code is for first-time customers only' },
                { status: 400 }
              );
            }
          }
          // For guest checkout, we can't easily check - allow it but log
          // In production, you might want to check by email
        }

        // Calculate subtotal for minimum amount check
        const subtotalCents = validatedLineItems.reduce((sum, item: any) => {
          return sum + (item.price_data?.unit_amount || 0) * item.quantity;
        }, 0);

        if (discount.min_amount_cents > 0 && subtotalCents < discount.min_amount_cents) {
          const minDollars = (discount.min_amount_cents / 100).toFixed(2);
          return NextResponse.json(
            { error: `Minimum order of $${minDollars} required for this code` },
            { status: 400 }
          );
        }

        discountInfo = {
          discountId: discount.id,
          discountType: discount.discount_type,
          discountPercent: discount.discount_percent ? Number(discount.discount_percent) : undefined,
          discountAmountCents: discount.discount_amount_cents ?? undefined,
          code: discount.code,
        };
      }

      // CRITICAL: Generate idempotency key to prevent double charges
      // Key is based on: user/IP + cart contents + 1-minute time window
      // This prevents duplicate checkout sessions if user clicks button twice
      const timeWindow = Math.floor(Date.now() / 60000); // 1-minute windows
      const cartFingerprint = JSON.stringify({
        items: validatedLineItems.map(item => ({ price: (item as any).price, qty: item.quantity })).sort(),
        discount: discountCode || null,
        time: timeWindow,
      });
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`${user?.id || clientIp}:${cartFingerprint}`)
        .digest('hex')
        .substring(0, 40); // Stripe max length is 40 chars

      // CRITICAL: Reserve inventory BEFORE creating Stripe session to prevent overselling
      // Generate tracking ID for reservations (we'll update with Stripe session ID later)
      const reservationTrackingId = crypto.randomUUID();
      const reservedItems: Array<{ variantId: string; quantity: number }> = [];

      try {
        // Reserve inventory for each item atomically
        for (const item of validatedLineItems) {
          const { data: reservationResult, error: reservationError } = await supabase.rpc(
            'reserve_inventory',
            {
              p_variant_id: item.variantId,
              p_quantity: item.quantity,
              p_session_id: reservationTrackingId,
            }
          );

          if (reservationError) {
            logger.error('Reservation database error:', reservationError);
            throw new Error(`Failed to reserve inventory: ${reservationError.message}`);
          }

          const result = reservationResult as { success: boolean; error?: string; available_stock?: number };

          if (!result.success) {
            // Reservation failed - insufficient stock
            const errorMsg = result.error === 'Insufficient stock'
              ? `Only ${result.available_stock || 0} available`
              : result.error || 'Failed to reserve inventory';

            // Rollback: Release all previously reserved items
            if (reservedItems.length > 0) {
              await supabase.rpc('release_reservation', { p_session_id: reservationTrackingId });
            }

            return NextResponse.json(
              {
                error: `Out of stock: ${errorMsg}`,
                available: result.available_stock || 0,
              },
              { status: 400 }
            );
          }

          // Track successfully reserved items
          reservedItems.push({
            variantId: item.variantId,
            quantity: item.quantity,
          });
        }

        logger.info(`✅ Reserved inventory for ${reservedItems.length} items`, {
          trackingId: reservationTrackingId,
        });
      } catch (error) {
        // Unexpected error during reservation - release all
        if (reservedItems.length > 0) {
          await supabase.rpc('release_reservation', { p_session_id: reservationTrackingId });
        }

        logger.error('Inventory reservation failed:', error);
        return NextResponse.json(
          { error: 'Failed to reserve inventory. Please try again.' },
          { status: 500 }
        );
      }

      // Strip internal fields before passing to Stripe
      // HYBRID: Handle both price (subscriptions) and price_data (one-time)
      // DISCOUNTS: Apply discount to one-time items by reducing unit_amount
      let totalDiscountCents = 0;
      const stripeLineItems = validatedLineItems.map((item: any) => {
        if (item.isSubscription) {
          // Subscription: Use Stripe price ID (no discount applied)
          return {
            price: item.price,
            quantity: item.quantity,
          };
        } else {
          // One-time: Use dynamic price_data with discount applied
          let finalUnitAmount = item.price_data.unit_amount;

          if (discountInfo) {
            let itemDiscount = 0;
            if (discountInfo.discountType === 'percent' && discountInfo.discountPercent) {
              // Percentage discount - apply to each item
              itemDiscount = Math.round(finalUnitAmount * (discountInfo.discountPercent / 100));
            } else if (discountInfo.discountType === 'amount' && discountInfo.discountAmountCents) {
              // Fixed amount discount - distribute across items proportionally
              const subtotalCents = validatedLineItems.reduce((sum, i: any) =>
                sum + (i.price_data?.unit_amount || 0) * i.quantity, 0);
              // Guard against division by zero
              if (subtotalCents > 0) {
                const itemShare = (item.price_data.unit_amount * item.quantity) / subtotalCents;
                itemDiscount = Math.round(discountInfo.discountAmountCents * itemShare / item.quantity);
              }
            }

            // Apply discount but ensure price doesn't go below $0.50 (Stripe minimum)
            finalUnitAmount = Math.max(50, finalUnitAmount - itemDiscount);
            totalDiscountCents += itemDiscount * item.quantity;
          }

          return {
            price_data: {
              ...item.price_data,
              unit_amount: finalUnitAmount,
              product_data: discountInfo
                ? {
                    ...item.price_data.product_data,
                    name: `${item.price_data.product_data.name}${discountInfo ? ` (${discountInfo.code} applied)` : ''}`,
                  }
                : item.price_data.product_data,
            },
            quantity: item.quantity,
          };
        }
      });

      // Build metadata with discount info for tracking
      const sessionMetadata: Record<string, string> = {
        ...metadata,
        reservationTrackingId,
      };

      if (discountInfo) {
        sessionMetadata.discountId = discountInfo.discountId;
        sessionMetadata.discountCode = discountInfo.code;
        sessionMetadata.discountAmount = totalDiscountCents.toString();
        sessionMetadata.discountType = discountInfo.discountType;
      }

      // Create Stripe checkout session (inventory is now reserved)
      // NO Stripe discounts - we've already applied them to the prices
      const checkoutSession = await createCartCheckoutSession(
        {
          lineItems: stripeLineItems,
          mode: checkoutMode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata: sessionMetadata,
          idempotencyKey,
        },
        stripeClient
      );

      // NOTE: Discount redemption count is incremented in the Stripe webhook
      // when checkout.session.completed fires, NOT here. This prevents
      // inflated counts from abandoned checkouts.

      // Update reservations with actual Stripe session ID
      // CRITICAL: Handle this error to avoid orphaned reservations
      const { error: updateError } = await supabase
        .from('inventory_reservations')
        .update({ checkout_session_id: checkoutSession.id })
        .eq('checkout_session_id', reservationTrackingId);

      if (updateError) {
        logger.error('Failed to update reservation session ID', {
          error: updateError,
          tempId: reservationTrackingId,
          stripeSessionId: checkoutSession.id,
        });
        // Don't fail the checkout - reservations will still expire after 15 minutes
        // But log it for monitoring
      }

      logger.info('✅ Checkout session created with inventory reserved', {
        sessionId: checkoutSession.id,
        trackingId: reservationTrackingId,
        items: reservedItems.length,
      });

      return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
    }

    // LEGACY SINGLE-ITEM CHECKOUT
    if (priceId && mode) {
      // Get variant ID for reservation (we'll reserve after session creation)
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

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
      } catch (error) {
        logger.error(`❌ Invalid price ID: ${priceId}`, error);
        return NextResponse.json(
          { error: 'Invalid price selected' },
          { status: 400 }
        );
      }

      // CRITICAL: Generate idempotency key for single-item checkout
      const timeWindow = Math.floor(Date.now() / 60000);
      const checkoutFingerprint = JSON.stringify({
        price: priceId,
        mode,
        time: timeWindow,
      });
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`${user?.id || clientIp}:${checkoutFingerprint}`)
        .digest('hex')
        .substring(0, 40);

      const checkoutSession = await createCheckoutSession(
        {
          priceId,
          mode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata,
          idempotencyKey,
        },
        stripeClient
      );

      // CRITICAL: Atomically reserve inventory for single-item checkout
      if (variant?.id) {
        const { data: reservationResult, error: reservationError } = await supabase
          .rpc('reserve_inventory', {
            p_variant_id: variant.id,
            p_quantity: 1,
            p_session_id: checkoutSession.id,
          });

        if (reservationError || !reservationResult?.success) {
          return NextResponse.json(
            {
              error: reservationResult?.error || 'Insufficient stock',
              availableStock: reservationResult?.available_stock || 0,
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
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
