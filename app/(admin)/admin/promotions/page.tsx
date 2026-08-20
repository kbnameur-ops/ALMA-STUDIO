import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { AdminTable } from '@/components/admin/AdminTable';
import { ActionForm } from '@/components/admin/ActionForm';
import { ActionButton } from '@/components/admin/ActionButton';
import { savePromotion, togglePromotion } from '@/lib/actions/admin';
import { listPromotions } from '@/lib/repositories/admin';
import { formatDate, formatPrice } from '@/lib/utils/format';
import type { Promotion } from '@/types';

export const dynamic = 'force-dynamic';

const fieldClass =
  'w-full rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-4 py-3 font-body text-sm';
const labelClass = 'font-body text-[0.7rem] uppercase tracking-[0.16em] text-espresso-70';

function discountLabel(promotion: Promotion): string {
  return promotion.kind === 'percentage'
    ? `${promotion.value} %`
    : formatPrice(promotion.value);
}

export default async function AdminPromotionsPage() {
  const promotions = await listPromotions();

  return (
    <div className="space-y-12">
      <div>
        <Heading level={1} size="md">
          Codes promotionnels
        </Heading>
        <p className="mt-2 font-body text-sm text-espresso-55">
          Les remises s’appliquent au montant de la prestation, jamais aux frais de déplacement.
        </p>
      </div>

      <AdminTable
        columns={[
          {
            key: 'code',
            header: 'Code',
            cell: (row: Promotion) => <span className="tracking-[0.1em]">{row.code}</span>,
          },
          { key: 'value', header: 'Remise', cell: discountLabel },
          {
            key: 'window',
            header: 'Période',
            hideOnMobile: true,
            cell: (row: Promotion) =>
              row.startsAt || row.endsAt
                ? `${row.startsAt ? formatDate(row.startsAt, { year: 'numeric' }) : '—'} → ${row.endsAt ? formatDate(row.endsAt, { year: 'numeric' }) : '—'}`
                : 'Sans limite',
          },
          {
            key: 'uses',
            header: 'Utilisations',
            align: 'right',
            cell: (row: Promotion) =>
              `${row.timesRedeemed}${row.maxRedemptions ? ` / ${row.maxRedemptions}` : ''}`,
          },
          {
            key: 'status',
            header: 'Statut',
            cell: (row: Promotion) =>
              row.isActive ? <Badge tone="olive">Actif</Badge> : <Badge tone="outline">Inactif</Badge>,
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            cell: (row: Promotion) => (
              <ActionButton
                action={async () => {
                  'use server';
                  return togglePromotion(row.id, !row.isActive);
                }}
                label={row.isActive ? 'Désactiver' : 'Activer'}
                successMessage="Code mis à jour."
              />
            ),
          },
        ]}
        rows={promotions}
        rowKey={(row) => row.id}
        emptyLabel="Aucun code promotionnel."
        caption="Codes promotionnels"
      />

      <section className="rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6">
        <Heading size="sm" className="mb-6">
          Nouveau code
        </Heading>

        <ActionForm action={savePromotion} submitLabel="Créer le code" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Code</span>
              <input
                name="code"
                required
                pattern="[A-Za-z0-9-]+"
                maxLength={40}
                placeholder="BIENVENUE"
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Type de remise</span>
              <select name="kind" defaultValue="percentage" className={fieldClass}>
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Valeur</span>
              <input name="value" type="number" min={1} required className={fieldClass} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Utilisations maximum</span>
              <input
                name="maxRedemptions"
                type="number"
                min={1}
                placeholder="Illimité"
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Début</span>
              <input name="startsAt" type="date" className={fieldClass} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Fin</span>
              <input name="endsAt" type="date" className={fieldClass} />
            </label>
          </div>

          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="h-4 w-4 accent-[color:var(--color-terracotta)]"
            />
            Actif immédiatement
          </label>
        </ActionForm>
      </section>
    </div>
  );
}
