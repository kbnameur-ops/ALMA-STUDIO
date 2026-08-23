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
  /** Forme lisible, affichée telle quelle. */
  contactPhone: '+33 6 60 40 28 64',
  /** Même numéro au format E.164, pour les liens `tel:` et le JSON-LD. */
  contactPhoneE164: '+33660402864',
  /**
   * WhatsApp sur la même ligne. `wa.me` attend le numéro international
   * sans `+` ni séparateurs.
   */
  whatsapp: {
    enabled: true,
    url: 'https://wa.me/33660402864',
  },
  businessAddress: {
    /**
     * Le numéro de voie n'a pas été communiqué : l'adresse précise et le
     * code d'accès sont de toute façon transmis dans l'email de
     * confirmation. À compléter pour la fiche établissement.
     */
    street: 'China Town, rue du Buisson Saint-Louis',
    postalCode: '75010',
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

  /**
   * Le praticien. Le nom est renseigné ; la biographie et le parcours
   * restent des placeholders tant qu'ils ne sont pas fournis — aucun
   * diplôme, aucune certification et aucune durée d'expérience ne sont
   * inventés.
   */
  practitioner: {
    name: 'Adan AIT',
    bio: '[BIOGRAPHIE_PRATICIEN]',
    /**
     * Transcrit tel que communiqué par le studio. Ne rien ajouter ici qui
     * n'ait été fourni : ni durée d'exercice, ni intitulé de diplôme, ni
     * mention « certifié ». Les écoles sont listées dans l'ordre reçu.
     */
    training: [
      {
        school: 'Instituto Superior de Estudios Holísticos',
        city: 'Madrid',
        topics: [
          'Massothérapie',
          'Massages énergétiques',
          'Massage sportif',
          'Drainage lymphatique',
          'Réflexologie',
        ],
      },
      {
        school: 'Massage School — Higher Institute of Quiromasaje (ISQ)',
        city: 'Madrid',
        topics: [
          'Chiromassage professionnel',
          'Massage des tissus profonds',
          'Massage sportif',
          'Massage shirochampi',
          'Massage avant et après l’effort',
        ],
      },
    ],
  },

  social: {
    instagram: '[URL_INSTAGRAM]',
  },

  /** Horaires affichés (l'ouverture réelle vient de `business_hours`). */
  openingHoursLabel: 'Du lundi au samedi, sur rendez-vous',
} as const;

export type Site = typeof site;
