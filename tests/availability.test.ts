import { describe, expect, it } from 'vitest';
import {
  computeAvailability,
  isSlotAvailable,
  listDates,
  studioInstant,
  studioWeekday,
  type BusyInterval,
} from '@/lib/booking/availability';
import { defaultBookingRules, type BookingRules } from '@/lib/booking/rules';
import type { BusinessHour } from '@/types';

const TZ = 'Europe/Paris';

const openEveryDay: BusinessHour[] = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  opensAt: '10:00',
  closesAt: '18:00',
  isOpen: true,
}));

const rules: BookingRules = {
  ...defaultBookingRules,
  prepMinutes: 10,
  bufferMinutes: 15,
  slotStepMinutes: 30,
  minimumNoticeHours: 0,
  bookingHorizonDays: 60,
};

/** Instant fixe pour des tests déterministes : bien avant les dates testées. */
const now = new Date('2026-04-01T06:00:00.000Z');

function busy(startIso: string, endIso: string): BusyInterval {
  return { start: new Date(startIso), end: new Date(endIso) };
}

describe('studioInstant', () => {
  it('applique l’heure d’été (CEST, UTC+2) en avril', () => {
    expect(studioInstant('2026-04-10', '10:00', TZ)?.toISOString()).toBe(
      '2026-04-10T08:00:00.000Z',
    );
  });

  it('applique l’heure d’hiver (CET, UTC+1) en janvier', () => {
    expect(studioInstant('2026-01-10', '10:00', TZ)?.toISOString()).toBe(
      '2026-01-10T09:00:00.000Z',
    );
  });

  it('rejette une date ou une heure mal formée', () => {
    expect(studioInstant('10/04/2026', '10:00', TZ)).toBeNull();
    expect(studioInstant('2026-04-10', '25:00', TZ)).toBeNull();
  });
});

describe('studioWeekday', () => {
  it('renvoie le jour vu depuis Paris', () => {
    // 2026-04-11 est un samedi.
    expect(studioWeekday('2026-04-11', TZ)).toBe(6);
  });
});

describe('computeAvailability', () => {
  it('génère les créneaux dans la plage d’ouverture, pas au-delà', () => {
    const [day] = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [],
      bookings: [],
      durationMinutes: 60,
      rules,
      now,
    });

    expect(day?.slots[0]?.label).toBe('10:00');
    // Ouverture 10h, fermeture 18h, séance de 60 min, pas de 30 min :
    // le dernier départ possible est 17h00.
    expect(day?.slots.at(-1)?.label).toBe('17:00');
  });

  it('ne propose rien un jour de fermeture', () => {
    const closedSunday = openEveryDay.map((entry) =>
      entry.weekday === 0 ? { ...entry, isOpen: false } : entry,
    );
    const [day] = computeAvailability({
      dates: ['2026-04-12'], // dimanche
      timezone: TZ,
      businessHours: closedSunday,
      blocked: [],
      bookings: [],
      durationMinutes: 60,
      rules,
      now,
    });

    expect(day?.slots).toHaveLength(0);
  });

  it('exclut un créneau déjà réservé, préparation et battement compris', () => {
    // Réservation 12:00–13:00 locale (10:00–11:00 UTC), fenêtre occupée
    // 11:50–13:15 locale une fois la préparation et le battement ajoutés.
    const [day] = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [],
      bookings: [busy('2026-04-10T09:50:00.000Z', '2026-04-10T11:15:00.000Z')],
      durationMinutes: 60,
      rules,
      now,
    });

    const labels = day?.slots.map((slot) => slot.label) ?? [];
    expect(labels).not.toContain('12:00');
    // 11:00–12:00 empiéterait sur la préparation de la séance de 12:00.
    expect(labels).not.toContain('11:00');
    // 11:30 et 12:30 chevauchent aussi la fenêtre occupée.
    expect(labels).not.toContain('12:30');
    expect(labels).toContain('10:00');
    expect(labels).toContain('13:30');
  });

  it('exclut les indisponibilités saisies en administration', () => {
    const [day] = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [busy('2026-04-10T08:00:00.000Z', '2026-04-10T12:00:00.000Z')],
      bookings: [],
      durationMinutes: 60,
      rules,
      now,
    });

    const labels = day?.slots.map((slot) => slot.label) ?? [];
    expect(labels).not.toContain('10:00');
    expect(labels).not.toContain('13:00');
    // Le blocage court jusqu'à 14:00 locale : un départ à 14:00 empiéterait
    // dessus par ses 10 minutes de préparation. Le premier créneau est 14:30.
    expect(labels).not.toContain('14:00');
    expect(labels[0]).toBe('14:30');
  });

  it('respecte le délai de prévenance', () => {
    const [day] = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [],
      bookings: [],
      durationMinutes: 60,
      rules: { ...rules, minimumNoticeHours: 4 },
      // 10:00 locale ; avec 4 h de prévenance, rien avant 14:00.
      now: new Date('2026-04-10T08:00:00.000Z'),
    });

    const labels = day?.slots.map((slot) => slot.label) ?? [];
    expect(labels).not.toContain('13:30');
    expect(labels[0]).toBe('14:00');
  });

  it('réserve le temps de trajet pour une prestation à domicile', () => {
    const withTravel = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [],
      bookings: [busy('2026-04-10T09:50:00.000Z', '2026-04-10T11:15:00.000Z')],
      durationMinutes: 60,
      travelMinutes: 45,
      rules,
      now,
    });

    const labels = withTravel[0]?.slots.map((slot) => slot.label) ?? [];
    // Le trajet élargit la fenêtre occupée de part et d'autre.
    expect(labels).not.toContain('10:30');
    expect(labels).not.toContain('14:00');
  });

  it('ne propose aucun créneau si la durée dépasse l’amplitude d’ouverture', () => {
    const [day] = computeAvailability({
      dates: ['2026-04-10'],
      timezone: TZ,
      businessHours: openEveryDay,
      blocked: [],
      bookings: [],
      durationMinutes: 600,
      rules,
      now,
    });

    expect(day?.slots).toHaveLength(0);
  });
});

describe('isSlotAvailable', () => {
  const base = {
    timezone: TZ,
    businessHours: openEveryDay,
    blocked: [],
    bookings: [],
    durationMinutes: 60,
    rules,
    now,
  };

  it('accepte un créneau réellement proposé', () => {
    const start = studioInstant('2026-04-10', '14:00', TZ)!;
    expect(isSlotAvailable(start, { ...base, date: '2026-04-10' })).toBe(true);
  });

  it('refuse un créneau qui n’est pas sur la grille horaire', () => {
    const start = studioInstant('2026-04-10', '14:07', TZ)!;
    expect(isSlotAvailable(start, { ...base, date: '2026-04-10' })).toBe(false);
  });

  it('refuse un créneau occupé', () => {
    const start = studioInstant('2026-04-10', '14:00', TZ)!;
    expect(
      isSlotAvailable(start, {
        ...base,
        date: '2026-04-10',
        bookings: [busy('2026-04-10T12:00:00.000Z', '2026-04-10T13:00:00.000Z')],
      }),
    ).toBe(false);
  });
});

describe('listDates', () => {
  it('énumère des dates consécutives', () => {
    expect(listDates('2026-04-28', 5, TZ)).toEqual([
      '2026-04-28',
      '2026-04-29',
      '2026-04-30',
      '2026-05-01',
      '2026-05-02',
    ]);
  });

  it('franchit correctement le passage à l’heure d’été', () => {
    // Le changement d'heure 2026 en France a lieu dans la nuit du 28 au 29 mars.
    expect(listDates('2026-03-27', 4, TZ)).toEqual([
      '2026-03-27',
      '2026-03-28',
      '2026-03-29',
      '2026-03-30',
    ]);
  });
});
