'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { brand } from '@/config/brand';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { durations, easeAlma } from '@/lib/motion';

/**
 * Hero d'accueil.
 *
 * La photo du studio occupe tout le cadre, au format portrait : elle tombe
 * juste sur mobile et se recadre sur sa moitié haute en paysage, où se
 * trouve la scène. Le point de recadrage est fixé à 38 % de la hauteur
 * pour garder la scène entière, tête comprise.
 *
 * La photo est assombrie et légèrement désaturée avant tout voile. Sans
 * cela elle devenait l'élément le plus lumineux du site : sur une page
 * nocturne, une photo qui éclate détruit la nuit qu'on vient d'installer,
 * et emporte avec elle la lisibilité de la navigation posée dessus. Ici
 * elle affleure, le titre domine.
 *
 * Trois voiles se superposent : un aplat général, un dégradé vertical qui
 * ancre le texte dans le bas du cadre, et un dégradé latéral qui protège
 * la colonne de gauche. Ils rendent le hero indifférent à la photo qu'on
 * y placera ensuite.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Décalage léger au défilement : de la profondeur, pas de la parallaxe.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const line = (index: number) => ({
    initial: reduceMotion ? undefined : { y: '112%' },
    animate: { y: '0%' },
    transition: { duration: durations.slow, ease: easeAlma, delay: 0.4 + index * 0.1 },
  });

  const fade = (delay: number) => ({
    initial: reduceMotion ? undefined : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.base, ease: easeAlma, delay },
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[96svh] flex-col justify-end overflow-hidden bg-ink pb-20 pt-28 sm:pb-24"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: imageY }}
        className="absolute inset-x-0 -top-6 bottom-0"
      >
        <Image
          src="/images/studio/hero.jpg"
          alt="Séance de massage au studio ALMA : la table installée devant la baie, lampe allumée, bougie et huiles à portée de main."
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-[center_38%] brightness-[0.58] saturate-[0.82] motion-safe:animate-[alma-breathe_28s_ease-in-out_infinite_alternate]"
        />
      </motion.div>

      <div aria-hidden className="absolute inset-0 bg-ink/30" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink/85 via-ink/40 to-transparent lg:w-2/3"
      />
      {/* Reste de lumière chaude en haut du cadre, très en retrait. */}
      <div aria-hidden className="alma-sun pointer-events-none absolute inset-x-0 top-0 h-[60%]" />

      <Container width="wide" className="relative">
        <motion.p
          {...fade(0.15)}
          className="font-body text-[0.62rem] uppercase tracking-[0.34em] text-champagne"
        >
          {brand.signature}
        </motion.p>

        {/* Le titre porte la page à lui seul : d'où l'échelle, et le peu
            qui l'entoure. */}
        <h1 className="mt-9 max-w-5xl font-heading text-[3.4rem] leading-[0.93] text-ivory sm:text-[5.25rem] lg:text-[6.5rem]">
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
              <em className="italic text-champagne">à Paris.</em>
            </motion.span>
          </span>
        </h1>

        <motion.div {...fade(1)} className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="max-w-md font-body text-[0.95rem] leading-relaxed text-ivory-70">
              Massage privé &amp; rituels de bien-être dans un espace intimiste, sur rendez-vous.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <LinkButton href="/reservation" size="lg">
                Réserver une séance
              </LinkButton>
              <LinkButton href="/massages" variant="outlineLight" size="lg">
                Découvrir les massages
              </LinkButton>
            </div>
          </div>

          <p className="font-body text-[0.62rem] uppercase tracking-[0.28em] text-ivory-55">
            Studio privé <span className="text-champagne">·</span> Sur rendez-vous{' '}
            <span className="text-champagne">·</span> Paris
          </p>
        </motion.div>
      </Container>

      {/* Invitation à descendre : un trait qui se remplit en boucle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 hidden h-16 w-px -translate-x-1/2 overflow-hidden bg-ivory/12 lg:block"
      >
        <span className="block h-full w-full origin-top bg-champagne motion-safe:animate-[alma-scroll-hint_2.8s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}
