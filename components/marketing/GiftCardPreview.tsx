import { brand } from '@/config/brand';
import { formatPrice } from '@/lib/utils/format';

interface GiftCardPreviewProps {
  amountCents: number | null;
  serviceLabel: string | null;
  recipientName: string;
  purchaserName: string;
  message: string;
}

/**
 * Aperçu de la carte cadeau, repris à l'identique dans l'email envoyé
 * au bénéficiaire. Rendu en HTML plutôt qu'en image : net sur tout écran,
 * lisible par les lecteurs d'écran, et aucun poids supplémentaire.
 */
export function GiftCardPreview({
  amountCents,
  serviceLabel,
  recipientName,
  purchaserName,
  message,
}: GiftCardPreviewProps) {
  return (
    <figure className="overflow-hidden rounded-lg bg-espresso p-8 text-sand shadow-lifted sm:p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-heading text-xl font-light tracking-[0.24em] text-ivory">
            {brand.nameParts.primary}
          </p>
          <p className="mt-1 font-body text-[0.55rem] tracking-[0.5em] text-champagne">
            {brand.nameParts.secondary}
          </p>
        </div>
        <svg
          viewBox="0 0 64 64"
          className="h-10 w-10 shrink-0"
          aria-hidden
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M12 34a20 20 0 0 1 40 0" stroke="var(--color-champagne)" />
          <path
            d="M8 44c5.5 0 5.5 5 11 5s5.5-5 11-5 5.5 5 11 5 5.5-5 11-5"
            stroke="var(--color-terracotta)"
          />
        </svg>
      </div>

      <p className="mt-10 font-body text-[0.65rem] uppercase tracking-[0.24em] text-champagne">
        Carte cadeau
      </p>
      <p className="mt-2 font-heading text-4xl font-light text-ivory">
        {serviceLabel ?? (amountCents ? formatPrice(amountCents) : null)}
        {!serviceLabel && !amountCents && (
          <span className="text-2xl text-sand/45">Montant à choisir</span>
        )}
      </p>

      <figcaption className="mt-8 space-y-1 font-body text-sm text-sand/75">
        <p>
          Pour <span className="text-ivory">{recipientName || '[BÉNÉFICIAIRE]'}</span>
        </p>
        <p>
          De la part de <span className="text-ivory">{purchaserName || '[VOTRE NOM]'}</span>
        </p>
      </figcaption>

      {message && (
        <p className="mt-6 border-t border-sand/15 pt-6 font-heading text-lg font-light leading-snug text-ivory">
          « {message} »
        </p>
      )}

      <p className="mt-8 font-body text-[0.65rem] tracking-[0.14em] text-sand/45">
        Valable 12 mois · {brand.signature}
      </p>
    </figure>
  );
}
