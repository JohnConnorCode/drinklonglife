import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { getUserSubscriptions } from '@/lib/subscription';
import { getCustomerInvoices, getUpcomingInvoice, formatPrice } from '@/lib/stripe';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import { BillingPortalButton } from '@/components/pricing/BillingPortalButton';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { AccountUpsellSection } from '@/components/upsells/AccountUpsellSection';

export const metadata: Metadata = {
  title: 'Billing & Invoices | Long Life',
  description: 'Manage your billing and view invoices',
};

export default async function BillingPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/account/billing');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, stripe_customer_id, subscription_status, current_plan, partnership_tier')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    // User doesn't have a Stripe customer ID yet
    return (
      <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
        <div className="max-w-6xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="mb-6 text-6xl">📋</div>
              <h1 className="font-heading text-3xl font-bold mb-4">
                No Billing History Yet
              </h1>
              <p className="text-gray-600 mb-8">
                You haven't made any purchases yet. Start your journey with Long Life today!
              </p>
              <Link
                href="/pricing"
                className="inline-block px-8 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </Section>
    );
  }

  // Fetch subscription and billing data
  const subscriptions = await getUserSubscriptions(user.id);
  const activeSubscriptions = subscriptions.filter(s =>
    ['active', 'trialing'].includes(s.status)
  );
  const invoices = await getCustomerInvoices(profile.stripe_customer_id, { limit: 20 });
  const upcomingInvoice = activeSubscriptions.length > 0
    ? await getUpcomingInvoice(profile.stripe_customer_id)
    : null;

  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">
                Billing & Invoices
              </h1>
              <p className="text-xl text-gray-600">
                Manage your payment methods and view invoices
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
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold whitespace-nowrap transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/account/billing"
              className="px-6 py-3 bg-white text-accent-primary border-2 border-accent-primary rounded-lg font-semibold whitespace-nowrap"
            >
              Billing & Invoices
            </Link>
          </div>
        </FadeIn>

        {/* Subscription Management */}
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-accent-yellow/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Subscription Management
                </h2>
                <p className="text-gray-600">
                  Update payment methods, change plans, or cancel your subscription
                </p>
              </div>
              <BillingPortalButton />
            </div>

            {activeSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="p-6 bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 rounded-xl border-2 border-accent-yellow/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {profile.current_plan || 'Subscription'}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          Status: <span className="font-semibold text-accent-primary">{subscription.status}</span>
                        </p>
                        {subscription.current_period_end && (
                          <p className="text-sm text-gray-600">
                            {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on:{' '}
                            {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
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
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No active subscriptions. Browse our pricing to get started.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-2 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Upcoming Invoice */}
        {upcomingInvoice && (
          <FadeIn direction="up" delay={0.3}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-200">
              <h2 className="font-heading text-2xl font-bold mb-6">
                Upcoming Invoice
              </h2>
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p className="font-semibold text-lg">
                      {upcomingInvoice.period_end
                        ? new Date(upcomingInvoice.period_end * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Processing...'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-2xl text-accent-primary">
                      {formatPrice(upcomingInvoice.amount_due || 0, upcomingInvoice.currency || 'usd')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Invoice History */}
        <FadeIn direction="up" delay={0.4}>
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
            <h2 className="font-heading text-2xl font-bold mb-6">
              Invoice History
            </h2>

            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4 text-6xl">📄</div>
                <p className="text-gray-600">No invoices yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          {invoice.created
                            ? new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium">{invoice.description || 'Subscription Payment'}</p>
                          <p className="text-sm text-gray-500">Invoice #{invoice.number || invoice.id}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'open'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">
                          {formatPrice(invoice.amount_paid || 0, invoice.currency || 'usd')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent-primary hover:text-accent-dark font-semibold text-sm transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Special Offers Section */}
        <FadeIn direction="up" delay={0.5}>
          <AccountUpsellSection
            userId={user.id}
            userTier="none"
            page="billing"
            currentPlan={profile.current_plan}
          />
        </FadeIn>

        {/* Help Section */}
        <FadeIn direction="up" delay={0.6}>
          <div className="bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-2xl p-8 text-center mt-8">
            <h3 className="font-heading text-xl font-bold mb-2">
              Billing Questions?
            </h3>
            <p className="text-gray-700 mb-4">
              Have questions about your invoices or payment methods?
            </p>
            <a
              href="mailto:billing@longlife.com"
              className="inline-block px-6 py-3 bg-white text-accent-primary rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Contact Billing Support
            </a>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
