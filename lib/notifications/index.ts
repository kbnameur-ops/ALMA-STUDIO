import 'server-only';

import { site } from '@/config/site';
import { getAdminClient } from '@/lib/supabase/server';
import { getBookingRules, isSmsEnabled } from '@/lib/repositories/settings';
import { formatDateTime, formatDuration } from '@/lib/utils/format';
import type { BookingDetails, GiftCard } from '@/types';
import {
  bookingCancelledEmail,
  bookingConfirmationEmail,
  bookingRefundedEmail,
  bookingReminderEmail,
  bookingRequestEmail,
  bookingRequestStudioEmail,
  bookingUpdatedEmail,
  giftCardEmail,
  reviewRequestEmail,
  sendEmail,
  type BookingTemplate,
  type RenderedEmail,
} from './email';
import { sendSms } from './sms';

/**
 * Orchestration des notifications.
 *
 * Chaque envoi est tracé dans la table `notifications`, dont l'index unique
 * (réservation, canal, modèle) rend les envois idempotents : rejouer un
 * webhook Stripe ou une tâche de rappel n'enverra pas deux fois le même
 * message.
 */

type NotificationChannel = 'email' | 'sms';

async function alreadySent(
  bookingId: string,
  channel: NotificationChannel,
  template: string,
): Promise<boolean> {
  const db = getAdminClient();
  if (!db) return false;

  const { data } = await db
    .from('notifications')
    .select('id, status')
    .eq('booking_id', bookingId)
    .eq('channel', channel)
    .eq('template', template)
    .maybeSingle();

  return data?.status === 'sent';
}

async function trace(input: {
  bookingId?: string | null;
  giftCardId?: string | null;
  channel: NotificationChannel;
  template: string;
  recipient: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string | null;
}): Promise<void> {
  const db = getAdminClient();
  if (!db) return;

  const { error } = await db.from('notifications').upsert(
    {
      booking_id: input.bookingId ?? null,
      gift_card_id: input.giftCardId ?? null,
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      status: input.status,
      scheduled_for: null,
      sent_at: input.status === 'sent' ? new Date().toISOString() : null,
      error: input.error ?? null,
    },
    { onConflict: 'booking_id,channel,template' },
  );

  if (error) console.error('[notifications] trace impossible', error.message);
}

async function deliverBookingEmail(
  booking: BookingDetails,
  template: BookingTemplate,
  email: RenderedEmail,
): Promise<void> {
  if (await alreadySent(booking.id, 'email', template)) return;

  const result = await sendEmail({ to: booking.customer.email, ...email });
  await trace({
    bookingId: booking.id,
    channel: 'email',
    template,
    recipient: booking.customer.email,
    status: result.ok ? 'sent' : result.reason === 'not_configured' ? 'skipped' : 'failed',
    error: result.ok ? null : (result.error ?? result.reason),
  });
}

/** SMS optionnel, coupé par défaut et piloté par `settings.sms_enabled`. */
async function deliverBookingSms(
  booking: BookingDetails,
  template: BookingTemplate,
  body: string,
): Promise<void> {
  if (!(await isSmsEnabled())) return;
  if (await alreadySent(booking.id, 'sms', template)) return;

  const result = await sendSms({ to: booking.customer.phone, body });
  await trace({
    bookingId: booking.id,
    channel: 'sms',
    template,
    recipient: booking.customer.phone,
    status: result.ok ? 'sent' : result.reason === 'not_configured' ? 'skipped' : 'failed',
    error: result.ok ? null : (result.error ?? result.reason),
  });
}

/**
 * Envoi adressé au studio, non au client.
 *
 * Le studio est destinataire, mais la trace reste attachée à la
 * réservation : l'index unique (réservation, canal, modèle) garantit qu'un
 * rejeu n'enverra pas la demande deux fois. Le modèle porte donc un nom
 * distinct de celui du client.
 */
async function deliverStudioEmail(
  booking: BookingDetails,
  template: BookingTemplate,
  email: RenderedEmail,
): Promise<void> {
  if (await alreadySent(booking.id, 'email', template)) return;

  const result = await sendEmail({ to: site.contactEmail, ...email });
  await trace({
    bookingId: booking.id,
    channel: 'email',
    template,
    recipient: site.contactEmail,
    status: result.ok ? 'sent' : result.reason === 'not_configured' ? 'skipped' : 'failed',
    error: result.ok ? null : (result.error ?? result.reason),
  });
}

/**
 * Demande de réservation : accusé de réception au client, et la demande
 * elle-même au studio.
 *
 * L'ordre compte. Le studio est prévenu en premier : si l'envoi au client
 * échoue, la demande n'est pas perdue pour autant, alors que l'inverse
 * laisserait un client rassuré sans que personne ne soit au courant.
 */
export async function notifyBookingRequested(booking: BookingDetails): Promise<void> {
  await deliverStudioEmail(booking, 'booking_request_studio', bookingRequestStudioEmail(booking));
  await deliverBookingEmail(
    booking,
    'booking_request',
    bookingRequestEmail(booking, site.requestHoldHours),
  );
  await deliverBookingSms(
    booking,
    'booking_request',
    `${site.brandName} — demande reçue pour ${booking.service.name} le ${formatDateTime(booking.startsAt)}. Nous confirmons rapidement. Réf. ${booking.reference}`,
  );
}

export async function notifyBookingConfirmed(booking: BookingDetails): Promise<void> {
  const rules = await getBookingRules();
  await deliverBookingEmail(
    booking,
    'booking_confirmation',
    bookingConfirmationEmail(booking, rules.cancellationHours),
  );
  await deliverBookingSms(
    booking,
    'booking_confirmation',
    `${site.brandName} — votre séance ${booking.service.name} (${formatDuration(booking.durationMinutes)}) est confirmée le ${formatDateTime(booking.startsAt)}. Réf. ${booking.reference}`,
  );
}

export async function notifyBookingReminder(booking: BookingDetails): Promise<void> {
  const rules = await getBookingRules();
  await deliverBookingEmail(
    booking,
    'booking_reminder',
    bookingReminderEmail(booking, rules.cancellationHours),
  );
  await deliverBookingSms(
    booking,
    'booking_reminder',
    `${site.brandName} — rappel : votre séance est prévue le ${formatDateTime(booking.startsAt)}. Réf. ${booking.reference}`,
  );
}

export async function notifyBookingUpdated(booking: BookingDetails): Promise<void> {
  await deliverBookingEmail(booking, 'booking_updated', bookingUpdatedEmail(booking));
}

export async function notifyBookingCancelled(booking: BookingDetails): Promise<void> {
  await deliverBookingEmail(booking, 'booking_cancelled', bookingCancelledEmail(booking));
}

export async function notifyBookingRefunded(
  booking: BookingDetails,
  amountCents: number,
): Promise<void> {
  await deliverBookingEmail(booking, 'booking_refunded', bookingRefundedEmail(booking, amountCents));
}

export async function notifyReviewRequest(booking: BookingDetails): Promise<void> {
  await deliverBookingEmail(booking, 'review_request', reviewRequestEmail(booking));
}

/** Envoie la carte au bénéficiaire quand un email est fourni, et sa copie à l'acheteur. */
export async function notifyGiftCardIssued(card: GiftCard): Promise<void> {
  if (card.recipientEmail) {
    const result = await sendEmail({
      to: card.recipientEmail,
      ...giftCardEmail(card, 'recipient'),
    });
    await trace({
      giftCardId: card.id,
      channel: 'email',
      template: 'gift_card_recipient',
      recipient: card.recipientEmail,
      status: result.ok ? 'sent' : result.reason === 'not_configured' ? 'skipped' : 'failed',
      error: result.ok ? null : (result.error ?? result.reason),
    });
  }

  const copy = await sendEmail({ to: card.purchaserEmail, ...giftCardEmail(card, 'purchaser') });
  await trace({
    giftCardId: card.id,
    channel: 'email',
    template: 'gift_card_purchaser',
    recipient: card.purchaserEmail,
    status: copy.ok ? 'sent' : copy.reason === 'not_configured' ? 'skipped' : 'failed',
    error: copy.ok ? null : (copy.error ?? copy.reason),
  });
}
