'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, LinkButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { site } from '@/config/site';

interface ManageBookingProps {
  reference: string;
  token: string;
  /** Faux passé le délai d'annulation configuré. */
  canCancel: boolean;
  cancellationHours: number;
}

/** Actions client sur une réservation existante : annuler ou reprogrammer. */
export function ManageBooking({
  reference,
  token,
  canCancel,
  cancellationHours,
}: ManageBookingProps) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const cancel = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, token }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        toast.push(
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Annulation impossible.',
          'error',
        );
        return;
      }

      const result = payload as { refunded: boolean };
      toast.push(
        result.refunded
          ? 'Réservation annulée. Le remboursement est en cours.'
          : 'Réservation annulée.',
        'success',
      );
      setConfirming(false);
      router.refresh();
    } catch {
      toast.push('Annulation impossible pour le moment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Reprogrammer = annuler puis réserver : un seul chemin d'écriture,
            donc aucun risque de double occupation du planning. */}
        <LinkButton href="/reservation" variant="secondary">
          Choisir une autre date
        </LinkButton>
        <Button
          type="button"
          variant="danger"
          onClick={() => setConfirming(true)}
          disabled={!canCancel}
        >
          Annuler ma réservation
        </Button>
      </div>

      {!canCancel && (
        <p className="mt-3 font-body text-xs text-espresso-55">
          L’annulation en ligne n’est plus possible à moins de {cancellationHours} heures du
          rendez-vous. Appelez-nous au{' '}
          <a
            href={`tel:${site.contactPhoneE164}`}
            className="underline decoration-champagne underline-offset-4"
          >
            {site.contactPhone}
          </a>
          , nous ferons au mieux.
        </p>
      )}

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Annuler la réservation ?">
        <p className="font-body text-sm leading-relaxed text-espresso-70">
          Le créneau sera immédiatement libéré. Si la séance a été payée, le remboursement est lancé
          automatiquement sur votre moyen de paiement d’origine.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button type="button" variant="danger" onClick={() => void cancel()} disabled={submitting}>
            {submitting ? 'Annulation…' : 'Confirmer l’annulation'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
            Garder ma réservation
          </Button>
        </div>
      </Modal>
    </>
  );
}
