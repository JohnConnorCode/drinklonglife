import { Metadata } from 'next';
import { getActiveStripeProducts } from '@/lib/supabase/queries/products';
import { getStripePrices, formatPrice, getBillingInterval } from '@/lib/stripe';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import type { StripeProduct, EnrichedStripeProduct, EnrichedProductVariant } from '@/types/stripe';

export const revalidate = 3600; // Revalidate every hour

async function getStripeProducts(): Promise<EnrichedStripeProduct[]> {
  try {
    // Fetch active products from Supabase
    const products = await getActiveStripeProducts();

    if (!products || products.length === 0) {
      return [];
    }

    // Collect all price IDs from variants
    const allPriceIds = products.flatMap(p =>
      p.variants.map(v => v.stripe_price_id)
    );

    // Fetch all Stripe prices in one batch
    const stripePrices = await getStripePrices(allPriceIds);

    // Enrich products with Stripe price data
    const enrichedProducts: EnrichedStripeProduct[] = products.map(product => {
      const enrichedVariants: EnrichedProductVariant[] = product.variants
        .map(variant => {
          const price = stripePrices.get(variant.stripe_price_id);
          if (!price) return null;

          return {
            ...variant,
            stripePriceId: variant.stripe_price_id, // Map to expected field name
            sizeKey: variant.size_key,
            isDefault: variant.is_default,
            uiOrder: variant.display_order,
            price,
            formattedPrice: formatPrice(price.unit_amount || 0, price.currency),
            billingInterval: getBillingInterval(price),
          };
        })
        .filter((v): v is EnrichedProductVariant => v !== null) as EnrichedProductVariant[];

      return {
        ...product,
        _id: product.id, // Map to expected field name
        title: product.name,
        stripeProductId: product.stripe_product_id,
        variants: enrichedVariants,
      } as any;
    });

    // Filter out products with no valid variants
    return enrichedProducts.filter(p => p.variants.length > 0);
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return [];
  }
}

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
  const products = await getStripeProducts();

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-24 relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Simple, transparent pricing</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              {pageSettings.title}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {pageSettings.subtitle}
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Pricing Cards */}
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
              {products.map((product) => (
                <PricingCard key={product._id} product={product} />
              ))}
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
                icon: '↩️',
                title: 'Easy Cancellation',
                description: 'Cancel anytime. No questions asked.',
              },
              {
                icon: '⚡',
                title: 'Instant Access',
                description: 'Get started immediately after purchase',
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
