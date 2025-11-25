import { Metadata } from 'next';
import { getAllProductsWithMinPrice } from '@/lib/supabase/queries/products';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600; // Revalidate every hour

// Pricing page settings - can be moved to database later
const pageSettings = {
  title: 'Choose Your Plan',
  subtitle: 'Simple, transparent pricing for your wellness journey',
  seo: {
    metaTitle: 'Pricing | Long Life',
    metaDescription: 'Choose the perfect plan for your wellness journey.',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageSettings.seo.metaTitle,
    description: pageSettings.seo.metaDescription,
  };
}

export default async function PricingPage() {
  const products = await getAllProductsWithMinPrice();

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">One-time purchase or monthly subscription</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              {pageSettings.title}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Fresh cold-pressed juices delivered to your door. Choose one-time purchase or save with a monthly subscription.
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Product Cards - Links to Blend Detail Pages */}
      <Section className="bg-white">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No products available at the moment. Please check back soon!
              </p>
            </div>
          ) : (
            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const gradientMap: Record<string, string> = {
                  yellow: 'from-accent-yellow/80 to-accent-yellow',
                  red: 'from-accent-primary/80 to-accent-primary',
                  green: 'from-accent-green/80 to-accent-green',
                };
                const gradient = product.label_color ? gradientMap[product.label_color] || 'from-accent-primary/80 to-accent-primary' : 'from-accent-primary/80 to-accent-primary';

                return (
                  <Link
                    key={product.id}
                    href={`/blends/${product.slug}`}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-accent-primary"
                  >
                    {product.image_url && (
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.image_alt || product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-20`} />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-bold mb-2 text-gray-900 group-hover:text-accent-primary transition-colors">
                        {product.name}
                      </h3>
                      {product.tagline && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{product.tagline}</p>
                      )}
                      {product.function_list && product.function_list.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.function_list.slice(0, 3).map((func: string) => (
                            <span
                              key={func}
                              className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700"
                            >
                              {func}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-sm text-gray-500">
                          {product.min_price ? `From $${product.min_price.toFixed(2)}` : 'View pricing'}
                        </span>
                        <span className="inline-flex items-center gap-2 text-accent-primary font-semibold group-hover:gap-3 transition-all">
                          View Options
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </Section>

      {/* Trust Indicators */}
      <Section className="bg-gradient-to-b from-white to-accent-cream/30">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up" className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
              Why Choose Long Life?
            </h2>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'All transactions are encrypted and secured by Stripe',
              },
              {
                icon: '🔄',
                title: 'Flexible Plans',
                description: 'One-time purchase or save with monthly subscriptions',
              },
              {
                icon: '⚡',
                title: 'Fresh Weekly',
                description: 'Cold-pressed fresh every week from local ingredients',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </Section>
    </>
  );
}
