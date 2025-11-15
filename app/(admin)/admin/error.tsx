'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
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
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-6">
          An error occurred while loading this page.
        </p>
        {error.message && (
          <details className="mb-6">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-accent-primary text-white px-4 py-2 rounded-md hover:bg-accent-primary/90"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/admin')}
            className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
