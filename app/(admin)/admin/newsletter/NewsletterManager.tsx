'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Trash2, UserCheck, UserX, Mail } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';
import { EmptyState } from '@/components/ui/EmptyState';

interface Subscriber {
  id: string;
  email: string;
  subscribed: boolean;
  source: string | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

interface NewsletterManagerProps {
  initialSubscribers: Subscriber[];
}

export function NewsletterManager({ initialSubscribers }: NewsletterManagerProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      // Search filter
      const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'active' && !s.subscribed) return false;
      if (statusFilter === 'unsubscribed' && s.subscribed) return false;

      return true;
    });
  }, [subscribers, search, statusFilter]);

  const allSelected = filteredSubscribers.length > 0 && selectedIds.size === filteredSubscribers.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredSubscribers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubscribers.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export CSV',
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: 'resubscribe',
      label: 'Resubscribe',
      icon: <UserCheck className="w-4 h-4" />,
      variant: 'success',
    },
    {
      id: 'unsubscribe',
      label: 'Unsubscribe',
      icon: <UserX className="w-4 h-4" />,
      variant: 'warning',
      requiresConfirmation: true,
      confirmationMessage: `This will unsubscribe ${selectedIds.size} subscriber(s). They can resubscribe anytime.`,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `This will permanently delete ${selectedIds.size} subscriber(s). This cannot be undone.`,
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      const selectedSubscribers = subscribers.filter(s => selectedIds.has(s.id));
      const csv = [
        ['Email', 'Status', 'Source', 'Subscribed Date', 'Unsubscribed Date'].join(','),
        ...selectedSubscribers.map(s => [
          s.email,
          s.subscribed ? 'Active' : 'Unsubscribed',
          s.source || 'Unknown',
          s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : '',
          s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString() : '',
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === 'delete') {
      const res = await fetch('/api/admin/newsletter/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete subscribers');
      }

      setSubscribers(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      router.refresh();
      return;
    }

    if (actionId === 'resubscribe' || actionId === 'unsubscribe') {
      const res = await fetch('/api/admin/newsletter/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates: { subscribed: actionId === 'resubscribe' } }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update subscribers');
      }

      setSubscribers(prev => prev.map(s =>
        selectedIds.has(s.id) ? { ...s, subscribed: actionId === 'resubscribe' } : s
      ));
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  // Quick filter counts
  const activeCount = subscribers.filter(s => s.subscribed).length;
  const unsubscribedCount = subscribers.filter(s => !s.subscribed).length;

  if (subscribers.length === 0 && !search) {
    return (
      <EmptyState
        icon={Mail}
        title="No subscribers yet"
        description="Newsletter subscribers will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedIds(new Set()); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setSelectedIds(new Set()); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({subscribers.length})</option>
            <option value="active">Active ({activeCount})</option>
            <option value="unsubscribed">Unsubscribed ({unsubscribedCount})</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Quick Select Buttons */}
        <button
          onClick={() => {
            const unsubscribed = subscribers.filter(s => !s.subscribed).map(s => s.id);
            setSelectedIds(new Set(unsubscribed));
          }}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Select Unsubscribed ({unsubscribedCount})
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filteredSubscribers.length} subscribers shown
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SelectAllCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unsubscribed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No subscribers match your search
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(subscriber.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <SelectCheckbox
                        checked={selectedIds.has(subscriber.id)}
                        onChange={(checked) => handleSelectOne(subscriber.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${subscriber.subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">
                        {subscriber.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {subscriber.unsubscribed_at ? new Date(subscriber.unsubscribed_at).toLocaleDateString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredSubscribers.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="subscribers"
      />
    </div>
  );
}
