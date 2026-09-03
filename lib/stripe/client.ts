'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

/**
 * Chargement paresseux de Stripe.js côté navigateur.
 * Seule la clé publiable est exposée — jamais la clé secrète.
 */
let stripePromise: Promise<Stripe | null> | null = null;

export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePublishableKey) return Promise.resolve(null);
  stripePromise ??= loadStripe(stripePublishableKey);
  return stripePromise;
}
