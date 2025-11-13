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

const BLENDS = [
  { slug: 'green-bomb', name: 'Green Bomb' },
  { slug: 'red-bomb', name: 'Red Bomb' },
  { slug: 'yellow-bomb', name: 'Yellow Bomb' },
];

const SIZES = [
  { name: 'Shot', price: 5, priceInCents: 500 },
  { name: 'Half Gallon', price: 35, priceInCents: 3500 },
  { name: 'Gallon', price: 50, priceInCents: 5000 },
];

async function addSubscriptionPrices() {
  console.log('🔧 Adding subscription pricing options...\n');

  for (const blend of BLENDS) {
    console.log(`\n📦 Processing ${blend.name}...`);

    // Get blend document
    const blendDoc = await sanityClient.fetch(
      `*[_type == "blend" && slug.current == $slug][0]`,
      { slug: blend.slug }
    );

    if (!blendDoc) {
      console.log(`   ❌ Blend not found in Sanity`);
      continue;
    }

    // Get existing sizes array
    const existingSizes = blendDoc.sizes || [];
    const updatedSizes = [];

    for (let i = 0; i < SIZES.length; i++) {
      const size = SIZES[i];
      const existingSize = existingSizes[i];

      console.log(`   Adding subscription option for ${size.name}...`);

      // Create Stripe subscription price (monthly recurring)
      const subscriptionPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: size.priceInCents,
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        product_data: {
          name: `${blend.name} - ${size.name} (Monthly Subscription)`,
        },
      });

      console.log(`   ✅ Subscription: ${subscriptionPrice.id}`);

      // Combine existing one-time price with new subscription price
      updatedSizes.push({
        _key: size.name.toLowerCase().replace(' ', '-'),
        name: size.name,
        price: size.price,
        stripePriceId: existingSize?.stripePriceId || '', // Keep existing one-time price
        stripeSubscriptionPriceId: subscriptionPrice.id, // Add subscription price
      });
    }

    // Update Sanity with updated sizes (both one-time and subscription)
    console.log(`   Updating Sanity with both payment options...`);
    await sanityClient
      .patch(blendDoc._id)
      .set({ sizes: updatedSizes })
      .commit();

    console.log(`   ✅ ${blend.name} now has BOTH one-time and subscription options`);
  }

  console.log('\n\n═══════════════════════════════════');
  console.log('✅ ALL BLENDS UPDATED');
  console.log('═══════════════════════════════════\n');
  console.log('Payment options now available:');
  console.log('  ONE-TIME PURCHASE:');
  console.log('    • Shots: $5');
  console.log('    • Half Gallons: $35');
  console.log('    • Gallons: $50');
  console.log('');
  console.log('  MONTHLY SUBSCRIPTION:');
  console.log('    • Shots: $5/month');
  console.log('    • Half Gallons: $35/month');
  console.log('    • Gallons: $50/month');
}

addSubscriptionPrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
