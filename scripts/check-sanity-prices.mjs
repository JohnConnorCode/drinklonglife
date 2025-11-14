#!/usr/bin/env node

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_READ_TOKEN,
  useCdn: false,
});

const priceToFind = 'price_1QTIOWCU8SiOGapKcnBUPGsr';

console.log(`Searching for price ID: ${priceToFind}\n`);

// Check all blends
const blends = await client.fetch(`
  *[_type == "blend"] {
    _id,
    name,
    sizes[] {
      _key,
      size,
      stripePriceId,
      stripeSubscriptionPriceId
    }
  }
`);

console.log('Found blends:', blends.length, '\n');

for (const blend of blends) {
  console.log(`Blend: ${blend.name}`);
  if (blend.sizes) {
    for (const size of blend.sizes) {
      console.log(`  - ${size.size || 'N/A'}: one-time=${size.stripePriceId || 'none'}, subscription=${size.stripeSubscriptionPriceId || 'none'}`);
      if (size.stripeSubscriptionPriceId === priceToFind || size.stripePriceId === priceToFind) {
        console.log(`    ✅ FOUND MATCH!`);
      }
    }
  }
  console.log('');
}
