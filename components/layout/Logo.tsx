import Link from 'next/link';
import { brand } from '@/config/brand';
import { ArchMark } from '@/components/brand/ArchMark';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  /** `light` pour les fonds sombres — soit, désormais, partout. */
  tone?: 'dark' | 'light';
  /** Affiche la signature de marque sous le logotype. */
  withSignature?: boolean;
  /** Masque le monogramme : utile dans les espaces très contraints. */
  markOnly?: boolean;
  className?: string;
}

/**
 * Verrouillage du logo : monogramme en arche + logotype.
 *
 * Le monogramme porte l'identité, le logotype porte le nom. Les deux
 * restent solidaires ; leur alignement optique se fait sur la barre de
 * l'arche et la ligne de base d'ALMA.
 *
 * Le monogramme est désormais un plein, donc lourd : le logotype se pose
 * plus léger et plus espacé pour tenir la balance. Instrument Serif étant
 * plus large que le Cormorant qui le précédait, l'interlettrage d'ALMA a
 * été resserré — le même chiffre aurait disloqué le mot.
 */
export function Logo({ tone = 'dark', withSignature = false, markOnly = false, className }: LogoProps) {
  const secondary = tone === 'light' ? 'text-champagne' : 'text-champagne';

  return (
    <Link
      href="/"
      aria-label={`${brand.name} — accueil`}
      className={cn('group inline-flex items-center gap-3 sm:gap-3.5', className)}
    >
      <ArchMark
        size={32}
        tone={tone}
        className="transition-transform duration-500 ease-[var(--ease-alma)] group-hover:-translate-y-0.5"
      />

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-heading text-[1.32rem] tracking-[0.15em] text-ivory transition-opacity duration-300 group-hover:opacity-75 sm:text-[1.45rem]',
            )}
          >
            {brand.nameParts.primary}
          </span>
          <span className={cn('mt-1.5 font-body text-[0.5rem] font-medium tracking-[0.5em] sm:text-[0.53rem]', secondary)}>
            {brand.nameParts.secondary}
          </span>
          {withSignature && (
            <span
              className={cn(
                'mt-3 font-body text-[0.7rem] tracking-[0.1em]',
                'text-ivory-55',
              )}
            >
              {brand.signature}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
