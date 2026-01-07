import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'processPage',
  title: 'Process Page (How We Make It)',
  type: 'document',
  fields: [
    // Hero Section
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'How We Make It',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'string',
      initialValue: 'Cold-pressed, same-day bottled, no shortcuts.',
    }),

    // Process Steps (reuse existing processStep references)
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

    // Why It Matters Section
    defineField({
      name: 'whyHeading',
      title: 'Why It Matters Heading',
      type: 'string',
      initialValue: 'Why Our Process Matters',
    }),
    defineField({
      name: 'whyCards',
      title: 'Why It Matters Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Card Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Card Description',
              type: 'text',
              rows: 3,
            }),
          ],
        },
      ],
    }),

    // Batch Commitment Section
    defineField({
      name: 'commitmentHeading',
      title: 'Batch Commitment Heading',
      type: 'string',
      initialValue: 'Small-batch integrity',
    }),
    defineField({
      name: 'commitmentText',
      title: 'Batch Commitment Text',
      type: 'text',
      rows: 3,
      initialValue: 'We could make more. We could cut corners. We don\'t. Long Life grows by making the same thing, better, week after week. That\'s the craft.',
    }),
    defineField({
      name: 'commitmentBadge',
      title: 'Batch Commitment Badge Text',
      type: 'string',
      initialValue: 'Made in limited runs. First come, first served.',
    }),

    // Disclaimer
    defineField({
      name: 'disclaimer',
      title: 'Responsible Language Disclaimer',
      type: 'text',
      rows: 3,
      initialValue: 'Responsible Language: We make juice, not medical claims. Everyone is different. If you have a condition, talk to your practitioner. Our commitment is clean inputs and honest process.',
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
        title: title || 'Process Page',
      };
    },
  },
});
