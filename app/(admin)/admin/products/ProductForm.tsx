'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/browser';
import Image from 'next/image';
import { VariantsManager } from './VariantsManager';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().optional(),
  tagline: z.string().max(200).optional().nullable(),
  label_color: z.string().min(1, 'Color is required'),
  function_list: z.string().optional(), // Comma-separated string
  is_active: z.boolean(),
  display_order: z.coerce.number().min(1),
  stripe_product_id: z.string().optional().nullable(),
  publish: z.boolean(),
  auto_sync: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Ingredient {
  id: string;
  name: string;
  type: string;
}

export function ProductForm({ product, ingredients, variants, allIngredients }: any) {
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    ingredients?.map((i: any) => i.ingredient) || []
  );
  const [productVariants, setProductVariants] = useState<any[]>(variants || []);

  // Rich text editor
  const descriptionEditor = useEditor({
    extensions: [StarterKit],
    content: product?.description || { type: 'doc', content: [] },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      tagline: product?.tagline || '',
      label_color: product?.label_color || '',
      function_list: product?.function_list?.join(', ') || '',
      is_active: product?.is_active ?? true,
      display_order: product?.display_order || 1,
      stripe_product_id: product?.stripe_product_id || '',
      publish: !!product?.published_at,
      auto_sync: true, // Default to auto-sync enabled
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
        const supabase = createClient();
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
        function_list: data.function_list
          ? data.function_list.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        label_color: data.label_color || null,
        image_url: imageUrl,
        image_alt: data.name,
        stripe_product_id: data.stripe_product_id || null,
        is_active: data.is_active,
        display_order: data.display_order,
        published_at: data.publish ? new Date().toISOString() : null,
      };

      // Prepare request body
      const requestBody = {
        product: productData,
        ingredients: selectedIngredients.map(i => i.id),
        variants: productVariants,
      };

      // Call API route
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';

      const method = product ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      const responseData = await response.json();
      const savedProductId = responseData.id || product?.id;

      // Auto-sync to Stripe if enabled
      if (data.auto_sync && savedProductId && productVariants.length > 0) {
        try {
          setSyncing(true);
          setSyncMessage('Syncing to Stripe...');

          const syncResponse = await fetch(`/api/admin/products/${savedProductId}/sync-stripe`, {
            method: 'POST',
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            setSyncMessage(`✅ Synced to Stripe! Product: ${syncData.productId}, Prices: ${syncData.priceIds?.length || 0}`);
          } else {
            const syncError = await syncResponse.json();
            setSyncMessage(`⚠️ Sync failed: ${syncError.error}`);
          }

          // Keep sync message visible for 2 seconds before redirecting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (syncErr: any) {
          console.error('Sync error:', syncErr);
          setSyncMessage(`⚠️ Sync error: ${syncErr.message}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } finally {
          setSyncing(false);
        }
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

      {syncMessage && (
        <div className={`border rounded-lg p-4 ${
          syncMessage.startsWith('✅')
            ? 'bg-green-50 border-green-200'
            : syncMessage.startsWith('⚠️')
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`${
            syncMessage.startsWith('✅')
              ? 'text-green-800'
              : syncMessage.startsWith('⚠️')
              ? 'text-yellow-800'
              : 'text-blue-800'
          }`}>{syncMessage}</p>
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
            <input
              type="color"
              {...register('label_color')}
              className="w-32 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Pick any color for the product label gradient
            </p>
            {errors.label_color && (
              <p className="text-red-600 text-sm mt-1">{errors.label_color.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Function List</label>
            <input
              {...register('function_list')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Energy, Focus, Detox (comma-separated)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter keywords separated by commas - shown as badges on product page
            </p>
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

      {/* Description */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-sm text-gray-600 mb-3">Main product description shown on the product page</p>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] prose max-w-none">
          <EditorContent editor={descriptionEditor} />
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

        {product?.id && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-3">
              {product.stripe_product_id
                ? 'Sync this product to update Stripe product and prices'
                : 'Create this product in Stripe with all variants'}
            </p>
            <button
              type="button"
              onClick={async () => {
                setSyncing(true);
                setSyncMessage(null);
                try {
                  const response = await fetch(`/api/admin/products/${product.id}/sync-stripe`, {
                    method: 'POST',
                  });
                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(result.error || 'Sync failed');
                  }

                  setSyncMessage(`✓ Synced! Product: ${result.productId}, Prices: ${result.priceIds?.length || 0}`);
                  setTimeout(() => router.refresh(), 1000);
                } catch (err: any) {
                  setSyncMessage(`✗ Error: ${err.message}`);
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing || productVariants.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Syncing to Stripe...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync to Stripe
                </>
              )}
            </button>
            {syncMessage && (
              <p className={`text-sm mt-2 ${syncMessage.startsWith('✓') ? 'text-green-700' : 'text-red-700'}`}>
                {syncMessage}
              </p>
            )}
            {productVariants.length === 0 && (
              <p className="text-sm text-orange-700 mt-2">
                ⚠️ Add at least one variant before syncing
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Stripe Product ID</label>
          <input
            {...register('stripe_product_id')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="prod_xxxxx (auto-filled after sync)"
            readOnly={!!product?.stripe_product_id}
          />
          <p className="text-sm text-gray-500 mt-1">
            {product?.stripe_product_id
              ? 'Linked to Stripe (use Sync button to update)'
              : 'Will be auto-filled after first sync'}
          </p>
        </div>
      </section>

      {/* Product Variants */}
      <section className="bg-white p-6 rounded-lg shadow">
        <VariantsManager
          productId={product?.id}
          variants={productVariants}
          onVariantsChange={setProductVariants}
        />
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
              Lower numbers appear first on the blends page (1 = Green Bomb, 2 = Red Bomb, 3 = Yellow Bomb)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4" />
            <label className="font-medium">Active (visible on website)</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('publish')} className="w-4 h-4" />
            <label className="font-medium">Published</label>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-start gap-2">
              <input type="checkbox" {...register('auto_sync')} className="w-4 h-4 mt-1" />
              <div>
                <label className="font-medium">Auto-sync to Stripe after saving</label>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically creates/updates Stripe product and prices when you save
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-4 sticky bottom-4 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <button
          type="submit"
          disabled={saving || syncing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {syncing ? 'Syncing to Stripe...' : saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving || syncing}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
