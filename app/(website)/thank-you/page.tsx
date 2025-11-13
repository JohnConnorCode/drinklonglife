import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveUser } from '@/lib/user-utils';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { UpsellGrid } from '@/components/upsells/UpsellCard';
import { trackServerEvent } from '@/lib/analytics';

export const metadata: Metadata = {
  title: 'Thank You! | Long Life',
  description: 'Thank you for your purchase',
};

interface ThankYouPageProps {
  searchParams: {
    session_id?: string;
    plan?: string;
  };
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const user = await getActiveUser();

  if (!user) {
    redirect('/login?redirectTo=/thank-you');
  }

  const sessionId = searchParams.session_id;
  const plan = searchParams.plan;

  // Track purchase completion
  if (sessionId) {
    await trackServerEvent('purchase_completed', {
      userId: user.id,
      sessionId,
      plan: plan || 'unknown',
    });
  }

  // Get upsell offers (if enabled)
  let upsellOffers: any[] = [];
  const upsellsEnabled = isFeatureEnabled('upsells_enabled');
  const showOnThankYou = isFeatureEnabled('upsells_show_on_thank_you');

  if (upsellsEnabled && showOnThankYou) {
    // Fetch upsell offers from Sanity
    // For now, using mock data
    upsellOffers = await getUpsellOffers(user.partnership_tier || 'none', plan);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You for Your Purchase!
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your order has been confirmed. We'll send you an email with all the
            details shortly.
          </p>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-left max-w-md mx-auto">
            <h2 className="font-semibold text-lg mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-gray-900">
                  {sessionId?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              {plan && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {plan.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/account"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/account/billing"
              className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              View Invoice
            </Link>
          </div>

          {/* Referral Prompt */}
          {user.referral_code && isFeatureEnabled('referrals_enabled') && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-12">
              <h3 className="font-semibold text-lg mb-2">
                🎁 Share the Love, Get Rewarded
              </h3>
              <p className="text-gray-700 mb-4">
                Refer friends and you both get 20% off your next order!
              </p>
              <div className="flex items-center gap-2 justify-center">
                <code className="px-4 py-2 bg-white rounded-lg font-mono font-semibold text-lg">
                  {user.referral_code}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_SITE_URL}/referral/${user.referral_code}`
                    );
                    alert('Referral link copied!');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upsell Offers */}
        {upsellOffers.length > 0 && (
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold text-gray-900 text-center mb-6">
              Complete Your Experience
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Special offers just for you
            </p>
            <UpsellGrid offers={upsellOffers} userId={user.id} />
          </div>
        )}

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            What Happens Next?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-semibold mb-2">Confirmation Email</h3>
              <p className="text-sm text-gray-600">
                You'll receive an email confirmation with your order details and
                receipt within a few minutes.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold mb-2">Shipping Update</h3>
              <p className="text-sm text-gray-600">
                We'll send you tracking information once your order ships. Most
                orders ship within 1-2 business days.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">💜</span>
              </div>
              <h3 className="font-semibold mb-2">Enjoy!</h3>
              <p className="text-sm text-gray-600">
                Start experiencing the benefits of Long Life. Check your account
                for exclusive perks and resources.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            Questions about your order?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get relevant upsell offers based on user's tier and purchase
 *
 * @param tier - User's partnership tier
 * @param purchasedPlan - Plan they just purchased
 * @returns Array of upsell offers
 */
async function getUpsellOffers(tier: string, purchasedPlan?: string): Promise<any[]> {
  // TODO: Fetch from Sanity
  // For now, return mock data

  const mockOffers = [
    {
      id: 'tier-upgrade-partner',
      title: 'Upgrade to Partner Tier - Save 20%',
      shortDescription:
        'Get exclusive partner perks, priority support, and 20% off all future orders.',
      offerType: 'tier_upgrade',
      stripePriceId: 'price_partner_tier_upgrade',
      originalPrice: 9900, // $99
      salePrice: 7900, // $79
      ctaLabel: 'Upgrade Now',
      limitedTimeOffer: true,
      image: {
        url: '/images/partner-tier.jpg',
        alt: 'Partner Tier Benefits',
      },
    },
  ];

  // Filter based on tier and plan
  return mockOffers.filter((offer) => {
    // Don't show tier upgrades to VIP users
    if (tier === 'vip' && offer.offerType === 'tier_upgrade') {
      return false;
    }

    return true;
  });
}
