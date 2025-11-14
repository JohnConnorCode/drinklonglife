#!/usr/bin/env node

/**
 * Script to update display prices in Sanity CMS
 * Updates from old prices ($48/$28/$6) to correct prices ($50/$35/$5)
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const PRICE_UPDATES = {
  shot: { old: 6, new: 5 },
  halfGallon: { old: 28, new: 35 },
  gallon: { old: 48, new: 50 }
};

async function updateDisplayPrices() {
  console.log('🔄 Updating Display Prices in Sanity\n');
  console.log('════════════════════════════════════════\n');

  try {
    // Fetch all blends
    const blends = await client.fetch(`
      *[_type == "blend"] {
        _id,
        name,
        sizes[] {
          _key,
          size,
          price,
          stripePriceId,
          stripeSubscriptionPriceId
        }
      }
    `);

    console.log(`Found ${blends.length} blends\n`);

    for (const blend of blends) {
      console.log(`Processing ${blend.name}...`);

      for (const size of blend.sizes) {
        if (!size || !size.size) {
          console.log(`  ⚠️  Skipping entry with missing size data`);
          continue;
        }

        const sizeType = size.size.toLowerCase().replace(/\s+/g, '');
        let targetPrice;

        // Determine target price based on size
        if (sizeType.includes('shot')) {
          targetPrice = PRICE_UPDATES.shot.new;
        } else if (sizeType.includes('half') || sizeType.includes('1/2')) {
          targetPrice = PRICE_UPDATES.halfGallon.new;
        } else if (sizeType.includes('gallon')) {
          targetPrice = PRICE_UPDATES.gallon.new;
        } else {
          console.log(`  ⚠️  Unknown size type: ${size.size}`);
          continue;
        }

        // Update if price is different
        if (size.price !== targetPrice) {
          console.log(`  📝 Updating ${size.size}: $${size.price} → $${targetPrice}`);

          await client
            .patch(blend._id)
            .set({
              [`sizes[_key=="${size._key}"].price`]: targetPrice
            })
            .commit();

          console.log(`  ✅ Updated ${size.size}`);
        } else {
          console.log(`  ✓ ${size.size} already correct ($${targetPrice})`);
        }
      }

      console.log('');
    }

    console.log('════════════════════════════════════════');
    console.log('✅ All display prices updated!');

  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

updateDisplayPrices();
