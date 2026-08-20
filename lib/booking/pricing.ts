/**
 * Calcul de prix.
 *
 * Module pur, utilisé **côté serveur** comme source de vérité du montant
 * facturé. Le frontend n'en affiche qu'un aperçu : le total transmis à
 * Stripe est toujours recalculé ici à partir des tarifs lus en base.
 */

import type { Cents, GiftCard, Promotion, Uuid } from '@/types';

export interface PriceInput {
  /** Tarif de la durée choisie, lu dans `service_durations`. */
  servicePriceCents: Cents;
  /** Frais de déplacement de la zone, lus dans `locations`. */
  travelFeeCents?: Cents;
  promotion?: Promotion | null;
  giftCard?: GiftCard | null;
  serviceId: Uuid;
  now?: Date;
}

export interface PriceBreakdown {
  servicePriceCents: Cents;
  travelFeeCents: Cents;
  subtotalCents: Cents;
  promotionCents: Cents;
  giftCardCents: Cents;
  discountCents: Cents;
  totalCents: Cents;
  promotionCode: string | null;
  giftCardCode: string | null;
}

export type PromotionRejection =
  | 'unknown'
  | 'inactive'
  | 'not_started'
  | 'expired'
  | 'exhausted'
  | 'service_not_eligible';

export interface PromotionCheck {
  valid: boolean;
  reason?: PromotionRejection;
}

/** Vérifie l'éligibilité d'un code promotionnel, sans calculer de montant. */
export function checkPromotion(
  promotion: Promotion | null | undefined,
  serviceId: Uuid,
  now: Date = new Date(),
): PromotionCheck {
  if (!promotion) return { valid: false, reason: 'unknown' };
  if (!promotion.isActive) return { valid: false, reason: 'inactive' };

  if (promotion.startsAt && new Date(promotion.startsAt).getTime() > now.getTime()) {
    return { valid: false, reason: 'not_started' };
  }
  if (promotion.endsAt && new Date(promotion.endsAt).getTime() < now.getTime()) {
    return { valid: false, reason: 'expired' };
  }
  if (
    promotion.maxRedemptions !== null &&
    promotion.timesRedeemed >= promotion.maxRedemptions
  ) {
    return { valid: false, reason: 'exhausted' };
  }
  // Liste vide = promotion applicable à toutes les prestations.
  if (promotion.serviceIds.length > 0 && !promotion.serviceIds.includes(serviceId)) {
    return { valid: false, reason: 'service_not_eligible' };
  }
  return { valid: true };
}

/** Vrai si la carte cadeau est utilisable à cet instant. */
export function isGiftCardUsable(card: GiftCard | null | undefined, now: Date = new Date()): boolean {
  if (!card) return false;
  if (card.status !== 'active') return false;
  if (new Date(card.expiresAt).getTime() < now.getTime()) return false;
  return card.balanceCents > 0;
}

/**
 * Applique, dans l'ordre : promotion sur le montant du soin, puis carte
 * cadeau sur le reste à payer. La promotion ne s'applique jamais aux frais
 * de déplacement, et aucun total ne peut devenir négatif.
 */
export function computePrice(input: PriceInput): PriceBreakdown {
  const now = input.now ?? new Date();
  const servicePriceCents = Math.max(0, Math.round(input.servicePriceCents));
  const travelFeeCents = Math.max(0, Math.round(input.travelFeeCents ?? 0));
  const subtotalCents = servicePriceCents + travelFeeCents;

  let promotionCents = 0;
  let promotionCode: string | null = null;
  const promotion = input.promotion ?? null;

  if (promotion && checkPromotion(promotion, input.serviceId, now).valid) {
    const raw =
      promotion.kind === 'percentage'
        ? Math.round((servicePriceCents * promotion.value) / 100)
        : Math.round(promotion.value);
    promotionCents = Math.min(raw, servicePriceCents);
    promotionCode = promotion.code;
  }

  const afterPromotion = subtotalCents - promotionCents;

  let giftCardCents = 0;
  let giftCardCode: string | null = null;
  const giftCard = input.giftCard ?? null;

  if (giftCard && isGiftCardUsable(giftCard, now)) {
    giftCardCents = Math.min(giftCard.balanceCents, afterPromotion);
    giftCardCode = giftCard.code;
  }

  const discountCents = promotionCents + giftCardCents;

  return {
    servicePriceCents,
    travelFeeCents,
    subtotalCents,
    promotionCents,
    giftCardCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents - discountCents),
    promotionCode,
    giftCardCode,
  };
}

/**
 * Politique d'annulation : gratuite tant que le délai n'est pas dépassé.
 * Le seuil vient de la configuration, jamais d'une constante en dur.
 */
export function canCancelFreeOfCharge(
  startsAt: string | Date,
  cancellationHours: number,
  now: Date = new Date(),
): boolean {
  const start = typeof startsAt === 'string' ? new Date(startsAt) : startsAt;
  const limit = start.getTime() - cancellationHours * 60 * 60 * 1000;
  return now.getTime() <= limit;
}
