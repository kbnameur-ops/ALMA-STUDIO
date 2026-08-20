import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, getWebhookSecret } from '@/lib/stripe/server';
import {
  confirmBookingPaid,
  getBookingDetails,
  markBookingRefunded,
  updateBookingStatus,
} from '@/lib/repositories/bookings';
import { markPromotionRedeemed } from '@/lib/repositories/promotions';
import { createGiftCard, redeemGiftCard } from '@/lib/repositories/giftcards';
import { notifyBookingConfirmed, notifyBookingRefunded, notifyGiftCardIssued } from '@/lib/notifications';
import { jsonError, jsonOk } from '@/lib/utils/http';

/**
 * Webhook Stripe — **source de vérité du paiement**.
 *
 * Une réservation ne passe jamais en `confirmed` parce que le navigateur
 * l'affirme : seule la signature Stripe vérifiée ici fait foi. Le handler
 * est idempotent (les fonctions SQL appelées le sont), ce qui permet à
 * Stripe de rejouer un événement sans effet de bord.
 */
export const dynamic = 'force-dynamic';
// Le corps brut est requis pour vérifier la signature : pas de parsing amont.
export const runtime = 'nodejs';

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  const metadata = intent.metadata ?? {};

  // ------------------------------------------------------ carte cadeau
  if (metadata.kind === 'gift_card') {
    const amount = intent.amount_received || intent.amount;
    const card = await createGiftCard({
      amountCents: amount,
      serviceLabel: metadata.service_label || null,
      purchaserName: metadata.purchaser_name ?? '',
      purchaserEmail: metadata.purchaser_email ?? '',
      recipientName: metadata.recipient_name ?? '',
      recipientEmail: metadata.recipient_email || null,
      message: metadata.message || null,
    });
    if (card) await notifyGiftCardIssued(card);
    return;
  }

  // ------------------------------------------------------ réservation
  const bookingId = metadata.booking_id;
  if (!bookingId) return;

  const confirmed = await confirmBookingPaid(
    bookingId,
    intent.id,
    intent.amount_received || intent.amount,
  );
  if (!confirmed) return;

  const booking = await getBookingDetails(bookingId);
  if (!booking) return;

  // Codes consommés seulement une fois le paiement réellement encaissé.
  if (booking.giftCardCode && booking.discountCents > 0) {
    await redeemGiftCard(booking.giftCardCode, booking.discountCents, booking.id);
  }
  if (booking.promotionCode) {
    await markPromotionRedeemed(booking.promotionCode);
  }

  await notifyBookingConfirmed(booking);
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = intent.metadata?.booking_id;
  if (!bookingId) return;
  // La retenue expirera d'elle-même ; on libère explicitement le créneau.
  await updateBookingStatus(bookingId, 'cancelled');
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const bookingId = charge.metadata?.booking_id;
  if (!bookingId) return;

  const refunded = charge.amount_refunded;
  await markBookingRefunded(bookingId, refunded);

  const booking = await getBookingDetails(bookingId);
  if (booking) await notifyBookingRefunded(booking, refunded);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = getWebhookSecret();
  if (!stripe || !secret) {
    return jsonError('Webhook non configuré.', 503, { code: 'WEBHOOK_UNAVAILABLE' });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return jsonError('Signature manquante.', 400, { code: 'SIGNATURE_MISSING' });

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (error) {
    // Signature invalide : la requête ne vient pas de Stripe.
    console.error('[stripe] signature refusée', error instanceof Error ? error.message : error);
    return jsonError('Signature invalide.', 400, { code: 'SIGNATURE_INVALID' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        // Les autres événements sont acquittés sans traitement.
        break;
    }
  } catch (error) {
    // Réponse 500 : Stripe rejouera l'événement, le traitement est idempotent.
    console.error('[stripe] traitement en échec', error);
    return jsonError('Traitement impossible.', 500, { code: 'HANDLER_FAILED' });
  }

  return jsonOk({ received: true });
}
