import { client as sanityClient } from '../lib/sanity.client';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// =====================================================
// CONFIGURATION
// =====================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Required for admin operations
);

interface MigrationStats {
  farmsMigrated: number;
  ingredientsMigrated: number;
  productsMigrated: number;
  variantsMigrated: number;
  imagesSaved: number;
  errors: string[];
}

const stats: MigrationStats = {
  farmsMigrated: 0,
  ingredientsMigrated: 0,
  productsMigrated: 0,
  variantsMigrated: 0,
  imagesSaved: 0,
  errors: [],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Convert Sanity Portable Text to Tiptap JSON format
 */
function convertPortableTextToTiptap(portableText: any): object | null {
  if (!portableText || !Array.isArray(portableText)) return null;

  const content = portableText
    .map((block: any) => {
      if (block._type === 'block') {
        const marks: any[] = [];

        // Process inline content
        const inlineContent = block.children?.map((child: any) => {
          const childMarks = child.marks?.map((mark: string) => {
            // Map Sanity marks to Tiptap marks
            if (mark === 'strong') return { type: 'bold' };
            if (mark === 'em') return { type: 'italic' };
            if (mark === 'underline') return { type: 'underline' };
            if (mark === 'code') return { type: 'code' };
            return { type: mark };
          }) || [];

          return {
            type: 'text',
            text: child.text || '',
            marks: childMarks,
          };
        }) || [];

        // Map block styles to Tiptap node types
        let nodeType = 'paragraph';
        if (block.style === 'h1') nodeType = 'heading';
        if (block.style === 'h2') nodeType = 'heading';
        if (block.style === 'h3') nodeType = 'heading';
        if (block.style === 'h4') nodeType = 'heading';

        const node: any = {
          type: nodeType,
          content: inlineContent.length > 0 ? inlineContent : [{ type: 'text', text: '' }],
        };

        // Add heading level if applicable
        if (nodeType === 'heading') {
          node.attrs = {
            level: parseInt(block.style.replace('h', '')) || 2,
          };
        }

        return node;
      }

      return null;
    })
    .filter(Boolean);

  return content.length > 0 ? { type: 'doc', content } : null;
}

/**
 * Save image URL to local file for reference
 * (Actual image upload to Supabase Storage would be done separately)
 */
async function saveImageReference(imageUrl: string, filename: string): Promise<string> {
  // For now, we'll keep the Sanity CDN URLs
  // In production, you'd download and re-upload to Supabase Storage
  return imageUrl;
}

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function migrateFarms(): Promise<Map<string, string>> {
  console.log('\n📍 Migrating farms...');

  const farms = await sanityClient.fetch(`
    *[_type == "farm"] {
      _id,
      name,
      location,
      website,
      contactEmail,
      description
    }
  `);

  const farmIdMap = new Map<string, string>(); // Sanity ID → Supabase ID

  for (const farm of farms) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert({
          name: farm.name,
          location: farm.location,
          website: farm.website,
          contact_email: farm.contactEmail,
          description: farm.description,
        })
        .select('id')
        .single();

      if (error) throw error;

      farmIdMap.set(farm._id, data.id);
      stats.farmsMigrated++;
      console.log(`  ✅ ${farm.name}`);
    } catch (err: any) {
      stats.errors.push(`Farm ${farm.name}: ${err.message}`);
      console.error(`  ❌ ${farm.name}: ${err.message}`);
    }
  }

  return farmIdMap;
}

async function migrateIngredients(
  farmIdMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('\n🥬 Migrating ingredients...');

  const ingredients = await sanityClient.fetch(`
    *[_type == "ingredient"] {
      _id,
      name,
      type,
      seasonality,
      "function": function,
      sourcingStory,
      nutritionalProfile,
      notes,
      "image": image.asset->url,
      "imageAlt": image.alt,
      "farms": farms[]->_id
    }
  `);

  const ingredientIdMap = new Map<string, string>();

  for (const ingredient of ingredients) {
    try {
      // Save image reference
      let imageUrl = null;
      if (ingredient.image) {
        imageUrl = await saveImageReference(
          ingredient.image,
          `ingredient-${ingredient._id}`
        );
        stats.imagesSaved++;
      }

      // Insert ingredient
      const { data: ingredientData, error: ingredientError } = await supabase
        .from('ingredients')
        .insert({
          name: ingredient.name,
          type: ingredient.type,
          seasonality: ingredient.seasonality,
          function: convertPortableTextToTiptap(ingredient.function),
          sourcing_story: convertPortableTextToTiptap(ingredient.sourcingStory),
          nutritional_profile: ingredient.nutritionalProfile,
          notes: ingredient.notes,
          image_url: imageUrl,
          image_alt: ingredient.imageAlt,
        })
        .select('id')
        .single();

      if (ingredientError) throw ingredientError;

      ingredientIdMap.set(ingredient._id, ingredientData.id);
      stats.ingredientsMigrated++;

      // Link to farms
      if (ingredient.farms && ingredient.farms.length > 0) {
        for (const farmSanityId of ingredient.farms) {
          const farmSupabaseId = farmIdMap.get(farmSanityId);
          if (!farmSupabaseId) continue;

          await supabase.from('ingredient_farms').insert({
            ingredient_id: ingredientData.id,
            farm_id: farmSupabaseId,
          });
        }
      }

      console.log(`  ✅ ${ingredient.name}`);
    } catch (err: any) {
      stats.errors.push(`Ingredient ${ingredient.name}: ${err.message}`);
      console.error(`  ❌ ${ingredient.name}: ${err.message}`);
    }
  }

  return ingredientIdMap;
}

async function migrateProducts(ingredientIdMap: Map<string, string>): Promise<void> {
  console.log('\n🥤 Migrating products (blends)...');

  const blends = await sanityClient.fetch(`
    *[_type == "blend"] {
      _id,
      name,
      "slug": slug.current,
      tagline,
      functionList,
      "ingredients": ingredients[]->_id,
      description,
      story,
      detailedFunction,
      howToUse,
      bestFor,
      labelColor,
      "image": image.asset->url,
      "imageAlt": image.alt,
      "stripeProductId": stripeProduct->stripeProductId,
      "variants": stripeProduct->variants[] {
        sizeKey,
        label,
        stripePriceId,
        isDefault,
        uiOrder
      } | order(uiOrder asc),
      isFeatured,
      order,
      "metaTitle": seo.metaTitle,
      "metaDescription": seo.metaDescription
    } | order(order asc)
  `);

  for (const blend of blends) {
    try {
      // Save image reference
      let imageUrl = null;
      if (blend.image) {
        imageUrl = await saveImageReference(blend.image, `product-${blend.slug}`);
        stats.imagesSaved++;
      }

      // Insert product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: blend.name,
          slug: blend.slug,
          tagline: blend.tagline,
          description: convertPortableTextToTiptap(blend.description),
          story: convertPortableTextToTiptap(blend.story),
          detailed_function: convertPortableTextToTiptap(blend.detailedFunction),
          how_to_use: convertPortableTextToTiptap(blend.howToUse),
          function_list: blend.functionList,
          best_for: blend.bestFor,
          label_color: blend.labelColor,
          image_url: imageUrl,
          image_alt: blend.imageAlt,
          stripe_product_id: blend.stripeProductId,
          is_featured: blend.isFeatured,
          display_order: blend.order,
          meta_title: blend.metaTitle,
          meta_description: blend.metaDescription,
          published_at: new Date().toISOString(), // Mark all as published
        })
        .select('id')
        .single();

      if (productError) throw productError;

      stats.productsMigrated++;

      // Link ingredients
      if (blend.ingredients && blend.ingredients.length > 0) {
        for (let i = 0; i < blend.ingredients.length; i++) {
          const ingredientSanityId = blend.ingredients[i];
          const ingredientSupabaseId = ingredientIdMap.get(ingredientSanityId);
          if (!ingredientSupabaseId) continue;

          await supabase.from('product_ingredients').insert({
            product_id: productData.id,
            ingredient_id: ingredientSupabaseId,
            display_order: i + 1,
          });
        }
      }

      // Insert variants
      if (blend.variants && blend.variants.length > 0) {
        for (const variant of blend.variants) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert({
              product_id: productData.id,
              size_key: variant.sizeKey,
              label: variant.label,
              stripe_price_id: variant.stripePriceId,
              is_default: variant.isDefault,
              display_order: variant.uiOrder,
            });

          if (variantError) {
            stats.errors.push(`Variant ${variant.label} for ${blend.name}: ${variantError.message}`);
          } else {
            stats.variantsMigrated++;
          }
        }
      }

      console.log(`  ✅ ${blend.name} (${blend.variants?.length || 0} variants)`);
    } catch (err: any) {
      stats.errors.push(`Product ${blend.name}: ${err.message}`);
      console.error(`  ❌ ${blend.name}: ${err.message}`);
    }
  }
}

// =====================================================
// MAIN MIGRATION
// =====================================================

async function main() {
  console.log('🚀 Starting Sanity → Supabase migration...');
  console.log('='.repeat(60));

  try {
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    console.log('✅ Environment variables verified');

    // Create storage bucket for product images (if it doesn't exist)
    const { error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
    });
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }
    console.log('✅ Storage bucket ready');

    // Step 1: Migrate farms
    const farmIdMap = await migrateFarms();

    // Step 2: Migrate ingredients
    const ingredientIdMap = await migrateIngredients(farmIdMap);

    // Step 3: Migrate products
    await migrateProducts(ingredientIdMap);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Farms migrated:       ${stats.farmsMigrated}`);
    console.log(`Ingredients migrated: ${stats.ingredientsMigrated}`);
    console.log(`Products migrated:    ${stats.productsMigrated}`);
    console.log(`Variants migrated:    ${stats.variantsMigrated}`);
    console.log(`Images saved:         ${stats.imagesSaved}`);
    console.log(`Errors:               ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }

    // Save full stats to file
    const statsPath = path.join(process.cwd(), 'migration-stats.json');
    await writeFile(statsPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 Full stats saved to: ${statsPath}`);

    console.log('\n✅ Migration complete!');
  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run migration
main();
