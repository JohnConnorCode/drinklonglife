'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Filter products
  const filtered = products.filter((p) => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus === 'published' && !p.published_at) return false;
    if (filterStatus === 'draft' && p.published_at) return false;

    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Image</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Featured</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Variants</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Order</th>
              <th className="text-right p-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {search ? 'No products match your search' : 'No products yet'}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
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
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">/{product.slug}</div>
                  </td>
                  <td className="p-4">
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
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {product.is_featured ? (
                      <span className="text-yellow-500">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-700">{product.variants[0]?.count || 0}</td>
                  <td className="p-4 text-gray-700">{product.display_order}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
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

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        Showing {filtered.length} of {products.length} products
      </div>
    </div>
  );
}
