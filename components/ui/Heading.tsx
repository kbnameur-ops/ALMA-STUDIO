import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Level = 1 | 2 | 3 | 4;
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'display';

const sizes: Record<Size, string> = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-[2.5rem] leading-[1.08] sm:text-5xl',
  xl: 'text-[2.75rem] leading-[1.05] sm:text-6xl',
  display: 'text-[3rem] leading-[1.02] sm:text-7xl lg:text-[5.25rem]',
};

interface HeadingProps {
  children: ReactNode;
  level?: Level;
  size?: Size;
  className?: string;
  id?: string;
}

/**
 * Le niveau sémantique (`level`) et la taille visuelle (`size`) sont
 * volontairement dissociés : la hiérarchie du document reste correcte
 * même quand le design demande un titre plus petit ou plus grand.
 */
export function Heading({ children, level = 2, size = 'md', className, id }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={cn('font-heading font-light text-balance', sizes[size], className)}>
      {children}
    </Tag>
  );
}

/** Sur-titre discret, en capitales espacées, au-dessus d'un `Heading`. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-body text-[0.7rem] uppercase tracking-[0.28em] text-champagne',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Paragraphe de corps de section, contraste et mesure calibrés. */
export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('max-w-2xl text-pretty text-[1.0625rem] leading-relaxed', className)}>
      {children}
    </p>
  );
}
