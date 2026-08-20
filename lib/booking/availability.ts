/**
 * Moteur de disponibilité.
 *
 * Module **pur** : aucune I/O, aucun accès base, aucune dépendance à
 * l'heure courante autre que le paramètre `now`. C'est ce qui le rend
 * testable et fiable — les données (horaires, blocages, réservations)
 * sont fournies par l'appelant, qui les lit côté serveur.
 *
 * Toutes les comparaisons se font sur des instants absolus (epoch ms) ;
 * le fuseau du studio n'intervient que pour construire les bornes
 * d'ouverture d'une journée, ce qui gère correctement les changements
 * d'heure été/hiver.
 */

import { TZDate } from '@date-fns/tz';
import type { BusinessHour, DayAvailability, IsoDate, TimeSlot } from '@/types';
import type { BookingRules } from './rules';

/** Intervalle occupé, exprimé en instants absolus. */
export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface AvailabilityInput {
  /** Journées à évaluer, format `YYYY-MM-DD` dans le fuseau du studio. */
  dates: IsoDate[];
  timezone: string;
  businessHours: BusinessHour[];
  /** Congés, pauses et indisponibilités ponctuelles. */
  blocked: BusyInterval[];
  /** Créneaux déjà pris (préparation et battement inclus). */
  bookings: BusyInterval[];
  /** Durée du soin choisi, en minutes. */
  durationMinutes: number;
  /** Trajet aller (et retour) à réserver pour une prestation à domicile. */
  travelMinutes?: number;
  rules: BookingRules;
  now: Date;
}

const MINUTE_MS = 60_000;

function parseHhMm(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

function parseIsoDate(value: IsoDate): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * Instant absolu correspondant à une heure locale du studio.
 * Passe par `TZDate` afin d'appliquer l'offset réellement en vigueur ce
 * jour-là (CET ou CEST), et non un offset figé.
 */
export function studioInstant(date: IsoDate, time: string, timezone: string): Date | null {
  const parsedDate = parseIsoDate(date);
  const parsedTime = parseHhMm(time);
  if (!parsedDate || !parsedTime) return null;

  const zoned = new TZDate(
    parsedDate.year,
    parsedDate.month - 1,
    parsedDate.day,
    parsedTime.hours,
    parsedTime.minutes,
    0,
    0,
    timezone,
  );
  const instant = new Date(zoned.getTime());
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** Jour de la semaine (0 = dimanche) tel que vu depuis le studio. */
export function studioWeekday(date: IsoDate, timezone: string): number | null {
  const parsed = parseIsoDate(date);
  if (!parsed) return null;
  // Midi local : à l'abri des bascules d'heure d'été qui décalent minuit.
  return new TZDate(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0, 0, timezone).getDay();
}

function overlaps(startA: number, endA: number, busy: BusyInterval): boolean {
  return startA < busy.end.getTime() && endA > busy.start.getTime();
}

/**
 * Calcule les créneaux réservables pour chaque journée demandée.
 *
 * Un créneau n'est proposé que si :
 *  - le studio est ouvert ce jour-là ;
 *  - la séance complète tient dans la plage d'ouverture ;
 *  - la fenêtre occupée (préparation + soin + battement + trajet) ne
 *    chevauche ni une indisponibilité ni une réservation existante ;
 *  - le début respecte le délai de prévenance et l'horizon de réservation.
 */
export function computeAvailability(input: AvailabilityInput): DayAvailability[] {
  const {
    dates,
    timezone,
    businessHours,
    blocked,
    bookings,
    durationMinutes,
    travelMinutes = 0,
    rules,
    now,
  } = input;

  if (durationMinutes <= 0) return dates.map((date) => ({ date, slots: [] }));

  const busy = [...blocked, ...bookings];
  const earliestStart = now.getTime() + rules.minimumNoticeHours * 60 * MINUTE_MS;
  const horizonEnd = now.getTime() + rules.bookingHorizonDays * 24 * 60 * MINUTE_MS;

  const leadMs = (rules.prepMinutes + travelMinutes) * MINUTE_MS;
  const trailMs = (rules.bufferMinutes + travelMinutes) * MINUTE_MS;
  const durationMs = durationMinutes * MINUTE_MS;
  const stepMs = Math.max(rules.slotStepMinutes, 5) * MINUTE_MS;

  const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  return dates.map((date) => {
    const weekday = studioWeekday(date, timezone);
    if (weekday === null) return { date, slots: [] };

    const hours = businessHours.find((entry) => entry.weekday === weekday);
    if (!hours || !hours.isOpen) return { date, slots: [] };

    const opensAt = studioInstant(date, hours.opensAt, timezone);
    const closesAt = studioInstant(date, hours.closesAt, timezone);
    if (!opensAt || !closesAt || closesAt <= opensAt) return { date, slots: [] };

    const slots: TimeSlot[] = [];
    const openMs = opensAt.getTime();
    const closeMs = closesAt.getTime();

    for (let start = openMs; start + durationMs <= closeMs; start += stepMs) {
      const end = start + durationMs;
      if (start < earliestStart || start > horizonEnd) continue;

      const occupiedStart = start - leadMs;
      const occupiedEnd = end + trailMs;
      if (busy.some((interval) => overlaps(occupiedStart, occupiedEnd, interval))) continue;

      slots.push({
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(end).toISOString(),
        label: timeFormatter.format(new Date(start)),
      });
    }

    return { date, slots };
  });
}

/**
 * Vérifie qu'un créneau précis est toujours libre.
 * Utilisé juste avant la création de la réservation ; la garantie finale
 * reste la contrainte d'exclusion en base.
 */
export function isSlotAvailable(
  startsAt: Date,
  input: Omit<AvailabilityInput, 'dates'> & { date: IsoDate },
): boolean {
  const { date, ...rest } = input;
  const [day] = computeAvailability({ ...rest, dates: [date] });
  if (!day) return false;
  const target = startsAt.getTime();
  return day.slots.some((slot) => new Date(slot.startsAt).getTime() === target);
}

/** Suite de `bookingHorizonDays` dates consécutives à partir d'une date. */
export function listDates(from: IsoDate, days: number, timezone: string): IsoDate[] {
  const parsed = parseIsoDate(from);
  if (!parsed) return [];

  const result: IsoDate[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const zoned = new TZDate(parsed.year, parsed.month - 1, parsed.day + offset, 12, 0, 0, 0, timezone);
    const month = `${zoned.getMonth() + 1}`.padStart(2, '0');
    const day = `${zoned.getDate()}`.padStart(2, '0');
    result.push(`${zoned.getFullYear()}-${month}-${day}`);
  }
  return result;
}

/** Date du jour `YYYY-MM-DD` telle que vue depuis le studio. */
export function todayInStudio(timezone: string, now: Date = new Date()): IsoDate {
  const zoned = new TZDate(now, timezone);
  const month = `${zoned.getMonth() + 1}`.padStart(2, '0');
  const day = `${zoned.getDate()}`.padStart(2, '0');
  return `${zoned.getFullYear()}-${month}-${day}`;
}
