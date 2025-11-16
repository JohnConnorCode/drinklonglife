/**
 * Update prices in Supabase for a specific mode (test or live)
 *
 * This script updates ONLY Supabase database (NOT Sanity).
 * Products are managed via the admin panel at /admin/products
 *
 * Usage:
 *   node scripts/update-all-prices.mjs test   # Use test mode prices
 *   node scripts/update-all-prices.mjs live   # Use live mode prices
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const mode = process.argv[2];

if (!mode || !['test', 'live'].includes(mode)) {
  console.error('❌ Usage: node scripts/update-all-prices.mjs [test|live]');
  process.exit(1);
}

console.log(`\n🔧 Updating Supabase prices to ${mode.toUpperCase()} mode...\n`);

// Define price IDs for both modes
const prices = {
  test: {
    'green-bomb': {
      shot: 'price_1ST3b9Cu8SiOGapK5ndfaXXq',
      'half-gallon': 'price_1ST3bBCu8SiOGapK0VLbGPrB',
      gallon: 'price_1ST3bACu8SiOGapKdLqS5jKl'
    },
    'red-bomb': {
      shot: 'price_1ST3bCCu8SiOGapKFOUvXHc6',
      'half-gallon': 'price_1ST3bDCu8SiOGapKvqCqT2IY',
      gallon: 'price_1ST3bECu8SiOGapKUc5PkCkY'
    },
    'yellow-bomb': {
      shot: 'price_1STpKHCu8SiOGapKHTtIPpAa',
      'half-gallon': 'price_1STpKGCu8SiOGapK7ea8ZCQe',
      gallon: 'price_1STpKFCu8SiOGapK1NrQEtCX'
    }
  },
  live: {
    'green-bomb': {
      shot: 'price_1STyVVCu8SiOGapKBlSdIRPs',
      'half-gallon': 'price_1STyVVCu8SiOGapK5TWRV9wY',
      gallon: 'price_1STyVWCu8SiOGapKH1Dmftj3'
    },
    'red-bomb': {
      shot: 'price_1STyVWCu8SiOGapKQo3vjfmt',
      'half-gallon': 'price_1STyVXCu8SiOGapK55CV4uSl',
      gallon: 'price_1STyVXCu8SiOGapKIW94OQi7'
    },
    'yellow-bomb': {
      shot: 'price_1STHSDCu8SiOGapKqsIGDR3s',
      'half-gallon': 'price_1STHSFCu8SiOGapKEUGSXv31',
      gallon: 'price_1STHSHCu8SiOGapK7hF5P0Jp'
    }
  }
};

const selectedPrices = prices[mode];

// Update Supabase
console.log('💾 Updating Supabase database...\n');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

for (const [slug, priceIds] of Object.entries(selectedPrices)) {
  // Get product ID
  const productRes = await fetch(`${SUPABASE_URL}/rest/v1/products?slug=eq.${slug}&select=id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const products = await productRes.json();

  if (!products || products.length === 0) {
    console.log(`   ❌ ${slug}: Not found in Supabase`);
    continue;
  }

  const productId = products[0].id;

  // Get variants
  const variantsRes = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${productId}&select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const variants = await variantsRes.json();

  console.log(`   ✅ ${slug}: Updating ${variants.length} variants`);

  for (const variant of variants) {
    const newPriceId = priceIds[variant.size_key];
    if (!newPriceId) continue;

    await fetch(`${SUPABASE_URL}/rest/v1/product_variants?id=eq.${variant.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ stripe_price_id: newPriceId })
    });

    console.log(`      ${variant.label}: ${newPriceId}`);
  }
  console.log('');
}

console.log('\n✅ All Supabase prices updated to', mode.toUpperCase(), 'mode');
console.log('\n💡 Next steps:');
if (mode === 'live') {
  console.log('1. Update .env.local: STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_PRODUCTION}');
  console.log('2. Restart the dev server: rm -rf .next && npm run dev');
  console.log('3. Test checkout with real payment methods');
  console.log('4. ⚠️  WARNING: LIVE mode charges REAL money!');
} else {
  console.log('1. Ensure .env.local: STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_TEST}');
  console.log('2. Restart the dev server: rm -rf .next && npm run dev');
  console.log('3. Test checkout with test card: 4242 4242 4242 4242');
}
