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
  /**
   * À poser quand une section se labellise via `aria-labelledby` sur un
   * ancêtre plutôt que directement `aria-label` : plusieurs sections du
   * site pointaient vers un id que ce composant ne posait nulle part
   * (`aria-labelledby="signatures-titre"` sans aucun `id="signatures-titre"`
   * dans le DOM), rendant la référence muette pour les lecteurs d'écran.
   */
  id?: string;
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
  id,
}: RevealLinesProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag id={id} className={className}>
        {lines.map((line, index) => (
          <span key={index} className={cn('block', lineClassName)}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className}>
      {lines.map((line, index) => (
        /**
         * C'est le masque qui observe l'entrée dans le champ, pas la ligne.
         *
         * La ligne part à 110 % vers le bas : son cadre se trouve donc
         * sous le masque qui la rogne, et l'observateur d'intersection ne
         * la voyait jamais entrer. Résultat, la révélation ne se
         * déclenchait pas et le titre restait invisible.
         *
         * Le masque, lui, ne bouge pas. Il porte l'état, la ligne en
         * hérite : c'est la propagation de variantes de Framer Motion.
         */
        <motion.span
          key={index}
          className="block overflow-hidden pb-[0.08em]"
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <motion.span
            className={cn('block', lineClassName)}
            variants={maskedLine}
            custom={index}
            transition={{ delay }}
          >
            {line}
          </motion.span>
        </motion.span>
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
