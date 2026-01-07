import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome | Long Life',
  description: 'Welcome to Long Life',
};

export default async function WelcomePage() {
  // Check if user is logged in
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const firstName = user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  return (
    <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-24 relative overflow-hidden min-h-screen">
      {/* Organic background shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <FadeIn direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-yellow to-accent-green rounded-full flex items-center justify-center text-5xl shadow-xl">
                🎉
              </div>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent-primary to-accent-green bg-clip-text text-transparent">
              Welcome, {firstName}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You're now part of the Long Life community. Here's what you can do next.
            </p>
          </div>
        </FadeIn>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FadeIn direction="up" delay={0.2}>
            <Link
              href="/blends"
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 hover:border-accent-primary hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-yellow/20 to-accent-yellow/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🥤</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">
                Explore Blends
              </h3>
              <p className="text-sm text-gray-600">
                Discover our range of functional cold-pressed juices designed for your wellness
              </p>
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <Link
              href="/subscriptions"
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 hover:border-accent-green hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-green/20 to-accent-green/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-accent-green transition-colors">
                Start a Subscription
              </h3>
              <p className="text-sm text-gray-600">
                Save 15% with recurring deliveries of your favorite blends
              </p>
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={0.4}>
            <Link
              href="/account"
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 hover:border-accent-primary hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-primary/20 to-accent-primary/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">
                Manage Account
              </h3>
              <p className="text-sm text-gray-600">
                Update your profile, email preferences, and view your orders
              </p>
            </Link>
          </FadeIn>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <FadeIn direction="up" delay={0.5}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold mb-2 text-green-900">
                    You're subscribed to our newsletter!
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    You'll receive updates about new products, exclusive promotions, and wellness tips. You can manage your email preferences in your account settings anytime.
                  </p>
                  <Link
                    href="/account"
                    className="text-sm font-semibold text-green-800 hover:text-green-600 underline"
                  >
                    Manage email preferences →
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.6}>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold mb-2 text-purple-900">
                    Share the wellness with friends
                  </h3>
                  <p className="text-sm text-purple-700 mb-3">
                    Invite friends to join Long Life and you'll both get rewards! Check your account page for your unique referral link.
                  </p>
                  <Link
                    href="/account"
                    className="text-sm font-semibold text-purple-800 hover:text-purple-600 underline"
                  >
                    Get your referral link →
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.7}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    What makes Long Life different?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-green font-bold">✓</span>
                      <span>Cold-pressed within 24 hours for maximum nutrients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-green font-bold">✓</span>
                      <span>Functional blends designed for specific wellness goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-green font-bold">✓</span>
                      <span>Organic ingredients sourced from local farms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-green font-bold">✓</span>
                      <span>No added sugars, preservatives, or artificial ingredients</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* CTA */}
        <FadeIn direction="up" delay={0.8}>
          <div className="text-center mt-12">
            <Link
              href="/blends"
              className="inline-flex items-center gap-2 bg-accent-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-dark transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Shopping
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Or{' '}
              <Link href="/account" className="text-accent-primary hover:text-accent-dark font-semibold">
                go to your account
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
