'use client';

import { useEffect, useState, Suspense } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface OrderDetails {
  orderNumber: string;
  email: string;
  amount: number;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  shipping?: {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useCartStore((state) => state.clearCart);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart after successful purchase
    // Only clear if we have a session_id to prevent accidental clears
    if (sessionId) {
      logger.info('✅ Payment successful - clearing cart');
      clearCart();

      // Fetch order details
      fetchOrderDetails(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch order details (${response.status})`);
      }
      const data = await response.json();
      setOrderDetails(data);
      setFetchError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load order details';
      logger.error('Error fetching order details:', error);
      setFetchError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Error Message */}
        {fetchError && !loading && (
          <FadeIn direction="up" delay={0.35}>
            <div className="bg-blue-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8 border-2 border-blue-200">
              <div className="flex items-start gap-3 text-left">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Order details unavailable</p>
                  <p className="text-sm text-blue-700 mb-2">
                    Your payment was successful, but we couldn't load your order details.
                    Don't worry - you'll receive a confirmation email shortly.
                  </p>
                  <button
                    onClick={() => sessionId && fetchOrderDetails(sessionId)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Order Details */}
        {orderDetails && !loading && !fetchError && (
          <FadeIn direction="up" delay={0.35}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8 border-2 border-accent-primary/20">
              <h2 className="font-heading text-2xl font-bold mb-4 text-gray-900">
                Order Summary
              </h2>

              <div className="text-left space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="font-mono font-semibold text-gray-900">{orderDetails.orderNumber}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-gray-900">{orderDetails.email}</span>
                </div>

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div className="pb-3 border-b border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Items:</div>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-900">
                            {item.description} {item.quantity > 1 && `× ${item.quantity}`}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orderDetails.shipping && (
                  <div className="pb-3 border-b border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Shipping To:</div>
                    <div className="text-sm text-gray-900">
                      {orderDetails.shipping.name && <div className="font-medium">{orderDetails.shipping.name}</div>}
                      {orderDetails.shipping.address && (
                        <>
                          {orderDetails.shipping.address.line1 && <div>{orderDetails.shipping.address.line1}</div>}
                          {orderDetails.shipping.address.line2 && <div>{orderDetails.shipping.address.line2}</div>}
                          <div>
                            {[
                              orderDetails.shipping.address.city,
                              orderDetails.shipping.address.state,
                              orderDetails.shipping.address.postal_code,
                            ].filter(Boolean).join(', ')}
                          </div>
                          {orderDetails.shipping.address.country && <div>{orderDetails.shipping.address.country}</div>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-accent-primary">
                    {formatCurrency(orderDetails.amount)}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

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
          <div className="mt-8 space-y-3 text-sm text-gray-500">
            {orderDetails && (
              <p>
                <Link
                  href={`/order-lookup?email=${encodeURIComponent(orderDetails.email)}&order=${orderDetails.orderNumber}`}
                  className="text-accent-primary hover:underline font-semibold"
                >
                  Bookmark order lookup
                </Link>
                {' '}to check your order status anytime
              </p>
            )}
            <p>
              Need help? Contact us at{' '}
              <a
                href="mailto:support@drinklonglife.com"
                className="text-accent-primary hover:underline font-semibold"
              >
                support@drinklonglife.com
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-accent-yellow/20 to-accent-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-green to-accent-primary rounded-full mb-8 shadow-2xl">
            <svg
              className="w-12 h-12 text-white animate-pulse"
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
        </div>
      </Section>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
