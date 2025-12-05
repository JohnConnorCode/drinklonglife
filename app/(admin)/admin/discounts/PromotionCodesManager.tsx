'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PromotionCode {
  id: string;
  code: string;
  couponId: string;
  active: boolean;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  firstTimeTransaction: boolean;
  minimumAmount: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: number | null;
  createdAt: number;
}

export function PromotionCodesManager({ initialCodes }: { initialCodes: PromotionCode[] }) {
  const router = useRouter();
  const [codes, setCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'amount'>('percent');
  const [value, setValue] = useState('');
  const [duration, setDuration] = useState<'once' | 'repeating' | 'forever'>('once');
  const [durationMonths, setDurationMonths] = useState('3');

  // Restrictions
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [minimumAmount, setMinimumAmount] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const resetForm = () => {
    setCode('');
    setType('percent');
    setValue('');
    setDuration('once');
    setDurationMonths('3');
    setFirstTimeOnly(false);
    setMinimumAmount('');
    setMaxRedemptions('');
    setExpiresAt('');
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          duration,
          durationInMonths: duration === 'repeating' ? Number(durationMonths) : undefined,
          firstTimeOnly,
          minimumAmount: minimumAmount ? Number(minimumAmount) : undefined,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create code');
      }

      router.refresh();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentActive } : c))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  };

  const formatDiscount = (promo: PromotionCode) => {
    if (promo.percentOff) return `${promo.percentOff}% off`;
    if (promo.amountOff) return `$${(promo.amountOff / 100).toFixed(2)} off`;
    return 'Unknown';
  };

  const formatDuration = (promo: PromotionCode) => {
    if (promo.duration === 'once') return 'One-time';
    if (promo.duration === 'forever') return 'Forever';
    if (promo.duration === 'repeating' && promo.durationInMonths) {
      return `${promo.durationInMonths} mo`;
    }
    return promo.duration;
  };

  const formatRestrictions = (promo: PromotionCode) => {
    const parts: string[] = [];
    if (promo.firstTimeTransaction) parts.push('New customers');
    if (promo.minimumAmount) parts.push(`Min $${(promo.minimumAmount / 100).toFixed(0)}`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div className="space-y-6">
      {/* Create Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Discount Code
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
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
            {/* Code */}
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
                  min={1}
                  max={type === 'percent' ? 100 : undefined}
                  step={type === 'percent' ? 1 : 0.01}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (for subscriptions)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as 'once' | 'repeating' | 'forever')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="once">First payment only</option>
                  <option value="repeating">Multiple months</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              {duration === 'repeating' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    min={1}
                    max={36}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
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

                {/* Min order + Max uses + Expiry */}
                <div className="grid grid-cols-3 gap-3">
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
                      Max Uses
                    </label>
                    <input
                      type="number"
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                      placeholder="100"
                      min={1}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Expires
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
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

      {/* Codes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrictions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {codes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No discount codes yet. Create one above.
                </td>
              </tr>
            ) : (
              codes.map((promo) => {
                const isExpired = promo.expiresAt && promo.expiresAt < Math.floor(Date.now() / 1000);
                const isMaxedOut = promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions;

                return (
                  <tr key={promo.id} className={`hover:bg-gray-50 ${!promo.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-900">{promo.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDiscount(promo)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDuration(promo)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatRestrictions(promo)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{promo.timesRedeemed}</span>
                      {promo.maxRedemptions && (
                        <span className="text-gray-400"> / {promo.maxRedemptions}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!promo.active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Inactive
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                          Expired
                        </span>
                      ) : isMaxedOut ? (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          Maxed Out
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(promo.id, promo.active)}
                          disabled={actionId === promo.id}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                            promo.active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {actionId === promo.id ? '...' : promo.active ? 'Disable' : 'Enable'}
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
        <strong>How it works:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Codes are created directly in Stripe with all restrictions</li>
          <li>Customers enter the code at checkout for instant discount</li>
          <li>"First-time only" restricts to customers with no previous orders</li>
          <li>"Min Order" requires a minimum cart value before the code applies</li>
        </ul>
      </div>
    </div>
  );
}
