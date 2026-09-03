import { describe, expect, it } from 'vitest';
import {
  canCancelFreeOfCharge,
  checkPromotion,
  computePrice,
  isGiftCardUsable,
} from '@/lib/booking/pricing';
import type { GiftCard, Promotion } from '@/types';

const SERVICE_ID = 'svc-1';
const now = new Date('2026-04-10T10:00:00.000Z');

function promotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'promo-1',
    code: 'BIENVENUE',
    kind: 'percentage',
    value: 10,
    startsAt: null,
    endsAt: null,
    maxRedemptions: null,
    timesRedeemed: 0,
    serviceIds: [],
    isActive: true,
    ...overrides,
  };
}

function giftCard(overrides: Partial<GiftCard> = {}): GiftCard {
  return {
    id: 'gc-1',
    code: 'ALMA-AAAA-BBBB',
    initialAmountCents: 10000,
    balanceCents: 10000,
    status: 'active',
    serviceLabel: null,
    purchaserName: 'Acheteur',
    purchaserEmail: 'acheteur@example.com',
    recipientName: 'Bénéficiaire',
    recipientEmail: null,
    message: null,
    issuedAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2027-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('checkPromotion', () => {
  it('accepte un code actif sans restriction', () => {
    expect(checkPromotion(promotion(), SERVICE_ID, now).valid).toBe(true);
  });

  it('refuse un code inactif, expiré, à venir ou épuisé', () => {
    expect(checkPromotion(promotion({ isActive: false }), SERVICE_ID, now).reason).toBe('inactive');
    expect(
      checkPromotion(promotion({ endsAt: '2026-04-01T00:00:00.000Z' }), SERVICE_ID, now).reason,
    ).toBe('expired');
    expect(
      checkPromotion(promotion({ startsAt: '2026-05-01T00:00:00.000Z' }), SERVICE_ID, now).reason,
    ).toBe('not_started');
    expect(
      checkPromotion(promotion({ maxRedemptions: 5, timesRedeemed: 5 }), SERVICE_ID, now).reason,
    ).toBe('exhausted');
  });

  it('refuse un code réservé à d’autres prestations', () => {
    expect(checkPromotion(promotion({ serviceIds: ['autre'] }), SERVICE_ID, now).reason).toBe(
      'service_not_eligible',
    );
  });

  it('refuse un code inconnu', () => {
    expect(checkPromotion(null, SERVICE_ID, now).reason).toBe('unknown');
  });
});

describe('computePrice', () => {
  it('additionne prestation et frais de déplacement', () => {
    const price = computePrice({
      servicePriceCents: 9000,
      travelFeeCents: 2000,
      serviceId: SERVICE_ID,
      now,
    });
    expect(price.subtotalCents).toBe(11000);
    expect(price.totalCents).toBe(11000);
  });

  it('applique un pourcentage au seul montant du soin', () => {
    const price = computePrice({
      servicePriceCents: 9000,
      travelFeeCents: 2000,
      serviceId: SERVICE_ID,
      promotion: promotion({ value: 10 }),
      now,
    });
    // 10 % de 90 € = 9 €, les frais de déplacement ne sont pas remisés.
    expect(price.promotionCents).toBe(900);
    expect(price.totalCents).toBe(10100);
  });

  it('plafonne une remise fixe au prix du soin', () => {
    const price = computePrice({
      servicePriceCents: 5000,
      serviceId: SERVICE_ID,
      promotion: promotion({ kind: 'fixed', value: 9000 }),
      now,
    });
    expect(price.promotionCents).toBe(5000);
    expect(price.totalCents).toBe(0);
  });

  it('ignore une promotion non éligible', () => {
    const price = computePrice({
      servicePriceCents: 9000,
      serviceId: SERVICE_ID,
      promotion: promotion({ isActive: false }),
      now,
    });
    expect(price.promotionCents).toBe(0);
    expect(price.promotionCode).toBeNull();
    expect(price.totalCents).toBe(9000);
  });

  it('utilise la carte cadeau sur le reste à payer, sans dépasser son solde', () => {
    const price = computePrice({
      servicePriceCents: 12500,
      travelFeeCents: 0,
      serviceId: SERVICE_ID,
      giftCard: giftCard({ balanceCents: 5000 }),
      now,
    });
    expect(price.giftCardCents).toBe(5000);
    expect(price.totalCents).toBe(7500);
  });

  it('cumule promotion puis carte cadeau, sans total négatif', () => {
    const price = computePrice({
      servicePriceCents: 9000,
      travelFeeCents: 2000,
      serviceId: SERVICE_ID,
      promotion: promotion({ kind: 'fixed', value: 2000 }),
      giftCard: giftCard({ balanceCents: 20000 }),
      now,
    });
    expect(price.promotionCents).toBe(2000);
    // Reste 90 € après remise ; la carte couvre tout, sans excéder ce reste.
    expect(price.giftCardCents).toBe(9000);
    expect(price.totalCents).toBe(0);
  });

  it('ignore une carte cadeau expirée, annulée ou vide', () => {
    const expired = computePrice({
      servicePriceCents: 9000,
      serviceId: SERVICE_ID,
      giftCard: giftCard({ expiresAt: '2026-01-01T00:00:00.000Z' }),
      now,
    });
    expect(expired.giftCardCents).toBe(0);

    const cancelled = computePrice({
      servicePriceCents: 9000,
      serviceId: SERVICE_ID,
      giftCard: giftCard({ status: 'cancelled' }),
      now,
    });
    expect(cancelled.giftCardCents).toBe(0);

    const empty = computePrice({
      servicePriceCents: 9000,
      serviceId: SERVICE_ID,
      giftCard: giftCard({ balanceCents: 0 }),
      now,
    });
    expect(empty.giftCardCents).toBe(0);
  });
});

describe('isGiftCardUsable', () => {
  it('refuse une carte déjà entièrement consommée', () => {
    expect(isGiftCardUsable(giftCard({ status: 'redeemed', balanceCents: 0 }), now)).toBe(false);
  });

  it('accepte une carte active avec solde', () => {
    expect(isGiftCardUsable(giftCard(), now)).toBe(true);
  });
});

describe('canCancelFreeOfCharge', () => {
  const startsAt = '2026-04-12T10:00:00.000Z';

  it('autorise l’annulation hors délai', () => {
    expect(canCancelFreeOfCharge(startsAt, 24, new Date('2026-04-11T08:00:00.000Z'))).toBe(true);
  });

  it('refuse l’annulation dans le délai', () => {
    expect(canCancelFreeOfCharge(startsAt, 24, new Date('2026-04-11T12:00:00.000Z'))).toBe(false);
  });

  it('accepte pile à la limite', () => {
    expect(canCancelFreeOfCharge(startsAt, 24, new Date('2026-04-11T10:00:00.000Z'))).toBe(true);
  });

  it('suit le seuil configuré', () => {
    // Avec 48 h de préavis, la même date de départ devient trop tardive.
    expect(canCancelFreeOfCharge(startsAt, 48, new Date('2026-04-11T08:00:00.000Z'))).toBe(false);
  });
});
