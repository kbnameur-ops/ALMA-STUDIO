import Link from 'next/link';
import Image from 'next/image';
import { brand } from '@/config/brand';
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
 * restent solidaires ; leur alignement optique se fait sur la base de
 * l'arche et la ligne de base d'ALHAMBRA.
 *
 * Le monogramme fourni par le studio est une image détaillée (mandala,
 * mains, silhouette gravés), pas un tracé vectoriel recolorable comme
 * l'ancien monogramme abstrait — il ne prend donc plus de prop `tone` et
 * s'affiche identique partout, le site étant de toute façon sombre de
 * bout en bout. En dessous d'une quarantaine de pixels il perd sa finesse
 * de trait, mais reste lisible comme un médaillon doré.
 */
export function Logo({ tone = 'dark', withSignature = false, markOnly = false, className }: LogoProps) {
  const secondary = tone === 'light' ? 'text-champagne' : 'text-champagne';

  return (
    <Link
      href="/"
      aria-label={`${brand.name} — accueil`}
      className={cn('group inline-flex items-center gap-3 sm:gap-3.5', className)}
    >
      <Image
        src={brand.logo.mark}
        alt=""
        width={44}
        height={37}
        className="h-9 w-auto shrink-0 transition-transform duration-500 ease-[var(--ease-alma)] group-hover:-translate-y-0.5 sm:h-11"
      />

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-heading text-[1.15rem] tracking-[0.1em] text-ivory transition-opacity duration-300 group-hover:opacity-75 sm:text-[1.28rem]',
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
