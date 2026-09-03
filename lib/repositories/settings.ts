import 'server-only';

import { cache } from 'react';
import { defaultBookingRules, type BookingRules } from '@/lib/booking/rules';
import { getServerClient } from '@/lib/supabase/server';

/**
 * Réglages métier stockés en base (`settings`), avec repli sur les valeurs
 * par défaut du code. Permet au studio de modifier délai d'annulation,
 * battements ou horizon de réservation sans redéploiement.
 */
function readNumber(values: Map<string, unknown>, key: string, fallback: number): number {
  const raw = values.get(key);
  const parsed = typeof raw === 'string' ? Number(raw) : raw;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(values: Map<string, unknown>, key: string, fallback: boolean): boolean {
  const raw = values.get(key);
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

export const getSettingsMap = cache(async (): Promise<Map<string, unknown>> => {
  const db = await getServerClient();
  if (!db) return new Map();

  const { data, error } = await db.from('settings').select('key, value');
  if (error) {
    console.error('[settings] lecture impossible', error.message);
    return new Map();
  }
  return new Map((data ?? []).map((row) => [row.key, row.value]));
});

export const getBookingRules = cache(async (): Promise<BookingRules> => {
  const values = await getSettingsMap();
  return {
    prepMinutes: readNumber(values, 'prep_minutes', defaultBookingRules.prepMinutes),
    bufferMinutes: readNumber(values, 'buffer_minutes', defaultBookingRules.bufferMinutes),
    slotStepMinutes: readNumber(values, 'slot_step_minutes', defaultBookingRules.slotStepMinutes),
    minimumNoticeHours: readNumber(values, 'minimum_notice_hours', defaultBookingRules.minimumNoticeHours),
    bookingHorizonDays: readNumber(values, 'booking_horizon_days', defaultBookingRules.bookingHorizonDays),
    holdMinutes: readNumber(values, 'hold_minutes', defaultBookingRules.holdMinutes),
    cancellationHours: readNumber(values, 'cancellation_hours', defaultBookingRules.cancellationHours),
    reminderHours: readNumber(values, 'reminder_hours', defaultBookingRules.reminderHours),
  };
});

export const isHomeServiceEnabled = cache(async (): Promise<boolean> => {
  const values = await getSettingsMap();
  return readBoolean(values, 'home_service_enabled', true);
});

export const isSmsEnabled = cache(async (): Promise<boolean> => {
  const values = await getSettingsMap();
  return readBoolean(values, 'sms_enabled', false);
});
