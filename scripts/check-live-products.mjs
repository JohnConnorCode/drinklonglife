/**
 * Check what products exist in LIVE mode Stripe
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION);

console.log('🔍 Checking LIVE mode Stripe products...\n');

const products = await stripe.products.list({ limit: 100 });

console.log(`Found ${products.data.length} products in LIVE mode:\n`);

products.data.forEach(product => {
  console.log(`📦 ${product.name}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   Active: ${product.active}`);
  console.log(`   Description: ${product.description || 'N/A'}`);
  console.log('');
});

// Also check for existing prices
console.log('\n💳 Checking existing LIVE mode prices...\n');

const prices = await stripe.prices.list({ limit: 100 });

const pricesByProduct = {};
prices.data.forEach(price => {
  if (!pricesByProduct[price.product]) {
    pricesByProduct[price.product] = [];
  }
  pricesByProduct[price.product].push(price);
});

for (const [productId, productPrices] of Object.entries(pricesByProduct)) {
  const product = products.data.find(p => p.id === productId);
  console.log(`📦 ${product?.name || productId}:`);
  productPrices.forEach(price => {
    console.log(`   ${price.id}: $${price.unit_amount/100} ${price.nickname || ''}`);
  });
  console.log('');
}
