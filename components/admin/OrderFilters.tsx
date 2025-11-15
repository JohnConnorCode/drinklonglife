'use client';

/**
 * OrderFilters Component
 *
 * Client-side filter controls for orders list
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderStatus, PaymentStatus } from '@/lib/admin/orders';

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<OrderStatus | ''>((searchParams.get('status') as OrderStatus) || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>((searchParams.get('payment') as PaymentStatus) || '');

  const handleFilter = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (status) params.set('status', status);
    if (paymentStatus) params.set('payment', paymentStatus);

    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setStatus('');
    setPaymentStatus('');
    router.push('/admin/orders');
  };

  const hasFilters = searchQuery || status || paymentStatus;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Email, order ID, session ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFilter();
            }}
          />
        </div>

        {/* Order Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            id="payment"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        )}

        {hasFilters && (
          <span className="text-sm text-gray-600">
            {[searchQuery && 'search', status && 'status', paymentStatus && 'payment']
              .filter(Boolean)
              .length}{' '}
            filter(s) active
          </span>
        )}
      </div>
    </div>
  );
}
