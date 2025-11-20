import { Metadata } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Newsletter Subscribers | Admin',
  description: 'Manage newsletter subscriptions',
};

async function NewsletterStats() {
  const supabase = createServiceRoleClient();

  const [
    { count: totalSubscribers },
    { count: activeSubscribers },
    { count: unsubscribed }
  ] = await Promise.all([
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', false),
  ]);

  const stats = [
    { label: 'Total Subscribers', value: totalSubscribers || 0, color: 'blue' },
    { label: 'Active', value: activeSubscribers || 0, color: 'green' },
    { label: 'Unsubscribed', value: unsubscribed || 0, color: 'gray' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.label}</h3>
          <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

async function SubscriberList() {
  const supabase = createServiceRoleClient();

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error loading subscribers:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold mb-2">Failed to load subscribers</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  if (!subscribers || subscribers.length === 0) {
    return (
      <EmptyState
        icon="📧"
        title="No subscribers yet"
        description="Newsletter subscribers will appear here"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Subscribers ({subscribers.length})</h3>
        <a
          href="/api/admin/newsletter/export"
          className="px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscribed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unsubscribed
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {subscriber.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    px-2 py-1 text-xs font-semibold rounded-full
                    ${subscriber.subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 capitalize">
                    {subscriber.source || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {subscriber.unsubscribed_at ? new Date(subscriber.unsubscribed_at).toLocaleDateString() : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function NewsletterPage() {
  await requireAdmin();

  return (
    <FadeIn>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          Newsletter Subscribers
        </h1>
        <p className="text-gray-600">
          Manage your email newsletter subscriber list
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton count={3} />}>
        <NewsletterStats />
      </Suspense>

      <Suspense fallback={<LoadingSkeleton count={5} />}>
        <SubscriberList />
      </Suspense>
    </FadeIn>
  );
}
