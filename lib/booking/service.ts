import 'server-only';

import { site } from '@/config/site';
import { getBusinessHours, getBusyIntervals } from '@/lib/repositories/schedule';
import { getBookingRules } from '@/lib/repositories/settings';
import type { DayAvailability, IsoDate } from '@/types';
import { computeAvailability, listDates, studioInstant, todayInStudio } from './availability';

interface AvailabilityQuery {
  /** Première journée demandée ; par défaut, aujourd'hui au studio. */
  from?: IsoDate;
  /** Nombre de journées à retourner. */
  days: number;
  durationMinutes: number;
  /** Trajet à réserver dans le planning pour une prestation à domicile. */
  travelMinutes?: number;
}

/**
 * Assemble les données de planning et délègue le calcul au moteur pur.
 * C'est le seul point d'entrée « disponibilités » : le client ne calcule
 * jamais de créneau lui-même.
 */
export async function getAvailability(query: AvailabilityQuery): Promise<DayAvailability[]> {
  const now = new Date();
  const rules = await getBookingRules();
  const from = query.from ?? todayInStudio(site.timezone, now);
  const days = Math.min(Math.max(query.days, 1), rules.bookingHorizonDays);
  const dates = listDates(from, days, site.timezone);
  if (dates.length === 0) return [];

  const first = dates[0]!;
  const last = dates[dates.length - 1]!;
  const windowStart = studioInstant(first, '00:00', site.timezone) ?? now;
  const windowEnd = studioInstant(last, '23:59', site.timezone) ?? now;

  const [businessHours, busy] = await Promise.all([
    getBusinessHours(),
    getBusyIntervals(windowStart, windowEnd),
  ]);

  return computeAvailability({
    dates,
    timezone: site.timezone,
    businessHours,
    blocked: busy,
    bookings: [],
    durationMinutes: query.durationMinutes,
    travelMinutes: query.travelMinutes ?? 0,
    rules,
    now,
  });
}
