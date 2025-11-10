import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { ingredientsSourcingPageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { RippleEffect } from '@/components/RippleEffect';
import { urlFor } from '@/lib/image';

export const revalidate = 60;

async function getIngredientsSourcingPage() {
  try {
    return await client.fetch(ingredientsSourcingPageQuery);
  } catch (error) {
    console.error('Error fetching ingredients & sourcing page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getIngredientsSourcingPage();

  return {
    title: page?.seo?.metaTitle || 'Ingredients & Sourcing | Long Life',
    description: page?.seo?.metaDescription || 'Transparent sourcing from trusted growers. Organic-first, seasonal rotation, batch-dated quality.',
  };
}

export default async function IngredientsSourcingPage() {
  const page = await getIngredientsSourcingPage();

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroHeading,
    heroSubheading,
    philosophyHeading,
    philosophyIntro,
    philosophyContent,
    standardsHeading,
    standards,
    spotlightHeading,
    ingredientCategories,
    spotlightNote,
    farmHeading,
    farmText,
    farmFormNote,
    transparencyHeading,
    transparencyText,
  } = page;

  const borderColors = ['border-accent-yellow', 'border-accent-primary', 'border-accent-green', 'border-accent-yellow'];
  const gradientBgs = [
    'from-accent-yellow/80 to-accent-green/60',
    'from-accent-green/80 to-accent-primary/60',
    'from-accent-primary/80 to-accent-yellow/60',
    'from-accent-yellow/80 to-accent-primary/60',
  ];

  return (
    <>
      {/* Hero */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&h=900&fit=crop')] bg-cover bg-center scale-110 animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/80 via-accent-green/70 to-accent-yellow/60" />
        </div>

        {/* Organic overlays for depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-[1]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-accent-primary">From farm to bottle</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {heroHeading || 'Ingredients & Sourcing'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {heroSubheading || 'We source from trusted growers who share our standards. Seasonal rotation is part of the craft.'}
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Philosophy */}
      <Section className="bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-8 text-center leading-tight-90">
              {philosophyHeading || 'Our Sourcing Philosophy'}
            </h2>
            {philosophyIntro && (
              <p className="text-xl text-gray-600 leading-relaxed mb-10 text-center max-w-3xl mx-auto">
                {philosophyIntro}
              </p>
            )}
            {philosophyContent && (
              <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-700 prose-p:text-lg prose-p:leading-relaxed max-w-none">
                <RichText value={philosophyContent} />
              </div>
            )}
          </FadeIn>
        </div>
      </Section>

      {/* Our Standards */}
      {standards && standards.length > 0 && (
        <Section className="bg-gradient-to-b from-accent-cream/30 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {standardsHeading || 'Our Standards'}
              </h2>
              <p className="text-xl text-gray-600">Every ingredient meets these criteria</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 gap-8">
              {standards.map((standard: any, idx: number) => {
                const hasImage = standard.image;
                const backgroundImage = hasImage ? urlFor(standard.image).width(800).height(600).url() : null;

                return (
                  <div
                    key={standard._id}
                    className={`group relative overflow-hidden rounded-2xl min-h-[300px] flex items-end transition-all duration-500 hover:scale-105 hover:shadow-2xl border-4 ${borderColors[idx % borderColors.length]} cursor-pointer ${!backgroundImage ? `bg-gradient-to-br ${gradientBgs[idx % gradientBgs.length]}` : ''}`}
                  >
                    {backgroundImage && (
                      <>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                          <Image
                            src={backgroundImage}
                            alt={standard.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      </>
                    )}

                    {/* Certification badge */}
                    <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-accent-yellow flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <div className="relative z-10 p-8 w-full">
                      <h3 className={`font-heading text-3xl font-bold mb-4 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
                        {standard.title}
                      </h3>
                      {standard.body && (
                        <div className={`prose prose-sm max-w-none ${backgroundImage ? 'prose-invert' : 'prose-gray'}`}>
                          <RichText value={standard.body} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Ingredient Spotlight */}
      {ingredientCategories && ingredientCategories.length > 0 && (
        <Section className="bg-white">
          <div className="max-w-5xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {spotlightHeading || 'What Goes Into Our Blends'}
              </h2>
              <p className="text-xl text-gray-600">Real ingredients, nothing artificial</p>
            </FadeIn>

            <StaggerContainer staggerDelay={0.1} className="space-y-12">
              {ingredientCategories.map((category: any, idx: number) => (
                <div key={idx}>
                  <h3 className={`font-heading text-3xl font-bold mb-6 ${category.color || 'text-accent-yellow'}`}>
                    {category.categoryName}
                  </h3>
                  {category.ingredients && category.ingredients.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {category.ingredients.map((ingredient: string, ingredientIdx: number) => (
                        <div
                          key={ingredientIdx}
                          className="group border-2 border-gray-200 rounded-2xl p-5 text-center hover:border-accent-yellow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-accent-cream/20"
                        >
                          <p className="font-heading font-bold text-lg text-gray-900 group-hover:text-accent-primary transition-colors">
                            {ingredient}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </StaggerContainer>

            {spotlightNote && (
              <FadeIn direction="up" delay={0.3} className="mt-12">
                <div className="p-8 bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 rounded-2xl text-center border-2 border-accent-yellow/30">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    <strong className="text-accent-primary">That's it.</strong> {spotlightNote}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </Section>
      )}

      {/* Farm Partners */}
      {farmHeading && (
        <Section className="bg-gradient-to-b from-white to-accent-cream/30 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                {farmHeading}
              </h2>
              {farmText && (
                <p className="text-xl text-gray-700 leading-relaxed">
                  {farmText}
                </p>
              )}
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <form className="space-y-4 bg-white p-8 rounded-2xl shadow-2xl border-2 border-accent-yellow/30">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Farm Name"
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
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                  required
                />
                <input
                  type="text"
                  placeholder="What do you grow?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent-primary transition-colors"
                  required
                />
                <textarea
                  placeholder="Tell us about your farm, practices, and growing season..."
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
                    Introduce Your Farm
                  </button>
                </RippleEffect>
                {farmFormNote && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    {farmFormNote}
                  </p>
                )}
              </form>
            </FadeIn>
          </div>
        </Section>
      )}

      {/* Transparency Note */}
      {transparencyHeading && (
        <Section className="bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 p-12 rounded-2xl border-2 border-accent-yellow/30">
                <h2 className="font-heading text-3xl font-bold mb-4">
                  {transparencyHeading}
                </h2>
                {transparencyText && (
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {transparencyText}
                  </p>
                )}
                <RippleEffect
                  className="inline-block rounded-full"
                  color="rgba(255, 255, 255, 0.4)"
                >
                  <Link
                    href="mailto:hello@dringlonglife.com"
                    className="inline-block px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get In Touch
                  </Link>
                </RippleEffect>
              </div>
            </FadeIn>
          </div>
        </Section>
      )}
    </>
  );
}
