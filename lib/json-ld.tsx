/**
 * JSON-LD Structured Data Utilities
 * Generate Schema.org markup for SEO
 */

import React from 'react';
import type { Thing, WithContext } from 'schema-dts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://longlife.com';

/**
 * Organization Schema
 * Used on homepage and globally
 */
export function getOrganizationSchema(siteSettings: any): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteSettings?.title || 'Long Life',
    description: siteSettings?.description || '',
    url: SITE_URL,
    logo: siteSettings?.logo
      ? {
          '@type': 'ImageObject',
          url: siteSettings.logo.asset?.url || '',
        }
      : undefined,
    sameAs: [
      siteSettings?.social?.instagram,
      siteSettings?.social?.tiktok,
      siteSettings?.social?.youtube,
    ].filter(Boolean),
    contactPoint: siteSettings?.contactEmail
      ? {
          '@type': 'ContactPoint',
          email: siteSettings.contactEmail,
          contactType: 'Customer Service',
        }
      : undefined,
    address: siteSettings?.address
      ? {
          '@type': 'PostalAddress',
          addressLocality: 'Los Angeles',
          addressRegion: 'CA',
          addressCountry: 'US',
        }
      : undefined,
  };
}

/**
 * Product Schema
 * Used on blend detail pages
 */
export function getProductSchema(blend: any, siteSettings: any): WithContext<Thing> {
  const price = blend.sizes?.[0]?.price;
  const imageUrl = blend.image?.asset?.url || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: blend.name,
    description: blend.tagline || blend.seo?.metaDescription || '',
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: siteSettings?.title || 'Long Life',
    },
    offers: price
      ? {
          '@type': 'Offer',
          price: price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/blends/${blend.slug?.current}`,
        }
      : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
    },
  };
}

/**
 * BlogPosting Schema
 * Used on journal post pages
 */
export function getBlogPostingSchema(post: any, siteSettings: any): WithContext<Thing> {
  const imageUrl = post.mainImage?.asset?.url || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author || siteSettings?.title || 'Long Life',
    },
    publisher: {
      '@type': 'Organization',
      name: siteSettings?.title || 'Long Life',
      logo: siteSettings?.logo
        ? {
            '@type': 'ImageObject',
            url: siteSettings.logo.asset?.url || '',
          }
        : undefined,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/journal/${post.slug?.current}`,
    },
  };
}

/**
 * WebPage Schema
 * Used on generic pages
 */
export function getWebPageSchema(page: any): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description || page.seo?.metaDescription || '',
    url: `${SITE_URL}/${page.slug?.current}`,
  };
}

/**
 * FAQ Schema
 * Used on FAQ page
 */
export function getFAQSchema(faqs: any[]): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb Schema
 * Used on nested pages
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Helper to render JSON-LD in a Next.js component
 */
export function renderJsonLd(data: WithContext<Thing> | WithContext<Thing>[]) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]),
      }}
    />
  );
}
