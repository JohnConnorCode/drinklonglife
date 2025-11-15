'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  tier_key: string | null;
  size_key: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  profile: {
    email: string;
    full_name: string | null;
    name: string | null;
  };
}

export function SubscriptionsTable({ subscriptions }: { subscriptions: Subscription[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.stripe_subscription_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelSubscription = async (subId: string, stripeSubId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? It will cancel at the end of the billing period.')) {
      return;
    }

    setActioningId(subId);
    try {
      const response = await fetch(`/api/admin/subscriptions/${subId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      alert('Subscription will be canceled at period end');
      window.location.reload();
    } catch (error) {
      alert('Error canceling subscription');
      console.error(error);
    } finally {
      setActioningId(null);
    }
  };

  const handlePauseSubscription = async (subId: string, stripeSubId: string) => {
    if (!confirm('Pause this subscription? (Not implemented - requires Stripe API call)')) {
      return;
    }
    alert('Pause feature coming soon - use Stripe dashboard for now');
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No subscriptions found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Search by email or subscription ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {sub.profile?.email || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {sub.stripe_subscription_id.substring(0, 20)}...
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {sub.tier_key || 'Unknown'} {sub.size_key && `- ${sub.size_key}`}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : sub.status === 'trialing'
                        ? 'bg-blue-100 text-blue-800'
                        : sub.status === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                  {sub.cancel_at_period_end && (
                    <div className="text-xs text-red-600 mt-1">Cancels at period end</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    {new Date(sub.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    Started: {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {!sub.cancel_at_period_end && sub.status === 'active' && (
                      <button
                        onClick={() => handleCancelSubscription(sub.id, sub.stripe_subscription_id)}
                        disabled={actioningId === sub.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Stripe →
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscriptions match your filters</p>
        </div>
      )}
    </div>
  );
}
