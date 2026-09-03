'use client';

import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Price } from '@/components/ui/Price';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Service } from '@/types';

interface ServiceStepProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

/** Étape 1 — une seule prestation peut être sélectionnée. */
export function ServiceStep({ services, selectedId, onSelect }: ServiceStepProps) {
  return (
    <fieldset>
      <legend className="sr-only">Choisir une prestation</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const selected = service.id === selectedId;
          const lowest = service.durations.reduce(
            (min, duration) => Math.min(min, duration.priceCents),
            service.durations[0]?.priceCents ?? 0,
          );

          return (
            <label
              key={service.id}
              className={cn(
                'group relative flex cursor-pointer gap-4 rounded-lg border p-4 transition-all duration-300',
                selected
                  ? 'border-terracotta bg-terracotta/6'
                  : 'border-[color:var(--color-line)] hover:border-ivory/30',
              )}
            >
              <input
                type="radio"
                name="prestation"
                value={service.id}
                checked={selected}
                onChange={() => onSelect(service)}
                className="sr-only"
              />

              <PlaceholderImage
                src={service.imageUrl}
                alt=""
                sizes="120px"
                className="hidden h-24 w-24 shrink-0 rounded-md sm:block"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-heading text-xl font-light leading-tight">{service.name}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      selected ? 'border-terracotta bg-terracotta' : 'border-[color:var(--color-line-strong)]',
                    )}
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                  </span>
                </div>

                <p className="mt-1.5 font-body text-xs leading-relaxed text-ivory-70">
                  {service.shortDescription}
                </p>

                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs text-ivory-55">
                  <span>{service.durations.map((d) => formatDuration(d.minutes)).join(' · ')}</span>
                  <Price cents={lowest} from={service.durations.length > 1} className="text-ivory" />
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
