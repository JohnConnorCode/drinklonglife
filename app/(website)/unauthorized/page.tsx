import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Unauthorized | Long Life',
  description: 'You do not have access to this page',
};

export default function UnauthorizedPage() {
  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-white to-accent-yellow/10 py-24 flex items-center">
      <div className="max-w-2xl mx-auto">
        <FadeIn direction="up">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mb-6 text-6xl">🔒</div>
            <h1 className="font-heading text-4xl font-bold mb-4">
              Access Denied
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You don't have permission to access this page. If you believe this is an error, please contact an administrator.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-colors"
              >
                Go Home
              </Link>
              <Link
                href="/account"
                className="px-8 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
              >
                Go to Account
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
