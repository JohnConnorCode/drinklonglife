#!/usr/bin/env node
import { variantSchema } from '../lib/validations/product.js';

console.log('🧪 TESTING VARIANT SCHEMA VALIDATION\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Variant WITHOUT stripe_price_id (new product scenario)
console.log('TEST 1: Variant without stripe_price_id');
console.log('───────────────────────────────────────────────────────────');

const newVariant = {
  size_key: 'test_size',
  label: 'Test Size',
  price_usd: 29.99,
  is_default: true,
  display_order: 1,
  is_active: true,
  // NO stripe_price_id - this should pass after our fix!
};

console.log('Input:');
console.log(JSON.stringify(newVariant, null, 2));
console.log('');

const result1 = variantSchema.safeParse(newVariant);

if (result1.success) {
  console.log('✅ PASS - Variant accepted without stripe_price_id!');
  console.log('Validated data:');
  console.log(JSON.stringify(result1.data, null, 2));
  console.log('');
} else {
  console.log('❌ FAIL - Variant rejected');
  console.log('Errors:');
  console.log(JSON.stringify(result1.error.errors, null, 2));
  console.log('');
}

// Test 2: Variant WITH stripe_price_id (existing product scenario)
console.log('\nTEST 2: Variant with stripe_price_id');
console.log('───────────────────────────────────────────────────────────');

const existingVariant = {
  size_key: 'test_size',
  label: 'Test Size',
  stripe_price_id: 'price_1ABC123xyz',
  price_usd: 29.99,
  is_default: true,
  display_order: 1,
  is_active: true,
};

console.log('Input:');
console.log(JSON.stringify(existingVariant, null, 2));
console.log('');

const result2 = variantSchema.safeParse(existingVariant);

if (result2.success) {
  console.log('✅ PASS - Variant accepted with stripe_price_id');
  console.log('Validated data:');
  console.log(JSON.stringify(result2.data, null, 2));
  console.log('');
} else {
  console.log('❌ FAIL - Variant rejected');
  console.log('Errors:');
  console.log(JSON.stringify(result2.error.errors, null, 2));
  console.log('');
}

// Test 3: Variant with null stripe_price_id
console.log('\nTEST 3: Variant with null stripe_price_id');
console.log('───────────────────────────────────────────────────────────');

const nullPriceVariant = {
  size_key: 'test_size',
  label: 'Test Size',
  stripe_price_id: null,
  price_usd: 29.99,
  is_default: true,
  display_order: 1,
  is_active: true,
};

console.log('Input:');
console.log(JSON.stringify(nullPriceVariant, null, 2));
console.log('');

const result3 = variantSchema.safeParse(nullPriceVariant);

if (result3.success) {
  console.log('✅ PASS - Variant accepted with null stripe_price_id');
  console.log('Validated data:');
  console.log(JSON.stringify(result3.data, null, 2));
  console.log('');
} else {
  console.log('❌ FAIL - Variant rejected');
  console.log('Errors:');
  console.log(JSON.stringify(result3.error.errors, null, 2));
  console.log('');
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

const allPassed = result1.success && result2.success && result3.success;

if (allPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('');
  console.log('The schema now supports:');
  console.log('  ✓ Variants WITHOUT stripe_price_id (new products)');
  console.log('  ✓ Variants WITH stripe_price_id (existing products)');
  console.log('  ✓ Variants with NULL stripe_price_id');
  console.log('');
  console.log('🎉 AUTO-SYNC SCHEMA FIX VERIFIED!');
  console.log('   Admins can now create products without pre-existing Stripe IDs!');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('   Schema still has validation issues');
}

console.log('\n═══════════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
