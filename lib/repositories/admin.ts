import 'server-only';

import { TZDate } from '@date-fns/tz';
import { site } from '@/config/site';
import { getAdminClient } from '@/lib/supabase/server';
import type { BookingDetails, Cents, Customer, GiftCard, Promotion, Review } from '@/types';
import { toGiftCard, toPromotion, toReview } from './mappers';
import { listBookings } from './bookings';

/**
 * Lectures agrégées du back-office.
 * Toutes passent par la clé de service : ces données ne sont jamais
 * accessibles depuis le navigateur d'un visiteur.
 */

/** Bornes d'une journée du studio, exprimées en instants absolus. */
export function studioDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const zoned = new TZDate(date, site.timezone);
  const start = new TZDate(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    0,
    0,
    0,
    0,
    site.timezone,
  );
  const end = new TZDate(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    23,
    59,
    59,
    999,
    site.timezone,
  );
  return { start: new Date(start.getTime()), end: new Date(end.getTime()) };
}

export interface DashboardData {
  todayBookings: BookingDetails[];
  nextBooking: BookingDetails | null;
  /** Chiffre d'affaires encaissé sur le mois en cours. */
  monthRevenueCents: Cents;
  monthBookingCount: number;
  /** Réservations créées dans les dernières 24 heures. */
  newBookings: BookingDetails[];
  /** Part des créneaux ouverts effectivement réservés sur les 7 prochains jours. */
  occupancyRate: number;
  activeGiftCards: number;
  activeGiftCardBalanceCents: Cents;
}

const BILLABLE_STATUSES = new Set(['confirmed', 'completed']);

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const { start: dayStart, end: dayEnd } = studioDayBounds(now);

  const monthStart = new Date(dayStart);
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayBookings, monthBookings, weekBookings] = await Promise.all([
    listBookings(dayStart, dayEnd),
    listBookings(monthStart, monthEnd),
    listBookings(now, weekEnd),
  ]);

  const billableMonth = monthBookings.filter((booking) => BILLABLE_STATUSES.has(booking.status));

  const upcoming = todayBookings
    .filter(
      (booking) =>
        new Date(booking.startsAt).getTime() >= now.getTime() &&
        BILLABLE_STATUSES.has(booking.status),
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const newBookings = [...monthBookings, ...weekBookings]
    .filter((booking) => new Date(booking.createdAt).getTime() >= dayAgo.getTime())
    .filter(
      (booking, index, all) => all.findIndex((item) => item.id === booking.id) === index,
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Approximation lisible : minutes réservées rapportées à une amplitude
  // moyenne de 8 h par jour ouvré sur les 7 prochains jours.
  const bookedMinutes = weekBookings
    .filter((booking) => BILLABLE_STATUSES.has(booking.status))
    .reduce((total, booking) => total + booking.durationMinutes, 0);
  const openMinutes = 6 * 8 * 60;
  const occupancyRate = openMinutes === 0 ? 0 : Math.min(1, bookedMinutes / openMinutes);

  const db = getAdminClient();
  let activeGiftCards = 0;
  let activeGiftCardBalanceCents = 0;

  if (db) {
    const { data } = await db
      .from('gift_cards')
      .select('balance_cents')
      .eq('status', 'active')
      .gt('expires_at', now.toISOString());
    activeGiftCards = data?.length ?? 0;
    activeGiftCardBalanceCents = (data ?? []).reduce((sum, row) => sum + row.balance_cents, 0);
  }

  return {
    todayBookings,
    nextBooking: upcoming[0] ?? null,
    monthRevenueCents: billableMonth.reduce((sum, booking) => sum + booking.totalCents, 0),
    monthBookingCount: billableMonth.length,
    newBookings: newBookings.slice(0, 8),
    occupancyRate,
    activeGiftCards,
    activeGiftCardBalanceCents,
  };
}

export interface CustomerSummary extends Customer {
  bookingCount: number;
  lastBookingAt: string | null;
  totalSpentCents: Cents;
}

/** Fiches clients agrégées. Ne jamais exporter ces données hors du studio. */
export async function listCustomers(limit = 100): Promise<CustomerSummary[]> {
  const db = getAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('customers')
    .select('*, bookings(starts_at, total_cents, status)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[admin] clients illisibles', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const bookings = (row.bookings ?? []) as Array<{
      starts_at: string;
      total_cents: number;
      status: string;
    }>;
    const honoured = bookings.filter((booking) => BILLABLE_STATUSES.has(booking.status));
    const last = honoured
      .map((booking) => booking.starts_at)
      .sort()
      .at(-1);

    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      marketingConsent: row.marketing_consent,
      createdAt: row.created_at,
      bookingCount: honoured.length,
      lastBookingAt: last ?? null,
      totalSpentCents: honoured.reduce((sum, booking) => sum + booking.total_cents, 0),
    };
  });
}

export async function listPromotions(): Promise<Promotion[]> {
  const db = getAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] promotions illisibles', error.message);
    return [];
  }
  return (data ?? []).map(toPromotion);
}

export async function listGiftCards(): Promise<GiftCard[]> {
  const db = getAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] cartes cadeaux illisibles', error.message);
    return [];
  }
  return (data ?? []).map(toGiftCard);
}

export async function listAllReviews(): Promise<Review[]> {
  const db = getAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] avis illisibles', error.message);
    return [];
  }
  return (data ?? []).map(toReview);
}
