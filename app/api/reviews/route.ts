import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/server';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Dépôt d'un avis par un client.
 *
 * L'avis est enregistré **non publié** : rien n'apparaît sur le site sans
 * validation depuis le back-office. C'est aussi ce qui empêche un tiers
 * de publier du contenu arbitraire.
 */
export const dynamic = 'force-dynamic';

const schema = z.object({
  authorName: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().trim().min(10).max(600),
  reference: z.string().trim().max(40).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'review'), 5, 3600);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Merci de vérifier votre message.', 400, { code: 'VALIDATION_FAILED' });
  }

  const db = getAdminClient();
  if (!db) return jsonError('Envoi impossible pour le moment.', 503, { code: 'BACKEND_UNAVAILABLE' });

  // La prestation est retrouvée depuis la réservation quand la référence
  // est fournie : le client ne choisit pas lui-même le libellé affiché.
  let serviceLabel: string | null = null;
  if (parsed.data.reference) {
    const { data } = await db
      .from('bookings')
      .select('services(name)')
      .eq('reference', parsed.data.reference.toUpperCase())
      .maybeSingle();
    const joined = data as { services?: { name?: string } | null } | null;
    serviceLabel = joined?.services?.name ?? null;
  }

  const { error } = await db.from('reviews').insert({
    author_name: parsed.data.authorName,
    rating: parsed.data.rating,
    quote: parsed.data.quote,
    service_label: serviceLabel,
    is_published: false,
    is_sample: false,
  });

  if (error) {
    console.error('[reviews] enregistrement impossible', error.message);
    return jsonError('Envoi impossible pour le moment.', 500, { code: 'UNKNOWN' });
  }

  return jsonOk({ received: true });
}
