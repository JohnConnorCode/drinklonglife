import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getActiveUser, getUserTierBenefits } from '@/lib/user-utils';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { TierUpgradeCard } from './TierUpgradeCard';

export const metadata: Metadata = {
  title: 'Upgrade Your Partnership Tier | Long Life',
  description: 'Unlock exclusive benefits and perks by upgrading your partnership tier',
};

export default async function UpgradePage() {
  // Check if tier upgrades are enabled
  if (!isFeatureEnabled('tier_upgrades_enabled')) {
    redirect('/account');
  }

  const user = await getActiveUser();

  if (!user) {
    redirect('/login?redirectTo=/upgrade');
  }

  const tierBenefits = getUserTierBenefits(user);
  const currentTier = tierBenefits.tier;

  // If already VIP, redirect to account
  if (currentTier === 'vip') {
    redirect('/account?message=already_vip');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upgrade Your Partnership
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock exclusive benefits, priority access, and special perks by upgrading
            your tier
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
              Current Tier: {tierBenefits.tierName}
            </span>
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Affiliate Tier */}
          <TierUpgradeCard
            tier="affiliate"
            tierName="Affiliate"
            price={0}
            billingPeriod="Free"
            currentTier={currentTier}
            features={[
              '10% off all products',
              'Early access to new releases',
              'Exclusive content & tips',
              'Affiliate referral program',
              'Community access',
            ]}
            userId={user.id}
            isRecommended={currentTier === 'none'}
          />

          {/* Partner Tier */}
          <TierUpgradeCard
            tier="partner"
            tierName="Partner"
            price={4900} // $49 one-time
            billingPeriod="One-time"
            currentTier={currentTier}
            features={[
              'Everything in Affiliate',
              '20% off all products',
              'Priority customer support',
              'Quarterly exclusive gifts',
              'Partner-only events',
              'Advanced analytics dashboard',
            ]}
            userId={user.id}
            isRecommended={currentTier === 'affiliate' || currentTier === 'none'}
          />

          {/* VIP Tier */}
          <TierUpgradeCard
            tier="vip"
            tierName="VIP"
            price={9900} // $99 one-time
            billingPeriod="One-time"
            currentTier={currentTier}
            features={[
              'Everything in Partner',
              '30% off all products',
              'Dedicated account manager',
              'Monthly exclusive gifts',
              'VIP-only private events',
              'First access to beta products',
              'Lifetime tier guarantee',
            ]}
            userId={user.id}
            isRecommended={currentTier === 'partner'}
            isPremium={true}
          />
        </div>

        {/* Tier Benefits Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Complete Benefits Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Benefit
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Standard
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">
                    Affiliate
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-600">
                    Partner
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-yellow-600">
                    VIP
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <ComparisonRow
                  benefit="Discount on products"
                  standard="—"
                  affiliate="10%"
                  partner="20%"
                  vip="30%"
                />
                <ComparisonRow
                  benefit="Free shipping threshold"
                  standard="$100"
                  affiliate="$75"
                  partner="$50"
                  vip="Always free"
                />
                <ComparisonRow
                  benefit="Early access to new products"
                  standard={false}
                  affiliate={true}
                  partner={true}
                  vip={true}
                />
                <ComparisonRow
                  benefit="Priority customer support"
                  standard={false}
                  affiliate={false}
                  partner={true}
                  vip={true}
                />
                <ComparisonRow
                  benefit="Exclusive gifts"
                  standard={false}
                  affiliate={false}
                  partner="Quarterly"
                  vip="Monthly"
                />
                <ComparisonRow
                  benefit="Private events access"
                  standard={false}
                  affiliate={false}
                  partner={true}
                  vip={true}
                />
                <ComparisonRow
                  benefit="Dedicated account manager"
                  standard={false}
                  affiliate={false}
                  partner={false}
                  vip={true}
                />
                <ComparisonRow
                  benefit="Beta product testing"
                  standard={false}
                  affiliate={false}
                  partner={false}
                  vip={true}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <FAQ
              question="Is the tier upgrade a one-time payment?"
              answer="Yes! Tier upgrades are a one-time investment. Once you upgrade, you keep that tier forever with all its benefits."
            />
            <FAQ
              question="Can I downgrade later?"
              answer="We don't offer downgrades as tier upgrades are one-time purchases. However, if you're not satisfied, contact our support team within 30 days for a refund."
            />
            <FAQ
              question="Do tier benefits stack with subscription discounts?"
              answer="Yes! Your tier discount applies to all purchases, including subscriptions. If you have a subscription discount, the higher discount applies."
            />
            <FAQ
              question="How long does it take for benefits to activate?"
              answer="Your benefits activate immediately after purchase. You'll see your new tier reflected in your account within seconds."
            />
          </div>
        </div>

        {/* Back to Account */}
        <div className="text-center mt-12">
          <Link
            href="/account"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison table row component
 */
function ComparisonRow({
  benefit,
  standard,
  affiliate,
  partner,
  vip,
}: {
  benefit: string;
  standard: string | boolean;
  affiliate: string | boolean;
  partner: string | boolean;
  vip: string | boolean;
}) {
  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-600 text-xl">✓</span>
      ) : (
        <span className="text-gray-300 text-xl">—</span>
      );
    }
    return <span className="text-gray-900">{value}</span>;
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4 text-gray-700">{benefit}</td>
      <td className="py-3 px-4 text-center">{renderCell(standard)}</td>
      <td className="py-3 px-4 text-center">{renderCell(affiliate)}</td>
      <td className="py-3 px-4 text-center">{renderCell(partner)}</td>
      <td className="py-3 px-4 text-center">{renderCell(vip)}</td>
    </tr>
  );
}

/**
 * FAQ component
 */
function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600 text-sm">{answer}</p>
    </div>
  );
}
