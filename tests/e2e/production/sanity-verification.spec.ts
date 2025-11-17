/**
 * Sanity CMS Data Verification Tests (Production)
 *
 * Verifies that Sanity CMS data matches actual Stripe production configuration.
 * - Validates stripeSettings is in production mode
 * - Cross-references Sanity product/price IDs with Stripe
 * - Ensures data consistency between CMS and payment system
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@sanity/client';
import Stripe from 'stripe';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_READ_TOKEN!,
  useCdn: false,
});

// Expected production IDs
const EXPECTED_PRODUCTION = {
  products: {
    'green-bomb': 'prod_TQCAUzauvtIiWd',
    'red-bomb': 'prod_TQCA0Z7B5O3xZC',
    'yellow-bomb': 'prod_TQCAQ0Tt4F1w9s',
  },
  prices: {
    'green-bomb': {
      gallon: 'price_1STLlzCu8SiOGapKCft34ZJ2',
      halfGallon: 'price_1STLlzCu8SiOGapKR67nCD0F',
      shot: 'price_1STLm0Cu8SiOGapKOtVZIzW7',
    },
    'red-bomb': {
      gallon: 'price_1STLm0Cu8SiOGapKq8g85Kvb',
      halfGallon: 'price_1STLm1Cu8SiOGapKIJF4NcCT',
      shot: 'price_1STLm1Cu8SiOGapKQyCOIc1v',
    },
    'yellow-bomb': {
      gallon: 'price_1STLm2Cu8SiOGapKAWPkwFKs',
      halfGallon: 'price_1STLm2Cu8SiOGapKXg8ETiG8',
      shot: 'price_1STLm3Cu8SiOGapK9SH3S6Fe',
    },
  },
};

test.describe('Sanity CMS Production Data Verification', () => {

  let stripe: Stripe;

  test.beforeAll(() => {
    if (!process.env.STRIPE_SECRET_KEY_PRODUCTION) {
      throw new Error('STRIPE_SECRET_KEY_PRODUCTION environment variable not set');
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRODUCTION!, {
      apiVersion: '2025-10-29.clover',
    });

    console.log('\n==============================================');
    console.log('  SANITY CMS VERIFICATION');
    console.log('  Validating production data consistency');
    console.log('==============================================\n');
  });

  test('validates Stripe settings is in production mode', async () => {
    console.log('\nChecking Sanity Stripe settings...');

    const settings = await sanityClient.fetch(
      `*[_type == "stripeSettings" && _id == "stripeSettings"][0]{ mode, lastModified, modifiedBy }`
    );

    expect(settings).toBeTruthy();
    expect(settings.mode).toBe('production');

    console.log(`   ✅ Mode: ${settings.mode}`);
    console.log(`   ✅ Last Modified: ${settings.lastModified}`);
    console.log(`   ✅ Modified By: ${settings.modifiedBy}`);
  });

  test('validates Sanity product IDs match Stripe production', async () => {
    console.log('\nValidating Sanity product IDs...');

    const products = await sanityClient.fetch(
      `*[_type == "stripeProduct"]{ _id, title, slug, stripeProductIdProduction }`
    );

    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      const slug = product.slug.current;

      // Check if we have an expected ID for this product
      if (EXPECTED_PRODUCTION.products[slug as keyof typeof EXPECTED_PRODUCTION.products]) {
        expect(product.stripeProductIdProduction).toBe(EXPECTED_PRODUCTION.products[slug as keyof typeof EXPECTED_PRODUCTION.products]);

        // Verify this product exists in Stripe
        const stripeProduct = await stripe.products.retrieve(product.stripeProductIdProduction);
        expect(stripeProduct.active).toBe(true);

        console.log(`   ✅ ${slug}: ${product.stripeProductIdProduction}`);
        console.log(`      Stripe Name: ${stripeProduct.name}`);
        console.log(`      Active: ${stripeProduct.active}`);
      }
    }
  });

  test('validates Sanity price IDs match Stripe production', async () => {
    console.log('\nValidating Sanity price IDs...');

    const products = await sanityClient.fetch(
      `*[_type == "stripeProduct"]{
        _id,
        "slug": slug.current,
        variantsProduction[]{
          sizeKey,
          label,
          stripePriceId,
          isDefault
        }
      }`
    );

    let totalPrices = 0;
    let validatedPrices = 0;

    for (const product of products) {
      const slug = product.slug;

      if (!product.variantsProduction || product.variantsProduction.length === 0) {
        console.log(`   ⚠️  ${slug}: No production variants found`);
        continue;
      }

      console.log(`\n   ${slug}:`);

      for (const variant of product.variantsProduction) {
        totalPrices++;

        // Verify this price exists in Stripe
        try {
          const stripePrice = await stripe.prices.retrieve(variant.stripePriceId);

          expect(stripePrice.active).toBe(true);
          expect(stripePrice.currency).toBe('usd');
          expect(stripePrice.unit_amount).toBeGreaterThan(0);

          const amount = stripePrice.unit_amount! / 100;
          console.log(`      ✅ ${variant.sizeKey}: ${variant.stripePriceId} ($${amount})`);
          console.log(`         Label: ${variant.label}${variant.isDefault ? ' (default)' : ''}`);

          validatedPrices++;
        } catch (error) {
          console.error(`      ❌ ${variant.sizeKey}: Price not found in Stripe - ${variant.stripePriceId}`);
          throw error;
        }
      }
    }

    console.log(`\n   Total: ${validatedPrices}/${totalPrices} prices validated`);
    expect(validatedPrices).toBe(totalPrices);
  });

  test('validates all Sanity prices exist in Stripe and are active', async () => {
    console.log('\nVerifying all Sanity prices are active in Stripe...');

    const products = await sanityClient.fetch(
      `*[_type == "stripeProduct"]{
        "slug": slug.current,
        variantsProduction[]{
          stripePriceId,
          sizeKey
        }
      }`
    );

    const allPriceIds: string[] = [];

    // Collect all price IDs from Sanity
    products.forEach((product: any) => {
      if (product.variantsProduction) {
        product.variantsProduction.forEach((variant: any) => {
          allPriceIds.push(variant.stripePriceId);
        });
      }
    });

    expect(allPriceIds.length).toBeGreaterThan(0);

    // Verify each price in Stripe
    for (const priceId of allPriceIds) {
      const price = await stripe.prices.retrieve(priceId);

      expect(price.active).toBe(true);
      expect(price.type).toBe('one_time');
      expect(price.billing_scheme).toBe('per_unit');
    }

    console.log(`   ✅ All ${allPriceIds.length} Sanity price IDs are active in Stripe`);
  });

  test('validates no duplicate price IDs in Sanity', async () => {
    console.log('\nChecking for duplicate price IDs...');

    const products = await sanityClient.fetch(
      `*[_type == "stripeProduct"]{
        variantsProduction[]{
          stripePriceId
        }
      }`
    );

    const allPriceIds: string[] = [];

    products.forEach((product: any) => {
      if (product.variantsProduction) {
        product.variantsProduction.forEach((variant: any) => {
          allPriceIds.push(variant.stripePriceId);
        });
      }
    });

    // Check for duplicates
    const duplicates = allPriceIds.filter(
      (item, index) => allPriceIds.indexOf(item) !== index
    );

    expect(duplicates).toHaveLength(0);

    if (duplicates.length > 0) {
      console.log(`   ❌ Found duplicate price IDs:`, duplicates);
    } else {
      console.log(`   ✅ No duplicate price IDs found`);
      console.log(`   ✅ Total unique prices: ${allPriceIds.length}`);
    }
  });

  test('validates production coupon IDs', async () => {
    console.log('\nValidating production coupon codes...');

    const discounts = await sanityClient.fetch(
      `*[_type == "userDiscount" && isActive == true]{
        _id,
        title,
        code,
        stripeCouponIdProduction
      }`
    );

    if (discounts.length === 0) {
      console.log('   ℹ️  No active discounts found in Sanity');
      return;
    }

    for (const discount of discounts) {
      if (discount.stripeCouponIdProduction) {
        try {
          const coupon = await stripe.coupons.retrieve(discount.stripeCouponIdProduction);

          expect(coupon.valid).toBe(true);

          console.log(`   ✅ ${discount.code}: ${discount.stripeCouponIdProduction}`);
          console.log(`      Name: ${discount.title}`);
          console.log(`      Discount: ${coupon.percent_off || coupon.amount_off}`);
        } catch (error) {
          console.error(`   ❌ Coupon not found: ${discount.stripeCouponIdProduction}`);
          throw error;
        }
      } else {
        console.log(`   ⚠️  ${discount.code}: No production coupon ID set`);
      }
    }
  });

  test('validates data consistency between Sanity and Stripe', async () => {
    console.log('\nValidating overall data consistency...');

    // Get all Sanity products
    const sanityProducts = await sanityClient.fetch(
      `*[_type == "stripeProduct"]{
        "slug": slug.current,
        stripeProductIdProduction,
        variantsProduction[]{stripePriceId}
      }`
    );

    // Get all Stripe products
    const stripeProducts = await stripe.products.list({ active: true, limit: 100 });

    // Count matches
    let matches = 0;
    const sanityProductIds = sanityProducts
      .map((p: any) => p.stripeProductIdProduction)
      .filter(Boolean);

    for (const sanityProductId of sanityProductIds) {
      const exists = stripeProducts.data.some(sp => sp.id === sanityProductId);
      if (exists) matches++;
    }

    console.log(`   ✅ Sanity products: ${sanityProducts.length}`);
    console.log(`   ✅ Sanity products with production IDs: ${sanityProductIds.length}`);
    console.log(`   ✅ Matching Stripe products: ${matches}/${sanityProductIds.length}`);
    console.log(`   ✅ Total Stripe products: ${stripeProducts.data.length}`);

    expect(matches).toBe(sanityProductIds.length);
  });

  test.afterAll(() => {
    console.log('\n==============================================');
    console.log('  SANITY VERIFICATION COMPLETE');
    console.log('  All data is consistent with Stripe');
    console.log('==============================================\n');
  });
});
