/**
 * Configuration fonctionnelle du site.
 *
 * Toutes les valeurs « métier » non stockées en base vivent ici. Les valeurs
 * susceptibles d'être modifiées par le studio en production (délai
 * d'annulation, rappels, frais de déplacement…) sont surchargeables depuis
 * la table `settings` via `lib/repositories/settings.ts` — ce fichier ne
 * fournit alors que les valeurs par défaut.
 *
 * Les informations légales inconnues restent des placeholders explicites
 * `[MAJUSCULES]` : ne jamais les inventer.
 */

import { brand } from './brand';

export const site = {
  brandName: brand.name,
  brandTagline: brand.tagline,
  brandSignature: brand.signature,

  /** URL canonique publique, requise pour les metadata, OG et sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alma-studio.fr',
  locale: 'fr_FR',
  lang: 'fr',

  currency: 'EUR',
  currencysymbol: '€',
  timezone: 'Europe/Paris',

  /** Coupe-circuits produit. */
  bookingEnabled: true,
  homeServiceEnabled: true,
  giftCardsEnabled: true,
  reviewsEnabled: true,

  /** Règles par défaut, surchargées par la table `settings`. */
  cancellationHours: 24,
  reminderHours: 24,
  /** Délai minimum entre maintenant et le début d'un créneau réservable. */
  minimumNoticeHours: 2,
  /** Horizon de réservation affiché dans le calendrier. */
  bookingHorizonDays: 60,
  /** Durée de blocage d'un créneau pendant le paiement. */
  holdMinutes: 15,

  contactEmail: '[EMAIL_CONTACT]',
  contactPhone: '[TELEPHONE]',
  businessAddress: {
    street: '[ADRESSE_STUDIO]',
    postalCode: '[CODE_POSTAL]',
    city: 'Paris',
    country: 'FR',
    /** Coordonnées du studio — à renseigner pour le JSON-LD LocalBusiness. */
    latitude: null as number | null,
    longitude: null as number | null,
  },

  legal: {
    companyName: '[RAISON_SOCIALE]',
    legalForm: '[FORME_JURIDIQUE]',
    siret: '[SIRET]',
    vatNumber: '[TVA_INTRACOMMUNAUTAIRE]',
    capital: '[CAPITAL_SOCIAL]',
    director: '[DIRECTEUR_PUBLICATION]',
    host: '[HEBERGEUR]',
    hostAddress: '[ADRESSE_HEBERGEUR]',
    rcs: '[RCS]',
  },

  social: {
    instagram: '[URL_INSTAGRAM]',
  },

  /** Horaires affichés (l'ouverture réelle vient de `business_hours`). */
  openingHoursLabel: 'Du lundi au samedi, sur rendez-vous',
} as const;

export type Site = typeof site;
