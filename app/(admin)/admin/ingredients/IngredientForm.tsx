'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { IngredientFormData, ingredientTypes } from '@/lib/validations/ingredient';

interface Ingredient extends IngredientFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

interface IngredientFormProps {
  ingredient?: Ingredient;
  mode: 'create' | 'edit';
}

export function IngredientForm({ ingredient, mode }: IngredientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngredientFormData>({
    defaultValues: ingredient || {
      type: 'fruit',
    },
  });

  // Rich text editors for function and sourcing_story
  const functionEditor = useEditor({
    extensions: [StarterKit, Link],
    content: ingredient?.function || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] focus:outline-none p-4 border rounded-md',
      },
    },
  });

  const sourcingStoryEditor = useEditor({
    extensions: [StarterKit, Link],
    content: ingredient?.sourcing_story || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] focus:outline-none p-4 border rounded-md',
      },
    },
  });

  const onSubmit = async (data: IngredientFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        function: functionEditor?.getJSON() || null,
        sourcing_story: sourcingStoryEditor?.getJSON() || null,
      };

      const url =
        mode === 'create'
          ? '/api/admin/ingredients'
          : `/api/admin/ingredients/${ingredient?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save ingredient');
      }

      router.push('/admin/ingredients');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving ingredient:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="e.g., Turmeric"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              {...register('type', { required: 'Type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              {ingredientTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Seasonality */}
          <div>
            <label htmlFor="seasonality" className="block text-sm font-medium text-gray-700 mb-1">
              Seasonality
            </label>
            <input
              id="seasonality"
              type="text"
              {...register('seasonality')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="e.g., Year-round, Summer, Fall"
            />
          </div>
        </div>
      </section>

      {/* Rich Content */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Rich Content</h2>

        <div className="space-y-4">
          {/* Function */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Benefits / Function
            </label>
            <div className="border rounded-md">
              <EditorContent editor={functionEditor} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Describe the health benefits and functional properties
            </p>
          </div>

          {/* Sourcing Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sourcing Story
            </label>
            <div className="border rounded-md">
              <EditorContent editor={sourcingStoryEditor} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share where and how this ingredient is sourced
            </p>
          </div>

          {/* Nutritional Profile */}
          <div>
            <label htmlFor="nutritional_profile" className="block text-sm font-medium text-gray-700 mb-1">
              Nutritional Profile
            </label>
            <textarea
              id="nutritional_profile"
              {...register('nutritional_profile')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Brief nutritional overview"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Internal notes (not shown to customers)"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>

        <div className="space-y-4">
          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="image_url"
              type="url"
              {...register('image_url')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Full URL to the ingredient image
            </p>
          </div>

          {/* Image Alt */}
          <div>
            <label htmlFor="image_alt" className="block text-sm font-medium text-gray-700 mb-1">
              Image Alt Text
            </label>
            <input
              id="image_alt"
              type="text"
              {...register('image_alt')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Descriptive alt text for accessibility"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/ingredients')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
            ? 'Create Ingredient'
            : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
