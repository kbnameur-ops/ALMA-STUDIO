import { TZDate } from '@date-fns/tz';
import { site } from '@/config/site';
import type { Cents, IsoDateTime } from '@/types';

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: site.currency,
  maximumFractionDigits: 2,
});

/** Formate un montant en centimes. Les prix ronds sont affichés sans décimales. */
export function formatPrice(cents: Cents): string {
  const value = cents / 100;
  if (Number.isInteger(value)) {
    return `${value.toLocaleString('fr-FR')} ${site.currencysymbol}`;
  }
  return priceFormatter.format(value);
}

/** « 90 min » — les durées longues restent lisibles en minutes (usage métier). */
export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

/** « samedi 12 avril » — toujours rendu dans le fuseau du studio. */
export function formatDate(iso: IsoDateTime, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: site.timezone,
    ...options,
  }).format(new Date(iso));
}

/** « samedi 12 avril 2026 à 14:30 ». */
export function formatDateTime(iso: IsoDateTime): string {
  const date = formatDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${date} à ${formatTime(iso)}`;
}

/** « 14:30 » dans le fuseau du studio, quel que soit le fuseau du visiteur. */
export function formatTime(iso: IsoDateTime): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: site.timezone,
  }).format(new Date(iso));
}

/** Date `YYYY-MM-DD` telle que vue depuis le studio. */
export function toStudioDateKey(iso: IsoDateTime): string {
  const zoned = new TZDate(new Date(iso), site.timezone);
  const month = `${zoned.getMonth() + 1}`.padStart(2, '0');
  const day = `${zoned.getDate()}`.padStart(2, '0');
  return `${zoned.getFullYear()}-${month}-${day}`;
}

/** Capitalise la première lettre — utile après un formatage Intl en français. */
export function capitalize(value: string): string {
  return value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);
}
