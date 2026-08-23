import { Heading } from '@/components/ui/Heading';
import { AdminTable, type Column } from '@/components/admin/AdminTable';
import { BookingStatusBadge, paymentStatusLabel } from '@/components/admin/BookingStatusBadge';
import { ActionButton } from '@/components/admin/ActionButton';
import { setBookingStatus } from '@/lib/actions/admin';
import { listBookings } from '@/lib/repositories/bookings';
import { formatDate, formatDuration, formatPrice, formatTime } from '@/lib/utils/format';
import type { BookingDetails } from '@/types';

export const dynamic = 'force-dynamic';

/** Fenêtre par défaut : 30 jours en arrière, 90 jours en avant. */
const PAST_DAYS = 30;
const FUTURE_DAYS = 90;

const columns: Array<Column<BookingDetails>> = [
  {
    key: 'when',
    header: 'Date',
    cell: (row) => (
      <span className="whitespace-nowrap">
        {formatDate(row.startsAt, { day: 'numeric', month: 'short', weekday: undefined })}
        <span className="ml-2 text-espresso-55">{formatTime(row.startsAt)}</span>
      </span>
    ),
  },
  {
    key: 'customer',
    header: 'Client',
    cell: (row) => (
      <span>
        {row.customer.firstName} {row.customer.lastName}
        <span className="block text-xs text-espresso-55">{row.customer.email}</span>
        <span className="block text-xs text-espresso-55">{row.customer.phone}</span>
      </span>
    ),
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
    cell: (row) =>
      row.locationKind === 'studio' ? (
        'Studio'
      ) : (
        <span>
          Domicile
          {row.address && (
            <span className="block text-xs text-espresso-55">
              {row.address.line1}, {row.address.postalCode} {row.address.city}
            </span>
          )}
        </span>
      ),
  },
  { key: 'status', header: 'Statut', cell: (row) => <BookingStatusBadge status={row.status} /> },
  {
    key: 'payment',
    header: 'Paiement',
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-xs text-espresso-55">{paymentStatusLabel(row.paymentStatus)}</span>
    ),
  },
  { key: 'total', header: 'Prix', align: 'right', cell: (row) => formatPrice(row.totalCents) },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    cell: (row) => (
      <div className="flex flex-wrap justify-end gap-2">
        {row.status === 'pending' && (
          <ActionButton
            action={async () => {
              'use server';
              return setBookingStatus(row.id, 'confirmed');
            }}
            label="Confirmer"
          />
        )}
        {row.status === 'confirmed' && (
          <>
            <ActionButton
              action={async () => {
                'use server';
                return setBookingStatus(row.id, 'completed');
              }}
              label="Terminée"
            />
            <ActionButton
              action={async () => {
                'use server';
                return setBookingStatus(row.id, 'no_show');
              }}
              label="Absent"
            />
          </>
        )}
        {(row.status === 'pending' || row.status === 'confirmed') && (
          <ActionButton
            action={async () => {
              'use server';
              return setBookingStatus(row.id, 'cancelled');
            }}
            label="Annuler"
            variant="danger"
            confirmMessage="Annuler cette réservation ? Le créneau sera libéré."
          />
        )}
      </div>
    ),
  },
];

export default async function AdminBookingsPage() {
  const now = new Date();
  const from = new Date(now.getTime() - PAST_DAYS * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + FUTURE_DAYS * 24 * 60 * 60 * 1000);
  const bookings = await listBookings(from, to);

  // Les rendez-vous à venir d'abord : c'est ce qu'on consulte au quotidien.
  const upcoming = bookings.filter((booking) => new Date(booking.startsAt) >= now);
  const past = bookings
    .filter((booking) => new Date(booking.startsAt) < now)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <div className="space-y-10">
      <div>
        <Heading level={1} size="md">
          Réservations
        </Heading>
        <p className="mt-2 font-body text-sm text-espresso-55">
          {PAST_DAYS} jours passés et {FUTURE_DAYS} jours à venir.
        </p>
      </div>

      <section>
        <Heading size="sm" className="mb-4">
          À venir ({upcoming.length})
        </Heading>
        <AdminTable
          columns={columns}
          rows={upcoming}
          rowKey={(row) => row.id}
          emptyLabel="Aucune réservation à venir."
          caption="Réservations à venir"
        />
      </section>

      <section>
        <Heading size="sm" className="mb-4">
          Passées ({past.length})
        </Heading>
        <AdminTable
          columns={columns}
          rows={past}
          rowKey={(row) => row.id}
          emptyLabel="Aucune réservation passée sur la période."
          caption="Réservations passées"
        />
      </section>
    </div>
  );
}
