'use client';

import { useState } from 'react';
import { FeatureFlags } from '@/lib/feature-flags';

interface FeatureFlagsSectionProps {
  title: string;
  description: string;
  flags: Array<{
    key: keyof FeatureFlags;
    label: string;
    description: string;
    value: boolean | number;
    type: 'boolean' | 'number';
  }>;
  onUpdate: (key: string, value: boolean | number) => Promise<void>;
  updating: string | null;
}

function FeatureFlagsSection({ title, description, flags, onUpdate, updating }: FeatureFlagsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="p-6 space-y-4">
        {flags.map((flag) => (
          <div key={flag.key} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{flag.label}</p>
                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                  {flag.key}
                </code>
              </div>
              <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              {flag.type === 'boolean' ? (
                <button
                  onClick={() => onUpdate(flag.key, !flag.value)}
                  disabled={updating === flag.key}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    flag.value ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      flag.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <input
                  type="number"
                  value={flag.value as number}
                  onChange={(e) => onUpdate(flag.key, parseInt(e.target.value) || 0)}
                  disabled={updating === flag.key}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  min="0"
                  max="100"
                />
              )}
              {updating === flag.key && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FeatureFlagsManagerProps {
  initialFlags: FeatureFlags;
}

export function FeatureFlagsManager({ initialFlags }: FeatureFlagsManagerProps) {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async (key: string, value: boolean | number) => {
    setUpdating(key);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update setting');
      }

      // Update local state
      setFlags((prev) => ({ ...prev, [key]: value }));
      setMessage({ type: 'success', text: `Setting updated: ${key}` });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(null);
    }
  };
  const sections: Omit<FeatureFlagsSectionProps, 'onUpdate' | 'updating'>[] = [
    {
      title: 'Referral System',
      description: 'Viral growth mechanics - "Give 20%, Get 20%" referral program',
      flags: [
        {
          key: 'referrals_enabled',
          label: 'Referrals Enabled',
          description: 'Turn the entire referral system on or off',
          value: flags.referrals_enabled,
          type: 'boolean',
        },
        {
          key: 'referrals_reward_percentage',
          label: 'Reward Percentage',
          description: 'Discount percentage for referrer and referee (e.g., 20 = 20% off)',
          value: flags.referrals_reward_percentage,
          type: 'number',
        },
        {
          key: 'referrals_show_leaderboard',
          label: 'Show Leaderboard',
          description: 'Display referral leaderboard in admin and user dashboards',
          value: flags.referrals_show_leaderboard,
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Upsells & Cross-sells',
      description: 'Post-purchase offers to increase average order value',
      flags: [
        {
          key: 'upsells_enabled',
          label: 'Upsells Enabled',
          description: 'Turn the entire upsell system on or off',
          value: flags.upsells_enabled,
          type: 'boolean',
        },
        {
          key: 'upsells_show_on_thank_you',
          label: 'Show on Thank You Page',
          description: 'Display upsells on the post-purchase thank you page',
          value: flags.upsells_show_on_thank_you,
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Tier Upgrades',
      description: 'Allow users to upgrade their partnership tier',
      flags: [
        {
          key: 'tier_upgrades_enabled',
          label: 'Tier Upgrades Enabled',
          description: 'Turn the tier upgrade system on or off',
          value: flags.tier_upgrades_enabled,
          type: 'boolean',
        },
        {
          key: 'tier_upgrades_show_in_nav',
          label: 'Show in Navigation',
          description: 'Display "Upgrade" link in main navigation',
          value: flags.tier_upgrades_show_in_nav,
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Profile Completion',
      description: 'Track and encourage users to complete their profiles',
      flags: [
        {
          key: 'profile_completion_enabled',
          label: 'Profile Completion Enabled',
          description: 'Show profile completion percentage and checklist',
          value: flags.profile_completion_enabled,
          type: 'boolean',
        },
        {
          key: 'profile_completion_min_percentage',
          label: 'Minimum Percentage',
          description: 'Hide completion prompts once user reaches this % (e.g., 80)',
          value: flags.profile_completion_min_percentage,
          type: 'number',
        },
      ],
    },
    {
      title: 'Analytics & Tracking',
      description: 'Event tracking and analytics integration',
      flags: [
        {
          key: 'analytics_enabled',
          label: 'Analytics Enabled',
          description: 'Turn all analytics and tracking on or off',
          value: flags.analytics_enabled,
          type: 'boolean',
        },
        {
          key: 'analytics_track_page_views',
          label: 'Track Page Views',
          description: 'Log page view events',
          value: flags.analytics_track_page_views,
          type: 'boolean',
        },
        {
          key: 'analytics_track_events',
          label: 'Track Custom Events',
          description: 'Log custom events (signup, purchase, etc.)',
          value: flags.analytics_track_events,
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Pricing & Checkout',
      description: 'Configure pricing page and checkout experience',
      flags: [
        {
          key: 'pricing_show_yearly_toggle',
          label: 'Show Yearly Toggle',
          description: 'Display monthly/yearly toggle on pricing page',
          value: flags.pricing_show_yearly_toggle,
          type: 'boolean',
        },
        {
          key: 'pricing_show_savings',
          label: 'Show Savings',
          description: 'Display savings calculations (e.g., "Save 20% with yearly")',
          value: flags.pricing_show_savings,
          type: 'boolean',
        },
        {
          key: 'pricing_allow_one_time_purchases',
          label: 'Allow One-Time Purchases',
          description: 'Enable packs, bundles, and other non-subscription purchases',
          value: flags.pricing_allow_one_time_purchases,
          type: 'boolean',
        },
      ],
    },
    {
      title: 'UI & User Experience',
      description: 'Global UI features and polish',
      flags: [
        {
          key: 'show_toast_notifications',
          label: 'Toast Notifications',
          description: 'Show toast notifications for success/error messages',
          value: flags.show_toast_notifications,
          type: 'boolean',
        },
        {
          key: 'show_manage_subscription_in_nav',
          label: 'Manage Subscription in Nav',
          description: 'Show "Manage Subscription" button in navigation for logged-in users',
          value: flags.show_manage_subscription_in_nav,
          type: 'boolean',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {sections.map((section) => (
        <FeatureFlagsSection
          key={section.title}
          {...section}
          onUpdate={handleUpdate}
          updating={updating}
        />
      ))}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-1">✅ Runtime Configuration Enabled</h3>
        <p className="text-sm text-green-800 mb-2">
          All settings are now stored in the database and can be updated in real-time without code deployment.
        </p>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Toggle switches for boolean settings (on/off)</li>
          <li>Number inputs for percentage and numeric values</li>
          <li>Changes take effect immediately with 60-second cache</li>
          <li>All updates are logged with admin user ID and timestamp</li>
        </ul>
      </div>
    </div>
  );
}
