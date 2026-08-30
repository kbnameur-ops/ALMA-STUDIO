import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { AdminTable } from '@/components/admin/AdminTable';
import { ActionForm } from '@/components/admin/ActionForm';
import { ActionButton } from '@/components/admin/ActionButton';
import { deleteReview, saveReview, setReviewPublished } from '@/lib/actions/admin';
import { listAllReviews } from '@/lib/repositories/admin';
import { formatDate } from '@/lib/utils/format';
import type { Review } from '@/types';

export const dynamic = 'force-dynamic';

const fieldClass =
  'w-full rounded-md border border-[color:var(--color-line-strong)] bg-ink px-4 py-3 font-body text-sm';
const labelClass = 'font-body text-[0.7rem] uppercase tracking-[0.16em] text-ivory-70';

export default async function AdminReviewsPage() {
  const reviews = await listAllReviews();

  return (
    <div className="space-y-12">
      <div>
        <Heading level={1} size="md">
          Avis clients
        </Heading>
        <p className="mt-2 font-body text-sm text-ivory-55">
          Seuls les avis publiés apparaissent sur le site. Les entrées marquées « exemple » sont des
          données de démonstration : dépubliez-les dès que de vrais avis sont disponibles.
        </p>
      </div>

      <AdminTable
        columns={[
          { key: 'author', header: 'Auteur', cell: (row: Review) => row.authorName },
          {
            key: 'rating',
            header: 'Note',
            cell: (row: Review) => '★'.repeat(row.rating) + '☆'.repeat(5 - row.rating),
          },
          {
            key: 'quote',
            header: 'Avis',
            cell: (row: Review) => <span className="line-clamp-2 max-w-md">{row.quote}</span>,
          },
          {
            key: 'service',
            header: 'Prestation',
            hideOnMobile: true,
            cell: (row: Review) => row.serviceLabel ?? '—',
          },
          {
            key: 'date',
            header: 'Date',
            hideOnMobile: true,
            cell: (row: Review) => formatDate(row.createdAt, { year: 'numeric' }),
          },
          {
            key: 'status',
            header: 'Statut',
            cell: (row: Review) => (
              <span className="flex flex-wrap gap-1.5">
                {row.isPublished ? (
                  <Badge tone="sage">Publié</Badge>
                ) : (
                  <Badge tone="outline">Masqué</Badge>
                )}
                {row.isSample && <Badge tone="accent">Exemple</Badge>}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            cell: (row: Review) => (
              <span className="flex flex-wrap justify-end gap-2">
                <ActionButton
                  action={async () => {
                    'use server';
                    return setReviewPublished(row.id, !row.isPublished);
                  }}
                  label={row.isPublished ? 'Dépublier' : 'Publier'}
                  successMessage="Avis mis à jour."
                />
                <ActionButton
                  action={async () => {
                    'use server';
                    return deleteReview(row.id);
                  }}
                  label="Supprimer"
                  variant="ghost"
                  confirmMessage="Supprimer cet avis ?"
                  successMessage="Avis supprimé."
                />
              </span>
            ),
          },
        ]}
        rows={reviews}
        rowKey={(row) => row.id}
        emptyLabel="Aucun avis enregistré."
        caption="Avis clients"
      />

      <section className="rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6">
        <Heading size="sm" className="mb-2">
          Ajouter un avis
        </Heading>
        <p className="mb-6 font-body text-xs text-ivory-55">
          À n’utiliser que pour retranscrire un avis réellement reçu.
        </p>

        <ActionForm action={saveReview} submitLabel="Enregistrer l’avis" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Auteur</span>
              <input name="authorName" required maxLength={80} placeholder="Claire M." className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Note</span>
              <select name="rating" defaultValue="5" className={fieldClass}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Prestation</span>
              <input name="serviceLabel" maxLength={120} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-3">
              <span className={labelClass}>Avis</span>
              <textarea name="quote" required rows={3} maxLength={600} className={fieldClass} />
            </label>
          </div>

          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              name="isPublished"
              className="h-4 w-4 accent-[color:var(--color-terracotta)]"
            />
            Publier immédiatement sur le site
          </label>
        </ActionForm>
      </section>
    </div>
  );
}
