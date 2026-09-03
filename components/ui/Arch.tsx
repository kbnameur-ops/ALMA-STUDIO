'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { archOpen, inView } from '@/lib/motion';
import { cn } from '@/lib/utils/cn';

interface ArchProps {
  children: ReactNode;
  /** `full` : coupole complète. `flat` : arche posée contre un bord. */
  shape?: 'full' | 'flat';
  /** L'arche se déploie depuis sa base à l'entrée dans le champ. */
  reveal?: boolean;
  className?: string;
  delay?: number;
}

/**
 * Cadre en arche.
 *
 * Le motif structurant du site : les visuels ne sont pas des rectangles
 * arrondis mais des ouvertures. À l'apparition, l'arche se déploie depuis
 * sa base — la lumière qui entre par une porte, plutôt qu'un bloc qui
 * surgit.
 */
export function Arch({ children, shape = 'full', reveal = true, className, delay = 0 }: ArchProps) {
  const reduceMotion = useReducedMotion();
  const shapeClass = shape === 'full' ? 'alma-arch' : 'alma-arch-flat';

  if (!reveal || reduceMotion) {
    return <div className={cn('overflow-hidden', shapeClass, className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('overflow-hidden', shapeClass, className)}
      variants={archOpen}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
