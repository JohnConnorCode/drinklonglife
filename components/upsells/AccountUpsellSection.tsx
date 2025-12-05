/**
 * AccountUpsellSection - Server component for displaying upsell offers on account pages
 *
 * Fetches upsell offers from Sanity based on the page context and user eligibility.
 * Used on account dashboard and billing pages.
 */

import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { upsellOffersQuery } from '@/lib/sanity.queries';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { UpsellGrid, UpsellOffer } from './UpsellCard';
import { logger } from '@/lib/logger';

interface AccountUpsellSectionProps {
  userId: string;
  userTier: string;
  page: 'account' | 'billing';
  currentPlan?: string;
}

// Default upsell offers as fallback when Sanity has no content
const defaultUpsellOffers: UpsellOffer[] = [];

async function getUpsellOffers(
  page: string,
  tier: string,
  currentPlan?: string
): Promise<UpsellOffer[]> {
  try {
    // Fetch upsell offers from Sanity for the specified page
    const sanityOffers = await client.fetch(upsellOffersQuery, { page });

    // Transform Sanity data to UpsellOffer format
    const offers: UpsellOffer[] =
      sanityOffers && sanityOffers.length > 0
        ? sanityOffers.map((offer: any) => ({
            id: offer._id,
            title: offer.title,
            shortDescription: offer.shortDescription,
            image: offer.image
              ? { url: offer.image.url, alt: offer.image.alt || offer.title }
              : undefined,
            offerType: offer.offerType,
            stripePriceId: offer.stripePriceId,
            discountPercentage: offer.discountPercentage,
            originalPrice: offer.originalPrice,
            salePrice: offer.salePrice,
            ctaLabel: offer.ctaLabel || 'Get Offer',
            limitedTimeOffer: offer.limitedTimeOffer,
            eligibleTiers: offer.eligibleTiers,
            eligiblePlans: offer.eligiblePlans,
            expiresAt: offer.expiresAt,
          }))
        : defaultUpsellOffers;

    // Filter based on tier and plan eligibility
    return offers.filter((offer: any) => {
      // Check tier eligibility (if specified)
      if (offer.eligibleTiers && offer.eligibleTiers.length > 0) {
        if (!offer.eligibleTiers.includes(tier)) {
          return false;
        }
      }

      // Check plan eligibility (if specified)
      if (offer.eligiblePlans && offer.eligiblePlans.length > 0 && currentPlan) {
        if (!offer.eligiblePlans.includes(currentPlan)) {
          return false;
        }
      }

      // Check expiration
      if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
        return false;
      }

      return true;
    });
  } catch (error) {
    logger.error('Error fetching upsell offers:', error);
    // Return filtered defaults on error
    return defaultUpsellOffers.filter((offer: any) => {
      if (offer.eligibleTiers && !offer.eligibleTiers.includes(tier)) {
        return false;
      }
      return true;
    });
  }
}

export async function AccountUpsellSection({
  userId,
  userTier,
  page,
  currentPlan,
}: AccountUpsellSectionProps) {
  // Check feature flags
  const upsellsEnabled = isFeatureEnabled('upsells_enabled');
  const showOnAccount = isFeatureEnabled('upsells_show_on_account');
  const showOnBilling = isFeatureEnabled('upsells_show_on_billing');

  // Determine if we should show upsells on this page
  const shouldShow =
    upsellsEnabled &&
    ((page === 'account' && showOnAccount) || (page === 'billing' && showOnBilling));

  if (!shouldShow) {
    return null;
  }

  // Fetch upsell offers
  const offers = await getUpsellOffers(page, userTier, currentPlan);

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-900">Special Offers</h2>
        <p className="text-sm text-gray-600 mt-0.5">Exclusive deals for you</p>
      </div>
      <div className="p-4">
        <UpsellGrid offers={offers} userId={userId} />
      </div>
    </div>
  );
}

/**
 * Compact version for sidebars - renders the top offer as a static card
 * Uses Link for navigation instead of onClick
 */
export async function AccountUpsellCompact({
  userId: _userId, // Reserved for future analytics tracking
  userTier,
  page,
  currentPlan,
}: AccountUpsellSectionProps) {
  // Check feature flags
  const upsellsEnabled = isFeatureEnabled('upsells_enabled');
  const showOnAccount = isFeatureEnabled('upsells_show_on_account');
  const showOnBilling = isFeatureEnabled('upsells_show_on_billing');

  // Determine if we should show upsells on this page
  const shouldShow =
    upsellsEnabled &&
    ((page === 'account' && showOnAccount) || (page === 'billing' && showOnBilling));

  if (!shouldShow) {
    return null;
  }

  // Fetch upsell offers (limit to 1 for compact display)
  const offers = await getUpsellOffers(page, userTier, currentPlan);
  const topOffer = offers[0];

  if (!topOffer) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
        {topOffer.limitedTimeOffer && (
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            Limited Time
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{topOffer.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{topOffer.shortDescription}</p>
      {topOffer.originalPrice && topOffer.salePrice && (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ${(topOffer.salePrice / 100).toFixed(2)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ${(topOffer.originalPrice / 100).toFixed(2)}
          </span>
        </div>
      )}
      <Link
        href={`/api/checkout/upsell?priceId=${topOffer.stripePriceId}&upsellId=${topOffer.id}`}
        className="block w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm text-center"
      >
        {topOffer.ctaLabel}
      </Link>
    </div>
  );
}
