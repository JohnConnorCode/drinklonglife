import { client as sanityClient } from './lib/sanity.client';

interface Variant {
  sizeKey: string;
  label: string;
  stripePriceId: string;
  isDefault: boolean;
  uiOrder: number;
}

interface BlendData {
  _id: string;
  name: string;
  slug: string;
  stripeProductId: string | null;
  variants: Variant[] | null;
}

async function queryBombProducts() {
  console.log('🔍 Querying Sanity for Bomb products...\n');
  console.log('='.repeat(80));

  try {
    // Query for the three Bomb products
    const blends: BlendData[] = await sanityClient.fetch(`
      *[_type == "blend" && name match "*Bomb*"] {
        _id,
        name,
        "slug": slug.current,
        "stripeProductId": stripeProduct->stripeProductId,
        "variants": stripeProduct->variants[] {
          sizeKey,
          label,
          stripePriceId,
          isDefault,
          uiOrder
        } | order(uiOrder asc)
      } | order(name asc)
    `);

    console.log(`Found ${blends.length} Bomb products:\n`);

    for (const blend of blends) {
      console.log('━'.repeat(80));
      console.log(`📦 PRODUCT: ${blend.name}`);
      console.log('━'.repeat(80));
      console.log(`   Sanity ID:         ${blend._id}`);
      console.log(`   Slug:              ${blend.slug}`);
      console.log(`   Stripe Product ID: ${blend.stripeProductId || 'NOT SET'}`);
      console.log('');

      if (!blend.variants || blend.variants.length === 0) {
        console.log('   ⚠️  NO VARIANTS FOUND');
      } else {
        console.log(`   🏷️  VARIANTS (${blend.variants.length} total):`);
        console.log('');

        blend.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.label}`);
          console.log(`      Size Key:        ${variant.sizeKey}`);
          console.log(`      Stripe Price ID: ${variant.stripePriceId}`);
          console.log(`      Is Default:      ${variant.isDefault ? 'YES' : 'NO'}`);
          console.log(`      UI Order:        ${variant.uiOrder}`);
          console.log('');
        });
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📊 SUMMARY\n');

    // Create a summary table
    blends.forEach(blend => {
      console.log(`${blend.name}:`);
      console.log(`  Stripe Product ID: ${blend.stripeProductId || 'NOT SET'}`);
      console.log(`  Variants: ${blend.variants?.length || 0}`);

      if (blend.variants && blend.variants.length > 0) {
        blend.variants.forEach(v => {
          console.log(`    - ${v.label}: ${v.stripePriceId}`);
        });
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n✅ Query complete!\n');

    // Also return the raw data for further inspection
    console.log('📋 RAW JSON DATA:\n');
    console.log(JSON.stringify(blends, null, 2));

  } catch (error: any) {
    console.error('❌ Error querying Sanity:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

queryBombProducts();
