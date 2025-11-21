import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface ValidateCouponRequest {
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    // Support both authenticated and guest users
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // CRITICAL SECURITY: Rate limiting to prevent brute force attacks
    // For authenticated users: rate limit by user ID
    // For guests: rate limit by IP address
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const rateLimitKey = user
      ? `coupon-validate:user:${user.id}`
      : `coupon-validate:ip:${clientIp}`;

    // Stricter rate limit for guests (5 attempts vs 10 for auth users)
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

    const { code }: ValidateCouponRequest = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Coupon code is required', valid: false },
        { status: 400 }
      );
    }

    // Get dynamic Stripe client based on current mode (test/production)
    const stripeClient = await getStripeClient();

    // Validate coupon code
    try {
      const coupon = await stripeClient.coupons.retrieve(code.toUpperCase());

      if (!coupon.valid) {
        return NextResponse.json(
          { error: 'This coupon is no longer valid', valid: false },
          { status: 400 }
        );
      }

      // Return coupon details
      return NextResponse.json({
        code: coupon.id,
        valid: true,
        discountPercent: coupon.percent_off ?? undefined,
        discountAmount: coupon.amount_off ?? undefined,
      });
    } catch (error: any) {
      // Coupon not found or invalid
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { error: 'Invalid coupon code', valid: false },
          { status: 404 }
        );
      }

      throw error;
    }
  } catch (error) {
    logger.error('Coupon validation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate coupon',
        details: error instanceof Error ? error.message : 'Unknown error',
        valid: false,
      },
      { status: 500 }
    );
  }
}
