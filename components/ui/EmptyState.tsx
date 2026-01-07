import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Empty State Component
 * Reusable component for showing friendly empty states across the app
 * Use for: empty cart, no orders, no products found, etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-8">
        {description}
      </p>

      {/* Optional Action Button */}
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-8 py-3 bg-accent-primary text-white rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-8 py-3 bg-accent-primary text-white rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Admin Empty State (dark theme variant)
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-8">
        {description}
      </p>

      {/* Optional Action Button */}
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Cart Empty State (specialized)
 */
interface CartEmptyStateProps {
  className?: string;
}

export function CartEmptyState({ className = '' }: CartEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {/* Shopping Bag Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-accent-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-heading font-bold text-gray-900 mb-3">
        Your cart is empty
      </h2>

      <p className="text-gray-600 max-w-md mb-8">
        Looks like you haven't added any items to your cart yet. Explore our fresh, cold-pressed blends and start building your order.
      </p>

      <Link
        href="/blends"
        className="px-8 py-3 bg-accent-primary text-white rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Shop Our Blends
      </Link>
    </div>
  );
}

/**
 * Orders Empty State (specialized)
 */
export function OrdersEmptyState({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {/* Package Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-accent-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-heading font-bold text-gray-900 mb-3">
        No orders yet
      </h2>

      <p className="text-gray-600 max-w-md mb-8">
        You haven't placed any orders with us yet. Start your wellness journey today with our cold-pressed blends.
      </p>

      <Link
        href="/blends"
        className="px-8 py-3 bg-accent-primary text-white rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Start Shopping
      </Link>
    </div>
  );
}

/**
 * Search Empty State (specialized)
 */
interface SearchEmptyStateProps {
  searchQuery: string;
  onClear?: () => void;
  className?: string;
}

export function SearchEmptyState({
  searchQuery,
  onClear,
  className = '',
}: SearchEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {/* Search Icon */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
        No results found
      </h3>

      <p className="text-gray-600 max-w-md mb-8">
        We couldn't find any results for "{searchQuery}". Try adjusting your search or browse all products.
      </p>

      <div className="flex gap-3">
        {onClear && (
          <button
            onClick={onClear}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            Clear Search
          </button>
        )}
        <Link
          href="/blends"
          className="px-6 py-2 bg-accent-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Browse All
        </Link>
      </div>
    </div>
  );
}
