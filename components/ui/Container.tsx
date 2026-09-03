import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Width = 'narrow' | 'default' | 'wide' | 'full';

const widths: Record<Width, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-[88rem]',
  full: 'max-w-none',
};

interface ContainerProps {
  children: ReactNode;
  width?: Width;
  className?: string;
  as?: ElementType;
}

export function Container({ children, width = 'default', className, as }: ContainerProps) {
  const Tag = as ?? 'div';
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', widths[width], className)}>
      {children}
    </Tag>
  );
}
