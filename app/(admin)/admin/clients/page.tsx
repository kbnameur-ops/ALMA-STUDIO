import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { AdminTable } from '@/components/admin/AdminTable';
import { listCustomers, type CustomerSummary } from '@/lib/repositories/admin';
import { formatDate, formatPrice } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1} size="md">
          Clients
        </Heading>
        <p className="mt-2 font-body text-sm text-espresso-55">
          Données personnelles : usage strictement limité à la gestion des réservations. Toute
          demande de suppression doit être honorée sans délai.
        </p>
      </div>

      <AdminTable
        columns={[
          {
            key: 'name',
            header: 'Nom',
            cell: (row: CustomerSummary) => `${row.firstName} ${row.lastName}`,
          },
          { key: 'email', header: 'Email', cell: (row: CustomerSummary) => row.email },
          {
            key: 'phone',
            header: 'Téléphone',
            hideOnMobile: true,
            cell: (row: CustomerSummary) => row.phone,
          },
          {
            key: 'count',
            header: 'Séances',
            align: 'right',
            cell: (row: CustomerSummary) => row.bookingCount,
          },
          {
            key: 'last',
            header: 'Dernier RDV',
            hideOnMobile: true,
            cell: (row: CustomerSummary) =>
              row.lastBookingAt ? formatDate(row.lastBookingAt, { year: 'numeric' }) : '—',
          },
          {
            key: 'spent',
            header: 'Total',
            align: 'right',
            hideOnMobile: true,
            cell: (row: CustomerSummary) => formatPrice(row.totalSpentCents),
          },
          {
            key: 'consent',
            header: 'Marketing',
            align: 'right',
            cell: (row: CustomerSummary) =>
              row.marketingConsent ? <Badge tone="olive">Opt-in</Badge> : <span className="text-espresso-55">—</span>,
          },
        ]}
        rows={customers}
        rowKey={(row) => row.id}
        emptyLabel="Aucun client enregistré."
        caption="Fiches clients"
      />
    </div>
  );
}
