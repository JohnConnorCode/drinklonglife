/**
 * Checkout Helpers
 *
 * Reusable functions for creating Stripe checkout sessions.
 */

import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export interface CheckoutSessionOptions {
  userId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  couponId?: string;
  allowPromotionCodes?: boolean;
  quantity?: number;
}

/**
 * Create a Stripe checkout session for a subscription plan
 *
 * @param options - Checkout configuration
 * @returns Stripe checkout session
 */
export async function createCheckoutSessionForPlan(
  options: CheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const supabase = createServerClient();

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', options.userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // Prepare session parameters
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: options.mode,
    line_items: [
      {
        price: options.priceId,
        quantity: options.quantity || 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    customer_email: profile.email,
    allow_promotion_codes: options.allowPromotionCodes || false,
    metadata: {
      userId: options.userId,
      ...options.metadata,
    },
  };

  // Use existing Stripe customer if available
  if (profile.stripe_customer_id) {
    sessionParams.customer = profile.stripe_customer_id;
    delete sessionParams.customer_email;
  }

  // Apply coupon if provided
  if (options.couponId) {
    if (options.mode === 'subscription') {
      sessionParams.discounts = [{ coupon: options.couponId }];
    } else {
      sessionParams.discounts = [{ coupon: options.couponId }];
    }
  }

  // Create the session
  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Create a Stripe checkout session for a one-time purchase
 *
 * @param userId - User ID
 * @param priceId - Stripe Price ID
 * @param successUrl - URL to redirect on success
 * @param cancelUrl - URL to redirect on cancel
 * @param metadata - Optional metadata
 * @param quantity - Item quantity (default: 1)
 * @returns Stripe checkout session
 */
export async function createCheckoutSessionForOneTimeItem(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
  quantity?: number
): Promise<Stripe.Checkout.Session> {
  return createCheckoutSessionForPlan({
    userId,
    priceId,
    mode: 'payment',
    successUrl,
    cancelUrl,
    metadata,
    quantity,
    allowPromotionCodes: true,
  });
}

/**
 * Apply a promo code to an existing checkout session
 *
 * Note: Stripe doesn't allow modifying checkout sessions after creation.
 * Instead, create a new session with the discount applied.
 *
 * @param options - Original checkout options
 * @param promoCode - Promo code or coupon ID
 * @returns Stripe checkout session with discount applied
 */
export async function createCheckoutSessionWithPromoCode(
  options: CheckoutSessionOptions,
  promoCode: string
): Promise<Stripe.Checkout.Session> {
  return createCheckoutSessionForPlan({
    ...options,
    couponId: promoCode,
  });
}

/**
 * Get all active promo codes from Stripe
 *
 * @returns List of active Stripe promotion codes
 */
export async function getActivePromoCodes(): Promise<Stripe.PromotionCode[]> {
  const promoCodes = await stripe.promotionCodes.list({
    active: true,
    limit: 100,
  });

  return promoCodes.data;
}

/**
 * Validate a promo code
 *
 * @param code - Promo code string
 * @returns Valid Stripe promotion code or null
 */
export async function validatePromoCode(
  code: string
): Promise<Stripe.PromotionCode | null> {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      return null;
    }

    const promoCode = promoCodes.data[0];

    // Check if promo code has expired or reached usage limit
    if (promoCode.restrictions?.first_time_transaction) {
      // Additional validation can be added here
    }

    return promoCode;
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
}

/**
 * Create a tier upgrade checkout session
 *
 * @param userId - User ID
 * @param newTier - Target tier
 * @param successUrl - Success redirect URL
 * @param cancelUrl - Cancel redirect URL
 * @returns Stripe checkout session
 */
export async function createTierUpgradeCheckout(
  userId: string,
  newTier: 'affiliate' | 'partner' | 'vip',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session | null> {
  // Tier upgrade pricing (example - adjust based on your pricing)
  const tierPricing: Record<string, string> = {
    affiliate: process.env.STRIPE_AFFILIATE_TIER_PRICE_ID || '',
    partner: process.env.STRIPE_PARTNER_TIER_PRICE_ID || '',
    vip: process.env.STRIPE_VIP_TIER_PRICE_ID || '',
  };

  const priceId = tierPricing[newTier];

  if (!priceId) {
    console.error(`No price ID configured for tier: ${newTier}`);
    return null;
  }

  return createCheckoutSessionForPlan({
    userId,
    priceId,
    mode: 'payment', // One-time payment for tier upgrade
    successUrl,
    cancelUrl,
    metadata: {
      type: 'tier_upgrade',
      newTier,
    },
  });
}

/**
 * Create an upsell checkout session
 *
 * @param userId - User ID
 * @param upsellPriceId - Stripe Price ID for the upsell
 * @param originalPurchase - Original purchase info (for tracking)
 * @param successUrl - Success redirect URL
 * @param cancelUrl - Cancel redirect URL
 * @returns Stripe checkout session
 */
export async function createUpsellCheckout(
  userId: string,
  upsellPriceId: string,
  originalPurchase: {
    sessionId?: string;
    subscriptionId?: string;
    plan?: string;
  },
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return createCheckoutSessionForPlan({
    userId,
    priceId: upsellPriceId,
    mode: 'payment',
    successUrl,
    cancelUrl,
    metadata: {
      type: 'upsell',
      originalSessionId: originalPurchase.sessionId || '',
      originalSubscriptionId: originalPurchase.subscriptionId || '',
      originalPlan: originalPurchase.plan || '',
    },
    allowPromotionCodes: true,
  });
}

/**
 * Calculate savings for yearly vs monthly billing
 *
 * @param monthlyPrice - Monthly price in cents
 * @param yearlyPrice - Yearly price in cents
 * @returns Savings info
 */
export function calculateYearlySavings(
  monthlyPrice: number,
  yearlyPrice: number
): {
  savingsAmount: number;
  savingsPercentage: number;
  monthlyCostIfYearly: number;
} {
  const annualCostIfMonthly = monthlyPrice * 12;
  const savingsAmount = annualCostIfYearly - yearlyPrice;
  const savingsPercentage = Math.round((savingsAmount / annualCostIfYearly) * 100);
  const monthlyCostIfYearly = yearlyPrice / 12;

  return {
    savingsAmount,
    savingsPercentage,
    monthlyCostIfYearly,
  };
}
