import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { AdminTable } from '@/components/admin/AdminTable';
import { listGiftCards } from '@/lib/repositories/admin';
import { formatDate, formatPrice } from '@/lib/utils/format';
import type { GiftCard, GiftCardStatus } from '@/types';

export const dynamic = 'force-dynamic';

const statusTones: Record<GiftCardStatus, { label: string; tone: 'olive' | 'neutral' | 'outline' | 'accent' }> = {
  active: { label: 'Active', tone: 'olive' },
  redeemed: { label: 'Utilisée', tone: 'neutral' },
  expired: { label: 'Expirée', tone: 'outline' },
  cancelled: { label: 'Annulée', tone: 'accent' },
};

export default async function AdminGiftCardsPage() {
  const cards = await listGiftCards();
  const activeBalance = cards
    .filter((card) => card.status === 'active')
    .reduce((sum, card) => sum + card.balanceCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1} size="md">
          Cartes cadeaux
        </Heading>
        <p className="mt-2 font-body text-sm text-espresso-55">
          {formatPrice(activeBalance)} en circulation. Les cartes sont émises automatiquement après
          confirmation du paiement.
        </p>
      </div>

      <AdminTable
        columns={[
          {
            key: 'code',
            header: 'Code',
            cell: (row: GiftCard) => <span className="tracking-[0.08em]">{row.code}</span>,
          },
          {
            key: 'amount',
            header: 'Valeur',
            cell: (row: GiftCard) => row.serviceLabel ?? formatPrice(row.initialAmountCents),
          },
          {
            key: 'balance',
            header: 'Solde',
            align: 'right',
            cell: (row: GiftCard) => formatPrice(row.balanceCents),
          },
          {
            key: 'recipient',
            header: 'Bénéficiaire',
            hideOnMobile: true,
            cell: (row: GiftCard) => (
              <span>
                {row.recipientName}
                {row.recipientEmail && (
                  <span className="block text-xs text-espresso-55">{row.recipientEmail}</span>
                )}
              </span>
            ),
          },
          {
            key: 'purchaser',
            header: 'Acheteur',
            hideOnMobile: true,
            cell: (row: GiftCard) => (
              <span>
                {row.purchaserName}
                <span className="block text-xs text-espresso-55">{row.purchaserEmail}</span>
              </span>
            ),
          },
          {
            key: 'issued',
            header: 'Émise le',
            hideOnMobile: true,
            cell: (row: GiftCard) => formatDate(row.issuedAt, { year: 'numeric' }),
          },
          {
            key: 'expires',
            header: 'Expire le',
            cell: (row: GiftCard) => formatDate(row.expiresAt, { year: 'numeric' }),
          },
          {
            key: 'status',
            header: 'Statut',
            align: 'right',
            cell: (row: GiftCard) => {
              const entry = statusTones[row.status];
              return <Badge tone={entry.tone}>{entry.label}</Badge>;
            },
          },
        ]}
        rows={cards}
        rowKey={(row) => row.id}
        emptyLabel="Aucune carte cadeau émise."
        caption="Cartes cadeaux émises"
      />
    </div>
  );
}
