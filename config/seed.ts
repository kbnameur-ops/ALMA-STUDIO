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
    id: 'svc-rihab',
    slug: 'rihab',
    name: 'Rihab — Le Rituel de l’Apaisement',
    shortDescription:
      'Un massage enveloppant inspiré des gestes ancestraux du hammam arabo-andalou.',
    description:
      'Rihab évoque l’espace, l’ampleur et l’ouverture. Un massage enveloppant inspiré des gestes ancestraux du hammam arabo-andalou : manœuvres lentes, pressions profondes et mouvements fluides s’enchaînent pour dénouer les tensions et calmer le mental. Un rituel pensé comme une parenthèse de lâcher-prise profond.\n\nPromesse : délier le corps, apaiser l’esprit, retrouver son souffle.',
    intensity: 'douce',
    recommendedFor: 'Besoin de lâcher-prise profond, fatigue mentale, envie de calme.',
    imageUrl: '/images/services/rituel-mediterraneen.jpg',
    imageAlt: 'Fin de séance : mains posées sur les tempes, bougies et lanterne en arrière-plan.',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 1,
    durations: [duration('svc-rihab', 1, 60, 9500), duration('svc-rihab', 2, 90, 13000)],
  },
  {
    id: 'svc-nour',
    slug: 'nour',
    name: 'Nour — Le Rituel du Réalignement',
    shortDescription:
      'Un massage énergétique inspiré des rituels de soin arabo-andalous, entre équilibre et ancrage.',
    description:
      'Nour signifie « lumière » en arabe. Un massage énergétique inspiré des rituels de soin arabo-andalous, associant gestes enveloppants, pressions ciblées et travail des lignes du corps. Le rituel accompagne la circulation et invite à retrouver une sensation d’équilibre, d’ancrage et d’harmonie intérieure.\n\nPromesse : rééquilibrer, réancrer, rayonner.',
    intensity: 'moderee',
    recommendedFor: 'Recherche d’équilibre, d’ancrage et d’harmonie intérieure.',
    imageUrl: '/images/services/signature-mediterranee.jpg',
    imageAlt: 'Massage du dos à l’huile, mains à plat le long de la colonne, dans une lumière de bougies.',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 2,
    durations: [duration('svc-nour', 1, 60, 9500), duration('svc-nour', 2, 90, 13000)],
  },
  {
    id: 'svc-andalus',
    slug: 'andalus',
    name: 'Andalus — Le Rituel du Remodelage',
    shortDescription: 'Un massage sculptant, entre remodelage, pressions glissées et travail des tissus.',
    description:
      'Un hommage direct à l’héritage andalou, à la rencontre des cultures et des savoir-faire. Un massage sculptant qui associe techniques de remodelage, pressions glissées et travail manuel des tissus et des fascias. L’objectif est de libérer les zones de tension, améliorer la mobilité tissulaire et redessiner progressivement les lignes du corps.\n\nPromesse : libérer les tissus, resculpter les lignes, révéler le mouvement.',
    intensity: 'dynamique',
    recommendedFor: 'Tensions musculaires, besoin de mobilité, envie de retrouver du mouvement.',
    imageUrl: '/images/services/sport-recovery-2.jpg',
    imageAlt:
      'Massage profond de l’arrière de la jambe, travail manuel des tissus, la personne allongée sur le ventre, serviette drapée.',
    homeServiceAvailable: true,
    isActive: true,
    isSignature: true,
    sortOrder: 3,
    durations: [duration('svc-andalus', 1, 60, 9500), duration('svc-andalus', 2, 90, 13000)],
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
    serviceLabel: 'Rihab',
    isPublished: true,
    isSample: true,
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'review-sample-2',
    authorName: 'Thomas R.',
    rating: 5,
    quote: 'La pression a été ajustée exactement comme je le souhaitais. Rare et appréciable.',
    serviceLabel: 'Andalus',
    isPublished: true,
    isSample: true,
    createdAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'review-sample-3',
    authorName: 'Inès B.',
    rating: 5,
    quote: 'L’ambiance du studio fait la moitié du travail. On ralentit dès la porte franchie.',
    serviceLabel: 'Nour',
    isPublished: true,
    isSample: true,
    createdAt: '2026-03-08T10:00:00.000Z',
  },
];
