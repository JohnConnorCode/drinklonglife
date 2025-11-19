import { Section } from '@/components/Section';
import Link from 'next/link';
import { FadeIn, StaggerContainer } from '@/components/animations';
import { RippleEffect } from '@/components/RippleEffect';

export const metadata = {
  title: 'Ambassador Program | Long Life',
  description: 'Become a Long Life Ambassador. Earn rewards by sharing premium cold-pressed juices with your community!',
};

export default function ReferralProgramPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1600&h=900&fit=crop')] bg-cover bg-center scale-110 animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/85 via-accent-secondary/75 to-accent-yellow/70" />
        </div>

        {/* Organic overlays for depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-[1]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-semibold text-accent-primary">Join Our Community</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Become an Ambassador
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-md mb-8">
              Share the power of premium cold-pressed juices with your community and earn rewards for every referral.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <RippleEffect
              className="inline-block rounded-full"
              color="rgba(255, 255, 255, 0.3)"
            >
              <Link
                href="/account#referrals"
                className="inline-block px-8 py-4 bg-white text-accent-primary font-semibold rounded-full hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Get Your Ambassador Link
              </Link>
            </RippleEffect>
          </FadeIn>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">Three simple steps to start earning</p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-gray-900">Share Your Link</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your unique ambassador link from your account dashboard and share it across your community.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-green to-accent-yellow rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-gray-900">Friends Join</h3>
              <p className="text-gray-600 leading-relaxed">
                When someone creates an account using your link, they receive an exclusive welcome discount.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-yellow to-accent-primary rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-gray-900">Earn Rewards</h3>
              <p className="text-gray-600 leading-relaxed">
                After their first purchase, you both receive reward credits automatically applied to your accounts.
              </p>
            </div>
          </StaggerContainer>
        </div>
      </Section>

      {/* Rewards Breakdown */}
      <Section className="py-20 bg-gradient-to-b from-accent-cream/30 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn direction="up">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
              Ambassador Rewards
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">Everyone wins when you share</p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.2} className="grid md:grid-cols-2 gap-8">
            {/* For You */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-accent-primary/20 hover:border-accent-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl font-bold text-accent-primary">
                  For You
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>15% discount credit on your next order when your friend makes their first purchase</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Credits automatically applied to your account</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No limit on referrals - earn unlimited rewards</span>
                </li>
              </ul>
            </div>

            {/* For Your Friend */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-accent-secondary/20 hover:border-accent-secondary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-secondary to-accent-green rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl font-bold text-accent-secondary">
                  For Your Friend
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10% off their first order as a welcome gift</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic discount at checkout - no code needed</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access to premium cold-pressed juices</span>
                </li>
              </ul>
            </div>
          </StaggerContainer>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section className="py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="group bg-white p-6 rounded-xl shadow-md">
              <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                How do I get my referral link?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Sign in to your account and navigate to the referrals section. Your unique referral link will be displayed there along with tracking stats.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-xl shadow-md">
              <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                When do I receive my rewards?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Your reward credits are issued within 24 hours after your referred friend completes their first purchase. Credits are automatically applied to your account.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-xl shadow-md">
              <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                Is there a limit to how many people I can refer?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                No! Refer as many friends as you'd like. There's no cap on the number of referrals or rewards you can earn.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-xl shadow-md">
              <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                How do my friends use their discount?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                When they sign up using your referral link, their discount is automatically tracked. It will be applied automatically at checkout on their first purchase.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-xl shadow-md">
              <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                Can I combine referral credits with other discounts?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Referral credits can typically be stacked with most promotions, but cannot be combined with other referral discounts or certain limited-time offers. Check the specific terms at checkout.
              </p>
            </details>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-green z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1600&h=900&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-[1]" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-yellow/30 rounded-full blur-3xl animate-pulse z-[2]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-green/30 rounded-full blur-3xl animate-pulse z-[2]" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Ready to Become an Ambassador?
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <p className="text-xl sm:text-2xl mb-10 text-white/95 leading-relaxed drop-shadow-md">
              Get your unique ambassador link and start sharing the power of premium cold-pressed juices with your community.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <RippleEffect
              className="inline-block rounded-full"
              color="rgba(255, 255, 255, 0.3)"
            >
              <Link
                href="/account#referrals"
                className="inline-block px-10 py-5 bg-white text-accent-primary font-bold text-lg rounded-full hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-110"
              >
                Access Your Ambassador Dashboard
              </Link>
            </RippleEffect>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
