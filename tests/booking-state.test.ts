import { describe, expect, it } from 'vitest';
import {
  bookingReducer,
  canLeaveStep,
  initialBookingState,
  previewTotalCents,
  type BookingState,
} from '@/components/booking/state';
import { seedServices } from '@/config/seed';

const signature = seedServices[0]!;
const rituel = seedServices.find((service) => service.slug === 'rituel-mediterraneen')!;

function withService(): BookingState {
  return bookingReducer(initialBookingState, { type: 'selectService', service: signature });
}

describe('bookingReducer', () => {
  it('sélectionne une prestation et réinitialise les choix dépendants', () => {
    const state = bookingReducer(
      {
        ...withService(),
        slot: { startsAt: 'x', endsAt: 'y', label: '14:00' },
        discount: { kind: 'promotion', code: 'X', discountCents: 500, label: 'X' },
      },
      { type: 'selectService', service: signature },
    );

    expect(state.service?.id).toBe(signature.id);
    expect(state.slot).toBeNull();
    expect(state.discount).toBeNull();
  });

  it('présélectionne la durée quand la prestation n’en propose qu’une', () => {
    const single = { ...signature, durations: [signature.durations[0]!] };
    const state = bookingReducer(initialBookingState, { type: 'selectService', service: single });
    expect(state.duration?.id).toBe(single.durations[0]!.id);
  });

  it('repasse au studio si la nouvelle prestation n’est pas proposée à domicile', () => {
    const atHome: BookingState = {
      ...withService(),
      locationKind: 'home',
      address: { line1: '1 rue', line2: null, postalCode: '75001', city: 'Paris' },
      travelFeeCents: 2000,
      zoneName: 'Paris centre',
    };

    const state = bookingReducer(atHome, { type: 'selectService', service: rituel });
    expect(state.locationKind).toBe('studio');
    expect(state.address).toBeNull();
    expect(state.travelFeeCents).toBe(0);
  });

  it('invalide le créneau au changement de durée', () => {
    const state = bookingReducer(
      { ...withService(), slot: { startsAt: 'x', endsAt: 'y', label: '14:00' } },
      { type: 'selectDuration', duration: signature.durations[1]! },
    );
    expect(state.slot).toBeNull();
    expect(state.duration?.minutes).toBe(90);
  });

  it('efface l’adresse en revenant au studio', () => {
    const atHome: BookingState = {
      ...withService(),
      locationKind: 'home',
      address: { line1: '1 rue', line2: null, postalCode: '75001', city: 'Paris' },
      travelFeeCents: 2000,
      zoneName: 'Paris centre',
    };
    const state = bookingReducer(atHome, { type: 'selectLocation', kind: 'studio' });
    expect(state.address).toBeNull();
    expect(state.zoneName).toBeNull();
  });

  it('borne la navigation aux étapes existantes', () => {
    expect(bookingReducer(initialBookingState, { type: 'back' }).step).toBe(1);
    expect(bookingReducer({ ...initialBookingState, step: 6 }, { type: 'next' }).step).toBe(6);
    expect(bookingReducer(initialBookingState, { type: 'goTo', step: 6 }).step).toBe(6);
  });
});

describe('canLeaveStep', () => {
  it('exige une prestation puis une durée', () => {
    expect(canLeaveStep(initialBookingState, 1)).toBe(false);
    const state = withService();
    expect(canLeaveStep(state, 1)).toBe(true);
    expect(canLeaveStep(state, 2)).toBe(false);
  });

  it('exige une adresse validée pour une prestation à domicile', () => {
    const state: BookingState = { ...withService(), locationKind: 'home', address: null };
    expect(canLeaveStep(state, 3)).toBe(false);
    expect(
      canLeaveStep(
        { ...state, address: { line1: '1 rue', line2: null, postalCode: '75001', city: 'Paris' } },
        3,
      ),
    ).toBe(true);
  });

  it('exige l’acceptation des conditions', () => {
    const filled: BookingState = {
      ...withService(),
      customer: {
        firstName: 'Claire',
        lastName: 'Martin',
        email: 'claire@example.com',
        phone: '0600000000',
        note: '',
        acceptsTerms: false,
        marketingConsent: false,
      },
    };
    expect(canLeaveStep(filled, 5)).toBe(false);
    expect(canLeaveStep({ ...filled, customer: { ...filled.customer, acceptsTerms: true } }, 5)).toBe(
      true,
    );
  });
});

describe('previewTotalCents', () => {
  it('additionne prestation, déplacement et remise', () => {
    const state: BookingState = {
      ...withService(),
      duration: signature.durations[0]!,
      locationKind: 'home',
      travelFeeCents: 2000,
      discount: { kind: 'promotion', code: 'X', discountCents: 1000, label: 'X' },
    };
    // 90 € + 20 € − 10 €
    expect(previewTotalCents(state)).toBe(10000);
  });

  it('ne descend jamais sous zéro', () => {
    const state: BookingState = {
      ...withService(),
      duration: signature.durations[0]!,
      discount: { kind: 'gift_card', code: 'X', discountCents: 999999, label: 'X' },
    };
    expect(previewTotalCents(state)).toBe(0);
  });

  it('ignore les frais de déplacement quand la séance a lieu au studio', () => {
    const state: BookingState = {
      ...withService(),
      duration: signature.durations[0]!,
      locationKind: 'studio',
      travelFeeCents: 2000,
    };
    expect(previewTotalCents(state)).toBe(signature.durations[0]!.priceCents);
  });
});
