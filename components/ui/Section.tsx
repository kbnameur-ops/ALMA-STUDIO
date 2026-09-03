import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from './Container';

/**
 * Trois profondeurs d'encre, et rien d'autre.
 *
 * `ink` est le fond courant, `raised` une surface légèrement soulevée qui
 * marque une rupture de section, `deep` le noir des fins de page. La
 * variation est volontairement infime : sur fond sombre, un écart de
 * clarté minuscule suffit à séparer deux plans, alors qu'un contraste
 * franc ferait des bandes.
 */
type Tone = 'ink' | 'raised' | 'deep' | 'transparent';
type Spacing = 'sm' | 'md' | 'lg';

const tones: Record<Tone, string> = {
  ink: 'bg-ink text-ivory',
  raised: 'bg-ink-raised text-ivory',
  deep: 'bg-ink-deep text-ivory',
  transparent: '',
};

const spacings: Record<Spacing, string> = {
  sm: 'py-14 sm:py-16',
  md: 'py-20 sm:py-24',
  lg: 'py-24 sm:py-32 lg:py-40',
};

interface SectionProps {
  children: ReactNode;
  tone?: Tone;
  spacing?: Spacing;
  id?: string;
  className?: string;
  containerWidth?: 'narrow' | 'default' | 'wide' | 'full';
  /** Laisse le contenu gérer sa propre largeur (sections pleine largeur). */
  bare?: boolean;
  'aria-labelledby'?: string;
}

export function Section({
  children,
  tone = 'ink',
  spacing = 'md',
  id,
  className,
  containerWidth = 'default',
  bare = false,
  ...aria
}: SectionProps) {
  return (
    <section id={id} className={cn(tones[tone], spacings[spacing], className)} {...aria}>
      {bare ? children : <Container width={containerWidth}>{children}</Container>}
    </section>
  );
}
