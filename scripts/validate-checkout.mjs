import {createClient} from '@sanity/client';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const BLEND_SLUGS = ['green-bomb', 'red-bomb', 'yellow-bomb'];

async function validateCheckout() {
  console.log('🔍 Starting Checkout Validation\n');

  let allValid = true;

  // Step 1: Validate blend data in Sanity
  console.log('📦 Step 1: Validating Blend Data in Sanity');
  console.log('─'.repeat(50));

  for (const slug of BLEND_SLUGS) {
    try {
      const blend = await sanityClient.fetch(
        `*[_type == "blend" && slug.current == $slug][0]{
          _id,
          name,
          "slug": slug.current,
          sizes
        }`,
        { slug }
      );

      if (!blend) {
        console.log(`❌ ${slug}: Not found in Sanity`);
        allValid = false;
        continue;
      }

      if (!blend.sizes || blend.sizes.length === 0) {
        console.log(`❌ ${slug}: No sizes defined`);
        allValid = false;
        continue;
      }

      const size = blend.sizes[0];
      if (!size.stripePriceId) {
        console.log(`❌ ${slug}: Missing stripePriceId`);
        allValid = false;
        continue;
      }

      console.log(`✅ ${slug}: Valid (Price ID: ${size.stripePriceId})`);
    } catch (error) {
      console.log(`❌ ${slug}: Error fetching from Sanity: ${error.message}`);
      allValid = false;
    }
  }

  console.log('');

  // Step 2: Validate Stripe Price IDs
  console.log('💳 Step 2: Validating Stripe Price IDs');
  console.log('─'.repeat(50));

  for (const slug of BLEND_SLUGS) {
    try {
      const blend = await sanityClient.fetch(
        `*[_type == "blend" && slug.current == $slug][0]{
          name,
          sizes
        }`,
        { slug }
      );

      if (!blend?.sizes?.[0]?.stripePriceId) {
        console.log(`⏭️  ${slug}: Skipping (no price ID)`);
        continue;
      }

      const priceId = blend.sizes[0].stripePriceId;

      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ ${slug}: Price exists in Stripe ($${(price.unit_amount / 100).toFixed(2)})`);
      } catch (stripeError) {
        console.log(`❌ ${slug}: Invalid Stripe Price ID: ${stripeError.message}`);
        allValid = false;
      }
    } catch (error) {
      console.log(`❌ ${slug}: Error: ${error.message}`);
      allValid = false;
    }
  }

  console.log('');

  // Step 3: Test Checkout API
  console.log('🛒 Step 3: Testing Checkout API');
  console.log('─'.repeat(50));

  for (const slug of BLEND_SLUGS) {
    try {
      const blend = await sanityClient.fetch(
        `*[_type == "blend" && slug.current == $slug][0]{
          name,
          sizes
        }`,
        { slug }
      );

      if (!blend?.sizes?.[0]?.stripePriceId) {
        console.log(`⏭️  ${slug}: Skipping (no price ID)`);
        continue;
      }

      const priceId = blend.sizes[0].stripePriceId;

      // Create a checkout session via API
      const response = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          mode: 'payment',
          successPath: `/checkout/success?blend=${slug}`,
          cancelPath: `/blends/${slug}`,
        }),
      });

      if (!response.ok) {
        console.log(`❌ ${slug}: API returned ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        allValid = false;
        continue;
      }

      const data = await response.json();

      if (!data.url) {
        console.log(`❌ ${slug}: No checkout URL in response`);
        if (data.error) {
          console.log(`   Error: ${data.error}`);
        }
        allValid = false;
        continue;
      }

      // Validate the URL is a Stripe checkout URL
      if (!data.url.includes('checkout.stripe.com')) {
        console.log(`❌ ${slug}: Invalid checkout URL: ${data.url}`);
        allValid = false;
        continue;
      }

      console.log(`✅ ${slug}: Checkout session created successfully`);
      console.log(`   URL: ${data.url.substring(0, 60)}...`);
    } catch (error) {
      console.log(`❌ ${slug}: Error testing checkout: ${error.message}`);
      allValid = false;
    }
  }

  console.log('');
  console.log('═'.repeat(50));

  if (allValid) {
    console.log('✅ ALL VALIDATION CHECKS PASSED');
    console.log('   Checkout flow is working correctly for all blends');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('   Some checks did not pass - see errors above');
  }

  console.log('═'.repeat(50));

  return allValid;
}

validateCheckout()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n❌ Fatal Error:', err);
    process.exit(1);
  });
