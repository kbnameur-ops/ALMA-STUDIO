import { describe, expect, it } from 'vitest';
import { createBookingSchema, availabilityQuerySchema } from '@/lib/validation/booking';
import { giftCardPurchaseSchema } from '@/lib/validation/giftcard';

const validCustomer = {
  firstName: 'Claire',
  lastName: 'Martin',
  email: 'claire@example.com',
  phone: '06 00 00 00 00',
  note: null,
  acceptsTerms: true,
  marketingConsent: false,
};

const validBooking = {
  serviceId: 'svc-1',
  serviceDurationId: 'dur-1',
  locationKind: 'studio' as const,
  address: null,
  startsAt: '2026-04-11T12:00:00.000Z',
  customer: validCustomer,
};

describe('createBookingSchema', () => {
  it('accepte une réservation au studio', () => {
    expect(createBookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it('exige une adresse pour une prestation à domicile', () => {
    const result = createBookingSchema.safeParse({ ...validBooking, locationKind: 'home' });
    expect(result.success).toBe(false);
  });

  it('accepte une prestation à domicile avec adresse complète', () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      locationKind: 'home',
      address: { line1: '10 rue de Rivoli', postalCode: '75004', city: 'Paris' },
    });
    expect(result.success).toBe(true);
  });

  it('rejette un code postal mal formé', () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      locationKind: 'home',
      address: { line1: '10 rue de Rivoli', postalCode: '750', city: 'Paris' },
    });
    expect(result.success).toBe(false);
  });

  it('rejette une adresse email invalide', () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      customer: { ...validCustomer, email: 'pas-un-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejette des conditions non acceptées', () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      customer: { ...validCustomer, acceptsTerms: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejette une date sans fuseau explicite', () => {
    const result = createBookingSchema.safeParse({ ...validBooking, startsAt: '2026-04-11 12:00' });
    expect(result.success).toBe(false);
  });
});

describe('availabilityQuerySchema', () => {
  it('applique une fenêtre par défaut de 7 jours', () => {
    const result = availabilityQuerySchema.safeParse({
      serviceDurationId: 'dur-1',
      from: '2026-04-11',
    });
    expect(result.success && result.data.days).toBe(7);
  });

  it('borne la fenêtre demandée', () => {
    expect(
      availabilityQuerySchema.safeParse({
        serviceDurationId: 'dur-1',
        from: '2026-04-11',
        days: 90,
      }).success,
    ).toBe(false);
  });
});

describe('giftCardPurchaseSchema', () => {
  const base = {
    purchaserName: 'Thomas',
    purchaserEmail: 'thomas@example.com',
    recipientName: 'Inès',
    recipientEmail: 'ines@example.com',
    message: null,
    acceptsTerms: true,
  };

  it('accepte un montant libre dans les bornes', () => {
    expect(
      giftCardPurchaseSchema.safeParse({ ...base, kind: 'amount', amountCents: 9000 }).success,
    ).toBe(true);
  });

  it('rejette un montant hors bornes', () => {
    expect(
      giftCardPurchaseSchema.safeParse({ ...base, kind: 'amount', amountCents: 100 }).success,
    ).toBe(false);
    expect(
      giftCardPurchaseSchema.safeParse({ ...base, kind: 'amount', amountCents: 900000 }).success,
    ).toBe(false);
  });

  it('exige une prestation quand la carte porte sur un soin', () => {
    expect(giftCardPurchaseSchema.safeParse({ ...base, kind: 'service' }).success).toBe(false);
    expect(
      giftCardPurchaseSchema.safeParse({ ...base, kind: 'service', serviceDurationId: 'dur-1' })
        .success,
    ).toBe(true);
  });
});
