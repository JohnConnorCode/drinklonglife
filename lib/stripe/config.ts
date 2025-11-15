import Stripe from 'stripe';

/**
 * Get the current Stripe mode (test or production) from environment variables
 */
function getStripeMode(): 'test' | 'production' {
  const envMode = process.env.STRIPE_MODE as 'test' | 'production' | undefined;

  if (envMode === 'production' || envMode === 'test') {
    return envMode;
  }

  // Default to 'test' for safety
  return 'test';
}

/**
 * Get Stripe API keys based on current mode
 */
export function getStripeKeys() {
  const mode = getStripeMode();

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
 * Initialize Stripe client with correct keys based on mode
 */
export function getStripeClient() {
  const keys = getStripeKeys();

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
 * Get current Stripe mode for frontend
 */
export function getCurrentStripeMode(): 'test' | 'production' {
  return getStripeMode();
}
