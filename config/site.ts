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
  /**
   * Le studio n'a pas d'adresse postale fixe affichée publiquement : le
   * lieu exact dépend du créneau et de la disponibilité du praticien, et
   * n'est donc jamais généré automatiquement. Il est communiqué
   * directement par le studio au client, une fois la réservation traitée.
   *
   * Seule la ville reste publique — c'est un repère de marque (« à
   * Paris »), pas une adresse.
   */
  businessAddress: {
    city: 'Paris',
    country: 'FR',
  },

  /**
   * Rappel affiché partout où l'on évoquerait autrement une adresse :
   * fiche Studio, tunnel de réservation, emails. Un seul texte, pour ne
   * pas laisser deux formulations diverger.
   */
  studioLocationNote:
    'L’adresse exacte est communiquée directement par le studio, selon votre créneau et la disponibilité du praticien.',

  legal: {
    companyName: '[RAISON_SOCIALE]',
    /**
     * Adresse du siège social — une notion légale distincte du lieu où se
     * déroulent les séances, qui n'est lui-même plus fixe. Ne jamais la
     * confondre avec `businessAddress` ni la déduire d'elle.
     */
    address: '[ADRESSE_SIEGE_SOCIAL]',
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
    name: 'Karim Ait M’Hand',
    /**
     * Texte fourni tel quel par le studio, avec une correction d'accord :
     * reçu au féminin (« Nourrie »), repassé au masculin pour s'accorder
     * au praticien qu'il présente — à confirmer auprès du studio plutôt
     * qu'à trancher seul si le texte vient d'ailleurs.
     */
    bio: [
      'Entre héritage méditerranéen et art du mouvement, je conçois le massage comme un art du toucher. Nourri par mes racines franco-maghrébines, ma pratique puise dans les gestes ancestraux du hammam et l’héritage arabo-andalou. Chaque soin devient un rituel singulier, pensé pour écouter le corps, libérer les tensions et révéler une sensation profonde d’harmonie.',
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
