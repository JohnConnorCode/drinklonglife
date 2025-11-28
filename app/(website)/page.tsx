import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { homePageQuery } from '@/lib/sanity.queries';
import { logger } from '@/lib/logger';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { BlendsGrid } from '@/components/BlendsGrid';
import { urlFor } from '@/lib/image';
import { FadeIn, StaggerContainer, ParallaxElement } from '@/components/animations';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { StatsSection } from '@/components/StatsSection';
import { HeroSlider } from '@/components/HeroSlider';
import { NewsletterForm } from '@/components/NewsletterForm';
import { getFeaturedProducts } from '@/lib/supabase/queries/products';

export const revalidate = 60;

async function getHomePage() {
  try {
    return await client.fetch(homePageQuery);
  } catch (error) {
    logger.error('Error fetching home page:', error);
    return null;
  }
}

async function getFeaturedBlends() {
  try {
    return await getFeaturedProducts();
  } catch (error) {
    logger.error('Error fetching featured blends:', error);
    return [];
  }
}

export default async function Home() {
  const homePage = await getHomePage();
  const featuredBlends = await getFeaturedBlends();

  if (!homePage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load home page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroSlides,
    valueProps,
    featuredBlendsHeading,
    featuredBlendsSubheading,
    featuredBlendsCtaText,
    featuredBlendsSizingText,
    featuredBlendsDeliveryText,
    statsHeading,
    testimonialsHeading,
    testimonialsSubheading,
    processHeading,
    processIntro,
    processSteps,
    newsletterHeading: _newsletterHeading,
    newsletterSubheading: _newsletterSubheading,
    newsletterPlaceholder: _newsletterPlaceholder,
    newsletterButtonText: _newsletterButtonText,
    communityBlurb: _communityBlurb,
    socialProof
  } = homePage;

  // Default slides if none are set in Sanity
  const defaultSlides = [
    {
      heading: 'Peak Performance Starts Here',
      subheading: 'Cold-pressed, small-batch juices crafted for serious athletes and health-conscious humans.',
      ctaText: 'Shop Blends',
      ctaLink: '/blends',
      desktopImage: { asset: { url: '/slider-desktop-1.png' } },
      mobileImage: { asset: { url: '/slider-mobile-1.png' } },
    },
    {
      heading: 'Real Ingredients. Real Results.',
      subheading: 'No concentrates. No shortcuts. Just whole fruits, roots, and greens pressed fresh weekly.',
      ctaText: 'Our Process',
      ctaLink: '/how-we-make-it',
      desktopImage: { asset: { url: '/slider-desktop-2.png' } },
      mobileImage: { asset: { url: '/slider-mobile-2.png' } },
    },
    {
      heading: 'Small-Batch Integrity',
      subheading: 'Limited runs. First come, first served. Made in Indiana with ingredients you can trace.',
      ctaText: 'Learn More',
      ctaLink: '/about',
      desktopImage: { asset: { url: '/slider-desktop-3.png' } },
      mobileImage: { asset: { url: '/slider-mobile-3.png' } },
    },
  ];

  // Use Sanity heroSlides if available AND they have valid images, otherwise fall back to defaults
  const hasValidSanitySlides = heroSlides && heroSlides.length > 0 &&
    heroSlides.some((slide: any) => slide.desktopImage || slide.mobileImage || slide.image);
  const slides = hasValidSanitySlides ? heroSlides : defaultSlides;

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider slides={slides} />

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
            <BlendsGrid blends={featuredBlends} showFilters={false} />
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
                // Default step images from /public - fallback if no Sanity image
                const defaultStepImages = [
                  '/step1.png',
                  '/step2.png',
                  '/step3.png',
                  '/step4.png',
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
                      <ParallaxElement speed={isEven ? 0.3 : -0.3}>
                        <FadeIn
                          direction={isEven ? 'left' : 'right'}
                          delay={0.2}
                          className="relative group"
                        >
                          {/* Main Image Container */}
                          <div className="relative h-[200px] sm:h-[240px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                            <Image
                              src={step.image?.asset ? urlFor(step.image).url() : defaultStepImages[idx]}
                              alt={step.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              loading="eager"
                              quality={85}
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
          <FadeIn direction="right" className="space-y-6">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Join the Long Life Newsletter
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Be the first to know about new Bombs, pop-up events, weekly batch drops, giveaways, and behind-the-scenes lab work.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">
                Your health journey deserves front-row access.
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="space-y-3">
              <NewsletterForm />
              <p className="text-sm text-gray-600">
                We send only value — fresh drops, no spam.
              </p>
            </div>
          </FadeIn>

          {/* Right Side - Product Imagery */}
          <div className="relative h-[500px] hidden md:block">
            {/* Three mobile slider images staggered vertically with strong parallax */}
            {[
              { src: '/slider-mobile-1.png', alt: 'Peak Performance Starts Here' },
              { src: '/slider-mobile-2.png', alt: 'Real Ingredients. Real Results' },
              { src: '/slider-mobile-3.png', alt: 'Small-Batch Integrity' },
            ].map((image, idx) => {
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

              return (
                <ParallaxElement key={idx} speed={speeds[idx]}>
                  <div className={`absolute ${positions[idx]} ${zIndexClasses[idx]} rounded-3xl shadow-2xl border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300`}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 0px, 250px"
                      priority={idx === 0}
                    />
                  </div>
                </ParallaxElement>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Referral Program Section */}
      <Section className="py-20 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Share the Love, Earn Rewards
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Refer friends to Long Life and earn exclusive rewards. Get 15% off for every friend who makes their first purchase.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-3">🔗</div>
                <h3 className="font-semibold text-lg mb-2">Share Your Link</h3>
                <p className="text-sm text-gray-600">Get your unique referral link and share it with friends</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-semibold text-lg mb-2">They Get 10% Off</h3>
                <p className="text-sm text-gray-600">Friends receive a welcome discount on their first order</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold text-lg mb-2">You Get 15% Credit</h3>
                <p className="text-sm text-gray-600">Earn rewards after their first purchase</p>
              </div>
            </div>

            <Link
              href="/referral"
              className="inline-block px-8 py-4 bg-accent-primary text-white font-semibold rounded-full hover:bg-accent-dark transition-all shadow-lg hover:shadow-xl"
            >
              Learn More About Referrals
            </Link>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
