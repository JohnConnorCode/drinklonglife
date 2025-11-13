import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'upsellOffer',
  title: 'Upsell Offer',
  type: 'document',
  description: 'Post-purchase upsell offers to increase average order value',
  fields: [
    defineField({
      name: 'title',
      title: 'Offer Title',
      type: 'string',
      description: 'Headline for the upsell (e.g., "Upgrade to Partner Tier - Save 20%")',
      validation: (Rule) => Rule.required().min(5).max(100),
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
      description: 'Detailed explanation of the offer and its benefits',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief pitch for the upsell (1-2 sentences)',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Controls if this upsell is shown to users',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'offerType',
      title: 'Offer Type',
      type: 'string',
      description: 'What type of upsell is this?',
      options: {
        list: [
          { title: 'Subscription Upgrade', value: 'subscription_upgrade' },
          { title: 'Tier Upgrade', value: 'tier_upgrade' },
          { title: 'Additional Product', value: 'additional_product' },
          { title: 'Bundle Deal', value: 'bundle' },
          { title: 'One-Time Purchase', value: 'one_time' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'The Stripe Price ID for this upsell (e.g., "price_abc123")',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const offerType = (context.parent as any)?.offerType;
          // Only required for offers that involve a Stripe checkout
          if (['subscription_upgrade', 'additional_product', 'bundle', 'one_time'].includes(offerType)) {
            if (!value) return 'Stripe Price ID is required for this offer type';
            if (!/^price_[a-zA-Z0-9_]+$/.test(value)) {
              return 'Must be a valid Stripe Price ID (starts with "price_")';
            }
          }
          return true;
        }),
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID (Optional)',
      type: 'string',
      description: 'Stripe Product ID if you need to reference the product (e.g., "prod_abc123")',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true; // Optional
          return /^prod_[a-zA-Z0-9_]+$/.test(value)
            ? true
            : 'Must be a valid Stripe Product ID (starts with "prod_")';
        }),
    }),
    defineField({
      name: 'discountPercentage',
      title: 'Discount Percentage',
      type: 'number',
      description: 'Discount offered (e.g., 20 for "20% off")',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price (USD)',
      type: 'number',
      description: 'Original price in dollars (e.g., 99.99)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (USD)',
      type: 'number',
      description: 'Discounted price in dollars (e.g., 79.99)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'image',
      title: 'Upsell Image',
      type: 'image',
      description: 'Visual for the upsell offer',
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
      description: 'Text for the action button',
      initialValue: 'Claim This Offer',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'eligibleTiers',
      title: 'Eligible Partnership Tiers',
      type: 'array',
      description: 'Show this upsell only to users with these tiers (leave empty for all)',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Standard (None)', value: 'none' },
          { title: 'Affiliate', value: 'affiliate' },
          { title: 'Partner', value: 'partner' },
          { title: 'VIP', value: 'vip' },
        ],
      },
    }),
    defineField({
      name: 'eligiblePlans',
      title: 'Eligible After Purchase Of',
      type: 'array',
      description: 'Show this upsell only after purchase of specific plans (leave empty for all)',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Daily Ritual', value: 'daily_ritual' },
          { title: 'Weekend Warrior', value: 'weekend_warrior' },
          { title: 'High Performer', value: 'high_performer' },
          { title: 'Longevity Bundle', value: 'longevity_bundle' },
        ],
      },
    }),
    defineField({
      name: 'showOnPages',
      title: 'Show On Pages',
      type: 'array',
      description: 'Where should this upsell appear?',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Thank You Page', value: 'thank_you' },
          { title: 'Account Dashboard', value: 'account' },
          { title: 'Billing Page', value: 'billing' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'number',
      description: 'Higher priority upsells show first (1 = highest)',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'datetime',
      description: 'When this upsell expires (optional)',
    }),
    defineField({
      name: 'limitedTimeOffer',
      title: 'Limited Time Offer',
      type: 'boolean',
      initialValue: false,
      description: 'Display urgency indicators ("Limited time!", countdown, etc.)',
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
      offerType: 'offerType',
      isActive: 'isActive',
      media: 'image',
      discount: 'discountPercentage',
    },
    prepare({ title, offerType, isActive, media, discount }) {
      return {
        title: `${isActive ? '✅' : '❌'} ${title}`,
        subtitle: `${offerType}${discount ? ` • ${discount}% off` : ''}`,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: 'Display Priority',
      name: 'priority',
      by: [{ field: 'priority', direction: 'asc' }],
    },
    {
      title: 'Active Status',
      name: 'isActive',
      by: [{ field: 'isActive', direction: 'desc' }],
    },
    {
      title: 'Offer Type',
      name: 'offerType',
      by: [{ field: 'offerType', direction: 'asc' }],
    },
  ],
});
