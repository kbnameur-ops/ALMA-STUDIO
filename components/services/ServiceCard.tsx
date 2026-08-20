import Link from 'next/link';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Price } from '@/components/ui/Price';
import { ServiceBadge } from './ServiceBadge';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  /** `detailed` ajoute intensité, profil recommandé et bouton de réservation. */
  variant?: 'compact' | 'detailed';
  className?: string;
}

/**
 * Carte prestation.
 * Tous les tarifs et durées proviennent de `service.durations`, donc de la
 * base de données : rien n'est écrit en dur ici.
 */
export function ServiceCard({ service, variant = 'compact', className }: ServiceCardProps) {
  const prices = service.durations.map((duration) => duration.priceCents);
  const lowest = prices.length > 0 ? Math.min(...prices) : 0;
  const durations = service.durations.map((duration) => formatDuration(duration.minutes)).join(' / ');

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-ivory transition-all duration-500 ease-[var(--ease-alma)] hover:border-espresso/25 hover:shadow-soft',
        className,
      )}
    >
      <Link href={`/massages/${service.slug}`} className="block" tabIndex={-1} aria-hidden>
        <PlaceholderImage
          src={service.imageUrl}
          alt={service.imageAlt}
          token={`[PHOTO_${service.slug.toUpperCase().replace(/-/g, '_')}]`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-4/3 w-full"
          imageClassName="transition-transform duration-700 ease-[var(--ease-alma)] group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-2xl font-light leading-tight">
            <Link
              href={`/massages/${service.slug}`}
              className="transition-colors duration-300 hover:text-terracotta"
            >
              {service.name}
            </Link>
          </h3>
          {service.durations.length > 0 && (
            <Price cents={lowest} from={service.durations.length > 1} className="shrink-0 text-sm" />
          )}
        </div>

        <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-espresso-55">
          {durations}
        </p>

        <p className="mt-4 font-body text-sm leading-relaxed text-espresso-70">
          {variant === 'detailed' ? service.description : service.shortDescription}
        </p>

        {variant === 'detailed' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <ServiceBadge intensity={service.intensity} />
              {service.homeServiceAvailable && <span className="sr-only">Disponible à domicile</span>}
            </div>
            {service.recommendedFor && (
              <p className="font-body text-xs leading-relaxed text-espresso-55">
                <span className="uppercase tracking-[0.16em] text-champagne">Recommandé</span>
                <br />
                {service.recommendedFor}
              </p>
            )}
            <dl className="divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
              {service.durations.map((duration) => (
                <div key={duration.id} className="flex items-center justify-between py-2.5">
                  <dt className="font-body text-sm text-espresso-70">
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
            className="inline-flex items-center gap-2 font-body text-sm text-terracotta transition-colors duration-300 hover:text-terracotta-dark"
          >
            {variant === 'detailed' ? 'Réserver' : 'Découvrir'}
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sr-only"> — {service.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
