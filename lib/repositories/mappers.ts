/**
 * Conversion `snake_case` base → `camelCase` domaine.
 * Centralisée ici pour que les composants ne voient jamais la forme SQL.
 */

import type {
  BookingAddress,
  BusinessHour,
  GiftCard,
  HomeZone,
  Promotion,
  Review,
  Service,
  ServiceDuration,
  Booking,
} from '@/types';
import type {
  BookingRow,
  BusinessHourRow,
  GiftCardRow,
  LocationRow,
  PromotionRow,
  ReviewRow,
  ServiceDurationRow,
  ServiceRow,
} from '@/types/database';

export function toServiceDuration(row: ServiceDurationRow): ServiceDuration {
  return {
    id: row.id,
    serviceId: row.service_id,
    minutes: row.minutes,
    priceCents: row.price_cents,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function toService(
  row: ServiceRow,
  durations: ServiceDurationRow[] = [],
): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    intensity: row.intensity,
    recommendedFor: row.recommended_for,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    homeServiceAvailable: row.home_service_available,
    isActive: row.is_active,
    isSignature: row.is_signature,
    sortOrder: row.sort_order,
    durations: durations
      .filter((duration) => duration.is_active)
      .map(toServiceDuration)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.minutes - b.minutes),
  };
}

export function toHomeZone(row: LocationRow): HomeZone {
  return {
    id: row.id,
    name: row.name,
    postalCodes: row.postal_codes,
    travelFeeCents: row.travel_fee_cents,
    travelMinutes: row.travel_minutes,
    isActive: row.is_active,
  };
}

export function toBusinessHour(row: BusinessHourRow): BusinessHour {
  return {
    weekday: row.weekday,
    // Postgres renvoie `HH:mm:ss` : on ne garde que heures et minutes.
    opensAt: row.opens_at.slice(0, 5),
    closesAt: row.closes_at.slice(0, 5),
    isOpen: row.is_open,
  };
}

export function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    quote: row.quote,
    serviceLabel: row.service_label,
    isPublished: row.is_published,
    isSample: row.is_sample,
    createdAt: row.created_at,
  };
}

export function toPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    code: row.code,
    kind: row.kind,
    value: row.value,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    maxRedemptions: row.max_redemptions,
    timesRedeemed: row.times_redeemed,
    serviceIds: row.service_ids,
    isActive: row.is_active,
  };
}

export function toGiftCard(row: GiftCardRow): GiftCard {
  return {
    id: row.id,
    code: row.code,
    initialAmountCents: row.initial_amount_cents,
    balanceCents: row.balance_cents,
    status: row.status,
    serviceLabel: row.service_label,
    purchaserName: row.purchaser_name,
    purchaserEmail: row.purchaser_email,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    message: row.message,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at,
  };
}

/** L'adresse est stockée en `jsonb` : on la valide avant de la typer. */
export function toBookingAddress(value: unknown): BookingAddress | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const line1 = typeof record.line1 === 'string' ? record.line1 : null;
  const postalCode = typeof record.postalCode === 'string' ? record.postalCode : null;
  const city = typeof record.city === 'string' ? record.city : null;
  if (!line1 || !postalCode || !city) return null;
  return {
    line1,
    line2: typeof record.line2 === 'string' ? record.line2 : null,
    postalCode,
    city,
  };
}

export function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id,
    serviceId: row.service_id,
    serviceDurationId: row.service_duration_id,
    locationKind: row.location_kind,
    address: toBookingAddress(row.address),
    homeZoneId: row.location_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    paymentStatus: row.payment_status,
    servicePriceCents: row.service_price_cents,
    travelFeeCents: row.travel_fee_cents,
    discountCents: row.discount_cents,
    totalCents: row.total_cents,
    promotionCode: row.promotion_code,
    giftCardCode: row.gift_card_code,
    customerNote: row.customer_note,
    manageToken: row.manage_token,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
  };
}
