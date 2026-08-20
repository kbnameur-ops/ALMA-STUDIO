import type { AddressInput } from '@/lib/validation/booking';
import type { Cents, LocationKind, Service, ServiceDuration, TimeSlot } from '@/types';

/**
 * État du tunnel de réservation.
 *
 * Volontairement sérialisable et sans logique métier : les prix, les
 * créneaux et la validité des codes sont décidés par le serveur. Cet état
 * ne sert qu'à piloter l'interface et à composer la requête finale.
 */

export const BOOKING_STEPS = [
  { id: 1, label: 'Prestation' },
  { id: 2, label: 'Durée' },
  { id: 3, label: 'Lieu' },
  { id: 4, label: 'Créneau' },
  { id: 5, label: 'Vos informations' },
  { id: 6, label: 'Paiement' },
] as const;

export type StepId = (typeof BOOKING_STEPS)[number]['id'];

export interface CustomerDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
  acceptsTerms: boolean;
  marketingConsent: boolean;
}

export interface AppliedDiscount {
  kind: 'promotion' | 'gift_card';
  code: string;
  discountCents: Cents;
  label: string;
}

export interface BookingState {
  step: StepId;
  service: Service | null;
  duration: ServiceDuration | null;
  locationKind: LocationKind;
  address: AddressInput | null;
  /** Frais de déplacement confirmés par le serveur pour l'adresse saisie. */
  travelFeeCents: Cents;
  zoneName: string | null;
  slot: TimeSlot | null;
  customer: CustomerDraft;
  discount: AppliedDiscount | null;
}

export const emptyCustomer: CustomerDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  note: '',
  acceptsTerms: false,
  marketingConsent: false,
};

export const initialBookingState: BookingState = {
  step: 1,
  service: null,
  duration: null,
  locationKind: 'studio',
  address: null,
  travelFeeCents: 0,
  zoneName: null,
  slot: null,
  customer: emptyCustomer,
  discount: null,
};

export type BookingAction =
  | { type: 'goTo'; step: StepId }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'selectService'; service: Service }
  | { type: 'selectDuration'; duration: ServiceDuration }
  | { type: 'selectLocation'; kind: LocationKind }
  | { type: 'setAddress'; address: AddressInput | null; travelFeeCents: Cents; zoneName: string | null }
  | { type: 'selectSlot'; slot: TimeSlot | null }
  | { type: 'setCustomer'; patch: Partial<CustomerDraft> }
  | { type: 'setDiscount'; discount: AppliedDiscount | null };

function clampStep(step: number): StepId {
  const min = BOOKING_STEPS[0].id;
  const max = BOOKING_STEPS[BOOKING_STEPS.length - 1]!.id;
  return Math.min(Math.max(step, min), max) as StepId;
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'goTo':
      return { ...state, step: clampStep(action.step) };

    case 'next':
      return { ...state, step: clampStep(state.step + 1) };

    case 'back':
      return { ...state, step: clampStep(state.step - 1) };

    case 'selectService': {
      // Changer de prestation invalide durée, lieu et créneau : les
      // disponibilités et les tarifs en dépendent directement.
      const singleDuration = action.service.durations.length === 1 ? action.service.durations[0]! : null;
      const homeStillPossible = state.locationKind === 'home' && action.service.homeServiceAvailable;
      return {
        ...state,
        service: action.service,
        duration: singleDuration,
        locationKind: homeStillPossible ? 'home' : 'studio',
        address: homeStillPossible ? state.address : null,
        travelFeeCents: homeStillPossible ? state.travelFeeCents : 0,
        zoneName: homeStillPossible ? state.zoneName : null,
        slot: null,
        discount: null,
      };
    }

    case 'selectDuration':
      // La durée change la longueur du créneau : l'ancien choix ne vaut plus.
      return { ...state, duration: action.duration, slot: null, discount: null };

    case 'selectLocation':
      return {
        ...state,
        locationKind: action.kind,
        ...(action.kind === 'studio'
          ? { address: null, travelFeeCents: 0, zoneName: null }
          : {}),
        slot: null,
      };

    case 'setAddress':
      return {
        ...state,
        address: action.address,
        travelFeeCents: action.travelFeeCents,
        zoneName: action.zoneName,
        slot: null,
      };

    case 'selectSlot':
      return { ...state, slot: action.slot };

    case 'setCustomer':
      return { ...state, customer: { ...state.customer, ...action.patch } };

    case 'setDiscount':
      return { ...state, discount: action.discount };

    default:
      return state;
  }
}

/** Une étape n'est franchissable que si la précédente est complète. */
export function canLeaveStep(state: BookingState, step: StepId): boolean {
  switch (step) {
    case 1:
      return state.service !== null;
    case 2:
      return state.duration !== null;
    case 3:
      return state.locationKind === 'studio' || state.address !== null;
    case 4:
      return state.slot !== null;
    case 5:
      return (
        state.customer.firstName.trim().length > 0 &&
        state.customer.lastName.trim().length > 0 &&
        state.customer.email.trim().length > 0 &&
        state.customer.phone.trim().length > 0 &&
        state.customer.acceptsTerms
      );
    default:
      return true;
  }
}

/** Aperçu du total. Le montant facturé est recalculé côté serveur. */
export function previewTotalCents(state: BookingState): Cents {
  const base = state.duration?.priceCents ?? 0;
  const travel = state.locationKind === 'home' ? state.travelFeeCents : 0;
  const discount = state.discount?.discountCents ?? 0;
  return Math.max(0, base + travel - discount);
}
