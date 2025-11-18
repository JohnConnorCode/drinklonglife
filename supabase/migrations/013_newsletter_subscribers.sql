-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  source TEXT, -- 'website', 'checkout', etc.
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_subscribed_idx ON public.newsletter_subscribers(subscribed) WHERE subscribed = true;

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view all subscribers
CREATE POLICY "Admins can view newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create wholesale_inquiries table
CREATE TABLE IF NOT EXISTS public.wholesale_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  expected_volume TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by status and date
CREATE INDEX IF NOT EXISTS wholesale_inquiries_status_idx ON public.wholesale_inquiries(status);
CREATE INDEX IF NOT EXISTS wholesale_inquiries_created_at_idx ON public.wholesale_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.wholesale_inquiries ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to wholesale_inquiries"
  ON public.wholesale_inquiries
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view all inquiries
CREATE POLICY "Admins can view wholesale_inquiries"
  ON public.wholesale_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update inquiries
CREATE POLICY "Admins can update wholesale_inquiries"
  ON public.wholesale_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_wholesale_inquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_wholesale_inquiry_updated_at
  BEFORE UPDATE ON public.wholesale_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wholesale_inquiry_updated_at();
