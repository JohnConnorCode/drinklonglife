import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getUserSubscriptions, getUserPurchases } from '@/lib/subscription';
import { formatPrice } from '@/lib/stripe';
import { UserAdminActions } from './UserAdminActions';

export const metadata: Metadata = {
  title: 'User Details | Admin',
  description: 'View and manage user account',
};

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Get user's subscriptions and purchases
  const subscriptions = await getUserSubscriptions(params.id);
  const purchases = await getUserPurchases(params.id);

  // Get user's active discounts
  const { data: userDiscounts } = await supabase
    .from('user_discounts')
    .select('*')
    .eq('user_id', params.id)
    .eq('active', true);

  const activeSubscriptions = subscriptions.filter(s =>
    ['active', 'trialing'].includes(s.status)
  );

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Users
          </Link>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            {profile.full_name || profile.name || 'User Details'}
          </h1>
          <p className="text-gray-600">{profile.email}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Profile Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">User ID</p>
            <p className="font-mono text-sm">{profile.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-sm">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="text-sm">{profile.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stripe Customer ID</p>
            <p className="font-mono text-sm">{profile.stripe_customer_id || 'Not connected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subscription Status</p>
            <span className={`
              inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize
              ${profile.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                profile.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {profile.subscription_status || 'none'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-sm">{profile.current_plan || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Partnership Tier</p>
            <span className={`
              inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize
              ${profile.partnership_tier === 'vip' ? 'bg-purple-100 text-purple-800' :
                profile.partnership_tier === 'partner' ? 'bg-blue-100 text-blue-800' :
                profile.partnership_tier === 'affiliate' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {profile.partnership_tier === 'none' ? 'Standard' : profile.partnership_tier || 'None'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Is Admin</p>
            <p className="text-sm">{profile.is_admin ? 'Yes ⭐' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
          <p className="text-3xl font-bold">{purchases.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Spent</p>
          <p className="text-3xl font-bold">{formatPrice(totalSpent, 'usd')}</p>
        </div>
      </div>

      {/* Admin Actions */}
      <UserAdminActions
        userId={params.id}
        currentTier={profile.partnership_tier || 'none'}
        stripeCustomerId={profile.stripe_customer_id}
      />

      {/* Active Discounts */}
      {userDiscounts && userDiscounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Active Discounts</h2>
          <div className="space-y-3">
            {userDiscounts.map((discount) => (
              <div key={discount.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-mono font-semibold">{discount.discount_code}</p>
                  <p className="text-sm text-gray-600">Source: {discount.source || 'N/A'}</p>
                </div>
                {discount.expires_at && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(discount.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Active Subscriptions</h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => (
              <div key={sub.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {sub.tierKey ? sub.tierKey.charAt(0).toUpperCase() + sub.tierKey.slice(1) : 'Subscription'}
                      {sub.sizeKey && ` - ${sub.sizeKey.replace('_', ' ')}`}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">Status: {sub.status}</p>
                    {sub.currentPeriodEnd && (
                      <p className="text-sm text-gray-500">
                        {sub.cancelAtPeriodEnd ? 'Expires' : 'Renews'}: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
