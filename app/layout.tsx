import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { client } from '@/lib/sanity.client';
import { siteSettingsQuery, navigationQuery } from '@/lib/sanity.queries';

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang="en" className={jost.variable}>
      <body className="bg-white text-black font-sans">
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
