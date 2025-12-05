import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/config';
import { isCurrentUserAdmin } from '@/lib/admin';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/coupons
 * List all promotion codes (source of truth)
 */
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = await getStripeClient();

    // Get promotion codes (not raw coupons) - these are customer-facing
    const promoCodes = await stripe.promotionCodes.list({
      limit: 100,
      expand: ['data.coupon'],
    });

    return NextResponse.json({
      promotionCodes: promoCodes.data.map((promo: any) => ({
        id: promo.id,
        code: promo.code,
        couponId: promo.coupon.id,
        active: promo.active,

        // Discount info from underlying coupon
        percentOff: promo.coupon.percent_off,
        amountOff: promo.coupon.amount_off,
        currency: promo.coupon.currency,
        duration: promo.coupon.duration,
        durationInMonths: promo.coupon.duration_in_months,

        // Restrictions
        firstTimeTransaction: promo.restrictions?.first_time_transaction ?? false,
        minimumAmount: promo.restrictions?.minimum_amount,
        minimumAmountCurrency: promo.restrictions?.minimum_amount_currency,

        // Usage stats
        maxRedemptions: promo.max_redemptions,
        timesRedeemed: promo.times_redeemed,
        expiresAt: promo.expires_at,

        // Meta
        createdAt: promo.created,
        metadata: promo.metadata,
      })),
    });
  } catch (error) {
    logger.error('Error listing promotion codes:', error);
    return NextResponse.json(
      { error: 'Failed to list promotion codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Create a new promotion code (auto-creates underlying coupon)
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      type, // 'percent' | 'amount'
      value, // percentage (1-100) or dollars (e.g., 10.00)
      duration, // 'once' | 'repeating' | 'forever'
      durationInMonths, // only if duration === 'repeating'

      // Promotion code restrictions
      firstTimeOnly, // boolean - restrict to first-time customers
      minimumAmount, // minimum order in dollars (e.g., 50.00)
      maxRedemptions, // max uses of this code
      expiresAt, // ISO date string
    } = body;

    // Validate required fields
    if (!code || !type || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: code, type, value' },
        { status: 400 }
      );
    }

    // Validate code format (uppercase alphanumeric, hyphens, underscores)
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 3 || cleanCode.length > 20) {
      return NextResponse.json(
        { error: 'Code must be 3-20 characters (letters, numbers, hyphens, underscores)' },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();

    // Check if promotion code already exists
    const existingCodes = await stripe.promotionCodes.list({
      code: cleanCode,
      limit: 1,
    });
    if (existingCodes.data.length > 0) {
      return NextResponse.json(
        { error: `Code "${cleanCode}" already exists` },
        { status: 400 }
      );
    }

    // Step 1: Create the underlying coupon (discount definition)
    const couponId = `COUPON_${cleanCode}_${Date.now()}`;
    const couponParams: any = {
      id: couponId,
      name: `Discount for ${cleanCode}`,
      duration: duration || 'once',
    };

    if (type === 'percent') {
      const pct = Number(value);
      if (pct < 1 || pct > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 1 and 100' },
          { status: 400 }
        );
      }
      couponParams.percent_off = pct;
    } else {
      const dollars = Number(value);
      if (dollars < 1) {
        return NextResponse.json(
          { error: 'Amount must be at least $1.00' },
          { status: 400 }
        );
      }
      couponParams.amount_off = Math.round(dollars * 100); // Convert to cents
      couponParams.currency = 'usd';
    }

    if (duration === 'repeating') {
      const months = Number(durationInMonths);
      if (!months || months < 1 || months > 36) {
        return NextResponse.json(
          { error: 'Duration must be 1-36 months for repeating discounts' },
          { status: 400 }
        );
      }
      couponParams.duration_in_months = months;
    }

    const coupon = await stripe.coupons.create(couponParams);
    logger.info(`Created Stripe coupon: ${coupon.id}`);

    // Step 2: Create the promotion code (customer-facing code with restrictions)
    const promoParams: any = {
      coupon: coupon.id,
      code: cleanCode,
      active: true,
    };

    // Add restrictions
    const restrictions: any = {};

    if (firstTimeOnly) {
      restrictions.first_time_transaction = true;
    }

    if (minimumAmount) {
      const minCents = Math.round(Number(minimumAmount) * 100);
      if (minCents >= 100) {
        restrictions.minimum_amount = minCents;
        restrictions.minimum_amount_currency = 'usd';
      }
    }

    if (Object.keys(restrictions).length > 0) {
      promoParams.restrictions = restrictions;
    }

    // Max redemptions
    if (maxRedemptions) {
      const max = Number(maxRedemptions);
      if (max > 0) {
        promoParams.max_redemptions = max;
      }
    }

    // Expiration
    if (expiresAt) {
      const expiry = new Date(expiresAt);
      if (expiry > new Date()) {
        promoParams.expires_at = Math.floor(expiry.getTime() / 1000);
      }
    }

    const promotionCode = await stripe.promotionCodes.create(promoParams);
    logger.info(`Created Stripe promotion code: ${promotionCode.code} (${promotionCode.id})`);

    return NextResponse.json({
      success: true,
      promotionCode: {
        id: promotionCode.id,
        code: promotionCode.code,
        couponId: coupon.id,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off,
        duration: coupon.duration,
        firstTimeOnly: restrictions.first_time_transaction ?? false,
        minimumAmount: restrictions.minimum_amount,
        maxRedemptions: promotionCode.max_redemptions,
        expiresAt: promotionCode.expires_at,
      },
    });
  } catch (error: any) {
    logger.error('Error creating promotion code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create promotion code' },
      { status: 500 }
    );
  }
}
