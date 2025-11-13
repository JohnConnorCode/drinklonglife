import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

async function checkStripeMode() {
  const query = encodeURIComponent('*[_type == "stripeSettings"][0]');
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`
    }
  });

  const data = await response.json();
  console.log('Current Stripe Settings:', JSON.stringify(data.result, null, 2));
}

checkStripeMode();
