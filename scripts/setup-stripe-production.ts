/**
 * Production Stripe and Sanity Setup Script
 *
 * This script:
 * 1. Creates PRODUCTION Stripe products and prices
 * 2. Updates Sanity stripeProduct documents with production IDs
 * 3. Creates production coupon codes
 * 4. Switches Sanity stripeSettings to production mode
 *
 * Run with: npx tsx scripts/setup-stripe-production.ts
 */

import Stripe from 'stripe';
import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Stripe PRODUCTION mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION!, {
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

async function createProductionStripeProducts(): Promise<Map<string, StripeProductData>> {
  console.log('\n🔴 Creating Stripe PRODUCTION Products...\n');

  const productMap = new Map<string, StripeProductData>();

  for (const blend of blends) {
    console.log(`📦 Creating PRODUCTION product: ${blend.name}`);

    // Create Stripe product in PRODUCTION
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

    console.log(`   ✅ ${blend.name} PRODUCTION setup complete\n`);
  }

  return productMap;
}

async function updateSanityWithProductionIds(productMap: Map<string, StripeProductData>) {
  console.log('\n🎨 Updating Sanity with PRODUCTION Product IDs...\n');

  for (const blend of blends) {
    const productData = productMap.get(blend.slug)!;

    console.log(`📝 Updating stripeProduct: ${blend.name}`);

    // Fetch existing document
    const existingDoc = await sanityClient.getDocument(`stripe-product-${blend.slug}`);

    if (!existingDoc) {
      console.log(`   ⚠️  Document not found, skipping`);
      continue;
    }

    const productionVariants = productData.prices.map((price, index) => ({
      _key: `${price.sizeKey}-prod`,
      sizeKey: price.sizeKey,
      label: price.label,
      stripePriceId: price.priceId,
      isDefault: index === 1, // Half gallon is default
      uiOrder: index + 1,
    }));

    try {
      await sanityClient
        .patch(`stripe-product-${blend.slug}`)
        .set({
          stripeProductIdProduction: productData.productId,
          variantsProduction: productionVariants,
        })
        .commit();

      console.log(`   ✓ Updated with production IDs\n`);
    } catch (error) {
      console.error(`   ✗ Failed to update:`, error);
    }
  }
}

async function createProductionCoupons() {
  console.log('\n🎟️  Creating PRODUCTION Stripe Coupons...\n');

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
      console.log(`📝 Creating PRODUCTION coupon: ${couponConfig.id}`);

      const coupon = await stripe.coupons.create({
        id: couponConfig.id,
        percent_off: couponConfig.percentOff,
        duration: couponConfig.duration as 'once' | 'forever' | 'repeating',
        name: couponConfig.name,
        metadata: {
          description: couponConfig.description,
        },
      });

      console.log(`   ✓ Stripe PRODUCTION coupon created: ${coupon.id}`);

      // Update Sanity userDiscount with production coupon ID
      await sanityClient
        .patch(`user-discount-${couponConfig.id.toLowerCase()}`)
        .set({
          stripeCouponIdProduction: coupon.id,
        })
        .commit();

      console.log(`   ✓ Sanity userDiscount updated with production ID\n`);
    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        console.log(`   ℹ️  Coupon ${couponConfig.id} already exists in PRODUCTION, skipping\n`);
      } else {
        console.error(`   ✗ Failed to create coupon ${couponConfig.id}:`, error);
      }
    }
  }
}

async function switchToProductionMode() {
  console.log('\n🔴 Switching Sanity to PRODUCTION MODE...\n');

  try {
    await sanityClient
      .patch('stripeSettings')
      .set({
        mode: 'production',
        lastModified: new Date().toISOString(),
        modifiedBy: 'production-setup-script',
      })
      .commit();

    console.log('   ✓ Sanity stripeSettings switched to PRODUCTION mode\n');
  } catch (error) {
    console.error('   ✗ Failed to switch to production mode:', error);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   DRINKLONGLIFE PRODUCTION SETUP');
  console.log('   ⚠️  LIVE MODE - REAL CHARGES WILL BE PROCESSED');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Step 1: Create PRODUCTION Stripe products and prices
    const productMap = await createProductionStripeProducts();

    // Step 2: Update Sanity with production IDs
    await updateSanityWithProductionIds(productMap);

    // Step 3: Create production coupons
    await createProductionCoupons();

    // Step 4: Switch to production mode
    await switchToProductionMode();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔴 PRODUCTION SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 Summary:');
    console.log(`   • ${blends.length} PRODUCTION Stripe products created`);
    console.log(`   • ${blends.length * sizes.length} PRODUCTION Stripe prices created`);
    console.log(`   • ${blends.length} Sanity documents updated with production IDs`);
    console.log(`   • 2 PRODUCTION coupons created`);
    console.log(`   • Sanity switched to PRODUCTION mode`);

    console.log('\n🔗 PRODUCTION Product IDs:');
    productMap.forEach((data, slug) => {
      console.log(`   ${slug}: ${data.productId}`);
    });

    console.log('\n⚠️  IMPORTANT:');
    console.log('   • All future transactions will be LIVE');
    console.log('   • Real credit cards will be charged');
    console.log('   • Verify webhooks at https://dashboard.stripe.com');

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Production setup failed:', error);
    process.exit(1);
  }
}

main();
