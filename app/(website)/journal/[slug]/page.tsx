import { logger } from "@/lib/logger";
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { postQuery, postsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { NewsletterSection } from '@/components/NewsletterSection';

export const revalidate = 60;

interface PostPageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  try {
    return await client.fetch(postQuery, { slug });
  } catch (error) {
    logger.error('Error fetching post:', error);
    return null;
  }
}

async function getOtherPosts(currentSlug: string) {
  try {
    const allPosts = await client.fetch(postsQuery);
    return allPosts.filter((post: any) => post.slug.current !== currentSlug).slice(0, 3);
  } catch (error) {
    logger.error('Error fetching other posts:', error);
    return [];
  }
}

async function getAllPostsForStaticGen() {
  try {
    return await client.fetch(postsQuery);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const posts = await getAllPostsForStaticGen();
  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'This post could not be found.',
    };
  }

  return {
    title: post.seo?.metaTitle || `${post.title} | Long Life Journal`,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      images: post.coverImage ? [{ url: urlFor(post.coverImage).url() }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const [post, otherPosts] = await Promise.all([
    getPost(params.slug),
    getOtherPosts(params.slug),
  ]);

  if (!post) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <Link href="/journal" className="text-accent-primary hover:underline">
            Back to Journal
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      {post.coverImage && (
        <div className="relative w-full h-96 sm:h-[500px] overflow-hidden">
          <Image
            src={urlFor(post.coverImage).url()}
            alt={post.title}
            fill
            className="object-cover scale-105 animate-ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Article Content */}
      <Section className="py-12 sm:py-16">
        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <FadeIn direction="up" delay={0.1}>
            <header className="mb-12">
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
                <span className="font-medium text-gray-700">{post.author || 'Long Life'}</span>
                {post.publishedAt && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  </>
                )}
                {post.category && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span className="capitalize px-3 py-1 bg-accent-cream rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </>
                )}
              </div>
            </header>
          </FadeIn>

          {/* Content */}
          <FadeIn direction="up" delay={0.2}>
            <div className="prose-lg">
              {post.content && <RichText value={post.content} />}
            </div>
          </FadeIn>

          {/* Back Link */}
          <FadeIn direction="up" delay={0.3}>
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 text-accent-primary hover:gap-3 transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to Journal
              </Link>
            </div>
          </FadeIn>
        </article>
      </Section>

      {/* Other Posts */}
      {otherPosts.length > 0 && (
        <Section className="bg-gradient-to-b from-white to-accent-cream/30">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">More from the Journal</h2>
              <div className="w-24 h-1 bg-accent-primary mx-auto" />
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {otherPosts.map((otherPost: any) => (
              <Link
                key={otherPost._id}
                href={`/journal/${otherPost.slug.current}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent-yellow">
                  {otherPost.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={urlFor(otherPost.coverImage).url()}
                        alt={otherPost.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <span>{otherPost.author || 'Long Life'}</span>
                      {otherPost.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(otherPost.publishedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-accent-primary transition-colors line-clamp-2">
                      {otherPost.title}
                    </h3>
                    {otherPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {otherPost.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </StaggerContainer>
        </Section>
      )}

      {/* Newsletter Signup */}
      <Section className="bg-gradient-to-br from-accent-yellow/40 via-accent-green/20 to-accent-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent-yellow/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <NewsletterSection />
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
