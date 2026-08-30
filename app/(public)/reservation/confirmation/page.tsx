import type { Metadata } from 'next';
import { site } from '@/config/site';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { AddToCalendar } from '@/components/booking/AddToCalendar';
import { PendingPaymentNotice } from '@/components/booking/PendingPaymentNotice';
import { RequestSentNotice } from '@/components/booking/RequestSentNotice';
import { getBookingByReference } from '@/lib/repositories/bookings';
import { getBookingRules } from '@/lib/repositories/settings';
import { formatDate, formatDuration, formatTime } from '@/lib/utils/format';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Confirmation de réservation',
  description: 'Récapitulatif de votre réservation au studio.',
  path: '/reservation/confirmation',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; token?: string }>;
}) {
  const params = await searchParams;
  const booking =
    params.ref && params.token ? await getBookingByReference(params.ref, params.token) : null;

  if (!booking) {
    return (
      <section className="bg-ink pb-24 pt-32 sm:pt-40">
        <Container width="narrow">
          <Heading level={1} size="lg">
            Réservation introuvable
          </Heading>
          <p className="mt-5 font-body text-sm leading-relaxed text-ivory-70">
            Le lien utilisé est incomplet ou a expiré. Le récapitulatif complet figure dans l’email
            de confirmation qui vous a été envoyé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/reservation">Réserver une séance</LinkButton>
            <LinkButton href="/" variant="secondary">
              Retour à l’accueil
            </LinkButton>
          </div>
        </Container>
      </section>
    );
  }

  const rules = await getBookingRules();
  const confirmed = booking.status === 'confirmed' || booking.status === 'completed';
  const cancelled = booking.status === 'cancelled' || booking.status === 'refunded';

  const locationLabel =
    booking.locationKind === 'studio'
      ? `Au studio, ${site.businessAddress.city}`
      : booking.address
        ? `À domicile — ${booking.address.line1}, ${booking.address.postalCode} ${booking.address.city}`
        : 'À domicile';

  const rows = [
    { label: 'Prestation', value: booking.service.name },
    { label: 'Durée', value: formatDuration(booking.durationMinutes) },
    { label: 'Date', value: formatDate(booking.startsAt, { year: 'numeric' }) },
    { label: 'Heure', value: formatTime(booking.startsAt) },
    { label: 'Lieu', value: locationLabel },
  ];

  return (
    <section className="bg-ink pb-24 pt-32 sm:pt-40">
      <Container width="narrow">
        {cancelled ? (
          <Heading level={1} size="lg">
            Cette réservation a été annulée.
          </Heading>
        ) : confirmed ? (
          <>
            <span
              aria-hidden
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-terracotta/40 text-terracotta"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <Heading level={1} size="lg">
              Votre réservation est confirmée.
            </Heading>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              Un email récapitulatif vient de vous être envoyé à {booking.customer.email}.
            </p>
          </>
        ) : site.onlinePaymentEnabled ? (
          <>
            <Heading level={1} size="lg">
              Votre réservation est en cours de validation.
            </Heading>
            <div className="mt-6">
              <PendingPaymentNotice />
            </div>
          </>
        ) : (
          <>
            <Heading level={1} size="lg">
              Votre demande est bien arrivée.
            </Heading>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              Elle n’est pas encore confirmée : nous revenons vers vous très vite.
            </p>
            <div className="mt-8">
              <RequestSentNotice
                reference={booking.reference}
                serviceName={booking.service.name}
                startsAt={booking.startsAt}
                customerEmail={booking.customer.email}
              />
            </div>
          </>
        )}

        <dl className="mt-10 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <dt className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-ivory-55">
                {row.label}
              </dt>
              <dd className="text-right font-body text-sm">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-ivory-55">
              Prix
            </dt>
            <dd>
              <Price cents={booking.totalCents} className="text-base" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-ivory-55">
              Référence
            </dt>
            <dd className="font-body text-sm tracking-[0.12em]">{booking.reference}</dd>
          </div>
        </dl>

        {!cancelled && booking.locationKind === 'studio' && (
          <p className="mt-6 font-body text-xs leading-relaxed text-ivory-55">
            {site.studioLocationNote}
          </p>
        )}

        {!cancelled && (
          <div className="mt-10 flex flex-wrap gap-3">
            {/* Un rendez-vous non confirmé n'a rien à faire dans l'agenda du
                client : il y resterait après un refus du studio. */}
            {confirmed && <AddToCalendar
              title={`${site.brandName} — ${booking.service.name}`}
              startsAt={booking.startsAt}
              endsAt={booking.endsAt}
              location={locationLabel}
              description={`Réservation ${booking.reference}`}
              reference={booking.reference}
            />}
            <LinkButton
              href={`/reservation/gerer?ref=${booking.reference}&token=${booking.manageToken}`}
              variant="secondary"
            >
              Gérer ma réservation
            </LinkButton>
            <LinkButton href="/" variant="ghost">
              Retour à l’accueil
            </LinkButton>
          </div>
        )}

        {confirmed && (
          <p className="mt-10 font-body text-xs leading-relaxed text-ivory-55">
            Modification ou annulation sans frais jusqu’à {rules.cancellationHours} heures avant le
            rendez-vous. Présentez-vous quelques minutes avant l’heure : le temps de poser vos
            affaires et de commencer sans précipitation.
          </p>
        )}
      </Container>
    </section>
  );
}
