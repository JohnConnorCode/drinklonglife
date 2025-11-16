/**
 * Creates LIVE mode Stripe prices for all products
 * Run this script ONLY when ready to create actual live prices
 *
 * WARNING: This uses LIVE mode keys and creates real prices
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION);

console.log('⚠️  WARNING: Creating LIVE MODE Stripe prices');
console.log('   These will be REAL prices that customers can purchase\n');

// Product IDs from Stripe Dashboard (these should already exist in live mode)
const products = {
  'green-bomb': 'prod_RwmM4H5lI7hZCt', // Replace with actual live product ID
  'red-bomb': 'prod_RwmMaRNuVGX0pD',   // Replace with actual live product ID
  'yellow-bomb': 'prod_RwmMfSfRBc5cg5' // Replace with actual live product ID
};

const sizes = [
  { key: 'gallon', name: 'Gallon', amount: 5000 },      // $50
  { key: 'half_gallon', name: 'Half Gallon', amount: 3500 }, // $35
  { key: 'shot', name: 'Shot', amount: 500 }            // $5
];

const allPrices = {};

for (const [blendName, productId] of Object.entries(products)) {
  console.log(`\n📦 Creating prices for ${blendName}...`);
  allPrices[blendName] = {};

  for (const size of sizes) {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: size.amount,
        currency: 'usd',
        nickname: `${blendName} - ${size.name} (LIVE)`
      });

      console.log(`   ✅ ${size.name}: ${price.id} - $${size.amount/100}`);
      allPrices[blendName][size.key] = price.id;
    } catch (error) {
      console.error(`   ❌ ${size.name} failed:`, error.message);
    }
  }
}

console.log('\n\n📋 LIVE MODE PRICE IDs (save these):');
console.log('═'.repeat(60));
console.log(JSON.stringify(allPrices, null, 2));

console.log('\n\n💾 Next steps:');
console.log('1. Update Sanity CMS with these LIVE price IDs');
console.log('2. Update Supabase database with these LIVE price IDs');
console.log('3. Switch STRIPE_SECRET_KEY to STRIPE_SECRET_KEY_PRODUCTION in .env.local');
console.log('4. Test checkout in LIVE mode');
