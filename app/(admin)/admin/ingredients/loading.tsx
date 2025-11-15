import { TableSkeleton } from '@/components/LoadingState';

export default function IngredientsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white shadow rounded-lg p-6">
        <TableSkeleton rows={8} columns={6} />
      </div>
    </div>
  );
}
