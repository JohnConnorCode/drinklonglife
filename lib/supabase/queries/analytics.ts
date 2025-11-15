import { createClient } from '@/lib/supabase/server';

/**
 * Analytics queries for business intelligence
 */

export interface AnalyticsMetrics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    averageValue: number;
  };
  products: {
    total: number;
    published: number;
    drafts: number;
    withoutVariants: number;
  };
  topProducts: Array<{
    product_id: string;
    product_name: string;
    total_revenue: number;
    order_count: number;
  }>;
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const supabase = createClient();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get all orders
  const { data: allOrders } = await supabase
    .from('orders')
    .select('amount_total, created_at, metadata')
    .eq('status', 'completed');

  const orders = allOrders || [];

  // Calculate revenue metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount_total || 0), 0) / 100; // Convert from cents

  const thisMonthOrders = orders.filter(
    (order) => new Date(order.created_at) >= thisMonthStart
  );
  const thisMonthRevenue = thisMonthOrders.reduce(
    (sum, order) => sum + (order.amount_total || 0),
    0
  ) / 100;

  const lastMonthOrders = orders.filter(
    (order) =>
      new Date(order.created_at) >= lastMonthStart &&
      new Date(order.created_at) <= lastMonthEnd
  );
  const lastMonthRevenue = lastMonthOrders.reduce(
    (sum, order) => sum + (order.amount_total || 0),
    0
  ) / 100;

  const revenueGrowth = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Get product stats
  const { data: products } = await supabase.from('products').select('id, published_at');
  const productCount = products?.length || 0;
  const publishedCount = products?.filter((p) => p.published_at).length || 0;
  const draftCount = productCount - publishedCount;

  // Get products without variants
  const { data: productsWithVariants } = await supabase
    .from('products')
    .select('id, variants:product_variants(id)')
    .not('published_at', 'is', null);

  const withoutVariants = productsWithVariants?.filter(
    (p: any) => !p.variants || p.variants.length === 0
  ).length || 0;

  // Get top products (requires order_items table or metadata parsing)
  // For now, return empty array - will enhance when order_items table is created
  const topProducts: any[] = [];

  return {
    revenue: {
      total: totalRevenue,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growth: revenueGrowth,
    },
    orders: {
      total: orders.length,
      thisMonth: thisMonthOrders.length,
      lastMonth: lastMonthOrders.length,
      averageValue: averageOrderValue,
    },
    products: {
      total: productCount,
      published: publishedCount,
      drafts: draftCount,
      withoutVariants,
    },
    topProducts,
  };
}

/**
 * Get order history with pagination
 */
export async function getOrderHistory(limit = 50, offset = 0) {
  const supabase = createClient();

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], total: 0 };
  }

  return {
    orders: data || [],
    total: count || 0,
  };
}

/**
 * Get revenue trends (daily for last 30 days)
 */
export async function getRevenueTrends() {
  const supabase = createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from('orders')
    .select('amount_total, created_at')
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (!orders) return [];

  // Group by date
  const dailyRevenue = new Map<string, number>();

  orders.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    const current = dailyRevenue.get(date) || 0;
    dailyRevenue.set(date, current + (order.amount_total || 0) / 100);
  });

  // Fill in missing dates with 0
  const trends = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    trends.push({
      date: dateStr,
      revenue: dailyRevenue.get(dateStr) || 0,
    });
  }

  return trends;
}

/**
 * Get product performance metrics
 */
export async function getProductPerformance() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      is_active,
      published_at,
      variants:product_variants(count)
    `)
    .not('published_at', 'is', null);

  return products || [];
}
