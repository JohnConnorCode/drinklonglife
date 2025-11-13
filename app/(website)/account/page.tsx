import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getUserSubscriptions, getUserPurchases } from '@/lib/subscription';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import { BillingPortalButton } from '@/components/pricing/BillingPortalButton';
import { formatPrice } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'My Account | Long Life',
  description: 'Manage your subscriptions and purchases',
};

export default async function AccountPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/account');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const subscriptions = await getUserSubscriptions(user.id);
  const purchases = await getUserPurchases(user.id);

  const activeSubscriptions = subscriptions.filter(s =>
    ['active', 'trialing'].includes(s.status)
  );
  const pastSubscriptions = subscriptions.filter(s =>
    !['active', 'trialing'].includes(s.status)
  );

  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
              My Account
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back, {profile?.name || profile?.email || user.email}
            </p>
          </div>
        </FadeIn>

        {/* Active Subscriptions */}
        <FadeIn direction="up" delay={0.2}>
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
                        {subscription.tierKey ? subscription.tierKey.charAt(0).toUpperCase() + subscription.tierKey.slice(1) : 'Subscription'}
                        {subscription.sizeKey && ` - ${subscription.sizeKey.replace('_', ' ')}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-semibold text-accent-primary capitalize">{subscription.status}</span>
                      </p>
                      {subscription.currentPeriodEnd && (
                        <p className="text-sm text-gray-600">
                          Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      {subscription.cancelAtPeriodEnd && (
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
        <FadeIn direction="up" delay={0.3}>
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
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {purchase.sizeKey ? purchase.sizeKey.replace('_', ' ') : 'Purchase'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(purchase.amount, purchase.currency)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Past Subscriptions */}
        {pastSubscriptions.length > 0 && (
          <FadeIn direction="up" delay={0.4}>
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
                        {subscription.tierKey ? subscription.tierKey.charAt(0).toUpperCase() + subscription.tierKey.slice(1) : 'Subscription'}
                        {subscription.sizeKey && ` - ${subscription.sizeKey.replace('_', ' ')}`}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {subscription.status}
                      </p>
                    </div>
                    {subscription.canceledAt && (
                      <p className="text-sm text-gray-500">
                        Cancelled: {new Date(subscription.canceledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Help Section */}
        <FadeIn direction="up" delay={0.5}>
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
  );
}
