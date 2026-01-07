import { Metadata } from 'next';
import Link from 'next/link';
import { getAdminStats } from '@/lib/admin';
import { getAnalyticsMetrics } from '@/lib/supabase/queries/analytics';
import { FadeIn, StaggerContainer } from '@/components/animations';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ArrowRight,
  Leaf,
  Percent,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Long Life',
  description: 'Admin console for managing users and system health',
};

export const dynamic = 'force-dynamic';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const ecommerceMetrics = await getAnalyticsMetrics();
  const today = new Date();

  return (
    <div className="space-y-10">
      {/* Header */}
      <FadeIn direction="up" delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(today)}</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Here's what's happening with Long Life today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              View Orders
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-all"
            >
              <Package className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* E-commerce Metrics */}
      <section>
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Revenue & Sales
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track your store's financial performance and order volume
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-1"
            >
              View all orders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
{ecommerceMetrics.revenue.lastMonth === 0 && ecommerceMetrics.revenue.thisMonth > 0 ? (
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New!
                </span>
              ) : ecommerceMetrics.revenue.lastMonth === 0 ? (
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-500">
                  —
                </span>
              ) : (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  ecommerceMetrics.revenue.growth > 0
                    ? 'bg-green-50 text-green-700'
                    : ecommerceMetrics.revenue.growth < 0
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {ecommerceMetrics.revenue.growth > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : ecommerceMetrics.revenue.growth < 0 ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : null}
                  {ecommerceMetrics.revenue.growth > 0 && '+'}
                  {ecommerceMetrics.revenue.growth.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${ecommerceMetrics.revenue.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                {ecommerceMetrics.orders.thisMonth} orders
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${ecommerceMetrics.revenue.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">This Month</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ecommerceMetrics.orders.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${ecommerceMetrics.orders.averageValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Avg Order Value</p>
          </div>
        </StaggerContainer>
      </section>

      {/* Product Stats */}
      <section>
        <FadeIn direction="up" delay={0.35}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Product Catalog
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your blends, pricing, and inventory status
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-1"
            >
              Manage products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ecommerceMetrics.products.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Products</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                Live
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ecommerceMetrics.products.published}</p>
            <p className="text-sm text-gray-500 mt-1">Published</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ecommerceMetrics.products.drafts}</p>
            <p className="text-sm text-gray-500 mt-1">Drafts</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              {ecommerceMetrics.products.withoutVariants > 0 && (
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-700">
                  Action needed
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{ecommerceMetrics.products.withoutVariants}</p>
            <p className="text-sm text-gray-500 mt-1">Missing Variants</p>
          </div>
        </StaggerContainer>
      </section>

      {/* Health Check Stats */}
      <section>
        <FadeIn direction="up" delay={0.55}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Customers & Subscriptions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                User accounts, payment status, and recurring revenue
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-1"
            >
              View all users <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              {stats.totalUsers > 0 && (
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                  {Math.round((stats.usersWithStripe / stats.totalUsers) * 100)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.usersWithStripe}</p>
            <p className="text-sm text-gray-500 mt-1">With Stripe ID</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              {stats.activeSubscriptions > 0 && (
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-700">
                  Active
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            <p className="text-sm text-gray-500 mt-1">Subscriptions</p>
          </div>
        </StaggerContainer>
      </section>

      {/* Partnership Tier Breakdown */}
      <section>
        <FadeIn direction="up" delay={0.7}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Ambassador Program
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track referral partners and their tier distribution
              </p>
            </div>
            <Link
              href="/admin/referrals"
              className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-1"
            >
              Manage referrals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
        <FadeIn direction="up" delay={0.75}>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(stats.tierCounts).map(([tier, count]) => (
                <div key={tier} className="text-center p-4 rounded-lg bg-gray-50">
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm font-medium text-gray-600 capitalize mt-1">
                    {tier === 'none' ? 'Standard' : tier}
                  </p>
                </div>
              ))}
              {Object.keys(stats.tierCounts).length === 0 && (
                <div className="col-span-4 text-center py-8">
                  <p className="text-gray-500 mb-3">No ambassadors yet</p>
                  <Link
                    href="/admin/referrals"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-lg text-sm font-medium hover:bg-accent-primary/20 transition-colors"
                  >
                    Set up referral program <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Quick Actions */}
      <section>
        <FadeIn direction="up" delay={0.85}>
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Quick Actions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Common tasks and shortcuts to manage your store
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FadeIn direction="up" delay={0.9}>
            <Link
              href="/admin/products/new"
              className="group block bg-white rounded-xl p-5 border border-gray-200 hover:border-accent-primary hover:shadow-lg transition-all h-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-accent-primary/10 group-hover:bg-accent-primary group-hover:scale-110 rounded-xl flex items-center justify-center transition-all">
                  <Package className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-accent-primary transition-colors">Add Product</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new blend with variants and pricing</p>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={0.95}>
            <Link
              href="/admin/ingredients/new"
              className="group block bg-white rounded-xl p-5 border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all h-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 group-hover:scale-110 rounded-xl flex items-center justify-center transition-all">
                  <Leaf className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Add Ingredient</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Define a new ingredient with health benefits</p>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={1.0}>
            <Link
              href="/admin/discounts"
              className="group block bg-white rounded-xl p-5 border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all h-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-green-100 group-hover:bg-green-500 group-hover:scale-110 rounded-xl flex items-center justify-center transition-all">
                  <Percent className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Manage Discounts</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create and manage promo codes</p>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={1.05}>
            <Link
              href="/admin/subscriptions"
              className="group block bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all h-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-purple-100 group-hover:bg-purple-500 group-hover:scale-110 rounded-xl flex items-center justify-center transition-all">
                  <RefreshCw className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Subscriptions</h3>
                  <p className="text-sm text-gray-500 mt-0.5">View and manage recurring orders</p>
                </div>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* System Status */}
      <FadeIn direction="up" delay={1.1}>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">All Systems Operational</h3>
                <p className="text-sm text-gray-500">
                  Stripe payments, database, and email services are running normally
                </p>
              </div>
            </div>
            <Link
              href="/admin/stripe-mode"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
            >
              View settings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
