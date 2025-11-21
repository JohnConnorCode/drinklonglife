import Stripe from 'stripe';
import { logger } from '@/lib/logger';

/**
 * Fetch the current Stripe mode from Supabase
 * This allows runtime switching via admin panel
 */
async function getStripeModeFromDatabase(): Promise<'test' | 'production'> {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      logger.warn('Supabase not configured, falling back to test mode');
      return 'test';
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/stripe_settings?select=mode&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      // Short cache to avoid hitting DB on every request
      cache: 'no-store', // Don't use Next.js cache in API routes
    });

    if (!response.ok) {
      logger.warn('Failed to fetch Stripe mode from database, falling back to test mode');
      return 'test';
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].mode) {
      return data[0].mode as 'test' | 'production';
    }

    // Default to test mode for safety
    return 'test';
  } catch (error) {
    logger.error('Error fetching Stripe mode:', error);
    return 'test'; // Fail-safe to test mode
  }
}

/**
 * Get Stripe API keys based on current mode from database
 */
export async function getStripeKeys() {
  const mode = await getStripeModeFromDatabase();

  if (mode === 'production') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY_PRODUCTION || process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_PRODUCTION || process.env.STRIPE_WEBHOOK_SECRET,
      mode: 'production' as const,
    };
  }

  // Default to test mode
  return {
    secretKey: process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET,
    mode: 'test' as const,
  };
}

/**
 * Initialize Stripe client with correct keys based on mode from database
 */
export async function getStripeClient() {
  const keys = await getStripeKeys();

  if (!keys.secretKey) {
    throw new Error('Stripe secret key is not configured');
  }

  const stripe = new Stripe(keys.secretKey, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });

  return stripe;
}

/**
 * Get current Stripe mode from database (for API routes)
 */
export async function getCurrentStripeMode(): Promise<'test' | 'production'> {
  return await getStripeModeFromDatabase();
}
