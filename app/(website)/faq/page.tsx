import { logger } from "@/lib/logger";
import { Metadata } from 'next';
import { client } from '@/lib/sanity.client';
import { faqQuery, faqPageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { FAQAccordion } from '@/components/FAQAccordion';
import { FadeIn } from '@/components/animations';

export const revalidate = 60;

async function getFAQs() {
  try {
    return await client.fetch(faqQuery);
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    return [];
  }
}

async function getFAQPage() {
  try {
    return await client.fetch(faqPageQuery);
  } catch (error) {
    logger.error('Error fetching FAQ page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const faqPage = await getFAQPage();

  return {
    title: faqPage?.seo?.metaTitle || 'FAQ | Long Life',
    description: faqPage?.seo?.metaDescription || 'Frequently asked questions about Long Life juices and ordering.',
  };
}

export default async function FAQPage() {
  const faqs = await getFAQs();
  const faqPage = await getFAQPage();

  // Split FAQs into featured and regular
  const featuredFAQs = faqs.filter((faq: any) => faq.isFeatured);
  const regularFAQs = faqs.filter((faq: any) => !faq.isFeatured);

  return (
    <>
      {/* Hero Section */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1600&h=900&fit=crop')] bg-cover bg-center scale-110 animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/80 via-accent-green/70 to-accent-yellow/60" />
        </div>

        {/* Organic overlays for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 z-[1]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-accent-primary">Got Questions?</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {faqPage?.heading || 'Frequently Asked Questions'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {faqPage?.subheading || 'Find answers to common questions about our products and service.'}
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* FAQs Section */}
      <Section className="bg-white">
        {faqs.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {/* Featured FAQs */}
            {featuredFAQs.length > 0 && (
              <div className="mb-16">
                <FadeIn direction="up">
                  <h2 className="font-heading text-3xl font-bold mb-8 text-center">
                    Popular Questions
                  </h2>
                </FadeIn>
                <FAQAccordion faqs={featuredFAQs} />
              </div>
            )}

            {/* All FAQs */}
            {regularFAQs.length > 0 && (
              <div>
                {featuredFAQs.length > 0 && (
                  <FadeIn direction="up">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      <h2 className="font-heading text-2xl font-bold text-gray-900">
                        More Questions
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>
                  </FadeIn>
                )}
                <FAQAccordion faqs={regularFAQs} />
              </div>
            )}
          </div>
        ) : (
          <FadeIn direction="up" className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-2">No FAQs available yet</p>
              <p className="text-sm text-gray-500">
                Check back soon for answers to common questions!
              </p>
            </div>
          </FadeIn>
        )}
      </Section>

      {/* Contact CTA */}
      <Section className="bg-gradient-to-b from-white to-accent-cream/30">
        <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 p-12 rounded-2xl border-2 border-accent-yellow/30">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We're here to help! Reach out to our team and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:hello@drinklonglife.com"
              className="inline-block px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </a>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
