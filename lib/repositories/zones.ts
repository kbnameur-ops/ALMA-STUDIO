import 'server-only';

import { cache } from 'react';
import { seedHomeZones } from '@/config/seed';
import { getServerClient } from '@/lib/supabase/server';
import type { HomeZone } from '@/types';
import { toHomeZone } from './mappers';

/** Zones de déplacement à domicile (frais et temps de trajet). */
export const getHomeZones = cache(async (): Promise<HomeZone[]> => {
  const db = await getServerClient();
  if (!db) return seedHomeZones.filter((zone) => zone.isActive);

  const { data, error } = await db.from('locations').select('*').eq('is_active', true);
  if (error) {
    console.error('[zones] lecture impossible', error.message);
    return seedHomeZones.filter((zone) => zone.isActive);
  }
  return (data ?? []).map(toHomeZone);
});

/** Zone couvrant un code postal, ou `null` si l'adresse est hors périmètre. */
export async function findZoneByPostalCode(postalCode: string): Promise<HomeZone | null> {
  const normalized = postalCode.replace(/\s/g, '');
  const zones = await getHomeZones();
  return zones.find((zone) => zone.postalCodes.includes(normalized)) ?? null;
}
