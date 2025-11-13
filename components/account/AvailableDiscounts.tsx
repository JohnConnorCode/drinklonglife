'use client';

import { useState } from 'react';

interface Discount {
  id: string;
  discount_code: string;
  source: string;
  active: boolean;
  expires_at: string | null;
}

interface AvailableDiscountsProps {
  discounts: Discount[];
}

export function AvailableDiscounts({ discounts }: AvailableDiscountsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const activeDiscounts = discounts.filter((d) => {
    if (!d.active) return false;
    if (!d.expires_at) return true;
    return new Date(d.expires_at) > new Date();
  });

  if (activeDiscounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-2xl p-6 border-2 border-accent-yellow/30">
      <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Your Available Discounts
      </h3>

      <div className="space-y-3">
        {activeDiscounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-mono font-bold text-lg rounded">
                    {discount.discount_code}
                  </code>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded uppercase">
                    {discount.source}
                  </span>
                </div>
                {discount.expires_at && (
                  <p className="text-sm text-gray-600">
                    Expires:{' '}
                    {new Date(discount.expires_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(discount.discount_code)}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg font-semibold hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
              >
                {copiedCode === discount.discount_code ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Copy the code and enter it at checkout to apply your discount automatically.
          </span>
        </p>
      </div>
    </div>
  );
}
