import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;
const STRIPE_TEST_PRICE_ID = 'price_1QjbBaCu8SiOGapKMfqFZ3hy'; // Test mode price

async function getAllBlends() {
  const query = encodeURIComponent('*[_type == "blend"]{_id, title, sizes}');
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`
    }
  });

  const data = await response.json();
  return data.result || [];
}

async function updateBlendWithStripePrices(blendId, sizes) {
  // Add stripePriceId to each size if it doesn't have one
  const updatedSizes = sizes.map(size => ({
    ...size,
    stripePriceId: size.stripePriceId || STRIPE_TEST_PRICE_ID
  }));

  const mutations = [
    {
      patch: {
        id: blendId,
        set: {
          sizes: updatedSizes
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

async function addStripePricesToAllBlends() {
  console.log('Fetching all blends from Sanity...');
  const blends = await getAllBlends();

  console.log(`Found ${blends.length} blends`);

  for (const blend of blends) {
    console.log(`\nUpdating blend: ${blend.title} (${blend._id})`);

    if (!blend.sizes || blend.sizes.length === 0) {
      console.log('  ⚠️  No sizes found, skipping');
      continue;
    }

    // Check if any size is missing stripePriceId
    const needsUpdate = blend.sizes.some(size => !size.stripePriceId);

    if (!needsUpdate) {
      console.log('  ✓ All sizes already have Stripe prices');
      continue;
    }

    const result = await updateBlendWithStripePrices(blend._id, blend.sizes);

    if (result.error) {
      console.log(`  ❌ Error: ${result.error.description || result.error}`);
    } else {
      console.log(`  ✅ Updated successfully`);
    }
  }

  console.log('\n✅ All blends updated!');
}

addStripePricesToAllBlends()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
