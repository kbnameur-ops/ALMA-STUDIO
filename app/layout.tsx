import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { brand } from '@/config/brand';
import { site } from '@/config/site';
import { Analytics } from '@/components/layout/Analytics';
import { ToastProvider } from '@/components/ui/Toast';
import '@/styles/globals.css';

// `display: swap` + preload : le texte reste lisible pendant le chargement.
const heading = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-cormorant',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${brand.name} — ${brand.signature} à Paris`,
    template: `%s — ${brand.name}`,
  },
  description:
    'Studio privé de massage et de rituels de bien-être à Paris. Séances sur rendez-vous, dans un espace intimiste et méditerranéen.',
  applicationName: brand.name,
  authors: [{ name: brand.name }],
  icons: {
    icon: [{ url: '/logo/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo/favicon.svg' }],
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: brand.name,
    url: site.url,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: brand.colors.ivory,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:font-body focus:text-sm focus:text-ivory"
        >
          Aller au contenu principal
        </a>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
