#!/usr/bin/env node
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY);

console.log('🔧 ADDING MISSING HALF-GALLON SUBSCRIPTIONS\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function addVariantsWithStripe() {
  // Get all core products
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,stripe_product_id,variants:product_variants(*)&slug=in.(yellow-bomb,red-bomb,green-bomb)`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const products = await response.json();

  for (const product of products) {
    console.log(`\nProcessing: ${product.name}`);
    console.log('───────────────────────────────────────────────────────────');

    // Check if Half-Gallon Monthly subscription exists
    const hasHalfGallonSub = product.variants?.some(v =>
      (v.size_key === 'half_gallon' || v.label?.includes('½ Gallon')) &&
      v.billing_type === 'recurring'
    );

    if (hasHalfGallonSub) {
      console.log('✅ Half-Gallon subscription already exists\n');
      continue;
    }

    // Find the one-time Half-Gallon variant to get pricing
    const oneTimeHalfGallon = product.variants?.find(v =>
      (v.size_key === 'half_gallon' || v.label?.includes('½ Gallon')) &&
      v.billing_type !== 'recurring'
    );

    if (!oneTimeHalfGallon) {
      console.log('⚠️  No one-time Half-Gallon variant found - skipping\n');
      continue;
    }

    console.log(`Creating Half-Gallon Monthly subscription ($${oneTimeHalfGallon.price_usd})...`);

    // Step 1: Create Stripe price
    console.log('  1. Creating Stripe price...');

    if (!product.stripe_product_id) {
      console.log('     ❌ No stripe_product_id for this product');
      console.log('     Run sync-stripe first for this product\n');
      continue;
    }

    const stripePrice = await stripe.prices.create({
      product: product.stripe_product_id,
      currency: 'usd',
      unit_amount: Math.round(oneTimeHalfGallon.price_usd * 100),
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: `${product.name} - ½ Gallon (Monthly)`,
    });

    console.log(`     ✅ Created Stripe price: ${stripePrice.id}`);

    // Step 2: Create variant in database
    console.log('  2. Creating database variant...');

    const maxOrder = Math.max(...product.variants.map(v => v.display_order || 0));

    const newVariant = {
      product_id: product.id,
      size_key: 'half_gallon',
      label: '½ Gallon (Monthly)',
      price_usd: oneTimeHalfGallon.price_usd,
      billing_type: 'recurring',
      recurring_interval: 'month',
      recurring_interval_count: 1,
      stripe_price_id: stripePrice.id,
      is_default: false,
      display_order: maxOrder + 1,
      is_active: true,
    };

    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newVariant),
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log(`     ✅ Created variant ID: ${created[0]?.id}`);
      console.log(`✅ ${product.name}: Half-Gallon Monthly subscription added!\n`);
    } else {
      const error = await createResponse.text();
      console.log(`     ❌ Failed: ${error}\n`);
    }
  }
}

async function verifyStructure() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('VERIFYING FINAL STRUCTURE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*,variants:product_variants(*)&order=display_order`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const products = await response.json();

  let totalVariants = 0;
  let oneTimeVariants = 0;
  let recurringVariants = 0;

  products.forEach((product, i) => {
    const variantCount = product.variants ? product.variants.length : 0;
    totalVariants += variantCount;

    const oneTime = product.variants?.filter(v => v.billing_type !== 'recurring').length || 0;
    const recurring = product.variants?.filter(v => v.billing_type === 'recurring').length || 0;

    oneTimeVariants += oneTime;
    recurringVariants += recurring;

    console.log(`${i + 1}. ${product.name}: ${variantCount} variants (${oneTime} one-time, ${recurring} recurring)`);
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`TOTAL: ${products.length} products, ${totalVariants} variants`);
  console.log(`  One-time: ${oneTimeVariants}`);
  console.log(`  Recurring: ${recurringVariants}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (products.length === 3 && totalVariants === 18 && oneTimeVariants === 9 && recurringVariants === 9) {
    console.log('✅ PERFECT! Product structure is now correct!');
    console.log('   3 products × 3 sizes × 2 billing types = 18 variants\n');
    return true;
  } else {
    console.log('Current structure:');
    console.log(`  Products: ${products.length} (expected: 3)`);
    console.log(`  Variants: ${totalVariants} (expected: 18)`);
    console.log(`  One-time: ${oneTimeVariants} (expected: 9)`);
    console.log(`  Recurring: ${recurringVariants} (expected: 9)\n`);
    return false;
  }
}

async function run() {
  try {
    await addVariantsWithStripe();
    const isCorrect = await verifyStructure();

    if (isCorrect) {
      console.log('🎉 All missing variants added successfully!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some issues remain - see output above\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

run();
