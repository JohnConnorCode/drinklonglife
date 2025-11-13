interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'table' | 'stat';
  lines?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'text',
  lines = 3,
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Default text variant
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded mb-2"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
