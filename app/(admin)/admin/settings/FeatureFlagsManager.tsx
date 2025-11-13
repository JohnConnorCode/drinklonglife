'use client';

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
}

function FeatureFlagsSection({ title, description, flags }: FeatureFlagsSectionProps) {
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
            <div className="ml-4">
              {flag.type === 'boolean' ? (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    flag.value
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {flag.value ? 'Enabled' : 'Disabled'}
                </div>
              ) : (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {flag.value}
                </div>
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
  const sections: FeatureFlagsSectionProps[] = [
    {
      title: 'Referral System',
      description: 'Viral growth mechanics - "Give 20%, Get 20%" referral program',
      flags: [
        {
          key: 'referrals_enabled',
          label: 'Referrals Enabled',
          description: 'Turn the entire referral system on or off',
          value: initialFlags.referrals_enabled,
          type: 'boolean',
        },
        {
          key: 'referrals_reward_percentage',
          label: 'Reward Percentage',
          description: 'Discount percentage for referrer and referee (e.g., 20 = 20% off)',
          value: initialFlags.referrals_reward_percentage,
          type: 'number',
        },
        {
          key: 'referrals_show_leaderboard',
          label: 'Show Leaderboard',
          description: 'Display referral leaderboard in admin and user dashboards',
          value: initialFlags.referrals_show_leaderboard,
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
          value: initialFlags.upsells_enabled,
          type: 'boolean',
        },
        {
          key: 'upsells_show_on_thank_you',
          label: 'Show on Thank You Page',
          description: 'Display upsells on the post-purchase thank you page',
          value: initialFlags.upsells_show_on_thank_you,
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
          value: initialFlags.tier_upgrades_enabled,
          type: 'boolean',
        },
        {
          key: 'tier_upgrades_show_in_nav',
          label: 'Show in Navigation',
          description: 'Display "Upgrade" link in main navigation',
          value: initialFlags.tier_upgrades_show_in_nav,
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
          value: initialFlags.profile_completion_enabled,
          type: 'boolean',
        },
        {
          key: 'profile_completion_min_percentage',
          label: 'Minimum Percentage',
          description: 'Hide completion prompts once user reaches this % (e.g., 80)',
          value: initialFlags.profile_completion_min_percentage,
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
          value: initialFlags.analytics_enabled,
          type: 'boolean',
        },
        {
          key: 'analytics_track_page_views',
          label: 'Track Page Views',
          description: 'Log page view events',
          value: initialFlags.analytics_track_page_views,
          type: 'boolean',
        },
        {
          key: 'analytics_track_events',
          label: 'Track Custom Events',
          description: 'Log custom events (signup, purchase, etc.)',
          value: initialFlags.analytics_track_events,
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
          value: initialFlags.pricing_show_yearly_toggle,
          type: 'boolean',
        },
        {
          key: 'pricing_show_savings',
          label: 'Show Savings',
          description: 'Display savings calculations (e.g., "Save 20% with yearly")',
          value: initialFlags.pricing_show_savings,
          type: 'boolean',
        },
        {
          key: 'pricing_allow_one_time_purchases',
          label: 'Allow One-Time Purchases',
          description: 'Enable packs, bundles, and other non-subscription purchases',
          value: initialFlags.pricing_allow_one_time_purchases,
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
          value: initialFlags.show_toast_notifications,
          type: 'boolean',
        },
        {
          key: 'show_manage_subscription_in_nav',
          label: 'Manage Subscription in Nav',
          description: 'Show "Manage Subscription" button in navigation for logged-in users',
          value: initialFlags.show_manage_subscription_in_nav,
          type: 'boolean',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <FeatureFlagsSection key={section.title} {...section} />
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">💡 How to Change Settings</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>
            Open <code className="bg-blue-100 px-1 rounded">lib/feature-flags.ts</code> in your code editor
          </li>
          <li>
            Edit the <code className="bg-blue-100 px-1 rounded">DEFAULT_FLAGS</code> object
          </li>
          <li>Save the file and restart your development server</li>
          <li>Changes will take effect across the entire application</li>
        </ol>
        <p className="text-sm text-blue-800 mt-3">
          <strong>Pro tip:</strong> For production, consider storing these in environment variables
          or a database table for runtime updates without code deployment.
        </p>
      </div>
    </div>
  );
}
