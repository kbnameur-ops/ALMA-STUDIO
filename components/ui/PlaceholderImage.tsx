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
  /** `fill` étire l'image sur toute la surface du bloc. */
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * Emplacement photo unifié. Tant que les visuels définitifs ne sont pas
 * livrés, l'emplacement affiche un dégradé sable grainé et le jeton de
 * contenu attendu — l'aspect reste soigné et l'information manquante
 * traçable.
 *
 * Le positionnement est entièrement laissé à l'appelant : le composant
 * n'impose aucune classe `relative` ou `absolute` sur sa racine, sinon
 * elle entrerait en conflit avec un `absolute inset-0` passé de
 * l'extérieur (l'ordre des règles Tailwind décidant alors du gagnant).
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
      <div className={cn('overflow-hidden', className)}>
        {/* Enveloppe positionnée : `fill` de next/image exige un ancêtre
            positionné, sans contraindre la racine du composant. */}
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            {...(fill ? { fill: true, sizes } : { width: width ?? 1200, height: height ?? 800 })}
            priority={priority}
            className={cn('h-full w-full object-cover', imageClassName)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex items-end overflow-hidden',
        tone === 'espresso' ? 'alma-placeholder-dark' : 'alma-placeholder',
        className,
      )}
    >
      {token && (
        <span
          className={cn(
            'm-4 rounded-full px-3 py-1 font-body text-[0.65rem] uppercase tracking-[0.18em]',
            tone === 'espresso' ? 'bg-ivory/12 text-sand/80' : 'bg-espresso/8 text-espresso-55',
          )}
        >
          {token}
        </span>
      )}
    </div>
  );
}
