import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    // Hero Section
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Return to nature in a world of machines.',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'text',
      rows: 3,
      initialValue: 'Modern life is efficient but empty. Long Life exists to bring people back to real nourishment and clear minds.',
    }),

    // Intro
    defineField({
      name: 'introText',
      title: 'Introduction Text',
      type: 'text',
      rows: 3,
    }),

    // Why We Started Section
    defineField({
      name: 'whyHeading',
      title: 'Why We Started Heading',
      type: 'string',
      initialValue: 'Why we started Long Life',
    }),
    defineField({
      name: 'whyContent',
      title: 'Why We Started Content',
      type: 'blockContent',
    }),

    // How We Work Section
    defineField({
      name: 'howHeading',
      title: 'How We Work Heading',
      type: 'string',
      initialValue: 'How we work',
    }),
    defineField({
      name: 'howContent',
      title: 'How We Work Content',
      type: 'blockContent',
    }),

    // Our Promise Section
    defineField({
      name: 'promiseHeading',
      title: 'Our Promise Heading',
      type: 'string',
      initialValue: 'Our promise',
    }),
    defineField({
      name: 'promises',
      title: 'Promise Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Promise Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Promise Description',
              type: 'text',
              rows: 3,
            }),
          ],
        },
      ],
    }),

    // Vision Section
    defineField({
      name: 'visionHeading',
      title: 'Vision Heading',
      type: 'string',
      initialValue: 'Where we\'re going',
    }),
    defineField({
      name: 'visionContent',
      title: 'Vision Content',
      type: 'blockContent',
    }),

    // Team Section
    defineField({
      name: 'teamHeading',
      title: 'Team Section Heading',
      type: 'string',
      initialValue: 'The team',
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'teamMember' },
        },
      ],
    }),

    // Values Section
    defineField({
      name: 'valuesHeading',
      title: 'Values Heading',
      type: 'string',
      initialValue: 'What we stand for',
    }),
    defineField({
      name: 'values',
      title: 'Values',
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
              title: 'Value Title',
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

    // CTA Section
    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading',
      type: 'string',
      initialValue: 'Join the movement',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'text',
      rows: 2,
    }),

    // Disclaimer
    defineField({
      name: 'disclaimer',
      title: 'Responsible Language Disclaimer',
      type: 'text',
      rows: 3,
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
        title: title || 'About Long Life',
      };
    },
  },
});
