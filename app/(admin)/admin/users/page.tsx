import { Metadata } from 'next';
import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import { FadeIn } from '@/components/animations';
import { UsersManager } from './UsersManager';

export const metadata: Metadata = {
  title: 'User Management | Admin',
  description: 'Manage user accounts and permissions',
};

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  await requireAdmin();

  const supabase = createServiceRoleClient();

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, partnership_tier, subscription_status, current_plan, stripe_customer_id, created_at, is_admin')
    .order('created_at', { ascending: false })
    .limit(500); // Increased limit for bulk operations

  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,full_name.ilike.%${searchParams.search}%`);
  }

  const { data: users, error } = await query;

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold mb-2">Failed to load users</p>
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const testUserCount = (users || []).filter(u =>
    u.email?.includes('test') ||
    u.email?.includes('example') ||
    u.email?.includes('+') ||
    u.full_name?.toLowerCase().includes('test')
  ).length;

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
              Manage {users?.length || 0} users • {testUserCount} test users detected
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

      {/* How Bulk Actions Work */}
      <FadeIn direction="up" delay={0.12}>
        <details className="bg-blue-50 rounded-xl border border-blue-200">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-800 hover:bg-blue-100 rounded-xl transition-colors">
            How to use Bulk Actions
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-blue-200 text-sm text-blue-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Use <strong>Filter</strong> to show only Test Users or Real Users</li>
              <li>Click <strong>&quot;Select All Test Users&quot;</strong> to quickly select test accounts</li>
              <li>Or use checkboxes to manually select users</li>
              <li>A floating action bar appears at the bottom with bulk actions</li>
              <li>Actions: <strong>Delete</strong>, <strong>Set Tier</strong>, <strong>Export CSV</strong></li>
            </ol>
            <p className="mt-2 text-blue-600">
              <strong>Safety:</strong> Admin users cannot be deleted. Max 100 users per bulk delete.
            </p>
          </div>
        </details>
      </FadeIn>

      {/* User Manager */}
      <FadeIn direction="up" delay={0.15}>
        <UsersManager
          initialUsers={users || []}
          searchQuery={searchParams.search}
        />
      </FadeIn>
    </div>
  );
}
