import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { homePageQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { BlendCard } from '@/components/BlendCard';
import { urlFor } from '@/lib/image';

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

  const { hero, valueProps, featuredBlends, sizesPricing, processIntro, processSteps, sourcingIntro, standards, communityBlurb } = homePage;

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-4" style={{lineHeight: '0.9'}}>
              Long Life
            </h1>
            {hero?.heading ? (
              <p className="text-2xl font-semibold mb-4" style={{lineHeight: '0.95'}}>
                {hero.heading}
              </p>
            ) : (
              <p className="text-2xl font-semibold mb-4" style={{lineHeight: '0.95'}}>
                Small-batch juice for real humans.
              </p>
            )}
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
          </div>
          {hero?.image && (
            <div className="relative h-96 md:h-full">
              <Image
                src={urlFor(hero.image).url()}
                alt="Long Life Juice"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}
        </div>
      </Section>

      {/* Value Props */}
      {valueProps && valueProps.length > 0 && (
        <Section>
          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop: any, idx: number) => (
              <div key={idx} className="text-center">
                {prop.icon && (
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Image
                      src={urlFor(prop.icon).url()}
                      alt={prop.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold mb-2">
                  {prop.title}
                </h3>
                <p className="text-muted">{prop.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Blends */}
      {featuredBlends && featuredBlends.length > 0 && (
        <Section className="bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4" style={{lineHeight: "0.9"}}>
              Featured Blends
            </h2>
            <p className="text-lg text-muted italic">
              Sold in weekly drops. Reserve early.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredBlends.map((blend: any) => (
              <BlendCard key={blend._id} blend={blend} />
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted mb-4">
              <strong>Sizes:</strong> 1-Gallon $50 • ½-Gallon $35 • Shot $5
            </p>
            <p className="text-sm text-muted mb-6">
              Pickup or local delivery during weekly windows. Shipments coming soon.
            </p>
            <Link
              href="/blends"
              className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity inline-block"
            >
              Reserve This Week
            </Link>
          </div>
        </Section>
      )}

      {/* Pricing */}
      {sizesPricing && sizesPricing.length > 0 && (
        <Section>
          <h2 className="font-heading text-4xl font-bold text-center mb-12" style={{lineHeight: "0.9"}}>
            Sizing & Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {sizesPricing
              .filter((sp: any) => sp.isActive)
              .map((size: any) => (
                <div
                  key={size._id}
                  className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-accent-primary transition-colors"
                >
                  <h3 className="font-heading text-xl font-bold mb-2">
                    {size.label}
                  </h3>
                  <p className="text-3xl font-bold text-accent-primary mb-4">
                    ${size.price}
                  </p>
                  {size.sku && (
                    <p className="text-xs text-muted mb-4">SKU: {size.sku}</p>
                  )}
                  <button className="w-full px-4 py-2 bg-black text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </Section>
      )}

      {/* Process */}
      {processSteps && processSteps.length > 0 && (
        <Section className="bg-gray-50">
          <h2 className="font-heading text-4xl font-bold text-center mb-8" style={{lineHeight: "0.9"}}>
            How We Make It
          </h2>
          {processIntro && (
            <p className="text-center text-lg text-muted mb-12">
              {processIntro}
            </p>
          )}
          <div className="space-y-12">
            {processSteps.map((step: any, idx: number) => (
              <div
                key={step._id}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  idx % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
              >
                <div className={idx % 2 === 1 ? 'md:col-start-2' : ''}>
                  <h3 className="font-heading text-2xl font-bold mb-4">
                    {step.title}
                  </h3>
                  {step.body && <RichText value={step.body} />}
                </div>
                {step.image && (
                  <div className="relative h-64">
                    <Image
                      src={urlFor(step.image).url()}
                      alt={step.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sourcing Standards */}
      {standards && standards.length > 0 && (
        <Section>
          <h2 className="font-heading text-4xl font-bold text-center mb-8" style={{lineHeight: "0.9"}}>
            Ingredients & Sourcing
          </h2>
          {sourcingIntro ? (
            <p className="text-center text-lg text-muted mb-12">
              {sourcingIntro}
            </p>
          ) : (
            <p className="text-center text-lg text-muted mb-12">
              We source from trusted growers who share our standards. Seasonal rotation is part of the craft.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {standards.map((standard: any) => (
              <div key={standard._id} className="border-l-4 border-accent-primary pl-6">
                <h3 className="font-heading text-xl font-bold mb-3">
                  {standard.title}
                </h3>
                {standard.body && <RichText value={standard.body} />}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Community/Newsletter */}
      <Section className="bg-accent-yellow/10" id="newsletter">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-6">
            Get first access to drops and new blends
          </h2>
          <p className="text-lg text-muted mb-8">
            {communityBlurb || "Enter your email to reserve before batches sell out."}
          </p>
          <form className="flex gap-3 mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Notify Me
            </button>
          </form>
          <p className="text-sm text-muted mb-6">
            We grow by word of mouth. Taste it. Share it. Bring a friend to pickup day.
          </p>
          <p className="text-sm text-muted">
            Tag <strong>#DrinkLongLife</strong> to join a community that chooses nature over noise.
          </p>
        </div>
      </Section>
    </>
  );
}
