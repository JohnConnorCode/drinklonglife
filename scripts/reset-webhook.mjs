/**
 * Reset Stripe webhook with new secret
 * This script deletes the existing webhook and creates a new one with a fresh secret
 *
 * Usage: node scripts/reset-webhook.mjs
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION);

const WEBHOOK_URL = 'https://drinklonglife.com/api/stripe/webhook';
const EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
];

async function resetWebhook() {
  console.log('🔄 Resetting Stripe webhook...\n');

  // List existing webhooks
  const existing = await stripe.webhookEndpoints.list({ limit: 10 });

  // Delete webhooks pointing to our URL
  for (const wh of existing.data) {
    if (wh.url === WEBHOOK_URL) {
      console.log(`Deleting webhook: ${wh.id}`);
      await stripe.webhookEndpoints.del(wh.id);
    }
  }

  // Create new webhook
  console.log('\nCreating new webhook...');
  const webhook = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: EVENTS,
    description: 'Long Life production webhook',
  });

  console.log('\n✅ New webhook created!');
  console.log(`ID: ${webhook.id}`);
  console.log(`URL: ${webhook.url}`);
  console.log(`Secret: ${webhook.secret}`);
  console.log('\n⚠️  IMPORTANT: Update STRIPE_WEBHOOK_SECRET_PRODUCTION in Vercel with the secret above!');
  console.log('\nRun this command to update Vercel:');
  console.log(`vercel env rm STRIPE_WEBHOOK_SECRET_PRODUCTION production -y && echo "${webhook.secret}" | vercel env add STRIPE_WEBHOOK_SECRET_PRODUCTION production`);
}

resetWebhook().catch(console.error);
