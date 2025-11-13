import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;
const STRIPE_TEST_PRICE_ID = 'price_1QjbBaCu8SiOGapKMfqFZ3hy';

async function getAllBlends() {
  const query = encodeURIComponent('*[_type == "blend"]{_id, title, slug, sizes}');
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`
    }
  });

  const data = await response.json();
  return data.result || [];
}

async function deleteBlend(blendId) {
  const mutations = [
    {
      delete: {
        id: blendId
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

async function updateBlendSizes(blendId, title) {
  const mutations = [
    {
      patch: {
        id: blendId,
        set: {
          sizes: [
            {
              _type: 'blendSize',
              _key: 'size-8oz',
              size: '8oz',
              price: 29.99,
              stripePriceId: STRIPE_TEST_PRICE_ID,
              description: `8oz ${title}`
            },
            {
              _type: 'blendSize',
              _key: 'size-12oz',
              size: '12oz',
              price: 39.99,
              stripePriceId: STRIPE_TEST_PRICE_ID,
              description: `12oz ${title}`
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

async function fixBlends() {
  console.log('Fetching all blends...\n');
  const blends = await getAllBlends();

  console.log(`Found ${blends.length} blends\n`);

  // Delete E2E Test Blends
  const testBlends = blends.filter(b => b.title === 'E2E Test Blend');
  for (const blend of testBlends) {
    console.log(`Deleting: ${blend.title} (${blend._id})`);
    await deleteBlend(blend._id);
    console.log(`  ✅ Deleted\n`);
  }

  // Update the 3 original blends
  const originalBlends = blends.filter(b =>
    b._id === 'blend-green-bomb' ||
    b._id === 'blend-red-bomb' ||
    b._id === 'blend-yellow-bomb'
  );

  for (const blend of originalBlends) {
    console.log(`Updating: ${blend._id}`);
    const result = await updateBlendSizes(blend._id, blend.slug?.current || blend._id);

    if (result.error) {
      console.log(`  ❌ Error: ${result.error.description || result.error}\n`);
    } else {
      console.log(`  ✅ Updated with Stripe Price IDs\n`);
    }
  }

  console.log('✅ All done! You should now have 3 blends with Stripe prices.');
}

fixBlends()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
