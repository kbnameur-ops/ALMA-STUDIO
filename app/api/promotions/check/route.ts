import type { NextRequest } from 'next/server';
import { checkPromotion, computePrice } from '@/lib/booking/pricing';
import { findPromotionByCode } from '@/lib/repositories/promotions';
import { findGiftCardByCode } from '@/lib/repositories/giftcards';
import { getServices } from '@/lib/repositories/services';
import { isGiftCardUsable } from '@/lib/booking/pricing';
import { promotionCheckSchema } from '@/lib/validation/booking';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Vérifie un code promotionnel ou une carte cadeau et renvoie le montant
 * de réduction correspondant.
 *
 * Le montant n'est qu'un aperçu : il est recalculé au moment du paiement à
 * partir des mêmes règles serveur. La limitation de débit est stricte —
 * cet endpoint permettrait sinon d'énumérer les codes.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'promotion'), 10, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = promotionCheckSchema.safeParse(body);
  if (!parsed.success) return jsonError('Code invalide.', 400, { code: 'INVALID_CODE' });

  const { code, serviceId, serviceDurationId } = parsed.data;

  const services = await getServices();
  const service = services.find((item) => item.id === serviceId);
  const duration = service?.durations.find((item) => item.id === serviceDurationId);
  if (!service || !duration) {
    return jsonError('Prestation introuvable.', 404, { code: 'SERVICE_UNAVAILABLE' });
  }

  const [promotion, giftCard] = await Promise.all([
    findPromotionByCode(code),
    findGiftCardByCode(code),
  ]);

  if (promotion && checkPromotion(promotion, serviceId).valid) {
    const price = computePrice({
      servicePriceCents: duration.priceCents,
      serviceId,
      promotion,
    });
    return jsonOk({
      kind: 'promotion' as const,
      code: promotion.code,
      discountCents: price.promotionCents,
      label:
        promotion.kind === 'percentage'
          ? `Code ${promotion.code} — ${promotion.value} %`
          : `Code ${promotion.code}`,
    });
  }

  if (giftCard && isGiftCardUsable(giftCard)) {
    return jsonOk({
      kind: 'gift_card' as const,
      code: giftCard.code,
      // Réduction réelle plafonnée au prix du soin choisi.
      discountCents: Math.min(giftCard.balanceCents, duration.priceCents),
      balanceCents: giftCard.balanceCents,
      label: `Carte cadeau ${giftCard.code}`,
    });
  }

  // Message unique : ne pas révéler si le code existe mais est expiré.
  return jsonError('Ce code n’est pas valable pour cette réservation.', 404, {
    code: 'CODE_INVALID',
  });
}
