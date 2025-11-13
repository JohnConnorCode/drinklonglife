'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  label?: string;
  className?: string;
  disabled?: boolean;
  discountCode?: string; // Optional discount code to apply
}

export function CheckoutButton({
  priceId,
  mode,
  label = 'Subscribe Now',
  className = '',
  disabled = false,
  discountCode,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const body: any = {
        priceId,
        mode,
        successPath: '/checkout/success',
        cancelPath: '/checkout/cancel',
      };

      // Add discount code if provided
      if (discountCode) {
        body.discountCode = discountCode;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={`
          ${className}
          ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          transition-all duration-300 flex items-center justify-center gap-2
        `}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span>{loading ? 'Processing...' : label}</span>
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Checkout Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 font-medium mt-2 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
