#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 CHECKING PRODUCT STRUCTURE\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Get all products with their variants
const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*,variants:product_variants(*)&order=display_order`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },
});

const products = await response.json();

console.log(`Total Products: ${products.length}\n`);

let totalVariants = 0;
let oneTimeVariants = 0;
let recurringVariants = 0;

products.forEach((product, i) => {
  const variantCount = product.variants ? product.variants.length : 0;
  totalVariants += variantCount;

  console.log(`${i + 1}. ${product.name}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   Active: ${product.is_active}`);
  console.log(`   Variants: ${variantCount}`);

  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v, j) => {
      const billingType = v.billing_type || 'one-time';
      if (billingType === 'recurring') {
        recurringVariants++;
      } else {
        oneTimeVariants++;
      }
      console.log(`      ${j + 1}. ${v.label || v.size_key} - $${v.price_usd} (${billingType})`);
    });
  }
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════');
console.log(`TOTAL VARIANTS: ${totalVariants}`);
console.log(`  One-time: ${oneTimeVariants}`);
console.log(`  Recurring: ${recurringVariants}`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Expected Structure:');
console.log('  3 products (Green, Red, Yellow Bomb)');
console.log('  × 3 sizes (Gallon, Half-Gallon, Shot)');
console.log('  = 9 one-time purchase variants');
console.log('');
console.log('If subscriptions added:');
console.log('  + 9 recurring variants (monthly subscription)');
console.log('  = 18 total variants');
console.log('');

if (totalVariants === 9 && oneTimeVariants === 9) {
  console.log('✅ Correct: 9 one-time variants (no subscriptions)');
} else if (totalVariants === 18 && oneTimeVariants === 9 && recurringVariants === 9) {
  console.log('✅ Correct: 9 one-time + 9 recurring (with subscriptions)');
} else if (totalVariants === 15) {
  console.log('⚠️  WARNING: 15 variants detected');
  console.log('   This is unusual - expected 9 or 18');
  console.log('   Some products may have incomplete variant sets');
} else {
  console.log(`⚠️  WARNING: ${totalVariants} variants detected`);
  console.log('   Expected 9 (one-time only) or 18 (with subscriptions)');
}

console.log('');
