'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { brand } from '@/config/brand';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArchMark } from '@/components/brand/ArchMark';
import { durations, easeAlma } from '@/lib/motion';

/**
 * Hero d'accueil.
 *
 * Le visuel est cadré dans une arche plutôt qu'étalé en fond perdu. Ce
 * n'est pas seulement un parti pris : la photo du studio est au format
 * portrait (842 × 1264). Étirée sur toute la largeur d'un écran, elle
 * serait agrandie de moitié — donc molle — et amputée de la plus grande
 * partie de sa hauteur, c'est-à-dire de la pièce elle-même. Dans l'arche,
 * elle s'affiche à son format natif, entière et nette.
 *
 * L'arche porte aussi l'identité : on entre dans le studio par une
 * ouverture.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();

  const line = (index: number) => ({
    initial: reduceMotion ? undefined : { y: '112%' },
    animate: { y: '0%' },
    transition: { duration: durations.slow, ease: easeAlma, delay: 0.45 + index * 0.09 },
  });

  const fade = (delay: number) => ({
    initial: reduceMotion ? undefined : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.base, ease: easeAlma, delay },
  });

  return (
    <section className="relative overflow-hidden bg-shade pb-20 pt-28 sm:pb-24 lg:min-h-[94svh] lg:pt-36">
      {/* Lumière de fin de journée, derrière l'ouverture. */}
      <div
        aria-hidden
        className="alma-sun pointer-events-none absolute inset-y-0 right-0 w-full lg:w-3/5"
      />

      <Container width="wide" className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-20">
          <div>
            <motion.div {...fade(0.15)} className="flex items-center gap-4">
              <ArchMark size={30} tone="light" />
              <p className="font-body text-[0.68rem] uppercase tracking-[0.3em] text-champagne">
                {brand.signature}
              </p>
            </motion.div>

            <h1 className="mt-8 font-heading text-[3rem] font-light leading-[0.98] text-ivory sm:text-[4.25rem] lg:text-[5rem]">
              {['Une parenthèse', 'méditerranéenne'].map((text, index) => (
                <span key={text} className="block overflow-hidden pb-[0.06em]">
                  <motion.span className="block" {...line(index)}>
                    {text}
                  </motion.span>
                </span>
              ))}
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" {...line(2)}>
                  {/* L'italique isole le lieu : l'accent éditorial de la page. */}
                  <em className="font-normal italic text-champagne">à Paris.</em>
                </motion.span>
              </span>
            </h1>

            <motion.div {...fade(1)}>
              <p className="mt-7 max-w-lg font-body text-base leading-relaxed text-sand/85 sm:text-lg">
                Massage privé &amp; rituels de bien-être dans un espace intimiste, sur rendez-vous.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <LinkButton href="/reservation" size="lg">
                  Réserver une séance
                </LinkButton>
                <LinkButton href="/massages" variant="outlineLight" size="lg">
                  Découvrir les massages
                </LinkButton>
              </div>

              <p className="mt-9 font-body text-[0.68rem] uppercase tracking-[0.24em] text-sand/55">
                Studio privé <span className="text-champagne">·</span> Sur rendez-vous{' '}
                <span className="text-champagne">·</span> Paris
              </p>
            </motion.div>
          </div>

          {/* L'ouverture : le rapport de forme suit celui de la photo, pour
              qu'elle ne soit ni agrandie ni recadrée. */}
          <motion.div
            initial={reduceMotion ? undefined : { clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.5, ease: easeAlma, delay: 0.25 }}
            className="alma-arch relative order-first aspect-2/3 max-h-[46svh] w-full overflow-hidden shadow-lifted lg:order-none lg:max-h-none"
          >
            <Image
              src="/images/studio/hero.jpg"
              alt="Séance de massage au studio ALMA : la table installée devant la baie, lampe allumée, bougie et huiles à portée de main."
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 30rem"
              className="object-cover motion-safe:animate-[alma-breathe_26s_ease-in-out_infinite_alternate]"
            />
          </motion.div>
        </div>
      </Container>

      {/* Invitation à descendre : un trait qui se remplit en boucle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 hidden h-16 w-px -translate-x-1/2 overflow-hidden bg-sand/15 lg:block"
      >
        <span className="block h-full w-full origin-top bg-champagne motion-safe:animate-[alma-scroll-hint_2.8s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}
