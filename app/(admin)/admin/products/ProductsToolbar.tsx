'use client';

import { useState } from 'react';
import { Download, RefreshCw, Search, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductsToolbarProps {
  totalCount: number;
}

export function ProductsToolbar({ totalCount }: ProductsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/export/products');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the CSV content
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export products. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Filter Row */}
      <div className="flex gap-4 items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          >
            <option value="all">All Products</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {totalCount} product{totalCount !== 1 ? 's' : ''} total
          {searchTerm && ` • Searching for "${searchTerm}"`}
          {statusFilter && statusFilter !== 'all' && ` • Filtered by ${statusFilter}`}
        </div>
        {(searchTerm || (statusFilter && statusFilter !== 'all')) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              router.push('/admin/products');
            }}
            className="text-accent-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
