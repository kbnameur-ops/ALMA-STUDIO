import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Eyebrow, Heading } from '@/components/ui/Heading';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { getServices } from '@/lib/repositories/services';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/config/site';

export const metadata: Metadata = pageMetadata({
  title: 'Réserver une séance',
  description:
    'Réservez votre massage au studio ou à domicile à Paris : choix de la prestation, de la durée et du créneau, paiement sécurisé et confirmation immédiate.',
  path: '/reservation',
});

/** Le tunnel dépend des disponibilités : jamais de rendu statique. */
export const dynamic = 'force-dynamic';

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; duree?: string }>;
}) {
  const [services, params] = await Promise.all([getServices(), searchParams]);
  const minutes = params.duree ? Number.parseInt(params.duree, 10) : undefined;

  return (
    <section className="bg-ivory pb-24 pt-28 sm:pt-36">
      <Container width="wide">
        <div className="max-w-2xl">
          <Eyebrow>Réservation</Eyebrow>
          <Heading level={1} size="lg" className="mt-4">
            Réserver une séance
          </Heading>
          <p className="mt-4 font-body text-sm leading-relaxed text-espresso-70">
            Quelques étapes, deux minutes. Annulation et modification sans frais jusqu’à{' '}
            {site.cancellationHours} heures avant le rendez-vous.
          </p>
        </div>

        <div className="mt-14">
          <BookingWizard
            services={services}
            preselectedSlug={params.service}
            preselectedMinutes={Number.isFinite(minutes) ? minutes : undefined}
            bookingEnabled={site.bookingEnabled}
          />
        </div>
      </Container>
    </section>
  );
}
