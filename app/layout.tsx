import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com'),
  title: {
    default: 'Long Life | Cold-Pressed Wellness from Regenerative Farms',
    template: '%s | Long Life',
  },
  description: 'Cold-pressed juice blends made from organic, regenerative ingredients. Delivered fresh weekly. Support your immunity, energy, and longevity naturally.',
  keywords: ['cold-pressed juice', 'organic juice', 'wellness drinks', 'regenerative agriculture', 'health drinks', 'immunity boost', 'long life juice'],
  authors: [{ name: 'Long Life' }],
  creator: 'Long Life',
  publisher: 'Long Life',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://drinklonglife.com',
    title: 'Long Life | Cold-Pressed Wellness',
    description: 'Cold-pressed juice blends from regenerative farms. Fresh, organic, delivered weekly.',
    siteName: 'Long Life',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Long Life Cold-Pressed Juice',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Long Life | Cold-Pressed Wellness',
    description: 'Cold-pressed juice blends from regenerative farms.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.variable}>
      <head />
      <body className="bg-white text-black font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
