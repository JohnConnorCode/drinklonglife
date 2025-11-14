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
  title: 'Long Life',
  description: 'Cold-pressed organic juices crafted for vitality.',
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
