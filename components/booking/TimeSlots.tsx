'use client';

import { cn } from '@/lib/utils/cn';
import type { TimeSlot } from '@/types';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (slot: TimeSlot) => void;
  loading: boolean;
}

export function TimeSlots({ slots, selected, onSelect, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden>
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-11 animate-pulse rounded-md bg-[rgba(48,42,37,0.06)]"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-[color:var(--color-line)] bg-sand-50 p-5 font-body text-sm text-espresso-70">
        Aucun créneau disponible ce jour-là. Essayez une autre date : le planning est mis à jour en
        temps réel.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Choisir une heure">
      {slots.map((slot) => {
        const isSelected = slot.startsAt === selected;
        return (
          <button
            key={slot.startsAt}
            type="button"
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
            className={cn(
              'rounded-md border py-3 font-body text-sm tabular-nums transition-all duration-300',
              isSelected
                ? 'border-terracotta bg-terracotta text-ivory'
                : 'border-[color:var(--color-line)] hover:border-espresso/40',
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
