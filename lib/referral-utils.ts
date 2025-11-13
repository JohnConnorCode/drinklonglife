/**
 * Referral Utilities
 *
 * Helper functions for the referral system.
 */

import { createServerClient } from '@/lib/supabase/server';
import { isFeatureEnabled, getFeatureValue } from '@/lib/feature-flags';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export interface Referral {
  id: string;
  referrer_id: string;
  referral_code: string;
  referred_user_id?: string;
  completed_purchase: boolean;
  reward_issued: boolean;
  reward_type?: string;
  reward_value?: string;
  created_at: string;
  completed_at?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedPurchases: number;
  pendingRewards: number;
  issuedRewards: number;
  conversionRate: number;
}

/**
 * Get a referral by code
 *
 * @param code - Referral code
 * @returns Referral | null
 */
export async function getReferralByCode(code: string): Promise<Referral | null> {
  if (!isFeatureEnabled('referrals_enabled')) {
    return null;
  }

  const supabase = createServerClient();

  const { data: referral, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error || !referral) {
    return null;
  }

  return referral as Referral;
}

/**
 * Create a referral entry for a new user
 *
 * Note: This is usually handled by the database trigger,
 * but this function can be used for manual creation.
 *
 * @param userId - User ID
 * @param code - Referral code (optional - auto-generated if not provided)
 * @returns Referral | null
 */
export async function createReferralForUser(
  userId: string,
  code?: string
): Promise<Referral | null> {
  const supabase = createServerClient();

  // Generate code if not provided
  const referralCode = code || generateReferralCode();

  const { data: referral, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: userId,
      referral_code: referralCode.toUpperCase(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create referral:', error);
    return null;
  }

  return referral as Referral;
}

/**
 * Generate a unique referral code
 *
 * Format: 2 letters + 6 numbers (e.g., "AB123456")
 *
 * @returns string
 */
function generateReferralCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let code = '';

  // 2 random letters
  code += letters.charAt(Math.floor(Math.random() * letters.length));
  code += letters.charAt(Math.floor(Math.random() * letters.length));

  // 6 random numbers
  for (let i = 0; i < 6; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

/**
 * Track a referral (when someone signs up via a referral link)
 *
 * @param referralCode - Referral code
 * @param newUserId - ID of the newly signed up user
 * @returns boolean - Success status
 */
export async function trackReferral(
  referralCode: string,
  newUserId: string
): Promise<boolean> {
  if (!isFeatureEnabled('referrals_enabled')) {
    return false;
  }

  const supabase = createServerClient();

  // Update the referral entry with the new user
  const { error: updateError } = await supabase
    .from('referrals')
    .update({ referred_user_id: newUserId })
    .eq('referral_code', referralCode.toUpperCase())
    .is('referred_user_id', null); // Only if not already claimed

  if (updateError) {
    console.error('Failed to track referral:', updateError);
    return false;
  }

  // Update the new user's profile to track who referred them
  const referral = await getReferralByCode(referralCode);

  if (referral) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ referred_by: referral.referrer_id })
      .eq('id', newUserId);

    if (profileError) {
      console.error('Failed to update referred_by:', profileError);
    }
  }

  return true;
}

/**
 * Complete a referral (mark as completed and issue rewards)
 *
 * Called when a referred user makes their first purchase.
 *
 * @param referredUserId - ID of the user who made a purchase
 * @returns boolean - Success status
 */
export async function completeReferral(referredUserId: string): Promise<boolean> {
  if (!isFeatureEnabled('referrals_enabled')) {
    return false;
  }

  const supabase = createServerClient();

  // Find the referral
  const { data: referral, error: referralError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_user_id', referredUserId)
    .eq('completed_purchase', false)
    .single();

  if (referralError || !referral) {
    // No referral found or already completed
    return false;
  }

  // Mark referral as completed
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      completed_purchase: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  if (updateError) {
    console.error('Failed to complete referral:', updateError);
    return false;
  }

  // Issue rewards
  await issueReferralRewards(referral.id, referral.referrer_id, referredUserId);

  return true;
}

/**
 * Issue referral rewards to both referrer and referee
 *
 * @param referralId - Referral ID
 * @param referrerId - Referrer user ID
 * @param refereeId - Referee user ID
 * @returns boolean - Success status
 */
async function issueReferralRewards(
  referralId: string,
  referrerId: string,
  refereeId: string
): Promise<boolean> {
  const supabase = createServerClient();

  try {
    // Get reward configuration (from feature flags or Sanity)
    const rewardPercentage = getFeatureValue('referrals_reward_percentage');

    // Create discount codes in Stripe
    const referrerCoupon = await createReferralCoupon(rewardPercentage, 'referrer');
    const refereeCoupon = await createReferralCoupon(rewardPercentage, 'referee');

    // Apply discount to referrer
    await applyDiscountToUser(referrerId, referrerCoupon.id, 'referral_reward');

    // Apply discount to referee
    await applyDiscountToUser(refereeId, refereeCoupon.id, 'referral_reward');

    // Mark rewards as issued
    await supabase
      .from('referrals')
      .update({
        reward_issued: true,
        reward_type: 'discount_code',
        reward_value: `${rewardPercentage}%`,
      })
      .eq('id', referralId);

    return true;
  } catch (error) {
    console.error('Failed to issue referral rewards:', error);
    return false;
  }
}

/**
 * Create a Stripe coupon for referral rewards
 *
 * @param percentage - Discount percentage
 * @param recipientType - 'referrer' or 'referee'
 * @returns Stripe coupon
 */
async function createReferralCoupon(
  percentage: number,
  recipientType: 'referrer' | 'referee'
): Promise<Stripe.Coupon> {
  const coupon = await stripe.coupons.create({
    percent_off: percentage,
    duration: 'once',
    name: `Referral Reward - ${recipientType}`,
    metadata: {
      type: 'referral_reward',
      recipient: recipientType,
    },
  });

  return coupon;
}

/**
 * Apply a discount code to a user's account
 *
 * @param userId - User ID
 * @param couponId - Stripe coupon ID
 * @param source - Source of the discount
 * @returns boolean - Success status
 */
async function applyDiscountToUser(
  userId: string,
  couponId: string,
  source: string
): Promise<boolean> {
  const supabase = createServerClient();

  // Add to user_discounts table
  const { error } = await supabase.from('user_discounts').insert({
    user_id: userId,
    discount_code: couponId,
    source,
    active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  });

  if (error) {
    console.error('Failed to apply discount:', error);
    return false;
  }

  return true;
}

/**
 * Get referral stats for a user
 *
 * @param userId - User ID
 * @returns ReferralStats
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createServerClient();

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId);

  if (error || !referrals) {
    return {
      totalReferrals: 0,
      completedPurchases: 0,
      pendingRewards: 0,
      issuedRewards: 0,
      conversionRate: 0,
    };
  }

  const totalReferrals = referrals.filter((r) => r.referred_user_id).length;
  const completedPurchases = referrals.filter((r) => r.completed_purchase).length;
  const pendingRewards = referrals.filter(
    (r) => r.completed_purchase && !r.reward_issued
  ).length;
  const issuedRewards = referrals.filter((r) => r.reward_issued).length;
  const conversionRate =
    totalReferrals > 0 ? Math.round((completedPurchases / totalReferrals) * 100) : 0;

  return {
    totalReferrals,
    completedPurchases,
    pendingRewards,
    issuedRewards,
    conversionRate,
  };
}

/**
 * Get referral leaderboard (top referrers)
 *
 * @param limit - Number of results (default: 10)
 * @returns Array of user IDs with referral counts
 */
export async function getReferralLeaderboard(
  limit: number = 10
): Promise<Array<{ userId: string; count: number; completedCount: number }>> {
  if (!isFeatureEnabled('referrals_show_leaderboard')) {
    return [];
  }

  const supabase = createServerClient();

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('referrer_id, completed_purchase')
    .not('referred_user_id', 'is', null);

  if (error || !referrals) {
    return [];
  }

  // Group by referrer
  const groupedMap = new Map<string, { count: number; completedCount: number }>();

  referrals.forEach((r) => {
    const existing = groupedMap.get(r.referrer_id) || { count: 0, completedCount: 0 };
    existing.count += 1;
    if (r.completed_purchase) {
      existing.completedCount += 1;
    }
    groupedMap.set(r.referrer_id, existing);
  });

  // Convert to array and sort by completed count
  const leaderboard = Array.from(groupedMap.entries())
    .map(([userId, stats]) => ({
      userId,
      count: stats.count,
      completedCount: stats.completedCount,
    }))
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, limit);

  return leaderboard;
}

/**
 * Get full referral leaderboard with user details
 *
 * @param limit - Number of results (default: 10)
 * @returns Array of users with referral stats
 */
export async function getReferralLeaderboardWithUsers(limit: number = 10): Promise<
  Array<{
    userId: string;
    userName: string;
    email: string;
    count: number;
    completedCount: number;
  }>
> {
  const leaderboard = await getReferralLeaderboard(limit);
  const supabase = createServerClient();

  // Fetch user details for each user in the leaderboard
  const userIds = leaderboard.map((entry) => entry.userId);

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, name, email')
    .in('id', userIds);

  if (error || !users) {
    return [];
  }

  // Merge user details with referral stats
  const result = leaderboard.map((entry) => {
    const user = users.find((u) => u.id === entry.userId);
    return {
      userId: entry.userId,
      userName: user?.full_name || user?.name || 'Unknown',
      email: user?.email || '',
      count: entry.count,
      completedCount: entry.completedCount,
    };
  });

  return result;
}
