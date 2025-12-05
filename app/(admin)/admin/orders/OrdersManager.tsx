'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Truck, Package, XCircle } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDateTime } from '@/lib/utils/formatDate';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge';
import type { OrderStatus, PaymentStatus } from '@/lib/admin/orders';

interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  amount_total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  user_id?: string | null;
}

interface OrdersManagerProps {
  initialOrders: Order[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
      return true;
    });
  }, [orders, statusFilter, paymentFilter]);

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredOrders.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
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
      id: 'mark-processing',
      label: 'Mark Processing',
      icon: <Package className="w-4 h-4" />,
      requiresConfirmation: true,
      confirmationMessage: `Mark ${selectedIds.size} order(s) as "Processing"?`,
    },
    {
      id: 'mark-shipped',
      label: 'Mark Shipped',
      icon: <Truck className="w-4 h-4" />,
      requiresConfirmation: true,
      confirmationMessage: `Mark ${selectedIds.size} order(s) as "Shipped"? This will send shipping confirmation emails.`,
    },
    {
      id: 'mark-cancelled',
      label: 'Cancel Orders',
      icon: <XCircle className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `Cancel ${selectedIds.size} order(s)? This cannot be undone.`,
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      const selectedOrders = orders.filter(o => selectedIds.has(o.id));
      const csv = [
        ['Order ID', 'Customer Email', 'Amount', 'Status', 'Payment', 'Date', 'Stripe Session'].join(','),
        ...selectedOrders.map(o => [
          o.id,
          o.customer_email || '',
          (o.amount_total / 100).toFixed(2),
          o.status,
          o.payment_status,
          o.created_at,
          o.stripe_session_id,
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Status update actions
    const statusMap: Record<string, OrderStatus> = {
      'mark-processing': 'processing',
      'mark-shipped': 'shipped',
      'mark-cancelled': 'cancelled',
    };

    const newStatus = statusMap[actionId];
    if (newStatus) {
      const res = await fetch('/api/admin/orders/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update orders');
      }

      // Update local state
      setOrders(prev => prev.map(o =>
        selectedIds.has(o.id) ? { ...o, status: newStatus } : o
      ));
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  // Quick filter counts
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | 'all'); setSelectedIds(new Set()); }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value as PaymentStatus | 'all'); setSelectedIds(new Set()); }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="partial_refund">Partial Refund</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Quick Select Buttons */}
        <button
          onClick={() => {
            const needsAction = orders.filter(o => o.status === 'paid').map(o => o.id);
            setSelectedIds(new Set(needsAction));
          }}
          className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          Select Ready to Process ({paidCount})
        </button>

        <button
          onClick={() => {
            const processing = orders.filter(o => o.status === 'processing').map(o => o.id);
            setSelectedIds(new Set(processing));
          }}
          className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Select Ready to Ship ({processingCount})
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filteredOrders.length} orders shown
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders match your filters
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(order.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <SelectCheckbox
                        checked={selectedIds.has(order.id)}
                        onChange={(checked) => handleSelectOne(order.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.stripe_session_id.slice(0, 20)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer_email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount_total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredOrders.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="orders"
      />
    </div>
  );
}
