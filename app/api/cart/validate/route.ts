import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/config';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

interface CartItemValidation {
  priceId: string;
  quantity: number;
  productName?: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    priceId: string;
    error: string;
    available?: number;
  }>;
}

/**
 * Cart Validation API
 * Validates cart items against:
 * - Stripe price validity
 * - Product availability
 * - Inventory levels
 * - Price consistency
 *
 * CRITICAL: Always call before checkout to prevent overselling and price manipulation
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting to prevent validation spam
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const { success } = rateLimit(`cart-validate:${clientIp}`, 30, '1m');

    if (!success) {
      return NextResponse.json(
        { error: 'Too many validation requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const items: CartItemValidation[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: items array required' },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { error: 'Too many items in cart (max 100)' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const stripe = await getStripeClient();
    const errors: ValidationResult['errors'] = [];

    // Validate each cart item
    for (const item of items) {
      // Validate quantity
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
        errors.push({
          priceId: item.priceId,
          error: `Invalid quantity: ${item.quantity}. Must be between 1-999.`,
        });
        continue;
      }

      // Validate price ID format
      if (!item.priceId || !item.priceId.startsWith('price_') || item.priceId.length < 20) {
        errors.push({
          priceId: item.priceId,
          error: 'Invalid price ID format',
        });
        continue;
      }

      try {
        // HYBRID PRICING: First look up variant in database
        const { data: variant } = await supabase
          .from('product_variants')
          .select(`
            id,
            price_usd,
            billing_type,
            stripe_price_id,
            stock_quantity,
            track_inventory,
            is_active,
            products:product_id (
              is_active
            )
          `)
          .eq('stripe_price_id', item.priceId)
          .single();

        if (!variant) {
          errors.push({
            priceId: item.priceId,
            error: 'Product variant not found',
          });
          continue;
        }

        // Verify variant and product are active
        if (!variant.is_active) {
          errors.push({
            priceId: item.priceId,
            error: 'This product is no longer available',
          });
          continue;
        }

        const product = variant.products as any;
        if (!product?.is_active) {
          errors.push({
            priceId: item.priceId,
            error: 'This product is no longer available',
          });
          continue;
        }

        // Check billing type for special handling
        const isSubscription = variant.billing_type === 'recurring';

        // ONE-TIME: Validate price exists in database
        if (!isSubscription) {
          if (!variant.price_usd || variant.price_usd <= 0) {
            errors.push({
              priceId: item.priceId,
              error: 'Product price not configured',
            });
            continue;
          }
          // No Stripe validation needed for one-time items!
        }

        // SUBSCRIPTIONS: Must validate Stripe price exists
        if (isSubscription) {
          try {
            const stripePrice = await stripe.prices.retrieve(item.priceId);
            if (!stripePrice.active) {
              errors.push({
                priceId: item.priceId,
                error: 'Subscription price is no longer available',
              });
              continue;
            }
          } catch {
            errors.push({
              priceId: item.priceId,
              error: 'Invalid subscription. Please contact support.',
            });
            continue;
          }

          // Enforce quantity = 1 for subscriptions
          if (item.quantity > 1) {
            errors.push({
              priceId: item.priceId,
              error: 'Subscriptions must have quantity of 1',
            });
            continue;
          }
        }

        // INVENTORY CHECK: For both types
        if (variant.track_inventory) {
          if (variant.stock_quantity === null) {
            errors.push({
              priceId: item.priceId,
              error: 'Stock information unavailable',
            });
            continue;
          }

          if (variant.stock_quantity < item.quantity) {
            errors.push({
              priceId: item.priceId,
              error: variant.stock_quantity === 0
                ? 'Out of stock'
                : `Only ${variant.stock_quantity} available`,
              available: variant.stock_quantity,
            });
            continue;
          }
        }

      } catch (error) {
        logger.error('Cart validation error for item:', { priceId: item.priceId, error });
        errors.push({
          priceId: item.priceId,
          error: 'Unable to validate this item. Please try again.',
        });
      }
    }

    // Return validation result
    if (errors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          errors,
        } as ValidationResult,
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
    } as ValidationResult);

  } catch (error) {
    logger.error('Cart validation API error:', error);
    return NextResponse.json(
      { error: 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }
}
