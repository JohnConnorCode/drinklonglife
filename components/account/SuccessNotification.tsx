'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function SuccessNotification() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for success messages in URL params
    if (searchParams.get('password_updated') === 'true') {
      setMessage('Password updated successfully!');
      setShow(true);
    } else if (searchParams.get('subscription_updated') === 'true') {
      setMessage('Subscription updated successfully!');
      setShow(true);
    } else if (searchParams.get('payment_method_updated') === 'true') {
      setMessage('Payment method updated successfully!');
      setShow(true);
    }

    // Auto-hide after 5 seconds
    if (show) {
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [searchParams, show]);

  if (!show || !message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
      <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">{message}</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="flex-shrink-0 text-green-600 hover:text-green-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
