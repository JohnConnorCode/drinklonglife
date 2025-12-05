'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Gift, CheckCircle } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';

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

interface IssueRewardModalProps {
  referral: Referral | null;
  onClose: () => void;
  onConfirm: (rewardType: string, rewardValue: string, notes: string) => void;
  loading: boolean;
}

function IssueRewardModal({ referral, onClose, onConfirm, loading }: IssueRewardModalProps) {
  const [rewardType, setRewardType] = useState('discount_code');
  const [rewardValue, setRewardValue] = useState('');
  const [notes, setNotes] = useState('');

  if (!referral) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Issue Reward</h3>
          <p className="text-sm text-gray-600 mt-1">
            Issue reward to <strong>{referral.referrer?.email || 'referrer'}</strong> for referring{' '}
            <strong>{referral.referred?.email || 'a user'}</strong>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="discount_code">Discount Code</option>
              <option value="store_credit">Store Credit</option>
              <option value="free_product">Free Product</option>
              <option value="cash">Cash/Payout</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Value / Details
            </label>
            <input
              type="text"
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              placeholder="e.g., REWARD20, $10 credit, Free Yellow Bomb"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this reward..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(rewardType, rewardValue, notes)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Issuing...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" /> Issue Reward
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReferralsTable({ referrals: initialReferrals }: { referrals: Referral[] }) {
  const router = useRouter();
  const [referrals, setReferrals] = useState(initialReferrals);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalReferral, setModalReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredReferrals = useMemo(() => {
    return referrals.filter((ref) => {
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
      } else if (statusFilter === 'rewarded') {
        matchesStatus = ref.reward_issued;
      }

      return matchesSearch && matchesStatus;
    });
  }, [referrals, searchTerm, statusFilter]);

  const allSelected = filteredReferrals.length > 0 && selectedIds.size === filteredReferrals.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredReferrals.length;

  // Count eligible for reward (completed purchase, not yet rewarded)
  const eligibleCount = referrals.filter(r => r.completed_purchase && !r.reward_issued).length;
  const selectedEligibleCount = Array.from(selectedIds).filter(id => {
    const ref = referrals.find(r => r.id === id);
    return ref?.completed_purchase && !ref?.reward_issued;
  }).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredReferrals.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleIssueReward = async (rewardType: string, rewardValue: string, notes: string) => {
    if (!modalReferral) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/referrals/${modalReferral.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_type: rewardType, reward_value: rewardValue, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue reward');
      }

      // Update local state
      setReferrals(prev =>
        prev.map(r =>
          r.id === modalReferral.id
            ? { ...r, reward_issued: true, reward_type: rewardType, reward_value: rewardValue }
            : r
        )
      );

      setModalReferral(null);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export CSV',
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: 'issue_rewards',
      label: `Issue Rewards (${selectedEligibleCount} eligible)`,
      icon: <Gift className="w-4 h-4" />,
      variant: 'success',
      requiresConfirmation: true,
      confirmationMessage: `This will issue rewards for ${selectedEligibleCount} eligible referral(s). Referrals must have a completed purchase and no reward issued yet.`,
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      const selectedReferrals = referrals.filter(r => selectedIds.has(r.id));
      const csv = [
        ['Referrer Email', 'Referrer Name', 'Referral Code', 'Referred Email', 'Status', 'Reward Issued', 'Reward Type', 'Reward Value', 'Date'].join(','),
        ...selectedReferrals.map(r => [
          r.referrer?.email || '',
          r.referrer?.full_name || r.referrer?.name || '',
          r.referral_code,
          r.referred?.email || 'Not used',
          r.completed_purchase ? 'Completed' : r.referred ? 'Pending Purchase' : 'Unused',
          r.reward_issued ? 'Yes' : 'No',
          r.reward_type || '',
          r.reward_value || '',
          new Date(r.created_at).toLocaleDateString(),
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referrals-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === 'issue_rewards') {
      if (selectedEligibleCount === 0) {
        alert('No eligible referrals selected. Referrals must have a completed purchase and no reward issued yet.');
        return;
      }

      const res = await fetch('/api/admin/referrals/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          reward_type: 'manual_bulk',
          reward_value: 'Issued via bulk action',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue rewards');
      }

      // Update local state for all eligible
      const eligibleIds = new Set(
        referrals
          .filter(r => selectedIds.has(r.id) && r.completed_purchase && !r.reward_issued)
          .map(r => r.id)
      );

      setReferrals(prev =>
        prev.map(r =>
          eligibleIds.has(r.id)
            ? { ...r, reward_issued: true, reward_type: 'manual_bulk', reward_value: 'Issued via bulk action' }
            : r
        )
      );

      setSelectedIds(new Set());
      router.refresh();

      alert(`Successfully issued rewards for ${data.updated} referral(s)${data.skipped > 0 ? `. Skipped ${data.skipped} (not eligible).` : ''}`);
    }
  };

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
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by code or email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setSelectedIds(new Set()); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setSelectedIds(new Set()); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Referrals ({referrals.length})</option>
          <option value="used">Used - Signed Up ({referrals.filter(r => r.referred).length})</option>
          <option value="completed">Completed Purchase ({referrals.filter(r => r.completed_purchase).length})</option>
          <option value="pending_reward">Pending Reward ({eligibleCount})</option>
          <option value="rewarded">Rewarded ({referrals.filter(r => r.reward_issued).length})</option>
        </select>

        <div className="h-8 w-px bg-gray-200 hidden md:block" />

        {/* Quick Select Pending Rewards */}
        {eligibleCount > 0 && (
          <button
            onClick={() => {
              const pending = referrals.filter(r => r.completed_purchase && !r.reward_issued).map(r => r.id);
              setSelectedIds(new Set(pending));
            }}
            className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            Select Pending Rewards ({eligibleCount})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <SelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </th>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No referrals match your filters
                </td>
              </tr>
            ) : (
              filteredReferrals.map((ref) => {
                const canIssueReward = ref.completed_purchase && !ref.reward_issued;
                return (
                  <tr
                    key={ref.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(ref.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <SelectCheckbox
                        checked={selectedIds.has(ref.id)}
                        onChange={(checked) => handleSelectOne(ref.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ref.referrer?.email || 'N/A'}
                      </div>
                      {(ref.referrer?.full_name || ref.referrer?.name) && (
                        <div className="text-xs text-gray-500">
                          {ref.referrer?.full_name || ref.referrer?.name}
                        </div>
                      )}
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
                          <div className="text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Issued
                          </div>
                          {ref.reward_value && (
                            <div className="text-xs text-gray-500">{ref.reward_value}</div>
                          )}
                        </div>
                      ) : ref.completed_purchase ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
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
                    <td className="px-6 py-4 text-right">
                      {canIssueReward && (
                        <button
                          onClick={() => setModalReferral(ref)}
                          className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Gift className="w-3 h-3" /> Issue Reward
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        Showing {filteredReferrals.length} of {referrals.length} referrals
        {eligibleCount > 0 && (
          <span className="ml-4 text-yellow-700 font-medium">
            • {eligibleCount} pending reward{eligibleCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredReferrals.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="referrals"
      />

      {/* Issue Reward Modal */}
      <IssueRewardModal
        referral={modalReferral}
        onClose={() => setModalReferral(null)}
        onConfirm={handleIssueReward}
        loading={loading}
      />
    </div>
  );
}
