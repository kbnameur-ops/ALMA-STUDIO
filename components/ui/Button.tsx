import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide ' +
  'transition-all duration-300 ease-[var(--ease-alma)] rounded-full ' +
  'disabled:cursor-not-allowed disabled:opacity-45 select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-terracotta text-ivory hover:bg-terracotta-dark shadow-[0_10px_30px_-18px_rgba(185,111,85,0.9)] ' +
    'hover:shadow-[0_16px_36px_-18px_rgba(185,111,85,0.95)] active:translate-y-px',
  secondary:
    'border border-[color:var(--color-line-strong)] text-espresso hover:border-espresso ' +
    'hover:bg-[rgba(48,42,37,0.04)] active:translate-y-px',
  ghost: 'text-espresso hover:text-terracotta underline-offset-4 hover:underline',
  light:
    'bg-ivory/95 text-espresso hover:bg-ivory backdrop-blur-sm ' +
    'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)] active:translate-y-px',
  danger: 'border border-terracotta text-terracotta hover:bg-terracotta hover:text-ivory',
};

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
      {children}
    </Link>
  );
}
