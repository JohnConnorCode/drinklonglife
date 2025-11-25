import { logger } from "@/lib/logger";
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { pageQuery, pagesQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPage(slug: string) {
  try {
    return await client.fetch(pageQuery, { slug });
  } catch (error) {
    logger.error('Error fetching page:', error);
    return null;
  }
}

async function getAllPagesForStaticGen() {
  try {
    return await client.fetch(pagesQuery);
  } catch (error) {
    logger.error('Error fetching pages:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const pages = await getAllPagesForStaticGen();
  return pages
    .filter((page: any) => !['journal', 'blends', 'faq'].includes(page.slug.current))
    .map((page: any) => ({
      slug: page.slug.current,
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'This page could not be found.',
    };
  }

  return {
    title: page.seo?.metaTitle || `${page.title} | Long Life`,
    description: page.seo?.metaDescription || page.intro,
  };
}

export default async function Page({ params }: PageProps) {
  const page = await getPage(params.slug);

  if (!page) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <Link href="/" className="text-accent-primary hover:underline">
            Back Home
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      {page.heroImage && (
        <div className="relative w-full h-96 sm:h-[500px]">
          <Image
            src={urlFor(page.heroImage).url()}
            alt={page.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Intro Section */}
      <Section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-2xl">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6 leading-tight-90">
            {page.title}
          </h1>
          {page.intro && (
            <div className="text-lg text-muted">
              <RichText value={page.intro} />
            </div>
          )}
        </div>
      </Section>

      {/* Content Section */}
      {page.content && (
        <Section className="prose prose-sm max-w-3xl">
          <RichText value={page.content} />
        </Section>
      )}

      {/* Back Link */}
      <Section>
        <Link href="/" className="text-accent-primary hover:underline">
          ← Back Home
        </Link>
      </Section>
    </>
  );
}
