import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blend',
  title: 'Blend',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Blend Name',
      type: 'string',
      description: 'E.g., "Yellow Bomb", "Red Bomb", "Green Bomb"',
      validation: (Rule) => Rule.required().min(2).max(50),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short, punchy description. E.g., "Wake the system. Feel the rush."',
    }),
    defineField({
      name: 'functionList',
      title: 'Functions',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'E.g., "Energy", "Focus", "Detox" - short one-word benefits displayed as badges',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'ingredient' },
        },
      ],
      description: 'Select ingredients in order of prominence. First ingredient should be the primary one.',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Full description of the blend shown on the detail page. Use rich text formatting.',
    }),
    defineField({
      name: 'labelColor',
      title: 'Label Color',
      type: 'string',
      description: 'Accent color for blend cards and detail page',
      options: {
        list: [
          { title: 'Yellow', value: 'yellow' },
          { title: 'Red', value: 'red' },
          { title: 'Green', value: 'green' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Blend Image',
      type: 'image',
      description: 'High-resolution product photo (min 1200x1200px). Use hotspot to focus on bottle.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility (required)',
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'sizePrice' },
        },
      ],
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first (1, 2, 3...)',
      validation: (Rule) => Rule.required().min(1),
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
      title: 'name',
      subtitle: 'tagline',
      media: 'image',
    },
  },
});
