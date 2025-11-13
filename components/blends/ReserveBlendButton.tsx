'use client';

import { useState } from 'react';

interface ReserveBlendButtonProps {
  size: {
    _id: string;
    name: string;
    price: number;
    stripePriceId?: string;
    stripeSubscriptionPriceId?: string;
  };
  blendSlug: string;
  isPopular?: boolean;
}

export function ReserveBlendButton({
  size,
  blendSlug,
  isPopular = false,
}: ReserveBlendButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);

  const handleReserve = async () => {
    // Determine which price ID to use based on payment mode
    const priceId = isSubscription ? size.stripeSubscriptionPriceId : size.stripePriceId;
    const mode = isSubscription ? 'subscription' : 'payment';

    // Check if stripe price is available
    if (!priceId) {
      setError('This item is not available for purchase yet. Please check back soon!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
          successPath: `/checkout/success?blend=${blendSlug}&size=${size._id}`,
          cancelPath: `/blends/${blendSlug}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        // Use window.location for external redirect to Stripe
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Mode Toggle */}
      <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={() => setIsSubscription(false)}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
            !isSubscription
              ? 'bg-accent-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          One-Time
        </button>
        <button
          onClick={() => setIsSubscription(true)}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
            isSubscription
              ? 'bg-accent-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          Monthly
        </button>
      </div>

      {/* Price Display */}
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">
          ${size.price}
          {isSubscription && <span className="text-lg font-normal text-gray-600">/month</span>}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {isSubscription ? 'Billed monthly, cancel anytime' : 'One-time purchase'}
        </p>
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        disabled={isLoading || (!size.stripePriceId && !size.stripeSubscriptionPriceId)}
        className={`w-full px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
          isPopular
            ? 'bg-accent-primary text-white hover:opacity-90 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-accent-primary hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Processing...' : 'Reserve Now'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
