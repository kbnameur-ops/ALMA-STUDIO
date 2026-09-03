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
 * La première version posait une photo pleine page assombrie sous un
 * titre centré — la construction par défaut de tout site d'hôtel ou de
 * spa, à laquelle le passage au sombre ne changeait rien : recolorer un
 * gabarit générique ne le rend pas moins générique.
 *
 * Celle-ci part d'une asymétrie franche. Le texte occupe sa propre
 * colonne sur l'encre nue — plus grand qu'un hero n'ose habituellement
 * l'être, parce qu'il n'a plus à rivaliser avec une photo glissée
 * dessous. La photo, elle, devient un objet posé dans la page : cadrée en
 * arche, débordant du cadre de sa colonne, doublée d'un second contour
 * décalé — la construction d'une affiche encadrée, pas d'un fond d'écran.
 * Un monogramme démesuré, presque invisible, timbre l'arrière-plan : la
 * marque avant même la photo.
 *
 * N'ayant plus à porter de texte, la photo retrouve sa lumière — un
 * assombrissement léger suffit, là où la version précédente l'écrasait
 * pour préserver la lisibilité d'un titre qui n'est plus dessus.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  const line = (index: number) => ({
    initial: reduceMotion ? undefined : { y: '112%' },
    animate: { y: '0%' },
    transition: { duration: durations.slow, ease: easeAlma, delay: 0.35 + index * 0.1 },
  });

  const fade = (delay: number) => ({
    initial: reduceMotion ? undefined : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.base, ease: easeAlma, delay },
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ink pb-20 pt-36 sm:pb-24 sm:pt-40 lg:pb-0 lg:pt-44"
    >
      {/* Le monogramme, à une échelle qu'aucune icône n'atteint jamais :
          un timbre de marque plutôt qu'un pictogramme. */}
      <ArchMark
        size={1100}
        tone="mono-light"
        className="pointer-events-none absolute -left-[22%] -top-[8%] text-ivory/[0.035]"
      />

      <Container width="wide" className="relative">
        <div className="grid gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10">
          {/* ---------------------------------------------------- texte */}
          <div className="relative z-10">
            <motion.p
              {...fade(0.1)}
              className="font-body text-[0.62rem] uppercase tracking-[0.34em] text-champagne"
            >
              {brand.signature}
            </motion.p>

            <h1 className="mt-8 font-heading text-[3.4rem] leading-[0.92] text-ivory sm:text-[5rem] lg:text-[6rem] xl:text-[6.75rem]">
              {['Une parenthèse', 'andalouse'].map((text, index) => (
                <span key={text} className="block overflow-hidden pb-[0.06em]">
                  <motion.span className="block" {...line(index)}>
                    {text}
                  </motion.span>
                </span>
              ))}
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" {...line(2)}>
                  <em className="italic text-champagne">à Paris.</em>
                </motion.span>
              </span>
            </h1>

            <motion.div {...fade(0.95)}>
              <p className="mt-9 max-w-md font-body text-[0.95rem] leading-relaxed text-ivory-70">
                Massage privé &amp; rituels de bien-être dans un espace intimiste, sur rendez-vous.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <LinkButton href="/reservation" size="lg">
                  Réserver une séance
                </LinkButton>
                <LinkButton href="/massages" variant="outlineLight" size="lg">
                  Découvrir les massages
                </LinkButton>
              </div>

              <p className="mt-12 font-body text-[0.62rem] uppercase tracking-[0.28em] text-ivory-55">
                Studio privé <span className="text-champagne">·</span> Sur rendez-vous{' '}
                <span className="text-champagne">·</span> Paris
              </p>
            </motion.div>
          </div>

          {/* ---------------------------------------------------- photo */}
          <div className="relative lg:-mr-[7vw]">
            {/* `justify-self-end` casserait le calcul de largeur : un item
                de grille non étiré ne fournit plus de base aux enfants en
                pourcentage, qui s'effondrent à zéro. Le débord vers la droite
                vient de la marge négative, pas d'un désalignement de grille. */}
            {/* Second contour, décalé : la photo se lit comme encadrée
                plutôt que posée directement sur la page. */}
            <div
              aria-hidden
              className="alma-arch absolute -bottom-4 -right-4 hidden aspect-[3/4] w-[86%] border border-champagne/25 sm:block lg:w-[92%]"
            />

            <motion.div
              initial={reduceMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.5, ease: easeAlma, delay: 0.15 }}
              className="alma-arch relative aspect-[3/4] w-full overflow-hidden shadow-lifted lg:w-[92%]"
            >
              <motion.div
                style={reduceMotion ? undefined : { y: imageY }}
                className="absolute inset-x-0 -top-[6%] h-[112%]"
              >
                <Image
                  src="/images/studio/hero.jpg"
                  alt="Séance de massage au studio Alhambra : la table installée devant la baie, lampe allumée, bougie et huiles à portée de main."
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 44vw"
                  className="object-cover object-[center_38%] brightness-[0.86] saturate-[0.94] motion-safe:animate-[alma-breathe_28s_ease-in-out_infinite_alternate]"
                />
              </motion.div>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Invitation à descendre : un trait qui se remplit en boucle. */}
      <div
        aria-hidden
        className="pointer-events-none relative mx-auto mt-16 hidden h-16 w-px overflow-hidden bg-ivory/12 lg:mt-24 lg:block"
      >
        <span className="block h-full w-full origin-top bg-champagne motion-safe:animate-[alma-scroll-hint_2.8s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}
