import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'socialProof',
  title: 'Social Proof & Stats',
  type: 'document',
  fields: [
    defineField({
      name: 'stats',
      title: 'Community Stats',
      type: 'object',
      fields: [
        defineField({
          name: 'customersServed',
          title: 'Customers Served',
          type: 'number',
          description: 'Total number of customers',
        }),
        defineField({
          name: 'batchesMade',
          title: 'Batches Made',
          type: 'number',
          description: 'Total number of batches produced',
        }),
        defineField({
          name: 'yearsInBusiness',
          title: 'Years in Business',
          type: 'number',
        }),
        defineField({
          name: 'bottlesProduced',
          title: 'Bottles Produced',
          type: 'number',
        }),
      ],
    }),
    defineField({
      name: 'communityHashtag',
      title: 'Community Hashtag',
      type: 'string',
      description: 'E.g., "#DrinkLongLife"',
    }),
    defineField({
      name: 'communityMessage',
      title: 'Community Message',
      type: 'blockContent',
      description: 'Message encouraging community participation and word-of-mouth',
    }),
    defineField({
      name: 'featuredTestimonials',
      title: 'Featured Testimonials',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'testimonial' },
        },
      ],
      description: 'Select 3-5 testimonials to feature on homepage',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Social Proof Settings',
      };
    },
  },
});
