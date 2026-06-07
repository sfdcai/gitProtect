import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitProtect – Scan Git Repos for Leaked Secrets',
  description:
    'GitProtect monitors your public GitHub repositories and alerts you when API keys, passwords, or other credentials are accidentally committed. Free for public repos.',
  keywords: ['git security', 'secret scanner', 'credential leak', 'github security', 'devSecOps'],
  openGraph: {
    title: 'GitProtect – Git Secret Scanner',
    description: 'Monitor your public GitHub repos for leaked credentials, API keys, and secrets.',
    type: 'website',
  },
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
      <body>{children}</body>
    </html>
  );
}
