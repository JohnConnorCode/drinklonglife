'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateDiscountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      userEmail: formData.get('userEmail') as string,
      discountCode: formData.get('discountCode') as string,
      stripeCouponId: formData.get('stripeCouponId') as string,
      expiresAt: formData.get('expiresAt') as string | null,
      active: formData.get('active') === 'true',
    };

    try {
      const response = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create discount');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/discounts');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 text-6xl">✓</div>
        <h2 className="text-2xl font-bold mb-3 text-green-600">Discount Created!</h2>
        <p className="text-gray-600">
          Redirecting to discounts list...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Email */}
      <div>
        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
          User Email *
        </label>
        <input
          id="userEmail"
          name="userEmail"
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="user@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          The email address of the user who will receive this discount
        </p>
      </div>

      {/* Discount Code */}
      <div>
        <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-1">
          Discount Code *
        </label>
        <input
          id="discountCode"
          name="discountCode"
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          placeholder="SAVE20"
        />
        <p className="text-xs text-gray-500 mt-1">
          The code users will see and use at checkout
        </p>
      </div>

      {/* Stripe Coupon ID */}
      <div>
        <label htmlFor="stripeCouponId" className="block text-sm font-medium text-gray-700 mb-1">
          Stripe Coupon ID *
        </label>
        <input
          id="stripeCouponId"
          name="stripeCouponId"
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          placeholder="SAVE20"
        />
        <p className="text-xs text-gray-500 mt-1">
          Must match a coupon created in{' '}
          <a
            href="https://dashboard.stripe.com/coupons"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Stripe Dashboard
          </a>
        </p>
      </div>

      {/* Expiration Date */}
      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
          Expiration Date (Optional)
        </label>
        <input
          id="expiresAt"
          name="expiresAt"
          type="datetime-local"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave blank for no expiration
        </p>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Active (users can use this discount immediately)
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Discount'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/discounts')}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300/30 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
