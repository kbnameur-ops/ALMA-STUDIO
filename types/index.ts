/** Types métier partagés entre serveur, client et couche de données. */

export type Uuid = string;
/** Date au format ISO `YYYY-MM-DD`, interprétée dans le fuseau du studio. */
export type IsoDate = string;
/** Instant absolu au format ISO 8601 avec offset. */
export type IsoDateTime = string;
/** Montant en centimes d'euro — jamais de flottant pour de l'argent. */
export type Cents = number;

export type IntensityLevel = 'douce' | 'moderee' | 'dynamique';

export type LocationKind = 'studio' | 'home';

export interface ServiceDuration {
  id: Uuid;
  serviceId: Uuid;
  /** Durée du soin en minutes, hors préparation et battement. */
  minutes: number;
  priceCents: Cents;
  isActive: boolean;
  sortOrder: number;
}

export interface Service {
  id: Uuid;
  slug: string;
  name: string;
  /** Accroche courte, utilisée en carte et en meta description. */
  shortDescription: string;
  description: string;
  intensity: IntensityLevel;
  /** À qui s'adresse la séance — affiché sur la page catalogue. */
  recommendedFor: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Disponibilité à domicile : le studio reste l'option principale. */
  homeServiceAvailable: boolean;
  isActive: boolean;
  isSignature: boolean;
  sortOrder: number;
  durations: ServiceDuration[];
}

export interface HomeZone {
  id: Uuid;
  name: string;
  /** Codes postaux couverts par la zone. */
  postalCodes: string[];
  travelFeeCents: Cents;
  /** Trajet aller à prévoir dans le planning, en minutes. */
  travelMinutes: number;
  isActive: boolean;
}

export interface BusinessHour {
  /** 0 = dimanche … 6 = samedi (compatible `Date#getDay`). */
  weekday: number;
  /** Heure locale `HH:mm`. */
  opensAt: string;
  closesAt: string;
  isOpen: boolean;
}

export interface BlockedSlot {
  id: Uuid;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  reason: string | null;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface Customer {
  id: Uuid;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingConsent: boolean;
  createdAt: IsoDateTime;
}

export interface BookingAddress {
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
}

export interface Booking {
  id: Uuid;
  reference: string;
  customerId: Uuid;
  serviceId: Uuid;
  serviceDurationId: Uuid;
  locationKind: LocationKind;
  address: BookingAddress | null;
  homeZoneId: Uuid | null;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  servicePriceCents: Cents;
  travelFeeCents: Cents;
  discountCents: Cents;
  totalCents: Cents;
  promotionCode: string | null;
  giftCardCode: string | null;
  customerNote: string | null;
  manageToken: string;
  createdAt: IsoDateTime;
  cancelledAt: IsoDateTime | null;
}

/** Réservation enrichie pour l'affichage (confirmation, admin, emails). */
export interface BookingDetails extends Booking {
  service: Pick<Service, 'id' | 'slug' | 'name'>;
  durationMinutes: number;
  customer: Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone'>;
}

export interface TimeSlot {
  /** Début du créneau, instant absolu. */
  startsAt: IsoDateTime;
  /** Fin du soin (hors battement), instant absolu. */
  endsAt: IsoDateTime;
  /** Libellé `HH:mm` déjà exprimé dans le fuseau du studio. */
  label: string;
}

export interface DayAvailability {
  date: IsoDate;
  slots: TimeSlot[];
}

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'cancelled';

export interface GiftCard {
  id: Uuid;
  code: string;
  initialAmountCents: Cents;
  balanceCents: Cents;
  status: GiftCardStatus;
  /** Prestation offerte lorsque la carte porte sur un soin précis. */
  serviceLabel: string | null;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string | null;
  message: string | null;
  issuedAt: IsoDateTime;
  expiresAt: IsoDateTime;
}

export type DiscountKind = 'percentage' | 'fixed';

export interface Promotion {
  id: Uuid;
  code: string;
  kind: DiscountKind;
  /** Pourcentage entier (10 = -10 %) ou montant fixe en centimes. */
  value: number;
  startsAt: IsoDateTime | null;
  endsAt: IsoDateTime | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  /** Vide = applicable à toutes les prestations. */
  serviceIds: Uuid[];
  isActive: boolean;
}

export interface Review {
  id: Uuid;
  authorName: string;
  rating: number;
  quote: string;
  serviceLabel: string | null;
  isPublished: boolean;
  /** Marque les jeux de démonstration : jamais présentés comme de vrais avis. */
  isSample: boolean;
  createdAt: IsoDateTime;
}
