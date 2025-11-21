import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderFulfillmentManager } from '@/components/admin/OrderFulfillmentManager';

export const metadata = {
  title: 'Order Fulfillment | Admin',
  description: 'Manage order fulfillment and shipping',
};

export default async function FulfillmentPage() {
  // Check if user is admin
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?redirect=/admin/fulfillment');
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Fulfillment
        </h1>
        <p className="text-gray-600">
          Manage order status, shipping, and tracking information
        </p>
      </div>

      <OrderFulfillmentManager />
    </div>
  );
}
