import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'partnershipPerk',
  title: 'Partnership Perk',
  type: 'document',
  description: 'Perks and benefits available to users based on their partnership tier',
  fields: [
    defineField({
      name: 'title',
      title: 'Perk Title',
      type: 'string',
      description: 'Name of the perk (e.g., "Early Access to New Products")',
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
      description: 'Detailed description of the perk and how users can access it',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief summary for cards and listings (1-2 sentences)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Controls if this perk is visible to eligible users',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requiredTier',
      title: 'Required Partnership Tier',
      type: 'string',
      description: 'Minimum tier needed to access this perk',
      options: {
        list: [
          { title: 'Affiliate', value: 'affiliate' },
          { title: 'Partner', value: 'partner' },
          { title: 'VIP', value: 'vip' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Type of perk for filtering and organization',
      options: {
        list: [
          { title: 'Discount', value: 'discount' },
          { title: 'Early Access', value: 'early_access' },
          { title: 'Exclusive Content', value: 'exclusive_content' },
          { title: 'Free Shipping', value: 'free_shipping' },
          { title: 'Gift', value: 'gift' },
          { title: 'Priority Support', value: 'priority_support' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'icon',
      title: 'Icon/Emoji',
      type: 'string',
      description: 'Icon or emoji to represent this perk (e.g., "🎁", "⚡", "✨")',
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'image',
      title: 'Perk Image',
      type: 'image',
      description: 'Visual representation of the perk',
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
      description: 'Text for the action button (e.g., "Claim Now", "Learn More", "Redeem")',
      initialValue: 'Learn More',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'url',
      description: 'Link for the CTA button (optional)',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto'],
        }),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'datetime',
      description: 'When this perk expires (optional - leave blank for permanent perks)',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight this perk (shows first, may have special styling)',
    }),
    defineField({
      name: 'uiOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which perks appear (1, 2, 3...)',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'discountCode',
      title: 'Associated Discount Code',
      type: 'string',
      description: 'Discount code for this perk (if applicable)',
    }),
    defineField({
      name: 'stripeCouponId',
      title: 'Stripe Coupon ID',
      type: 'string',
      description: 'Stripe coupon ID (if this perk involves a discount)',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true; // Optional field
          return /^[a-zA-Z0-9_-]+$/.test(value)
            ? true
            : 'Must be a valid Stripe coupon ID (alphanumeric, underscores, hyphens only)';
        }),
    }),
    defineField({
      name: 'notes',
      title: 'Admin Notes',
      type: 'text',
      description: 'Internal notes (not displayed to users)',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'requiredTier',
      media: 'image',
      isActive: 'isActive',
      icon: 'icon',
    },
    prepare({ title, subtitle, media, isActive, icon }) {
      return {
        title: `${isActive ? '✅' : '❌'} ${icon || ''} ${title}`,
        subtitle: `Tier: ${subtitle}`,
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
      title: 'Partnership Tier',
      name: 'requiredTier',
      by: [{ field: 'requiredTier', direction: 'asc' }],
    },
    {
      title: 'Active Status',
      name: 'isActive',
      by: [{ field: 'isActive', direction: 'desc' }],
    },
  ],
});
