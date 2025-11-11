import { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { processPageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';
import { FadeIn } from '@/components/animations/FadeIn';

export const revalidate = 60;

async function getProcessPage() {
  try {
    return await client.fetch(processPageQuery);
  } catch (error) {
    console.error('Error fetching process page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const processPage = await getProcessPage();

  return {
    title: processPage?.seo?.metaTitle || 'How We Make It | Long Life',
    description: processPage?.seo?.metaDescription || 'Cold-pressed, same-day bottled, no shortcuts. Learn about our process and commitment to quality.',
  };
}

export default async function HowWeMakeItPage() {
  const processPage = await getProcessPage();

  if (!processPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroHeading,
    heroSubheading,
    processSteps,
    whyHeading,
    whyCards,
    commitmentHeading,
    commitmentText,
    commitmentBadge,
    disclaimer,
  } = processPage;

  const gradients = [
    'from-accent-yellow/30 to-accent-yellow/10',
    'from-accent-primary/30 to-accent-primary/10',
    'from-accent-green/30 to-accent-green/10',
  ];

  return (
    <>
      {/* Hero */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 animate-ken-burns"
            style={{ backgroundImage: 'url(/slider-desktop-2.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-accent-primary/50 to-accent-green/40" />
        </div>

        {/* Organic overlays for depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-[1]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6 text-white leading-tight">
              {heroHeading || 'How We Make It'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <p className="text-xl text-white/90 leading-relaxed">
              {heroSubheading || 'Cold-pressed, same-day bottled, no shortcuts.'}
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Process Steps */}
      {processSteps && processSteps.length > 0 && (
        <Section className="bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {processSteps.map((step: any, idx: number) => {
                // Default step images from /public - fallback if no Sanity image
                const defaultStepImages = [
                  '/step1.png',
                  '/step2.png',
                  '/step3.png',
                  '/step4.png',
                ];

                return (
                  <FadeIn key={step._id} direction="up" delay={idx * 0.1}>
                    <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-accent-primary/30 transition-all duration-500 hover:shadow-xl">
                      {/* Step Image */}
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={step.image?.asset ? urlFor(step.image).url() : defaultStepImages[idx]}
                          alt={step.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-b ${gradients[idx % 3]} opacity-40`} />

                        {/* Step number badge */}
                        <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <span className="font-heading text-xl font-bold text-accent-primary">
                            {idx + 1}
                          </span>
                        </div>
                      </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-bold mb-3 text-gray-900">
                        {step.title}
                      </h3>
                      {step.body && (
                        <div className="prose prose-sm prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed max-w-none">
                          <RichText value={step.body} />
                        </div>
                      )}
                    </div>

                    {/* Decorative corner accent */}
                    <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${gradients[idx % 3]} rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  </div>
                </FadeIn>
              );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Why It Matters */}
      {whyCards && whyCards.length > 0 && (
        <Section className="bg-gradient-to-b from-accent-cream/30 to-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up">
              <h2 className="font-heading text-4xl font-bold mb-12 text-center text-gray-900">
                {whyHeading || 'Why Our Process Matters'}
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 gap-6">
              {whyCards.map((card: any, idx: number) => (
                <FadeIn key={idx} direction="up" delay={idx * 0.1}>
                  <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-accent-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${gradients[idx % 3]} mb-4`}>
                      <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <h3 className="font-heading text-xl font-bold mb-3 text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[idx % 3]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`} />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Batch Commitment */}
      {commitmentHeading && (
        <Section className="bg-white">
          <FadeIn direction="up">
            <div className="max-w-3xl mx-auto text-center">
              <div className="relative inline-block">
                <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
                  {commitmentHeading}
                </h2>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-accent-yellow via-accent-primary to-accent-green rounded-full" />
              </div>

              {commitmentText && (
                <p className="text-xl text-gray-700 leading-relaxed mb-10 mt-10">
                  {commitmentText}
                </p>
              )}

              {commitmentBadge && (
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-green text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {commitmentBadge}
                </div>
              )}
            </div>
          </FadeIn>
        </Section>
      )}

      {/* Responsible Language */}
      {disclaimer && (
        <Section className="bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-l-4 border-accent-primary p-6 rounded-r-lg shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {disclaimer}
              </p>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
