import { cn } from '@/lib/utils/cn';

/**
 * Monogramme ALMA — l'arche.
 *
 * Le tracé se lit à la fois comme un « A » (dont la barre est décalée vers
 * le bas) et comme une arche méditerranéenne : le portail du studio, et la
 * parenthèse de la baseline. La barre horizontale figure l'horizon aperçu
 * à travers l'ouverture.
 *
 * L'épaisseur du trait est proportionnelle à la taille de rendu : un tracé
 * fin disparaît en favicon, un tracé épais alourdit le grand format.
 */

type Tone = 'dark' | 'light' | 'mono-dark' | 'mono-light';

const tones: Record<Tone, { arch: string; horizon: string }> = {
  dark: { arch: 'var(--color-espresso)', horizon: 'var(--color-terracotta)' },
  light: { arch: 'var(--color-ivory)', horizon: 'var(--color-champagne)' },
  'mono-dark': { arch: 'currentColor', horizon: 'currentColor' },
  'mono-light': { arch: 'currentColor', horizon: 'currentColor' },
};

interface ArchMarkProps {
  /** Taille de rendu en pixels ; détermine aussi l'épaisseur du trait. */
  size?: number;
  tone?: Tone;
  className?: string;
  /** Décoratif par défaut : le nom accessible est porté par le lien parent. */
  title?: string;
}

/** Épaisseur optique : plus le rendu est petit, plus le trait s'épaissit. */
function strokeFor(size: number): number {
  if (size <= 20) return 9;
  if (size <= 32) return 7.5;
  if (size <= 48) return 6;
  return 5;
}

export function ArchMark({ size = 44, tone = 'dark', className, title }: ArchMarkProps) {
  const { arch, horizon } = tones[tone];
  const stroke = strokeFor(size);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <path
        d="M32 106V54a28 28 0 0 1 56 0v52"
        stroke={arch}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path d="M46 82h28" stroke={horizon} strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}
