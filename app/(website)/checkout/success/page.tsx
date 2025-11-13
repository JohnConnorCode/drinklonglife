import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Payment Successful | Long Life',
  description: 'Your payment was successful!',
};

export default function CheckoutSuccessPage() {
  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn direction="up" delay={0.1}>
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-green to-accent-primary rounded-full mb-8 shadow-2xl">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Payment Successful!
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Thank you for your purchase. We've received your payment and you'll
            receive a confirmation email shortly.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.4}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8 border-2 border-accent-yellow/20">
            <h2 className="font-heading text-2xl font-bold mb-4 text-gray-900">
              What's Next?
            </h2>
            <ul className="space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Check your email for order confirmation and receipt
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Your subscription or purchase has been activated
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Manage your subscription anytime from your account
                </span>
              </li>
            </ul>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </Link>
            <Link
              href="/blends"
              className="px-8 py-4 border-2 border-accent-primary text-accent-primary rounded-full font-semibold text-lg hover:bg-accent-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View Our Blends
            </Link>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.6}>
          <p className="mt-8 text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@longlife.com"
              className="text-accent-primary hover:underline font-semibold"
            >
              support@longlife.com
            </a>
          </p>
        </FadeIn>
      </div>
    </Section>
  );
}
