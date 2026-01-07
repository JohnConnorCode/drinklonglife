import { Section } from '@/components/Section';
import Link from 'next/link';
import { FadeIn, StaggerContainer } from '@/components/animations';

export const revalidate = 60;

export async function generateMetadata() {
  return {
    title: 'Join the Movement | Long Life Ambassadors',
    description: 'Be part of something bigger. Join the Long Life Ambassador movement and help spread wellness while earning rewards.',
  };
}

export default async function AmbassadorPage() {
  return (
    <>
      {/* Hero Section - Dark, Bold, Movement-focused */}
      <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-green-500/15 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-bl from-yellow-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <div className="flex -space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <span className="text-sm font-medium text-white/70 tracking-wide">THE AMBASSADOR MOVEMENT</span>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.95] text-white">
              You Don&apos;t Just
              <br />
              <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
                Share Juice.
              </span>
              <br />
              <span className="text-white/60">You Spread Wellness.</span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl sm:text-2xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-10">
              Join a community of health advocates earning rewards while helping others
              discover the power of real, functional beverages.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login?redirectTo=/account"
                className="group px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center gap-2"
              >
                Become an Ambassador
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 text-white/70 font-semibold text-lg hover:text-white transition-colors"
              >
                See How It Works
              </a>
            </div>
          </FadeIn>

          {/* Scroll indicator */}
          <FadeIn direction="up" delay={0.6}>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
                <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 py-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-white">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold">500+</p>
              <p className="text-sm font-medium opacity-90">Active Ambassadors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold">$25K+</p>
              <p className="text-sm font-medium opacity-90">Rewards Earned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold">2,000+</p>
              <p className="text-sm font-medium opacity-90">New Customers Referred</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Mission */}
      <Section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-primary mb-4">The Mission</p>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight text-gray-900">
              We&apos;re building a world where
              <br />
              <span className="text-accent-primary">wellness is the default.</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Every time you share Long Life, you&apos;re not just recommending a product.
              You&apos;re inviting someone into a movement that prioritizes real ingredients,
              real benefits, and real change.
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how-it-works" className="py-24 bg-gray-950 text-white relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">How It Works</p>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
                Three Steps to Impact
              </h2>
              <p className="text-xl text-white/50">Simple, transparent, rewarding.</p>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-red-500/30">
                1
              </div>
              <div className="pt-4">
                <h3 className="font-heading text-2xl font-bold mb-4">Get Your Link</h3>
                <p className="text-white/60 leading-relaxed">
                  Sign up and instantly receive your unique ambassador link. Track everything from your dashboard.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-yellow-500/30">
                2
              </div>
              <div className="pt-4">
                <h3 className="font-heading text-2xl font-bold mb-4">Share the Movement</h3>
                <p className="text-white/60 leading-relaxed">
                  Tell your friends, family, and community about Long Life. Every share plants a seed for better health.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-green-500/30">
                3
              </div>
              <div className="pt-4">
                <h3 className="font-heading text-2xl font-bold mb-4">Earn Together</h3>
                <p className="text-white/60 leading-relaxed">
                  When they purchase, you both get rewarded. You earn 15% credit, they get 10% off their first order.
                </p>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </Section>

      {/* Rewards Section */}
      <Section className="py-24 bg-gradient-to-b from-white to-accent-cream/30 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-primary mb-4">Ambassador Rewards</p>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
                Give More. Get More.
              </h2>
              <p className="text-xl text-gray-600">No limits. No gimmicks. Just real rewards for real impact.</p>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.2} className="grid md:grid-cols-2 gap-8">
            {/* For You */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-full mb-6">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-accent-primary">For You</span>
              </div>
              <h3 className="font-heading text-3xl font-bold mb-6 text-gray-900">15% Credit</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Credited automatically after each referral purchase</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Unlimited referrals = unlimited rewards</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Track everything in your dashboard</span>
                </li>
              </ul>
            </div>

            {/* For Your Friend */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-accent-green/10 to-accent-yellow/10 rounded-full mb-6">
                <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-semibold text-accent-green">For Your Friend</span>
              </div>
              <h3 className="font-heading text-3xl font-bold mb-6 text-gray-900">10% Off First Order</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Automatic discount at checkout</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Access to premium cold-pressed juices</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Welcome to the Long Life community</span>
                </li>
              </ul>
            </div>
          </StaggerContainer>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold text-gray-900">
                Questions? We&apos;ve Got Answers.
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            <details className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center font-semibold text-lg hover:bg-gray-100 transition-colors">
                How do I get my ambassador link?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Simply create an account or sign in. Your unique ambassador link is automatically generated and visible in your account dashboard.
              </div>
            </details>

            <details className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center font-semibold text-lg hover:bg-gray-100 transition-colors">
                When do I receive my rewards?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Rewards are credited to your account within 24 hours after your referred friend completes their first purchase. You&apos;ll see it reflected in your dashboard.
              </div>
            </details>

            <details className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center font-semibold text-lg hover:bg-gray-100 transition-colors">
                Is there a limit to how many people I can refer?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Absolutely not. Refer as many people as you want. The more you share, the more you earn. There&apos;s no cap on rewards.
              </div>
            </details>

            <details className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center font-semibold text-lg hover:bg-gray-100 transition-colors">
                How does my friend use their discount?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                When they sign up using your link, their discount is automatically tracked and applied at checkout. No codes needed.
              </div>
            </details>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="relative py-32 bg-black overflow-hidden">
        {/* Animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/10 to-green-500/20 animate-pulse" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <FadeIn direction="up">
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Ready to Join
              <br />
              <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
                the Movement?
              </span>
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Start sharing wellness today. Get your unique ambassador link and earn rewards with every referral.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <Link
              href="/login?redirectTo=/account"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              Get Your Ambassador Link
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
