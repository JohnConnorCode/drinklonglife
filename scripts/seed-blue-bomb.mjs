#!/usr/bin/env node

/**
 * Blue Bomb Product Seed Script
 *
 * Creates the Blue Bomb (Balance) product with ingredients, variants, and Stripe integration.
 * Run with: node scripts/seed-blue-bomb.mjs
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' });

// Blue Bomb product data
const blueBombProduct = {
  name: 'Blue Bomb',
  slug: 'blue-bomb',
  tagline: 'Balance your day. Stabilize your energy.',
  description: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Blue Bomb is your daily ally for sustained, calm energy. This diabetic-friendly blend combines nopal cactus, spinach, cucumber, aloe vera, and watercress to help stabilize blood sugar, support metabolism, and keep you grounded through the afternoon and evening.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Perfect for anyone managing energy fluctuations or seeking metabolic support without stimulants. Blue Bomb delivers steady, balanced wellness—no crash, no compromise.',
          },
        ],
      },
    ],
  },
  function_list: ['Blood Sugar Support', 'Metabolic Health', 'Steady Energy', 'Hydration'],
  best_for: ['Midday balance', 'Early evening', 'Diabetic-friendly', 'Metabolic support'],
  label_color: 'blue',
  image_url: '/blue-bomb.png',
  image_alt: 'Blue Bomb cold-pressed juice blend',
  is_featured: true,
  is_active: true,
  display_order: 4,
  meta_title: 'Blue Bomb - Balance & Blood Sugar Support | Long Life',
  meta_description: 'Diabetic-friendly cold-pressed juice with nopal, spinach, cucumber, aloe, and watercress. Stabilize blood sugar and maintain steady energy throughout your day.',
};

// Blue Bomb ingredients
const blueBombIngredients = [
  {
    name: 'Nopal (Prickly Pear Cactus)',
    type: 'green',
    seasonality: 'Year-round',
    function: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Traditional Mexican superfood known for blood sugar regulation and metabolic support. Rich in fiber, antioxidants, and minerals.' },
          ],
        },
      ],
    },
    notes: 'Wild-harvested nopal paddles',
  },
  {
    name: 'Spinach',
    type: 'green',
    seasonality: 'Year-round',
    function: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Nutrient-dense superfood high in iron, vitamins A, C, K, and folate. Supports energy production and cellular health.' },
          ],
        },
      ],
    },
    notes: 'Fresh organic baby spinach',
  },
  {
    name: 'Cucumber',
    type: 'green',
    seasonality: 'Year-round',
    function: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Extremely hydrating with 96% water content. Supports skin health, reduces inflammation, and aids in detoxification.' },
          ],
        },
      ],
    },
    notes: 'Organic English cucumbers',
  },
  {
    name: 'Aloe Vera',
    type: 'green',
    seasonality: 'Year-round',
    function: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Supports digestive health, blood sugar regulation, and skin health. Contains over 75 active compounds including vitamins and minerals.' },
          ],
        },
      ],
    },
    notes: 'Food-grade organic aloe vera gel',
  },
  {
    name: 'Watercress',
    type: 'green',
    seasonality: 'Year-round',
    function: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'One of the most nutrient-dense foods. High in vitamins K, A, C, and antioxidants. Supports bone health and immune function.' },
          ],
        },
      ],
    },
    notes: 'Fresh organic watercress',
  },
];

// Product variants (same pricing structure as other blends)
const variants = [
  { size_key: '16oz', label: '16 oz Bottle', price_usd: 12.99, display_order: 1, is_default: true },
  { size_key: '32oz', label: '32 oz Bottle', price_usd: 22.99, display_order: 2, is_default: false },
  { size_key: '64oz', label: '64 oz Jug', price_usd: 39.99, display_order: 3, is_default: false },
  { size_key: '128oz', label: '1 Gallon', price_usd: 69.99, display_order: 4, is_default: false },
];

async function seedBlueBomb() {
  console.log('🔵 Seeding Blue Bomb product...\n');

  try {
    // Step 1: Update label_color constraint to include 'blue'
    console.log('📝 Updating label_color constraint...');
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_label_color_check;
        ALTER TABLE products ADD CONSTRAINT products_label_color_check
          CHECK (label_color IN ('yellow', 'red', 'green', 'blue'));
      `,
    });

    // If RPC doesn't exist, try direct update (constraint may already include blue)
    if (constraintError) {
      console.log('   Note: Could not update constraint via RPC, will proceed anyway');
    } else {
      console.log('   ✅ Label color constraint updated\n');
    }

    // Step 2: Check if Blue Bomb already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'blue-bomb')
      .single();

    if (existingProduct) {
      console.log('⚠️  Blue Bomb already exists. Updating instead of creating...\n');

      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...blueBombProduct,
          published_at: new Date().toISOString(),
        })
        .eq('slug', 'blue-bomb');

      if (updateError) throw updateError;
      console.log('   ✅ Product updated\n');

      return existingProduct.id;
    }

    // Step 3: Create ingredients (if they don't exist)
    console.log('🥬 Creating ingredients...');
    const ingredientIds = {};

    for (const ingredient of blueBombIngredients) {
      // Check if ingredient exists
      const { data: existing } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', ingredient.name)
        .single();

      if (existing) {
        ingredientIds[ingredient.name] = existing.id;
        console.log(`   ⏭️  ${ingredient.name} already exists`);
      } else {
        const { data: created, error } = await supabase
          .from('ingredients')
          .insert(ingredient)
          .select('id')
          .single();

        if (error) throw error;
        ingredientIds[ingredient.name] = created.id;
        console.log(`   ✅ Created ${ingredient.name}`);
      }
    }
    console.log('');

    // Step 4: Create the product
    console.log('📦 Creating Blue Bomb product...');
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...blueBombProduct,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (productError) throw productError;
    console.log(`   ✅ Product created: ${product.id}\n`);

    // Step 5: Link ingredients to product
    console.log('🔗 Linking ingredients to product...');
    const productIngredients = blueBombIngredients.map((ing, index) => ({
      product_id: product.id,
      ingredient_id: ingredientIds[ing.name],
      display_order: index + 1,
    }));

    const { error: linkError } = await supabase
      .from('product_ingredients')
      .insert(productIngredients);

    if (linkError) throw linkError;
    console.log(`   ✅ Linked ${productIngredients.length} ingredients\n`);

    // Step 6: Create Stripe product
    console.log('💳 Creating Stripe product...');
    const stripeProduct = await stripe.products.create({
      name: blueBombProduct.name,
      description: blueBombProduct.tagline,
      images: blueBombProduct.image_url.startsWith('http')
        ? [blueBombProduct.image_url]
        : [`https://drinklonglife.com${blueBombProduct.image_url}`],
      metadata: {
        supabase_product_id: product.id,
        slug: blueBombProduct.slug,
      },
    });
    console.log(`   ✅ Stripe product: ${stripeProduct.id}\n`);

    // Update product with Stripe ID
    await supabase
      .from('products')
      .update({ stripe_product_id: stripeProduct.id })
      .eq('id', product.id);

    // Step 7: Create variants with Stripe prices
    console.log('💰 Creating variants and Stripe prices...');
    for (const variant of variants) {
      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(variant.price_usd * 100),
        currency: 'usd',
        metadata: {
          size_key: variant.size_key,
          label: variant.label,
        },
      });

      // Create variant in Supabase
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: product.id,
          size_key: variant.size_key,
          label: variant.label,
          price_usd: variant.price_usd,
          stripe_price_id: stripePrice.id,
          is_default: variant.is_default,
          display_order: variant.display_order,
          is_active: true,
          billing_type: 'one_time',
          sku: `BLUE-${variant.size_key.toUpperCase()}`,
        });

      if (variantError) throw variantError;
      console.log(`   ✅ ${variant.label}: $${variant.price_usd} (${stripePrice.id})`);
    }

    console.log('\n✨ Blue Bomb seeding complete!');
    console.log(`\n🔗 Product URL: https://drinklonglife.com/blends/blue-bomb`);

    return product.id;
  } catch (error) {
    console.error('\n❌ Error seeding Blue Bomb:', error);
    process.exit(1);
  }
}

seedBlueBomb();
