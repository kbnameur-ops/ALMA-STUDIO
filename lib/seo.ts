import type { Metadata } from 'next';
import { brand } from '@/config/brand';
import { site } from '@/config/site';

/**
 * Fabrique de metadata.
 *
 * Objectif : des titres et descriptions réellement utiles à la lecture
 * dans les résultats de recherche — pas d'empilement de mots-clés.
 */
interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Image Open Graph dédiée ; à défaut, l'image générée par la route `/opengraph-image`. */
  image?: string;
  noIndex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = new URL(path, site.url).toString();
  // L'accueil porte déjà le nom de la marque : `absolute` court-circuite le
  // gabarit `%s — ALMA STUDIO` du layout, qui le répéterait sinon.
  const isHome = path === '/';
  const fullTitle = isHome ? title : `${title} — ${brand.name}`;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      locale: site.locale,
      url,
      siteName: brand.name,
      title: fullTitle,
      description,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: fullTitle }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Fiche établissement, pour la recherche locale.
 *
 * Pas d'adresse postale ni de coordonnées GPS : le lieu exact varie selon
 * le créneau et le praticien, il n'existe donc pas de point fixe à donner
 * à Google. `areaServed` porte seule la zone couverte — c'est le champ
 * que Google recommande pour un professionnel qui reçoit sans pignon sur
 * rue fixe, plutôt qu'une `PostalAddress` incomplète ou inventée.
 */
export function localBusinessJsonLd(): Record<string, unknown> {
  const { businessAddress } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': `${site.url}/#studio`,
    name: brand.name,
    description: `${brand.signature}. ${brand.tagline}`,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    telephone: site.contactPhoneE164,
    priceRange: '€€',
    currenciesAccepted: site.currency,
    address: {
      '@type': 'PostalAddress',
      addressLocality: businessAddress.city,
      addressCountry: businessAddress.country,
    },
    areaServed: { '@type': 'City', name: businessAddress.city },
  };
}

/** Décrit une prestation réservable — utilisé sur chaque page massage. */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  offers: Array<{ minutes: number; priceCents: number }>;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: 'Massage bien-être',
    provider: { '@type': 'HealthAndBeautyBusiness', name: brand.name, '@id': `${site.url}/#studio` },
    areaServed: { '@type': 'City', name: 'Paris' },
    url: `${site.url}/massages/${input.slug}`,
    offers: input.offers.map((offer) => ({
      '@type': 'Offer',
      name: `${input.name} — ${offer.minutes} min`,
      price: (offer.priceCents / 100).toFixed(2),
      priceCurrency: site.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/reservation?service=${input.slug}`,
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, site.url).toString(),
    })),
  };
}
