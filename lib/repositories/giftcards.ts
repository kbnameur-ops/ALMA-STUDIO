import 'server-only';

import { getAdminClient } from '@/lib/supabase/server';
import { hasServiceRole } from '@/lib/supabase/env';
import { giftCardCode } from '@/lib/booking/reference';
import type { Cents, GiftCard } from '@/types';
import { toGiftCard } from './mappers';

/** Validité par défaut d'une carte cadeau (mois). */
export const GIFT_CARD_VALIDITY_MONTHS = 12;

export async function findGiftCardByCode(code: string): Promise<GiftCard | null> {
  if (!hasServiceRole()) return null;
  const db = getAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from('gift_cards')
    .select('*')
    .ilike('code', code.trim())
    .maybeSingle();

  if (error) {
    console.error('[gift-cards] lecture impossible', error.message);
    return null;
  }
  return data ? toGiftCard(data) : null;
}

export interface CreateGiftCardInput {
  amountCents: Cents;
  serviceLabel: string | null;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string | null;
  message: string | null;
}

/**
 * Émet une carte cadeau. Appelée **après** confirmation du paiement par le
 * webhook Stripe, jamais depuis le navigateur.
 */
export async function createGiftCard(input: CreateGiftCardInput): Promise<GiftCard | null> {
  const db = getAdminClient();
  if (!db) return null;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + GIFT_CARD_VALIDITY_MONTHS);

  const { data, error } = await db
    .from('gift_cards')
    .insert({
      code: giftCardCode(),
      initial_amount_cents: input.amountCents,
      balance_cents: input.amountCents,
      status: 'active',
      service_label: input.serviceLabel,
      purchaser_name: input.purchaserName,
      purchaser_email: input.purchaserEmail.toLowerCase(),
      recipient_name: input.recipientName,
      recipient_email: input.recipientEmail?.toLowerCase() ?? null,
      message: input.message,
      issued_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    console.error('[gift-cards] émission impossible', error.message);
    return null;
  }
  return toGiftCard(data);
}

/** Débite la carte cadeau pour une réservation payée. */
export async function redeemGiftCard(
  code: string,
  amountCents: Cents,
  bookingId: string,
): Promise<boolean> {
  const db = getAdminClient();
  if (!db) return false;

  const { error } = await db.rpc('redeem_gift_card', {
    p_code: code,
    p_amount_cents: amountCents,
    p_booking_id: bookingId,
  });

  if (error) {
    console.error('[gift-cards] débit impossible', error.message);
    return false;
  }
  return true;
}
