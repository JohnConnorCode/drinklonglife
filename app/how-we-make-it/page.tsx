import { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { processPageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';
import { FloatingElement } from '@/components/animations/FloatingElement';
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

  const stepColors = ['bg-accent-yellow', 'bg-accent-primary text-white', 'bg-accent-green', 'bg-black text-white'];

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6">
            {heroHeading || 'How We Make It'}
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            {heroSubheading || 'Cold-pressed, same-day bottled, no shortcuts.'}
          </p>
        </div>
      </Section>

      {/* Process Steps */}
      {processSteps && processSteps.length > 0 && (
        <Section>
          <div className="max-w-4xl mx-auto space-y-24">
            {processSteps.map((step: any, idx: number) => (
              <div
                key={step._id}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
              >
                <FadeIn direction={idx % 2 === 0 ? 'right' : 'left'} delay={0.2}>
                  <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                    <div className={`inline-block px-4 py-2 ${stepColors[idx % stepColors.length]} rounded-full text-sm font-bold mb-4`}>
                      STEP {idx + 1}
                    </div>
                    <h2 className="font-heading text-3xl font-bold mb-4">
                      {step.title}
                    </h2>
                    {step.body && <RichText value={step.body} />}
                  </div>
                </FadeIn>
                {step.image ? (
                  <FloatingElement yOffset={20} duration={5 + idx}>
                    <FadeIn direction={idx % 2 === 0 ? 'left' : 'right'} delay={0.4}>
                      <div className={`relative h-80 rounded-lg overflow-hidden shadow-xl ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                        <Image
                          src={urlFor(step.image).url()}
                          alt={step.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </FadeIn>
                  </FloatingElement>
                ) : (
                  <FadeIn direction={idx % 2 === 0 ? 'left' : 'right'} delay={0.4}>
                    <div className={`bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-muted ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                      [{step.title} image]
                    </div>
                  </FadeIn>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Why It Matters */}
      {whyCards && whyCards.length > 0 && (
        <Section className="bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center">
              {whyHeading || 'Why Our Process Matters'}
            </h2>
            <div className="space-y-6">
              {whyCards.map((card: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-muted">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Batch Commitment */}
      {commitmentHeading && (
        <Section>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold mb-6">
              {commitmentHeading}
            </h2>
            {commitmentText && (
              <p className="text-lg text-muted leading-relaxed mb-8">
                {commitmentText}
              </p>
            )}
            {commitmentBadge && (
              <div className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold">
                {commitmentBadge}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Responsible Language */}
      {disclaimer && (
        <Section className="bg-accent-yellow/10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted leading-relaxed">
              {disclaimer}
            </p>
          </div>
        </Section>
      )}
    </>
  );
}
