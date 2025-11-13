import {createClient} from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const STRIPE_TEST_PRICE_ID = 'price_1SSz46Cu8SiOGapK2cmrIn2t';

const blendsData = {
  'blend-green-bomb': {
    name: 'Green Bomb',
    tagline: 'Energize & Refresh',
    labelColor: 'green',
    functionList: ['Energy', 'Detox', 'Immunity']
  },
  'blend-red-bomb': {
    name: 'Red Bomb',
    tagline: 'Boost & Rejuvenate',
    labelColor: 'red',
    functionList: ['Antioxidants', 'Heart Health', 'Vitality']
  },
  'blend-yellow-bomb': {
    name: 'Yellow Bomb',
    tagline: 'Glow & Thrive',
    labelColor: 'yellow',
    functionList: ['Immunity', 'Digestion', 'Glow']
  }
};

async function updateBlends() {
  console.log('Updating all 3 blends with valid Stripe price...\n');

  for (const [blendId, data] of Object.entries(blendsData)) {
    console.log(`Updating: ${blendId} (${data.name})`);

    try {
      await client
        .patch(blendId)
        .set({
          name: data.name,
          tagline: data.tagline,
          labelColor: data.labelColor,
          functionList: data.functionList,
          sizes: [
            {
              _type: 'blendSize',
              _key: 'size-8oz',
              size: '8oz',
              price: 29.99,
              stripePriceId: STRIPE_TEST_PRICE_ID,
              description: `8oz ${data.name}`,
              volume: '8oz',
              servingsPerBottle: 4
            }
          ]
        })
        .commit();

      console.log(`  ✅ Updated successfully\n`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ All blends updated!');
}

updateBlends()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
