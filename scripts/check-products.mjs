#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qjgenpwbaquqrvyrfsdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5NjQ4MiwiZXhwIjoyMDc4NTcyNDgyfQ.NnjPDj-24lOqa1xXyGOLwDowko3cpSUkBsFPhYCt9iM'
);

console.log('🔍 Checking products in database...\n');

// Get all products with variants
const { data: products, error: productsError } = await supabase
  .from('products')
  .select('*');

if (productsError) {
  console.error('❌ Error fetching products:', productsError);
} else {
  console.log(`✅ Found ${products.length} products:`);
  products.forEach(p => {
    console.log(`   - ${p.name} (id: ${p.id}, slug: ${p.slug})`);
    console.log(`     stripe_product_id: ${p.stripe_product_id || '(none)'}`);
    console.log(`     is_active: ${p.is_active}`);
  });
}

console.log('\n🔍 Checking product variants...\n');

// Get all variants
const { data: variants, error: variantsError } = await supabase
  .from('product_variants')
  .select('*');

if (variantsError) {
  console.error('❌ Error fetching variants:', variantsError);
} else {
  console.log(`✅ Found ${variants.length} variants:`);
  variants.forEach(v => {
    console.log(`   - Product ${v.product_id}: ${v.size} @ $${v.price}`);
    console.log(`     stripe_price_id: ${v.stripe_price_id || '(none)'}`);
    console.log(`     is_active: ${v.is_active}`);
  });
}

console.log('\n🔍 Checking what blends page query would return...\n');

// Simulate the blends page query
const { data: blendsData, error: blendsError } = await supabase
  .from('products')
  .select(`
    *,
    variants:product_variants(*)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false });

if (blendsError) {
  console.error('❌ Error with blends query:', blendsError);
} else {
  console.log(`✅ Blends page would show ${blendsData.length} products:`);
  blendsData.forEach(p => {
    console.log(`   - ${p.name}: ${p.variants?.length || 0} variants`);
  });
}
