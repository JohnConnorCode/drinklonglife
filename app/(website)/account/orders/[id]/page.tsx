import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/stripe';
import { getActiveUser } from '@/lib/user-utils';
import { createServerClient } from '@/lib/supabase/server';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Order Details | Long Life',
  description: 'View your order details',
};

async function getOrderDetails(userId: string, orderId: string) {
  const supabase = createServerClient();

  // Try to find as a purchase first
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('id', orderId)
    .single();

  if (!purchaseError && purchase) {
    return { type: 'purchase', data: purchase };
  }

  // Try to find as a subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('id', orderId)
    .single();

  if (!subscriptionError && subscription) {
    return { type: 'subscription', data: subscription };
  }

  return null;
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getActiveUser();

  if (!user) {
    redirect('/login?redirectTo=/account/orders/' + params.id);
  }

  const order = await getOrderDetails(user.id, params.id);

  if (!order) {
    notFound();
  }

  const isPurchase = order.type === 'purchase';
  const data = order.data;

  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <FadeIn direction="up" delay={0.1}>
          <div className="mb-6">
            <Link
              href="/account"
              className="text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Account
            </Link>
          </div>
        </FadeIn>

        {/* Order Header */}
        <FadeIn direction="up" delay={0.15}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-accent-yellow/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">
                  {isPurchase ? 'Purchase' : 'Subscription'} Details
                </h1>
                <p className="text-gray-600">
                  Order ID: <span className="font-mono text-sm">{data.id}</span>
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                data.status === 'active' || data.status === 'succeeded'
                  ? 'bg-green-100 text-green-800'
                  : data.status === 'canceled' || data.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : data.status === 'trialing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Order Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Date</dt>
                    <dd className="font-medium">
                      {new Date(data.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </dd>
                  </div>

                  {data.size_key && (
                    <div>
                      <dt className="text-sm text-gray-600">Size</dt>
                      <dd className="font-medium capitalize">
                        {data.size_key.replace('_', ' ')}
                      </dd>
                    </div>
                  )}

                  {data.tier_key && (
                    <div>
                      <dt className="text-sm text-gray-600">Tier</dt>
                      <dd className="font-medium capitalize">
                        {data.tier_key}
                      </dd>
                    </div>
                  )}

                  {isPurchase && data.stripe_payment_intent_id && (
                    <div>
                      <dt className="text-sm text-gray-600">Payment Intent</dt>
                      <dd className="font-mono text-sm text-gray-700">
                        {data.stripe_payment_intent_id}
                      </dd>
                    </div>
                  )}

                  {!isPurchase && data.stripe_subscription_id && (
                    <div>
                      <dt className="text-sm text-gray-600">Subscription ID</dt>
                      <dd className="font-mono text-sm text-gray-700">
                        {data.stripe_subscription_id}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                  {isPurchase ? 'Payment Details' : 'Subscription Details'}
                </h3>
                <dl className="space-y-2">
                  {isPurchase ? (
                    <>
                      <div>
                        <dt className="text-sm text-gray-600">Amount</dt>
                        <dd className="font-bold text-2xl text-accent-primary">
                          {formatPrice(data.amount, data.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Currency</dt>
                        <dd className="font-medium uppercase">{data.currency}</dd>
                      </div>
                    </>
                  ) : (
                    <>
                      {data.current_period_start && (
                        <div>
                          <dt className="text-sm text-gray-600">Current Period Start</dt>
                          <dd className="font-medium">
                            {new Date(data.current_period_start).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                      {data.current_period_end && (
                        <div>
                          <dt className="text-sm text-gray-600">
                            {data.cancel_at_period_end ? 'Ends On' : 'Renews On'}
                          </dt>
                          <dd className="font-medium">
                            {new Date(data.current_period_end).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                      {data.cancel_at_period_end && (
                        <div>
                          <dt className="text-sm text-gray-600">Status</dt>
                          <dd className="font-medium text-red-600">
                            Scheduled for cancellation
                          </dd>
                        </div>
                      )}
                      {data.canceled_at && (
                        <div>
                          <dt className="text-sm text-gray-600">Canceled On</dt>
                          <dd className="font-medium">
                            {new Date(data.canceled_at).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Actions */}
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-3">
              {!isPurchase && data.status === 'active' && (
                <Link
                  href="/account/billing"
                  className="block px-6 py-3 bg-accent-primary text-white text-center rounded-lg font-semibold hover:bg-accent-primary/90 transition-colors"
                >
                  Manage Subscription
                </Link>
              )}
              <a
                href={`mailto:support@longlife.com?subject=Order Support: ${data.id}`}
                className="block px-6 py-3 bg-gray-100 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
