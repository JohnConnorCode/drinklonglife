'use client';

/**
 * OrderStatusUpdater Component
 *
 * Allows admins to update order status
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/lib/admin/orders';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const statusOptions: { value: OrderStatus; label: string; description: string }[] = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Order received, awaiting processing',
  },
  {
    value: 'processing',
    label: 'Processing',
    description: 'Order is being prepared',
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Order has been fulfilled',
  },
  {
    value: 'failed',
    label: 'Failed',
    description: 'Order could not be completed',
  },
  {
    value: 'refunded',
    label: 'Refunded',
    description: 'Order has been refunded',
  },
];

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setError('Please select a different status');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to update the order status to "${selectedStatus.toUpperCase()}"?\n\n` +
      `This will change the order status from "${currentStatus}" to "${selectedStatus}".`
    );

    if (!confirmed) return;

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setSuccess(true);

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error('Status update error:', err);
      setError(err.message || 'Failed to update status');
      // Revert to current status on error
      setSelectedStatus(currentStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">Status updated successfully!</p>
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Order Status
        </label>

        <div className="space-y-2">
          {statusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                selectedStatus === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={selectedStatus === option.value}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as OrderStatus);
                  setError(null);
                  setSuccess(false);
                }}
                disabled={updating}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </div>
              {option.value === currentStatus && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  Current
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={updating || selectedStatus === currentStatus}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? 'Updating...' : 'Update Status'}
      </button>

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        <p className="font-medium mb-1">Status Guide:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Pending:</strong> Order received, awaiting action</li>
          <li><strong>Processing:</strong> Order being prepared/shipped</li>
          <li><strong>Completed:</strong> Order fulfilled successfully</li>
          <li><strong>Failed:</strong> Order could not be completed</li>
          <li><strong>Refunded:</strong> Use refund button instead</li>
        </ul>
      </div>
    </div>
  );
}
