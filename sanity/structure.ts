/**
 * Custom Desk Structure for Sanity Studio
 * Organizes documents into logical groups for better editor experience
 */

// @ts-expect-error - StructureResolver type exists at runtime but may have definition issues
import type { StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  DocumentIcon,
  HomeIcon,
  UsersIcon,
  ComposeIcon,
  BlockContentIcon,
  HeartIcon,
  CreditCardIcon,
  PlugIcon,
  StarIcon,
  ClipboardIcon,
} from '@sanity/icons';

export const deskStructure: StructureResolver = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Settings Group
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.listItem()
                .title('Site Settings')
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.listItem()
                .title('Navigation')
                .icon(PlugIcon)
                .child(
                  S.document()
                    .schemaType('navigation')
                    .documentId('navigation')
                ),
              S.listItem()
                .title('Stripe Settings')
                .icon(CreditCardIcon)
                .child(
                  S.document()
                    .schemaType('stripeSettings')
                    .documentId('stripeSettings')
                ),
            ])
        ),

      S.divider(),

      // Pages Group
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Home Page')
                .icon(HomeIcon)
                .child(
                  S.document()
                    .schemaType('homePage')
                    .documentId('homePage')
                ),
              S.listItem()
                .title('About Page')
                .icon(UsersIcon)
                .child(
                  S.document()
                    .schemaType('aboutPage')
                    .documentId('aboutPage')
                ),
              S.listItem()
                .title('Blends Page')
                .icon(StarIcon)
                .child(
                  S.document()
                    .schemaType('blendsPage')
                    .documentId('blendsPage')
                ),
              S.listItem()
                .title('FAQ Page')
                .icon(ClipboardIcon)
                .child(
                  S.document()
                    .schemaType('faqPage')
                    .documentId('faqPage')
                ),
              S.listItem()
                .title('Process Page')
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType('processPage')
                    .documentId('processPage')
                ),
              S.listItem()
                .title('Ingredients Sourcing')
                .icon(HeartIcon)
                .child(
                  S.document()
                    .schemaType('ingredientsSourcingPage')
                    .documentId('ingredientsSourcingPage')
                ),
              S.listItem()
                .title('Subscriptions Page')
                .icon(CreditCardIcon)
                .child(
                  S.document()
                    .schemaType('subscriptionsPage')
                    .documentId('subscriptionsPage')
                ),
              S.listItem()
                .title('Wholesale Page')
                .icon(UsersIcon)
                .child(
                  S.document()
                    .schemaType('wholesalePage')
                    .documentId('wholesalePage')
                ),
              S.divider(),
              S.listItem()
                .title('Custom Pages')
                .icon(DocumentIcon)
                .child(S.documentTypeList('page').title('Custom Pages')),
            ])
        ),

      S.divider(),

      // Content Group
      S.listItem()
        .title('Content')
        .icon(BlockContentIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.listItem()
                .title('Blog Posts')
                .icon(ComposeIcon)
                .child(S.documentTypeList('post').title('Blog Posts')),
              S.listItem()
                .title('FAQs')
                .icon(ClipboardIcon)
                .child(S.documentTypeList('faq').title('FAQs')),
              S.listItem()
                .title('Process Steps')
                .icon(CogIcon)
                .child(S.documentTypeList('processStep').title('Process Steps')),
              S.listItem()
                .title('Quality Standards')
                .icon(StarIcon)
                .child(S.documentTypeList('standard').title('Quality Standards')),
              S.listItem()
                .title('Testimonials')
                .icon(HeartIcon)
                .child(S.documentTypeList('testimonial').title('Testimonials')),
              S.listItem()
                .title('Team Members')
                .icon(UsersIcon)
                .child(S.documentTypeList('teamMember').title('Team Members')),
              S.listItem()
                .title('CTAs')
                .icon(PlugIcon)
                .child(S.documentTypeList('cta').title('Call-to-Actions')),
            ])
        ),

      S.divider(),

      // E-commerce & Marketing
      S.listItem()
        .title('E-commerce & Marketing')
        .icon(CreditCardIcon)
        .child(
          S.list()
            .title('E-commerce & Marketing')
            .items([
              S.listItem()
                .title('Subscription Products')
                .icon(CreditCardIcon)
                .child(S.documentTypeList('stripeProduct').title('Subscription Products')),
              S.listItem()
                .title('Subscription Settings')
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType('subscriptionPageSettings')
                    .documentId('subscriptionPageSettings')
                ),
              S.listItem()
                .title('Partnership Perks')
                .icon(StarIcon)
                .child(S.documentTypeList('partnershipPerk').title('Partnership Perks')),
              S.listItem()
                .title('Upsell Offers')
                .icon(HeartIcon)
                .child(S.documentTypeList('upsellOffer').title('Upsell Offers')),
              S.listItem()
                .title('Referral Rewards')
                .icon(UsersIcon)
                .child(S.documentTypeList('referralReward').title('Referral Rewards')),
              S.listItem()
                .title('Social Proof')
                .icon(HeartIcon)
                .child(
                  S.document()
                    .schemaType('socialProof')
                    .documentId('socialProof')
                ),
            ])
        ),
    ]);
