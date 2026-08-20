'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminSession } from '@/lib/supabase/admin-auth';
import { getAdminClient } from '@/lib/supabase/server';
import { updateBookingStatus } from '@/lib/repositories/bookings';
import type { BookingStatus } from '@/types';

/**
 * Actions serveur du back-office.
 *
 * Chacune revérifie la session administrateur : une Server Action est un
 * point d'entrée HTTP à part entière, jamais protégé par le seul fait que
 * l'interface qui l'appelle soit derrière une page protégée.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
}

async function requireAdmin(): Promise<{ ok: true } | ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, message: 'Session expirée. Reconnectez-vous.' };
  return { ok: true };
}

function fail(message: string): ActionResult {
  return { ok: false, message };
}

// ------------------------------------------------------------ prestations

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Identifiant en minuscules, chiffres et tirets uniquement'),
  name: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(2000),
  intensity: z.enum(['douce', 'moderee', 'dynamique']),
  recommendedFor: z.string().trim().max(300).default(''),
  imageUrl: z.string().trim().url().or(z.literal('')).nullable().default(null),
  imageAlt: z.string().trim().max(200).default(''),
  homeServiceAvailable: z.coerce.boolean().default(false),
  isSignature: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(100),
});

function parseForm(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }
  // Une case décochée n'est pas transmise : on rétablit explicitement `false`.
  for (const key of ['homeServiceAvailable', 'isSignature', 'isActive']) {
    raw[key] = formData.get(key) === 'on' || formData.get(key) === 'true';
  }
  return raw;
}

export async function saveService(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = serviceSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Données invalides.');
  }

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const input = parsed.data;
  const row = {
    slug: input.slug,
    name: input.name,
    short_description: input.shortDescription,
    description: input.description,
    intensity: input.intensity,
    recommended_for: input.recommendedFor,
    image_url: input.imageUrl || null,
    image_alt: input.imageAlt,
    home_service_available: input.homeServiceAvailable,
    is_signature: input.isSignature,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await db.from('services').update(row).eq('id', input.id)
    : await db.from('services').insert(row);

  if (error) return fail(`Enregistrement impossible : ${error.message}`);

  revalidatePath('/admin/prestations');
  revalidatePath('/massages');
  revalidatePath('/');
  return { ok: true, message: 'Prestation enregistrée.' };
}

export async function toggleService(id: string, isActive: boolean): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('services').update({ is_active: isActive }).eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/admin/prestations');
  revalidatePath('/massages');
  return { ok: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('services').delete().eq('id', id);
  if (error) {
    // Une prestation déjà réservée ne peut pas disparaître : l'historique
    // et la comptabilité y font référence. On propose la désactivation.
    return fail(
      'Cette prestation est rattachée à des réservations existantes. Désactivez-la plutôt que de la supprimer.',
    );
  }

  revalidatePath('/admin/prestations');
  revalidatePath('/massages');
  return { ok: true, message: 'Prestation supprimée.' };
}

// --------------------------------------------------------------- tarifs

const durationSchema = z.object({
  id: z.string().uuid().optional(),
  serviceId: z.string().uuid(),
  minutes: z.coerce.number().int().min(15).max(300),
  priceEuros: z.coerce.number().min(0).max(5000),
  sortOrder: z.coerce.number().int().min(0).max(999).default(100),
  isActive: z.coerce.boolean().default(true),
});

export async function saveDuration(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = durationSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides.');

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const input = parsed.data;
  const row = {
    service_id: input.serviceId,
    minutes: input.minutes,
    // Saisie en euros, stockage en centimes : jamais de flottant en base.
    price_cents: Math.round(input.priceEuros * 100),
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  const { error } = input.id
    ? await db.from('service_durations').update(row).eq('id', input.id)
    : await db.from('service_durations').insert(row);

  if (error) return fail(`Enregistrement impossible : ${error.message}`);

  revalidatePath('/admin/prestations');
  revalidatePath('/massages');
  return { ok: true, message: 'Tarif enregistré.' };
}

export async function deleteDuration(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('service_durations').delete().eq('id', id);
  if (error) {
    return fail('Ce tarif est utilisé par des réservations. Désactivez-le plutôt.');
  }

  revalidatePath('/admin/prestations');
  return { ok: true };
}

// -------------------------------------------------------------- planning

const businessHourSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
  isOpen: z.coerce.boolean(),
});

export async function saveBusinessHours(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  for (let weekday = 0; weekday <= 6; weekday += 1) {
    const parsed = businessHourSchema.safeParse({
      weekday,
      opensAt: formData.get(`opensAt-${weekday}`),
      closesAt: formData.get(`closesAt-${weekday}`),
      isOpen: formData.get(`isOpen-${weekday}`) === 'on',
    });
    if (!parsed.success) return fail(`Horaires invalides pour le jour ${weekday}.`);
    if (parsed.data.closesAt <= parsed.data.opensAt) {
      return fail('L’heure de fermeture doit suivre l’heure d’ouverture.');
    }

    const { error } = await db.from('business_hours').upsert(
      {
        weekday,
        opens_at: parsed.data.opensAt,
        closes_at: parsed.data.closesAt,
        is_open: parsed.data.isOpen,
      },
      { onConflict: 'weekday' },
    );
    if (error) return fail(`Enregistrement impossible : ${error.message}`);
  }

  revalidatePath('/admin/planning');
  return { ok: true, message: 'Horaires enregistrés.' };
}

const blockedSlotSchema = z
  .object({
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    reason: z.string().trim().max(200).optional().nullable(),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: 'La fin doit suivre le début.',
    path: ['endsAt'],
  });

export async function addBlockedSlot(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = blockedSlotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Période invalide.');

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('blocked_slots').insert({
    // Les champs `datetime-local` sont saisis dans le fuseau du navigateur ;
    // ils sont convertis ici en instants absolus.
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    reason: parsed.data.reason || null,
  });
  if (error) return fail(`Enregistrement impossible : ${error.message}`);

  revalidatePath('/admin/planning');
  return { ok: true, message: 'Indisponibilité ajoutée.' };
}

export async function deleteBlockedSlot(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('blocked_slots').delete().eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/admin/planning');
  return { ok: true };
}

// ---------------------------------------------------------- réservations

export async function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const done = await updateBookingStatus(bookingId, status);
  if (!done) return fail('Mise à jour impossible.');

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');
  return { ok: true, message: 'Statut mis à jour.' };
}

// ------------------------------------------------------------ promotions

const promotionSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9-]+$/, 'Lettres, chiffres et tirets uniquement'),
    kind: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().int().min(1),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
    isActive: z.coerce.boolean().default(true),
  })
  .refine((value) => value.kind !== 'percentage' || value.value <= 100, {
    message: 'Un pourcentage ne peut pas dépasser 100.',
    path: ['value'],
  });

export async function savePromotion(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const raw = Object.fromEntries(formData.entries());
  const parsed = promotionSchema.safeParse({
    ...raw,
    maxRedemptions: raw.maxRedemptions === '' ? null : raw.maxRedemptions,
    isActive: formData.get('isActive') === 'on',
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides.');

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const input = parsed.data;
  const { error } = await db.from('promotions').insert({
    code: input.code.toUpperCase(),
    kind: input.kind,
    // Montant fixe saisi en euros, stocké en centimes.
    value: input.kind === 'fixed' ? Math.round(input.value * 100) : input.value,
    starts_at: input.startsAt ? new Date(input.startsAt).toISOString() : null,
    ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    max_redemptions: input.maxRedemptions ?? null,
    times_redeemed: 0,
    service_ids: [],
    is_active: input.isActive,
  });

  if (error) {
    return fail(
      error.code === '23505' ? 'Ce code existe déjà.' : `Enregistrement impossible : ${error.message}`,
    );
  }

  revalidatePath('/admin/promotions');
  return { ok: true, message: 'Code créé.' };
}

export async function togglePromotion(id: string, isActive: boolean): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('promotions').update({ is_active: isActive }).eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/admin/promotions');
  return { ok: true };
}

// ------------------------------------------------------------------ avis

export async function setReviewPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('reviews').update({ is_published: isPublished }).eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/admin/avis');
  revalidatePath('/');
  return { ok: true };
}

const reviewSchema = z.object({
  authorName: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().trim().min(1).max(600),
  serviceLabel: z.string().trim().max(120).optional().nullable(),
  isPublished: z.coerce.boolean().default(false),
});

export async function saveReview(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = reviewSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isPublished: formData.get('isPublished') === 'on',
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides.');

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('reviews').insert({
    author_name: parsed.data.authorName,
    rating: parsed.data.rating,
    quote: parsed.data.quote,
    service_label: parsed.data.serviceLabel || null,
    is_published: parsed.data.isPublished,
    // Un avis saisi en administration est un avis réel : jamais un exemple.
    is_sample: false,
  });
  if (error) return fail(`Enregistrement impossible : ${error.message}`);

  revalidatePath('/admin/avis');
  revalidatePath('/');
  return { ok: true, message: 'Avis enregistré.' };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const db = getAdminClient();
  if (!db) return fail('Base de données indisponible.');

  const { error } = await db.from('reviews').delete().eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/admin/avis');
  revalidatePath('/');
  return { ok: true };
}
