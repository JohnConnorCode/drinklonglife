import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'stripeProduct',
  title: 'Stripe Product',
  type: 'document',
  description: 'Products synced with Stripe for payments and subscriptions',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'Display name for the product (e.g., "Green Detox - Monthly Subscription")',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Full description of the product and what customers get',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      description: 'Optional badge text (e.g., "MOST POPULAR", "BEST VALUE")',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight this product (shows first, may have special styling)',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Controls if this product is visible on the site',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'Product ID from Stripe Dashboard (e.g., prod_xxxxx)',
      validation: (Rule) =>
        Rule.required()
          .regex(/^prod_[a-zA-Z0-9]+$/, {
            name: 'Stripe Product ID',
            invert: false,
          })
          .error('Must be a valid Stripe Product ID (starts with "prod_")'),
    }),
    defineField({
      name: 'tierKey',
      title: 'Tier Key',
      type: 'string',
      description: 'Optional tier identifier for feature gating (e.g., "basic", "pro", "premium")',
      options: {
        list: [
          { title: 'Basic', value: 'basic' },
          { title: 'Pro', value: 'pro' },
          { title: 'Premium', value: 'premium' },
          { title: 'Enterprise', value: 'enterprise' },
        ],
      },
    }),
    defineField({
      name: 'variants',
      title: 'Size Variants',
      type: 'array',
      description: 'Different size options with their Stripe Price IDs',
      validation: (Rule) => Rule.required().min(1).max(10),
      of: [
        {
          type: 'object',
          name: 'variant',
          title: 'Variant',
          fields: [
            defineField({
              name: 'sizeKey',
              title: 'Size Key',
              type: 'string',
              description: 'Unique identifier for this size (e.g., "gallon", "half_gallon", "shot")',
              options: {
                list: [
                  { title: 'Gallon', value: 'gallon' },
                  { title: 'Half Gallon', value: 'half_gallon' },
                  { title: 'Shot', value: 'shot' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Display Label',
              type: 'string',
              description: 'Human-readable label shown to customers (e.g., "Gallons", "Half Gallons", "Shots")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'stripePriceId',
              title: 'Stripe Price ID',
              type: 'string',
              description: 'Price ID from Stripe Dashboard (e.g., price_xxxxx)',
              validation: (Rule) =>
                Rule.required()
                  .regex(/^price_[a-zA-Z0-9]+$/, {
                    name: 'Stripe Price ID',
                    invert: false,
                  })
                  .error('Must be a valid Stripe Price ID (starts with "price_")'),
            }),
            defineField({
              name: 'isDefault',
              title: 'Default Selection',
              type: 'boolean',
              initialValue: false,
              description: 'Pre-select this variant when the page loads',
            }),
            defineField({
              name: 'uiOrder',
              title: 'Display Order',
              type: 'number',
              description: 'Order in which variants appear (1, 2, 3...)',
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'stripePriceId',
              sizeKey: 'sizeKey',
            },
            prepare({ title, subtitle, sizeKey }) {
              return {
                title: title || sizeKey,
                subtitle: subtitle,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'uiOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which products appear on the pricing page (1, 2, 3...)',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'Product photo or icon',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility',
        },
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Button Label',
      type: 'string',
      description: 'Text for the action button (e.g., "Subscribe", "Buy Now", "Get Started")',
      initialValue: 'Subscribe',
    }),
    defineField({
      name: 'notes',
      title: 'Admin Notes',
      type: 'text',
      description: 'Internal notes (not displayed to customers)',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'stripeProductId',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, isActive }) {
      return {
        title: `${isActive ? '✅' : '❌'} ${title}`,
        subtitle: subtitle,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'uiOrder',
      by: [{ field: 'uiOrder', direction: 'asc' }],
    },
    {
      title: 'Active Status',
      name: 'isActive',
      by: [{ field: 'isActive', direction: 'desc' }],
    },
  ],
});
