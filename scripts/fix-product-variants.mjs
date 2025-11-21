#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 FIXING PRODUCT VARIANT STRUCTURE\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function deleteTestProduct() {
  console.log('1️⃣  Deleting test product...');
  console.log('───────────────────────────────────────────────────────────');

  // Find test products
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,slug,name&slug=like.*auto-sync*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const testProducts = await response.json();

  if (testProducts.length === 0) {
    console.log('✅ No test products found\n');
    return;
  }

  for (const product of testProducts) {
    console.log(`Deleting: ${product.name} (${product.slug})`);

    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (deleteResponse.ok) {
      console.log('✅ Deleted successfully');
    } else {
      console.log(`❌ Failed to delete: ${await deleteResponse.text()}`);
    }
  }
  console.log('');
}

async function addMissingSubscriptions() {
  console.log('2️⃣  Adding missing Half-Gallon subscriptions...');
  console.log('───────────────────────────────────────────────────────────');

  // Get all core products
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,variants:product_variants(*)&slug=in.(yellow-bomb,red-bomb,green-bomb)`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const products = await response.json();

  for (const product of products) {
    console.log(`\nChecking: ${product.name}`);

    // Check if Half-Gallon Monthly subscription exists
    const hasHalfGallonSub = product.variants?.some(v =>
      (v.size_key === 'half_gallon' || v.label?.includes('½ Gallon')) &&
      v.billing_type === 'recurring'
    );

    if (hasHalfGallonSub) {
      console.log('  ✅ Half-Gallon subscription already exists');
      continue;
    }

    // Find the one-time Half-Gallon variant to get pricing
    const oneTimeHalfGallon = product.variants?.find(v =>
      (v.size_key === 'half_gallon' || v.label?.includes('½ Gallon')) &&
      v.billing_type !== 'recurring'
    );

    if (!oneTimeHalfGallon) {
      console.log('  ⚠️  No one-time Half-Gallon variant found - skipping');
      continue;
    }

    console.log(`  Adding Half-Gallon Monthly subscription ($${oneTimeHalfGallon.price_usd})`);

    // Get max display_order for this product
    const maxOrder = Math.max(...product.variants.map(v => v.display_order || 0));

    const newVariant = {
      product_id: product.id,
      size_key: 'half_gallon',
      label: '½ Gallon (Monthly)',
      price_usd: oneTimeHalfGallon.price_usd,
      billing_type: 'recurring',
      recurring_interval: 'month',
      recurring_interval_count: 1,
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
      console.log(`  ✅ Created variant ID: ${created[0]?.id}`);
    } else {
      const error = await createResponse.text();
      console.log(`  ❌ Failed: ${error}`);
    }
  }
  console.log('');
}

async function verifyStructure() {
  console.log('3️⃣  Verifying final structure...');
  console.log('───────────────────────────────────────────────────────────');

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

    console.log(`${i + 1}. ${product.name}: ${variantCount} variants`);

    if (product.variants && product.variants.length > 0) {
      const oneTime = product.variants.filter(v => v.billing_type !== 'recurring').length;
      const recurring = product.variants.filter(v => v.billing_type === 'recurring').length;

      oneTimeVariants += oneTime;
      recurringVariants += recurring;

      console.log(`   One-time: ${oneTime}, Recurring: ${recurring}`);
    }
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`TOTAL PRODUCTS: ${products.length}`);
  console.log(`TOTAL VARIANTS: ${totalVariants}`);
  console.log(`  One-time: ${oneTimeVariants}`);
  console.log(`  Recurring: ${recurringVariants}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (products.length === 3 && totalVariants === 18 && oneTimeVariants === 9 && recurringVariants === 9) {
    console.log('✅ PERFECT! Structure is now correct:');
    console.log('   3 products × 3 sizes × 2 billing types = 18 variants\n');
    return true;
  } else {
    console.log('⚠️  Structure still needs adjustment:');
    console.log(`   Current: ${products.length} products, ${totalVariants} variants`);
    console.log(`   Expected: 3 products, 18 variants (9 one-time + 9 recurring)\n`);
    return false;
  }
}

async function run() {
  try {
    await deleteTestProduct();
    await addMissingSubscriptions();
    const isCorrect = await verifyStructure();

    if (isCorrect) {
      console.log('🎉 Product structure fix complete!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some issues remain - check output above\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

run();
