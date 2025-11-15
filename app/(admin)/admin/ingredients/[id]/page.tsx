import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IngredientForm } from '../IngredientForm';
import Link from 'next/link';

async function getIngredient(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function EditIngredientPage({
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
    redirect('/');
  }

  // Fetch ingredient
  const ingredient = await getIngredient(params.id);

  if (!ingredient) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/ingredients"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Ingredient: {ingredient.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Update ingredient details and properties
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <IngredientForm ingredient={ingredient} mode="edit" />
    </div>
  );
}
