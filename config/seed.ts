/**
 * Données de lancement et de démonstration.
 *
 * Elles servent à deux choses :
 *  1. amorcer la base (`supabase/seed.sql` reprend les mêmes valeurs) ;
 *  2. permettre au site de fonctionner en local sans Supabase configuré.
 *
 * Les tarifs ci-dessous sont des **valeurs de lancement** : en production
 * ils proviennent de la table `service_durations` et sont modifiables
 * depuis l'administration. Aucun composant ne doit les importer directement.
 *
 * Les avis sont marqués `isSample: true` : ce sont des exemples de mise en
 * page, jamais présentés comme de vrais clients.
 */

import type { BusinessHour, HomeZone, Review, Service } from '@/types';

function duration(
  serviceId: string,
  index: number,
  minutes: number,
  priceCents: number,
): Service['durations'][number] {
  return {
    id: `${serviceId}-d${index}`,
    serviceId,
    minutes,
    priceCents,
    isActive: true,
    sortOrder: index,
  };
}

export const seedServices: Service[] = [
  {
    id: 'svc-signature-mediterranee',
    slug: 'signature-mediterranee',
    name: 'Signature Méditerranée',
    shortDescription: 'Le massage emblématique du studio, fluide et enveloppant.',
    description:
      'Une expérience fluide et enveloppante inspirée de l’univers méditerranéen. Le rythme et la pression évoluent progressivement pour créer une sensation de relâchement général.',
    intensity: 'moderee',
    recommendedFor: 'Première visite au studio, besoin de relâchement global.',
    imageUrl: null,
    imageAlt: 'Ambiance du soin Signature Méditerranée au studio ALMA',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 1,
    durations: [
      duration('svc-signature-mediterranee', 1, 60, 9000),
      duration('svc-signature-mediterranee', 2, 90, 12500),
    ],
  },
  {
    id: 'svc-espagnol-evasion',
    slug: 'espagnol-evasion',
    name: 'Espagnol Évasion',
    shortDescription: 'Une évasion inspirée de l’univers du bien-être espagnol.',
    description:
      'Une expérience de relaxation inspirée de l’univers du bien-être espagnol et méditerranéen, avec une gestuelle fluide et enveloppante.',
    intensity: 'moderee',
    recommendedFor: 'Envie de dépaysement et de lâcher-prise.',
    imageUrl: null,
    imageAlt: 'Ambiance du soin Espagnol Évasion au studio ALMA',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 2,
    durations: [
      duration('svc-espagnol-evasion', 1, 60, 9500),
      duration('svc-espagnol-evasion', 2, 90, 13000),
    ],
  },
  {
    id: 'svc-deep-relax',
    slug: 'deep-relax',
    name: 'Deep Relax',
    shortDescription: 'Une séance lente, pensée pour ralentir profondément.',
    description:
      'Une séance lente et apaisante pensée pour ralentir et favoriser une profonde sensation de détente.',
    intensity: 'douce',
    recommendedFor: 'Fatigue mentale, sommeil difficile, besoin de calme.',
    imageUrl: null,
    imageAlt: 'Ambiance du soin Deep Relax au studio ALMA',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 3,
    durations: [
      duration('svc-deep-relax', 1, 60, 9000),
      duration('svc-deep-relax', 2, 90, 12500),
    ],
  },
  {
    id: 'svc-dos-nuque',
    slug: 'dos-nuque',
    name: 'Dos & Nuque',
    shortDescription: 'Une séance ciblée, courte et efficace.',
    description: 'Une séance ciblée autour du dos, des épaules et de la nuque.',
    intensity: 'moderee',
    recommendedFor: 'Journées assises, tensions d’épaules, pause en semaine.',
    imageUrl: null,
    imageAlt: 'Ambiance du soin Dos & Nuque au studio ALMA',
    homeServiceAvailable: false,
    isActive: true,
    isSignature: false,
    sortOrder: 4,
    durations: [
      duration('svc-dos-nuque', 1, 30, 5000),
      duration('svc-dos-nuque', 2, 45, 7000),
    ],
  },
  {
    id: 'svc-sport-recovery',
    slug: 'sport-recovery',
    name: 'Sport & Recovery',
    shortDescription: 'Une séance plus dynamique, orientée récupération.',
    description:
      'Une séance plus dynamique destinée aux personnes qui souhaitent consacrer leur moment de bien-être à la récupération et au relâchement musculaire.',
    intensity: 'dynamique',
    recommendedFor: 'Après l’entraînement, jambes lourdes, reprise du sport.',
    imageUrl: null,
    imageAlt: 'Ambiance du soin Sport & Recovery au studio ALMA',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: false,
    sortOrder: 5,
    durations: [
      duration('svc-sport-recovery', 1, 60, 10000),
      duration('svc-sport-recovery', 2, 90, 14000),
    ],
  },
  {
    id: 'svc-rituel-mediterraneen',
    slug: 'rituel-mediterraneen',
    name: 'Rituel Méditerranéen',
    shortDescription: 'L’expérience premium du studio, du début à la fin.',
    description:
      'L’expérience premium ALMA : préparation sensorielle, serviettes chaudes, massage complet et relaxation finale.',
    intensity: 'douce',
    recommendedFor: 'Occasion particulière, cadeau, moment long pour soi.',
    imageUrl: null,
    imageAlt: 'Ambiance du Rituel Méditerranéen au studio ALMA',
    homeServiceAvailable: false,
    isActive: true,
    isSignature: false,
    sortOrder: 6,
    durations: [
      duration('svc-rituel-mediterraneen', 1, 90, 15000),
      duration('svc-rituel-mediterraneen', 2, 120, 19500),
    ],
  },
];

/** Ouverture par défaut : lundi → samedi, 10h–20h. Dimanche fermé. */
export const seedBusinessHours: BusinessHour[] = [
  { weekday: 0, opensAt: '10:00', closesAt: '20:00', isOpen: false },
  { weekday: 1, opensAt: '10:00', closesAt: '20:00', isOpen: true },
  { weekday: 2, opensAt: '10:00', closesAt: '20:00', isOpen: true },
  { weekday: 3, opensAt: '10:00', closesAt: '20:00', isOpen: true },
  { weekday: 4, opensAt: '10:00', closesAt: '21:00', isOpen: true },
  { weekday: 5, opensAt: '10:00', closesAt: '21:00', isOpen: true },
  { weekday: 6, opensAt: '10:00', closesAt: '19:00', isOpen: true },
];

/** Zones de déplacement à domicile — frais et trajets modifiables en admin. */
export const seedHomeZones: HomeZone[] = [
  {
    id: 'zone-paris-centre',
    name: 'Paris centre',
    postalCodes: ['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009'],
    travelFeeCents: 2000,
    travelMinutes: 30,
    isActive: true,
  },
  {
    id: 'zone-paris-est-ouest',
    name: 'Paris est & ouest',
    postalCodes: ['75010', '75011', '75012', '75013', '75014', '75015', '75016', '75017', '75018', '75019', '75020'],
    travelFeeCents: 3000,
    travelMinutes: 45,
    isActive: true,
  },
];

/** Avis d'exemple — jeu de démonstration, jamais de vrais clients. */
export const seedReviews: Review[] = [
  {
    id: 'review-sample-1',
    authorName: 'Claire M.',
    rating: 5,
    quote: 'Un lieu calme et une écoute vraiment attentive. On ressort apaisé, sans se presser.',
    serviceLabel: 'Signature Méditerranée',
    isPublished: true,
    isSample: true,
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'review-sample-2',
    authorName: 'Thomas R.',
    rating: 5,
    quote: 'La pression a été ajustée exactement comme je le souhaitais. Rare et appréciable.',
    serviceLabel: 'Sport & Recovery',
    isPublished: true,
    isSample: true,
    createdAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'review-sample-3',
    authorName: 'Inès B.',
    rating: 5,
    quote: 'L’ambiance du studio fait la moitié du travail. On ralentit dès la porte franchie.',
    serviceLabel: 'Rituel Méditerranéen',
    isPublished: true,
    isSample: true,
    createdAt: '2026-03-08T10:00:00.000Z',
  },
];
