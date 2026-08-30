import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'accent' | 'sage' | 'outline';

const tones: Record<Tone, string> = {
  neutral: 'bg-[rgba(48,42,37,0.06)] text-ivory',
  accent: 'bg-terracotta/12 text-terracotta',
  sage: 'bg-sage/12 text-sage',
  outline: 'border border-[color:var(--color-line-strong)] text-ivory-70',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-body text-[0.7rem] uppercase tracking-[0.16em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
