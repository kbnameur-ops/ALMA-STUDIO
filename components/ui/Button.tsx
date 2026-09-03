import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outlineLight' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * Au survol, un voile monte depuis la base — la même grammaire que
 * l'ouverture des cadres en arche, à l'échelle de l'interface.
 */
const base =
  'group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full ' +
  'font-body font-medium tracking-wide isolate ' +
  'transition-[color,border-color,transform] duration-300 ease-[var(--ease-alma)] ' +
  'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 select-none';

const variants: Record<Variant, string> = {
  // Texte encre et non ivoire : l'ivoire sur l'or ne donnait
  // que 2,1 de contraste, l'encre en donne 7,9.
  primary: 'bg-terracotta text-ink shadow-[0_10px_30px_-18px_rgba(201,162,39,0.9)]',
  secondary: 'border border-[color:var(--color-line-strong)] text-ivory hover:border-ivory',
  ghost: 'text-ivory hover:text-terracotta underline-offset-4 hover:underline',
  light: 'bg-ink text-ivory',
  outlineLight: 'border border-ivory/30 text-ivory hover:border-ivory/60',
  danger: 'border border-terracotta text-terracotta hover:bg-terracotta hover:text-ink',
};

/** Voile de survol, monté depuis la base. Absent des variantes sans fond. */
const sweeps: Partial<Record<Variant, string>> = {
  primary: 'bg-terracotta-dark',
  secondary: 'bg-[rgba(48,42,37,0.06)]',
  light: 'bg-ink-raised',
  outlineLight: 'bg-ink/12',
  danger: 'bg-terracotta',
};

function Sweep({ variant }: { variant: Variant }) {
  const tone = sweeps[variant];
  if (!tone) return null;
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-400',
        'ease-[var(--ease-alma)] group-hover/btn:scale-y-100',
        tone,
      )}
    />
  );
}

const sizes: Record<Size, string> = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-sm px-8 py-4',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps>;
type LinkButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps | 'href'> & { href: string };

function classes({ variant = 'primary', size = 'md', fullWidth, className }: CommonProps): string {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

export function Button({ variant, size, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button className={classes({ variant, size, fullWidth, className, children })} {...props}>
      <Sweep variant={variant ?? 'primary'} />
      {children}
    </button>
  );
}

/** Même apparence que `Button`, rendu comme lien : garde la sémantique correcte. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  children,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={classes({ variant, size, fullWidth, className, children })} {...props}>
      <Sweep variant={variant ?? 'primary'} />
      {children}
    </Link>
  );
}
