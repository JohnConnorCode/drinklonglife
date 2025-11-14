/**
 * Register Production Webhook via Stripe API
 *
 * This script registers the production webhook endpoint in Stripe.
 * Run with: npx tsx scripts/register-production-webhook.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PRODUCTION_WEBHOOK_URL = 'https://drinklonglife.com/api/stripe/webhook';
const EXPECTED_WEBHOOK_SECRET = 'whsec_d9vvwSrAHjyCe7paqi4g2QP0aaD7J9ZU';

const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   REGISTERING PRODUCTION WEBHOOK');
  console.log('   🔴 PRODUCTION MODE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Verify production API key exists
  if (!process.env.STRIPE_SECRET_KEY_PRODUCTION) {
    throw new Error('STRIPE_SECRET_KEY_PRODUCTION environment variable not set');
  }

  // Initialize Stripe in PRODUCTION mode
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION!, {
    apiVersion: '2024-12-18.acacia',
  });

  console.log(`📍 Webhook URL: ${PRODUCTION_WEBHOOK_URL}\n`);
  console.log(`📋 Events to register (${WEBHOOK_EVENTS.length}):`);
  WEBHOOK_EVENTS.forEach(event => console.log(`   - ${event}`));
  console.log('');

  try {
    // Step 1: List existing webhooks
    console.log('🔍 Checking existing webhooks...\n');
    const existingWebhooks = await stripe.webhookEndpoints.list();

    console.log(`   Found ${existingWebhooks.data.length} existing webhook(s)\n`);

    // Step 2: Check if our webhook already exists
    const existingWebhook = existingWebhooks.data.find(
      wh => wh.url === PRODUCTION_WEBHOOK_URL
    );

    if (existingWebhook) {
      console.log('✅ Webhook already registered!\n');
      console.log(`   ID: ${existingWebhook.id}`);
      console.log(`   URL: ${existingWebhook.url}`);
      console.log(`   Status: ${existingWebhook.status}`);
      console.log(`   Events: ${existingWebhook.enabled_events.length} registered`);
      console.log(`   Secret: ${existingWebhook.secret}\n`);

      // Verify events
      const missingEvents = WEBHOOK_EVENTS.filter(
        event => !existingWebhook.enabled_events.includes(event as any)
      );

      if (missingEvents.length > 0) {
        console.log(`⚠️  Missing ${missingEvents.length} event(s):`);
        missingEvents.forEach(event => console.log(`   - ${event}`));
        console.log('\n🔄 Updating webhook to include all events...\n');

        const updatedWebhook = await stripe.webhookEndpoints.update(
          existingWebhook.id,
          {
            enabled_events: WEBHOOK_EVENTS as any,
          }
        );

        console.log('✅ Webhook updated successfully!');
        console.log(`   Events: ${updatedWebhook.enabled_events.length} registered\n`);
      } else {
        console.log('✅ All required events are already registered\n');
      }

      // Verify webhook secret
      if (existingWebhook.secret === EXPECTED_WEBHOOK_SECRET) {
        console.log('✅ Webhook secret matches expected value\n');
      } else {
        console.log('⚠️  Webhook secret differs from expected value:');
        console.log(`   Expected: ${EXPECTED_WEBHOOK_SECRET}`);
        console.log(`   Actual: ${existingWebhook.secret}`);
        console.log('   Update STRIPE_WEBHOOK_SECRET_PRODUCTION in .env.local if needed\n');
      }
    } else {
      // Step 3: Create new webhook
      console.log('📝 Creating new webhook endpoint...\n');

      const newWebhook = await stripe.webhookEndpoints.create({
        url: PRODUCTION_WEBHOOK_URL,
        enabled_events: WEBHOOK_EVENTS as any,
        description: 'Production webhook for DrinkLongLife e-commerce',
      });

      console.log('✅ Webhook created successfully!\n');
      console.log(`   ID: ${newWebhook.id}`);
      console.log(`   URL: ${newWebhook.url}`);
      console.log(`   Status: ${newWebhook.status}`);
      console.log(`   Events: ${newWebhook.enabled_events.length} registered`);
      console.log(`   Secret: ${newWebhook.secret}\n`);

      // Check if secret matches
      if (newWebhook.secret !== EXPECTED_WEBHOOK_SECRET) {
        console.log('⚠️  IMPORTANT: Update your .env.local file:');
        console.log(`   STRIPE_WEBHOOK_SECRET_PRODUCTION=${newWebhook.secret}\n`);
      } else {
        console.log('✅ Webhook secret matches expected value\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔴 PRODUCTION WEBHOOK REGISTRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ Webhook registration failed:', error.message);
    if (error.raw) {
      console.error('Details:', error.raw);
    }
    process.exit(1);
  }
}

main();
