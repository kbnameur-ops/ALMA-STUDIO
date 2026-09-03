'use client';

import { site } from '@/config/site';
import { cn } from '@/lib/utils/cn';
import { capitalize } from '@/lib/utils/format';
import type { DayAvailability, IsoDate } from '@/types';

interface DatePickerProps {
  days: DayAvailability[];
  selected: IsoDate | null;
  onSelect: (date: IsoDate) => void;
  loading: boolean;
}

/** Rendu d'une date `YYYY-MM-DD` dans le fuseau du studio. */
function labelFor(date: IsoDate, options: Intl.DateTimeFormatOptions): string {
  // Midi UTC : évite tout basculement de jour lors du formatage.
  const value = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: site.timezone }).format(value);
}

/**
 * Bandeau de dates défilant horizontalement.
 * Une date sans créneau reste visible mais non sélectionnable : le visiteur
 * comprend que le studio est fermé ou complet, plutôt que de voir un trou.
 */
export function DatePicker({ days, selected, onSelect, loading }: DatePickerProps) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      role="group"
      aria-label="Choisir une date"
    >
      {days.map((day) => {
        const isSelected = day.date === selected;
        const disabled = !loading && day.slots.length === 0;

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={cn(
              'flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-lg border px-3 py-3 font-body transition-all duration-300',
              isSelected
                ? 'border-terracotta bg-terracotta text-ivory'
                : 'border-[color:var(--color-line)] hover:border-ivory/30',
              disabled && 'cursor-not-allowed opacity-40 hover:border-[color:var(--color-line)]',
            )}
          >
            <span className="text-[0.65rem] uppercase tracking-[0.14em]">
              {capitalize(labelFor(day.date, { weekday: 'short' })).replace('.', '')}
            </span>
            <span className="font-heading text-xl font-light">
              {labelFor(day.date, { day: 'numeric' })}
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.1em] opacity-70">
              {labelFor(day.date, { month: 'short' }).replace('.', '')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
