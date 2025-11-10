import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

/**
 * Revalidation Webhook Endpoint
 *
 * Triggered by Sanity webhooks to invalidate ISR cache when content changes.
 * Configure in Sanity Studio: Manage → API → Webhooks → Create Webhook
 *
 * URL: https://your-domain.com/api/revalidate
 * Secret: Set SANITY_REVALIDATE_SECRET in .env
 * Triggers: Create, Update, Delete
 */

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: { current: string };
    }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    // Verify signature if secret is set
    if (process.env.SANITY_REVALIDATE_SECRET && !isValidSignature) {
      const message = 'Invalid signature';
      return new Response(JSON.stringify({ message, isValidSignature, body }), {
        status: 401,
      });
    }

    if (!body?._type) {
      const message = 'Bad Request: Missing document type';
      return new Response(JSON.stringify({ message, body }), { status: 400 });
    }

    // Revalidate based on document type
    const tags: string[] = [];

    switch (body._type) {
      case 'siteSettings':
      case 'navigation':
        // Global settings affect all pages
        tags.push('global', 'siteSettings', 'navigation');
        break;

      case 'homePage':
        tags.push('homePage');
        break;

      case 'blend':
        // Blends appear on home, blends list, and detail pages
        tags.push('blends', 'homePage');
        if (body.slug?.current) {
          tags.push(`blend:${body.slug.current}`);
        }
        break;

      case 'post':
        // Posts appear on journal index and detail pages
        tags.push('posts');
        if (body.slug?.current) {
          tags.push(`post:${body.slug.current}`);
        }
        break;

      case 'page':
        // Generic pages
        tags.push('pages');
        if (body.slug?.current) {
          tags.push(`page:${body.slug.current}`);
        }
        break;

      case 'faq':
        tags.push('faq');
        break;

      case 'ingredient':
        // Ingredients affect blend detail pages
        tags.push('ingredients', 'blends');
        break;

      case 'farm':
        // Farms affect blend and ingredient pages
        tags.push('farms', 'blends', 'ingredients');
        break;

      case 'processStep':
      case 'standard':
        // Process and standards show on home and info pages
        tags.push('homePage', 'pages');
        break;

      case 'sizePrice':
        // Pricing affects home and blend pages
        tags.push('homePage', 'blends');
        break;

      default:
        // For unknown types, revalidate everything as a safety
        tags.push('all');
    }

    // Revalidate all affected tags
    const uniqueTags = [...new Set(tags)];
    uniqueTags.forEach((tag) => revalidateTag(tag));

    return NextResponse.json({
      revalidated: true,
      tags: uniqueTags,
      now: Date.now(),
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return new Response(err.message, { status: 500 });
  }
}
