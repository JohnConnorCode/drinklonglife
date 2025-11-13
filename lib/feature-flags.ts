/**
 * Feature Flags Configuration
 *
 * Central control for all growth and monetization features.
 * Change these values to enable/disable features across the entire app.
 */

export interface FeatureFlags {
  // Referral System
  referrals_enabled: boolean;
  referrals_reward_percentage: number; // e.g., 20 for "20% off"
  referrals_show_leaderboard: boolean;

  // Upsells & Cross-sells
  upsells_enabled: boolean;
  upsells_show_on_thank_you: boolean;

  // Tier Upgrades
  tier_upgrades_enabled: boolean;
  tier_upgrades_show_in_nav: boolean;

  // Profile Completion
  profile_completion_enabled: boolean;
  profile_completion_min_percentage: number; // Minimum % before hiding prompts

  // Analytics & Tracking
  analytics_enabled: boolean;
  analytics_track_page_views: boolean;
  analytics_track_events: boolean;

  // Pricing & Checkout
  pricing_show_yearly_toggle: boolean;
  pricing_show_savings: boolean;
  pricing_allow_one_time_purchases: boolean;

  // UI Polish
  show_toast_notifications: boolean;
  show_manage_subscription_in_nav: boolean;
}

// Default feature flags (production-ready defaults)
const DEFAULT_FLAGS: FeatureFlags = {
  // Referral System
  referrals_enabled: true,
  referrals_reward_percentage: 20,
  referrals_show_leaderboard: true,

  // Upsells & Cross-sells
  upsells_enabled: true,
  upsells_show_on_thank_you: true,

  // Tier Upgrades
  tier_upgrades_enabled: true,
  tier_upgrades_show_in_nav: true,

  // Profile Completion
  profile_completion_enabled: true,
  profile_completion_min_percentage: 80,

  // Analytics & Tracking
  analytics_enabled: true,
  analytics_track_page_views: true,
  analytics_track_events: true,

  // Pricing & Checkout
  pricing_show_yearly_toggle: true,
  pricing_show_savings: true,
  pricing_allow_one_time_purchases: true,

  // UI Polish
  show_toast_notifications: true,
  show_manage_subscription_in_nav: true,
};

/**
 * Get current feature flags
 *
 * In a more advanced setup, these could be:
 * - Stored in database (for runtime changes)
 * - Fetched from environment variables
 * - Cached in Redis
 * - Managed via admin UI
 *
 * For now, they're in-memory constants for simplicity.
 */
export function getFeatureFlags(): FeatureFlags {
  // TODO: In production, you might want to:
  // 1. Fetch from database
  // 2. Override with environment variables
  // 3. Cache the result

  return DEFAULT_FLAGS;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(featureName: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  const value = flags[featureName];

  // For boolean flags, return directly
  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric flags, consider "enabled" if > 0
  if (typeof value === 'number') {
    return value > 0;
  }

  return false;
}

/**
 * Get a feature flag value (for non-boolean flags)
 */
export function getFeatureValue<K extends keyof FeatureFlags>(
  featureName: K
): FeatureFlags[K] {
  const flags = getFeatureFlags();
  return flags[featureName];
}

/**
 * Example usage:
 *
 * if (isFeatureEnabled('referrals_enabled')) {
 *   // Show referral system
 * }
 *
 * const rewardPercentage = getFeatureValue('referrals_reward_percentage');
 */
