import { Metadata } from 'next';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin';
import { getOrders, getOrderStats } from '@/lib/admin/orders';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { FadeIn } from '@/components/animations';
import { OrdersManager } from './OrdersManager';

export const metadata: Metadata = {
  title: 'Orders | Admin',
  description: 'Manage customer orders and process refunds',
};

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

async function OrdersContent() {
  const orders = await getOrders({ limit: 200 });

  return <OrdersManager initialOrders={orders} />;
}

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="up" delay={0.05}>
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage customer orders, process fulfillment, and export data
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn direction="up" delay={0.1}>
        <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg" />}>
          <OrdersStats />
        </Suspense>
      </FadeIn>

      {/* Status Guide & Bulk Actions Guide */}
      <FadeIn direction="up" delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <details className="bg-gray-50 rounded-xl border border-gray-200">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              Order Status Guide
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">pending</span>
                  <span className="text-gray-600">— Order created, awaiting payment</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">paid</span>
                  <span className="text-gray-600">— Payment successful, ready to process</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">processing</span>
                  <span className="text-gray-600">— Being prepared for shipping</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">shipped</span>
                  <span className="text-gray-600">— Dispatched to customer</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">delivered</span>
                  <span className="text-gray-600">— Received by customer</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">cancelled</span>
                  <span className="text-gray-600">— Order cancelled</span>
                </div>
              </div>
            </div>
          </details>

          <details className="bg-blue-50 rounded-xl border border-blue-200">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-xl transition-colors">
              Bulk Actions Guide
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-blue-200">
              <div className="space-y-3 text-sm text-blue-800">
                <p><strong>Quick Select Buttons:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Ready to Process</strong> — Select all paid orders awaiting fulfillment</li>
                  <li><strong>Ready to Ship</strong> — Select all orders currently being processed</li>
                </ul>
                <p className="pt-2"><strong>Available Actions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Export CSV</strong> — Download selected orders as spreadsheet</li>
                  <li><strong>Mark Processing</strong> — Move to processing status</li>
                  <li><strong>Mark Shipped</strong> — Mark as shipped (sends email notification)</li>
                  <li><strong>Cancel Orders</strong> — Cancel selected orders</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </FadeIn>

      {/* Orders Manager with Bulk Actions */}
      <FadeIn direction="up" delay={0.2}>
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <OrdersContent />
        </Suspense>
      </FadeIn>
    </div>
  );
}
