import { z } from 'zod';

/**
 * Schémas de validation partagés client/serveur.
 *
 * Le serveur revalide systématiquement : la validation côté navigateur
 * n'est qu'un confort d'usage, jamais une garantie.
 */

const trimmed = (min: number, max: number) =>
  z.string().trim().min(min, 'Champ requis').max(max, 'Champ trop long');

/** Formats FR et internationaux courants, sans être inutilement strict. */
const phonePattern = /^\+?[0-9 .\-()]{8,20}$/;

export const addressSchema = z.object({
  line1: trimmed(3, 160),
  line2: z.string().trim().max(160).optional().nullable(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Code postal à 5 chiffres'),
  city: trimmed(2, 80),
});

export const customerSchema = z.object({
  firstName: trimmed(1, 80),
  lastName: trimmed(1, 80),
  email: z.string().trim().email('Adresse email invalide').max(160),
  phone: z.string().trim().regex(phonePattern, 'Numéro de téléphone invalide'),
  // Aucune information médicale n'est collectée : ce champ reste libre.
  note: z.string().trim().max(1000).optional().nullable(),
  // Case obligatoire : `refine` plutôt que `literal(true)` pour produire un
  // message d'erreur lisible plutôt qu'une erreur de type.
  acceptsTerms: z
    .boolean()
    .refine((value) => value, 'Merci d’accepter les conditions de réservation.'),
  marketingConsent: z.boolean().default(false),
});

export const createBookingSchema = z
  .object({
    serviceId: z.string().min(1),
    serviceDurationId: z.string().min(1),
    locationKind: z.enum(['studio', 'home']),
    address: addressSchema.optional().nullable(),
    startsAt: z.string().datetime({ offset: true }),
    customer: customerSchema,
    promotionCode: z.string().trim().max(40).optional().nullable(),
    giftCardCode: z.string().trim().max(40).optional().nullable(),
  })
  .refine((value) => value.locationKind === 'studio' || value.address != null, {
    message: 'Une adresse est requise pour une prestation à domicile.',
    path: ['address'],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export const availabilityQuerySchema = z.object({
  serviceDurationId: z.string().min(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().int().min(1).max(31).default(7),
  locationKind: z.enum(['studio', 'home']).default('studio'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/)
    .optional(),
});

export const promotionCheckSchema = z.object({
  code: z.string().trim().min(1).max(40),
  serviceId: z.string().min(1),
  serviceDurationId: z.string().min(1),
});

export const cancelBookingSchema = z.object({
  reference: z.string().trim().min(4).max(40),
  token: z.string().trim().min(8).max(80),
});
