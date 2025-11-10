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

// Helper to upload image from URL
async function uploadImageFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename,
    });
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };
  } catch (error) {
    console.error(`Failed to upload image ${filename}:`, error);
    return null;
  }
}

async function seedData() {
  console.log('🌱 Starting Long Life content seed...\n');

  try {
    // Upload placeholder images
    console.log('📸 Uploading placeholder images...\n');

    const heroImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1200&q=80',
      'hero-juice-bottles.jpg'
    );

    const yellowBombImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80',
      'yellow-bomb-turmeric.jpg'
    );

    const redBombImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80',
      'red-bomb-beet.jpg'
    );

    const greenBombImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
      'green-bomb-celery.jpg'
    );

    // Hero slider images
    const heroSlide1Image = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1920&q=90',
      'hero-slide-1-green-juice.jpg'
    );

    const heroSlide2Image = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1920&q=90',
      'hero-slide-2-juice-bottles.jpg'
    );

    const heroSlide3Image = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=1920&q=90',
      'hero-slide-3-turmeric.jpg'
    );

    // Process step images
    const processSourceImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
      'process-sourcing-farm.jpg'
    );

    const processPressImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
      'process-cold-press.jpg'
    );

    const processFreezeImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80',
      'process-freeze.jpg'
    );

    const processShipImage = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80',
      'process-shipping.jpg'
    );

    // 1. Site Settings (Singleton)
    await upsertDoc({
      _id: 'siteSettings',
      _type: 'siteSettings',
      title: 'Long Life',
      tagline: 'Real juice. Real people.',
      description: 'Small-batch juice for real humans. Cold-pressed, ingredient-dense, made weekly in Indiana. Drink what your body recognizes.',
      contactEmail: 'hello@drinklonglife.com',
      address: 'Indiana, USA',
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
      primaryLinks: [
        { title: 'Blends', externalUrl: '/blends' },
        { title: 'How We Make It', externalUrl: '/how-we-make-it' },
        { title: 'Ingredients', externalUrl: '/ingredients' },
        { title: 'Journal', externalUrl: '/journal' },
        { title: 'FAQ', externalUrl: '/faq' },
      ],
      footerLinks: [
        { title: 'All Blends', externalUrl: '/blends' },
        { title: 'Subscriptions', externalUrl: '/subscriptions' },
        { title: 'Wholesale', externalUrl: '/wholesale' },
        { title: 'How We Make It', externalUrl: '/how-we-make-it' },
        { title: 'Sourcing Standards', externalUrl: '/ingredients' },
        { title: 'Journal', externalUrl: '/journal' },
        { title: 'FAQ', externalUrl: '/faq' },
        { title: 'Contact', externalUrl: '/contact' },
      ],
      legalLinks: [
        { title: 'Terms', externalUrl: '/terms' },
        { title: 'Privacy', externalUrl: '/privacy' },
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
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Partner with regenerative organic farms. Every ingredient traced to origin.' }],
        },
      ],
      image: processSourceImage,
      order: 1,
    });

    await upsertDoc({
      _id: 'process-2',
      _type: 'processStep',
      title: 'Cold-Press',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Hydraulic press extracts maximum nutrients without heat or oxidation.' }],
        },
      ],
      image: processPressImage,
      order: 2,
    });

    await upsertDoc({
      _id: 'process-3',
      _type: 'processStep',
      title: 'Freeze Within Hours',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Flash-frozen to lock in peak freshness and enzyme activity.' }],
        },
      ],
      image: processFreezeImage,
      order: 3,
    });

    await upsertDoc({
      _id: 'process-4',
      _type: 'processStep',
      title: 'Ship Direct',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Delivered frozen to your door. No preservatives, ever.' }],
        },
      ],
      image: processShipImage,
      order: 4,
    });

    // 5. Standards
    await upsertDoc({
      _id: 'standard-1',
      _type: 'standard',
      title: 'Regenerative Organic',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Soil health, biodiversity, and carbon sequestration over yield.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'standard-2',
      _type: 'standard',
      title: 'Farm-Traced',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Every ingredient identified by farm and harvest date.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'standard-3',
      _type: 'standard',
      title: 'No HPP, No Heat',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Cold-pressed only. Living enzymes preserved.' }],
        },
      ],
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
      name: 'Yellow Bomb — Dopamine Surge',
      slug: { current: 'yellow-bomb' },
      tagline: 'Wake the system. Feel the rush.',
      functionList: ['Energy', 'Focus', 'Mood elevation'],
      image: yellowBombImage,
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
      name: 'Red Bomb — Reset Formula',
      slug: { current: 'red-bomb' },
      tagline: 'Rebuild from the inside out.',
      functionList: ['Circulation', 'Detox', 'Cellular recovery'],
      image: redBombImage,
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
      name: 'Green Bomb — The Clarity Formula',
      slug: { current: 'green-bomb' },
      tagline: 'Find your edge. Stay in flow.',
      functionList: ['Hydration', 'Gut balance', 'Mental clarity'],
      image: greenBombImage,
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
      heroSlides: [
        {
          heading: 'Peak Performance Starts Here',
          subheading: 'Cold-pressed, small-batch juices crafted for serious athletes and health-conscious humans.',
          ctaText: 'Shop Blends',
          ctaLink: '/blends',
          image: heroSlide1Image,
        },
        {
          heading: 'Real Ingredients. Real Results.',
          subheading: 'No concentrates. No shortcuts. Just whole fruits, roots, and greens pressed fresh weekly.',
          ctaText: 'Our Process',
          ctaLink: '/how-we-make-it',
          image: heroSlide2Image,
        },
        {
          heading: 'Small-Batch Integrity',
          subheading: 'Limited runs. First come, first served. Made in Indiana with ingredients you can trace.',
          ctaText: 'Learn More',
          ctaLink: '/about',
          image: heroSlide3Image,
        },
      ],
      hero: {
        heading: 'Small-batch juice for real humans.',
        subheading: 'Cold-pressed, ingredient-dense, made weekly in Indiana.\nDrink what your body recognizes.',
        image: heroImage,
        ctaPrimary: { _ref: ctaShop._id, _type: 'reference' },
      },
      valueProps: [
        {
          title: 'Nothing fake',
          body: 'Only whole fruits, roots, and greens. No concentrates. No fillers.',
        },
        {
          title: 'Pressed for power',
          body: 'Cold-pressed to preserve flavor and nutrients.',
        },
        {
          title: 'Small-batch integrity',
          body: 'Made in limited runs. First come, first served.',
        },
      ],
      featuredBlendsHeading: 'Featured Blends',
      featuredBlendsSubheading: 'Sold in weekly drops. Reserve early.',
      featuredBlends: [
        { _ref: 'blend-yellow-bomb', _type: 'reference' },
        { _ref: 'blend-red-bomb', _type: 'reference' },
        { _ref: 'blend-green-bomb', _type: 'reference' },
      ],
      featuredBlendsCtaText: 'Reserve This Week',
      featuredBlendsSizingText: 'Sizes: 1-Gallon $50 • ½-Gallon $35 • Shot $5',
      featuredBlendsDeliveryText: 'Pickup or local delivery during weekly windows. Shipments coming soon.',
      statsHeading: 'By the Numbers',
      testimonialsHeading: 'What People Say',
      testimonialsSubheading: 'Real results from real humans.',
      pricingHeading: 'Sizing & Pricing',
      sizesPricing: [
        { _ref: sizeGallon._id, _type: 'reference' },
        { _ref: sizeHalfGallon._id, _type: 'reference' },
        { _ref: sizeShot._id, _type: 'reference' },
      ],
      processHeading: 'How We Make It',
      processIntro: 'We care about every detail, from farm to bottle. Here\'s our process.',
      processSteps: [
        { _ref: 'process-1', _type: 'reference' },
        { _ref: 'process-2', _type: 'reference' },
        { _ref: 'process-3', _type: 'reference' },
        { _ref: 'process-4', _type: 'reference' },
      ],
      sourcingHeading: 'Ingredients & Sourcing',
      sourcingIntro: 'We work with farms that share our commitment to regenerative agriculture and soil health.',
      standards: [
        { _ref: 'standard-1', _type: 'reference' },
        { _ref: 'standard-2', _type: 'reference' },
        { _ref: 'standard-3', _type: 'reference' },
      ],
      newsletterHeading: 'Get first access to drops and new blends',
      newsletterSubheading: 'Enter your email to reserve before batches sell out.',
      newsletterPlaceholder: 'Enter your email',
      newsletterButtonText: 'Notify Me',
      communityBlurb: 'We grow by word of mouth. Taste it. Share it. Bring a friend to pickup day.',
      communityHashtagText: 'Tag #DrinkLongLife to join a community that chooses nature over noise.',
    });

    // 11. About Page (Singleton)
    await upsertDoc({
      _id: 'aboutPage',
      _type: 'aboutPage',
      heroHeading: 'Return to nature in a world of machines.',
      heroSubheading: 'Modern life is efficient but empty. Long Life exists to bring people back to real nourishment and clear minds.',
      introText: 'We make fresh, functional blends in small batches, serve a committed community, then refine based on real feedback. We are starting local and building something worthy of global attention.',
      whyHeading: 'Why we started Long Life',
      whyContent: [
        {
          _type: 'block',
          _key: 'why1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'The modern food system prioritizes scale over substance. Grocery store "juice" is often concentrate mixed with water and artificial flavor. Supplements come in pills engineered in labs. Wellness has been industrialized, and somewhere along the way, we forgot what real food tastes like.',
            },
          ],
        },
        {
          _type: 'block',
          _key: 'why2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Long Life started in a small Indiana kitchen with a simple question: ',
            },
            {
              _type: 'span',
              text: 'What if we made juice the way it should be made?',
              marks: ['em'],
            },
            {
              _type: 'span',
              text: ' Cold-pressed whole plants. No filler. No hype. Just clean inputs, honest process, and respect for the people drinking it.',
            },
          ],
        },
      ],
      howHeading: 'How we work',
      howContent: [
        {
          _type: 'block',
          _key: 'how1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'We press in small batches. Limited runs mean we can control quality, source better ingredients, and respond to feedback faster than a factory ever could.',
            },
          ],
        },
        {
          _type: 'block',
          _key: 'how2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'We serve a community first—local pickup, real conversations, word-of-mouth growth. We\'re not chasing viral moments or scale-at-all-costs fundraising. We\'re building trust bottle by bottle.',
            },
          ],
        },
        {
          _type: 'block',
          _key: 'how3',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'We refine constantly. Customer feedback shapes our recipes. Seasonal harvests dictate what we press. We adjust, improve, and stay honest about what works and what doesn\'t.',
            },
          ],
        },
      ],
      promiseHeading: 'Our promise',
      promises: [
        {
          title: 'Clarity over hype.',
          description: "We won\'t make medical claims or promise magic. We make juice with real ingredients and tell you exactly what\'s in it.",
        },
        {
          title: 'Craft over shortcuts.',
          description: "Cold-pressed, same-day bottled, small-batch integrity. We could make more if we compromised. We won\'t.",
        },
        {
          title: 'Ingredients you can point to.',
          description: 'Every bottle is batch-dated. Every ingredient is tracked. If you want to know where something came from, just ask.',
        },
      ],
      visionHeading: "Where we\'re going",
      visionContent: [
        {
          _type: 'block',
          _key: 'vision1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: "We\'re starting small. Indiana first. Local partnerships with farms, gyms, cafés, and people who value real food. As we grow, we\'ll expand—but only if we can maintain the same standards.",
            },
          ],
        },
        {
          _type: 'block',
          _key: 'vision2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: "Our goal isn\'t to be the biggest juice brand. It\'s to be the most honest one. A brand that people trust because we show up consistently and never cut corners. From a small Indiana kitchen to wherever this goes—Long Life is about building something that lasts.",
            },
          ],
        },
      ],
      teamHeading: 'The team',
      valuesHeading: 'What we stand for',
      values: [
        {
          emoji: '🌱',
          title: 'Real Ingredients',
          description: 'Whole plants. No concentrates. No artificial anything.',
        },
        {
          emoji: '🤝',
          title: 'Community First',
          description: "We grow by word of mouth, not paid ads. Trust is earned.",
        },
        {
          emoji: '🔍',
          title: 'Full Transparency',
          description: 'Every ingredient tracked. Every batch dated. Zero secrets.',
        },
      ],
      ctaHeading: 'Join the movement',
      ctaText: "We\'re building a community that values real nourishment over shortcuts. Start with a bottle. Stay for the craft.",
      disclaimer: 'Responsible Language: We make juice, not medical claims. Everyone is different. If you have a condition, talk to your practitioner. Our commitment is clean inputs and honest process.',
      seo: {
        metaTitle: 'About | Long Life',
        metaDescription: 'Return to nature in a world of machines. Learn about our mission to bring people back to real nourishment and clear minds.',
      },
    });

    // 12. Blends Page (Singleton)
    await upsertDoc({
      _id: 'blendsPage',
      _type: 'blendsPage',
      heading: 'Our Blends',
      subheading: 'Each blend is carefully crafted with cold-pressed organic ingredients to support your wellness journey.',
      seo: {
        metaTitle: 'Our Blends | Long Life',
        metaDescription: 'Explore our cold-pressed juice blends, each crafted for specific wellness functions.',
      },
    });

    // 13. FAQ Page (Singleton)
    await upsertDoc({
      _id: 'faqPage',
      _type: 'faqPage',
      heading: 'Frequently Asked Questions',
      subheading: 'Find answers to common questions about our products and service.',
      seo: {
        metaTitle: 'FAQ | Long Life',
        metaDescription: 'Frequently asked questions about Long Life juices and ordering.',
      },
    });

    // 14. Process Page (Singleton)
    await upsertDoc({
      _id: 'processPage',
      _type: 'processPage',
      heroHeading: 'How We Make It',
      heroSubheading: 'Cold-pressed, same-day bottled, no shortcuts.',
      processSteps: [
        { _ref: 'process-1', _type: 'reference' },
        { _ref: 'process-2', _type: 'reference' },
        { _ref: 'process-3', _type: 'reference' },
        { _ref: 'process-4', _type: 'reference' },
      ],
      whyHeading: 'Why Our Process Matters',
      whyCards: [
        {
          title: 'Maximum Nutrient Retention',
          description: 'Cold-pressing at low speeds preserves enzymes and vitamins that heat pasteurization destroys. You get living food, not dead liquid.',
        },
        {
          title: 'No Concentrates or Additives',
          description: 'Every bottle is 100% juice from whole plants. Nothing fake, nothing reconstituted. Just real ingredients.',
        },
        {
          title: 'Traceability & Accountability',
          description: 'Every batch is dated. Every ingredient is logged. If there\'s ever a question, we can trace it back to the farm.',
        },
      ],
      commitmentHeading: 'Small-batch integrity',
      commitmentText: 'We could make more. We could cut corners. We don\'t. Long Life grows by making the same thing, better, week after week. That\'s the craft.',
      commitmentBadge: 'Made in limited runs. First come, first served.',
      disclaimer: 'Responsible Language: We make juice, not medical claims. Everyone is different. If you have a condition, talk to your practitioner. Our commitment is clean inputs and honest process.',
      seo: {
        metaTitle: 'How We Make It | Long Life',
        metaDescription: 'Cold-pressed, same-day bottled, no shortcuts. Learn about our process and commitment to quality.',
      },
    });

    // 15. Ingredients & Sourcing Page (Singleton)
    await upsertDoc({
      _id: 'ingredientsSourcingPage',
      _type: 'ingredientsSourcingPage',
      heroHeading: 'Ingredients & Sourcing',
      heroSubheading: 'We source from trusted growers who share our standards. Seasonal rotation is part of the craft.',
      philosophyHeading: 'Our Sourcing Philosophy',
      philosophyIntro: 'When an ingredient peaks, we buy it. When it\'s off-season, we pause or adjust the recipe. This is how food should work.',
      philosophyContent: [
        {
          _type: 'block',
          _key: 'phil1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Industrial juice is designed for year-round consistency—same flavor, same color, same everything. That requires concentrates, flavor additives, and ingredients shipped from wherever they\'re cheapest.',
            },
          ],
        },
        {
          _type: 'block',
          _key: 'phil2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Long Life is different. We work with seasonal harvest windows and regional farms. If a strawberry crop comes in strong, we lean into it. If a supplier\'s practices don\'t meet our bar, we find another or pause until we do.',
            },
          ],
        },
      ],
      standardsHeading: 'Our Standards',
      standards: [
        { _ref: 'standard-1', _type: 'reference' },
        { _ref: 'standard-2', _type: 'reference' },
        { _ref: 'standard-3', _type: 'reference' },
      ],
      spotlightHeading: 'What Goes Into Our Blends',
      ingredientCategories: [
        {
          categoryName: 'Fruits',
          color: 'text-accent-yellow',
          hoverColor: 'border-accent-yellow',
          ingredients: ['Guava', 'Orange', 'Mango', 'Pineapple', 'Papaya', 'Strawberry', 'Raspberry', 'Red Apple', 'Green Apple', 'Pear'],
        },
        {
          categoryName: 'Vegetables & Greens',
          color: 'text-accent-green',
          hoverColor: 'border-accent-green',
          ingredients: ['Spinach', 'Cucumber', 'Beet', 'Carrot', 'Red Cabbage', 'Celery', 'Romaine'],
        },
        {
          categoryName: 'Herbs & Roots',
          color: 'text-accent-primary',
          hoverColor: 'border-accent-primary',
          ingredients: ['Ginger', 'Mint', 'Parsley'],
        },
      ],
      spotlightNote: 'No concentrates. No "natural flavors." No fillers. Just whole plants, pressed fresh.',
      farmHeading: 'Grow With Us',
      farmText: 'We\'re building a network of farm partners who share our values. If you grow high-quality produce and want to work with a brand that respects your craft, let\'s talk.',
      farmFormNote: 'We partner with farms in and around Indiana first, then expand as we grow.',
      transparencyHeading: 'Transparency is our standard',
      transparencyText: 'Have questions about where an ingredient came from, how it was grown, or why we chose it? Ask. We\'ll tell you. This level of traceability is rare in the juice industry—we think it should be the norm.',
      seo: {
        metaTitle: 'Ingredients & Sourcing | Long Life',
        metaDescription: 'Transparent sourcing from trusted growers. Organic-first, seasonal rotation, batch-dated quality.',
      },
    });

    // 16. Subscriptions Page (Singleton)
    await upsertDoc({
      _id: 'subscriptionsPage',
      _type: 'subscriptionsPage',
      heroHeading: 'Subscriptions',
      heroTagline: 'Your body likes rhythm.',
      heroText: 'Subscribe to a weekly or bi-weekly drop. You choose your blend mix and size. Skip or pause anytime.',
      howHeading: 'How It Works',
      howSteps: [
        {
          stepNumber: 1,
          title: 'Choose Your Blends',
          description: 'Select from Yellow, Red, or Green Bomb. Mix and match based on your goals.',
        },
        {
          stepNumber: 2,
          title: 'Set Your Frequency',
          description: 'Weekly or bi-weekly delivery. Pause, skip, or adjust anytime.',
        },
        {
          stepNumber: 3,
          title: 'Get Priority Access',
          description: 'Guaranteed inventory. First notice on seasonal drops and new blends.',
        },
      ],
      perksHeading: 'Member Perks',
      perks: [
        {
          title: 'Priority Access',
          description: 'Guaranteed inventory on limited runs. Never miss a batch.',
        },
        {
          title: 'Early Tasting Invites',
          description: 'Be the first to try new formulas and seasonal blends before they launch.',
        },
        {
          title: 'Flexible Plans',
          description: 'Customize your mix. Change sizes. Skip weeks. Cancel anytime.',
        },
        {
          title: 'Community Connection',
          description: 'Join pickup days, share feedback, and help shape what we make next.',
        },
      ],
      pricingHeading: 'Subscription Plans',
      plans: [
        {
          name: 'Weekly',
          description: 'Fresh juice every week. Build a consistent routine.',
          isPopular: false,
          priceItems: [
            { size: '1-Gallon', price: '$50/week' },
            { size: '½-Gallon', price: '$35/week' },
            { size: 'Shots (4-pack)', price: '$18/week' },
          ],
          buttonText: 'Start Weekly Plan',
        },
        {
          name: 'Bi-Weekly',
          description: 'Every other week. Perfect for lighter routines or smaller households.',
          isPopular: true,
          priceItems: [
            { size: '1-Gallon', price: '$50/delivery' },
            { size: '½-Gallon', price: '$35/delivery' },
            { size: 'Shots (4-pack)', price: '$18/delivery' },
          ],
          buttonText: 'Start Bi-Weekly Plan',
        },
      ],
      pricingNote: 'All plans include free local pickup. Delivery options coming soon.',
      ctaHeading: 'Ready to Start?',
      ctaText: 'Join the community. Lock in your weekly or bi-weekly drops.',
      seo: {
        metaTitle: 'Subscriptions | Long Life',
        metaDescription: 'Subscribe to weekly or bi-weekly juice drops. Priority access to limited runs and seasonal blends.',
      },
    });

    // 17. Wholesale & Teams Page (Singleton)
    await upsertDoc({
      _id: 'wholesalePage',
      _type: 'wholesalePage',
      heroHeading: 'Wholesale & Teams',
      heroTagline: 'Real juice for real businesses.',
      heroText: 'We partner with select cafés, gyms, and offices that value real ingredients and want to offer something better to their communities.',
      partnersHeading: 'Who We Work With',
      partnerTypes: [
        {
          emoji: '☕',
          title: 'Cafés & Markets',
          description: 'Stock our bottles and shots in your cooler. Give customers a premium alternative to commodity juice.',
        },
        {
          emoji: '💪',
          title: 'Gyms & Studios',
          description: 'Fuel members before and after workouts with clean, functional blends.',
        },
        {
          emoji: '🏢',
          title: 'Offices & Teams',
          description: 'Upgrade your wellness program with weekly juice fridges or event bars.',
        },
      ],
      programsHeading: 'Wholesale Programs',
      programs: [
        {
          title: 'Retail Bottles & Shots',
          description: 'Stock our signature blends in retail-ready bottles. Individual portions or shots for grab-and-go customers. Weekly or bi-weekly delivery.',
          options: [
            { name: '16oz Bottles', description: 'Wholesale pricing available' },
            { name: '2oz Shots', description: 'Perfect for countertop displays' },
          ],
        },
        {
          title: 'Refillable Bulk Jugs',
          description: 'Large-format jugs for high-volume locations. We deliver, you serve. Ideal for juice bars, smoothie shops, and event catering.',
          options: [
            { name: '1-Gallon Jugs', description: 'Serve 16 cups per jug' },
            { name: '2.5-Gallon Jugs', description: 'For events and high-traffic days' },
          ],
        },
        {
          title: 'Team Wellness Fridges',
          description: 'Keep your office or team stocked with fresh juice. We set up a weekly delivery schedule and handle invoicing. You choose the blend mix and quantities.',
          note: 'Custom Programs\nPricing scales with team size. Minimum 12 bottles per delivery.',
          noteColor: 'border-accent-green',
        },
        {
          title: 'Event Bars & Pop-Ups',
          description: 'Bring Long Life to your event, retreat, or conference. We can provide pre-packaged bottles or a full juice bar setup with on-site service.',
          note: 'Booking Required\nMinimum 48-hour notice. Pricing varies by event size and service level.',
          noteColor: 'border-accent-yellow',
        },
      ],
      whyHeading: 'Why Partner With Long Life',
      benefits: [
        {
          title: 'Real Ingredients',
          description: 'No concentrates, no fillers, no artificial anything. Just cold-pressed whole fruits, roots, and greens.',
        },
        {
          title: 'Small-Batch Quality',
          description: 'We press, chill, and bottle the same day. Maximum freshness, zero compromise.',
        },
        {
          title: 'Local & Transparent',
          description: 'Made in Indiana. We know our farms, track our lots, and batch-date every bottle.',
        },
        {
          title: 'Reliable Partner',
          description: 'Consistent delivery schedules. Responsive communication. We show up for our partners.',
        },
      ],
      ctaHeading: 'Ready to Partner?',
      ctaText: 'We\'re selective about who we work with. Tell us about your business and how you\'d serve Long Life to your community.',
      ctaNote: 'We typically respond within 2-3 business days.',
      seo: {
        metaTitle: 'Wholesale & Teams | Long Life',
        metaDescription: 'Partner with Long Life for wholesale juice programs. Retail bottles, bulk jugs, team wellness fridges, and event bars.',
      },
    });

    // 18. FAQs
    await upsertDoc({
      _id: 'faq-1',
      _type: 'faq',
      question: 'How should I store Long Life juice?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Keep frozen until ready to use. Once thawed, refrigerate and consume within 3 days for optimal freshness.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-2',
      _type: 'faq',
      question: "What's the recommended serving size?",
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: '2 oz daily, preferably on an empty stomach in the morning. You can scale up to 4 oz for pre-workout or extra immune support.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-3',
      _type: 'faq',
      question: 'Do you ship nationwide?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Currently shipping to CA, OR, WA, AZ, NV. Nationwide expansion coming soon—join our waitlist.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-4',
      _type: 'faq',
      question: 'Are your juices organic?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Yes. All ingredients are certified organic or sourced from regenerative farms exceeding organic standards.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-5',
      _type: 'faq',
      question: 'What does "cold-pressed" mean?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'We use a hydraulic press that extracts juice slowly, without heat or high-speed blades. This preserves enzymes and nutrients.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-6',
      _type: 'faq',
      question: 'Can I cancel my subscription anytime?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Yes. Cancel or pause anytime from your account dashboard. No commitments, no fees.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-7',
      _type: 'faq',
      question: 'Do you offer wholesale pricing?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Yes! We work with gyms, cafes, and wellness centers. Fill out our wholesale inquiry form for pricing.' }],
        },
      ],
    });

    await upsertDoc({
      _id: 'faq-8',
      _type: 'faq',
      question: 'What makes Long Life different from other juice brands?',
      answer: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Three things: regenerative sourcing (we trace every farm), true cold-press (no HPP shortcuts), and frozen delivery (no preservatives needed).' }],
        },
      ],
    });

    // 12. Testimonials
    console.log('\n📝 Creating testimonials...\n');

    const testimonialImage1 = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      'customer-sarah.jpg'
    );

    const testimonialImage2 = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      'customer-mike.jpg'
    );

    const testimonialImage3 = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      'customer-james.jpg'
    );

    const testimonial1 = await upsertDoc({
      _id: 'testimonial-1',
      _type: 'testimonial',
      name: 'Sarah M.',
      role: 'Marathon Runner',
      quote: 'The Red Bomb is my go-to after long runs. I actually feel the difference in recovery time.',
      image: testimonialImage1,
      blend: { _ref: 'blend-red-bomb', _type: 'reference' },
      isFeatured: true,
      order: 1,
    });

    const testimonial2 = await upsertDoc({
      _id: 'testimonial-2',
      _type: 'testimonial',
      name: 'Mike Chen',
      role: 'Entrepreneur',
      quote: 'Yellow Bomb keeps me sharp during back-to-back meetings. No crash, just sustained energy.',
      image: testimonialImage2,
      blend: { _ref: 'blend-yellow-bomb', _type: 'reference' },
      isFeatured: true,
      order: 2,
    });

    const testimonial3 = await upsertDoc({
      _id: 'testimonial-3',
      _type: 'testimonial',
      name: 'James R.',
      role: 'Yoga Instructor',
      quote: 'Green Bomb is part of my daily practice now. My students have noticed the difference in my energy.',
      image: testimonialImage3,
      blend: { _ref: 'blend-green-bomb', _type: 'reference' },
      isFeatured: true,
      order: 3,
    });

    const testimonial4 = await upsertDoc({
      _id: 'testimonial-4',
      _type: 'testimonial',
      name: 'Lisa K.',
      role: 'Nurse',
      quote: 'Working 12-hour shifts, I need real fuel. Long Life keeps me going without the junk.',
      isFeatured: true,
      order: 4,
    });

    const testimonial5 = await upsertDoc({
      _id: 'testimonial-5',
      _type: 'testimonial',
      name: 'David T.',
      role: 'CrossFit Athlete',
      quote: 'I\'ve tried every supplement out there. This is the only thing that\'s actually whole food.',
      isFeatured: true,
      order: 5,
    });

    // 13. Social Proof Singleton
    console.log('\n📊 Creating social proof data...\n');

    await upsertDoc({
      _id: 'socialProof',
      _type: 'socialProof',
      stats: {
        customersServed: 1200,
        batchesMade: 450,
        yearsInBusiness: 2,
        bottlesProduced: 4800,
      },
      communityHashtag: '#DrinkLongLife',
      featuredTestimonials: [
        { _ref: testimonial1._id, _type: 'reference' },
        { _ref: testimonial2._id, _type: 'reference' },
        { _ref: testimonial3._id, _type: 'reference' },
        { _ref: testimonial4._id, _type: 'reference' },
        { _ref: testimonial5._id, _type: 'reference' },
      ],
    });

    // 14. Journal Posts
    await upsertDoc({
      _id: 'post-regenerative-farming',
      _type: 'post',
      title: 'Why Regenerative Farming Matters',
      slug: { current: 'why-regenerative-farming-matters' },
      publishedAt: '2024-01-15T10:00:00Z',
      excerpt: "Regenerative agriculture isn\'t just a buzzword—it\'s the future of food. Here\'s how our farm partners are rebuilding soil health while growing nutrient-dense produce.",
      author: 'Long Life Team',
      categories: ['Sourcing', 'Sustainability'],
    });

    await upsertDoc({
      _id: 'post-cold-press-vs-hpp',
      _type: 'post',
      title: 'Cold-Press vs. HPP: What You Need to Know',
      slug: { current: 'cold-press-vs-hpp' },
      publishedAt: '2024-02-01T10:00:00Z',
      excerpt: "Most \"cold-pressed\" juice isn\'t actually cold-pressed anymore. We break down the difference between hydraulic pressing and high-pressure processing.",
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
