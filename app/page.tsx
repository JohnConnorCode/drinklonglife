import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { homePageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { BlendCard } from '@/components/BlendCard';
import { urlFor } from '@/lib/image';
import { FadeIn, StaggerContainer, FloatingElement, ParallaxElement } from '@/components/animations';
import { CountUp } from '@/components/animations/CountUp';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { StatsSection } from '@/components/StatsSection';
import { HeroSlider } from '@/components/HeroSlider';

export const revalidate = 60;

async function getHomePage() {
  try {
    return await client.fetch(homePageQuery);
  } catch (error) {
    console.error('Error fetching home page:', error);
    return null;
  }
}

export default async function Home() {
  const homePage = await getHomePage();

  if (!homePage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load home page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroSlides,
    hero,
    valueProps,
    featuredBlendsHeading,
    featuredBlendsSubheading,
    featuredBlends,
    featuredBlendsCtaText,
    featuredBlendsSizingText,
    featuredBlendsDeliveryText,
    statsHeading,
    testimonialsHeading,
    testimonialsSubheading,
    processHeading,
    processIntro,
    processSteps,
    newsletterHeading,
    newsletterSubheading,
    newsletterPlaceholder,
    newsletterButtonText,
    communityBlurb,
    socialProof
  } = homePage;

  // Default slides if none are set in Sanity
  const defaultSlides = [
    {
      heading: 'Peak Performance Starts Here',
      subheading: 'Cold-pressed, small-batch juices crafted for serious athletes and health-conscious humans.',
      ctaText: 'Shop Blends',
      ctaLink: '/blends',
    },
    {
      heading: 'Real Ingredients. Real Results.',
      subheading: 'No concentrates. No shortcuts. Just whole fruits, roots, and greens pressed fresh weekly.',
      ctaText: 'Our Process',
      ctaLink: '/how-we-make-it',
    },
    {
      heading: 'Small-Batch Integrity',
      subheading: 'Limited runs. First come, first served. Made in Indiana with ingredients you can trace.',
      ctaText: 'Learn More',
      ctaLink: '/about',
    },
  ];

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides;

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider slides={slides} />

      {/* Legacy Hero Fallback - Hidden */}
      <div className="hidden">
        <Section className="bg-gradient-to-br from-gray-50 to-white py-20 sm:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn direction="up" delay={0.2}>
                <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-4 leading-tight-90">
                  Long Life
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.4}>
                {hero?.heading ? (
                  <p className="text-2xl font-semibold mb-4 leading-tight-95">
                    {hero.heading}
                  </p>
                ) : (
                  <p className="text-2xl font-semibold mb-4 leading-tight-95">
                    Small-batch juice for real humans.
                  </p>
                )}
              </FadeIn>
              <FadeIn direction="up" delay={0.6}>
                {hero?.subheading ? (
                  <p className="text-lg text-muted mb-2 leading-relaxed">
                    {hero.subheading}
                  </p>
                ) : (
                  <p className="text-lg text-muted mb-2 leading-relaxed">
                    Cold-pressed, ingredient-dense, made weekly in Indiana.
                  </p>
                )}
                <p className="text-lg font-semibold mb-8">
                  Drink what your body recognizes.
                </p>
              </FadeIn>
              <FadeIn direction="up" delay={0.8}>
              <div className="flex gap-4">
              {hero?.ctaPrimary ? (
                <Link
                  href={hero.ctaPrimary.target?.pageRef?.slug?.current
                    ? `/${hero.ctaPrimary.target.pageRef.slug.current}`
                    : hero.ctaPrimary.target?.externalUrl || '/blends'}
                  className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  {hero.ctaPrimary.label}
                </Link>
              ) : (
                <Link
                  href="/blends"
                  className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  Shop Weekly Batches
                </Link>
              )}
              {hero?.ctaSecondary ? (
                <Link
                  href={hero.ctaSecondary.target?.pageRef?.slug?.current
                    ? `/${hero.ctaSecondary.target.pageRef.slug.current}`
                    : hero.ctaSecondary.target?.externalUrl || '#newsletter'}
                  className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
                >
                  {hero.ctaSecondary.label}
                </Link>
              ) : (
                <Link
                  href="#newsletter"
                  className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
                >
                  Join the List
                </Link>
              )}
              </div>
            </FadeIn>
          </div>
          {hero?.image && (
            <FloatingElement yOffset={15} duration={4}>
              <FadeIn direction="left" delay={0.4}>
                <div className="relative h-96 md:h-full">
                  <Image
                    src={urlFor(hero.image).url()}
                    alt="Long Life Juice"
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    priority
                  />
                </div>
              </FadeIn>
            </FloatingElement>
          )}
        </div>
      </Section>
      </div>

      {/* Value Props */}
      {valueProps && valueProps.length > 0 && (
        <Section className="bg-gradient-to-br from-accent-cream via-white to-accent-yellow/20">
          <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop: any, idx: number) => {
              // Use Sanity image if available, otherwise use a solid gradient background
              const hasImage = prop.image || prop.icon;
              const backgroundImage = hasImage ? urlFor(prop.image || prop.icon).width(800).height(600).url() : null;
              const borderColors = ['border-accent-yellow', 'border-accent-green', 'border-accent-primary'];
              const gradientBgs = [
                'bg-gradient-to-br from-accent-yellow/80 to-accent-green/60',
                'bg-gradient-to-br from-accent-green/80 to-accent-primary/60',
                'bg-gradient-to-br from-accent-primary/80 to-accent-yellow/60',
              ];

              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl min-h-[300px] sm:min-h-[400px] flex items-end transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 sm:border-4 ${borderColors[idx % 3]} cursor-pointer ${!backgroundImage ? gradientBgs[idx % 3] : ''}`}
                  style={{
                    transform: 'perspective(1000px)',
                  }}
                >
                  {/* Background Image (if available) */}
                  {backgroundImage && (
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                      <Image
                        src={backgroundImage}
                        alt={prop.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-all duration-500" />

                  {/* Content */}
                  <div className="relative z-10 p-6 sm:p-8 text-white transform transition-transform duration-500 group-hover:translate-y-0">
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
                      {prop.title}
                    </h3>
                    <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                      {prop.body}
                    </p>
                  </div>

                  {/* Decorative corner element */}
                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-accent-yellow/20 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                    <div className="w-6 h-6 rounded-full bg-accent-yellow" />
                  </div>
                </div>
              );
            })}
          </StaggerContainer>
        </Section>
      )}

      {/* Featured Blends */}
      {featuredBlends && featuredBlends.length > 0 && (
        <Section className="bg-gradient-to-b from-white via-accent-green/10 to-white relative overflow-hidden">
          {/* Decorative organic shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold mb-4 leading-tight-90">
                {featuredBlendsHeading || 'Featured Blends'}
              </h2>
              <p className="text-lg text-muted italic">
                {featuredBlendsSubheading || 'Sold in weekly drops. Reserve early.'}
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredBlends.map((blend: any) => (
                <BlendCard key={blend._id} blend={blend} />
              ))}
            </div>
            <div className="text-center mt-12">
              {featuredBlendsSizingText && (
                <p className="text-muted mb-4">
                  {featuredBlendsSizingText}
                </p>
              )}
              {featuredBlendsDeliveryText && (
                <p className="text-sm text-muted mb-6">
                  {featuredBlendsDeliveryText}
                </p>
              )}
              <Link
                href="/blends"
                className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity inline-block"
              >
                {featuredBlendsCtaText || 'Reserve This Week'}
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* Stats Section */}
      {socialProof?.stats && (
        <Section className="bg-accent-primary text-white relative overflow-hidden">
          {/* Organic pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 border-2 border-accent-yellow rounded-full" />
            <div className="absolute bottom-10 right-10 w-80 h-80 border-2 border-accent-green rounded-full" />
          </div>

          <div className="relative z-10">
            {statsHeading && (
              <FadeIn direction="up" className="text-center mb-12">
                <h2 className="font-heading text-4xl font-bold text-white leading-tight-90">
                  {statsHeading}
                </h2>
              </FadeIn>
            )}
            <StatsSection
              lightText
              stats={[
                { label: 'Customers Served', value: socialProof.stats.customersServed || 0, suffix: '+' },
                { label: 'Batches Made', value: socialProof.stats.batchesMade || 0, suffix: '+' },
                { label: 'Years Crafting', value: socialProof.stats.yearsInBusiness || 0 },
                { label: 'Bottles Produced', value: socialProof.stats.bottlesProduced || 0, suffix: '+' },
              ]}
            />
          </div>
        </Section>
      )}

      {/* Testimonials */}
      {socialProof?.featuredTestimonials && socialProof.featuredTestimonials.length > 0 && (
        <Section className="bg-gradient-to-br from-accent-cream to-accent-yellow/20">
          <FadeIn direction="up" className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4 leading-tight-90">
              {testimonialsHeading || 'What People Say'}
            </h2>
            <p className="text-lg text-muted">
              {testimonialsSubheading || 'Real results from real humans.'}
            </p>
          </FadeIn>
          <TestimonialCarousel testimonials={socialProof.featuredTestimonials} />
        </Section>
      )}

      {/* Process */}
      {processSteps && processSteps.length > 0 && (
        <Section className="bg-accent-green/20 relative overflow-hidden !py-12 sm:!py-16">
          {/* Decorative organic shapes */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-accent-green/30 rounded-full blur-3xl" />

          <div className="relative z-10">
            <FadeIn direction="up" className="text-center mb-8">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3 leading-tight-90">
                {processHeading || 'How We Make It'}
              </h2>
              {processIntro && (
                <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  {processIntro}
                </p>
              )}
            </FadeIn>

            <div className="space-y-8 sm:space-y-10">
              {processSteps.map((step: any, idx: number) => {
                const isEven = idx % 2 === 0;
                const gradients = [
                  'from-accent-yellow/20 to-accent-green/20',
                  'from-accent-green/20 to-accent-primary/20',
                  'from-accent-primary/20 to-accent-yellow/20',
                ];

                return (
                  <div
                    key={step._id}
                    className="relative"
                  >
                    <div className={`grid md:grid-cols-2 gap-6 items-center ${!isEven ? 'md:grid-flow-dense' : ''}`}>
                      {/* Content Side */}
                      <FadeIn
                        direction={isEven ? 'right' : 'left'}
                        delay={0.1}
                        className={`${!isEven ? 'md:col-start-2' : ''} relative z-10`}
                      >
                        <div className="space-y-3">
                          {/* Step Number Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradients[idx % 3]} backdrop-blur-sm border-2 border-white shadow-md`}>
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                              <span className="font-heading text-base font-bold text-accent-primary">
                                {idx + 1}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                              Step {idx + 1}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            {step.title}
                          </h3>

                          {/* Body */}
                          {step.body && (
                            <div className="prose prose-sm sm:prose-base prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed max-w-none">
                              <RichText value={step.body} />
                            </div>
                          )}

                          {/* Decorative line */}
                          <div className={`w-16 h-0.5 bg-gradient-to-r ${gradients[idx % 3]} rounded-full`} />
                        </div>
                      </FadeIn>

                      {/* Image Side with Parallax */}
                      {step.image && (
                        <ParallaxElement speed={isEven ? 0.3 : -0.3}>
                          <FadeIn
                            direction={isEven ? 'left' : 'right'}
                            delay={0.2}
                            className="relative group"
                          >
                            {/* Main Image Container */}
                            <div className="relative h-[200px] sm:h-[240px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                              <Image
                                src={urlFor(step.image).url()}
                                alt={step.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              {/* Gradient overlay on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % 3]} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                            </div>

                            {/* Floating decorative element */}
                            <div className={`absolute ${isEven ? '-right-4 -bottom-4' : '-left-4 -bottom-4'} w-20 h-20 bg-gradient-to-br ${gradients[idx % 3]} rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />

                            {/* Corner icon badge with brand colors */}
                            <div className={`absolute ${isEven ? 'top-3 left-3' : 'top-3 right-3'} w-10 h-10 rounded-full bg-accent-primary border-2 border-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                              {idx === 0 && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                              )}
                              {idx === 1 && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                              )}
                              {idx === 2 && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {idx > 2 && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              )}
                            </div>
                          </FadeIn>
                        </ParallaxElement>
                      )}
                    </div>

                    {/* Connecting line to next step */}
                    {idx < processSteps.length - 1 && (
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -bottom-16 z-0">
                        <div className="w-1 h-16 bg-gradient-to-b from-accent-primary/30 to-transparent" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Community/Newsletter */}
      <Section className="bg-gradient-to-br from-accent-yellow/40 via-accent-green/20 to-accent-primary/30 relative min-h-[700px] overflow-hidden" id="newsletter">
        {/* Enhanced organic background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-yellow/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-green/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content & Form */}
          <FadeIn direction="right" className="space-y-8">
            <div>
              <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {newsletterHeading || 'Get first access to drops and new blends'}
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {newsletterSubheading || 'Enter your email to reserve before batches sell out.'}
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-yellow flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Early Access</p>
                  <p className="text-sm text-gray-600">Reserve before public</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Exclusive Drops</p>
                  <p className="text-sm text-gray-600">Members-only blends</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">New Recipes</p>
                  <p className="text-sm text-gray-600">Be first to try</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-yellow/70 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Weekly Updates</p>
                  <p className="text-sm text-gray-600">Fresh batch alerts</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={newsletterPlaceholder || 'Enter your email'}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white shadow-md text-base sm:text-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-accent-primary text-white rounded-xl font-bold hover:bg-accent-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg"
                >
                  {newsletterButtonText || 'Join Now'}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No spam, unsubscribe anytime
                </p>
                {socialProof?.stats?.customersServed && (
                  <p className="font-semibold text-gray-900">
                    Join{' '}
                    <span className="text-accent-primary">
                      <CountUp value={socialProof.stats.customersServed} duration={2} suffix="+" />
                    </span>
                    {' '}subscribers
                  </p>
                )}
              </div>
            </form>

            {communityBlurb && (
              <p className="text-sm text-gray-600 italic">
                {communityBlurb}
              </p>
            )}
          </FadeIn>

          {/* Right Side - Product Imagery */}
          <div className="relative h-[500px] hidden md:block">
            {featuredBlends && featuredBlends.length > 0 ? (
              <>
                {/* Three images staggered vertically with strong parallax */}
                {featuredBlends.slice(0, 3).map((blend: any, idx: number) => {
                  // Stronger parallax speeds for noticeable movement
                  const speeds = [0.7, 0.9, 1.1];
                  // Positioned in middle area, aligned with newsletter content, evenly staggered
                  const positions = [
                    'top-32 left-1/2 -translate-x-1/2 w-56 h-80', // Center-left, middle
                    'top-20 right-8 w-48 h-72',  // Right side, higher
                    'top-44 left-4 w-44 h-64',   // Left side, lower
                  ];
                  // High z-index so they appear above section above
                  const zIndexClasses = ['z-50', 'z-40', 'z-30'];

                  return blend.image ? (
                    <ParallaxElement key={idx} speed={speeds[idx]}>
                      <div className={`absolute ${positions[idx]} ${zIndexClasses[idx]} rounded-3xl shadow-2xl border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300`}>
                        <Image
                          src={urlFor(blend.image).width(500).height(700).url()}
                          alt={blend.name || 'Long Life Juice'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 0px, 250px"
                          priority={idx === 0}
                        />
                      </div>
                    </ParallaxElement>
                  ) : null;
                })}
              </>
            ) : (
              <>
                {/* Fallback gradients */}
                <ParallaxElement speed={0.7}>
                  <div className="absolute top-32 left-1/2 -translate-x-1/2 w-56 h-80 z-50 bg-gradient-to-br from-accent-green to-accent-primary rounded-3xl shadow-2xl border-4 border-white" />
                </ParallaxElement>
                <ParallaxElement speed={0.9}>
                  <div className="absolute top-20 right-8 w-48 h-72 z-40 bg-gradient-to-br from-accent-yellow to-accent-green rounded-3xl shadow-2xl border-4 border-white" />
                </ParallaxElement>
                <ParallaxElement speed={1.1}>
                  <div className="absolute top-44 left-4 w-44 h-64 z-30 bg-gradient-to-br from-accent-primary to-accent-yellow rounded-3xl shadow-2xl border-4 border-white" />
                </ParallaxElement>
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
