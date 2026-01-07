import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-7xl md:text-9xl font-display font-bold text-gray-200 mb-4">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/blends"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            Shop Blends
          </Link>
        </div>
      </div>
    </div>
  );
}
