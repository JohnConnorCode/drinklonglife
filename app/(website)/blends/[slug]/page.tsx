import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { blendQuery, blendsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';
import { FadeIn, StaggerContainer, FloatingElement } from '@/components/animations';
import { ReserveBlendButton } from '@/components/blends/ReserveBlendButton';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { getStripePrices } from '@/lib/stripe';

export const revalidate = 60;

interface BlendPageProps {
  params: {
    slug: string;
  };
}

async function getBlend(slug: string) {
  try {
    return await client.fetch(blendQuery, { slug });
  } catch (error) {
    console.error('Error fetching blend:', error);
    return null;
  }
}

async function getAllBlendsForStaticGen() {
  try {
    return await client.fetch(blendsQuery);
  } catch (error) {
    console.error('Error fetching blends:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const blends = await getAllBlendsForStaticGen();
  return blends.map((blend: any) => ({
    slug: blend.slug.current,
  }));
}

export async function generateMetadata({
  params,
}: BlendPageProps): Promise<Metadata> {
  const blend = await getBlend(params.slug);

  if (!blend) {
    return {
      title: 'Blend Not Found',
      description: 'This blend could not be found.',
    };
  }

  return {
    title: blend.seo?.metaTitle || `${blend.name} | Long Life`,
    description: blend.seo?.metaDescription || blend.tagline,
    openGraph: {
      title: blend.seo?.metaTitle || blend.name,
      description: blend.seo?.metaDescription || blend.tagline,
      images: blend.image ? [{ url: urlFor(blend.image).url() }] : [],
    },
  };
}

export default async function BlendPage({ params }: BlendPageProps) {
  const blend = await getBlend(params.slug);

  if (!blend) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Blend Not Found</h1>
          <Link href="/blends" className="text-accent-primary hover:underline">
            Back to Blends
          </Link>
        </div>
      </Section>
    );
  }

  // Fetch Stripe prices for all variants
  const priceMap = new Map<string, number>();
  if (blend.stripeProduct?.variants) {
    const priceIds = blend.stripeProduct.variants.map((v: any) => v.stripePriceId).filter(Boolean);
    if (priceIds.length > 0) {
      const prices = await getStripePrices(priceIds);
      prices.forEach((price, priceId) => {
        if (price.unit_amount) {
          priceMap.set(priceId, price.unit_amount);
        }
      });
    }
  }

  const labelColorMap: Record<string, string> = {
    yellow: 'from-accent-yellow/80 to-accent-yellow',
    red: 'from-accent-primary/80 to-accent-primary',
    green: 'from-accent-green/80 to-accent-green',
  };

  const gradientClass = blend.labelColor ? labelColorMap[blend.labelColor] || 'from-accent-primary/80 to-accent-primary' : 'from-accent-primary/80 to-accent-primary';

  return (
    <>
      {/* Hero Section */}
      <Section className={`bg-gradient-to-br from-accent-cream via-accent-yellow/10 to-accent-green/10 py-20 relative overflow-hidden`}>
        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {blend.image && (
            <FadeIn direction="left">
              <FloatingElement yOffset={15} duration={6}>
                <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <Image
                    src={urlFor(blend.image).url()}
                    alt={blend.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} opacity-0 hover:opacity-20 transition-opacity duration-300`} />
                </div>
              </FloatingElement>
            </FadeIn>
          )}
          <div>
            <FadeIn direction="right" delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradientClass}`} />
                <span className="text-sm font-semibold text-gray-700">Fresh Weekly Batch</span>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.2}>
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
                {blend.name}
              </h1>
            </FadeIn>
            <FadeIn direction="right" delay={0.3}>
              {blend.tagline && (
                <p className="text-2xl text-gray-700 mb-8 leading-relaxed">{blend.tagline}</p>
              )}
            </FadeIn>
            <FadeIn direction="right" delay={0.4}>
              {blend.functionList && blend.functionList.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {blend.functionList.map((func: string) => (
                    <span
                      key={func}
                      className="px-4 py-2 bg-white backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800 shadow-md border-2 border-accent-yellow/30"
                    >
                      {func}
                    </span>
                  ))}
                </div>
              )}
            </FadeIn>
            <FadeIn direction="right" delay={0.5}>
              <Link
                href="#pricing"
                className="inline-block px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Reserve This Batch
              </Link>
            </FadeIn>
          </div>
        </div>
      </Section>

      {/* Description */}
      {blend.description && (
        <Section className="bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-8 text-center leading-tight-90">
                What makes it special
              </h2>
              <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-700 prose-p:text-lg prose-p:leading-relaxed max-w-none">
                <RichText value={blend.description} />
              </div>
            </FadeIn>
          </div>
        </Section>
      )}

      {/* Ingredients */}
      {blend.ingredients && blend.ingredients.length > 0 && (
        <Section className="bg-gradient-to-b from-accent-cream/30 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                What's inside
              </h2>
              <p className="text-xl text-gray-600">Sourced from trusted regenerative farms</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {blend.ingredients?.filter((ingredient: any) => ingredient && ingredient.name).map((ingredient: any) => (
                <div
                  key={ingredient._id}
                  className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent-green"
                >
                  {/* Icon or initial */}
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-yellow/30 to-accent-green/30 rounded-full mb-4 flex items-center justify-center">
                    <span className="text-2xl font-heading font-bold text-accent-primary">
                      {ingredient.name?.charAt(0) || '?'}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold mb-3 text-gray-900">
                    {ingredient.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">{ingredient.type}</span>
                    </div>
                    {ingredient.seasonality && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{ingredient.seasonality}</span>
                      </div>
                    )}
                  </div>

                  {ingredient.farms && ingredient.farms.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Farm Partners
                      </p>
                      <ul className="space-y-1">
                        {ingredient.farms.map((farm: any) => (
                          <li key={farm._id} className="text-sm text-gray-700 flex items-start gap-2">
                            <svg className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>
                              <strong>{farm.name}</strong>
                              {farm.location && <span className="text-gray-500"> • {farm.location}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Pricing */}
      {(blend.stripeProduct?.variants?.length > 0 || (blend.sizes && blend.sizes.length > 0)) && (
        <Section id="pricing" className="bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-accent-yellow/10 to-accent-green/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <FadeIn direction="up" className="text-center mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight-90">
                Choose your size
              </h2>
              <p className="text-xl text-gray-600">Fresh-pressed and ready for pickup or delivery</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(blend.stripeProduct?.variants?.length > 0 ? blend.stripeProduct.variants : blend.sizes?.filter((item: any) => item && (item.size || item.name)) || []).map((item: any, idx: number) => {
                  const isPopular = blend.stripeProduct?.variants ? item.isDefault : idx === 1;
                  const sizeData = blend.stripeProduct?.variants ? {
                    _id: item.sizeKey,
                    name: item.label,
                    stripePriceId: item.stripePriceId,
                  } : {
                    ...item,
                    name: item.size || item.name,
                    _id: item._key || item._id
                  };

                  return (
                    <div
                      key={sizeData._id}
                      className={`relative group bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 ${
                        isPopular
                          ? 'border-4 border-accent-primary shadow-2xl scale-105'
                          : 'border-2 border-gray-200 shadow-lg hover:border-accent-primary hover:shadow-2xl'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-primary text-white rounded-full text-sm font-bold shadow-lg">
                          Most Popular
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="font-heading text-2xl font-bold mb-1 text-gray-900">
                          {sizeData.name}
                        </h3>
                        {!blend.stripeProduct?.variants && <p className="text-sm text-gray-600">{sizeData.volume}</p>}
                      </div>
                      {!blend.stripeProduct?.variants && sizeData.price && (
                        <div className="my-6">
                          <span className="text-5xl font-bold text-accent-primary">
                            ${sizeData.price}
                          </span>
                        </div>
                      )}
                      {!blend.stripeProduct?.variants && sizeData.description && (
                        <p className="text-sm text-gray-600 mb-6">{sizeData.description}</p>
                      )}
                      {!blend.stripeProduct?.variants && sizeData.servingsPerBottle && (
                        <p className="text-xs text-gray-500 mb-6">
                          {sizeData.servingsPerBottle} servings per bottle
                        </p>
                      )}
                      {blend.stripeProduct?.variants && sizeData.stripePriceId && priceMap.has(sizeData.stripePriceId) ? (
                        <AddToCartButton
                          priceId={sizeData.stripePriceId}
                          productName={`${blend.name} - ${sizeData.name}`}
                          productType="one-time"
                          amount={priceMap.get(sizeData.stripePriceId)!}
                          image={blend.image ? urlFor(blend.image).url() : undefined}
                          blendSlug={params.slug}
                          sizeKey={item.sizeKey}
                          variantLabel={sizeData.name}
                        />
                      ) : (
                        <ReserveBlendButton
                          size={sizeData}
                          blendSlug={params.slug}
                          isPopular={isPopular}
                        />
                      )}
                    </div>
                  );
                })}
            </StaggerContainer>
            <FadeIn direction="up" delay={0.4} className="text-center mt-10">
              <p className="text-sm text-gray-500">
                Free delivery over $40 • Pickup available at all locations
              </p>
            </FadeIn>
          </div>
        </Section>
      )}

      {/* Back Link */}
      <Section className="bg-gray-50">
        <div className="text-center">
          <Link
            href="/blends"
            className="inline-flex items-center gap-2 text-accent-primary hover:gap-3 transition-all duration-300 font-semibold text-lg group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Explore All Blends</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
