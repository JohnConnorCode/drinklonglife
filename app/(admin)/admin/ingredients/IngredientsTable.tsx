'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Ingredient {
  id: string;
  name: string;
  type: 'fruit' | 'root' | 'green' | 'herb' | 'other';
  seasonality?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onDelete: (id: string) => void;
}

const typeColors: Record<string, string> = {
  fruit: 'bg-red-100 text-red-800',
  root: 'bg-orange-100 text-orange-800',
  green: 'bg-green-100 text-green-800',
  herb: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export function IngredientsTable({ ingredients, onDelete }: IngredientsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No ingredients found</p>
        <Link
          href="/admin/ingredients/new"
          className="inline-block bg-accent-primary text-white px-4 py-2 rounded-md hover:bg-accent-primary/90"
        >
          Add First Ingredient
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seasonality
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {ingredient.image_url ? (
                  <div className="relative w-12 h-12">
                    <Image
                      src={ingredient.image_url}
                      alt={ingredient.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    typeColors[ingredient.type] || typeColors.other
                  }`}
                >
                  {ingredient.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {ingredient.seasonality || '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(ingredient.updated_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/admin/ingredients/${ingredient.id}`}
                  className="text-accent-primary hover:text-accent-primary/80 mr-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(ingredient.id, ingredient.name)}
                  disabled={deletingId === ingredient.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deletingId === ingredient.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
