import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitProtect – Scan Git Repos for Leaked Secrets',
  description:
    'GitProtect monitors your public GitHub repositories and alerts you when API keys, passwords, or other credentials are accidentally committed. Free for public repos.',
  keywords: ['git security', 'secret scanner', 'credential leak', 'github security', 'devSecOps', 'cybersecurity', 'github monitoring', 'leaked secrets'],
  openGraph: {
    title: 'GitProtect – Git Secret Scanner',
    description: 'Monitor your public GitHub repos for leaked credentials, API keys, and secrets.',
    url: 'https://gitprotect.com',
    siteName: 'GitProtect',
    images: [
      {
        url: 'https://gitprotect.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GitProtect – Scan Git Repos for Leaked Secrets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitProtect – Git Secret Scanner',
    description: 'Monitor your public GitHub repos for leaked credentials, API keys, and secrets.',
    creator: '@gitprotect',
    images: ['https://gitprotect.com/twitter-image.png'],
  },
  metadataBase: new URL('https://gitprotect.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
