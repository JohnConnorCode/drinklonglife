import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { SignupForm } from '@/components/auth/SignupForm';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import Link from 'next/link';
import { getReferralByCode } from '@/lib/referral-utils';
import { isFeatureEnabled, getFeatureValue } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Sign Up | Long Life',
  description: 'Create your Long Life account',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; message?: string; ref?: string };
}) {
  // Check if user is already logged in
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.redirectTo || '/account');
  }

  // Check for referral code (from URL or cookie)
  const cookieStore = cookies();
  const referralCodeFromCookie = cookieStore.get('referral_code')?.value;
  const referralCode = searchParams.ref || referralCodeFromCookie;

  // Validate referral code if present
  let referralInfo = null;
  if (referralCode && (await isFeatureEnabled('referrals_enabled'))) {
    const referral = await getReferralByCode(referralCode);
    if (referral) {
      referralInfo = {
        code: referralCode,
        discount: await getFeatureValue('referrals_reward_percentage'),
      };
    }
  }

  return (
    <>
      <Section className="bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 py-24 relative overflow-hidden min-h-screen flex items-center">
        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 w-full max-w-md mx-auto">
          <FadeIn direction="up" delay={0.1}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-heading text-4xl font-bold mb-3">
                  Join Long Life
                </h1>
                <p className="text-gray-600">
                  Create your account to get started
                </p>
              </div>

              {/* Referral Info */}
              {referralInfo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🎁</span>
                    <p className="font-semibold text-purple-900">
                      You're referred!
                    </p>
                  </div>
                  <p className="text-sm text-purple-700">
                    Get <strong>{referralInfo.discount}% off</strong> your first order with code{' '}
                    <code className="bg-white px-2 py-0.5 rounded font-mono font-semibold">
                      {referralInfo.code}
                    </code>
                  </p>
                </div>
              )}

              {/* Error/Success message */}
              {searchParams.message && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600">{searchParams.message}</p>
                </div>
              )}

              {/* Signup Form */}
              <SignupForm
                redirectTo={searchParams.redirectTo}
                referralCode={referralCode || undefined}
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login link */}
              <div className="text-center">
                <Link
                  href={`/login${searchParams.redirectTo ? `?redirectTo=${searchParams.redirectTo}` : ''}`}
                  className="text-accent-primary hover:text-accent-dark font-semibold transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Back to home */}
          <FadeIn direction="up" delay={0.2}>
            <div className="text-center mt-6">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
