import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Cents } from '@/types';

interface PriceProps {
  cents: Cents;
  /** Préfixe « à partir de » pour les prestations à plusieurs durées. */
  from?: boolean;
  className?: string;
}

/**
 * Affiche un montant. Le montant provient toujours de la base de données :
 * ce composant ne connaît aucun tarif.
 */
export function Price({ cents, from = false, className }: PriceProps) {
  return (
    <span className={cn('font-body tabular-nums', className)}>
      {from && <span className="mr-1 text-xs text-ivory-55">dès</span>}
      {formatPrice(cents)}
    </span>
  );
}
