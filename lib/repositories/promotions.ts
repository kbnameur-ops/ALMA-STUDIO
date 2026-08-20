import 'server-only';

import { getAdminClient } from '@/lib/supabase/server';
import { hasServiceRole } from '@/lib/supabase/env';
import type { Promotion } from '@/types';
import { toPromotion } from './mappers';

/**
 * Lecture d'un code promotionnel.
 * Réservée au serveur : la table n'est pas lisible publiquement, pour ne
 * pas exposer la liste des codes actifs.
 */
export async function findPromotionByCode(code: string): Promise<Promotion | null> {
  if (!hasServiceRole()) return null;
  const db = getAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from('promotions')
    .select('*')
    .ilike('code', code.trim())
    .maybeSingle();

  if (error) {
    console.error('[promotions] lecture impossible', error.message);
    return null;
  }
  return data ? toPromotion(data) : null;
}

/** Incrémente le compteur d'utilisations après paiement confirmé. */
export async function markPromotionRedeemed(code: string): Promise<void> {
  if (!hasServiceRole()) return;
  const db = getAdminClient();
  if (!db) return;

  const { error } = await db.rpc('redeem_promotion', { p_code: code });
  if (error) console.error('[promotions] compteur non incrémenté', error.message);
}
