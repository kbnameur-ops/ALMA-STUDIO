import type { Transition, Variants } from 'framer-motion';

/**
 * Vocabulaire de mouvement Alhambra.
 *
 * Une seule courbe pour tout le site — un départ franc puis une longue
 * décélération, la sensation d'un geste qui se pose plutôt que d'un
 * élément qui arrive. Les durées sont volontairement longues : le sujet
 * du studio est le ralentissement, l'interface doit en dire autant.
 *
 * Tout ce qui bouge ici est décoratif : rien n'est jamais rendu invisible
 * ou inopérant si le mouvement est désactivé (`prefers-reduced-motion`).
 */

/** Décélération longue, utilisée par défaut. */
export const easeAlma = [0.22, 1, 0.36, 1] as const;
/** Courbe symétrique, pour les allers-retours (survol, ouverture). */
export const easeSoft = [0.4, 0, 0.2, 1] as const;

export const durations = {
  quick: 0.35,
  base: 0.7,
  slow: 1.1,
  /** Respiration très lente : zoom d'arrière-plan, dérive lumineuse. */
  ambient: 14,
} as const;

export const transition = {
  base: { duration: durations.base, ease: easeAlma } satisfies Transition,
  slow: { duration: durations.slow, ease: easeAlma } satisfies Transition,
  quick: { duration: durations.quick, ease: easeSoft } satisfies Transition,
};

/**
 * Ligne de texte qui monte de derrière un masque.
 * Le parent doit porter `overflow-hidden` — c'est le masque.
 */
export const maskedLine: Variants = {
  hidden: { y: '110%' },
  visible: (index: number = 0) => ({
    y: '0%',
    transition: { duration: durations.slow, ease: easeAlma, delay: 0.06 * index },
  }),
};

/** Apparition discrète : fondu et translation courte. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easeAlma, delay: 0.08 * index },
  }),
};

/**
 * Ouverture d'une arche : le cadre se déploie depuis sa base, comme une
 * porte qui s'ouvre sur la lumière.
 */
export const archOpen: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.4, ease: easeAlma },
  },
};

/** Filet qui se trace de gauche à droite. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: durations.slow, ease: easeAlma } },
};

/** Zone d'entrée commune : l'animation se joue une fois, un peu avant l'entrée. */
export const inView = { once: true, margin: '-4% 0px -4% 0px' } as const;
