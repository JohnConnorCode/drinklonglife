'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Trash2, Eye, EyeOff, Star, StarOff, Power, PowerOff } from 'lucide-react';
import { BulkActionsBar, SelectCheckbox, SelectAllCheckbox, BulkAction } from '@/components/admin/BulkActionsBar';

interface Product {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  image_alt: string | null;
  is_active: boolean;
  is_featured: boolean;
  published_at: string | null;
  display_order: number;
  variants: Array<{ count: number }>;
  product_ingredients: Array<{ count: number }>;
}

interface ProductsManagerProps {
  initialProducts: Product[];
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'published' && !p.published_at) return false;
      if (statusFilter === 'draft' && p.published_at) return false;

      // Active filter
      if (activeFilter === 'active' && !p.is_active) return false;
      if (activeFilter === 'inactive' && p.is_active) return false;

      return true;
    });
  }, [products, search, statusFilter, activeFilter]);

  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredProducts.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
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
      id: 'publish',
      label: 'Publish',
      icon: <Eye className="w-4 h-4" />,
      variant: 'success',
    },
    {
      id: 'unpublish',
      label: 'Unpublish',
      icon: <EyeOff className="w-4 h-4" />,
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: <Power className="w-4 h-4" />,
      variant: 'success',
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: <PowerOff className="w-4 h-4" />,
      variant: 'warning',
    },
    {
      id: 'feature',
      label: 'Set Featured',
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'unfeature',
      label: 'Unfeature',
      icon: <StarOff className="w-4 h-4" />,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `This will permanently delete ${selectedIds.size} product(s) and all their variants, ingredients, and related data. This cannot be undone.`,
    },
  ];

  const handleBulkAction = async (actionId: string) => {
    const ids = Array.from(selectedIds);

    if (actionId === 'export') {
      const selectedProducts = products.filter(p => selectedIds.has(p.id));
      const csv = [
        ['ID', 'Name', 'Slug', 'Active', 'Published', 'Featured', 'Display Order', 'Variants', 'Ingredients'].join(','),
        ...selectedProducts.map(p => [
          p.id,
          p.name,
          p.slug,
          p.is_active ? 'Yes' : 'No',
          p.published_at ? 'Yes' : 'No',
          p.is_featured ? 'Yes' : 'No',
          p.display_order,
          p.variants[0]?.count || 0,
          p.product_ingredients[0]?.count || 0,
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === 'delete') {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete products');
      }

      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      router.refresh();
      return;
    }

    // Update actions
    const updateMap: Record<string, Record<string, any>> = {
      'publish': { published_at: new Date().toISOString() },
      'unpublish': { published_at: null },
      'activate': { is_active: true },
      'deactivate': { is_active: false },
      'feature': { is_featured: true },
      'unfeature': { is_featured: false },
    };

    const updates = updateMap[actionId];
    if (updates) {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update products');
      }

      // Update local state
      setProducts(prev => prev.map(p =>
        selectedIds.has(p.id) ? { ...p, ...updates } : p
      ));
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  // Quick filter counts
  const publishedCount = products.filter(p => p.published_at).length;
  const draftCount = products.filter(p => !p.published_at).length;
  const inactiveCount = products.filter(p => !p.is_active).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedIds(new Set()); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setSelectedIds(new Set()); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({products.length})</option>
            <option value="published">Published ({publishedCount})</option>
            <option value="draft">Drafts ({draftCount})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Active:</span>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as any); setSelectedIds(new Set()); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active ({products.length - inactiveCount})</option>
            <option value="inactive">Inactive ({inactiveCount})</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Quick Select Buttons */}
        <button
          onClick={() => {
            const drafts = products.filter(p => !p.published_at).map(p => p.id);
            setSelectedIds(new Set(drafts));
          }}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Select All Drafts ({draftCount})
        </button>

        <button
          onClick={() => {
            const inactive = products.filter(p => !p.is_active).map(p => p.id);
            setSelectedIds(new Set(inactive));
          }}
          className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Select Inactive ({inactiveCount})
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filteredProducts.length} products shown
        </div>
      </div>

      {/* Products Table */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {search ? 'No products match your search' : 'No products yet'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(product.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <SelectCheckbox
                        checked={selectedIds.has(product.id)}
                        onChange={(checked) => handleSelectOne(product.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.image_alt || product.name}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">/{product.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {product.published_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                        {!product.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.is_featured ? (
                        <span className="text-yellow-500 text-xl">★</span>
                      ) : (
                        <span className="text-gray-300 text-xl">☆</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {product.product_ingredients[0]?.count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {product.variants[0]?.count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{product.display_order}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredProducts.length}
        onSelectAll={() => handleSelectAll(true)}
        onDeselectAll={() => setSelectedIds(new Set())}
        allSelected={allSelected}
        actions={bulkActions}
        onAction={handleBulkAction}
        entityName="products"
      />
    </div>
  );
}
