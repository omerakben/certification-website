import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ThemeScript from '@/components/theme-script';
import StructuredData from '@/components/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://certfinder.app';

const DESCRIPTION =
  'Hand-curated index of free certifications from Google, Microsoft, AWS, IBM, Anthropic, OpenAI, freeCodeCamp, HubSpot, and HarvardX. Verified weekly so links keep working.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CertFinder — Free certifications, verified weekly',
    template: '%s · CertFinder',
  },
  description: DESCRIPTION,
  keywords: [
    'free certifications',
    'online certifications',
    'professional certifications',
    'Google certifications',
    'Microsoft certifications',
    'AWS certifications',
    'IBM SkillsBuild',
    'freeCodeCamp',
    'career development',
    'skill building',
  ],
  authors: [{ name: 'Ozzy Akben' }],
  creator: 'Ozzy Akben',
  publisher: 'CertFinder',
  applicationName: 'CertFinder',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'CertFinder',
    title: 'CertFinder — Free certifications, verified weekly',
    description: DESCRIPTION,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CertFinder — Free certifications, verified weekly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CertFinder — Free certifications, verified weekly',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#07091a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <StructuredData />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow focus:ring-2 focus:ring-brand-500 dark:focus:bg-slate-900 dark:focus:text-gray-50"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
