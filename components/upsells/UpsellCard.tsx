'use client';

import { useState } from 'react';
import Image from 'next/image';
import { trackUpsellEvent } from '@/lib/analytics';

export interface UpsellOffer {
  id: string;
  title: string;
  shortDescription: string;
  image?: {
    url: string;
    alt: string;
  };
  offerType: string;
  stripePriceId: string;
  discountPercentage?: number;
  originalPrice?: number;
  salePrice?: number;
  ctaLabel: string;
  limitedTimeOffer?: boolean;
}

interface UpsellCardProps {
  offer: UpsellOffer;
  userId: string;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export function UpsellCard({ offer, userId, onAccept, onDismiss }: UpsellCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    trackUpsellEvent('upsell_clicked', userId, offer.id);

    try {
      // Create checkout session for upsell
      const response = await fetch('/api/checkout/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: offer.stripePriceId,
          upsellId: offer.id,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upsell checkout error:', error);
      setIsProcessing(false);
    }

    onAccept?.();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    trackUpsellEvent('upsell_dismissed', userId, offer.id);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  const showPricing =
    offer.originalPrice !== undefined && offer.salePrice !== undefined;
  const savings = showPricing
    ? offer.originalPrice! - offer.salePrice!
    : null;

  return (
    <div className="relative bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Limited Time Badge */}
      {offer.limitedTimeOffer && (
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
            ⚡ Limited Time
          </span>
        </div>
      )}

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-0 right-0 mt-2 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss offer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        {offer.image && (
          <div className="flex-shrink-0">
            <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden">
              <Image
                src={offer.image.url}
                alt={offer.image.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
            {offer.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{offer.shortDescription}</p>

          {/* Pricing */}
          {showPricing && (
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                ${(offer.salePrice! / 100).toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${(offer.originalPrice! / 100).toFixed(2)}
              </span>
              {savings && (
                <span className="text-sm font-semibold text-green-600">
                  Save ${(savings / 100).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : offer.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Upsell card grid for displaying multiple offers
 */
interface UpsellGridProps {
  offers: UpsellOffer[];
  userId: string;
}

export function UpsellGrid({ offers, userId }: UpsellGridProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <UpsellCard key={offer.id} offer={offer} userId={userId} />
      ))}
    </div>
  );
}
