import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin';
import { getOrders, getOrderStats, OrderStatus, PaymentStatus } from '@/lib/admin/orders';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDateTime } from '@/lib/utils/formatDate';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderFilters } from '@/components/admin/OrderFilters';

export const metadata: Metadata = {
  title: 'Orders | Admin',
  description: 'Manage customer orders and process refunds',
};

interface OrdersPageProps {
  searchParams: {
    search?: string;
    status?: OrderStatus;
    payment?: PaymentStatus;
  };
}

async function OrdersStats() {
  const stats = await getOrderStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-600 mb-1">Total Orders</div>
        <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</div>
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-600 mb-1">Pending Orders</div>
        <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
      </div>
    </div>
  );
}

async function OrdersTable({ searchParams }: OrdersPageProps) {
  const orders = await getOrders({
    searchQuery: searchParams.search,
    status: searchParams.status,
    paymentStatus: searchParams.payment,
    limit: 50,
  });

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
        <p className="text-sm text-gray-500">
          {searchParams.search || searchParams.status || searchParams.payment
            ? 'Try adjusting your filters'
            : 'Orders will appear here once customers make purchases'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
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
            ))}
          </tbody>
        </table>
      </div>

      {orders.length >= 50 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing first 50 orders. Use filters to narrow results.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage customer orders, process refunds, and export data
          </p>
        </div>

        <Link
          href="/admin/orders/export"
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </Link>
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg" />}>
        <OrdersStats />
      </Suspense>

      {/* Filters */}
      <OrderFilters />

      {/* Orders Table */}
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
        <OrdersTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
