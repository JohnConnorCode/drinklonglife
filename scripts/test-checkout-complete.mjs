#!/usr/bin/env node
/**
 * COMPLETE CHECKOUT TEST
 * Tests ALL checkout scenarios against production
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let passed = 0;
let failed = 0;
const failures = [];

function pass(name) {
  console.log(`✅ ${name}`);
  passed++;
}

function fail(name, error) {
  console.log(`❌ ${name}: ${error}`);
  failed++;
  failures.push({ name, error });
}

async function getTestProduct() {
  const { data } = await supabase
    .from('product_variants')
    .select(`
      id, label, stripe_price_id, price_usd, billing_type,
      products:product_id (id, name, image_url, is_active)
    `)
    .eq('is_active', true)
    .eq('billing_type', 'one_time')
    .not('stripe_price_id', 'is', null)
    .limit(1)
    .single();
  return data;
}

async function testGuestCheckout() {
  console.log('\n🛒 TEST: Guest Checkout (no customer ID)\n');

  const product = await getTestProduct();
  if (!product) {
    fail('Get test product', 'No active product with stripe_price_id found');
    return;
  }
  pass(`Found product: ${product.products.name} - ${product.label}`);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(product.price_usd * 100),
          product_data: {
            name: `${product.products.name} - ${product.label}`,
            images: product.products.image_url ? [
              product.products.image_url.startsWith('http')
                ? product.products.image_url
                : `${SITE_URL}${product.products.image_url}`
            ] : [],
          },
        },
        quantity: 1,
      }],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      automatic_tax: {
        enabled: true,
      },
      customer_creation: 'always',
    });

    if (!session.url?.startsWith('https://checkout.stripe.com')) {
      fail('Session URL valid', `Invalid URL: ${session.url}`);
      return;
    }
    pass('Guest checkout session created');
    pass(`Session URL: ${session.url.substring(0, 60)}...`);

    // Expire it
    await stripe.checkout.sessions.expire(session.id);
    pass('Test session expired');

  } catch (e) {
    fail('Guest checkout', e.message);
  }
}

async function testAuthenticatedCheckout() {
  console.log('\n🔐 TEST: Authenticated Checkout (with customer ID)\n');

  const product = await getTestProduct();
  if (!product) {
    fail('Get test product', 'No product found');
    return;
  }

  // Create a test customer
  let customer;
  try {
    customer = await stripe.customers.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      metadata: { test: 'true' },
    });
    pass(`Created test customer: ${customer.id}`);
  } catch (e) {
    fail('Create test customer', e.message);
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(product.price_usd * 100),
          product_data: {
            name: `${product.products.name} - ${product.label}`,
          },
        },
        quantity: 1,
      }],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        shipping: 'auto',
        address: 'auto',
      },
    });

    if (!session.url?.startsWith('https://checkout.stripe.com')) {
      fail('Session URL valid', `Invalid URL: ${session.url}`);
    } else {
      pass('Authenticated checkout session created');
      pass(`Session URL: ${session.url.substring(0, 60)}...`);
    }

    // Expire and cleanup
    await stripe.checkout.sessions.expire(session.id);
    pass('Test session expired');

  } catch (e) {
    fail('Authenticated checkout', e.message);
  }

  // Cleanup customer
  try {
    await stripe.customers.del(customer.id);
    pass('Test customer deleted');
  } catch (e) {
    console.log(`  (Note: Could not delete customer: ${e.message})`);
  }
}

async function testCustomerMismatch() {
  console.log('\n⚠️  TEST: Customer Mode Mismatch Recovery\n');

  // This simulates what happens when a test-mode customer ID is used with live keys
  // We can't actually test cross-mode, but we can test invalid customer handling

  const product = await getTestProduct();
  if (!product) {
    fail('Get test product', 'No product found');
    return;
  }

  try {
    // Try to retrieve a fake customer - should fail gracefully
    try {
      await stripe.customers.retrieve('cus_FAKE_INVALID_ID');
      fail('Invalid customer handling', 'Should have thrown error');
    } catch (e) {
      if (e.message.includes('No such customer')) {
        pass('Invalid customer correctly rejected by Stripe');
      } else {
        fail('Invalid customer handling', e.message);
      }
    }

    // Verify checkout still works without customer
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 100,
          product_data: { name: 'Test' },
        },
        quantity: 1,
      }],
      customer_creation: 'always',
    });

    pass('Checkout works without customer (fallback)');
    await stripe.checkout.sessions.expire(session.id);

  } catch (e) {
    fail('Customer mismatch test', e.message);
  }
}

async function testURLValidation() {
  console.log('\n🔗 TEST: URL Validation\n');

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();

  if (!siteUrl) {
    fail('NEXT_PUBLIC_SITE_URL set', 'Environment variable not set');
    return;
  }
  pass(`NEXT_PUBLIC_SITE_URL: ${siteUrl}`);

  if (siteUrl.includes('\n') || siteUrl.includes('\r')) {
    fail('URL has no newlines', 'URL contains newline characters');
  } else {
    pass('URL has no newlines');
  }

  if (!siteUrl.startsWith('https://')) {
    fail('URL uses HTTPS', `URL doesn't start with https://`);
  } else {
    pass('URL uses HTTPS');
  }

  // Test actual URL accessibility
  try {
    const response = await fetch(siteUrl);
    if (response.ok || response.status === 308 || response.status === 307) {
      pass(`Site accessible: ${response.status}`);
    } else {
      fail('Site accessible', `HTTP ${response.status}`);
    }
  } catch (e) {
    fail('Site accessible', e.message);
  }
}

async function testProductionAPI() {
  console.log('\n🌐 TEST: Production API Endpoint\n');

  const product = await getTestProduct();
  if (!product) {
    fail('Get test product', 'No product found');
    return;
  }

  try {
    const response = await fetch(`${SITE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{
          priceId: product.stripe_price_id,
          quantity: 1,
        }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      fail('API response OK', `${response.status}: ${data.error || data.details || 'Unknown error'}`);
      return;
    }

    if (!data.url?.startsWith('https://checkout.stripe.com')) {
      fail('API returns valid URL', `Invalid URL: ${data.url}`);
      return;
    }

    pass('Production API returns valid checkout URL');
    pass(`URL: ${data.url.substring(0, 60)}...`);

    // Expire the session
    if (data.sessionId) {
      await stripe.checkout.sessions.expire(data.sessionId);
      pass('Test session expired');
    }

  } catch (e) {
    fail('Production API test', e.message);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     COMPLETE CHECKOUT TEST - DrinkLongLife     ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\nTesting against: ${SITE_URL}`);
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  await testURLValidation();
  await testGuestCheckout();
  await testAuthenticatedCheckout();
  await testCustomerMismatch();
  await testProductionAPI();

  console.log('\n════════════════════════════════════════════════');
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

  if (failures.length > 0) {
    console.log('❌ FAILURES:');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    console.log('\n🚨 CHECKOUT IS BROKEN - FIX BEFORE DEPLOYING\n');
    process.exit(1);
  } else {
    console.log('✅ ALL CHECKOUT TESTS PASSED\n');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Test runner crashed:', e);
  process.exit(1);
});
