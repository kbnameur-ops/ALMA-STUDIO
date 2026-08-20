import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from './Container';

type Tone = 'ivory' | 'sand' | 'espresso' | 'transparent';
type Spacing = 'sm' | 'md' | 'lg';

const tones: Record<Tone, string> = {
  ivory: 'bg-ivory text-espresso',
  sand: 'bg-sand text-espresso',
  espresso: 'bg-espresso text-sand',
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
  tone = 'ivory',
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
