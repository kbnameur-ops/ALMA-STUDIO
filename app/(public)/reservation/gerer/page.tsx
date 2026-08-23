import type { Metadata } from 'next';
import { site } from '@/config/site';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { ManageBooking } from '@/components/booking/ManageBooking';
import { getBookingByReference } from '@/lib/repositories/bookings';
import { getBookingRules } from '@/lib/repositories/settings';
import { canCancelFreeOfCharge } from '@/lib/booking/pricing';
import { formatDateTime, formatDuration } from '@/lib/utils/format';
import { pageMetadata } from '@/lib/seo';
import type { BookingStatus } from '@/types';

export const metadata: Metadata = pageMetadata({
  title: 'Gérer ma réservation',
  description: 'Consultez, modifiez ou annulez votre réservation.',
  path: '/reservation/gerer',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

const statusLabels: Record<BookingStatus, string> = {
  pending: 'En attente de paiement',
  confirmed: 'Confirmée',
  completed: 'Séance passée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
  no_show: 'Non honorée',
};

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; token?: string }>;
}) {
  const params = await searchParams;
  const booking =
    params.ref && params.token ? await getBookingByReference(params.ref, params.token) : null;

  if (!booking) {
    return (
      <section className="bg-ivory pb-24 pt-32 sm:pt-40">
        <Container width="narrow">
          <Heading level={1} size="lg">
            Réservation introuvable
          </Heading>
          <p className="mt-5 font-body text-sm leading-relaxed text-espresso-70">
            Ce lien est incomplet ou a expiré. Utilisez celui figurant dans votre email de
            confirmation, ou appelez-nous au{' '}
            <a
              href={`tel:${site.contactPhoneE164}`}
              className="underline decoration-champagne underline-offset-4"
            >
              {site.contactPhone}
            </a>
            .
          </p>
          <LinkButton href="/reservation" className="mt-8">
            Réserver une séance
          </LinkButton>
        </Container>
      </section>
    );
  }

  const rules = await getBookingRules();
  const active = booking.status === 'pending' || booking.status === 'confirmed';
  const canCancel = active && canCancelFreeOfCharge(booking.startsAt, rules.cancellationHours);

  return (
    <section className="bg-ivory pb-24 pt-32 sm:pt-40">
      <Container width="narrow">
        <div className="flex flex-wrap items-center gap-4">
          <Heading level={1} size="lg">
            Votre réservation
          </Heading>
          <Badge tone={booking.status === 'confirmed' ? 'olive' : 'outline'}>
            {statusLabels[booking.status]}
          </Badge>
        </div>

        <dl className="mt-10 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          {[
            { label: 'Prestation', value: booking.service.name },
            { label: 'Durée', value: formatDuration(booking.durationMinutes) },
            { label: 'Date', value: formatDateTime(booking.startsAt) },
            {
              label: 'Lieu',
              value:
                booking.locationKind === 'studio'
                  ? `Au studio · ${site.businessAddress.city}`
                  : booking.address
                    ? `${booking.address.line1}, ${booking.address.postalCode} ${booking.address.city}`
                    : 'À domicile',
            },
            { label: 'Référence', value: booking.reference },
          ].map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <dt className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-espresso-55">
                {row.label}
              </dt>
              <dd className="text-right font-body text-sm">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-espresso-55">
              Total
            </dt>
            <dd>
              <Price cents={booking.totalCents} className="text-base" />
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          {active ? (
            <ManageBooking
              reference={booking.reference}
              token={booking.manageToken}
              canCancel={canCancel}
              cancellationHours={rules.cancellationHours}
            />
          ) : (
            <LinkButton href="/reservation">Réserver une nouvelle séance</LinkButton>
          )}
        </div>
      </Container>
    </section>
  );
}
