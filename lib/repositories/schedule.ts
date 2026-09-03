import 'server-only';

import { cache } from 'react';
import { seedBusinessHours } from '@/config/seed';
import type { BusyInterval } from '@/lib/booking/availability';
import { getServerClient, getAdminClient } from '@/lib/supabase/server';
import { hasServiceRole } from '@/lib/supabase/env';
import type { BusinessHour } from '@/types';
import { toBusinessHour } from './mappers';

export const getBusinessHours = cache(async (): Promise<BusinessHour[]> => {
  const db = await getServerClient();
  if (!db) return seedBusinessHours;

  const { data, error } = await db.from('business_hours').select('*').order('weekday');
  if (error || !data || data.length === 0) {
    if (error) console.error('[schedule] horaires illisibles', error.message);
    return seedBusinessHours;
  }
  return data.map(toBusinessHour);
});

/**
 * Intervalles occupés sur une fenêtre donnée : indisponibilités saisies en
 * administration et réservations actives (retenues comprises).
 *
 * Lecture privilégiée : les motifs d'indisponibilité et les réservations ne
 * sont pas exposés au public par RLS ; seule l'occupation en découle, et
 * elle n'est jamais renvoyée telle quelle au navigateur.
 */
export async function getBusyIntervals(from: Date, to: Date): Promise<BusyInterval[]> {
  if (!hasServiceRole()) return [];
  const db = getAdminClient();
  if (!db) return [];

  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const [blocked, bookings] = await Promise.all([
    db
      .from('blocked_slots')
      .select('starts_at, ends_at')
      .lt('starts_at', toIso)
      .gt('ends_at', fromIso),
    db
      .from('bookings')
      .select('blocks_from, blocks_until, status, hold_expires_at')
      .in('status', ['pending', 'confirmed', 'completed'])
      .lt('blocks_from', toIso)
      .gt('blocks_until', fromIso),
  ]);

  if (blocked.error) console.error('[schedule] blocages illisibles', blocked.error.message);
  if (bookings.error) console.error('[schedule] réservations illisibles', bookings.error.message);

  const now = Date.now();
  const intervals: BusyInterval[] = [];

  for (const row of blocked.data ?? []) {
    intervals.push({ start: new Date(row.starts_at), end: new Date(row.ends_at) });
  }

  for (const row of bookings.data ?? []) {
    // Une retenue expirée ne bloque plus rien : elle sera purgée à la
    // prochaine tentative de réservation.
    const holdExpired =
      row.status === 'pending' &&
      row.hold_expires_at !== null &&
      new Date(row.hold_expires_at).getTime() < now;
    if (holdExpired) continue;
    intervals.push({ start: new Date(row.blocks_from), end: new Date(row.blocks_until) });
  }

  return intervals;
}
