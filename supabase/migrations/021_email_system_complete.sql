-- =============================================================================
-- Complete Email System Migration
-- =============================================================================
-- This migration creates the database-driven email template system with:
-- - email_template_versions: Database-driven templates with draft/publish workflow
-- - email_notifications: Complete audit trail for all sent emails
-- - email_preferences: Granular user email preferences with unsubscribe tokens
--
-- Replaces: email_queue (deprecated in favor of email_notifications)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: email_template_versions
-- -----------------------------------------------------------------------------
-- Stores email templates with draft/publish workflow
-- Each template can have both a draft and published version
CREATE TABLE IF NOT EXISTS email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  version_type TEXT NOT NULL CHECK (version_type IN ('draft', 'published')),

  -- Template content
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  preheader TEXT,

  -- Variable schema (defines what variables are available)
  data_schema JSONB DEFAULT '{}'::jsonb,

  -- Organization
  category TEXT, -- 'authentication', 'orders', 'subscriptions', etc.
  description TEXT,

  -- Audit trail
  created_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Business rule: Only 1 published version per template
  CONSTRAINT unique_published_version UNIQUE (template_name, version_type)
);

-- Indexes for email_template_versions
CREATE INDEX idx_email_template_versions_name ON email_template_versions(template_name);
CREATE INDEX idx_email_template_versions_category ON email_template_versions(category);
CREATE INDEX idx_email_template_versions_published ON email_template_versions(template_name, version_type) WHERE version_type = 'published';

-- Enable RLS
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read/write templates
CREATE POLICY "Admins can manage email templates"
  ON email_template_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- -----------------------------------------------------------------------------
-- Table: email_notifications
-- -----------------------------------------------------------------------------
-- Complete audit trail for ALL emails sent
-- Also serves as queue (status='pending' = queued, status='sent' = delivered)
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,

  -- Template used
  template_name TEXT NOT NULL,

  -- Rendered content
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,

  -- Variables used for rendering
  template_data JSONB DEFAULT '{}'::jsonb,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- External references
  metadata JSONB DEFAULT '{}'::jsonb, -- Resend ID, etc.

  -- Retry mechanism
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMPTZ,

  -- Test mode flag
  is_test BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_notifications
CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_email ON email_notifications(email);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_template ON email_notifications(template_name);
CREATE INDEX idx_email_notifications_created_at ON email_notifications(created_at DESC);
CREATE INDEX idx_email_notifications_pending ON email_notifications(status, created_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email history
CREATE POLICY "Users can view own email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can view all email notifications
CREATE POLICY "Admins can view all email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Service role can insert/update (for Edge Function)
CREATE POLICY "Service role can manage email notifications"
  ON email_notifications
  FOR ALL
  TO service_role
  USING (true);

-- -----------------------------------------------------------------------------
-- Table: email_preferences
-- -----------------------------------------------------------------------------
-- Granular email preferences per user with unsubscribe tokens
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

  -- Global settings
  all_emails_enabled BOOLEAN DEFAULT true,

  -- Category preferences
  marketing_emails BOOLEAN DEFAULT true,
  transactional_emails BOOLEAN DEFAULT true,
  order_confirmations BOOLEAN DEFAULT true,
  subscription_notifications BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT true,

  -- Unsubscribe token (for one-click unsubscribe links)
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_preferences
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX idx_email_preferences_token ON email_preferences(unsubscribe_token);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view/update their own preferences
CREATE POLICY "Users can manage own email preferences"
  ON email_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role can read preferences (for Edge Function)
CREATE POLICY "Service role can read email preferences"
  ON email_preferences
  FOR SELECT
  TO service_role
  USING (true);

-- -----------------------------------------------------------------------------
-- Function: Create default email preferences for new users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create email preferences on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_email_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- -----------------------------------------------------------------------------
-- Function: Update updated_at timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_email_template_versions_updated_at
  BEFORE UPDATE ON email_template_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_notifications_updated_at
  BEFORE UPDATE ON email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Cleanup: Old email_queue table deprecation comment
-- -----------------------------------------------------------------------------
-- NOTE: email_queue table is deprecated in favor of email_notifications
-- The email_queue table can be dropped after migrating existing queued emails
-- to email_notifications table. For safety, we keep it temporarily.
COMMENT ON TABLE email_queue IS 'DEPRECATED: Use email_notifications table instead. This table will be removed in a future migration.';
