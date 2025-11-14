#!/usr/bin/env node

/**
 * Test script to verify the checkout API fix
 * Tests both one-time and subscription price IDs
 */

import { client } from '../lib/sanity.client.js';

async function testCheckoutFix() {
  console.log('🧪 Testing Checkout API Fix\n');
  console.log('════════════════════════════════════════\n');

  // Fetch all price IDs from Sanity
  const blends = await client.fetch(`
    *[_type == "blend" && defined(sizes)] {
      name,
      "sizes": sizes[] {
        size,
        stripePriceId,
        stripeSubscriptionPriceId
      }
    }
  `);

  console.log(`✓ Found ${blends.length} blends with pricing\n`);

  // Test one-time and subscription prices for each blend
  for (const blend of blends) {
    console.log(`Testing ${blend.name}:`);

    for (const size of blend.sizes) {
      // Test one-time purchase
      if (size.stripePriceId) {
        const oneTimeResult = await testCheckout(size.stripePriceId, 'payment');
        const oneTimeStatus = oneTimeResult.ok ? '✅' : '❌';
        console.log(`  ${oneTimeStatus} One-time (${size.size}): ${size.stripePriceId}`);
        if (!oneTimeResult.ok) {
          console.log(`     Error: ${oneTimeResult.error}`);
        }
      }

      // Test subscription
      if (size.stripeSubscriptionPriceId) {
        const subResult = await testCheckout(size.stripeSubscriptionPriceId, 'subscription');
        const subStatus = subResult.ok ? '✅' : '❌';
        console.log(`  ${subStatus} Subscription (${size.size}): ${size.stripeSubscriptionPriceId}`);
        if (!subResult.ok) {
          console.log(`     Error: ${subResult.error}`);
        }
      }
    }
    console.log('');
  }

  console.log('════════════════════════════════════════');
  console.log('✓ Test complete!');
}

async function testCheckout(priceId, mode) {
  try {
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        mode,
        successPath: '/success',
        cancelPath: '/cancel',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Unknown error' };
    }

    // Check if we got a checkout URL back
    if (data.url && data.url.includes('checkout.stripe.com')) {
      return { ok: true };
    }

    return { ok: false, error: 'No checkout URL returned' };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Run the test
testCheckoutFix().catch(console.error);
