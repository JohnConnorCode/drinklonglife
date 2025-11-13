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

async function fixPrices() {
  console.log('🔧 Setting up correct pricing structure...\n');

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

    const newSizes = [];

    for (const size of SIZES) {
      console.log(`   Creating Stripe price for ${size.name} ($${size.price})...`);

      // Create Stripe price (one-time payment)
      const stripePrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: size.priceInCents,
        product_data: {
          name: `${blend.name} - ${size.name}`,
        },
      });

      console.log(`   ✅ Created: ${stripePrice.id}`);

      newSizes.push({
        _key: size.name.toLowerCase().replace(' ', '-'),
        name: size.name,
        price: size.price,
        stripePriceId: stripePrice.id,
      });
    }

    // Update Sanity with new sizes
    console.log(`   Updating Sanity...`);
    await sanityClient
      .patch(blendDoc._id)
      .set({ sizes: newSizes })
      .commit();

    console.log(`   ✅ ${blend.name} updated with 3 sizes`);
  }

  console.log('\n\n═══════════════════════════════════');
  console.log('✅ ALL BLENDS UPDATED');
  console.log('═══════════════════════════════════\n');
  console.log('New pricing structure:');
  console.log('  • Shots: $5');
  console.log('  • Half Gallons: $35');
  console.log('  • Gallons: $50');
  console.log('\nAll prices are ONE-TIME purchases (not subscriptions)');
}

fixPrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
