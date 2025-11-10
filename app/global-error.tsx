'use client';

/**
 * Global Error Handler
 * This catches errors in the root layout
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
          <div className="text-center max-w-2xl">
            <h1 className="text-7xl md:text-9xl font-bold text-gray-200 mb-4">
              Error
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Application Error
            </h2>
            <p className="text-lg text-gray-600 mb-2 max-w-md mx-auto">
              A critical error occurred. Please refresh the page.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-400 mb-8 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
