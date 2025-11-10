import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { client } from '@/lib/sanity.client';
import { siteSettingsQuery, navigationQuery } from '@/lib/sanity.queries';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Long Life',
  description: 'Cold-pressed organic juices crafted for vitality.',
};

async function getGlobalData() {
  try {
    const [siteSettings, navigation] = await Promise.all([
      client.fetch(siteSettingsQuery),
      client.fetch(navigationQuery),
    ]);
    return { siteSettings, navigation };
  } catch (error) {
    console.error('Error fetching global data:', error);
    return { siteSettings: null, navigation: null };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteSettings, navigation } = await getGlobalData();

  return (
    <html lang="en" className={inter.variable} style={{ '--font-futura': 'Futura, "Futura PT", "Century Gothic", "Trebuchet MS", Arial, sans-serif' } as any}>
      <body className="bg-white text-black">
        <Header
          siteSettings={siteSettings}
          navigation={navigation}
          ctaLabel="Reserve This Week"
        />
        <main className="min-h-screen">{children}</main>
        <Footer siteSettings={siteSettings} navigation={navigation} />
        <BackToTop />
      </body>
    </html>
  );
}
