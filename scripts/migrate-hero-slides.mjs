/**
 * Hero Slides Migration Script
 *
 * Uploads the local slider images to Sanity and updates the homePage document
 * with properly structured heroSlides (desktopImage + mobileImage).
 *
 * Run with: node scripts/migrate-hero-slides.mjs
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jrc9x3mn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Helper to upload image from local file
async function uploadImageFromFile(filePath, filename) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      return null;
    }

    const buffer = fs.readFileSync(absolutePath);
    const asset = await client.assets.upload('image', buffer, {
      filename,
    });

    console.log(`  Uploaded: ${filename} -> ${asset._id}`);

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

// Slide content to migrate
const slideContent = [
  {
    heading: 'Peak Performance Starts Here',
    subheading: 'Cold-pressed, small-batch juices crafted for serious athletes and health-conscious humans.',
    ctaText: 'Shop Blends',
    ctaLink: '/blends',
    desktopFile: 'public/slider-desktop-1.png',
    mobileFile: 'public/slider-mobile-1.png',
  },
  {
    heading: 'Real Ingredients. Real Results.',
    subheading: 'No concentrates. No shortcuts. Just whole fruits, roots, and greens pressed fresh weekly.',
    ctaText: 'Our Process',
    ctaLink: '/how-we-make-it',
    desktopFile: 'public/slider-desktop-2.png',
    mobileFile: 'public/slider-mobile-2.png',
  },
  {
    heading: 'Small-Batch Integrity',
    subheading: 'Limited runs. First come, first served. Made in Indiana with ingredients you can trace.',
    ctaText: 'Learn More',
    ctaLink: '/about',
    desktopFile: 'public/slider-desktop-3.png',
    mobileFile: 'public/slider-mobile-3.png',
  },
];

async function migrateHeroSlides() {
  console.log('Starting hero slides migration...\n');

  // Check for write token
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('SANITY_WRITE_TOKEN not found in environment. Please add it to .env.local');
    process.exit(1);
  }

  // Upload images and build heroSlides array
  const heroSlides = [];

  for (let i = 0; i < slideContent.length; i++) {
    const slide = slideContent[i];
    console.log(`Processing slide ${i + 1}: "${slide.heading}"`);

    const desktopImage = await uploadImageFromFile(slide.desktopFile, `hero-desktop-${i + 1}.png`);
    const mobileImage = await uploadImageFromFile(slide.mobileFile, `hero-mobile-${i + 1}.png`);

    if (!desktopImage || !mobileImage) {
      console.error(`  Failed to upload images for slide ${i + 1}`);
      continue;
    }

    heroSlides.push({
      _key: `slide-${i + 1}`,
      heading: slide.heading,
      subheading: slide.subheading,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      desktopImage,
      mobileImage,
    });

    console.log(`  Slide ${i + 1} prepared successfully\n`);
  }

  if (heroSlides.length === 0) {
    console.error('No slides were prepared. Aborting.');
    process.exit(1);
  }

  // Check if homePage document exists
  const existingHomePage = await client.getDocument('homePage');

  if (existingHomePage) {
    console.log('Updating existing homePage document with new heroSlides...');
    await client
      .patch('homePage')
      .set({ heroSlides })
      .commit();
    console.log('homePage updated successfully!');
  } else {
    console.log('Creating new homePage document...');
    await client.create({
      _id: 'homePage',
      _type: 'homePage',
      heroSlides,
      // Add other required fields with defaults
      featuredBlendsHeading: 'Featured Blends',
      featuredBlendsSubheading: 'Sold in weekly drops. Reserve early.',
      featuredBlendsCtaText: 'Reserve This Week',
      statsHeading: 'By the Numbers',
      testimonialsHeading: 'What People Say',
      testimonialsSubheading: 'Real results from real humans.',
      processHeading: 'How We Make It',
    });
    console.log('homePage created successfully!');
  }

  console.log('\n Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify heroSlides in Sanity Studio at /admin/studio');
  console.log('2. Run the site locally to test: npm run dev');
  console.log('3. The homepage should now display slides from Sanity CMS');
}

migrateHeroSlides().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
