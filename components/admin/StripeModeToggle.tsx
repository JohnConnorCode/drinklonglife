'use client';

import { useEffect, useState } from 'react';

export function StripeModeToggle() {
  const [mode, setMode] = useState<'test' | 'production' | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMode();
  }, []);

  async function fetchMode() {
    try {
      const res = await fetch('/api/admin/stripe-settings');
      const data = await res.json();
      setMode(data.mode);
    } catch (error) {
      console.error('Failed to fetch Stripe mode:', error);
      setError('Failed to load Stripe mode');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    if (!mode || switching) return;

    const newMode = mode === 'test' ? 'production' : 'test';
    const confirmed = window.confirm(
      `Are you sure you want to switch to ${newMode.toUpperCase()} mode?\n\n` +
      `${newMode === 'production'
        ? '⚠️ WARNING: Production mode will process REAL payments with REAL credit cards.'
        : '✅ Test mode uses test credit cards only. No real charges will occur.'
      }`
    );

    if (!confirmed) return;

    setSwitching(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/stripe-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update Stripe mode');
      }

      const data = await res.json();
      setMode(data.mode);
    } catch (error: any) {
      console.error('Failed to switch Stripe mode:', error);
      setError(error.message || 'Failed to switch mode');
    } finally {
      setSwitching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          Error loading mode
        </div>
      </div>
    );
  }

  const isProduction = mode === 'production';
  const bgColor = isProduction ? 'bg-red-50' : 'bg-green-50';
  const textColor = isProduction ? 'text-red-700' : 'text-green-700';
  const borderColor = isProduction ? 'border-red-200' : 'border-green-200';
  const badge = isProduction ? '🔴' : '🟢';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1.5 rounded-full border ${bgColor} ${textColor} text-xs font-medium ${borderColor}`}>
          <span className="mr-1">{badge}</span>
          <span>{isProduction ? 'Production' : 'Test'} Mode</span>
        </div>

        <button
          onClick={handleToggle}
          disabled={switching}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            switching
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {switching ? 'Switching...' : `Switch to ${isProduction ? 'Test' : 'Production'}`}
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className={`px-4 py-3 rounded-md text-sm ${
        isProduction
          ? 'bg-red-50 border border-red-200 text-red-800'
          : 'bg-green-50 border border-green-200 text-green-800'
      }`}>
        {isProduction ? (
          <>
            <strong>Production Mode Active:</strong> All payments will be processed with real credit cards.
            Real charges will occur.
          </>
        ) : (
          <>
            <strong>Test Mode Active:</strong> Use test credit cards (4242 4242 4242 4242).
            No real charges will occur.
          </>
        )}
      </div>
    </div>
  );
}
