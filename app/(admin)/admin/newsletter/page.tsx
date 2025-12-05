import { Metadata } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin';
import { FadeIn } from '@/components/animations';
import { NewsletterManager } from './NewsletterManager';

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

async function SubscriberContent() {
  const supabase = createServiceRoleClient();

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold mb-2">Failed to load subscribers</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  return <NewsletterManager initialSubscribers={subscribers || []} />;
}

export const dynamic = 'force-dynamic';

export default async function NewsletterPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <FadeIn direction="up" delay={0.05}>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Newsletter Subscribers
          </h1>
          <p className="text-gray-600">
            Manage your email newsletter subscriber list
          </p>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <Suspense fallback={<LoadingSkeleton variant="stat" lines={3} />}>
          <NewsletterStats />
        </Suspense>
      </FadeIn>

      {/* Bulk Actions Guide */}
      <FadeIn direction="up" delay={0.15}>
        <details className="bg-blue-50 rounded-xl border border-blue-200">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-xl transition-colors">
            Bulk Actions Guide
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-blue-200">
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Available Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Export CSV</strong> — Download selected subscribers as spreadsheet</li>
                <li><strong>Resubscribe</strong> — Re-activate unsubscribed emails</li>
                <li><strong>Unsubscribe</strong> — Mark emails as unsubscribed</li>
                <li><strong>Delete</strong> — Permanently remove subscribers from database</li>
              </ul>
            </div>
          </div>
        </details>
      </FadeIn>

      <FadeIn direction="up" delay={0.2}>
        <Suspense fallback={<LoadingSkeleton variant="table" lines={5} />}>
          <SubscriberContent />
        </Suspense>
      </FadeIn>
    </div>
  );
}
