'use client';

import { useEffect } from 'react';

interface KlaviyoFormProps {
  formId?: string;
  className?: string;
}

export function NewsletterForm({ formId, className = '' }: KlaviyoFormProps) {
  useEffect(() => {
    // Ensure Klaviyo is loaded
    if (typeof window !== 'undefined' && window._klOnsite) {
      console.log('Klaviyo loaded successfully');
    }
  }, []);

  return (
    <div className={`klaviyo-form-embed ${className}`}>
      {/* Klaviyo will inject the form here based on your Klaviyo dashboard settings */}
      {/* You can create forms in Klaviyo and embed them using the formId */}
      {formId ? (
        <div className={`klaviyo-form-${formId}`} />
      ) : (
        // Fallback inline form that Klaviyo can capture
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white shadow-md text-base sm:text-lg"
            required
            name="email"
            id="klaviyo-email-input"
          />
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-accent-primary text-white rounded-xl font-bold hover:bg-accent-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg"
            onClick={() => {
              const email = (document.getElementById('klaviyo-email-input') as HTMLInputElement)?.value;
              if (email && window.klaviyo) {
                window.klaviyo.push(['identify', { email }]);
                alert('Thanks for subscribing!');
              }
            }}
          >
            Join Now
          </button>
        </div>
      )}
    </div>
  );
}

// Type declaration for Klaviyo
declare global {
  interface Window {
    klaviyo: any;
    _klOnsite: any[];
  }
}
