import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import { brand } from '@/config/brand';
import { site } from '@/config/site';
import { Analytics } from '@/components/layout/Analytics';
import { ToastProvider } from '@/components/ui/Toast';
import '@/styles/globals.css';

/**
 * Instrument Serif en titrage, Instrument Sans en labeur.
 *
 * Deux dessins de la même fonderie : l'accord est construit, pas trouvé.
 * Le serif n'existe qu'en un seul gras — c'est ce qu'on attend d'une
 * police d'affiche, et cela interdit d'en faire du texte courant.
 *
 * Cormorant, qui tenait ce rôle, s'effaçait sur fond sombre : ses déliés
 * sont si fins qu'ils disparaissaient en ivoire sur l'encre.
 *
 * `display: swap` + preload : le texte reste lisible pendant le chargement.
 */
const heading = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${brand.name} — ${brand.signature} à Paris`,
    template: `%s — ${brand.name}`,
  },
  description:
    'Studio privé de massage et de rituels de bien-être à Paris, entre Andalousie et Atlantique. Séances sur rendez-vous, dans un espace intimiste.',
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
      <body className="alma-grain min-h-screen antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink-deep focus:px-5 focus:py-3 focus:font-body focus:text-sm focus:text-ivory"
        >
          Aller au contenu principal
        </a>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
