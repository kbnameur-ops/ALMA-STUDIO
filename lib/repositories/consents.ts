import 'server-only';

import { getAdminClient } from '@/lib/supabase/server';

/**
 * Traçabilité RGPD des consentements.
 * On enregistre l'acceptation des conditions de réservation et, séparément,
 * le consentement marketing — qui reste facultatif et distinct.
 */
export async function recordConsents(input: {
  email: string;
  acceptedTerms: boolean;
  marketingConsent: boolean;
  source: string;
}): Promise<void> {
  const db = getAdminClient();
  if (!db) return;

  const rows = [
    {
      email: input.email.toLowerCase(),
      kind: 'booking_terms' as const,
      granted: input.acceptedTerms,
      granted_at: new Date().toISOString(),
      source: input.source,
      customer_id: null,
    },
    {
      email: input.email.toLowerCase(),
      kind: 'marketing' as const,
      granted: input.marketingConsent,
      granted_at: new Date().toISOString(),
      source: input.source,
      customer_id: null,
    },
  ];

  const { error } = await db.from('consents').insert(rows);
  if (error) console.error('[consents] enregistrement impossible', error.message);
}
