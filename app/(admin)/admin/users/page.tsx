import { Metadata } from 'next';
import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'User Management | Admin',
  description: 'Manage user accounts and permissions',
};

async function UserList({ searchQuery }: { searchQuery?: string }) {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, partnership_tier, subscription_status, current_plan, stripe_customer_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchQuery) {
    query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error('Error loading users:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold mb-2">Failed to load users</p>
        <p className="text-sm text-red-500">{error.message}</p>
        <details className="mt-2">
          <summary className="text-xs text-red-400 cursor-pointer">Error details</summary>
          <pre className="text-xs text-red-400 mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No users found"
        description={searchQuery ? `No users match "${searchQuery}"` : 'No users in the system yet'}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stripe
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.full_name || 'No name'}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`
                  px-2 py-1 text-xs font-semibold rounded-full
                  ${user.partnership_tier === 'vip' ? 'bg-purple-100 text-purple-800' :
                    user.partnership_tier === 'partner' ? 'bg-blue-100 text-blue-800' :
                    user.partnership_tier === 'affiliate' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {user.partnership_tier === 'none' ? 'Standard' : user.partnership_tier || 'None'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`
                  px-2 py-1 text-xs font-semibold rounded-full capitalize
                  ${user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    user.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                    user.subscription_status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                    user.subscription_status === 'canceled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {user.subscription_status || 'none'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.stripe_customer_id ? (
                  <span className="text-green-600">✓ Connected</span>
                ) : (
                  <span className="text-gray-400">Not connected</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Manage →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="up" delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Search, view, and manage user accounts
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn direction="up" delay={0.1}>
        <div className="bg-white rounded-lg shadow p-4">
          <form action="/admin/users" method="get" className="flex gap-4">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search by email or name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {searchParams.search && (
            <Link
              href="/admin/users"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear
            </Link>
          )}
          </form>
        </div>
      </FadeIn>

      {/* User List */}
      <FadeIn direction="up" delay={0.15}>
        <Suspense fallback={<LoadingSkeleton variant="table" lines={10} />}>
          <UserList searchQuery={searchParams.search} />
        </Suspense>
      </FadeIn>
    </div>
  );
}
