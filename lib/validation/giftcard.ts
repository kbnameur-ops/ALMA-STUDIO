import { z } from 'zod';

/** Montants proposés à l'achat d'une carte cadeau, en centimes. */
export const GIFT_CARD_MIN_CENTS = 5000;
export const GIFT_CARD_MAX_CENTS = 50000;

export const giftCardPurchaseSchema = z
  .object({
    /** Carte adossée à une prestation, ou montant libre. */
    kind: z.enum(['service', 'amount']),
    serviceDurationId: z.string().min(1).optional().nullable(),
    amountCents: z
      .number()
      .int()
      .min(GIFT_CARD_MIN_CENTS, 'Montant minimum : 50 €')
      .max(GIFT_CARD_MAX_CENTS, 'Montant maximum : 500 €')
      .optional()
      .nullable(),
    purchaserName: z.string().trim().min(1).max(120),
    purchaserEmail: z.string().trim().email().max(160),
    recipientName: z.string().trim().min(1).max(120),
    recipientEmail: z.string().trim().email().max(160).optional().nullable(),
    message: z.string().trim().max(600).optional().nullable(),
    acceptsTerms: z
      .boolean()
      .refine((value) => value, 'Merci d’accepter les conditions de vente.'),
  })
  .refine(
    (value) =>
      value.kind === 'service' ? Boolean(value.serviceDurationId) : Boolean(value.amountCents),
    { message: 'Choisissez une prestation ou un montant.', path: ['amountCents'] },
  );

export type GiftCardPurchaseInput = z.infer<typeof giftCardPurchaseSchema>;
