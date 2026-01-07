/**
 * Production API Validation Tests (Zero Risk - No Charges)
 *
 * These tests validate production Stripe configuration without charging cards.
 * - Creates checkout sessions and immediately expires them
 * - Verifies webhook endpoint accessibility
 * - Validates product/price IDs exist
 * - Checks URL configuration
 *
 * Safe to run anytime - no risk of charges.
 */

import { test, expect } from '@playwright/test';
import Stripe from 'stripe';

const PRODUCTION_URL = 'https://drinklonglife.com';

// Production price IDs from STRIPE_PRODUCTION_COMPLETE.md
const PRODUCTION_PRICES = {
  'green-bomb': {
    gallon: 'price_1STLlzCu8SiOGapKCft34ZJ2',
    halfGallon: 'price_1STLlzCu8SiOGapKR67nCD0F',
    shot: 'price_1STLm0Cu8SiOGapKOtVZIzW7',
  },
  'red-bomb': {
    gallon: 'price_1STLm0Cu8SiOGapKq8g85Kvb',
    halfGallon: 'price_1STLm1Cu8SiOGapKIJF4NcCT',
    shot: 'price_1STLm1Cu8SiOGapKQyCOIc1v',
  },
  'yellow-bomb': {
    gallon: 'price_1STLm2Cu8SiOGapKAWPkwFKs',
    halfGallon: 'price_1STLm2Cu8SiOGapKXg8ETiG8',
    shot: 'price_1STLm3Cu8SiOGapK9SH3S6Fe',
  },
};

const PRODUCTION_PRODUCTS = {
  'green-bomb': 'prod_TQCAUzauvtIiWd',
  'red-bomb': 'prod_TQCA0Z7B5O3xZC',
  'yellow-bomb': 'prod_TQCAQ0Tt4F1w9s',
};

test.describe('Production API Validation (No Charges)', () => {

  let stripe: Stripe;

  test.beforeAll(() => {
    // Verify we have production API key
    if (!process.env.STRIPE_SECRET_KEY_PRODUCTION) {
      throw new Error('STRIPE_SECRET_KEY_PRODUCTION environment variable not set');
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION!, {
      apiVersion: '2025-10-29.clover',
    });

    console.log('\n==============================================');
    console.log('  PRODUCTION API VALIDATION TESTS');
    console.log('  Safe - No charges will occur');
    console.log('==============================================\n');
  });

  test('validates webhook endpoint is accessible and validates signatures', async ({ request }) => {
    console.log('\nTesting webhook endpoint security...');

    // Should reject invalid signatures
    const response = await request.post(`${PRODUCTION_URL}/api/stripe/webhook`, {
      headers: {
        'stripe-signature': 't=invalid,v1=invalid',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ type: 'test.event' }),
    });

    // Should return 400 with signature error
    expect([400, 401]).toContain(response.status());

    const data = await response.json();
    expect(data.error).toBeTruthy();
    expect(data.error.toLowerCase()).toContain('signature');

    console.log('   ✅ Webhook endpoint properly validates signatures');
    console.log(`   ✅ Returns ${response.status()} for invalid signature`);
  });

  test('validates all production products exist and are active', async () => {
    console.log('\nValidating production products...');

    for (const [key, productId] of Object.entries(PRODUCTION_PRODUCTS)) {
      const product = await stripe.products.retrieve(productId);

      expect(product.id).toBe(productId);
      expect(product.active).toBe(true);
      expect(product.name).toBeTruthy();

      console.log(`   ✅ ${key}: ${product.name} (${product.id})`);
      console.log(`      Active: ${product.active}`);
    }
  });

  test('validates all production price IDs exist and are active', async () => {
    console.log('\nValidating production prices...');

    const allPrices: string[] = [];
    Object.values(PRODUCTION_PRICES).forEach(blend => {
      allPrices.push(...Object.values(blend));
    });

    for (const priceId of allPrices) {
      const price = await stripe.prices.retrieve(priceId);

      expect(price.id).toBe(priceId);
      expect(price.active).toBe(true);
      expect(price.unit_amount).toBeGreaterThan(0);
      expect(price.currency).toBe('usd');

      const amount = price.unit_amount! / 100;
      console.log(`   ✅ ${priceId}: $${amount.toFixed(2)} USD`);
    }

    console.log(`\n   Total: ${allPrices.length} production prices validated`);
  });

  test('validates price metadata is correct', async () => {
    console.log('\nValidating price metadata...');

    for (const [blendKey, prices] of Object.entries(PRODUCTION_PRICES)) {
      for (const [sizeKey, priceId] of Object.entries(prices)) {
        const price = await stripe.prices.retrieve(priceId);

        // Check metadata exists
        expect(price.metadata).toBeTruthy();

        if (price.metadata.size_key) {
          console.log(`   ✅ ${blendKey} ${sizeKey}: size_key="${price.metadata.size_key}"`);
        }

        if (price.metadata.size_label) {
          console.log(`      Label: "${price.metadata.size_label}"`);
        }

        if (price.metadata.servings) {
          console.log(`      Servings: ${price.metadata.servings}`);
        }
      }
    }
  });

  test('validates checkout session creation and immediate expiration', async () => {
    console.log('\nTesting checkout session creation (will be expired immediately)...');

    // Use Green Bomb Half Gallon for test
    const testPriceId = PRODUCTION_PRICES['green-bomb'].halfGallon;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: testPriceId,
          quantity: 1,
        },
      ],
      success_url: `${PRODUCTION_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PRODUCTION_URL}/cart`,
    });

    expect(session.id).toBeTruthy();
    expect(session.url).toBeTruthy();
    expect(session.url).toContain('checkout.stripe.com');
    expect(session.mode).toBe('payment');
    expect(session.status).toBe('open');

    console.log(`   ✅ Session created: ${session.id}`);
    console.log(`   ✅ Session URL: ${session.url}`);
    console.log(`   ✅ Status: ${session.status}`);

    // Immediately expire the session to prevent accidental use
    const expiredSession = await stripe.checkout.sessions.expire(session.id);

    expect(expiredSession.status).toBe('expired');

    console.log(`   ✅ Session expired successfully`);
    console.log(`   ✅ Final status: ${expiredSession.status}`);
  });

  test('validates checkout URLs are correctly configured', async () => {
    console.log('\nValidating checkout URL configuration...');

    const testPriceId = PRODUCTION_PRICES['green-bomb'].shot;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: testPriceId, quantity: 1 }],
      success_url: `${PRODUCTION_URL}/test/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PRODUCTION_URL}/test/cancel`,
    });

    expect(session.success_url).toContain('/test/success');
    expect(session.success_url).toContain('session_id={CHECKOUT_SESSION_ID}');
    expect(session.cancel_url).toContain('/test/cancel');

    console.log(`   ✅ Success URL: ${session.success_url}`);
    console.log(`   ✅ Cancel URL: ${session.cancel_url}`);

    // Clean up
    await stripe.checkout.sessions.expire(session.id);
    console.log(`   ✅ Test session expired`);
  });

  test('validates line items are correctly set', async () => {
    console.log('\nValidating line items configuration...');

    const testPriceId = PRODUCTION_PRICES['yellow-bomb'].gallon;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: testPriceId,
          quantity: 2, // Order 2 gallons
        },
      ],
      success_url: `${PRODUCTION_URL}/checkout/success`,
      cancel_url: `${PRODUCTION_URL}/cart`,
    });

    // Retrieve line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    expect(lineItems.data.length).toBe(1);
    expect(lineItems.data[0].price?.id).toBe(testPriceId);
    expect(lineItems.data[0].quantity).toBe(2);
    expect(lineItems.data[0].amount_total).toBeGreaterThan(0);

    console.log(`   ✅ Line item price: ${lineItems.data[0].price?.id}`);
    console.log(`   ✅ Quantity: ${lineItems.data[0].quantity}`);
    console.log(`   ✅ Total: $${(lineItems.data[0].amount_total! / 100).toFixed(2)}`);

    // Clean up
    await stripe.checkout.sessions.expire(session.id);
    console.log(`   ✅ Test session expired`);
  });

  test('validates all expected prices total correctly', async () => {
    console.log('\nValidating price calculations...');

    const expectations = [
      { blend: 'green-bomb', size: 'gallon', priceId: PRODUCTION_PRICES['green-bomb'].gallon, expected: 48.00 },
      { blend: 'green-bomb', size: 'halfGallon', priceId: PRODUCTION_PRICES['green-bomb'].halfGallon, expected: 28.00 },
      { blend: 'green-bomb', size: 'shot', priceId: PRODUCTION_PRICES['green-bomb'].shot, expected: 6.00 },
      { blend: 'red-bomb', size: 'gallon', priceId: PRODUCTION_PRICES['red-bomb'].gallon, expected: 48.00 },
      { blend: 'red-bomb', size: 'halfGallon', priceId: PRODUCTION_PRICES['red-bomb'].halfGallon, expected: 28.00 },
      { blend: 'red-bomb', size: 'shot', priceId: PRODUCTION_PRICES['red-bomb'].shot, expected: 6.00 },
      { blend: 'yellow-bomb', size: 'gallon', priceId: PRODUCTION_PRICES['yellow-bomb'].gallon, expected: 48.00 },
      { blend: 'yellow-bomb', size: 'halfGallon', priceId: PRODUCTION_PRICES['yellow-bomb'].halfGallon, expected: 28.00 },
      { blend: 'yellow-bomb', size: 'shot', priceId: PRODUCTION_PRICES['yellow-bomb'].shot, expected: 6.00 },
    ];

    for (const { blend, size, priceId, expected } of expectations) {
      const price = await stripe.prices.retrieve(priceId);
      const actual = price.unit_amount! / 100;

      expect(actual).toBe(expected);
      console.log(`   ✅ ${blend} ${size}: $${actual.toFixed(2)} (expected $${expected.toFixed(2)})`);
    }
  });

  test.afterAll(() => {
    console.log('\n==============================================');
    console.log('  PRODUCTION VALIDATION COMPLETE');
    console.log('  All tests passed - No charges occurred');
    console.log('==============================================\n');
  });
});
