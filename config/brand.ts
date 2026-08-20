/**
 * ALMA STUDIO — identité de marque.
 *
 * Point d'entrée UNIQUE pour le nom, la baseline, le logo et la palette.
 * Le nom « ALMA STUDIO » est provisoire : changer les valeurs ci-dessous
 * suffit à renommer la marque sur l'ensemble du site (header, footer,
 * emails, metadata SEO, JSON-LD, cartes cadeaux).
 *
 * Les couleurs sont dupliquées en CSS dans `styles/globals.css` (@theme).
 * Ce fichier reste la source de vérité pour tout usage hors-CSS :
 * emails HTML, génération d'images, OG images, SVG dynamiques.
 */

export const brand = {
  /** Nom affiché. `nameParts` permet le rendu bi-ligne du logo typographique. */
  name: 'ALMA STUDIO',
  nameParts: { primary: 'ALMA', secondary: 'STUDIO' },
  /** Signature de marque, sous le logo et dans les emails. */
  signature: 'Massage & Rituels Méditerranéens',
  /** Baseline principale, utilisée en hero et en metadata. */
  tagline: 'Une parenthèse méditerranéenne à Paris.',
  /** Chemins des variantes de logo — remplaçables par un SVG définitif. */
  logo: {
    primary: '/logo/alma-logo.svg',
    dark: '/logo/alma-logo-dark.svg',
    light: '/logo/alma-logo-light.svg',
    symbol: '/logo/alma-symbol.svg',
    favicon: '/logo/favicon.svg',
  },
  /**
   * Palette. `sand` / `ivory` en fonds, `espresso` en texte principal,
   * `terracotta` en accent, `champagne` avec parcimonie extrême.
   */
  colors: {
    sand: '#E8DED0',
    ivory: '#F7F3EC',
    terracotta: '#B96F55',
    olive: '#59604A',
    espresso: '#302A25',
    champagne: '#B9A383',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Manrope',
  },
} as const;

export type Brand = typeof brand;
export const primaryColor = brand.colors.terracotta;
export const secondaryColor = brand.colors.olive;
