import type { NextRequest } from 'next/server';
import { site } from '@/config/site';
import { getServices } from '@/lib/repositories/services';
import { recordConsents } from '@/lib/repositories/consents';
import { getStripe } from '@/lib/stripe/server';
import { giftCardPurchaseSchema } from '@/lib/validation/giftcard';
import { clientKey, rateLimit } from '@/lib/utils/rate-limit';
import { jsonError, jsonOk, tooManyRequests } from '@/lib/utils/http';

/**
 * Achat d'une carte cadeau.
 *
 * La carte n'est **pas** émise ici : on prépare seulement le paiement. Le
 * webhook Stripe crée la carte et envoie les emails une fois l'encaissement
 * confirmé — sinon un simple appel à cette route suffirait à générer des
 * cartes gratuites.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, 'gift-card'), 6, 60);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const body: unknown = await request.json().catch(() => null);
  const parsed = giftCardPurchaseSchema.safeParse(body);
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

  // Montant : soit le tarif d'une prestation relu en base, soit un montant
  // libre déjà borné par le schéma. Jamais une valeur brute du navigateur.
  let amountCents: number;
  let serviceLabel: string | null = null;

  if (input.kind === 'service') {
    const services = await getServices();
    const service = services.find((item) =>
      item.durations.some((duration) => duration.id === input.serviceDurationId),
    );
    const duration = service?.durations.find((item) => item.id === input.serviceDurationId);
    if (!service || !duration) {
      return jsonError('Prestation introuvable.', 404, { code: 'SERVICE_UNAVAILABLE' });
    }
    amountCents = duration.priceCents;
    serviceLabel = `${service.name} — ${duration.minutes} min`;
  } else {
    amountCents = input.amountCents ?? 0;
  }

  if (amountCents <= 0) {
    return jsonError('Montant invalide.', 400, { code: 'INVALID_AMOUNT' });
  }

  await recordConsents({
    email: input.purchaserEmail,
    acceptedTerms: input.acceptsTerms,
    marketingConsent: false,
    source: 'carte-cadeau',
  });

  const stripe = getStripe();
  if (!stripe) {
    return jsonError(
      'Le paiement en ligne n’est pas configuré. Merci de nous contacter pour offrir une carte cadeau.',
      503,
      { code: 'PAYMENT_UNAVAILABLE' },
    );
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: site.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: input.purchaserEmail,
      description: `${site.brandName} — carte cadeau`,
      // Le webhook reconstruit la carte à partir de ces métadonnées.
      metadata: {
        kind: 'gift_card',
        service_label: serviceLabel ?? '',
        purchaser_name: input.purchaserName,
        purchaser_email: input.purchaserEmail,
        recipient_name: input.recipientName,
        recipient_email: input.recipientEmail ?? '',
        message: (input.message ?? '').slice(0, 480),
      },
    });

    return jsonOk({ clientSecret: intent.client_secret, amountCents });
  } catch (error) {
    console.error('[gift-cards] intention de paiement refusée', error);
    return jsonError('Le paiement n’a pas pu être initialisé.', 502, {
      code: 'PAYMENT_INIT_FAILED',
    });
  }
}
