'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { RevealLines } from '@/components/ui/Reveal';
import { Price } from '@/components/ui/Price';
import { imageFocus } from '@/config/imageFocus';
import { easeAlma } from '@/lib/motion';
import { formatDuration } from '@/lib/utils/format';
import type { Service } from '@/types';

/**
 * Les signatures, en index éditorial.
 *
 * Trois cartes alignées, c'était la quatrième grille de trois colonnes de
 * la page : le visiteur descendait sans jamais changer de rythme. Un index
 * de lignes pleine largeur impose au contraire une lecture verticale et
 * laisse la typographie prendre l'échelle qu'une carte lui refusait.
 *
 * La photo n'est plus dans la ligne : elle apparaît dans un panneau fixe,
 * à droite, au survol de la ligne correspondante. C'est le geste d'un
 * catalogue de maison, pas d'une grille de produits — et l'écran se
 * concentre sur une prestation à la fois au lieu de trois vignettes.
 *
 * En dessous de `lg`, ce panneau n'existe pas : chaque ligne porte alors
 * sa propre image. Survoler n'a aucun sens sur un écran tactile.
 */
export function SignaturesSection({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  if (services.length === 0) return null;

  const preview = services[active] ?? services[0];

  return (
    <Section tone="ink" spacing="lg" containerWidth="wide" aria-labelledby="signatures-titre">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Le studio</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.75rem] leading-[1] sm:text-[4rem]"
            lines={['Nos signatures']}
          />
        </div>
        <LinkButton href="/massages" variant="secondary" className="self-start sm:self-auto">
          Voir tous les massages
        </LinkButton>
      </div>

      <div className="mt-20 grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-20">
        <ol>
          {services.map((service, index) => {
            const from = service.durations[0];
            return (
              <li key={service.id}>
                <Link
                  href={`/massages/${service.slug}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group/row block border-t border-line py-9 transition-colors duration-500 ease-[var(--ease-alma)] last:border-b hover:border-champagne-dim focus-visible:border-champagne-dim"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="font-body text-[0.62rem] tracking-[0.26em] text-champagne">
                      0{index + 1}
                    </span>
                    <h3 className="flex-1 font-heading text-[2rem] leading-[1.05] text-ivory transition-transform duration-700 ease-[var(--ease-alma)] group-hover/row:translate-x-2 sm:text-[2.6rem]">
                      {service.name}
                    </h3>
                    {from && (
                      <span className="shrink-0 text-right">
                        <span className="block font-body text-[0.62rem] uppercase tracking-[0.2em] text-ivory-55">
                          dès
                        </span>
                        <Price cents={from.priceCents} className="font-heading text-xl text-ivory" />
                      </span>
                    )}
                  </div>

                  {/* L'image accompagne la ligne tant qu'il n'y a pas de
                      panneau latéral pour la porter. */}
                  {service.imageUrl && (
                    <div className="relative mt-6 aspect-16/10 w-full overflow-hidden lg:hidden">
                      <Image
                        src={service.imageUrl}
                        alt={service.imageAlt}
                        fill
                        sizes="100vw"
                        style={{ objectPosition: imageFocus(service.imageUrl) }}
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                    <p className="max-w-md flex-1 font-body text-sm leading-relaxed text-ivory-70">
                      {service.shortDescription}
                    </p>
                    <span className="font-body text-[0.62rem] uppercase tracking-[0.2em] text-ivory-55">
                      {service.durations.map((d) => formatDuration(d.minutes)).join(' · ')}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* Panneau d'aperçu : une seule photo, grande, qui change de sujet. */}
        <div className="sticky top-32 hidden lg:block">
          <div className="relative aspect-3/4 w-full overflow-hidden bg-ink-raised">
            <AnimatePresence mode="wait">
              {preview?.imageUrl && (
                <motion.div
                  key={preview.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.7, ease: easeAlma }}
                  className="absolute inset-0"
                >
                  <Image
                    src={preview.imageUrl}
                    alt={preview.imageAlt}
                    fill
                    sizes="40vw"
                    style={{ objectPosition: imageFocus(preview.imageUrl) }}
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          </div>
        </div>
      </div>
    </Section>
  );
}
