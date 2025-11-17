import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: 'heroSlides',
      title: 'Hero Slider',
      type: 'array',
      description: 'Add multiple slides for the hero slider (minimum 3 recommended)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'subheading',
              title: 'Subheading',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Text',
              type: 'string',
            }),
            defineField({
              name: 'ctaLink',
              title: 'CTA Link',
              type: 'string',
            }),
            defineField({
              name: 'desktopImage',
              title: 'Desktop Background Image',
              type: 'image',
              description: 'Image for desktop viewports (min 1920x1080px)',
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'mobileImage',
              title: 'Mobile Background Image',
              type: 'image',
              description: 'Image for mobile viewports (min 768x1024px)',
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'heading',
              media: 'desktopImage',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section (Legacy)',
      type: 'object',
      hidden: true,
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
        }),
        defineField({
          name: 'subheading',
          title: 'Subheading',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'ctaPrimary',
          title: 'Primary CTA',
          type: 'reference',
          to: { type: 'cta' },
        }),
        defineField({
          name: 'ctaSecondary',
          title: 'Secondary CTA',
          type: 'reference',
          to: { type: 'cta' },
        }),
        defineField({
          name: 'image',
          title: 'Hero Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'valueProps',
      title: 'Value Propositions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'icon',
              title: 'Icon (optional)',
              type: 'image',
            }),
            defineField({
              name: 'image',
              title: 'Background Image (optional)',
              type: 'image',
              description: 'Large background image for this value prop card (min 800x600px)',
              options: {
                hotspot: true,
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'featuredBlendsHeading',
      title: 'Featured Blends Heading',
      type: 'string',
      initialValue: 'Featured Blends',
    }),
    defineField({
      name: 'featuredBlendsSubheading',
      title: 'Featured Blends Subheading',
      type: 'string',
      initialValue: 'Sold in weekly drops. Reserve early.',
    }),
    defineField({
      name: 'featuredBlends',
      title: 'Featured Blends',
      type: 'array',
      description: 'Legacy field - use products instead',
      hidden: true,
      of: [
        {
          type: 'reference',
          to: { type: 'product' },
        },
      ],
    }),
    defineField({
      name: 'featuredBlendsCtaText',
      title: 'Featured Blends CTA Text',
      type: 'string',
      initialValue: 'Reserve This Week',
    }),
    defineField({
      name: 'statsHeading',
      title: 'Stats Section Heading',
      type: 'string',
      initialValue: 'By the Numbers',
    }),
    defineField({
      name: 'testimonialsHeading',
      title: 'Testimonials Heading',
      type: 'string',
      initialValue: 'What People Say',
    }),
    defineField({
      name: 'testimonialsSubheading',
      title: 'Testimonials Subheading',
      type: 'string',
      initialValue: 'Real results from real humans.',
    }),
    defineField({
      name: 'pricingHeading',
      title: 'Pricing Section Heading',
      type: 'string',
      initialValue: 'Sizing & Pricing',
    }),
    defineField({
      name: 'featuredBlendsSizingText',
      title: 'Featured Blends Sizing Text',
      type: 'string',
      initialValue: 'Sizes: 1-Gallon $50 • ½-Gallon $35 • Shot $5',
    }),
    defineField({
      name: 'featuredBlendsDeliveryText',
      title: 'Featured Blends Delivery Text',
      type: 'string',
      initialValue: 'Pickup or local delivery during weekly windows. Shipments coming soon.',
    }),
    defineField({
      name: 'sizesPricing',
      title: 'Sizes & Pricing',
      type: 'array',
      description: 'Legacy field - pricing now managed in Stripe',
      hidden: true,
      of: [
        {
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'processHeading',
      title: 'Process Section Heading',
      type: 'string',
      initialValue: 'How We Make It',
    }),
    defineField({
      name: 'processIntro',
      title: 'Process Section Intro',
      type: 'string',
    }),
    defineField({
      name: 'processSteps',
      title: 'Process Steps',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'processStep' },
        },
      ],
    }),
    defineField({
      name: 'sourcingHeading',
      title: 'Sourcing Section Heading',
      type: 'string',
      initialValue: 'Ingredients & Sourcing',
    }),
    defineField({
      name: 'sourcingIntro',
      title: 'Sourcing Section Intro',
      type: 'string',
    }),
    defineField({
      name: 'standards',
      title: 'Quality Standards',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'standard' },
        },
      ],
    }),
    defineField({
      name: 'newsletterHeading',
      title: 'Newsletter Section Heading',
      type: 'string',
      initialValue: 'Get first access to drops and new blends',
    }),
    defineField({
      name: 'newsletterSubheading',
      title: 'Newsletter Subheading',
      type: 'text',
      rows: 2,
      initialValue: 'Enter your email to reserve before batches sell out.',
    }),
    defineField({
      name: 'newsletterPlaceholder',
      title: 'Email Input Placeholder',
      type: 'string',
      initialValue: 'Enter your email',
    }),
    defineField({
      name: 'newsletterButtonText',
      title: 'Newsletter Button Text',
      type: 'string',
      initialValue: 'Notify Me',
    }),
    defineField({
      name: 'communityBlurb',
      title: 'Community Blurb',
      type: 'text',
      rows: 3,
      initialValue: 'We grow by word of mouth. Taste it. Share it. Bring a friend to pickup day.',
    }),
    defineField({
      name: 'communityHashtagText',
      title: 'Community Hashtag Text',
      type: 'string',
      initialValue: 'Tag #DrinkLongLife to join a community that chooses nature over noise.',
    }),
    defineField({
      name: 'newsletterCta',
      title: 'Newsletter CTA',
      type: 'reference',
      to: { type: 'cta' },
    }),
  ],
});
