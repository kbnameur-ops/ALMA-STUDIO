import { site } from '@/config/site';

/**
 * Règles de planning appliquées au moteur de disponibilité.
 * Valeurs par défaut ici, surchargées en base par la table `settings`
 * (voir `lib/repositories/settings.ts`) : rien n'est figé dans le code.
 */
export interface BookingRules {
  /** Mise en place avant la séance (accueil, installation). */
  prepMinutes: number;
  /** Battement après la séance (rangement, aération, linge). */
  bufferMinutes: number;
  /** Granularité des créneaux proposés. */
  slotStepMinutes: number;
  /** Délai minimum entre l'instant présent et le début d'une séance. */
  minimumNoticeHours: number;
  /** Nombre de jours réservables à l'avance. */
  bookingHorizonDays: number;
  /** Durée de retenue d'un créneau pendant le paiement. */
  holdMinutes: number;
  /** Annulation/modification sans frais jusqu'à N heures avant. */
  cancellationHours: number;
  /** Envoi du rappel N heures avant la séance. */
  reminderHours: number;
}

export const defaultBookingRules: BookingRules = {
  prepMinutes: 10,
  bufferMinutes: 15,
  slotStepMinutes: 15,
  minimumNoticeHours: site.minimumNoticeHours,
  bookingHorizonDays: site.bookingHorizonDays,
  holdMinutes: site.holdMinutes,
  cancellationHours: site.cancellationHours,
  reminderHours: site.reminderHours,
};
