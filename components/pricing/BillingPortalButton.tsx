'use client';

import { useState } from 'react';

interface BillingPortalButtonProps {
  className?: string;
  label?: string;
}

export function BillingPortalButton({
  className = '',
  label = 'Manage Subscription',
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: '/account',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('Billing portal error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          px-6 py-3 bg-accent-primary text-white rounded-full font-semibold
          hover:opacity-90 transition-all shadow-md hover:shadow-lg
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {loading ? 'Opening...' : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
