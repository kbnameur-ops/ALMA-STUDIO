'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Arch } from '@/components/ui/Arch';
import { imageFocus } from '@/config/imageFocus';
import { Price } from '@/components/ui/Price';
import { ServiceBadge } from './ServiceBadge';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  /** `detailed` ajoute intensité, profil recommandé et grille tarifaire. */
  variant?: 'compact' | 'detailed';
  index?: number;
  className?: string;
}

/**
 * Carte prestation.
 *
 * Le visuel est une ouverture en arche, pas une vignette : la carte se lit
 * comme une niche dans un mur. Au survol, l'image respire et le nom glisse
 * vers l'accent — deux gestes, pas cinq.
 *
 * Tarifs et durées viennent de `service.durations`, donc de la base.
 */
export function ServiceCard({ service, variant = 'compact', index = 0, className }: ServiceCardProps) {
  const prices = service.durations.map((duration) => duration.priceCents);
  const lowest = prices.length > 0 ? Math.min(...prices) : 0;
  const durations = service.durations.map((duration) => formatDuration(duration.minutes)).join(' · ');

  return (
    <article className={cn('group/card flex h-full flex-col', className)}>
      <Link href={`/massages/${service.slug}`} className="block focus-visible:outline-offset-8">
        <Arch
          shape="full"
          delay={index * 0.08}
          className="relative aspect-4/5 w-full bg-ink-raised"
        >
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              style={{ objectPosition: imageFocus(service.imageUrl) }}
              className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-alma)] group-hover/card:scale-[1.06]"
            />
          ) : (
            <span
              role="img"
              aria-label={service.imageAlt}
              className="alma-placeholder absolute inset-0"
            />
          )}

        </Arch>
      </Link>

      <div className="mt-6 flex flex-1 flex-col">
        <h3 className="font-heading text-[1.75rem] font-light leading-tight">
          <Link
            href={`/massages/${service.slug}`}
            className="transition-colors duration-500 ease-[var(--ease-alma)] group-hover/card:text-terracotta"
          >
            {service.name}
          </Link>
        </h3>

        {/* Durée et tarif : une ligne de service, entre deux filets. */}
        <div className="mt-4 flex items-baseline justify-between gap-4 border-y border-[color:var(--color-line)] py-2.5">
          <span className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-ivory-55">
            {durations}
          </span>
          <Price cents={lowest} from={service.durations.length > 1} className="text-sm" />
        </div>

        <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
          {variant === 'detailed' ? service.description : service.shortDescription}
        </p>

        {variant === 'detailed' && (
          <div className="mt-6 space-y-5">
            <ServiceBadge intensity={service.intensity} />

            {service.recommendedFor && (
              <p className="font-body text-xs leading-relaxed text-ivory-55">
                <span className="uppercase tracking-[0.16em] text-champagne">Recommandé</span>
                <br />
                {service.recommendedFor}
              </p>
            )}

            <dl className="divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
              {service.durations.map((duration) => (
                <div key={duration.id} className="flex items-center justify-between py-2.5">
                  <dt className="font-body text-sm text-ivory-70">
                    {formatDuration(duration.minutes)}
                  </dt>
                  <dd>
                    <Price cents={duration.priceCents} className="text-sm" />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={
              variant === 'detailed'
                ? `/reservation?service=${service.slug}`
                : `/massages/${service.slug}`
            }
            className="group/link inline-flex items-center gap-2 font-body text-sm text-terracotta"
          >
            {variant === 'detailed' ? 'Réserver' : 'Découvrir'}
            {/* La flèche avance quand la carte entière est survolée. */}
            <span
              aria-hidden
              className="inline-block transition-transform duration-500 ease-[var(--ease-alma)] group-hover/card:translate-x-1"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sr-only"> — {service.name}</span>
          </Link>
          <span
            aria-hidden
            className="mt-2 block h-px w-0 bg-terracotta/50 transition-[width] duration-500 ease-[var(--ease-alma)] group-hover/card:w-14"
          />
        </div>
      </div>
    </article>
  );
}
