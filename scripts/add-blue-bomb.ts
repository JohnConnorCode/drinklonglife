/**
 * Add Blue Bomb Product to Supabase
 *
 * Run with: npx tsx scripts/add-blue-bomb.ts
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

async function addBlueBomb() {
  console.log('🔵 Adding Blue Bomb to Supabase...\n');

  try {
    // Check if Blue Bomb already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'blue-bomb')
      .single();

    if (existing) {
      console.log('⚠️  Blue Bomb already exists. Updating instead...');

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: 'Blue Bomb',
          tagline: 'Stabilize. Center. Stay steady.',
          description: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Our balancing blend is designed to support blood sugar stability and metabolic health. Made with nopal cactus, spinach, cucumber, aloe vera, and asparagus for a powerful combination that helps you stay centered throughout the day.' }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Perfect for those looking to maintain steady energy levels without the spikes and crashes. A natural way to support your body\'s balance.' }
                ]
              }
            ]
          },
          function_list: ['Blood Sugar Balance', 'Metabolic Support', 'Hydration'],
          best_for: ['Blood sugar stability', 'Metabolic health', 'Sustained energy'],
          label_color: 'blue',
          image_url: '/slider-desktop-2.png',
          image_alt: 'Blue Bomb - Balance Blend',
          is_featured: true,
          is_active: true,
          display_order: 4,
          published_at: new Date().toISOString(),
          meta_title: 'Blue Bomb - Blood Sugar Balance Juice | Long Life',
          meta_description: 'Natural blood sugar support with nopal cactus, aloe vera, and greens. Stay balanced and centered.',
        })
        .eq('slug', 'blue-bomb');

      if (updateError) {
        console.error('Error updating Blue Bomb:', updateError);
        throw updateError;
      }

      console.log('✅ Blue Bomb updated successfully!');
      return;
    }

    // Insert new Blue Bomb product
    const blueBombData = {
      name: 'Blue Bomb',
      slug: 'blue-bomb',
      tagline: 'Stabilize. Center. Stay steady.',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Our balancing blend is designed to support blood sugar stability and metabolic health. Made with nopal cactus, spinach, cucumber, aloe vera, and asparagus for a powerful combination that helps you stay centered throughout the day.' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Perfect for those looking to maintain steady energy levels without the spikes and crashes. A natural way to support your body\'s balance.' }
            ]
          }
        ]
      },
      function_list: ['Blood Sugar Balance', 'Metabolic Support', 'Hydration'],
      best_for: ['Blood sugar stability', 'Metabolic health', 'Sustained energy'],
      label_color: 'blue',
      image_url: '/slider-desktop-2.png',
      image_alt: 'Blue Bomb - Balance Blend',
      is_featured: true,
      is_active: true,
      display_order: 4,
      published_at: new Date().toISOString(),
      meta_title: 'Blue Bomb - Blood Sugar Balance Juice | Long Life',
      meta_description: 'Natural blood sugar support with nopal cactus, aloe vera, and greens. Stay balanced and centered.',
    };

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(blueBombData)
      .select()
      .single();

    if (productError) {
      console.error('Error inserting Blue Bomb:', productError);
      throw productError;
    }

    console.log('✓ Blue Bomb product created\n');

    // Add ingredients if they exist
    console.log('🔗 Looking for ingredients to link...');

    const ingredientNames = ['Spinach', 'Cucumber', 'Celery', 'Apple', 'Lemon'];
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id, name')
      .in('name', ingredientNames);

    if (ingredients && ingredients.length > 0) {
      const ingredientLinks = ingredients.map((ing: any, idx: number) => ({
        product_id: product.id,
        ingredient_id: ing.id,
        display_order: idx + 1,
      }));

      const { error: linkError } = await supabase
        .from('product_ingredients')
        .insert(ingredientLinks);

      if (linkError) {
        console.warn('Warning: Could not link ingredients:', linkError.message);
      } else {
        console.log(`✓ Linked ${ingredientLinks.length} ingredients\n`);
      }
    } else {
      console.log('⚠️  No matching ingredients found to link\n');
    }

    console.log('✅ Blue Bomb added successfully!');
    console.log('\n⚠️  Note: You may need to:');
    console.log('   1. Create a Stripe product for Blue Bomb in Stripe Dashboard');
    console.log('   2. Add product variants with Stripe price IDs via admin panel');
    console.log('   3. Upload a proper product image and update image_url\n');

  } catch (error) {
    console.error('❌ Failed to add Blue Bomb:', error);
    process.exit(1);
  }
}

addBlueBomb();
