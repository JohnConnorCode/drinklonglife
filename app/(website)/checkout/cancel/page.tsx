import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Payment Cancelled | Long Life',
  description: 'Your payment was cancelled.',
};

export default function CheckoutCancelPage() {
  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-gray-100 to-gray-200 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn direction="up" delay={0.1}>
          {/* Cancel Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mb-8 shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Payment Cancelled
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Your payment was cancelled and no charges were made. Feel free to
            return when you're ready to continue.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.4}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8 border-2 border-gray-200">
            <h2 className="font-heading text-2xl font-bold mb-4 text-gray-900">
              Need Help?
            </h2>
            <ul className="space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Having trouble with payment? Check our FAQ
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Questions about our products? View our blends
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Want to talk? Contact our support team
                </span>
              </li>
            </ul>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-gray-400 text-gray-700 rounded-full font-semibold text-lg hover:border-accent-primary hover:text-accent-primary transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Back to Home
            </Link>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.6}>
          <p className="mt-8 text-sm text-gray-500">
            Need assistance?{' '}
            <a
              href="mailto:support@longlife.com"
              className="text-accent-primary hover:underline font-semibold"
            >
              Contact Support
            </a>
          </p>
        </FadeIn>
      </div>
    </Section>
  );
}
