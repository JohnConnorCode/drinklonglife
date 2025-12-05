import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FadeIn } from '@/components/animations';
import { ProductsManager } from './ProductsManager';

export const metadata = {
  title: 'Products | Admin',
  description: 'Manage product catalog',
};

export const dynamic = 'force-dynamic';

export default async function ProductsAdminPage() {
  const supabase = createClient();

  // Fetch all products with variant counts and ingredient counts
  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      *,
      variants:product_variants(count),
      product_ingredients(count)
    `
    )
    .order('display_order', { ascending: true});

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading products: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const publishedCount = products?.filter(p => p.published_at).length || 0;
  const draftCount = products?.filter(p => !p.published_at).length || 0;
  const inactiveCount = products?.filter(p => !p.is_active).length || 0;

  return (
    <div className="p-8 space-y-6">
      <FadeIn direction="up" delay={0.05}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              {products?.length || 0} total ({publishedCount} published, {draftCount} drafts, {inactiveCount} inactive)
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
          >
            + Add Product
          </Link>
        </div>
      </FadeIn>

      {/* Bulk Actions Guide */}
      <FadeIn direction="up" delay={0.1}>
        <details className="bg-blue-50 rounded-xl border border-blue-200">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-xl transition-colors">
            Bulk Actions Guide
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-2">Product Status:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Published</strong> — Visible on the storefront</li>
                  <li><strong>Draft</strong> — Hidden from customers</li>
                  <li><strong>Active</strong> — Can be purchased</li>
                  <li><strong>Inactive</strong> — Cannot be purchased</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Available Actions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Publish/Unpublish</strong> — Toggle storefront visibility</li>
                  <li><strong>Activate/Deactivate</strong> — Toggle purchasability</li>
                  <li><strong>Feature/Unfeature</strong> — Toggle featured status</li>
                  <li><strong>Export CSV</strong> — Download selected products</li>
                  <li><strong>Delete</strong> — Permanently remove products</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <ProductsManager initialProducts={products || []} />
      </FadeIn>
    </div>
  );
}
