import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-6 text-6xl">{icon}</div>
      <h3 className="font-heading text-xl font-bold mb-3 text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-block px-8 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
