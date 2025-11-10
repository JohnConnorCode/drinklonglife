import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { postQuery, postsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { RichText } from '@/components/RichText';
import { urlFor } from '@/lib/image';

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
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getAllPostsForStaticGen() {
  try {
    return await client.fetch(postsQuery);
  } catch (error) {
    console.error('Error fetching posts:', error);
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
  const post = await getPost(params.slug);

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
        <div className="relative w-full h-96 sm:h-[500px]">
          <Image
            src={urlFor(post.coverImage).url()}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <Section className="py-12 sm:py-16">
        <article className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4" style={{lineHeight: "0.9"}}>
              {post.title}
            </h1>
            <div className="flex items-center justify-between text-sm text-muted border-b border-gray-200 pb-6">
              <div>
                <span>By {post.author || 'Long Life'}</span>
                {post.publishedAt && (
                  <>
                    <span className="mx-2">•</span>
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
              </div>
            </div>
          </header>

          {/* Content */}
          {post.content && <RichText value={post.content} />}

          {/* Back Link */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <Link href="/journal" className="text-accent-primary hover:underline">
              ← Back to Journal
            </Link>
          </div>
        </article>
      </Section>
    </>
  );
}
