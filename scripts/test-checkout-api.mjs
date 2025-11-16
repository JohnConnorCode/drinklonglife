#!/usr/bin/env node

/**
 * Test checkout API endpoint
 */

console.log('🧪 Testing Checkout API...\n');

async function testCheckout() {
  try {
    // Test Yellow Bomb Gallon ($50)
    console.log('Testing Yellow Bomb - Gallon ($50)');
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1STpKFCu8SiOGapK1NrQEtCX',
        mode: 'payment',
        successPath: '/checkout/success',
        cancelPath: '/blends/yellow-bomb',
      }),
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      if (data.url && data.url.includes('checkout.stripe.com')) {
        console.log('✅ Checkout session created successfully');
        console.log(`   URL: ${data.url.substring(0, 60)}...`);
        console.log(`   Mode: ${data.url.includes('/test/') ? 'TEST' : 'LIVE'}`);
        return true;
      } else {
        console.log('❌ Invalid response - no checkout URL');
        console.log(data);
        return false;
      }
    } else {
      console.log('❌ API returned error');
      console.log(data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

testCheckout()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ CHECKOUT API TEST PASSED');
      console.log('   Checkout flow is working correctly');
    } else {
      console.log('❌ CHECKOUT API TEST FAILED');
      console.log('   See errors above');
    }
    console.log('='.repeat(60) + '\n');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
