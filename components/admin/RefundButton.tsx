'use client';

/**
 * RefundButton Component
 *
 * Allows admins to process full or partial refunds for orders
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { logger } from '@/lib/logger';

interface RefundButtonProps {
  orderId: string;
  orderAmount: number;
}

export function RefundButton({ orderId, orderAmount }: RefundButtonProps) {
  const router = useRouter();
  const [refunding, setRefunding] = useState(false);
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFullRefund = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to process a FULL refund of ${formatCurrency(orderAmount)}?\n\n` +
      `This action cannot be undone. The customer will receive the full amount back to their original payment method.`
    );

    if (!confirmed) return;

    setRefunding(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: undefined, // Full refund
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process refund');
      }

      // Show success message
      alert('Refund processed successfully! The order has been marked as refunded.');

      // Refresh the page to show updated data
      router.refresh();
    } catch (err: any) {
      logger.error('Refund error:', err);
      setError(err.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  const handlePartialRefund = async () => {
    const amountInCents = Math.round(parseFloat(partialAmount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountInCents > orderAmount) {
      setError('Refund amount cannot exceed order total');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to process a PARTIAL refund of ${formatCurrency(amountInCents)}?\n\n` +
      `Original order amount: ${formatCurrency(orderAmount)}\n` +
      `Refund amount: ${formatCurrency(amountInCents)}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setRefunding(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInCents,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process refund');
      }

      // Show success message
      alert('Partial refund processed successfully!');

      // Refresh the page to show updated data
      router.refresh();
      setShowPartialInput(false);
      setPartialAmount('');
    } catch (err: any) {
      logger.error('Refund error:', err);
      setError(err.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Full Refund Button */}
      <button
        onClick={handleFullRefund}
        disabled={refunding}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {refunding ? 'Processing...' : `Full Refund (${formatCurrency(orderAmount)})`}
      </button>

      {/* Partial Refund Toggle */}
      {!showPartialInput ? (
        <button
          onClick={() => setShowPartialInput(true)}
          disabled={refunding}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Partial Refund
        </button>
      ) : (
        <div className="space-y-2">
          <div>
            <label htmlFor="partial-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount (USD)
            </label>
            <input
              type="number"
              id="partial-amount"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={(orderAmount / 100).toFixed(2)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={refunding}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max: {formatCurrency(orderAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePartialRefund}
              disabled={refunding || !partialAmount}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refunding ? 'Processing...' : 'Process Partial Refund'}
            </button>

            <button
              onClick={() => {
                setShowPartialInput(false);
                setPartialAmount('');
                setError(null);
              }}
              disabled={refunding}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        <p className="font-medium mb-1">Refund Information:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Refunds are processed through Stripe</li>
          <li>Customer receives funds to original payment method</li>
          <li>Processing time: 5-10 business days</li>
          <li>Action cannot be undone</li>
        </ul>
      </div>
    </div>
  );
}
