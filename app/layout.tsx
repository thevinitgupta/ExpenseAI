import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Voice-Gemini Expense Tracker',
  description: 'Track your expenses effortlessly using voice input powered by Gemini AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expense Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Voice-Gemini Expense Tracker',
    title: 'Voice-Gemini Expense Tracker',
    description: 'Track your expenses effortlessly using voice input powered by Gemini AI',
  },
  twitter: {
    card: 'summary',
    title: 'Voice-Gemini Expense Tracker',
    description: 'Track your expenses effortlessly using voice input powered by Gemini AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}