import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getReferralByCode } from '@/lib/referral-utils';
import { getUserById } from '@/lib/user-utils';
import { trackServerEvent } from '@/lib/analytics';
import { FadeIn } from '@/components/animations';

interface ReferralPageProps {
  params: {
    code: string;
  };
}

export async function generateMetadata({ params }: ReferralPageProps): Promise<Metadata> {
  const referral = await getReferralByCode(params.code);
  const referrer = referral ? await getUserById(referral.referrer_id) : null;
  const referrerName = referrer?.full_name || referrer?.name || 'a friend';

  return {
    title: `${referrerName} invited you | Get 10% Off | Long Life`,
    description: `You've been invited to try Long Life cold-pressed juices! Get 10% off your first order.`,
  };
}

export default async function ReferralLandingPage({ params }: ReferralPageProps) {
  const { code } = params;

  // Get referral details
  const referral = await getReferralByCode(code);

  if (!referral) {
    return <InvalidReferralPage code={code} />;
  }

  // Get referrer details
  const referrer = await getUserById(referral.referrer_id);

  if (!referrer) {
    return <InvalidReferralPage code={code} />;
  }

  // Store referral code in cookie for signup tracking
  const cookieStore = cookies();
  cookieStore.set('referral_code', code.toUpperCase(), {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  // Track referral page view
  await trackServerEvent('referral_link_clicked', {
    referralCode: code,
    referrerId: referral.referrer_id,
  });

  const referrerName = referrer.full_name || referrer.name || 'A friend';
  const firstName = referrerName.split(' ')[0];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-black overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* Ambient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-accent-green/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-accent-yellow/15 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center py-16">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/20 backdrop-blur-sm rounded-full mb-6 border border-accent-green/30">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm font-medium text-accent-green">PERSONAL INVITATION</span>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              {firstName} thinks you&apos;ll
              <br />
              <span className="bg-gradient-to-r from-accent-green via-accent-yellow to-accent-primary bg-clip-text text-transparent">
                love Long Life
              </span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              Get <span className="text-accent-green font-semibold">10% off</span> your first order of premium cold-pressed juices.
              Real ingredients, real benefits, delivered fresh.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href={`/signup?ref=${code}`}
                className="group px-8 py-4 bg-accent-green text-black font-bold text-lg rounded-full hover:bg-accent-green/90 transition-all shadow-lg shadow-accent-green/30 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                Claim Your 10% Off
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/blends"
                className="px-8 py-4 text-white/70 font-semibold text-lg hover:text-white transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.5}>
            <p className="text-sm text-white/40">
              Referral code: <code className="text-white/60 font-mono">{code.toUpperCase()}</code>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gradient-to-r from-accent-green via-accent-yellow to-accent-primary py-4">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-black/80 text-sm font-medium">
            <span>10,000+ Happy Customers</span>
            <span className="hidden sm:inline">|</span>
            <span>100% Organic</span>
            <span className="hidden sm:inline">|</span>
            <span>Free Shipping $50+</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Redeem Your Discount in 3 Steps
              </h2>
              <p className="text-gray-600">Simple, fast, and your discount is applied automatically.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn direction="up" delay={0.1}>
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-green to-accent-green/70 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg shadow-accent-green/30">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Create Account</h3>
                <p className="text-gray-600 text-sm">
                  Sign up using {firstName}&apos;s referral link (your discount is automatically tracked)
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-yellow to-accent-yellow/70 rounded-xl flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl shadow-lg shadow-accent-yellow/30">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Choose Your Blends</h3>
                <p className="text-gray-600 text-sm">
                  Browse our cold-pressed juice collection and add your favorites to cart
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-primary to-accent-primary/70 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg shadow-accent-primary/30">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Save 10%</h3>
                <p className="text-gray-600 text-sm">
                  Your discount is applied automatically at checkout. No code needed!
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why Long Life */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why {firstName} Loves Long Life
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn direction="up" delay={0.1}>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">100% Organic Ingredients</h3>
                <p className="text-gray-600 text-sm">
                  Every ingredient is certified organic. No preservatives, no additives, just pure nutrition.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Cold-Pressed Fresh</h3>
                <p className="text-gray-600 text-sm">
                  Made fresh, never heated. Our hydraulic press preserves maximum nutrients and enzymes.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Fast, Free Shipping</h3>
                <p className="text-gray-600 text-sm">
                  Free shipping on orders over $50. Delivered cold in 2-3 business days.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">100% Satisfaction Guarantee</h3>
                <p className="text-gray-600 text-sm">
                  Not loving it? Get a full refund within 30 days. No questions asked.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-yellow/10" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <FadeIn direction="up">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to feel
              <br />
              <span className="bg-gradient-to-r from-accent-green to-accent-yellow bg-clip-text text-transparent">
                amazing?
              </span>
            </h2>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="text-xl text-white/60 mb-8">
              Use {firstName}&apos;s invitation and save 10% on your first order.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <Link
              href={`/signup?ref=${code}`}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-accent-green text-black font-bold text-lg rounded-full hover:bg-accent-green/90 transition-all shadow-lg shadow-accent-green/30 hover:shadow-xl hover:scale-105"
            >
              Get My 10% Discount
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

/**
 * Invalid referral page
 */
function InvalidReferralPage({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-16 px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-4">
          Invalid Referral Link
        </h1>

        <p className="text-white/60 mb-8">
          The referral code <code className="text-white/80 font-mono bg-white/10 px-2 py-1 rounded">{code.toUpperCase()}</code> is not valid or has expired.
        </p>

        <div className="space-y-3">
          <Link
            href="/blends"
            className="block px-6 py-3 bg-accent-green text-black rounded-full font-semibold hover:bg-accent-green/90 transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/signup"
            className="block px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
