import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'ingredientsSourcingPage',
  title: 'Ingredients & Sourcing Page',
  type: 'document',
  fields: [
    // Hero Section
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Ingredients & Sourcing',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'text',
      rows: 2,
      initialValue: 'We source from trusted growers who share our standards. Seasonal rotation is part of the craft.',
    }),

    // Philosophy Section
    defineField({
      name: 'philosophyHeading',
      title: 'Philosophy Heading',
      type: 'string',
      initialValue: 'Our Sourcing Philosophy',
    }),
    defineField({
      name: 'philosophyIntro',
      title: 'Philosophy Introduction',
      type: 'text',
      rows: 2,
      initialValue: 'When an ingredient peaks, we buy it. When it\'s off-season, we pause or adjust the recipe. This is how food should work.',
    }),
    defineField({
      name: 'philosophyContent',
      title: 'Philosophy Content',
      type: 'blockContent',
    }),

    // Standards Section (reuse existing standard references)
    defineField({
      name: 'standardsHeading',
      title: 'Standards Heading',
      type: 'string',
      initialValue: 'Our Standards',
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

    // Ingredient Spotlight Section
    defineField({
      name: 'spotlightHeading',
      title: 'Ingredient Spotlight Heading',
      type: 'string',
      initialValue: 'What Goes Into Our Blends',
    }),
    defineField({
      name: 'ingredientCategories',
      title: 'Ingredient Categories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'categoryName',
              title: 'Category Name',
              type: 'string',
            }),
            defineField({
              name: 'color',
              title: 'Category Color',
              type: 'string',
              description: 'e.g., text-accent-yellow, text-accent-green, text-accent-primary',
              initialValue: 'text-accent-yellow',
            }),
            defineField({
              name: 'hoverColor',
              title: 'Hover Border Color',
              type: 'string',
              description: 'e.g., border-accent-yellow, border-accent-green, border-accent-primary',
              initialValue: 'border-accent-yellow',
            }),
            defineField({
              name: 'ingredients',
              title: 'Ingredients',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'spotlightNote',
      title: 'Spotlight Note',
      type: 'text',
      rows: 2,
      initialValue: "That's it. No concentrates. No \"natural flavors.\" No fillers. Just whole plants, pressed fresh.",
    }),

    // Farm Partners Section
    defineField({
      name: 'farmHeading',
      title: 'Farm Partners Heading',
      type: 'string',
      initialValue: 'Grow With Us',
    }),
    defineField({
      name: 'farmText',
      title: 'Farm Partners Text',
      type: 'text',
      rows: 3,
      initialValue: 'We\'re building a network of farm partners who share our values. If you grow high-quality produce and want to work with a brand that respects your craft, let\'s talk.',
    }),
    defineField({
      name: 'farmFormNote',
      title: 'Farm Form Note',
      type: 'string',
      initialValue: 'We partner with farms in and around Indiana first, then expand as we grow.',
    }),

    // Transparency Section
    defineField({
      name: 'transparencyHeading',
      title: 'Transparency Heading',
      type: 'string',
      initialValue: 'Transparency is our standard',
    }),
    defineField({
      name: 'transparencyText',
      title: 'Transparency Text',
      type: 'text',
      rows: 3,
      initialValue: 'Have questions about where an ingredient came from, how it was grown, or why we chose it? Ask. We\'ll tell you. This level of traceability is rare in the juice industry—we think it should be the norm.',
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
        title: title || 'Ingredients & Sourcing Page',
      };
    },
  },
});
