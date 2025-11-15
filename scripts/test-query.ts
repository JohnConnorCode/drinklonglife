import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Using anon key like production
);

async function testQuery() {
  console.log('Testing getProductBySlug query for "red-bomb"...\n');
  
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      ingredients:product_ingredients(
        id,
        display_order,
        ingredient:ingredients(
          id,
          name,
          type,
          seasonality,
          function,
          sourcing_story,
          nutritional_profile,
          image_url,
          image_alt
        )
      ),
      variants:product_variants(
        id,
        size_key,
        label,
        stripe_price_id,
        is_default,
        display_order,
        is_active,
        price_usd
      )
    `
    )
    .eq('slug', 'red-bomb')
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .single();

  if (error) {
    console.error('❌ ERROR:', error);
    console.error('\nError details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ SUCCESS');
    console.log('\nProduct:', data?.name);
    console.log('Ingredients count:', data?.ingredients?.length);
    console.log('Variants count:', data?.variants?.length);
    console.log('\nFull data:', JSON.stringify(data, null, 2));
  }
}

testQuery();
