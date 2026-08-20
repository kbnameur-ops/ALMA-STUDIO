import 'server-only';

import { getAdminClient } from '@/lib/supabase/server';
import type { Booking, BookingDetails, BookingStatus, Cents } from '@/types';
import type { BookingRow, Json } from '@/types/database';
import { toBooking } from './mappers';

/** Erreurs métier remontées par `create_booking_atomic`. */
export type BookingErrorCode =
  | 'SLOT_TAKEN'
  | 'SERVICE_UNAVAILABLE'
  | 'DURATION_UNAVAILABLE'
  | 'LOCATION_INVALID'
  | 'HOME_SERVICE_UNAVAILABLE'
  | 'ZONE_UNAVAILABLE'
  | 'BACKEND_UNAVAILABLE'
  | 'UNKNOWN';

export class BookingError extends Error {
  constructor(readonly code: BookingErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'BookingError';
  }
}

const KNOWN_CODES: BookingErrorCode[] = [
  'SLOT_TAKEN',
  'SERVICE_UNAVAILABLE',
  'DURATION_UNAVAILABLE',
  'LOCATION_INVALID',
  'HOME_SERVICE_UNAVAILABLE',
  'ZONE_UNAVAILABLE',
];

function toBookingError(message: string): BookingError {
  const match = KNOWN_CODES.find((code) => message.includes(code));
  return new BookingError(match ?? 'UNKNOWN', message);
}

export interface CreateBookingPayload {
  serviceId: string;
  serviceDurationId: string;
  locationKind: 'studio' | 'home';
  locationId: string | null;
  address: Record<string, string | null> | null;
  startsAt: string;
  prepMinutes: number;
  bufferMinutes: number;
  discountCents: Cents;
  promotionCode: string | null;
  giftCardCode: string | null;
  customerNote: string | null;
  holdMinutes: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    marketingConsent: boolean;
  };
}

/**
 * Crée la réservation en une seule transaction serveur.
 *
 * Le prix n'est pas transmis : la fonction SQL relit les tarifs en base et
 * recalcule le total. Deux réservations simultanées sur le même créneau
 * sont départagées par la contrainte d'exclusion, qui remonte ici sous la
 * forme d'une `BookingError('SLOT_TAKEN')`.
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const db = getAdminClient();
  if (!db) throw new BookingError('BACKEND_UNAVAILABLE', 'Supabase non configuré.');

  const { data, error } = await db.rpc('create_booking_atomic', {
    payload: {
      service_id: payload.serviceId,
      service_duration_id: payload.serviceDurationId,
      location_kind: payload.locationKind,
      location_id: payload.locationId,
      address: payload.address as unknown as Json,
      starts_at: payload.startsAt,
      prep_minutes: payload.prepMinutes,
      buffer_minutes: payload.bufferMinutes,
      discount_cents: payload.discountCents,
      promotion_code: payload.promotionCode,
      gift_card_code: payload.giftCardCode,
      customer_note: payload.customerNote,
      hold_minutes: payload.holdMinutes,
      customer: {
        first_name: payload.customer.firstName,
        last_name: payload.customer.lastName,
        email: payload.customer.email.toLowerCase(),
        phone: payload.customer.phone,
        marketing_consent: payload.customer.marketingConsent,
      },
    } as unknown as Json,
  });

  if (error) throw toBookingError(error.message);
  if (!data || typeof data !== 'object') {
    throw new BookingError('UNKNOWN', 'Réponse inattendue de la base.');
  }
  return toBooking(data as unknown as BookingRow);
}

/** Réservation enrichie, pour la page de confirmation et les emails. */
export async function getBookingDetails(bookingId: string): Promise<BookingDetails | null> {
  const db = getAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from('bookings')
    .select('*, services(id, slug, name), service_durations(minutes), customers(first_name, last_name, email, phone)')
    .eq('id', bookingId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[bookings] lecture impossible', error.message);
    return null;
  }
  return hydrate(data);
}

/** Accès client à sa réservation : référence + jeton secret reçu par email. */
export async function getBookingByReference(
  reference: string,
  manageToken: string,
): Promise<BookingDetails | null> {
  const db = getAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from('bookings')
    .select('*, services(id, slug, name), service_durations(minutes), customers(first_name, last_name, email, phone)')
    .eq('reference', reference.toUpperCase())
    .eq('manage_token', manageToken)
    .maybeSingle();

  if (error || !data) return null;
  return hydrate(data);
}

interface JoinedBooking extends BookingRow {
  services: { id: string; slug: string; name: string } | null;
  service_durations: { minutes: number } | null;
  customers: { first_name: string; last_name: string; email: string; phone: string } | null;
}

function hydrate(row: unknown): BookingDetails {
  const joined = row as JoinedBooking;
  return {
    ...toBooking(joined),
    service: joined.services ?? { id: joined.service_id, slug: '', name: 'Prestation' },
    durationMinutes: joined.service_durations?.minutes ?? 0,
    customer: {
      firstName: joined.customers?.first_name ?? '',
      lastName: joined.customers?.last_name ?? '',
      email: joined.customers?.email ?? '',
      phone: joined.customers?.phone ?? '',
    },
  };
}

/** Passe la réservation en `confirmed` après validation du paiement. */
export async function confirmBookingPaid(
  bookingId: string,
  providerPaymentId: string,
  amountCents: Cents,
): Promise<boolean> {
  const db = getAdminClient();
  if (!db) return false;

  const { error } = await db.rpc('confirm_booking_paid', {
    p_booking_id: bookingId,
    p_provider_payment_id: providerPaymentId,
    p_amount_cents: amountCents,
  });

  if (error) {
    console.error('[bookings] confirmation impossible', error.message);
    return false;
  }
  return true;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<boolean> {
  const db = getAdminClient();
  if (!db) return false;

  const { error } = await db
    .from('bookings')
    .update({
      status,
      ...(status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
    })
    .eq('id', bookingId);

  if (error) {
    console.error('[bookings] mise à jour impossible', error.message);
    return false;
  }
  return true;
}

/** Marque une réservation payée puis annulée comme remboursée. */
export async function markBookingRefunded(bookingId: string, refundedCents: Cents): Promise<void> {
  const db = getAdminClient();
  if (!db) return;

  await db
    .from('bookings')
    .update({ status: 'refunded', payment_status: 'refunded' })
    .eq('id', bookingId);
  await db
    .from('payments')
    .update({ status: 'refunded', refunded_cents: refundedCents })
    .eq('booking_id', bookingId);
}

/** Réservations d'une fenêtre temporelle, pour le back-office. */
export async function listBookings(from: Date, to: Date): Promise<BookingDetails[]> {
  const db = getAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('bookings')
    .select('*, services(id, slug, name), service_durations(minutes), customers(first_name, last_name, email, phone)')
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[bookings] liste impossible', error.message);
    return [];
  }
  return (data ?? []).map(hydrate);
}

/** Réservations confirmées à venir dans une fenêtre, pour les rappels. */
export async function listBookingsForReminder(from: Date, to: Date): Promise<BookingDetails[]> {
  const bookings = await listBookings(from, to);
  return bookings.filter((booking) => booking.status === 'confirmed');
}
