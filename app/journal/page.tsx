import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { postsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { urlFor } from '@/lib/image';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Journal | Long Life',
  description: 'Stories, recipes, and insights about wellness and our cold-pressed juices.',
};

async function getPosts() {
  try {
    return await client.fetch(postsQuery);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function JournalPage() {
  const posts = await getPosts();

  return (
    <Section>
      <h1 className="font-heading text-5xl font-bold mb-4">Journal</h1>
      <p className="text-lg text-muted mb-12 max-w-2xl">
        Wellness stories, recipes, and insights from the Long Life community.
      </p>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link
              key={post._id}
              href={`/journal/${post.slug.current}`}
              className="group"
            >
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 hover:shadow-lg transition-shadow">
                {post.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={urlFor(post.coverImage).url()}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
              <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-accent-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-muted mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{post.author || 'Long Life'}</span>
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted">No journal posts available yet.</p>
        </div>
      )}
    </Section>
  );
}
