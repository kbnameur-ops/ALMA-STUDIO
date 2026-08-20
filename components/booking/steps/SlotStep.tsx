'use client';

import { useCallback, useEffect, useState } from 'react';
import { site } from '@/config/site';
import { DatePicker } from '../DatePicker';
import { TimeSlots } from '../TimeSlots';
import { Button } from '@/components/ui/Button';
import type { DayAvailability, IsoDate, LocationKind, TimeSlot } from '@/types';

interface SlotStepProps {
  serviceDurationId: string;
  locationKind: LocationKind;
  postalCode: string | null;
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot | null) => void;
}

/** Nombre de jours chargés par requête. */
const WINDOW_DAYS = 7;

function addDays(date: IsoDate, days: number): IsoDate {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function todayKey(): IsoDate {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: site.timezone }).format(new Date());
}

/**
 * Étape 4 — les créneaux viennent exclusivement du serveur.
 * Aucun calcul de disponibilité n'est fait dans le navigateur : c'est la
 * seule façon de garantir qu'un créneau déjà réservé n'apparaît jamais.
 */
export function SlotStep({
  serviceDurationId,
  locationKind,
  postalCode,
  selected,
  onSelect,
}: SlotStepProps) {
  const [from, setFrom] = useState<IsoDate>(todayKey);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      serviceDurationId,
      from,
      days: String(WINDOW_DAYS),
      locationKind,
    });
    if (locationKind === 'home' && postalCode) params.set('postalCode', postalCode);

    try {
      const response = await fetch(`/api/availability?${params.toString()}`);
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Disponibilités indisponibles.';
        setError(message);
        setDays([]);
        return;
      }

      const result = (payload as { days: DayAvailability[] }).days;
      setDays(result);

      // Sélection automatique de la première journée qui propose un créneau.
      const firstOpen = result.find((day) => day.slots.length > 0);
      setSelectedDate((current) => {
        const stillOpen = result.find((day) => day.date === current && day.slots.length > 0);
        return stillOpen?.date ?? firstOpen?.date ?? null;
      });
    } catch {
      setError('Impossible de charger les disponibilités. Merci de réessayer.');
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [serviceDurationId, from, locationKind, postalCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentDay = days.find((day) => day.date === selectedDate);
  const isToday = from === todayKey();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setFrom(isToday ? from : addDays(from, -WINDOW_DAYS))}
          disabled={isToday}
        >
          ← Semaine précédente
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setFrom(addDays(from, WINDOW_DAYS))}
        >
          Semaine suivante →
        </Button>
      </div>

      <DatePicker
        days={days}
        selected={selectedDate}
        loading={loading}
        onSelect={(date) => {
          setSelectedDate(date);
          onSelect(null);
        }}
      />

      {error ? (
        <p role="alert" className="rounded-lg border border-terracotta/40 bg-terracotta/6 p-5 font-body text-sm text-terracotta">
          {error}
        </p>
      ) : (
        <TimeSlots
          slots={currentDay?.slots ?? []}
          selected={selected?.startsAt ?? null}
          loading={loading}
          onSelect={onSelect}
        />
      )}

      <p className="font-body text-xs text-espresso-55">
        Horaires affichés pour {site.timezone.replace('_', ' ')}. Le créneau retenu vous est réservé
        le temps de finaliser le paiement.
      </p>
    </div>
  );
}
