import Link from 'next/link';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  /** `light` pour les fonds sombres (hero, footer espresso). */
  tone?: 'dark' | 'light';
  /** Affiche la signature de marque sous le logotype. */
  withSignature?: boolean;
  className?: string;
}

/**
 * Logotype ALMA STUDIO rendu en texte : net à toutes les tailles, sans
 * requête réseau. Les variantes SVG (`public/logo`) restent disponibles
 * pour les usages externes (emails, OG, impression) et pourront remplacer
 * ce rendu en changeant simplement le contenu de ce composant.
 */
export function Logo({ tone = 'dark', withSignature = false, className }: LogoProps) {
  const primary = tone === 'light' ? 'text-ivory' : 'text-espresso';
  const secondary = tone === 'light' ? 'text-champagne' : 'text-terracotta';

  return (
    <Link
      href="/"
      aria-label={`${brand.name} — accueil`}
      className={cn('group inline-flex flex-col items-start leading-none', className)}
    >
      <span
        className={cn(
          'font-heading text-2xl font-light tracking-[0.22em] transition-opacity duration-300 group-hover:opacity-80 sm:text-[1.75rem]',
          primary,
        )}
      >
        {brand.nameParts.primary}
      </span>
      <span
        className={cn(
          'mt-1 font-body text-[0.55rem] font-medium tracking-[0.52em] sm:text-[0.6rem]',
          secondary,
        )}
      >
        {brand.nameParts.secondary}
      </span>
      {withSignature && (
        <span
          className={cn(
            'mt-3 font-body text-[0.7rem] tracking-[0.12em]',
            tone === 'light' ? 'text-sand/70' : 'text-espresso-55',
          )}
        >
          {brand.signature}
        </span>
      )}
    </Link>
  );
}
