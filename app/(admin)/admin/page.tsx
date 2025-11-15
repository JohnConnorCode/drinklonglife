import { Metadata } from 'next';
import Link from 'next/link';
import { getAdminStats } from '@/lib/admin';
import { getAnalyticsMetrics } from '@/lib/supabase/queries/analytics';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Long Life',
  description: 'Admin console for managing users and system health',
};

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const ecommerceMetrics = await getAnalyticsMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          E-commerce performance, system health, and user stats
        </p>
      </div>

      {/* E-commerce Metrics */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          E-commerce Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${ecommerceMetrics.revenue.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-sm mt-1 flex items-center ${
              ecommerceMetrics.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {ecommerceMetrics.revenue.growth > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {ecommerceMetrics.revenue.growth > 0 && '+'}
              {ecommerceMetrics.revenue.growth.toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${ecommerceMetrics.revenue.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">{ecommerceMetrics.orders.thisMonth} orders</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <ShoppingCart className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{ecommerceMetrics.orders.total}</p>
            <p className="text-sm text-gray-500 mt-1">All-time purchases</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${ecommerceMetrics.orders.averageValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per transaction</p>
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Product Catalog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
              <Package className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{ecommerceMetrics.products.total}</p>
            <Link
              href="/admin/products"
              className="text-sm text-accent-primary hover:underline mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Published</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ecommerceMetrics.products.published}</p>
            <p className="text-sm text-gray-500 mt-1">Live on site</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Drafts</h3>
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ecommerceMetrics.products.drafts}</p>
            <p className="text-sm text-gray-500 mt-1">Not published</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Missing Variants</h3>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ecommerceMetrics.products.withoutVariants}</p>
            <p className="text-sm text-gray-500 mt-1">Need pricing</p>
          </div>
        </div>
      </div>

      {/* Health Check Stats */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Registered accounts</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">With Stripe ID</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.usersWithStripe}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalUsers > 0
                ? `${Math.round((stats.usersWithStripe / stats.totalUsers) * 100)}% of users`
                : 'No users yet'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Subs</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            <p className="text-sm text-gray-500 mt-1">Active or trialing</p>
          </div>
        </div>
      </div>

      {/* Partnership Tier Breakdown */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Partnership Tiers
        </h2>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(stats.tierCounts).map(([tier, count]) => (
              <div key={tier} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize mt-1">
                  {tier === 'none' ? 'Standard' : tier}
                </p>
              </div>
            ))}
            {Object.keys(stats.tierCounts).length === 0 && (
              <p className="col-span-4 text-gray-500 text-center py-4">
                No partnership tiers assigned yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/products/new"
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-accent-primary transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-primary/10 group-hover:bg-accent-primary/20 rounded-lg flex items-center justify-center transition-colors">
                <Package className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Product</h3>
                <p className="text-sm text-gray-600">Create new product</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/ingredients/new"
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-orange-500 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Ingredient</h3>
                <p className="text-sm text-gray-600">Create ingredient</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-blue-500 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/discounts"
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-green-500 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Discounts</h3>
                <p className="text-sm text-gray-600">Discount codes</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Admin Access</h3>
            <p className="text-sm text-blue-700">
              You have admin privileges. Use these tools responsibly. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
