'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, inView, maskedLine } from '@/lib/motion';
import { cn } from '@/lib/utils/cn';

interface RevealProps {
  children: ReactNode;
  /** Décalage d'apparition, pour cascader une grille. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * Apparition discrète : fondu et translation courte, une seule fois.
 * Se neutralise entièrement si l'utilisateur demande moins de mouvement.
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

interface RevealLinesProps {
  /** Une entrée par ligne : le retour à la ligne est une décision de mise en page. */
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'p';
}

/**
 * Titre dont chaque ligne monte de derrière un masque, en cascade.
 *
 * Le procédé vient de la mise en page imprimée : le texte semble révélé
 * par un cache que l'on retire, et non « animé ». Chaque ligne est un
 * élément masquant son propre contenu.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  as = 'h2',
}: RevealLinesProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, index) => (
          <span key={index} className={cn('block', lineClassName)}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn('block', lineClassName)}
            variants={maskedLine}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            transition={{ delay }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Filet qui se trace, pour ouvrir une section. */
export function RevealRule({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span aria-hidden className={cn('block h-px w-10 bg-champagne', className)} />;
  }

  return (
    <motion.span
      aria-hidden
      className={cn('block h-px w-10 origin-left bg-champagne', className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={inView}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
