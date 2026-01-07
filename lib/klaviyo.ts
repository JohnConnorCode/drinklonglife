/**
 * Klaviyo Integration - Centralized Configuration and Functions
 *
 * This module provides:
 * - Centralized Klaviyo configuration
 * - Event tracking (purchases, signups, etc.)
 * - Profile management
 */

import { logger } from '@/lib/logger';

// =====================================================
// CONFIGURATION
// =====================================================

export const KLAVIYO_CONFIG = {
  apiKey: process.env.KLAVIYO_PRIVATE_API_KEY,
  companyId: process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID || 'WCHubr',
  listId: process.env.KLAVIYO_LIST_ID || 'VFxqc9',
  apiVersion: '2024-10-15',
  baseUrl: 'https://a.klaviyo.com/api',
};

// =====================================================
// TYPES
// =====================================================

export interface KlaviyoProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  properties?: Record<string, any>;
}

export interface KlaviyoPurchaseEvent {
  email: string;
  orderId: string;
  orderTotal: number;
  currency: string;
  items: Array<{
    productId?: string;
    sku?: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  discountCode?: string;
  discountAmount?: number;
  isFirstPurchase?: boolean;
  isSubscription?: boolean;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getHeaders() {
  if (!KLAVIYO_CONFIG.apiKey) {
    return null;
  }
  return {
    'Authorization': `Klaviyo-API-Key ${KLAVIYO_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    'revision': KLAVIYO_CONFIG.apiVersion,
  };
}

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * Get or create a Klaviyo profile by email
 */
export async function getOrCreateProfile(profile: KlaviyoProfile): Promise<string | null> {
  const headers = getHeaders();
  if (!headers) {
    logger.warn('Klaviyo not configured - skipping profile creation');
    return null;
  }

  try {
    // Try to create profile
    const createResponse = await fetch(`${KLAVIYO_CONFIG.baseUrl}/profiles/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: profile.email,
            first_name: profile.firstName || profile.email.split('@')[0],
            last_name: profile.lastName || '',
            phone_number: profile.phone,
            properties: profile.properties || {},
          },
        },
      }),
    });

    if (createResponse.ok) {
      const data = await createResponse.json();
      return data.data?.id || null;
    }

    // Profile exists - get by email
    if (createResponse.status === 409) {
      const searchResponse = await fetch(
        `${KLAVIYO_CONFIG.baseUrl}/profiles/?filter=equals(email,"${profile.email}")`,
        { headers }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        return searchData.data?.[0]?.id || null;
      }
    }

    logger.error('Failed to get/create Klaviyo profile:', await createResponse.text());
    return null;
  } catch (error) {
    logger.error('Klaviyo profile error:', error);
    return null;
  }
}

// =====================================================
// EVENT TRACKING
// =====================================================

/**
 * Track a purchase event in Klaviyo
 * This enables:
 * - Purchase segmentation
 * - Customer lifetime value tracking
 * - Post-purchase email flows
 */
export async function trackPurchaseEvent(event: KlaviyoPurchaseEvent): Promise<boolean> {
  const headers = getHeaders();
  if (!headers) {
    logger.warn('Klaviyo not configured - skipping purchase tracking');
    return false;
  }

  try {
    // First, ensure profile exists
    const profileId = await getOrCreateProfile({ email: event.email });
    if (!profileId) {
      logger.warn('Could not get Klaviyo profile for purchase tracking');
      return false;
    }

    // Build the order properties
    const orderProperties: Record<string, any> = {
      OrderId: event.orderId,
      Categories: event.items.map(() => 'Juice').filter((v, _i, a) => a.indexOf(v) === _i),
      ItemNames: event.items.map(i => i.name),
      Brands: ['Long Life'],
      Items: event.items.map(item => ({
        ProductID: item.productId || item.sku || item.name,
        SKU: item.sku || item.name,
        ProductName: item.name,
        Quantity: item.quantity,
        ItemPrice: item.price / 100, // Convert cents to dollars
        RowTotal: (item.price * item.quantity) / 100,
        ImageURL: item.imageUrl,
      })),
    };

    if (event.discountCode) {
      orderProperties.DiscountCode = event.discountCode;
      orderProperties.DiscountValue = (event.discountAmount || 0) / 100;
    }

    if (event.isFirstPurchase) {
      orderProperties.IsFirstPurchase = true;
    }

    if (event.isSubscription) {
      orderProperties.IsSubscription = true;
    }

    // Track the "Placed Order" event
    const eventResponse = await fetch(`${KLAVIYO_CONFIG.baseUrl}/events/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: 'Placed Order',
                },
              },
            },
            profile: {
              data: {
                type: 'profile',
                id: profileId,
              },
            },
            properties: orderProperties,
            value: event.orderTotal / 100, // Convert cents to dollars
            unique_id: event.orderId,
            time: new Date().toISOString(),
          },
        },
      }),
    });

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text();
      logger.error('Klaviyo event tracking error:', errorText);
      return false;
    }

    // Also track individual "Ordered Product" events for each item
    for (const item of event.items) {
      await fetch(`${KLAVIYO_CONFIG.baseUrl}/events/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            type: 'event',
            attributes: {
              metric: {
                data: {
                  type: 'metric',
                  attributes: {
                    name: 'Ordered Product',
                  },
                },
              },
              profile: {
                data: {
                  type: 'profile',
                  id: profileId,
                },
              },
              properties: {
                OrderId: event.orderId,
                ProductID: item.productId || item.sku || item.name,
                SKU: item.sku || item.name,
                ProductName: item.name,
                Quantity: item.quantity,
                ItemPrice: item.price / 100,
                RowTotal: (item.price * item.quantity) / 100,
                ImageURL: item.imageUrl,
              },
              value: (item.price * item.quantity) / 100,
              time: new Date().toISOString(),
            },
          },
        }),
      });
    }

    logger.info(`✅ Klaviyo: Tracked purchase for ${event.email}`, {
      orderId: event.orderId,
      total: event.orderTotal / 100,
      items: event.items.length,
    });

    return true;
  } catch (error) {
    logger.error('Klaviyo purchase tracking error:', error);
    return false;
  }
}

// =====================================================
// EMAIL PREFERENCES SYNC
// =====================================================

export interface EmailPreferences {
  all_emails_enabled: boolean;
  marketing_emails: boolean;
  transactional_emails: boolean;
  order_confirmations: boolean;
  subscription_notifications: boolean;
  product_updates: boolean;
  newsletter: boolean;
}

/**
 * Sync email preferences to Klaviyo profile
 * This allows marketing teams to segment based on user preferences
 */
export async function syncEmailPreferencesToKlaviyo(
  email: string,
  preferences: EmailPreferences
): Promise<boolean> {
  const headers = getHeaders();
  if (!headers) {
    logger.warn('Klaviyo not configured - skipping preferences sync');
    return false;
  }

  try {
    const profileId = await getOrCreateProfile({ email });
    if (!profileId) {
      logger.warn('Could not get Klaviyo profile for preferences sync');
      return false;
    }

    // Update profile with preference properties
    const updateResponse = await fetch(`${KLAVIYO_CONFIG.baseUrl}/profiles/${profileId}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile',
          id: profileId,
          attributes: {
            properties: {
              // Sync our preferences to Klaviyo profile properties
              accepts_marketing: preferences.marketing_emails && preferences.all_emails_enabled,
              accepts_newsletter: preferences.newsletter && preferences.all_emails_enabled,
              accepts_product_updates: preferences.product_updates && preferences.all_emails_enabled,
              email_preferences_synced_at: new Date().toISOString(),
            },
          },
        },
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      logger.error('Klaviyo preferences sync error:', errorText);
      return false;
    }

    // Handle newsletter list membership based on preference
    if (preferences.newsletter && preferences.all_emails_enabled) {
      // Add to newsletter list
      await fetch(`${KLAVIYO_CONFIG.baseUrl}/lists/${KLAVIYO_CONFIG.listId}/relationships/profiles/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: [{ type: 'profile', id: profileId }],
        }),
      });
    } else {
      // Remove from newsletter list
      await fetch(`${KLAVIYO_CONFIG.baseUrl}/lists/${KLAVIYO_CONFIG.listId}/relationships/profiles/`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          data: [{ type: 'profile', id: profileId }],
        }),
      });
    }

    logger.info(`✅ Klaviyo: Synced preferences for ${email}`);
    return true;
  } catch (error) {
    logger.error('Klaviyo preferences sync error:', error);
    return false;
  }
}

/**
 * Track subscription started event
 */
export async function trackSubscriptionEvent(
  email: string,
  subscriptionId: string,
  planName: string,
  amount: number,
  interval: string
): Promise<boolean> {
  const headers = getHeaders();
  if (!headers) {
    return false;
  }

  try {
    const profileId = await getOrCreateProfile({ email });
    if (!profileId) return false;

    const eventResponse = await fetch(`${KLAVIYO_CONFIG.baseUrl}/events/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: 'Started Subscription',
                },
              },
            },
            profile: {
              data: {
                type: 'profile',
                id: profileId,
              },
            },
            properties: {
              SubscriptionId: subscriptionId,
              PlanName: planName,
              BillingInterval: interval,
            },
            value: amount / 100,
            unique_id: subscriptionId,
            time: new Date().toISOString(),
          },
        },
      }),
    });

    return eventResponse.ok;
  } catch (error) {
    logger.error('Klaviyo subscription tracking error:', error);
    return false;
  }
}
