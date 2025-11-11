import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { aboutPageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';
import { FadeIn, StaggerContainer, FloatingElement } from '@/components/animations';

export const revalidate = 60;

async function getAboutPage() {
  try {
    return await client.fetch(aboutPageQuery);
  } catch (error) {
    console.error('Error fetching about page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutPage = await getAboutPage();

  return {
    title: aboutPage?.seo?.metaTitle || 'About | Long Life',
    description: aboutPage?.seo?.metaDescription || 'Return to nature in a world of machines. Learn about our mission to bring people back to real nourishment and clear minds.',
  };
}

export default async function AboutPage() {
  const aboutPage = await getAboutPage();

  if (!aboutPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load about page. Please try again later.</p>
      </div>
    );
  }

  const {
    heroHeading,
    heroSubheading,
    introText,
    whyHeading,
    whyContent,
    howHeading,
    howContent,
    promiseHeading,
    promises,
    visionHeading,
    visionContent,
    teamHeading,
    teamMembers,
    valuesHeading,
    values,
    ctaHeading,
    ctaText,
    disclaimer,
  } = aboutPage;
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-32 relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight">
              {heroHeading || 'Return to nature in a world of machines.'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {heroSubheading || 'Modern life is efficient but empty. Long Life exists to bring people back to real nourishment and clear minds.'}
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Story */}
      <Section className="bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="prose prose-lg max-w-none">
              {introText && (
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  {introText}
                </p>
              )}

              {whyHeading && (
                <h2 className="font-heading text-4xl font-bold mb-6 mt-16 leading-tight-90">
                  {whyHeading}
                </h2>
              )}

              {whyContent && (
                <div className="mb-8 text-lg">
                  <RichText value={whyContent} />
                </div>
              )}

              {howHeading && (
                <h2 className="font-heading text-4xl font-bold mb-6 mt-16 leading-tight-90">
                  {howHeading}
                </h2>
              )}

              {howContent && (
                <div className="mb-8 text-lg">
                  <RichText value={howContent} />
                </div>
              )}

              {promiseHeading && (
                <h2 className="font-heading text-4xl font-bold mb-8 mt-16 leading-tight-90">
                  {promiseHeading}
                </h2>
              )}

              {promises && promises.length > 0 && (
                <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 p-10 rounded-2xl my-8 border-2 border-accent-yellow/30">
                  <ul className="space-y-6 text-lg">
                    {promises.map((promise: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold">✓</span>
                        <span className="pt-1">
                          <strong className="text-xl font-heading">{promise.title}</strong>
                          <br />
                          <span className="text-gray-700">{promise.description}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Vision */}
      {(visionHeading || visionContent) && (
        <Section className="bg-gradient-to-br from-accent-primary/5 via-accent-green/5 to-transparent">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up" className="text-center">
              {visionHeading && (
                <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-8 leading-tight-90">
                  {visionHeading}
                </h2>
              )}
              {visionContent && (
                <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-700 prose-p:text-xl prose-p:leading-relaxed max-w-none">
                  <RichText value={visionContent} />
                </div>
              )}
            </FadeIn>
          </div>
        </Section>
      )}

      {/* Team */}
      {teamMembers && teamMembers.length > 0 && (
        <Section className="bg-gradient-to-b from-white via-accent-cream/30 to-white">
          <div className="max-w-5xl mx-auto">
            <FadeIn direction="up" className="text-center mb-16">
              <h2 className="font-heading text-5xl font-bold mb-4 leading-tight-90">
                {teamHeading || 'The team'}
              </h2>
              <p className="text-xl text-gray-600">The humans behind Long Life</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.2} className="grid md:grid-cols-3 gap-12">
              {teamMembers.map((member: any) => (
                <div key={member._id} className="text-center group">
                  <FloatingElement yOffset={10} duration={5}>
                    {member.image ? (
                      <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-300 border-4 border-accent-yellow">
                        <Image
                          src={urlFor(member.image).url()}
                          alt={member.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-gradient-to-br from-accent-yellow/30 to-accent-green/30 rounded-full mx-auto mb-6 flex items-center justify-center text-gray-400 shadow-xl border-4 border-accent-yellow">
                        <span className="text-6xl">👤</span>
                      </div>
                    )}
                  </FloatingElement>
                  <h3 className="font-heading text-2xl font-bold mb-2">{member.name}</h3>
                  {member.role && (
                    <p className="text-accent-primary font-semibold mb-4">{member.role}</p>
                  )}
                  {member.bio && (
                    <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Values */}
      {values && values.length > 0 && (
        <Section className="bg-gradient-to-br from-accent-yellow/20 via-accent-green/10 to-accent-cream/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-accent-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <FadeIn direction="up" className="text-center mb-16">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                {valuesHeading || 'What we stand for'}
              </h2>
              <div className="w-24 h-1 bg-accent-primary mx-auto mt-6" />
            </FadeIn>
            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
              {values.map((value: any, idx: number) => (
                <div
                  key={idx}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center border-2 border-transparent hover:border-accent-yellow"
                >
                  {value.emoji && (
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {value.emoji}
                    </div>
                  )}
                  <h3 className="font-heading text-xl font-bold mb-4 text-gray-900">
                    {value.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* CTA */}
      {(ctaHeading || ctaText) && (
        <Section className="bg-gradient-to-b from-white to-accent-cream/30 relative overflow-hidden">
          {/* Organic background accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <FadeIn direction="up" delay={0.1}>
              {ctaHeading && (
                <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                  {ctaHeading}
                </h2>
              )}
              {ctaText && (
                <p className="text-xl text-gray-700 leading-relaxed mb-10 max-w-2xl mx-auto">
                  {ctaText}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/blends"
                  className="w-full sm:w-auto px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Shop Weekly Batches
                </Link>
                <Link
                  href="/#newsletter"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-accent-primary text-accent-primary rounded-full font-semibold text-lg hover:bg-accent-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Join the List
                </Link>
              </div>
            </FadeIn>
          </div>
        </Section>
      )}

      {/* Responsible Language */}
      {disclaimer && (
        <Section className="bg-gray-50">
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
