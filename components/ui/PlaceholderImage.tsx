import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface PlaceholderImageProps {
  /** Visuel définitif. Absent → placeholder premium (jamais une image cassée). */
  src?: string | null;
  alt: string;
  /** Jeton de contenu à livrer, ex. `[PHOTO_STUDIO]`. Affiché discrètement. */
  token?: string;
  className?: string;
  imageClassName?: string;
  tone?: 'sand' | 'espresso';
  sizes?: string;
  priority?: boolean;
  /** `fill` impose un parent positionné avec une hauteur définie. */
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * Emplacement photo unifié. Tant que les visuels définitifs ne sont pas
 * livrés, l'emplacement affiche un dégradé sable et le jeton de contenu
 * attendu — l'aspect reste soigné et l'information manquante est traçable.
 */
export function PlaceholderImage({
  src,
  alt,
  token,
  className,
  imageClassName,
  tone = 'sand',
  sizes = '100vw',
  priority = false,
  fill = true,
  width,
  height,
}: PlaceholderImageProps) {
  if (src) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={src}
          alt={alt}
          {...(fill ? { fill: true, sizes } : { width: width ?? 1200, height: height ?? 800 })}
          priority={priority}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative flex items-end overflow-hidden',
        tone === 'espresso' ? 'alma-placeholder-dark' : 'alma-placeholder',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-[0.35]',
          'bg-[radial-gradient(circle_at_1px_1px,rgba(48,42,37,0.16)_1px,transparent_0)]',
          '[background-size:4px_4px]',
        )}
      />
      {token && (
        <span
          className={cn(
            'relative m-4 rounded-full px-3 py-1 font-body text-[0.65rem] uppercase tracking-[0.18em]',
            tone === 'espresso'
              ? 'bg-ivory/12 text-sand/80'
              : 'bg-espresso/8 text-espresso-55',
          )}
        >
          {token}
        </span>
      )}
    </div>
  );
}
