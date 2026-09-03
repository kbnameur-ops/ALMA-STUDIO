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
  signature: 'Massage & Rituels d’Andalousie',
  /** Baseline principale, utilisée en hero et en metadata. */
  tagline: 'Une parenthèse andalouse à Paris.',
  /** Chemins des variantes de logo — remplaçables par un SVG définitif. */
  logo: {
    primary: '/logo/alma-logo.svg',
    dark: '/logo/alma-logo-dark.svg',
    light: '/logo/alma-logo-light.svg',
    symbol: '/logo/alma-symbol.svg',
    favicon: '/logo/favicon.svg',
  },
  /**
   * Palette nocturne, andalouse.
   *
   * `ink` — un bleu nuit profond, plus une encre chaude — en fond sur tout
   * le site, `ivory` en texte, `champagne` en accent unique (la dorure du
   * zellige), `terracotta` (un or plus dense que le champagne) pour les
   * appels à l'action. `bone` est la seule plaque claire, employée avec
   * parcimonie extrême.
   *
   * Dupliquée en CSS dans `styles/globals.css` (@theme) ; ce fichier reste
   * la source pour tout usage hors-CSS — emails, images OG, SVG générés.
   */
  colors: {
    ink: '#0E0F1C',
    inkRaised: '#171A2E',
    inkDeep: '#07080F',
    ivory: '#F2EEE7',
    bone: '#EFE9E1',
    champagne: '#C8A882',
    terracotta: '#C9A227',
    sage: '#9AAB88',
    /** Le rituel et le geste — voir `styles/globals.css` pour l'usage. */
    ocre: '#C9974A',
    brume: '#A78BB5',
  },
  fonts: {
    heading: 'Instrument Serif',
    body: 'Instrument Sans',
  },
} as const;

export type Brand = typeof brand;
export const primaryColor = brand.colors.terracotta;
export const secondaryColor = brand.colors.champagne;
