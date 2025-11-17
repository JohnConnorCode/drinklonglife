import { createServiceRoleClient } from './supabase/server';
import { logger } from './logger';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  stripe_product_id: string;
  tier_key: string | null;
  size_key: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_price_id: string;
  stripe_product_id: string;
  size_key: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Check if user has an active subscription to a specific tier
 */
export async function isUserSubscribedToTier(
  userId: string,
  tierKey: string
): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('tier_key', tierKey)
      .in('status', ['active', 'trialing'])
      .limit(1);

    if (error) {
      logger.error(`Error checking subscription for user ${userId}:`, error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    logger.error(`Error checking subscription for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if user has any active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .limit(1);

    if (error) {
      logger.error(`Error checking active subscription for user ${userId}:`, error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    logger.error(`Error checking active subscription for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if user has purchased a specific variant (size)
 */
export async function hasUserPurchasedVariant(
  userId: string,
  sizeKey: string
): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('size_key', sizeKey)
      .eq('status', 'succeeded')
      .limit(1);

    if (error) {
      logger.error(`Error checking variant purchase for user ${userId}:`, error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    logger.error(`Error checking variant purchase for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if user has made a one-time purchase with a specific Stripe Price ID
 */
export async function hasOneTimePurchase(
  userId: string,
  stripePriceId: string
): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('stripe_price_id', stripePriceId)
      .eq('status', 'succeeded')
      .limit(1);

    if (error) {
      logger.error(`Error checking one-time purchase for user ${userId}:`, error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    logger.error(`Error checking one-time purchase for user ${userId}:`, error);
    return false;
  }
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching subscriptions for user ${userId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(`Error fetching subscriptions for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error} = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching purchases for user ${userId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(`Error fetching purchases for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get user's active subscription (if any)
 */
export async function getActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      logger.error(`Error fetching active subscription for user ${userId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error(`Error fetching active subscription for user ${userId}:`, error);
    return null;
  }
}

/**
 * Check if subscription is about to expire (within 7 days)
 */
export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  try {
    const subscription = await getActiveSubscription(userId);

    if (!subscription || !subscription.current_period_end) {
      return false;
    }

    const expiryDate = new Date(subscription.current_period_end);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  } catch (error) {
    logger.error(`Error checking subscription expiry for user ${userId}:`, error);
    return false;
  }
}

/**
 * Get subscription by Stripe Subscription ID
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error(`Error fetching subscription ${stripeSubscriptionId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error(`Error fetching subscription ${stripeSubscriptionId}:`, error);
    return null;
  }
}

/**
 * Upsert subscription from Stripe webhook data
 */
export async function upsertSubscription(data: {
  userId?: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeProductId: string;
  tierKey?: string;
  sizeKey?: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
}): Promise<Subscription | null> {
  try {
    const supabase = createServiceRoleClient();

    // If no userId provided, try to find user by Stripe customer ID
    let userId = data.userId;
    if (!userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', data.stripeCustomerId)
        .single();

      if (!profile) {
        logger.error(
          `Cannot upsert subscription: no user found for customer ${data.stripeCustomerId}`
        );
        return null;
      }

      userId = profile.id;
    }

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_price_id: data.stripePriceId,
      stripe_product_id: data.stripeProductId,
      tier_key: data.tierKey || null,
      size_key: data.sizeKey || null,
      status: data.status,
      current_period_start: data.currentPeriodStart?.toISOString() || null,
      current_period_end: data.currentPeriodEnd?.toISOString() || null,
      cancel_at_period_end: data.cancelAtPeriodEnd ?? false,
      canceled_at: data.canceledAt?.toISOString() || null,
    };

    const { data: result, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error upserting subscription:', error);
      return null;
    }

    return result;
  } catch (error) {
    logger.error('Error upserting subscription:', error);
    return null;
  }
}

/**
 * Create a purchase record
 */
export async function createPurchase(data: {
  userId: string;
  stripePriceId: string;
  stripeProductId: string;
  sizeKey?: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string;
}): Promise<Purchase | null> {
  try {
    const supabase = createServiceRoleClient();

    const purchaseData = {
      user_id: data.userId,
      stripe_price_id: data.stripePriceId,
      stripe_product_id: data.stripeProductId,
      size_key: data.sizeKey || null,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      stripe_payment_intent_id: data.stripePaymentIntentId || null,
    };

    const { data: result, error } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating purchase:', error);
      return null;
    }

    return result;
  } catch (error) {
    logger.error('Error creating purchase:', error);
    return null;
  }
}

/**
 * Update purchase status
 */
export async function updatePurchaseStatus(
  stripePaymentIntentId: string,
  status: string
): Promise<Purchase | null> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .select()
      .single();

    if (error) {
      logger.error(`Error updating purchase ${stripePaymentIntentId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error(`Error updating purchase ${stripePaymentIntentId}:`, error);
    return null;
  }
}
