import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { client } from '@/lib/sanity.client';
import { Section } from '@/components/Section';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { SignOutButton } from '@/components/auth/SignOutButton';

export const metadata: Metadata = {
  title: 'Perks & Rewards | Long Life',
  description: 'View your exclusive perks and rewards',
};

interface PartnershipPerk {
  _id: string;
  title: string;
  shortDescription?: string;
  requiredTier: string;
  category?: string;
  icon?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  featured: boolean;
}

interface UserDiscount {
  _id: string;
  displayTitle: string;
  shortDescription?: string;
  discountCode: string;
  discountType: string;
  discountValue: number;
  expiresAt?: string;
  icon?: string;
  ctaLabel?: string;
  featured: boolean;
  eligibility: string;
  requiredTier?: string;
}

async function getAvailablePerks(partnershipTier: string): Promise<PartnershipPerk[]> {
  try {
    // Define tier hierarchy
    const tierHierarchy: Record<string, string[]> = {
      'vip': ['affiliate', 'partner', 'vip'],
      'partner': ['affiliate', 'partner'],
      'affiliate': ['affiliate'],
      'none': []
    };

    const accessibleTiers = tierHierarchy[partnershipTier] || [];

    if (accessibleTiers.length === 0) {
      return [];
    }

    const perks = await client.fetch<PartnershipPerk[]>(
      `*[_type == "partnershipPerk" && isActive == true && requiredTier in $tiers] | order(featured desc, uiOrder asc) {
        _id,
        title,
        shortDescription,
        requiredTier,
        category,
        icon,
        ctaLabel,
        ctaUrl,
        featured
      }`,
      { tiers: accessibleTiers }
    );

    return perks || [];
  } catch (error) {
    console.error('Error fetching partnership perks:', error);
    return [];
  }
}

async function getActiveDiscounts(): Promise<UserDiscount[]> {
  try {
    const now = new Date().toISOString();
    const discounts = await client.fetch<UserDiscount[]>(
      `*[_type == "userDiscount" && isActive == true && startsAt <= $now && (expiresAt == null || expiresAt > $now)] | order(featured desc) {
        _id,
        displayTitle,
        shortDescription,
        discountCode,
        discountType,
        discountValue,
        expiresAt,
        icon,
        ctaLabel,
        featured,
        eligibility,
        requiredTier
      }`,
      { now }
    );

    return discounts || [];
  } catch (error) {
    console.error('Error fetching user discounts:', error);
    return [];
  }
}

export default async function PerksPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/account/perks');
  }

  // Get user profile with partnership tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, full_name, partnership_tier')
    .eq('id', user.id)
    .single();

  const partnershipTier = profile?.partnership_tier || 'none';
  const partnershipTierLabel = partnershipTier === 'none' ? 'Standard Member' :
    partnershipTier.charAt(0).toUpperCase() + partnershipTier.slice(1);

  // Fetch perks and discounts
  const availablePerks = await getAvailablePerks(partnershipTier);
  const allDiscounts = await getActiveDiscounts();

  // Filter discounts based on eligibility
  const eligibleDiscounts = allDiscounts.filter(discount => {
    if (discount.eligibility === 'all') return true;
    if (discount.eligibility === 'tier_specific' && discount.requiredTier === partnershipTier) return true;
    // Can add more eligibility logic here
    return false;
  });

  // Get user's active discounts from database
  const { data: userDiscounts } = await supabase
    .from('user_discounts')
    .select('discount_code, source, expires_at')
    .eq('user_id', user.id)
    .eq('active', true);

  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">
                Perks & Rewards
              </h1>
              <p className="text-xl text-gray-600">
                Your exclusive benefits and discounts
              </p>
            </div>
            <SignOutButton className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors" />
          </div>
        </FadeIn>

        {/* Navigation Tabs */}
        <FadeIn direction="up" delay={0.15}>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Link
              href="/account"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold whitespace-nowrap transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/account/billing"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold whitespace-nowrap transition-colors"
            >
              Billing & Invoices
            </Link>
            <Link
              href="/account/perks"
              className="px-6 py-3 bg-white text-accent-primary border-2 border-accent-primary rounded-lg font-semibold whitespace-nowrap"
            >
              Perks & Rewards
            </Link>
          </div>
        </FadeIn>

        {/* Membership Status */}
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-gradient-to-br from-accent-yellow/30 to-accent-green/30 rounded-2xl p-8 mb-8 text-center border-2 border-accent-yellow/50">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="font-heading text-3xl font-bold mb-2">
              {partnershipTierLabel}
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              {partnershipTier === 'none' && "Upgrade to a partnership tier to unlock exclusive perks and rewards."}
              {partnershipTier === 'affiliate' && "You have access to affiliate perks! Keep engaging to unlock more benefits."}
              {partnershipTier === 'partner' && "You're a valued partner with access to premium perks!"}
              {partnershipTier === 'vip' && "You're a VIP member with access to all exclusive perks and rewards!"}
            </p>
          </div>
        </FadeIn>

        {/* Your Active Discounts */}
        {userDiscounts && userDiscounts.length > 0 && (
          <FadeIn direction="up" delay={0.25}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-accent-green/20">
              <h2 className="font-heading text-2xl font-bold mb-6">
                🎉 Your Active Discounts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userDiscounts.map((discount) => (
                  <div
                    key={discount.discount_code}
                    className="p-6 bg-gradient-to-br from-accent-green/10 to-accent-yellow/10 rounded-xl border-2 border-accent-green/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-xl text-accent-primary">
                        {discount.discount_code}
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(discount.discount_code)}
                        className="px-3 py-1 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Source: {discount.source || 'N/A'}
                    </p>
                    {discount.expires_at && (
                      <p className="text-sm text-gray-500">
                        Expires: {new Date(discount.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Available Perks */}
        <FadeIn direction="up" delay={0.3}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <h2 className="font-heading text-2xl font-bold mb-6">
              Your Partnership Perks
            </h2>

            {availablePerks.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4 text-6xl">🎁</div>
                <p className="text-gray-600 mb-4">
                  No perks available yet for your membership level.
                </p>
                <p className="text-sm text-gray-500">
                  Contact us to learn about partnership opportunities and unlock exclusive benefits!
                </p>
              </div>
            ) : (
              <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePerks.map((perk) => (
                  <div
                    key={perk._id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      perk.featured
                        ? 'bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 border-accent-yellow/50'
                        : 'bg-gray-50 border-gray-200 hover:border-accent-primary/50'
                    }`}
                  >
                    {perk.icon && (
                      <div className="text-4xl mb-3">{perk.icon}</div>
                    )}
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {perk.title}
                    </h3>
                    {perk.shortDescription && (
                      <p className="text-gray-600 mb-4 text-sm">
                        {perk.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-1 bg-white rounded-full font-semibold text-accent-primary border border-accent-primary/30">
                        {perk.requiredTier.charAt(0).toUpperCase() + perk.requiredTier.slice(1)} Perk
                      </span>
                      {perk.ctaUrl && (
                        <a
                          href={perk.ctaUrl}
                          className="text-sm font-semibold text-accent-primary hover:text-accent-dark transition-colors"
                        >
                          {perk.ctaLabel || 'Learn More'} →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </StaggerContainer>
            )}
          </div>
        </FadeIn>

        {/* Available Discounts */}
        {eligibleDiscounts.length > 0 && (
          <FadeIn direction="up" delay={0.4}>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
              <h2 className="font-heading text-2xl font-bold mb-6">
                Available Discounts
              </h2>
              <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibleDiscounts.map((discount) => (
                  <div
                    key={discount._id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      discount.featured
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {discount.icon && (
                      <div className="text-4xl mb-3">{discount.icon}</div>
                    )}
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {discount.displayTitle}
                    </h3>
                    {discount.shortDescription && (
                      <p className="text-gray-600 mb-4 text-sm">
                        {discount.shortDescription}
                      </p>
                    )}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-dashed border-accent-primary">
                        <span className="font-mono font-bold text-lg text-accent-primary">
                          {discount.discountCode}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(discount.discountCode)}
                          className="text-accent-primary hover:text-accent-dark"
                          title="Copy code"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {discount.discountType === 'percentage' && `${discount.discountValue}% off`}
                        {discount.discountType === 'fixed_amount' && `$${(discount.discountValue / 100).toFixed(2)} off`}
                        {discount.discountType === 'free_shipping' && 'Free Shipping'}
                      </span>
                      {discount.expiresAt && (
                        <span className="text-gray-500">
                          Expires: {new Date(discount.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        )}

        {/* Help Section */}
        <FadeIn direction="up" delay={0.5}>
          <div className="bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-2xl p-8 text-center mt-8">
            <h3 className="font-heading text-xl font-bold mb-2">
              Want More Perks?
            </h3>
            <p className="text-gray-700 mb-4">
              Interested in partnership opportunities? Get in touch to learn more about our programs.
            </p>
            <a
              href="mailto:partnerships@longlife.com"
              className="inline-block px-6 py-3 bg-white text-accent-primary rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Contact Partnerships Team
            </a>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
