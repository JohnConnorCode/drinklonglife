'use client';

import { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  /** If true, shows a text input for additional data (e.g., reason) */
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
  actions: BulkAction[];
  onAction: (actionId: string, inputValue?: string) => Promise<void>;
  entityName?: string; // e.g., "users", "orders"
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  allSelected,
  actions,
  onAction,
  entityName = 'items',
}: BulkActionsBarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<BulkAction | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation || action.requiresInput) {
      setConfirmingAction(action);
      setInputValue('');
      return;
    }

    await executeAction(action.id);
  };

  const executeAction = async (actionId: string, input?: string) => {
    setLoading(actionId);
    setResult(null);
    setConfirmingAction(null);

    try {
      await onAction(actionId, input);
      setResult({ type: 'success', message: `Action completed successfully` });
      setTimeout(() => setResult(null), 3000);
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Action failed'
      });
    } finally {
      setLoading(null);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
        <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3 pr-4 border-r border-gray-700">
            <button
              onClick={onDeselectAll}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              <span className="text-blue-400">{selectedCount}</span> of {totalCount} {entityName} selected
            </span>
            {!allSelected && (
              <button
                onClick={onSelectAll}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Select all {totalCount}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={loading !== null}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${action.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : action.variant === 'success'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }
                `}
              >
                {loading === action.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            ))}
          </div>

          {/* Result Indicator */}
          {result && (
            <div className={`flex items-center gap-2 pl-4 border-l border-gray-700 ${
              result.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-full ${
                confirmingAction.variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  confirmingAction.variant === 'danger' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm {confirmingAction.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {confirmingAction.confirmationMessage ||
                    `Are you sure you want to ${confirmingAction.label.toLowerCase()} ${selectedCount} ${entityName}?`
                  }
                </p>
              </div>
            </div>

            {confirmingAction.requiresInput && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {confirmingAction.inputLabel || 'Additional Information'}
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={confirmingAction.inputPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmingAction(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction(confirmingAction.id, inputValue)}
                disabled={confirmingAction.requiresInput && !inputValue.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  confirmingAction.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : `Confirm ${confirmingAction.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Reusable checkbox for table rows
export function SelectCheckbox({
  checked,
  onChange,
  className = '',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
    />
  );
}

// Select all checkbox for table headers
export function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  className = '',
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
    />
  );
}
