'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Discount {
  id: string;
  user_id: string;
  discount_code: string;
  stripe_coupon_id: string | null;
  source: string;
  active: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  profile: {
    email: string;
    full_name: string | null;
    name: string | null;
  } | null;
}

export function DiscountsTable({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setLoadingId(id);
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentState }),
      });

      if (!response.ok) throw new Error('Failed to update');

      router.refresh();
    } catch (error) {
      console.error('Error toggling discount:', error);
      alert('Failed to update discount');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete discount code "${code}"?`)) {
      return;
    }

    setLoadingId(id);
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.refresh();
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Failed to delete discount');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.discount_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.source?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = discount.active && !discount.used_at;
    } else if (statusFilter === 'used') {
      matchesStatus = !!discount.used_at;
    } else if (statusFilter === 'expired') {
      matchesStatus = !!(discount.expires_at && new Date(discount.expires_at) < new Date());
    }

    return matchesSearch && matchesStatus;
  });

  if (discounts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No discounts found</p>
        <p className="text-sm text-gray-400 mt-2">
          Discounts are created automatically through referrals
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Search by email, code, or source..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Discounts</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Used
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDiscounts.map((discount) => {
              const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
              const isUsed = !!discount.used_at;
              const isActive = discount.active && !isExpired && !isUsed;

              return (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {discount.profile?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono font-bold text-gray-900">
                      {discount.discount_code}
                    </div>
                    {discount.stripe_coupon_id && (
                      <div className="text-xs text-gray-500 font-mono">
                        {discount.stripe_coupon_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        discount.source === 'referral_reward'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {discount.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isUsed ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Used
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {discount.expires_at ? (
                      <div
                        className={
                          isExpired ? 'text-red-600' : 'text-gray-900'
                        }
                      >
                        {new Date(discount.expires_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiration</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {discount.used_at ? (
                      new Date(discount.used_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {!isUsed && (
                        <button
                          onClick={() => handleToggleActive(discount.id, discount.active)}
                          disabled={loadingId === discount.id}
                          className="px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: discount.active ? '#fef3c7' : '#d1fae5',
                            color: discount.active ? '#92400e' : '#065f46',
                          }}
                        >
                          {loadingId === discount.id ? '...' : discount.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(discount.id, discount.discount_code)}
                        disabled={loadingId === discount.id}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {loadingId === discount.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No discounts match your filters</p>
        </div>
      )}
    </div>
  );
}
