-- System Settings Table
-- Stores runtime-configurable feature flags and settings

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Insert default feature flags
INSERT INTO system_settings (key, value, description, category) VALUES
  -- Referral System
  ('referrals_enabled', 'true'::jsonb, 'Turn the entire referral system on or off', 'referrals'),
  ('referrals_reward_percentage', '20'::jsonb, 'Discount percentage for referrer and referee (e.g., 20 = 20% off)', 'referrals'),
  ('referrals_show_leaderboard', 'true'::jsonb, 'Display referral leaderboard in admin and user dashboards', 'referrals'),

  -- Upsells & Cross-sells
  ('upsells_enabled', 'true'::jsonb, 'Turn the entire upsell system on or off', 'upsells'),
  ('upsells_show_on_thank_you', 'true'::jsonb, 'Display upsells on the post-purchase thank you page', 'upsells'),

  -- Tier Upgrades
  ('tier_upgrades_enabled', 'true'::jsonb, 'Turn the tier upgrade system on or off', 'tiers'),
  ('tier_upgrades_show_in_nav', 'true'::jsonb, 'Display "Upgrade" link in main navigation', 'tiers'),

  -- Profile Completion
  ('profile_completion_enabled', 'true'::jsonb, 'Show profile completion percentage and checklist', 'profile'),
  ('profile_completion_min_percentage', '80'::jsonb, 'Hide completion prompts once user reaches this % (e.g., 80)', 'profile'),

  -- Analytics & Tracking
  ('analytics_enabled', 'true'::jsonb, 'Turn all analytics and tracking on or off', 'analytics'),
  ('analytics_track_page_views', 'true'::jsonb, 'Log page view events', 'analytics'),
  ('analytics_track_events', 'true'::jsonb, 'Log custom events (signup, purchase, etc.)', 'analytics'),

  -- Pricing & Checkout
  ('pricing_show_yearly_toggle', 'true'::jsonb, 'Display monthly/yearly toggle on pricing page', 'pricing'),
  ('pricing_show_savings', 'true'::jsonb, 'Display savings calculations (e.g., "Save 20% with yearly")', 'pricing'),
  ('pricing_allow_one_time_purchases', 'true'::jsonb, 'Enable packs, bundles, and other non-subscription purchases', 'pricing'),

  -- UI Polish
  ('show_toast_notifications', 'true'::jsonb, 'Show toast notifications for success/error messages', 'ui'),
  ('show_manage_subscription_in_nav', 'true'::jsonb, 'Show "Manage Subscription" button in navigation for logged-in users', 'ui')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings (needed for public pages)
CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "Only admins can update system settings"
  ON system_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.admin = true
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_timestamp();

-- Helper function to get a setting value
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS JSONB AS $$
  SELECT value FROM system_settings WHERE key = setting_key;
$$ LANGUAGE SQL STABLE;

COMMENT ON TABLE system_settings IS 'Runtime-configurable system settings and feature flags';
COMMENT ON FUNCTION get_setting(TEXT) IS 'Helper function to retrieve a setting value by key';
