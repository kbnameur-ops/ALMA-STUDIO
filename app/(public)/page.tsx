import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { ManifestoSection } from '@/components/marketing/ManifestoSection';
import { OriginsSection } from '@/components/marketing/OriginsSection';
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
  title: 'ALMA STUDIO — Massage & Rituels d’Andalousie à Paris',
  description:
    'Studio privé de massage à Paris, dans l’esprit du hammam et de l’héritage arabo-andalou : séances sur rendez-vous dans un espace intimiste. Réservation en ligne.',
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
      {/* Ordre voulu : après le hero, une plaque de texte seul, puis le
          moment qui pose l'héritage du studio — le rituel ancestral et le
          geste du praticien — avant que l'index des signatures n'en donne
          les prestations concrètes. */}
      <ManifestoSection />
      <OriginsSection />
      <SignaturesSection services={signatures} />
      <ExperienceSection />
      <NeedsSection />
      <StudioSection />
      <PractitionerSection />
      <Reviews reviews={reviews} />
      <GiftCardSection />
    </>
  );
}
