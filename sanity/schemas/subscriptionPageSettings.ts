import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'subscriptionPageSettings',
  title: 'Subscription Page Settings',
  type: 'document',
  description: 'Global settings for the subscription/pricing page',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Main headline for the subscription page',
      initialValue: 'Choose Your Plan',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      description: 'Supporting text below the title',
      rows: 2,
    }),
    defineField({
      name: 'showBillingToggle',
      title: 'Show Billing Cycle Toggle',
      type: 'boolean',
      description: 'Enable monthly/yearly billing toggle',
      initialValue: false,
    }),
    defineField({
      name: 'monthlyLabel',
      title: 'Monthly Label',
      type: 'string',
      initialValue: 'Monthly',
      hidden: ({ document }) => !document?.showBillingToggle,
    }),
    defineField({
      name: 'yearlyLabel',
      title: 'Yearly Label',
      type: 'string',
      initialValue: 'Yearly',
      hidden: ({ document }) => !document?.showBillingToggle,
    }),
    defineField({
      name: 'yearlyDiscountBadge',
      title: 'Yearly Discount Badge',
      type: 'string',
      description: 'Text shown for yearly savings (e.g., "Save 20%")',
      hidden: ({ document }) => !document?.showBillingToggle,
    }),
    defineField({
      name: 'faq',
      title: 'FAQ Section',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'faq' } }],
      description: 'Frequently asked questions to display below pricing',
    }),
    defineField({
      name: 'ctaSection',
      title: 'Bottom CTA Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Bottom CTA',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'title',
          title: 'CTA Title',
          type: 'string',
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: 'description',
          title: 'CTA Description',
          type: 'text',
          rows: 2,
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: 'buttonLink',
          title: 'Button Link',
          type: 'string',
          hidden: ({ parent }) => !parent?.enabled,
        }),
      ],
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
    prepare() {
      return {
        title: 'Subscription Page Settings',
      };
    },
  },
});
