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
  /**
   * Paiement en ligne.
   *
   * À `false`, le tunnel ne débite rien : il envoie une **demande de
   * réservation**. Le studio la confirme par email ou WhatsApp, et le
   * règlement se fait sur place. Tout le reste du tunnel est inchangé —
   * prestation, durée, lieu, créneau, coordonnées — et les tarifs restent
   * calculés côté serveur pour que le client sache ce qu'il devra régler.
   *
   * Repasser à `true` rebranche Stripe sans autre modification : le code
   * des deux parcours cohabite.
   */
  onlinePaymentEnabled: false,
  /**
   * Durée pendant laquelle une demande retient son créneau, en heures.
   *
   * Sans paiement, plus rien ne borne la demande : les quinze minutes de
   * retenue du parcours payant laisseraient le créneau repartir avant même
   * que le studio ait ouvert sa boîte mail. Passé ce délai en revanche, une
   * demande restée sans réponse libère le créneau d'elle-même plutôt que de
   * le bloquer indéfiniment.
   */
  requestHoldHours: 48,
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

  contactEmail: 'contact.almastudioparis@gmail.com',
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
    street: '27 rue du Buisson Saint-Louis',
    /** Nom du lieu, affiché au-dessus de la voie. */
    venue: 'China Town',
    postalCode: '75010',
    city: 'Paris',
    country: 'FR',
    /** Coordonnées du studio — à renseigner pour le JSON-LD LocalBusiness. */
    latitude: null as number | null,
    longitude: null as number | null,
  },

  /** Accès en transports, affiché sous l'adresse. */
  transit: 'Métro 2 et 11 · station Belleville',

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
    /**
     * Rédigé à partir des éléments de carrière communiqués par le studio :
     * comédien, mannequin, masseur, coach en communication et expression
     * corporelle, entre la France, l'Espagne et le Brésil. Ni durée
     * d'exercice, ni titre, ni référence client ne sont avancés.
     */
    bio: [
      'Comédien et mannequin, Adan a fait du corps son outil de travail bien avant d’en faire sa pratique. Sa carrière se partage entre la France, l’Espagne et le Brésil.',
      'Il est aussi coach en communication, expression corporelle et gestuelle : un travail sur la posture, le souffle et la façon dont on occupe l’espace. Le massage prolonge la même attention — reconnaître où un corps se tient, où il retient, et travailler à partir de là.',
    ],
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

  /** Horaires affichés (l'ouverture réelle vient de `business_hours`). */
  openingHoursLabel: 'Du lundi au samedi, sur rendez-vous',
} as const;

export type Site = typeof site;

/**
 * L'adresse du studio sur une ligne, nom du lieu compris — c'est ainsi
 * qu'elle doit apparaître dans un email de confirmation ou sur un écran
 * de récapitulatif, là où le client la lit pour se rendre au rendez-vous.
 */
export function studioAddressLine(): string {
  const { venue, street, postalCode, city } = site.businessAddress;
  return `${venue}, ${street}, ${postalCode} ${city}`;
}
