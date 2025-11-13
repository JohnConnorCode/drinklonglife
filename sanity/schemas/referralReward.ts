import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'referralReward',
  title: 'Referral Reward',
  type: 'document',
  description: 'Rewards given to users when their referrals complete a purchase',
  fields: [
    defineField({
      name: 'title',
      title: 'Reward Title',
      type: 'string',
      description: 'Name of the reward (e.g., "20% Off for You and Your Friend")',
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
      description: 'Full explanation of how the reward works',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief summary for referral landing pages (1-2 sentences)',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Controls if this reward is currently being issued',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rewardType',
      title: 'Reward Type',
      type: 'string',
      description: 'What type of reward is given?',
      options: {
        list: [
          { title: 'Discount Code', value: 'discount_code' },
          { title: 'Tier Upgrade', value: 'tier_upgrade' },
          { title: 'Account Credit', value: 'credit' },
          { title: 'Free Product', value: 'free_product' },
          { title: 'Custom', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stripeCouponId',
      title: 'Stripe Coupon ID',
      type: 'string',
      description: 'Stripe coupon ID for discount rewards (e.g., "REFER20")',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const rewardType = (context.parent as any)?.rewardType;
          if (rewardType === 'discount_code') {
            if (!value) return 'Stripe Coupon ID is required for discount code rewards';
            if (!/^[A-Z0-9_-]+$/.test(value)) {
              return 'Must be a valid Stripe coupon ID (uppercase, numbers, underscores, hyphens)';
            }
          }
          return true;
        }),
    }),
    defineField({
      name: 'discountPercentage',
      title: 'Discount Percentage',
      type: 'number',
      description: 'Percentage off (e.g., 20 for "20% off")',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'discountAmount',
      title: 'Fixed Discount Amount (USD)',
      type: 'number',
      description: 'Fixed amount off in dollars (e.g., 10.00 for "$10 off")',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'tierUpgrade',
      title: 'Tier Upgrade To',
      type: 'string',
      description: 'Which tier to upgrade the user to (for tier_upgrade rewards)',
      options: {
        list: [
          { title: 'Affiliate', value: 'affiliate' },
          { title: 'Partner', value: 'partner' },
          { title: 'VIP', value: 'vip' },
        ],
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const rewardType = (context.parent as any)?.rewardType;
          if (rewardType === 'tier_upgrade' && !value) {
            return 'Tier selection is required for tier upgrade rewards';
          }
          return true;
        }),
    }),
    defineField({
      name: 'creditAmount',
      title: 'Credit Amount (USD)',
      type: 'number',
      description: 'Account credit in dollars (for credit rewards)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'recipientType',
      title: 'Who Gets This Reward?',
      type: 'string',
      description: 'Who receives the reward when a referral completes?',
      options: {
        list: [
          { title: 'Referrer Only (person who shared the link)', value: 'referrer' },
          { title: 'Referee Only (person who signed up)', value: 'referee' },
          { title: 'Both Referrer and Referee', value: 'both' },
        ],
      },
      initialValue: 'both',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'triggerEvent',
      title: 'Trigger Event',
      type: 'string',
      description: 'When should this reward be issued?',
      options: {
        list: [
          { title: 'On Signup', value: 'signup' },
          { title: 'On First Purchase', value: 'first_purchase' },
          { title: 'On Subscription', value: 'subscription' },
          { title: 'After N Days Active', value: 'after_n_days' },
        ],
      },
      initialValue: 'first_purchase',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'daysDelay',
      title: 'Days to Wait',
      type: 'number',
      description: 'Number of days to wait before issuing reward (for after_n_days trigger)',
      validation: (Rule) => Rule.min(0).max(365),
    }),
    defineField({
      name: 'minimumPurchaseAmount',
      title: 'Minimum Purchase Amount (USD)',
      type: 'number',
      description: 'Minimum purchase amount required to trigger reward (optional)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'maxRedemptions',
      title: 'Max Redemptions Per User',
      type: 'number',
      description: 'How many times can one user earn this reward? (0 = unlimited)',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(1000),
    }),
    defineField({
      name: 'expirationDays',
      title: 'Reward Expiration (Days)',
      type: 'number',
      description: 'How many days after issuance does the reward expire? (0 = never)',
      initialValue: 30,
      validation: (Rule) => Rule.min(0).max(365),
    }),
    defineField({
      name: 'landingPageHeadline',
      title: 'Landing Page Headline',
      type: 'string',
      description: 'Headline for /referral/[code] page (e.g., "Get 20% off your first order!")',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'landingPageImage',
      title: 'Landing Page Image',
      type: 'image',
      description: 'Hero image for referral landing page',
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
      name: 'emailTemplate',
      title: 'Email Template',
      type: 'text',
      rows: 5,
      description: 'Email content sent to referrer when reward is issued (optional)',
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'number',
      description: 'If multiple rewards are active, which one to use? (1 = highest)',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1).max(100),
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
      rewardType: 'rewardType',
      isActive: 'isActive',
      recipientType: 'recipientType',
      media: 'landingPageImage',
    },
    prepare({ title, rewardType, isActive, recipientType, media }) {
      return {
        title: `${isActive ? '✅' : '❌'} ${title}`,
        subtitle: `${rewardType} • ${recipientType}`,
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
      title: 'Reward Type',
      name: 'rewardType',
      by: [{ field: 'rewardType', direction: 'asc' }],
    },
  ],
});
