import type { NextRequest } from 'next/server';
import { site } from '@/config/site';
import { computePrice } from '@/lib/booking/pricing';
import { isSlotAvailable, todayInStudio } from '@/lib/booking/availability';
import { getBusinessHours, getBusyIntervals } from '@/lib/repositories/schedule';
import { getBookingRules } from '@/lib/repositories/settings';
import { getServices } from '@/lib/repositories/services';
import { findZoneByPostalCode } from '@/lib/repositories/zones';
import { findPromotionByCode } from '@/lib/repositories/promotions';
import { findGiftCardByCode } from '@/lib/repositories/giftcards';
import { recordConsents } from '@/lib/repositories/consents';
import {
  BookingError,
  confirmBookingPaid,
  createBooking,
  getBookingDetails,
} from '@/lib/repositories/bookings';
import { notifyBookingConfirmed, notifyBookingRequested } from '@/lib/notifications';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { createBookingSchema } from '@/lib/validation/booking';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';
import { toStudioDateKey } from '@/lib/utils/format';

/**
 * Création d'une réservation.
 *
 * Déroulé strictement serveur :
 *  1. validation de la saisie ;
 *  2. relecture en base de la prestation, de la durée et de la zone ;
 *  3. vérification que le créneau est encore proposable ;
 *  4. calcul du prix — le montant envoyé par le navigateur est ignoré ;
 *  5. création transactionnelle avec retenue du créneau ;
 *  6. selon `site.onlinePaymentEnabled`, préparation du paiement Stripe ou
 *     envoi de la demande au studio.
 *
 * Dans les deux cas la réservation reste `pending` à l'issue de cet appel.
 * Avec paiement, elle passe `confirmed` à réception du webhook Stripe : le
 * frontend ne peut pas décréter qu'un paiement a eu lieu. Sans paiement,
 * elle attend la confirmation du studio depuis le back-office — une
 * demande envoyée n'est pas une réservation acquise, et rien dans le
 * parcours ne laisse croire le contraire.
 */
export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  SLOT_TAKEN: 'Ce créneau vient d’être réservé. Merci d’en choisir un autre.',
  SERVICE_UNAVAILABLE: 'Cette prestation n’est plus disponible.',
  DURATION_UNAVAILABLE: 'Cette durée n’est plus disponible.',
  HOME_SERVICE_UNAVAILABLE: 'Cette prestation n’est pas proposée à domicile.',
  ZONE_UNAVAILABLE: 'Nous ne desservons pas encore cette adresse.',
  BACKEND_UNAVAILABLE:
    'La réservation en ligne n’est pas disponible pour le moment. Merci de nous contacter directement.',
};

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'booking'), 8, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path && !fields[path]) fields[path] = issue.message;
    }
    return jsonError('Merci de vérifier les informations saisies.', 400, {
      code: 'VALIDATION_FAILED',
      fields,
    });
  }

  const input = parsed.data;

  const services = await getServices();
  const service = services.find((item) => item.id === input.serviceId);
  const duration = service?.durations.find((item) => item.id === input.serviceDurationId);
  if (!service || !duration) {
    return jsonError(messages.SERVICE_UNAVAILABLE!, 404, { code: 'SERVICE_UNAVAILABLE' });
  }

  // ---------------------------------------------------------------- lieu
  let travelFeeCents = 0;
  let travelMinutes = 0;
  let zoneId: string | null = null;

  if (input.locationKind === 'home') {
    if (!site.homeServiceEnabled || !service.homeServiceAvailable) {
      return jsonError(messages.HOME_SERVICE_UNAVAILABLE!, 400, {
        code: 'HOME_SERVICE_UNAVAILABLE',
      });
    }
    const zone = input.address ? await findZoneByPostalCode(input.address.postalCode) : null;
    if (!zone) {
      return jsonError(messages.ZONE_UNAVAILABLE!, 400, { code: 'ZONE_UNAVAILABLE' });
    }
    zoneId = zone.id;
    travelFeeCents = zone.travelFeeCents;
    travelMinutes = zone.travelMinutes;
  }

  // -------------------------------------------------------- disponibilité
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return jsonError('Créneau invalide.', 400, { code: 'INVALID_SLOT' });
  }

  const rules = await getBookingRules();
  const dateKey = toStudioDateKey(startsAt.toISOString());
  const [businessHours, busy] = await Promise.all([
    getBusinessHours(),
    getBusyIntervals(
      new Date(startsAt.getTime() - 24 * 60 * 60 * 1000),
      new Date(startsAt.getTime() + 24 * 60 * 60 * 1000),
    ),
  ]);

  const available = isSlotAvailable(startsAt, {
    date: dateKey,
    timezone: site.timezone,
    businessHours,
    blocked: busy,
    bookings: [],
    durationMinutes: duration.minutes,
    travelMinutes,
    rules,
    now: new Date(),
  });

  if (!available) {
    return jsonError(messages.SLOT_TAKEN!, 409, { code: 'SLOT_TAKEN' });
  }

  // ------------------------------------------------------------- tarif
  const [promotion, giftCard] = await Promise.all([
    input.promotionCode ? findPromotionByCode(input.promotionCode) : Promise.resolve(null),
    input.giftCardCode ? findGiftCardByCode(input.giftCardCode) : Promise.resolve(null),
  ]);

  const price = computePrice({
    servicePriceCents: duration.priceCents,
    travelFeeCents,
    serviceId: service.id,
    promotion,
    giftCard,
  });

  // -------------------------------------------------------- réservation
  let booking;
  try {
    booking = await createBooking({
      serviceId: service.id,
      serviceDurationId: duration.id,
      locationKind: input.locationKind,
      locationId: zoneId,
      address: input.address
        ? {
            line1: input.address.line1,
            line2: input.address.line2 ?? null,
            postalCode: input.address.postalCode,
            city: input.address.city,
          }
        : null,
      startsAt: startsAt.toISOString(),
      prepMinutes: rules.prepMinutes,
      bufferMinutes: rules.bufferMinutes,
      discountCents: price.discountCents,
      promotionCode: price.promotionCode,
      giftCardCode: price.giftCardCode,
      customerNote: input.customer.note ?? null,
      // Sans paiement, la retenue doit survivre au temps de réponse du
      // studio ; avec paiement, elle borne le passage en caisse.
      holdMinutes: site.onlinePaymentEnabled
        ? rules.holdMinutes
        : site.requestHoldHours * 60,
      customer: {
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
        phone: input.customer.phone,
        marketingConsent: input.customer.marketingConsent,
      },
    });
  } catch (error) {
    if (error instanceof BookingError) {
      const status = error.code === 'SLOT_TAKEN' ? 409 : error.code === 'BACKEND_UNAVAILABLE' ? 503 : 400;
      return jsonError(messages[error.code] ?? 'Réservation impossible.', status, {
        code: error.code,
      });
    }
    console.error('[bookings] création inattendue en échec', error);
    return jsonError('Réservation impossible pour le moment.', 500, { code: 'UNKNOWN' });
  }

  await recordConsents({
    email: input.customer.email,
    acceptedTerms: input.customer.acceptsTerms,
    marketingConsent: input.customer.marketingConsent,
    source: 'reservation',
  });

  // ------------------------------------------------------- sans paiement
  // Le studio confirme lui-même : on n'encaisse rien et on ne confirme
  // rien. La demande part au studio, l'accusé de réception au client.
  if (!site.onlinePaymentEnabled) {
    const details = await getBookingDetails(booking.id);
    if (details) await notifyBookingRequested(details);
    return jsonOk({
      reference: booking.reference,
      manageToken: booking.manageToken,
      totalCents: booking.totalCents,
      requiresPayment: false,
      clientSecret: null,
      mode: 'request' as const,
    });
  }

  // ------------------------------------------------------------ paiement
  // Réservation intégralement couverte par une carte cadeau : aucun
  // paiement n'est nécessaire, on confirme immédiatement.
  if (booking.totalCents === 0) {
    await confirmBookingPaid(booking.id, `giftcard_${booking.reference}`, 0);
    const details = await getBookingDetails(booking.id);
    if (details) await notifyBookingConfirmed(details);
    return jsonOk({
      reference: booking.reference,
      manageToken: booking.manageToken,
      totalCents: 0,
      requiresPayment: false,
      clientSecret: null,
      mode: 'payment' as const,
    });
  }

  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    // La retenue expirera d'elle-même : on ne laisse pas croire au succès.
    return jsonError(
      'Le paiement en ligne n’est pas configuré. Merci de nous contacter pour finaliser votre réservation.',
      503,
      { code: 'PAYMENT_UNAVAILABLE' },
    );
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: booking.totalCents,
      currency: site.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      // Le webhook retrouve la réservation par ces métadonnées.
      metadata: {
        booking_id: booking.id,
        reference: booking.reference,
        service: service.name,
      },
      receipt_email: input.customer.email,
      description: `${site.brandName} — ${service.name} (${duration.minutes} min)`,
    });

    return jsonOk({
      reference: booking.reference,
      manageToken: booking.manageToken,
      totalCents: booking.totalCents,
      requiresPayment: true,
      clientSecret: intent.client_secret,
      mode: 'payment' as const,
    });
  } catch (error) {
    console.error('[bookings] intention de paiement refusée', error);
    return jsonError('Le paiement n’a pas pu être initialisé. Merci de réessayer.', 502, {
      code: 'PAYMENT_INIT_FAILED',
    });
  }
}

/** Date du jour au studio — sert de borne initiale au calendrier client. */
export function GET() {
  return jsonOk({ today: todayInStudio(site.timezone) });
}
