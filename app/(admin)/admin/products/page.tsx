import { createClient } from '@/lib/supabase/server';
import { ProductsTable } from './ProductsTable';
import Link from 'next/link';

export const metadata = {
  title: 'Products | Admin',
  description: 'Manage product catalog',
};

export default async function ProductsAdminPage() {
  const supabase = createClient();

  // Fetch all products with variant counts
  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      *,
      variants:product_variants(count)
    `
    )
    .order('display_order', { ascending: true });

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog ({products?.length || 0} total)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Product
        </Link>
      </div>

      <ProductsTable products={products || []} />
    </div>
  );
}
