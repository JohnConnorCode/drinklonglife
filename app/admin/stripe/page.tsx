import { logger } from "@/lib/logger";
import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdminUser } from '@/lib/auth/admin';
import { StripeModeIndicator } from '@/components/admin/StripeModeIndicator';
import { client } from '@/lib/sanity.client';
import { stripeSettingsQuery } from '@/lib/sanity.queries';

export const metadata: Metadata = {
  title: 'Stripe Settings | Admin',
};

interface StripeSettings {
  mode: 'test' | 'production';
  lastModified: string;
  modifiedBy: string;
}

export default async function AdminStripePage() {
  // Verify admin access
  await requireAdminUser();

  // Fetch current Stripe settings from Sanity
  let settings: StripeSettings | null = null;
  try {
    settings = await client.fetch(stripeSettingsQuery);
  } catch (error) {
    logger.error('Failed to fetch Stripe settings:', error);
  }

  const lastModifiedDate = settings?.lastModified
    ? new Date(settings.lastModified).toLocaleString()
    : 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-accent-primary hover:text-accent-primary/80 text-sm font-medium mb-4 inline-block">
            ← Back to Site
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Stripe Settings</h1>
          <p className="text-gray-600">Manage your Stripe mode and webhook configuration</p>
        </div>

        {/* Current Mode Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Mode</h2>
            <StripeModeIndicator />
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Mode</p>
                <p className="text-xl font-semibold text-gray-900">
                  {settings?.mode === 'production' ? 'Production' : 'Test'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className={`text-xl font-semibold ${
                  settings?.mode === 'production' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {settings?.mode === 'production' ? 'Live Transactions' : 'Sandbox Mode'}
                </p>
              </div>
            </div>
          </div>

          {settings && (
            <div className="text-sm text-gray-500 border-t pt-4">
              <p>Last modified: {lastModifiedDate}</p>
              {settings.modifiedBy && <p>By: {settings.modifiedBy}</p>}
            </div>
          )}
        </div>

        {/* How to Change Mode */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">To Change Stripe Mode</h3>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Go to your <a href="https://sanity.io" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Sanity Studio</a></span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Open the "Stripe Settings" document</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Toggle between "Test Mode (sandbox)" and "Production Mode (live charges)"</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Click Publish - the change takes effect immediately</span>
            </li>
          </ol>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-red-900 mb-2">Production Mode Warning</h3>
          <p className="text-red-800">
            When in <strong>Production Mode</strong>, all transactions are LIVE and customers will be charged real money.
            Make sure your Stripe production keys are configured before switching to production mode.
          </p>
        </div>

        {/* Webhook Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Webhook Configuration</h3>
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-600 mb-2">The webhook handler automatically works with both test and production modes.</p>
            <p className="text-sm text-gray-600">Webhooks from Stripe are signed with the appropriate secret key for each mode.</p>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Webhook Endpoint</p>
              <code className="bg-gray-100 text-gray-800 p-2 rounded block text-xs mt-1 break-all">
                POST /api/stripe/webhook
              </code>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Configured Secrets</p>
              <ul className="text-gray-600 mt-2 space-y-1">
                <li>✓ Test webhook secret</li>
                <li>✓ Production webhook secret</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
