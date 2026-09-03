import 'server-only';

import { cache } from 'react';
import { seedServices } from '@/config/seed';
import { getServerClient } from '@/lib/supabase/server';
import type { Service } from '@/types';
import { toService } from './mappers';

/**
 * Catalogue des prestations.
 *
 * Source de vérité : la base. Sans Supabase configuré, on sert le jeu de
 * lancement de `config/seed.ts` afin que le site reste navigable — la
 * forme des données est strictement la même dans les deux cas.
 */
export const getServices = cache(async (): Promise<Service[]> => {
  const db = await getServerClient();
  if (!db) return seedServices.filter((service) => service.isActive);

  const { data, error } = await db
    .from('services')
    .select('*, service_durations(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services] lecture impossible', error.message);
    return seedServices.filter((service) => service.isActive);
  }

  return (data ?? []).map((row) => {
    const { service_durations: durations, ...service } = row;
    return toService(service, durations ?? []);
  });
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
});

export const getServiceById = cache(async (id: string): Promise<Service | null> => {
  const services = await getServices();
  return services.find((service) => service.id === id) ?? null;
});

/** Les trois prestations mises en avant sur la page d'accueil. */
export const getSignatureServices = cache(async (): Promise<Service[]> => {
  const services = await getServices();
  return services.filter((service) => service.isSignature).slice(0, 3);
});

/** Tarif le plus bas d'une prestation, pour l'affichage « à partir de ». */
export function lowestPrice(service: Service): number {
  return service.durations.reduce(
    (min, duration) => Math.min(min, duration.priceCents),
    service.durations[0]?.priceCents ?? 0,
  );
}
