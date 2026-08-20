import type { NextRequest } from 'next/server';
import { canCancelFreeOfCharge } from '@/lib/booking/pricing';
import {
  getBookingByReference,
  markBookingRefunded,
  updateBookingStatus,
} from '@/lib/repositories/bookings';
import { getBookingRules } from '@/lib/repositories/settings';
import { notifyBookingCancelled } from '@/lib/notifications';
import { getStripe } from '@/lib/stripe/server';
import { getAdminClient } from '@/lib/supabase/server';
import { cancelBookingSchema } from '@/lib/validation/booking';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Annulation par le client.
 *
 * L'accès repose sur la référence **et** le jeton secret reçu par email :
 * connaître une référence ne suffit pas à annuler la séance de quelqu'un
 * d'autre. Le délai d'annulation vient de la configuration, jamais du code.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'cancel'), 10, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = cancelBookingSchema.safeParse(body);
  if (!parsed.success) return jsonError('Requête invalide.', 400, { code: 'INVALID_REQUEST' });

  const booking = await getBookingByReference(parsed.data.reference, parsed.data.token);
  if (!booking) return jsonError('Réservation introuvable.', 404, { code: 'NOT_FOUND' });

  if (booking.status === 'cancelled' || booking.status === 'refunded') {
    return jsonOk({ status: booking.status, refunded: booking.status === 'refunded' });
  }
  if (booking.status === 'completed' || booking.status === 'no_show') {
    return jsonError('Cette séance a déjà eu lieu.', 409, { code: 'ALREADY_COMPLETED' });
  }

  const rules = await getBookingRules();
  const freeCancellation = canCancelFreeOfCharge(booking.startsAt, rules.cancellationHours);

  if (!freeCancellation) {
    return jsonError(
      `L’annulation en ligne n’est plus possible à moins de ${rules.cancellationHours} heures du rendez-vous. Contactez-nous directement.`,
      409,
      { code: 'TOO_LATE' },
    );
  }

  await updateBookingStatus(booking.id, 'cancelled');

  // Remboursement automatique lorsque la séance avait été payée.
  let refunded = false;
  if (booking.paymentStatus === 'paid' && booking.totalCents > 0) {
    const stripe = getStripe();
    const db = getAdminClient();
    const payment = db
      ? await db
          .from('payments')
          .select('provider_payment_id, amount_cents')
          .eq('booking_id', booking.id)
          .eq('status', 'paid')
          .maybeSingle()
      : null;

    if (stripe && payment?.data?.provider_payment_id) {
      try {
        await stripe.refunds.create({
          payment_intent: payment.data.provider_payment_id,
          // Le webhook `charge.refunded` finalisera le statut et l'email.
          metadata: { booking_id: booking.id, reference: booking.reference },
        });
        refunded = true;
      } catch (error) {
        console.error('[cancel] remboursement refusé', error);
        // L'annulation reste effective ; le remboursement sera traité à la main.
        await markBookingRefunded(booking.id, 0);
      }
    }
  }

  await notifyBookingCancelled(booking);

  return jsonOk({ status: 'cancelled', refunded });
}
