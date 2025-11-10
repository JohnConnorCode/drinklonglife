import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { blendQuery, blendsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';

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

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gray-50 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {blend.image && (
            <div className="relative h-96">
              <Image
                src={urlFor(blend.image).url()}
                alt={blend.name}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}
          <div>
            <h1 className="font-heading text-5xl font-bold mb-2">
              {blend.name}
            </h1>
            {blend.tagline && (
              <p className="text-xl text-muted mb-6 italic">{blend.tagline}</p>
            )}
            {blend.functionList && blend.functionList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blend.functionList.map((func: string) => (
                  <span
                    key={func}
                    className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium"
                  >
                    {func}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Description */}
      {blend.description && (
        <Section>
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-bold mb-6">About</h2>
            <RichText value={blend.description} />
          </div>
        </Section>
      )}

      {/* Ingredients */}
      {blend.ingredients && blend.ingredients.length > 0 && (
        <Section className="bg-gray-50">
          <h2 className="font-heading text-3xl font-bold mb-8">Ingredients</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blend.ingredients.map((ingredient: any) => (
              <div key={ingredient._id} className="border-l-4 border-accent-green pl-6">
                <h3 className="font-semibold text-lg mb-2">
                  {ingredient.name}
                </h3>
                <p className="text-sm text-muted mb-2">
                  Type: {ingredient.type}
                </p>
                {ingredient.seasonality && (
                  <p className="text-sm text-muted mb-3">
                    Seasonality: {ingredient.seasonality}
                  </p>
                )}
                {ingredient.farms && ingredient.farms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Sources:</p>
                    <ul className="text-sm text-muted space-y-1">
                      {ingredient.farms.map((farm: any) => (
                        <li key={farm._id}>
                          {farm.name}
                          {farm.location && ` - ${farm.location}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Pricing */}
      {blend.sizes && blend.sizes.length > 0 && (
        <Section>
          <h2 className="font-heading text-3xl font-bold mb-8">Sizes & Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl">
            {blend.sizes
              .filter((size: any) => size.isActive)
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
                  <button className="w-full px-4 py-2 bg-black text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </Section>
      )}

      {/* Back Link */}
      <Section>
        <Link href="/blends" className="text-accent-primary hover:underline">
          ← Back to Blends
        </Link>
      </Section>
    </>
  );
}
