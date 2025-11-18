import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { IngredientsTable } from './IngredientsTable';
import { redirect } from 'next/navigation';
import { FadeIn } from '@/components/animations';

async function getIngredients() {
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

  // Fetch all ingredients with product counts
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select(`
      *,
      product_ingredients(
        count,
        product:products(id, name)
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }

  return ingredients;
}

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeIn direction="up" delay={0.05}>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage ingredient library for product formulations
              </p>
            </div>
            <Link
              href="/admin/ingredients/new"
              className="inline-flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary/90"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Ingredient
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn direction="up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {['fruit', 'root', 'green', 'herb', 'other'].map((type) => {
            const count = ingredients.filter((i) => i.type === type).length;
            return (
              <div key={type} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 capitalize">{type}s</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn direction="up" delay={0.15}>
        <div className="bg-white shadow rounded-lg">
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <IngredientsTable
              ingredients={ingredients}
              onDelete={async (_id: string) => {
                'use server';
                // This will be called from the client component
              }}
            />
          </Suspense>
        </div>
      </FadeIn>
    </div>
  );
}
