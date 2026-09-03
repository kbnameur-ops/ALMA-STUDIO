import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { StatCard } from '@/components/admin/StatCard';
import { AdminTable, type Column } from '@/components/admin/AdminTable';
import { BookingStatusBadge } from '@/components/admin/BookingStatusBadge';
import { getDashboardData } from '@/lib/repositories/admin';
import { formatDateTime, formatDuration, formatPrice, formatTime } from '@/lib/utils/format';
import type { BookingDetails } from '@/types';

export const dynamic = 'force-dynamic';

const columns: Array<Column<BookingDetails>> = [
  { key: 'time', header: 'Heure', cell: (row) => formatTime(row.startsAt) },
  {
    key: 'customer',
    header: 'Client',
    cell: (row) => `${row.customer.firstName} ${row.customer.lastName}`,
  },
  { key: 'service', header: 'Prestation', cell: (row) => row.service.name },
  {
    key: 'duration',
    header: 'Durée',
    hideOnMobile: true,
    cell: (row) => formatDuration(row.durationMinutes),
  },
  {
    key: 'location',
    header: 'Lieu',
    hideOnMobile: true,
    cell: (row) => (row.locationKind === 'studio' ? 'Studio' : 'Domicile'),
  },
  { key: 'status', header: 'Statut', cell: (row) => <BookingStatusBadge status={row.status} /> },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    cell: (row) => formatPrice(row.totalCents),
  },
];

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-10">
      <div>
        <Heading level={1} size="md">
          Tableau de bord
        </Heading>
        <p className="mt-2 font-body text-sm text-ivory-55">
          Vue d’ensemble du studio, mise à jour à chaque chargement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Réservations aujourd’hui"
          value={data.todayBookings.length}
          detail={
            data.nextBooking
              ? `Prochain : ${formatTime(data.nextBooking.startsAt)} — ${data.nextBooking.customer.firstName}`
              : 'Aucun rendez-vous à venir aujourd’hui'
          }
        />
        <StatCard
          label="Chiffre d’affaires du mois"
          value={formatPrice(data.monthRevenueCents)}
          detail={`${data.monthBookingCount} séance${data.monthBookingCount > 1 ? 's' : ''} confirmée${data.monthBookingCount > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Taux d’occupation"
          value={`${Math.round(data.occupancyRate * 100)} %`}
          detail="Sur les 7 prochains jours"
        />
        <StatCard
          label="Cartes cadeaux actives"
          value={data.activeGiftCards}
          detail={`${formatPrice(data.activeGiftCardBalanceCents)} en circulation`}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <Heading size="sm">Aujourd’hui</Heading>
          <Link
            href="/admin/reservations"
            className="font-body text-sm text-terracotta hover:text-terracotta-dark"
          >
            Toutes les réservations
          </Link>
        </div>
        <AdminTable
          columns={columns}
          rows={data.todayBookings}
          rowKey={(row) => row.id}
          emptyLabel="Aucune réservation aujourd’hui."
          caption="Réservations du jour"
        />
      </section>

      <section>
        <Heading size="sm" className="mb-4">
          Nouvelles réservations
        </Heading>
        <AdminTable
          columns={[
            {
              key: 'created',
              header: 'Reçue le',
              cell: (row: BookingDetails) => formatDateTime(row.createdAt),
            },
            {
              key: 'customer',
              header: 'Client',
              cell: (row: BookingDetails) => `${row.customer.firstName} ${row.customer.lastName}`,
            },
            {
              key: 'service',
              header: 'Prestation',
              cell: (row: BookingDetails) => row.service.name,
            },
            {
              key: 'when',
              header: 'Séance',
              hideOnMobile: true,
              cell: (row: BookingDetails) => formatDateTime(row.startsAt),
            },
            {
              key: 'status',
              header: 'Statut',
              cell: (row: BookingDetails) => <BookingStatusBadge status={row.status} />,
            },
          ]}
          rows={data.newBookings}
          rowKey={(row) => row.id}
          emptyLabel="Aucune nouvelle réservation ces dernières 24 heures."
          caption="Réservations reçues récemment"
        />
      </section>
    </div>
  );
}
