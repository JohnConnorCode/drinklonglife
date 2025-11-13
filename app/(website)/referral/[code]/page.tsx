import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getReferralByCode } from '@/lib/referral-utils';
import { getUserById } from '@/lib/user-utils';
import { getFeatureValue } from '@/lib/feature-flags';
import { trackServerEvent } from '@/lib/analytics';

interface ReferralPageProps {
  params: {
    code: string;
  };
}

export async function generateMetadata({
  params,
}: ReferralPageProps): Promise<Metadata> {
  const { code } = params;
  const rewardPercentage = getFeatureValue('referrals_reward_percentage');

  return {
    title: `Get ${rewardPercentage}% Off | Long Life Referral`,
    description: `You've been referred to Long Life! Get ${rewardPercentage}% off your first order.`,
  };
}

export default async function ReferralLandingPage({ params }: ReferralPageProps) {
  const { code } = params;

  // Get referral details
  const referral = await getReferralByCode(code);

  if (!referral) {
    return <InvalidReferralPage code={code} />;
  }

  // Get referrer details
  const referrer = await getUserById(referral.referrer_id);

  if (!referrer) {
    return <InvalidReferralPage code={code} />;
  }

  // Store referral code in cookie for signup tracking
  const cookieStore = cookies();
  cookieStore.set('referral_code', code.toUpperCase(), {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  // Track referral page view
  await trackServerEvent('referral_link_shared', {
    referralCode: code,
    referrerId: referral.referrer_id,
  });

  const rewardPercentage = getFeatureValue('referrals_reward_percentage');
  const referrerName = referrer.full_name || referrer.name || 'a friend';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
            <span className="text-4xl">🎁</span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {referrerName} wants you to try
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Long Life
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get <strong>{rewardPercentage}% off</strong> your first order, and{' '}
            {referrerName} gets <strong>{rewardPercentage}% off</strong> too!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href={`/signup?ref=${code}`}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Claim Your {rewardPercentage}% Discount
            </Link>
            <Link
              href="/subscriptions"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors"
            >
              View Products
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500">
            Join 10,000+ customers who trust Long Life
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">
                Create your free account using {referrerName}'s referral link
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Shop & Save</h3>
              <p className="text-gray-600 text-sm">
                Choose your products and get {rewardPercentage}% off your first
                order automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Both Win!</h3>
              <p className="text-gray-600 text-sm">
                You save {rewardPercentage}%, and {referrerName} gets{' '}
                {rewardPercentage}% off their next order too!
              </p>
            </div>
          </div>
        </div>

        {/* Why Long Life */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">🌿 Premium Ingredients</h3>
            <p className="text-gray-700 text-sm">
              Sourced from organic farms, scientifically formulated for maximum
              longevity benefits.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">🔬 Science-Backed</h3>
            <p className="text-gray-700 text-sm">
              Every blend is developed with the latest longevity research in mind.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">🚚 Fast Shipping</h3>
            <p className="text-gray-700 text-sm">
              Free shipping on all orders over $50. Most orders arrive in 2-3 days.
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">💯 Satisfaction Guaranteed</h3>
            <p className="text-gray-700 text-sm">
              30-day money-back guarantee. Love it or get a full refund.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Don't miss out on your exclusive {rewardPercentage}% discount!
          </p>
          <Link
            href={`/signup?ref=${code}`}
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Claim My Discount Now →
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Referral code: <strong>{code.toUpperCase()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Invalid referral page
 */
function InvalidReferralPage({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">
          Invalid Referral Code
        </h1>

        <p className="text-gray-600 mb-8">
          The referral code <strong>{code.toUpperCase()}</strong> is not valid or
          has expired.
        </p>

        <div className="space-y-3">
          <Link
            href="/subscriptions"
            className="block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/signup"
            className="block px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
