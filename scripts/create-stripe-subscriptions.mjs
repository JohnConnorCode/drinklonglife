#!/usr/bin/env node

/**
 * Create Subscription Products in Stripe
 * Creates monthly subscription products for each blend (Green Bomb, Red Bomb, Yellow Bomb)
 * with three size options (gallon, half-gallon, shot)
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

dotenv.config({ path: join(projectRoot, '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_TEST;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY_TEST in .env.local');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

console.log('🚀 Creating Stripe Subscription Products...\n');

// Product definitions
const subscriptionProducts = [
  {
    name: 'Green Bomb - Monthly Subscription',
    description: 'Monthly subscription for Green Bomb cold-pressed juice',
    sizes: [
      { name: 'Gallon', price: 49.99 },
      { name: 'Half Gallon', price: 29.99 },
      { name: 'Shot', price: 12.99 },
    ],
  },
  {
    name: 'Red Bomb - Monthly Subscription',
    description: 'Monthly subscription for Red Bomb cold-pressed juice',
    sizes: [
      { name: 'Gallon', price: 49.99 },
      { name: 'Half Gallon', price: 29.99 },
      { name: 'Shot', price: 12.99 },
    ],
  },
  {
    name: 'Yellow Bomb - Monthly Subscription',
    description: 'Monthly subscription for Yellow Bomb cold-pressed juice',
    sizes: [
      { name: 'Gallon', price: 49.99 },
      { name: 'Half Gallon', price: 29.99 },
      { name: 'Shot', price: 12.99 },
    ],
  },
];

async function createSubscriptionProducts() {
  const createdProducts = [];

  for (const productDef of subscriptionProducts) {
    try {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`Creating: ${productDef.name}`);
      console.log(`${'─'.repeat(70)}\n`);

      // Create the product
      const product = await stripe.products.create({
        name: productDef.name,
        description: productDef.description,
        active: true,
      });

      console.log(`✅ Product created: ${product.id}`);
      console.log(`   Name: ${product.name}\n`);

      const productPrices = [];

      // Create prices for each size
      for (const size of productDef.sizes) {
        try {
          const price = await stripe.prices.create({
            product: product.id,
            currency: 'usd',
            unit_amount: Math.round(size.price * 100), // Convert to cents
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            nickname: `${productDef.name} - ${size.name}`,
          });

          console.log(`   ✅ ${size.name}: $${size.price}/month`);
          console.log(`      Price ID: ${price.id}`);

          productPrices.push({
            size: size.name,
            priceId: price.id,
            amount: size.price,
          });
        } catch (err) {
          console.log(`   ❌ Error creating ${size.name} price: ${err.message}`);
        }
      }

      createdProducts.push({
        name: productDef.name,
        productId: product.id,
        prices: productPrices,
      });

      console.log('');
    } catch (err) {
      console.error(`❌ Error creating ${productDef.name}: ${err.message}\n`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 SUBSCRIPTION PRODUCTS CREATED');
  console.log('='.repeat(70) + '\n');

  createdProducts.forEach(product => {
    console.log(`${product.name}`);
    console.log(`Product ID: ${product.productId}`);
    product.prices.forEach(price => {
      console.log(`  - ${price.size}: ${price.priceId} ($${price.amount}/month)`);
    });
    console.log('');
  });

  console.log('='.repeat(70));
  console.log('✅ All subscription products created successfully!');
  console.log('='.repeat(70) + '\n');

  console.log('📝 Next steps:');
  console.log('  1. Run database migration to add billing_type columns');
  console.log('  2. Run: node scripts/sync-subscription-products.mjs');
  console.log('  3. Update pricing page to show subscription options\n');
}

createSubscriptionProducts().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
