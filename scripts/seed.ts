/**
 * Sanity Content Seed Script
 *
 * Idempotent script to populate initial content for Long Life
 * Run with: npx tsx scripts/seed.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import type { SanityDocument } from '@sanity/client';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=');
      process.env[key.trim()] = value.trim();
    }
  });
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

// Helper to create or update document
async function upsertDoc(doc: SanityDocument) {
  const { _id, _type } = doc;

  // Check if document exists
  const existing = await client.getDocument(_id);

  if (existing) {
    console.log(`✓ Document ${_id} already exists, updating...`);
    return client.patch(_id).set(doc).commit();
  }

  console.log(`Creating ${_type}: ${_id}...`);
  return client.create(doc);
}

async function seedData() {
  console.log('🌱 Starting Long Life content seed...\n');

  try {
    // 1. Site Settings (Singleton)
    await upsertDoc({
      _id: 'siteSettings',
      _type: 'siteSettings',
      title: 'Long Life',
      tagline: 'Peak performance, one bottle at a time.',
      description: 'Premium superfood juice blends engineered for energy, focus, and vitality. Cold-pressed organic ingredients from regenerative farms.',
      contactEmail: 'hello@longlife.com',
      address: 'Los Angeles, CA',
      social: {
        instagram: 'https://instagram.com/drinklonglife',
        tiktok: 'https://tiktok.com/@drinklonglife',
        youtube: 'https://youtube.com/@drinklonglife',
      },
      seo: {
        titleTemplate: '%s | Long Life',
        twitterHandle: '@drinklonglife',
      },
    });

    // 2. Navigation (Singleton)
    await upsertDoc({
      _id: 'navigation',
      _type: 'navigation',
      headerLinks: [
        { text: 'Blends', href: '/blends' },
        { text: 'How We Make It', href: '/how-we-make-it' },
        { text: 'Ingredients', href: '/ingredients' },
        { text: 'Journal', href: '/journal' },
        { text: 'FAQ', href: '/faq' },
      ],
      footerLinks: [
        {
          title: 'Shop',
          links: [
            { text: 'All Blends', href: '/blends' },
            { text: 'Subscriptions', href: '/subscriptions' },
            { text: 'Wholesale', href: '/wholesale' },
          ],
        },
        {
          title: 'Learn',
          links: [
            { text: 'How We Make It', href: '/how-we-make-it' },
            { text: 'Sourcing Standards', href: '/ingredients' },
            { text: 'Journal', href: '/journal' },
          ],
        },
        {
          title: 'Support',
          links: [
            { text: 'FAQ', href: '/faq' },
            { text: 'Contact', href: '/contact' },
            { text: 'Terms', href: '/terms' },
            { text: 'Privacy', href: '/privacy' },
          ],
        },
      ],
    });

    // 3. Size/Pricing Documents
    const sizeGallon = await upsertDoc({
      _id: 'size-gallon',
      _type: 'sizePrice',
      name: '1 Gallon',
      slug: { current: '1-gallon' },
      volume: '128 oz',
      price: 48,
      servingsPerBottle: 16,
      description: 'Best value. Lasts 8 days (2 oz daily).',
    });

    const sizeHalfGallon = await upsertDoc({
      _id: 'size-half-gallon',
      _type: 'sizePrice',
      name: '½ Gallon',
      slug: { current: 'half-gallon' },
      volume: '64 oz',
      price: 28,
      servingsPerBottle: 8,
      description: 'Perfect for a 4-day supply.',
    });

    const sizeShot = await upsertDoc({
      _id: 'size-shot',
      _type: 'sizePrice',
      name: '2 oz Shot',
      slug: { current: 'shot' },
      volume: '2 oz',
      price: 6,
      servingsPerBottle: 1,
      description: 'Single serving, on-the-go.',
    });

    // 4. Process Steps
    await upsertDoc({
      _id: 'process-1',
      _type: 'processStep',
      title: 'Source',
      description: 'Partner with regenerative organic farms. Every ingredient traced to origin.',
      order: 1,
    });

    await upsertDoc({
      _id: 'process-2',
      _type: 'processStep',
      title: 'Cold-Press',
      description: 'Hydraulic press extracts maximum nutrients without heat or oxidation.',
      order: 2,
    });

    await upsertDoc({
      _id: 'process-3',
      _type: 'processStep',
      title: 'Freeze Within Hours',
      description: 'Flash-frozen to lock in peak freshness and enzyme activity.',
      order: 3,
    });

    await upsertDoc({
      _id: 'process-4',
      _type: 'processStep',
      title: 'Ship Direct',
      description: 'Delivered frozen to your door. No preservatives, ever.',
      order: 4,
    });

    // 5. Standards
    await upsertDoc({
      _id: 'standard-1',
      _type: 'standard',
      title: 'Regenerative Organic',
      description: 'Soil health, biodiversity, and carbon sequestration over yield.',
    });

    await upsertDoc({
      _id: 'standard-2',
      _type: 'standard',
      title: 'Farm-Traced',
      description: 'Every ingredient identified by farm and harvest date.',
    });

    await upsertDoc({
      _id: 'standard-3',
      _type: 'standard',
      title: 'No HPP, No Heat',
      description: 'Cold-pressed only. Living enzymes preserved.',
    });

    // 6. Farms
    const farmSonoma = await upsertDoc({
      _id: 'farm-sonoma-roots',
      _type: 'farm',
      name: 'Sonoma Roots',
      location: 'Sonoma County, CA',
      practices: 'Regenerative organic, biodynamic',
      description: 'Family-operated farm specializing in nutrient-dense turmeric and ginger.',
    });

    const farmCentralCoast = await upsertDoc({
      _id: 'farm-central-coast-citrus',
      _type: 'farm',
      name: 'Central Coast Citrus Co.',
      location: 'Ventura County, CA',
      practices: 'USDA Organic, water conservation',
      description: 'Multi-generational citrus growers focused on heirloom varieties.',
    });

    const farmOjai = await upsertDoc({
      _id: 'farm-ojai-greens',
      _type: 'farm',
      name: 'Ojai Greens Collective',
      location: 'Ojai, CA',
      practices: 'Certified organic, permaculture',
      description: 'Community-supported farm growing microgreens and leafy vegetables.',
    });

    // 7. Ingredients
    const ingredientTurmeric = await upsertDoc({
      _id: 'ingredient-turmeric',
      _type: 'ingredient',
      name: 'Turmeric Root',
      slug: { current: 'turmeric-root' },
      function: 'Anti-inflammatory powerhouse with curcumin for joint and brain health.',
      farms: [{ _ref: farmSonoma._id, _type: 'reference' }],
      seasonality: 'Year-round (stored from fall harvest)',
    });

    const ingredientGinger = await upsertDoc({
      _id: 'ingredient-ginger',
      _type: 'ingredient',
      name: 'Fresh Ginger',
      slug: { current: 'fresh-ginger' },
      function: 'Digestive aid, circulation booster, immune support.',
      farms: [{ _ref: farmSonoma._id, _type: 'reference' }],
      seasonality: 'Harvested fall, available year-round',
    });

    const ingredientLemon = await upsertDoc({
      _id: 'ingredient-lemon',
      _type: 'ingredient',
      name: 'Meyer Lemon',
      slug: { current: 'meyer-lemon' },
      function: 'Vitamin C, alkalizing, liver support.',
      farms: [{ _ref: farmCentralCoast._id, _type: 'reference' }],
      seasonality: 'Winter peak (December–March)',
    });

    const ingredientOrange = await upsertDoc({
      _id: 'ingredient-orange',
      _type: 'ingredient',
      name: 'Cara Cara Orange',
      slug: { current: 'cara-cara-orange' },
      function: 'Antioxidants, mood support, lycopene-rich.',
      farms: [{ _ref: farmCentralCoast._id, _type: 'reference' }],
      seasonality: 'Winter (December–April)',
    });

    const ingredientCarrot = await upsertDoc({
      _id: 'ingredient-carrot',
      _type: 'ingredient',
      name: 'Organic Carrot',
      slug: { current: 'organic-carrot' },
      function: 'Beta-carotene for eye health, immune support.',
      farms: [{ _ref: farmCentralCoast._id, _type: 'reference' }],
      seasonality: 'Year-round',
    });

    const ingredientBeet = await upsertDoc({
      _id: 'ingredient-beet',
      _type: 'ingredient',
      name: 'Red Beet',
      slug: { current: 'red-beet' },
      function: 'Nitric oxide for blood flow, endurance, detox.',
      farms: [{ _ref: farmOjai._id, _type: 'reference' }],
      seasonality: 'Year-round',
    });

    const ingredientCelery = await upsertDoc({
      _id: 'ingredient-celery',
      _type: 'ingredient',
      name: 'Celery',
      slug: { current: 'celery' },
      function: 'Hydration, electrolytes, natural sodium.',
      farms: [{ _ref: farmOjai._id, _type: 'reference' }],
      seasonality: 'Year-round',
    });

    const ingredientKale = await upsertDoc({
      _id: 'ingredient-kale',
      _type: 'ingredient',
      name: 'Lacinato Kale',
      slug: { current: 'lacinato-kale' },
      function: 'Vitamin K, antioxidants, detox support.',
      farms: [{ _ref: farmOjai._id, _type: 'reference' }],
      seasonality: 'Fall–spring (best flavor after frost)',
    });

    const ingredientCayenne = await upsertDoc({
      _id: 'ingredient-cayenne',
      _type: 'ingredient',
      name: 'Cayenne Pepper',
      slug: { current: 'cayenne-pepper' },
      function: 'Metabolism boost, circulation, anti-microbial.',
      farms: [{ _ref: farmSonoma._id, _type: 'reference' }],
      seasonality: 'Summer harvest (dried year-round)',
    });

    // 8. Blends
    await upsertDoc({
      _id: 'blend-yellow-bomb',
      _type: 'blend',
      name: 'Yellow Bomb',
      slug: { current: 'yellow-bomb' },
      tagline: 'Wake the system. Feel the rush.',
      functionList: ['Energy', 'Anti-inflammatory', 'Immunity'],
      labelColor: 'yellow',
      isFeatured: true,
      order: 1,
      ingredients: [
        { _ref: ingredientTurmeric._id, _type: 'reference' },
        { _ref: ingredientGinger._id, _type: 'reference' },
        { _ref: ingredientLemon._id, _type: 'reference' },
        { _ref: ingredientOrange._id, _type: 'reference' },
        { _ref: ingredientCayenne._id, _type: 'reference' },
      ],
      sizes: [
        { _ref: sizeGallon._id, _type: 'reference' },
        { _ref: sizeHalfGallon._id, _type: 'reference' },
        { _ref: sizeShot._id, _type: 'reference' },
      ],
      seo: {
        metaTitle: 'Yellow Bomb | Turmeric Ginger Energy Shot',
        metaDescription: 'Anti-inflammatory turmeric and ginger blend for energy and immunity. Cold-pressed, organic, regenerative.',
      },
    });

    await upsertDoc({
      _id: 'blend-red-bomb',
      _type: 'blend',
      name: 'Red Bomb',
      slug: { current: 'red-bomb' },
      tagline: 'Flow state. Endurance unlocked.',
      functionList: ['Circulation', 'Endurance', 'Detox'],
      labelColor: 'red',
      isFeatured: true,
      order: 2,
      ingredients: [
        { _ref: ingredientBeet._id, _type: 'reference' },
        { _ref: ingredientCarrot._id, _type: 'reference' },
        { _ref: ingredientGinger._id, _type: 'reference' },
        { _ref: ingredientLemon._id, _type: 'reference' },
      ],
      sizes: [
        { _ref: sizeGallon._id, _type: 'reference' },
        { _ref: sizeHalfGallon._id, _type: 'reference' },
        { _ref: sizeShot._id, _type: 'reference' },
      ],
      seo: {
        metaTitle: 'Red Bomb | Beet Juice for Endurance & Blood Flow',
        metaDescription: 'Nitric oxide-rich beet blend for circulation and athletic performance. Organic, cold-pressed.',
      },
    });

    await upsertDoc({
      _id: 'blend-green-bomb',
      _type: 'blend',
      name: 'Green Bomb',
      slug: { current: 'green-bomb' },
      tagline: 'Cleanse. Alkalize. Elevate.',
      functionList: ['Detox', 'Hydration', 'Alkalinity'],
      labelColor: 'green',
      isFeatured: true,
      order: 3,
      ingredients: [
        { _ref: ingredientCelery._id, _type: 'reference' },
        { _ref: ingredientKale._id, _type: 'reference' },
        { _ref: ingredientLemon._id, _type: 'reference' },
        { _ref: ingredientGinger._id, _type: 'reference' },
      ],
      sizes: [
        { _ref: sizeGallon._id, _type: 'reference' },
        { _ref: sizeHalfGallon._id, _type: 'reference' },
        { _ref: sizeShot._id, _type: 'reference' },
      ],
      seo: {
        metaTitle: 'Green Bomb | Celery Juice Detox & Alkaline Blend',
        metaDescription: 'Hydrating green juice with celery, kale, and lemon for detox and pH balance. Organic, cold-pressed.',
      },
    });

    // 9. Create CTA documents for homepage
    const ctaShop = await upsertDoc({
      _id: 'cta-shop-blends',
      _type: 'cta',
      label: 'Shop Blends',
      style: 'primary',
      target: {
        type: 'external',
        externalUrl: '/blends',
      },
    });

    // 10. Home Page (Singleton)
    await upsertDoc({
      _id: 'homePage',
      _type: 'homePage',
      hero: {
        heading: 'Peak performance, one bottle at a time.',
        subheading: 'Cold-pressed superfood blends engineered for energy, focus, and vitality.',
        ctaPrimary: { _ref: ctaShop._id, _type: 'reference' },
      },
      valueProps: [
        {
          title: 'Regenerative Organic',
          body: 'Every ingredient sourced from farms that heal the soil.',
        },
        {
          title: 'Cold-Pressed, Never HPP',
          body: 'Hydraulic press only. Living enzymes preserved.',
        },
        {
          title: 'Frozen Within Hours',
          body: 'Flash-frozen at peak freshness. No preservatives.',
        },
      ],
      featuredBlends: [
        { _ref: 'blend-yellow-bomb', _type: 'reference' },
        { _ref: 'blend-red-bomb', _type: 'reference' },
        { _ref: 'blend-green-bomb', _type: 'reference' },
      ],
      sizesPricing: [
        { _ref: sizeGallon._id, _type: 'reference' },
        { _ref: sizeHalfGallon._id, _type: 'reference' },
        { _ref: sizeShot._id, _type: 'reference' },
      ],
      processIntro: 'We care about every detail, from farm to bottle. Here\'s our process.',
      processSteps: [
        { _ref: 'process-1', _type: 'reference' },
        { _ref: 'process-2', _type: 'reference' },
        { _ref: 'process-3', _type: 'reference' },
        { _ref: 'process-4', _type: 'reference' },
      ],
      sourcingIntro: 'We work with farms that share our commitment to regenerative agriculture and soil health.',
      standards: [
        { _ref: 'standard-1', _type: 'reference' },
        { _ref: 'standard-2', _type: 'reference' },
        { _ref: 'standard-3', _type: 'reference' },
      ],
      communityBlurb: 'Join the Long Life movement. Daily rituals. Performance metrics. Real results from real people.',
    });

    // 11. FAQs
    await upsertDoc({
      _id: 'faq-1',
      _type: 'faq',
      question: 'How should I store Long Life juice?',
      answer: 'Keep frozen until ready to use. Once thawed, refrigerate and consume within 3 days for optimal freshness.',
    });

    await upsertDoc({
      _id: 'faq-2',
      _type: 'faq',
      question: "What's the recommended serving size?",
      answer: '2 oz daily, preferably on an empty stomach in the morning. You can scale up to 4 oz for pre-workout or extra immune support.',
    });

    await upsertDoc({
      _id: 'faq-3',
      _type: 'faq',
      question: 'Do you ship nationwide?',
      answer: 'Currently shipping to CA, OR, WA, AZ, NV. Nationwide expansion coming soon—join our waitlist.',
    });

    await upsertDoc({
      _id: 'faq-4',
      _type: 'faq',
      question: 'Are your juices organic?',
      answer: 'Yes. All ingredients are certified organic or sourced from regenerative farms exceeding organic standards.',
    });

    await upsertDoc({
      _id: 'faq-5',
      _type: 'faq',
      question: 'What does "cold-pressed" mean?',
      answer: 'We use a hydraulic press that extracts juice slowly, without heat or high-speed blades. This preserves enzymes and nutrients.',
    });

    await upsertDoc({
      _id: 'faq-6',
      _type: 'faq',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes. Cancel or pause anytime from your account dashboard. No commitments, no fees.',
    });

    await upsertDoc({
      _id: 'faq-7',
      _type: 'faq',
      question: 'Do you offer wholesale pricing?',
      answer: 'Yes! We work with gyms, cafes, and wellness centers. Fill out our wholesale inquiry form for pricing.',
    });

    await upsertDoc({
      _id: 'faq-8',
      _type: 'faq',
      question: 'What makes Long Life different from other juice brands?',
      answer: 'Three things: regenerative sourcing (we trace every farm), true cold-press (no HPP shortcuts), and frozen delivery (no preservatives needed).',
    });

    // 12. Journal Posts
    await upsertDoc({
      _id: 'post-regenerative-farming',
      _type: 'post',
      title: 'Why Regenerative Farming Matters',
      slug: { current: 'why-regenerative-farming-matters' },
      publishedAt: '2024-01-15T10:00:00Z',
      excerpt: "Regenerative agriculture isn't just a buzzword—it's the future of food. Here's how our farm partners are rebuilding soil health while growing nutrient-dense produce.",
      author: 'Long Life Team',
      categories: ['Sourcing', 'Sustainability'],
    });

    await upsertDoc({
      _id: 'post-cold-press-vs-hpp',
      _type: 'post',
      title: 'Cold-Press vs. HPP: What You Need to Know',
      slug: { current: 'cold-press-vs-hpp' },
      publishedAt: '2024-02-01T10:00:00Z',
      excerpt: "Most \"cold-pressed\" juice isn't actually cold-pressed anymore. We break down the difference between hydraulic pressing and high-pressure processing.",
      author: 'Long Life Team',
      categories: ['Production', 'Transparency'],
    });

    console.log('\n✅ Seed complete! All content created.');
    console.log('\n📝 Next steps:');
    console.log('1. Log into Sanity Studio at /studio');
    console.log('2. Add images to blends, ingredients, and blog posts');
    console.log('3. Expand blog post body content using rich text');
    console.log('4. Customize page slugs and SEO metadata as needed\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedData();
