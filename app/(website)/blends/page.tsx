import { Metadata } from 'next';
import Image from 'next/image';
import { getAllProducts } from '@/lib/supabase/queries/products';
import { Section } from '@/components/Section';
import { BlendsGrid } from '@/components/BlendsGrid';
import { FadeIn } from '@/components/animations';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getBlends() {
  try {
    return await getAllProducts();
  } catch (error) {
    console.error('Error fetching blends:', error);
    return [];
  }
}

// Blends page settings - can be moved to database later
const blendsPageSettings = {
  heading: 'Our Blends',
  subheading: 'Each blend is carefully crafted with cold-pressed organic ingredients to support your wellness journey.',
  seo: {
    metaTitle: 'Our Blends | Long Life',
    metaDescription: 'Explore our cold-pressed juice blends, each crafted for specific wellness functions.',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: blendsPageSettings.seo.metaTitle,
    description: blendsPageSettings.seo.metaDescription,
  };
}

export default async function BlendsPage() {
  const blends = await getBlends();

  return (
    <>
      {/* Hero Section */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image with Ken Burns zoom-out effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Desktop Image */}
          <Image
            src="/slider-desktop-1.png"
            alt="Our Blends"
            fill
            className="object-cover hidden md:block scale-110 animate-ken-burns"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Mobile Image */}
          <Image
            src="/slider-mobile-1.png"
            alt="Our Blends"
            fill
            className="object-cover md:hidden scale-110 animate-ken-burns"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/80 via-accent-green/70 to-accent-yellow/60" />
        </div>

        {/* Organic overlays for depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-[1]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white">
              {blendsPageSettings.heading}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              {blendsPageSettings.subheading}
            </p>
          </FadeIn>

          {/* Delivery Info Badge */}
          <FadeIn direction="up" delay={0.3}>
            <div className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border-2 border-white/50">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">
                Weekly drops • Fresh batches • Local delivery
              </span>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Blends Grid with Filters */}
      <Section className="bg-white">
        <BlendsGrid blends={blends} />
      </Section>
    </>
  );
}
