'use client';

import Link from 'next/link';
import { ProfileCompletionChecklist } from '@/lib/user-utils';

interface ProfileCompletionCardProps {
  completion: ProfileCompletionChecklist;
}

export function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  // Don't show if profile is complete
  if (completion.isComplete) {
    return null;
  }

  const { percentage, items } = completion;
  const incompleteItems = items.filter((item) => !item.completed);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            Complete Your Profile
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {percentage}% complete • {incompleteItems.length} items remaining
          </p>
        </div>
        <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                item.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {item.completed ? '✓' : '○'}
            </div>
            <span
              className={`text-sm ${
                item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/account/settings"
        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Complete Profile
      </Link>

      {percentage >= 50 && (
        <p className="text-xs text-center text-gray-500 mt-2">
          You're halfway there! 🎉
        </p>
      )}
    </div>
  );
}

/**
 * Compact version for smaller spaces (e.g., navbar, sidebar)
 */
export function ProfileCompletionBadge({ completion }: ProfileCompletionCardProps) {
  if (completion.isComplete) {
    return null;
  }

  return (
    <Link
      href="/account/settings"
      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
    >
      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
      Profile {completion.percentage}% complete
    </Link>
  );
}
