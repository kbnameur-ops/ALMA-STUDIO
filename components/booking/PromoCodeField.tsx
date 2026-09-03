'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Field';
import { formatPrice } from '@/lib/utils/format';
import type { AppliedDiscount } from './state';

interface PromoCodeFieldProps {
  serviceId: string;
  serviceDurationId: string;
  applied: AppliedDiscount | null;
  onApply: (discount: AppliedDiscount | null) => void;
}

/**
 * Saisie d'un code promotionnel ou d'une carte cadeau.
 * La validité et le montant sont décidés par le serveur ; l'affichage
 * ci-dessous n'est qu'un aperçu.
 */
export function PromoCodeField({
  serviceId,
  serviceDurationId,
  applied,
  onApply,
}: PromoCodeFieldProps) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/promotions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, serviceId, serviceDurationId }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Code non valable.',
        );
        return;
      }

      const result = payload as AppliedDiscount;
      onApply(result);
      setCode('');
    } catch {
      setError('Vérification impossible pour le moment.');
    } finally {
      setChecking(false);
    }
  };

  if (applied) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sage/30 bg-sage/6 px-4 py-3">
        <p className="font-body text-sm text-sage">
          {applied.label} appliqué · − {formatPrice(applied.discountCents)}
        </p>
        <button
          type="button"
          onClick={() => onApply(null)}
          className="font-body text-xs text-ivory-55 underline underline-offset-2 hover:text-ivory"
        >
          Retirer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="Code promo ou carte cadeau"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ALMA-XXXX-XXXX"
            autoComplete="off"
            maxLength={40}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={submit}
          disabled={checking || code.trim().length === 0}
          className="mb-0.5"
        >
          {checking ? '…' : 'Appliquer'}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 font-body text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
