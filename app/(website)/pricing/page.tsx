import { Metadata } from 'next';
import { client } from '@/lib/sanity.client';
import { getStripePrices, formatPrice, getBillingInterval } from '@/lib/stripe';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import type { StripeProduct, EnrichedStripeProduct, EnrichedProductVariant } from '@/types/stripe';

export const revalidate = 3600; // Revalidate every hour

async function getStripeProducts(): Promise<EnrichedStripeProduct[]> {
  try {
    // Fetch active products from Sanity
    const products: StripeProduct[] = await client.fetch(
      `*[_type == "stripeProduct" && isActive == true] | order(uiOrder asc) {
        _id,
        _type,
        title,
        slug,
        description,
        badge,
        featured,
        isActive,
        stripeProductId,
        tierKey,
        variants[] {
          sizeKey,
          label,
          stripePriceId,
          isDefault,
          uiOrder
        },
        uiOrder,
        image {
          asset,
          alt
        },
        ctaLabel,
        notes
      }`
    );

    if (!products || products.length === 0) {
      return [];
    }

    // Collect all price IDs
    const allPriceIds = products.flatMap(p => p.variants.map(v => v.stripePriceId));

    // Fetch all Stripe prices in one batch
    const stripePrices = await getStripePrices(allPriceIds);

    // Enrich products with Stripe price data
    const enrichedProducts: EnrichedStripeProduct[] = products.map(product => {
      const enrichedVariants: EnrichedProductVariant[] = product.variants
        .map(variant => {
          const price = stripePrices.get(variant.stripePriceId);
          if (!price) return null;

          return {
            ...variant,
            price,
            formattedPrice: formatPrice(price.unit_amount || 0, price.currency),
            billingInterval: getBillingInterval(price),
          };
        })
        .filter((v): v is EnrichedProductVariant => v !== null);

      return {
        ...product,
        variants: enrichedVariants,
      };
    });

    // Filter out products with no valid variants
    return enrichedProducts.filter(p => p.variants.length > 0);
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return [];
  }
}

async function getPageSettings() {
  try {
    return await client.fetch(
      `*[_type == "subscriptionPageSettings"][0] {
        title,
        subtitle,
        showBillingToggle,
        monthlyLabel,
        yearlyLabel,
        yearlyDiscountBadge,
        seo
      }`
    );
  } catch (error) {
    console.error('Error fetching page settings:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPageSettings();

  return {
    title: settings?.seo?.metaTitle || 'Pricing | Long Life',
    description: settings?.seo?.metaDescription || 'Choose the perfect plan for your wellness journey.',
  };
}

export default async function PricingPage() {
  const products = await getStripeProducts();
  const settings = await getPageSettings();

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
              {settings?.title || 'Choose Your Plan'}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            {settings?.subtitle && (
              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {settings.subtitle}
              </p>
            )}
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
