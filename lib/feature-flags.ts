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
 * Fetches from database with in-memory cache
 * Falls back to DEFAULT_FLAGS if database unavailable
 */

// Simple in-memory cache with 60-second TTL
let cachedFlags: FeatureFlags | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function getFeatureFlags(): Promise<FeatureFlags> {
  // Return cached flags if still valid
  const now = Date.now();
  if (cachedFlags && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedFlags;
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = createServiceRoleClient();

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value');

    if (error) throw error;

    // Convert database settings to FeatureFlags object
    const flags: FeatureFlags = { ...DEFAULT_FLAGS };

    if (settings) {
      settings.forEach((setting: any) => {
        const key = setting.key as keyof FeatureFlags;
        const flagKey = key as keyof typeof flags;
        // Parse JSONB value
        if (typeof setting.value === 'boolean') {
          (flags as any)[flagKey] = setting.value;
        } else if (typeof setting.value === 'number') {
          (flags as any)[flagKey] = setting.value;
        } else {
          // JSONB is stored as JSON, need to parse
          (flags as any)[flagKey] = setting.value;
        }
      });
    }

    // Update cache
    cachedFlags = flags;
    cacheTimestamp = now;

    return flags;
  } catch (error) {
    console.error('Failed to fetch feature flags from database, using defaults:', error);
    // Fallback to defaults if database unavailable
    return DEFAULT_FLAGS;
  }
}

/**
 * Synchronous version that returns cached flags or defaults
 * Use this in client components where async is not possible
 */
export function getFeatureFlagsSync(): FeatureFlags {
  return cachedFlags || DEFAULT_FLAGS;
}

/**
 * Clear the feature flags cache
 * Call this after updating settings to force a refresh
 */
export function clearFeatureFlagsCache(): void {
  cachedFlags = null;
  cacheTimestamp = 0;
}

/**
 * Check if a specific feature is enabled (async version)
 */
export async function isFeatureEnabled(featureName: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
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
 * Synchronous version for client components
 */
export function isFeatureEnabledSync(featureName: keyof FeatureFlags): boolean {
  const flags = getFeatureFlagsSync();
  const value = flags[featureName];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  return false;
}

/**
 * Get a feature flag value (for non-boolean flags) - async version
 */
export async function getFeatureValue<K extends keyof FeatureFlags>(
  featureName: K
): Promise<FeatureFlags[K]> {
  const flags = await getFeatureFlags();
  return flags[featureName];
}

/**
 * Synchronous version for client components
 */
export function getFeatureValueSync<K extends keyof FeatureFlags>(
  featureName: K
): FeatureFlags[K] {
  const flags = getFeatureFlagsSync();
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
