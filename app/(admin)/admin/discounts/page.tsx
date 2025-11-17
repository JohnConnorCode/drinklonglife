import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import { DiscountsTable } from './DiscountsTable';
import Link from 'next/link';

export const metadata = {
  title: 'Discounts | Admin',
  description: 'Manage discount codes and coupons',
};

async function getDiscounts() {
  const supabase = createServiceRoleClient();

  // Fetch user discounts - fix: only select full_name, not name
  const { data: discounts, error } = await supabase
    .from('user_discounts')
    .select(`
      *,
      profile:profiles(id, email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }

  return discounts || [];
}

export default async function DiscountsPage() {
  await requireAdmin();

  const discounts = await getDiscounts();

  const activeCount = discounts.filter((d) => d.active).length;
  const expiredCount = discounts.filter(
    (d) => d.expires_at && new Date(d.expires_at) < new Date()
  ).length;
  const usedCount = discounts.filter((d) => d.used_at).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
            <p className="text-gray-600 mt-1">
              Manage user discount codes and coupons
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/discounts/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Discount
            </Link>
            <div className="text-sm text-gray-500">
              Or create in{' '}
              <a
                href="https://dashboard.stripe.com/coupons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Stripe →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Discounts</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{discounts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
          <div className="text-sm text-gray-600">Used</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{usedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-3xl font-bold text-gray-600 mt-1">{expiredCount}</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">How Discounts Work</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Discounts are automatically applied from referral rewards</li>
              <li>• Create custom Stripe coupons and link them to users via this system</li>
              <li>
                • Users see their available discounts in their account page
              </li>
              <li>• Discounts are applied automatically at checkout if active</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DiscountsTable discounts={discounts} />
      </div>
    </div>
  );
}
