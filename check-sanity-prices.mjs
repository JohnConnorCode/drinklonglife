import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'jrc9x3mn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skTSSQNTOHf9RiUVJ7gbhyILqfYOFD89nIxqigpmV875zLc9odZDACaZAmPh1W8YL0sJ4XaklECKzdBbNcqkwO6wL9Oh45FYHsHguJveLAFfyeKsct4tHQ95rXIQyRwnuBydZnX8LLijgoPLFZ33u23QvA7Ezly6OkKJP9mv5ujhaWkweRvT',
  useCdn: false,
});

console.log('🔍 Checking Sanity for blend data and price IDs...\n');

// Check for blends with old inline sizes system
const blendsWithSizes = await client.fetch(`
  *[_type == "blend" && defined(sizes)]{
    _id,
    name,
    slug,
    sizes[]{
      _key,
      size,
      stripePriceId,
      stripeSubscriptionPriceId
    }
  }
`);

console.log('📦 Blends with inline sizes:', blendsWithSizes.length);
blendsWithSizes.forEach(blend => {
  console.log(`\n  ${blend.name} (${blend.slug?.current})`);
  console.log(`  ID: ${blend._id}`);
  blend.sizes?.forEach(size => {
    console.log(`    - ${size.size}:`);
    console.log(`      One-time price ID: ${size.stripePriceId || 'MISSING'}`);
    console.log(`      Subscription price ID: ${size.stripeSubscriptionPriceId || 'MISSING'}`);
  });
});

// Check for new stripeProduct system
const stripeProducts = await client.fetch(`
  *[_type == "stripeProduct" && isActive == true]{
    _id,
    title,
    stripeProductId,
    tierKey,
    variants[]{
      sizeKey,
      label,
      stripePriceId
    }
  }
`);

console.log('\n\n💳 Stripe Products:', stripeProducts.length);
stripeProducts.forEach(product => {
  console.log(`\n  ${product.title}`);
  console.log(`  Stripe Product ID: ${product.stripeProductId}`);
  console.log(`  Tier: ${product.tierKey || 'N/A'}`);
  product.variants?.forEach(variant => {
    console.log(`    - ${variant.label || variant.sizeKey}:`);
    console.log(`      Price ID: ${variant.stripePriceId || 'MISSING'}`);
  });
});

// Summary
console.log('\n\n📊 SUMMARY:');
console.log(`  Blends with sizes: ${blendsWithSizes.length}`);
console.log(`  Stripe products: ${stripeProducts.length}`);

const totalMissingPrices = blendsWithSizes.reduce((count, blend) => {
  return count + (blend.sizes?.filter(s => !s.stripePriceId && !s.stripeSubscriptionPriceId).length || 0);
}, 0);

console.log(`  Missing price IDs: ${totalMissingPrices}`);
