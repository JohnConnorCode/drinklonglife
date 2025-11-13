import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { postsQuery } from '@/lib/sanity.queries';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { urlFor } from '@/lib/image';
import { NewsletterForm } from '@/components/NewsletterForm';

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
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <>
      {/* Hero Section */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1600&h=900&fit=crop')] bg-cover bg-center scale-110 animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/85 via-accent-green/75 to-accent-yellow/65" />
        </div>

        {/* Organic overlays */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 z-[1]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-semibold text-accent-primary">Our Stories</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              The Journal
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              Stories, recipes, and insights about wellness and our cold-pressed juices.
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Featured Post */}
      {featuredPost && (
        <Section className="bg-white -mt-16 relative z-20">
          <FadeIn direction="up">
            <Link
              href={`/journal/${featuredPost.slug.current}`}
              className="group block max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-accent-cream/30 to-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-accent-yellow/30 hover:border-accent-primary/50">
                {featuredPost.coverImage && (
                  <div className="relative h-80 overflow-hidden rounded-2xl">
                    <Image
                      src={urlFor(featuredPost.coverImage).url()}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-accent-primary text-white text-sm font-semibold rounded-full shadow-lg">
                      Featured
                    </div>
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                    <span>{featuredPost.author || 'Long Life'}</span>
                    <span>•</span>
                    {featuredPost.publishedAt && (
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                  </div>
                  <h2 className="font-heading text-4xl font-bold mb-4 group-hover:text-accent-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed line-clamp-4">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-accent-primary font-semibold group-hover:gap-4 transition-all">
                    <span>Read More</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>
        </Section>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 ? (
        <Section className="bg-gradient-to-b from-white to-accent-cream/30">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">Latest Stories</h2>
            <div className="w-24 h-1 bg-accent-primary mx-auto" />
          </div>
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post: any) => (
              <Link
                key={post._id}
                href={`/journal/${post.slug.current}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent-yellow">
                  {post.coverImage && (
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={urlFor(post.coverImage).url()}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <span>{post.author || 'Long Life'}</span>
                      {post.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-accent-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-accent-primary font-semibold text-sm">
                      <span>Read Article</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerContainer>
        </Section>
      ) : posts.length === 0 ? (
        <Section className="bg-white">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-accent-cream rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-2">No stories yet</h3>
            <p className="text-gray-600">Check back soon for wellness insights and recipes.</p>
          </div>
        </Section>
      ) : null}

      {/* Newsletter Signup Section */}
      <Section className="bg-gradient-to-br from-accent-yellow/40 via-accent-green/20 to-accent-primary/30 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent-yellow/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm font-semibold text-accent-primary">Stay Connected</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Get Wellness Insights & Recipe Ideas
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join our community and be the first to know about new recipes, wellness tips, and exclusive drops.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="max-w-xl mx-auto mb-6">
              <NewsletterForm />
            </div>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No spam, unsubscribe anytime
            </p>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
