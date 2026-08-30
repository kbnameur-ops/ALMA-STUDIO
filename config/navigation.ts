/** Navigation principale — source unique pour header, footer et menu mobile. */

export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: 'Massages', href: '/massages' },
  { label: 'Le Studio', href: '/studio' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Carte cadeau', href: '/carte-cadeau' },
];

/** Barre fixe mobile : trois actions, dont la réservation. */
export const mobileBarNav: NavItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Massages', href: '/massages' },
  { label: 'Réserver', href: '/reservation' },
];

export const legalNav: NavItem[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/politique-confidentialite' },
  { label: 'CGV', href: '/cgv' },
];

export const bookingHref = '/reservation';
