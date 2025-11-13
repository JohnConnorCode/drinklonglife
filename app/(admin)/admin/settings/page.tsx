import { Metadata } from 'next';
import { getFeatureFlags } from '@/lib/feature-flags';
import { FeatureFlagsManager } from './FeatureFlagsManager';

export const metadata: Metadata = {
  title: 'System Settings | Admin',
  description: 'Manage feature flags and system configuration',
};

export default async function AdminSettingsPage() {
  const flags = await getFeatureFlags();

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

      <FeatureFlagsManager initialFlags={flags} />
    </div>
  );
}
