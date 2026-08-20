'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Décalage d'apparition, pour cascader plusieurs éléments d'une même grille. */
  delay?: number;
  /** Amplitude verticale en pixels. Volontairement faible : rien d'agressif. */
  distance?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * Apparition douce au scroll : fondu + translation courte, une seule fois.
 * Se désactive entièrement si l'utilisateur demande moins de mouvement.
 */
export function Reveal({ children, delay = 0, distance = 18, className, as = 'div' }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
