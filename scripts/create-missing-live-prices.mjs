/**
 * Create missing LIVE mode prices for Green Bomb and Red Bomb at $50/$35/$5
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION);

console.log('⚠️  Creating LIVE MODE prices for Green Bomb and Red Bomb\n');

// Using the old "Yellow Bomb" product which already has correct pricing structure
// We'll create prices for the newer product IDs at the same amounts

const products = {
  'green-bomb': {
    id: 'prod_TQCAUzauvtIiWd', // Green Bomb - Cold-Pressed Juice
    name: 'Green Bomb'
  },
  'red-bomb': {
    id: 'prod_TQCA0Z7B5O3xZC', // Red Bomb - Cold-Pressed Juice
    name: 'Red Bomb'
  }
};

const sizes = [
  { key: 'shot', name: 'Shot', amount: 500 },           // $5
  { key: 'half-gallon', name: 'Half Gallon', amount: 3500 }, // $35
  { key: 'gallon', name: 'Gallon', amount: 5000 }       // $50
];

const allPrices = {};

for (const [slug, product] of Object.entries(products)) {
  console.log(`\n📦 Creating prices for ${product.name}...`);
  allPrices[slug] = {};

  for (const size of sizes) {
    try {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: size.amount,
        currency: 'usd',
        nickname: `${size.name} - One-time`
      });

      console.log(`   ✅ ${size.name}: ${price.id} - $${size.amount/100}`);
      allPrices[slug][size.key] = price.id;
    } catch (error) {
      console.error(`   ❌ ${size.name} failed:`, error.message);
    }
  }
}

console.log('\n\n📋 NEW LIVE MODE PRICE IDs:');
console.log('═'.repeat(60));
console.log(JSON.stringify(allPrices, null, 2));

console.log('\n\n✅ Done! Use these price IDs for LIVE mode.');
console.log('   Run: node scripts/update-all-prices.mjs live');
console.log('   (You\'ll need to update that script with these new IDs first)');
