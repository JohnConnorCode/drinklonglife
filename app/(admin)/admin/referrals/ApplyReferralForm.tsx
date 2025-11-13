'use client';

import { useState } from 'react';

export function ApplyReferralForm() {
  const [userId, setUserId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [source, setSource] = useState('admin_manual');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          discountCode: discountCode.toUpperCase(),
          source,
          expiresInDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply discount');
      }

      setMessage({ type: 'success', text: data.message || 'Discount applied successfully!' });

      // Reset form
      setUserId('');
      setDiscountCode('');
      setSource('admin_manual');
      setExpiresInDays(30);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User ID */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          User ID *
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          UUID of the user (found in User Management)
        </p>
      </div>

      {/* Discount Code */}
      <div>
        <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-1">
          Discount Code *
        </label>
        <input
          type="text"
          id="discountCode"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
          placeholder="SAVE20"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Stripe coupon code or promotion code
        </p>
      </div>

      {/* Source */}
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
          Source
        </label>
        <select
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="admin_manual">Admin Manual</option>
          <option value="customer_service">Customer Service</option>
          <option value="promotion">Promotion</option>
          <option value="compensation">Compensation</option>
          <option value="special_offer">Special Offer</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Tracking source for this discount
        </p>
      </div>

      {/* Expires In Days */}
      <div>
        <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-1">
          Expires In (Days)
        </label>
        <input
          type="number"
          id="expiresInDays"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
          min="1"
          max="365"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Number of days until discount expires (default: 30)
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Applying...' : 'Apply Discount'}
      </button>
    </form>
  );
}
