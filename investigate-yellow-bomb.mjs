import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'jrc9x3mn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skTSSQNTOHf9RiUVJ7gbhyILqfYOFD89nIxqigpmV875zLc9odZDACaZAmPh1W8YL0sJ4XaklECKzdBbNcqkwO6wL9Oh45FYHsHguJveLAFfyeKsct4tHQ95rXIQyRwnuBydZnX8LLijgoPLFZ33u23QvA7Ezly6OkKJP9mv5ujhaWkweRvT',
  useCdn: false,
});

console.log('🔍 Getting detailed Yellow Bomb blend data...\n');

const yellowBomb = await client.fetch(`
  *[_type == "blend" && slug.current == "yellow-bomb"][0]{
    ...,
    sizes[]{
      ...
    }
  }
`);

console.log('Full Yellow Bomb data:');
console.log(JSON.stringify(yellowBomb, null, 2));
