import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '../ProductForm';
import { notFound, redirect } from 'next/navigation';

export const metadata = {
  title: 'Edit Product | Admin',
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/admin');
  }

  const isNew = params.id === 'new';

  let product = null;
  let productIngredients: any[] = [];
  let variants: any[] = [];

  if (!isNew) {
    // Fetch existing product with all related data
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        product_ingredients(
          id,
          display_order,
          ingredient:ingredients(*)
        ),
        variants:product_variants(*)
      `
      )
      .eq('id', params.id)
      .single();

    if (error || !data) {
      notFound();
    }

    product = data;
    productIngredients = data.product_ingredients || [];
    variants = data.variants || [];
  }

  // Fetch all ingredients for the selector
  const { data: allIngredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isNew ? 'Create Product' : `Edit ${product.name}`}
        </h1>
        {!isNew && (
          <p className="text-gray-600 mt-1">
            Product ID: {product.id}
          </p>
        )}
      </div>

      <ProductForm
        product={product}
        ingredients={productIngredients}
        variants={variants}
        allIngredients={allIngredients || []}
      />
    </div>
  );
}
