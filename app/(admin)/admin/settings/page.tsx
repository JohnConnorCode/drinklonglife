import { Metadata } from 'next';
import { getFeatureFlags } from '@/lib/feature-flags';
import { FeatureFlagsManager } from './FeatureFlagsManager';

export const metadata: Metadata = {
  title: 'System Settings | Admin',
  description: 'Manage feature flags and system configuration',
};

export default async function AdminSettingsPage() {
  const flags = getFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-900">
          System Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Control which features are enabled across the platform. Changes take effect immediately.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-1">⚠️ Development Note</h3>
        <p className="text-sm text-yellow-800">
          Currently, feature flags are configured in <code className="bg-yellow-100 px-1 rounded">lib/feature-flags.ts</code>.
          To change settings, edit the <code className="bg-yellow-100 px-1 rounded">DEFAULT_FLAGS</code> constant
          and restart the development server.
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          <strong>Future enhancement:</strong> Store flags in database for runtime updates via this UI.
        </p>
      </div>

      <FeatureFlagsManager initialFlags={flags} />
    </div>
  );
}
