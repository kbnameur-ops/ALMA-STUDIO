'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { easeAlma } from '@/lib/motion';
import { cn } from '@/lib/utils/cn';
import type { Review } from '@/types';

/**
 * Avis clients — une citation à la fois.
 *
 * Trois cartes côte à côte, personne ne lit la troisième : elles se
 * concurrencent et se réduisent mutuellement à des blocs de gris. Une
 * seule citation, composée grande, se lit vraiment — et les autres
 * restent accessibles par leur signature, en dessous.
 *
 * Tant qu'aucun avis réel n'est publié, seuls des exemples de mise en page
 * s'affichent — et la section le dit, pour ne jamais faire passer une
 * donnée de démonstration pour un client.
 */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  if (reviews.length === 0) return null;
  const onlySamples = reviews.every((review) => review.isSample);
  const current = reviews[active] ?? reviews[0];
  if (!current) return null;

  return (
    <Section tone="raised" spacing="lg" containerWidth="wide" aria-labelledby="avis-titre">
      <Eyebrow>Ils sont venus</Eyebrow>
      <h2 id="avis-titre" className="sr-only">
        Avis clients
      </h2>

      <div className="mt-12 min-h-[16rem] sm:min-h-[13rem]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: easeAlma }}
          >
            <p className="max-w-4xl font-heading text-[1.9rem] leading-[1.22] text-ivory sm:text-[2.75rem] lg:text-[3.25rem]">
              <span aria-hidden className="text-champagne">«&nbsp;</span>
              {current.quote}
              <span aria-hidden className="text-champagne">&nbsp;»</span>
            </p>
            <footer className="mt-9 font-body text-[0.65rem] uppercase tracking-[0.24em] text-ivory-55">
              {current.authorName}
              {current.serviceLabel && (
                <>
                  {' '}
                  <span className="text-champagne">·</span> {current.serviceLabel}
                </>
              )}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {reviews.length > 1 && (
        <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-7">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              aria-current={index === active}
              className={cn(
                'font-body text-[0.65rem] uppercase tracking-[0.24em] transition-colors duration-500',
                index === active ? 'text-champagne' : 'text-ivory-55 hover:text-ivory-70',
              )}
            >
              {review.authorName}
            </button>
          ))}
        </div>
      )}

      {onlySamples && (
        <p className="mt-8 font-body text-xs text-ivory-55">
          Exemples de mise en page — les avis affichés ici sont des données de démonstration, en
          attente des premiers retours clients.
        </p>
      )}
    </Section>
  );
}
