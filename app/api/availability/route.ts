import type { NextRequest } from 'next/server';
import { getAvailability } from '@/lib/booking/service';
import { getServices } from '@/lib/repositories/services';
import { findZoneByPostalCode } from '@/lib/repositories/zones';
import { availabilityQuerySchema } from '@/lib/validation/booking';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Créneaux disponibles.
 *
 * Les disponibilités sont **calculées côté serveur** : le client ne reçoit
 * que la liste des créneaux réellement réservables, jamais le planning
 * complet ni les motifs d'indisponibilité.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'availability'), 60, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const parsed = availabilityQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return jsonError('Paramètres de recherche invalides.', 400, { code: 'INVALID_QUERY' });
  }

  const { serviceDurationId, from, days, locationKind, postalCode } = parsed.data;

  // La durée détermine la longueur du créneau : elle est relue en base,
  // jamais reprise depuis la requête.
  const services = await getServices();
  const service = services.find((item) =>
    item.durations.some((duration) => duration.id === serviceDurationId),
  );
  const duration = service?.durations.find((item) => item.id === serviceDurationId);

  if (!service || !duration) {
    return jsonError('Prestation ou durée introuvable.', 404, { code: 'DURATION_UNAVAILABLE' });
  }

  let travelMinutes = 0;
  if (locationKind === 'home') {
    if (!service.homeServiceAvailable) {
      return jsonError('Cette prestation n’est pas proposée à domicile.', 400, {
        code: 'HOME_SERVICE_UNAVAILABLE',
      });
    }
    if (!postalCode) {
      return jsonError('Code postal requis pour une prestation à domicile.', 400, {
        code: 'POSTAL_CODE_REQUIRED',
      });
    }
    const zone = await findZoneByPostalCode(postalCode);
    if (!zone) {
      return jsonError('Nous ne desservons pas encore cette adresse.', 400, {
        code: 'ZONE_UNAVAILABLE',
      });
    }
    travelMinutes = zone.travelMinutes;
  }

  const availability = await getAvailability({
    from,
    days,
    durationMinutes: duration.minutes,
    travelMinutes,
  });

  return jsonOk(
    { days: availability },
    // Courte mise en cache CDN : les créneaux évoluent en continu.
    { headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' } },
  );
}
