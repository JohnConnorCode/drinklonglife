import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/LoginForm';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login | Long Life',
  description: 'Sign in to your Long Life account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; message?: string };
}) {
  // Check if user is already logged in
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.redirectTo || '/account');
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
                  Welcome Back
                </h1>
                <p className="text-gray-600">
                  Sign in to your Long Life account
                </p>
              </div>

              {/* Error message */}
              {searchParams.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{searchParams.message}</p>
                </div>
              )}

              {/* Login Form */}
              <LoginForm redirectTo={searchParams.redirectTo} />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    New to Long Life?
                  </span>
                </div>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <Link
                  href={`/signup${searchParams.redirectTo ? `?redirectTo=${searchParams.redirectTo}` : ''}`}
                  className="text-accent-primary hover:text-accent-dark font-semibold transition-colors"
                >
                  Create an account
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
