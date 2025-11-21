import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InventoryManager } from '@/components/admin/InventoryManager';

export const metadata = {
  title: 'Inventory Management | Admin',
  description: 'Manage product inventory levels and stock',
};

export default async function InventoryPage() {
  // Check if user is admin
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?redirect=/admin/inventory');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-600">
          Track and manage product stock levels to prevent overselling
        </p>
      </div>

      <InventoryManager />
    </div>
  );
}
