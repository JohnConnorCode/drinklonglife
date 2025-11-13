import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserSubscriptions, getUserPurchases } from '@/lib/subscription';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { BillingPortalButton } from '@/components/pricing/BillingPortalButton';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { formatPrice } from '@/lib/stripe';
import { getActiveUser, calculateProfileCompletion, shouldShowProfileCompletion } from '@/lib/user-utils';
import { getReferralStats } from '@/lib/referral-utils';
import { ProfileCompletionCard } from '@/components/account/ProfileCompletionCard';
import { ReferralShareCard } from '@/components/account/ReferralShareCard';
import { SuccessNotification } from '@/components/account/SuccessNotification';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'My Account | Long Life',
  description: 'Manage your subscriptions and purchases',
};

export default async function AccountPage() {
  const user = await getActiveUser();

  if (!user) {
    redirect('/login?redirectTo=/account');
  }

  const subscriptions = await getUserSubscriptions(user.id);
  const purchases = await getUserPurchases(user.id);

  const activeSubscriptions = subscriptions.filter(s =>
    ['active', 'trialing'].includes(s.status)
  );
  const pastSubscriptions = subscriptions.filter(s =>
    !['active', 'trialing'].includes(s.status)
  );

  // Calculate stats
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
  const partnershipTierLabel = user.partnership_tier === 'none' ? 'Standard Member' :
    user.partnership_tier ? user.partnership_tier.charAt(0).toUpperCase() + user.partnership_tier.slice(1) : 'Standard Member';

  // Profile completion
  const profileCompletion = calculateProfileCompletion(user);
  const showProfileCompletion = shouldShowProfileCompletion(user);

  // Referral stats
  const referralStats = (await isFeatureEnabled('referrals_enabled')) ? await getReferralStats(user.id) : null;

  // Feature flags for rendering
  const showTierUpgrades = await isFeatureEnabled('tier_upgrades_enabled');

  return (
    <>
      <SuccessNotification />
      <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header with Navigation */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">
                My Account
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {user.full_name || user.name || user.email}
              </p>
            </div>
            <SignOutButton className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors" />
          </div>
        </FadeIn>

        {/* Navigation Tabs */}
        <FadeIn direction="up" delay={0.15}>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Link
              href="/account"
              className="px-6 py-3 bg-white text-accent-primary border-2 border-accent-primary rounded-lg font-semibold whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link
              href="/account/billing"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold whitespace-nowrap transition-colors"
            >
              Billing & Invoices
            </Link>
            <Link
              href="/account/perks"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold whitespace-nowrap transition-colors"
            >
              Perks & Rewards
            </Link>
          </div>
        </FadeIn>

        {/* Quick Stats */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-accent-yellow/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-bold text-lg capitalize">
                  {user.subscription_status === 'active' ? '✓ Active' :
                   user.subscription_status === 'trialing' ? '✓ Trial' :
                   user.subscription_status || 'No Subscription'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-accent-green/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-green/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="font-bold text-lg">{formatPrice(totalSpent, 'usd')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-accent-yellow/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membership</p>
                <p className="font-bold text-lg">{partnershipTierLabel}</p>
              </div>
            </div>
          </div>
        </StaggerContainer>

        {/* Quick Actions */}
        <FadeIn direction="up" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/account/billing"
              className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 rounded-xl shadow-md border-2 border-gray-100 hover:border-accent-primary transition-all group"
            >
              <div className="w-12 h-12 bg-accent-primary/10 group-hover:bg-accent-primary/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Billing</p>
                <p className="text-sm text-gray-600">View invoices & payment methods</p>
              </div>
            </Link>

            <Link
              href="/account/perks"
              className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 rounded-xl shadow-md border-2 border-gray-100 hover:border-accent-primary transition-all group"
            >
              <div className="w-12 h-12 bg-accent-yellow/20 group-hover:bg-accent-yellow/30 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">View Perks</p>
                <p className="text-sm text-gray-600">Exclusive rewards & benefits</p>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 rounded-xl shadow-md border-2 border-gray-100 hover:border-accent-primary transition-all group"
            >
              <div className="w-12 h-12 bg-accent-green/20 group-hover:bg-accent-green/30 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Products</p>
                <p className="text-sm text-gray-600">Explore subscriptions & add-ons</p>
              </div>
            </Link>
          </div>
        </FadeIn>

        {/* Profile Completion */}
        {showProfileCompletion && (
          <FadeIn direction="up" delay={0.25}>
            <ProfileCompletionCard completion={profileCompletion} />
          </FadeIn>
        )}

        {/* Referral Stats */}
        {referralStats && user.referral_code && (
          <FadeIn direction="up" delay={0.27}>
            <ReferralShareCard referralCode={user.referral_code} stats={referralStats} />
          </FadeIn>
        )}

        {/* Tier Upgrade CTA */}
        {showTierUpgrades && user.partnership_tier !== 'vip' && (
          <FadeIn direction="up" delay={0.28}>
            <Link
              href="/upgrade"
              className="block bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6 mb-8 hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    ⭐ Upgrade Your Partnership Tier
                  </h3>
                  <p className="text-white/90 text-sm">
                    Unlock exclusive benefits, higher discounts, and VIP perks
                  </p>
                </div>
                <svg
                  className="w-6 h-6 text-white flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </Link>
          </FadeIn>
        )}

        {/* Active Subscriptions */}
        <FadeIn direction="up" delay={0.3}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-accent-yellow/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">
                Active Subscriptions
              </h2>
              {activeSubscriptions.length > 0 && (
                <BillingPortalButton />
              )}
            </div>

            {activeSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">
                  You don't have any active subscriptions yet.
                </p>
                <a
                  href="/pricing"
                  className="inline-block px-8 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
                >
                  View Pricing
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-6 bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 rounded-xl border-2 border-accent-yellow/20"
                  >
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {subscription.tier_key ? subscription.tier_key.charAt(0).toUpperCase() + subscription.tier_key.slice(1) : 'Subscription'}
                        {subscription.size_key && ` - ${subscription.size_key.replace('_', ' ')}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-semibold text-accent-primary capitalize">{subscription.status}</span>
                      </p>
                      {subscription.current_period_end && (
                        <p className="text-sm text-gray-600">
                          Renews on: {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      {subscription.cancel_at_period_end && (
                        <p className="text-sm text-red-600 font-semibold">
                          Cancels at end of period
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-sm">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* One-Time Purchases */}
        <FadeIn direction="up" delay={0.4}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <h2 className="font-heading text-2xl font-bold mb-6">
              Purchase History
            </h2>

            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No purchases yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    href={`/account/orders/${purchase.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium group-hover:text-accent-primary transition-colors">
                        {purchase.size_key ? purchase.size_key.replace('_', ' ') : 'Purchase'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-semibold">
                          {formatPrice(purchase.amount, purchase.currency)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {purchase.status}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-accent-primary transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Past Subscriptions */}
        {pastSubscriptions.length > 0 && (
          <FadeIn direction="up" delay={0.5}>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
              <h2 className="font-heading text-2xl font-bold mb-6">
                Past Subscriptions
              </h2>
              <div className="space-y-3">
                {pastSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {subscription.tier_key ? subscription.tier_key.charAt(0).toUpperCase() + subscription.tier_key.slice(1) : 'Subscription'}
                        {subscription.size_key && ` - ${subscription.size_key.replace('_', ' ')}`}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {subscription.status}
                      </p>
                    </div>
                    {subscription.canceled_at && (
                      <p className="text-sm text-gray-500">
                        Cancelled: {new Date(subscription.canceled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Help Section */}
        <FadeIn direction="up" delay={0.6}>
          <div className="bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-2xl p-8 text-center mt-8">
            <h3 className="font-heading text-xl font-bold mb-2">
              Need Help?
            </h3>
            <p className="text-gray-700 mb-4">
              Have questions about your subscription or purchases?
            </p>
            <a
              href="mailto:support@longlife.com"
              className="inline-block px-6 py-3 bg-white text-accent-primary rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Contact Support
            </a>
          </div>
        </FadeIn>
        </div>
      </Section>
    </>
  );
}
