import { client as sanityClient } from './lib/sanity.client';

async function queryStripeProducts() {
  console.log('🔍 Querying ALL Stripe Products in Sanity...\n');
  console.log('='.repeat(80));

  try {
    // Query for all stripeProduct documents
    const stripeProducts = await sanityClient.fetch(`
      *[_type == "stripeProduct"] {
        _id,
        stripeProductId,
        variants[] {
          sizeKey,
          label,
          stripePriceId,
          isDefault,
          uiOrder
        } | order(uiOrder asc)
      }
    `);

    console.log(`Found ${stripeProducts.length} Stripe Product documents:\n`);

    if (stripeProducts.length === 0) {
      console.log('⚠️  NO STRIPE PRODUCTS FOUND IN SANITY!\n');
      console.log('This means the blend documents have no stripeProduct references.');
    } else {
      stripeProducts.forEach((product: any, index: number) => {
        console.log('━'.repeat(80));
        console.log(`${index + 1}. STRIPE PRODUCT`);
        console.log('━'.repeat(80));
        console.log(`   Sanity ID:         ${product._id}`);
        console.log(`   Stripe Product ID: ${product.stripeProductId || 'NOT SET'}`);
        console.log('');

        if (!product.variants || product.variants.length === 0) {
          console.log('   ⚠️  NO VARIANTS');
        } else {
          console.log(`   🏷️  VARIANTS (${product.variants.length} total):`);
          console.log('');

          product.variants.forEach((variant: any, vIndex: number) => {
            console.log(`   ${vIndex + 1}. ${variant.label}`);
            console.log(`      Size Key:        ${variant.sizeKey}`);
            console.log(`      Stripe Price ID: ${variant.stripePriceId}`);
            console.log(`      Is Default:      ${variant.isDefault ? 'YES' : 'NO'}`);
            console.log(`      UI Order:        ${variant.uiOrder}`);
            console.log('');
          });
        }
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('\n📋 RAW JSON DATA:\n');
    console.log(JSON.stringify(stripeProducts, null, 2));

    // Now check which blends reference which stripeProducts
    console.log('\n\n');
    console.log('='.repeat(80));
    console.log('🔗 Checking Blend → StripeProduct References...\n');

    const blends = await sanityClient.fetch(`
      *[_type == "blend"] {
        _id,
        name,
        "slug": slug.current,
        "stripeProductRef": stripeProduct->_id,
        "stripeProductId": stripeProduct->stripeProductId
      }
    `);

    blends.forEach((blend: any) => {
      console.log(`${blend.name}:`);
      console.log(`  Sanity ID:             ${blend._id}`);
      console.log(`  StripeProduct Ref:     ${blend.stripeProductRef || 'NOT SET'}`);
      console.log(`  StripeProduct ID:      ${blend.stripeProductId || 'NOT SET'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n✅ Query complete!\n');

  } catch (error: any) {
    console.error('❌ Error querying Sanity:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

queryStripeProducts();
