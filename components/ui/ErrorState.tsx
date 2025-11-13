interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-12 text-center ${className}`}>
      <div className="mb-6 text-6xl">⚠️</div>
      <h2 className="font-heading text-2xl font-bold mb-3 text-gray-900">
        {title}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
        >
          {action.label}
        </button>
      )}
      <p className="text-sm text-gray-500 mt-6">
        If this problem persists, please{' '}
        <a
          href="mailto:support@longlife.com"
          className="text-accent-primary hover:text-accent-dark font-semibold"
        >
          contact support
        </a>
      </p>
    </div>
  );
}
