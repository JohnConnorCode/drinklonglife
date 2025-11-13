'use client';

import { useState } from 'react';
import { trackTierChange } from '@/lib/analytics';

interface TierUpgradeCardProps {
  tier: 'affiliate' | 'partner' | 'vip';
  tierName: string;
  price: number;
  billingPeriod: string;
  currentTier: string;
  features: string[];
  userId: string;
  isRecommended?: boolean;
  isPremium?: boolean;
}

export function TierUpgradeCard({
  tier,
  tierName,
  price,
  billingPeriod,
  currentTier,
  features,
  userId,
  isRecommended = false,
  isPremium = false,
}: TierUpgradeCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine card state
  const isCurrentTier = currentTier === tier;
  const isLowerTier = getTierLevel(tier) <= getTierLevel(currentTier);
  const canUpgrade = !isCurrentTier && !isLowerTier;

  const handleUpgrade = async () => {
    if (!canUpgrade) return;

    setIsProcessing(true);

    try {
      // Track tier upgrade view
      trackTierChange('tier_upgrade_viewed', userId, currentTier, tier);

      // Create checkout session for tier upgrade
      const response = await fetch('/api/checkout/tier-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTier: tier,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Tier upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${
        isRecommended ? 'ring-2 ring-blue-500' : ''
      } ${isPremium ? 'ring-2 ring-yellow-500' : ''}`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
          Recommended
        </div>
      )}

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
          ⭐ Premium
        </div>
      )}

      {/* Current Tier Badge */}
      {isCurrentTier && (
        <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-br-lg">
          Current Tier
        </div>
      )}

      <div className="p-8">
        {/* Tier Name */}
        <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
          {tierName}
        </h3>

        {/* Price */}
        <div className="mb-6">
          {price === 0 ? (
            <div className="text-4xl font-bold text-gray-900">Free</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-gray-900">
                ${(price / 100).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">{billingPeriod}</div>
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {isCurrentTier ? (
          <button
            disabled
            className="w-full py-3 bg-green-100 text-green-800 rounded-lg font-semibold cursor-not-allowed"
          >
            Your Current Tier
          </button>
        ) : isLowerTier ? (
          <button
            disabled
            className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
          >
            Lower Tier
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isPremium
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                : isRecommended
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? 'Processing...' : `Upgrade to ${tierName}`}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Get numeric tier level for comparison
 */
function getTierLevel(tier: string): number {
  const levels: Record<string, number> = {
    none: 0,
    affiliate: 1,
    partner: 2,
    vip: 3,
  };

  return levels[tier] || 0;
}
