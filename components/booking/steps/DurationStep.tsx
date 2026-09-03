'use client';

import { Price } from '@/components/ui/Price';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Service, ServiceDuration } from '@/types';

interface DurationStepProps {
  service: Service;
  selectedId: string | null;
  onSelect: (duration: ServiceDuration) => void;
}

/**
 * Étape 2 — durées et tarifs proviennent de la base, via la prestation
 * chargée côté serveur. Aucun prix n'est écrit dans ce composant.
 */
export function DurationStep({ service, selectedId, onSelect }: DurationStepProps) {
  return (
    <fieldset>
      <legend className="sr-only">Choisir une durée pour {service.name}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {service.durations.map((duration) => {
          const selected = duration.id === selectedId;
          return (
            <label
              key={duration.id}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-300',
                selected
                  ? 'border-terracotta bg-terracotta/6'
                  : 'border-[color:var(--color-line)] hover:border-ivory/30',
              )}
            >
              <input
                type="radio"
                name="duree"
                value={duration.id}
                checked={selected}
                onChange={() => onSelect(duration)}
                className="sr-only"
              />
              <span className="font-heading text-2xl font-light">
                {formatDuration(duration.minutes)}
              </span>
              <Price cents={duration.priceCents} className="text-base" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
