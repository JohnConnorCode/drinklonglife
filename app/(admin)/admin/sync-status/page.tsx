'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';

interface SyncIssue {
  type: 'missing_in_stripe' | 'missing_in_supabase' | 'price_mismatch' | 'inactive_mismatch';
  productId?: string;
  productName?: string;
  variantId?: string;
  variantLabel?: string;
  stripePriceId?: string;
  details: string;
  severity: 'error' | 'warning';
}

interface SyncStatus {
  healthy: boolean;
  issues: SyncIssue[];
  stats: {
    supabaseProducts: number;
    supabaseVariants: number;
    stripeProducts: number;
    stripePrices: number;
    syncedVariants: number;
    unsyncedVariants: number;
  };
}

export default function SyncStatusPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/sync-status');
      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50';
  };

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? '❌' : '⚠️';
  };

  const getTypeLabel = (type: SyncIssue['type']) => {
    const labels = {
      missing_in_stripe: 'Missing in Stripe',
      missing_in_supabase: 'Missing in Supabase',
      price_mismatch: 'Price Mismatch',
      inactive_mismatch: 'Status Mismatch',
    };
    return labels[type];
  };

  return (
    <Section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stripe Sync Status</h1>
          <p className="text-gray-600">
            Verify synchronization between Supabase products and Stripe prices
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchSyncStatus}
            disabled={loading}
            className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {/* Loading State */}
        {loading && !status && (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mb-4" />
            <p className="text-gray-600">Checking sync status...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Status Summary */}
        {status && (
          <>
            {/* Health Status Banner */}
            <div className={`rounded-lg p-6 mb-6 ${status.healthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{status.healthy ? '✅' : '❌'}</span>
                <div>
                  <h2 className={`text-xl font-bold ${status.healthy ? 'text-green-800' : 'text-red-800'}`}>
                    {status.healthy ? 'All Systems Synced' : 'Sync Issues Detected'}
                  </h2>
                  <p className={status.healthy ? 'text-green-600' : 'text-red-600'}>
                    {status.healthy
                      ? 'All products and variants are properly synced with Stripe'
                      : `Found ${status.issues.filter(i => i.severity === 'error').length} errors and ${status.issues.filter(i => i.severity === 'warning').length} warnings`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Supabase</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">{status.stats.supabaseProducts}</div>
                <p className="text-sm text-gray-600">Products</p>
                <div className="text-xl font-semibold text-gray-700 mt-2">{status.stats.supabaseVariants}</div>
                <p className="text-xs text-gray-500">Total Variants</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Stripe</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">{status.stats.stripeProducts}</div>
                <p className="text-sm text-gray-600">Products</p>
                <div className="text-xl font-semibold text-gray-700 mt-2">{status.stats.stripePrices}</div>
                <p className="text-xs text-gray-500">Active Prices</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Sync Status</h3>
                <div className="text-3xl font-bold text-green-600 mb-1">{status.stats.syncedVariants}</div>
                <p className="text-sm text-gray-600">Synced Variants</p>
                {status.stats.unsyncedVariants > 0 && (
                  <>
                    <div className="text-xl font-semibold text-red-600 mt-2">{status.stats.unsyncedVariants}</div>
                    <p className="text-xs text-red-500">Unsynced Variants</p>
                  </>
                )}
              </div>
            </div>

            {/* Issues List */}
            {status.issues.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">Sync Issues ({status.issues.length})</h2>
                </div>
                <div className="divide-y">
                  {status.issues.map((issue, idx) => (
                    <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getSeverityColor(issue.severity)} flex items-center justify-center`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                              {getTypeLabel(issue.type)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${issue.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {issue.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-1">{issue.details}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            {issue.productName && (
                              <div>
                                <span className="font-semibold">Product:</span> {issue.productName}
                              </div>
                            )}
                            {issue.variantLabel && (
                              <div>
                                <span className="font-semibold">Variant:</span> {issue.variantLabel}
                              </div>
                            )}
                            {issue.stripePriceId && (
                              <div>
                                <span className="font-semibold">Stripe Price ID:</span>{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{issue.stripePriceId}</code>
                              </div>
                            )}
                            {issue.variantId && (
                              <div>
                                <span className="font-semibold">Variant ID:</span>{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{issue.variantId}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Perfect Sync!</h3>
                <p className="text-gray-600">No issues found. All products are properly synced with Stripe.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
