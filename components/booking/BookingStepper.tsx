'use client';

import { BOOKING_STEPS, type StepId } from './state';
import { cn } from '@/lib/utils/cn';

interface BookingStepperProps {
  current: StepId;
  /** Dernière étape atteignable : on ne saute pas une étape incomplète. */
  maxReachable: StepId;
  onSelect: (step: StepId) => void;
}

/** Fil de progression du tunnel, cliquable vers les étapes déjà validées. */
export function BookingStepper({ current, maxReachable, onSelect }: BookingStepperProps) {
  return (
    <nav aria-label="Étapes de la réservation">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {BOOKING_STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          const reachable = step.id <= maxReachable;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => reachable && onSelect(step.id)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-xs transition-colors duration-300',
                  active && 'bg-espresso text-ivory',
                  !active && done && 'text-espresso hover:bg-[rgba(48,42,37,0.06)]',
                  !active && !done && 'text-espresso-55',
                  !reachable && 'cursor-not-allowed opacity-50',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem]',
                    active ? 'border-ivory/40' : done ? 'border-terracotta text-terracotta' : 'border-current',
                  )}
                >
                  {done ? '✓' : step.id}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sr-only sm:hidden">{step.label}</span>
              </button>
              {index < BOOKING_STEPS.length - 1 && (
                <span aria-hidden className="hidden h-px w-4 bg-[color:var(--color-line-strong)] sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
