import Stripe from 'stripe';
import { createClient } from '@sanity/client';

// Require environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('❌ Error: SANITY_WRITE_TOKEN environment variable is required');
  process.exit(1);
}

// Use LIVE Stripe key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const sanity = createClient({
  projectId: 'jrc9x3mn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

console.log('🚀 Creating Payment Links for Yellow Bomb...\n');

// Yellow Bomb sizes
const sizes = [
  { key: 'shot', name: 'Shot', price: 500 }, // $5.00 in cents
  { key: 'half-gallon', name: 'Half Gallon', price: 3500 }, // $35.00
  { key: 'gallon', name: 'Gallon', price: 5000 }, // $50.00
];

async function createPaymentLinks() {
  // First, create or get the product
  console.log('📦 Creating/finding Yellow Bomb product in Stripe...');

  const products = await stripe.products.list({ limit: 100 });
  let product = products.data.find(p => p.name === 'Yellow Bomb');

  if (!product) {
    product = await stripe.products.create({
      name: 'Yellow Bomb',
      description: 'Anti-inflammatory turmeric and ginger blend for energy and immunity',
      images: ['https://cdn.sanity.io/images/jrc9x3mn/production/1fd2e05cdb6d059821a7c4be777d01a7f15f1167-800x1200.jpg'],
    });
    console.log(`✓ Created product: ${product.id}`);
  } else {
    console.log(`✓ Found existing product: ${product.id}`);
  }

  const paymentLinks = {};

  // Create payment links for each size
  for (const size of sizes) {
    console.log(`\n📝 Creating links for ${size.name}...`);

    // Create one-time price
    console.log(`  Creating one-time price ($${size.price / 100})...`);
    const oneTimePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: size.price,
      currency: 'usd',
      nickname: `${size.name} - One-time`,
    });
    console.log(`  ✓ One-time price: ${oneTimePrice.id}`);

    // Create subscription price
    console.log(`  Creating subscription price ($${size.price / 100}/month)...`);
    const subscriptionPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: size.price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: `${size.name} - Monthly`,
    });
    console.log(`  ✓ Subscription price: ${subscriptionPrice.id}`);

    // Create one-time payment link
    console.log(`  Creating one-time Payment Link...`);
    const oneTimeLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: oneTimePrice.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://drinklonglife.com/checkout/success',
        },
      },
    });
    console.log(`  ✓ One-time link: ${oneTimeLink.url}`);

    // Create subscription payment link
    console.log(`  Creating subscription Payment Link...`);
    const subscriptionLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: subscriptionPrice.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://drinklonglife.com/checkout/success',
        },
      },
    });
    console.log(`  ✓ Subscription link: ${subscriptionLink.url}`);

    paymentLinks[size.key] = {
      oneTimeUrl: oneTimeLink.url,
      subscriptionUrl: subscriptionLink.url,
      oneTimePriceId: oneTimePrice.id,
      subscriptionPriceId: subscriptionPrice.id,
    };
  }

  // Update Sanity
  console.log('\n\n📝 Updating Sanity with Payment Link URLs...');

  const blend = await sanity.fetch(`*[_type == "blend" && slug.current == "yellow-bomb"][0]`);

  if (blend) {
    // Update each size with payment links
    const updatedSizes = blend.sizes.map(size => {
      const links = paymentLinks[size._key];
      if (links) {
        console.log(`  ✓ Updating ${size.name}:`);
        console.log(`    - One-time: ${links.oneTimeUrl}`);
        console.log(`    - Subscription: ${links.subscriptionUrl}`);
        return {
          ...size,
          paymentLinkUrl: links.oneTimeUrl,
          subscriptionPaymentLinkUrl: links.subscriptionUrl,
          stripePriceId: links.oneTimePriceId,
          stripeSubscriptionPriceId: links.subscriptionPriceId,
        };
      }
      return size;
    });

    await sanity
      .patch(blend._id)
      .set({ sizes: updatedSizes })
      .commit();

    console.log('\n✅ Sanity updated successfully!');
  }

  console.log('\n\n🎉 Done! Payment Links created and added to Sanity.');
  console.log('\nPayment Links Summary:');
  for (const [key, links] of Object.entries(paymentLinks)) {
    const size = sizes.find(s => s.key === key);
    console.log(`\n${size.name}:`);
    console.log(`  One-time: ${links.oneTimeUrl}`);
    console.log(`  Subscription: ${links.subscriptionUrl}`);
  }
}

createPaymentLinks().catch(console.error);
