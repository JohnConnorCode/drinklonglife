'use client';

import { useState } from 'react';

interface Referral {
  id: string;
  referral_code: string;
  completed_purchase: boolean;
  reward_issued: boolean;
  reward_type: string | null;
  reward_value: string | null;
  created_at: string;
  completed_at: string | null;
  referrer: {
    email: string;
    full_name: string | null;
    name: string | null;
  } | null;
  referred: {
    email: string;
    full_name: string | null;
    name: string | null;
  } | null;
}

export function ReferralsTable({ referrals }: { referrals: Referral[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referrer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referred?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'used') {
      matchesStatus = !!ref.referred;
    } else if (statusFilter === 'completed') {
      matchesStatus = ref.completed_purchase;
    } else if (statusFilter === 'pending_reward') {
      matchesStatus = ref.completed_purchase && !ref.reward_issued;
    }

    return matchesSearch && matchesStatus;
  });

  if (referrals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No referrals found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Search by code or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Referrals</option>
          <option value="used">Used (Signed Up)</option>
          <option value="completed">Completed Purchase</option>
          <option value="pending_reward">Pending Reward</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Referrer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Referred User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReferrals.map((ref) => (
              <tr key={ref.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {ref.referrer?.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono font-bold text-gray-900">
                    {ref.referral_code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {ref.referred ? (
                    <div className="text-sm text-gray-900">{ref.referred.email}</div>
                  ) : (
                    <span className="text-sm text-gray-400">Not used yet</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {ref.completed_purchase ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : ref.referred ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending Purchase
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Unused
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {ref.reward_issued ? (
                    <div className="text-sm">
                      <div className="text-green-600 font-semibold">✓ Issued</div>
                      {ref.reward_value && (
                        <div className="text-xs text-gray-500">{ref.reward_value}</div>
                      )}
                    </div>
                  ) : ref.completed_purchase ? (
                    <span className="text-xs text-yellow-600">Pending</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(ref.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReferrals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No referrals match your filters</p>
        </div>
      )}
    </div>
  );
}
