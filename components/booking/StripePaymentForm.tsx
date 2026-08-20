'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { getStripeClient } from '@/lib/stripe/client';
import { stripeAppearance } from '@/lib/stripe/appearance';
import { formatPrice } from '@/lib/utils/format';

interface StripePaymentFormProps {
  clientSecret: string;
  amountCents: number;
  /** URL de retour après authentification 3-D Secure. */
  returnUrl: string;
}

function PaymentFields({ amountCents, returnUrl }: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    // `confirmPayment` redirige vers `returnUrl` en cas de succès ; la
    // réservation n'est confirmée qu'une fois le webhook reçu.
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (result.error) {
      setError(result.error.message ?? 'Le paiement n’a pas abouti. Merci de réessayer.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <p role="alert" className="font-body text-sm text-terracotta">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={!stripe || submitting}>
        {submitting ? 'Paiement en cours…' : `Payer ${formatPrice(amountCents)}`}
      </Button>

      <p className="text-center font-body text-xs text-espresso-55">
        Paiement sécurisé par Stripe. Vos coordonnées bancaires ne transitent jamais par nos
        serveurs.
      </p>
    </form>
  );
}

/** Champs de paiement Stripe, habillés aux couleurs du studio. */
export function StripePaymentForm({ clientSecret, amountCents, returnUrl }: StripePaymentFormProps) {
  return (
    <Elements
      stripe={getStripeClient()}
      options={{ clientSecret, appearance: stripeAppearance, locale: 'fr' }}
    >
      <PaymentFields amountCents={amountCents} returnUrl={returnUrl} />
    </Elements>
  );
}
