import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface ValidateCouponRequest {
  code: string;
  subtotal?: number; // In cents, to check minimum amount restrictions
}

interface ValidCouponResponse {
  valid: true;
  code: string;
  discountId: string;         // Database discount ID
  discountType: 'percent' | 'amount';
  discountPercent?: number;
  discountAmount?: number;    // In cents
  name?: string;
  restrictions?: {
    minimumAmount?: number;   // In cents
    expiresAt?: string;
  };
}

interface InvalidCouponResponse {
  valid: false;
  error: string;
}

type CouponResponse = ValidCouponResponse | InvalidCouponResponse;

/**
 * Database-only discount validation
 * No Stripe dependency - all discounts managed in Supabase
 */
export async function POST(req: NextRequest): Promise<NextResponse<CouponResponse>> {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const rateLimitKey = user
      ? `coupon-validate:user:${user.id}`
      : `coupon-validate:ip:${clientIp}`;

    const maxAttempts = user ? 10 : 5;
    const { success, remaining, reset } = rateLimit(rateLimitKey, maxAttempts, '1m');

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many validation attempts. Please try again later.',
          valid: false,
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

    const body = await req.json();
    const { code, subtotal }: ValidateCouponRequest = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Discount code is required', valid: false },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Use service role to bypass RLS for validation
    const serviceSupabase = createServiceRoleClient();

    // Look up discount code in database
    const { data: discount, error: discountError } = await serviceSupabase
      .from('discounts')
      .select('*')
      .ilike('code', cleanCode)
      .single();

    if (discountError || !discount) {
      return NextResponse.json(
        { error: 'Invalid discount code', valid: false },
        { status: 404 }
      );
    }

    // Check if active
    if (!discount.is_active) {
      return NextResponse.json(
        { error: 'This code is no longer active', valid: false },
        { status: 400 }
      );
    }

    // Check start date
    if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
      return NextResponse.json(
        { error: 'This code is not yet active', valid: false },
        { status: 400 }
      );
    }

    // Check expiration
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This code has expired', valid: false },
        { status: 400 }
      );
    }

    // Check max redemptions
    if (discount.max_redemptions !== null && discount.times_redeemed >= discount.max_redemptions) {
      return NextResponse.json(
        { error: 'This code has reached its maximum uses', valid: false },
        { status: 400 }
      );
    }

    // Check minimum amount if subtotal provided
    if (discount.min_amount_cents > 0 && subtotal && subtotal < discount.min_amount_cents) {
      const minDollars = (discount.min_amount_cents / 100).toFixed(2);
      return NextResponse.json(
        { error: `Minimum order of $${minDollars} required for this code`, valid: false },
        { status: 400 }
      );
    }

    // Check first_time_only restriction
    if (discount.first_time_only && user) {
      // Check if user has previous orders
      const { count: orderCount } = await serviceSupabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'paid');

      if (orderCount && orderCount > 0) {
        return NextResponse.json(
          { error: 'This code is only valid for first-time customers', valid: false },
          { status: 400 }
        );
      }
    }

    // Build response
    const response: ValidCouponResponse = {
      valid: true,
      code: discount.code,
      discountId: discount.id,
      discountType: discount.discount_type as 'percent' | 'amount',
      discountPercent: discount.discount_percent ? Number(discount.discount_percent) : undefined,
      discountAmount: discount.discount_amount_cents ?? undefined,
      name: discount.name ?? undefined,
    };

    // Include restrictions info for UI
    if (discount.min_amount_cents > 0 || discount.expires_at) {
      response.restrictions = {
        minimumAmount: discount.min_amount_cents > 0 ? discount.min_amount_cents : undefined,
        expiresAt: discount.expires_at ?? undefined,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Coupon validation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate code',
        valid: false,
      },
      { status: 500 }
    );
  }
}
