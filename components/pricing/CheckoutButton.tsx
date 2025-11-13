'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  priceId,
  mode,
  label = 'Subscribe Now',
  className = '',
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
          successPath: '/checkout/success',
          cancelPath: '/checkout/cancel',
        }),
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
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={`
          ${className}
          ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          transition-all duration-300
        `}
      >
        {loading ? 'Loading...' : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
