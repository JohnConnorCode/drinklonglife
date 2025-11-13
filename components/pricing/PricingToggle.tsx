'use client';

import { useState } from 'react';
import { isFeatureEnabledSync } from '@/lib/feature-flags';

export type BillingInterval = 'monthly' | 'yearly';

interface PricingToggleProps {
  defaultInterval?: BillingInterval;
  onChange?: (interval: BillingInterval) => void;
  showSavings?: boolean;
  savingsPercentage?: number;
}

export function PricingToggle({
  defaultInterval = 'monthly',
  onChange,
  showSavings = true,
  savingsPercentage = 20,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);

  // Check if toggle should be shown
  const toggleEnabled = isFeatureEnabledSync('pricing_show_yearly_toggle');
  const showSavingsFlag = isFeatureEnabledSync('pricing_show_savings') && showSavings;

  if (!toggleEnabled) {
    return null;
  }

  const handleChange = (newInterval: BillingInterval) => {
    setInterval(newInterval);
    onChange?.(newInterval);
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Toggle Switch */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
        <button
          onClick={() => handleChange('monthly')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            interval === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => handleChange('yearly')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            interval === 'yearly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Savings Badge */}
      {showSavingsFlag && interval === 'yearly' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
            💰 Save {savingsPercentage}% with yearly billing
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage pricing interval state
 */
export function usePricingInterval(defaultInterval: BillingInterval = 'monthly') {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);

  return {
    interval,
    setInterval,
    isYearly: interval === 'yearly',
    isMonthly: interval === 'monthly',
  };
}

/**
 * Calculate price display based on interval
 */
export function calculateDisplayPrice(
  monthlyPrice: number,
  yearlyPrice: number,
  interval: BillingInterval,
  showMonthlyEquivalent: boolean = true
): {
  displayPrice: number;
  billingText: string;
  savingsText?: string;
} {
  if (interval === 'monthly') {
    return {
      displayPrice: monthlyPrice,
      billingText: '/month',
    };
  }

  const monthlyCost = yearlyPrice / 12;
  const savings = monthlyPrice * 12 - yearlyPrice;
  const savingsPercentage = Math.round((savings / (monthlyPrice * 12)) * 100);

  if (showMonthlyEquivalent) {
    return {
      displayPrice: monthlyCost,
      billingText: '/month',
      savingsText: `Billed yearly at $${(yearlyPrice / 100).toFixed(2)} • Save ${savingsPercentage}%`,
    };
  }

  return {
    displayPrice: yearlyPrice,
    billingText: '/year',
    savingsText: `Save ${savingsPercentage}% vs monthly`,
  };
}
