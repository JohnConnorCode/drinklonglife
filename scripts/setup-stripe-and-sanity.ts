/**
 * Complete Stripe and Sanity E-Commerce Setup Script
 *
 * This script:
 * 1. Creates Stripe test products and prices for all blends
 * 2. Creates stripeSettings singleton document in Sanity
 * 3. Creates stripeProduct documents in Sanity with Stripe IDs
 * 4. Creates essential coupon codes in Stripe and Sanity
 *
 * Run with: npx tsx scripts/setup-stripe-and-sanity.ts
 */

import Stripe from 'stripe';
import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Stripe (test mode)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2024-12-18.acacia',
});

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
});

// Blend configuration
const blends = [
  {
    name: 'Green Bomb',
    slug: 'green-bomb',
    description: 'Hydration, Gut balance, Mental clarity',
    tierKey: 'basic',
  },
  {
    name: 'Red Bomb',
    slug: 'red-bomb',
    description: 'Energy, Immunity, Performance',
    tierKey: 'basic',
  },
  {
    name: 'Yellow Bomb',
    slug: 'yellow-bomb',
    description: 'Detox, Vitality, Radiance',
    tierKey: 'basic',
  },
];

// Price configuration
const sizes = [
  { key: 'gallon', label: '1 Gallon', price: 4800, servings: '16' },
  { key: 'half_gallon', label: '½ Gallon', price: 2800, servings: '8' },
  { key: 'shot', label: '2 oz Shot', price: 600, servings: '1' },
];

interface StripeProductData {
  productId: string;
  prices: Array<{
    priceId: string;
    sizeKey: string;
    label: string;
    amount: number;
  }>;
}

async function createStripeProducts(): Promise<Map<string, StripeProductData>> {
  console.log('\n🚀 Creating Stripe Test Products...\n');

  const productMap = new Map<string, StripeProductData>();

  for (const blend of blends) {
    console.log(`📦 Creating product: ${blend.name}`);

    // Create Stripe product
    const product = await stripe.products.create({
      name: `${blend.name} - Cold-Pressed Juice`,
      description: blend.description,
      metadata: {
        tier_key: blend.tierKey,
        blend_key: blend.slug,
      },
    });

    console.log(`   ✓ Product created: ${product.id}`);

    const prices: StripeProductData['prices'] = [];

    // Create prices for each size
    for (const size of sizes) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: size.price,
        currency: 'usd',
        metadata: {
          size_key: size.key,
          size_label: size.label,
          servings: size.servings,
        },
      });

      console.log(`   ✓ Price created: ${price.id} (${size.label} - $${size.price / 100})`);

      prices.push({
        priceId: price.id,
        sizeKey: size.key,
        label: size.label,
        amount: size.price,
      });
    }

    productMap.set(blend.slug, {
      productId: product.id,
      prices,
    });

    console.log(`   ✅ ${blend.name} setup complete\n`);
  }

  return productMap;
}

async function createSanityDocuments(productMap: Map<string, StripeProductData>) {
  console.log('\n🎨 Creating Sanity Documents...\n');

  // 1. Create stripeSettings singleton
  console.log('📝 Creating stripeSettings singleton...');
  try {
    await sanityClient.createOrReplace({
      _id: 'stripeSettings',
      _type: 'stripeSettings',
      mode: 'test',
      lastModified: new Date().toISOString(),
      modifiedBy: 'setup-script',
    });
    console.log('   ✓ stripeSettings created (mode: test)\n');
  } catch (error) {
    console.error('   ✗ Failed to create stripeSettings:', error);
  }

  // 2. Create stripeProduct documents
  for (const blend of blends) {
    const productData = productMap.get(blend.slug)!;

    console.log(`📝 Creating stripeProduct document: ${blend.name}`);

    const variants = productData.prices.map((price, index) => ({
      _key: price.sizeKey,
      sizeKey: price.sizeKey,
      label: price.label,
      stripePriceId: price.priceId,
      isDefault: index === 1, // Half gallon is default
      uiOrder: index + 1,
    }));

    try {
      await sanityClient.createOrReplace({
        _id: `stripe-product-${blend.slug}`,
        _type: 'stripeProduct',
        title: `${blend.name} - Cold-Pressed Juice`,
        slug: {
          _type: 'slug',
          current: blend.slug,
        },
        description: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: blend.description,
              },
            ],
          },
        ],
        featured: blend.slug === 'green-bomb', // Feature Green Bomb
        isActive: true,
        stripeProductId: productData.productId,
        tierKey: blend.tierKey,
        variants,
        uiOrder: blends.indexOf(blend) + 1,
        ctaLabel: 'Reserve Now',
      });

      console.log(`   ✓ stripeProduct created with ${variants.length} variants\n`);
    } catch (error) {
      console.error(`   ✗ Failed to create stripeProduct for ${blend.name}:`, error);
    }
  }
}

async function createCoupons() {
  console.log('\n🎟️  Creating Stripe Coupons...\n');

  const coupons = [
    {
      id: 'WELCOME20',
      name: 'Welcome Discount',
      percentOff: 20,
      duration: 'once',
      description: '20% off your first order',
    },
    {
      id: 'REFER20',
      name: 'Referral Discount',
      percentOff: 20,
      duration: 'once',
      description: '20% off for referrals',
    },
  ];

  for (const couponConfig of coupons) {
    try {
      console.log(`📝 Creating coupon: ${couponConfig.id}`);

      const coupon = await stripe.coupons.create({
        id: couponConfig.id,
        percent_off: couponConfig.percentOff,
        duration: couponConfig.duration as 'once' | 'forever' | 'repeating',
        name: couponConfig.name,
        metadata: {
          description: couponConfig.description,
        },
      });

      console.log(`   ✓ Stripe coupon created: ${coupon.id}`);

      // Create corresponding Sanity userDiscount document
      await sanityClient.createOrReplace({
        _id: `user-discount-${couponConfig.id.toLowerCase()}`,
        _type: 'userDiscount',
        title: couponConfig.name,
        code: couponConfig.id,
        description: couponConfig.description,
        discountType: 'percentage',
        discountValue: couponConfig.percentOff,
        stripeCouponId: coupon.id,
        isActive: true,
        startDate: new Date().toISOString(),
      });

      console.log(`   ✓ Sanity userDiscount created\n`);
    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        console.log(`   ℹ️  Coupon ${couponConfig.id} already exists, skipping\n`);
      } else {
        console.error(`   ✗ Failed to create coupon ${couponConfig.id}:`, error);
      }
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   DRINKLONGLIFE E-COMMERCE SETUP');
  console.log('   Stripe Test Mode + Sanity CMS Configuration');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Step 1: Create Stripe products and prices
    const productMap = await createStripeProducts();

    // Step 2: Create Sanity documents
    await createSanityDocuments(productMap);

    // Step 3: Create coupons
    await createCoupons();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 Summary:');
    console.log(`   • ${blends.length} Stripe products created`);
    console.log(`   • ${blends.length * sizes.length} Stripe prices created`);
    console.log(`   • 1 stripeSettings document created`);
    console.log(`   • ${blends.length} stripeProduct documents created`);
    console.log(`   • 2 coupons created (Stripe + Sanity)`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Open Sanity Studio to verify documents');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Test checkout flow with test card: 4242 4242 4242 4242');
    console.log('   4. Check webhook events with: stripe listen --forward-to localhost:3000/api/stripe/webhook');

    console.log('\n🔗 Product IDs:');
    productMap.forEach((data, slug) => {
      console.log(`   ${slug}: ${data.productId}`);
    });

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
