'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { Tag, X } from 'lucide-react';

export function CouponInput() {
  const [code, setCode] = useState('');
  const { coupon, isLoading, error, applyCoupon, removeCoupon } = useCartStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    await applyCoupon(code.trim().toUpperCase());
  };

  const handleRemove = () => {
    removeCoupon();
    setCode('');
  };

  if (coupon?.valid) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Coupon Applied: {coupon.code}</p>
            <p className="text-sm text-green-700">
              {coupon.discountPercent
                ? `${coupon.discountPercent}% off`
                : `$${(coupon.discountAmount! / 100).toFixed(2)} off`}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-2 hover:bg-green-100 rounded-full transition-colors"
          aria-label="Remove coupon"
        >
          <X className="w-5 h-5 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter coupon code"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-accent-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
