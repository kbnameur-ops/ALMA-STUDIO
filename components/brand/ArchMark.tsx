import { cn } from '@/lib/utils/cn';

/**
 * Monogramme ALMA — l'arche.
 *
 * Le tracé se lit à la fois comme un « A » et comme une arche
 * méditerranéenne : le portail du studio, et la parenthèse de la baseline.
 * La barre figure l'horizon aperçu à travers l'ouverture.
 *
 * Le dessin est un contour plein, pas un trait d'épaisseur constante. Les
 * montants sont épais, le sommet mince : c'est le contraste d'une lettre
 * dessinée. Comparé côte à côte avec la version au trait uniforme, l'écart
 * est net — l'un a le poids d'un caractère gravé, l'autre celui d'un
 * pictogramme d'interface.
 *
 * Les montants s'évasent légèrement vers la base : sans cette inclinaison
 * la forme se lisait comme un U renversé, jamais comme un A.
 */

type Tone = 'dark' | 'light' | 'mono-dark' | 'mono-light';

const tones: Record<Tone, { arch: string; horizon: string }> = {
  dark: { arch: 'var(--color-ink)', horizon: 'var(--color-ink)' },
  light: { arch: 'var(--color-ivory)', horizon: 'var(--color-ivory)' },
  'mono-dark': { arch: 'currentColor', horizon: 'currentColor' },
  'mono-light': { arch: 'currentColor', horizon: 'currentColor' },
};

/**
 * Contour de l'arche, en un seul tracé.
 *
 * Extérieur : montant gauche évasé, coupole, montant droit.
 * Intérieur : la même figure resserrée, dont le sommet remonte presque au
 * niveau du sommet extérieur — d'où la finesse au faîte.
 */
const SHELL =
  'M18 132 L31 64 A29 29 0 0 1 89 64 L102 132 L84 132 L73 66 A15 15 0 0 0 47 66 L36 132 Z';

interface ArchMarkProps {
  /** Taille de rendu en pixels ; détermine aussi l'épaisseur de la barre. */
  size?: number;
  tone?: Tone;
  className?: string;
  /** Décoratif par défaut : le nom accessible est porté par le lien parent. */
  title?: string;
}

/**
 * Épaisseur optique de la barre : plus le rendu est petit, plus elle
 * s'épaissit relativement, sinon elle s'efface en favicon.
 */
function barFor(size: number): number {
  if (size <= 20) return 9;
  if (size <= 32) return 7.5;
  if (size <= 48) return 6.5;
  return 5.5;
}

export function ArchMark({ size = 44, tone = 'light', className, title }: ArchMarkProps) {
  const { arch, horizon } = tones[tone];
  const bar = barFor(size);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <path d={SHELL} fill={arch} />
      <rect x="42" y={101 - bar / 2} width="36" height={bar} fill={horizon} />
    </svg>
  );
}
