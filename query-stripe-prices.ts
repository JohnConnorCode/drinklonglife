import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

interface VariantData {
  productName: string;
  variantLabel: string;
  sizeKey: string;
  stripePriceId: string;
  stripeProductId: string;
  price?: number;
  currency?: string;
  isDefault: boolean;
}

async function queryStripePrices() {
  console.log('💳 Fetching price data from Stripe...\n');
  console.log('='.repeat(80));

  const variants: VariantData[] = [
    // Green Bomb
    {
      productName: 'Green Bomb',
      variantLabel: '1 Gallon',
      sizeKey: 'gallon',
      stripePriceId: 'price_1STLYqCu8SiOGapKOM9yjxCL',
      stripeProductId: 'prod_TQBwKRn0Y9ZQJO',
      isDefault: false,
    },
    {
      productName: 'Green Bomb',
      variantLabel: '½ Gallon',
      sizeKey: 'half_gallon',
      stripePriceId: 'price_1STLYrCu8SiOGapKupt9c8IG',
      stripeProductId: 'prod_TQBwKRn0Y9ZQJO',
      isDefault: true,
    },
    {
      productName: 'Green Bomb',
      variantLabel: '2 oz Shot',
      sizeKey: 'shot',
      stripePriceId: 'price_1STLYrCu8SiOGapKx9RMXCG5',
      stripeProductId: 'prod_TQBwKRn0Y9ZQJO',
      isDefault: false,
    },
    // Red Bomb
    {
      productName: 'Red Bomb',
      variantLabel: '1 Gallon',
      sizeKey: 'gallon',
      stripePriceId: 'price_1STLYsCu8SiOGapK7Z0iLCh8',
      stripeProductId: 'prod_TQBwGjv8jzVcwu',
      isDefault: false,
    },
    {
      productName: 'Red Bomb',
      variantLabel: '½ Gallon',
      sizeKey: 'half_gallon',
      stripePriceId: 'price_1STLYsCu8SiOGapKa7MM8WXM',
      stripeProductId: 'prod_TQBwGjv8jzVcwu',
      isDefault: true,
    },
    {
      productName: 'Red Bomb',
      variantLabel: '2 oz Shot',
      sizeKey: 'shot',
      stripePriceId: 'price_1STLYsCu8SiOGapKqnGYhhKG',
      stripeProductId: 'prod_TQBwGjv8jzVcwu',
      isDefault: false,
    },
    // Yellow Bomb
    {
      productName: 'Yellow Bomb',
      variantLabel: '1 Gallon',
      sizeKey: 'gallon',
      stripePriceId: 'price_1STLYtCu8SiOGapKRvX8LhDL',
      stripeProductId: 'prod_TQBwO0picCgej5',
      isDefault: false,
    },
    {
      productName: 'Yellow Bomb',
      variantLabel: '½ Gallon',
      sizeKey: 'half_gallon',
      stripePriceId: 'price_1STLYuCu8SiOGapK8Zv4O8D2',
      stripeProductId: 'prod_TQBwO0picCgej5',
      isDefault: true,
    },
    {
      productName: 'Yellow Bomb',
      variantLabel: '2 oz Shot',
      sizeKey: 'shot',
      stripePriceId: 'price_1STLYuCu8SiOGapKCBkBupAy',
      stripeProductId: 'prod_TQBwO0picCgej5',
      isDefault: false,
    },
  ];

  try {
    // Fetch price data from Stripe
    for (const variant of variants) {
      try {
        const price = await stripe.prices.retrieve(variant.stripePriceId);
        variant.price = price.unit_amount ? price.unit_amount / 100 : undefined;
        variant.currency = price.currency;
      } catch (error: any) {
        console.error(`❌ Error fetching price ${variant.stripePriceId}:`, error.message);
      }
    }

    // Display results grouped by product
    const productGroups = variants.reduce((acc, variant) => {
      if (!acc[variant.productName]) {
        acc[variant.productName] = [];
      }
      acc[variant.productName].push(variant);
      return acc;
    }, {} as Record<string, VariantData[]>);

    for (const [productName, productVariants] of Object.entries(productGroups)) {
      console.log('━'.repeat(80));
      console.log(`📦 ${productName}`);
      console.log('━'.repeat(80));
      console.log(`Stripe Product ID: ${productVariants[0].stripeProductId}`);
      console.log('');
      console.log('VARIANTS:');
      console.log('');

      productVariants.forEach((variant, index) => {
        console.log(`${index + 1}. ${variant.variantLabel}${variant.isDefault ? ' (DEFAULT)' : ''}`);
        console.log(`   Size Key:        ${variant.sizeKey}`);
        console.log(`   Stripe Price ID: ${variant.stripePriceId}`);
        if (variant.price !== undefined) {
          console.log(`   Price:           $${variant.price.toFixed(2)} ${variant.currency?.toUpperCase()}`);
        } else {
          console.log(`   Price:           NOT AVAILABLE`);
        }
        console.log('');
      });
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📊 SUMMARY TABLE\n');
    console.log('Product        | Variant      | Size Key     | Stripe Price ID                | Price');
    console.log('-'.repeat(100));

    for (const variant of variants) {
      const productPadded = variant.productName.padEnd(14);
      const variantPadded = variant.variantLabel.padEnd(12);
      const sizePadded = variant.sizeKey.padEnd(12);
      const pricePadded = variant.stripePriceId.padEnd(30);
      const priceDisplay = variant.price !== undefined
        ? `$${variant.price.toFixed(2)} ${variant.currency?.toUpperCase()}`
        : 'N/A';

      console.log(`${productPadded} | ${variantPadded} | ${sizePadded} | ${pricePadded} | ${priceDisplay}`);
    }

    console.log('\n='.repeat(80));
    console.log('\n📋 FULL JSON DATA:\n');
    console.log(JSON.stringify(productGroups, null, 2));

    console.log('\n✅ Query complete!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

queryStripePrices();
