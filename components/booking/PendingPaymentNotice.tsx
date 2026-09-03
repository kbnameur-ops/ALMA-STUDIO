'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Paiement encaissé côté Stripe mais webhook pas encore traité.
 *
 * On ne prétend jamais que la réservation est confirmée : la page
 * s'actualise jusqu'à ce que le serveur l'atteste. Sans ce garde-fou, un
 * simple retour de redirection suffirait à afficher un faux succès.
 */
export function PendingPaymentNotice() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 3000);
    // Au-delà de 30 secondes, on cesse d'interroger : l'email fera foi.
    const stop = window.setTimeout(() => window.clearInterval(timer), 30_000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [router]);

  return (
    <p
      role="status"
      className="rounded-lg border border-champagne/50 bg-champagne/10 p-5 font-body text-sm leading-relaxed text-ivory-70"
    >
      Votre paiement a été transmis. Nous attendons sa validation définitive par notre
      prestataire — cette page se met à jour automatiquement, et votre email de confirmation part
      dès que c’est fait.
    </p>
  );
}
