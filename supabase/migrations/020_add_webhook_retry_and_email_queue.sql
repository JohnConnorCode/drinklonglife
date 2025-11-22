-- Migration: Add Webhook Retry & Email Queue
-- Prevents lost orders and ensures reliable email delivery
-- Created: 2025-11-22

-- Webhook failures table for retry mechanism
CREATE TABLE IF NOT EXISTS public.webhook_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

-- Email queue for reliable delivery
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL CHECK (email_type IN ('order_confirmation', 'subscription_confirmation', 'general')),
  to_email TEXT NOT NULL,
  template_data JSONB NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (to_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_failures_unresolved ON public.webhook_failures(created_at) WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_webhook_failures_event ON public.webhook_failures(event_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_unsent ON public.email_queue(created_at) WHERE NOT sent AND retry_count < max_retries;

-- Enable RLS
ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin only)
CREATE POLICY "Webhook failures admin only" ON public.webhook_failures FOR ALL TO authenticated USING (false);
CREATE POLICY "Email queue admin only" ON public.email_queue FOR ALL TO authenticated USING (false);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.webhook_failures TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.email_queue TO authenticated;

COMMENT ON TABLE public.webhook_failures IS 'Tracks webhook processing failures for retry mechanism';
COMMENT ON TABLE public.email_queue IS 'Queues emails for async delivery to prevent webhook failures';
