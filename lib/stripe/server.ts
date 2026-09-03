import 'server-only';

import Stripe from 'stripe';
import { brand } from '@/config/brand';

/**
 * Client Stripe côté serveur.
 *
 * La clé secrète n'existe que dans l'environnement serveur. Quand elle est
 * absente (aperçu local, CI), `getStripe()` renvoie `null` et l'appelant
 * signale explicitement que le paiement n'est pas configuré — jamais un
 * faux succès.
 */
let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached ??= new Stripe(key, {
    // Version d'API épinglée : une mise à jour Stripe ne peut pas modifier
    // le comportement du paiement sans changement de code explicite.
    apiVersion: '2026-07-29.dahlia',
    appInfo: { name: brand.name, version: '1.0.0' },
    typescript: true,
  });
  return cached;
}

export function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
