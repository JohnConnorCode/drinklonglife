'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Download, UserX, Shield, Star, Users } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';
import { EmptyState } from '@/components/ui/EmptyState';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  partnership_tier: string | null;
  subscription_status: string | null;
  current_plan: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  is_admin?: boolean;
}

interface UsersManagerProps {
  initialUsers: User[];
  searchQuery?: string;
}

export function UsersManager({ initialUsers, searchQuery }: UsersManagerProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'test' | 'real'>('all');

  // Filter users based on selection
  const filteredUsers = useMemo(() => {
    if (filter === 'test') {
      return users.filter(u =>
        u.email?.includes('test') ||
        u.email?.includes('example') ||
        u.email?.includes('+') ||
        u.full_name?.toLowerCase().includes('test')
      );
    }
    if (filter === 'real') {
      return users.filter(u =>
        !u.email?.includes('test') &&
        !u.email?.includes('example') &&
        !u.email?.includes('+') &&
        !u.full_name?.toLowerCase().includes('test')
      );
    }
    return users;
  }, [users, filter]);

  const allSelected = filteredUsers.length > 0 && selectedIds.size === filteredUsers.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredUsers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
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
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `This will permanently delete ${selectedIds.size} user(s) and all their data (orders, subscriptions, referrals). This cannot be undone.`,
    },
    {
      id: 'set-tier-affiliate',
      label: 'Set Affiliate',
      icon: <Star className="w-4 h-4" />,
      variant: 'default',
    },
    {
      id: 'set-tier-partner',
      label: 'Set Partner',
      icon: <Shield className="w-4 h-4" />,
      variant: 'default',
    },
    {
      id: 'export',
      label: 'Export CSV',
      icon: <Download className="w-4 h-4" />,
      variant: 'default',
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      // Client-side CSV export
      const selectedUsers = users.filter(u => selectedIds.has(u.id));
      const csv = [
        ['ID', 'Email', 'Name', 'Tier', 'Subscription', 'Stripe ID', 'Created'].join(','),
        ...selectedUsers.map(u => [
          u.id,
          u.email,
          u.full_name || '',
          u.partnership_tier || 'none',
          u.subscription_status || 'none',
          u.stripe_customer_id || '',
          u.created_at,
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === 'delete') {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete users');
      }

      // Remove deleted users from local state
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
      router.refresh();
      return;
    }

    if (actionId.startsWith('set-tier-')) {
      const tier = actionId.replace('set-tier-', '');
      const res = await fetch('/api/admin/users/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates: { partnership_tier: tier } }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update users');
      }

      // Update local state
      setUsers(prev => prev.map(u =>
        selectedIds.has(u.id) ? { ...u, partnership_tier: tier } : u
      ));
      setSelectedIds(new Set());
      router.refresh();
      return;
    }
  };

  // Quick select test users
  const selectTestUsers = () => {
    const testUserIds = users.filter(u =>
      u.email?.includes('test') ||
      u.email?.includes('example') ||
      u.email?.includes('+') ||
      u.full_name?.toLowerCase().includes('test')
    ).map(u => u.id);
    setSelectedIds(new Set(testUserIds));
  };

  if (filteredUsers.length === 0 && !searchQuery) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description={filter !== 'all' ? `No ${filter} users found. Try a different filter.` : 'No users in the system yet'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Filters & Actions */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {[
              { id: 'all', label: 'All' },
              { id: 'test', label: 'Test Users' },
              { id: 'real', label: 'Real Users' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id as typeof filter); setSelectedIds(new Set()); }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <button
          onClick={selectTestUsers}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          Select All Test Users
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filteredUsers.length} users shown
        </div>
      </div>

      {/* Info Box for Test Users */}
      {filter === 'test' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="font-medium text-yellow-800 mb-1">Test User Detection</p>
          <p className="text-yellow-700">
            Showing users with emails containing &quot;test&quot;, &quot;example&quot;, or &quot;+&quot; (plus addressing),
            or names containing &quot;test&quot;. Select and delete to clean up.
          </p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stripe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const isTest = user.email?.includes('test') ||
                user.email?.includes('example') ||
                user.email?.includes('+') ||
                user.full_name?.toLowerCase().includes('test');

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${selectedIds.has(user.id) ? 'bg-blue-50' : ''} ${isTest ? 'bg-red-50/30' : ''}`}
                >
                  <td className="px-4 py-4">
                    <SelectCheckbox
                      checked={selectedIds.has(user.id)}
                      onChange={(checked) => handleSelectOne(user.id, checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {user.full_name || 'No name'}
                        {isTest && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            TEST
                          </span>
                        )}
                        {user.is_admin && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      ${user.partnership_tier === 'vip' ? 'bg-purple-100 text-purple-800' :
                        user.partnership_tier === 'partner' ? 'bg-blue-100 text-blue-800' :
                        user.partnership_tier === 'affiliate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {user.partnership_tier === 'none' ? 'Standard' : user.partnership_tier || 'None'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full capitalize
                      ${user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                        user.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                        user.subscription_status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                        user.subscription_status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {user.subscription_status || 'none'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.stripe_customer_id ? (
                      <span className="text-green-600">✓ Connected</span>
                    ) : (
                      <span className="text-gray-400">Not connected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredUsers.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="users"
      />
    </div>
  );
}
