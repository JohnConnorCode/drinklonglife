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
import { EmailPreferences } from '@/components/account/EmailPreferences';
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
  const partnershipTierLabel = user.partnership_tier === 'none' ? 'Standard' :
    user.partnership_tier ? user.partnership_tier.charAt(0).toUpperCase() + user.partnership_tier.slice(1) : 'Standard';

  // Profile completion
  const profileCompletion = calculateProfileCompletion(user);
  const showProfileCompletion = shouldShowProfileCompletion(user);

  // Referral stats
  const referralStats = isFeatureEnabled('referrals_enabled') ? await getReferralStats(user.id) : null;

  // Get member since date
  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <Section className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <FadeIn direction="up" delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900">
                Account
              </h1>
              <p className="text-base text-gray-600 mt-1">
                {user.full_name || user.email}
              </p>
            </div>
            <SignOutButton className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-all text-sm" />
          </div>
        </FadeIn>

        {/* Navigation Tabs */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
            <Link
              href="/account"
              className="px-4 py-3 text-sm font-semibold text-accent-primary border-b-2 border-accent-primary whitespace-nowrap"
            >
              Overview
            </Link>
            <Link
              href="/account/billing"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              Billing
            </Link>
          </div>
        </FadeIn>

        {/* Stats Overview */}
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {user.subscription_status === 'active' ? 'Active' :
               user.subscription_status === 'trialing' ? 'Trial' :
               'Inactive'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Member Since</span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{memberSince}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total Spent</span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSpent, 'usd')}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Tier</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{partnershipTierLabel}</p>
          </div>
        </StaggerContainer>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ambassador/Referral Section - Featured First */}
            {referralStats && user.referral_code && (
              <FadeIn direction="up" delay={0.15}>
                <ReferralShareCard referralCode={user.referral_code} stats={referralStats} />
              </FadeIn>
            )}

            {/* Profile Completion - Hidden for now */}
            {false && showProfileCompletion && (
              <FadeIn direction="up" delay={0.17}>
                <ProfileCompletionCard completion={profileCompletion} />
              </FadeIn>
            )}

            {/* Active Subscriptions */}
            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Manage your recurring orders</p>
                    </div>
                    {activeSubscriptions.length > 0 && (
                      <BillingPortalButton />
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {activeSubscriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">No active subscriptions</p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Start Subscription
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSubscriptions.map((subscription) => (
                        <div
                          key={subscription.id}
                          className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {subscription.tier_key ? subscription.tier_key.charAt(0).toUpperCase() + subscription.tier_key.slice(1) : 'Subscription'}
                                {subscription.size_key && ` - ${subscription.size_key.replace('_', ' ')}`}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {subscription.status}
                              </span>
                            </div>
                            {subscription.current_period_end && (
                              <p className="text-sm text-gray-600">
                                Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                            {subscription.cancel_at_period_end && (
                              <p className="text-sm text-red-600 font-medium mt-1">
                                Cancels at period end
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Purchase History */}
            <FadeIn direction="up" delay={0.25}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
                  <p className="text-sm text-gray-500 mt-0.5">View your past purchases</p>
                </div>

                <div className="p-6">
                  {purchases.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-600">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {purchases.slice(0, 5).map((purchase) => (
                        <div
                          key={purchase.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {purchase.size_key ? purchase.size_key.replace('_', ' ') : 'Purchase'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(purchase.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              {formatPrice(purchase.amount, purchase.currency)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {purchase.status}
                            </p>
                          </div>
                        </div>
                      ))}
                      {purchases.length > 5 && (
                        <Link
                          href="/account/billing"
                          className="block text-center py-3 text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors"
                        >
                          View all orders →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Past Subscriptions */}
            {pastSubscriptions.length > 0 && (
              <FadeIn direction="up" delay={0.3}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Past Subscriptions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {pastSubscriptions.map((subscription) => (
                        <div
                          key={subscription.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-700 text-sm">
                              {subscription.tier_key ? subscription.tier_key.charAt(0).toUpperCase() + subscription.tier_key.slice(1) : 'Subscription'}
                              {subscription.size_key && ` - ${subscription.size_key.replace('_', ' ')}`}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">
                              {subscription.status}
                            </p>
                          </div>
                          {subscription.canceled_at && (
                            <p className="text-xs text-gray-500">
                              {new Date(subscription.canceled_at).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <Link
                    href="/account/billing"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-9 h-9 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Billing</p>
                      <p className="text-xs text-gray-500">Invoices & payments</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-9 h-9 bg-green-50 group-hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Shop</p>
                      <p className="text-xs text-gray-500">Browse products</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Email Preferences */}
            <FadeIn direction="up" delay={0.23}>
              <EmailPreferences userEmail={user.email || ''} />
            </FadeIn>

            {/* Help */}
            <FadeIn direction="up" delay={0.25}>
              <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 rounded-xl border border-accent-yellow/20 p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3 shadow-sm">
                    <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Questions about your account?
                  </p>
                  <a
                    href="mailto:support@longlife.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-accent-primary rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </Section>
  );
}
