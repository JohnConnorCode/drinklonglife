'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserAdminActionsProps {
  userId: string;
  currentTier: string;
  stripeCustomerId: string | null;
  isAdmin: boolean;
}

export function UserAdminActions({
  userId,
  currentTier,
  stripeCustomerId,
  isAdmin,
}: UserAdminActionsProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingAdmin, setTogglingAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateTier = async () => {
    if (selectedTier === currentTier) {
      setMessage({ type: 'error', text: 'Tier is already set to this value' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/update-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tier');
      }

      setMessage({ type: 'success', text: 'Tier updated successfully!' });
      router.refresh();
    } catch (error) {
      console.error('Update tier error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update tier',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncStripe = async () => {
    if (!stripeCustomerId) {
      setMessage({ type: 'error', text: 'User does not have a Stripe customer ID' });
      return;
    }

    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/sync-stripe`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync from Stripe');
      }

      setMessage({ type: 'success', text: 'Successfully synced from Stripe!' });
      router.refresh();
    } catch (error) {
      console.error('Sync Stripe error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync from Stripe',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAdmin = async () => {
    const action = isAdmin ? 'remove admin access from' : 'grant admin access to';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setTogglingAdmin(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update admin status');
      }

      setMessage({ type: 'success', text: `Successfully ${isAdmin ? 'removed' : 'granted'} admin access!` });
      router.refresh();
    } catch (error) {
      console.error('Toggle admin error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update admin status',
      });
    } finally {
      setTogglingAdmin(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="font-semibold text-lg">Admin Actions</h2>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Update Partnership Tier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Partnership Tier
        </label>
        <div className="flex gap-3">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={updating}
          >
            <option value="none">Standard (None)</option>
            <option value="affiliate">Affiliate</option>
            <option value="partner">Partner</option>
            <option value="vip">VIP</option>
          </select>
          <button
            onClick={handleUpdateTier}
            disabled={updating || selectedTier === currentTier}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Updating...' : 'Update Tier'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Current: <span className="font-semibold capitalize">{currentTier === 'none' ? 'Standard' : currentTier}</span>
        </p>
      </div>

      {/* Admin Access */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Admin Access
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              {isAdmin
                ? 'This user currently has admin access and can manage the admin console.'
                : 'Grant admin access to allow this user to manage the admin console.'}
            </p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isAdmin ? '✓ Admin' : 'Standard User'}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleAdmin}
            disabled={togglingAdmin}
            className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isAdmin
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {togglingAdmin ? 'Updating...' : isAdmin ? 'Remove Admin' : 'Make Admin'}
          </button>
        </div>
      </div>

      {/* Sync from Stripe */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Re-sync from Stripe
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Fetch the latest subscription data from Stripe and update this user's profile.
              Use this if webhooks failed or data is out of sync.
            </p>
          </div>
          <button
            onClick={handleSyncStripe}
            disabled={syncing || !stripeCustomerId}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {!stripeCustomerId && (
          <p className="mt-2 text-sm text-yellow-600">
            ⚠️ User does not have a Stripe customer ID yet
          </p>
        )}
      </div>
    </div>
  );
}
