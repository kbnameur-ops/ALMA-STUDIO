import Image from 'next/image';
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
    <figure className="alma-arch-flat overflow-hidden bg-ink-deep p-8 pt-12 text-ivory shadow-lifted sm:p-10 sm:pt-14">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-lg font-light tracking-[0.12em] text-ivory sm:text-xl">
            {brand.nameParts.primary}
          </p>
          <p className="mt-1 font-body text-[0.55rem] tracking-[0.5em] text-champagne">
            {brand.nameParts.secondary}
          </p>
        </div>
        <Image src={brand.logo.mark} alt="" width={44} height={37} className="h-9 w-auto shrink-0" />
      </div>

      <p className="mt-10 font-body text-[0.65rem] uppercase tracking-[0.24em] text-champagne">
        Carte cadeau
      </p>
      <p className="mt-2 font-heading text-4xl font-light text-ivory">
        {serviceLabel ?? (amountCents ? formatPrice(amountCents) : null)}
        {!serviceLabel && !amountCents && (
          <span className="text-2xl text-ivory/45">Montant à choisir</span>
        )}
      </p>

      <figcaption className="mt-8 space-y-1 font-body text-sm text-ivory/75">
        <p>
          Pour <span className="text-ivory">{recipientName || '[BÉNÉFICIAIRE]'}</span>
        </p>
        <p>
          De la part de <span className="text-ivory">{purchaserName || '[VOTRE NOM]'}</span>
        </p>
      </figcaption>

      {message && (
        <p className="mt-6 border-t border-ivory/15 pt-6 font-heading text-lg font-light leading-snug text-ivory">
          « {message} »
        </p>
      )}

      <p className="mt-8 font-body text-[0.65rem] tracking-[0.14em] text-ivory-55">
        Valable 12 mois · {brand.signature}
      </p>
    </figure>
  );
}
