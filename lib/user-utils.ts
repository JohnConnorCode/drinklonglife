/**
 * User Utilities
 *
 * Helper functions for working with user profiles, tier benefits, and completion tracking.
 */

import { createServerClient } from '@/lib/supabase/server';
import { isFeatureEnabledSync, getFeatureValueSync } from '@/lib/feature-flags';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  stripe_customer_id?: string;
  subscription_status?: string;
  current_plan?: string;
  partnership_tier?: string;
  is_admin?: boolean;
  referral_code?: string;
  referred_by?: string;
  completion_percentage?: number;
  phone?: string;
  shipping_address?: any;
  preferences?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileCompletionChecklist {
  percentage: number;
  isComplete: boolean;
  items: Array<{
    label: string;
    completed: boolean;
    required: boolean;
  }>;
}

export interface TierBenefits {
  tier: string;
  tierName: string;
  hasAccess: {
    affiliate: boolean;
    partner: boolean;
    vip: boolean;
  };
}

/**
 * Get the currently authenticated user's profile
 *
 * @returns UserProfile | null
 */
export async function getActiveUser(): Promise<UserProfile | null> {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return profile as UserProfile;
}

/**
 * Get a user's profile by ID
 *
 * @param userId - The user's ID
 * @returns UserProfile | null
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const supabase = createServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return profile as UserProfile;
}

/**
 * Calculate profile completion percentage and checklist
 *
 * @param profile - User profile
 * @returns ProfileCompletionChecklist
 */
export function calculateProfileCompletion(
  profile: UserProfile
): ProfileCompletionChecklist {
  const items = [
    {
      label: 'Full name',
      completed: !!(profile.full_name && profile.full_name.trim().length > 0),
      required: true,
    },
    {
      label: 'Phone number',
      completed: !!(profile.phone && profile.phone.trim().length > 0),
      required: false,
    },
    {
      label: 'Shipping address',
      completed: !!profile.shipping_address,
      required: false,
    },
    {
      label: 'Preferences',
      completed: !!profile.preferences,
      required: false,
    },
    {
      label: 'Stripe account',
      completed: !!profile.stripe_customer_id,
      required: false,
    },
    {
      label: 'Active subscription',
      completed: !!(
        profile.subscription_status &&
        ['active', 'trialing'].includes(profile.subscription_status)
      ),
      required: false,
    },
    {
      label: 'Partnership tier',
      completed: !!(
        profile.partnership_tier && profile.partnership_tier !== 'none'
      ),
      required: false,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  // Check feature flag for minimum percentage
  const minPercentage = getFeatureValueSync('profile_completion_min_percentage');
  const isComplete = percentage >= minPercentage;

  return {
    percentage,
    isComplete,
    items,
  };
}

/**
 * Get tier benefits and access levels for a user
 *
 * @param profile - User profile
 * @returns TierBenefits
 */
export function getUserTierBenefits(profile: UserProfile): TierBenefits {
  const tier = profile.partnership_tier || 'none';

  const tierHierarchy = {
    none: { affiliate: false, partner: false, vip: false },
    affiliate: { affiliate: true, partner: false, vip: false },
    partner: { affiliate: true, partner: true, vip: false },
    vip: { affiliate: true, partner: true, vip: true },
  };

  const tierNames: Record<string, string> = {
    none: 'Standard',
    affiliate: 'Affiliate',
    partner: 'Partner',
    vip: 'VIP',
  };

  return {
    tier,
    tierName: tierNames[tier] || 'Standard',
    hasAccess: tierHierarchy[tier as keyof typeof tierHierarchy] || tierHierarchy.none,
  };
}

/**
 * Check if user has access to a specific tier level
 *
 * @param profile - User profile
 * @param requiredTier - Required tier ('affiliate', 'partner', 'vip')
 * @returns boolean
 */
export function hasTierAccess(
  profile: UserProfile,
  requiredTier: 'affiliate' | 'partner' | 'vip'
): boolean {
  const benefits = getUserTierBenefits(profile);
  return benefits.hasAccess[requiredTier];
}

/**
 * Check if user should see profile completion prompts
 *
 * @param profile - User profile
 * @returns boolean
 */
export function shouldShowProfileCompletion(profile: UserProfile): boolean {
  // Check if feature is enabled
  if (!isFeatureEnabledSync('profile_completion_enabled')) {
    return false;
  }

  const completion = calculateProfileCompletion(profile);
  return !completion.isComplete;
}

/**
 * Get user's referral code (generates one if missing)
 *
 * @param userId - User ID
 * @returns string | null
 */
export async function getUserReferralCode(userId: string): Promise<string | null> {
  const supabase = createServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch referral code:', error);
    return null;
  }

  return profile.referral_code || null;
}

/**
 * Check if user was referred by someone
 *
 * @param userId - User ID
 * @returns string | null - ID of the referrer, or null
 */
export async function getUserReferrer(userId: string): Promise<string | null> {
  const supabase = createServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch referrer:', error);
    return null;
  }

  return profile.referred_by || null;
}

/**
 * Update user's profile completion percentage
 *
 * @param userId - User ID
 * @returns number | null - Updated percentage
 */
export async function updateProfileCompletionPercentage(
  userId: string
): Promise<number | null> {
  const profile = await getUserById(userId);

  if (!profile) {
    return null;
  }

  const completion = calculateProfileCompletion(profile);
  const supabase = createServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ completion_percentage: completion.percentage })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update completion percentage:', error);
    return null;
  }

  return completion.percentage;
}
