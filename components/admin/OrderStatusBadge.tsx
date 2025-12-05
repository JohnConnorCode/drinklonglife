/**
 * OrderStatusBadge Component
 *
 * Displays color-coded badges for order status and payment status
 */

import { OrderStatus, PaymentStatus } from '@/lib/admin/orders';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
      case 'unpaid':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'succeeded':
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'partial_refund':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    if (status === 'partial_refund') return 'Partial Refund';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
}
