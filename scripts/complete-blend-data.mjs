import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;
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

async function updateBlend(blendId, data) {
  const mutations = [
    {
      patch: {
        id: blendId,
        set: {
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
            },
            {
              _type: 'blendSize',
              _key: 'size-12oz',
              size: '12oz',
              price: 39.99,
              stripePriceId: STRIPE_TEST_PRICE_ID,
              description: `12oz ${data.name}`,
              volume: '12oz',
              servingsPerBottle: 6
            }
          ]
        }
      }
    }
  ];

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`
    },
    body: JSON.stringify({ mutations })
  });

  return await response.json();
}

async function fixAllBlends() {
  console.log('Adding complete data to all 3 blends...\n');

  for (const [blendId, data] of Object.entries(blendsData)) {
    console.log(`Updating: ${blendId} (${data.name})`);
    const result = await updateBlend(blendId, data);

    if (result.error) {
      console.log(`  ❌ Error: ${result.error.description || result.error}\n`);
    } else {
      console.log(`  ✅ Updated successfully\n`);
    }
  }

  console.log('✅ All blends updated with complete data!');
}

fixAllBlends()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
