import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { ExperienceSection } from '@/components/marketing/ExperienceSection';
import { SignaturesSection } from '@/components/marketing/SignaturesSection';
import { NeedsSection } from '@/components/marketing/NeedsSection';
import { StudioSection } from '@/components/marketing/StudioSection';
import { PractitionerSection } from '@/components/marketing/PractitionerSection';
import { Reviews } from '@/components/marketing/Reviews';
import { GiftCardSection } from '@/components/marketing/GiftCardSection';
import { getSignatureServices } from '@/lib/repositories/services';
import { getPublishedReviews } from '@/lib/repositories/reviews';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'ALMA STUDIO — Massage & rituels méditerranéens à Paris',
  description:
    'Studio privé de massage à Paris : séances sur rendez-vous, dans un espace intimiste et méditerranéen. Réservation en ligne, du massage relaxant au rituel de 120 minutes.',
  path: '/',
});

// Le catalogue et les avis changent rarement : régénération horaire.
export const revalidate = 3600;

export default async function HomePage() {
  const [signatures, reviews] = await Promise.all([
    getSignatureServices(),
    getPublishedReviews(3),
  ]);

  return (
    <>
      <Hero />
      <ExperienceSection />
      <SignaturesSection services={signatures} />
      <NeedsSection />
      <StudioSection />
      <PractitionerSection />
      <Reviews reviews={reviews} />
      <GiftCardSection />
    </>
  );
}
