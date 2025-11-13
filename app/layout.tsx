import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Long Life | Cold-Pressed Organic Juices Crafted for Vitality',
    template: '%s | Long Life',
  },
  description: 'Cold-pressed, small-batch organic juices crafted for serious athletes and health-conscious humans. Made weekly in Indiana with traceable ingredients. No concentrates, no shortcuts—just real results.',
  keywords: [
    'cold-pressed juice',
    'organic juice',
    'small-batch juice',
    'healthy juice',
    'athletic performance',
    'wellness drinks',
    'Indiana juice',
    'cold pressed',
    'fresh juice',
    'juice cleanse',
  ],
  authors: [{ name: 'Long Life' }],
  creator: 'Long Life',
  publisher: 'Long Life',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Long Life',
    title: 'Long Life | Cold-Pressed Organic Juices Crafted for Vitality',
    description: 'Cold-pressed, small-batch organic juices crafted for serious athletes and health-conscious humans. Made weekly in Indiana with traceable ingredients.',
    images: [
      {
        url: `${siteUrl}/slider-desktop-1.png`,
        width: 1920,
        height: 1080,
        alt: 'Long Life - Peak Performance Starts Here',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Long Life | Cold-Pressed Organic Juices Crafted for Vitality',
    description: 'Cold-pressed, small-batch organic juices crafted for serious athletes and health-conscious humans. Made weekly in Indiana.',
    images: [`${siteUrl}/slider-desktop-1.png`],
    creator: '@drinklonglife',
    site: '@drinklonglife',
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Add actual verification code
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="bg-white text-black font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
