import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { NavBar } from '@/components/navigation/NavBar';
import { ReminderScheduler } from '@/components/notifications/ReminderScheduler';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Hydra — Hydration Companion with Personality',
  description: 'Remind someone to drink water throughout the day, and make it fun. Duolingo personality meets minimal hydration app.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hydra',
  },
};

export const viewport: Viewport = {
  themeColor: '#075985',
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
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased pb-20">
        <ReminderScheduler />
        <main className="min-h-screen max-w-lg mx-auto flex flex-col items-center justify-start p-4">
          {children}
        </main>
        <NavBar />
        <Analytics />
      </body>
    </html>
  );
}
