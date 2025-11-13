import fetch from 'node-fetch';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

async function getBlend() {
  const query = encodeURIComponent('*[_type == "blend" && _id == "blend-green-bomb"]{_id, title, slug, sizes}');
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`
    }
  });

  const data = await response.json();
  console.log(JSON.stringify(data.result[0], null, 2));
}

getBlend();
