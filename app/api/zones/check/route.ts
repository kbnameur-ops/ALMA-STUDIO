import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { findZoneByPostalCode } from '@/lib/repositories/zones';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Vérifie qu'une adresse est desservie et renvoie les frais de déplacement.
 * Le montant renvoyé n'est qu'un affichage : il est relu en base au moment
 * de la création de la réservation.
 */
export const dynamic = 'force-dynamic';

const schema = z.object({
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Code postal à 5 chiffres'),
});

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'zone'), 30, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Code postal invalide.', 400, { code: 'INVALID_POSTAL_CODE' });
  }

  const zone = await findZoneByPostalCode(parsed.data.postalCode);
  if (!zone) {
    return jsonError('Nous ne desservons pas encore cette adresse.', 404, {
      code: 'ZONE_UNAVAILABLE',
    });
  }

  return jsonOk({
    zoneId: zone.id,
    zoneName: zone.name,
    travelFeeCents: zone.travelFeeCents,
  });
}
