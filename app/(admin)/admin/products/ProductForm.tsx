'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().optional(),
  tagline: z.string().max(200).optional().nullable(),
  label_color: z.enum(['yellow', 'red', 'green']),
  function_list: z.string().optional(), // Comma-separated string
  best_for: z.string().optional(), // Comma-separated string
  is_featured: z.boolean(),
  is_active: z.boolean(),
  display_order: z.coerce.number().min(1),
  stripe_product_id: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  publish: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Ingredient {
  id: string;
  name: string;
  type: string;
}

export function ProductForm({ product, ingredients, variants, allIngredients }: any) {
  const router = useRouter();
  const supabase = createClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    ingredients?.map((i: any) => i.ingredient) || []
  );

  // Rich text editors
  const descriptionEditor = useEditor({
    extensions: [StarterKit],
    content: product?.description || { type: 'doc', content: [] },
  });

  const storyEditor = useEditor({
    extensions: [StarterKit],
    content: product?.story || { type: 'doc', content: [] },
  });

  const detailedFunctionEditor = useEditor({
    extensions: [StarterKit],
    content: product?.detailed_function || { type: 'doc', content: [] },
  });

  const howToUseEditor = useEditor({
    extensions: [StarterKit],
    content: product?.how_to_use || { type: 'doc', content: [] },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      tagline: product?.tagline || '',
      label_color: product?.label_color || 'yellow',
      function_list: product?.function_list?.join(', ') || '',
      best_for: product?.best_for?.join(', ') || '',
      is_featured: product?.is_featured || false,
      is_active: product?.is_active ?? true,
      display_order: product?.display_order || 1,
      stripe_product_id: product?.stripe_product_id || '',
      meta_title: product?.meta_title || '',
      meta_description: product?.meta_description || '',
      publish: !!product?.published_at,
    },
  });

  // Image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
  });

  // Handle ingredient selection
  const handleIngredientToggle = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) => {
      const exists = prev.find((i) => i.id === ingredient.id);
      if (exists) {
        return prev.filter((i) => i.id !== ingredient.id);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  // Form submission
  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    setError(null);

    try {
      // Upload image if new file selected
      let imageUrl = product?.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Prepare product data
      const productData = {
        name: data.name,
        slug: data.slug || undefined,
        tagline: data.tagline || null,
        description: descriptionEditor?.getJSON() || null,
        story: storyEditor?.getJSON() || null,
        detailed_function: detailedFunctionEditor?.getJSON() || null,
        how_to_use: howToUseEditor?.getJSON() || null,
        function_list: data.function_list
          ? data.function_list.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        best_for: data.best_for
          ? data.best_for.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        label_color: data.label_color,
        image_url: imageUrl,
        image_alt: data.name,
        stripe_product_id: data.stripe_product_id || null,
        is_featured: data.is_featured,
        is_active: data.is_active,
        display_order: data.display_order,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        published_at: data.publish ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let productId = product?.id;

      // Insert or update product
      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (updateError) throw updateError;
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      // Update ingredients
      // First, delete existing relationships
      if (product) {
        await supabase.from('product_ingredients').delete().eq('product_id', productId);
      }

      // Then, insert new relationships
      if (selectedIngredients.length > 0) {
        const ingredientLinks = selectedIngredients.map((ing, index) => ({
          product_id: productId,
          ingredient_id: ing.id,
          display_order: index + 1,
        }));

        const { error: ingredientsError } = await supabase
          .from('product_ingredients')
          .insert(ingredientLinks);

        if (ingredientsError) throw ingredientsError;
      }

      // Success - redirect to products list
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g., Yellow Bomb"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Slug</label>
            <input
              {...register('slug')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="auto-generated from name if empty"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to auto-generate from product name
            </p>
          </div>

          <div>
            <label className="block font-medium mb-1">Tagline</label>
            <input
              {...register('tagline')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Short, punchy description"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Label Color <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {['yellow', 'red', 'green'].map((color) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('label_color')}
                    value={color}
                    className="w-4 h-4"
                  />
                  <span
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === 'yellow'
                        ? 'bg-yellow-400'
                        : color === 'red'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="capitalize">{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Function List</label>
            <input
              {...register('function_list')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Energy, Focus, Detox (comma-separated)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter keywords separated by commas
            </p>
          </div>

          <div>
            <label className="block font-medium mb-1">Best For</label>
            <input
              {...register('best_for')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Morning boost, Post-workout (comma-separated)"
            />
          </div>
        </div>
      </section>

      {/* Image Upload */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Product Image</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          {imagePreview ? (
            <div className="space-y-4">
              <Image
                src={imagePreview}
                alt="Preview"
                width={300}
                height={300}
                className="mx-auto rounded-lg object-cover"
              />
              <p className="text-sm text-gray-600">
                Click or drag to replace image
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📸</div>
              <p className="text-gray-600">
                Drag & drop an image, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Recommended: 1200x1200px or larger
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Rich Text Editors */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] prose max-w-none">
          <EditorContent editor={descriptionEditor} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Blend Story</h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] prose max-w-none">
          <EditorContent editor={storyEditor} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Detailed Function</h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[150px] prose max-w-none">
          <EditorContent editor={detailedFunctionEditor} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">How to Use</h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[150px] prose max-w-none">
          <EditorContent editor={howToUseEditor} />
        </div>
      </section>

      {/* Ingredients */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Ingredients</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allIngredients.map((ingredient: Ingredient) => {
            const isSelected = selectedIngredients.some((i) => i.id === ingredient.id);
            return (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => handleIngredientToggle(ingredient)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{ingredient.name}</div>
                <div className="text-xs text-gray-500 capitalize">{ingredient.type}</div>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Selected: {selectedIngredients.length} ingredients
        </p>
      </section>

      {/* Stripe Integration */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Stripe Integration</h2>
        <div>
          <label className="block font-medium mb-1">Stripe Product ID</label>
          <input
            {...register('stripe_product_id')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="prod_xxxxx"
          />
          <p className="text-sm text-gray-500 mt-1">
            Link to Stripe product for checkout (optional)
          </p>
        </div>
      </section>

      {/* Settings */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Display Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('display_order')}
              min="1"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Lower numbers appear first (1, 2, 3...)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_featured')} className="w-4 h-4" />
            <label className="font-medium">Featured Product</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4" />
            <label className="font-medium">Active (visible on site)</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('publish')} className="w-4 h-4" />
            <label className="font-medium">Published</label>
            <p className="text-sm text-gray-500">
              (Unpublished products are drafts)
            </p>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">SEO</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Meta Title</label>
            <input
              {...register('meta_title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Defaults to product name if empty"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Meta Description</label>
            <textarea
              {...register('meta_description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Brief description for search engines"
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-4 sticky bottom-4 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
