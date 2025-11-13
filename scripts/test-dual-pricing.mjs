import {createClient} from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_READ_TOKEN,
  useCdn: false,
});

async function testDualPricing() {
  console.log('🧪 Testing Dual Pricing System...\n');

  const blends = await sanityClient.fetch(
    `*[_type == "blend"] | order(name asc) {
      name,
      "slug": slug.current,
      sizes[] {
        _key,
        name,
        price,
        stripePriceId,
        stripeSubscriptionPriceId
      }
    }`
  );

  let passedTests = 0;
  let totalTests = 0;

  for (const blend of blends) {
    console.log(`\n📦 ${blend.name}`);
    console.log('─'.repeat(50));

    for (const size of blend.sizes) {
      totalTests += 2; // Testing both one-time and subscription

      // Test one-time purchase
      if (size.stripePriceId) {
        console.log(`  ✅ ${size.name} - One-time ($${size.price})`);
        console.log(`     Price ID: ${size.stripePriceId}`);
        passedTests++;
      } else {
        console.log(`  ❌ ${size.name} - One-time MISSING`);
      }

      // Test subscription
      if (size.stripeSubscriptionPriceId) {
        console.log(`  ✅ ${size.name} - Subscription ($${size.price}/mo)`);
        console.log(`     Price ID: ${size.stripeSubscriptionPriceId}`);
        passedTests++;
      } else {
        console.log(`  ❌ ${size.name} - Subscription MISSING`);
      }
    }
  }

  console.log('\n\n═══════════════════════════════════');
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════\n');

  if (passedTests === totalTests) {
    console.log('✅ ALL PRICING OPTIONS CONFIGURED CORRECTLY');
    console.log('\nNext step: Test checkout flows manually at:');
    console.log('  http://localhost:3000/blends/green-bomb');
    console.log('\n1. Toggle between One-Time and Monthly');
    console.log('2. Click Reserve Now');
    console.log('3. Verify Stripe checkout opens with correct price');
  } else {
    console.log('❌ SOME PRICING OPTIONS ARE MISSING');
    console.log('Run: node scripts/add-subscription-prices.mjs');
  }
}

testDualPricing()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
