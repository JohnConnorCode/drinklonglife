import { logger } from "@/lib/logger";
import { Metadata } from 'next';
import { client } from '@/lib/sanity.client';
import { wholesalePageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { RippleEffect } from '@/components/RippleEffect';

export const revalidate = 60;

async function getWholesalePage() {
  try {
    return await client.fetch(wholesalePageQuery);
  } catch (error) {
    logger.error('Error fetching wholesale page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWholesalePage();

  return {
    title: page?.seo?.metaTitle || 'Wholesale & Teams | Long Life',
    description: page?.seo?.metaDescription || 'Partner with Long Life for wholesale juice programs. Retail bottles, bulk jugs, team wellness fridges, and event bars.',
  };
}

export default async function WholesalePage() {
  const page = await getWholesalePage();

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroHeading,
    heroTagline,
    heroText,
    partnersHeading,
    partnerTypes,
    programsHeading,
    programs,
    whyHeading,
    benefits,
    ctaHeading,
    ctaText,
    ctaNote,
  } = page;

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-24 relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Business Partnerships</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              {heroHeading || 'Wholesale & Teams'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            {heroTagline && (
              <p className="text-2xl sm:text-3xl text-accent-primary font-semibold mb-6">
                {heroTagline}
              </p>
            )}
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            {heroText && (
              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {heroText}
              </p>
            )}
          </FadeIn>
        </div>
      </Section>

      {/* Who We Work With */}
      {partnerTypes && partnerTypes.length > 0 && (
        <Section className="bg-white">
          <div className="max-w-5xl mx-auto">
            <FadeIn direction="up" className="text-center mb-16">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {partnersHeading || 'Who We Work With'}
              </h2>
              <div className="w-24 h-1 bg-accent-primary mx-auto mt-6" />
            </FadeIn>
            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((partner: any, idx: number) => (
                <div
                  key={idx}
                  className="group text-center p-8 bg-gradient-to-br from-white to-accent-cream/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent-yellow"
                >
                  {partner.emoji && (
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {partner.emoji}
                    </div>
                  )}
                  <h3 className="font-heading text-2xl font-bold mb-3 text-gray-900">
                    {partner.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Programs */}
      {programs && programs.length > 0 && (
        <Section className="bg-gradient-to-b from-accent-cream/30 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {programsHeading || 'Wholesale Programs'}
              </h2>
              <p className="text-xl text-gray-600">Flexible options for every business</p>
            </FadeIn>

            <StaggerContainer staggerDelay={0.1} className="space-y-6">
              {programs.map((program: any, idx: number) => (
                <div key={idx} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-accent-green">
                  <h3 className="font-heading text-3xl font-bold mb-4 text-gray-900">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {program.description}
                    </p>
                  )}
                  {program.options && program.options.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {program.options.map((option: any, optionIdx: number) => (
                        <div
                          key={optionIdx}
                          className="border-2 border-gray-200 rounded-xl p-5 hover:border-accent-yellow transition-colors bg-gradient-to-br from-white to-accent-cream/20"
                        >
                          <p className="font-heading font-bold text-lg mb-2 text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {program.note && (
                    <div className={`border-l-4 ${program.noteColor || 'border-accent-green'} pl-6 py-2 bg-gradient-to-r from-accent-yellow/10 to-transparent`}>
                      <p className="text-sm font-bold mb-1 text-gray-900">
                        {program.note.split('\n')[0]}
                      </p>
                      {program.note.split('\n').slice(1).map((line: string, lineIdx: number) => (
                        <p key={lineIdx} className="text-sm text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Why Partner With Us */}
      {benefits && benefits.length > 0 && (
        <Section className="bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {whyHeading || 'Why Partner With Long Life'}
              </h2>
              <p className="text-xl text-gray-600">Built for businesses that care</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit: any, idx: number) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 p-6 bg-gradient-to-br from-white to-accent-cream/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-accent-yellow"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-green rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold mb-2 text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Application CTA */}
      {ctaHeading && (
        <Section className="bg-gradient-to-b from-white to-accent-cream/30 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                {ctaHeading}
              </h2>
              {ctaText && (
                <p className="text-xl text-gray-700 leading-relaxed">
                  {ctaText}
                </p>
              )}
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <form className="space-y-4 bg-white p-8 rounded-2xl shadow-2xl border-2 border-accent-yellow/30">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Business Name"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Name"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                    required
                  />
                </div>
                <select
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                  required
                >
                  <option value="">Select Program Type</option>
                  <option value="retail">Retail Bottles & Shots</option>
                  <option value="bulk">Refillable Bulk Jugs</option>
                  <option value="wellness">Team Wellness Fridge</option>
                  <option value="events">Event Bars & Pop-Ups</option>
                </select>
                <textarea
                  placeholder="Tell us about your business and how you'd serve Long Life..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors resize-none"
                  required
                />
                <RippleEffect
                  className="w-full rounded-full"
                  color="rgba(255, 255, 255, 0.4)"
                >
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Apply for Wholesale Partnership
                  </button>
                </RippleEffect>
                {ctaNote && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    {ctaNote}
                  </p>
                )}
              </form>
            </FadeIn>
          </div>
        </Section>
      )}
    </>
  );
}
