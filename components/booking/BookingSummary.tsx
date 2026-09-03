'use client';

import { site } from '@/config/site';
import { Price } from '@/components/ui/Price';
import { formatDateTime, formatDuration, formatPrice } from '@/lib/utils/format';
import { previewTotalCents, type BookingState } from './state';

/**
 * Récapitulatif de la réservation.
 * Les montants affichés sont indicatifs : le total facturé est recalculé
 * par le serveur au moment du paiement.
 */
export function BookingSummary({ state, compact = false }: { state: BookingState; compact?: boolean }) {
  const { service, duration, slot } = state;
  if (!service) return null;

  const travel = state.locationKind === 'home' ? state.travelFeeCents : 0;
  const total = previewTotalCents(state);

  return (
    <aside
      aria-label="Récapitulatif de votre réservation"
      className={
        compact
          ? 'rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-5'
          : 'rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-6 sm:p-7'
      }
    >
      <h2 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
        Votre séance
      </h2>

      <p className="mt-4 font-heading text-2xl font-light leading-tight">{service.name}</p>

      <dl className="mt-5 space-y-2.5 font-body text-sm">
        {duration && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ivory-55">Durée</dt>
            <dd>{formatDuration(duration.minutes)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ivory-55">Lieu</dt>
          <dd className="text-right">
            {state.locationKind === 'studio' ? (
              `Au studio · ${site.businessAddress.city}`
            ) : (
              <>
                À domicile
                {state.zoneName && <span className="block text-xs text-ivory-55">{state.zoneName}</span>}
              </>
            )}
          </dd>
        </div>
        {slot && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ivory-55">Date</dt>
            <dd className="text-right">{formatDateTime(slot.startsAt)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 space-y-2.5 border-t border-[color:var(--color-line)] pt-5 font-body text-sm">
        {duration && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-ivory-55">Prestation</span>
            <Price cents={duration.priceCents} />
          </div>
        )}
        {travel > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-ivory-55">Déplacement</span>
            <Price cents={travel} />
          </div>
        )}
        {state.discount && (
          <div className="flex items-baseline justify-between gap-4 text-terracotta">
            <span>{state.discount.label}</span>
            <span className="tabular-nums">− {formatPrice(state.discount.discountCents)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[color:var(--color-line)] pt-5">
        <span className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-ivory-70">
          Total
        </span>
        <Price cents={total} className="font-heading text-2xl" />
      </div>
    </aside>
  );
}
