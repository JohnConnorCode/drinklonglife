import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const WEBHOOK_URL = 'https://drinklonglife.com/api/stripe/webhook';

const REQUIRED_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

async function setupWebhook() {
  console.log('🔧 Setting up Stripe webhook via API...\n');

  try {
    // Check for existing webhooks to avoid duplicates
    console.log('Checking for existing webhooks...');
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100,
    });

    const existingWebhook = existingWebhooks.data.find(
      (webhook) => webhook.url === WEBHOOK_URL
    );

    if (existingWebhook) {
      console.log(`\n⚠️  Webhook already exists: ${existingWebhook.id}`);
      console.log(`   URL: ${existingWebhook.url}`);
      console.log(`   Status: ${existingWebhook.status}`);
      console.log(`\nℹ️  To update the webhook, delete it from Stripe dashboard first, then run this script again.`);
      console.log(`   Or retrieve the existing signing secret from: https://dashboard.stripe.com/webhooks/${existingWebhook.id}`);
      return;
    }

    // Create new webhook endpoint
    console.log(`Creating webhook endpoint at: ${WEBHOOK_URL}...`);
    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: REQUIRED_EVENTS,
      description: 'Production webhook for DrinkLongLife e-commerce',
    });

    console.log('\n✅ Webhook created successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Webhook ID: ${webhook.id}`);
    console.log(`URL: ${webhook.url}`);
    console.log(`Status: ${webhook.status}`);
    console.log('\n📋 Enabled Events:');
    webhook.enabled_events.forEach(event => {
      console.log(`   • ${event}`);
    });

    console.log('\n🔐 WEBHOOK SIGNING SECRET:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(webhook.secret);
    console.log('═══════════════════════════════════════════════════════════');

    console.log('\n⚡ Next Steps:');
    console.log('1. Copy the signing secret above');
    console.log('2. Add it to Vercel environment variables:');
    console.log('   Variable name: STRIPE_WEBHOOK_SECRET');
    console.log('   Variable value: <the secret above>');
    console.log('3. Redeploy your application for the changes to take effect');
    console.log('\n✨ Or run this command to set it automatically:');
    console.log(`   vercel env add STRIPE_WEBHOOK_SECRET production <<< "${webhook.secret}"`);

  } catch (error) {
    console.error('\n❌ Error setting up webhook:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\nMake sure you\'re using your LIVE Stripe secret key in .env.local');
    }
    throw error;
  }
}

setupWebhook()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Setup failed:', err);
    process.exit(1);
  });
