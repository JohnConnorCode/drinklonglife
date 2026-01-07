import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'wholesalePage',
  title: 'Wholesale & Teams Page',
  type: 'document',
  fields: [
    // Hero Section
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Wholesale & Teams',
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
      initialValue: 'Real juice for real businesses.',
    }),
    defineField({
      name: 'heroText',
      title: 'Hero Text',
      type: 'text',
      rows: 2,
      initialValue: 'We partner with select cafés, gyms, and offices that value real ingredients and want to offer something better to their communities.',
    }),

    // Who We Work With Section
    defineField({
      name: 'partnersHeading',
      title: 'Who We Work With Heading',
      type: 'string',
      initialValue: 'Who We Work With',
    }),
    defineField({
      name: 'partnerTypes',
      title: 'Partner Types',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'emoji',
              title: 'Emoji',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),

    // Programs Section
    defineField({
      name: 'programsHeading',
      title: 'Programs Heading',
      type: 'string',
      initialValue: 'Wholesale Programs',
    }),
    defineField({
      name: 'programs',
      title: 'Wholesale Programs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Program Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Program Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'options',
              title: 'Program Options',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Option Name',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Option Description',
                      type: 'string',
                    }),
                  ],
                },
              ],
            }),
            defineField({
              name: 'note',
              title: 'Program Note',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'noteColor',
              title: 'Note Color',
              type: 'string',
              description: 'e.g., border-accent-green, border-accent-yellow',
              initialValue: 'border-accent-green',
            }),
          ],
        },
      ],
    }),

    // Why Partner Section
    defineField({
      name: 'whyHeading',
      title: 'Why Partner Heading',
      type: 'string',
      initialValue: 'Why Partner With Long Life',
    }),
    defineField({
      name: 'benefits',
      title: 'Partnership Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Benefit Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Benefit Description',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),

    // Application CTA Section
    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading',
      type: 'string',
      initialValue: 'Ready to Partner?',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'text',
      rows: 2,
      initialValue: 'We\'re selective about who we work with. Tell us about your business and how you\'d serve Long Life to your community.',
    }),
    defineField({
      name: 'ctaNote',
      title: 'CTA Note',
      type: 'string',
      initialValue: 'We typically respond within 2-3 business days.',
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heroHeading',
    },
    prepare({ title }) {
      return {
        title: title || 'Wholesale & Teams Page',
      };
    },
  },
});
