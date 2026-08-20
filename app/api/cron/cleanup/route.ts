import type { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { jsonError, jsonOk } from '@/lib/utils/http';

/**
 * Entretien du planning.
 *
 * Libère les retenues de créneau abandonnées en cours de paiement et
 * périme les cartes cadeaux arrivées à échéance. Les retenues sont aussi
 * purgées à chaque tentative de réservation : cette tâche n'est qu'un
 * filet de sécurité pour les périodes sans trafic.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError('Non autorisé.', 401, { code: 'UNAUTHORIZED' });
  }

  const db = getAdminClient();
  if (!db) return jsonError('Base de données indisponible.', 503, { code: 'BACKEND_UNAVAILABLE' });

  const { data: purged, error: purgeError } = await db.rpc('purge_expired_holds');
  if (purgeError) console.error('[cron] purge impossible', purgeError.message);

  const { data: expired, error: expiryError } = await db
    .from('gift_cards')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())
    .select('id');
  if (expiryError) console.error('[cron] péremption impossible', expiryError.message);

  return jsonOk({
    releasedHolds: purged ?? 0,
    expiredGiftCards: expired?.length ?? 0,
  });
}
