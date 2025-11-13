'use client';

import { useState } from 'react';

interface ReserveBlendButtonProps {
  size: {
    _id: string;
    name: string;
    price: number;
    stripePriceId?: string;
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

  const handleReserve = async () => {
    // Check if stripe price is available
    if (!size.stripePriceId) {
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
          priceId: size.stripePriceId,
          mode: 'payment',
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
    <div>
      <button
        onClick={handleReserve}
        disabled={isLoading || !size.stripePriceId}
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
