/**
 * Analytics & Event Tracking
 *
 * Lightweight analytics wrapper for tracking key events.
 * Integrates with Vercel Analytics or custom analytics solution.
 */

import { isFeatureEnabled } from '@/lib/feature-flags';

export type AnalyticsEvent =
  // User events
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'profile_updated'
  | 'profile_completed'

  // Subscription events
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'invoice_paid'
  | 'invoice_failed'

  // Purchase events
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'purchase_completed'

  // Referral events
  | 'referral_link_shared'
  | 'referral_signup'
  | 'referral_purchase_completed'
  | 'referral_reward_issued'

  // Upsell events
  | 'upsell_viewed'
  | 'upsell_clicked'
  | 'upsell_purchased'
  | 'upsell_dismissed'

  // Tier events
  | 'tier_upgraded'
  | 'tier_downgraded'
  | 'tier_upgrade_viewed'

  // Engagement events
  | 'page_viewed'
  | 'cta_clicked'
  | 'video_played'
  | 'document_downloaded';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 *
 * @param event - Event name
 * @param properties - Event properties
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (!isFeatureEnabled('analytics_enabled')) {
    return;
  }

  if (!isFeatureEnabled('analytics_track_events')) {
    return;
  }

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }

    // Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', event, properties);
    }

    // You can add other analytics providers here
    // Examples:
    // - Google Analytics: gtag('event', event, properties);
    // - Mixpanel: mixpanel.track(event, properties);
    // - PostHog: posthog.capture(event, properties);
    // - Segment: analytics.track(event, properties);

  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track a page view
 *
 * @param url - Page URL
 * @param properties - Additional properties
 */
export function trackPageView(url: string, properties?: AnalyticsProperties): void {
  if (!isFeatureEnabled('analytics_enabled')) {
    return;
  }

  if (!isFeatureEnabled('analytics_track_page_views')) {
    return;
  }

  trackEvent('page_viewed', {
    url,
    ...properties,
  });
}

/**
 * Track user signup
 *
 * @param userId - User ID
 * @param method - Signup method (email, google, etc.)
 * @param referralCode - Referral code (if applicable)
 */
export function trackUserSignup(
  userId: string,
  method: string,
  referralCode?: string
): void {
  trackEvent('user_signup', {
    userId,
    method,
    referralCode,
    timestamp: Date.now(),
  });

  // Track referral signup if applicable
  if (referralCode) {
    trackEvent('referral_signup', {
      userId,
      referralCode,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track user login
 *
 * @param userId - User ID
 * @param method - Login method
 */
export function trackUserLogin(userId: string, method: string): void {
  trackEvent('user_login', {
    userId,
    method,
    timestamp: Date.now(),
  });
}

/**
 * Track subscription event
 *
 * @param event - Subscription event type
 * @param userId - User ID
 * @param subscriptionId - Stripe subscription ID
 * @param plan - Plan name
 * @param amount - Amount in cents
 */
export function trackSubscription(
  event: Extract<
    AnalyticsEvent,
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_canceled'
    | 'subscription_renewed'
  >,
  userId: string,
  subscriptionId: string,
  plan?: string,
  amount?: number
): void {
  trackEvent(event, {
    userId,
    subscriptionId,
    plan,
    amount,
    timestamp: Date.now(),
  });
}

/**
 * Track purchase completion
 *
 * @param userId - User ID
 * @param sessionId - Stripe checkout session ID
 * @param amount - Amount in cents
 * @param items - Purchased items
 */
export function trackPurchase(
  userId: string,
  sessionId: string,
  amount: number,
  items?: Array<{ name: string; quantity: number; price: number }>
): void {
  trackEvent('purchase_completed', {
    userId,
    sessionId,
    amount,
    currency: 'usd',
    itemCount: items?.length || 0,
    timestamp: Date.now(),
  });
}

/**
 * Track checkout started
 *
 * @param userId - User ID
 * @param plan - Plan or product name
 * @param amount - Amount in cents
 */
export function trackCheckoutStarted(
  userId: string,
  plan: string,
  amount: number
): void {
  trackEvent('checkout_started', {
    userId,
    plan,
    amount,
    timestamp: Date.now(),
  });
}

/**
 * Track referral event
 *
 * @param event - Referral event type
 * @param userId - User ID
 * @param referralCode - Referral code
 * @param properties - Additional properties
 */
export function trackReferralEvent(
  event: Extract<
    AnalyticsEvent,
    | 'referral_link_shared'
    | 'referral_signup'
    | 'referral_purchase_completed'
    | 'referral_reward_issued'
  >,
  userId: string,
  referralCode: string,
  properties?: AnalyticsProperties
): void {
  trackEvent(event, {
    userId,
    referralCode,
    ...properties,
    timestamp: Date.now(),
  });
}

/**
 * Track upsell event
 *
 * @param event - Upsell event type
 * @param userId - User ID
 * @param upsellId - Upsell offer ID
 * @param properties - Additional properties
 */
export function trackUpsellEvent(
  event: Extract<
    AnalyticsEvent,
    'upsell_viewed' | 'upsell_clicked' | 'upsell_purchased' | 'upsell_dismissed'
  >,
  userId: string,
  upsellId: string,
  properties?: AnalyticsProperties
): void {
  trackEvent(event, {
    userId,
    upsellId,
    ...properties,
    timestamp: Date.now(),
  });
}

/**
 * Track tier change
 *
 * @param event - Tier event type
 * @param userId - User ID
 * @param oldTier - Previous tier
 * @param newTier - New tier
 */
export function trackTierChange(
  event: Extract<AnalyticsEvent, 'tier_upgraded' | 'tier_downgraded'>,
  userId: string,
  oldTier: string,
  newTier: string
): void {
  trackEvent(event, {
    userId,
    oldTier,
    newTier,
    timestamp: Date.now(),
  });
}

/**
 * Client-side hook for tracking page views
 *
 * Usage in a component:
 * useEffect(() => {
 *   trackPageView(window.location.pathname);
 * }, []);
 */
export function useAnalyticsPageView() {
  if (typeof window !== 'undefined') {
    trackPageView(window.location.pathname);
  }
}

/**
 * Server-side event tracking (for API routes, webhooks, etc.)
 *
 * @param event - Event name
 * @param properties - Event properties
 */
export async function trackServerEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): Promise<void> {
  if (!isFeatureEnabled('analytics_enabled')) {
    return;
  }

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Server Analytics]', event, properties);
    }

    // Send to analytics API
    // Example: POST to /api/analytics with event data
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event, properties, timestamp: Date.now() }),
    // });

    // For now, just log
    console.log('[Analytics]', event, properties);
  } catch (error) {
    console.error('Server analytics error:', error);
  }
}

/**
 * Identify a user (for user-level analytics)
 *
 * @param userId - User ID
 * @param traits - User traits/properties
 */
export function identifyUser(userId: string, traits?: AnalyticsProperties): void {
  if (!isFeatureEnabled('analytics_enabled')) {
    return;
  }

  try {
    // Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('identify', userId, traits);
    }

    // You can add other analytics providers here
    // Examples:
    // - Mixpanel: mixpanel.identify(userId); mixpanel.people.set(traits);
    // - PostHog: posthog.identify(userId, traits);
    // - Segment: analytics.identify(userId, traits);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits);
    }
  } catch (error) {
    console.error('User identification error:', error);
  }
}
