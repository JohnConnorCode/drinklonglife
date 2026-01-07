/**
 * Supabase Product Seed Script
 *
 * Run with: npx tsx scripts/seed-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedProducts() {
  console.log('🌱 Seeding Supabase products...\n');

  try {
    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (existingProducts && existingProducts.length > 0) {
      console.log('⚠️  Products already exist. Skipping seed to avoid duplicates.');
      console.log('   To re-seed, delete products manually from the database first.');
      return;
    }

    // Seed Ingredients
    console.log('📦 Seeding ingredients...');
    const ingredientsData = [
      {
        name: 'Turmeric',
        type: 'root',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Powerful anti-inflammatory properties, supports joint health and immune function' }] }] },
        notes: 'Organic, locally sourced from regenerative farms'
      },
      {
        name: 'Ginger',
        type: 'root',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Aids digestion, reduces nausea, and has anti-inflammatory properties' }] }] },
        notes: 'Fresh, organic ginger root'
      },
      {
        name: 'Lemon',
        type: 'fruit',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich in Vitamin C, supports immune health and aids detoxification' }] }] },
        notes: 'Organic Meyer lemons'
      },
      {
        name: 'Orange',
        type: 'fruit',
        seasonality: 'Winter',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'High in Vitamin C and antioxidants, boosts immune system' }] }] },
        notes: 'Seasonal Valencia oranges'
      },
      {
        name: 'Beet',
        type: 'root',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Improves blood flow, supports cardiovascular health, natural energy boost' }] }] },
        notes: 'Organic red beets'
      },
      {
        name: 'Carrot',
        type: 'root',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich in beta-carotene, supports eye health and immune function' }] }] },
        notes: 'Organic, rainbow carrots when available'
      },
      {
        name: 'Apple',
        type: 'fruit',
        seasonality: 'Fall',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Provides natural sweetness and fiber, rich in antioxidants' }] }] },
        notes: 'Organic Honeycrisp and Fuji apples'
      },
      {
        name: 'Celery',
        type: 'green',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hydrating and alkalizing, supports healthy digestion' }] }] },
        notes: 'Organic celery stalks'
      },
      {
        name: 'Spinach',
        type: 'green',
        seasonality: 'Spring/Fall',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nutrient-dense superfood, high in iron and vitamins' }] }] },
        notes: 'Fresh baby spinach'
      },
      {
        name: 'Cucumber',
        type: 'green',
        seasonality: 'Summer',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Extremely hydrating, supports skin health and reduces inflammation' }] }] },
        notes: 'Organic English cucumbers'
      },
      {
        name: 'Black Pepper',
        type: 'herb',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Enhances nutrient absorption, especially curcumin from turmeric' }] }] },
        notes: 'Fresh ground black peppercorns'
      },
      {
        name: 'Cayenne',
        type: 'herb',
        seasonality: 'Year-round',
        function: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Boosts metabolism, improves circulation, adds spicy kick' }] }] },
        notes: 'Organic cayenne pepper'
      }
    ];

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredientsData)
      .select();

    if (ingredientsError) {
      console.error('Error inserting ingredients:', ingredientsError);
      throw ingredientsError;
    }

    console.log(`✓ Inserted ${ingredients?.length} ingredients\n`);

    // Create ingredient map for easy lookup
    const ingredientMap = new Map();
    ingredients?.forEach((ing: any) => {
      ingredientMap.set(ing.name, ing.id);
    });

    // Seed Products
    console.log('📦 Seeding products...');
    const productsData = [
      {
        name: 'Yellow Bomb',
        slug: 'yellow-bomb',
        tagline: 'Golden glow from the inside out',
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Our signature turmeric blend is a powerful anti-inflammatory shot designed to support your immune system and promote overall wellness. Made with fresh turmeric, ginger, and a hint of black pepper to maximize absorption.' }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Perfect for daily wellness routines, post-workout recovery, or whenever you need a natural energy boost without the caffeine crash.' }
              ]
            }
          ]
        },
        function_list: ['Anti-inflammatory', 'Immune Support', 'Energy'],
        best_for: ['Morning routine', 'Post-workout', 'Daily wellness'],
        label_color: 'yellow',
        is_featured: true,
        is_active: true,
        display_order: 1,
        published_at: new Date().toISOString(),
        meta_title: 'Yellow Bomb - Turmeric Wellness Shot | Long Life',
        meta_description: 'Powerful anti-inflammatory turmeric shot with ginger and black pepper. Support your immune system naturally.',
      },
      {
        name: 'Red Bomb',
        slug: 'red-bomb',
        tagline: 'Beet the fatigue, boost your flow',
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Energize your day with our vibrant beet-based blend. Packed with nitrates that improve blood flow and oxygen delivery to your muscles, this juice is perfect for athletes and anyone looking for sustained natural energy.' }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'The sweet earthiness of beets combines with citrus and ginger for a flavor that\'s as delicious as it is nutritious.' }
              ]
            }
          ]
        },
        function_list: ['Energy', 'Circulation', 'Athletic Performance'],
        best_for: ['Pre-workout', 'Afternoon energy', 'Athletic training'],
        label_color: 'red',
        is_featured: true,
        is_active: true,
        display_order: 2,
        published_at: new Date().toISOString(),
        meta_title: 'Red Bomb - Beet Energy Juice | Long Life',
        meta_description: 'Natural beet juice for sustained energy and improved circulation. Perfect pre-workout fuel.',
      },
      {
        name: 'Green Bomb',
        slug: 'green-bomb',
        tagline: 'Deep green nutrition in every drop',
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Our most nutrient-dense blend combines celery, cucumber, spinach, and lemon for ultimate hydration and alkalizing benefits. This green powerhouse supports detoxification and provides a concentrated dose of vitamins and minerals.' }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Refreshing and light, yet incredibly nourishing - the perfect way to flood your body with plant-based nutrition.' }
              ]
            }
          ]
        },
        function_list: ['Detox', 'Hydration', 'Alkalizing'],
        best_for: ['Morning cleanse', 'Hydration boost', 'Nutrient infusion'],
        label_color: 'green',
        is_featured: true,
        is_active: true,
        display_order: 3,
        published_at: new Date().toISOString(),
        meta_title: 'Green Bomb - Detox Green Juice | Long Life',
        meta_description: 'Alkalizing green juice with celery, cucumber, and spinach. Ultimate hydration and detox support.',
      },
    ];

    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(productsData)
      .select();

    if (productsError) {
      console.error('Error inserting products:', productsError);
      throw productsError;
    }

    console.log(`✓ Inserted ${products?.length} products\n`);

    // Link ingredients to products
    console.log('🔗 Linking ingredients to products...');
    const productIngredientsData = [
      // Yellow Bomb ingredients
      { product_id: products![0].id, ingredient_id: ingredientMap.get('Turmeric'), display_order: 1 },
      { product_id: products![0].id, ingredient_id: ingredientMap.get('Ginger'), display_order: 2 },
      { product_id: products![0].id, ingredient_id: ingredientMap.get('Lemon'), display_order: 3 },
      { product_id: products![0].id, ingredient_id: ingredientMap.get('Black Pepper'), display_order: 4 },
      { product_id: products![0].id, ingredient_id: ingredientMap.get('Cayenne'), display_order: 5 },

      // Red Bomb ingredients
      { product_id: products![1].id, ingredient_id: ingredientMap.get('Beet'), display_order: 1 },
      { product_id: products![1].id, ingredient_id: ingredientMap.get('Carrot'), display_order: 2 },
      { product_id: products![1].id, ingredient_id: ingredientMap.get('Apple'), display_order: 3 },
      { product_id: products![1].id, ingredient_id: ingredientMap.get('Ginger'), display_order: 4 },
      { product_id: products![1].id, ingredient_id: ingredientMap.get('Orange'), display_order: 5 },

      // Green Bomb ingredients
      { product_id: products![2].id, ingredient_id: ingredientMap.get('Celery'), display_order: 1 },
      { product_id: products![2].id, ingredient_id: ingredientMap.get('Cucumber'), display_order: 2 },
      { product_id: products![2].id, ingredient_id: ingredientMap.get('Spinach'), display_order: 3 },
      { product_id: products![2].id, ingredient_id: ingredientMap.get('Lemon'), display_order: 4 },
      { product_id: products![2].id, ingredient_id: ingredientMap.get('Apple'), display_order: 5 },
    ];

    const { error: linkError } = await supabase
      .from('product_ingredients')
      .insert(productIngredientsData);

    if (linkError) {
      console.error('Error linking ingredients:', linkError);
      throw linkError;
    }

    console.log(`✓ Linked ${productIngredientsData.length} product-ingredient relationships\n`);

    console.log('✅ Seed completed successfully!');
    console.log('\n⚠️  Note: You still need to:');
    console.log('   1. Create Stripe products manually in Stripe Dashboard');
    console.log('   2. Add product variants with Stripe price IDs via admin panel');
    console.log('   3. Upload product images to Supabase Storage and update image_url fields\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedProducts();
