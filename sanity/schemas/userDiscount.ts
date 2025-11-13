import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'userDiscount',
  title: 'User Discount',
  type: 'document',
  description: 'Promotional discounts and coupons that can be displayed to users',
  fields: [
    defineField({
      name: 'title',
      title: 'Discount Title',
      type: 'string',
      description: 'Internal name for this discount (e.g., "Holiday Sale 2024", "Referral Discount")',
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
      name: 'displayTitle',
      title: 'Display Title',
      type: 'string',
      description: 'Public-facing title shown to users (e.g., "Get 20% Off Your First Order!")',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Detailed description of the discount, terms, and conditions',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief summary for cards and banners (1-2 sentences)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Controls if this discount is visible and can be used',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discountCode',
      title: 'Discount Code',
      type: 'string',
      description: 'The actual code users enter at checkout (e.g., "WELCOME20", "SUMMER2024")',
      validation: (Rule) =>
        Rule.required()
          .uppercase()
          .regex(/^[A-Z0-9_-]+$/, {
            name: 'Discount Code',
            invert: false,
          })
          .error('Must be uppercase alphanumeric with underscores/hyphens only'),
    }),
    defineField({
      name: 'stripeCouponId',
      title: 'Stripe Coupon ID',
      type: 'string',
      description: 'Corresponding Stripe coupon ID (must be created in Stripe first)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      description: 'Type of discount',
      options: {
        list: [
          { title: 'Percentage Off', value: 'percentage' },
          { title: 'Fixed Amount Off', value: 'fixed_amount' },
          { title: 'Free Shipping', value: 'free_shipping' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      description: 'Discount amount (percentage: 20 = 20%, fixed: 500 = $5.00)',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where this discount comes from',
      options: {
        list: [
          { title: 'Referral Program', value: 'referral' },
          { title: 'Promotional Campaign', value: 'campaign' },
          { title: 'Partnership', value: 'partnership' },
          { title: 'Welcome Offer', value: 'welcome' },
          { title: 'Loyalty Reward', value: 'loyalty' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'eligibility',
      title: 'Eligibility',
      type: 'string',
      description: 'Who can use this discount',
      options: {
        list: [
          { title: 'All Users', value: 'all' },
          { title: 'New Customers Only', value: 'new_customers' },
          { title: 'Existing Customers', value: 'existing_customers' },
          { title: 'Specific Tier', value: 'tier_specific' },
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'requiredTier',
      title: 'Required Partnership Tier',
      type: 'string',
      description: 'Required tier (only if eligibility is "Specific Tier")',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Affiliate', value: 'affiliate' },
          { title: 'Partner', value: 'partner' },
          { title: 'VIP', value: 'vip' },
        ],
      },
      hidden: ({ parent }) => parent?.eligibility !== 'tier_specific',
    }),
    defineField({
      name: 'startsAt',
      title: 'Start Date',
      type: 'datetime',
      description: 'When this discount becomes available',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'datetime',
      description: 'When this discount expires (optional - leave blank for no expiration)',
    }),
    defineField({
      name: 'maxRedemptions',
      title: 'Max Redemptions',
      type: 'number',
      description: 'Maximum number of times this discount can be used (leave blank for unlimited)',
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'appliesTo',
      title: 'Applies To',
      type: 'string',
      description: 'What this discount can be used on',
      options: {
        list: [
          { title: 'All Products', value: 'all_products' },
          { title: 'Subscriptions Only', value: 'subscriptions' },
          { title: 'One-Time Purchases Only', value: 'purchases' },
          { title: 'Specific Products', value: 'specific_products' },
        ],
      },
      initialValue: 'all_products',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show prominently on account page and promotions',
    }),
    defineField({
      name: 'bannerStyle',
      title: 'Banner Style',
      type: 'string',
      description: 'Visual style for this discount when displayed as a banner',
      options: {
        list: [
          { title: 'Primary (Green)', value: 'primary' },
          { title: 'Secondary (Yellow)', value: 'secondary' },
          { title: 'Accent (Cream)', value: 'accent' },
          { title: 'Info (Blue)', value: 'info' },
          { title: 'Success (Green)', value: 'success' },
        ],
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'icon',
      title: 'Icon/Emoji',
      type: 'string',
      description: 'Icon or emoji to represent this discount (e.g., "🎉", "💰", "🎁")',
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'image',
      title: 'Promotional Image',
      type: 'image',
      description: 'Banner or promotional image',
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
      description: 'Text for the action button (e.g., "Apply Now", "Copy Code", "Shop Now")',
      initialValue: 'Apply Discount',
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
      title: 'displayTitle',
      discountCode: 'discountCode',
      isActive: 'isActive',
      icon: 'icon',
      discountValue: 'discountValue',
      discountType: 'discountType',
    },
    prepare({ title, discountCode, isActive, icon, discountValue, discountType }) {
      const valueDisplay =
        discountType === 'percentage'
          ? `${discountValue}% off`
          : discountType === 'fixed_amount'
          ? `$${(discountValue / 100).toFixed(2)} off`
          : 'Free Shipping';
      return {
        title: `${isActive ? '✅' : '❌'} ${icon || ''} ${title}`,
        subtitle: `${discountCode} - ${valueDisplay}`,
      };
    },
  },
  orderings: [
    {
      title: 'Start Date',
      name: 'startsAt',
      by: [{ field: 'startsAt', direction: 'desc' }],
    },
    {
      title: 'Active Status',
      name: 'isActive',
      by: [{ field: 'isActive', direction: 'desc' }],
    },
    {
      title: 'Featured',
      name: 'featured',
      by: [{ field: 'featured', direction: 'desc' }],
    },
  ],
});
