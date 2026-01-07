import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/supabase/queries/products';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch products from Supabase
  let products: any[] = [];
  try {
    products = await getAllProducts();
  } catch {
    // If products fetch fails, just use static routes
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blends`,
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/how-we-make-it`,
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/ingredients`,
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/journal`,
      changeFrequency: 'weekly',
      priority: 0.6,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/wholesale`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified: new Date(),
    },
  ];

  // Dynamic product routes
  const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/blends/${product.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
