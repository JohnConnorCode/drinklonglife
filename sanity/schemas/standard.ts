import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'standard',
  title: 'Quality Standard',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'E.g., "No shortcuts", "Certified organic"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Description',
      type: 'blockContent',
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
      description: 'Large background image showing farms, ingredients, or quality checks (min 800x600px)',
      options: {
        hotspot: true,
      },
    }),
  ],
});
