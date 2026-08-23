'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { brand } from '@/config/brand';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArchMark } from '@/components/brand/ArchMark';
import { durations, easeAlma } from '@/lib/motion';

/**
 * Hero d'accueil.
 *
 * Trois idées, dans l'ordre de lecture :
 *  — l'arche, découpée dans le visuel : on regarde le studio par une
 *    ouverture, comme on entre dans un patio ;
 *  — la lumière, un halo chaud qui dérive très lentement au-dessus de
 *    l'arche, à la vitesse d'un soleil de fin de journée ;
 *  — le titre, révélé ligne à ligne de derrière un cache.
 *
 * Le visuel se décale légèrement au défilement — assez pour donner de la
 * profondeur, jamais assez pour qu'on parle de parallaxe.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const veilOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const line = (index: number) => ({
    initial: reduceMotion ? undefined : { y: '112%' },
    animate: { y: '0%' },
    transition: { duration: durations.slow, ease: easeAlma, delay: 0.5 + index * 0.09 },
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[94svh] flex-col justify-end overflow-hidden bg-shade pb-16 pt-28 sm:pb-20"
    >
      {/* Visuel plein cadre, découpé en arche sur sa partie haute. */}
      <motion.div
        style={reduceMotion ? undefined : { y: imageY }}
        className="absolute inset-x-0 -top-8 bottom-0"
      >
        <div className="alma-arch-flat relative mx-auto h-full w-[132%] overflow-hidden sm:w-[112%] lg:w-full lg:rounded-none">
          <Image
            src="/images/studio/hero.jpg"
            alt="Séance de massage au studio ALMA : la table installée devant la baie, lampe allumée, bougie et huiles à portée de main."
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover object-[center_38%] motion-safe:animate-[alma-breathe_26s_ease-in-out_infinite_alternate]"
          />
        </div>
      </motion.div>

      {/* Voile : lisibilité du texte par-dessus le visuel. */}
      <motion.div
        aria-hidden
        style={reduceMotion ? undefined : { opacity: veilOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-shade via-shade/70 to-shade/25"
      />
      {/* Voile latéral : garantit la lisibilité de la colonne de texte,
          indépendamment de la photo placée en hero. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-shade/80 via-shade/35 to-transparent lg:w-3/5"
      />
      {/* Lumière chaude, très lente, au-dessus de l'ouverture. */}
      <div aria-hidden className="alma-sun pointer-events-none absolute inset-x-0 top-0 h-[70%]" />

      <Container width="wide" className="relative">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, ease: easeAlma, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <ArchMark size={30} tone="light" />
          <p className="font-body text-[0.68rem] uppercase tracking-[0.3em] text-champagne">
            {brand.signature}
          </p>
        </motion.div>

        <h1 className="mt-8 max-w-4xl font-heading text-[3rem] font-light leading-[0.98] text-ivory sm:text-[4.5rem] lg:text-[5.75rem]">
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

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, ease: easeAlma, delay: 1.05 }}
        >
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
