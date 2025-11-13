import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

async function createTestBlend() {
  const mutations = [
    {
      create: {
        _type: 'blend',
        title: 'E2E Test Blend',
        slug: {
          _type: 'slug',
          current: 'e2e-test-blend'
        },
        description: 'Test blend for Playwright E2E tests',
        ingredients: [
          'Test Ingredient 1',
          'Test Ingredient 2',
          'Test Ingredient 3'
        ],
        benefits: [
          'Test benefit 1',
          'Test benefit 2'
        ],
        sizes: [
          {
            _type: 'blendSize',
            size: '8oz',
            price: 29.99,
            stripePriceId: 'price_1QjbBaCu8SiOGapKMfqFZ3hy', // Test mode price
            description: '8oz test size'
          },
          {
            _type: 'blendSize',
            size: '12oz',
            price: 39.99,
            stripePriceId: 'price_1QjbBaCu8SiOGapKMfqFZ3hy', // Test mode price
            description: '12oz test size'
          }
        ]
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

  const result = await response.json();
  console.log('Test blend created:', result);
  return result;
}

createTestBlend()
  .then(() => {
    console.log('✅ Test blend created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error creating test blend:', err);
    process.exit(1);
  });
