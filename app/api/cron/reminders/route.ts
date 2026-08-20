import type { NextRequest } from 'next/server';
import { listBookingsForReminder } from '@/lib/repositories/bookings';
import { getBookingRules } from '@/lib/repositories/settings';
import { notifyBookingReminder } from '@/lib/notifications';
import { jsonError, jsonOk } from '@/lib/utils/http';

/**
 * Rappels avant séance.
 *
 * Déclenché par une tâche planifiée (Vercel Cron, voir `vercel.json`).
 * Le délai est configurable (`settings.reminder_hours`) ; l'envoi est
 * idempotent grâce à l'index unique de la table `notifications`, donc une
 * exécution deux fois de suite n'envoie pas deux rappels.
 */
export const dynamic = 'force-dynamic';

/** Largeur de la fenêtre balayée, en minutes. À aligner sur la fréquence du cron. */
const WINDOW_MINUTES = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Sans secret configuré, l'endpoint reste fermé : il vaut mieux ne pas
  // envoyer de rappel que d'exposer un déclencheur public.
  if (!secret) return false;

  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError('Non autorisé.', 401, { code: 'UNAUTHORIZED' });
  }

  const rules = await getBookingRules();
  const now = Date.now();
  const from = new Date(now + rules.reminderHours * 60 * 60 * 1000);
  const to = new Date(from.getTime() + WINDOW_MINUTES * 60 * 1000);

  const bookings = await listBookingsForReminder(from, to);

  let sent = 0;
  for (const booking of bookings) {
    try {
      await notifyBookingReminder(booking);
      sent += 1;
    } catch (error) {
      console.error(`[cron] rappel en échec pour ${booking.reference}`, error);
    }
  }

  return jsonOk({ examined: bookings.length, sent, windowStart: from.toISOString() });
}
