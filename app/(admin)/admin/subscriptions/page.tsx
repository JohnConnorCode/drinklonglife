import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionsTable } from './SubscriptionsTable';
import { FadeIn } from '@/components/animations';

export const metadata = {
  title: 'Subscriptions | Admin',
  description: 'Manage customer subscriptions',
};

async function getSubscriptions() {
  const supabase = createClient();

  // Check admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  // Fetch subscriptions with user details
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      profile:profiles(id, email, full_name, name)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return subscriptions || [];
}

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialingCount = subscriptions.filter((s) => s.status === 'trialing').length;
  const canceledCount = subscriptions.filter((s) => s.status === 'canceled').length;
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length;

  return (
    <div className="p-8">
      {/* Header */}
      <FadeIn direction="up" delay={0.05}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">
            {subscriptions.length} total subscriptions
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn direction="up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{activeCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
            <div className="text-sm text-gray-600">Trialing</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{trialingCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-2 border-yellow-200">
            <div className="text-sm text-gray-600">Past Due</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{pastDueCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="text-sm text-gray-600">Canceled</div>
            <div className="text-3xl font-bold text-gray-600 mt-1">{canceledCount}</div>
          </div>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn direction="up" delay={0.15}>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <SubscriptionsTable subscriptions={subscriptions} />
        </div>
      </FadeIn>
    </div>
  );
}
