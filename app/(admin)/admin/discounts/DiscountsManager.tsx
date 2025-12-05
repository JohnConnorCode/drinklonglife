'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Power, PowerOff, Trash2 } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';
import type { Discount } from './page';

export function DiscountsManager({ initialDiscounts }: { initialDiscounts: Discount[] }) {
  const router = useRouter();
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percent' | 'amount'>('percent');
  const [value, setValue] = useState('');

  // Restrictions
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [minimumAmount, setMinimumAmount] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Filter discounts based on status
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (statusFilter === 'all') return true;
      const isExpired = d.expires_at && new Date(d.expires_at) < new Date();
      if (statusFilter === 'active') return d.is_active && !isExpired;
      if (statusFilter === 'inactive') return !d.is_active;
      if (statusFilter === 'expired') return isExpired;
      return true;
    });
  }, [discounts, statusFilter]);

  const allSelected = filteredDiscounts.length > 0 && selectedIds.size === filteredDiscounts.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredDiscounts.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredDiscounts.map(d => d.id)));
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

  const bulkActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export CSV',
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: 'enable',
      label: 'Enable',
      icon: <Power className="w-4 h-4" />,
      variant: 'success',
    },
    {
      id: 'disable',
      label: 'Disable',
      icon: <PowerOff className="w-4 h-4" />,
      variant: 'warning',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `This will permanently delete ${selectedIds.size} discount code(s). This cannot be undone.`,
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      const selectedDiscounts = discounts.filter(d => selectedIds.has(d.id));
      const csv = [
        ['Code', 'Name', 'Type', 'Value', 'Min Order', 'Max Uses', 'Used', 'First-Time Only', 'Active', 'Expires'].join(','),
        ...selectedDiscounts.map(d => [
          d.code,
          d.name || '',
          d.discount_type,
          d.discount_type === 'percent' ? `${d.discount_percent}%` : `$${(d.discount_amount_cents || 0) / 100}`,
          d.min_amount_cents ? `$${d.min_amount_cents / 100}` : '',
          d.max_redemptions || 'Unlimited',
          d.times_redeemed,
          d.first_time_only ? 'Yes' : 'No',
          d.is_active ? 'Yes' : 'No',
          d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never',
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `discounts-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === 'delete') {
      const res = await fetch('/api/admin/discounts/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete discounts');
      }

      setDiscounts(prev => prev.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      router.refresh();
      return;
    }

    if (actionId === 'enable' || actionId === 'disable') {
      const res = await fetch('/api/admin/discounts/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates: { is_active: actionId === 'enable' } }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update discounts');
      }

      setDiscounts(prev => prev.map(d =>
        selectedIds.has(d.id) ? { ...d, is_active: actionId === 'enable' } : d
      ));
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setType('percent');
    setValue('');
    setFirstTimeOnly(false);
    setMinimumAmount('');
    setMaxRedemptions('');
    setStartsAt('');
    setExpiresAt('');
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          name: name || undefined,
          description: description || undefined,
          discount_type: type,
          discount_percent: type === 'percent' ? Number(value) : undefined,
          discount_amount_cents: type === 'amount' ? Math.round(Number(value) * 100) : undefined,
          first_time_only: firstTimeOnly,
          min_amount_cents: minimumAmount ? Math.round(Number(minimumAmount) * 100) : undefined,
          max_redemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          starts_at: startsAt ? new Date(startsAt).toISOString() : undefined,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create code');
      }

      router.refresh();
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setDiscounts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_active: !currentActive } : d))
      );
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(message);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete "${code}"? This cannot be undone.`)) {
      return;
    }

    setActionId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(message);
    } finally {
      setActionId(null);
    }
  };

  const formatDiscount = (d: Discount) => {
    if (d.discount_percent) return `${d.discount_percent}% off`;
    if (d.discount_amount_cents) return `$${(d.discount_amount_cents / 100).toFixed(2)} off`;
    return 'Unknown';
  };

  const formatRestrictions = (d: Discount) => {
    const parts: string[] = [];
    if (d.first_time_only) parts.push('New customers');
    if (d.min_amount_cents) parts.push(`Min $${(d.min_amount_cents / 100).toFixed(0)}`);
    if (d.max_redemptions) parts.push(`Max ${d.max_redemptions} uses`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const getStatus = (d: Discount) => {
    if (!d.is_active) return { label: 'Inactive', color: 'gray' };
    if (d.expires_at && new Date(d.expires_at) < new Date()) return { label: 'Expired', color: 'orange' };
    if (d.starts_at && new Date(d.starts_at) > new Date()) return { label: 'Scheduled', color: 'blue' };
    if (d.max_redemptions && d.times_redeemed >= d.max_redemptions) return { label: 'Maxed Out', color: 'yellow' };
    return { label: 'Active', color: 'green' };
  };

  return (
    <div className="space-y-6">
      {/* Create Button / Form */}
      <div className="overflow-hidden">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Discount Code
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">New Discount Code</h2>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Code + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code (what customers type)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="20% Off"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional, internal note)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summer sale discount"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Discount Type + Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percent' | 'amount')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="percent">Percentage Off</option>
                  <option value="amount">Fixed Amount Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'percent' ? 'Percent (1-100)' : 'Amount ($)'}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percent' ? '20' : '10.00'}
                  required
                  min={0.01}
                  max={type === 'percent' ? 100 : undefined}
                  step={type === 'percent' ? 1 : 0.01}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Restrictions Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Restrictions (Optional)</h3>

              <div className="space-y-3">
                {/* First-time only */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={firstTimeOnly}
                    onChange={(e) => setFirstTimeOnly(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">First-time customers only</span>
                </label>

                {/* Min order + Max uses */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Min Order ($)
                    </label>
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(e.target.value)}
                      placeholder="50"
                      min={1}
                      step={1}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Max Uses (total)
                    </label>
                    <input
                      type="number"
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                      placeholder="Unlimited"
                      min={1}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Start + Expiry Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Starts At
                    </label>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Expires At
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Discount Code'}
            </button>
          </form>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setSelectedIds(new Set()); }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({discounts.length})</option>
            <option value="active">Active ({discounts.filter(d => d.is_active && (!d.expires_at || new Date(d.expires_at) >= new Date())).length})</option>
            <option value="inactive">Inactive ({discounts.filter(d => !d.is_active).length})</option>
            <option value="expired">Expired ({discounts.filter(d => d.expires_at && new Date(d.expires_at) < new Date()).length})</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Quick Select Buttons */}
        <button
          onClick={() => {
            const inactive = discounts.filter(d => !d.is_active).map(d => d.id);
            setSelectedIds(new Set(inactive));
          }}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Select Inactive
        </button>

        <button
          onClick={() => {
            const expired = discounts.filter(d => d.expires_at && new Date(d.expires_at) < new Date()).map(d => d.id);
            setSelectedIds(new Set(expired));
          }}
          className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
        >
          Select Expired
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filteredDiscounts.length} codes shown
        </div>
      </div>

      {/* Codes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrictions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDiscounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {discounts.length === 0 ? 'No discount codes yet. Create one above.' : 'No codes match your filter.'}
                </td>
              </tr>
            ) : (
              filteredDiscounts.map((d) => {
                const status = getStatus(d);
                const statusColors: Record<string, string> = {
                  green: 'bg-green-100 text-green-700',
                  gray: 'bg-gray-100 text-gray-600',
                  orange: 'bg-orange-100 text-orange-700',
                  yellow: 'bg-yellow-100 text-yellow-700',
                  blue: 'bg-blue-100 text-blue-700',
                };

                return (
                  <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(d.id) ? 'bg-blue-50' : ''} ${!d.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <SelectCheckbox
                        checked={selectedIds.has(d.id)}
                        onChange={(checked) => handleSelectOne(d.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-mono font-bold text-gray-900">{d.code}</span>
                        {d.name && <div className="text-xs text-gray-500">{d.name}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDiscount(d)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatRestrictions(d)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{d.times_redeemed || 0}</span>
                      {d.max_redemptions && (
                        <span className="text-gray-400"> / {d.max_redemptions}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status.color]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(d.id, d.is_active)}
                          disabled={actionId === d.id}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                            d.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {actionId === d.id ? '...' : d.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.code)}
                          disabled={actionId === d.id}
                          className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>How database-only discounts work:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Discount codes are stored entirely in your database — no Stripe sync needed</li>
          <li>Discounts are applied server-side before creating the Stripe checkout session</li>
          <li>Changes take effect immediately — no waiting for Stripe webhook updates</li>
          <li>Full control over pricing and discount logic in your application</li>
        </ul>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredDiscounts.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="discount codes"
      />
    </div>
  );
}
